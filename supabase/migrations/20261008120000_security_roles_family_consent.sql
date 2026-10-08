-- Security wave 1: role escalation, family linking with invite codes, parental consent.

-- 1. handle_new_user: the client can only ask for 'player' or 'parent'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested text := NEW.raw_user_meta_data->>'role';
  safe_role public.app_role := 'player';
BEGIN
  IF requested = 'parent' THEN
    safe_role := 'parent';
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, safe_role);

  INSERT INTO public.player_stats (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- 2. Email lookup no longer exposed to clients (account enumeration).
REVOKE ALL ON FUNCTION public.find_profile_by_email(text) FROM PUBLIC, anon, authenticated;

-- 3. Family links: parents can no longer insert/update links directly.
ALTER TABLE public.family_links
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS consent_revoked_at timestamptz;

DROP POLICY IF EXISTS "Parents can manage own family links" ON public.family_links;

CREATE TABLE IF NOT EXISTS public.family_link_codes (
  code text PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.family_link_codes ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: access only through the SECURITY DEFINER functions below.

-- Child (or an admin / club_admin) generates a one-time code to hand to the parent.
CREATE OR REPLACE FUNCTION public.create_family_link_code(_child_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(_child_id, auth.uid());
  new_code text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF target <> auth.uid()
     AND NOT (
       public.has_role(auth.uid(), 'admin')
       OR (
         public.has_role(auth.uid(), 'club_admin')
         AND public.get_user_club_ids(auth.uid()) && public.get_user_club_ids(target)
       )
     ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO public.family_link_codes (code, child_id, created_by) VALUES (new_code, target, auth.uid());
  RETURN new_code;
END;
$$;

-- Parent redeems the code: creates the link (consent still pending).
CREATE OR REPLACE FUNCTION public.redeem_family_link_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.family_link_codes%ROWTYPE;
  link_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO c FROM public.family_link_codes
   WHERE code = upper(trim(_code)) AND used_at IS NULL AND expires_at > now()
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_code';
  END IF;
  IF NOT public.has_role(auth.uid(), 'parent') THEN
    RAISE EXCEPTION 'only_parents_can_redeem';
  END IF;
  IF c.child_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot link to self';
  END IF;

  INSERT INTO public.family_links (parent_id, child_id, relationship, consent_given)
  VALUES (auth.uid(), c.child_id, 'parent', false)
  ON CONFLICT (parent_id, child_id) DO UPDATE SET parent_id = EXCLUDED.parent_id
  RETURNING id INTO link_id;

  UPDATE public.family_link_codes SET used_at = now() WHERE code = c.code;
  RETURN link_id;
END;
$$;

-- Parent records consent (persisted with version and the text they accepted).
CREATE OR REPLACE FUNCTION public.give_family_consent(_link_id uuid, _version text, _text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.family_links
     SET consent_given = true,
         consent_date = now(),
         consent_version = _version,
         consent_text = _text,
         consent_revoked_at = NULL
   WHERE id = _link_id AND parent_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'link not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_family_consent(_link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.family_links
     SET consent_given = false, consent_revoked_at = now()
   WHERE id = _link_id AND parent_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'link not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.create_family_link_code(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.redeem_family_link_code(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.give_family_consent(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_family_consent(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_family_link_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_family_link_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.give_family_consent(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_family_consent(uuid) TO authenticated;

-- 4. Parents only see children's data once consent is given.
CREATE OR REPLACE FUNCTION public.consented_child_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT child_id FROM public.family_links
   WHERE parent_id = auth.uid() AND consent_given = true;
$$;
GRANT EXECUTE ON FUNCTION public.consented_child_ids() TO authenticated;

DROP POLICY IF EXISTS "Parents can view children profiles" ON public.profiles;
CREATE POLICY "Parents can view children profiles" ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'parent') AND id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children clearances" ON public.medical_clearances;
CREATE POLICY "Parents can view children clearances" ON public.medical_clearances FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children logs" ON public.daily_logs;
CREATE POLICY "Parents can view children logs" ON public.daily_logs FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children stats" ON public.player_stats;
CREATE POLICY "Parents can view children stats" ON public.player_stats FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children badges" ON public.player_badges;
CREATE POLICY "Parents can view children badges" ON public.player_badges FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children diagnostic history" ON public.diagnostic_history;
CREATE POLICY "Parents can view children diagnostic history" ON public.diagnostic_history FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children diagnostic sessions" ON public.diagnostic_sessions;
CREATE POLICY "Parents can view children diagnostic sessions" ON public.diagnostic_sessions FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children enrollments" ON public.enrollments;
CREATE POLICY "Parents can view children enrollments" ON public.enrollments FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children events" ON public.calendar_events;
CREATE POLICY "Parents can view children events" ON public.calendar_events FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children plans" ON public.training_plans;
CREATE POLICY "Parents can view children plans" ON public.training_plans FOR SELECT
  USING (user_id IN (SELECT public.consented_child_ids()));

DROP POLICY IF EXISTS "Parents can view children plan sessions" ON public.training_plan_sessions;
CREATE POLICY "Parents can view children plan sessions" ON public.training_plan_sessions FOR SELECT
  USING (plan_id IN (
    SELECT id FROM public.training_plans WHERE user_id IN (SELECT public.consented_child_ids())
  ));

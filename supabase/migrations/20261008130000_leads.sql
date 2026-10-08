-- Leads comerciales captados desde la demo y la landing.
-- Inserción anónima (con límites de tamaño); lectura solo para administradores de la plataforma.
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  club text NOT NULL CHECK (char_length(club) BETWEEN 2 AND 160),
  sport text CHECK (char_length(sport) <= 80),
  members_count integer CHECK (members_count BETWEEN 0 AND 100000),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 5 AND 160),
  source text NOT NULL DEFAULT 'demo' CHECK (char_length(source) <= 40),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only platform admins can read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

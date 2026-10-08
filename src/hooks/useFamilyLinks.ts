import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const CONSENT_VERSION = '2026-10-v1';
export const CONSENT_TEXT =
  'Autorizo el tratamiento de los datos personales y de salud de mi hijo/a por parte del club y de NETIA, ' +
  'con fines deportivos y de seguimiento, conforme a la Ley 25.326 y a la Política de Privacidad.';

export interface FamilyLink {
  id: string;
  childId: string;
  childName: string;
  childEmail: string;
  relationship: string;
  consentGiven: boolean;
  consentDate?: Date;
}

export const useFamilyLinks = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('family_links')
      .select('*, profiles!family_links_child_id_fkey(full_name, email)')
      .eq('parent_id', user.id);

    if (!error && data) {
      setLinks(data.map((row: any) => ({
        id: row.id,
        childId: row.child_id,
        childName: row.profiles?.full_name || 'Hijo/a vinculado',
        childEmail: row.profiles?.email || '',
        relationship: row.relationship || 'parent',
        consentGiven: row.consent_given,
        consentDate: row.consent_date ? new Date(row.consent_date) : undefined,
      })));
    }
    setIsLoading(false);
  }, [user]);

  const linkChild = async (code: string) => {
    if (!user) return false;

    const { error } = await supabase.rpc('redeem_family_link_code', { _code: code.trim() });

    if (error) {
      toast.error(
        error.message.includes('invalid_or_expired_code')
          ? 'El código no es válido o venció'
          : 'No pudimos vincular. Intentá de nuevo'
      );
      return false;
    }

    toast.success('¡Vinculado! Falta tu consentimiento para ver los datos');
    fetchLinks();
    return true;
  };

  const giveConsent = async (linkId: string) => {
    const { error } = await supabase.rpc('give_family_consent', {
      _link_id: linkId,
      _version: CONSENT_VERSION,
      _text: CONSENT_TEXT,
    });

    if (!error) {
      toast.success('Consentimiento otorgado');
      fetchLinks();
    } else {
      toast.error('No pudimos guardar el consentimiento');
    }
  };

  const revokeConsent = async (linkId: string) => {
    const { error } = await supabase.rpc('revoke_family_consent', { _link_id: linkId });
    if (!error) {
      toast.success('Consentimiento retirado');
      fetchLinks();
    }
  };

  return { links, isLoading, fetchLinks, linkChild, giveConsent, revokeConsent };
};

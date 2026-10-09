/**
 * Canales de contacto comercial. A completar con los datos del equipo comercial: mientras estén
 * vacíos, el formulario de leads solo intenta guardar en Supabase y cae a mailto si hay email.
 */
export const CONTACT = {
  /** Número en formato internacional sin "+", ej. "5491112345678" */
  whatsapp: '',
  email: '',
  /** URL de agenda (Cal.com) para reuniones */
  bookingUrl: '',
};

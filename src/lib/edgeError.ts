import { FunctionsHttpError } from '@supabase/supabase-js';

export type EdgeErrorCode =
  | 'unauthorized' | 'forbidden' | 'bad_request' | 'config' | 'upstream'
  | 'timeout' | 'rate_limited' | 'gone' | 'busy' | 'internal' | 'network';

export interface EdgeError {
  code: EdgeErrorCode;
  message: string;
  status?: number;
}

const KNOWN: EdgeErrorCode[] = [
  'unauthorized', 'forbidden', 'bad_request', 'config', 'upstream',
  'timeout', 'rate_limited', 'gone', 'busy', 'internal',
];

const fromStatus = (status: number): EdgeErrorCode =>
  status === 401 ? 'unauthorized'
    : status === 403 ? 'forbidden'
    : status === 409 ? 'busy'
    : status === 429 ? 'rate_limited'
    : status === 504 ? 'timeout'
    : status >= 500 ? 'internal'
    : 'bad_request';

/** Lee `{ error, code }` del cuerpo de una respuesta no-2xx de una Edge Function. */
export async function readEdgeError(error: unknown): Promise<EdgeError> {
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response;
    let body: { error?: string; code?: string } | null = null;
    try { body = await res.clone().json(); } catch { /* sin cuerpo JSON */ }
    const code = KNOWN.includes(body?.code as EdgeErrorCode) ? (body!.code as EdgeErrorCode) : fromStatus(res.status);
    return { code, message: body?.error ?? error.message, status: res.status };
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { code: 'timeout', message: 'Request aborted' };
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { code: 'network', message };
}

export const CHAT_ERROR_TEXT: Record<'session' | 'rate' | 'retry', string> = {
  session: 'Tu sesión venció. Volvé a iniciar sesión.',
  rate: 'Mandaste muchos mensajes seguidos. Probá en un rato.',
  retry: 'No pudo responder. Tocá el mensaje para reintentar.',
};

/** Texto en voseo para el usuario según el tipo de error. */
export function chatErrorKind(code: EdgeErrorCode): 'session' | 'rate' | 'retry' {
  if (code === 'unauthorized') return 'session';
  if (code === 'rate_limited') return 'rate';
  return 'retry';
}

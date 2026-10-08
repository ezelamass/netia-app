import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { demoMockClient } from './demo-mock-client';
import { isDemoActive } from '@/demo/session';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const realClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

/** Cliente real, sin pasar por el proxy de la demo (solo para el formulario de leads). */
export const realSupabase = realClient as unknown as SupabaseClient<Database>;

// Modo demo: la sesión vive en src/demo/session.ts (store externo, síncrono).
// Mientras está activa, los hooks viejos que todavía llaman a supabase.from()
// leen/escriben contra el mock en memoria: cero requests a Supabase.
export const isDemoModeActive = () => isDemoActive();

// Proxy that routes table queries / rpc / functions / channels through the mock
// when demo mode is on. `auth` and other surface always go to the real client
// so login, sessions and onAuthStateChange continue to behave normally.
const ROUTED_PROPS = new Set(['from', 'rpc', 'functions', 'channel', 'removeChannel']);

export const supabase = new Proxy(realClient, {
  get(target, prop, receiver) {
    if (isDemoActive() && typeof prop === 'string' && ROUTED_PROPS.has(prop)) {
      return (demoMockClient as any)[prop];
    }
    return Reflect.get(target, prop, receiver);
  },
}) as SupabaseClient<Database>;

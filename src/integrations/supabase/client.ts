import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
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

// El mock de la demo (dataset + cliente en memoria) se carga recién cuando hace falta,
// así no engorda la primera carga de quienes no usan la demo.
type MockModule = typeof import('./demo-mock-client');
let demoMock: MockModule['demoMockClient'] | null = null;
let demoMockPromise: Promise<MockModule> | null = null;

export const ensureDemoMock = (): Promise<MockModule> => {
  demoMockPromise ??= import('./demo-mock-client').then((m) => {
    demoMock = m.demoMockClient;
    return m;
  });
  return demoMockPromise;
};

type Call = [string | symbol, unknown[]];

/** Encadena llamadas (from().select().eq()…) y las ejecuta contra el mock cuando termina de cargar. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deferredChain = (calls: Call[]): any =>
  new Proxy(function () { /* objetivo del proxy */ }, {
    get(_t, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
          ensureDemoMock()
            .then((m) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let cur: any = m.demoMockClient;
              for (const [k, args] of calls) cur = typeof cur?.[k] === 'function' ? cur[k](...args) : cur?.[k];
              return cur;
            })
            .then(resolve, reject);
      }
      return (...args: unknown[]) => deferredChain([...calls, [prop, args]]);
    },
  });

// Proxy that routes table queries / rpc / functions / channels through the mock
// when demo mode is on. `auth` and other surface always go to the real client
// so login, sessions and onAuthStateChange continue to behave normally.
const ROUTED_PROPS = new Set(['from', 'rpc', 'functions', 'channel', 'removeChannel']);

export const supabase = new Proxy(realClient, {
  get(target, prop, receiver) {
    if (isDemoActive() && typeof prop === 'string' && ROUTED_PROPS.has(prop)) {
      if (demoMock) return (demoMock as any)[prop];
      if (prop === 'functions') return deferredChain([[prop, []]]);
      return (...args: unknown[]) => deferredChain([[prop, args]]);
    }
    return Reflect.get(target, prop, receiver);
  },
}) as SupabaseClient<Database>;

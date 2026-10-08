/**
 * In-memory mock of the Supabase client for demo mode. Implements only the
 * surface our app actually uses (PostgREST query builder, RPC, edge functions).
 *
 * The mock dataset lives in sessionStorage so writes feel real within a tab
 * (logs you record show up in the dashboard, lessons you complete update the
 * progress bar) but are wiped on tab close. Reads merge initial mock data with
 * any session-local writes.
 *
 * Hooks that already check `useDemoGuard.blockIfDemo()` are bypassed — that
 * guard is now disabled because the mock client makes writes safe.
 */

import { FunctionsHttpError } from '@supabase/supabase-js';
import { buildInitialMockData, mockAvatarReplyParts, newId, type MockDataset } from '@/data/demo-mock-data';

const STORAGE_KEY = 'netia_demo_dataset';

// ─── Schema relations for nested selects ─────────────────────────────
type Relation = { table: string; localKey: string; foreignKey: string };
const RELATIONS: Record<string, Record<string, Relation>> = {
  course_modules: {
    course_sections: { table: 'course_sections', localKey: 'id', foreignKey: 'module_id' },
  },
  course_sections: {
    course_lessons: { table: 'course_lessons', localKey: 'id', foreignKey: 'section_id' },
  },
  enrollments: {
    clubs: { table: 'clubs', localKey: 'club_id', foreignKey: 'id' },
  },
};

// ─── Dataset state ────────────────────────────────────────────────────
let cache: MockDataset | null = null;

const loadDataset = (): MockDataset => {
  if (cache) return cache;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache!;
    }
  } catch { /* ignore */ }
  cache = buildInitialMockData();
  saveDataset();
  return cache;
};

const saveDataset = () => {
  if (!cache) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
};

export const resetMockDataset = () => {
  cache = null;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

const getTable = (name: string): any[] => {
  const ds = loadDataset();
  if (!ds[name]) ds[name] = [];
  return ds[name];
};

// ─── Filter / sort helpers ────────────────────────────────────────────
type Filter = { op: string; col: string; val: any };

const matches = (row: any, f: Filter): boolean => {
  const v = row?.[f.col];
  switch (f.op) {
    case 'eq': return v === f.val;
    case 'neq': return v !== f.val;
    case 'gt': return v > f.val;
    case 'gte': return v >= f.val;
    case 'lt': return v < f.val;
    case 'lte': return v <= f.val;
    case 'in': return Array.isArray(f.val) && f.val.includes(v);
    case 'is': return f.val === null ? v == null : v === f.val;
    case 'not.is': return f.val === null ? v != null : v !== f.val;
    default: return true;
  }
};

const applyFilters = (rows: any[], filters: Filter[]) => rows.filter(r => filters.every(f => matches(r, f)));

const sortRows = (rows: any[], col: string, ascending: boolean) =>
  [...rows].sort((a, b) => {
    const av = a?.[col];
    const bv = b?.[col];
    if (av == null && bv == null) return 0;
    if (av == null) return ascending ? -1 : 1;
    if (bv == null) return ascending ? 1 : -1;
    if (av < bv) return ascending ? -1 : 1;
    if (av > bv) return ascending ? 1 : -1;
    return 0;
  });

// ─── Nested select parser ─────────────────────────────────────────────
// Parses strings like "*, course_sections(id, course_lessons(id))" into a tree.
type SelectNode = { fields: string[]; nested: Record<string, SelectNode> };

const parseSelect = (selectStr: string): SelectNode => {
  const node: SelectNode = { fields: [], nested: {} };
  let i = 0;
  let buf = '';
  const flush = () => {
    const t = buf.trim();
    if (t) node.fields.push(t);
    buf = '';
  };
  while (i < selectStr.length) {
    const ch = selectStr[i];
    if (ch === ',') { flush(); i++; continue; }
    if (ch === '(') {
      const tableName = buf.trim();
      buf = '';
      // find matching close paren
      let depth = 1;
      let inner = '';
      i++;
      while (i < selectStr.length && depth > 0) {
        const c = selectStr[i];
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth === 0) break; }
        inner += c;
        i++;
      }
      i++; // skip ')'
      node.nested[tableName] = parseSelect(inner);
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return node;
};

const projectRow = (row: any, fields: string[]): any => {
  if (fields.length === 0 || (fields.length === 1 && fields[0] === '*')) {
    return { ...row };
  }
  const out: any = {};
  // Always include "*" if present, then layer specific fields
  if (fields.includes('*')) Object.assign(out, row);
  for (const f of fields) {
    if (f === '*') continue;
    out[f] = row?.[f];
  }
  return out;
};

const hydrateRow = (tableName: string, row: any, node: SelectNode): any => {
  const out = projectRow(row, node.fields);
  for (const [nestedName, childNode] of Object.entries(node.nested)) {
    const rel = RELATIONS[tableName]?.[nestedName];
    if (!rel) {
      // Unknown relation: best effort — assume foreign key = `${parentTable}_id`
      const guessForeignKey = `${tableName.replace(/s$/, '')}_id`;
      const childRows = getTable(nestedName).filter(r => r[guessForeignKey] === row.id);
      out[nestedName] = childRows.map(r => hydrateRow(nestedName, r, childNode));
      continue;
    }
    if (rel.foreignKey === 'id') {
      // Belongs-to: child is a single row referenced by row[localKey]
      const childRow = getTable(rel.table).find(r => r.id === row[rel.localKey]);
      out[nestedName] = childRow ? hydrateRow(rel.table, childRow, childNode) : null;
    } else {
      // Has-many: child rows where child[foreignKey] === row[localKey]
      const childRows = getTable(rel.table).filter(r => r[rel.foreignKey] === row[rel.localKey]);
      out[nestedName] = childRows.map(r => hydrateRow(rel.table, r, childNode));
    }
  }
  return out;
};

// ─── Query builder ────────────────────────────────────────────────────
type Operation = 'select' | 'insert' | 'update' | 'upsert' | 'delete';

class MockQuery implements PromiseLike<any> {
  private filters: Filter[] = [];
  private orderBy: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private mode: 'multi' | 'single' | 'maybeSingle' = 'multi';
  private isCount = false;
  private isHead = false;
  private operation: Operation = 'select';
  private columns = '*';
  private payload: any = null;
  private upsertOnConflict: string[] | null = null;

  constructor(private tableName: string) {}

  // Builders -----------------------------------------------------
  select(columns: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    // Don't override operation if it was insert/update/upsert (chained .select() after write)
    if (this.operation === 'select') {
      this.columns = columns;
    } else {
      this.columns = columns;
    }
    if (options?.count) this.isCount = true;
    if (options?.head) this.isHead = true;
    return this;
  }

  insert(payload: any) {
    this.operation = 'insert';
    this.payload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  update(payload: any) {
    this.operation = 'update';
    this.payload = payload;
    return this;
  }

  upsert(payload: any, options?: { onConflict?: string }) {
    this.operation = 'upsert';
    this.payload = Array.isArray(payload) ? payload : [payload];
    if (options?.onConflict) {
      this.upsertOnConflict = options.onConflict.split(',').map(s => s.trim());
    }
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  // Filters ------------------------------------------------------
  eq(col: string, val: any) { this.filters.push({ op: 'eq', col, val }); return this; }
  neq(col: string, val: any) { this.filters.push({ op: 'neq', col, val }); return this; }
  gt(col: string, val: any) { this.filters.push({ op: 'gt', col, val }); return this; }
  gte(col: string, val: any) { this.filters.push({ op: 'gte', col, val }); return this; }
  lt(col: string, val: any) { this.filters.push({ op: 'lt', col, val }); return this; }
  lte(col: string, val: any) { this.filters.push({ op: 'lte', col, val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ op: 'in', col, val: vals }); return this; }
  is(col: string, val: any) { this.filters.push({ op: 'is', col, val }); return this; }
  not(col: string, op: string, val: any) { this.filters.push({ op: `not.${op}`, col, val }); return this; }
  // PostgREST also exposes filter-like helpers we mostly ignore (or, ilike, contains, etc.) — add if needed.
  ilike() { return this; }
  or() { return this; }

  // Modifiers ----------------------------------------------------
  order(col: string, options?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: options?.ascending !== false };
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) {
    this.limitN = to - from + 1;
    // ignore offset for simplicity
    return this;
  }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybeSingle'; return this; }

  // Execution ----------------------------------------------------
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null) {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | null) {
    return this.then(
      v => { onfinally?.(); return v; },
      e => { onfinally?.(); throw e; }
    );
  }

  private execute(): { data: any; error: any; count?: number } {
    try {
      const tableRows = getTable(this.tableName);

      if (this.operation === 'insert') {
        const inserted = this.payload.map((row: any) => ({ id: row.id ?? newId(this.tableName), created_at: new Date().toISOString(), ...row }));
        tableRows.push(...inserted);
        saveDataset();
        return this.shapeResult(inserted);
      }

      if (this.operation === 'upsert') {
        const conflictKeys = this.upsertOnConflict ?? ['id'];
        const written: any[] = [];
        for (const row of this.payload) {
          const existingIdx = tableRows.findIndex(r => conflictKeys.every(k => r[k] === row[k]));
          if (existingIdx >= 0) {
            const merged = { ...tableRows[existingIdx], ...row };
            tableRows[existingIdx] = merged;
            written.push(merged);
          } else {
            const inserted = { id: row.id ?? newId(this.tableName), created_at: new Date().toISOString(), ...row };
            tableRows.push(inserted);
            written.push(inserted);
          }
        }
        saveDataset();
        return this.shapeResult(written);
      }

      if (this.operation === 'update') {
        const updated: any[] = [];
        for (let i = 0; i < tableRows.length; i++) {
          if (this.filters.every(f => matches(tableRows[i], f))) {
            tableRows[i] = { ...tableRows[i], ...this.payload };
            updated.push(tableRows[i]);
          }
        }
        saveDataset();
        return this.shapeResult(updated);
      }

      if (this.operation === 'delete') {
        const kept: any[] = [];
        const removed: any[] = [];
        for (const r of tableRows) {
          if (this.filters.every(f => matches(r, f))) removed.push(r);
          else kept.push(r);
        }
        // Mutate in place to keep the array reference consistent
        tableRows.length = 0;
        tableRows.push(...kept);
        // Igual que ON DELETE CASCADE de la base real
        if (this.tableName === 'ai_conversations' && removed.length) {
          const gone = new Set(removed.map(r => r.id));
          const msgs = getTable('ai_messages');
          const keptMsgs = msgs.filter(m => !gone.has(m.conversation_id));
          msgs.length = 0;
          msgs.push(...keptMsgs);
        }
        saveDataset();
        return this.shapeResult(removed);
      }

      // SELECT
      let rows = applyFilters(tableRows, this.filters);
      if (this.orderBy) rows = sortRows(rows, this.orderBy.col, this.orderBy.ascending);
      if (this.limitN !== null) rows = rows.slice(0, this.limitN);

      // Apply nested selects / column projection
      const tree = parseSelect(this.columns);
      rows = rows.map(r => hydrateRow(this.tableName, r, tree));

      return this.shapeResult(rows);
    } catch (err) {
      console.error(`[MockClient] ${this.tableName} execution failed:`, err);
      return { data: null, error: { message: (err as Error).message, code: 'MOCK_ERROR' } };
    }
  }

  private shapeResult(rows: any[]): { data: any; error: any; count?: number } {
    if (this.isCount) {
      return { data: this.isHead ? null : rows, count: rows.length, error: null };
    }
    if (this.mode === 'single') {
      if (rows.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'No rows', details: 'Result contains 0 rows' } };
      }
      return { data: rows[0], error: null };
    }
    if (this.mode === 'maybeSingle') {
      return { data: rows[0] ?? null, error: null };
    }
    return { data: rows, error: null };
  }
}

// ─── RPC ──────────────────────────────────────────────────────────────
const handleRpc = async (fn: string, args: any): Promise<{ data: any; error: any }> => {
  if (fn === 'get_user_club_ids') {
    const userId = args?._user_id;
    const enrollments = getTable('enrollments');
    const clubIds = enrollments
      .filter(e => e.user_id === userId && e.status === 'active')
      .map(e => e.club_id);
    return { data: clubIds, error: null };
  }
  if (fn === 'get_users_in_same_clubs') {
    const userId = args?._user_id;
    const enrollments = getTable('enrollments');
    const myClubs = new Set(enrollments.filter(e => e.user_id === userId).map(e => e.club_id));
    const userIds = enrollments.filter(e => myClubs.has(e.club_id)).map(e => e.user_id);
    return { data: [...new Set(userIds)], error: null };
  }
  if (fn === 'is_coach_of_club') {
    const userId = args?._user_id;
    const clubId = args?._club_id;
    const enrollments = getTable('enrollments');
    const found = enrollments.some(e => e.user_id === userId && e.club_id === clubId && e.role === 'coach');
    return { data: found, error: null };
  }
  if (fn === 'has_role') {
    const userId = args?._user_id;
    const role = args?._role;
    const userRoles = getTable('user_roles');
    return { data: userRoles.some(r => r.user_id === userId && r.role === role), error: null };
  }
  console.warn(`[MockClient] Unhandled RPC: ${fn}`);
  return { data: null, error: null };
};

// ─── Edge functions ──────────────────────────────────────────────────
const handleFunctionInvoke = async (
  fnName: string,
  options: { body?: any } = {}
): Promise<{ data: any; error: any }> => {
  if (fnName === 'avatar-chat') {
    // Mismo contrato que el edge function real: guarda el mensaje y la respuesta, y devuelve ids y partes.
    const { message, avatar, conversationId, clientMessageId } = options.body ?? {};
    await new Promise((r) => setTimeout(r, 700));

    const convos = getTable('ai_conversations');
    const convoIdx = convos.findIndex((c) => c.id === conversationId);
    if (convoIdx < 0) {
      const res = new Response(JSON.stringify({ error: 'Conversation not found', code: 'gone' }), { status: 409 });
      return { data: null, error: new FunctionsHttpError(res) };
    }

    const msgs = getTable('ai_messages');
    const isFirst = !msgs.some((m) => m.conversation_id === conversationId);
    let userRow = clientMessageId ? msgs.find((m) => m.conversation_id === conversationId && m.client_message_id === clientMessageId) : undefined;
    if (userRow) {
      // Reintento ya respondido: devolver lo guardado en vez de contestar de nuevo.
      const idx = msgs.indexOf(userRow);
      const replies: any[] = [];
      for (let i = idx + 1; i < msgs.length && msgs[i].conversation_id === conversationId && msgs[i].role !== 'user'; i++) replies.push(msgs[i]);
      if (replies.length) {
        return {
          data: {
            userMessage: { id: userRow.id, created_at: userRow.created_at },
            respuesta: replies.map((r) => ({ id: r.id, text: r.content, created_at: r.created_at })),
            derivar: null,
          },
          error: null,
        };
      }
    } else {
      userRow = { id: newId('ai_messages'), conversation_id: conversationId, role: 'user', content: message ?? '', created_at: new Date().toISOString(), client_message_id: clientMessageId };
      msgs.push(userRow);
    }
    const base = Date.now();
    const parts = mockAvatarReplyParts((avatar ?? 'TINO').toUpperCase(), message ?? '');
    const replyRows = parts.map((text, i) => ({
      id: newId('ai_messages'), conversation_id: conversationId, role: 'assistant', content: text, created_at: new Date(base + i).toISOString(),
    }));
    msgs.push(...replyRows);
    convos[convoIdx] = {
      ...convos[convoIdx],
      last_message_at: new Date().toISOString(),
      ...(isFirst ? { title: String(message ?? '').slice(0, 50) } : {}),
    };
    saveDataset();

    return {
      data: {
        userMessage: { id: userRow.id, created_at: userRow.created_at },
        respuesta: replyRows.map((r) => ({ id: r.id, text: r.content, created_at: r.created_at })),
        derivar: null,
      },
      error: null,
    };
  }
  console.warn(`[MockClient] Unhandled edge function: ${fnName}`);
  return { data: null, error: null };
};

// ─── Channel (realtime) — no-op stub ────────────────────────────────
const stubChannel = () => {
  const channel = {
    on: () => channel,
    subscribe: (cb?: (status: string) => void) => {
      cb?.('SUBSCRIBED');
      return channel;
    },
    unsubscribe: () => Promise.resolve('OK'),
  };
  return channel;
};

// ─── Public mock client ──────────────────────────────────────────────
export const demoMockClient = {
  from: (tableName: string) => new MockQuery(tableName),
  rpc: (fn: string, args?: any) => {
    // RPC needs to be thenable too
    return {
      then(onfulfilled: any, onrejected: any) {
        return handleRpc(fn, args).then(onfulfilled, onrejected);
      },
    };
  },
  functions: {
    invoke: (fn: string, options?: { body?: any }) => handleFunctionInvoke(fn, options),
  },
  channel: (_name: string) => stubChannel(),
  removeChannel: (_channel: any) => Promise.resolve('OK'),
};

export type DemoMockClient = typeof demoMockClient;

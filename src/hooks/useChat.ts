import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction, type ToastActionElement } from '@/components/ui/toast';
import { CHAT_ERROR_TEXT, chatErrorKind, readEdgeError } from '@/lib/edgeError';
import { AVATAR_IDS, suggestAgentFor, type AvatarId } from '@/lib/avatars';
import type { ConversationMeta } from '@/components/chat/ChatHistoryDrawer';

export const MAX_CONVERSATIONS = 5;
const STALE = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30_000;
/** Pausa antes de mostrar la siguiente parte: proporcional al largo, como alguien que escribe. */
const partDelay = (text: string) => Math.min(1400, Math.max(400, 250 + 12 * text.length));

export interface ChatMessage {
  id: string;
  sender: 'user' | 'avatar';
  avatar: AvatarId;
  text: string;
  timestamp: string;
  /** true si llegó en esta sesión (solo esos se animan al entrar) */
  fresh?: boolean;
  /** true mientras el mensaje del usuario todavía no se guardó */
  pending?: boolean;
  /** true si el envío falló: se puede reintentar con el mismo `clientMessageId` (no duplica) */
  failed?: boolean;
  clientMessageId?: string;
  /** Tildes (solo mensajes del usuario): reloj → ✓ → ✓✓ cuando responde el agente; alerta si falló */
  status?: 'sending' | 'sent' | 'read' | 'failed';
}

interface ServerPart { id: string; text: string; created_at: string }
interface ChatResponse {
  userMessage?: { id: string; created_at: string };
  respuesta?: ServerPart[];
  derivar?: AvatarId | null;
}

/** Envío en curso de una conversación: permite cancelarlo (borrar el chat) o vaciarlo (desmontar). */
interface Inflight {
  avatar: AvatarId;
  controller: AbortController;
  timer?: number;
  cancelled: boolean;
  flush?: () => void;
}

export interface Handoff {
  to: AvatarId;
  text: string;
}

const convosKey = (uid?: string) => ['ai_conversations', uid] as const;
const msgsKey = (id: string | null) => ['ai_messages', id] as const;

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

async function fetchConversations(userId: string): Promise<ConversationMeta[]> {
  const { data } = await supabase
    .from('ai_conversations')
    .select('id, avatar, title, last_message_at, created_at')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });
  return (data ?? []).map((c) => ({
    id: c.id, avatar: c.avatar as AvatarId, title: c.title,
    lastMessageAt: c.last_message_at, createdAt: c.created_at,
  }));
}

async function fetchMessages(convoId: string, avatar: AvatarId): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', convoId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m) => ({
    id: m.id, sender: m.role === 'user' ? 'user' : 'avatar',
    avatar, text: m.content, timestamp: m.created_at,
  }));
}

const NO_MESSAGES: ChatMessage[] = [];
const emptyBy = <T,>(v: T): Record<AvatarId, T> => ({ TINO: v, ZAHIA: v, ROMA: v });

/** Estado del chat: conversaciones y mensajes en caché (React Query), envío por agente y "no leídos".
 *  `viewing` = false cuando se está en la lista de chats (ninguna conversación abierta). */
export function useChat(agent: AvatarId, viewing = true) {
  const { user } = useAuth();
  const userId = user?.id;
  const { toast } = useToast();
  const qc = useQueryClient();

  const agentRef = useRef(agent);
  agentRef.current = agent;
  const viewingRef = useRef<AvatarId | null>(viewing ? agent : null);
  viewingRef.current = viewing ? agent : null;

  const [chosen, setChosen] = useState<Partial<Record<AvatarId, string | null>>>({});
  const [sending, setSending] = useState<Record<AvatarId, boolean>>(emptyBy(false));
  const [unread, setUnread] = useState<Record<AvatarId, number>>(emptyBy(0));
  const [handoffs, setHandoffs] = useState<Record<AvatarId, Handoff | null>>(emptyBy(null));

  const convosQuery = useQuery({
    queryKey: convosKey(userId),
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    staleTime: STALE,
  });
  const conversations = convosQuery.data ?? [];

  const activeConvoId: string | null =
    chosen[agent] !== undefined ? chosen[agent]! : (conversations.find((c) => c.avatar === agent)?.id ?? null);

  const messagesQuery = useQuery({
    queryKey: msgsKey(activeConvoId),
    queryFn: () => fetchMessages(activeConvoId!, agent),
    enabled: !!activeConvoId,
    staleTime: STALE,
  });
  const rawMessages = (activeConvoId ? messagesQuery.data : undefined) ?? NO_MESSAGES;

  // Tildes derivadas: reloj mientras se guarda, ✓ guardado, ✓✓ si hay una respuesta posterior del agente.
  const messages = useMemo<ChatMessage[]>(() => {
    let replied = false;
    const out = new Array<ChatMessage>(rawMessages.length);
    for (let i = rawMessages.length - 1; i >= 0; i--) {
      const m = rawMessages[i];
      if (m.sender === 'avatar') { replied = true; out[i] = m; continue; }
      out[i] = { ...m, status: m.failed ? 'failed' : replied ? 'read' : m.pending ? 'sending' : 'sent' };
    }
    return out;
  }, [rawMessages]);

  // Última conversación de cada agente, siempre en caché: el cambio de agente es instantáneo y la lista de chats muestra el último mensaje.
  const latestIds = AVATAR_IDS.map((id) => conversations.find((c) => c.avatar === id)?.id ?? null);
  const latestQueries = useQueries({
    queries: AVATAR_IDS.map((id, i) => ({
      queryKey: msgsKey(latestIds[i]),
      queryFn: () => fetchMessages(latestIds[i]!, id),
      enabled: !!latestIds[i],
      staleTime: STALE,
    })),
  });
  const lastMessages = useMemo(() => {
    const out = emptyBy<ChatMessage | null>(null);
    AVATAR_IDS.forEach((id, i) => {
      const list = latestQueries[i].data;
      out[id] = list && list.length ? list[list.length - 1] : null;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, latestQueries.map((q) => q.data));

  // Al abrir la conversación de un agente, sus mensajes quedan leídos.
  useEffect(() => {
    if (!viewing) return;
    setUnread((u) => (u[agent] ? { ...u, [agent]: 0 } : u));
  }, [agent, viewing]);

  const setMessages = useCallback((convoId: string, fn: (prev: ChatMessage[]) => ChatMessage[]) => {
    qc.setQueryData<ChatMessage[]>(msgsKey(convoId), (prev) => fn(prev ?? []));
  }, [qc]);

  const patchConvo = useCallback((id: string, patch: Partial<ConversationMeta>) => {
    qc.setQueryData<ConversationMeta[]>(convosKey(userId), (prev) =>
      (prev ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, [qc, userId]);

  const createConversation = useCallback(async (forAgent: AvatarId): Promise<string | null> => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, avatar: forAgent, title: `Chat con ${forAgent}` })
      .select('id, avatar, title, last_message_at, created_at')
      .single();
    if (error || !data) return null;
    const meta: ConversationMeta = {
      id: data.id, avatar: data.avatar as AvatarId, title: data.title,
      lastMessageAt: data.last_message_at, createdAt: data.created_at,
    };
    qc.setQueryData<ConversationMeta[]>(convosKey(userId), (prev) => [meta, ...(prev ?? [])]);
    qc.setQueryData<ChatMessage[]>(msgsKey(data.id), []);
    return data.id;
  }, [qc, userId]);

  const inflightRef = useRef(new Map<string, Inflight>());

  // Al salir del chat, lo que falta mostrar se vuelca de una vez (ya está guardado en el servidor).
  useEffect(() => {
    const inflight = inflightRef.current;
    return () => { inflight.forEach((e) => e.flush?.()); };
  }, []);

  const convoExists = useCallback((id: string) =>
    !!qc.getQueryData<ConversationMeta[]>(convosKey(userId))?.some((c) => c.id === id), [qc, userId]);

  const resolveConvoId = useCallback((target: AvatarId): string | null =>
    chosen[target] !== undefined
      ? chosen[target]!
      : (qc.getQueryData<ConversationMeta[]>(convosKey(userId)) ?? []).find((c) => c.avatar === target)?.id ?? null,
  [chosen, qc, userId]);

  /** Manda el mensaje al servidor (que lo guarda junto con la respuesta) y muestra las partes escalonadas. */
  const deliver = useCallback(async (id: string, target: AvatarId, tempId: string, text: string, clientMessageId: string) => {
    const entry: Inflight = { avatar: target, controller: new AbortController(), cancelled: false };
    inflightRef.current.set(id, entry);
    setSending((s) => ({ ...s, [target]: true }));
    setMessages(id, (prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: true, failed: false } : m)));

    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; entry.controller.abort(); }, REQUEST_TIMEOUT_MS);
    const finish = () => {
      window.clearTimeout(timeout);
      // Si ya lo cortó el borrado de la conversación, no pisar el estado de un envío nuevo.
      if (inflightRef.current.get(id) !== entry) return;
      inflightRef.current.delete(id);
      setSending((st) => ({ ...st, [target]: false }));
    };

    try {
      const { data, error } = await supabase.functions.invoke<ChatResponse>('avatar-chat', {
        body: { message: text, avatar: target, conversationId: id, clientMessageId },
        signal: entry.controller.signal,
      });
      window.clearTimeout(timeout);
      if (entry.cancelled) return;
      if (error) throw error;

      const parts = (data?.respuesta ?? []).filter((p) => p?.text?.trim());
      if (!parts.length) throw new Error('empty-response');

      const real = data?.userMessage;
      setMessages(id, (prev) => prev.map((m) => (m.id === tempId
        ? { ...m, id: real?.id ?? m.id, timestamp: real?.created_at ?? m.timestamp, pending: false, failed: false }
        : m)));
      patchConvo(id, { lastMessageAt: parts[parts.length - 1].created_at });

      const to = data?.derivar ?? suggestAgentFor(text, target);
      setHandoffs((h) => ({ ...h, [target]: to && to !== target ? { to, text } : null }));

      const append = (p: ServerPart) => {
        if (!convoExists(id)) return;
        setMessages(id, (prev) => (prev.some((m) => m.id === p.id) ? prev : [...prev, {
          id: p.id, sender: 'avatar', avatar: target, text: p.text, timestamp: p.created_at, fresh: true,
        }]));
        if (viewingRef.current !== target) setUnread((u) => ({ ...u, [target]: u[target] + 1 }));
      };
      let i = 0;
      const next = () => {
        append(parts[i++]);
        if (i >= parts.length) { finish(); return; }
        entry.timer = window.setTimeout(next, partDelay(parts[i].text));
      };
      entry.flush = () => {
        window.clearTimeout(entry.timer);
        while (i < parts.length) append(parts[i++]);
        finish();
      };
      next();
    } catch (err) {
      finish();
      if (entry.cancelled) return;
      const info = timedOut ? { code: 'timeout' as const, message: 'timeout' } : await readEdgeError(err);
      console.error('Chat error:', info.code, info.message);

      if (info.code === 'gone') {
        // La conversación ya no existe (se borró desde otro lado): se descarta en silencio.
        qc.removeQueries({ queryKey: msgsKey(id) });
        qc.setQueryData<ConversationMeta[]>(convosKey(userId), (prev) => (prev ?? []).filter((c) => c.id !== id));
        setChosen((c) => { const n = { ...c }; delete n[target]; return n; });
        return;
      }
      setMessages(id, (prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
      const kind = chatErrorKind(info.code);
      if (kind === 'session') {
        toast({
          title: CHAT_ERROR_TEXT.session,
          action: createElement(ToastAction, { altText: 'Iniciar sesión', onClick: () => window.location.assign('/login') }, 'Iniciar sesión') as unknown as ToastActionElement,
        });
      } else if (kind === 'rate') {
        toast({ title: CHAT_ERROR_TEXT.rate });
      } else {
        toast({ title: `${target} ${CHAT_ERROR_TEXT.retry}` });
      }
    }
  }, [setMessages, patchConvo, convoExists, qc, userId, toast]);

  /** Devuelve false si no se pudo enviar (así el input conserva el texto). */
  const sendMessage = useCallback(async (raw: string): Promise<boolean> => {
    const text = raw.trim();
    const target = agentRef.current;
    if (!text || !userId || sending[target]) return false;

    let convoId = resolveConvoId(target);

    if (!convoId) {
      const total = qc.getQueryData<ConversationMeta[]>(convosKey(userId))?.length ?? 0;
      if (total >= MAX_CONVERSATIONS) {
        toast({ title: 'Límite alcanzado', description: 'Eliminá una conversación para crear una nueva.' });
        return false;
      }
      convoId = await createConversation(target);
      if (!convoId) {
        toast({ title: 'No pudimos iniciar el chat', description: 'Probá de nuevo en un momento.' });
        return false;
      }
      setChosen((c) => ({ ...c, [target]: convoId }));
    }

    const id = convoId;
    const isFirst = !(qc.getQueryData<ChatMessage[]>(msgsKey(id)) ?? []).some((m) => m.sender === 'user');
    const tempId = newId();
    const clientMessageId = newId();
    setMessages(id, (prev) => [...prev, {
      id: tempId, sender: 'user', avatar: target, text, timestamp: new Date().toISOString(),
      fresh: true, pending: true, clientMessageId,
    }]);
    setHandoffs((h) => ({ ...h, [target]: null }));
    // El título definitivo lo guarda el servidor; acá solo se adelanta en pantalla.
    if (isFirst) patchConvo(id, { title: text.slice(0, 50) });

    void deliver(id, target, tempId, text, clientMessageId);
    return true;
  }, [userId, sending, resolveConvoId, qc, toast, createConversation, setMessages, patchConvo, deliver]);

  /** Reintenta un mensaje fallido con el mismo `clientMessageId`: el servidor no lo duplica. */
  const retryMessage = useCallback((messageId: string) => {
    const target = agentRef.current;
    const id = resolveConvoId(target);
    if (!id || sending[target]) return;
    const msg = qc.getQueryData<ChatMessage[]>(msgsKey(id))?.find((m) => m.id === messageId);
    if (!msg?.failed) return;
    void deliver(id, target, msg.id, msg.text, msg.clientMessageId ?? newId());
  }, [resolveConvoId, sending, qc, deliver]);

  const selectConversation = useCallback((id: string) => {
    const convo = qc.getQueryData<ConversationMeta[]>(convosKey(userId))?.find((c) => c.id === id);
    if (convo) setChosen((c) => ({ ...c, [convo.avatar]: id }));
  }, [qc, userId]);

  /** Chat nuevo: queda "en blanco" y la conversación se crea al mandar el primer mensaje. */
  const startNewChat = useCallback(() => setChosen((c) => ({ ...c, [agentRef.current]: null })), []);

  const deleteConversation = useCallback(async (id: string) => {
    // Si el agente está respondiendo en esta conversación, se corta primero: no quedan escrituras huérfanas.
    const entry = inflightRef.current.get(id);
    if (entry) {
      entry.cancelled = true;
      window.clearTimeout(entry.timer);
      entry.controller.abort();
      inflightRef.current.delete(id);
      setSending((s) => ({ ...s, [entry.avatar]: false }));
    }
    // Un solo delete: ai_messages.conversation_id tiene ON DELETE CASCADE.
    const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
    if (error) {
      console.error('Delete conversation error:', error);
      toast({ title: 'No pudimos borrar la conversación', description: 'Probá de nuevo en un momento.' });
      return;
    }
    qc.removeQueries({ queryKey: msgsKey(id) });
    qc.setQueryData<ConversationMeta[]>(convosKey(userId), (prev) => (prev ?? []).filter((c) => c.id !== id));
    setChosen((c) => {
      const next = { ...c };
      for (const a of AVATAR_IDS) if (next[a] === id) delete next[a];
      return next;
    });
  }, [qc, userId, toast]);

  const clearHandoff = useCallback((a: AvatarId) => setHandoffs((h) => ({ ...h, [a]: null })), []);

  return {
    conversations,
    isLoading: convosQuery.isLoading,
    messages,
    isLoadingMessages: !!activeConvoId && messagesQuery.isLoading,
    activeConvoId,
    isSending: sending[agent],
    unread,
    lastMessages,
    handoff: handoffs[agent],
    clearHandoff,
    sendMessage,
    retryMessage,
    selectConversation,
    startNewChat,
    deleteConversation,
    atLimit: conversations.length >= MAX_CONVERSATIONS,
  };
}

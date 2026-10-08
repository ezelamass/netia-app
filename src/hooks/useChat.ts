import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AVATAR_IDS, suggestAgentFor, type AvatarId } from '@/lib/avatars';
import type { ConversationMeta } from '@/components/chat/ChatHistoryDrawer';

export const MAX_CONVERSATIONS = 5;
const STALE = 5 * 60 * 1000;
const PART_DELAY_MS = 450;

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
  /** Tildes (solo mensajes del usuario), derivadas sin backend: reloj → ✓ → ✓✓ cuando responde el agente */
  status?: 'sending' | 'sent' | 'read';
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
      out[i] = { ...m, status: replied ? 'read' : m.pending ? 'sending' : 'sent' };
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

  const saveMessage = useCallback(async (convoId: string, role: 'user' | 'assistant', content: string) => {
    await supabase.from('ai_messages').insert({ conversation_id: convoId, role, content });
    const now = new Date().toISOString();
    await supabase.from('ai_conversations').update({ last_message_at: now }).eq('id', convoId);
    patchConvo(convoId, { lastMessageAt: now });
  }, [patchConvo]);

  /** Devuelve false si no se pudo enviar (así el input conserva el texto). */
  const sendMessage = useCallback(async (raw: string): Promise<boolean> => {
    const text = raw.trim();
    const target = agentRef.current;
    if (!text || !userId || sending[target]) return false;

    let convoId = chosen[target] !== undefined
      ? chosen[target]!
      : (qc.getQueryData<ConversationMeta[]>(convosKey(userId)) ?? []).find((c) => c.avatar === target)?.id ?? null;

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
    const userMsgId = newId();
    setMessages(id, (prev) => [...prev, { id: userMsgId, sender: 'user', avatar: target, text, timestamp: new Date().toISOString(), fresh: true, pending: true }]);

    const to = suggestAgentFor(text, target);
    setHandoffs((h) => ({ ...h, [target]: to ? { to, text } : null }));

    if (isFirst) {
      const title = text.slice(0, 50);
      patchConvo(id, { title });
      void supabase.from('ai_conversations').update({ title }).eq('id', id);
    }

    setSending((s) => ({ ...s, [target]: true }));
    void saveMessage(id, 'user', text).then(() =>
      setMessages(id, (prev) => prev.map((m) => (m.id === userMsgId ? { ...m, pending: false } : m))));

    let clearLater = false;
    try {
      const { data, error } = await supabase.functions.invoke('avatar-chat', {
        body: { message: text, avatar: target, conversationId: id },
      });
      if (error) throw new Error(error.message || 'Edge function error');
      const parts: string[] = Array.isArray(data?.respuesta)
        ? data.respuesta.filter((s: unknown): s is string => typeof s === 'string' && !!s.trim())
        : [];
      if (!parts.length) { toast({ title: `${target} respondió sin contenido` }); return true; }

      parts.forEach((part, i) => {
        window.setTimeout(() => {
          setMessages(id, (prev) => [...prev, { id: newId(), sender: 'avatar', avatar: target, text: part, timestamp: new Date().toISOString(), fresh: true }]);
          void saveMessage(id, 'assistant', part);
          if (viewingRef.current !== target) setUnread((u) => ({ ...u, [target]: u[target] + 1 }));
          if (i === parts.length - 1) setSending((st) => ({ ...st, [target]: false }));
        }, i * PART_DELAY_MS);
      });
      clearLater = true;
    } catch (err) {
      console.error('Chat error:', err);
      toast({ title: 'Error al contactar al avatar', description: 'Intentá nuevamente.' });
    } finally {
      if (!clearLater) setSending((st) => ({ ...st, [target]: false }));
    }
    return true;
  }, [userId, sending, chosen, qc, toast, createConversation, setMessages, patchConvo, saveMessage]);

  const selectConversation = useCallback((id: string) => {
    const convo = qc.getQueryData<ConversationMeta[]>(convosKey(userId))?.find((c) => c.id === id);
    if (convo) setChosen((c) => ({ ...c, [convo.avatar]: id }));
  }, [qc, userId]);

  /** Chat nuevo: queda "en blanco" y la conversación se crea al mandar el primer mensaje. */
  const startNewChat = useCallback(() => setChosen((c) => ({ ...c, [agentRef.current]: null })), []);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from('ai_messages').delete().eq('conversation_id', id);
    await supabase.from('ai_conversations').delete().eq('id', id);
    qc.removeQueries({ queryKey: msgsKey(id) });
    qc.setQueryData<ConversationMeta[]>(convosKey(userId), (prev) => (prev ?? []).filter((c) => c.id !== id));
    setChosen((c) => {
      const next = { ...c };
      for (const a of AVATAR_IDS) if (next[a] === id) delete next[a];
      return next;
    });
  }, [qc, userId]);

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
    selectConversation,
    startNewChat,
    deleteConversation,
    atLimit: conversations.length >= MAX_CONVERSATIONS,
  };
}

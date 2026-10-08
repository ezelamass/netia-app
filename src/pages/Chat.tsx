import { AppLayout } from '@/layouts/AppLayout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoGuard } from '@/hooks/useDemoGuard';
import { AGENTS } from '@/lib/avatars';
import { AvatarPill, type AvatarId, type AvatarPillAvatar } from '@/components/chat/AvatarPill';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatHistoryDrawer, type ConversationMeta } from '@/components/chat/ChatHistoryDrawer';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';
import { AIInput } from '@/components/ui/ai-input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MAX_CONVERSATIONS = 5;

interface ChatMessage {
  id: string;
  sender: 'user' | 'avatar';
  avatar: AvatarId;
  text: string;
  timestamp: string;
}

const AVATAR_CONFIG: Record<AvatarId, { description: string }> = {
  TINO: { description: 'TINO te acompaña con entrenamiento físico y preparación atlética para rendir al máximo.' },
  ZAHIA: { description: 'ZAHIA es tu guía en nutrición, hidratación y hábitos saludables para deportistas.' },
  ROMA: { description: 'ROMA te ayuda con estrategia de regatas, decisiones tácticas y foco mental.' },
};

const AVATAR_SUGGESTIONS: Record<AvatarId, string[]> = {
  TINO: ['¿Qué entreno hoy?', '¿Cómo mejoro mi resistencia?', 'Dame un plan'],
  ZAHIA: ['¿Qué como antes de entrenar?', '¿Cuánta agua tomo?', 'Snack saludable'],
  ROMA: ['¿Cómo me concentro?', 'Nervios antes del partido', 'Consejo mental'],
};

const WELCOME_SUGGESTIONS = ['¿Qué entreno hoy?', 'Dame un consejo', '¿Cómo me hidrato mejor?'];
const AVATAR_IMAGES: Record<AvatarId, string> = { TINO: AGENTS.TINO.image, ZAHIA: AGENTS.ZAHIA.image, ROMA: AGENTS.ROMA.image };

function generateId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; }

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { blockIfDemo } = useDemoGuard();

  const [allConversations, setAllConversations] = useState<ConversationMeta[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<AvatarId | null>(null);
  const [confirmNewChat, setConfirmNewChat] = useState(false);

  const messageCacheRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const avatarOptions: AvatarPillAvatar[] = useMemo(() => [
    { id: 'TINO', name: 'TINO', image: AGENTS.TINO.image, accentClass: 'ring-tino' },
    { id: 'ZAHIA', name: 'ZAHIA', image: AGENTS.ZAHIA.image, accentClass: 'ring-zahia' },
    { id: 'ROMA', name: 'ROMA', image: AGENTS.ROMA.image, accentClass: 'ring-roma' },
  ], []);

  // Load all conversation metadata on mount
  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from('ai_conversations')
          .select('id, avatar, title, last_message_at, created_at')
          .eq('user_id', user.id)
          .order('last_message_at', { ascending: false });
        if (data) {
          setAllConversations(data.map(c => ({
            id: c.id, avatar: c.avatar as AvatarId, title: c.title,
            lastMessageAt: c.last_message_at, createdAt: c.created_at,
          })));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const currentMessages = activeConvoId ? (loadedMessages[activeConvoId] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentMessages.length]);

  const loadMessages = async (convoId: string, avatar: AvatarId) => {
    if (messageCacheRef.current.has(convoId)) return;
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      messageCacheRef.current.add(convoId);
      setLoadedMessages(prev => ({
        ...prev,
        [convoId]: data.map((m: any) => ({
          id: m.id, sender: m.role === 'user' ? 'user' : 'avatar',
          avatar, text: m.content, timestamp: m.created_at,
        })),
      }));
    }
  };

  const handleAvatarSelect = (avatar: AvatarId) => {
    setSelectedAvatar(avatar);
    const latest = allConversations.find(c => c.avatar === avatar);
    if (latest) {
      setActiveConvoId(latest.id);
      loadMessages(latest.id, avatar);
    } else {
      setActiveConvoId(null);
    }
  };

  const handleSelectConversation = async (id: string) => {
    const convo = allConversations.find(c => c.id === id);
    if (!convo) return;
    setSelectedAvatar(convo.avatar);
    setActiveConvoId(id);
    await loadMessages(id, convo.avatar);
  };

  const createNewConversation = async (avatar: AvatarId): Promise<string | null> => {
    if (!user) return null;
    if (blockIfDemo('Estás en modo demo. Registrate para guardar tus conversaciones con los avatares.')) {
      return null;
    }
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, avatar, title: `Chat con ${avatar}` })
      .select('id, avatar, title, last_message_at, created_at')
      .single();
    if (error || !data) return null;
    const meta: ConversationMeta = {
      id: data.id, avatar: data.avatar as AvatarId, title: data.title,
      lastMessageAt: data.last_message_at, createdAt: data.created_at,
    };
    setAllConversations(prev => [meta, ...prev]);
    return data.id;
  };

  const handleNewChat = async () => {
    if (!selectedAvatar || allConversations.length >= MAX_CONVERSATIONS) return;
    const newId = await createNewConversation(selectedAvatar);
    if (newId) {
      setActiveConvoId(newId);
      setLoadedMessages(prev => ({ ...prev, [newId]: [] }));
      messageCacheRef.current.add(newId);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (blockIfDemo('No podés borrar conversaciones en modo demo.')) return;
    await supabase.from('ai_messages').delete().eq('conversation_id', id);
    await supabase.from('ai_conversations').delete().eq('id', id);
    messageCacheRef.current.delete(id);
    const remaining = allConversations.filter(c => c.id !== id);
    setAllConversations(remaining);
    setLoadedMessages(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (activeConvoId === id) {
      const nextForAvatar = remaining.find(c => c.avatar === selectedAvatar);
      if (nextForAvatar) {
        setActiveConvoId(nextForAvatar.id);
        if (selectedAvatar) loadMessages(nextForAvatar.id, selectedAvatar);
      } else {
        setActiveConvoId(null);
      }
    }
  };

  const saveMessage = async (convoId: string, role: 'user' | 'assistant', content: string) => {
    // saveMessage is called from sendMessage, which already blocks demo mode
    // before any work happens. Double-check here in case it gets called from
    // another path in the future.
    if (blockIfDemo()) return;
    await supabase.from('ai_messages').insert({ conversation_id: convoId, role, content });
    const now = new Date().toISOString();
    await supabase.from('ai_conversations').update({ last_message_at: now }).eq('id', convoId);
    setAllConversations(prev => prev.map(c => c.id === convoId ? { ...c, lastMessageAt: now } : c));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !selectedAvatar || isSending) return;
    if (blockIfDemo('Esto es una demo. Registrate para chatear con los avatares de verdad.')) return;
    const avatar = selectedAvatar;
    let convoId = activeConvoId;

    if (!convoId) {
      if (allConversations.length >= MAX_CONVERSATIONS) {
        toast({ title: 'Límite alcanzado', description: 'Eliminá una conversación para crear una nueva.' });
        return;
      }
      convoId = await createNewConversation(avatar);
      if (!convoId) return;
      setActiveConvoId(convoId);
      setLoadedMessages(prev => ({ ...prev, [convoId!]: [] }));
      messageCacheRef.current.add(convoId);
    }

    const isFirstMsg = (loadedMessages[convoId] ?? []).filter(m => m.sender === 'user').length === 0;
    const userMessage: ChatMessage = {
      id: generateId(), sender: 'user', avatar, text: text.trim(), timestamp: new Date().toISOString(),
    };
    setLoadedMessages(prev => ({ ...prev, [convoId!]: [...(prev[convoId!] ?? []), userMessage] }));

    if (isFirstMsg) {
      const newTitle = text.trim().slice(0, 50);
      supabase.from('ai_conversations').update({ title: newTitle }).eq('id', convoId).then(() => {
        setAllConversations(prev => prev.map(c => c.id === convoId ? { ...c, title: newTitle } : c));
      });
    }

    setIsSending(true);
    setPendingAvatar(avatar);
    await saveMessage(convoId, 'user', text.trim());

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('avatar-chat', {
        body: { message: text.trim(), avatar, conversationId: convoId },
      });
      if (fnError) throw new Error(fnError.message || 'Edge function error');

      const parts: string[] = Array.isArray(fnData?.respuesta)
        ? fnData.respuesta.filter((s: any) => typeof s === 'string' && s.trim())
        : [];

      if (!parts.length) { toast({ title: `${avatar} respondió sin contenido` }); return; }

      parts.forEach((textPart, i) => {
        setTimeout(() => {
          setLoadedMessages(prev => ({
            ...prev,
            [convoId!]: [...(prev[convoId!] ?? []), {
              id: generateId(), sender: 'avatar', avatar, text: textPart, timestamp: new Date().toISOString(),
            }],
          }));
          saveMessage(convoId!, 'assistant', textPart);
        }, i * 450);
      });
    } catch (err) {
      console.error('Chat error:', err);
      toast({ title: 'Error al contactar al avatar', description: 'Intenta nuevamente.' });
    } finally {
      setIsSending(false);
      setPendingAvatar(null);
    }
  };

  const atLimit = allConversations.length >= MAX_CONVERSATIONS;

  const handleNewChatClick = () => {
    if (atLimit) {
      setHistoryOpen(true);
    } else {
      setConfirmNewChat(true);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-56px)] flex-col pb-24 lg:pb-16">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-lg backdrop-blur-xl">
          {selectedAvatar && (
            <ChatHeader
              avatar={selectedAvatar}
              avatarImage={AVATAR_IMAGES[selectedAvatar]}
              onNewChat={handleNewChatClick}
              onOpenHistory={() => setHistoryOpen(true)}
              disabled={isSending && pendingAvatar === selectedAvatar}
              atLimit={atLimit}
              totalCount={allConversations.length}
              maxCount={MAX_CONVERSATIONS}
            />
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? (
              <ChatSkeleton messageCount={5} />
            ) : !selectedAvatar ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  variant="first-chat" avatar="all"
                  title="Chat con tus coaches IA"
                  description="Elegí a TINO, ZAHIA o ROMA para iniciar una conversación personalizada."
                  suggestions={WELCOME_SUGGESTIONS}
                  onSuggestionClick={() => {}}
                  className="bg-transparent border-none"
                />
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  variant="first-chat" avatar={selectedAvatar}
                  title={`¡Hola! Soy ${selectedAvatar}`}
                  description={AVATAR_CONFIG[selectedAvatar].description}
                  suggestions={AVATAR_SUGGESTIONS[selectedAvatar]}
                  onSuggestionClick={sendMessage}
                  className="bg-transparent border-none"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {currentMessages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id}
                    isUser={msg.sender === 'user'}
                    avatar={msg.avatar}
                    avatarImage={AVATAR_IMAGES[msg.avatar]}
                    text={msg.text}
                    index={index}
                  />
                ))}
                {isSending && pendingAvatar === selectedAvatar && (
                  <TypingIndicator avatar={selectedAvatar} avatarImage={AVATAR_IMAGES[selectedAvatar]} />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border/60 bg-background/95 px-3 py-2.5 backdrop-blur-sm">
            <AIInput
              id="chat-input"
              placeholder={selectedAvatar ? `Escribí tu consulta para ${selectedAvatar}...` : 'Elegí un avatar para comenzar'}
              disabled={!selectedAvatar || isSending}
              onSubmit={sendMessage}
              minHeight={44}
              maxHeight={160}
            />
          </div>
        </div>

        {selectedAvatar && (
          <ChatHistoryDrawer
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            avatar={selectedAvatar}
            conversations={allConversations}
            activeConvoId={activeConvoId}
            totalCount={allConversations.length}
            maxCount={MAX_CONVERSATIONS}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
          />
        )}

        <AlertDialog open={confirmNewChat} onOpenChange={o => { if (!o) setConfirmNewChat(false); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Empezar un nuevo chat?</AlertDialogTitle>
              <AlertDialogDescription>
                Se creará una nueva conversación con {selectedAvatar ?? ''}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { handleNewChat(); setConfirmNewChat(false); }}>Nuevo chat</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AvatarPill avatars={avatarOptions} selectedAvatar={selectedAvatar} onSelect={handleAvatarSelect} />
      </div>
    </AppLayout>
  );
};

export default Chat;

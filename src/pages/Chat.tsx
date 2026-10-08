import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useChat } from '@/hooks/useChat';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatHistoryDrawer } from '@/components/chat/ChatHistoryDrawer';
import { ChatList } from '@/components/chat/ChatList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { SystemChip, AI_NOTICE } from '@/components/chat/SystemChip';
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';
import { AIInput } from '@/components/ui/ai-input';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LAST_AGENT_KEY = 'netia_chat_last_agent';

const parseAgent = (v: string | null): AvatarId | null => {
  const up = v?.toUpperCase();
  return AVATAR_IDS.find((a) => a === up) ?? null;
};

const readLastAgent = (): AvatarId | null => {
  try { return parseAgent(localStorage.getItem(LAST_AGENT_KEY)); } catch { return null; }
};

/**
 * Chat con el modelo mental de WhatsApp.
 * Mobile: lista de chats → conversación (flecha atrás). Desktop (≥ lg): dos paneles.
 * Deep links: `?agente=` abre la conversación, `?q=` precarga el texto (sin enviar).
 */
const Chat = () => {
  const [params, setParams] = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [fallback] = useState<AvatarId>(() => readLastAgent() ?? 'TINO');
  const paramAgent = parseAgent(params.get('agente'));
  const agent = paramAgent ?? fallback;
  // En mobile sin ?agente= se ve la lista; en desktop siempre hay una conversación abierta.
  const inConversation = isDesktop || !!paramAgent;

  const chat = useChat(agent, inConversation);
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<AvatarId, string>>({ TINO: '', ZAHIA: '', ROMA: '' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  // ?q= precarga el input del agente indicado y se limpia de la URL (el agente queda en ?agente=).
  useEffect(() => {
    const q = params.get('q');
    if (!q) return;
    setDrafts((d) => ({ ...d, [agent]: q }));
    setParams((p) => {
      p.set('agente', agent);
      p.delete('q');
      return p;
    }, { replace: true });
    // Solo al montar: después, los cambios de agente pasan por selectAgent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAgent = useCallback((next: AvatarId) => {
    try { localStorage.setItem(LAST_AGENT_KEY, next); } catch { /* sin storage */ }
    setParams((p) => { p.set('agente', next); return p; }, { replace: isDesktop });
  }, [setParams, isDesktop]);

  const backToList = useCallback(() => {
    setParams((p) => { p.delete('agente'); return p; }, { replace: true });
  }, [setParams]);

  const setDraft = useCallback((v: string) => setDrafts((d) => ({ ...d, [agent]: v })), [agent]);

  const userCount = chat.messages.filter((m) => m.sender === 'user').length;
  const isEmpty = chat.messages.length === 0;
  const loading = chat.isLoading || chat.isLoadingMessages;

  const send = (text: string) => {
    chat.clearHandoff(agent);
    void chat.sendMessage(text);
  };

  const onSubmit = (text: string) => {
    if (chat.isSending) return false;
    if (!chat.activeConvoId && chat.atLimit) {
      toast({ title: 'Límite alcanzado', description: 'Eliminá una conversación para crear una nueva.' });
      return false;
    }
    send(text);
    return true;
  };

  const onHandoff = ({ to, text }: { to: AvatarId; text: string }) => {
    chat.clearHandoff(agent);
    setDrafts((d) => ({ ...d, [to]: text }));
    selectAgent(to);
  };

  const onNewChat = () => {
    if (chat.atLimit) { setHistoryOpen(true); return; }
    if (isEmpty) return;
    setConfirmNew(true);
  };

  const notice = <SystemChip className="mb-1 mt-2">{AI_NOTICE}</SystemChip>;

  return (
    <AppLayout>
      <div
        data-page-ready={chat.isLoading ? undefined : ''}
        className={cn(
          'mx-auto flex max-w-5xl overflow-hidden rounded-2xl bg-card shadow-card',
          'h-[calc(100dvh-3.5rem-var(--banner-h,0px)-1.25rem-6rem)]',
          paramAgent && 'h-[calc(100dvh-3.5rem-var(--banner-h,0px)-1.25rem-1rem)]',
          'lg:h-[calc(100dvh-3.5rem-var(--banner-h,0px)-1.25rem-2rem)]',
        )}
      >
        <aside
          aria-label="Chats"
          className={cn(
            'min-h-0 w-full shrink-0 flex-col border-border/60 lg:flex lg:w-80 lg:border-r',
            inConversation ? 'hidden' : 'flex animate-fade-up',
          )}
        >
          <ChatList
            active={inConversation ? agent : null}
            lastMessages={chat.lastMessages}
            unread={chat.unread}
            typing={{ [agent]: chat.isSending }}
            onSelect={selectAgent}
          />
        </aside>

        <section
          key={inConversation ? agent : 'list'}
          aria-label={`Conversación con ${AGENTS[agent].name}`}
          className={cn('min-h-0 min-w-0 flex-1 flex-col', inConversation ? 'flex' : 'hidden lg:flex', !isDesktop && inConversation && 'animate-slide-in-right')}
        >
          <ChatHeader
            avatar={agent}
            typing={chat.isSending}
            onBack={backToList}
            onNewChat={onNewChat}
            onOpenHistory={() => setHistoryOpen(true)}
            disabled={chat.isSending}
            atLimit={chat.atLimit}
            totalCount={chat.conversations.length}
            maxCount={5}
          />

          <div className="chat-wallpaper flex min-h-0 flex-1 flex-col">
            {loading ? (
              <div className="flex-1 overflow-hidden"><ChatSkeleton messageCount={4} /></div>
            ) : isEmpty ? (
              <div className="flex flex-1 flex-col justify-end gap-2 px-3 pb-3 lg:px-6">
                {notice}
                <MessageBubble isUser={false} first fresh text={AGENTS[agent].greeting} />
              </div>
            ) : (
              <MessageList
                agent={agent}
                scopeKey={`${agent}:${chat.activeConvoId}`}
                messages={chat.messages}
                isTyping={chat.isSending}
                handoff={chat.handoff}
                onHandoff={onHandoff}
                onRetry={chat.retryMessage}
                header={notice}
              />
            )}

            {userCount < 3 && !chat.isLoading && (
              <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1 [scrollbar-width:none] lg:px-6" aria-label="Sugerencias">
                {AGENTS[agent].suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={chat.isSending}
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-bubble transition-[color,background-color,transform] duration-fast hover:bg-primary-soft hover:text-primary active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 lg:px-6 lg:pb-3">
              <AIInput
                variant="chat"
                id="chat-input"
                placeholder="Mensaje"
                value={drafts[agent]}
                onValueChange={setDraft}
                onSubmit={onSubmit}
                minHeight={44}
                maxHeight={140}
              />
            </div>
          </div>
        </section>

        <ChatHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          avatar={agent}
          conversations={chat.conversations}
          activeConvoId={chat.activeConvoId}
          totalCount={chat.conversations.length}
          maxCount={5}
          onSelectConversation={chat.selectConversation}
          onNewChat={chat.startNewChat}
          onDeleteConversation={chat.deleteConversation}
        />

        <AlertDialog open={confirmNew} onOpenChange={setConfirmNew}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Empezar un chat nuevo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta charla con {AGENTS[agent].name} queda guardada en el historial.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={chat.startNewChat}>Nuevo chat</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Chat;

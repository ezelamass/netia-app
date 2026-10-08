import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { useChat } from '@/hooks/useChat';
import { AGENTS, AVATAR_IDS, type AvatarId } from '@/lib/avatars';
import { AgentSwitcher } from '@/components/play/AgentSwitcher';
import { AgentAvatar } from '@/components/play/AgentAvatar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatHistoryDrawer } from '@/components/chat/ChatHistoryDrawer';
import { MessageList } from '@/components/chat/MessageList';
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';
import { AIInput } from '@/components/ui/ai-input';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LAST_AGENT_KEY = 'netia_chat_last_agent';
const PANEL_ID = 'chat-panel';

const parseAgent = (v: string | null): AvatarId | null => {
  const up = v?.toUpperCase();
  return AVATAR_IDS.find((a) => a === up) ?? null;
};

const readLastAgent = (): AvatarId | null => {
  try { return parseAgent(localStorage.getItem(LAST_AGENT_KEY)); } catch { return null; }
};

const TINT: Record<AvatarId, string> = {
  TINO: 'bg-tino/[0.03]',
  ZAHIA: 'bg-zahia/[0.03]',
  ROMA: 'bg-roma/[0.03]',
};

const Chat = () => {
  const [params, setParams] = useSearchParams();
  const [fallback] = useState<AvatarId>(() => readLastAgent() ?? 'TINO');
  const agent = parseAgent(params.get('agente')) ?? fallback;

  const chat = useChat(agent);
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<AvatarId, string>>({ TINO: '', ZAHIA: '', ROMA: '' });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  // ?agente= manda; si falta, se completa con el último usado (o TINO).
  // ?q= precarga el input (sin enviar) y se limpia de la URL.
  useEffect(() => {
    const q = params.get('q');
    if (q) setDrafts((d) => ({ ...d, [agent]: q }));
    if (!params.get('agente') || q) {
      setParams((p) => {
        p.set('agente', agent);
        p.delete('q');
        return p;
      }, { replace: true });
    }
    // Solo al montar: después, los cambios de agente pasan por selectAgent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAgent = useCallback((next: AvatarId) => {
    try { localStorage.setItem(LAST_AGENT_KEY, next); } catch { /* sin storage */ }
    setParams((p) => { p.set('agente', next); return p; }, { replace: true });
  }, [setParams]);

  const setDraft = useCallback((v: string) => setDrafts((d) => ({ ...d, [agent]: v })), [agent]);

  const userCount = chat.messages.filter((m) => m.sender === 'user').length;
  const isEmpty = chat.messages.length === 0;

  const onSubmit = (text: string) => {
    if (chat.isSending) return false;
    if (!chat.activeConvoId && chat.atLimit) {
      toast({ title: 'Límite alcanzado', description: 'Eliminá una conversación para crear una nueva.' });
      return false;
    }
    chat.clearHandoff(agent);
    void chat.sendMessage(text);
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

  return (
    <AppLayout>
      <div
        data-page-ready={chat.isLoading ? undefined : ''}
        className="mx-auto flex h-[calc(100dvh-3.5rem-var(--banner-h,0px)-1.25rem-6rem)] max-w-3xl flex-col gap-2 lg:h-[calc(100dvh-3.5rem-var(--banner-h,0px)-1.25rem-2rem)]"
      >
        <AgentSwitcher value={agent} onChange={selectAgent} unread={chat.unread} panelId={PANEL_ID} className="mx-auto w-full lg:max-w-[480px]" />

        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={`agent-tab-${agent}`}
          className={cn('flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface-raised shadow-card', TINT[agent])}
        >
          <ChatHeader
            avatar={agent}
            onNewChat={onNewChat}
            onOpenHistory={() => setHistoryOpen(true)}
            disabled={chat.isSending}
            atLimit={chat.atLimit}
            totalCount={chat.conversations.length}
            maxCount={5}
          />

          {chat.isLoading || chat.isLoadingMessages ? (
            <div className="flex-1 overflow-hidden"><ChatSkeleton messageCount={4} /></div>
          ) : isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <AgentAvatar agent={agent} size={96} ring />
              <h1 className="font-heading text-xl font-bold md:text-2xl">¡Hola! Soy {AGENTS[agent].name}</h1>
              <p className="max-w-sm text-sm text-muted-foreground">{AGENTS[agent].description}</p>
            </div>
          ) : (
            <MessageList
              agent={agent}
              scopeKey={`${agent}:${chat.activeConvoId}`}
              messages={chat.messages}
              isTyping={chat.isSending}
              handoff={chat.handoff}
              onHandoff={onHandoff}
            />
          )}

          {userCount < 3 && !chat.isLoading && (
            <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1 [scrollbar-width:none]" aria-label="Sugerencias">
              {AGENTS[agent].suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={chat.isSending}
                  onClick={() => { chat.clearHandoff(agent); void chat.sendMessage(s); }}
                  className="shrink-0 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium transition-colors duration-150 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border/60 bg-card/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] lg:pb-2.5">
            <AIInput
              id="chat-input"
              placeholder={`Escribile a ${AGENTS[agent].name}…`}
              value={drafts[agent]}
              onValueChange={setDraft}
              onSubmit={onSubmit}
              minHeight={44}
              maxHeight={140}
            />
          </div>
        </div>

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

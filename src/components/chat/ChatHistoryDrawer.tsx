import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { AvatarId } from '@/lib/avatars';

export interface ConversationMeta {
  id: string;
  avatar: AvatarId;
  title: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

interface ChatHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatar: AvatarId;
  conversations: ConversationMeta[];
  activeConvoId: string | null;
  totalCount: number;
  maxCount: number;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export const ChatHistoryDrawer = ({
  open, onOpenChange, avatar, conversations, activeConvoId,
  totalCount, maxCount, onSelectConversation, onNewChat, onDeleteConversation,
}: ChatHistoryDrawerProps) => {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const atLimit = totalCount >= maxCount;
  const avatarConvos = conversations
    .filter(c => c.avatar === avatar)
    .sort((a, b) => new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime());

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col gap-0">
          <SheetHeader className="px-4 pt-5 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Historial · {avatar}
              </SheetTitle>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                atLimit ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
              )}>
                {totalCount}/{maxCount}
              </span>
            </div>
          </SheetHeader>

          <div className="px-3 py-2.5 border-b border-border/40">
            <Button
              variant={atLimit ? 'ghost' : 'outline'}
              size="sm"
              className="w-full gap-2 text-xs h-8"
              disabled={atLimit}
              onClick={() => { onNewChat(); onOpenChange(false); }}
            >
              <Plus className="h-3.5 w-3.5" />
              {atLimit ? 'Eliminá un chat para crear uno nuevo' : 'Nuevo chat'}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {avatarConvos.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Sin chats guardados para {avatar}</p>
            ) : (
              avatarConvos.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => { onSelectConversation(convo.id); onOpenChange(false); }}
                  className={cn(
                    "w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors group",
                    convo.id === activeConvoId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-snug">
                      {convo.title ?? `Chat con ${convo.avatar}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {convo.lastMessageAt
                        ? formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true, locale: es })
                        : formatDistanceToNow(new Date(convo.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setDeleteTarget(convo.id); }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/15 hover:text-destructive text-muted-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este chat?</AlertDialogTitle>
            <AlertDialogDescription>Se borrarán todos los mensajes. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) { onDeleteConversation(deleteTarget); } setDeleteTarget(null); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

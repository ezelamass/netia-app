import { TrainingSession } from '@/types/training';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSessionTypeLabel, SESSION_TYPE_COLORS } from '@/types/training';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SessionsTableProps {
  sessions: TrainingSession[];
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay sesiones registradas esta semana.
      </div>
    );
  }

  // Sort by date descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Fecha</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Duración</TableHead>
            <TableHead className="text-center">RPE</TableHead>
            <TableHead className="text-center">Asist.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">
                {format(new Date(session.date), 'dd/MM', { locale: es })}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{session.groupName}</p>
                  <p className="text-xs text-muted-foreground">{session.sport}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary"
                  className={cn(
                    'text-white',
                    SESSION_TYPE_COLORS[session.type] ?? 'bg-gray-500'
                  )}
                >
                  {getSessionTypeLabel(session.type)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{session.duration} min</TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  'font-medium',
                  session.rpeGroup >= 8 && 'text-red-600 dark:text-red-400',
                  session.rpeGroup >= 6 && session.rpeGroup < 8 && 'text-yellow-600 dark:text-yellow-400',
                  session.rpeGroup < 6 && 'text-emerald-600 dark:text-emerald-400'
                )}>
                  {session.rpeGroup.toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn(
                  (session.attendance.present.length / session.attendance.total) < 0.8 && 'text-yellow-600 dark:text-yellow-400'
                )}>
                  {session.attendance.present.length}/{session.attendance.total}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

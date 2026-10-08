import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import { AXIS_CONFIG, type DiagnosticTest } from '@/types/diagnostic';
import { motion } from 'framer-motion';

interface TestCardProps {
  test: DiagnosticTest;
  lastCompletedAt?: string | null;
  onStart: (test: DiagnosticTest) => void;
}

export function TestCard({ test, lastCompletedAt, onStart }: TestCardProps) {
  const config = AXIS_CONFIG[test.axis];
  const isCompleted = !!lastCompletedAt;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.icon}</span>
              <Badge variant="secondary" className="text-xs font-semibold">
                {config.label}
              </Badge>
            </div>
            {isCompleted && (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            )}
          </div>

          <h3 className="font-bold text-foreground mb-1">{test.title}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{test.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {test.estimated_minutes} min
              </span>
              <span>{test.question_count} preguntas</span>
            </div>
            <Button size="sm" onClick={() => onStart(test)} className="gap-1.5">
              <PlayCircle className="w-4 h-4" />
              {isCompleted ? 'Repetir' : 'Iniciar'}
            </Button>
          </div>

          {lastCompletedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Último: {new Date(lastCompletedAt).toLocaleDateString('es-AR')}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

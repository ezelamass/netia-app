import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLatestDiagnosticScores } from '@/hooks/useDiagnostic';
import { DiagnosticAxis as DiagAxisType } from '@/hooks/useTrainingPlan';

interface DiagnosticRadarProps {
  diagnostic: DiagAxisType[];
}

const AXES = ['Físico', 'Técnico', 'Táctico', 'Mental'];
const AXIS_MAP: Record<string, string> = {
  'Físico': 'físico',
  'Técnico': 'técnico',
  'Táctico': 'táctico',
  'Mental': 'mental',
};

export function DiagnosticRadar({ diagnostic }: DiagnosticRadarProps) {
  const navigate = useNavigate();
  const latestScores = useLatestDiagnosticScores();

  // Merge: prefer real scores, fallback to mock
  const data = diagnostic.map(d => {
    const realEntry = latestScores[AXIS_MAP[d.axis]];
    return {
      subject: d.axis,
      score: realEntry ? Number(realEntry.score) : d.score,
      fullMark: d.maxScore,
      detail: realEntry?.detail ?? d.detail,
    };
  });

  const hasRealData = Object.keys(latestScores).length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="h-full border-none shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Diagnóstico Actual
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/diagnostic')}
            >
              {hasRealData ? 'Actualizar' : 'Realizar Test'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                  onClick={(e: any) => {
                    const axis = AXIS_MAP[e.value];
                    if (axis) navigate(`/diagnostic?axis=${axis}`);
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                  tickCount={6}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.map(d => (
              <div key={d.subject} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{d.subject}</span>
                  <span className="font-bold text-primary">{d.score}</span>
                </div>
                <p className="text-muted-foreground leading-tight text-xs mt-0.5">{d.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

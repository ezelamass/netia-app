import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend } from 'recharts';
import { CategoryType, CATEGORY_LABELS } from '@/types/training';

interface LoadByCategoryData {
  category: CategoryType;
  minutes: number;
  rpe: number;
  load: number;
  sessions: number;
}

interface LoadBarChartProps {
  data: LoadByCategoryData[];
}

export function LoadBarChart({ data }: LoadBarChartProps) {
  const chartData = data.map(d => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    minutos: d.minutes,
    rpe: d.rpe,
    sesiones: d.sessions,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Carga Semanal por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'Minutos', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 10]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'RPE', angle: 90, position: 'insideRight', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="minutos" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Minutos"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="rpe" 
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
                name="RPE Promedio"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

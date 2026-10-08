import { cn } from '@/lib/utils';

const LIKERT_OPTIONS = [
  { value: 1, label: 'Muy bajo', emoji: '😟' },
  { value: 2, label: 'Bajo', emoji: '😕' },
  { value: 3, label: 'Regular', emoji: '😐' },
  { value: 4, label: 'Bueno', emoji: '🙂' },
  { value: 5, label: 'Excelente', emoji: '🤩' },
];

interface LikertQuestionProps {
  value: number | null;
  onChange: (value: number) => void;
}

export function LikertQuestion({ value, onChange }: LikertQuestionProps) {
  return (
    <div className="flex justify-center gap-3 py-4">
      {LIKERT_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[60px]',
            value === opt.value
              ? 'border-primary bg-primary/10 scale-110 shadow-md'
              : 'border-border hover:border-primary/50 hover:bg-accent'
          )}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className="text-xs font-medium text-muted-foreground">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

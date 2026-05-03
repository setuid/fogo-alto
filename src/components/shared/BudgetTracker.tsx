import { cn } from '@/lib/utils';
import { formatGrams } from '@/lib/utils';

interface Props {
  label: string;
  targetGrams: number;
  selectedGrams: number;
  className?: string;
}

export function BudgetTracker({ label, targetGrams, selectedGrams, className }: Props) {
  const ratio = targetGrams > 0 ? selectedGrams / targetGrams : 0;
  const percent = Math.min(100, ratio * 100);

  // Faixas: <70% = vermelho (faltando), 70-110% = verde (no ponto), >110% = âmbar (excesso).
  let barClass = 'bg-tomato/40';
  let textClass = 'text-tomato-deep';
  let status: string;
  const remaining = targetGrams - selectedGrams;

  if (ratio === 0) {
    status = `Meta ${formatGrams(targetGrams)}`;
  } else if (ratio < 0.7) {
    status = `Faltam ${formatGrams(remaining)}`;
    barClass = 'bg-tomato';
  } else if (ratio <= 1.1) {
    status = ratio < 1
      ? `Faltam ${formatGrams(remaining)}`
      : 'No ponto';
    barClass = 'bg-olive';
    textClass = 'text-olive-deep';
  } else {
    status = `${formatGrams(-remaining)} a mais`;
    barClass = 'bg-ember';
    textClass = 'text-ember';
  }

  return (
    <div className={cn('rounded-xl border border-ink/10 bg-cream-paper p-3', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-stamp text-tomato-deep">{label}</p>
          <p className="font-display text-lg leading-tight">
            {formatGrams(selectedGrams)}
            <span className="text-ink/45"> de {formatGrams(targetGrams)}</span>
          </p>
        </div>
        <span className={cn('text-xs font-medium', textClass)}>{status}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
        <div
          className={cn('h-full transition-all', barClass)}
          style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
        />
      </div>
    </div>
  );
}

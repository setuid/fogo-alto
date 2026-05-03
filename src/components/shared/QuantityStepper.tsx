import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

// Stepper compacto: [-] N [+] usado pra contar peças/porções.
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  className,
  ariaLabel,
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-ink/15 bg-cream-paper p-0.5',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/8 disabled:opacity-30"
        aria-label="diminuir"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-tomato text-white transition-colors hover:bg-tomato-deep disabled:opacity-40"
        aria-label="aumentar"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

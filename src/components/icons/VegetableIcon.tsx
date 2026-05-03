// Mesma estratégia do CutIcon: emojis Unicode em vez de SVGs feitos a mão.

import { cn } from '@/lib/utils';

const VEG_EMOJI: Record<string, string> = {
  cenoura: '🥕',
  palmito_pupunha: '🌿',
  batata: '🥔',
  cebola: '🧅',
  tomate: '🍅',
  pimentao_vermelho: '🌶️',
  pimentao_amarelo: '🫑',
  pimentao_verde: '🫑',
  aspargos: '🌱',
  abobrinha: '🥒',
  berinjela: '🍆',
  cogumelo: '🍄',
};

interface Props {
  vegetableId: string;
  className?: string;
}

export function VegetableIcon({ vegetableId, className }: Props) {
  const emoji = VEG_EMOJI[vegetableId] ?? '🥗';
  return (
    <span
      role="img"
      aria-label={vegetableId}
      className={cn('inline-flex items-center justify-center text-2xl leading-none', className)}
    >
      {emoji}
    </span>
  );
}

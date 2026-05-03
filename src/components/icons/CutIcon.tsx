// Os SVGs anteriores ficaram visualmente fracos. Trocamos por emojis
// Unicode — o SO renderiza com qualidade muito superior e cobertura
// universal. Mantemos o componente CutIcon pra os call sites não
// precisarem mudar.

import { cn } from '@/lib/utils';

const CUT_EMOJI: Record<string, string> = {
  // Bovinos
  picanha: '🥩',
  fraldinha: '🥩',
  maminha: '🥩',
  alcatra: '🥩',
  contrafile: '🥩',
  costela_bovina: '🍖',
  cupim: '🥩',
  file_mignon: '🥩',
  ribeye: '🥩',
  bife_ancho: '🥩',
  ny_strip: '🥩',
  t_bone: '🍖',
  tomahawk: '🍖',
  asado_de_tira: '🍖',
  vacio: '🥩',
  entranha: '🥩',
  matambre: '🥩',

  // Suínos
  costela_suina: '🍖',
  pancetta: '🥓',
  bisteca_suina: '🍖',

  // Embutidos
  linguica: '🌭',
  salsichao: '🌭',

  // Aves
  asinha_frango: '🍗',
  coracao_frango: '❤️',
  sobrecoxa_frango: '🍗',

  // Peixes
  salmao: '🐟',

  // Vegetais & extras
  queijo_coalho: '🧀',
  pao_alho: '🍞',
  abacaxi: '🍍',
};

interface Props {
  cutId: string;
  className?: string;
}

export function CutIcon({ cutId, className }: Props) {
  const emoji = CUT_EMOJI[cutId] ?? '🥩';
  return (
    <span
      role="img"
      aria-label={cutId}
      className={cn('inline-flex items-center justify-center text-2xl leading-none', className)}
    >
      {emoji}
    </span>
  );
}

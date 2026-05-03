import type { DrinkCalculation } from '@/lib/calculator';

const PRETTY_LABELS: Record<string, string> = {
  cerveja: 'Cerveja',
  vinho_tinto: 'Vinho tinto',
  caipirinha: 'Caipirinha',
  refrigerante: 'Refrigerante',
  suco: 'Suco',
  agua: 'Água',
};

function formatBottleSize(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000;
    const formatted = liters % 1 === 0 ? String(liters) : liters.toFixed(1).replace('.', ',');
    return `${formatted} L`;
  }
  return `${ml} ml`;
}

export function DrinkRow({ drink }: { drink: DrinkCalculation }) {
  const name = PRETTY_LABELS[drink.type] ?? drink.type;

  // Linha principal: "X garrafa(s)" / "X long necks" — já vem pluralizado
  // do engine, sem sufixo solto.
  const primary =
    drink.bottles && drink.bottle_label_pt
      ? `${drink.bottles} ${drink.bottle_label_pt}`
      : drink.unit === 'unidade'
        ? `${drink.total_ml_or_units}`
        : null;

  // Subtítulo: pra caipirinha mostra a estimativa de doses; pros outros,
  // o tamanho de cada garrafa pra deixar claro o que comprar.
  let secondary: string | null = null;
  if (drink.serving_count && drink.serving_label_pt) {
    secondary = `≈ ${drink.serving_count} ${drink.serving_label_pt}`;
  } else if (drink.bottle_size_ml) {
    secondary =
      drink.bottles && drink.bottles > 1
        ? `de ${formatBottleSize(drink.bottle_size_ml)} cada`
        : `de ${formatBottleSize(drink.bottle_size_ml)}`;
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <p className="font-medium">{name}</p>
      <div className="text-right">
        {primary && <p className="font-medium tabular-nums">{primary}</p>}
        {secondary && <p className="text-xs text-ink/55 tabular-nums">{secondary}</p>}
      </div>
    </div>
  );
}

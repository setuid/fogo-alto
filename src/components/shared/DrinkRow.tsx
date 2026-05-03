import type { DrinkCalculation } from '@/lib/calculator';

const PRETTY_LABELS: Record<string, string> = {
  cerveja: 'Cerveja',
  vinho_tinto: 'Vinho tinto',
  caipirinha: 'Caipirinha',
  refrigerante: 'Refrigerante',
  suco: 'Suco',
  agua: 'Água',
};

export function DrinkRow({ drink }: { drink: DrinkCalculation }) {
  const name = PRETTY_LABELS[drink.type] ?? drink.type;
  const liters = drink.unit === 'ml' ? (drink.total_ml_or_units / 1000).toFixed(1) : null;

  const detail =
    drink.bottles !== undefined && drink.bottle_label_pt
      ? `${drink.bottles} ${drink.bottle_label_pt}${drink.bottles > 1 ? 's' : ''}`
      : null;

  const servingDetail =
    drink.serving_count && drink.serving_label_pt
      ? `≈ ${drink.serving_count} ${drink.serving_label_pt}`
      : null;

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-medium">{name}</p>
        {servingDetail && <p className="text-xs text-ink/55">{servingDetail}</p>}
      </div>
      <div className="text-right">
        {detail && <p className="font-medium tabular-nums">{detail}</p>}
        {liters && <p className="text-xs text-ink/55 tabular-nums">{liters} L</p>}
        {!liters && drink.unit === 'unidade' && (
          <p className="font-medium tabular-nums">{drink.total_ml_or_units}</p>
        )}
      </div>
    </div>
  );
}

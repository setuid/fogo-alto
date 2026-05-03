import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import type { Recipe } from '@/data/recipes';

interface Props {
  recipe: Recipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultServings?: number;
}

export function RecipeModal({ recipe, open, onOpenChange, defaultServings }: Props) {
  const { i18n } = useTranslation();
  const isPt = (i18n.resolvedLanguage ?? 'pt-BR') === 'pt-BR';
  const [servings, setServings] = useState(defaultServings ?? recipe.yields_servings);

  const factor = servings / recipe.yields_servings;
  const ingredients = isPt ? recipe.ingredients_pt : recipe.ingredients_en;
  const steps = isPt ? recipe.steps_pt : recipe.steps_en;
  const tips = isPt ? recipe.tips_pt : recipe.tips_en;
  const name = isPt ? recipe.name_pt : recipe.name_en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <p className="text-xs text-ink/60">
            {isPt ? `Preparo: ${recipe.prep_minutes} min` : `Prep: ${recipe.prep_minutes} min`}
          </p>
        </DialogHeader>

        <div>
          <p className="text-sm text-ink/70">
            {isPt ? `Para ${servings} pessoas` : `For ${servings} people`}
          </p>
          <Slider
            value={[servings]}
            onValueChange={([n]) => setServings(Math.max(1, n))}
            min={1}
            max={50}
            step={1}
            className="mt-3"
          />
        </div>

        <Separator />

        <div>
          <h4 className="text-stamp text-tomato-deep">{isPt ? 'Ingredientes' : 'Ingredients'}</h4>
          <ul className="mt-2 space-y-1 text-sm">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{ing.name}</span>
                <span className="text-ink/60">{scaleQuantity(ing.quantity, factor)}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div>
          <h4 className="text-stamp text-tomato-deep">{isPt ? 'Modo de preparo' : 'Steps'}</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {tips && tips.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-stamp text-tomato-deep">{isPt ? 'Dicas' : 'Tips'}</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/70">
                {tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Tenta escalar quantidades numéricas mantendo unidades. Mantém literal se não casar.
function scaleQuantity(quantity: string, factor: number): string {
  const match = quantity.match(/^([\d.,/]+)\s*(.*)$/);
  if (!match) return quantity;
  const rawNum = match[1].replace(',', '.');
  const num = rawNum.includes('/')
    ? evalFraction(rawNum)
    : Number.parseFloat(rawNum);
  if (!Number.isFinite(num)) return quantity;
  const scaled = num * factor;
  const formatted = scaled >= 10 ? Math.round(scaled).toString() : scaled.toFixed(1).replace('.0', '');
  return `${formatted} ${match[2]}`.trim();
}

function evalFraction(s: string): number {
  const [a, b] = s.split('/').map(Number);
  if (!b) return Number.NaN;
  return a / b;
}

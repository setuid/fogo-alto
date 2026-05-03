import { useState } from 'react';
import { Beef, Bird } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { findCutById } from '@/data/catalog';

// Cada região é um path SVG clicável, ligado a um cut_id do catálogo.
interface Region {
  cut_id: string;
  path: string;
  label_x: number;
  label_y: number;
  short_label: string;
}

interface DiagramSpec {
  id: 'boi' | 'porco' | 'frango';
  label_pt: string;
  label_en: string;
  // Silhueta como path SVG (preenchimento de fundo).
  silhouette: string;
  viewBox: string;
  regions: Region[];
}

// Coordenadas em viewBox 400x240 (boi/porco) ou 320x240 (frango).
// Não são anatômicas perfeitas — são esquemáticas para ensinar a posição.

const BOI: DiagramSpec = {
  id: 'boi',
  label_pt: 'Boi',
  label_en: 'Cattle',
  viewBox: '0 0 400 240',
  // Silhueta: corpo retangular com cabeça à esquerda, 4 pernas, rabo.
  silhouette:
    'M70 90 Q70 70 110 65 L130 50 L165 55 Q175 65 175 80 L325 75 Q360 75 365 100 L365 155 L350 155 L345 200 L320 200 L320 165 L260 165 L260 200 L235 200 L235 165 L175 165 L175 200 L150 200 L150 165 L120 165 L120 200 L95 200 L95 160 Q75 155 70 130 Z M365 110 L385 105 L390 100 L385 115 Z',
  regions: [
    {
      cut_id: 'cupim',
      path: 'M180 60 Q210 45 240 60 Q220 75 200 75 Q185 70 180 60 Z',
      label_x: 210,
      label_y: 56,
      short_label: 'cupim',
    },
    {
      cut_id: 'costela_bovina',
      path: 'M120 110 L120 160 L200 160 L200 110 Z',
      label_x: 160,
      label_y: 138,
      short_label: 'costela',
    },
    {
      cut_id: 'asado_de_tira',
      path: 'M200 100 L200 160 L260 160 L260 100 Z',
      label_x: 230,
      label_y: 132,
      short_label: 'asado',
    },
    {
      cut_id: 'file_mignon',
      path: 'M200 75 L260 75 L255 100 L200 100 Z',
      label_x: 230,
      label_y: 90,
      short_label: 'filé',
    },
    {
      cut_id: 'contrafile',
      path: 'M260 75 L320 75 L320 100 L260 100 Z',
      label_x: 290,
      label_y: 90,
      short_label: 'contrafilé',
    },
    {
      cut_id: 'picanha',
      path: 'M320 75 L355 80 L355 100 L320 100 Z',
      label_x: 338,
      label_y: 90,
      short_label: 'picanha',
    },
    {
      cut_id: 'maminha',
      path: 'M320 100 L355 100 L355 125 L320 125 Z',
      label_x: 338,
      label_y: 115,
      short_label: 'maminha',
    },
    {
      cut_id: 'alcatra',
      path: 'M295 100 L320 100 L320 145 L295 145 Z',
      label_x: 308,
      label_y: 125,
      short_label: 'alcatra',
    },
    {
      cut_id: 'fraldinha',
      path: 'M260 145 L320 145 L320 165 L260 165 Z',
      label_x: 290,
      label_y: 158,
      short_label: 'fraldinha',
    },
    {
      cut_id: 'vacio',
      path: 'M200 160 L260 160 L260 175 L200 175 Z',
      label_x: 230,
      label_y: 170,
      short_label: 'vacio',
    },
    {
      cut_id: 'entranha',
      path: 'M120 160 L200 160 L200 175 L120 175 Z',
      label_x: 160,
      label_y: 170,
      short_label: 'entranha',
    },
    {
      cut_id: 'matambre',
      path: 'M120 100 L120 130 L80 130 L80 100 Z',
      label_x: 100,
      label_y: 117,
      short_label: 'matambre',
    },
  ],
};

const PORCO: DiagramSpec = {
  id: 'porco',
  label_pt: 'Porco',
  label_en: 'Pig',
  viewBox: '0 0 400 240',
  silhouette:
    'M65 100 Q65 75 100 70 L120 60 L155 60 Q170 70 170 90 L320 90 Q355 90 360 115 L360 160 L345 160 L340 195 L315 195 L315 170 L255 170 L255 195 L230 195 L230 170 L170 170 L170 195 L145 195 L145 170 L115 170 L115 195 L90 195 L90 162 Q70 158 65 130 Z M70 95 L80 92 L80 100 Z',
  regions: [
    {
      cut_id: 'pancetta',
      path: 'M120 130 L240 130 L240 165 L120 165 Z',
      label_x: 180,
      label_y: 150,
      short_label: 'pancetta',
    },
    {
      cut_id: 'costela_suina',
      path: 'M170 100 L260 100 L260 130 L170 130 Z',
      label_x: 215,
      label_y: 117,
      short_label: 'costela',
    },
    {
      cut_id: 'bisteca_suina',
      path: 'M260 90 L355 90 L355 130 L260 130 Z',
      label_x: 305,
      label_y: 112,
      short_label: 'bisteca',
    },
  ],
};

const FRANGO: DiagramSpec = {
  id: 'frango',
  label_pt: 'Frango',
  label_en: 'Chicken',
  viewBox: '0 0 320 240',
  silhouette:
    'M60 130 Q55 90 100 70 L130 65 Q150 50 165 60 L165 75 Q170 85 165 95 Q200 95 230 120 Q260 145 250 180 Q230 210 175 210 Q120 210 90 195 Q60 175 60 130 Z M60 130 L40 145 L45 165 L60 155 Z',
  regions: [
    {
      cut_id: 'asinha_frango',
      path: 'M65 110 L120 110 L120 140 L65 140 Z',
      label_x: 92,
      label_y: 127,
      short_label: 'asas',
    },
    {
      cut_id: 'sobrecoxa_frango',
      path: 'M170 145 L240 145 L240 200 L170 200 Z',
      label_x: 205,
      label_y: 175,
      short_label: 'coxa',
    },
    {
      cut_id: 'coracao_frango',
      path: 'M130 130 L165 130 L165 160 L130 160 Z',
      label_x: 148,
      label_y: 147,
      short_label: 'coração',
    },
  ],
};

const DIAGRAMS: DiagramSpec[] = [BOI, PORCO, FRANGO];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cutQuantities: Record<string, number>;
  onAddCut: (cutId: string) => void;
}

export function AnimalDiagram({ open, onOpenChange, cutQuantities, onAddCut }: Props) {
  const [tab, setTab] = useState<DiagramSpec['id']>('boi');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolher pelo animal</DialogTitle>
          <p className="text-xs text-ink/60">
            Toque em uma região do animal pra adicionar uma peça do corte correspondente.
          </p>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as DiagramSpec['id'])}>
          <TabsList className="w-full">
            {DIAGRAMS.map((d) => (
              <TabsTrigger key={d.id} value={d.id} className="flex-1 gap-2">
                {d.id === 'frango' ? (
                  <Bird className="h-4 w-4" />
                ) : (
                  <Beef className="h-4 w-4" />
                )}
                {d.label_pt}
              </TabsTrigger>
            ))}
          </TabsList>
          {DIAGRAMS.map((d) => (
            <TabsContent key={d.id} value={d.id}>
              <Diagram spec={d} cutQuantities={cutQuantities} onAddCut={onAddCut} />
            </TabsContent>
          ))}
        </Tabs>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Diagram({
  spec,
  cutQuantities,
  onAddCut,
}: {
  spec: DiagramSpec;
  cutQuantities: Record<string, number>;
  onAddCut: (cutId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-cream-paper p-2">
        <svg
          viewBox={spec.viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          aria-label={`Diagrama de ${spec.label_pt}`}
        >
          {/* Silhueta de fundo */}
          <path d={spec.silhouette} fill="rgba(255,244,224,0.6)" stroke="#3D2817" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Regiões clicáveis */}
          {spec.regions.map((r) => {
            const count = cutQuantities[r.cut_id] ?? 0;
            const cut = findCutById(r.cut_id);
            return (
              <g key={r.cut_id} className="cursor-pointer">
                <path
                  d={r.path}
                  fill={count > 0 ? 'rgba(241,90,34,0.45)' : 'rgba(241,90,34,0.12)'}
                  stroke="#C43217"
                  strokeWidth="1"
                  onClick={() => onAddCut(r.cut_id)}
                  className="transition-colors hover:fill-[rgba(241,90,34,0.32)]"
                >
                  <title>{cut ? cut.name_pt : r.cut_id}</title>
                </path>
                <text
                  x={r.label_x}
                  y={r.label_y}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#3D2817"
                  pointerEvents="none"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {r.short_label}
                  {count > 0 && (
                    <tspan dx="3" fontSize="8" fill="#C43217">
                      ×{count}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {spec.regions.map((r) => {
          const cut = findCutById(r.cut_id);
          if (!cut) return null;
          const count = cutQuantities[r.cut_id] ?? 0;
          return (
            <button
              key={r.cut_id}
              type="button"
              onClick={() => onAddCut(r.cut_id)}
              className={`flex items-center justify-between rounded-xl border p-2 text-sm transition-colors ${
                count > 0
                  ? 'border-tomato bg-tomato/5'
                  : 'border-ink/10 bg-cream-paper hover:border-ink/20'
              }`}
            >
              <span className="font-medium text-ink">{cut.name_pt}</span>
              <span className="text-xs text-ink/55">
                {count > 0 ? `${count}× · ${(count * cut.typical_piece_kg).toFixed(1)} kg` : '+'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

# Fogo Alto — Especificação Técnica

> App de planejamento, cálculo e execução de churrascos com colaboração entre anfitrião e convidados.

-----

## 1. Visão Geral

**Fogo Alto** é um web app que cobre o ciclo completo de um churrasco:

1. **Planejar** — anfitrião cria o evento, define data, local, número de convidados e estilo (parrilla, churrasco tradicional, espeto corrido etc.)
1. **Calcular** — o app calcula automaticamente carnes, acompanhamentos e bebidas com base no número de convidados e perfil de consumo
1. **Compartilhar** — anfitrião gera link único (com token) e envia para os convidados
1. **Colaborar** — convidados confirmam presença, indicam o que vão trazer (carnes, bebidas, acompanhamentos)
1. **Executar** — no dia, anfitrião usa modo “cozinha” com timers avançados por corte, técnica e ponto

### Princípios de Design

- **“Domingo de tarde”** — luz dourada, brasa viva, sensação acolhedora e festiva (não dark/speakeasy como The Cellar)
- **Tipografia editorial** — Fraunces (serifa) para títulos + Sora (sans) para corpo, dando ar de revista gastronômica
- **Texturas orgânicas** — leve grão no fundo, gradientes quentes, sombras suaves cor de mel
- **Simplicidade primeiro** — sem features desnecessárias
- **Mobile-first** — anfitrião usa o app na churrasqueira, convidados no celular
- **Sem login complicado para convidados** — só link com token
- **Referência visual:** ver `fogo-alto-mockup.jsx` (mockup aprovado da tela de detalhe do churrasco)

-----

## 2. Stack Técnica

Seguindo o boilerplate pessoal (modo “full”):

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Roteamento:** React Router 6
- **Estado:** TanStack Query (server state) + Zustand (client state)
- **Backend:** Supabase (Postgres + Auth + Realtime)
- **Hospedagem:** GitHub Pages (frontend-only, SPA)
- **Roteamento em GitHub Pages:** usar `HashRouter` do React Router OU configurar `404.html` redirect (padrão SPA-on-Pages). Decidir na implementação — `HashRouter` é mais simples, links ficam tipo `/#/g/abc123`.

### Por que Supabase

- Anfitrião precisa de auth real (e-mail/senha ou magic link)
- Convidados acessam via link com token (RLS no Postgres permite acesso anônimo via token)
- Realtime: quando um convidado confirma presença ou indica o que vai trazer, o anfitrião vê atualização instantânea

### Limitações conhecidas do GitHub Pages

- **Sem SSR:** Open Graph nos links de convite fica estático (mostra metadata do app, não do churrasco específico). Aceitável — quando alguém clica, abre direto a página do convite e os detalhes carregam.
- **Sem Edge Functions próprias:** lógica server-side fica nas Edge Functions do Supabase (validação de token de convidado, envio de e-mails se houver).
- **Variáveis de ambiente:** apenas `VITE_*` públicas (Supabase URL e anon key). Service role key nunca vai pro cliente — operações privilegiadas via Edge Functions.

-----

## 3. Modelo de Dados

### Tabelas Supabase

```sql
-- Anfitriões (auth.users do Supabase, sem tabela extra inicialmente)

-- Eventos de churrasco
create table barbecues (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) not null,
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  style text not null check (style in ('tradicional', 'parrilla', 'espeto_corrido', 'americano', 'misto')),
  estimated_guests int not null,
  status text not null default 'planning' check (status in ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  include_sides boolean default true, -- arroz, feijão, farofa etc.
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Convidados
create table guests (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  name text not null,
  email text,
  rsvp_status text default 'pending' check (rsvp_status in ('pending', 'yes', 'no', 'maybe')),
  drinks_alcohol boolean default true,
  guest_token text unique not null default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz default now()
);

-- Itens do churrasco (carnes, bebidas, acompanhamentos)
create table items (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  category text not null check (category in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other')),
  name text not null,
  cut_id text, -- referência ao catálogo estático de cortes (ver seção 4)
  quantity_grams numeric, -- para carnes
  quantity_liters numeric, -- para bebidas
  quantity_units int, -- para itens contáveis
  is_calculated boolean default true, -- true = calculado pelo app, false = ajustado manualmente
  brought_by_guest_id uuid references guests(id), -- null se anfitrião está provendo
  notes text,
  created_at timestamptz default now()
);

-- Contribuições dos convidados (o que cada um vai trazer)
create table contributions (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  guest_id uuid references guests(id) on delete cascade not null,
  item_name text not null,
  category text not null check (category in ('meat', 'drink_alcoholic', 'drink_non_alcoholic', 'wine', 'side', 'other')),
  quantity_description text, -- "2 picanhas de 1.5kg cada", "6 cervejas long neck"
  notes text,
  created_at timestamptz default now()
);

-- Sessões de cozimento (modo execução)
create table cooking_sessions (
  id uuid primary key default gen_random_uuid(),
  barbecue_id uuid references barbecues(id) on delete cascade not null,
  item_id uuid references items(id) not null,
  technique text not null check (technique in ('grelha', 'parrilla', 'forno', 'defumador', 'brasa_direta', 'brasa_indireta')),
  doneness text not null check (doneness in ('mal_passado', 'ao_ponto_para_mal', 'ao_ponto', 'ao_ponto_para_bem', 'bem_passado')),
  thickness_cm numeric,
  started_at timestamptz,
  completed_at timestamptz,
  notes text
);
```

### RLS (Row Level Security)

```sql
-- Anfitrião só enxerga seus próprios churrascos
alter table barbecues enable row level security;
create policy "Hosts can manage their barbecues"
  on barbecues for all
  using (auth.uid() = host_id);

-- Acesso anônimo via share_token (leitura) e guest_token (RSVP/contribuição)
create policy "Anyone with share_token can view"
  on barbecues for select
  using (share_token = current_setting('request.jwt.claims', true)::json->>'share_token');

-- Aplicar lógica similar para guests, items, contributions
```

> **Nota:** RLS via token JWT customizado é complexo. Alternativa mais simples: usar Edge Functions do Supabase para todas as operações de convidado, validando o token na função. Decidir na implementação.

-----

## 4. Catálogo Estático de Cortes e Bebidas

Em `src/data/catalog.ts` — não vai ao banco, fica versionado no código.

### Cortes (exemplos — expandir lista completa)

```typescript
export interface MeatCut {
  id: string;
  name_pt: string;
  name_en: string;
  category: 'bovina' | 'suina' | 'aves' | 'embutidos' | 'peixes' | 'vegetais';
  default_grams_per_person: number; // estimativa base
  techniques: CookingTechnique[];
  cooking_times: CookingTimeMatrix; // ver abaixo
  tips_pt: string[];
  tips_en: string[];
}

export const MEAT_CUTS: MeatCut[] = [
  {
    id: 'picanha',
    name_pt: 'Picanha',
    name_en: 'Top Sirloin Cap',
    category: 'bovina',
    default_grams_per_person: 250,
    techniques: ['grelha', 'parrilla', 'brasa_direta'],
    cooking_times: {
      // chave: `${technique}_${doneness}_${thickness_cm}`
      'parrilla_ao_ponto_4': { minutes_per_side: 8, total_minutes: 16, rest_minutes: 5 },
      'parrilla_mal_passado_4': { minutes_per_side: 5, total_minutes: 10, rest_minutes: 5 },
      // ... matriz completa
    },
    tips_pt: [
      'Cortar contra as fibras na hora de servir',
      'Não furar a carne durante o preparo',
      'Sal grosso só antes de ir ao fogo'
    ],
    tips_en: [
      'Slice against the grain when serving',
      'Do not pierce the meat while cooking',
      'Coarse salt only just before grilling'
    ]
  },
  // costela, fraldinha, maminha, alcatra, contra-filé, file mignon,
  // linguiça, coração de frango, asinha, sobrecoxa, salsichão,
  // pão de alho, queijo coalho, abacaxi, legumes assados...
];
```

### Bebidas (catálogo de referência para cálculo)

```typescript
export interface DrinkDefinition {
  id: string;
  name_pt: string;
  name_en: string;
  category: 'cerveja' | 'vinho' | 'destilado' | 'soft' | 'agua';
  unit: 'ml' | 'unidade';
  // Consumo médio: por bebedor (alcoólicas) ou por pessoa (não alcoólicas)
  avg_consumption_per_drinker_per_hour?: number;
  avg_consumption_per_drinker?: number;
  avg_consumption_per_person?: number;
}

export const DRINK_CATALOG: Record<string, DrinkDefinition> = {
  cerveja: {
    id: 'cerveja',
    name_pt: 'Cerveja',
    name_en: 'Beer',
    category: 'cerveja',
    unit: 'ml',
    avg_consumption_per_drinker_per_hour: 500,
  },
  vinho_tinto: {
    id: 'vinho_tinto',
    name_pt: 'Vinho Tinto',
    name_en: 'Red Wine',
    category: 'vinho',
    unit: 'ml',
    avg_consumption_per_drinker: 250, // por evento
  },
  // caipirinha, refrigerante, agua, suco — mesma estrutura
};
```

-----

## 5. Engine de Cálculo

Módulo puro em `src/lib/calculator.ts`, sem dependência de React/Supabase. Testável isolado.

### Inputs

```typescript
interface CalculationInput {
  guests_count: number;
  drinkers_count: number;        // quantos vão beber álcool
  duration_hours: number;        // duração estimada do churrasco
  style: BarbecueStyle;
  include_sides: boolean;
  meat_preferences: {
    cut_ids: string[];           // cortes selecionados pelo anfitrião
    weight_profile: 'light' | 'normal' | 'heavy'; // ajusta gramas/pessoa
  };
  drink_preferences: {
    beer: boolean;
    wine: boolean;
    caipirinha: boolean;
    soft_drinks: boolean;
  };
}
```

### Outputs

```typescript
interface CalculationOutput {
  meats: { cut_id: string; total_grams: number; per_person_grams: number }[];
  drinks: { type: string; total_ml_or_units: number }[];
  sides: { name: string; total_grams: number }[];
}
```

> Custo estimado é calculado à parte, em `src/lib/cost-estimator.ts`, consumindo `CalculationOutput` + catálogo de preços (`src/data/prices.ts`). Ver seção 11.4.

### Regras Base (ajustáveis)

- **Carne total por pessoa:**
  - Light: 350g
  - Normal: 450g
  - Heavy: 600g
- **Bebida alcoólica:** consumo médio × duração × n_drinkers
- **Acompanhamentos:** 150g/pessoa de arroz, 100g/pessoa de feijão, 80g/pessoa de farofa, etc.
- **Estilo “parrilla”:** menos cortes, mais nobres, gramagem maior (priorizar bovinos)
- **Estilo “espeto corrido”:** mais variedade, gramagem distribuída entre 6-8 cortes
- **Estilo “tradicional”:** mix bovino + suíno + frango + linguiça + queijo coalho

-----

## 6. Telas e Fluxos

### 6.1. Anfitrião (autenticado)

#### `/` — Dashboard

Lista de churrascos: passados, em planejamento, próximo evento em destaque. Toggle de idioma no header (pt-BR/EN).

#### `/new` — Criar Churrasco (wizard em 4 passos)

1. **Origem (opcional):** “Começar do zero” ou “Duplicar churrasco anterior” (lista os últimos churrascos do anfitrião)
1. **Básico:** título, data, local, descrição
1. **Estilo e tamanho:** estilo (parrilla/tradicional/espeto/americano/misto), número de convidados estimado, perfil de consumo
1. **Preferências:** quais cortes incluir, bebidas (cerveja/vinho/caipirinha/refri), incluir acompanhamentos sim/não
1. **Revisão:** preview do cálculo, custo estimado, ajustes manuais, criar

#### `/barbecue/:id` — Painel do Churrasco

- Aba **Visão Geral**: data, local, status, link de compartilhamento (botão copiar), card de **custo estimado** (com toggle mostrar/esconder)
- Aba **Convidados**: lista com RSVP, adicionar manualmente, ver contribuições
- Aba **Lista**: itens calculados + contribuições dos convidados, ajustes manuais, link para receitas dos acompanhamentos
- Aba **Cozinha**: modo execução (ver 6.3)
- Botão secundário no menu: **Exportar lista de compras** (WhatsApp/PDF)

#### `/barbecue/:id/edit` — Editar

Permite ajustar qualquer campo. Recalcula automaticamente (incluindo custo).

### 6.2. Convidado (acesso via token)

#### `/g/:share_token` — Página do convidado

- Detalhes do evento (título, data, local, descrição)
- Formulário de RSVP: nome, e-mail (opcional), confirma/recusa/talvez
- Se confirmou: pergunta se vai beber álcool
- Seção “Quer trazer alguma coisa?”: formulário simples para indicar carnes/bebidas/outros
- Lista do que outros convidados já ofereceram trazer (transparência social)

> O `share_token` identifica o churrasco. Quando convidado preenche RSVP, gera-se um `guest_token` único persistido em `localStorage` para edições futuras.

### 6.3. Modo Cozinha (anfitrião, dia do evento)

#### `/barbecue/:id/cook`

- Layout otimizado para celular sujo de gordura (botões grandes, alto contraste)
- Lista de carnes a preparar
- Para cada carne: seleciona técnica, ponto, espessura → app sugere tempo
- Botão “Iniciar timer” — timer visual + alerta sonoro/vibração
- Pode rodar múltiplos timers em paralelo (ex.: linguiça e picanha ao mesmo tempo)
- Dicas do corte aparecem na tela (ex.: “vire só uma vez”, “deixe descansar 5min”)

-----

## 7. Componentes shadcn/ui Necessários

- `button`, `input`, `label`, `card`, `dialog`, `tabs`, `badge`, `select`, `checkbox`, `radio-group`, `slider`, `switch`, `toast`, `tooltip`, `separator`, `progress`, `sheet` (mobile drawer), `form` (react-hook-form + zod), `dropdown-menu` (toggle de idioma), `accordion` (lista de receitas)

-----

## 8. Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                    # shadcn components
│   ├── barbecue/              # cards, listas, painéis
│   ├── calculator/            # inputs e displays do calculador
│   ├── cooking/               # timers, lista de carnes em modo cozinha
│   ├── guest/                 # componentes da view do convidado
│   ├── recipes/               # modal e card de receitas
│   └── shared/                # LanguageToggle, CostDisplay, etc.
├── data/
│   ├── catalog.ts             # cortes e bebidas (com name_pt/name_en)
│   ├── cooking-times.ts       # matriz de tempos por corte/técnica/ponto/espessura
│   ├── prices.ts              # preços de referência para custo estimado
│   └── recipes.ts             # receitas básicas de acompanhamentos
├── locales/
│   ├── pt-BR/
│   │   ├── common.json
│   │   ├── barbecue.json
│   │   ├── cooking.json
│   │   ├── guest.json
│   │   └── catalog.json
│   └── en/
│       └── (mesma estrutura)
├── lib/
│   ├── calculator.ts          # engine de cálculo (puro)
│   ├── cost-estimator.ts      # cálculo de custo (puro)
│   ├── shopping-list.ts       # geração de lista de compras (texto + PDF)
│   ├── i18n.ts                # configuração react-i18next
│   ├── supabase.ts            # cliente
│   └── utils.ts
├── hooks/
│   ├── useBarbecue.ts         # inclui duplicateBarbecue()
│   ├── useGuests.ts
│   ├── useCookingTimer.ts
│   └── useCostEstimate.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── NewBarbecue.tsx        # com opção "duplicar churrasco anterior"
│   ├── BarbecueDetail.tsx
│   ├── CookingMode.tsx
│   └── GuestView.tsx
├── stores/
│   ├── timerStore.ts          # Zustand para timers ativos
│   └── preferencesStore.ts    # idioma, mostrar/esconder custo
└── App.tsx
```

-----

## 9. Identidade Visual

**Direção aprovada:** “Domingo de tarde” — fundo luminoso em gradiente do creme ao âmbar, com brasa viva como acentos. Mockup de referência em `fogo-alto-mockup.jsx`.

### Paleta

```css
/* Fundo (gradiente vertical) */
--bg-cream-top:    #FFF4E0;  /* topo, creme suave */
--bg-amber-mid:    #FCE4B6;  /* meio, âmbar claro */
--bg-amber-bottom: #F5C77E;  /* base, âmbar dourado */

/* Acentos quentes */
--tomato:          #F15A22;  /* primário — CTAs, ícones, links */
--tomato-deep:     #C43217;  /* hover, profundidade, valores numéricos */
--ember:           #E8930C;  /* secundário, gradientes shimmer */

/* Acento frio (contribuições de convidados) */
--olive:           #7A8B3D;  /* tags "Marina traz", indicadores de colaboração */
--olive-deep:      #5A6B2D;  /* texto sobre fundo claro */

/* Acento profundo (bebidas, vinhos) */
--burgundy:        #7A2828;

/* Neutros */
--ink:             #3D2817;  /* texto principal — castanho escuro */
--paper:           #FFFBF2;  /* superfícies de cards */
--paper-warm:      #FFF6E2;  /* gradiente de cards */
```

### Sombras e efeitos

- **Sombras de cards:** `0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 12px -4px rgba(120,60,20,0.15)` — leves, cor de mel
- **Sombra do card de custo (tomate):** `0 8px 24px -8px rgba(196,50,23,0.5)` — profunda e quente
- **Glow do CTA:** `0 10px 30px -8px rgba(196,50,23,0.6)` + animação `shimmer` no gradiente (4s ease-in-out infinite)
- **Grão de textura:** SVG noise com `opacity: 0.08` e `mix-blend-mode: multiply`
- **Glow no ícone Flame:** `filter: drop-shadow(0 0 8px rgba(241,90,34,0.4))` + animação `ember` (3s)

### Tipografia

```css
--font-display: 'Fraunces', serif;       /* títulos e números grandes */
--font-body:    'Sora', sans-serif;       /* corpo e UI */
```

- Pesos usados: 400, 500, 600, 700
- Carregar via Google Fonts no `index.html`
- Tamanhos-chave: hero `42px/1.05`, h2 `22px`, valores `26-40px`, body `15px`, “stamp” (caixa-alta) `10px com tracking 0.18em`

### Tom de escrita

- Aconchegante, brasileiro, sem ser caricato
- Linguagem direta: “Bora caprichar”, “Convide os parceiros”, “Hora da brasa”, “Para acompanhar”
- Em EN: “Make it count”, “Invite the crew”, “Fire it up”, “To go with it”
- Stamps em caixa-alta com tracking largo dão ar de menu de bistrô

### Padrões de componente

- **Cards padrão:** fundo creme (`--paper` → `--paper-warm`), bordas arredondadas `rounded-2xl`, sombra suave
- **Card destaque (custo):** fundo tomate-gradiente, texto branco, ícone decorativo de Sparkles em opacidade baixa
- **Tags de status:**
  - “Calculado” → fundo `ink/8%`, texto `ink/55%`
  - “Convidado traz” → fundo `olive/15%`, texto `olive-deep`
- **CTA principal (“Hora da brasa”):** gradiente animado tomato → ember → tomato com shimmer
- **Cards de carne:** barra lateral em gradiente vertical (tomate→tomato-deep) que aparece no hover, com leve translação

### Ícones

- Biblioteca: `lucide-react`
- Conjunto temático: `Flame`, `Beef`, `Wine`, `Users`, `Timer`, `MapPin`, `Calendar`, `Share2`, `Sparkles`, `Eye/EyeOff`, `Plus`, `Copy`, `Check`
- Stroke padrão: 2 (2.5 para ícones em CTAs, 1.5 para detalhes decorativos)

-----

## 10. Roadmap de Implementação

### Fase 1 — Fundação (1-2 dias com Claude Code)

- [ ] Setup com boilerplate
- [ ] Schema Supabase + RLS
- [ ] Auth básico (anfitrião)
- [ ] Configuração i18n (pt-BR + EN) com `react-i18next`
- [ ] Catálogo estático de cortes e bebidas (bilíngue)
- [ ] Engine de cálculo + testes unitários
- [ ] Catálogo de preços de referência (`src/data/prices.ts`)

### Fase 2 — Anfitrião (2-3 dias)

- [ ] Dashboard
- [ ] Wizard de criação (com opção “duplicar churrasco anterior”)
- [ ] Painel do churrasco (visão geral + lista)
- [ ] Card de custo estimado (com toggle mostrar/esconder)
- [ ] Edição/recálculo
- [ ] Toggle de idioma no header

### Fase 3 — Convidados (1-2 dias)

- [ ] Geração de share_token
- [ ] Página pública do convidado (bilíngue)
- [ ] RSVP + contribuições
- [ ] Aba de convidados no painel do anfitrião
- [ ] Realtime updates
- [ ] Recálculo do custo descontando contribuições

### Fase 4 — Modo Cozinha + Receitas (2-3 dias)

- [ ] Matriz completa de tempos por corte/técnica/ponto/espessura
- [ ] UI de timers
- [ ] Persistência de sessão
- [ ] Notificações sonoras/vibração
- [ ] Catálogo de receitas básicas (`src/data/recipes.ts`)
- [ ] Modal de receita escalável

### Fase 5 — Polimento

- [ ] Lista de compras exportável (texto WhatsApp + PDF simples)
- [ ] PWA (instalável no celular, ícone próprio)
- [ ] Modo offline para o modo cozinha (last-mile durante o churrasco — service worker cacheia catálogo, receitas e timers)
- [ ] Meta tags estáticas otimizadas (Open Graph fixo do app — preview decente mesmo sem SSR)
- [ ] Workflow do GitHub Actions para deploy automático no Pages

-----

## 11. Decisões Confirmadas

### 11.1. Internacionalização (i18n)

Suporte a **pt-BR e EN desde o início**.

- Biblioteca: `react-i18next` + `i18next-browser-languagedetector`
- Estrutura: `src/locales/pt-BR/*.json` e `src/locales/en/*.json`
- Namespaces: `common`, `barbecue`, `cooking`, `guest`, `catalog`
- Catálogo de cortes (`src/data/catalog.ts`): cada item tem `name_pt` e `name_en`, mais `tips_pt[]` e `tips_en[]`
- Detecção: idioma do navegador como padrão, com toggle persistido em localStorage
- Datas/horas: `date-fns` com locales `ptBR` e `enUS`
- Pesos: gramas/quilos em ambos (sem conversão para libras no MVP — adicionar como flag futura)

### 11.2. Lista de Compras Exportável

**Incluída no MVP**, mas como funcionalidade secundária.

- Botão “Exportar lista de compras” no painel do churrasco (não destacado)
- Gera texto formatado para WhatsApp (copy to clipboard) e PDF simples
- Lista consolidada: itens calculados − contribuições dos convidados = o que o anfitrião precisa comprar
- Foco principal do app continua sendo a colaboração via convite, não a logística de compras

### 11.3. Duplicar Churrasco Anterior

**Incluída no MVP**.

- No fluxo de criação (`/new`), oferecer opção “Começar do zero” ou “Duplicar churrasco anterior”
- Se duplicar: copia título (sugere “Cópia de…”), estilo, preferências de cortes, perfil de bebidas, perfil de consumo
- **Não copia:** data, convidados, contribuições, status (sempre começa em `planning`)
- Implementação: função `duplicateBarbecue(sourceId)` no hook `useBarbecue`

### 11.4. Custo Estimado

**Incluída no MVP**.

- Catálogo estático de preços médios em `src/data/prices.ts`, com:

  ```typescript
  export interface PriceReference {
    item_id: string;
    avg_price_brl_per_kg?: number;
    avg_price_brl_per_unit?: number;
    avg_price_brl_per_liter?: number;
    last_updated: string; // YYYY-MM-DD, exibir no app
    source_note: string;  // ex.: "média supermercados SP/RJ, jan 2026"
  }
  ```
- Cálculo simples: soma dos itens × quantidades × preços de referência
- UI: card “Custo estimado” no painel do churrasco, com aviso explícito de que é estimativa
- Desconta itens que serão trazidos por convidados
- **Atualização manual:** valores ficam no código, atualizáveis via PR/commit periódico
- Toggle no app: anfitrião pode esconder valores se preferir (preferência por usuário em `localStorage`)

### 11.5. Receitas Básicas Embutidas

**Incluídas no MVP**.

- Catálogo estático em `src/data/recipes.ts` com receitas tradicionais:
  - Farofa simples
  - Vinagrete
  - Molho à campanha
  - Pão de alho caseiro
  - Maionese de batata
  - Arroz branco soltinho
  - Feijão tropeiro (opcional)
- Estrutura de cada receita:

  ```typescript
  interface Recipe {
    id: string;
    name_pt: string;
    name_en: string;
    yields_servings: number;
    ingredients_pt: { name: string; quantity: string }[];
    ingredients_en: { name: string; quantity: string }[];
    steps_pt: string[];
    steps_en: string[];
    prep_minutes: number;
    tips_pt?: string[];
    tips_en?: string[];
  }
  ```
- UI: ao adicionar acompanhamento, se houver receita disponível, mostrar link “Ver receita”
- Modal com receita escalável (ajusta quantidades pelo número de pessoas)
- Sem AI generation — receitas são curadas e versionadas no código (alinhado com filosofia de Coado/Story Canvas)

-----

## 12. Notas para o Claude Code

### Princípios gerais

- Seguir o boilerplate pessoal do Victor (modo “full” com Supabase, deploy GitHub Pages)
- Markdown specs como referência principal — este documento é a fonte de verdade
- Mockup visual de referência: `fogo-alto-mockup.jsx` (paleta, tipografia, padrões de componente)
- Componentes shadcn instalados sob demanda via CLI
- Testes unitários obrigatórios apenas para `src/lib/calculator.ts` e `src/lib/cost-estimator.ts`
- Usar `zod` para validação em todo fluxo de formulários
- Mobile-first em todas as telas, especialmente modo cozinha
- Sem flattery em PRs/comentários, sem emojis em código, commits convencionais
- Português em comentários de código quando ajudar entendimento de domínio (cortes, técnicas); inglês em código puro

### Especificidades do GitHub Pages

- Configurar `base` no `vite.config.ts` com o nome do repositório (ex.: `base: '/fogo-alto/'`)
- **Decisão pendente:** `HashRouter` (simples, links com `#`) ou `BrowserRouter` + `404.html` redirect (URLs limpas, mais setup) — Claude Code pode decidir e justificar
- GitHub Action de deploy: usar `actions/deploy-pages@v4` com build do Vite
- Variáveis de ambiente do Supabase em GitHub Secrets, injetadas no build
- Testar links de convite no celular antes de divulgar (token na URL precisa funcionar com o roteador escolhido)

### Ordem de implementação sugerida

Seguir as fases do roadmap (seção 10) na ordem. Não começar a Fase 2 sem ter a engine de cálculo testada e o catálogo bilíngue funcional. O modo cozinha (Fase 4) é o mais isolado — pode rodar em paralelo se houver outro agente.

-----

## 13. Escopo do MVP

### Dentro do MVP

- Auth do anfitrião (e-mail/senha via Supabase)
- CRUD de churrascos com wizard de criação
- Duplicar churrasco anterior
- Engine de cálculo (carnes, bebidas, acompanhamentos)
- Catálogo bilíngue (pt-BR + EN) de cortes, bebidas e receitas
- i18n com toggle de idioma
- Compartilhamento via link com token único
- RSVP de convidados (sem login)
- Contribuições dos convidados (carnes/bebidas/outros que vão trazer)
- Realtime updates entre anfitrião e convidados
- Custo estimado com toggle mostrar/esconder
- Modo cozinha com timers por corte/técnica/ponto/espessura
- Receitas básicas embutidas e escaláveis
- Lista de compras exportável (texto + PDF) — feature secundária
- PWA instalável + modo offline para o modo cozinha
- Deploy automático no GitHub Pages

### Fora do MVP (próximas iterações)

- Login social (Google, Apple)
- Convidados com login próprio (histórico de churrascos que participaram)
- Notificações push (lembretes de RSVP, dia do evento)
- Integração com calendário (gerar `.ics`)
- Múltiplos anfitriões por churrasco (co-hosts)
- Histórico/avaliação pós-evento (“o que sobrou”, “o que faltou”)
- Sugestões inteligentes baseadas em churrascos anteriores
- Conversão de unidades para libras/onças
- Galeria de fotos do churrasco
- Pagamentos/divisão de conta entre convidados
- Geração de conteúdo por IA (receitas, sugestões) — explicitamente fora, alinhado com filosofia de Coado/Story Canvas

### Decisões pendentes para implementação

1. **Roteador GitHub Pages:** HashRouter vs BrowserRouter + 404 redirect
1. **RLS vs Edge Functions** para acesso de convidados (decidir na Fase 3)
1. **Magic link vs senha** para auth do anfitrião (preferência: magic link, mas validar UX no Brasil)

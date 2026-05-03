# Fogo Alto

App de planejamento, cálculo e execução de churrascos com colaboração entre anfitrião e convidados.

A spec completa está em [`SPEC.md`](./SPEC.md).

## Stack

React 18 + TypeScript + Vite + Tailwind + shadcn/ui + TanStack Query + Zustand + Supabase, deploy em GitHub Pages via Hash Router.

## Comandos

```bash
npm install
npm run dev         # servidor de desenvolvimento
npm run typecheck   # checagem de tipos
npm test            # testes (vitest)
npm run build       # build de produção
```

Variáveis de ambiente em `.env` (ver `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Estrutura

```
src/
├── components/   # ui shadcn + componentes de domínio
├── data/         # catálogos estáticos (cortes, bebidas, receitas)
├── lib/          # engine de cálculo, custo, supabase, i18n
├── locales/      # traduções pt-BR + EN
├── pages/        # rotas
├── stores/       # zustand (preferências, timers)
├── types/        # domain + database types
└── styles/       # globals.css com tema Fogo Alto
supabase/
└── migrations/   # SQL inicial do schema
```

## Deploy

Push em `main` → GitHub Actions roda typecheck + tests + build e publica no Pages.
Configurar secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no repositório.

## Schema do banco

Migration inicial em `supabase/migrations/0001_init.sql`. Aplicar via Supabase CLI (`supabase db push`) ou pelo SQL editor.

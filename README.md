# MetricasDSPD

Sistema de métricas ágeis do DSPD: painéis de fluxo (Operacional, Tático, Estratégico), Espera invisível e Sustentação, a partir do BusinessMap e do Acelerato (nunca misturados). Nenhuma métrica serve para avaliar pessoas ou comparar equipes.

> **Dados fictícios.** Esta versão roda só com dados gerados (mock determinístico). Nada aqui vem do BusinessMap ou do Acelerato reais.

## Pré-requisitos
Node 24 ou superior (`nvm install 24 && nvm use 24`).

## Rodar
```bash
pnpm install        # na raiz do monorepo (instala todos os workspaces)
pnpm run dev        # na raiz: sobe o painel em http://localhost:5173
```
Também funciona a partir de `web/`: `cd web && pnpm install && pnpm run dev`.

## Banco local (Docker)
O banco é PostgreSQL 17 no Docker Compose (custo zero). `cp .env.example .env`, depois `pnpm run db:up && pnpm run db:migrate && pnpm run db:seed`; `pnpm run test:pg` roda os testes de banco no mesmo Postgres, com um conjunto de schemas próprio por execução (removido ao final). Instalação do Docker no WSL2 e detalhes: `docs/architecture/server.md`.

## Verificar
- `pnpm run pronto` (raiz): lint, formatação, tipos, testes, build e tamanho do bundle.
- E2E: `cd e2e && pnpm run chromium:local` (uma vez, baixa o Chromium local) e depois `pnpm test`; `pnpm run gate` para o gate completo.

## CI

GitHub Actions (`.github/workflows/ci.yml`): jobs `rapida`, `testes`, `banco`, `build`, `e2e` e `perf`; obrigatórios na `main`. Detalhes e diagrama em [`docs/engineering/guia-do-desenvolvedor.md`](docs/engineering/guia-do-desenvolvedor.md). O hook `pre-push` roda lint e typecheck.

## Estrutura
- `web/`: aplicação React (painéis, componentes, camada de dados). Guia: `web/README-dev.md`.
- `packages/contratos`: tipos e schemas dos resultados. `packages/metricas`: biblioteca de cálculo. `packages/mock`: gerador de dados fictícios.
- `e2e/`: testes ponta a ponta (Playwright), acessibilidade e desempenho.
- `docs/`: documentação.

## Documentação
- Briefing (fonte da verdade): `docs/briefing-execucao-metricas.md`; proposta: `docs/proposta-metricas-ageis.md`
- UX: `docs/ux/` · Arquitetura: `docs/architecture/` · Práticas: `docs/engineering/praticas.md` · QA: `docs/qa/`

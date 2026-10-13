---
contrato: 0
---
# Parecer de QA - pedido 002 (arquitetura completa e MySQL)

Data: 2026-10-10 · Ambiente: worktree `MetricasDSPD-002`, sem Docker/MySQL (decisão do usuário: Docker).

## Veredito: APROVADO COM PENDÊNCIA DE AMBIENTE, com 2 ressalvas de cobertura (abaixo)

## Resultado real
| Item | Resultado |
|---|---|
| `npm run pronto` (raiz, inclui server) | exit 0 (lint, format, testes, build, size F6/F8/F9 ok) |
| Server: testes estáticos (migrações up/down, LGPD 328 colunas fora de `stg_`, grants, seed estático, coletas) | 28 passados, 10 skipped (MySQL) |
| `npm run cobertura` (raiz) | FALHA, ver ressalvas |
| Entregáveis | overview.md, data-model.md, roadmap.md, 10 ADRs (0001-0010), monorepo, 10 migrações, seed: presentes |
| Scripts Docker (leitura) | `docker-compose.yml` (mysql:8.4, healthcheck, perfil test na 3307), `scripts/db.sh`, `scripts/test-mysql.sh` (trap derruba o contêiner): coerentes; não executados |

## Ressalvas
1. `packages/contratos`: `cobertura` falha por "No test files found" (0/115). O `contratos.test.ts` existe só como arquivo não versionado no worktree principal (`/home/rodrigoisensee/MetricasDSPD`), não neste branch. Responsável: quem o criou deve versioná-lo.
2. `server` não tem script `cobertura` (npm: Missing script), então a meta de 100% de `docs/qa/estrategia-de-cobertura.md` não é verificável no server. Responsável: `node-backend`.
3. `web`: `app.test.tsx` ("valor inválido no link é ignorado...") falhou uma vez sob `cobertura` e passou isolado (30/30 no arquivo, 173/174 na suíte completa). Suspeita de instabilidade, não marcada como skip; acompanhar.
4. Pedido pede ADR de "biblioteca de gráficos" e "pacote de cálculo compartilhado" como ADRs próprias: gráficos está só nas ADRs 0001/0003 e cálculo na 0002 (sem arquivo dedicado). Decisão do arquiteto: aceitar a cobertura ou separar.

## Pendente de ambiente (exige Docker)
- 9-10 testes MySQL (`migracoes.mysql`, `seed.mysql`, `coletas.mysql`): hoje skipped (10 no total, não 9; divergência de contagem a conferir).
- EXPLAIN das consultas e p95 das consultas dos painéis.
- Rodar: `cp .env.example .env` (definir `MYSQL_ROOT_PASSWORD`) e `npm run test:mysql` (sobe o `mysql-test` na porta 3307, roda `npm test -w @metricas-dspd/server`, derruba). Para uso local: `bash scripts/db.sh migrate` e `bash scripts/db.sh seed`.

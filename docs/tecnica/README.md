# Documentação técnica: como o código funciona hoje

Propósito: explicar a implementação atual (front, cálculo, mock, testes) e mapear onde cada parte do código está. Público: desenvolvedores e agentes de IA. Revisão: 2026-10-11.

O índice geral é [`docs/README.md`](../README.md). Esta pasta guarda só o "como funciona"; decisões ficam nas [ADRs](../architecture/adr/0014-stack-tecnica-do-back-end.md), contratos em [`api/`](../api/openapi.json) e domínio em [`especificacao/domain/`](../especificacao/domain/README.md).

## Documentos desta pasta
| Documento | Conteúdo |
|---|---|
| [Arquitetura do front](arquitetura-front.md) | C4 nível 3 do `web/`, fronteiras de lint, fluxo de dados até o cartão, filtros na URL, troca do mock pela API |
| [Modelo de dados do mock](modelo-de-dados-mock.md) | ER do BusinessMap e do Acelerato; parâmetros do gerador; hash da base |
| [Biblioteca de cálculo](biblioteca-de-calculo.md) | Núcleo compartilhado (T2.5): tempo útil, percentis, amostra, Monte Carlo |
| [Qualidade e testes](qualidade-e-testes.md) | Pirâmide de testes, gates, E2E, acessibilidade, performance |

## Stack vigente do back-end
Conforme [ADR 0014](../architecture/adr/0014-stack-tecnica-do-back-end.md) e [ADR 0015](../architecture/adr/0015-bibliotecas-e-praticas-do-back-end.md):
- **Banco:** PostgreSQL, três schemas (`dspd_bm`, `dspd_ac` e `dspd_core`); migrações com node-pg-migrate.
- **Acesso a dados:** Kysely sobre `pg`, com tipos gerados por kysely-codegen (ADR 0015).
- **API:** Fastify 5 com Zod 4 e OpenAPI; eventos pela outbox transacional lida por polling.
- **Execução:** tudo local em Docker Compose, dois serviços (`api` e `worker`); pnpm; CI no GitHub Actions.
- **Nuvem (AWS, Lambda, RDS):** alvo futuro, adiado ([ADR 0013](../architecture/adr/0013-arquitetura-modular-serverless.md)); Hono não é usado.
- **Autenticação:** proposta, aguarda o SSO ([ADR 0009](../architecture/adr/0009-autenticacao-e-autorizacao.md)).
- Acelerato: tabela no Metabase, só leitura, lida uma vez ao dia.

Mais: [`overview.md`](../architecture/overview.md), [`data-model.md`](../architecture/data-model.md), [`server.md`](../architecture/server.md).

## Onde está o código
| Pasta | Pacote | Documentação |
|---|---|---|
| `packages/contratos` | `@metricas-dspd/contratos` | [ADR 0002](../architecture/adr/0002-monorepo-pacotes-compartilhados.md), [ADR 0007](../architecture/adr/0007-contratos-e-validacao-front-back.md), [`api/`](../api/openapi.json) |
| `packages/metricas` | `@metricas-dspd/metricas` | [biblioteca-de-calculo.md](biblioteca-de-calculo.md) |
| `packages/mock` | `@metricas-dspd/mock` | [modelo-de-dados-mock.md](modelo-de-dados-mock.md) |
| `web/` | `@metricas-dspd/web` | [arquitetura-front.md](arquitetura-front.md) |
| `e2e/` | testes Playwright | [qualidade-e-testes.md](qualidade-e-testes.md) |
| `server/` | `@metricas-dspd/server` | [server.md](../architecture/server.md), [`api/`](../api/openapi.json), [`especificacao/domain/`](../especificacao/domain/README.md) |

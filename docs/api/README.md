# docs/api

- **Propósito:** localizar o contrato HTTP. A documentação dos contratos vive em [`docs/contratos/`](../contratos/README.md).
- **Público:** time (documentação só para o time; sem Swagger UI público).
- **Revisão:** 2026-10-11.

| Arquivo | O que é |
|---|---|
| [`openapi.json`](openapi.json) | contrato OpenAPI 3.1 **gerado** dos schemas Zod; não editar à mão. Gerar: `pnpm --filter @metricas-dspd/server run openapi:gerar`; conferir: `openapi:verificar` (CI) |
| [`metricas.md`](metricas.md) | detalhe das rotas de métrica, filtros, referência e cache |
| [`fontes.md`](fontes.md) | estado de coleta, histórico de coletas, critérios e webhook |

Visão geral, política de mudança, eventos, dados e fontes: [`docs/contratos/README.md`](../contratos/README.md).

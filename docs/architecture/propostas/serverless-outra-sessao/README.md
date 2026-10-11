# Proposta preservada: back-end serverless (outra sessão de 2026-10-10)

> **Reconciliada em 2026-10-10** após confirmação do usuário: virou a [ADR 0013](../../adr/0013-arquitetura-modular-serverless.md); o `alteracoes.diff` foi aplicado com a numeração 0013. Diferenças em relação a este rascunho: ficam os três schemas `dspd_*` já migrados (em vez de prefixo por módulo), o formato de erro da ADR 0007 (em vez de problem+json) e a função operacional `migrar`. Esta pasta fica só como registro.

Arquivos encontrados sem commit no diretório de trabalho (10:48), escritos em outra sessão a partir de instruções do usuário: AWS serverless (Lambdas `api` e `coleta`), Hono + Kysely, Acelerato via tabela do Metabase (diária), SSO a informar, "manter simples".
Conflitam com o pedido 002 já mesclado na `main` (ADR 0004 MySQL, ADR 0008 framework da API, `overview.md`). Preservados aqui **sem alteração** para reconciliação pelo `software-architect` após confirmação do usuário.
- `0004-arquitetura-modular-serverless.md` — ADR original (número colide com a 0004 da main).
- `overview.md` — visão geral original (colide com `docs/architecture/overview.md` da main).
- `alteracoes.diff` — alterações que essa sessão fez nas ADRs 0002, 0003 e em `docs/tecnica/README.md`.

# 0007 - Contratos e validação entre front e back
- Status: aceita. A ADR 0013 trocou Fastify por Hono; a **ADR 0014** (2026-10-10) restabelece o texto original: **rotas Fastify 5** com **fastify-type-provider-zod 7** e OpenAPI por **`@fastify/swagger` 9** a partir dos schemas Zod 4 de `contratos`. O risco do fim (compatibilidade do type provider com zod 4) está fechado: versões verificadas pelo usuário (ADR 0014). Regras de contrato, formato de erro e paridade não mudam.
- Data: 2026-10-09
- **Nota de 2026-10-11 (sem reescrever a decisão):** onde este texto diz **MySQL** (Paridade D15), leia **PostgreSQL**: a ADR 0014 substituiu o banco. A decisão de contrato (schemas Zod únicos, entrada `strict`, saída validada, OpenAPI versionado, `/api/v1`) continua em vigor. O rascunho `docs/api/metricas.md` virou documento implementado; o ponto de entrada atual é `docs/contratos/` (README, política de mudança, HTTP).
- Relacionadas: ADR 0001 (zod no front), ADR 0002 (`@metricas-dspd/contratos`), rascunho `docs/api/metricas.md`, `docs/architecture/regras-metricas.md` §4.4

## Contexto
O pedido 002 exige que trocar `MockFonteMetricas` por `HttpFonteMetricas` seja só troca de fonte. Os DTOs e filtros já existem em zod (`SCHEMAS_RESULTADO`, filtros por domínio), com a regra de "ok só com n ≥ 20" no próprio schema.

## Decisão
- **Fonte única:** schemas zod 4 em `@metricas-dspd/contratos`. Servidor e web importam os mesmos objetos; nenhum DTO é redeclarado.
- **Servidor:** rotas Fastify declaram `querystring`, `params` e `response` com esses schemas (type provider zod). Entrada: schemas `strict` (parâmetro desconhecido = 400 `VALIDATION_ERROR`; é o que recusa `?agente=`/`?responsavel=`). Saída: a resposta é validada pelo schema antes de serializar; violação = 500 e log (o servidor nunca publica estatística com n < 20 nem campo não previsto).
- **Web:** `HttpFonteMetricas` implementa a mesma `FonteMetricas` e valida a resposta com `safeParse`; falha vira estado de erro do cartão, com log no console em dev.
- **OpenAPI** gerado das rotas (`@fastify/swagger`) e versionado em `docs/api/openapi.json`; CI falha se o gerado divergir do versionado. `docs/api/*.md` continua sendo o contrato legível do node-backend.
- **Versionamento:** prefixo `/api/v1`; mudança incompatível = `/api/v2` em paralelo. Campo novo opcional não muda versão.
- **Formato:** JSON camelCase; erro `{ error: { code, message, details? } }`; metadados de frescor e critério nos cabeçalhos definidos no rascunho (`X-Data-Referencia`, `X-Versao-Criterio`; `X-Ultima-Coleta` removido, frescor no corpo de `/fontes/:dominio/estado`, plano integracao-real D1). Paginação conforme o rascunho (exceção do O2 registrada lá).
- **Paridade (D15):** teste que, para cada `MetricaId` e conjunto de filtros de referência, compara o resultado da `MockFonteMetricas` (memória) com o da API sobre o seed no MySQL [hoje PostgreSQL, ADR 0014]. Diferença = falha.
- **Datas no fio:** datas civis `AAAA-MM-DD`; instantes ISO 8601 com `Z`.

## Alternativas consideradas
- **tRPC**: tipos ponta a ponta sem schema HTTP. Contras: acopla o front ao servidor TS, contrato HTTP menos legível para o QA e para consumidores futuros; já temos zod. Descartado.
- **OpenAPI primeiro + geração de cliente**: contrato neutro. Contras: duas fontes (YAML e zod) para manter alinhadas; a regra n ≥ 20 é mais expressiva em zod. Invertido: OpenAPI é gerado do zod.
- **Não validar a resposta no servidor**: mais rápido. Contras: perde a última barreira contra publicar estatística abaixo do mínimo. Custo medido no A1; se pesar, validar em dev/CI e amostrar em produção (registrar aqui).

## Consequências
- Mais fácil: o front não muda ao ligar a API; erros de contrato aparecem no CI (paridade e OpenAPI).
- Mais difícil: mudança de schema afeta web, servidor e mock ao mesmo tempo (é o objetivo).
- Risco: compatibilidade do type provider com zod 4 → confirmar versão no K-017; plano B é validar manualmente com `schema.parse` num hook `preValidation`/`preSerialization`.

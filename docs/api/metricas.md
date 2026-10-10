# API de métricas (contrato HTTP)

> **RASCUNHO.** Depende das ADRs do pedido 002 (framework, autenticação). Pontos marcados com [ADR] podem mudar.
> Dependência: `web/src/contracts/` ainda não está versionado em nenhuma branch nem existe no worktree 002; o contrato só fecha depois que os contratos do front forem commitados e trazidos para o 002 (pacote compartilhado, praticas.md).
> Fonte dos tipos: `web/src/contracts/` (DTOs zod, `ContratoMetricas`, `FonteMetricas`). Em caso de divergência, vale o zod do front até a ADR fechar; o back reutiliza os mesmos schemas.

## Regras gerais
- Base `/api/v1`, JSON camelCase, somente leitura (`GET`).
- Autenticação [ADR]: sem credencial válida -> 401; sem permissão -> 403.
- **Nenhuma rota expõe dado por pessoa** (agente, responsável, autor, ranking, filtro por pessoa). `cardId` e título de card são permitidos; nome de pessoa não. Rotas e parâmetros desse tipo não existem e serão recusados (400).
- BusinessMap (fluxo) e Acelerato (sustentação) nunca se misturam: o domínio é derivado do `id` da métrica e os filtros são de tipos distintos.
- Estatísticas com menos de 20 itens vêm como `status: "insuficiente"` sem valor (já no DTO).
- Datas AAAA-MM-DD (America/Sao_Paulo); tempo: fluxo (BusinessMap) em dias úteis, exceto O10 em dias corridos (exceção do briefing); sustentação (Acelerato) em horas úteis.

## GET /api/v1/metricas/:id
`:id` é um `MetricaId` (O1, O2, BLOQUEADOS, O3.. E3, S1..S7, EI_FL1..3, EI_SUST, VISAO_GERAL). Id desconhecido -> 404 `METRICA_NAO_ENCONTRADA`.

### Query (filtros), conforme o domínio da métrica
Listas em CSV (`equipe=a,b`); ausente ou vazio = "Todos".

| Domínio (métricas) | Parâmetros |
|---|---|
| Fluxo (O*, T*, E*, BLOQUEADOS, EI_FL1..3) | `equipe`, `tipo` (ids de `TIPO_ID`), `sistema`, `periodo` |
| Sustentação (S*, EI_SUST) | `equipe` (`totvs,senior,fluig`), `prioridade` (`P1..P5`), `periodo` |
| VISAO_GERAL | nenhum (padrões de cada painel) |

- Aplicabilidade por métrica no fluxo: fonte é `APLICABILIDADE_FLUXO` (`web/src/contracts/metricas.ts`). Filtro do mesmo domínio não aplicável à métrica (ex.: `tipo` em O12, `equipe` em E1) é aceito e ignorado, sem 400, coerente com "Não afetado por".
- `periodo`: `4s | 12s | 6m | 12m` (padrão `12s`) ou `custom` com `de` e `ate` (AAAA-MM-DD, dentro de `historico`).
- Parâmetro de outro domínio (ex.: `sistema` em S1) -> 400 `VALIDATION_ERROR`.
- `dataReferencia` (opcional, AAAA-MM-DD): recalcula como se fosse essa data de corte; padrão = data de referência atual. Futura -> 400.

### Resposta 200
Corpo = `ResultadoDe<id>` (schema em `SCHEMAS_RESULTADO[id]`), sem envelope. Metadados vão em cabeçalhos (o frescor NÃO: vai no corpo de `GET /api/v1/fontes/:dominio/estado`, ver `docs/api/fontes.md`; decisão D1 de `features/integracao-real.md`):
- `X-Data-Referencia`: data de corte usada.
- `X-Versao-Criterio`: id da versão de critério vigente.
- `Cache-Control: private, max-age=60`, `ETag`.

Os critérios (T2.6) aparecem no corpo em `criterios: { serie, janela }` (marcações da métrica), como no DTO.

### Paginação do O2
`GET /metricas/O2?page=1&pageSize=50` pagina somente `itens` (padrão 50, máx. 200, ordenados por `idadeDiasUteis` decrescente, desempate `cardId`). `tipos`, referências e contagens são sempre do conjunto completo. Meta no corpo: `itensMeta: { page, pageSize, total }`. [Diverge do `{ data, meta }` padrão por manter o DTO existente; o front hoje recebe todos os itens, então `page` ausente = todos até o máximo de 200 e `total` informa o resto.] Outras métricas ignoram `page`.

### Erros
Formato único: `{ "error": { "code": string, "message": string, "details"?: [] } }`

| Status | code | Quando |
|---|---|---|
| 400 | `VALIDATION_ERROR` | filtro/parâmetro inválido ou de outro domínio |
| 401 | `UNAUTHENTICATED` | sem credencial [ADR] |
| 403 | `FORBIDDEN` | sem permissão [ADR] |
| 404 | `METRICA_NAO_ENCONTRADA` | id inexistente |
| 422 | `PERIODO_FORA_DO_HISTORICO` | `custom` fora de `historico` ou `de > ate` |
| 503 | `BASE_INDISPONIVEL` | base analítica fora do ar |
| 500 | `INTERNAL_ERROR` | inesperado, sem detalhes internos |

## GET /api/v1/filtros/:dominio
`:dominio` = `businessmap | acelerato`. Resposta 200 = `OpcoesFiltroFluxo` ou `OpcoesFiltroSustentacao` (equipes, tipos/prioridades, sistemas, `historico`). Sem opção de pessoa. Domínio inválido -> 404.

## GET /api/v1/criterios
200 = `VersaoCriterio[]` (`id`, `data`, `descricao`, `afeta: MetricaId[]`), todos os domínios, registro T2.6 (mudança com data, marcada nos gráficos).

## GET /api/v1/referencia
200 = `{ "dataReferencia": "AAAA-MM-DD", "ultimaColeta": { "businessmap": ISO|null, "acelerato": ISO|null }, "versaoCriterio": string }`. O front decide o aviso de dados defasados; `null` = nunca coletado. Fontes separadas, sem agregação entre elas.

## Cache
- Chave: `métrica + filtros normalizados (listas ordenadas) + dataReferencia + versão de critério`.
- Invalida quando uma coleta incremental conclui (muda a data de referência/última coleta) ou quando uma nova versão de critério é registrada. Não sobrescreve histórico da base; só descarta resultados calculados.
- Cache por domínio; chaves de fluxo e sustentação nunca compartilham entrada. Cache compartilhado só se a resposta independer de usuário (hoje independe; revisar se a ADR de auth introduzir escopo por equipe).

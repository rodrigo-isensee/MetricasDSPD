# API de métricas (contrato HTTP)

> **RASCUNHO.** Framework decidido: **Fastify 5** no serviço `api` (imagem de contêiner no Docker Compose local; nuvem adiada; banco PostgreSQL, papel `dspd_api` sem leitura das colunas de pessoa), com fastify-type-provider-zod 7 e OpenAPI gerado por `@fastify/swagger` 9 dos schemas Zod 4 de `@metricas-dspd/contratos` (ADR 0014, que revisa a 0013). Autenticação ainda depende do SSO (P3; ADR 0009 e ADR 0013 §8). Pontos marcados com [ADR] referem-se à autenticação.
> Dependência: `web/src/contracts/` ainda não está versionado em nenhuma branch nem existe no worktree 002; o contrato só fecha depois que os contratos do front forem commitados e trazidos para o 002 (pacote compartilhado, praticas.md).
> Fonte dos tipos: `web/src/contracts/` (DTOs zod, `ContratoMetricas`, `FonteMetricas`). Em caso de divergência, vale o zod do front até a ADR fechar; o back reutiliza os mesmos schemas.

## Saúde e OpenAPI
- `GET /health/live` (processo no ar, sem banco), `GET /health/ready` e o alias `GET /health` (consultam o banco; 503 `BASE_INDISPONIVEL` se não responde). Fora do prefixo `/api/v1`. Resposta `{ "status": "ok" }`.
- Todo response leva `x-request-id` (aproveita o enviado se for `[A-Za-z0-9._-]{8,64}`, senão UUID).
- Contrato gerado: `docs/api/openapi.json` (`pnpm --filter @metricas-dspd/server run openapi:gerar`; o job `openapi` do CI e um teste comparam gerado x versionado). Fonte da verdade das rotas implementadas (S-06 a S-12): saúde, filtros, referência, `metricas` (33 rotas, uma por id), `fontes`, `criterios` e o webhook (`POST /webhooks/businessmap`, só existe com `WEBHOOK_BM_SEGREDO` configurado).
- Erros de validação: `details` = `[{ caminho, mensagem }]` (sem o valor recebido). 404 de rota: `ROTA_NAO_ENCONTRADA`.

## Regras gerais
- Base `/api/v1`, JSON camelCase, somente leitura (`GET`).
- Autenticação [ADR]: sem credencial válida -> 401; sem permissão -> 403.
- **Nenhuma rota expõe dado por pessoa** (agente, responsável, autor, ranking, filtro por pessoa). `cardId` e título de card são permitidos; nome de pessoa não. Rotas e parâmetros desse tipo não existem e serão recusados (400).
- BusinessMap (fluxo) e Acelerato (sustentação) nunca se misturam: o domínio é derivado do `id` da métrica e os filtros são de tipos distintos.
- Estatísticas com menos de 20 itens vêm como `status: "insuficiente"` sem valor (já no DTO).
- Datas AAAA-MM-DD (America/Sao_Paulo); tempo: fluxo (BusinessMap) em dias úteis, exceto O10 em dias corridos (exceção do briefing); sustentação (Acelerato) em horas úteis.

## GET /api/v1/metricas/:id
`:id` é um `MetricaId` (O1..O18, BLOQUEADOS, T1..T9, E1..E5, S1..S12, EI_FL1..3, EI_SUST, VISAO_GERAL; 50 ids, inclui as 17 complementares abaixo). Id desconhecido -> 404 `METRICA_NAO_ENCONTRADA`.

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
- `dataReferencia` (opcional, AAAA-MM-DD): recalcula com corte no fim desse dia (America/Sao_Paulo); padrão (decisão S-a) = instante da última coleta bem-sucedida da fonte da métrica (sem coleta: agora). Futura (depois de hoje) -> 400. VISAO_GERAL usa o corte mais antigo das duas fontes (provisório). Parâmetros desconhecidos (qualquer filtro de pessoa) -> 400. `de`/`ate` só com `periodo=custom`; `custom` exige os dois.

### Resposta 200
Corpo = `ResultadoDe<id>` (schema em `SCHEMAS_RESULTADO[id]`), sem envelope. Metadados vão em cabeçalhos (o frescor NÃO: vai no corpo de `GET /api/v1/fontes/:dominio/estado`, ver `docs/api/fontes.md`; decisão D1 de `features/integracao-real.md`):
- `X-Data-Referencia`: data de corte usada.
- `X-Versao-Criterio`: id da versão de critério vigente na data de referência (`"0"` se não há, decisão S-b).
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
| 503 | `REFERENCIA_AUSENTE` | S1 e VISAO_GERAL sem `ref_alvo_prioridade` carregada (nenhum prazo é presumido) |
| 422 | `PERIODO_FORA_DO_HISTORICO` | `custom` fora de `historico` ou `de > ate` |
| 503 | `BASE_INDISPONIVEL` | base analítica fora do ar |
| 500 | `INTERNAL_ERROR` | inesperado, sem detalhes internos |

## GET /api/v1/filtros/:dominio
`:dominio` = `businessmap | acelerato`. Resposta 200 = `OpcoesFiltroFluxo` ou `OpcoesFiltroSustentacao` (equipes, tipos/prioridades, sistemas, `historico`). Sem opção de pessoa. Domínio inválido -> 400 `VALIDATION_ERROR` (mesma regra de `docs/api/fontes.md`). Parâmetro de query qualquer (ex.: `?responsavel=`) -> 400. Cabeçalho `Cache-Control: private, max-age=60`. Implementada (S-07): `server/src/modulos/referencia/`. Resposta validada na saída (fora do schema = 500).
- `equipes` (BusinessMap): `ref_quadro` vigente, nível `time`, sem quadros de teste; `id` = `slug(equipe)`. `tipos`: lista fixa de `contratos`. `sistemas`: `ref_dominio` campo `sistema` vigente (`id` = `slug(codigo)`, `nome` = rótulo). `historico.inicio` = primeira data (America/Sao_Paulo) de `dim_card.criado_em` (BM) ou `dim_chamado.aberto_em` (AC); base vazia: `inicio = fim`; `fim` = hoje.
- Sustentação: `equipes` `totvs|senior|fluig`; `prioridades` com `id` minúsculo (`p1`..`p5`, como o mock) e `nome` `P1`..`P5`.

## GET /api/v1/criterios
200 = `VersaoCriterio[]` (`id`, `data`, `descricao`, `afeta: MetricaId[]`), todos os domínios, registro T2.6 (mudança com data, marcada nos gráficos).

## GET /api/v1/referencia
200 = `{ "dataReferencia": "AAAA-MM-DD", "ultimaColeta": { "businessmap": ISO|null, "acelerato": ISO|null }, "versaoCriterio": string }`. O front decide o aviso de dados defasados; `null` = nunca coletado. Fontes separadas, sem agregação entre elas. Implementada (S-07). `dataReferencia` = data de hoje em America/Sao_Paulo (**provisório, pergunta aberta ao usuário**: hoje ou data da última coleta); `ultimaColeta.<fonte>` = fim da última coleta incremental com `status = sucesso`; `versaoCriterio` = id da versão mais recente já vigente (`ref_versao_criterio`, qualquer fonte), `"0"` se não há. Query de pessoa -> 400.

## Mudanças deste lote para o front
- `GET /metricas/O2` passa a incluir `itensMeta` (`{ page, pageSize, total }`) e ordena `itens` por idade decrescente; sem `page`, devolve até 200 itens. Campo novo, aditivo.
- Query do fluxo usa ids de tipo (`tipo=bug-interno,melhoria`) e prioridades aceitam `P1` ou `p1`.
- `dataReferencia` de `GET /referencia` agora é a data da última coleta bem-sucedida (S-a), não mais hoje.
- 304 com `If-None-Match` (ETag fraco por métrica, filtros, data, versões e página).

## Métricas complementares (O5, O6, O8, O11, O13, O14, O16, T6, T8, E4, E5, S8 a S12 e O17)
Plano: `docs/architecture/features/metricas-complementares.md`. Mesmas rotas e filtros das demais (`GET /api/v1/metricas/:id`, sem rota nova, sem migração); DTOs em `packages/contratos/src/schemas.ts` (`resultadoO5` ... `resultadoS12`). **Dados fictícios**: as extensões (causa raiz, sprint como card-template pai com filhos e data de ligação, natureza de projeto, reincidente, registro de Problema) vêm de `gerarExtensoesMock` e só alimentam o cálculo na fonte mock (`CATALOGO_CARTOES[].status = 'mock'`); só T8, O17, E4, S8, S11 e S12 dependem de extensão e são `status: 'mock'` no catálogo; as demais são `'disponivel'`. A API só injeta as extensões mockadas quando `DADOS_FONTE=mock` (padrão). Sem extensão, S8, S11 e S12 devolvem `campoDisponivel: false` com taxas `insuficiente` (S8 com `statusMeta: 'sem-referencia'`), O17 e E4 devolvem a lista de causa/natureza vazia e `campoDisponivel: false`, T8 devolve `sprints: []`: nunca 0% nem "dentro da meta". `campoDisponivel` (boolean) é campo novo e obrigatório em O17, E4, S8, S11 e S12.

| Id | Corpo (campos principais) | Filtros que atuam |
|---|---|---|
| O5 | `tipos[{tipo,n,estatistica:{medianaPct,agregadaPct,horasExecucao,horasFila,horasBloqueio}}]` | equipe, tipo, sistema, período |
| O6 | `alvoMax`, `classes[{classe,n,estatistica:{p50,p85,razao},statusMeta}]` | equipe, sistema, período |
| O8 | `tipos[{tipo,n,estatistica:{mediana,media,p85,acimaP85AnteriorPct},porTamanho[]}]` | equipe, tipo, sistema, período |
| O11 | `meses[{mes,emAndamento,definicao,prontos,porTipo[]}]`, `semanasDeBacklogPronto` | equipe, tipo, sistema, período |
| O13 | `meses[{mes,defeitos,vazaoTotal,pct:Taxa}]` | equipe, sistema, período |
| O14 | `porArea` e `porSistema`: `{itens[{nome,entregues,criados,porTipo}] (top 10), demais}` | equipe, sistema, período |
| O16 | `meses[{entrada,correcao,estoqueFim,densidade}]`, `abertosPorSeveridade[]`, `maisAntigos[{cardId,tipo,severidade,idadeDiasUteis}]` (10, sem pessoa) | equipe, sistema, período |
| O17 (Sustentação, Acelerato) | `campoDisponivel`, `porCausa[{causa,n}]` (incidentes encerrados), `porSistema[{sistema,n}]` (categoria do chamado) | equipe, prioridade, período (filtros da sustentação; não mais de fluxo) |
| T6 | `entradas{itens,semanas}`, `classes[{classe,n,termino[{itens,previsao}],itens[{semanas,previsao}]}]` (P50/P85/P95, `Estatistica`) | equipe, sistema, período |
| T8 | `sprints[{sprintId (card pai),nome,inicio,fim,itens,comprometidos,entreguesDoComprometido,carryOver,entradaNaoPlanejada,entreguePct:Taxa,naoPlanejadoPct:Taxa}]`, `agregado` | equipe, sistema, período |
| E4 | `trimestres[{trimestre,iniciados,concluidos,emAbertoAcumulado,iniciadosPorNatureza[]}]` | sistema, período |
| E5 | `vazaoSemanal{n,mediana}`, `projetos[{projetoId,projeto,frentesRestantes,frentesAdicionadasAposInicio,previsao}]` | sistema, período |
| S8 | `campoDisponivel`, `cobertura{n,total}`, `metaMaxPct`, `meses[{encerrados (incidentes abertos no mês),reabertos,taxa}]`, `total`, `statusMeta` | equipe, prioridade, período |
| S9 | `porMotivo[{motivo,n,estatistica}]` (horas úteis), `cumprimentoPrevisao:Taxa` | equipe, prioridade, período |
| S10 | `prioridades[{prioridade,n,estatistica,histograma|null,aceitosEm15min:Taxa}]` (horas úteis) | equipe, prioridade, período |
| S11 | `escopo:Taxa`, `porGrupo[{grupo:P1|P2|Contorno,taxa}]` (se sobrepõem), `conversao:Taxa` | equipe, período (prioridade não atua) |
| S12 | `parametros{janelaSemanas}`, `meses[{total,porSistema}]`, `reincidencia[{sistema,chamados,reincidentes,proporcao:Taxa}]` (janela de 12 semanas), `excecaoSla:Taxa` | equipe, prioridade, período |

Regras: percentis 50/85/95 na janela de 12 semanas e abaixo de 20 itens sem estatística (`insuficiente`, com "k de n" nas taxas); T6 e E5 usam `core/montecarlo` com semente fixa (resposta reprodutível); BM e AC separados; nenhuma chave por pessoa.

### Decisões do usuário aplicadas (2026-10-11)
- O5: bloqueio dentro de coluna de execução sai do tempo de execução (não-execução = fila + bloqueio).
- O11: em definição = seção Requested (papel `backlog`); pronto = In Progress comprometido (papel `compromisso`); sem sexto papel de coluna.
- S8: reabertura = o próprio chamado com `reincidente` preenchido, contado no mês de abertura (mesma lógica da S12; decisão 14 de 11/10); denominador = incidentes abertos no mês; `cobertura {n, total}` = incidentes com o campo informado de N (ausente nunca vira "não reincidente" em silêncio); sem intervalo de dias nem "mesmo sintoma".
- S12: chamado com `reincidente` já conta; sem limite K; contagem e proporção por sistema na janela de 12 semanas.
- T8: sprint = card-template pai; planejado = filho ligado até o início da sprint; ligado depois = entrada não planejada.
- Alterações de tipo: T8 `sprints[].adicionados` -> `entradaNaoPlanejada` e novo `nome`; S8 sem `diasReabertura`; S12 `parametros.kRecorrente` e `recorrentes[]` removidos, `reincidencia[]` novo.

### Mudanças de contrato para o front (este lote)
- `METRICA_IDS` passa de 33 para 50; `CATALOGO_CARTOES` ganha `grupo` (`nucleo|complementar`) e `status` (`disponivel|mock`) e os 17 cartões; `leiaJunto` do núcleo aponta para complementares (O3 -> o6, O4 -> o8, O15 -> o13, S1 -> s9).
- `S9` usa `porMotivo` (não `motivos`).
- Mudança de comportamento do mock: as 5 de sustentação (S8 a S12) entram nas métricas em calibração da fonte Acelerato.

## Cache
- Chave: `métrica + versão de carga (marca d'água da coleta + versão de critério mais recente) + versão de critério vigente + dataReferencia + filtros normalizados (listas ordenadas)`. A base (`BaseBM`/`BaseAC`) fica em memória por versão de carga; a marca d'água é relida a cada 60 s. Máximo de 500 resultados por domínio (descarta o mais antigo). Mudança de `ref_*` sem nova coleta só vale após reiniciar a api (ou nova coleta/versão de critério).
- Invalida quando uma coleta incremental conclui (muda a data de referência/última coleta) ou quando uma nova versão de critério é registrada. Não sobrescreve histórico da base; só descarta resultados calculados.
- Cache por domínio; chaves de fluxo e sustentação nunca compartilham entrada. Cache compartilhado só se a resposta independer de usuário (hoje independe; revisar se a ADR de auth introduzir escopo por equipe).

### S8: critério de contagem (decisão 14, 2026-10-11)
- Campo novo e obrigatório em `resultadoS8`: `cobertura: { n: number, total: number }` ("n de N": n = incidentes do período com o campo `reincidente` informado; total = incidentes abertos no período). Sem extensão: `{ n: 0, total: N }`.
- Semântica alterada (mesmos nomes): `meses[].encerrados` passa a ser incidentes **abertos** no mês (antes, encerrados) e `reabertos` os chamados reincidentes abertos no mês; `base.unidade` = "incidentes abertos". Critério versionado (T2.6): marcar a mudança nos gráficos.

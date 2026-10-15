# API de métricas (contrato HTTP)

> **Status:** implementado (rotas em `server/src/modulos/`; OpenAPI gerado em `docs/api/openapi.json`, que vale em caso de divergência). A visão geral e atualizada do contrato HTTP está em [`docs/contratos/http.md`](../contratos/http.md); esta página guarda o detalhe por rota. Revisado em 2026-10-11.
> Stack: **Fastify 5**, fastify-type-provider-zod 7 e `@fastify/swagger` 9 sobre os schemas Zod 4 de `@metricas-dspd/contratos` (ADR 0014, que revisa a 0013); banco PostgreSQL, papel `dspd_api` sem leitura das colunas de pessoa. Autenticação [planejado]: depende do SSO (ADR 0009); hoje a API não autentica. Pontos marcados com [ADR] referem-se à autenticação.
> Fonte dos tipos: `packages/contratos/src/` (DTOs Zod, `ContratoMetricas`, `FonteMetricas`), pacote compartilhado pelo servidor e pelo front. Nenhum DTO é redeclarado.

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
`:id` é um `MetricaId` (O1..O19, BLOQUEADOS, T1..T10, T12, E1..E5, E7, E9, S1..S12, EI_FL1..3, EI_SUST, PV1, VISAO_GERAL; 56 ids, inclui as 17 complementares abaixo e a PV1, última seção). Id desconhecido -> 404 `METRICA_NAO_ENCONTRADA`.

### Query (filtros), conforme o domínio da métrica
Listas em CSV (`equipe=a,b`); ausente ou vazio = "Todos".

| Domínio (métricas) | Parâmetros |
|---|---|
| Fluxo (O*, T*, E*, BLOQUEADOS, EI_FL1..3) | `equipe`, `tipo` (ids de `TIPO_ID`), `sistema`, `periodo` |
| Sustentação (S*, EI_SUST) | `equipe` (`totvs,senior,fluig`), `prioridade` (`P1..P5`), `periodo` |
| Pesquisa de percepção (PV1) | nenhum (só `dataReferencia`) |
| VISAO_GERAL | nenhum (padrões de cada painel) |

- Aplicabilidade por métrica no fluxo: fonte é `APLICABILIDADE_FLUXO` (`packages/contratos/src/metricas.ts`). Filtro do mesmo domínio não aplicável à métrica (ex.: `tipo` em O12, `equipe` em E1) é aceito e ignorado, sem 400, coerente com "Não afetado por".
- `periodo`: `4s | 12s | 6m | 12m` (padrão `12s`) ou `custom` com `de` e `ate` (AAAA-MM-DD, dentro de `historico`).
- Parâmetro de outro domínio (ex.: `sistema` em S1) -> 400 `VALIDATION_ERROR`.
- `dataReferencia` (opcional, AAAA-MM-DD): recalcula com corte no fim desse dia (America/Sao_Paulo); padrão (decisão S-a) = instante da última coleta bem-sucedida da fonte da métrica (sem coleta: agora). Futura (depois de hoje) -> 400. VISAO_GERAL usa o corte mais antigo das duas fontes (provisório). Parâmetros desconhecidos (qualquer filtro de pessoa) -> 400. `de`/`ate` só com `periodo=custom`; `custom` exige os dois.

### Resposta 200
Corpo = `ResultadoDe<id>` (schema em `SCHEMAS_RESULTADO[id]`), sem envelope. Metadados vão em cabeçalhos (o frescor NÃO: vai no corpo de `GET /api/v1/fontes/:dominio/estado`, ver `docs/api/fontes.md`; decisão D1 de `features/integracao-real.md`):
- `X-Data-Referencia`: data de corte usada.
- `X-Versao-Criterio`: id da versão de critério vigente na data de referência (`"0"` se não há, decisão S-b).
- `Cache-Control: private, max-age=60`, `ETag`.

Os critérios (T2.6) aparecem no corpo em `criterios: { serie, janela }` (marcações da métrica), como no DTO.

Janela do cálculo (`base.janela`, `estatistica.janela`, `previsao.janela`, `janelaFaixa`, `janelaAnterior`): `{ inicio, fim }` e, quando vem de janela móvel, `unidade` (`semanas` ou `meses`) e `quantidade` (número), opcionais no contrato; a biblioteca sempre os emite (acréscimo compatível, FA-004). Os schemas de resultado seguem sem `.strict()` de propósito: campo novo da API não pode derrubar um front mais antigo; o teste de paridade (`web/paridade`) compara o corpo bruto e acusa campo que some ou aparece.

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
| S8 | `campoDisponivel`, `cobertura{n,total}`, `metaMaxPct`, `meses[{encerrados (incidentes abertos no mês),informados (com o campo `reincidente` informado: denominador do mês),reabertos,taxa}]`, `total`, `statusMeta` | equipe, prioridade, período |
| S9 | `porMotivo[{motivo,n,estatistica}]` (horas úteis), `cumprimentoPrevisao:Taxa` | equipe, prioridade, período |
| S10 | `prioridades[{prioridade,n,estatistica,histograma|null,aceitosEm15min:Taxa}]` (horas úteis) | equipe, prioridade, período |
| S11 | `escopo:Taxa`, `porGrupo[{grupo:P1|P2|Contorno,taxa}]` (se sobrepõem), `conversao:Taxa` | equipe, período (prioridade não atua) |
| S12 | `campoDisponivel`, `cobertura{n,total}` (janela de 12 semanas), `parametros{janelaSemanas}`, `meses[{total,porSistema}]`, `reincidencia[{sistema,chamados,informados,reincidentes,proporcao:Taxa}]` (janela de 12 semanas; proporção = reincidentes ÷ informados), `excecaoSla:Taxa` | equipe, prioridade, período |

Regras: percentis 50/85/95 na janela de 12 semanas e abaixo de 20 itens sem estatística (`insuficiente`, com "k de n" nas taxas); T6 e E5 usam `core/montecarlo` com semente fixa (resposta reprodutível); BM e AC separados; nenhuma chave por pessoa.

### Decisões do usuário aplicadas (2026-10-11)
- O5: bloqueio dentro de coluna de execução sai do tempo de execução (não-execução = fila + bloqueio).
- O11: em definição = seção Requested (papel `backlog`); pronto = In Progress comprometido (papel `compromisso`); sem sexto papel de coluna.
- S8: reabertura = o próprio chamado com `reincidente` preenchido, contado no mês de abertura (mesma lógica da S12; decisão 14 de 11/10); denominador = só os incidentes com o campo informado (`meses[].informados`; total = `cobertura.n`); `cobertura {n, total}` = incidentes com o campo informado de N (ausente nunca vira "não reincidente" em silêncio); sem intervalo de dias nem "mesmo sintoma".
- S12: chamado com `reincidente` já conta; sem limite K; contagem e proporção por sistema na janela de 12 semanas; denominador = chamados com o campo informado; `cobertura {n, total}` como na S8. Sem extensão só a reincidência fica sem fonte (`campoDisponivel: false`, `cobertura {0, N}`): `meses` e `excecaoSla` continuam reais e devem ser exibidos.
- T8: sprint = card-template pai; planejado = filho ligado até o início da sprint; ligado depois = entrada não planejada.
- Alterações de tipo: T8 `sprints[].adicionados` -> `entradaNaoPlanejada` e novo `nome`; S8 sem `diasReabertura`; S12 `parametros.kRecorrente` e `recorrentes[]` removidos, `reincidencia[]` novo.

### Mudanças de contrato para o front (este lote)
- `METRICA_IDS` passa de 33 para 50; `CATALOGO_CARTOES` ganha `grupo` (`nucleo|complementar`) e `status` (`disponivel|mock`) e os 17 cartões; `leiaJunto` do núcleo aponta para complementares (O3 -> o6, O4 -> o8, O15 -> o13, S1 -> s9).
- `S9` usa `porMotivo` (não `motivos`).
- Mudança de comportamento do mock: as 5 de sustentação (S8 a S12) entram nas métricas em calibração da fonte Acelerato.

## Métricas "também disponíveis", fase 1 (pedido 011): contratos sem rota ainda
> **Status:** só contratos (B1, `packages/contratos/src/tambem.ts`). Nenhum dos ids abaixo entra em `METRICA_IDS` neste cartão: cada id ganha a rota `GET /api/v1/metricas/:id` (e a OpenAPI regenerada) no cartão do seu cálculo, para não existir rota que devolva dado inventado. A API tinha 51 ids no B1; a única mudança na OpenAPI (regenerada) é o campo `parados` na resposta do O2 (obrigatório desde o B2). O front pode tipar contra os tipos exportados, mas só consome o id quando o cartão dele fechar.
- **Tipos** (`@metricas-dspd/contratos`): `ResultadoO19`, `ResultadoO20`, `ResultadoO21`, `ResultadoO24`, `ResultadoO25`, `ResultadoT10`, `ResultadoT11`, `ResultadoT12`, `ResultadoE7`, `ResultadoE9` e `ParadosO2`; schemas homônimos em minúsculas (`resultadoO19`...) e o mapa `SCHEMAS_TAMBEM_FASE1`.
- **Envelope:** o de sempre (`base`, `criterios`); estatística e taxa vêm de `estatistica`/`taxa` (`status: 'ok' | 'insuficiente'`, abaixo de 20 itens só "k de n", sem valor). BusinessMap apenas; nenhum campo mistura Acelerato.
- **Fechados:** todo objeto próprio é `strict`. Campo extra, inclusive de pessoa (`responsaveis`, `usuario`, `equipe`...), invalida o resultado. Um teste (`tambem.test.ts`) varre os nomes de campo dos dez schemas e falha se aparecer nome de pessoa ou de comparação entre times.
- **Séries** devolvem `marcacoes` (mudanças de critério, T2.6): O24, O25 e T11. O O20 usa `mudancasCriterio`, como no plano.

| Id | Corpo (campos além de `base` e `criterios`) |
|---|---|
| O19 Bloqueios por causa | `motivos[{ motivo, bloqueios, diasUteis, pctDoTotal (taxa), duracao (estatistica) }]` (7 motivos, ordem neutra do domínio), `abertosForaDaSoma`, `totalDiasUteis` |
| O20 Fluxo cumulativo | `agrupamento` (`coluna`\|`papel`), `faixas[{ chave, rotulo, ordem, tipoColuna }]`, `dias[{ dia, contagens[] }]`, `destaque { faixa, de, para } \| null`, `mudancasCriterio` |
| O21 Fluxo reverso | `entregas` (taxa), `matriz { eixo, celulas[{ origem, destino, retornos }] }`, `reaberturas`, `comparacao { tipo, com, sem }` (cada grupo é uma `estatistica`: o que tem menos de 20 vem `insuficiente` com o seu n) |
| O24 Ordem de chegada | `inicios` (taxa), `meses[{ mes, emOrdem, foraDeOrdem, emAndamento }]`, `marcacoes`, `custo { tipo, estatistica } \| null`, `grupo: 'equipe-tipo-padrao'` |
| O25 Descarte | `encerrados` (taxa), `meses[{ mes, taxa, emAndamento }]`, `marcacoes`, `consumido { antesDoInicio { itens }, depoisDoInicio { itens, diasUteis, estatistica } }`, `instanteAproximado { itens }`, `avisoPreenchimento { itens }` (fora da taxa), `porMotivo[{ motivo, itens }] \| null` |
| T10 Tempo de terceiros | `fornecedores[{ fornecedor, bloqueios, diasUteis, duracao }]`, `totalDiasUteis`. **Sem** `prazoDiasUteis`, `status` nem `prazoFornecedor` (D-10 = A) |
| T11 Sazonalidade da chegada | `anos[{ ano, meses[{ mes (1..12), entradas \| null, emAndamento }] }]`, `marcacoes`, `mesesComDado`, `mediaMensal \| null`, `historicoCurto` |
| T12 Qualidade da entrada por área | `total` (taxa), `areas[{ area, taxa }]` |
| E7 Capacidade por sistema | `total`, `sistemas[{ sistema, entregas, participacao (taxa), porNatureza[{ natureza, taxa }], custoRateado \| null, custoPorDemanda \| null }]`, `custoConfigurado` |
| E9 Projetos aguardando início | `projetos[{ cardId, codigo, titulo, tipo, criadoEm, idadeDiasUteis, faixa }]`, `segmentoPor: 'tipo'`, `referenciasP85[{ tipo, referenciaP85 }]` (uma por tipo de projeto, `Iniciativa` e `Melhoria`; cada `referenciaP85` é estatistica só com `p85`, importada do E1) |

### O19 e T10 (B3): rotas ativas
- Desde o B3 `GET /api/v1/metricas/O19` e `GET /api/v1/metricas/T10` existem (53 ids; OpenAPI regenerada). Filtros: equipe, tipo, sistema, período (a seleção é por card de story: frente e projeto nunca entram). Só BusinessMap; nenhum campo de pessoa. **Cartões no catálogo (`CATALOGO_CARTOES`): ainda não entram.** Acrescentá-los muda o catálogo compartilhado e quebra 21 testes do web (contagens "+N complementares", componentes ausentes), então ficam para o cartão do front, no mesmo commit do catálogo web. Entradas prontas: O19 em operacional, seção `por-que-demora` (leia junto `bloqueados`, `o5`) e T10 em tático, seção nova `de-quem-depende` "De quem depende o prazo?" (leia junto `bloqueados`, `o12`, `o19`), ambos `complementar` e `disponivel`.
- **Base:** bloqueios com `fim` dentro do período (padrão 12 semanas) de cards que passam pelos filtros; bloqueio sem `fim` não entra na soma e é contado em `abertosForaDaSoma` (O19). `base.unidade` = "bloqueios encerrados" (O19) e "bloqueios encerrados com fornecedor" (T10).
- **O19:** `motivos` sempre com os 7 motivos, na ordem do domínio (a interface ordena por soma). `bloqueios` e `diasUteis` são censo e saem sempre. `pctDoTotal` é `taxa` com **k = bloqueios do motivo e n = total de bloqueios encerrados** (R6: o mínimo de 20 vale sobre bloqueios, nunca sobre dias; vem `insuficiente` com `k` e `n` abaixo de 20 no total). `duracao` é `estatistica` (P50/P85/P95 da duração em dias úteis, pela biblioteca) só com 20 ou mais bloqueios do motivo.
- **T10:** uma linha por fornecedor, em ordem alfabética, de todo bloqueio encerrado com fornecedor informado, de qualquer motivo da lista fechada (D-10 = A, R-5); bloqueio sem fornecedor (nulo ou em branco) fica fora. `duracao` só com 20 ou mais bloqueios do fornecedor. Sem `prazoDiasUteis`, `status` nem `prazoFornecedor`: a interface mostra a linha fixa "Prazo contratado não informado".
- **Mock (base não muda):** em 12 semanas o O19 tem 223 bloqueios encerrados e 4 abertos, e o menor motivo tem 25 (todos publicam P50/P85); com uma equipe só (26 bloqueios) todos ficam abaixo de 20 e só saem soma e contagem. T10 em 12 semanas: Alfa 19 (insuficiente), Beta 23, Gama 26; em 12 meses os três publicam.

### T12 (B4): rota ativa
- Desde o B4 `GET /api/v1/metricas/T12` existe (54 ids; OpenAPI regenerada). Filtros: equipe, tipo, sistema, período. Só BusinessMap; nenhum campo de pessoa. **Cartão no catálogo (`CATALOGO_CARTOES`): ainda não entra** (mesmo motivo do B3: quebra o catálogo e os testes do web; fica para o cartão do front). Entrada pronta: T12 em tático, seção `o-que-entra` "O que entra, e quando?" (leia junto `o14`, `o11`), `complementar` e `disponivel`.
- **Base:** demandas (story que não é bug interno; frente e projeto nunca entram) com `criado_em` dentro do período (padrão 12 semanas). `base.unidade` = "demandas criadas".
- **"Ida e volta" (D-8 = A, CA-39):** a demanda conta se tem bloqueio com motivo "Falta de informação no chamado" que começou antes do início (ou o card nunca iniciou), **ou** um retorno da coluna de papel `compromisso` para a de papel `backlog`. Os dois critérios são um OU: a demanda que tem os dois conta uma vez só.
- **Resposta:** `total` e `areas[{ area, taxa }]`, todos `taxa` (`{ status, k, n, pct }` com n >= 20, ou `{ status: 'insuficiente', k, n, minimo }`). `areas` por volume decrescente de demandas, desempate pelo nome (CA-11), nunca por taxa. `area` é a **área solicitante** (dimensão permitida): nunca a equipe do DSPD nem pessoa (R5; teste com cards de várias equipes e filtro de equipe).
- **Mock (base não muda): a parcela medida é 0%.** Em 12 semanas: 738 demandas em 8 áreas (Financeiro 143, Jurídico 123, Comercial 119, Atendimento ao Cliente 117, Operações 100, Logística 58, Recursos Humanos 40, DSPD (interno) 38), todas com n >= 20 e `k = 0`. Causa: o gerador só cria bloqueio depois do início do card e não gera retorno compromisso -> backlog. Fica fora do 10% a 25% e das duas áreas abaixo de 20 que a spec previa; decisão de ajustar o mock é do tech-lead (mudaria hashes e snapshots) e não foi tomada aqui. Os testes provam o cálculo com fixtures montadas à mão.

### E7 e E9 (B5): rotas ativas
- Desde o B5 `GET /api/v1/metricas/E7` e `GET /api/v1/metricas/E9` existem (56 ids; OpenAPI regenerada). Só BusinessMap; nenhum campo de pessoa nem de equipe. **Cartões no catálogo (`CATALOGO_CARTOES`): ainda não entram** (mesmo motivo do B3 e do B4: quebra o catálogo e os testes do web; fica para o cartão do front). Entradas prontas: E7 em estratégico, seção "O que custa manter o parque, e de quem depende?" (leia junto `t3`, `e2`), `complementar`, `disponivel`, filtros Sistema e Período (sem Equipe); E9 em estratégico, seção "Estamos terminando ou só começando?" (leia junto `e1`, `e4`), `complementar`, `disponivel`, filtro Sistema, "Não afetado por: Período".
- **Contrato do E9 confirmado (sem mudança):** a especificação (visual e tabela "projeto, aprovado em, idade") e o plano pedem `idadeDiasUteis` e `faixa`, que é o `resultadoE9` do B1. `deslizeDiasUteis`, `naData` e `replanejamentos` do plano (§2, linha do contrato) são do **E6**, não do E9.
- **E7 sem R$ (CA-13):** `custoConfigurado: false`; `custoRateado` e `custoPorDemanda` sempre `null` até o custo total do DSPD ser configurado (fase 3, T2.6); o front não mostra R$ nem o aviso de rateio enquanto `custoConfigurado` for falso. Base: demandas entregues no período (story que não é bug interno, sem subtarefa; peso por contagem, D-2). `base.unidade` = "demandas entregues".
- **E7, resposta:** `total` e `sistemas[{ sistema, entregas, participacao, porNatureza[4], custoRateado, custoPorDemanda }]`. `sistemas` por entregas decrescentes, desempate pelo nome, com os de **menos de 20 entregas no fim** (CA-11, nunca por "pior"). `participacao` é `taxa`: com `status: 'ok'` (`k` = entregas do sistema, `n` = total, `pct`) quando o sistema tem 20 ou mais entregas; senão `status: 'insuficiente'` com o "k de n" (n = total, se o total ficou abaixo de 20; n = entregas do sistema, nos demais casos). `porNatureza` sempre traz as 4 naturezas do T3 (Sustentação, Evolução, Projetos, Dívida técnica), na ordem do domínio, pela função `naturezaDe` do T3 (CA-23; teste falha se o E7 ganhar mapeamento próprio); cada `taxa` é `k` de `entregas` do sistema.
- **E9, resposta:** retrato de hoje; o período é aceito e ignorado. `projetos` = card de projeto sem início e sem entrega, fora de descartados e de arquivados sem desfecho, do mais antigo para o mais novo (`idadeDiasUteis` desc, desempate por id). `idadeDiasUteis` em dias úteis desde `criado_em` (aprovação, R-6). `faixa` é uma de `0–30`, `31–90`, `91–180`, `mais de 180` (limite superior inclusivo; constantes em `businessmap/e9.ts`). `codigo` = id do card. `referenciasP85` traz uma referência por tipo de projeto (`Iniciativa`, `Melhoria`), no padrão do E1 (`segmentoPor: 'tipo'`; regra geral 7 da especificação e Q4): cada `referenciaP85` é `estatistica` com `{ p85 }` do "antes do início" dos projetos concluídos **daquele tipo** na janela de 12 semanas que termina hoje, **importado de `concluidosDeProjeto` do E1** (não recalculado), e o mínimo de 20 vale por tipo; abaixo, `status: 'insuficiente'` com `n` e sem valor (a interface mostra "Sem referência: menos de 20 projetos concluídos" para o tipo). Cada projeto da lista traz `tipo`, para a interface casar o ponto com a referência do seu tipo, uma por vez (seletor local no padrão do E1). Nunca somar os dois tipos num P85.
- **Ajuste do B5 (K-078 B5-ajuste), mudança de contrato do E9:** o `referenciaP85` único (que juntava Iniciativa e Melhoria, contra a regra 7 e a Q4) foi substituído por `referenciasP85[{ tipo, referenciaP85 }]` mais `segmentoPor: 'tipo'`, e cada projeto ganhou `tipo`. A rota E9 ainda não está no catálogo do front, então nada publicado quebra.
- **Mock (base não muda):** E7 em 12 semanas: 634 entregas em 8 sistemas (3 abaixo de 20); em 12 meses: 3137 entregas, 8 sistemas, todos publicam. A spec previa 18 a 20 sistemas: o mock gera 8. E9: **3 projetos abertos e não iniciados** (idades 28,75, 36,75 e 61,75 dias úteis; faixas 0–30 e 31–90; nenhum acima de 180) e só 3 concluídos na janela, então a referência vem `insuficiente`. Por regra do plano (menos de 6 abertos), nenhum projeto foi criado; ampliar o mock é decisão do tech-lead (B11).

### Acréscimo ao O2 (bloco O23 "estoque parado")
- Campo `parados` em `resultadoO2`, **obrigatório desde o B2** (a resposta do O2 passa a trazê-lo sempre; os campos antigos não mudam). Forma: `{ limiteDiasUteis, taxa, porEtapa[{ etapa, k }] }`. `taxa` é "k de n" sobre o WIP atual (só publica o percentual com n >= 20; `k` e `n` sempre presentes). `porEtapa` segue as `etapas` do O2 (colunas com uma equipe, "Fila" e "Execução" sem equipe), uma entrada por etapa, inclusive com `k = 0`.
- Regra: parado é item em andamento com `semMoverHaDiasUteis` acima de 5 dias úteis (`limiteDiasUteis`). "Mover" é só mudar de coluna; tempo apontado nunca entra (7.1). O limite é a constante `LIMITE_PARADO_DIAS_UTEIS` (`core/criterios`), registrada como `VersaoCriterio` (`VERSOES_DA_BIBLIOTECA`, soma-se às da base) `criterio-2026-10-14-parados-v1` (afeta O2); mudar o valor exige nova versão no mesmo commit (T2.6).

### Novas chaves de segmentação (`ChaveSegmentacao`, biblioteca)
- `motivo-bloqueio` (O19), `fornecedor` (T10) e `mes-do-ano` (T11). `faixa-passagens` só entra na fase 2, com o O26. Nunca `pessoa`, `responsavel` nem `equipe`.

### Trava de pessoa na biblioteca (P-T6, ata 2026-10-14)
- Regra de lint `no-restricted-properties` proíbe ler `responsaveis` e `usuario` em `packages/metricas/src/businessmap/**` (exceto testes). A definição dos campos segue em `modelo.ts`, sem leitura. Meta-teste em `web/src/test/lint.meta.test.ts`.

## Percepção de valor (PV1, pesquisa trimestral)
Plano: `docs/architecture/features/lacuna-de-valor.md`. **Terceira fonte**, `pesquisa`: nem BusinessMap, nem Acelerato. Painel Sustentação, seção própria no fim (`grupo: 'percepcao'`, cartão `pv1`, `status: 'mock'`), com "leia junto" S1/S2 nos dois sentidos. Dados fictícios até existir carga real. Sem rota nova de leitura além da `GET /api/v1/metricas/PV1` e **sem rota de escrita** (a carga é script externo, B4).

- **Fonte por métrica:** `fonteDaMetrica(id)` (`@metricas-dspd/contratos`) devolve `'businessmap' | 'acelerato' | 'pesquisa' | 'ambos'`. Use-a em vez de `METRICAS_SUSTENTACAO.includes(id)` (PV1 cairia em "fluxo"). `METRICAS_PESQUISA = ['PV1']`; a PV1 **não** está em `METRICAS_SUSTENTACAO`. Tipo `FonteMetrica = Dominio | 'pesquisa'` (não alarga `Dominio`).
- **Query:** só `dataReferencia` (opcional, AAAA-MM-DD, não futura); qualquer outro parâmetro (equipe, prioridade, período) -> 400. Filtros do contrato: `Record<string, never>`. Rodapé da UI: "Não afetado por: equipe, prioridade, período".
- **Constantes** (`comum.ts`): `MINIMOS_PESQUISA = { consolidado: 5, area: 3, porAreaDesdeCiclo: 2 }`, `FAIXAS_ESCALA` (5 rótulos, faixa 1 a 5).
- **Resultado** (`ResultadoPV1`, schema `resultadoPV1`, zod estrito: chave fora do schema reprova):
  - `{ status: 'sem-pesquisa', fonte: 'pesquisa' }`: nenhuma pesquisa até a `dataReferencia`. Estado: "Nenhuma pesquisa carregada...", sem botão de upload.
  - `{ status: 'ok', fonte: 'pesquisa', trimestre ('2026-T3'), ciclo (1 = primeiro), questionario { versaoId, vigenteDesde, perguntas[{codigo, ordem, texto}] }, participacao { respondentes, convidados, taxa: Taxa }, consolidado: Bloco(5), porArea, tendencia[] (até 4), oQueMudou { trimestre, texto } | null, criterios, base { n, unidade: 'respostas', janela: null } }`.
  - **Bloco** (`consolidado` mínimo 5, área mínimo 3, ponto da tendência mínimo 5): `{ status: 'base-insuficiente', n, minimo }` (n abaixo do mínimo; **sem faixas**; a UI mostra só "Base insuficiente: N respostas. Mínimo M", U2) ou `{ status: 'publicado', n (>= mínimo), perguntas[{ codigo, faixas[{ faixa: 1..5, contagem: Taxa }] }] }`. Em `contagem`, `Taxa.n` é o `n` do bloco: n de 5 a 19 vem `insuficiente` (só "k de n", sem percentual); n >= 20 vem `ok` com `pct`.
  - **porArea:** `{ status: 'nao-publicado', motivo: 'primeiro-ciclo' | 'base-insuficiente' }` ou `{ status: 'publicado', areas[{ rotulo, outras, bloco: publicado }] }` em ordem alfabética, com "Outras áreas" (`outras: true`) por último e no máximo uma vez. Anonimato (A10, no schema): consolidado menos a soma das áreas publicadas nunca dá 1 ou 2.
  - **tendencia[]:** `{ trimestre, versaoId, bloco: { status: 'base-insuficiente', n, minimo: 5 } | { status: 'publicado', n, concordam[{ codigo, contagem: Taxa }] } }`; "concordam" = faixas 4 e 5 somadas (U3, provisório). Troca de `versaoId` entre pontos gera marcação em `criterios.serie` (T2.6): a UI desenha a quebra de série.
- **O contrato proíbe por desenho:** média, nota única, meta, semáforo, ranking (ordem fixa), campo de pessoa ou de comentário, percentual com n < 20.
- **Estado atual do back-end (B1):** os contratos e o schema estão publicados; até a biblioteca (B2) e a fonte `pesquisa` do serviço (B3) a rota devolve sempre `sem-pesquisa`, sem ler BusinessMap nem Acelerato.
- **Linha do CSV de carga** (`linhaPesquisaSchema`, `COLUNAS_CSV_PESQUISA`): `trimestre,area,pergunta,f1,f2,f3,f4,f5,convidados`; coluna extra recusa o arquivo; sem `@`; soma das faixas <= convidados.

## Cache
- Chave: `métrica + versão de carga (marca d'água da coleta + versão de critério mais recente) + versão de critério vigente + dataReferencia + filtros normalizados (listas ordenadas)`. A base (`BaseBM`/`BaseAC`) fica em memória por versão de carga; a marca d'água é relida a cada 60 s. Máximo de 500 resultados por domínio (descarta o mais antigo). Mudança de `ref_*` sem nova coleta só vale após reiniciar a api (ou nova coleta/versão de critério).
- Invalida quando uma coleta incremental conclui (muda a data de referência/última coleta) ou quando uma nova versão de critério é registrada. Não sobrescreve histórico da base; só descarta resultados calculados.
- Cache por domínio; chaves de fluxo e sustentação nunca compartilham entrada. Cache compartilhado só se a resposta independer de usuário (hoje independe; revisar se a ADR de auth introduzir escopo por equipe).

### S8: critério de contagem (decisão 14, 2026-10-11)
- Campo novo e obrigatório em `resultadoS8`: `cobertura: { n: number, total: number }` ("n de N": n = incidentes do período com o campo `reincidente` informado; total = incidentes abertos no período). Sem extensão: `{ n: 0, total: N }`.
- Semântica alterada (mesmos nomes): `meses[].encerrados` passa a ser incidentes **abertos** no mês (antes, encerrados) e `reabertos` os chamados reincidentes abertos no mês; `base.unidade` = "incidentes abertos". Critério versionado (T2.6): marcar a mudança nos gráficos.

- Rodada 2 (R2-1/R2-2/R2-3): campos novos e obrigatórios `resultadoS8.meses[].informados`, `resultadoS12.cobertura {n,total}` e `resultadoS12.reincidencia[].informados`; a taxa da S8 e a proporção da S12 passam a dividir por `informados`. `leiaJunto` (catálogo em `cartoes.ts`) segue o mapa final da decisão 19 e pode apontar para cartão de outro painel (ids únicos; novo `cartaoPorIdGlobal(id)`).

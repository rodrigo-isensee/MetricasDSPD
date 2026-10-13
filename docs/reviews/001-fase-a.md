---
contrato: 0
---
# Code review — 001 · fase A (K-004 scaffold, biblioteca e mock; K-022 shell, filtros, tema e componentes)

- Data: 2026-10-09 · Revisor: tech-lead · Autor: react-frontend
- Referências: `docs/briefing-execucao-metricas.md` (04, 06, 07), `CLAUDE.md`, `docs/engineering/praticas.md` v2, ADR 0001/0002/0003, ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md` (D6, D7, D8), spec `docs/ux/dashboard-metricas.md`, review anterior `docs/reviews/001-docs-adr-praticas.md`
- Escopo: `web/` inteiro (não rastreado), em 4 blocos (D8)

## Parecer
**Ajustes necessários.** 14 bloqueantes, 19 recomendados e 6 perguntas para o Jarvis levar à UX ou ao usuário. A base é boa: a `core` concentra tempo, janela, percentil e regra dos 20; contratos sem pessoa; UI só pela `FonteMetricas`; testes de UI cobrem estados e acessibilidade. Os bloqueios estão em segmentação (espera invisível), numa regra do briefing (arquivado tratado como descartado), na ordenação do T5, na base do O1, em performance e nas fronteiras de lint.

Nada foi corrigido por mim. Correções de lógica voltam ao autor. Sem commit até os ajustes e o QA.

## Verificação executada pelo revisor (`source ~/.nvm/nvm.sh; cd web`)
| Comando | Resultado real |
|---|---|
| `npm run lint` | verde (exit 0) |
| `npm run typecheck` | verde (exit 0) |
| `npm test` | 7 arquivos, **109 testes** passando, 7,6 s |
| `npm run build` | verde, 0,48 s. Inicial `index` **177,76 KB gz** (F6 < 200: ok). `OperacionalPage` 111,30 KB gz (Recharts dentro do chunk da rota; F7 < 60: alerta). `mock` 7,93 KB e `metrics` 14,94 KB fora do inicial (F9: ok) |
| `npx prettier --check .` | ok |
| Medição de tempo (teste temporário, removido) | geração 182 ms + contexto 83 ms (C1 ok). **O1 427 ms a frio e ~417 ms em toda chamada** (sem memo). **`VISAO_GERAL` 458–507 ms**. EI_FL1 19 ms, O9 23 ms; demais ≤ 18 ms |

## Bloco 1 — Cálculo e contratos (rigor máximo)
Conforme: janela única em `JANELA_POR_GRANULARIDADE` (12 semanas para tudo) usada por `janelaPercentis` nos dois domínios; mínimo 20 por `estatistica`/`taxa`/`histograma`; P50/P85/P95 sempre com a mediana; média só em `resumoComMedia` (O3, S1) e na faixa do T4, nunca sozinha; horas e dias úteis só pela `core/calendario`; BM e AC em pastas sem import cruzado; `calcularVisaoGeral` só compõe blocos com `fonte` (condições do review anterior atendidas); `amostraBM` por granularidade (T7 em frente, nunca com story); `criterios` (T2.6) em todo DTO; nenhum DTO por pessoa (teste com regex).

### Bloqueantes
| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| B1 | `web/src/lib/metrics/businessmap/ei.ts:62-92`; `web/src/contracts/schemas.ts:687-705` | **Decisão do Jarvis: procede.** EI-FL1 calcula uma mediana única com todos os tipos de demanda (com "Todos" no filtro). Fere o 4.2 ("segmentação sempre por tipo de demanda e por granularidade") e a D5 da spec (uma classe por vez). | `resultadoEI` passa a ter `classes: [{ classe, n, estatistica, serie }]` + `classeSugerida`. FL1: uma classe por `TipoCard` (demandas, como hoje sem Bug interno), aba no padrão `SeletorLocal`. FL2 e FL3: uma classe só (a granularidade), no mesmo formato, para o contrato ser uniforme. Teste: duas classes com medianas diferentes não se misturam; classe com n < 20 fica insuficiente enquanto a outra publica. |
| B2 | `web/src/lib/metrics/acelerato/ei.ts:22-46` | EI-SUST junta P1 a P5 numa mediana só. Contradiz o próprio desenho do domínio (`amostraAC`: "a classe é a prioridade, nunca agregada") e o S1. | Mesmo formato do B1, com uma classe por prioridade, construída por `amostraAC`. Se também for preciso separar por natureza (incidente × requisição), ver a pergunta Q2. |
| B3 | `web/src/lib/metrics/businessmap/indice.ts:131`, `estado.ts:38`, `o10.ts:18` | **Arquivado é tratado como descartado.** `ativo` exclui todo card com `arquivado_em` de ciclo, vazão, T1–T4, EI etc. No BusinessMap, arquivar é o fim normal de um card entregue. Fere o 7.3 ("Card arquivado nunca é excluído da base analítica"). Hoje o mock só arquiva descartados, por isso os testes não pegam, mas a `metricas` vai para o servidor (ADR 0002). | Descarte = `motivo_descarte !== null` (modelo 4.5 tem os dois campos). `arquivado_em` não tira o card de nenhum cálculo. O mock passa a gerar entregues arquivados depois. Teste: card entregue e arquivado continua em O3, O4 e T1. Se houver dúvida sobre como identificar descarte, vira pergunta (Q6), não decisão no código. |
| B4 | `web/src/lib/metrics/businessmap/t5.ts:45-49` e `:70` | Os grupos são ordenados pela **parcela de falha**. A spec (L10, critério 108) manda "ordem neutra: por volume, desempate alfabético, nas duas abas"; ordenar por falha "transforma o gráfico em ranking de áreas". | Ordenar por `n` desc e depois `nome`. Calcular os "2 piores sistemas" (`piores`, linha 70) numa seleção separada, só para `porSistema`. Teste da ordem nas duas abas. |
| B5 | `web/src/lib/metrics/businessmap/o1.ts:89-92` | **O1 `base.n`: fere a spec.** A spec de O1 diz "Base amostral: 60 dias úteis · 14 itens em progresso hoje" e "o percentual de dias exige 20 dias úteis". A base principal tem de ser o denominador da estatística publicada (dias úteis, que governa a regra dos 20). O complemento é o WIP **de hoje** (`hoje.total`), não os itens distintos vistos no período. Do jeito atual o selo de base fica com o número errado e com a semântica invertida. | `baseAmostral(out.length, 'dias úteis', periodo, { n: total, unidade: 'itens em progresso hoje' })`. Remover `vistos`. |
| B6 | `web/src/lib/metrics/businessmap/o1.ts:26-40`; `web/src/lib/metrics/visaoGeral.ts:42`; `web/src/data/mock/MockFonteMetricas.ts:71` | **Desempenho fora do orçamento (ADR 0003, D6).** Medição minha: O1 427 ms em **toda** chamada (estoura C3 < 50 ms e o limite de CI de 150 ms); `VISAO_GERAL` 458–507 ms (C4 < 300 ms). O QA tinha medido 554 e 655 ms. Não há memoização em nenhum ponto. | Remédios da ADR 0003. (1) O1: WIP diário numa varredura única das transições ordenadas (eventos +1/−1 por dia), uma vez por contexto e memoizado por quadro, recortado por busca binária. (2) Memo de resultado por `(MetricaId, filtros normalizados com período)` e `VISAO_GERAL` montada a partir dele. (3) Testes de tempo C3/C4 no Vitest (frio e 20×; CI 150 ms por métrica, 900 ms por painel; valor impresso). **Entregar a medição antes/depois** (geração, contexto, as 33 métricas a frio e quentes, `VISAO_GERAL`), com o hash da base e os testes de métrica inalterados. |
| B7 | `web/src/data/mock/MockFonteMetricas.ts:79,99`; `web/src/lib/metrics/businessmap/o4.ts:47-48`; `t2.ts:50`; `t4.ts:12-13` | **Procede.** `Math.min(...array)`/`Math.max(...array)` com spread ainda existem (D6 previa trocar e só parte foi feita). O `opcoesFiltro` espalha cerca de 6 mil valores. | Helper `minMax(valores)` em laço na `core`, usado em todos os pontos. No O4, também tratar lista de semanas vazia. |
| B8 | `web/eslint.config.js:52-126` | **Fronteiras de lint pendentes do review anterior: procede.** Faltam regras equivalentes à ADR 0002 dentro de `web/src`. (a) `src/mock/businessmap/**` × `src/mock/acelerato/**`, e cada um sem importar a `lib/metrics` do outro domínio. Foi essa falta que deixou o `CRITERIOS_MOCK` passar. (b) `lib/metrics/core/**` não importa `businessmap`, `acelerato` nem a raiz; `businessmap` e `acelerato` não importam a raiz (`../calcular`, `../visaoGeral`, `../index`). (c) `contracts/**` só importa `zod`. (d) `src/data/**` fora de `data/mock/**` não importa `lib/metrics` nem `mock`; em `data/mock/**`, só `import()` dinâmico (`import type` liberado, por `@typescript-eslint/no-restricted-imports` com `allowTypeImports`). (e) `src/components/charts/**` desliga `no-restricted-imports` inteiro (linhas 76-78), o que libera `lib/metrics` e `mock` nos gráficos. (f) `Math.min/max` com spread e getters locais de `Date` (`getHours`, `getDay`...) não estão em `proibidoNoCalculo`; spread proibido "em todos os pacotes" (práticas, seção 2). | Adicionar (a) a (f). Em (e), repetir a regra da UI sem a entrada do Recharts, em vez de `off`. Para (f), um seletor do tipo `CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/] > SpreadElement`. Incluir no README-dev a tabela de fronteiras. |
| B13 | `web/src/data/mock/MockFonteMetricas.ts:51-54` | **Procede.** Não há teste de `ctx.bm.hojeIso === ctx.ac.hojeIso`. A `VISAO_GERAL` usa `bm.hojeIso` como data de corte. | Teste na fonte mock (e, se possível, uma asserção na montagem do contexto que lance erro se divergirem). |
| B14 | `web/src/lib/metrics/businessmap/businessmap.test.ts`, `acelerato/acelerato.test.ts` | Práticas, seção 4: "toda métrica tem teste unitário" com n = 19/20, critério cruzando o período e bordas de janela. Sem teste unitário próprio: O2, O4, O7, O9, O10, O12, T1, T2, T3, T4, T5, E1, E2, E3, S3, S4, S5, S6, BLOQUEADOS e VISAO_GERAL (hoje só a validação de schema). | Teste parametrizado sobre os `MetricaId` com as fixtures de `testing.ts` (19 → insuficiente, 20 → publica, marcação presente quando a data cruza) mais testes específicos de B1–B5. VISAO_GERAL: blocos com `fonte` certa e nenhum status derivado das duas fontes. |

### Recomendados
| # | Arquivo:linha | Problema | Sugestão |
|---|---|---|---|
| R1 | `businessmap/indice.ts:175,194`; `acelerato/indice.ts:109`; `core/calendario.ts` (`dataIso`, `instanteDeIso`) | `CALENDARIO_PADRAO` como parâmetro padrão: práticas, seção 2 ("nenhuma métrica o usa implicitamente"). | Calendário obrigatório na montagem do contexto; o padrão fica só no mock. |
| R2 | `businessmap/indice.ts:176` | A chave do cache do índice ignora feriados e turnos: dois calendários com feriados diferentes compartilham o índice. | `WeakMap` por objeto `Calendario`, ou chave com feriados e turnos. |
| R3 | `o1.ts:28,50`; `o2.ts:32`; `t7.ts:24`; `o10.ts:14`; `bloqueados.ts:12` | Corte às 17:00 fixo no código. | `fimDoExpediente(dia, cal)` na `core`, a partir do último turno. |
| R4 | `o9.ts:73`; `t7.ts:87`; `visaoGeral.ts:99,231,298`; `features/operacional/components/CartaoO4.tsx:25,27` | Literal `20` e "12 semanas" no texto em vez de `publicavel`/`MINIMO_AMOSTRA` e da janela do DTO. | Usar a constante e `d.base.janela`. |
| R5 | `o9.ts`, `t1.ts`, `e1.ts`, `o10.ts`, `acelerato/s4.ts` (`calcularPercentis` sobre arrays crus); `core/index.ts:4` | O tipo `Amostra` (que impede mistura de classe e domínio) é contornado, e `criarAmostraInterna` sai no índice público da `core`. | Passar por `amostraBM`/`amostraAC` + `percentis()`; não reexportar `criarAmostraInterna`. |
| R6 | `o18.ts:28`, `o18.ts:25` | `86_400_000` local em vez de `MS_DIA`; cópia do array a cada bug (O(n²)). | `MS_DIA` da `core`; `push` na lista existente. |
| R7 | `bloqueados.ts:23`; `estado.ts:13`; `o2.ts` (cast de motivo) | Na falta de motivo, inventa "Aguardando fornecedor"; `motivo: string` obriga a casts. | Tipar como `MotivoBloqueio`, remover o fallback e os casts. |
| R8 | `lib/metrics/calcular.ts:20,93` | `filtros as FiltrosFluxo & FiltrosSustentacao` e `r as ResultadoDe<K>` anulam o tipo do contrato. | Mapa tipado `{ [K in MetricaId]: (f: FiltrosDe<K>, ctx) => ResultadoDe<K> }`. |
| R9 | `o7.ts:62` | `saldoAcumulado` por tipo é igual a `saldoPeriodo`. | Remover ou definir (acumulado desde o início do histórico?) com a UX. |
| R10 | `o4.ts:43` | `totalJanela` conta a semana corrente, mas a faixa usa só semanas completas (a spec diz "112 itens em 12 semanas completas"). | Base = soma das semanas completas. |
| R11 | `businessmap/comum.ts:81-82`; `acelerato/comum.ts:44` | `horasEntre` é código morto (cálculo de tempo fora da `core`); `r2` duplica `arredondar`. | Remover `horasEntre`; usar `arredondar`. |
| R12 | `contracts/comum.ts:173`; `contracts/schemas.ts:723-724` | O schema aceita `status: 'ok'` com n < 20; `indicadorVG.metrica/codigo` são `z.string()`. | `n: z.number().min(MINIMO_AMOSTRA)` no ramo `ok`; enums. Isso protege a futura `HttpFonteMetricas`. |
| R13 | `data/useMetrica.ts:36` | `?mock=` vale para qualquer fonte, inclusive a futura API. | Aplicar só com `fonte.tipo === 'mock'`. |
| R14 | `mock/mock.test.ts:177-178`; `mock/acelerato/gerador.ts:236` | O teste "dia da abertura cai em dia útil" só verifica `> 0`; há um comentário sem efeito. Não existe teste com o hash fixo da base padrão, que é a linha de base da extração (D3). | `ehDiaUtil`; remover o comentário; teste de hash golden da base padrão. |
| R15 | `data/mock/MockFonteMetricas.ts:80,115` | `Date.parse` em vez de `lib.instanteDeIso`. | Uniformizar com a `core`. |
| R17 | `features/painel/PainelPagina.tsx:49`; `CartaoO4.tsx:52` | `as unknown as` e `as NonNullable`. | Genéricos corretos em `BarraFiltros`; `NOTAS_OPERACIONAL` tipado por `MetricaId`. |
| R18 | `vite.config.ts`; `contracts/metricas.ts` (`SCHEMAS_RESULTADO`) | O Recharts entra no chunk da rota Operacional (111 KB gz, alerta F7). Os schemas zod de resultado vão para o inicial porque a UI importa `APLICABILIDADE_FLUXO` do mesmo módulo. | `manualChunks` para um chunk de gráficos compartilhado; `SCHEMAS_RESULTADO` em módulo próprio (`contracts/validacao.ts`). |
| R19 | `web/package.json:18` | `check` não roda `prettier --check` (práticas, seção 2 [CI]). Hoje passa. | `"format:check": "prettier --check ."` dentro do `check`. |

## Bloco 2 — Mock
Conforme: PRNG mulberry32 com semente e sementes derivadas por domínio; nenhum `Math.random`/`Date.now`/`new Date()` (lint ativo em `src/mock/**`); "hoje" por `ConfigMock`; pessoas só como "Pessoa NN" (testado); equipes, fornecedores, áreas e títulos fictícios (sistemas são nomes de produto, e as equipes SSSC vêm do briefing); invariantes de hierarquia, marcos, filas, matriz de prioridade, população DSPD-SSSC e totalizadores testados.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B9 | `web/src/mock/acelerato/gerador.ts:31,240` | **Procede.** O gerador do Acelerato importa `CRITERIOS_MOCK` de `mock/businessmap/catalogos.ts` (cruza BM × AC). | Mover a constante, **sem alterar o conteúdo**, para `web/src/mock/criterios.ts` (neutro) e importar nos dois geradores: o hash da base não muda. Commit próprio antes da extração (ADR 0002), com o hash antes e depois na mensagem. | bloqueia |
| B10 | `web/src/mock/mock.test.ts:30` | **Procede.** Limite do teste de tempo do gerador em 4000 ms. | `toBeLessThan(1500)` (C2), com o valor real impresso. | bloqueia |
| — | R14 (acima) | teste vazio, comentário sem efeito, hash golden | — | recomendado |

## Bloco 3 — Dados
Conforme: `FonteMetricas` é a única entrada (lint em `features/`, `components/` e `app/`; telas usam `useMetrica`/`useOpcoesFiltro`); a fonte é assíncrona; gerador e biblioteca entram por `import()` dinâmico (chunks separados); `?mock=carregando|erro|vazio|erro:<id>` implementado e testado; `keepPreviousData` mantém o conteúdo anterior na troca de filtro.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B11 | `web/src/app/App.tsx:19`; `web/src/data/mock/MockFonteMetricas.ts:22-23,61` | **Procede.** D7 pede latência simulada de 150 a 400 ms, e o app cria a fonte sem latência nenhuma (`latenciaMs` padrão 0, valor fixo, não faixa). A ADR 0003 pede um modo para zerar em teste e em medição. | `latencia: { minMs, maxMs }` com padrão 150–400 no app (sorteio determinístico por PRNG com semente, para E2E reprodutível); `0` por opção do construtor e por `VITE_MOCK_LATENCIA=0` (documentar em `.env.example` e no README-dev); testes unitários e projeto `perf` com zero. | bloqueia |
| B7, B13 | (bloco 1) | `Math.min(...)` em `opcoesFiltro`; teste `hojeIso` | — | bloqueia |
| R13, R15 | (bloco 1) | `?mock=` só no mock; `Date.parse` | — | recomendado |

## Bloco 4 — Componentes, shell e acessibilidade
Conforme: Recharts só em `components/charts/`; todo gráfico em `GraficoBase` com `figcaption` e tabela equivalente (`caption`, `th scope`, região rolável rotulada e focável); "Pular para o conteúdo"; foco no `h1` na troca de rota e no título do cartão por âncora; `aria-current`; tema claro/escuro/sistema sem flash; filtros na URL com histórico, chips, "Limpar filtros" e valores inválidos ignorados com aviso; esqueleto com atraso de 150 ms e mínimo de 300 ms; `aria-busy`; erro por cartão com "Tentar de novo". **D7 (UX):** atendida na interface. A troca de filtro mantém o conteúdo com `opacity-60` + `aria-busy`, e o esqueleto só aparece sem dados, ou seja, na carga inicial e na troca de painel. A suficiência da "indicação discreta" fica para a revisão de UX (D11).

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B12 | `web/src/components/ui/CartaoMetrica.tsx:103` | A ADR 0003 (F4/F5) exige uma marcação estável do estado do cartão para o projeto `perf` do QA, e ela não existe. | `data-estado="carregando|atualizando|ok|vazio|erro"` na `section`, e `data-atualizando` no painel. Combinar os nomes com o QA. | bloqueia |
| R16 | `web/src/components/ui/AlternarTabela.tsx:18` | `aria-pressed` junto com um rótulo que muda ("Ver como tabela"/"Ver como gráfico"): leitor de tela anuncia "Ver como gráfico, pressionado". | Escolher um padrão: rótulo que muda **sem** `aria-pressed` (preferido) ou rótulo fixo com `aria-pressed`. Confirmar com a UX. | recomendado |
| R4, R17, R18 | (bloco 1) | literais no `CartaoO4`, casts, chunks | — | recomendado |

## Perguntas para o Jarvis (não resolver no código)
- **Q1 (UX):** depois do B1/B2, o que a Visão geral mostra em Espera invisível por nível (`schemas.ts:757`)? Uma linha por classe, ou só a classe sugerida com o link? Hoje a VG publicaria a mediana misturada.
- **Q2 (usuário):** na sustentação, incidente e requisição são tipos distintos (4.3) e o mock tem `natureza`. EI-SUST, S1, S2 e o tempo por etapa do S4 (que hoje mistura P1–P5, `s4.ts:43`) também separam por natureza?
- **Q3 (usuário):** no FL2, T1, T2 e T4 segmentam por classe de serviço, conforme o catálogo, e misturam tipos dentro da classe. Confirmar que a classe de serviço substitui o tipo no nível tático.
- **Q4 (usuário):** EI-FL3 e E1 juntam projetos Iniciativa e Melhoria (mesma granularidade). Aceito, ou separa?
- **Q5 (usuário):** E2 conta como "evolução" só Melhoria (`e2.ts:42`); em 4.3, Iniciativa e Dívida técnica também são Evolução.
- **Q6 (usuário):** descarte = card com `motivo_descarte` preenchido (base do B3)?

## Próximos passos
1. O react-frontend corrige B1–B14 (e os recomendados que couberem) e devolve com a medição antes/depois (B6) e o hash da base (B9).
2. Novo review só dos itens (delta). Depois, QA da fase A e commits pelo tech-lead: primeiro o `fix(mock)` do `CRITERIOS_MOCK` em commit próprio, depois a fase A, e então a extração (D3).

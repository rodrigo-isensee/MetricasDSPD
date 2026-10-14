---
contrato: 0
---
# Plano e parecer de testes - intensivo sistêmico da main

Links: regras invioláveis (`CLAUDE.md`), contrato HTTP (`docs/contratos/http.md`), páginas de métrica (`docs/contratos/metricas/`), orçamento de performance (ADR 0003), planos de QA anteriores (`docs/qa/`).

- **Versão testada:** `main` 0af552a (merge do PR #60). Branch de trabalho `test/qa-intensivo-main` (worktree `MetricasDSPD-qa`, compartilhado com a QA de filtros).
- **Data:** 2026-10-13. **Ambiente:** WSL2, 8 núcleos, 8 GB, Node 24.21, pnpm 10.34, Playwright 1.64 (Chromium headless shell 1248), PostgreSQL 17 do container `metricasdspd-postgres-1`.
- **Carga da estação:** compartilhada com outros agentes; nunca ficou ociosa. O load de 1 minuto no início de cada execução está registrado em cada linha abaixo. Os números de desempenho valem para essa carga, não para a máquina ociosa da ADR 0003.
- **Isolamento:** as rodadas de base (pronto e E2E) rodaram numa cópia limpa da main (`git archive 0af552a` + `pnpm install --frozen-lockfile --offline`), porque o worktree recebeu arquivos novos da outra QA no meio da 2a rodada (o `format:check` reprovou um arquivo dela). Todo comando pesado rodou sob `flock /tmp/metricas-pesado.lock`.

## Escopo
Coberto: suíte completa repetida; consistência entre telas (Visão geral, cartões, catálogo, "Leia junto", PDF, marcação T2.6); as 51 rotas `GET /api/v1/metricas/:id` com filtros válidos e inválidos, ETag/304 e o orçamento A1 a A3; `test:pg`; regras invioláveis como teste de sistema (pessoa, regra dos 20, BusinessMap x Acelerato, story/frente/projeto); robustez (`?mock=`, navegação rápida, recarga, tema, 375 e 1280, axe em todas as rotas, desempenho).

Fora ou indisponível na main:
- **Paridade mock x API pelo script `scripts/com-api-mock.sh` + `test:paridade`:** não existe na main (nem o script nem o alvo no `web`). A paridade que existe é `server/tests/metricas.paridade.test.ts` (as 51 métricas calculadas pela biblioteca sobre o mock = calculadas pelo serviço sobre as linhas do seed), que passou nas 3 rodadas do pronto. O front da main só tem a fonte mock (não há `HttpFonteMetricas`), então não há paridade de tela x API a medir.
- **Exportação CSV e imagem:** não existem na main; só PDF (pedido 008). O PDF foi comparado com a tela.
- Filtros em profundidade: com a QA de filtros (`docs/qa/bugs/IF-*`).

## Cenários
Legenda: S = sistêmico de API (Vitest + `inject`), E = E2E (Playwright), A = axe. Arquivos: `server/tests/api.sistemico-intensivo.test.ts`, `server/tests/api-perf.sistemico-intensivo.test.ts`, `e2e/tests/intensivo-sistemico.spec.ts`.

| ID | Cenário | Tipo | Prio | Auto | Resultado |
|---|---|---|---|---|---|
| SIS-API-01 | 51 rotas x filtros válidos por domínio (fluxo 12, sustentação 9, visão geral/PV1 2): 200, DTO no schema, `ETag` fraco estável, `X-Data-Referencia`, `X-Versao-Criterio`, `Cache-Control`; `If-None-Match` = 304 sem corpo; ETag diferente = 200 | S | Alta | sim | 51/51 |
| SIS-API-02 | 51 rotas x filtros inválidos (desconhecido, pessoa, outro domínio, data futura/mal formada, período incoerente, `page`/`pageSize` fora do limite): 400 `VALIDATION_ERROR` sem ecoar o valor | S | Alta | sim | 51/51 |
| SIS-API-03 | ETag muda com filtro aplicável, período, data de referência e página; listas em outra ordem = mesma chave | S | Média | sim | ok |
| SIS-API-04 | Id inexistente, minúsculo, `S13`, `EI-FL1` = 404 `METRICA_NAO_ENCONTRADA` | S | Média | sim | ok |
| SIS-INV-API-01 | Nenhuma resposta (51 rotas x filtros) contém nome ou id de pessoa da base, e-mail ou chave de pessoa | S | Alta | sim | ok |
| SIS-INV-API-02 | Regra dos 20 em todo nó das respostas: insuficiente nunca publica valor, percentil ou percentual; percentil/percentual só com n (ou denominador) >= 20 | S | Alta | sim | ok |
| SIS-INV-API-03 | Histogramas: soma das faixas = n da estatística | S | Média | sim | ok |
| SIS-ISO-01 | Trocar a base inteira do Acelerato não muda nenhuma métrica do fluxo; trocar a do BusinessMap não muda nenhuma da sustentação (com controle de sensibilidade) | S | Alta | sim | ok |
| SIS-GRAN-01 | Cada histograma do fluxo é reproduzido por exatamente uma granularidade (base reduzida só a story, só a frente, só a projeto) | S | Alta | sim | ok |
| SIS-PERF-API | A3: payload gzip < 50 KB nas 51 rotas (volume padrão); A1/A2 registrados | S | Média | sim | ver Desempenho |
| SIS-CONS-01 | Catálogo: as 46 linhas levam a um cartão existente com o mesmo código, nome, fonte e granularidade | E | Alta | sim | **falha: IS-005** |
| SIS-CONS-02 | "Leia junto": todos os links dos quatro painéis (duas cadências) levam ao cartão certo, visível | E | Alta | sim | ok |
| SIS-CONS-03 | Visão geral x Espera invisível: cliente, time, índice e n (ou "n de 20") do resumo = cartão de destino, no mesmo segmento | E | Alta | sim | ok |
| SIS-CONS-04 | Visão geral x painel: BLOQUEADOS, O2, E3 e T9 (k de n) batem com o cartão de origem | E | Alta | sim | ok |
| SIS-CONS-05 | PDF x tela: a base de cada cartão de 5 painéis aparece igual no PDF; PDF sem pessoa | E | Alta | sim | **falha: IS-006** |
| SIS-CONS-06 | T2.6: em 12 meses, aviso de mudança de critério em todos os cartões afetados (O7, O9, O10, T1, EI-FL1..3 com 02/03/2026; S1..S7, EI-SUST com 01/06/2026), nunca nos demais nem com a data da outra fonte; em 4 semanas nenhum (exceto PV1, critério próprio do questionário) | E | Alta | sim | ok |
| SIS-INV-01 | 11 rotas com complementares abertos, tabelas e notas ligadas: nenhum nome/e-mail de pessoa nem coluna de pessoa | E | Alta | sim | ok |
| SIS-INV-02 | Recorte estreito: todo bloco insuficiente diz "n de 20" com n < 20 e nenhum cartão insuficiente mostra P50/P85/P95 | E | Alta | sim | ok |
| SIS-INV-03 | Painel do fluxo sem "Fonte: Acelerato" e vice-versa; filtro do fluxo não muda o EI-SUST (números e textos) | E | Alta | sim | **falha: IS-004** (números ok, textos não) |
| SIS-ROB-01 | 6 painéis x `?mock=carregando` (todos `aria-busy`), `vazio` (todos vazios; BLOQUEADOS = "Nenhum item bloqueado") e `erro` (erro de painel com navegação) | E | Alta | sim | 6/6 |
| SIS-ROB-02 | 6 painéis x `?mock=erro:<id>` para cada cartão: só aquele fica em erro | E | Alta | sim | 6/6 |
| SIS-ROB-03 | Navegação rápida: 4 voltas pelos 8 destinos sem esperar; termina íntegro, sem erro de página nem de console | E | Média | sim | ok |
| SIS-ROB-04 | Recarregar no meio do carregamento em cada painel: termina pronto, sem erro | E | Média | sim | ok (ver Instabilidade) |
| SIS-ROB-05 | Voltar/avançar preserva filtros e conteúdo | E | Média | sim | ok |
| SIS-VIS | 11 rotas x tema claro/escuro x 375/1280 (44 casos): `data-theme` certo, sem rolagem horizontal, axe `wcag2a/2aa/22aa` sem violação séria ou crítica, sem erro de console | E/A | Alta | sim | 44/44 |

## Dados de teste
- API: `gerarBaseMock({ escala: 0.25 })` servida por um banco falso que devolve as linhas que o seed gravaria (`server/tests/base-duble.ts`); outra semente (4242) para a troca de base; volume padrão (escala 1) no teste de orçamento.
- E2E: build de produção da main servido por `vite preview` (latência simulada padrão, 150 a 400 ms). Cada teste abre as próprias URLs; nada depende de ordem.

## Resultado da execução

### Suíte completa repetida (main, sem os testes novos)
| Execução | Load no início | Resultado |
|---|---|---|
| `pnpm run pronto` 1 (cópia limpa) | 3,62 | vermelho: web 6 de 758 por timeout de 15 s (IS-001); demais pacotes verdes |
| `pnpm run pronto` 2 (cópia limpa) | 5,80 | vermelho: `mock/desempenho.test.ts` O9 p95 327 ms > 300 ms (IS-002); `pnpm -r` parou antes do web |
| `pnpm run pronto` 3 (cópia limpa) | 5,80 | vermelho: web 12 de 758 por timeout (IS-001) |
| `pnpm run pronto` (worktree, antes da contaminação) | 2,07 | vermelho: web 5 de 758 por timeout (IS-001) |
| só o web (`vitest --coverage`), cópia limpa | 7,45 | 1 de 758 por timeout (IS-001) |
| E2E Chromium completo 1 (`chromium` + `chromium-semente-alt`) | 6,69 | 348 ok, 2 falhas, 1 não rodou |
| E2E Chromium completo 2 | 9,29 | 351 ok |
| E2E Chromium completo 3 | 4,61 | 346 ok, 4 falhas, 1 não rodou |

Pacotes estáveis nas 3 rodadas: contratos 41, metricas 504, mock 157 (156 numa), server 300 (+62 de PG pulados sem `PG_TESTE_URL`), tools 120. Cobertura de 100% mantida onde exigida.

### Instabilidade (flaky) observada e causa
| Teste | Rodadas com falha | Causa |
|---|---|---|
| 17 testes do web (Vitest), p. ex. `preferencias.test.tsx`, `operacional/diaria.test.tsx`, `semanal.test.tsx` | 4 de 4 execuções do pronto/web | timeout de 15 s sob carga, nunca asserção (IS-001) |
| `packages/mock/src/desempenho.test.ts` (C3) | 1 de 3 | CPU time sob contenção SMT; teto 2x da calibração (IS-002) |
| E2E `A11Y-03` (axe com popover, nota e tabela, dois temas) | 2 de 3 | estoura o timeout padrão de 30 s (34 s e 42,6 s) sob load 9 a 13; o axe roda 2 temas x vários estados num teste só |
| E2E `FIL-04` (marcar todas as equipes) | 1 de 3 | **defeito real**, não do teste: um clique se perde (5 de 6 equipes) quando a URL de um clique anterior chega atrasada (IS-003; a QA de filtros registrou o mesmo como IF-002) |
| E2E `OP-17` (O12 vencidos internos) | 1 de 3 | `aria-busy` do O12 ainda `true` ao fim da espera de 5 s do page object (`CartaoMetrica`, linha 63) sob carga |
| E2E `COMP-01 /operacional?cadencia=semanal` (1280 e 375) | 1 de 3 | timeout de 30 s ao abrir 7 complementares e rodar axe sob carga |
| E2E novo `SIS-ROB-04` | 1 de 3 (na versão inicial) | do teste: `reload` durante o "commit" da navegação dá `Not attached to an active page` no CDP; corrigido (recarrega após `domcontentloaded`) |

### Testes novos
- `server/tests/api.sistemico-intensivo.test.ts`: 110 testes, verdes; com o `api-perf` (1 teste) dentro do `pnpm run pronto` do server (typecheck, lint, cobertura 100%): **verde**, 411 aprovados e 62 de PG pulados (sem `PG_TESTE_URL`), 34 arquivos, cobertura 100% em linhas, ramos, funções e instruções (19:14, load 4,11).
- `e2e/tests/intensivo-sistemico.spec.ts`: 68 testes; 3 rodadas completas: 65, 64 e 65 aprovados; 4a rodada de confirmação só do spec, com o arquivo final (19:44, load 1,17 a 12,72 durante): 65 aprovados, 3 falhas (SIS-CONS-01, SIS-CONS-05, SIS-INV-03). As falhas fixas são os defeitos IS-004, IS-005 e IS-006 (os testes ficam vermelhos até a correção; nenhum `skip`); a falha avulsa da rodada 2 foi o `SIS-ROB-04` (instabilidade do teste, corrigida).

### Contrato e servidor
- 51 rotas: 51 x (12, 9 ou 2) consultas válidas = 200 no schema, ETag estável e 304; 51 x (19 a 23) inválidas = 400 `VALIDATION_ERROR`, sem eco de valor. Observação: na PV1 o `X-Versao-Criterio` é `pesquisa-q-v2` (não numérico); o contrato não exige número, então não é defeito.
- `test:pg` completo num database temporário do container existente (criado com os mesmos GRANTs do init e removido no fim): não foi possível, porque as senhas dos papéis do container de desenvolvimento estão só no `.env` (leitura bloqueada pelo `R-CONFORMIDADE`). Feito num **Postgres 17 descartável** (container `qa-is-pg-tmp`, porta 127.0.0.1:55439, dados em `tmpfs`, `docker/postgres/init` do repositório montado e as senhas de desenvolvimento padrão, as mesmas da CI), parado e removido ao fim; o `metricasdspd-postgres-1` não foi tocado. `PG_TESTE_URL=postgres://dspd_migrador:migrador_dev@127.0.0.1:55439/metricas_test pnpm run test:pg`: **12 arquivos, 62 de 62 aprovados** (19,0 s, load 5,99), inclusive os GRANTs por coluna (`dspd_api` não lê coluna de pessoa), migrações e carga incremental sem sobrescrever histórico.

### Regras invioláveis
- Pessoa: nenhuma ocorrência nas respostas da API (51 rotas x filtros, contra os pseudônimos da base), nas 11 telas (com tabelas e notas abertas) nem nos 5 PDFs.
- Regra dos 20: nenhuma violação nas respostas da API (inclui séries `serieP85`, `serieMensal`, fatias de distribuição e taxas) nem nas telas com recorte estreito.
- BusinessMap x Acelerato: troca da base da outra fonte não altera nenhum resultado (cálculo isolado). Na tela, o EI-SUST exibe filtros do fluxo como "aplicados" (IS-004).
- Story/frente/projeto: todo histograma do fluxo com contagem é reproduzido por exatamente uma granularidade.

### Desempenho (ADR 0003)
Load de 1 minuto registrado no início de cada medição; a estação nunca ficou ociosa (outros agentes), então os tempos valem para essa carga.

| Item (ADR 0003) | Medição | Orçamento | Load | Situação |
|---|---|---|---|---|
| F6 bundle JS inicial gzip | 186,76 KB (JS + CSS inicial 193,11 KB) | < 200 KB | 4,89 | ok |
| F7 maior chunk de rota | 9,37 KB (Operacional e Sustentação) | < 60 KB | 4,89 | ok |
| F8 gráficos / F9 mock + biblioteca | 111,38 KB / 38,43 KB, mock fora do chunk inicial | < 130 / < 120 KB | 4,89 | ok |
| F1 LCP `/` carga fria | p95 384 ms (n=20); 372 ms com CPU 4x | < 2,0 s | 4,89 | ok |
| F2 CLS 1366 / 375 | máx. 0,004 / 0,019 (`/`) | < 0,1 | 4,89 | ok |
| C6 maior tarefa longa | mediana 103 a 116 ms por painel, máx. 139 ms | < 200 ms | 4,89 | ok |
| F3 INP / F4 resposta visual / F5 painel atualizado | 56 ms / p95 66,4 ms / p95 373,5 ms (com latência simulada) | ver ADR | 4,89 | ok |
| C5 heap após todos os painéis | teste imprime `NaN`; sonda do QA com `Performance.enable`: 30,1 MB | alerta 150 MB | 3,39 | ok, mas teste não mede (IS-007) |
| F10 Lighthouse, mediana de 3 por rota (8 rotas) | desempenho 98 a 100, acessibilidade 100 em todas; LCP 627 a 877 ms; CLS máx. 0,085 (`/sustentacao`); TBT máx. 42 ms | asserções do `lighthouserc` | 4,89 no início, 0,75 no fim | ok (assertivas verdes; `/metricas` e `/ajuda` seguem fora da lista, já registrado no bug 009) |
| A3 payload gzip, 51 rotas, volume padrão | todas < 50 KB | < 50 KB | 4,11 | ok |
| A2 API com cache quente (dublê, 51 rotas x 20) | p95 2,9 ms | < 50 ms | 4,11 | ok |
| A1 primeira chamada por rota (dublê, 51 rotas) | p95 404 ms; piores O1 825 ms (inclui montar a base na 1a requisição), O5 644, VISAO_GERAL 404, O3 343 | < 300 ms p95 | 4,11 | ok pelo método da ADR (a primeira chamada entra numa amostra de 21 por rota e é reportada à parte: p95 por rota = quente); a frio fica acima de 300 ms em 4 rotas, sob carga |
| A1/A2 com Postgres real (`tests/pg/desempenho.ts`, escala 2, 24 meses: 10.957 cards, 89.201 transições, 11.921 chamados, 88.390 etapas) | consultas de amostra p95 2 a 182 ms; carga completa BM + AC + 1 métrica cada p95 877 ms; API com cache p95 1 ms (n=200); sem cache de resultado p95 84 ms | A1 < 300 ms, A2 < 50 ms | 5,42 | ok |

## Defeitos
| Id | Título | Severidade | Responsável |
|---|---|---|---|
| [IS-001](bugs/IS-001-pronto-falha-por-timeout-nos-testes-do-web-sob-carga.md) | `pnpm run pronto` vermelho por timeout dos testes do web sob carga | média | react-frontend |
| [IS-002](bugs/IS-002-desempenho-o9-p95-acima-do-teto-sob-carga.md) | Teste C3 instável (O9 p95 327 ms > 300 ms) | baixa | node-backend |
| [IS-003](bugs/IS-003-filtro-multi-perde-marcacao-em-cliques-rapidos-sob-carga.md) | Filtro múltiplo perde marcação em cliques rápidos | média | react-frontend |
| [IS-004](bugs/IS-004-ei-sust-mostra-filtros-do-fluxo-como-aplicados.md) | EI-SUST mostra filtros do fluxo como aplicados e sugere removê-los | média | react-frontend |
| [IS-005](bugs/IS-005-catalogo-leva-metricas-do-nucleo-ao-painel-sem-o-cartao.md) | Catálogo: núcleo sem âncora; 8 do Operacional caem na visão diária | média | react-frontend |
| [IS-006](bugs/IS-006-pdf-do-e3-omite-o-k-da-base.md) | PDF do E3 omite o "9 de" da base | baixa | react-frontend |
| [IS-007](bugs/IS-007-c5-heap-nunca-medido.md) | Teste C5 (heap) nunca mede: "NaN MB" anotado como ok | baixa | qa-engineer |

Observação sem registro de defeito: o link "Ver todos os tipos" da Visão geral abre o EI-FL1 na aba Incidente, enquanto o resumo cita Requisição (os números batem ao escolher a mesma aba). Fica como sugestão para o ux-designer.

## Parecer
**Aprovado com ressalvas: nenhum bug crítico ou alto; 4 médios e 3 baixos abertos pedem correção ou aceite do usuário.** Nenhuma regra inviolável foi violada no cálculo nem nas respostas da API: pessoa, regra dos 20, isolamento BusinessMap x Acelerato e story/frente/projeto passaram como teste de sistema nas 51 rotas, nas 11 telas e nos 5 PDFs. Contrato (51 rotas, 304, 400 sem eco, 404), `test:pg` (62/62) e o orçamento da ADR 0003 estão dentro.

Ficam abertos 7 defeitos: 0 críticos, 0 altos, 4 médios (IS-001, IS-003, IS-004, IS-005) e 3 baixos (IS-002, IS-006, IS-007). Os médios pedem aceite do usuário ou correção: IS-004 é uma mistura visual das duas fontes (o rótulo, não o número) e IS-005 quebra o "Ir ao painel" de 29 linhas do catálogo. IS-001 e IS-002 deixam o `pnpm run pronto` vermelho por tempo sob carga, sem regressão de código, e IS-003 coincide com o IF-002 da QA de filtros.

Testes novos: 110 sistêmicos de API e 1 de orçamento (verdes), 68 E2E (65 verdes; os 3 vermelhos são IS-004, IS-005 e IS-006 e assim ficam até a correção, sem `skip`). Vermelho antes do verde: os testes de regra (SIS-ISO-01, SIS-GRAN-01) têm controle de sensibilidade embutido (a troca da base da própria fonte muda o resultado e a base reduzida à outra granularidade não reproduz o histograma), e os três E2E de defeito foram vistos falhando na main em 4 rodadas.

---
tipo: qa
contrato: 1
pedido: 025-front-do-011-lote2
branch: feature/025-front-taticas
commit: 5108fcd
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 2
aceite_usuario: sim
data: 2026-10-21
---
# QA do front das táticas T10 a T14 (pedido 025, etapas E1.2 e E1.5, cartão K-110)

Links: especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (fichas T10 a T14 em §5, estados em §6, critérios em §10), pedido `docs/pedidos/025-front-do-011-lote2.md`, contratos `docs/contratos/metricas/T10.md` a `T14.md`, review `docs/reviews/025-front-taticas.md`, segurança `docs/security/025-t14-reidentificacao.md`. Entrega testada: 32a509f, conferida em b6c7673, mais os testes novos (f06a6fb) e a correção de L2T-001 e L2T-002 (5108fcd, o `commit:` do frontmatter: head de código; depois dele só o parecer de review 222a0a8). Chromium, uma suíte pesada por vez, nenhum playwright de outra worktree em execução (conferido por `pgrep` antes de cada rodada).

**Sobre `aceite_usuario: sim`:** reflete as decisões do dono de 2026-10-21 ("A"): D1 (média) e D2 (baixa), já existentes na `develop`, acompanham o PR como pendências (K-131 e K-132); L2T-001 e L2T-002 foram corrigidos (5108fcd) e L2T-003 segue como pendência do PR no K-133.

**Reteste (head de código 5108fcd):** `tatico-011-lote2.spec.ts` 19 de 19 e `t10-grafias.spec.ts` 1 de 1 (com `MOCK_FORNECEDOR_GRAFIAS=1`), com porta própria (`E2E_PORTA=4283`). A primeira rodada no head deu 2 vermelhos (TT-11 e TT-12 ainda esperavam "1 demandas" e "1 frentes"); as expectativas passaram ao singular quando k = 1 e o TT-07 ganhou a guarda do L2T-001 (vermelho com o `taticas.tsx` de f06a6fb: `Expected: < 20, Received: 147`; verde no head). As demais suítes da tabela de resultados abaixo são de f06a6fb e não foram refeitas; 5108fcd só muda texto e base do T13 e do T14.

## Escopo
Coberto: T10 a T14 em `/tatico` (seção "Mais métricas deste painel": estados, microcopy, catálogo, "Leia junto", regras de pessoa e de n < 20), R-1 = B e T14-M1 = B na tela (inclusive em frentes), B11-001 no T10 pelo caminho real do back, acessibilidade (axe AA, teclado, reflow a 360 px), F2 CLS e C6.
Não coberto: a API do T14 (a resposta ainda traz `total`, `meuTime.n` e `semTime` do projeto oculto, pré-condição da fase 3 registrada no parecer de segurança; hoje a métrica é mock); revisão visual da UX (E1.6); O19 nos pares "Leia junto" do T10 e do T13 (a ficha pede, o O19 é do lote 3, pedido 026; o review já registra); lote 3 das operacionais.
Por que os testes novos rodam contra a API local com o mock semeado (`chromium-api`): o mock embutido no navegador não gera T13 nem T14 (achado A1 do review: T14 sai "vazio" e T13 "0 de 0"), e a regra R-1 = B / T14-M1 = B só se prova com a resposta real da API (projeto oculto vem com `outrosTimes: null`).

## Plano de testes
Dados: mock semeado padrão (determinístico). Com `equipe=erp-protheus`: T14 em "demandas" tem 9 projetos, P-0039 oculto (total 79, n 73, k 1, sem time 6); em "frentes" os ocultos são P-0038 e P-0008; P-0011 tem n = 15 (< 20). T10 sem equipe: Alfa 17 bloqueios (< 20), Beta 20, Gama 26. Para o B11-001, a API é semeada com `MOCK_FORNECEDOR_GRAFIAS=1` (fornecedor grafado "TOTVS", "Totvs" e " totvs ").

| ID | Cenário | Tipo | Prioridade | Automatizado |
|---|---|---|---|---|
| TT-01 | Seções "O que entra, e quando?" e "De quem depende o prazo?" com T11, T12 e T10, T13, T14 na ordem; nenhum na "Pede atenção" | E2E API | Alta | sim |
| TT-02 | Fonte BusinessMap, "Como ler", tabela equivalente, selo fictício só no T13 e no T14, sem Acelerato | E2E API | Alta | sim |
| TT-03 | T10: ordem alfabética, "Prazo contratado não informado", sem coluna de contrato nem "dentro/acima", Alfa (17) sem P50/P85, Beta (20) com P50 e P85 | E2E API | Alta | sim |
| TT-04 | T10 sem fornecedor (resposta com lista vazia): mensagem própria e prazo não informado | E2E API | Média | sim |
| TT-05 | T11: janela fixa, número escrito em cada célula, mês corrente "em andamento", período não afeta | E2E API | Média | sim |
| TT-06 | T12: áreas por volume decrescente; percentual só com n >= 20, abaixo "percentual não publicado, menos de 20" | E2E API | Alta | sim |
| TT-07 | T13: Demandas e Frentes uma por vez, comparação não exibida com grupo < 20, outro quadro não identificado | E2E API | Alta | sim |
| TT-08 | T14 sem equipe e com duas equipes: pede a equipe e não calcula | E2E API | Alta | sim |
| TT-09 | T14: selo, legenda de três itens, tabela com 5 colunas fixas (sem coluna por time), ordem do total do projeto conferida contra a API, n < 20 sem percentual | E2E API | Alta | sim |
| TT-10 | T14: troca para frentes, uma granularidade por vez, nunca conta projeto | E2E API | Alta | sim |
| TT-11 | R-1 = B e T14-M1 = B em demandas: o projeto oculto mostra só "Meu time: k", sem total, sem n, sem "k de n", sem percentual, sem barra, sem destaque nem base do cartão; tabela com "não exibido" | E2E API | Alta | sim |
| TT-12 | O mesmo em frentes (dois projetos ocultos) | E2E API | Alta | sim |
| TT-13 | Controle positivo do TT-11: com a API devolvendo "outros times" publicável, a tela mostra "1 de 73" e a barra (prova que o detector funciona) | E2E API | Alta | sim |
| TT-14 | Falha da API do T14: erro no cartão, painel segue, "Tentar de novo" recupera | E2E API | Alta | sim |
| TT-15 | Falha do T10, T12 e T13 juntos: erro por cartão sem derrubar T11 e T14 | E2E API | Média | sim |
| TT-16 | Catálogo (58, Tático, BusinessMap) e "Leia junto" T1→T13, T4→T11, T9→T14, Bloqueados→T10, notas de T11 e T14 | E2E API | Alta | sim |
| TT-17 | Axe AA com T10 a T14 abertos, em demandas e em frentes, sem erro de console | E2E API | Alta | sim |
| TT-18 | Teclado: setas trocam a granularidade do T14 e do T13, foco visível, anúncio muda | E2E API | Alta | sim |
| TT-19 | 360 px: sem rolagem horizontal da página, cartões dentro da largura, axe AA | E2E API | Alta | sim |
| T10-G1 | B11-001/CA-51: "TOTVS", "Totvs" e " totvs " viram uma linha só, sem espaço sobrando, com a soma (projeto `chromium-api-grafias`) | E2E API | Alta | sim |
| PF-1 | F2 CLS e C6 em `/tatico?equipe=erp-protheus` com a seção aberta (`perf-tatico-lote2`), mock e API | Desempenho | Alta | sim |
| REG-1 | Contagens do catálogo, "Leia junto", preferências e "tudo oculto" atualizadas para 58 métricas e 7 complementares no Tático (COMP-01, COMP-03, COMP-10, COMP-12, COMP-13, LV-14, SIS-CONS-01) | E2E mock | Alta | sim |

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-2 | TT-01 | ordem e seções | passou |
| CA-5 | TT-03 (T10 Alfa com 17), TT-06 (T12), TT-09 (T14 P-0011, n = 15) | n < 20 não publica | passou |
| CA-6 | TT-07 | grupo abaixo de 20 | passou |
| CA-7 | TT-02 | só BusinessMap | passou |
| CA-8, CA-32 | TT-07, TT-10, TT-18 | uma granularidade por vez; teclado | passou |
| CA-11 | TT-03, TT-06 | ordem neutra (alfabética, por volume) | passou |
| CA-12 | TT-05 | janela fixa, mês corrente | passou |
| CA-14 | TT-01 | fora da "Pede atenção" | passou |
| CA-16 | TT-02 | "Como ler", tabela, selo fictício | passou |
| CA-24, CA-36 | TT-03 | sem coluna de prazo contratado | passou |
| CA-27, CA-30, CA-31, CA-33, CA-34 | TT-09 | ordem pelo total (conferida contra a API), "k de n", selo | passou |
| CA-28 | TT-08 | sem equipe e com duas equipes | passou |
| CA-29 | TT-09 | nenhuma coluna ou controle por time | passou |
| CA-45, R-1 = B, T14-M1 = B | TT-11, TT-12, TT-13 | total, n, "k de n", percentual e barra ausentes; controle positivo | passou |
| CA-50 | TT-03 | P50/P85 só com 20 ou mais | passou |
| CA-51, B11-001 | T10-G1 | grafias só em caixa ou espaços | passou (com `MOCK_FORNECEDOR_GRAFIAS=1`) |
| Estados §6 | TT-04, TT-08, TT-14, TT-15 | vazio, erro, sem equipe | passou |
| ADR 0003 F2 e C6 | PF-1 | CLS < 0,1; tarefa longa < 200 ms | passou (ver Resultado) |
| Acessibilidade WCAG 2.2 AA | TT-17, TT-19, TT-18 | axe, teclado, 360 px | passou, zero violação crítica ou séria |

## Vermelho antes do verde e mutação
- **T10-G1 (B11-001):** troquei `grafia.toLowerCase()` por `grafia` em `packages/metricas/src/businessmap/t10.ts:31` (só na árvore, revertido). Falhou em `expect(linhas).toHaveCount(1)` (três linhas). Com o código original, passou. Comando: `MOCK_FORNECEDOR_GRAFIAS=1 bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm exec playwright test --project=chromium-api-grafias'`. Sem a variável, o teste também falha de propósito (a API traz Alfa, Beta e Gama).
- **TT-11 e TT-12 (R-1 = B, T14-M1 = B):** troquei `outrosOculto` por `p.outrosTimes === undefined` em `web/src/features/complementares/taticas.tsx` (só na árvore, revertido). TT-11 e TT-12 falharam (a linha do P-0039 passou a mostrar o formato completo); TT-13 (controle positivo) passou, ou seja, o detector enxerga o vazamento. Original: tudo verde.
- **REG-1:** antes da atualização, o primeiro E2E completo acusou 6 testes vermelhos da própria entrega (contagens 53 e 2 complementares do Tático); depois da atualização, passam.

## Resultado da execução
Máquina: WSL, 8 GB e 8 núcleos. Load average (1 min) ao iniciar cada etapa: unitários e `pnpm run pronto`: 2,15 (17:04) e 3,94 ao terminar; E2E mock completo (primeira rodada): iniciado sem processo concorrente, subiu até 9 com o `pnpm run lint` do pedido 037 em paralelo; E2E mock completo final: 3,23 ao iniciar (17:14) e 10,4 ao terminar (17:40, com o próprio Chromium de 3 workers); E2E da API e desempenho: 1 a 4 (uma rodada de desempenho a 6 a 10 com o lint do 037 ao lado, descartada e repetida, ver abaixo).

| Suíte | Comando | Resultado |
|---|---|---|
| `pnpm run pronto` (lint, formato, typecheck, unitários, cobertura, `docs:check`) | `pnpm run pronto` | rc = 0. web 1110 de 1110 (76 arquivos); metricas 1082 de 1082; mock 244 de 244; contratos 161 de 161; server 591 passaram e 84 ignorados pelo próprio pacote (sem banco, 15 arquivos); homolog 73; spec-check 14; pesquisa 33; docs-contratos 102 + `docs:check` ok (643 páginas) |
| E2E API (`chromium-api`) | `bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm exec playwright test --project=chromium-api --workers=3'` | 46 de 46 (os 19 novos TT-01 a TT-19 e os 27 já existentes de `api.spec.ts` e `tendencias.spec.ts`) |
| E2E B11-001 (`chromium-api-grafias`) | comando acima, com `MOCK_FORNECEDOR_GRAFIAS=1` | 1 de 1 |
| E2E mock (`chromium`), primeira rodada (antes de atualizar as contagens) | `E2E_PORTA=4183 E2E_PORTA_ALT=4184 E2E_SEM_ALT=1 pnpm exec playwright test --project=chromium --workers=3` | 680 de 686; 6 vermelhos, todos contagens defasadas por esta entrega (COMP-01 x2, COMP-10, COMP-12, COMP-13, SIS-CONS-01), corrigidos; os 96 + 4 do D1 **não falharam** (ver D1 abaixo) |
| E2E mock, reexecução dos arquivos corrigidos | `-g "COMP-\|LV-14\|SIS-CONS-01"` nos três arquivos | 32 de 32 |
| E2E mock (`chromium`), rodada final completa | mesmo comando | 685 de 686 (25 min, 3 workers). O 1 vermelho é `intensivo-filtros.spec.ts:354` (IF-U-operacional) por `Test timeout of 30000ms` com a máquina em load 8 a 10; reexecutado sozinho com 1 worker, os 4 IF-U passam (17,7 s o mais lento). É a classe do D2 (instável sob carga), não defeito desta entrega |
| F2 CLS e C6 em `/tatico` com T10 a T14 abertos, API (`perf-api`) | `PERF_VARIANTE=api ... playwright test --project=perf-api perf/perf.spec.ts -g perf-tatico-lote2` | CLS que a seção acrescenta: 0,000 em 15 de 15 cargas; tarefa longa: mediana 0 ms (máx. 94 ms); passou |
| F2 CLS e C6, mock (`perf`) | `... --project=perf perf/perf.spec.ts -g perf-tatico-lote2`, duas rodadas com a máquina livre (load 2) | CLS 0,001 e 0,002 (pior carga); C6 mediana 173 ms e 158 ms (< 200 ms); passou. Uma rodada anterior com o `pnpm run lint` do 037 ao lado (load 6 a 10) deu CLS 1,31 nas duas primeiras cargas e C6 206 ms; descartada por carga concorrente e repetida sem ela, e registrada aqui |
| F2 e C6 gerais de `/tatico` (já existentes) | `-g "F2 CLS e C6 tarefa longa em /tatico"` | mock: CLS 0,001 e C6 182 ms; API: CLS 0,035 e C6 0 ms; passou |

O F2 do ADR 0003 em `/tatico` com a seção aberta: o CLS vem do núcleo, não do lote 2 (L2T-003).

## Defeitos desta entrega
- **L2T-001 (baixa, corrigido em 5108fcd, fechado)** `docs/qa/bugs/L2T-001-t13-frentes-base-diz-147-de-20-itens-minimos.md`: com "Frentes" no T13, a base diz "Amostra insuficiente: 147 de 20 itens mínimos" (texto contraditório; o `n` é o de demandas).
- **L2T-002 (baixa, corrigido em 5108fcd, fechado)** `docs/qa/bugs/L2T-002-t14-meu-time-1-demandas-plural.md`: "Meu time: 1 demandas" (plural fixo). Cosmético; a regra de reidentificação está cumprida.

## Já existentes na `develop` (não são defeitos desta entrega; pendências do PR)
- **L2T-003 (baixa)** `docs/qa/bugs/L2T-003-cls-tatico-com-equipe-0-07-a-0-10.md`: `/tatico` com equipe escolhida tem CLS de 0,073 a 0,100 (API; no mock 0,002) por uma seção do núcleo que cresce 32 px; reproduz com a seção do lote 2 fechada. O F2 do ADR 0003 (rota sem equipe) passa: 0,035.
- **D1 (média, K-131)**: 100 E2E defasados na `develop` (96 em `intensivo-filtros.spec.ts` e 4 em `b12-fluxo.spec.ts:230` e `:379`, `filtros.spec.ts:129`, `intensivo-filtros-bordas.spec.ts:177`), segundo o parecer do 037. **Não consegui reproduzir nesta branch**: na rodada completa do `chromium` com o build próprio da branch, esses 100 passaram. Hipótese forte: o `reuseExistingServer` da `playwright.config.ts` serve o `vite preview` que já estiver na porta 4173; a worktree do 037 tem um (`pid 160965`, `MetricasDSPD-037/web`) e uma rodada de outra worktree cai nele, com build diferente do código testado (a falha "URL `/tatico` onde se espera `?equipe=...`" e "array vazio onde se espera O12" são típicas de build antigo). Para isso acrescentei `E2E_PORTA` e `E2E_PORTA_ALT` na configuração (padrões 4173 e 4174, nada muda sem elas). O K-131 deve primeiro rerodar a `develop` com porta própria antes de "consertar" 100 testes.
- **D2 (baixa, K-132)**: 9 E2E instáveis com 8 workers (carga). Nesta branch usei 3 workers e nenhum flaky apareceu.

## Achados
- A1 (recomendado, resolvido em 5108fcd) web/src/features/complementares/taticas.tsx:411 · L2T-001: com "Frentes" no T13 a base mostra "Amostra insuficiente: 147 de 20 itens mínimos"; a base deve acompanhar a granularidade exibida
- A2 (recomendado, resolvido em 5108fcd) web/src/features/complementares/taticas.tsx:612 · L2T-002: "Meu time: 1 demandas" (e "1 frentes"); usar singular quando k = 1 e ajustar a expectativa do TT-11 e do TT-12
- A3 (recomendado) e2e/playwright.config.ts:6 · conferir o D1 do 037 (K-131) com E2E_PORTA próprio antes de reescrever testes: o preview do 037 na 4173 pode ter servido build alheio
- A4 (recomendado) web/src/data/mock/MockFonteMetricas.ts:55 · herdado do review (A1): no mock do navegador T11, T13 e T14 saem vazios ou sem vínculo; só a API os mostra de verdade

## Decisões do dono (2026-10-21)
1. L2T-001 e L2T-002: corrigir agora ("A"); corrigidos em 5108fcd e fechados no reteste.
2. L2T-003 (CLS de 0,073 a 0,100 em `/tatico` com equipe, herdado da `develop`): pendência do PR, em cartão próprio (K-133).
3. D1 (média, 100 E2E defasados, K-131) e D2 (baixa, 9 E2E instáveis, K-132): pendências listadas no PR, corrigidas depois nos cartões ("A"). Nota sobre o D1: o E2.3c do pedido 037 o atribuiu ao `reuseExistingServer`, como a hipótese deste parecer; a reavaliação é do K-131.

## Parecer
Aprovado sobre 5108fcd (b6c7673 mais os testes novos e a correção de L2T-001 e L2T-002): zero bug crítico ou alto; os defeitos abertos são médio (D1, já existente) e baixos (D2 e L2T-003, já existentes), nenhum em regra de negócio, regra inviolável ou acessibilidade. R-1 = B e T14-M1 = B cumpridas na tela (provadas por mutação e por controle positivo); B11-001 provado pelo caminho real do back; F2 e C6 dentro do ADR 0003; axe AA sem violação crítica ou séria.

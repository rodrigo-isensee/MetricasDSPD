---
tipo: qa
contrato: 1
pedido: 037-pr-131-release-com-falhas
branch: feature/037-c6-operacional
commit: d54941763ff6dcb3a87f5bff96fda7d6f45795e3
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 1
aceite_usuario: sim
data: 2026-10-21
---

# QA: cálculo do mock em Web Worker (ADR 0021, pedido 037, cartão K-113)

Propósito: medir o Worker da ADR 0021 (entrega `0bde5eb`) contra o critério de pronto da proposta 037 (seção 6, "O que o QA mede depois", itens 1, 2, 3, 5 e 6) e dar o parecer de QA (`R-QA`). O HEAD testado é `d549417`; ele só soma `docs/reviews/` ao código de `0bde5eb` (`git diff --stat 0bde5eb HEAD`: 1 arquivo). Review: `docs/reviews/037-c6-operacional.md` (aprovado, 4 achados recomendados). Item 4 (CI do PR e do portão) fica com o tech-lead, na promoção.

**Parecer: aprovado.** C6 ficou em 0 ms de mediana nas 7 rotas, nas execuções limpas e nas sujas, contra 213 a 287 ms na `develop` na mesma sessão. Nenhuma regressão atribuível ao Worker. Há dois defeitos abertos que **já existem na `develop`** (testes E2E defasados e instabilidade de E2E sob carga), sem relação com esta entrega; por isso `aceite_usuario: sim`.

## Ambiente
WSL2 (8 núcleos), Node v24.21.0, `@playwright/test` 1.64.1, Chromium 156.0.8078.4, worktree `MetricasDSPD-037`. Sem `flock` (o hook recusa): antes de cada medição, `pgrep -f 'vitest/vitest.mjs|playwright/cli'` sem processo de outra worktree, uma suíte pesada por vez. A `develop` (`12018de`) foi medida em worktree descartável (`MetricasDSPD-037-dev`, removida ao fim), mesma sessão, intercalada com o Worker.

**Ressalva de método:** duas das quatro execuções do item 1 (marcadas "suja") rodaram junto de um `vitest --coverage` de outra pessoa na mesma worktree (load de 1 min entre 6,7 e 9,3). Refiz as duas depois de a máquina esvaziar; os números oficiais são as execuções 3 e 4. Nenhuma teve load < 2 durante a medição inteira: o load de 1 min antes de cada uma está na tabela, e o próprio build do preview o eleva ao longo da execução.

## Item 1: C6 local, build mock com latência 0 (`?latencia=0`), 7 rotas, 2 execuções
Comando: `cd e2e && E2E_SEM_ALT=1 PERF_QUERY_SEM_LATENCIA=latencia=0 PERF_RODADAS_C6=3 PERF_REPETICOES_C6=5 pnpm exec playwright test --project=perf -g "F2 CLS e C6 tarefa longa em" --reporter=list`. C6 = mediana agregada de 15 amostras (ms); entre parênteses, p85 / máximo; medianas por rodada sempre 0/0/0, salvo a exceção anotada.

| Rota | Exec. 3 (load antes 0,80) | Exec. 4 (load antes 2,56) | Exec. 1 suja (0,59→) | Exec. 2 suja (6,72) |
|---|---|---|---|---|
| `/` | 0 (0 / 58) | 0 (0 / 51) | 0 (0 / 0) | 0 (0 / 111) |
| `/operacional` (Resumo) | 0 (0 / 0) | 0 (0 / 64) | 0 (0 / 0) | 0 (0 / 80) |
| `/operacional?cadencia=diaria` | 0 (0 / 0) | 0 (0 / 72) | 0 (0 / 0) | 0 (0 / 84) |
| `/operacional?cadencia=semanal` | 0 (0 / 94) | 0 (0 / 63) | 0 (0 / 69) | 0 (0 / 69) |
| `/tatico` | 0 (0 / 76) | 0 (0 / 62) | 0 (0 / 66) | 0 (0 / 97) |
| `/estrategico` | 0 (0 / 0) | 0 (0 / 76) | 0 (0 / 67) | 0 (62 / 75; rodadas 62/0/0) |
| `/operacional?cadencia=sustentacao` | 0 (0 / 0) | 0 (0 / 0) | 0 (0 / 102) | 0 (0 / 85) |

Veredito: **passou.** Meta de margem (mediana < 150 ms em todas as rotas e nas 2 execuções): atendida, com mediana 0 ms nas 28 combinações rota x execução. O pior máximo individual foi 111 ms (`/`, execução suja de load 6,7), abaixo do gatilho de perfil (250 ms); os limites das execuções limpas ficaram em 94 ms. A mediana 0 ms significa que a maioria das cargas não tem tarefa de 50 ms ou mais (`longtask`), que é o que o Worker prometia: a geração e o cálculo saíram da thread principal.

## Item 2: C6 de `/operacional`, build sem `VITE_*` (latência ligada, build da CI)
Mesma configuração, sem `PERF_QUERY_SEM_LATENCIA`, `-g "F2 CLS e C6 tarefa longa em /operacional$"`, 1 execução, load antes 3,51 (acima de 2, ruído a favor da cautela): **C6 = 0 ms** (p85 0, máximo 64, rodadas 0/0/0). Veredito: **passou** (< 150 ms).

## Item 3: comparação com a `develop` sem o Worker, mesma sessão
| Medida | `develop` 12018de (load antes) | Worker d549417 |
|---|---|---|
| C6 `/`, latência 0 | 213 ms (p85 283, máx 403; rodadas 263/213/198), reprovou o limite de 200 (3,01) | 0 ms |
| C6 `/operacional`, latência 0 | 235 ms (p85 318, máx 439; rodadas 201/258/318), reprovou (1,37) | 0 ms |
| C6 `/operacional`, latência ligada | 287 ms (p85 337, máx 371; rodadas 307/280/281), reprovou (1,37) | 0 ms |

Veredito: **passou.** A `develop` reproduz o C6 vermelho do #131 (acima de 200 ms, o limite da ADR 0003); o Worker o leva a 0.

## Item 5: sem regressão
| Orçamento | `develop` | Worker | Veredito |
|---|---|---|---|
| F5 painel atualizado, p95 (latência 0; limite 500 ms) | 492,6 ms (máx 611,8) | 140,4 ms (máx 524,8) | passou, melhor |
| F5 com latência simulada (Worker) | n/m | 188,5 ms | passou |
| F3 INP (limite 200 ms) | 136 ms | 168 ms (160 com latência) | passou; sobe 24 a 32 ms, dentro do limite |
| F4 resposta visual p95 | 63,6 ms | 71,7 ms (87,8 com latência) | passou |
| F1 LCP p95 (limite 2,0 s), 3 pares intercalados | 656 / 540 / 620 ms | 508 / 668 / 612 ms | passou, equivalente (a primeira medição isolada, 716 ms, foi ruído de load) |
| F6 inicial (gzip; limite 200 KB, sem aumento além de 2 KB) | 191,79 KB | 191,46 KB | passou (-0,33 KB) |
| F9 mock + biblioteca (limite 120 KB, alerta) | 14,27 KB (medido de outro jeito) | 117,35 KB | passou, margem de 2,65 KB (achado A2) |
| F8 gráficos / F11 exportar PDF | 111,62 / 132,63 KB | 111,62 / 132,63 KB | inalterados |
| C5 heap (alerta 150 MB), thread principal | 21,2 MB | 5,0 MB | passou |
| C5 somando o heap do Worker (sonda avulsa, duas leituras) | n/a | principal 5,2 + Worker 2,7 = 7,9 MB; principal 5,0 + Worker 4,5 = 9,5 MB | passou (alerta < 150 MB) |
| Lighthouse F10 (3 execuções por rota, desempenho) | n/m | `/` 100, `/dados` 100, `/tatico` 99, semanal 98 a 99, `/preferencias` 99 a 100, `/estrategico` 97 a 99, sustentação 98, `/operacional` 99 a 99 e uma execução de 85 | passou (mediana ≥ 97; a execução de 85 é isolada) |

Sobre o F9: o chunk do Worker (71,93 KB) e o do fallback (45,42 KB) são somados, mas só um é baixado no navegador; o valor de 117,35 KB está perto do alerta por causa da soma (achado A3 do review, repetido como A2 abaixo). A comparação de F9 com a `develop` não é de igual para igual, porque o `size.mjs` mudou a classificação.

Sobre o C5: o teste do projeto (`perf.spec.ts:135`) mede só o heap da thread principal; a soma exigida pela proposta foi feita por uma sonda avulsa (CDP: `Performance.getMetrics` na página mais `Runtime.getHeapUsage` no alvo do Worker, ambos depois de `collectGarbage`), não versionada. A sonda falhou em uma de cada duas execuções por o alvo do Worker já não existir (o alvo some entre `getTargets` e `attachToTarget`); descartei essas e anotei as duas leituras bem-sucedidas.

## CLS de `/tatico` (F2, visto em 0,103 na S0)
Medido em 6 execuções no build do Worker (4 do bloco de 7 rotas e 3 isoladas, `-g "F2 CLS e C6 tarefa longa em /tatico$"`): **0,000, 0,000, 0,000, 0,000, 0,001 e 0,000** (limite 0,1). O 0,103 da S0 não se repetiu e ocorreu uma vez, em `perf-api` na `develop`, sem Worker, com load 2,15; fica como pico isolado de carga, não como defeito reproduzível. As demais 6 rotas tiveram CLS entre 0,000 e 0,004.

## Item 6: determinismo, paridade e suíte
- **Hashes e paridade (ADR 0021, seção 3, itens 1 a 3):** `nucleoMock.paridade.test.ts` (hashes `68a67741` da base, `0113e077` do Acelerato e `9159f65b` da extensão, sementes padrão e `12345`, todas as `METRICA_IDS`, forma do DTO, 20 primeiras latências) e `MockFonteMetricas.transporte.test.ts` passaram dentro de `pnpm run pronto`.
- **`pnpm run pronto` completo no HEAD:** saída 0 (9 min). Web: 77 arquivos e 1100 testes, 100% de cobertura de instruções e ramos; `packages/metricas` 1082 testes; `packages/mock` 244; server 591 passaram e 84 ficaram em `skip` do próprio projeto (testes de banco); `docs:check` ok (618 páginas).
- **Paridade E2E (item 4 da paridade, escrito por mim):** `e2e/tests/mock-transporte-worker.spec.ts`, 4 testes no Chromium real. (a) O cálculo roda num Web Worker de arquivo da mesma origem, nunca `blob:` nem `data:`. (b) Para `VISAO_GERAL` (`/`), O2 (`/operacional?cadencia=diaria`) e uma complementar do Acelerato (`/operacional?cadencia=sustentacao`), o painel com Worker e o painel sem `Worker` (fallback em processo, forçado por `Object.defineProperty(window, 'Worker', {value: undefined})` num contexto à parte) mostram exatamente o mesmo conteúdo, com a latência desligada. Guardas: painel com mais de 200 caracteres, ao menos 2 cartões fora de `/`, contagem de cartões igual, 0 Worker no fallback. A comparação ignora espaços e quebras de linha (a quebra dos rótulos de gráfico depende da medição de layout) e repete a leitura até a igualdade (os gráficos desenham em tarefa própria); sem isso o teste falhou 4 vezes em 8 por esses dois motivos, que são de renderização e não de dado. Verde: 24 execuções em 24 (`--repeat-each=6`).
- **Vermelho antes do verde:** o mesmo arquivo rodado contra a `develop` (`12018de`, sem Worker) falha com "nenhum Web Worker: o mock calculou na thread principal" e "o caminho com Worker não usou Worker". Rodado sobre o Worker, passa.
- **Suíte E2E `chromium` completa (`pnpm run test:chromium`, 8 workers, load até 12):** 545 passaram, 108 falharam, 37 não rodaram. Analisei a divergência contra a `develop` (mesmos testes, mesma máquina):
  - 96 testes de `intensivo-filtros.spec.ts` (IF-C pairwise na linha 255, mais 354, 471, 675 e 701) e 4 de outros arquivos (`b12-fluxo.spec.ts:230` e `:379`, `filtros.spec.ts:129`, `intensivo-filtros-bordas.spec.ts:177`) **falham do mesmo jeito na `develop`**, com 3 ou 2 workers: 96 falhas nas duas árvores no arquivo intensivo; 4 falhas nas duas nas demais. As falhas dizem coisas como `Received array: []` onde se espera o cartão O12 e URL `/tatico` onde se espera `?equipe=...`: testes escritos para a interface anterior ao Resumo como visão padrão e ao menu sem filtros nos links. Não são regressão do Worker (defeito D1).
  - As demais falhas da rodada de 8 workers (`b12-fluxo.spec.ts:143`, `espera-invisivel-nos-paineis.spec.ts:82` x2, `filtros.spec.ts:16`, `shell.spec.ts:75`, `sustentacao-no-operacional.spec.ts:109`, `:297`, `intensivo-sistemico.spec.ts:329` e `:421`) **passam com 2 a 3 workers** no Worker (15 testes verdes na repetição) e algumas também falham na `develop` (`:297`, `:329`): instabilidade por carga, sem `skip` (defeito D2).
  - Nenhum teste passa na `develop` e falha no Worker.

## Critério, teste e resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| C6 < 200 ms bloqueia (ADR 0003), meta < 150 ms nas 7 rotas | `perf.spec.ts` "F2 CLS e C6 tarefa longa em <rota>", 2 execuções limpas + 2 sujas | cada uma das 7 rotas de `ROTAS_PAINEL`; máximo individual < 250 ms | passou: mediana 0 ms; máximo 111 ms |
| C6 no build da CI (latência ligada) | idem, `/operacional`, sem `PERF_QUERY_SEM_LATENCIA` | latência simulada ligada | passou: 0 ms |
| Sem regressão de F1, F3, F4, F5 | `perf.spec.ts` F1 e F3/F4/F5, intercalado com a `develop` | p95 no limite; pior que a `develop` | passou (F3 +24 ms, dentro de 200) |
| F6 sem aumento além de 2 KB; F9 no limite | `pnpm --filter web size` nas duas árvores | limite de 200 e 120 KB | passou: -0,33 KB; 117,35 KB |
| C5 soma os dois heaps < 150 MB | sonda CDP avulsa (principal + Worker) | heap do Worker incluído | passou: 7,9 e 9,5 MB |
| ADR 0021, item 4: o Worker é usado de fato e o resultado é igual ao em processo | `mock-transporte-worker.spec.ts`, 4 testes | `/`, O2 e complementar do Acelerato; sem Worker (fallback) | passou (24/24); vermelho na `develop` |
| ADR 0021, itens 1 a 3: DTOs, hashes e latências | `nucleoMock.paridade.test.ts`, `MockFonteMetricas.transporte.test.ts` em `pronto` | todas as `METRICA_IDS`, sementes padrão e `12345` | passou |
| Nenhum Worker `blob:` (CSP) | mesmo arquivo, primeiro teste | origem do Worker igual à da página | passou |
| Mutação no código alterado | não se aplica: a stack não tem ferramenta de mutação configurada para `web/` e esta passagem não mudou código de produção | n/a | não executada |

## Defeitos
- **D1 (média, já na `develop`).** 100 testes E2E (96 em `e2e/tests/intensivo-filtros.spec.ts` na linha 255, mais 354, 471, 675 e 701, e 4 em `b12-fluxo.spec.ts:230`, `:379`, `filtros.spec.ts:129` e `intensivo-filtros-bordas.spec.ts:177`) falham na `develop` `12018de`, sem relação com o Worker. Passos: `cd e2e && E2E_SEM_ALT=1 pnpm exec playwright test --project=chromium --workers=2 tests/filtros.spec.ts:129 tests/b12-fluxo.spec.ts:230`. Esperado: verde. Obtido: `expect(page).toHaveURL(/equipe=erp-protheus/)` recebe `http://localhost:4173/tatico`, e `codigosDosCartoes()` volta `[]` esperando `O12`. Responsável sugerido: `forge:qa-engineer`, com `forge:react-frontend` para decidir se o produto ou o teste está certo (a regra de links entre painéis é de UX). Não bloqueia este parecer, mas o `pronto` do projeto não inclui o E2E completo, então o portão não vê isso; vale decidir se o E2E `chromium` completo entra no portão.
- **D2 (baixa).** Instabilidade do E2E sob carga: 9 testes (lista acima) falham com 8 workers e load alto, e passam com 2 a 3 workers. Não marquei nenhum como `skip`. Responsável sugerido: `forge:qa-engineer` (reduzir `workers` local ou esperas).

## Achados
- A1 (recomendado) e2e/perf/perf.spec.ts:135 · C5 mede só o heap da thread principal; a soma com o Worker (proposta 037, item 5) ficou numa sonda avulsa. Incluir o heap do Worker no teste.
- A2 (recomendado) web/scripts/size.mjs:24 · F9 em 117,35 de 120 KB soma o chunk do Worker e o do fallback, mas só um é baixado. Medir pelo maior caminho, sem afrouxar o limite.
- A3 (recomendado) e2e/tests/intensivo-filtros.spec.ts:255 · D1: 96 testes pairwise falham na develop e no Worker; atualizar para a interface atual e decidir se o E2E completo entra no portão.

## Pendências fora deste parecer
Item 4 da proposta (CI do PR e do portão, `perf` e `perf-homolog` com C6 < 150 ms) é do tech-lead e do devops na promoção; o C6 na CI só se confirma lá. Um valor de C6 entre 150 e 200 ms no portão passa, mas volta ao arquiteto antes da release (proposta 037).

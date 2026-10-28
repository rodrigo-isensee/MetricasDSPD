---
tipo: qa
contrato: 1
pedido: 041-estabilizar-os-testes
branch: feature/041-estabilidade
commit: c61b6c103faf052c62286fcee14ed89a1f135516
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-27
---

# Diagnóstico medido das instabilidades (E1.1 do pedido 041, K-138)

As seções 1 a 10 são o diagnóstico (E1.1, base c4db73e). A seção 11 é a prova de estabilidade e o parecer de QA da entrega (E4.1), sobre o commit 6d40d68. A seção 12 é o reteste das 3 falhas pré-existentes depois da correção do E6.1 (K-149), sobre o commit 83aa9fa; o parecer vigente (frontmatter e `## Achados`) é o da seção 12.

Delta 83aa9fa..4b249bca8ee8b653878b6cb96d100f965203bfc9: só documentação (ADR 0003 com a leitura de 2026-10-27 e pareceres), sem mudança de código, teste ou limite; sem reteste. O veredito é o da seção 12, testada em 83aa9fa.

Delta 4b249bca8ee8b653878b6cb96d100f965203bfc9..c61b6c103faf052c62286fcee14ed89a1f135516 (revalidação E6.3): é a `develop` em 7b5732d trazida no merge c61b6c1 (Dependabot: typescript-eslint 8.72.0, @tanstack/react-query 5.104.5, react-router 8.5.0 e `pnpm-lock.yaml`; K-151 em `web/src/features/percepcao/percepcao.test.tsx`, com `beforeAll` de aquecimento; `web/src/test/setup.ts`, sem `addListener`/`removeListener` no mock de `matchMedia`; K-148 e K-151 em documentação), já mesclada com os pareceres próprios dela. Não toca `e2e/`, os testes de `/operacional`, os limites, timeouts ou retries do 041. Prova: os checks obrigatórios da CI do PR #150 no head c61b6c1 estão em pass (rapida, testes, banco, build, openapi, imagem, seguranca, filtro) e o e2e do run de push 40607924785 passou em 29m57s; e2e e perf do run de PR ficam em skipping por desenho. Pela decisão técnica do Jarvis (Histórico do pedido, 2026-10-27), o reteste das 3 falhas e a E2E completa com 2 workers da seção 12 (sobre 83aa9fa, 736 de 736) não se repetem localmente. Veredito mantido: **aprovado**, sem achado novo.

Este documento é diagnóstico (etapa E1.1), não parecer de entrega: o parecer de QA do 041 é a etapa E4.1, depois das correções. O `parecer: reprovado` do frontmatter só diz que há instabilidades abertas (seção 8) e os 5 `bugs_medios` são os cinco testes instáveis dos achados A1 a A5. Medições das seções 3 a 7: qa-6, em 2026-10-23 a partir das 20:08, `jarvis.slice`, 1 worker, `--retries=0`, uma suíte por vez; seções 1 e 2 vêm do relatório parcial anterior (qa-1 e qa-4).

Base: `develop` em c4db73e (já com 025 e 037). Máquina: WSL2, 8 GB e 8 núcleos, Node 24.22.1, Chromium headless.

## 1. Testes de unidade, 5 execuções seguidas

Comando: `pnpm -r --filter=!@metricas-dspd/e2e --if-present test` (ver achado F-1 sobre por que não foi o `pnpm test` literal).

| Execução | Resultado | Tempo |
|---|---|---|
| 1 | verde | 243 s |
| 2 | verde | 200 s |
| 3 | verde | 207 s |
| 4 | verde | 251 s |
| 5 | verde | 289 s |

Totais por execução, idênticos nas cinco: spec-check 14, homolog 73, contratos 161, pesquisa 33, metricas 1082, mock 244, server 591 (84 skipped, são os `.pg.test`), web 1133, docs-contratos 102. Taxa de falha da unidade em repouso: 0/5.

Achado F-1: `pnpm test` (script raiz `pnpm -r --if-present test`) inclui o pacote `e2e`, cujo `test` é `playwright test`. Ou seja, o "teste de unidade" do desenvolvedor dispara a suíte E2E inteira, com workers padrão, e regrava `docs/qa/evidencias` (F-2). A primeira tentativa de medição com `pnpm test` literal foi interrompida por mim por isso (não conta como amostra). Também explica por que o K-123 aparece "sob load ~10": a unidade corre junto com o E2E.

Achado F-2: a suíte E2E regrava arquivos versionados em `docs/qa/evidencias/**` (PNGs e `axe-resumo.json` de `acabamento-ux`, `b12` etc.) a cada execução e suja a árvore (confirmado: `git status` com dezenas de ` M` depois de uma execução parcial). Desfeito com `git checkout -- docs/qa/evidencias` entre as execuções; nenhum PNG foi commitado.

## 2. E2E completa, `--retries=0`, portas 4273/4274 (parcial)

Comando por rodada: `pnpm exec playwright test --workers=N --retries=0 --reporter=list,json` em `e2e/` (projetos padrão: chromium, chromium-semente-alt e perf; 710 testes, 1 "did not run" em todas as rodadas).

| Rodada | Workers | Falhas | Duração |
|---|---|---|---|
| r1 | 8 | 20 (19 timeout de 30 s, 1 asserção de URL; 1 IF-I13 por URL) | 20,3 min |
| r1 | 2 | 1 (perf F4: p95 = 244 ms contra limite de 100 ms) | 31,4 min |

| r2 (linha de base) | 1 | 1 (perf F4: p95 = 105,8 ms contra limite de 100 ms) | 63,8 min (3 827 s) |

r2: 708 passaram, 1 falhou, 1 não rodou. Portas 4273/4274. Memória do `jarvis.slice` (cgroup), antes: `memory.current` 1 591 062 528 B, `memory.peak` 1 650 745 344 B; depois: `memory.current` 2 019 569 664 B, `memory.peak` 6 762 012 672 B (6,3 GiB, abaixo dos 7 GB do teto alto). Amostrada a cada 10 s, a `memory.current` subiu de 3,6 GB (início) a 6,7 GB (perto do fim) e caiu para 2,0 GB quando a suíte terminou; numa amostra a meio da rodada, `anon` era 1,9 GB e `file` (cache de página) 3,2 GB, ou seja, a maior parte do crescimento é cache de arquivo (builds, traces, PNGs), que o kernel devolve sob pressão, e não heap de processo. O pico do cgroup inclui as outras sessões do Jarvis, então é teto superior do consumo da suíte.

Achado F-3: o F4 falha também com 1 worker e sem carga concorrente (105,8 ms em r2; 244 ms em r1 com 2 workers). Não é efeito de paralelismo: a medida está perto do limite no hardware desta máquina (ver seção 3).

## 3. Unidade de `@metricas-dspd/metricas`, uma vez, com pico de memória (qa-6)

Comando: `pnpm exec vitest run` em `packages/metricas` (sem `TZ=UTC`, uma diferença pequena em relação ao script do pacote), dentro do `jarvis.slice`. Resultado: 37 arquivos, 1 082 testes, todos verdes, 34,3 s. `memory.current` do slice antes 1 376 440 320 B e depois 1 553 022 976 B; `memory.peak` antes 1 643 028 480 B e depois 3 043 557 376 B (2,8 GiB, com as outras sessões incluídas). Maior RSS de um processo (`time -v`): 518 MB. `free -m` depois: 1 675 MB usados, 9 328 MB livres, swap 0. Nenhum processo morto por falta de memória.

## 4. Testes de unidade do Diagnóstico, 10 vezes cada, isolados (1 processo, sem retry)

| Teste | Execuções | Falhas | Observação |
|---|---|---|---|
| K-107 `packages/metricas/src/core/montecarlo.test.ts` (arquivo inteiro, 14 testes, inclui as duas propriedades `fast-check`) | 10 | 0/10 | `memory.current` do slice 1,72 GB antes e 1,93 GB depois; `memory.peak` do slice ficou em 3 043 557 376 B (herdado da rodada da seção 3) |
| K-123 `packages/mock/src/mock.test.ts` "gera a base completa em menos de 1,5 s" | 10 (mais 1 de leitura) | 0/10 | Tempos do gerador: 301, 187, 225, 216, 192, 220, 220, 196, 209, 221 ms (1 rodada extra: 205 ms). Mediana 218 ms, 14,5 % do limite de 1 500 ms; `memory.peak` do slice não subiu |

Leitura: a taxa em repouso é 0/10 nos dois, coerente com 0/5 da unidade (seção 1). Isso não prova que sejam estáveis, só que a causa não está em repouso:

- K-123: a margem em repouso é de 7x (218 ms contra 1 500 ms). O registro do cartão, 1 786 ms com load ~10, é 8,2x o tempo em repouso. Causa: limite absoluto em tempo de relógio (`performance.now()`), sem relação com a carga da máquina; qualquer fator de lentidão acima de ~6,9x reprova (CPU disputada, `pnpm test` do raiz rodando o E2E em paralelo, F-1). Contraste: `packages/mock/src/desempenho.test.ts` já mede em CPU (`cpuMs`) e calibra com um trabalho de referência (`calibrar`), e o `mock.test.ts` não. Grupo: carga e tempo.
- K-107: o único registro de falha (cartão: semente 1324607460, contraexemplo `[[2,0,6,5,0,7,0,8],29]`, `12 >= 12.15`) bate com a segunda propriedade ("mais itens nunca terminam antes", `montecarlo.test.ts` linhas 142 a 153). Nela o PRNG é fixo (`criarPrng(9)`), mas a vazão e o `k` vêm de `fast-check` sem `seed` fixo, e a asserção `p85(k + 5) >= p85(k)` só vale em média: com 60 simulações, o ruído da amostra pode inverter percentis de duas previsões independentes (a sequência do PRNG avança de forma diferente para cada `k`). Ou seja, a propriedade é estatística e não determinística; 70 casos aleatórios por execução (40 + 30) acham o contraexemplo de vez em quando. Grupo: aleatoriedade. Não reproduzi o contraexemplo nesta rodada (não repeti com a semente do cartão porque mudar a execução do teste está fora do escopo; fica como verificação da E2.2: rodar `fc.assert` com `{ seed: 1324607460 }` deve reproduzir `12 >= 12.15`).

Nota de revisão (E6.3, 2026-10-27): a leitura do K-107 acima (propriedade só estatística) ficou incompleta. A propriedade era falsa por deslocamento da sequência do PRNG entre k e k + 5, não só estatística: com um PRNG único, a previsão de k + 5 consumia sorteios em outra posição da sequência, e `p85(k + 5) >= p85(k)` podia falhar mesmo sem ruído (Histórico do pedido, 2026-10-23 20:55; correção a999345, PRNG por simulação acoplado entre k e k + 5).

## 5. Perf F4, 10 repetições, 1 worker, `--retries=0` (qa-6)

Comando: `E2E_PORTA=4273 E2E_PORTA_ALT=4274 pnpm exec playwright test --project=perf -g "F3 INP" --repeat-each=10 --workers=1 --retries=0` em `e2e/` (teste `e2e/perf/perf.spec.ts:93`, "F3 INP, F4 resposta visual e F5 painel atualizado na troca de filtro (Operacional, p95)"). 1,8 min. Resultado: **6 falhas em 10 (60 %)**, todas `Expected: < 100` em F4; F5 e F3 não falharam.

| Repetição | n de amostras F4 | mediana (ms) | p95 (ms) | primeira (ms) | Resultado |
|---|---|---|---|---|---|
| 1 | 11 | 49,4 | 162,8 | 162,8 | falhou |
| 2 | 6 | 63,6 | 88,2 | 88,2 | passou |
| 3 | 7 | 75,8 | 128,4 | 94,9 | falhou |
| 4 | 7 | 67,7 | 208,5 | 208,5 | falhou |
| 5 | 5 | 64,1 | 94,5 | 94,5 | passou |
| 6 | 7 | 67,2 | 143,0 | 71,8 | falhou |
| 7 | 3 | 66,1 | 177,5 | 177,5 | falhou |
| 8 | 10 | 51,9 | 99,2 | 99,2 | passou |
| 9 | 10 | 50,5 | 73,2 | 53,7 | passou |
| 10 | 11 | 52,3 | 144,7 | 144,7 | falhou |

Memória do slice: `memory.current` 2,15 GB antes e 2,36 GB depois; `memory.peak` 3 043 557 376 B antes e 3 906 584 576 B depois (3,6 GiB; a rodada de uma suíte pequena com o build e dois `vite preview` subiu o pico em ~0,86 GB). `free -m` antes 2 993 MB usados, depois 1 822 MB. Sem processo morto.

Causa raiz (evidência acima): a medida é a de uma amostra minúscula. (a) O teste faz N = 20 trocas (`ORCAMENTO.repeticoes`), mas só entra em `visual` a troca em que `respostaVisualMs` não é `null`; a medição chega com n entre 3 e 11 (em 9 a 17 trocas o observador não viu "ocupado" nem chip novo e a amostra é descartada sem aviso). (b) `percentil(…, 95)` com n <= 20 devolve o máximo (`ceil(0,95 n) = n`), então o p95 é o pior de 3 a 11 números. (c) Nas falhas 1, 4, 7 e 10 o p95 é igual à `primeira` (medição a frio, JIT e primeira renderização), e nas outras duas falhas é um único pico isolado. A mediana é 49 a 76 ms em todas as repetições: o desempenho típico respeita os 100 ms; o que reprova é o máximo de poucos pontos. O mesmo mecanismo explica 105,8 ms em r2 e 244 ms em r1 (achado F-3). Grupo: carga e tempo, com agravante de estatística (amostra < 20 e p95 virando máximo). Não é espera frágil nem aleatoriedade do produto.

## 6. K-092 IF-U-operacional, 10 repetições, 1 worker, `--retries=0` (qa-6)

Comando: `E2E_PORTA=4273 E2E_PORTA_ALT=4274 pnpm exec playwright test --project=chromium -g "IF-U-operacional" --repeat-each=10 --workers=1 --retries=0` (teste `e2e/tests/intensivo-filtros.spec.ts:356`, "IF-U-operacional estado montado na interface: URL ida e volta, Voltar/Avançar, outra aba"). Resultado: **0 falhas em 10**, 4,5 min. Duração de cada execução: 21,6; 26,3; 24,0; 22,2; 21,8; 21,6; 21,8; 21,1; 21,8; 21,3 s (mediana 21,8 s; máxima 26,3 s). Memória do slice: `memory.current` 2,54 GB antes e 2,48 GB depois; `memory.peak` de 3 906 584 576 B para 4 368 506 880 B (4,07 GiB). `free -m` depois: 1 871 MB usados. Sem processo morto.

Causa raiz: o teste sozinho, sem concorrência nenhuma, já consome 70 % a 88 % do orçamento padrão de 30 s do Playwright (mediana 21,8 s; pior 26,3 s). O teste é longo por construção: 4 passos de filtro, cada um com `retrato(page)`, mais 4 `goBack` e 4 `goForward` com `retrato` e um contexto novo no fim, tudo num só `test()`. A folga é de 3,7 a 8,9 s; com 8 workers (CPU e disco disputados) o fator de lentidão necessário para estourar é só 1,15x a 1,4x, o que explica os timeouts de 30 s do cartão e das 19 falhas da r1 com 8 workers. Os irmãos do mesmo arquivo que também são longos (`IF-A`) já ganharam `test.setTimeout(120_000)` com comentário (`intensivo-filtros.spec.ts` linha ~408); o IF-U não. A decisão do pedido, porém, é não aumentar timeout: a correção é dividir o teste (um por comportamento: ida e volta pela URL, Voltar/Avançar, outra aba) e reduzir o custo do `retrato` com o helper único de "painel pronto" (E2.1). Grupo: carga e tempo.

## 7. K-115 CA-19 axe (sustentação no operacional), 10 repetições, 1 worker, `--retries=0` (qa-6)

Comando: `E2E_PORTA=4273 E2E_PORTA_ALT=4274 pnpm exec playwright test --project=chromium tests/sustentacao-no-operacional.spec.ts -g "CA-19 axe" --repeat-each=10 --workers=1 --retries=0` (teste `e2e/tests/sustentacao-no-operacional.spec.ts:297`, um por largura: 375 e 1280 px; 20 execuções). Resultado: **0 falhas em 20**, 5,6 min. Duração de cada execução: 13,3 a 19,9 s (mediana ~14,7 s); as quatro mais lentas foram 19,9; 19,7; 18,4 e 16,4 s. Memória do slice: `memory.current` 2,47 GB antes e 2,61 GB depois; `memory.peak` ficou em 4 368 506 880 B (4,07 GiB, herdado da seção 6). `free -m` depois: 1 973 MB usados. Sem processo morto.

Causa raiz: igual à do K-092, em escala menor. Cada teste percorre as 4 visões numa única execução (`painel.ir` + espera + `rodarAxe` por visão, linhas 297 a 306), então uma execução isolada usa ~49 % do orçamento de 30 s (mediana) e até 66 % no pior caso; o fator de lentidão que reprova é 1,5x a 2,3x. Em repouso passa; sob 8 workers o tempo de `goto`+espera+axe cresce e estoura os 30 s (relato do cartão). Há uma segunda evidência de variância: os piores casos (19,9 s a 375 px e 19,7 s a 1280 px) são 1,35x a mediana sem concorrência nenhuma, e vêm juntos (execuções 6 e 7), padrão de pico de CPU/disco da máquina, não do teste. Grupo: carga e tempo. Não achei espera fixa; a espera é por `aguardar`/`aguardarResumo` (duplicada, K-135).

## 8. Consolidação por teste instável

| Teste (arquivo e nome) | Cartão | Taxa de falha por cenário | Mensagem | Causa raiz provável e evidência | Grupo |
|---|---|---|---|---|---|
| `e2e/perf/perf.spec.ts:93` "F3 INP, F4 resposta visual e F5 painel atualizado na troca de filtro (Operacional, p95)", asserção F4 | (novo; sem cartão) | 1 worker, isolado: 6/10 (60 %); suíte completa com 1 worker (r2): 1/1; 2 workers (r1): 1/1 | `Expected: < 100`, recebido 128 a 244 ms | p95 de n = 3 a 11 amostras vira o máximo; metade das trocas não gera medição (n < 20); mediana 49 a 76 ms em todas (seção 5) | carga e tempo (estatística da medida) |
| `e2e/tests/intensivo-filtros.spec.ts:356` "IF-U-operacional ..." | K-092 | isolado, 1 worker: 0/10; 8 workers: timeout (cartão, r1) | `Test timeout of 30000ms exceeded` (cartão e r1) | já consome 21 a 26 s sozinho: folga de 1,15x a 1,4x (seção 6) | carga e tempo |
| `e2e/tests/sustentacao-no-operacional.spec.ts:297` "CA-19 axe ... quatro visões a N px" | K-115 | isolado, 1 worker: 0/20; 8 workers: timeout (cartão, r1) | idem | 13 a 20 s sozinho (seção 7) | carga e tempo |
| `packages/mock/src/mock.test.ts:30` "gera a base completa em menos de 1,5 s" | K-123 | repouso: 0/10 (+0/5 na unidade completa); sob carga ~10: 1 786 ms (cartão) | `expected 1786 to be less than 1500` (cartão) | limite absoluto de relógio com 7x de folga em repouso e sem calibração; o `desempenho.test.ts` do mesmo pacote já mede CPU e calibra (seção 4) | carga e tempo |
| `packages/metricas/src/core/montecarlo.test.ts` propriedade "mais itens nunca terminam antes (mesma semente)" (linhas 142 a 153) | K-107 | 0/10 em repouso; 2 falhas históricas (#96, #108 do cartão) | `12 >= 12.15` com `[[2,0,6,5,0,7,0,8],29]`, semente 1324607460 (cartão) | `fast-check` sem `seed`, propriedade só estatística (60 simulações). A associação desse contraexemplo a essa propriedade é inferida do formato (`k = 29` dentro de `1..30`, `periodos.p85`); não foi reproduzida nesta rodada | aleatoriedade |
| 19 timeouts de 30 s e 1 asserção de URL (IF-I13) na E2E com 8 workers (r1) | K-132 (9 testes no cartão) | 20/710 com 8 workers; 1/710 com 2 e com 1 | timeout de 30 s; asserção de URL | O nome dos 20 testes da r1 **não foi guardado** (o JSON da r1 se perdeu nas quedas do WSL), então a lista do K-132 não pôde ser confrontada. A leitura é por inferência dos medidos: os testes longos (13 a 26 s sozinhos) estouram sob 8 workers; o IF-I13 é por URL (espera) | carga e tempo / espera frágil |
| E2E regrava `docs/qa/evidencias/**` | K-132 (2ª parte) | 100 % das execuções (F-2) | n/a (sujeira de árvore) | os testes `*-evidencias.spec.ts` gravam no caminho versionado | portão |
| `pnpm test` raiz dispara o E2E | (novo) | 100 % (F-1) | n/a | o pacote `e2e` tem `test: playwright test` e o raiz roda `pnpm -r test` | portão |

Observações: (1) o grupo "espera frágil" (K-135) não tem teste instável medido nesta rodada; só a duplicação do helper foi lida no código (`aguardar`, `aguardarResumo`, `esperarPronto`, `painel.esperarCartoesProntos`), e a medição de 1 worker não a exercita. (2) Nenhum cenário "sob carga" ou de 8 workers foi repetido, por decisão do dono sobre o consumo; o dado de carga vem da r1 e dos cartões.

## 9. Consumo de memória e quedas do WSL

| Rodada | `memory.peak` do `jarvis.slice` depois | `free -m` usados depois | Processo morto |
|---|---|---|---|
| r2, E2E completa, 1 worker (qa-4) | 6 762 012 672 B (6,3 GiB) | n/d | não |
| unidade `@metricas-dspd/metricas` (seção 3) | 3 043 557 376 B (2,8 GiB) | 1 675 MB | não |
| K-107 x10 e K-123 x10 (seção 4) | 3 043 557 376 B (sem aumento) | n/d | não |
| perf F4 x10 (seção 5) | 3 906 584 576 B (3,6 GiB) | 1 822 MB | não |
| IF-U-operacional x10 (seção 6) | 4 368 506 880 B (4,07 GiB) | 1 871 MB | não |
| CA-19 axe x20 (seção 7) | 4 368 506 880 B (sem aumento) | 1 973 MB | não |

`memory.peak` é um máximo desde que o slice subiu, que inclui as outras sessões do Jarvis: o valor depois de cada rodada é um teto superior do consumo, não a medida isolada da suíte; o delta entre rodadas é a melhor estimativa (a perf F4, ~0,9 GB; o IF-U, ~0,5 GB). O maior processo medido (`time -v`) foi o `vitest` do pacote `metricas`, 518 MB de RSS.

Achados:
- F-4 (memória, E2E completa): a r2 chegou a 6,3 GiB (1 worker), perto do teto alto de 7 GB do slice, mas ~2/3 do crescimento é cache de página (`file` 3,2 GB contra `anon` 1,9 GB numa amostra), que o kernel devolve sob pressão. O que cresce o resident de fato (`anon`) é o conjunto de Chromium + `vite preview` x2 + Node dos testes, e cada rodada recompila o `web` duas vezes (as duas `webServer`, build padrão e semente 7), mesmo para rodar 1 teste. Com 8 workers, cada worker abre um Chromium próprio: 8 contextos de página + o build = a causa mais provável das quedas, porque o teto do WSL (8 GB, depois 14 GB) foi alcançado antes de o kernel conseguir devolver o cache.
- F-5 (quedas do WSL): 3 quedas no dia 2026-10-23 (11:40 durante a E2E de 8 workers, 15:00 durante a de 2 workers, e 20:00 por falta de memória virtual do Windows, resolvida com o pagefile; registro no pedido). As duas primeiras aconteceram com a E2E completa em 8 e em 2 workers; a terceira veio logo depois da r2 (1 worker, 63,8 min, pico de 6,3 GiB no slice) e foi atribuída à memória virtual do Windows (pagefile), então 1 worker tampouco é garantia de que a máquina aguenta a E2E completa sem o pagefile corrigido. Nesta rodada (qa-6, pagefile já corrigido) as cinco execuções das seções 4 a 7 e a unidade da seção 3 ocorreram sem queda. Isso é correlação: não isolei a causa por um teste de 2 workers repetido, por decisão do dono. A causa mais provável é a soma de Chromium por worker + build do `web` + cache de arquivo sob o teto da máquina.
- F-6 (resíduo de rodada anterior): `e2e/test-results/` tinha pastas `perf-...-repeat1/3/4/6` de 16:10, de uma rodada do F4 anterior que não gravou nada; ignorei esses dados. `e2e/perf-results/resultado.json` também é sobrescrito a cada rodada de perf.

## 10. Plano de correção por grupo (sem aumentar timeout, sem ligar retry)

| Grupo | Correção proposta | Quem faz |
|---|---|---|
| Carga e tempo, E2E longos (K-092 IF-U, K-115 CA-19, K-132) | Dividir cada teste longo em testes por comportamento (IF-U: ida e volta pela URL, Voltar/Avançar e outra aba separados; CA-19: uma visão por teste, 4 testes por largura), de modo que cada um use bem menos de 10 s sozinho; reduzir o custo do `retrato`/espera com o helper único. Meta de aceite: cada teste isolado < 10 s (1/3 do orçamento), medido em 10 repetições | E2.1, `forge:qa-engineer` |
| Espera frágil (K-135) | Um helper único de "painel pronto" em `e2e/pages/PainelPage.ts`, usado no lugar de `aguardar`, `aguardarResumo` e `esperarPronto`, esperando por estado (`data-estado`, `aria-busy`, role) e não por tempo; conferir que `E2E_PORTA` cobre as duas portas e o `reuseExistingServer` | E2.1, `forge:qa-engineer` |
| Perf F4 (60 % de falha isolado) | Corrigir a medida, não o limite: (a) descartar a medição a frio da amostra e dizer isso no ADR 0003 (decisão do dono, porque muda a regra da medição); (b) fazer toda troca de filtro gerar amostra (n = 20 de fato) e (c) reportar o p95 com n >= 20 ou a mediana de rodadas, em vez do máximo de 3 a 11 pontos. Não afrouxar o limite de 100 ms. O ADR 0003 diz "condições de medição, primeira medição a frio entra na amostra": mudar isso é decisão de regra, não de código | Decisão do dono (`R-DECISAO`); depois E2.1, `forge:qa-engineer` (medida) e, se o produto passar a medir pior que 100 ms mesmo com n >= 20, `forge:react-frontend` |
| Perf F4, memória e tempo de build | `webServer` do Playwright constrói duas vezes por invocação; para as rodadas repetidas, subir o preview uma vez e `reuseExistingServer`; fora do escopo de mudar configuração agora | E2.1 |
| Aleatoriedade (K-107) | Fixar `seed` no `fc.assert` (ou reescrever a propriedade para uma versão determinística: mesma sequência do PRNG para `k` e `k + 5`, ou tolerância justificada), registrando a semente falha como caso de regressão (`examples`) | E2.2, `forge:node-backend` |
| Carga e tempo, unidade (K-123) | Medir o gerador em tempo de CPU e calibrar contra o trabalho de referência, como `desempenho.test.ts` já faz, em vez de limite absoluto de relógio | E2.2, `forge:node-backend` |
| Portão: `pnpm test` dispara o E2E (F-1), `docs/qa/evidencias` suja a árvore (F-2) | Tirar o `e2e` do `test` raiz (filtro ou `test:unit`), com o E2E em script próprio; gravar evidências fora do caminho versionado nas execuções comuns; typecheck do e2e no `pronto` | E3.1, `forge:tech-lead` (K-134, K-132) |
| Portão: `homolog-aprovada` não espera o portão | Já no pedido | E3.2, `forge:devops-engineer` (K-108) |
| Consumo e quedas (F-4, F-5) | Regra de execução: 1 suíte por vez, 1 a 2 workers localmente; `workers` do E2E limitado por configuração (decisão do dono, porque muda `playwright.config.ts`); lista dos 20 testes da r1 recuperável numa rodada de 2 workers com `--reporter=json` gravado em arquivo versionado fora de `evidencias` | E2.1 / E4.1, `forge:qa-engineer`, após decisão do dono |

Pendências da E1.1 que este diagnóstico não fecha: (1) o nome dos 20 testes da r1 de 8 workers (K-132); (2) reprodução do contraexemplo do K-107 com `seed`; (3) taxa de falha "sob carga" dos testes do Diagnóstico (proibida pela regra de consumo). Nenhuma delas muda o plano.

## 11. Prova de estabilidade e parecer da entrega (E4.1)

Base `e342a2c`, head testado `6d40d68`, 2026-10-27, Node 24.22.1, WSL2 (7,9 GB), Chromium headless, uma suíte por vez, `--retries=0`. Banco local saudável. Comandos de E2E com `E2E_PORTA=4273 E2E_PORTA_ALT=4274`, `--workers=1` nas repetições. Não há `jarvis.slice` visível no cgroup desta sessão (`/proc/self/cgroup` é `0::/`), então o pico do slice não pôde ser lido; vale `free -m` (usados): 1 051 MB antes das unidades, 1 539 MB com o E2E completo recém-subido, 3 273 MB depois do último teste, sem processo morto por memória nem queda do WSL.

### 11.1 Repetições (20 seguidas por teste corrigido)

| Teste corrigido | Comando (filtro novo) | Falhas em 20 | Duração mediana / máxima | n do F4 |
|---|---|---|---|---|
| F4 `e2e/perf/perf.spec.ts:96` "F3 INP, F4 resposta visual e F5 ..." (K-138) | `playwright test --project=perf -g "F3 INP" --repeat-each=20` | 0/20 (3,3 min) | 8,5 s / 8,8 s | n = 20 em 20 de 20 repetições (40 trocas em 19 repetições, 42 em 1); p95 do F4 de 41,9 a 47,9 ms (limite 100 ms); a frio fora da amostra: 48,2 a 144,7 ms (mediana ~126 ms) |
| IF-U-operacional dividido (K-092): 4 janelas x 2 testes (URL ida e volta; Voltar/Avançar) + "outra aba" = 9 testes x 20 = 180 execuções | `playwright test --project=chromium -g "IF-U-operacional" --repeat-each=20` | 0/180 (24,1 min) | 7,9 s / 9,5 s (por teste, médias entre 6,6 e 9,0 s) | n/a |
| CA-19 axe (K-115), um teste por visão a 375 e 1280 px = 8 testes x 20 = 160 execuções | `playwright test --project=chromium tests/sustentacao-no-operacional.spec.ts -g "CA-19 axe" --repeat-each=20` | 0/160 (9,3 min) | 3,3 s / 4,4 s | n/a |
| K-107 `packages/metricas/src/core/montecarlo.test.ts` (arquivo, 14 testes, 2 propriedades `fast-check` com seed fixa) | `pnpm exec vitest run src/core/montecarlo.test.ts` em `packages/metricas`, 20 vezes | 0/20 | 822 ms / 853 ms (processo inteiro) | n/a |
| K-123 `packages/mock/src/mock.test.ts` "gera a base completa em menos de 1,5 s de CPU, calibrado" | `pnpm exec vitest run src/mock.test.ts` (arquivo inteiro, 22 testes), 20 vezes; e mais 20 só com `-t "gera a base completa"` | 0/20 e 0/20 | arquivo: 2 690 ms / 2 762 ms; o gerador gasta 281 a 330 ms de CPU, com limite calibrado de 1 705 a 2 465 ms (fator 1,14 a 1,64) | n/a |

Leitura: margem. Os E2E corrigidos usam 8 a 32 % do orçamento de 30 s (antes 70 a 88 %), o F4 tem n = 20 sempre (antes 3 a 11) e o K-123 usa ~17 % do limite calibrado. Nenhuma falha em 380 execuções E2E e 40 de unidade. Observação ao review A3: o `{ timeout: 30_000 }` de `esperarPronto` não foi exercido por nenhuma falha; mantida como recomendação. Segurança A2: este commit leva só o Markdown, sem PNG; a E2E desta rodada gravou evidências em `e2e/evidencias-local` (fora do git), `git status` limpo.

### 11.2 E2E completa, 2 workers (padrão local), `--retries=0`

`pnpm exec playwright test --retries=0` em `e2e/` (portas 4273/4274): 736 testes, **733 passaram, 3 falharam**, 23,4 min, rc=1. O F4 e todos os testes corrigidos passaram na suíte completa. As 3 falhas são de outros testes:

| Teste | Falha | Repetição isolada, 1 worker | Na base `e342a2c` (arquivos de teste da base, mesmo `web`) |
|---|---|---|---|
| `complementares.spec.ts:45` "COMP-01 /operacional?cadencia=sustentacao: recolhida, abre com 6 cartões ... axe AA" (variante 1280 px) | axe `target-size` (serious) no botão "Sobre a janela fixa" de `#ei-sust` | 5/5 falham | 3/3 falham (as outras 3 variantes de COMP-01 passam) |
| `perf.spec.ts:174` "F2 CLS a 375x812 em /operacional" | CLS 0,115 (limite 0,1) | 5/5 falham; as outras 3 rotas passam | 3/3 falham |
| `perf.spec.ts:195` "F2 CLS do Resumo a 375px" | CLS 0,115 | 5/5 falham | 3/3 falham |

Todas são determinísticas (mesmo valor 0,11507 em todas as execuções) e iguais na base: não vêm das correções da branch, e `git diff c4db73e e342a2c -- web` é vazio. Não são as instabilidades do 041. Mas nas rodadas do diagnóstico (E1, base c4db73e, 1 e 2 workers) a suíte teve 1 falha em 710 (a do F4), logo estes três testes passavam antes; o que mudou entre as duas medições (data da máquina, 2026-10-23 e 2026-10-27, ou ambiente) não foi isolado: não afirmo causa. O CLS é compatível com o SNO-004 aberto (CLS do Resumo a 0,125 no Lighthouse).

### 11.3 Obrigação e resultado

| Obrigação (PQ-1 do pedido) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| F4 estável, limite 100 ms, n >= 20, sem a medição a frio (ADR 0003, 2026-10-23) | `perf.spec.ts:96` | 0/20, n = 20, p95 <= 47,9 ms | amostra mínima 20; p95 < 100 ms |
| IF-U-operacional dentro do orçamento sem aumentar timeout (K-092) | 9 testes | 0/180, máx 9,5 s | 30 s do Playwright |
| CA-19 axe dividido por visão (K-115) | 8 testes | 0/160, máx 4,4 s | 30 s do Playwright |
| K-107 determinístico | `montecarlo.test.ts` | 0/20 | k e k + 5 com o mesmo prefixo de sorteios |
| K-123 em CPU calibrado | `mock.test.ts` | 0/40 | 1,5 s x fator em [1, 2] |
| `pronto` verde (typecheck do e2e, K-134) | `pnpm run pronto` | rc=0 (docs:check ok, 736 páginas) | n/a |
| Suíte E2E completa sem falha (2 workers) | 736 testes | 3 falhas pré-existentes (11.2) | n/a |

Vermelho antes do verde e mutação: a mudança é de testes já existentes; o vermelho das correções está nas taxas de falha da seção 8 (F4 6/10, K-107 por contraexemplo registrado, K-123 sob carga) contra 0/20 aqui. Não rodei mutação (a ferramenta não é exigida para correção de teste).

Parecer: **reprovado**, só pelas 3 falhas fora do escopo, que não são das correções mas fazem a E2E completa sair com rc=1 (dívida pré-existente bloqueia e vira cartão). As correções do 041 estão provadas estáveis. Quem decide seguir sem corrigir os três é o usuário (`aceite_usuario: sim`, `R-DECISAO`).

## 12. Reteste do E6 (K-149)

Head testado `83aa9fa` (código do E6.1 em `ea54fbf`, review E6.2 aprovado), 2026-10-27, Node 24.22.1, Chromium headless, uma suíte por vez (conferido com `pgrep` antes de cada rodada), `--retries=0`, em `e2e/` com `E2E_PORTA=4273 E2E_PORTA_ALT=4274`. Nada de teste, limite, timeout ou retry foi alterado: o reteste mede contra o código e os testes do E6.1.

### 12.1 As 3 falhas, 5 repetições cada, 1 worker

| Teste | Comando | Falhas em N | Valor medido |
|---|---|---|---|
| `complementares.spec.ts:45` COMP-01 (4 rotas x 2 larguras = 8 testes, 40 execuções; inclui `/operacional?cadencia=sustentacao` a 1280 px) | `pnpm exec playwright test --retries=0 --workers=1 --repeat-each=5 --project=chromium tests/complementares.spec.ts:45` | 0/40 (4,9 min); a variante 1280 px de sustentação passou 5/5 | 0 violações do axe (antes: `target-size` serious, 5/5 falhas) |
| `perf.spec.ts:174` F2 CLS a 375x812 em `/operacional` | `pnpm exec playwright test --retries=0 --workers=1 --repeat-each=5 --project=perf -g "F2 CLS a 375x812 em /operacional$\|F2 CLS do Resumo a 375px"` (uma rodada para os dois testes) | 0/5 | CLS 0,021 nas 5 repetições (antes 0,115; limite 0,1) |
| `perf.spec.ts:195` F2 CLS do Resumo a 375px | mesma rodada acima | 0/5 | CLS 0,021 nas 5 repetições (antes 0,115; limite 0,1) |

Os valores são idênticos entre repetições, como eram antes (determinísticos). Total da rodada de perf: 10 passaram em 35,5 s.

### 12.2 E2E completa, 2 workers (padrão local), `--retries=0`

`pnpm exec playwright test --retries=0 --workers=2` em `e2e/` (portas 4273/4274): 736 testes, **736 passaram, 0 falharam**, 23,8 min. Na E4.1 foram 733 passaram e 3 falharam, as 3 deste reteste. Nenhuma falha nova. Memória (`free -m`, usados): pico de 5 314 MB nas amostras; sem processo morto nem queda do WSL; o `jarvis.slice` segue não visível no cgroup desta sessão (A4).

`pnpm run pronto`: rc=0 (docs:check ok, 736 páginas). A primeira tentativa deu rc=1 por um único teste do server (`plataforma2.test.ts`, "reprova: SELECT *", estouro de 30 s) enquanto as suítes das worktrees -151 e -026 rodavam ao mesmo tempo; repetida com a máquina livre, passou. Não é do diff (só Markdown mudou) e fica como sinal de sensibilidade a carga.

Parecer: **aprovado**. A1 e A2 do parecer anterior estão resolvidos pela medição. As recomendações A3 e A4 seguem abertas e não bloqueiam; A6 e A7 do review do E6.1 são do tech-lead e ficam fora deste parecer.

## Achados

- A1 (bloqueante) e2e/tests/complementares.spec.ts:45 · COMP-01 a 1280 px em `/operacional?cadencia=sustentacao`: 0 falhas em 40 execuções, sem violação de axe (antes 5/5 com `target-size`). Resolvido pelo E6.1 (K-149).
- A2 (bloqueante) e2e/perf/perf.spec.ts:174 · F2 CLS a 375 px em `/operacional` e no Resumo (`:195`): 0,021 em 5/5 repetições (antes 0,115, limite 0,1). Resolvido pelo E6.1.
- A3 (recomendado) e2e/pages/PainelPage.ts:64 · `{ timeout: 30_000 }` do `esperarPronto` vale também para perf e api, que usavam 5 s; a falha aparece como timeout do teste. Nenhuma falha o exerceu (review A3).
- A4 (recomendado) docs/qa/041-estabilidade.md:11 · pico de memória do `jarvis.slice` não medido (sem slice no cgroup da sessão); a prova usou `free -m`. Medir de dentro do slice na próxima prova longa.

# 0003 - Orçamento de performance do projeto
Estado: vigente
- Status: aceita
- Data: 2026-10-09
- Origem: ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md`, decisão D1 (com D6 e D7); cartão K-018
- Ajusta o orçamento padrão do Jarvis (fábrica Forge) ("Orçamento de performance") para este projeto
- Relacionadas: ADR 0001 (stack do front), ADR 0002 (monorepo), plano técnico `docs/architecture/features/dashboard-mock.md`
- Alteração 2026-10-14 (pedido 010, cartão K-075): seção "Orçamento móvel (pedido 010)", com critério de reversão e leituras próprios. Base: `docs/ux/compatibilidade-mobile-tablet/02-propostas.md` (seção 7) e `04-decisoes.md` (D1 = B, Q2 = projetar para 4G)
- Alteração 2026-10-15 (pedido 011, emenda A11 da ata `docs/alinhamentos/2026-10-14-revisao-desenho-011.md`): seção "Emenda C4 (pedido 011)", com critério de reversão e leitura próprios. Só o C4 muda; o orçamento móvel e os demais itens ficam como estão. Pré-condição do cartão B12
- Alteração 2026-10-16 (pedido 011, ata `docs/alinhamentos/2026-10-16-c4-operacional.md`, parecer `docs/architecture/notas/c4-operacional-011.md`): a "Emenda C4" passa a fixar a composição de C4-fechada, C4-aberta e `VISAO_GERAL`; as leituras do B12 (559/636 ms) ficam invalidadas; o critério de reversão é reescrito. Só o C4 muda

## Contexto
O pedido 003 exige um orçamento de performance específico do projeto, registrado em ADR, e medições reais contra ele ("medição real ou pendente, nunca ok sem número"). O orçamento padrão do Jarvis (LCP < 2,5 s, bundle < 250 KB, API p95 < 300 ms, banco p95 < 500 ms) é genérico. Este sistema tem características próprias:
- Painéis internos, uso majoritário em desktop na rede corporativa, poucos usuários simultâneos.
- No 001 todo o cálculo roda no navegador sobre ~5,8 mil cards e ~6 mil chamados; no 002 o mesmo cálculo roda no servidor (mesma biblioteca, ADR 0002) sobre dados reais do MySQL.
- Cada painel dispara várias métricas em paralelo (cada cartão carrega sozinho, D7); o tempo do painel é dominado pela métrica mais lenta e pelo trabalho total na thread principal.
- Gráficos SVG (Recharts) e um gerador de mock pesado que não pode entrar no chunk inicial.

## Decisão

### Orçamento
Valores são p95 na máquina de referência, salvo indicação. "Bloqueia" = item fora do orçamento impede a entrega (PR) até ser corrigido ou ter exceção registrada nesta ADR com prazo.

**Front-end (web)**
| # | Item | Orçamento | Bloqueia |
|---|---|---|---|
| F1 | LCP (desktop, carga fria, rota `/`) | < 2,0 s | sim |
| F2 | CLS | < 0,1 | sim |
| F3 | INP (interações de filtro, abas, "Ver dados em tabela") | < 200 ms | sim |
| F4 | Troca de filtro: resposta visual (filtro marcado, indicação discreta de atualização, D7) | < 100 ms | sim |
| F5 | Troca de filtro: painel inteiro atualizado, sem a latência simulada | < 500 ms | sim |
| F6 | Bundle JS inicial (gzip) | < 200 KB | sim |
| F7 | Chunk de cada rota (gzip, sem gráficos e sem mock) | < 60 KB | não (alerta) |
| F8 | Chunk de gráficos (Recharts + `components/charts`, gzip) | < 130 KB, carregado só por rotas com gráfico | sim |
| F9 | Chunk do mock + biblioteca (`@metricas-dspd/mock` + `@metricas-dspd/metricas`, gzip) | < 120 KB, fora do inicial, por `import()` dinâmico | sim (fora do inicial); tamanho: alerta |
| F10 | Lighthouse (desktop) | Performance ≥ 90, Acessibilidade ≥ 95 | sim |
| F11 | Chunk `exportar-pdf` (jsPDF + desenhista, gzip; pedido 008) | < 150 KB, só por `import()` ao clicar em "Gerar arquivo"; nunca no inicial (F6) nem em chunk de rota | sim (fora do inicial); tamanho: bloqueia |

**Mock e cálculo (biblioteca, em Node ou navegador)**
| # | Item | Orçamento | Bloqueia |
|---|---|---|---|
| C1 | Geração da base mock + montagem do contexto (índices) | < 500 ms total | sim |
| C2 | Teste de tempo do gerador no CI (Vitest) | < 1,5 s (limite folgado para máquina de CI) | sim |
| C3 | Cálculo de uma métrica, filtros padrão, contexto já montado | < 50 ms p95, **inclusive a primeira chamada (a frio)** | sim |
| C4 | Cálculo de um painel inteiro, com a composição fixada na "Emenda C4" (a `VISAO_GERAL` é painel próprio, medida à parte) | < 300 ms | sim |
| C5 | Heap JS após gerar a base e abrir todos os painéis | < 150 MB | não (alerta) |
| C6 | Tarefa longa única na thread principal durante o cálculo | < 200 ms (acima disso, Web Worker) | sim, via F3/F5 |

**API (002)**
| # | Item | Orçamento | Bloqueia |
|---|---|---|---|
| A1 | `GET` de métrica de painel, p95 | < 300 ms | sim |
| A2 | Mesma consulta com cache quente, p95 | < 50 ms | não (alerta) |
| A3 | Payload de resposta de métrica (gzip) | < 50 KB; listas paginadas | sim |

**MySQL (002)**
| # | Item | Orçamento | Bloqueia |
|---|---|---|---|
| M1 | Consultas de painel, p95, volume de 2 anos | < 500 ms | sim |
| M2 | Todo filtro de painel coberto por índice; `EXPLAIN` das consultas principais registrado em `docs/architecture/` | sem `ALL` (full scan) nas tabelas de fato | sim |
| M3 | Extração da tabela do Acelerato no Metabase (somente leitura) por execução (ADR 0013; antes: MySQL do Acelerato) | < 60 s, sem travar a origem | sim |
| S1 | Partida a frio da Lambda `api` (montar `BaseBM`/`BaseAC` e o contexto) (ADR 0013) | < 1,5 s; com ela, a requisição a frio continua dentro de A1 depois do primeiro acesso | sim |

**Coletas (002)**
| # | Item | Orçamento | Bloqueia |
|---|---|---|---|
| K1 | Carga incremental do BusinessMap | termina dentro da janela agendada, < 15 min, respeitando o limite de taxa da API (pergunta aberta) | sim |
| K2 | Carga incremental do Acelerato | < 5 min | sim |
| K3 | Log de cada execução com início, fim, contagem por entidade e falhas | obrigatório | sim |
| K4 | Webhook do BusinessMap: resposta | < 1 s (só grava no staging; processamento assíncrono) | sim |

### Condições de medição
- **Máquina de referência:** notebook corporativo do time (registrar CPU, RAM e versão do Node/Chromium no relatório do QA). No CI as medições de tempo usam limites folgados (C2 e os múltiplos abaixo) só para pegar regressão grosseira; o valor do orçamento é verificado na máquina de referência.
- **Teste de desempenho do cálculo (C3, `packages/mock/src/desempenho.test.ts`):** mede CPU time (`process.cpuUsage`), não relógio de parede, para não confundir disputa de CPU (lint, outros pacotes) com lentidão do código. O limite de CI é 150 ms (3x) em máquina ociosa; sob contenção ele é multiplicado por um fator de calibração (CPU time de um trabalho de referência fixo medido na mesma execução, dividido pelo valor em máquina ociosa), limitado a [1, 2], ou seja, no máximo 300 ms (o mesmo fator vale para o limite do gerador do mock). O teto impede que uma regressão real (ex.: +300 ms) seja absorvida; isso foi verificado por mutação. **Escopo:** CPU time não enxerga I/O nem espera; o C3 vale só para cálculo síncrono e puro (como é hoje a biblioteca). Se o cálculo passar a fazer I/O ou trabalho assíncrono, a medição precisa voltar a incluir tempo de parede para esse trecho.
- **Dados:** semente e `hoje` padrão do mock (5.788 cards, 6.062 chamados, 18 meses); filtros padrão (todas as equipes, 12 semanas); e o pior filtro conhecido (período máximo).
- **Front:** build de produção (`vite build` + `vite preview`), Chromium do Playwright, desktop 1366×768, sem limitação de CPU para F1–F5 e com CPU 4× mais lenta como alerta adicional. Cache do navegador limpo para F1 (carga fria).
- **Latência simulada do mock** (150–400 ms, D7): desligada nas medições de F5 e C1–C4, porque ela representa rede, não trabalho do sistema. A fonte mock precisa de um ajuste para zerar a latência só em teste (variável de ambiente de build ou opção do construtor; o `react-frontend` define o mecanismo). F4 é medido com a latência ligada (o retorno visual não pode esperar a fonte).
- **p95:** pelo menos 20 repetições por item; a primeira chamada (a frio) entra na amostra e é reportada separadamente.
- **API e MySQL:** dados do seed com volume equivalente a 2 anos, MySQL 8 em container (D15), cache frio e quente medidos à parte.

### Como cada item é medido
| Itens | Ferramenta | Onde |
|---|---|---|
| F1, F2, F3 | Playwright + `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`, `event`) num projeto `perf` do Playwright | `e2e/perf/` (qa-engineer) |
| F4, F5 | Playwright: marcar o instante do clique no filtro e esperar (a) o atributo/indicador de atualização e (b) todos os cartões do painel em estado final (`data-estado` diferente de `carregando`/`atualizando`). Requer marcações estáveis no DOM, combinadas com o react-frontend | `e2e/perf/` |
| F6–F9 | `size-limit` (ou script de gzip sobre `dist/assets` que classifica chunk inicial, rota, gráficos e mock pelo manifest do Vite), rodando depois do `build` | raiz, script `size` (react-frontend) |
| F10 | Lighthouse CI (`@lhci/cli`) sobre o `vite preview`, perfil desktop | CI (qa-engineer) |
| C1, C2 | Teste do gerador no Vitest com `performance.now()`; asserção < 1,5 s no CI; o valor real é impresso para o relatório | `packages/mock` |
| C3, C4 | Teste de tempo no Vitest: contexto montado uma vez, cada `MetricaId` chamado a frio e depois 20×; asserção no CI com limite 3× o orçamento (150 ms por métrica, 900 ms por painel) e valor real impresso; `VISAO_GERAL` medido como painel | `packages/metricas` |
| C5 | `performance.memory`/heap snapshot no Chromium (Playwright) após abrir todos os painéis | `e2e/perf/` |
| C6 | `PerformanceObserver('longtask')` no Playwright | `e2e/perf/` |
| A1–A3 | teste de carga leve (autocannon ou k6) contra a API com o seed | `server/` (002) |
| M1, M2 | `EXPLAIN ANALYZE` registrado + teste de tempo das consultas de painel no MySQL do CI | `server/` (002) |
| K1–K4 | log estruturado das coletas e do webhook; alerta quando passar do limite | `server/` (002) |

Os resultados vão para o relatório do QA (`docs/qa/<pedido>.md`) e para a ata do checkpoint correspondente, sempre com número.

### O que bloqueia a entrega
- Antes de qualquer PR: lint verde, build verde, testes verdes (inclusive C2 e os limites de CI de C3/C4) e F6/F8/F9 (bundle) dentro do orçamento. São automáticos no CI.
- Na pré-entrega (QA): F1–F5 e F10 medidos na máquina de referência; C1, C3 e C4 dentro do orçamento com o número registrado.
- Itens marcados "não (alerta)": entram no relatório e no resumo ao usuário, não seguram o PR.
- Exceção: só com registro nesta ADR (item, valor medido, motivo, remédio e prazo), aprovada pelo arquiteto e pelo tech-lead, e comunicada ao usuário no resumo.

### Medições reais (QA, 2026-10-09 ~19:00, fase A incompleta)
| Item | Medição | Orçamento | Situação |
|---|---|---|---|
| Type-check | 4,2 s, passa | — | ok |
| Testes unitários | 5 arquivos, 64 testes, passam, 8,3 s | — | ok |
| Lint | falha (sem `eslint.config.js`) | verde | **fora** |
| Build | falha em 0,5 s (entry ausente) | verde | **fora** |
| F6 Bundle inicial gzip | não medido (build quebrado) | < 200 KB | pendente |
| C1 Geração + contexto | 196–275 ms (5.788 cards, 6.062 chamados) + 113–147 ms = 309–422 ms | < 500 ms | ok |
| C3 Cálculo por métrica | maioria ≤ 30 ms; **O1 a frio 554 ms** | < 50 ms p95, inclusive a frio | **fora** |
| C4 `VISAO_GERAL` | **655 ms** | < 300 ms | **fora** |
| 33 métricas, filtro 12 semanas | 1,4 s somados | — (não é orçamento: painéis não pedem as 33 juntas) | atenção |
| F1, F3–F5, F10 | não medidos (app não existe) | ver acima | pendente |

### Itens fora do orçamento hoje e remédio previsto (D6, react-frontend, antes de fechar a fase A)
| Item | Causa provável | Remédio previsto | Verificação |
|---|---|---|---|
| Lint | `eslint.config.js` ausente | criar com as regras do ADR 0001 agora; migrar para os blocos por pacote do ADR 0002 na extração | `npm run lint` verde |
| Build | entry (`main.tsx`/shell) incompleto | concluir shell | `npm run build` verde + medição de F6–F9 |
| C3 O1 a frio (554 ms) | reconstrução do WIP diário a partir das transições na primeira chamada | reconstruir o WIP diário por varredura única das transições ordenadas (eventos +1/−1 por dia, O(n log n)), uma vez por contexto e memoizado por quadro, recortando por janela com busca binária; se o custo couber em C1, montar já na criação do contexto; trocar `Math.min(...array)`/`Math.max(...array)` por laço | teste de tempo de C3 a frio < 50 ms (CI < 150 ms) |
| C4 `VISAO_GERAL` (655 ms) | recalcula métricas que os cartões já calcularam e refaz filtros sobre a base inteira | memoizar resultados por `(MetricaId, filtros normalizados)` no contexto e compor a Visão geral a partir deles; pré-ordenar por data de conclusão e reaproveitar recortes de janela | teste de tempo de C4 < 300 ms (CI < 900 ms) |
| Ambos, se ainda fora após memoização | trabalho total na thread principal | mover geração e cálculo para Web Worker atrás da `MockFonteMetricas` (a interface já é assíncrona; nenhum painel muda) | C6 e F5 no Playwright |
| C2 | teste do gerador com limite mais folgado que o orçamento | apertar para 1,5 s | CI |

Memoização não pode alterar resultado: os testes de métrica e o hash da base continuam iguais, e a chave do cache inclui todos os filtros (inclusive período) normalizados.

### Orçamento móvel (pedido 010, 2026-10-14)
Complementa o orçamento acima; nada dele muda. F6 a F9 e F11 (peso dos chunks) já valem para qualquer aparelho, porque o bundle é o mesmo. Os itens abaixo cobrem o que o desktop não mede: CPU de celular, rede 4G e toque.

**Fontes dos números.** Cada valor traz a origem. "Provisório" = sem medição no projeto; o número é a meta de partida e é confirmado ou corrigido com a medição da fatia 1 (Fundamentos), registrada em "Leituras" no fim desta ADR. Valores medidos até hoje que servem de base:
- F6 JS inicial 186,76 KB gzip; JS + CSS inicial 193,11 KB; gráficos 111,38 KB; maior chunk de rota 9,37 KB (`docs/qa/intensivo-sistemico.md`, Desempenho). Folga de F6: **13,24 KB**.
- F1 LCP de `/` com CPU 4× e sem limitar rede: p95 372 ms (mesma fonte); 300 a 704 ms em `docs/qa/001-fase-a.md`.
- F2 CLS a 375 px: 0,000 a 0,019 (mesma fonte e `docs/tecnica/qualidade-e-testes.md`).
- C6 maior tarefa longa, sem limitar CPU: 103 a 139 ms (intensivo). Com CPU 4× não há medição.
- A3: cada resposta de métrica < 50 KB gzip; o Resumo do Operacional faz 12 GETs (`docs/qa/sustentacao-no-operacional-plano.md`).

**Perfil de referência**
| Eixo | Referência | Fonte |
|---|---|---|
| Aparelho | Celular Android de entrada: Chromium com `isMobile: true`, `hasTouch: true`, viewport **390×844**, `deviceScaleFactor` 3 | 390×844 é viewport obrigatório da spec (02, 9.1); Android de entrada é o pior caso de CPU do parque nível 1 (02, matriz; D1 = B) |
| CPU | 4× mais lenta que a máquina de referência | perfil móvel do Lighthouse; já usado como alerta nesta ADR |
| Rede | "4G lenta" do Lighthouse: RTT 150 ms, 1,6 Mbps de descida, 750 kbps de subida | spec 02, seção 7; Q2 = projetar para 4G |
| Tablet | Sem orçamento de rede próprio: o iPad nível 1 usa o mesmo bundle e, em retrato (820), o mesmo layout de faixa média; a referência do celular é mais restritiva | 02, matriz; D1 = B |
| Aparelho real | iPhone e iPad do roteiro de ~15 min por release com interface: observação qualitativa ("travou", "demorou"), sem número | D1 = B; limite da emulação (02, 9.2) |

**Itens**
| # | Item | Orçamento | Fonte | Bloqueia |
|---|---|---|---|---|
| F1m | LCP em `/` e `/operacional`, Lighthouse móvel (perfil acima, carga fria), mediana de 3 | < 2,5 s | spec 02 (F1m); é o limite "bom" do Core Web Vitals. **Provisório**: a estimativa de cascata abaixo dá 2,0 a 3,3 s, ou seja, o valor pode não caber | alerta na fatia 1; **bloqueia a partir da fatia 2** se a leitura da fatia 1 ficar < 2,5 s; se ficar acima, entra como exceção (regra "O que bloqueia") com o remédio abaixo |
| F2m | CLS no perfil de referência (com rede limitada, o esqueleto fica mais tempo na tela), em `/` e `/operacional`, a 390×844 e 375×667 | < 0,1 | igual a F2; medido 0,000 a 0,019 a 375 px | sim |
| F3m | INP de toque (seletor de Visão, abrir Filtros e Menu, "Ver resultados", toque num gráfico, MOB-CA-15) com CPU 4× | < 200 ms | igual a F3 (limite "bom" do INP). **Provisório**: F3 só foi medido sem limitar CPU (48 a 64 ms) | alerta na fatia 1; bloqueia a partir da fatia 2 se a leitura couber |
| C6m | Maior tarefa longa na carga de `/operacional` com CPU 4× | < 200 ms | igual a C6. **Provisório**: sem limitar CPU já mede 103 a 139 ms; 4× disso passa de 400 ms se a escala for linear | alerta |
| F10m | Lighthouse móvel em `/` e `/operacional`, mediana de 3 | Desempenho ≥ 80 (**provisório**, spec 02); Acessibilidade ≥ 95 (igual a F10, medido 100) | spec 02; F10 | Desempenho: alerta; Acessibilidade: sim |
| F12 | Bytes da primeira visita a `/` e a `/operacional` no perfil de referência: JS + CSS + dados da primeira tela, gzip | < 500 KB | spec 02. **Provisório**: só o estático já soma ~314 KB (inicial 193,11 + gráficos 111,38 + rota 9,37); sobram ~186 KB para os dados, que não foram medidos juntos | alerta |
| F13 | Carga por proximidade: abaixo de 1024 px, cartão fora da primeira tela só consulta a API e monta o gráfico quando fica a até uma altura de tela da área visível, com a altura reservada (sem CLS, F2m) | número de `GET` de métrica antes de rolar ≤ cartões visíveis + cartões na margem de uma tela | spec 02 (F13); MT14a do diagnóstico | alerta |
| F14 | Gerar o PDF de 12 métricas com CPU 4× | < 8 s, sem tarefa longa > 200 ms durante a geração depois do clique | spec 02 (F14). **Provisório**: nunca medido; o chunk F11 tem 132,64 KB | alerta |
| F15 | Incremento de código móvel (barra de contexto, gaveta, Compartilhar, faixa de leitura) | cabe em F6 (folga de 13,24 KB) ou vai para chunk carregado sob demanda | F6 vigente | sim, via F6 |

**Decisões tomadas aqui**
- **F13 só abaixo de 1024 px** (faixas compacta e média: celular, celular deitado, tablet em pé). Acima de 1024 vale a spec da Sustentação (7.1), sem carga por proximidade: F5 continua medindo o painel inteiro no desktop e a exportação continua com todos os dados já carregados. Mecanismo: `IntersectionObserver` com `rootMargin` de uma altura de tela, dentro do cartão, sem mudar a regra de que cada cartão carrega sozinho (D7). A exportação, quando aberta, pede os cartões que faltam.
- **Pré-carga de chunk também no toque** (MT7a): toda pré-carga hoje disparada por passagem do ponteiro passa a disparar também em `pointerdown` e em foco.
- **Remédio previsto se F1m passar de 2,5 s na fatia 1**, nesta ordem, cada um medido antes do próximo: `modulepreload` do chunk da rota e do chunk de gráficos em `/` e `/operacional` (corta uma ida e volta da cascata); a primeira tela (cabeçalho e "Pede atenção", MOB-CA-8) pinta sem esperar o chunk de gráficos; só então rever o valor do orçamento, com o número medido, por alteração desta ADR.

**Estimativa de cascata (base do "provisório" de F1m).** Na rede de referência: HTML, depois JS inicial (193 KB a ~200 KB/s ≈ 1,0 s), depois chunk da rota, depois `GET` da primeira métrica. Com o RTT de 150 ms do modo simulado do Lighthouse, ≈ 2,0 a 2,3 s mais a pintura com CPU 4× (372 ms medidos sem rede); com a latência por requisição da limitação real (562,5 ms, ver abaixo), ≈ 3,3 s. Não é medição; é o motivo de F1m nascer como alerta.

**Como medir**
| Itens | Ferramenta | Onde |
|---|---|---|
| F1m, F10m | Lighthouse CI com `formFactor: 'mobile'`, `screenEmulation.mobile: true` e throttling `mobileSlow4G` (padrão móvel do Lighthouse, modo simulado), 3 execuções por URL, mediana. Configuração própria (`lighthouserc.movel.cjs`), separada da desktop | `e2e/lighthouse/` (qa-engineer) |
| F2m, F3m, C6m, F12, F13 | Projeto `perf-movel` do Playwright, **só Chromium** (a limitação de rede e de CPU é via CDP; o WebKit do Playwright não tem CDP). Por contexto novo: `Network.enable` + `Network.emulateNetworkConditions` com os valores ajustados do Lighthouse para limitação por requisição (latência 562,5 ms, descida 1.474,56 kbps = 188.744 B/s, subida 675 kbps = 86.400 B/s) e `Emulation.setCPUThrottlingRate { rate: 4 }`; cache limpo (carga fria). Reaproveita `perf/lcp.ts` (já aceita `throttleCpu` e `viewport`) e as marcações `data-estado` dos cartões. Toques com `locator.tap()`. 20 repetições para p95 em F2m e F3m; F12 e F13 com 3 repetições (são contagens, não tempos) | `e2e/perf/` (qa-engineer) |
| F12 | Somar, para cada resposta até o fim da carga da primeira tela (todos os cartões visíveis com `data-estado` final), o tamanho gzip do corpo: o do manifest/script `size` para os assets, e o corpo recomprimido com `zlib.gzipSync` para as respostas da API que vierem sem compressão. Motivo: o `vite preview` não comprime, e o número bruto superestimaria | `e2e/perf/` |
| F14 | Mesmo projeto `perf-movel`, CPU 4× sem limitar rede: do clique em "Gerar arquivo" ao link "Baixar"; tarefas longas por `PerformanceObserver('longtask')` nesse intervalo | `e2e/perf/` |
| F15 | Script `size` (F6), sem mudança | raiz |

Condições:
- **Fonte de dados:** F1m, F2m, F12 e F13 com a API local e o seed (modo do projeto `perf-api`), porque no celular os dados vêm pela rede; com o mock, o número vai ao relatório marcado "mock" e vale só como alerta. A partida a frio da Lambda (S1) fica fora: é medida à parte.
- **Teto de recursos:** `perf-movel` roda isolado, com 1 worker, fora da suíte paralela (lição do C6 instável, bug 009), com o load de 1 minuto registrado; tag `@perf-movel`. No CI e na rodada noturna, não por PR.
- **Projetos móveis funcionais** (`celular-chromium`, `celular-webkit`, `tablet-webkit`, `tablet-chromium`, spec 02, 9.2) não medem desempenho: o WebKit não limita rede nem CPU, e a emulação de toque não muda o custo de rede.

**O que bloqueia, para o pedido 010**
- Por PR: F15 (via F6), sempre, automático.
- Na pré-entrega do QA de cada fatia: F2m e F10m (Acessibilidade); a partir da fatia 2, também F1m e F3m se a leitura da fatia 1 confirmou que cabem.
- Informativo (relatório e resumo ao usuário, sem segurar o PR): F10m (Desempenho), C6m, F12, F13, F14; F1m e F3m enquanto provisórios.
- Exceção e prazo: a regra de "O que bloqueia a entrega" acima vale igual.

### Emenda C4 (pedido 011, 2026-10-15)
Problema: o C4 diz "todas as métricas do painel", escrito quando o painel tinha só o núcleo. O 011 acrescenta métricas complementares (fase 1: Operacional +7 ids e o bloco do O23 no O2, Tático +5, Estratégico +4, conforme `docs/architecture/features/metricas-tambem-disponiveis.md`, risco C4) que só são calculadas com a seção "Mais métricas" aberta (carga lazy, mesmo plano, seção 4: gerador `gerarExtensaoTambemMock` fora de C1). O C4 passa a valer em duas condições, medidas à parte, mais a `VISAO_GERAL` como painel próprio.

**Composição (fixada em 2026-10-16; vale para o teste, a CI e a pré-entrega do QA).** O C4 mede o que a página do painel pede, não o que o catálogo lista. Por isso:
- **C4-fechada** = os ids que a página pede com "Mais métricas" fechada (estado inicial), **por cadência**. No Operacional são duas medidas: **diária** (O2, com o bloco do O23, que não é lazy, mais BLOQUEADOS e O1) e **semanal** (O3, O9, O4, O12, O10, O7, O15, O18 e EI_FL1). Tático e Estratégico não têm cadência: valem os ids que a página pede com a seção fechada (o núcleo do painel).
- **C4-aberta** = a C4-fechada da mesma cadência mais **todas** as complementares do painel (as anteriores ao 011, que também são lazy, e as do 011). Abrir a seção monta todas juntas.
- **`VISAO_GERAL`** não entra na soma de nenhum painel: pertence à rota `/` e é medida à parte, como painel próprio, a frio (contexto novo), com orçamento próprio < 300 ms (limite de CI 900 ms).
- **Fonte única dos ids.** A lista de ids de cada medida vem do catálogo (`CATALOGO_CARTOES`, por painel, `grupo` e cadência), numa função só, usada pelo teste de C4 e por quem mais precisar dela. É proibido escrever a lista à mão no teste. Se a página passar a pedir mais ids fora de "Mais métricas", o catálogo muda junto e o teste acompanha.

| Condição | O que entra no cálculo | Orçamento | Limite de CI | Bloqueia |
|---|---|---|---|---|
| C4-fechada, por cadência (Operacional: diária e semanal; Tático e Estratégico: núcleo) | só o que a página pede com a seção fechada, sem `VISAO_GERAL` | < 300 ms, igual ao C4 vigente | 900 ms (3x) | sim, na pré-entrega do QA e na CI; sem regressão permitida pelas novas |
| C4-aberta, por cadência | a fechada da cadência mais todas as complementares do painel, com a geração lazy já paga | < 450 ms | 900 ms (3x) | **não (alerta)**, até o critério abaixo mandar o contrário |
| `VISAO_GERAL` (rota `/`) | só ela, a frio | < 300 ms | 900 ms (3x) | sim, como o C4 vigente |

Derivação de 450 ms: 300 ms mais 3 métricas novas a 50 ms (C3); os C3 medidos a frio são bem menores, então o valor pode apertar. Valor mantido; a leitura válida abaixo o confirma ou o corrige.

**Leitura só vale com registro.** Uma leitura de C4 só conta como leitura do orçamento quando o relatório registra, junto do número, o load de 1 minuto da máquina e o fator de calibração da execução, **com fator ≤ 1,2** (e a mediana de 5 contextos novos em CPU time, com 3 execuções quando o valor ficar a menos de 20% do limite). Leitura sem esse registro, ou com fator > 1,2, não vale como leitura de orçamento; vale só para o limite de CI.

Regras da emenda:
- **Gerador lazy fica fora do C4 e do C1.** O primeiro cálculo que precisa da extensão paga a geração uma vez por contexto; esse custo é medido separado (teste de tempo próprio do gerador, já previsto no plano) e reportado como "primeira abertura", não entra na amostra de 20 repetições, mas entra na leitura a frio do B12. Limite da geração da extensão: < 200 ms; **B12 mediu 13 a 15 ms (mediana de 5), folga ampla** (sem medição no projeto; C1 inteiro mede 196 a 275 ms para 5.788 cards, e a extensão é menor que a base).
- **O limite vale por painel, não pela soma das 42+ métricas.** Painéis não pedem tudo junto; o mesmo princípio da linha "33 métricas" da tabela de medições.
- **Cada complementar continua em C3 sozinha** (< 50 ms a frio, limite de CI 150 ms). C3 a frio medidos nos cartões: O1 cerca de 10 ms depois do B8 (antes: 31 a 38 ms; `docs/tecnica/biblioteca-de-calculo.md`, seção da varredura); O20 18 a 24 ms e O24 11 ms (relatos dos cartões B9 e B10, números não registrados em arquivo do repositório; o B12 os repete e grava no relatório). B12 (mediana de 5 contextos novos, CPU time, `packages/mock/src/orcamentoC4.test.ts`): O19 3 ms, O20 35 ms, O21 5 ms, O24 6 ms, O25 3 ms, T10 2 ms, T11 1 ms, T12 3 ms, E7 1 ms, E9 1 ms; todos abaixo de 50 ms.
- A medição usa as condições já fixadas (semente e `hoje` padrão, filtros padrão e pior filtro conhecido, CPU time, melhor de rodadas) e passa pela biblioteca compartilhada; nada de cálculo próprio para o painel.
- Memoização por `(MetricaId, filtros normalizados)` e a varredura por coluna (B8) valem nas duas condições; o resultado das métricas anteriores não pode mudar (hash da base e snapshots iguais).

**O que bloqueia (C4 do 011)**
- Bloqueia o PR do B12: limite de CI de 900 ms nas duas condições, por painel e por cadência (Operacional diária e semanal, Tático, Estratégico) e na `VISAO_GERAL`, com o valor registrado; e C4-fechada < 300 ms (por cadência) e `VISAO_GERAL` < 300 ms na pré-entrega do QA, com leitura válida (load e fator ≤ 1,2 registrados).
- C4-aberta < 450 ms e a geração lazy < 200 ms: **alerta** (relatório e resumo ao usuário) até haver leitura válida; se a leitura válida couber, passam a bloquear na pré-entrega do QA das fases seguintes por alteração desta ADR; se não couber, o valor é revisto com o número medido, por alteração desta ADR, nunca por exceção silenciosa.
- Exceção: regra de "O que bloqueia a entrega" acima.

**Critério de reversão da emenda** (vale sobre a composição acima): se uma leitura válida (load e fator ≤ 1,2 registrados, 3 execuções) mostrar C4-aberta acima de 450 ms em algum painel ou cadência, com todas as complementares já em C3 < 50 ms, o carregamento lazy deixa de ser suficiente e as complementares passam a ser calculadas só por cartão (cada uma em seu `GET`, D7), sem entrar em nenhuma composição de painel; o C4 volta a valer só como C4-fechada. Leitura feita com outra composição (com `VISAO_GERAL` na soma, ou com as complementares na fechada) ou sem o registro de carga não aciona nem afasta o critério. Se a C4-fechada (por cadência) ou a `VISAO_GERAL` passarem de 300 ms em leitura válida, não há reversão: é item fora do orçamento, com remédio e prazo ou exceção registrada (regra "O que bloqueia a entrega").

## Alternativas consideradas
- **Orçamento padrão do Jarvis sem ajuste** (LCP < 2,5 s, bundle < 250 KB, troca de filtro < 200 ms/1 s): simples, mas folgado demais para uma SPA interna de desktop com dados em memória; não cobre o cálculo da biblioteca, que é o gargalo real medido (O1 a frio, `VISAO_GERAL`). Descartado.
- **Medir só no CI**: automático, mas máquinas de CI variam muito; geraria falhas aleatórias ou limites tão folgados que nada pegariam. Adotado o modelo misto: limites folgados no CI para regressão grosseira e valor do orçamento na máquina de referência na pré-entrega.
- **Web Worker desde já**: tira o cálculo da thread principal de saída, mas adiciona serialização, complexidade de teste e de depuração antes de saber se é necessário. Fica como remédio condicionado à medição.
- **Pré-calcular tudo na geração do mock**: painéis instantâneos, mas o custo vai para C1 e deixa de exercitar o caminho que o servidor vai usar (calcular sob demanda com cache). Descartado.
- **Orçamento só de front, deixando API/banco/coletas para o 002**: o 002 já começa após a extração e o desenho do MySQL depende das metas de consulta; registrar agora evita reabrir a ADR.
- **Móvel (010), ADR nova em vez de seção aqui**: separaria dois orçamentos que dividem os mesmos chunks e a mesma regra de exceção; `praticas.md` §5 e o quadro apontam para esta ADR. Descartado.
- **Móvel com F1m bloqueante desde a fatia 1**: a estimativa de cascata dá até 3,3 s; bloquear antes de medir pararia a fatia 1 por um número sem base. Descartado: alerta até a primeira leitura.
- **Móvel medido só pelo Lighthouse**: um número por URL, sem toque, sem contar requisições (F13) e sem INP. Adotado só para F1m e F10m; o resto no Playwright com CDP.
- **Carga por proximidade (F13) em todas as larguras**: economiza dados também no iPad deitado, mas muda o que F5 mede no desktop e contraria a spec da Sustentação (7.1). Descartado; reabre se o iPad deitado passar de F12.

## Consequências
- Mais fácil: discussões de performance passam a ter número e dono; regressões de bundle e de cálculo são pegas no CI; o servidor herda metas claras para a mesma biblioteca.
- Mais difícil: o `qa-engineer` mantém um projeto `perf` no Playwright e o Lighthouse CI; o `react-frontend` precisa expor marcações estáveis de estado dos cartões e um modo sem latência simulada na fonte mock; testes de tempo exigem cuidado para não ficarem instáveis.
- Riscos:
  - Testes de tempo instáveis no CI → limites de CI como múltiplos do orçamento, aquecimento separado da medição, valor real impresso para acompanhar tendência.
  - Volume real maior que o mock (002) → C3/C4 valem para o volume do mock; o servidor é medido por A1/M1 sobre 2 anos de seed, com cache das métricas pesadas.
  - Orçamento de bundle apertado com Recharts → gráficos em chunk próprio (F8); se estourar, revisar importações por submódulo antes de trocar de biblioteca.
- Móvel (010):
  - Mais difícil: o `qa-engineer` mantém um projeto `perf-movel` só em Chromium e uma configuração móvel do Lighthouse; o `react-frontend` implementa a carga por proximidade abaixo de 1024 e a pré-carga no toque, e encaixa o código móvel na folga de 13,24 KB de F6.
  - Risco: F6 estoura com o código móvel → barra de contexto, gaveta e Compartilhar em chunk sob demanda (F15).
  - Risco: Safari real mais lento que a emulação de Chromium → o roteiro em iPhone e iPad reais (D1 = B) registra lentidão percebida; dois relatos na mesma tela viram medição dedicada.
  - Limite: nenhum número móvel vale para o Safari; a referência é Chromium com CPU e rede limitadas.

### Medição das tendências do Resumo (node-backend, 2026-10-14; plano `sustentacao-no-operacional`, B3)
Mock em escala padrão (5.788 cards, 6.062 chamados), CPU time (`process.cpuUsage`), contexto recriado a cada medição, máquina com carga média de 7 a 10 (outros agentes rodando suítes); medida com o mesmo método de `packages/mock/src/desempenho.test.ts` (mediana de 5 contextos a frio, 2ª chamada, p95 de 20). Biblioteca isolada (C3):

| Métrica | A frio (mediana de 5) | 2ª chamada | p95 de 20 | Orçamento C3 | Situação |
|---|---|---|---|---|---|
| TENDENCIA_FLUXO (6 meses) | 16,6 ms | 12,4 ms | 12,4 ms | < 50 ms | ok |
| TENDENCIA_SUST (6 meses) | 4,2 ms | 3,7 ms | 5,2 ms | < 50 ms | ok |
| O3 (referência) | 15,4 ms | 10,1 ms | 11,9 ms | < 50 ms | ok |
| S2 (referência) | 5,0 ms | 4,1 ms | 5,1 ms | < 50 ms | ok |

API (Fastify `inject`, dublê de banco com o mesmo mock; sem Postgres): `GET` a frio, com a base já carregada, 10,9 ms (fluxo) e 7,1 ms (sustentação); a quente (cache de resultado) p95 1,0 ms e 0,6 ms; outra `dataReferencia` sem cache de resultado, 6,5 ms (fluxo) e 77,6 ms (sustentação, que reindexa o Acelerato para o novo corte, como já faz o S2). Corpos de 8,6 KB e 7,9 KB. Todos dentro de A1 (< 300 ms) e A2 (< 50 ms). **Não medido:** A1/A2 contra o Postgres real com 2 anos de seed (`e2e/tests/perf-api.spec.ts` exige a pilha no ar); fica para o QA na pré-entrega. A carga da base (primeira consulta depois de uma coleta) é a do domínio, não da tendência.

Como o custo ficou baixo: o ponto de cada mês usa o mesmo núcleo do O3 (`classesNaJanela`) e do S2 (`aderenciaPorPrioridade`), sem refazer pontos, série semanal e variação; os entregues por tipo e os chamados apuráveis são montados uma vez para os seis meses (não dependem do corte). A primeira versão, que chamava `calcularO3` inteiro em seis contextos, custava cerca de 550 ms a frio e estourava o limite de CI de 150 ms. Efeito colateral: o O3 passou de cerca de 65 ms para cerca de 15 ms (as pontas da janela eram lidas por item).

## Por que o existente não basta
Vale para o projeto `perf-movel` e a configuração móvel do Lighthouse (ferramenta nova). O que existe: projetos `perf` e `perf-api` do Playwright (desktop e o caso a 375 px, sem limitar rede) e `lighthouserc.cjs` com `preset: 'desktop'` ("sem limitação de CPU e rede"). Evidência de execução: as medições de F1 (p95 372 a 384 ms) e F10 (LCP 627 a 877 ms) em `docs/qa/intensivo-sistemico.md` foram feitas sem limitar rede; a única limitação existente é a de CPU 4× no F1, que não altera o número (372 ms contra 384 ms), porque o custo da carga fria em 4G está na rede, que nenhum teste emula. O diagnóstico do 010 registrou a lacuna (MT14). Sem um projeto com rede limitada, F1m, F12 e F13 não têm como ser medidos.

## Critério de reversão
Do orçamento móvel: se a leitura da fatia 1 mostrar F1m < 2,5 s **e** F12 < 500 KB em `/operacional` sem a carga por proximidade (F13 desligada), F13 sai do orçamento e do código, porque a economia de rede não justifica a diferença de comportamento entre faixas.

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-10-14 | Orçamento móvel registrado; nenhum item móvel medido. Base: F6 186,76 KB, F1 com CPU 4× p95 372 ms, CLS a 375 px até 0,019 | pendente (medir na fatia 1) |
| 2026-10-15 | Emenda C4 (011) registrada. C3 a frio relatados: O1 cerca de 10 ms, O20 18 a 24 ms, O24 11 ms. C4-aberta 450 ms, geração lazy 200 ms: provisórios | pendente (medir no B12) |
| 2026-10-16 | **Leitura válida do C4 na composição fixada** (node-backend preenche: load de 1 min, fator de calibração ≤ 1,2, 3 execuções). **Leitura válida** (node-backend, `packages/mock/src/orcamentoC4.test.ts` com a composição fixada, CPU time, mediana de 5 contextos novos, extensões já geradas; 4 execuções válidas em sequência sob `flock` e `nice -n 19`, máquina ociosa: load de 1 min de 0,68 a 0,86 e fator de calibração de 1,00 a 1,17, todos ≤ 1,2; intervalo das 4 execuções; uma quinta execução, com load 5 por contenção do E2E de outra frente, foi descartada). Operacional diária, fechada / aberta: 12s 57 a 65 / 121 a 145 ms; 12m 43 a 45 / 153 a 164 ms. Operacional semanal, fechada / aberta: 12s 68 a 77 / 132 a 148 ms; 12m 137 a 152 / 257 a 280 ms. Tático, fechada / aberta: 12s 22 a 30 / 70 a 84 ms; 12m 24 a 26 / 76 a 85 ms. Estratégico, fechada / aberta: 12s 6 a 7 / 29 a 31 ms; 12m 8 a 11 / 32 a 39 ms. `VISAO_GERAL` a frio: 79 a 96 ms. Gerador lazy: 2 a 5 ms. C3 a frio dos ids novos: todos < 50 ms (O20 22 a 25 ms o maior). **Todas as medidas dentro do orçamento** (fechada < 300, aberta < 450, `VISAO_GERAL` < 300), logo o critério de reversão não é acionado. Leituras do Operacional semanal 12m aberta (até 280 ms) são as mais próximas do limite, ainda a 62% dele. Referência, sem valor de leitura (tech-lead, máquina ociosa, load 0,95 a 1,16, fator não registrado): tela fechada 41 a 80 ms (12s) e 46 a 209 ms (12m); aberta 170 a 211 ms (12s) e 313 a 369 ms (12m); `VISAO_GERAL` 84 a 104 ms; o 011 não piora o C4 em nenhuma composição (ata de 2026-10-16) | leitura válida registrada em 2026-10-16; critério de reversão não acionado |
| 2026-10-15 | **INVÁLIDA (composição errada e carga sem registro; não aciona o critério de reversão).** B12, leitura da emenda C4 (CPU time, mediana de 5 contextos novos, extensões já geradas, filtros 12s e 12m; teste `packages/mock/src/orcamentoC4.test.ts`). Fechada/aberta: Operacional 559/636 ms (12s) e 516/577 ms (12m); Tático 165/176 e 172/184; Estratégico 126/131 e 141/147. Gerador lazy 13 a 15 ms. C3 a frio dos ids novos: ver acima, todos < 50 ms (O20 35 ms o maior). **Operacional fora do orçamento nas duas condições**: a fechada (20 métricas anteriores ao 011 + `VISAO_GERAL`, 559 ms) já passa de 300 ms sem nenhuma métrica do 011; as 5 novas somam 61 a 77 ms. Maiores custos a frio no Operacional: `VISAO_GERAL` 158 ms, O1 126 ms, O20 55 ms. Limite de CI (900 ms): dentro nas 12 medições | **invalidada em 2026-10-16.** Motivos: (1) a composição somou a `VISAO_GERAL` (da rota `/`) e as 7 complementares anteriores ao 011, que já eram lazy; (2) foi medida sob contenção, sem registro de load nem de fator (o teste chega a fator 2,0); (3) os 559 e 636 ms não se reproduzem com a máquina ociosa (ata de 2026-10-16). O critério de reversão não foi acionado por esta leitura. Os números por id (C3 a frio, gerador lazy) seguem como relatados |

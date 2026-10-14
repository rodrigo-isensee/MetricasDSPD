# 0003 - Orçamento de performance do projeto
Estado: vigente
- Status: aceita
- Data: 2026-10-09
- Origem: ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md`, decisão D1 (com D6 e D7); cartão K-018
- Ajusta o orçamento padrão do Jarvis (fábrica Forge) ("Orçamento de performance") para este projeto
- Relacionadas: ADR 0001 (stack do front), ADR 0002 (monorepo), plano técnico `docs/architecture/features/dashboard-mock.md`

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
| C4 | Cálculo de um painel inteiro (todas as métricas do painel, incluindo `VISAO_GERAL`) | < 300 ms | sim |
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

## Alternativas consideradas
- **Orçamento padrão do Jarvis sem ajuste** (LCP < 2,5 s, bundle < 250 KB, troca de filtro < 200 ms/1 s): simples, mas folgado demais para uma SPA interna de desktop com dados em memória; não cobre o cálculo da biblioteca, que é o gargalo real medido (O1 a frio, `VISAO_GERAL`). Descartado.
- **Medir só no CI**: automático, mas máquinas de CI variam muito; geraria falhas aleatórias ou limites tão folgados que nada pegariam. Adotado o modelo misto: limites folgados no CI para regressão grosseira e valor do orçamento na máquina de referência na pré-entrega.
- **Web Worker desde já**: tira o cálculo da thread principal de saída, mas adiciona serialização, complexidade de teste e de depuração antes de saber se é necessário. Fica como remédio condicionado à medição.
- **Pré-calcular tudo na geração do mock**: painéis instantâneos, mas o custo vai para C1 e deixa de exercitar o caminho que o servidor vai usar (calcular sob demanda com cache). Descartado.
- **Orçamento só de front, deixando API/banco/coletas para o 002**: o 002 já começa após a extração e o desenho do MySQL depende das metas de consulta; registrar agora evita reabrir a ADR.

## Consequências
- Mais fácil: discussões de performance passam a ter número e dono; regressões de bundle e de cálculo são pegas no CI; o servidor herda metas claras para a mesma biblioteca.
- Mais difícil: o `qa-engineer` mantém um projeto `perf` no Playwright e o Lighthouse CI; o `react-frontend` precisa expor marcações estáveis de estado dos cartões e um modo sem latência simulada na fonte mock; testes de tempo exigem cuidado para não ficarem instáveis.
- Riscos:
  - Testes de tempo instáveis no CI → limites de CI como múltiplos do orçamento, aquecimento separado da medição, valor real impresso para acompanhar tendência.
  - Volume real maior que o mock (002) → C3/C4 valem para o volume do mock; o servidor é medido por A1/M1 sobre 2 anos de seed, com cache das métricas pesadas.
  - Orçamento de bundle apertado com Recharts → gráficos em chunk próprio (F8); se estourar, revisar importações por submódulo antes de trocar de biblioteca.

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

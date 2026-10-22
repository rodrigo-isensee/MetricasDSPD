# Proposta 037: C6 de /operacional longe do limite, sem afrouxar o orçamento

Propósito: decidir como levar a maior tarefa longa (C6, ADR 0003) de `/operacional` para longe de 200 ms, de forma estável na CI, para o portão de homologação do PR #131 ficar verde. Público: react-frontend, qa-engineer, tech-lead, devops-engineer, dono. Revisão: depois da sonda S0 (seção 6) e na entrega da implementação.

- Data: 2026-10-20. Autor: `software-architect`. Pedido 037, etapa E1.5, cartão K-113.
- Atenção: o `README.md` desta pasta diz que o conteúdo dela é arquivado. **Este arquivo não é arquivado**: é a proposta vigente do K-113, no caminho pedido pelo Jarvis. Ver "Melhoria vista" no relatório.
- Normas: ADR 0003 (C6 < 200 ms, bloqueia; remédio previsto: Web Worker atrás da `MockFonteMetricas`), ADR 0021 (cálculo do mock em Web Worker, estado `proposta`), parecer `docs/architecture/notas/c6-011.md` (gatilho de reabertura), ADR 0011 (biblioteca única de cálculo).
- Insumos: `docs/qa/bugs/C6-operacional-playwright-1-64.md` (medição E1.2), `docs/devops/homolog-2026-10-16.md` (long-tasks da CI por atribuição), `docs/qa/front-via-api.md` (C6 no `perf-api`), `e2e/perf/perf.spec.ts` e `e2e/perf/lcp.ts`, `web/src/data/mock/MockFonteMetricas.ts`, `web/src/app/App.tsx`, `web/src/features/operacional/resumo/`.

## 1. O que está sendo medido
- O teste "F2 CLS e C6 tarefa longa em `/operacional`" usa `ROTAS.operacionalResumo` (`/operacional`, sem parâmetro), ou seja, **o Resumo**. Cada amostra é uma carga completa da página (`page.reload()`), logo cada amostra paga o boot do mock inteiro: nada fica memoizado de uma carga para outra.
- O C6 de cada carga é a maior entrada de `PerformanceObserver('longtask')` (só a thread principal). O critério é a mediana agregada de `PERF_RODADAS_C6 × 5` cargas: 15 localmente, 5 na CI (`PERF_RODADAS_C6=1`).
- **Local e CI medem builds diferentes.** O QA mede localmente com `VITE_MOCK_LATENCIA=0`; a CI faz o build sem `VITE_*`, então o mock sorteia de 150 a 400 ms de latência por chamada (correção registrada em `c6-011.md`, "Decisão com medições").

Números: local 171 a 211 ms (mediana das 5 execuções: 194 no código da main, 180 no da develop; load 1,9 a 2,5); CI 208 a 225 ms. O Playwright 1.64.1 não explica (E1.2): o C6 vive no limite e depende da CPU da máquina.

## 2. Causa provável
Tudo do mock roda na thread principal (`MockFonteMetricas.ts`). Na carga do Resumo, as tarefas candidatas são:

| Tarefa | Conteúdo | Aparece em | Divisível hoje? |
|---|---|---|---|
| T1 | `gerarBaseMock` (núcleo BM + `aplicarTambemFase1` + Acelerato) e a normalização de `data_acordada` (cópia dos ~5,8 mil cards) | local e CI, igual em todas as rotas | não: uma chamada síncrona |
| T2 | `criarContextoBM` | local e CI | não (está na biblioteca) |
| T3 | `criarContextoAC` + `gerarPesquisaMock` + `criarContextoPesquisa` e, **na mesma tarefa**, as continuações em microtarefa que não esperam timer: `gerarColetasMock` (os dois `useEstadoColeta` do Resumo) e `criterios()` | local e CI | não: microtarefa não abre tarefa nova |
| T4 | **Rajada do Resumo**: com latência 0, as 12 chamadas (`O3`, `O4`, `O2`, `O12`, `BLOQUEADOS`, `O1`, `O10`, `TENDENCIA_FLUXO`, `S2`, `S1`, `S3`, `TENDENCIA_SUST`) continuam na mesma fila de microtarefas, a frio, pagando os índices preguiçosos dos dois contextos | só local (na CI cada uma espera o seu timer) | não |
| R | Render/commit do React dos cartões | local e CI | sim (por chegada) |

Atribuição:
- **CI:** a maior tarefa é T1. O devops mediu, no Lighthouse da CI, a tarefa "script inline do documento: geração do mock e contextos" com 198 a 240 ms, igual em todas as rotas (`homolog-2026-10-16.md`, conclusão, item 3). É a mesma faixa dos 208 a 225 ms do #131. O C6 da CI é, na prática, **o custo da geração da base no runner**.
- **Local:** T1 e T4 disputam a maior tarefa. O Resumo é a única visão que pede métricas dos dois domínios e as coletas no boot, então T3+T4 carregam os índices a frio do BusinessMap **e** do Acelerato juntos. Isso explica por que `/operacional` é a rota mais alta localmente (161 ms já em 2026-10-16, contra 135 a 149 nas outras).
- **Não é render.** No `perf-api` (navegador só renderiza, sem gerar nem calcular), o C6 mediu de 0 a 68 ms em todas as rotas (`front-via-api.md`, 2026-10-12). Ressalva: a medição é anterior ao Resumo; a sonda S0 a refaz.
- Ainda não há perfil do navegador com pilha. A atribuição por função é inferência pelo código e pelas medições citadas; a sonda S0 confirma antes do código.

**Gatilho já disparado.** O parecer `c6-011.md` ("Gatilho de reabertura") manda promover a ADR 0021 se qualquer rota tiver mediana ≥ 170 ms no `perf` do PR, no `perf-homolog` do portão ou na rodada do QA. O `perf-homolog` do #131 mediu 208 e 225 ms, e a rodada local de E1.2 ficou entre 171 e 211 ms. O gatilho disparou.

## 3. Alternativas

### A. Web Worker atrás da `MockFonteMetricas` (ADR 0021, como está escrita)
- **O que muda:** geração, normalização, os três contextos, extensões, coletas, `calcularMetrica`, `paginarO2` e todos os métodos que leem a base vão para um Worker de módulo, um por instância. A thread principal só renderiza e mantém a latência simulada (D7) com o mesmo sorteio. A interface `FonteMetricas` não muda; o cálculo continua sendo a biblioteca única, chamada por um núcleo puro usado tanto pelo Worker quanto pelo caminho em processo (jsdom). Detalhe completo nas seções 1 a 6 da ADR 0021.
- **Efeito no C6:** T1, T2, T3 e T4 saem da thread principal. Sobram o render e o *structured clone* de cada resposta (DTO < 50 KB, A3). Cada resposta chega em sua própria tarefa (`message`), então o render também se distribui. Teto esperado: o C6 do `perf-api` (0 a 68 ms).
- **Esforço:** 2 a 3 dias do `react-frontend`, mais os testes de paridade (ADR 0021, seção 3).
- **Risco:** médio. Paridade de DTO pelo clone (coberta pelos itens 1 a 4 da paridade); CSP (Worker como arquivo da mesma origem, sem `blob:`); testes E2E que dependam de ordem de chegada precisam esperar `data-estado`; o C5 tem de somar o heap do Worker (ver seção 5).
- **Impacto em outras rotas:** todas as rotas do mock melhoram, porque T1 a T3 são iguais em todas. O modo API (`HttpFonteMetricas`) não muda. Os chunks F6/F9 não mudam de categoria (o chunk do Worker é F9).
- **Margem:** independe do tamanho da base. A fase 2 do 011 pode engordar a base sem reabrir o C6.

### B. Fatiar na thread principal
- **O que muda:** (b1) ceder (`scheduler.yield`, com `MessageChannel` como alternativa) antes de cada `calcularMetrica` e antes de `gerarColetasMock`; (b2) trazer de volta a geração em fases de `ref/c6-gerador-em-fases`, drenada com cessões.
- **Efeito no C6:** (b1) desfaz T4 e separa as coletas de T3, mas só localmente: na CI a latência já separa as métricas. (b2) separa o núcleo BM do B11a e do Acelerato, mas **o núcleo BM é indivisível** (165 ms de CPU no Node, sob carga) e `criarContextoBM` também. Na CI, onde o C6 já é T1, a maior tarefa passaria a ser o núcleo BM ou `criarContextoBM`, provavelmente entre 150 e 190 ms no runner. Não dá a margem pedida.
- **Evidência contra:** o (a1), que é o (b1), foi implementado (`6d64255`) e medido sem ganho (ADR 0021, "Por que o existente não basta").
- **Esforço:** cerca de 1 dia (front e pacote do mock). **Risco:** baixo para o resultado (hash da base igual), mas muda a ordem de resolução das promessas nos testes.
- **Impacto em outras rotas:** pequeno e igual em todas.

### C. Reduzir o trabalho da carga sem mudar de thread
- **O que muda:** perfilar `gerarBaseMock`, `criarContextoBM` e `gerarColetasMock` e cortar custo onde não muda resultado. Candidatos vistos no código: a normalização de `data_acordada` copia os ~5,8 mil cards a cada boot (poderia ser só os cards com a data, sem `map` total); o passo `parados` do B11a percorre todos os bloqueios por card envelhecido; `gerarColetasMock` não precisa estar no boot do Resumo se as coletas forem pedidas depois da primeira pintura. Hashes da base, do Acelerato e das coletas iguais, e snapshots de métricas iguais.
- **Memoização (ADR 0003) não se aplica aqui.** Ela corta cálculo repetido dentro de uma sessão (C4). O C6 é medido em carga fria, a cada `reload`, e não há nada repetido para memoizar. A variante "persistir a base gerada entre cargas" (IndexedDB ou `sessionStorage`) faria as cargas 2 a 15 de cada rodada pularem T1. **Afrouxa controle? Sim**: o teste deixaria de medir a carga que o usuário de demonstração tem na primeira visita, e a mediana agregada passaria a medir cache quente. Fica rejeitada.
- **Efeito no C6:** incerto, estimado em 20 a 50 ms em T1 e T3, sem perfil que o confirme. Não muda a natureza do problema: o C6 continua proporcional ao tamanho da base, e a fase 2 do 011 o devolve ao limite.
- **Esforço:** 1 a 2 dias, quase todo de perfil. **Risco:** médio, por mexer no gerador (hash) e no pacote da biblioteca.
- **Impacto em outras rotas:** o corte em T1 vale para todas; o adiamento das coletas, só para o Resumo e os blocos com `FrescorFonte`.

### Comparação
| | A. Worker | B. Fatiar | C. Reduzir trabalho |
|---|---|---|---|
| Ataca a maior tarefa da CI (T1) | sim, sai da thread | não (núcleo BM indivisível) | em parte |
| Ataca a rajada local (T3+T4) | sim | sim (b1) | em parte |
| Margem estável abaixo de 150 ms | sim (teto do render, 0 a 68 ms, a confirmar em S0) | não | improvável |
| Resiste à base maior (fase 2 do 011) | sim | não | não |
| Mecanismo novo | sim (ADR 0021, com "Por que o existente não basta") | não | não |
| Esforço | 2 a 3 dias | ~1 dia | 1 a 2 dias |
| Afrouxa controle? | não (seção 5) | não | não; a variante de cache persistente, sim, e está rejeitada |

## 4. Recomendação
**Recomendo a alternativa A: implementar a ADR 0021 (cálculo do mock em Web Worker), precedida pela sonda S0.**

Motivos:
1. Na CI a maior tarefa é a geração da base (T1). Só mudar de thread a tira do C6; fatiar não divide o núcleo BM, e a memoização não atua em carga fria.
2. O existente já foi tentado e medido: `ceder()` entre fases e o (a1) por métrica não deram ganho (ADR 0021, "Por que o existente não basta"). A evidência que a regra de mecanismo novo pede já está registrada.
3. É o remédio que a ADR 0003 prevê ("acima disso, Web Worker"; seção "Itens fora do orçamento", linha "Ambos, se ainda fora após memoização"), e o gatilho de `c6-011.md` disparou.
4. A margem não depende da máquina nem da base. Na CI, o runner mais lento que a estação continua longe do limite, porque o trabalho que escala com a CPU deixa de contar.

A alternativa C fica como **melhoria opcional e separada**, sem bloquear o #131: adiar `gerarColetasMock` não é necessário com o Worker.

**Condição de parada (antes de escrever o Worker):** se a sonda S0 der mediana do C6 no `perf-api` ≥ 120 ms em `/operacional` (Resumo), o render sozinho come a margem. Nesse caso o Worker continua necessário (T1 continua acima de 200 ms na CI), mas não basta: abro o caminho (c) da ADR 0021 (render fatiado ou adiado) junto, antes de mexer no código. Com S0 ≥ 170 ms, paro e reabro a proposta.

**ADR 0021:** passa de `proposta` a `vigente` quando a S0 der < 120 ms em `/operacional` e < 170 ms em `/` e em `/operacional?cadencia=diaria` (a condição original dela). A alteração do estado e a leitura vão no mesmo commit da implementação.

## 5. O que NÃO muda
- **O limite.** C6 < 200 ms, bloqueante, ADR 0003. Nenhuma exceção.
- **O método do teste.** `perf.spec.ts`, teste "F2 CLS e C6", `PerformanceObserver('longtask')`, mediana agregada de `PERF_RODADAS_C6 × PERF_REPETICOES_C6` cargas, cada carga um `reload` sem cache de base entre cargas, `PERF_RODADAS_C6=1` na CI. Sem "repetir até passar", sem melhor rodada.
- **Afrouxa controle ao mover para o Worker? Não.** O C6 é definido como tarefa longa **na thread principal** (ADR 0003, tabela C6), e a própria ADR prescreve o Worker. O trabalho que sai dela continua medido: C1 e C2 no Node (gerador < 1,5 s), C3 e C4 na biblioteca, e o tempo de boot dentro do Worker registrado pelo QA (ADR 0021, seção 5, C2). F5 continua medindo o painel inteiro atualizado, agora com a ida e volta da mensagem.
- **Um ponto que afrouxaria se ninguém cuidasse: o C5 (heap, alerta).** O teste lê `JSHeapUsedSize` da página pelo CDP; com o Worker, a base passa a morar no heap dele e o número cairia sem a memória ter diminuído. **Afrouxa controle? Sim, se não for ajustado.** Exigência: o QA soma o heap do alvo do Worker (sessão CDP do Worker, `page.on('worker')`) ao da página, como a ADR 0021 já pede ("o C5 tem de somar os dois heaps").
- **A biblioteca única.** Nenhum cálculo novo nem fora de `@metricas-dspd/metricas`: o Worker chama a mesma `calcularMetrica`. Hashes da base (`68a67741` ou o vigente), do Acelerato (`0113e077`) e das extensões iguais; snapshots das métricas iguais.
- **BusinessMap e Acelerato** continuam em contextos separados dentro do Worker, como hoje.
- **Interface e modo API.** `FonteMetricas`, painéis e hooks não mudam; `HttpFonteMetricas` não cria Worker.

## 6. Divisão do trabalho
Branch: `feature/037-c6-operacional`, base `develop`. Um cartão em andamento por agente.

| Ordem | Dono | Entrega | Paralelo com |
|---|---|---|---|
| S0 | `forge:qa-engineer` | **Sonda, antes do código (cerca de 1 hora).** (1) `perf-api`: teste "F2 CLS e C6" em `/operacional` (Resumo), `/operacional?cadencia=diaria` e `/`, sobre a `develop` (`12018de`), `PERF_RODADAS_C6=3`, `PERF_REPETICOES_C6=5`, sob `flock`, load de 1 min registrado (de preferência < 2). (2) Um perfil do Chromium (Performance, com pilha) de uma carga de `/operacional` no build mock **com a latência ligada** (o build da CI) e outro com latência 0, nomeando a função da maior tarefa em cada um. Registrar em `docs/qa/bugs/C6-operacional-playwright-1-64.md`, seção nova. | 1 (o front pode começar o núcleo puro) |
| 1 | `forge:react-frontend` | Implementar a ADR 0021: núcleo puro (sem DOM, sem `postMessage`) com geração, normalização de `data_acordada`, contextos, extensões, coletas, `calcularMetrica` e `paginarO2`; invólucro do Worker (`new Worker(new URL(..., import.meta.url), { type: 'module' })`, nunca `blob:`/inline); RPC com id e erro com a mesma mensagem; fallback em processo quando `typeof Worker === 'undefined'`; opção `transporte`; latência simulada na thread principal com o mesmo sorteio; chunk do Worker classificado como F9 em `web/scripts/size.mjs`. Testes Vitest de paridade 1 a 3 da ADR 0021 (todas as `MetricaId`, sementes padrão e `12345`, forma do DTO, hashes e as 20 primeiras latências). | S0 (só o núcleo; o Worker espera o veredito da S0) |
| 2 | `forge:qa-engineer` | Em paralelo com 1: o E2E de transporte (paridade item 4: o build mock usa o Worker e `VISAO_GERAL`, `O2` e uma complementar do Acelerato chegam iguais ao caminho em processo); ajuste do C5 para somar o heap do Worker. Não toca no método do C6. | 1 |
| 3 | `forge:tech-lead` | Code review: paridade verde, hashes iguais, nenhuma importação de `@metricas-dspd/mock` ou `@metricas-dspd/metricas` na thread principal no modo Worker, CSP sem mudança, nenhum cálculo fora da biblioteca. | — |
| 4 | `forge:qa-engineer` | Medição do pronto (abaixo) e parecer em `docs/qa/`. | — |
| 5 | `forge:tech-lead` → `forge:devops-engineer` | PR para a `develop`, promoção para `homolog`, portão. O devops relata o `perf-homolog` e o `homolog-aprovada` do novo candidato do #131. | — |
| 6 | `forge:software-architect` | Leitura na ADR 0021 e no fim desta proposta; estado da ADR 0021 a `vigente`. | — |

**O que o QA mede depois (critério de pronto):**
1. **C6 local, build mock com latência 0** (o mais severo): `perf.spec.ts`, teste "F2 CLS e C6", **nas 7 rotas de `ROTAS_PAINEL`**, `PERF_RODADAS_C6=3`, `PERF_REPETICOES_C6=5`, sob `flock`, load de 1 min registrado e < 2, **2 execuções**. Meta de margem: **mediana agregada < 150 ms em todas as rotas e nas 2 execuções**. Registrar p85, medianas por rodada e máximo; máximo ≥ 250 ms em qualquer carga pede um perfil antes do PR.
2. **C6 local, build sem `VITE_*`** (o build da CI, latência ligada), em `/operacional`: mediana < 150 ms, 1 execução.
3. **Comparação na mesma sessão:** a `develop` sem o Worker, em `/operacional`, mesma configuração.
4. **CI:** `perf` do PR e `perf-homolog` do portão com C6 < 150 ms em todas as rotas. Um valor entre 150 e 200 ms passa no portão, mas volta para mim antes da release.
5. **Sem regressão:** F5 p95 dentro do orçamento (< 500 ms) e não pior que a `develop` na mesma sessão; F3 INP < 200 ms; F1 sem piora; F6 sem aumento além de 2 KB gzip e F9 dentro do limite (`pnpm --filter web size`); C5 somando os dois heaps, < 150 MB (alerta); Lighthouse F10 ≥ 90 nas rotas que já passam.
6. **Determinismo:** hashes da base, do Acelerato e das extensões inalterados; `pnpm run pronto` e E2E verdes.

## 7. Riscos e decisões em aberto
- **Prazo do #131.** O Worker leva de 2 a 3 dias mais o QA. Até a correção chegar a `homolog`, o portão do #131 pode continuar vermelho por C6. Rodar de novo até passar é aposta, não evidência, e fica descartado. Se a release não puder esperar, a escolha é do dono (`R-DECISAO`), nunca uma exceção silenciosa no limite.
- **Render como gargalo.** A medição do `perf-api` (0 a 68 ms) é anterior ao Resumo. A S0 decide antes do código (condição de parada da seção 4). A rota semanal teve duas long-tasks de render (222 e 119 ms) no Lighthouse da CI (K-102); a medição do pronto nas 7 rotas as pega se ainda existirem.
- **Paridade por clone.** Um DTO com `Date`, `Map` ou instância de classe muda sem erro visível. Os itens 1, 2 e 4 da paridade são obrigatórios no review.
- **Medição sob carga.** As leituras de E1.2 foram com load de 1,9 a 2,5. O pronto exige load < 2 registrado.
- **Testes dependentes de ordem.** A resposta passa a chegar em outra tarefa; testes que esperam tempo em vez de `data-estado` podem oscilar. O QA confere na etapa 2.
- **Segurança.** Não há dependência nova (RPC próprio, sem Comlink) nem mudança de CSP. Se a implementação pedir `worker-src` ou outra mudança de CSP, o `security-engineer` é acionado antes do PR (`R-SEGURANCA`).

## Leituras
| Data | Medida | Veredito |
|---|---|---|
| 2026-10-20 | C6 de `/operacional` (Resumo): local 171 a 211 ms (E1.2, load 1,9 a 2,5); CI 208 a 225 ms (#131). Gatilho de `c6-011.md` disparado | recomendar A, sujeito à S0 |
| — | S0: C6 do `perf-api` e perfis do navegador | pendente |
| — | Pronto: C6 com o Worker nas 7 rotas, 2 execuções | pendente |

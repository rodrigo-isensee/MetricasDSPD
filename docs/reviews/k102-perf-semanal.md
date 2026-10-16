---
tipo: review
contrato: 1
pedido: k102-perf-semanal
branch: fix/perf-visao-semanal
commit: dddcf0a
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: K-102, fila de montagem dos gráficos (perf da visão semanal)

Este arquivo tem duas voltas e duas revalidações. A volta 1 vem logo abaixo e revisou `1599a77`. A volta 2 revisou os ajustes R1 a R5 (`47a628f`, `0650926` e `4bad6e6`). A primeira revalidação confere os ajustes V2-1 e V2-2 do QA (`28ddea2`) e o commit do parecer do QA (`36975e6`). A segunda, no fim do arquivo, confere o merge da `develop` (`dddcf0a`). O frontmatter aponta para `dddcf0a`.

**Escopo:** commit `1599a77` sobre `5eaf202` (develop). São 6 arquivos, com 138 linhas a mais e 3 a menos: `web/src/components/charts/filaDeGraficos.ts` (novo), `GraficoBase.tsx`, um teste novo, dois testes ajustados e a seção 10 de `docs/tecnica/arquitetura-front.md`.
**Contexto:** o portão `perf` do PR de release #90 reprovou `/operacional?cadencia=semanal` com nota 0,88 a 0,89. O TBT foi de 256 a 263 ms, por causa de duas tarefas longas de render em `react-*.js` (222 e 119 ms). Diagnóstico em `docs/devops/homolog-2026-10-16.md`, seção 1a.
**Veredito:** **aprovado**. Há 5 ajustes recomendados e nenhum bloqueia. A correção ataca a causa que o devops provou (render concentrado num commit), não muda nenhum resultado de cálculo e mantém a reserva de altura.

## Ferramentas (citadas, não refeitas)

`flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` na worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, sobre `1599a77`: **EXIT=0**.
- `eslint .` e `prettier --check` passaram.
- web: 74 arquivos e 1043 testes passaram, cobertura de 100% (3999/3999 statements, 3441/3441 linhas). Nenhum aviso do React no log: não houve "flushSync was called from inside a lifecycle method", "not wrapped in act" nem erro de console.
- server: 496 passaram e 83 foram pulados (PostgreSQL). metricas: 653. mock: 161. contratos: 47. docs-contratos: 102, com `docs:check` ok.

O Lighthouse da CI (`perf`) não roda no `pronto`. A medição local do autor está na seção 10 de `arquitetura-front.md`: semanal de 0,93-0,95 para 0,99, TBT de 155-188 para 21-23 ms, diária e Sustentação sem piora. Quem confirma é o QA e a CI (roteiro abaixo).

## Pontos pedidos

### 1. `flushSync` dentro de tarefa de `MessageChannel`
- **Avisos:** o React só avisa quando o `flushSync` é chamado durante render ou efeito. Aqui ele roda no `onmessage` do canal, fora de qualquer ciclo do React, e o log do `pronto` confirma que não há aviso.
- **Concorrência com transições:** hoje não existe `startTransition`, `useTransition` nem `useDeferredValue` em `web/src`. Se algum entrar, cada `flushSync` da fila (prioridade síncrona) interrompe o render da transição, que recomeça depois. Com N gráficos na fila, a transição pode recomeçar até N vezes. Não é defeito hoje, mas a regra precisa ficar escrita (R4).
- **Desmontagem no meio da fila:** o efeito devolve a limpeza, que tira o pedido da fila com `splice`. Se o pedido já tinha saído da fila (vez em andamento), o `setLiberado` cai num componente desmontado, e no React 19 isso não faz nada e não avisa. O teste "gráfico desmontado antes da vez" cobre esse caso.
- **StrictMode** (`main.tsx`): o ciclo duplo de montar, limpar e montar tira e recoloca o pedido na fila, sem duplicar.
- **Erro dentro do pedido:** se o `flushSync` lançar exceção, `rodando` fica `true` para sempre e a fila para para o app inteiro. No React 19, erro de render vai para o `onUncaughtError` (`reportError`) e não é relançado, então o risco é baixo. Mesmo assim, um `try/finally` custa pouco (R1).

### 2. Vazamento entre rotas e entre testes (`definirFilaImediata`)
- **Rotas:** o estado `liberado` é local ao componente. Gráfico desmontado na troca de rota sai da fila, e gráfico já liberado não volta para a fila quando o filtro muda. Por isso F4 e F5 da ADR 0003 (resposta ao filtro e painel atualizado) não são afetados. Só a montagem nova (troca de rota ou de cadência) passa pela fila.
- **Testes:** `imediata` é estado do módulo. `graficos.test.tsx` e `graficos-composicao.test.tsx` ligam esse estado em `beforeAll` e não desligam depois. O Vitest está com o isolamento por arquivo padrão (`web/vite.config.ts` não tem `isolate: false`), então o estado não passa para outros arquivos hoje. Se alguém desligar o isolamento para ganhar tempo, os testes de painel passam a montar sem fila sem que ninguém perceba. Recomendo um `afterAll` simétrico (R3).

### 3. Efeito global em todos os gráficos
- Todo gráfico que passa por `GraficoBase` entra na fila: AreaEmpilhada, Barras, SerieLinhas, Dispersao, Histograma, MapaCalor, ParEspera e os da Sustentação.
- **Exceção:** `GraficoMensal`, usado por `features/operacional/resumo/SerieMensal.tsx`, não usa `GraficoBase` e monta fora da fila. A doc afirma que `GraficoBase` é "ponto único de todo gráfico", o que não é verdade (R2). Para o perf medido isso não muda nada (as três rotas ficaram verdes no local), mas a doc precisa corrigir a frase ou registrar a exceção.
- Não há ordem entre cartões (vale a ordem de montagem), e a doc diz isso. O tempo até o último gráfico cresce com o número de gráficos, a uma tarefa por gráfico (a maior medida foi de 71 ms). Isso é aceitável dentro do LCP < 2,0 s (F1), porque o LCP da semanal é o texto do O3, não um gráfico.
- **Aba em segundo plano:** o primeiro turno espera um `requestAnimationFrame`, que o navegador congela em aba oculta. Os gráficos de uma aba aberta em segundo plano só montam quando ela fica visível. Para um painel isso é aceitável, e o cartão, o texto e a tabela aparecem do mesmo jeito. Fica registrado como nota.
- No modo tabela o hook também entra na fila e libera um estado que ninguém usa. É inofensivo (a ordem dos hooks é respeitada, porque o hook vem antes do `return` antecipado).

### 4. Acessibilidade
- No primeiro commit já estão `figure`, `figcaption` (`sr-only`), `aria-describedby` com a frase de leitura, a legenda e o botão "Ver como tabela". A tabela equivalente (ADR 0001) não depende da fila: no modo tabela, o `GraficoBase` devolve a `TabelaDados` antes de olhar a vez do gráfico.
- Enquanto espera, a caixa fica vazia e sem conteúdo acessível. Isso dura alguns milissegundos e não muda nada para o leitor de tela, que já tem a frase e a legenda.
- **Testes E2E que leem o SVG** (ajuste de QA, não do código; ver item 11 do checklist em R5):
  - `e2e/tests/b3-sust-ei-vg.spec.ts:51` (SUS-08) chama `evaluateAll` direto em `svg rect[fill]` do S4. Se o gráfico ainda não tiver montado, `fills` sai vazio e `length <= 2` passa sem testar nada.
  - `e2e/tests/b12-fluxo.spec.ts:73` afirma ausência de `svg[role=img]` em BLOQUEADOS. O cartão é só tabela, mas a ausência agora também passaria se fosse um gráfico atrasado.
  - `e2e/tests/responsivo.spec.ts:61` já espera `toBeAttached` antes de medir e está correto.

### 5. CLS
A caixa com `height: altura` e `min-height: 200` é a mesma de antes e já existe no primeiro commit. O gráfico entra dentro dela, então não há salto de layout. A medição local do autor deu o mesmo CLS de antes (0,018 na semanal, 0,004 na diária, 0,067 na Sustentação), e o primeiro teste de `filaDeGraficos.test.tsx` afirma a altura reservada antes do gráfico. **CLS inalterado.**

## Checklist de leitura (praticas.md, seções 2, 4 e 5)
- Tipagem, nomes em português e ausência de `console`, de código morto e de TODO: ok.
- Componentes testados pela tabela e pelo texto: os dois testes de gráfico ligam a fila imediata e seguem olhando o desenho, como antes. O teste novo cobre a fila.
- Orçamento (ADR 0003): nenhuma dependência nova e sem efeito no bundle (61 linhas, sem import novo além de `react-dom`, que já é usado).
- Regras invioláveis: nenhum cálculo tocado.
- Commit: Conventional Commits em português, um commit coerente, mensagem com causa, medição e cartão.
- Decisão nova: é um mecanismo de UI. "Por que o existente não basta" tem evidência de execução: o autor testou escalonar as seções, sem ganho, e o perfil de CPU está descrito na seção 10. **Falta critério de reversão** (R2).

## Ajustes recomendados (nenhum bloqueia)

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `web/src/components/charts/filaDeGraficos.ts:36` | Exceção no `flushSync(pedido)` deixa `rodando = true` e para a fila de todo o app. | `try { flushSync(pedido) } finally { proximaTarefa(servir) }`. | recomendado |
| R2 | `docs/tecnica/arquitetura-front.md` §10 | A doc diz "ponto único de todo gráfico", mas `GraficoMensal` (SerieMensal) fica fora. Também falta o critério de reversão. | Registrar a exceção ou passar o SerieMensal pela fila. Escrever o critério de reversão, por exemplo: tirar o `useVezDoGrafico` do `GraficoBase` se o TBT da semanal na CI voltar a ficar acima de 200 ms com a fila, ou se algum gráfico deixar de aparecer. | recomendado |
| R3 | `graficos.test.tsx:19`, `graficos-composicao.test.tsx:8` | `definirFilaImediata(true)` sem desligar depois. Hoje só é seguro por causa do isolamento por arquivo. | `afterAll(() => definirFilaImediata(false))`. | recomendado |
| R4 | `filaDeGraficos.ts` (comentário) e §10 | A interação com transições não está escrita. | Uma linha dizendo que a fila usa `flushSync` e por isso interrompe transições, e que quem adotar `startTransition` precisa reavaliar a fila. | recomendado |
| R5 | `filaDeGraficos.test.tsx:31-38` | "Um por tarefa" é provado de forma fraca. O `waitFor` consulta a cada 50 ms e os três turnos terminam em menos de 1 ms no jsdom, então `contagens` sai `{0, 3}` e `size > 1` passa mesmo se os três montassem juntos depois do primeiro frame. | Contar com um `MutationObserver` ou espiar `MessagePort.prototype.postMessage`, e afirmar que as contagens observadas formam a sequência 0, 1, 2, 3. | recomendado |

Notas para o QA, sem ajuste no código: SUS-08 (`b3-sust-ei-vg.spec.ts:51`) precisa esperar o SVG do S4 (`toBeAttached` em `svg rect` ou na `.recharts-wrapper`) antes do `evaluateAll`, e a ausência em `b12-fluxo.spec.ts:73` deve ser relida. O resto foi descrito acima: aba em segundo plano e modo tabela entrando na fila.

## Revisão de UX
**Sim, revisão curta.** A interface muda de forma perceptível: o cartão aparece com a caixa vazia e os gráficos entram um a um, em ordem que não é fixa. O UX precisa confirmar que a caixa vazia por alguns milissegundos é aceitável, sem esqueleto e sem animação de entrada. Também precisa olhar o tema escuro e a largura de 320 px. Não há mudança de texto nem de fluxo.

## Roteiro do QA
1. `pnpm run pronto` na branch (o EXIT=0 deste review já cobre os unitários). Rodar o E2E completo (`pnpm -F e2e test` ou o comando do projeto) duas vezes, para pegar instabilidade de tempo, com atenção a SUS-08, OP-05/24 e M6 (`responsivo.spec.ts`).
2. Portão `perf` da CI no PR para a `develop`, ou `lhci` local no mesmo preset (build sem `VITE_*`, mock com latência, 3 execuções). Critério:
   - nota de no mínimo 0,9 em `/operacional`, `?cadencia=semanal` e `?cadencia=sustentacao`;
   - TBT da semanal abaixo de 100 ms;
   - CLS igual ao de antes (semanal 0,018, diária 0,004, Sustentação 0,067);
   - LCP abaixo de 2,0 s;
   - nenhuma tarefa longa de `react-*.js` acima de 100 ms na semanal.
3. Manual no navegador:
   - semanal, diária e Sustentação com mock e latência: todo gráfico aparece, sem salto de layout;
   - "Ver como tabela" antes e depois de o gráfico aparecer;
   - troca rápida de cadência no meio da fila: nenhum gráfico some, sem erro no console;
   - aba aberta em segundo plano e depois focada: os gráficos montam ao focar;
   - leitor de tela (NVDA ou Orca) no O4: frase e legenda anunciadas.
4. axe sem violações nos E2E das três rotas.
5. Depois do merge na `develop`, promover para `homolog` e conferir o `perf-homolog` do mesmo SHA, que é o que destrava o PR de release #90.

---

# Volta 2: ajustes R1 a R5 e E2E (b3, b12)

**Escopo:** `47a628f`, `0650926` e `4bad6e6` sobre `1a18d8e` (o parecer da volta 1). São 7 arquivos, com 32 linhas a mais e 13 a menos: `filaDeGraficos.ts`, três testes unitários, a seção 10 de `arquitetura-front.md`, `b12-fluxo.spec.ts` e `b3-sust-ei-vg.spec.ts`.
**Veredito:** **aprovado**. Os cinco ajustes foram atendidos e nenhum resultado de cálculo mudou. Ficam duas recomendações para os E2E (V2-1 e V2-2), que não bloqueiam e o QA pode resolver no próprio roteiro, sem nova volta de review.

## Ferramentas (citadas, não refeitas)
- O `pnpm run pronto` completo sobre `4bad6e6` não foi rodado neste review, por R-TETO: o node-backend roda vitest em outra worktree. Ele é o passo 1 do roteiro do QA. A volta 1 tem EXIT=0 sobre `1599a77`.
- Rodado aqui, sob `flock /tmp/metricas-pesado.lock nice -n 19`, três vezes seguidas: `vitest run` de `filaDeGraficos.test.tsx`, `graficos.test.tsx` e `graficos-composicao.test.tsx`. Resultado: 3 arquivos e 35 testes passaram nas três execuções, sem instabilidade.
- `eslint` nos arquivos do diff (charts e as duas specs E2E): limpo.
- `prettier --check` acusa `b12-fluxo.spec.ts`, `b3-sust-ei-vg.spec.ts` e `arquitetura-front.md`, mas isso não é achado. O `format:check` do `pronto` só cobre `web packages tools`, e o `b12` já estava fora do formato em `1a18d8e`.

## Ajustes da volta 1

| # | Commit | Atendido? | Leitura |
|---|---|---|---|
| R1 | `47a628f` | sim | `flushSync(pedido)` está dentro de `try/finally`, e o `finally` agenda o próximo turno. A exceção continua subindo até o `onmessage` e cai no `reportError`, sem sumir. Não há teste do caminho de exceção. No React 19 é difícil fazer o `flushSync` lançar, porque o erro de render não é relançado. Aceito sem teste. |
| R2 | `0650926` | sim | A exceção do `GraficoMensal` está registrada com motivo, e o critério de reversão está escrito: TBT da semanal acima de 200 ms na CI com a fila, ou gráfico que deixa de aparecer. |
| R3 | `47a628f` | sim | Os dois arquivos ganharam o `afterAll(() => definirFilaImediata(false))`, simétrico ao `beforeAll`. |
| R4 | `47a628f`, `0650926` | sim | A nota sobre transições está no docblock do módulo e na seção 10, com os três hooks citados. |
| R5 | `47a628f` | sim | Ver a decisão abaixo. |

### R5: a sequência `[1, 2, 3]` prova "um por tarefa"?
**Prova o que importa, e não precisa de ajuste.**
- **Por que o 0 não aparece:** o `MutationObserver` é ligado depois do primeiro commit e só registra a contagem depois de uma mutação. O estado 0 já está afirmado logo antes, por `queryByTestId('g1')` nulo e pelas três caixas com 300 px. Na prática, a asserção cobre a sequência 0, 1, 2, 3, que é a que a volta 1 pediu. Se alguma mutação estranha acontecesse com zero gráficos, a lista sairia `[0, 1, 2, 3]` e o teste falharia. É um falso negativo possível, nunca um falso positivo, e o teste rodou estável três vezes.
- **O que a sequência detecta:** o observador entrega as mutações num microtask, no fim da tarefa que as causou. Se dois ou três gráficos montassem no mesmo commit, ou em commits síncronos dentro da mesma tarefa, ele veria um salto (`[3]`, `[2, 3]` ou `[1, 3]`) e o teste falharia. Essa é a regressão que a volta 1 apontou, e ela fica coberta.
- **O que não detecta:** a diferença entre uma tarefa por gráfico e um microtask por gráfico. Se `proximaTarefa` trocasse o `MessageChannel` por `queueMicrotask`, o observador ainda rodaria entre um gráfico e outro e veria 1, 2, 3, mas todos cairiam na mesma tarefa do navegador, e o TBT voltaria. Essa troca seria uma reescrita deliberada do módulo, e o comentário de `proximaTarefa` explica por que é tarefa. Quem prova a granularidade de tarefa é o portão `perf` (passo 2 do roteiro do QA: nenhuma tarefa longa de `react-*.js` acima de 100 ms). Espiar `MessagePort.prototype.postMessage` só acrescentaria acoplamento à implementação. Não peço.

## E2E (notas da volta 1)

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| V2-1 | `e2e/tests/b3-sust-ei-vg.spec.ts:52-55` | A espera aceita o primeiro `rect[fill]` ou `path[fill]` do S4. Esse elemento pode ser um elemento de fundo, de grade ou de eixo com `fill="none"`, que existe antes das barras. Se for, `fills` sai vazio depois do filtro, e `length <= 2` volta a passar sem testar nada, que é o caso que o comentário diz evitar. | Afirmar também o mínimo: `expect(fills.length).toBeGreaterThanOrEqual(1)`. Outra opção é esperar `.recharts-bar-rectangle` em vez de qualquer `rect`/`path`. | recomendado |
| V2-2 | `e2e/tests/b12-fluxo.spec.ts:67-68,75` | Esperar "algum gráfico da página" não garante que a vez de um gráfico em BLOQUEADOS já passou, porque a fila não tem ordem entre cartões. A ausência no fim continua dependendo do tempo. | Tornar a ausência independente da fila: o `GraficoBase` desenha o `figure` já no primeiro commit, então incluir `figure` no localizador da ausência (`b.raiz.locator('figure, svg[role="application"], svg[role="img"], canvas')` com `toHaveCount(0)`) prova "só tabela" sem esperar nada. Antes, confirmar que a `TabelaDados` do cartão não usa `figure`. | recomendado |

Item 11 do checklist (teste de ausência relido): o texto procurado nas duas specs ainda existe. V2-1 é o caso do "mínimo de itens" que falta.

## Checklist de leitura (praticas.md, seções 2, 4 e 5)
- Seção 2: sem `any`, sem spread em `Math.max` (o `Math.max(...contagens)` antigo saiu do teste), nomes em português e nenhum `catch` vazio (é `try/finally`, sem `catch`). Ok.
- Seção 4: o teste é determinístico, sem hora atual (o rAF e o `MessageChannel` do jsdom são a fonte de ordem) e estável em três execuções.
- Seção 5: a alternativa em tabela e o `figcaption` não foram tocados, e o bundle não mudou (sem import novo).
- Regras invioláveis: nenhum cálculo tocado.
- Commits: três commits coerentes (código, doc e E2E), em Conventional Commits em português, com o cartão no corpo. Para o squash do PR: `fix(web): fila de montagem dos gráficos para o TBT da visão semanal (K-102)`.

## Integração com a develop
A branch está 7 commits atrás de `origin/develop` (`b73bad3`). `git merge-tree --write-tree HEAD origin/develop` não aponta conflito. Pela R-FLUXO, a develop entra uma vez antes do review. Isso não foi feito nesta delegação. O merge pode ficar para o envio, e como não há conflito o patch não diverge e este parecer continua valendo. Quem confirma é o `forge-check pr`.

## Próximo passo
QA do K-102 com o roteiro da volta 1, aplicando V2-1 e V2-2 nas specs se o QA concordar. Depois vem a revisão curta de UX.

---

# Revalidação sobre `36975e6` (ajustes V2-1 e V2-2 do QA)

**Escopo:** `aeacff4..36975e6`, dois commits. O `28ddea2` muda `e2e/tests/b12-fluxo.spec.ts` (+2 e -1 linhas) e `e2e/tests/b3-sust-ei-vg.spec.ts` (+1 linha). O `36975e6` só acrescenta o parecer do QA. `git diff --name-only aeacff4..36975e6 -- web server packages tools` sai vazio: **nenhum código de produção mudou**.
**Motivo:** o `forge-check pr k102-perf-semanal` acusava este review como desatualizado, porque `b12-fluxo.spec.ts` mudou depois do parecer.
**Veredito:** **aprovado**, sem ajuste novo.

| # | Recomendado | Aplicado em `28ddea2` | Atendido? |
|---|---|---|---|
| V2-1 | Afirmar o mínimo de `fills` no S4. | `expect(fills.length, ...).toBeGreaterThanOrEqual(1)`, antes do `<= 2`. | sim. O teste não passa mais com `fills` vazio. |
| V2-2 | Incluir `figure` no localizador da ausência do BLOQUEADOS, depois de confirmar que a tabela não usa `figure`. | Localizador `figure, svg[role="application"], svg[role="img"], canvas` com `toHaveCount(0)`, com comentário do motivo. | sim. Conferido: em `web/src/components/` só `GraficoBase.tsx` e `ParEspera.tsx` renderizam `figure`, e o cartão Bloqueados não importa nenhum dos dois. A `TabelaDados` não usa `figure`, então não há falso negativo. |

- A espera anterior por "algum gráfico da página" (`b12-fluxo.spec.ts:68`) ficou. Com o `figure` no localizador ela deixou de ser necessária, mas é inofensiva e não pede ajuste.
- Item 11 do checklist: as duas ausências foram relidas. O texto procurado ainda existe, e V2-1 trouxe o mínimo de itens.
- Ferramentas: não rodadas aqui (teto de 2 agentes, 2026-10-17). O QA rodou o E2E, e a evidência está no parecer dele.
- Integração: a `develop` (`f81567e`) ainda não entrou na branch. `git merge-tree --write-tree HEAD origin/develop` não aponta conflito. O merge fica para o envio (pedido 018).

# Revalidação sobre `dddcf0a` (merge da `develop` f81567e)

**Escopo:** `36975e6..dddcf0a`. O `06f93c0` só acrescenta o parecer de UX (`docs/ux/`). O `dddcf0a` é o merge de `origin/develop` (`f81567e`, pedidos 011 a 018), sem conflito.
**Motivo:** o `forge-check pr k102-perf-semanal` acusava review e QA desatualizados por causa do `06f93c0`, porque não isenta `docs/ux/`.
**Veredito:** **aprovado**, sem ajuste novo.

- O patch de produção do K-102 não mudou: `git diff origin/develop...HEAD -- web server packages tools` tem o mesmo hash antes e depois do merge (`dea8f10`), com os mesmos 5 arquivos de `web/src/components/charts/`.
- Nenhum arquivo do K-102 foi tocado pela `develop`. Os testes que a `develop` trouxe em `web/` (`visao-geral.test.tsx`, `espera-invisivel.test.tsx`, `lint.meta.test.ts`) não mudam nenhuma linha que leia `svg`, `figure` ou gráfico, então a fila de montagem não os afeta. Quem confirma é a CI do PR.
- Ferramentas: não rodadas aqui (teto de 2 agentes, 2026-10-17). O portão é a CI do PR.
- Pendente: revalidação do parecer do QA sobre `dddcf0a` (E1.3).

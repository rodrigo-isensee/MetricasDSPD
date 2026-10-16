---
tipo: review
contrato: 1
pedido: k102-perf-semanal
branch: fix/perf-visao-semanal
commit: 1599a77
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: K-102, fila de montagem dos gráficos (perf da visão semanal)

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

# 0021 - Cálculo do mock em Web Worker

Estado: proposta. Data: 2026-10-16.
Propósito: tirar da thread principal a geração da base mock, a montagem dos contextos e o cálculo das métricas, para que o C6 (ADR 0003) fique dentro do orçamento com folga. Público: react-frontend, tech-lead, qa-engineer, devops-engineer, node-backend. Revisão: no passo 2 do parecer `docs/architecture/notas/c6-011.md` (depois das medições 1a e 1b) e de novo na entrega da `fix/c6-mock-em-worker`.

- Origem: parecer `docs/architecture/notas/c6-011.md`, seção "Decisão com medições" (passo 1c); achado B11c-1 do review `docs/reviews/011-back.md`.
- Relacionadas: ADR 0003 (C2, C6, F5, F9 e o remédio "mover geração e cálculo para Web Worker atrás da `MockFonteMetricas`"), ADR 0001 (stack do front), ADR 0002 (monorepo), ADR 0011 (biblioteca única de cálculo).
- **Não altera a ADR 0003.** Ela já prevê o Worker como remédio. Nenhum limite muda.
- **Condição para passar a `vigente`:** a sonda 1b (C6 do projeto `perf-api`) dar mediana < 170 ms em `/` e em `/operacional?cadencia=diaria`. Ver "Dependências" no fim da Decisão.

## Contexto
O C6 (maior tarefa longa na thread principal durante o cálculo) tem orçamento de 200 ms e bloqueia a entrega via F3/F5. As medições de 2026-10-16 (mediana de 3 rodadas × 5 cargas, 2 execuções, load de 2 a 5, latência simulada 0):

| Rota | `develop` | Branch do 011 com (a1) (`6d64255`) |
|---|---|---|
| `/` | 312 / 214 ms | 242 / 253 ms |
| `/operacional?cadencia=diaria` | 232 / 197 ms | 253 / 207 ms |
| Máximo por carga, nos dois lados | 500 a 630 ms | 500 a 630 ms |

- **A `develop` sozinha já está fora ou no limite:** de 197 a 312 ms, sem o B11a do 011. O 011 só tirou a folga que restava.
- **Picos de 500 a 630 ms** não correspondem a nenhuma fase medida no Node. A maior fase é o núcleo BM do gerador, com 165 ms de CPU, sob load de 4 a 5. O candidato é a primeira métrica a frio, que paga os índices preguiçosos de `criarContextoBM`/`criarContextoAC`, somada à coleta de lixo da base recém-gerada. Nem ceder entre métricas (a1) nem fatiar o gerador (a2) atacam essa tarefa.
- **Hoje tudo roda na thread principal** (`web/src/data/mock/MockFonteMetricas.ts`). Em `carregar()`, `gerarBaseMock`, a normalização de `data_acordada`, `criarContextoBM` e `criarContextoAC` com a pesquisa formam três tarefas indivisíveis. Em `carregarExtensoes()`, `gerarExtensoesMock` é mais uma tarefa síncrona, que só aparece nas rotas com complementares, como `/operacional?cadencia=semanal`. Em `obter()`, cada `lib.calcularMetrica` roda sem ceder quando a latência é 0.
- **A CI mede com a latência simulada ligada.** Os jobs `perf` e `perf-homolog` fazem o build sem `VITE_*`, o que dá latência de 150 a 400 ms por chamada. Na CI a rajada de métricas se desfaz sozinha, mas a geração, os contextos, as extensões e cada métrica a frio continuam na thread principal.
- **No modo API** (`VITE_FONTE=api`, `HttpFonteMetricas`), o navegador não gera nem calcula. O C6 ali é só o custo do render, ou seja, o teto do que um Worker pode entregar no mock. O C6 vale também para o mock porque o portão de desempenho mede o mock e o modo demonstração é usado com o usuário (parecer, "O C6 vale para o modo mock?").

## Decisão
### 1. O que vai para o Worker
Um **Web Worker de módulo, um por instância de `MockFonteMetricas`**, criado sob demanda na primeira chamada (como o `carregar()` preguiçoso de hoje). Dentro dele ficam:
- a geração da base (`gerarBaseMock`) e a normalização de `data_acordada`;
- os contextos `criarContextoBM`, `criarContextoAC` e `criarContextoPesquisa` (com `gerarPesquisaMock`), e a verificação de datas de corte divergentes;
- `gerarExtensoesMock` (complementares) e `gerarColetasMock`;
- `lib.calcularMetrica` e a paginação do O2 (`paginarO2`);
- todo método da `FonteMetricas` que lê a base: `opcoesFiltro`, `criterios`, `dataReferencia`, `estadoColeta` e `historicoColetas`.

**A thread principal só renderiza.** Ela não importa `@metricas-dspd/mock` nem `@metricas-dspd/metricas` no modo Worker: o chunk F9 é baixado e avaliado só dentro do Worker.

**A interface não muda.** `MockFonteMetricas` continua implementando `FonteMetricas`, com a mesma assinatura pública, as mesmas opções (`semente`, `hoje`, `latenciaMs`) e o mesmo `tipo = 'mock'`. Nenhum painel, hook ou teste de tela muda por causa do transporte.

**Núcleo único.** Todo o trabalho acima fica num módulo puro, sem DOM e sem `postMessage` (nome a critério do `react-frontend`, por exemplo `nucleoMock.ts`). O arquivo de entrada do Worker é um invólucro fino, com `onmessage` → núcleo → `postMessage`. O fallback (seção 4) chama o **mesmo** núcleo em processo. Assim só existe um caminho de cálculo, e a paridade (seção 3) compara transporte, não lógica.

### 2. Fronteira de mensagens (structured clone)
RPC com id, em FIFO: o `postMessage` preserva a ordem.

| Direção | Mensagem | Conteúdo que atravessa |
|---|---|---|
| principal → Worker | `iniciar` (uma vez) | `{ semente?, hoje? }`: só número e string |
| principal → Worker | pedido | `{ id: number, metodo, args }`, em que `metodo` ∈ `obter`, `opcoesFiltro`, `criterios`, `dataReferencia`, `estadoColeta`, `historicoColetas`, `latencia`, e `args` são `MetricaId`, filtros, domínio e página, todos objetos JSON simples |
| Worker → principal | resposta | `{ id, ok: true, valor }`, em que `valor` é o DTO do contrato (`ResultadoDe<K>`, `OpcoesFiltro`, `VersaoCriterio[]`, `EstadoColeta`, `PaginaColetas`, string ISO ou número) |
| Worker → principal | erro | `{ id, ok: false, erro: { nome, mensagem } }`. A thread principal rejeita com `Error` de **mesma mensagem** (por exemplo `Datas de corte divergentes: …`) |

Regras da fronteira:
- **Nunca atravessa:** a base, os contextos, os índices, a biblioteca, funções ou instâncias de classe. Os contextos vivem e morrem no Worker.
- **Os DTOs atravessam como dados simples.** Eles já são o formato que a API serializa em JSON e valida pelos schemas de `@metricas-dspd/contratos`, então devem conter só objeto, array, string, número, booleano e `null`. Se algum resultado carregar `Date`, `Map`, `Set` ou instância de classe, isso é um achado do teste de paridade: `Date` e `Map` atravessam, mas divergem do que a API entrega, e uma instância de classe perde o protótipo sem erro visível.
- **Latência simulada (D7) continua na thread principal, com o sorteio determinístico de hoje.** A sequência de atrasos por semente tem de ser a mesma de hoje: o PRNG `derivar(semente, 'latencia')` fica no Worker e é lido pela mensagem `latencia`, na mesma ordem das chamadas a `obter`. A espera (`setTimeout`) roda na thread principal, antes do pedido de cálculo, como hoje. Com `latenciaMs` fixo, nenhuma mensagem `latencia` é trocada.
- **Erro sem tratamento no Worker** (`error`/`messageerror`) rejeita todos os pedidos pendentes com mensagem identificável, e a instância passa a rejeitar os próximos. Nunca cai em silêncio no fallback em processo.

### 3. Paridade (teste obrigatório, condição do review)
1. **Vitest, núcleo × direto:** para **todas** as `MetricaId` do contrato, com os filtros padrão de cada domínio e com o pior filtro conhecido (período máximo), nas sementes padrão e alternativa (`12345`): `structuredClone(nucleo.obter(id, f))` é `toStrictEqual` ao resultado de `lib.calcularMetrica` chamado diretamente sobre a mesma base, com o O2 paginado. O mesmo vale para `opcoesFiltro` (os dois domínios), `criterios`, `dataReferencia`, `estadoColeta` e `historicoColetas`.
2. **Vitest, forma do DTO:** um percurso recursivo sobre cada resultado do item 1 falha se encontrar valor fora de objeto simples (`Object.prototype` ou `null`), array, string, número finito, booleano ou `null`.
3. **Vitest, determinismo:** os hashes da base (`68a67741` na `develop`, ou o vigente na branch), do Acelerato (`0113e077`) e da extensão continuam iguais, e a sequência das 20 primeiras latências sorteadas por semente é a mesma de antes do Worker.
4. **E2E (Chromium real), transporte:** um teste confirma que, no build mock, o cálculo usa o Worker de fato (por exemplo, por uma marcação do transporte exposta para o teste) e que pelo menos `VISAO_GERAL`, `O2` e uma complementar do Acelerato chegam iguais aos valores do caminho em processo para a mesma semente.

O `react-frontend` define a forma exata. O `tech-lead` recusa o review sem os quatro itens verdes.

### 4. Fallback sem Worker
- **Detecção de capacidade:** se `typeof Worker === 'undefined'`, como no jsdom do Vitest, a `MockFonteMetricas` chama o núcleo em processo, com o mesmo `ceder()` de hoje entre as fases. O comportamento observável (resultados, erros, ordem das latências) é o mesmo.
- **Opção de construtor para forçar o transporte** (por exemplo `transporte?: 'worker' | 'processo'`), usada pela paridade E2E. Valor inválido falha na construção.
- `FonteFixa`, `FonteAjustada`, os espiões de `resumo.test.tsx`, `FonteModo`, `FonteSemCampo` e o `fonteDeTeste` de `web/src/test/helpers.tsx` continuam funcionando sem mudança: rodam no jsdom, logo pelo caminho em processo, e sobrescrevem `obter` chamando `super.obter`.
- **Worker que falha ao subir** (chunk não encontrado, CSP) não aciona o fallback. Vira erro visível, pela regra de "nunca cair em silêncio" já usada em `criarFontePadrao()`.

### 5. Efeito no C2 e no C6, e como medir
| Item | Efeito esperado | Como medir | Meta para o pronto |
|---|---|---|---|
| **C6** | A geração, os contextos, as extensões e as métricas a frio saem da thread principal. Sobram o render e o *structured clone* das respostas na chegada. O teto é o C6 do `perf-api` (sonda 1b). | `perf.spec.ts`, teste "F2 CLS e C6" (`PerformanceObserver('longtask')`, que só observa a thread principal), em `/` e em `/operacional?cadencia=diaria`, com `PERF_RODADAS_C6=3` e `PERF_REPETICOES_C6=5`, sob `flock`, com o load de 1 min registrado e, de preferência, abaixo de 2. Mais uma medição na `develop` sem o Worker, na mesma sessão. | **Mediana agregada < 170 ms nas duas rotas, em 2 execuções.** Também registrar o p85, as medianas por rodada e o máximo. Máximo ≥ 250 ms em qualquer carga é alerta e pede um perfil do navegador antes do PR. |
| **C2** | Nenhum efeito direto: o gerador não muda, e o C2 é medido no Vitest/Node, fora do navegador. O custo de geração dentro do Worker passa a pesar no tempo até o primeiro cartão, não no C6. | O teste do gerador em `packages/mock`, como hoje (< 1,5 s), e o C1 no Node (< 500 ms). Informativo: o Worker devolve, na resposta ao `iniciar`, a duração da geração e dos contextos medida com `performance.now()` dentro dele, e o QA registra o valor. | C2 < 1,5 s e C1 < 500 ms, sem mudança. O tempo de boot no Worker é registrado, não bloqueia. |
| **F5** | Cada troca de filtro ganha uma ida e volta de mensagem e um *structured clone* (DTO < 50 KB, A3). Custo esperado: alguns ms. O cálculo deixa de disputar a thread com o render. | `perf.spec.ts` (F4/F5), como hoje. | p95 igual ou melhor que a faixa atual da branch (507 a 533 ms). O F5 acima de 500 ms é anterior ao 011 e não é objeto desta ADR. |
| **F1/F10** | O LCP não deve piorar. O chunk do Worker é baixado na primeira chamada, como o `import()` de hoje. | Lighthouse local nas 8 rotas, inclusive `/operacional?cadencia=semanal`. Na CI, o Lighthouse do job `perf`. | F10 ≥ 90 nas rotas que já passam. A semanal depende de 1a (abaixo). |
| **F6/F9** | O inicial não muda. O mock e a biblioteca passam a ser dependências do chunk do Worker. | `pnpm --filter web size` (`web/scripts/size.mjs`): o chunk do Worker é classificado como mock (F9) e nunca como inicial (F6). | F6 < 200 KB sem aumento além do RPC (< 2 KB gzip). F9 dentro do limite. |

### 6. Impacto no E2E e no modo API
- **E2E mock** (`VITE_MOCK_LATENCIA=0` local, latência ligada na CI): no Chromium real, o Worker é usado. Os testes que dependem de ordem de chegada precisam esperar o estado final (`data-estado`), não o tempo: a resposta passa a chegar em outra tarefa. Projetos WebKit e celular/tablet suportam Worker de módulo, e não há fallback para eles. O build continua um só: nenhuma variável `VITE_*` nova é obrigatória.
- **CSP de produção** (`docs/security/revisao-de-seguranca.md`: `default-src 'self'`, sem `worker-src`): o Worker tem de sair como **arquivo próprio da mesma origem**, com `new Worker(new URL('./….worker.ts', import.meta.url), { type: 'module' })`. Worker inline ou por `blob:` (`?worker&inline`) fica proibido, porque a CSP o bloquearia. O `security-engineer` só precisa ser consultado se a implementação pedir mudança na CSP.
- **Modo API** (`VITE_FONTE=api`): `criarFontePadrao()` devolve `HttpFonteMetricas`, e nenhum Worker é criado. O QA confirma no `perf-api` que nenhum pedido de rede vai ao chunk do Worker. O `perf-api` continua sendo a medida do render puro e serve de comparação com o C6 do mock.
- **Servidor e biblioteca:** sem mudança. A biblioteca já é pura e síncrona e roda no Worker como roda no Node.

### 7. Escopo da entrega
- Uma `fix/c6-mock-em-worker` a partir da `develop`, sem o 011, criada pelo `tech-lead` depois do passo 2. O 011 faz rebase sobre ela e herda o Worker: o B11a passa a rodar dentro dele.
- O commit `6d64255` (a1) não é levado: com o Worker, ele não tem função.
- A API `gerarBaseMockEmFases()` (a2) fica em `ref/c6-gerador-em-fases`, sem PR. Volta só se for preciso informar progresso por fase de dentro do Worker.

### Dependências (passo 2 do parecer)
- **1b, sonda do teto (`qa-engineer`):** mediana do C6 no `perf-api` < 170 ms nas duas rotas → esta ADR passa a `vigente`. Se der ≥ 170 ms, o gargalo é o render: esta ADR fica `proposta`, o parecer é reaberto com a opção (c) (render fatiado ou adiado dos gráficos) e nenhum código do Worker é escrito. O perfil do navegador da mesma tarefa precisa confirmar que a tarefa de 500 a 630 ms é de cálculo ou de coleta de lixo da base, e não de render.
- **1a, causa do #90 (`devops-engineer`):** se a perda do Lighthouse em `/operacional?cadencia=semanal` vier de **TBT**, esta ADR também cobre o #90, porque `gerarExtensoesMock` vai ao Worker. Se vier de **LCP**, o #90 sai por uma `fix/lcp-operacional-semanal` separada, e esta ADR não promete resolvê-lo.
- **1d (`node-backend`):** o custo da primeira métrica a frio e o de `gerarExtensoesMock` completam a tabela de fases no Contexto. Não muda a decisão.

## Alternativas
- **(a1) Ceder antes de cada `calcularMetrica`** (`scheduler.yield`/`MessageChannel`). Foi implementada (`6d64255`) e medida. Com ela, `/` ficou em 242/253 ms e `/operacional` em 253/207 ms, sem diferença para a `develop` (312/214 e 232/197). Na CI não tem efeito, porque a latência ligada já separa as métricas. Também não toca na geração, nos contextos nem nos picos de 500 a 630 ms. **Rejeitada:** a evidência de execução mostra que não basta.
- **(a2) Gerador em fases** (`function*` drenado com cessões). No melhor caso, tira o B11a (42 ms) e separa o núcleo BM do Acelerato. A `develop`, que não tem B11a, já mede de 197 a 312 ms, então isso não leva o C6 abaixo de 170 ms. O núcleo BM (165 ms) continua indivisível, assim como `criarContextoBM`, que está na biblioteca e não se fatia sem mexer nela. Os índices a frio da primeira métrica ficam onde estão. **Rejeitada:** guardada em branch de referência.
- **(d) Exceção na ADR 0003.** O C6 vale para o modo mock (portão e demonstração). A `develop` já estava no limite, e a fase 2 do 011 vai engordar a base de novo, então uma exceção cobriria um problema que volta e sem prazo realista de remédio. **Rejeitada.**
- **(c) Render fatiado ou adiado dos gráficos.** Não substitui o Worker: ataca o render, não o cálculo. **Condicional:** passa a ser o caminho se a sonda 1b der ≥ 170 ms.
- **Biblioteca de RPC (por exemplo Comlink).** Economiza umas 50 linhas, mas é dependência nova (gatilho de segurança, R-SEGURANCA) e esconde a fronteira de clone que a paridade precisa enxergar. **Rejeitada:** o RPC com id cabe no próprio módulo.
- **SharedWorker ou Worker único compartilhado entre instâncias.** Pouparia memória com várias abas, mas o uso é de uma aba, e o compartilhamento complica o ciclo de vida e os testes. **Rejeitada.**
- **Pré-calcular tudo na geração.** Já foi descartada na ADR 0003: leva o custo para o C1 e deixa de exercitar o cálculo sob demanda.

## Consequências
- **Melhora:** o C6 do mock deixa de depender do tamanho da base. A fase 2 do 011 pode engordar a base sem reabrir o C6, mas continua medindo o C2 e o tempo até o primeiro cartão. Os picos de 500 a 630 ms saem da thread principal, e o F3/INP fica protegido durante a carga. Pelo item 1a, o #90 pode ser coberto.
- **Piora:** há um módulo a mais (núcleo, invólucro e RPC) e dois caminhos de transporte para manter iguais (Worker e processo). Depurar o cálculo no navegador passa a exigir o contexto do Worker no DevTools. Cada resposta paga um *structured clone*, e a memória da base passa a ficar no heap do Worker: o C5 tem de somar os dois heaps.
- **A manter:** os testes de paridade a cada mudança de DTO; a regra "nada de `blob:` ou inline" por causa da CSP; a classificação do chunk do Worker no `size.mjs`; e todo método novo da `FonteMetricas` que leia a base precisa entrar no núcleo, nunca na thread principal.
- **Riscos:**
  - **Render como gargalo** (bug 008: render síncrono dos gráficos). A sonda 1b decide antes do código.
  - **DTO com tipo que não é dado simples.** Os itens 2 e 4 da paridade pegam.
  - **Medição sob carga.** Todos os números do Contexto foram tomados com load de 2 a 5. O QA mede o pronto com load abaixo de 2 ou registra o fator de calibração.
  - **Ordem das latências.** Se o sorteio sair da ordem das chamadas, a demonstração continua funcionando, mas deixa de ser reproduzível por semente. O item 3 da paridade cobre isso.

## Por que o existente não basta
Para a mesma necessidade (manter a maior tarefa longa < 200 ms durante a carga), já existem o `ceder()` (`setTimeout 0`) entre as fases de `carregar()` e de `carregarExtensoes()` em `MockFonteMetricas.ts`, criado para o C6, e, como evolução dele, o (a1) (`6d64255`), que cede antes de cada métrica. Evidência de execução (mediana de 3 × 5 cargas, 2 execuções):
- com `ceder()` e (a1), as medianas ficaram em 242/253 ms (`/`) e 253/207 ms (`/operacional?cadencia=diaria`), contra 312/214 e 232/197 ms na `develop` sem (a1). Não houve ganho mensurável, e as duas rotas continuam ≥ 170 ms, a condição 2 de escalada do parecer;
- o máximo por carga ficou entre 500 e 630 ms com e sem (a1);
- no Node, a maior fase indivisível (núcleo BM) mediu 165 ms de CPU, acima dos 150 ms da condição 1 de escalada (leitura sob load de 4 a 5, na fronteira e sem calibração). O `ceder()` não consegue dividir uma chamada síncrona.

Ceder só reordena trabalho que continua na mesma thread. A tarefa de 500 a 630 ms e as fases indivisíveis só saem dela se mudarem de thread.

## Critério de reversão
**O C6 do build mock com o Worker, medido pelo QA conforme a seção 5, der mediana agregada ≥ 170 ms em `/` ou em `/operacional?cadencia=diaria` em 2 execuções com load abaixo de 2.** Nesse caso, o Worker é retirado (volta o caminho em processo, que continua no código como fallback) e o parecer é reaberto com a opção (c).

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-10-16 | Sem Worker. C6 na `develop`: `/` 312/214 ms e `/operacional?cadencia=diaria` 232/197 ms. Com (a1): 242/253 e 253/207 ms. Máximos de 500 a 630 ms. Load de 2 a 5. | pendente (1a e 1b) |
| — | 1b: C6 do `perf-api` (teto do Worker), `/` e `/operacional?cadencia=diaria` | pendente |
| — | Pronto da `fix/c6-mock-em-worker`: C6 do mock com o Worker, 2 execuções | pendente |

---
tipo: review
contrato: 1
pedido: 037-pr-131-release-com-falhas
branch: feature/037-c6-operacional
commit: 9ee640f
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-21
---
# Code review: cálculo do mock em Web Worker (ADR 0021, pedido 037, K-113)

Propósito: revisar a entrega `0bde5eb` antes do QA (`R-REVIEW`, etapa E2.4). Público: QA, react-frontend, software-architect, dono.

**Parecer: aprovado.** Não há achado bloqueante. Os quatro achados recomendados abaixo podem entrar numa volta curta do autor ou num cartão novo. Nenhum deles impede a medição do QA.

## Escopo conferido
O diff `12018de...0bde5eb` tem 13 arquivos. O código está em `web/src/data/mock/` (`nucleoMock.ts`, `nucleoMock.worker.ts`, `protocolo.ts`, `MockFonteMetricas.ts` e testes), `web/vite.config.ts`, `web/scripts/size.mjs` e `eslint.config.js`. A documentação está em `docs/tecnica/arquitetura-front.md`, e a proposta e o bug C6 vêm de commits anteriores (QA e arquiteto). Também li a ADR 0021, as seções 4 a 6 da proposta `docs/architecture/propostas/037-c6-operacional.md` e as regras de leitura das seções 1 a 4, 8 e 9 do `praticas.md`.

## Ferramentas (saída citada, não refeita por leitura)
- `pnpm --filter @metricas-dspd/web run pronto` (typecheck, cobertura, build e size) no HEAD `0bde5eb`: saída 0. `Test Files 77 passed (77)`, `Tests 1100 passed (1100)`, limites de cobertura atendidos.
- size: `F6 inicial (todos os chunks do index.html): 191.46 KB (< 200) ok` e `F9 mock + biblioteca: 117.35 KB (< 120; fora do inicial, alerta de tamanho) ok`. Os chunks `nucleoMock.worker-*.js` (71,93 KB gz) e `nucleoMock-*.js` (45,42 KB gz) estão classificados como `mock`, nenhum como `inicial`.
- `eslint` nos arquivos do diff: 0 erros. `prettier --check`: ok.
- Não refiz a regra `[lint]` de fronteira (`web/src/**` fora de `data/mock/**` sem `metricas`/`mock`). Ela está no `eslint` acima.

## Aderência à ADR 0021
- **Núcleo puro (seção 1).** `nucleoMock.ts` não usa DOM nem `postMessage`. Ele recebeu, sem mudança de lógica, `carregar`, a normalização de `data_acordada`, `criarContextoBM`/`AC`/`Pesquisa`, a verificação de datas de corte divergentes, extensões, `tambem`, coletas, `calcularMetrica` e `paginarO2`. Conferi lado a lado com `12018de:web/src/data/mock/MockFonteMetricas.ts`: o corpo é o mesmo, sem os `import()` dinâmicos. O fallback chama o mesmo `tratarPedido`, então só existe um caminho de cálculo.
- **Worker em módulo, sem `blob:` (seção 6).** `MockFonteMetricas.ts:47` usa `new Worker(new URL('./nucleoMock.worker.ts', import.meta.url), { type: 'module' })`, e `vite.config.ts` tem `worker: { format: 'es' }`. O build gera o arquivo próprio `dist/assets/nucleoMock.worker-*.js`. A CSP não muda (nenhum `worker-src`), então o `security-engineer` não precisa ser acionado.
- **Fallback (seção 4).** Quando `typeof Worker === 'undefined'`, o transporte é `processo` (`MockFonteMetricas.ts:96`). `transporte` aceita só `'worker' | 'processo'`, e valor inválido falha na construção. Falha do Worker não cai em silêncio no processo (teste "sem cair no processo").
- **RPC e erros (seção 2).** O id é sequencial e a ordem é FIFO. O erro volta com `nome` e `mensagem` e é relançado como `Error` de mesma mensagem. `error`/`messageerror` rejeitam os pendentes, e a instância passa a rejeitar os seguintes. Exceção: a falha no próprio `postMessage` do Worker (achado A1).
- **Latência (seção 2).** O sorteio fica no núcleo, lido pela mensagem `latencia` na ordem das chamadas. A espera fica na thread principal. Com `latenciaMs` fixo, nenhuma mensagem `latencia` é trocada (teste). A ordem também se mantém com chamadas concorrentes, porque todas aguardam a mesma promessa de boot antes de despachar.
- **A thread principal não importa `@metricas-dspd/mock` nem `@metricas-dspd/metricas`.** O `grep` fora de `nucleoMock*` e dos testes só encontra `import type { EstadoWorker }` e o `import('./nucleoMock')` dinâmico do fallback, que no modo Worker nunca é pedido. O lint em `eslint.config.js` passou a barrar também o import estático de `./nucleoMock` em `data/mock`. Só os `nucleoMock*.ts` importam a biblioteca e o gerador estaticamente.
- **Regra inviolável T2.5.** Não há cálculo novo: todo número sai de `lib.calcularMetrica` e das funções da biblioteca já usadas antes. BusinessMap e Acelerato continuam em contextos separados.

## Testes de paridade (ADR 0021, seção 3)
- **Item 1** (`nucleoMock.paridade.test.ts`). Cobre todas as `METRICA_IDS`, o filtro padrão e o período máximo (`custom` desde o início do histórico) e as sementes padrão e `12345`. `structuredClone(obtido)` é `toStrictEqual` à biblioteca chamada direto sobre a mesma base. O O2 sai paginado. `opcoesFiltro`, `criterios`, `dataReferencia`, `estadoColeta` e `historicoColetas` também estão cobertos.
- **Item 2.** `formaInvalida` percorre cada resultado e cada leitura.
- **Item 3.** Os hashes `68a67741` (base), `0113e077` (Acelerato) e `9159f65b` (extensão `tambem`, o mesmo de `packages/mock/src/extensaoTambem.test.ts`) estão cobertos, assim como as 20 primeiras latências por semente, no núcleo e na fonte com Worker falso.
- **Item 4** (E2E no Chromium real). Entregue pelo QA em `9ee640f` e revisado na seção "Revisão incremental" abaixo.
- `MockFonteMetricas.transporte.test.ts` testa o transporte com um Worker falso que passa pelo `tratarPedido` real com *structured clone* em outra tarefa. Também cobre o invólucro real (`nucleoMock.worker.ts`).

## Qualidade
Os nomes estão em português e as funções são curtas. Os tipos do protocolo vêm de uma fonte única (`protocolo.ts`), não há `any` e os casts estão na fronteira do RPC. A documentação técnica foi atualizada (`docs/tecnica/arquitetura-front.md`, diagrama de sequência). O commit tem uma mensagem só, em Conventional Commits, com `Cartão: K-113`.

## Achados
- A1 (recomendado) web/src/data/mock/nucleoMock.worker.ts:11 · `postMessage` que lança (DataCloneError) vira rejeição sem tratamento no Worker, sem `error` no objeto Worker: o pedido fica pendente para sempre (contra ADR 0021 §2). Sugestão: `try/catch` respondendo `{ id, ok: false, erro }`, com teste.
- A2 (recomendado) web/src/data/mock/nucleoMock.ts:299 · `estado.nucleo as NucleoMock` sem guarda: pedido antes do `iniciar` vira TypeError genérico. Sugestão: erro explícito "núcleo do mock não iniciado".
- A3 (recomendado) web/scripts/size.mjs:24 · O F9 soma o chunk do Worker (71,93 KB) e o do fallback (45,42 KB), mas só um é baixado: 117,35 de 120 KB, alerta falso na próxima engorda. Sugestão: medir pelo maior caminho, sem afrouxar o limite (com o arquiteto).
- A5 (recomendado) e2e/tests/mock-transporte-worker.spec.ts:62 · A paridade compara o texto do `main`: dado que varie por hora real (data relativa) a tornaria instável. Hoje não varia. Sugestão: manter a data de referência fixa do mock.
- A4 (recomendado) docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md:3 · ADR ainda `proposta`; a proposta 037 diz na §4 que o estado muda no commit da implementação e na §6 (ordem 6) que muda pelo arquiteto depois do pronto. O arquiteto resolve e registra as leituras.

## Revisão incremental: `d549417..9ee640f` (E2E de paridade, E2.3)
O delta tem dois arquivos: `e2e/tests/mock-transporte-worker.spec.ts` (71 linhas) e o parecer de QA do pedido. O código de produção não mudou desde `0bde5eb`, então o restante deste parecer continua valendo (já lido, não relido). Do parecer de QA li só as seções D1 e D2.
- **Cobertura da ADR 0021, seção 3, item 4.** O teste 1 prova Worker de módulo da mesma origem e recusa `blob:` e `data:` (`w.url()` começa por `baseURL/`). Os três testes de paridade abrem dois contextos, um com `window.Worker` anulado por `addInitScript` (fallback em processo), e comparam o texto do `main` e a contagem de cartões para VISAO_GERAL, O2 diária e uma rota do Acelerato (sustentação). Exigem `workers()>=1` no caminho com Worker e `0` no fallback.
- **Determinismo.** A latência está desligada (`?latencia=0`, aceita pelo `App.tsx`), a semente é a padrão e o fuso é fixado em `America/Sao_Paulo`. Não há `waitForTimeout`: as esperas são `expect`/`expect.poll` sobre estado (cartões sem `aria-busy`, ausência de `estado-carregando-*`). O texto é normalizado sem espaços para não depender da quebra de linha dos gráficos. A guarda de 200 caracteres e de pelo menos 2 cartões impede comparar dois painéis vazios. Contextos fechados em `finally`.
- **Aderência ao projeto.** Usa a fixture `base` e `ROTAS` (as três rotas existem em `e2e/fixtures/constantes.ts`). Nada de `skip`. O comentário de cabeçalho explica a obrigação.
- **D1 e D2 do QA.** Já existem na `develop` (K-131 e K-132, decisão do dono: acompanham o PR como pendência listada). Não são regressão deste diff.
- Não rodei o E2E: a execução e a medição são do QA, citadas no parecer dele.

## Pendências fora deste review
- QA (E2.3, já em `9ee640f`; o QA atualiza o commit do parecer dele): C5 somando o heap do Worker, medição do pronto (mediana < 150 ms nas 7 rotas, 2 execuções), F6 sem aumento além de 2 KB gzip contra a `develop` e F5/F3/F1 sem regressão.
- Critério de reversão: o da ADR 0021 (C6 com o Worker ≥ 170 ms) e o da proposta 037 (< 150 ms de margem). O caminho em processo continua no código como fallback, então a reversão é trocar o transporte padrão.

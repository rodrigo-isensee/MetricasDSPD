---
tipo: review
contrato: 1
pedido: 037-pr-131-release-com-falhas
branch: feature/037-c6-operacional
commit: 0bde5eb4200993311881d1d6207d2ea6f80fb70e
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
- **Item 4** (E2E no Chromium real). É do QA em E2.3, em paralelo (proposta, seção 6, ordem 2), e não faz parte deste diff. A marcação `transporte` exposta na fonte serve a ele. Fica como pendência do parecer de QA: sem o item 4 verde, o PR para a `develop` não abre.
- `MockFonteMetricas.transporte.test.ts` testa o transporte com um Worker falso que passa pelo `tratarPedido` real com *structured clone* em outra tarefa. Também cobre o invólucro real (`nucleoMock.worker.ts`).

## Qualidade
Os nomes estão em português e as funções são curtas. Os tipos do protocolo vêm de uma fonte única (`protocolo.ts`), não há `any` e os casts estão na fronteira do RPC. A documentação técnica foi atualizada (`docs/tecnica/arquitetura-front.md`, diagrama de sequência). O commit tem uma mensagem só, em Conventional Commits, com `Cartão: K-113`.

## Achados
- A1 (recomendado) web/src/data/mock/nucleoMock.worker.ts:11 · Se o `postMessage` do Worker lançar (por exemplo `DataCloneError` com um DTO que não é clonável), a rejeição fica sem tratamento dentro do Worker. Ela não dispara `error` no objeto `Worker`, e o pedido pendente fica esperando para sempre: o painel trava em "carregando" sem erro visível, o que contraria a regra "nunca cair em silêncio" da ADR 0021, seção 2. O item 2 da paridade reduz o risco hoje. Sugestão: envolver o `postMessage` em `try/catch` e responder `{ id, ok: false, erro }`, com um teste.
- A2 (recomendado) web/src/data/mock/nucleoMock.ts:299 · `estado.nucleo as NucleoMock` não tem guarda. Um pedido que chegue antes do `iniciar` vira `TypeError` genérico. Sugestão: lançar um erro explícito ("núcleo do mock não iniciado").
- A3 (recomendado) web/scripts/size.mjs:24 · O F9 soma o chunk do Worker (71,93 KB) e o do fallback em processo (45,42 KB), mas o navegador baixa só um dos dois. O total dá 117,35 de 120 KB, e a próxima engorda da base dispara o alerta sem que o download tenha crescido. Sugestão: medir o F9 pelo maior dos dois caminhos ou listar o fallback à parte, sem afrouxar o limite. Combinar com o arquiteto (ADR 0003).
- A4 (recomendado) docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md:3 · A ADR continua como `proposta`. A proposta 037 diz, na seção 4, que o estado muda no commit da implementação, e na seção 6 (ordem 6) atribui a mudança ao arquiteto depois do pronto. Sugestão: o `software-architect` resolve a divergência e registra a leitura S0 e a do pronto (não é código e não bloqueia).

## Pendências fora deste review
- QA (E2.3): item 4 da paridade, C5 somando o heap do Worker, medição do pronto (mediana < 150 ms nas 7 rotas, 2 execuções), F6 sem aumento além de 2 KB gzip contra a `develop` e F5/F3/F1 sem regressão.
- Critério de reversão: o da ADR 0021 (C6 com o Worker ≥ 170 ms) e o da proposta 037 (< 150 ms de margem). O caminho em processo continua no código como fallback, então a reversão é trocar o transporte padrão.

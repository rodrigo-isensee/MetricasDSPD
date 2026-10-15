---
tipo: review
contrato: 1
pedido: sustentacao-no-operacional
branch: feature/sustentacao-no-operacional
commit: f8b09f1358c231571a0794bec9065c9432c1699f
parecer: aprovado
revisor: tech-lead
data: 2026-10-15
---

# Code review: Sustentação dentro do Operacional (K-072 + K-073; back B1 a B3, front F1 a F8)

## Volta 7: V6-1 a V6-4 (delta 54c4ebf..f8b09f1)

**Veredito: aprovado.** O bloqueio V6-1 foi resolvido, com teste que reprova o código anterior, e os itens V6-2, V6-3 e V6-4 também. O `pronto` da raiz está verde. Falta ao QA rodar o que o `pronto` não cobre (roteiro abaixo).

Escopo: 19c5cf9 (V6-1, V6-2 e V6-3), fea4a27 (V6-4) e f8b09f1 (seção 8 da revisão de UX, só documentação). São 6 arquivos de código ou documentação técnica, com 106 linhas a mais e 19 a menos, mais o commit da UX.

**Ferramentas (citadas):** rodei `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto; echo EXIT=$?` na raiz da worktree, em f8b09f1, e o resultado foi **EXIT=0**. Prettier e ESLint passaram, e a cobertura ficou em 100%. Web: 73 arquivos e 1.041 testes (+1 do V6-4). Server: 496 testes passaram (+1 do banco lento) e 83 foram pulados (15 arquivos `.pg`, do job `banco` da CI). metricas: 653; contratos: 47; mock: 161; homolog: 73; pesquisa: 33; spec-check: 14; docs-contratos: 102. O `docs:check` deu ok (424 páginas, 53 métricas). Bundle: F6 com 191,10 KB (< 200), F8 com 111,62, F11 com 132,64 e F9 com 9,84. O pronto não roda E2E, Lighthouse nem `perf-api`.

| # | Situação |
|---|---|
| V6-1 `app.ts` (bloqueava) | **Resolvido.** `Promise.race` entre o aquecimento e um timer de 5 s (`PRAZO_ESPERA_AQUECIMENTO_MS`, injetável por `prazoAquecimentoMs`), bem abaixo do `pluginTimeout` de 10 s. Se o prazo vence, a API sobe, registra "aquecimento não terminou no prazo" e o aquecimento termina em segundo plano. O `.then` do aquecimento tem os dois ramos (sucesso e erro), então não há rejeição solta, e o timer é limpo quando o aquecimento termina primeiro. Fica um detalhe sem custo: `let timer = undefined as never`, que existe só para a atribuição dentro do executor; aceito. |
| Teste do V6-1 | **Bom.** O banco lento atrasa cada consulta em 12 s (acima do `pluginTimeout`) com temporizador falso. O teste afirma que `ready()` resolve em 5,1 s, que o aviso do prazo sai, que "aquecimento concluído" ainda não saiu, e que ele sai depois, em segundo plano. Com o código anterior, o `ready()` esperaria os 12 s e falharia. Os temporizadores falsos cobrem só `setTimeout` e `clearTimeout`, e são restaurados no `finally`, então o teste é determinístico e não vaza. |
| V6-2 `servico.ts` | **Resolvido.** `falhas` agora é `{ id, erro }`, com `erro` = nome da classe, sem mensagem. O log de falha do aquecimento também registra só a classe (`classeDoErro`), no mesmo critério do outbox. O teste prova que "banco fora" não aparece no log. |
| V6-3 testes | **Resolvido.** Os dois testes capturam o log com `destinoLog` e afirmam o aviso e a lista de falhas (`id` string e `erro` casando `^[A-Za-z]+$`). |
| V6-4 `OperacionalPage.tsx` | **Resolvido.** `aoEscolher` chama `escolher(v)` e, quando `v === visao` (a visão já comitada), limpa `viaSeletorRef` e `focoPendenteRef` e retorna. Cobre A, B, A no mesmo quadro. Quando `visao` já é B, `v` é A e o caminho normal vale. O teste novo em `visoes.test.tsx` cobre a borda. |
| `server.md` | **Atualizado** com o prazo (V6-1), o teste e a regra de log só com a classe do erro. |

Checklist (leitura): **escopo**: só os quatro itens, sem extra. **Regras invioláveis**: nenhuma afetada (o aquecimento só chama `calcular`). **Segurança**: o log não carrega mensagem de erro do banco, que era a preocupação do V6-2. **Performance**: a subida espera no máximo 5 s, e o 1,2 s medido continua válido; o custo de memória não muda. **Commits**: Conventional Commits em português, um por assunto.

**Aceito como está (continua valendo da volta 6):** a recarga depois de uma coleta (V6-5) segue sem cartão no quadro. Cabe ao Jarvis abrir o cartão, com o `perf-api` depois de uma coleta como critério de entrada. Não bloqueia.

**Revisão da UX (seção 8 de `06-revisao-implementada.md`, f8b09f1):** aprovou o efeito do SNO-001 a 375 px, o que fecha a pendência de olhar da UX que a volta 6 pediu para as telas fora do pedido.

### O que o QA precisa rodar (nunca rodou no código atual)

Antes do Playwright, na worktree: `eval "$(bash e2e/scripts/setup-chromium-local.sh)"` (no WSL do autor o Chromium não abria). Usar `flock /tmp/metricas-pesado.lock nice -n 19` em tudo.
- **CT-03 e D-03 com o V6-4:** `CT-03` de `sustentacao-no-operacional-qa.spec.ts` com `--repeat-each=5` e o `D-03` (troca por link vai ao h1). Nenhum dos dois rodou depois do fea4a27.
- **SNO-005, `perf-api`:** o `perf-api` completo contra o Postgres com 24 meses de seed: A1 frio na rota `/` e a "A1 isolada fria". Medir o tempo de subida (o log "aquecimento concluído" traz `ms`) e o RSS da API. Nunca rodou.
- **Subida com o banco parado:** a API tem que subir em no máximo cerca de 5 s e avisar (aviso de falha ou de prazo). Nunca rodou.
- **SNO-001:** `cabecalho-fonte-200.spec.ts` e a sonda a 375 px com fonte a 200%, mais a varredura de layout e o axe a 375 e 320 px nas telas que mudaram fora do pedido (Tático T3, Espera invisível, Sustentação S3 e Motivos, faixa de calibração), se ainda não rodaram no código atual.
- **Regressão:** E2E completo, Lighthouse do Resumo (CLS) e o `test:pg` da develop (K-085: o aquecimento lê com o papel `dspd_api`).
- **Parecer do QA:** regravar `docs/qa/sustentacao-no-operacional.md` com o Write, no HEAD novo, e tirar o `aceite_usuario`, que perdeu o objeto.

## Volta 6: SNO-001, SNO-005, CT-03 (delta 5adf980..54c4ebf)

**Veredito: ajustes necessários** (`parecer: reprovado`). A correção do SNO-001 e a do CT-03 estão corretas. A do SNO-005 tem um bloqueio: o aquecimento promete que "falha não impede a subida", mas um aquecimento lento derruba a API. Esse modo de falha é pior do que o bug que a correção resolve (baixa, primeira consulta lenta).

Escopo: 26ad55b (SNO-001), 0d185d6 (CT-03), 59dedb5 (SNO-005) e o merge de `origin/develop` 54c4ebf (K-084, K-085, #73 a #76, #83, #84). O código de produção mudou em 15 arquivos: 4 do server e 11 do web. Por decisão do usuário (C), o SNO-001 e o SNO-005 são corrigidos nesta entrega. O `aceite_usuario` do parecer do QA perde o objeto.

**Merge de `origin/develop`.** Deu um único conflito, em `docs/architecture/adr/0003-orcamento-de-performance.md`. A branch acrescentou a subseção "Medição das tendências do Resumo" e a develop (#74) acrescentou os riscos do orçamento móvel e as seções "Por que o existente não basta", "Critério de reversão" e "Leituras". Resolvi mantendo os dois lados: os itens "Móvel (010)" ficam no fim da lista de riscos, a subseção de medição vem logo depois e as seções novas da develop fecham o documento. Merge sem force; `server.md` e `intensivo-filtros.spec.ts` se mesclaram sozinhos.

**Ferramentas (citadas):** rodei `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto; echo EXIT=$?` na raiz da worktree, em 54c4ebf (já com a develop), e o resultado foi **EXIT=0**. Prettier e ESLint passaram, e a cobertura ficou em 100%. Web: 73 arquivos e 1.040 testes. Server: 495 testes passaram e 83 foram pulados (15 arquivos `.pg`, que ficam com o job `banco` da CI). metricas: 653; contratos: 47; mock: 161; homolog: 73; pesquisa: 33; spec-check: 14; docs-contratos: 102. O `docs:check` deu ok (424 páginas, 53 métricas). Bundle: F6 com 191,10 KB (< 200), F8 com 111,62, F11 com 132,63 e F9 com 9,84. O pronto não roda E2E, Lighthouse nem `perf-api`.

### SNO-005: aquecimento na subida

O desenho está certo. `aquecer()` carrega as duas bases e calcula as métricas com a mesma chave de cache da rota (`filtrosPadraoDe` sai do próprio `queryDe(id).parse({})`, então não há um segundo jeito de montar os filtros). O hook `onReady` roda antes de `listen`. Os testes contam consultas ao banco, e não tempo, então são determinísticos e reprovam o código antigo. Nenhuma regra inviolável é tocada: o aquecimento só chama `calcular`, que passa pela biblioteca, e não mistura as fontes.

- **Falha rápida (banco recusa conexão, erro numa métrica):** é tolerada. O `Promise.all` das duas cargas rejeita antes do laço, o `catch` do hook registra o aviso e a API sobe. Com o banco inalcançável, o pior caso é o `connectionTimeoutMillis` de 5 s do pool (`TIMEOUTS_PADRAO.conexaoMs`), e as duas cargas correm em paralelo.
- **Falha lenta: não é tolerada (bloqueio V6-1).** No Fastify 5.12.5, o hook `onReady` fica sujeito ao `pluginTimeout`, que por padrão é de 10.000 ms e que o `buildApp` não muda. Conferi com um script descartável: um `onReady` de 2 s com `pluginTimeout: 1000` faz o `ready()` rejeitar com `FST_ERR_HOOK_TIMEOUT` em 1.013 ms. Esse erro nasce fora do `try/catch` do hook. Então, se o aquecimento passar de 10 s, `listen` falha e a API não sobe. Isso acontece com um banco lento, com um `statement_timeout` de 10 s numa consulta da carga, com uma base real maior que o seed de 24 meses ou com a máquina carregada (o 1,2 s foi medido com carga de 3 a 5). Em homolog, o serviço `api` tem `restart: "no"` e ficaria fora do ar. Em produção, o efeito é o mesmo a cada reinício.
- **Tempo de boot contra a ADR 0003:** a ADR não tem orçamento de subida, então o 1,2 s não reprova nada. O healthcheck de homolog tolera a demora (`start_period` de 5 s, 20 tentativas a cada 5 s). Memória: o aquecimento guarda o que as primeiras consultas guardariam de qualquer forma (as duas bases e cerca de 52 resultados, muito abaixo de `MAX_RESULTADOS` = 500). Com os 384 MB do `mem_limit` de homolog, o pico só chega mais cedo. Ainda assim, vale medir o RSS depois da subida contra a base real.
- **Recarga depois de uma coleta (próximo passo, aceito como está):** a troca da marca d'água, relida a cada 60 s, ainda é paga por uma consulta: a primeira depois da coleta leva de 160 a 560 ms, e o A1 é < 300 ms. Isso acontece uma vez por coleta e por fonte, e não por usuário. Não bloqueia, porque está documentado em `server.md` como limite conhecido. Ele precisa de um cartão no quadro (não achei um), com a medição do `perf-api` depois de uma coleta como critério de entrada. A correção natural é recarregar em segundo plano, mantendo a base anterior até a nova ficar pronta. O V6-1 vale para ela também: nada que bloqueie.

### SNO-001: piso de largura

- **Causa raiz certa.** `min-width: 20rem` virava 640 px com a fonte a 200%. O piso passou a `min(20rem, 320px)`. Com a fonte padrão (16 px) o valor é o mesmo de antes, e o zoom do navegador não muda nada, porque o px CSS escala junto. O único efeito novo é com uma fonte raiz menor que 16 px: o piso desce, por exemplo, para 240 px com 12 px. Isso não prejudica a WCAG 1.4.10, que pede refluxo a 320 px e não proíbe menos. Aceito. Um `320px` puro seria mais simples de ler, mas fica como opção do autor.
- **Efeito global.** O `SeletorCadencia` vira uma grade 2x2 abaixo de 400 px. O componente só é usado pelo `SeletorVisao`, então não há efeito em outra tela. As trocas de `flex-wrap`, `min-w-0` e `max-w-full` em `CartaoT3`, `CartaoS3`, `CartaoMotivos`, `CartaoEI`, `FaixaAtencao` e `Calibracao` só permitem quebra de linha e não escondem conteúdo. Mesmo assim, mudam a aparência a 375 px de telas fora do pedido (Tático, Espera invisível, Sustentação), e isso pede o olhar da UX.
- **Teste.** `cabecalho-fonte-200.spec.ts` mede o documento e o cabeçalho nas 4 rotas do bug e confirma que Menu, tema e selo continuam visíveis. É um teste E2E e fica fora do pronto.

### CT-03: foco por visão

- **Lógica certa.** Guardar a visão pedida, e não um booleano, resolve a corrida. Com setas em sequência, as visões intermediárias que o React comita não puxam o foco (`focoPendenteRef.current !== visao`). Também não caem no h1, porque `viaSeletorRef` vale até a última visão escolhida chegar. Ficou simples e o comentário explica o porquê.
- **Teste.** O commit não traz teste novo. A guarda é o E2E `CT-03` de `sustentacao-no-operacional-qa.spec.ts`, que era o que falhava. A corrida depende do tempo de commit do React, e o E2E é o nível certo para ela. Aceito.
- **Borda (baixo, não bloqueia):** se duas escolhas no mesmo tique voltarem à visão de partida (A, B, A antes do commit), `visao` não muda, o efeito não roda e as duas refs ficam presas em A. Consequência: a próxima troca por link não leva o foco ao h1 (D-03), e uma volta para A por link devolve o foco ao rádio. A situação é rara, depende de duas teclas em menos de um quadro, e o dano é só de foco.

### Achados da volta 6

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| V6-1 · node-backend | `server/src/app.ts:69-78` | O `onReady` fica sujeito ao `pluginTimeout` (10 s). Um aquecimento lento faz o `ready()`/`listen` falhar com `FST_ERR_HOOK_TIMEOUT` fora do `try/catch`, e a API não sobe. O texto em `server.md` ("falha não impede a subida") não vale para lentidão. | Limitar a espera do hook a um prazo bem abaixo do `pluginTimeout` (por exemplo 5 s, numa constante com comentário). Se o prazo vencer, registrar o aviso, deixar o aquecimento terminar em segundo plano (com `.catch` que registra) e liberar a subida. Teste: um dublê que atrasa a carga, com prazo injetável ou temporizador falso, e `ready()` resolvendo. Atualizar `server.md`. | bloqueia |
| V6-2 · node-backend | `server/src/modulos/metricas/servico.ts:189` | O `catch` do laço guarda só o id. A causa da falha se perde, e o log de `app.ts:73` não diz por que a métrica falhou (`praticas.md:37`, log com contexto). | Guardar `{ id, erro: nome da classe }` (sem mensagem, como no outbox) e registrar no log do aquecimento. | recomendado |
| V6-3 · node-backend | `server/tests/metricas.aquecimento.test.ts:238-251` | Os títulos prometem "registra o aviso" e "é listada", mas nenhuma das duas coisas é verificada: os testes só afirmam que a API sobe. | Capturar o log com `destinoLog` e afirmar o aviso e a lista de falhas (aproveitar o V6-2). | recomendado |
| V6-4 · react-frontend | `web/src/features/operacional/OperacionalPage.tsx:125-145` | Borda das refs presas (A, B, A no mesmo tique), descrita acima. | Se o custo for baixo, limpar as duas refs quando `escolher(v)` for chamado com a visão já resolvida; se não, registrar no K-075. | baixo |
| V6-5 · tech-lead/Jarvis | KANBAN | A recarga depois de uma coleta não tem cartão. | Abrir o cartão com o critério de entrada (o `perf-api` depois de uma coleta). | recomendado |

Checklist (leitura): **escopo**: só os três defeitos, sem extra (o redesenho do cabeçalho segue no K-075). **Regras invioláveis**: nenhuma afetada. **Segurança**: o log do aquecimento traz `String(e)`. Um erro do `pg` não traz a senha, mas para ficar igual ao outbox o certo é registrar só a classe (V6-2). Não abro cartão para o `security-engineer`. **Performance**: o SNO-005 resolve o A1 frio na subida; a recarga depois de uma coleta fica como próximo passo (V6-5). **Commits**: Conventional Commits com `Cartão:`, um por defeito, e mensagens com acento.

**Para aprovar:** o V6-1, com teste. O V6-2 e o V6-3 podem entrar no mesmo commit. A volta 7 olha só esse delta.

**O que o QA precisa revalidar (depois do V6-1):**
- **SNO-005:** o `perf-api` completo contra o Postgres com 24 meses de seed, numa estação onde o Chromium abra (no WSL do autor ele não abre, então nunca rodou): A1 frio na rota `/` e a "A1 isolada fria". Medir também o tempo de subida (o log "aquecimento concluído" traz `ms`) e o RSS da API. Rodar uma vez com o banco parado: a API tem que subir e avisar.
- **SNO-001:** o `cabecalho-fonte-200.spec.ts` e a sonda do bug a 375 px com fonte a 200%. Repetir a varredura de layout a 375 e 320 px nas telas que mudaram fora do pedido (Tático T3, Espera invisível, Sustentação S3 e Motivos, faixa de calibração) e o axe nelas.
- **CT-03:** o E2E `CT-03` repetido (`--repeat-each=5`) e o D-03 (troca por link vai ao h1), para provar que a correção da corrida não quebrou o foco no título.
- **Regressão:** o E2E completo e o Lighthouse do Resumo (o merge da develop entrou e o CSS global mudou), e o `test:pg` da develop (K-085: o aquecimento lê a base com o papel `dspd_api`, que agora tem GRANT por coluna).
- **Frontmatter:** regravar o parecer com o Write no novo HEAD e tirar o `aceite_usuario`, que perdeu o objeto.

## Volta 5 (delta 9ab5ece..5adf980)

**Veredito: aprovado.** O item 1 da volta 4, que bloqueava, foi resolvido, e os itens 2 a 5, que eram recomendações, também. O código novo é pequeno e todo ele tem teste.

Escopo: 140a60d (documentação técnica e ressalvas 2 a 5), bc31f7a (parecer do QA do delta, fora do escopo do código) e 5adf980 (limite do `perf-resumo-reservas` a 1280 px). São 9 arquivos, com 111 linhas a mais e 14 a menos. O código de produção está em 2 arquivos: `OperacionalPage.tsx` e `resumo/modelo.ts`.

**Ferramentas (citadas):** rodei `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto; echo EXIT=$?` na raiz da worktree, em 5adf980, e o resultado foi **EXIT=0**. O Prettier e o ESLint passaram. A cobertura ficou em 100%. No web, 73 arquivos e 1.040 testes passaram. No server, 425 testes passaram e 64 foram pulados (12 arquivos `.pg`, que ficam com o job `banco` da CI). O `docs:check` deu ok (400 páginas, 53 métricas). O bundle ficou dentro do orçamento: F6 com 191,05 KB (< 200), F8 com 111,62, F11 com 132,64 e F9 com 9,84. O pronto não roda E2E nem Lighthouse, e essas medições ficaram com o QA (673 E2E verdes, Lighthouse com CLS de 0,0039 três vezes, medidos em 140a60d).

| # (volta 4) | Situação |
|---|---|
| 1 `arquitetura-front.md:181` | **Resolvido** (140a60d). A linha não cita mais o `aria-pressed` e registra o D-05a. O novo item "Delta pós-QA e UX (K-073)" cobre `nivel`, as reservas medidas (com valores e larguras), o anúncio e o foco, e o `versao-nova`/`ErroVersaoMaisNova`. |
| 2 h1 nulo | **Resolvido.** O código passou a usar `querySelector<HTMLElement>('h1')` com retorno antecipado, e o novo teste em `visoes.test.tsx` cobre o ramo sem h1. |
| 3 reservas sem amarra | **Resolvido pela documentação e pelo guarda.** A origem das medidas está na doc técnica, e não em cada constante; aceito, porque a doc lista todos os números juntos. O caso `perf-resumo-reservas` mede o CLS a 1280 e a 375. Com 5adf980, o limite a 1280 px passou a 0,05: o QA mediu 0,092 no código antigo e 0,004 no atual. Assim o caso deixou de ser só um piso e passou a detectar a regressão. |
| 4 "90%" à mão | **Resolvido.** O texto agora vem de `META_SLA_TEXTO`, derivado de `META_RAZAO_MIN`, no rótulo, na meta e na frase da série. |
| 5 "0 de 0" | **Resolvido.** Com `n` nulo ou 0, a frase passa a ser "nenhuma prioridade avaliada", e o teste foi atualizado. A validação desse texto pela UX é feita na revisão de interface. |

Observações (não bloqueiam):
- `visoes.test.tsx:90` faz o `querySelector` de `Document.prototype` devolver `null` para **todo** seletor durante o clique. O teste passa porque o Testing Library usa `querySelectorAll`. Se o teste ficar frágil, a troca é restringir o mock ao seletor `'h1'` (`mockImplementation`).
- O caso apertado em 5adf980 não foi rodado no commit final. Como o código de produção é o mesmo que o QA mediu em 140a60d (0,004 contra o limite de 0,05), o risco é baixo, e a próxima rodada do `test:perf` confirma.

**Pendências fora do código (para o PR):**
- **Parecer do QA.** O `forge-check pr sustentacao-no-operacional --base origin/develop` acusa duas coisas: (a) não há registro de que o papel `qa` gravou a versão atual de `docs/qa/sustentacao-no-operacional.md`, porque ela foi editada pelo Bash (K-077); (b) o `commit: 140a60d` do parecer ficou desatualizado, porque `e2e/perf/perf.spec.ts` mudou em 5adf980. O QA precisa regravar o parecer com o Write, já com o commit 5adf980. Isso não se corrige aqui.
- **Aceite do usuário.** O `aceite_usuario: sim` do parecer do QA foi gravado pelo QA, e não pelo usuário. A branch só vai para o PR depois de o usuário aceitar abertos o SNO-001 (média, K-075) e o SNO-005 (baixa).

## Volta 4 (delta pós-QA, 67624ba..9ab5ece)

**Veredito: ajustes necessários** (`parecer: reprovado` no frontmatter, por um item de documentação). O código do delta está correto, e os testes cobrem cada correção. O bloqueio é o mesmo critério das voltas anteriores: a documentação técnica tem que acompanhar a entrega (práticas, seção 7, item 7, e seção 8, item 10).

Escopo: 80d2fbf, 18d8327 e 032c470 (testes e parecer do QA), 8423b19 (SNO-002, SNO-004 e A6) e 9ab5ece (D-01 a D-03, D-05, D-06 e D-08). São 46 arquivos, com 1.546 linhas a mais e 115 a menos; o código de produção está em 22 arquivos de `web/src`. Contexto: o parecer do QA (`sustentacao-no-operacional.md` na pasta do QA, aprovado com ressalvas, testado em 67624ba) e a reconferência da UX (`06-revisao-implementada.md`, seção 7, aprovada; D-04 e SNO-001 vão para o K-075).

**Ferramentas (citadas):** `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` em 9ab5ece, **exit 0**. Cobertura de 100% em todos os pacotes: no web, 73 arquivos e 1.039 testes; F6 com 191,06 KB (< 200). No server, 12 arquivos `.pg` foram pulados por falta de banco na estação, e quem os roda é o job `banco` da CI. O pronto não roda E2E nem Lighthouse, e por isso o novo `sustentacao-no-operacional-qa.spec.ts`, os 12 specs adaptados (SNO-003) e o CLS de 0,004 do SNO-004 ficam para o QA do delta.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| 1 | `docs/tecnica/arquitetura-front.md:181` | Ainda diz "Ver como tabela" (`aria-pressed`), que o D-05a removeu. A doc técnica também não registra o que o delta acrescentou: a prop `nivel` da `FaixaAtencao` (h3 dentro do bloco, D-01), a reserva de altura por largura (`BlocoResumo.reserva` mobile/desktop, `EsqueletoTendencia.series`, `FrescorFonte.reservarFalha`, SNO-004), o anúncio e o foco da visão resolvida (D-02, D-03) e o estado `versao-nova` das preferências (`ErroVersaoMaisNova`, A6). | Um commit `docs(tecnica)` do react-frontend que corrija a linha 181 e acrescente essas quatro linhas na seção do Resumo e das preferências. | bloqueia |
| 2 | `web/src/features/operacional/OperacionalPage.tsx:140` | `document.querySelector('h1') as HTMLElement` é um cast sobre um valor que pode ser `null`. O comentário garante que o h1 existe, mas uma visão `lazy` que ainda não montou faria a página quebrar com `TypeError` dentro do efeito, em vez de só não mover o foco. | `const h1 = document.querySelector<HTMLElement>('h1'); if (!h1) return` (o ramo novo pede um teste para manter a cobertura de 100%), ou um `ref` passado ao molde da página. | recomendado |
| 3 | `web/src/features/operacional/resumo/BlocoFluxo.tsx:95,138`, `FrescorFonte.tsx:29`, `NumeroChave.tsx:62` (o `TendenciaFluxo.tsx:18-29` já traz a origem no comentário) | As reservas são números medidos (448/192, 1890/950, 50 px, 98 px) e não estão amarrados a nada. Qualquer mudança de texto ou de espaçamento no Resumo faz o CLS voltar sem que nenhum teste unitário perceba. | Um comentário em cada constante com a origem da medida (largura, fonte e data), e um caso de CLS do Resumo no `e2e/perf` com o limite F2 (o Lighthouse foi quem pegou o SNO-004; o F2 do Playwright passava). | recomendado |
| 4 | `web/src/features/operacional/resumo/modelo.ts:294` | O "90%" está escrito à mão na frase, e a meta existe em `META_RAZAO_MIN` (`packages/contratos/src/metas.ts:6`). Os rótulos vizinhos (linhas 145 e 149) já tinham o mesmo literal antes deste delta. | Derivar o texto de `META_RAZAO_MIN`, numa função de formatação, para a frase e os rótulos. Pode ser um cartão próprio, já que o literal antecede este delta. | recomendado |
| 5 | `web/src/features/operacional/resumo/modelo.ts:294` e `modelo.test.ts:309-310` | Com `n` nulo, a frase sai "0 de 0 prioridades avaliadas estão abaixo de 90%", e o teste fixa esse texto. Ler "0 de 0" é estranho e diz menos do que o vazio. | Com `n` nulo ou 0: "Em julho: nenhuma prioridade avaliada." Validar o texto com a UX (D-08). | recomendado |

Checklist (leitura): **escopo**: faz o que o QA (SNO-002, SNO-004, A6) e a UX (D-01 a D-03, D-05, D-06, D-08) pediram, sem extra; D-04 e SNO-001 foram para o K-075, por decisão registrada. **Regras invioláveis**: nenhuma afetada. O painel não calcula (`fraseDaSerieSla` só formata o ponto que já existe), BusinessMap e Acelerato seguem em blocos separados, e abaixo de 20 itens o valor continua não publicado (`CT-53` agora protege `S3.janela` no contrato). **Tipos**: `ErroVersaoMaisNova` é um erro de domínio tipado e o provedor distingue por `instanceof`; os casts de `CSSProperties` em variáveis CSS são o idioma do React. **Acessibilidade**: a região da `FaixaAtencao` passou a `aria-labelledby` do título visível; o nome do "Leia junto" começa pelo texto visível (2.5.3); o gráfico não é mais lido duas vezes; o carregamento não abre uma segunda região viva. **Testes**: um teste unitário por correção, cada um com o caso que falhava (h3 único por bloco, anúncio no Voltar e no hash, foco no h1, nome acessível por regex ancorada, alerta da A6). Os E2E novos afirmam mínimos nas varreduras (`>= 3` ids `compl-sust-*`, `>= 3` gráficos, texto `> 500`), e não há `waitForTimeout`, `.only` nem `.skip`. **Commits**: Conventional Commits com `Cartão:`. O 8423b19 e o 9ab5ece misturam correções de origens diferentes (QA e UX), mas cada um é coerente com uma única revisão.

**Para aprovar:** o item 1. Os itens 2 a 5 podem entrar no mesmo commit de correção ou virar cartão, com registro no quadro. Depois disso vêm a volta 5, só sobre o delta, e o QA do delta: E2E completo, Lighthouse do Resumo para confirmar o SNO-004 e a reconferência do SNO-002.

## Volta 3 (3b5a382..d4ac4dd)

Escopo: 6f3c316 (L9, front), 95fdf1a (V1 e V2) e d4ac4dd (V3). São 8 arquivos, com 48 linhas a mais e 40 a menos.

### Veredito da volta 3

**Aprovado.** O `pronto` da raiz está verde em d4ac4dd, e os quatro ajustes da volta 2 foram feitos sem mudança de lógica. A branch segue para o QA.

### Verificação (ferramentas)

| Comando | Resultado |
|---|---|
| `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` (raiz, em d4ac4dd, rodado pelo tech-lead) | **Verde, saída 0.** O `eslint .` passou sem achados. O `prettier --check` diz "All matched files use Prettier code style!". O pronto dos pacotes cobriu 10 de 11 projetos. |
| Pronto dos pacotes (mesma execução) | metricas: 653/653; web: 1.031/1.031; server: 425 passados e 64 pulados (dependem do Postgres); contratos: 45/45; mock: 161/161; homolog: 73/73; pesquisa: 33/33; spec-check: 14/14; docs-contratos: 102/102 e `docs:check: ok (393 páginas Markdown, 53 métricas, 2 eventos)`. Cobertura de 100% em todos. |
| `size` do web (mesma execução) | F6 inicial 191,00 KB (< 200); F8 gráficos 111,62 KB (< 130); F11 exportar-pdf 132,64 KB (< 150); F9 mock + biblioteca 9,84 KB (< 120). Tudo dentro do orçamento (ADR 0003). |

### Achados da volta 2: conferência

| Achado | Situação |
|---|---|
| V1 `paridade.test.ts:187`, `:191` | **Resolvido** (95fdf1a). Os dois `as never` saíram, e o lint e o typecheck do web passam. |
| V2 `varredura.test.ts` | **Resolvido** (95fdf1a). O `git diff -w` mostra que só os dois títulos do `it.each` foram quebrados em linhas pelo Prettier, sem mudança no corpo dos testes. |
| V3 páginas e fotografias `TENDENCIA_*` | **Resolvido** (d4ac4dd). As páginas e as fotografias ganharam o `pattern` do `mes`. `docs/contratos/snapshots/aceitas.json` não mudou no saldo: o aceite temporário foi consumido pela fotografia refeita, como pedido para um contrato ainda não publicado. Não há `/api/v2`. |
| L9 "U1 pendente" | **Resolvido** (6f3c316). O texto agora é "U1 = (a), decidida pelo usuário em 2026-10-14" em `arquitetura-front.md:180` e em `BlocoSustentacao.tsx:15`. |

### Achados da volta 3

- **Baixo · node-backend** · mensagens de 95fdf1a e d4ac4dd estão sem acento ("desnecessarios", "paginas", "temporario").
  - **Severidade:** não bloqueia.
  - **Correção:** nenhuma agora, porque o squash na `develop` reescreve a mensagem. Nos próximos commits, escrever com acento.

### Riscos

Os riscos da volta 1 e da volta 2 continuam valendo. A medição A1/A2 contra o Postgres real está com o QA, e o texto do caso A6 está com o UX. A volta 3 não traz risco novo.

## Volta 2 (2e6c0f2..3b5a382)

Escopo: os commits do back (36df612, 50de2a0), do front (66e3d46, 06fab0c), do adendo de UX (a8860f4, ab0b7b6, 92b93ef, 8c4fc55, a0cb01a, 49474de) e dois de documentação feitos pelo tech-lead (db13363 com a correção do L2 pelo architect e a tabela 4.5 do plano; 3b5a382). Referência do adendo: `docs/ux/sustentacao-no-operacional/05-adendo-review.md`, com U1 = (a) decidida pelo usuário.

### Veredito da volta 2

**Reprovado: ajustes necessários.** Todos os achados de leitura da volta 1 foram resolvidos, e o adendo de UX está correto. Mas o `pronto` da raiz está vermelho em três ferramentas, e as três falhas vêm dos commits do back desta volta. São correções mecânicas, sem mudança de lógica. Com elas feitas, a volta 3 se limita a conferir o `pronto` verde.

### Verificação (ferramentas)

| Comando | Resultado |
|---|---|
| `flock … nice -n 19 pnpm run pronto` (raiz, em 3b5a382) | **Vermelho no `lint`**: `web/paridade/paridade.test.ts:187:61` e `:191:41`, `@typescript-eslint/no-unnecessary-type-assertion` (achado V1). O `pronto` parou aí. |
| `pnpm run format:check` (mesma prioridade) | **Vermelho**: `packages/metricas/src/varredura.test.ts` não está formatado pelo Prettier (achado V2). |
| `pnpm -r --no-bail --if-present run pronto` (mesma prioridade) | metricas: 653/653 testes; web: 1.031/1.031; server: 425 passados e 64 pulados (dependem do Postgres); contratos: 45/45; mock: 161/161; pesquisa, homolog e spec-check verdes. Cobertura de 100% em todos. **`tools/docs-contratos` vermelho**: 2 de 102 testes falham em `src/insumos.test.ts:130` e `:134` (achado V3). |

Nenhuma falha foi por tempo esgotado. A varredura dividida por métrica (M3) passou sob carga.

### Achados da volta 1: conferência

| Achado | Situação |
|---|---|
| B1 `arquitetura-front.md` | **Resolvido** (66e3d46, 49474de). O documento cobre as quatro visões e a URL canônica, a tabela hash → visão, os dois conjuntos de filtros, os redirecionadores, o Resumo (que só reorganiza DTOs e cita a origem de cada número pela tabela 4.5), o modo `tendencia-poucos` e a janela do alerta. Resta um detalhe de texto (L9). |
| M1 tendência com O3 em erro | **Resolvido.** `TendenciaFluxo` recebe a query do O3. Com o O3 em erro, a série de P85 mostra "P85 indisponível" com "Tentar de novo" ligado ao O3, e a série de concluídos continua. Há teste em `componentes.test.tsx`. |
| M2 escapes de tipo | **Resolvido no código.** O contrato agora tem `SoDataReferencia`, e os dois casts saíram de `consultas.ts`, `BlocoFluxo.tsx` e `BlocoSustentacao.tsx`. O efeito colateral é o V1. |
| M3 varredura lenta | **Resolvido** com `it.each` por métrica, sem mexer no `testTimeout` global. O efeito colateral é o V2. |
| L1 frase da série | **Resolvido.** A diferença sai dos valores arredondados. |
| L2 ADR 0019 | **Resolvido** pelo architect (db13363). O motivo da rejeição agora é ser um cálculo paralelo ao da métrica de origem, e o texto deixa claro que as duas opções usam o estado atual da base. |
| L3 `mesCivil` | **Resolvido** com `^\d{4}-(0[1-9]\|1[0-2])$`. A OpenAPI foi regenerada, mas as páginas e as fotografias de contrato não foram (V3). |
| L4 `TENDENCIAS` à mão | **Resolvido.** `METRICAS_TENDENCIA` está no contrato e é usado pelo server e pela varredura. |
| L5 estado de módulo | **Resolvido.** É um `useRef` da `OperacionalPage` passado ao seletor. |
| L6 variável sem função | **Resolvido.** |
| L7 dependência invertida | **Resolvido.** `visao.ts` foi para `features/navegacao/`, e `lib/` e `coleta/` não dependem mais do Operacional. |
| L8 regra do tipo duplicada | **Resolvido.** `CartaoO3` usa `tipoPredominante`. |
| Plano (R7, P3, tabela 4.5) | **Resolvido** pelo tech-lead (db13363, 3b5a382). R7 e P3 estão marcadas como superadas, e a tabela 4.5 registra a P3 = (a) e a U1 = (a). |

### Adendo de UX (leitura)

- **Janela do alerta (U1 = (a)).**
  - A `FaixaAtencao` ganhou a prop opcional `janela`.
  - O Resumo escreve "Janela: últimas 12 semanas" nos dois blocos, e o texto sai de `textoPeriodoCurto(f.periodo)`, as mesmas constantes que alimentam as consultas. Assim a janela escrita não se descola da janela calculada.
  - Há a nota "Mesmo alerta, janelas diferentes", com link para a Sustentação.
  - A visão Sustentação mostra "Pede atenção no período" e o período do filtro, que é dinâmico e cobre também o personalizado.
  - Testes de unidade, integração e E2E (a0cb01a) cobrem tudo isso.
- **A9, desempate do tipo predominante.** A ordem é fixa: mais itens, depois a ordem de `TIPOS_CARD`, depois o nome. Não depende mais da ordem de chegada dos dados, então o número do Resumo e a aba do O3 sempre concordam. O rótulo diz "empate com …", e o teste cobre a ordem invertida e um tipo fora do catálogo. Não há percentil entre tipos (P1 preservada).
- **A6, perfil de versão futura.** `salvar` rejeita, sem gravar, quando o JSON guardado tem `versao` numérica > 1. JSON corrompido continua sendo lido como o padrão e é sobrescrito na primeira escolha. O `catch` não é vazio: devolve `false` com um motivo documentado. Os testes cobrem os dois casos. A6 e A9 seguem como propostas do UX que o usuário ainda pode contestar.
- **A8, hash desconhecido com `cadencia` inválida.** O teste confirma que o Resumo abre com aviso, que o hash é preservado e que a correção é `replace`.
- Regras invioláveis: nada mistura as fontes, e nenhum número é derivado na tela além do arredondamento já aceito no L1.

### Achados da volta 2

#### Bloqueantes (ferramenta)
- **V1 · node-backend** · `web/paridade/paridade.test.ts:187` e `:191`.
  - **Problema:** com `TENDENCIA_*` tipados como `SoDataReferencia` (36df612), os `filtros as never` desse teste ficaram desnecessários, e o lint falha. O arquivo não está no diff, mas a quebra vem do contrato.
  - **Correção:** remover os dois `as never` (o `eslint --fix` resolve) e rodar o `pronto` da raiz.
  - **Severidade:** bloqueia.
- **V2 · node-backend** · `packages/metricas/src/varredura.test.ts:74` e o `it.each` da sustentação (50de2a0).
  - **Problema:** o título longo do `it.each` não está no formato do Prettier, e o `format:check` falha.
  - **Correção:** `pnpm exec prettier --write packages/metricas/src/varredura.test.ts`.
  - **Severidade:** bloqueia.
- **V3 · node-backend** · `docs/contratos/metricas/TENDENCIA_FLUXO.md`, `TENDENCIA_SUST.md` e `docs/contratos/snapshots/resultados/TENDENCIA_*.json`.
  - **Problema:** o `pattern` do `mesCivil` (L3) mudou o schema, mas as páginas geradas e as fotografias não foram atualizadas. O `docs-contratos` acusa as páginas como desatualizadas e marca a mudança como "INCOMPATÍVEL".
  - **Correção:** rodar `pnpm run docs:gerar` e `pnpm run docs:fotografar`. Esses dois contratos ainda não existem na `develop`: as fotografias nasceram nesta branch e nunca foram publicadas. Se a ferramenta aceitar a fotografia refeita, não registre aceite. Se exigir o registro em `docs/contratos/snapshots/aceitas.json`, registre com o motivo "contrato ainda não publicado (nasceu nesta branch)". Não abra `/api/v2`.
  - **Severidade:** bloqueia.

O pronto da raiz não teria passado no commit do autor em nenhum dos três casos. Para a volta 3, peço que o `node-backend` rode `pnpm run pronto` na raiz, e não só o pronto do pacote, e cite a saída.

#### Baixo
- **L9 · react-frontend** · `docs/tecnica/arquitetura-front.md:180` ("U1 pendente, vale a opção (a)") e `web/src/features/operacional/resumo/BlocoSustentacao.tsx:15` ("(U1 pendente)").
  - **Problema:** a U1 foi decidida em 2026-10-14.
  - **Correção:** trocar por "U1 = (a), decidida pelo usuário em 2026-10-14". Pode entrar no mesmo lote das correções do V1 a V3.
  - **Severidade:** recomendado.

### Ajustes por autor (volta 2)
- **node-backend:** V1, V2 e V3 (bloqueiam).
- **react-frontend:** L9 (recomendado).
- **software-architect, ux-designer:** nada pendente.

### Riscos (acréscimos à volta 1)
- A6 muda o comportamento de gravação: um perfil de versão futura faz `salvar` rejeitar, e a tela mostra o aviso de falha de gravação que já existe (`PreferenciasPage.tsx:188`: "Não foi possível salvar suas preferências. Tente de novo."). Nesse caso, "Tente de novo" nunca funciona. Fica para o UX decidir se esse caso precisa de um texto próprio. Não bloqueia.
- A medição A1/A2 continua com o QA.

## Volta 1 (2e6c0f2)

Escopo: `git diff origin/develop...HEAD` (develop em 7e832f5, já com o lote #70), na worktree `MetricasDSPD-sust`, com 163 arquivos alterados. Referências: o plano `docs/architecture/plano-sustentacao-no-operacional.md` (seção 10 com P1 a P4), a ADR 0019, as regras invioláveis do `CLAUDE.md` e as seções 7 e 8 do `praticas.md`.

### Veredito da volta 1

**Reprovado: ajustes necessários.** O cálculo, os contratos e as regras invioláveis estão corretos. O que bloqueia é um item de documentação: a documentação técnica do front não acompanhou a entrega, e pela seção 7.7 e pelo item 10 da seção 8 do `praticas.md` isso bloqueia. Há ainda três ajustes médios. Corrigido o bloqueio, o novo review se limita a esses pontos.

### Verificação (ferramentas, volta 1)

| Comando | Resultado |
|---|---|
| `flock … nice -n 19 pnpm run pronto` (raiz) | lint e `format:check` verdes. contratos, mock, pesquisa, homolog e spec-check verdes, com cobertura de 100%. **`packages/metricas` falhou**: `varredura.test.ts:70` ("fluxo: todo resultado respeita o contrato…") estourou o tempo (16.383 ms, limite de 15.000 ms) sob carga (load de 6,5, com `nice 19` e cobertura em paralelo). O `pnpm -r` parou ali, e web e server não rodaram nessa execução. |
| `vitest run src/varredura.test.ts` (metricas, isolado) | 11/11 testes em 7,3 s |
| `pnpm -r --no-bail --filter metricas,web,server,docs-contratos run pronto` (mesma prioridade) | tudo verde. metricas: 559/559 testes; web: 1.022/1.022; server: 425 passados e 64 pulados (dependem do Postgres); docs-contratos: 102/102. Cobertura de 100% em linhas, ramos, funções e instruções nos quatro. |

Conclusão: o código passa, mas o `pronto` não passa de forma estável numa máquina carregada (achado M3). Não rodei a suíte E2E: isso fica com o QA.

### Checklist (regras de leitura que alcançam o diff)

1. **Escopo.** B1 a B3 e F1 a F8 estão implementados conforme o plano, e as respostas da seção 10 foram aplicadas:
   - P1 (a): tipo predominante, com rótulo "P85 · <tipo>". A série segue o mesmo tipo.
   - P2 (a): "k de m avaliadas", e "não publicado" só quando m = 0.
   - P3 (a): os números da Sustentação no Resumo usam 12 semanas (`FILTROS_SUST_RESUMO`).
   - P4 (a): o volume é contado pela data de abertura (`diasDeAbertura`, a base do S3).

   A entrega não vai além do pedido.
2. **Regras invioláveis e ADRs.**
   - BusinessMap e Acelerato não se misturam:
     - são duas métricas, cada uma com uma única fonte;
     - um teste prova que o contexto vazio da outra fonte não muda o resultado (`tendencia.test.ts`);
     - o server garante que nenhuma consulta junta `dspd_bm` com `dspd_ac`;
     - no Resumo, cada fonte tem o seu bloco, e nada é somado entre eles.
   - O cálculo passa pela biblioteca: os pontos usam o mesmo núcleo do O3 e do S2 (`classesNaJanela`, `aderenciaPorPrioridade`), extraído e reaproveitado pela métrica de origem. Um teste de propriedade sobre 3 bases geradas compara cada ponto com `calcularO3`/`calcularS2` no fim do mês.
   - Regra dos 20: abaixo de 20 itens, o resultado volta `insuficiente`, sem valor. Os testes cobrem 19 e 20 itens.
   - Percentil só dentro do tipo ou da prioridade: `REGRAS_METRICA` com `segmentacao` `['tipo']` / `['prioridade']`.
   - `criterios` vêm presentes e marcados no gráfico (T2.6).
   - Nenhum campo de pessoa: o server testa as 53 rotas.
3. **Legibilidade.** Boa. O refactor do O3 e do S2 simplificou o código, e o O3 ficou mais rápido (de cerca de 65 ms para 15 ms, medido na ADR 0003). Detalhes de nível baixo estão abaixo.
4. **Tipos e entradas.** A query das tendências é `strict` (só aceita `dataReferencia`); filtro, pessoa ou data futura devolvem 400, e há testes para isso. Escapes de tipo: achado M2.
5. **Segurança.** Os três pontos que o plano pediu para conferir estão ok:
   - as duas rotas GET usam query `strict`;
   - os DTOs só têm agregados, sem id, título ou pessoa do Acelerato;
   - os redirecionadores apontam para caminho fixo (`/operacional`), e a busca é reconstruída com `URLSearchParams`, sem redirecionamento aberto.

   Nenhum achado vira cartão para o `security-engineer`.
6. **Performance.** A tendência ficou em 16,6 ms a frio no fluxo e 4,2 ms na Sustentação (C3 < 50 ms). Na API, o pior caso medido sem cache foi 77,6 ms (A1 < 300 ms). Tudo está registrado na ADR 0003. A medição A1/A2 contra o Postgres real ficou para o QA (`perf-api.spec.ts`). A visão Sustentação é um chunk sob demanda, com pré-carga por intenção. Bundle e Lighthouse ficam com o QA (Q3).
7. **Testes.**
   - Cobertura de 100%.
   - Bordas cobertas: mês em curso, último dia do mês, ordem neutra, arquivados contam, descartados e subtarefas ficam fora, mudança de critério, mês vazio = 0, `S3.janela` com período custom.
   - Tabelas da 4.1, 4.2 e 4.3, com teste de unicidade dos hashes.
   - Lacuna: o caso de O3 com erro no Resumo (M1).
8. **Acessibilidade.**
   - Há um `aria-live` próprio do seletor.
   - O foco volta ao rádio.
   - Cada série tem "Ver como tabela" com `aria-pressed`.
   - Os blocos são `section` com `h2`.

   A revisão visual é do `ux-designer`.
9. **Documentação.**
   - Atualizados: `docs/api/metricas.md`, a OpenAPI, os contratos gerados, `biblioteca-de-calculo.md` e a ADR 0003.
   - **Faltou** `docs/tecnica/arquitetura-front.md` (B1, abaixo).
10. **Commits.** Seguem Conventional Commits em português, um por tarefa (F1 a F8). A PR entra por squash.

### Achados da volta 1

#### Bloqueante
- **B1 · react-frontend** · `docs/tecnica/arquitetura-front.md:17`, `:158`, `:159` (e o resto do documento).
  - **Problema:** a documentação técnica do front descreve o sistema anterior.
    - O diagrama ainda tem a página `sustentacao`.
    - Os filtros da sustentação aparecem sem o prefixo `sust_`.
    - `cadencia` aparece como parâmetro local com `replace`, mas agora a escolha é `push` e a correção da URL é `replace` (`useVisaoOperacional`).
    - Não há nada sobre o Resumo, `visao.ts` (tabela hash → visão), `RedirecionaSustentacao`, `LinhaFiltrosGuardados`/`contarAtivos`, `atencao.ts`, `GraficoMensal`/`SerieMensal`, `handle.titulo` como função nem `dominiosDaRota` por visão.
  - **Correção:** atualizar o documento no mesmo intervalo de commits. Itens mínimos:
    - as quatro visões e a URL canônica;
    - a tabela hash → visão;
    - os dois conjuntos de filtros na mesma URL;
    - os redirecionadores;
    - o Resumo, que não calcula e só reorganiza DTOs (origem de cada número, tabela 4.5 do plano);
    - o modo mock `tendencia-poucos`.
  - **Severidade:** bloqueia (`praticas.md` 7.7 e item 10 da seção 8).

#### Médio
- **M1 · react-frontend** · `web/src/features/operacional/resumo/TendenciaFluxo.tsx:60` e `SerieMensal.tsx:49,77`.
  - **Problema:** quando o O3 falha, `o3` fica `undefined` e o tipo também. Como a tendência só espera o O3 sair de `carregando`, ela dispara mesmo com erro. Aí `serieP85` devolve todos os meses sem valor (n=0), e a série mostra "Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens". A frase é falsa: o histórico existe, só não se sabe o tipo.
  - **Correção:** sem tipo, por erro do O3, mostrar um estado próprio, por exemplo "P85 indisponível: não foi possível carregar o tempo de ciclo" com "Tentar de novo" ligado ao O3, ou esconder só a série de P85. Incluir um teste de integração com `mock=erro:O3`.
- **M2 · react-frontend + node-backend** · `web/src/features/operacional/resumo/consultas.ts:45-46`, `BlocoFluxo.tsx:35`, `BlocoSustentacao.tsx:22`.
  - **Problema:** são dois escapes de tipo seguidos e sem comentário: `as Record<string, never>` e depois `as never`. O contrato tipa os filtros de `TENDENCIA_*` como `Record<string, never>`, mas o front precisa mandar `dataReferencia`. O `praticas.md` (seção 2) não aceita escape sem justificativa, e `as never` desliga a checagem da chamada inteira.
  - **Correção:** o `node-backend` tipa no contrato `TENDENCIA_FLUXO`/`TENDENCIA_SUST` como `Par<{ dataReferencia?: string }, …>`, ou cria um tipo `SoDataReferencia` compartilhado com `VISAO_GERAL`/`PV1`. O `react-frontend` remove os dois casts.
- **M3 · node-backend** · `packages/metricas/src/varredura.test.ts:70`.
  - **Problema:** o teste de varredura do fluxo passa de 15 s quando o `pronto` roda com a máquina carregada, e o `pnpm -r` para no primeiro erro. Isolado, ele leva cerca de 2 s. O `pronto` da raiz ficou vermelho por causa dele nesta rodada. O teste não é novo, mas este diff mexeu nele.
  - **Correção:** dar a ele um limite explícito e folgado, como pede a seção 4 (por exemplo `{ timeout: 60_000 }`, com comentário sobre a medição), ou dividir a varredura do fluxo por métrica (`it.each`). Não aumentar o `testTimeout` global.

#### Baixo
- **L1 · react-frontend** · `web/src/features/operacional/resumo/modelo.ts:275-279`.
  - **Problema:** `fraseDaSerie` subtrai os P85 brutos (duas casas) e arredonda a diferença. Ela pode não bater com os valores mostrados (14,4 → "14" e 12,6 → "13" geram "2 a menos"). Além disso, é a tela derivando um número.
  - **Correção:** calcular a diferença a partir dos valores já arredondados para exibição ou, se o arquiteto preferir, levar o delta para o DTO.
- **L2 · software-architect** · `docs/architecture/adr/0019-tendencia-mensal-por-data-de-referencia.md:23`.
  - **Problema:** a ADR rejeita a alternativa "contexto de hoje" porque "um card reaberto depois do fim do mês muda o ponto passado". A solução escolhida tem a mesma propriedade: o índice é o da base atual, e o `docs/api/metricas.md` já diz isso corretamente.
  - **Correção:** reescrever o motivo da rejeição (a diferença real é a janela por ponto e o mesmo núcleo da métrica de origem, não uma reconstrução histórica).
- **L3 · node-backend** · `packages/contratos/src/schemas.ts:1308`.
  - **Problema:** `mesCivil = z.string()`.
  - **Correção:** usar `z.string().regex(/^\d{4}-\d{2}$/)`.
- **L4 · node-backend** · `server/src/modulos/metricas/rotas.ts:20`.
  - **Problema:** `TENDENCIAS` é uma lista escrita à mão. Um terceiro id sem filtro precisaria ser lembrado aqui.
  - **Correção:** derivar de `ContratoMetricas` (os ids sem filtro) ou de um marcador em `REGRAS_METRICA`, junto com `VISAO_GERAL` e `PV1`.
- **L5 · react-frontend** · `web/src/features/operacional/SeletorVisao.tsx:12`.
  - **Problema:** `let focoPendente` é estado de módulo e vaza entre montagens e entre testes.
  - **Correção:** levar o estado para a `OperacionalPage` (um `useRef` passado ao seletor) ou para o `state` da navegação.
- **L6 · react-frontend** · `web/src/features/operacional/useVisaoOperacional.ts:25`.
  - **Problema:** `const state = bruto` é uma variável sem função.
  - **Correção:** remover a linha.
- **L7 · react-frontend** · `web/src/lib/destinoCartao.ts:2` e `web/src/features/coleta/fontes.ts:2`.
  - **Problema:** `lib/` e `coleta/` passaram a importar `features/operacional/visao`, e a dependência ficou invertida.
  - **Correção:** mover `visao.ts`, que é puro, para `lib/` ou `features/navegacao/`.
- **L8 · react-frontend** · `web/src/features/operacional/components/CartaoO3.tsx:24`.
  - **Problema:** a regra do tipo predominante está duplicada. O número do Resumo e a aba padrão do O3 precisam usar sempre o mesmo critério.
  - **Correção:** usar `tipoPredominante` de `resumo/modelo.ts` (ou movê-lo para `atencao.ts`/`lib`).

#### Para o `ux-designer` (não bloqueia o review)
- `BlocoSustentacao.tsx:174`: "Nada pede atenção na Sustentação na semana." O Resumo da Sustentação agora usa 12 semanas (P3), então "na semana" não é preciso.
- Pela P3, o "Pede atenção" da Sustentação no Resumo usa 12 semanas, e o da visão Sustentação usa 6 meses. O mesmo alerta pode aparecer num lugar e não no outro. Vale conferir se a janela escrita em cada lugar basta como explicação.

### Ajustes por autor (volta 1)
- **react-frontend:** B1 (bloqueia), M1, M2 (remover os casts), L1, L5, L6, L7, L8.
- **node-backend:** M2 (tipo do contrato), M3, L3, L4.
- **software-architect:** L2.

### Riscos e mudanças de contrato
- Contrato:
  - dois `MetricaId` novos (53 no total);
  - `ResultadoS3.janela` passa a ser **obrigatório** na resposta. É compatível para quem lê, mas um consumidor que valida com o schema antigo continua passando, e um que gera S3 por fora precisa do campo.
  - os ids de seção da Sustentação mudaram (`sust-*`), e os hashes antigos são redirecionados.
- `/sustentacao` virou redirecionador, e o padrão de `/operacional` agora é o Resumo. Links externos para `/operacional` sem `cadencia` passam a cair no Resumo, e não mais na Diária.
- A medição A1/A2 contra o Postgres real está pendente com o QA.

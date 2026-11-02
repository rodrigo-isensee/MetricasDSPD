# 0015 - Bibliotecas e práticas do back-end
Estado: vigente
- Status: **aceita** (decisão delegada ao arquiteto pelo usuário em 2026-10-11: "usar as melhores libs e práticas para Node; não precisa ser cru; evitar inflar a arquitetura")
- Data: 2026-10-11
- **Revisão 1 (2026-10-30):** S-22 revista (cliente HTTP do BusinessMap com `fetch` nativo e limitador próprio, sem ky e sem p-throttle), pelo achado A1 do review da F0 do pedido 052 (`docs/reviews/052-f0-fundacoes.md`). Detalhe na seção "Revisão 1".
- **Substitui parcialmente:** ADR 0014 rev. 2, só nos pontos "Acesso a dados: `pg` puro, sem ORM nem query builder" e "Tipos: sem codegen". Volta o Kysely da ADR 0005, agora sobre `pg` e Postgres.
- **Não muda (fixado pelo usuário):** PostgreSQL 17, pnpm, Fastify 5, Zod 4, Pino, Vitest sem Testcontainers, TypeScript `strict`, Docker Compose local, custo zero, GRANT por coluna (a API não lê colunas de pessoa), schemas `dspd_bm|dspd_ac|dspd_core`, outbox transacional por polling, regras invioláveis do `CLAUDE.md`. Também ficam: node-pg-migrate, `pg.Pool` por papel, `ON CONFLICT ON CONSTRAINT ... DO NOTHING` como única forma de idempotência.

## Contexto
Auditoria do `server/` (S-01 a S-12) em 2026-10-11. O código está limpo e testado. O que foi escrito à mão por causa da regra "`pg` puro" e que uma biblioteca resolve melhor:
- **Acesso a dados:** `Consultavel`/`PoolLike`/`ClienteLike`, `emTransacao`, cerca de 15 tipos de linha declarados à mão (`LinhaCard`, `LinhaChamado`...) que só são conferidos por teste de integração, e SQL montado com `${S.bm}` em todo repositório. Um repositório de `businessmap` pode ler `${S.ac}` sem que o compilador perceba (hoje quem pega isso é o lint).
- **Cache do `ServicoMetricas`:** `Map` com descarte FIFO, TTL controlado à mão e deduplicação manual de carga simultânea (`e.carga`).
- **Encerramento:** `process.once('SIGTERM')` sem prazo, sem tratar `uncaughtException`/`unhandledRejection`, e o worker não espera o ciclo em andamento terminar.
- **Cliente HTTP do coletor (BusinessMap e Metabase):** ainda não existe (WS2). Sem decisão, cada coletor criaria o próprio timeout, retentativa e limite de taxa.
- **Webhook:** sem limite de taxa (já previsto na 0014, mas não implementado).
- **Logs:** a redação cobre segredos, mas não campos de pessoa.

O que está bom e **fica como está**: config com Zod validada na partida, citando só nomes de variáveis (`config.ts`); `AppError` com handler único (`erros.ts`); `/health/live` e `/health/ready`; `requestId` e redação de segredos no Pino; comparação de segredo com `timingSafeEqual` sobre SHA-256; outbox (`outbox.ts`, backoff, retenção, uma fonte por execução); `agenda.ts` (28 linhas, testada, com a semântica de "rodar o que ficou para trás", que bibliotecas de cron não oferecem); runner do node-pg-migrate, checksums e `gerarGrants`; composição manual em `buildApp(deps)` e nas `entradas/`.

## Decisão

### Bibliotecas por área
| Área | Escolha | Por quê | Alternativas descartadas | O que sai do nosso código |
|---|---|---|---|---|
| Acesso a dados | **Kysely** (`PostgresDialect` sobre o mesmo `pg.Pool` por papel) | Query builder tipado, SQL previsível, sem engine nem schema próprio. Uma instância por schema (`Kysely<BmDB>.withSchema(S.bm)`), então misturar BM e AC passa a ser **erro de compilação**. Seleção explícita de colunas combina com o GRANT por coluna. `sql\`...\`` tipado para o que o builder não cobre (epoch em `float8`, `FOR UPDATE SKIP LOCKED` vem pronto) | **Prisma**: seleciona todas as colunas por padrão (bate no `permission denied` das colunas de pessoa), schema dinâmico por prefixo é fraco, engine binária. **Drizzle**: schema em TS duplica as migrações SQL e `pgSchema` é estático. **Knex**: tipos fracos. **pgtyped/Slonik**: menos adoção, pool próprio (Slonik) | `Consultavel`, `PoolLike`, `ClienteLike`, `emTransacao` (vira `db.transaction().execute`), tipos de linha à mão, `${S.x}` no texto do SQL, a maior parte de `tests/duble-pg.ts` |
| Tipos do banco | **kysely-codegen**, rodado contra o banco migrado, um arquivo por schema (`--default-schema dspd_bm --include-pattern 'dspd_bm.*'`, idem `ac` e `core`), `--date-parser string`, `--numeric-parser string`. Arquivo gerado versionado; CI roda `--verify` | O tipo vem do catálogo real, não de memória. Tipo `ApiBmDB` = gerado com `Omit` das `COLUNAS_PESSOA`: a API não consegue nem escrever a consulta | Tipos à mão (atual): o descompasso só aparece no teste de integração | Declarações `LinhaX`; o snapshot de esquema continua (ele protege grants e views, não tipos) |
| Migrações | **node-pg-migrate** (fica) | Lock, tabela de controle, DDL transacional e checksums já funcionam | Kysely `Migrator`: sem ganho, perde `checkOrder` e o runner já integrado | nada |
| Config | **Zod** (fica) + `process.loadEnvFile`/`--env-file-if-exists` do Node 24 em dev | Já faz o necessário | `dotenv`, `convict`, `envalid`: dependência sem ganho | nada |
| Composição | **manual** (fica): `buildApp(deps)`, `criarWorker(deps)`, entradas montam as dependências | Poucos serviços, injeção explícita e testável | `awilix`, `tsyringe`, `inversify`, NestJS | nada |
| Encerramento | **close-with-grace** (equipe do Fastify) | Sinais, `uncaughtException`, `unhandledRejection` e prazo de encerramento num lugar só | Código à mão (atual): sem prazo nem erros fatais | `process.once(...)` das entradas |
| Cache em memória | **lru-cache** | LRU com `max` e `ttl`; `fetch()` deduplica cargas simultâneas | `Map` FIFO (atual); Redis (peça a mais, custo) | descarte FIFO, TTL manual de `criterios`, deduplicação `e.carga` |
| HTTP de saída do BusinessMap (revisão 1, 2026-10-30; ver "Revisão 1" abaixo) | **`fetch` nativo** com limitador próprio por janela móvel de 60 s, `AbortSignal.timeout`, nova tentativa limitada só em GET (5xx, tempo esgotado e falha de rede) e espera de 429 por `retry_after`, em `plataforma/http.ts`; resposta validada com **Zod**. **Sem ky e sem p-throttle.** Alcance: só o cliente do BusinessMap; outro cliente de saída (Metabase ou outro) decide a biblioteca quando existir | Nenhuma dependência nova num cliente cuja chave pode escrever no quadro (Q-5 = B do pedido 052); os controles exigidos (só GET, caminho e consulta fechados, redirect manual, 401/403 interrompem a execução) teriam no ky `hooks` de tamanho comparável; o limitador conta também as novas tentativas e as esperas de 429, o que o p-throttle sozinho não faz; o `fetch` é injetável (`fetchImpl`), sem interceptador de rede nos testes | **ky + p-throttle** (desenho original desta ADR; trocado pelo review da F0 do 052), `axios` (maior, adaptador próprio), `got` (só Node, maior), `undici` direto, `p-retry` + `fetch` | não existia: impede que o coletor do BusinessMap faça controles espalhados |
| Limite de taxa do webhook | **@fastify/rate-limit**, armazenamento em memória, só na rota do webhook | Oficial, compatível com Fastify 5, sem Redis | nginx `limit_req` (fica fora dos testes da API) | nada (lacuna da 0014) |
| Logs | **Pino** (fica) + **pino-pretty** só em dev (devDependency) | Legibilidade local sem afetar produção | Winston, Bunyan | nada |
| Erros, health, webhook, outbox, agenda | **ficam** como estão | Corretos, pequenos e testados | `@fastify/sensible`, `@fastify/under-pressure`, `pg-boss`, `croner` (ver "Não adotar") | nada |
| Testes | **Vitest** (fica). Repositórios contra o Postgres do Compose (projeto `pg`); serviços com repositório falso; forma do SQL com o `DummyDriver` do Kysely (`.compile()`), sem banco | Teste de repositório no banco real; o dublê de `pg` deixa de ser necessário para repositórios | `pg-mem` (fidelidade baixa: sem GRANT por coluna, sem `security_invoker`), Testcontainers (excluído) | dublê de pool usado só para repositórios |

### Não adotar (anti-inflação)
| Item | Motivo |
|---|---|
| Container de DI (`awilix`, `tsyringe`, `inversify`) e NestJS | A composição manual cabe em dois arquivos de entrada. Container esconde dependências e não acrescenta teste. |
| Microsserviços, API gateway, service mesh | Monólito modular com `api` e `worker` separados por privilégio já atende. |
| Fila externa (BullMQ, Redis, RabbitMQ, SQS) | A outbox por polling está fixada pelo usuário. Fila externa perde a atomicidade com o banco e custa uma peça a mais. |
| `pg-boss`, Graphile Worker | Fila sobre Postgres com schema e migrações próprios, que exige papel com mais privilégio que o `dspd_webhook`/`dspd_coletor`. Duplicaria a outbox. |
| Biblioteca de cron (`croner`, `node-cron`) | A agenda precisa de "último horário agendado que já passou" para recuperar coleta perdida. Duas periodicidades fixas não justificam a troca. Reavaliar se surgir a terceira periodicidade. |
| ORM (Prisma, Drizzle, TypeORM, MikroORM) | Ver tabela: conflitam com GRANT por coluna, schema por prefixo e migrações SQL revisadas. |
| OpenTelemetry, Prometheus, Sentry | Sem coletor nem consumidor hoje, e o Sentry teria custo e enviaria dado para fora. Logs Pino estruturados bastam. Reavaliar quando houver hospedagem (ADR futura). |
| `@fastify/helmet` na API | A API só serve JSON atrás do nginx, que já define os cabeçalhos dos estáticos. Entra se a API passar a servir HTML. |
| Biblioteca de datas no servidor (`date-fns`, `luxon`, `dayjs`) | Todo cálculo de tempo passa pela biblioteca compartilhada (T2.5). O servidor só lida com instantes `Date`. |
| `lodash`, `class-validator`, `dotenv`, `axios` | Já cobertos pela linguagem, pelo Zod ou pelo Node 24 (o `axios`, pelo `fetch` nativo; revisão 1). |
| Compilar para JS (`tsc`/`tsdown`) no lugar de `node --import tsx` | Os pacotes do workspace são consumidos como TypeScript. Trocar mexe no monorepo inteiro sem ganho medido. Reavaliar se o tempo de partida ou o tamanho da imagem virar problema. |

### Critérios para uma dependência nova (todos obrigatórios; o `node-backend` cita no PR)
1. **Manutenção ativa:** release nos últimos 12 meses, mais de um mantenedor ou organização conhecida, issues de segurança respondidas.
2. **Licença permissiva:** MIT, ISC, Apache-2.0, BSD-2/3-Clause ou BlueOak-1.0.0. Qualquer outra vai para o usuário.
3. **Custo zero:** nenhum serviço pago nem envio de dado para terceiros.
4. **Tamanho:** sem dependências nativas (binário) e árvore transitiva pequena (`pnpm why`). Preferir zero dependências.
5. **Ganho mensurável:** remove código nosso (linhas e testes citados) ou fecha uma lacuna de segurança ou confiabilidade nomeada. "Pode ser útil" não basta.
6. **Compatibilidade:** ESM, Node 24, TypeScript `strict` com tipos próprios; plugins do Fastify, só se forem compatíveis com Fastify 5.
7. **Saída possível:** fica atrás de um módulo nosso (`plataforma/*`), sem se espalhar pelos domínios.

### Práticas obrigatórias
- **Erros:** serviços lançam `AppError(code, message, status)`. O handler único converte para o formato da ADR 0007. Erro inesperado vira 500 sem detalhe para o cliente e com `err` no log. No worker, erro de tarefa ou de consumidor é registrado e não derruba o ciclo. Na outbox, `ultimo_erro` guarda só a categoria.
- **Config:** validada na partida por entrada (`carregarConfigApi|Worker|Migrar`). Variável inválida encerra o processo com código ≠ 0, e a mensagem cita só nomes. Cada entrada lê só a credencial do próprio papel.
- **Encerramento gracioso:** `close-with-grace` com prazo de 10 s. Na `api`: `app.close()` (para de aceitar, termina as requisições em curso) e depois `pool.end()` de cada pool. No `worker`: abortar o laço, **esperar o ciclo em andamento** dentro do prazo, soltar os advisory locks (a conexão fecha) e `pool.end()`. Estourou o prazo: sai com código 1, e a próxima execução retoma pela marca d'água e pela reserva expirada da outbox.
- **Health:** `/health/live` sem I/O; `/health/ready` com `SELECT 1` e timeout curto. O healthcheck do Compose usa o `ready`.
- **Logs:** JSON do Pino em produção, `requestId` por requisição, `fonte` e `coletaId` no worker. A redação cobre segredos **e dados pessoais**: `*.responsaveis`, `*.usuario`, `*.nome`, `*.email`, `*.login`, cabeçalhos de autenticação e o corpo do webhook (`req.body` nunca vai ao log). Payload de fonte externa nunca é logado inteiro, só id, contagem e hash.
- **Migrações:** só para frente depois de aplicadas (checksum em `checksums.json`), SQL explícito via `ddl(S)`, transacionais, `down` testado no CI (`up → down → up`). `gerarGrants` é reaplicado ao fim de todo `migrate`.
- **Transações:** `db.transaction().execute(fn)` do Kysely em `READ COMMITTED`, curtas, **sem I/O externo** dentro (HTTP sempre fora). Evento da outbox gravado na mesma transação da mudança. Idempotência só com `onConflict((oc) => oc.constraint('uq_...').doNothing())`.
- **Timeouts em tudo:** `statement_timeout` e `connectionTimeoutMillis` por pool, `idle_in_transaction_session_timeout` por papel (definido no init), `requestTimeout` do Fastify e, no cliente do BusinessMap, `AbortSignal.timeout` + nova tentativa limitada no `fetch` nativo (só GET, só em 5xx, tempo esgotado e falha de rede; 429 espera o `retry_after`; 401/403 sem nova tentativa; revisão 1). Advisory lock sempre `pg_try_*`, nunca bloqueante.
- **Segurança de SQL:** valores só como parâmetro (o Kysely já faz). Identificadores só do mapa `S` validado. `sql.raw` proibido fora de `plataforma/db` e das migrações. Fragmentos `sql\`\`` servem só para expressões, nunca para nome de tabela: tabela sempre pelo builder, para o `withSchema` valer.
- **Testes por camada:** funções puras (mapa, agenda, backoff) em teste unitário. Serviço com repositório falso e relógio injetado. Repositório e permissões no Postgres real (projeto `pg`, schemas prefixados). Rotas com `app.inject()`. Contrato pelo diff do OpenAPI e do `kysely-codegen --verify`. E2E em `e2e/`. A cobertura de 100% em `src/` continua.

### Lint (atualiza a regra de SQL da S-06)
Com o builder, a regra sobre literais SQL não basta. Entram via `no-restricted-syntax`/`no-restricted-imports`:
- proibido `.selectAll(`, `.doUpdateSet(` e `onConflict` sem `.constraint(`;
- `sql.raw` fora de `plataforma/db` e `migrations/`;
- módulo `businessmap` sem importar tipos ou instância `ac`, e o inverso;
- módulo de leitura da API só com os tipos `Api*DB`.

As regras atuais sobre literais continuam valendo para os fragmentos `sql\`\``.

## Plano de refatoração (cartões para o `node-backend`)
Esforço: **P** até meio dia, **M** 1 a 2 dias, **G** 3 dias ou mais. Cada cartão mantém a suíte verde e a cobertura de 100%, e não muda contrato HTTP nem OpenAPI (o diff do `openapi.json` precisa ser vazio).

| Cartão | Escopo | Esforço | Depende de |
|---|---|---|---|
| **S-14** Base Kysely | `plataforma/db/kysely.ts`: `criarDb(pool, S)` devolve `{ bm, ac, core }` (`Kysely<...>.withSchema`) sobre o `criarPool` atual (parsers, UTC e `statement_timeout` ficam). Script `db:tipos` (kysely-codegen, três arquivos em `src/plataforma/db/tipos/`), tipos `Api*DB` com `Omit` de `COLUNAS_PESSOA` e teste que confere o `Omit` contra `lgpd.ts`. Job `db` do CI roda `db:tipos --verify` | M | — |
| **S-15** Lint do builder | Regras da seção "Lint" e um exemplo proibido de cada uma em `tests/plataforma2.test.ts` | P | S-14 |
| **S-16** Repositórios de leitura | `referencia`, `operacao` e `metricas/repositorio.ts` no Kysely (epoch `float8` por `sql<number>`). Testes de paridade das 33 métricas e de desempenho (p95 ≤ números do `server.md`) sem regressão | M | S-15 |
| **S-17** Escrita e outbox | `staging.ts`, `webhook.ts`, `outbox.ts`, `trava.ts`, `fecharColeta` em Kysely com `db.transaction()`. Remove `emTransacao`, `Consultavel`, `PoolLike`, `ClienteLike` e o uso do `duble-pg` nos repositórios. `seed.ts` pode ficar em `pg` (ferramenta) | M | S-16 |
| **S-18** Cache | `ServicoMetricas` com `lru-cache` (resultados com `max`, versões com `ttl` de 60 s, carga via `fetch()` deduplicado) | P | — |
| **S-19** Encerramento gracioso | `close-with-grace` em `entradas/api.ts` e `entradas/worker.ts`, com o worker esperando o ciclo em andamento; `requestTimeout` do Fastify; `connectionTimeoutMillis` nos pools; `idle_in_transaction_session_timeout` no init dos papéis | P | — |
| **S-20** Logs | Redação de campos de pessoa e do corpo do webhook, teste que loga um objeto com esses campos e verifica `[redigido]`, `pino-pretty` em `dev:*` | P | — |
| **S-21** Limite do webhook | `@fastify/rate-limit` só na rota do webhook (valor em config, padrão 60/min por IP), 429 no formato de erro único, teste com `inject` | P | — |
| **S-22** Cliente HTTP do BusinessMap (revisão 1, 2026-10-30) | `plataforma/http.ts`: `criarClienteHttp(cfg, deps)` com `fetch` nativo e limitador próprio (sem ky e sem p-throttle); só GET, lista fechada de caminhos e de consulta, host fixo, redirect não seguido, chave só no cabeçalho; resposta validada por Zod; `fetch`, relógio e espera injetáveis nos testes; log sem a chave. Só o coletor do BusinessMap (WS2); o Metabase decide o seu quando existir | M | — |
| **S-23** Documentação | `server.md` (seções S-01 a S-12 apontam para os nomes novos) e skill do `node-backend` (convenções Kysely) | P | S-17 |

**Ordem:** S-14 → S-15 → S-16 → S-17 → S-23 (caminho crítico, cerca de 5 a 6 dias). S-18, S-19, S-20 e S-21 entram em paralelo a qualquer momento. **S-22 precisa estar pronto antes do primeiro cartão de coleta do WS2.** Nenhum cartão de feature nova espera a S-17: código novo já nasce em Kysely a partir da S-15.

## Revisão 1 (2026-10-30): S-22 sem ky e sem p-throttle
- **Origem:** review da F0 do pedido 052 (`docs/reviews/052-f0-fundacoes.md`, achado A1, etapa E2.4): o código da F0 (`server/src/plataforma/http.ts`) implementou o cliente com `fetch` nativo e limitador próprio, e a troca foi aceita no review; esta revisão alinha a ADR ao código.
- **Decisão:** o cliente HTTP de saída do BusinessMap usa `fetch` nativo, com limitador por janela móvel de 60 s, timeout por `AbortSignal.timeout`, nova tentativa limitada só em GET (5xx, tempo esgotado, falha de rede), espera de 429 por `retry_after` e interrupção da execução em 401/403. ky e p-throttle não entram como dependência.
- **Motivo:** (1) nenhuma dependência nova num cliente cuja chave pode escrever no quadro (Q-5 = B do 052: a chave é a do dono, e o cliente é a única barreira contra escrita); (2) os controles do plano 052 (F0) exigiriam no ky `hooks` e configuração de tamanho comparável ao código próprio; (3) o limitador precisa contar também as novas tentativas e as esperas de 429, o que o p-throttle sozinho não faz. O código cabe em cerca de 150 linhas de lógica, coberto por testes com servidor falso e relógio injetado.
- **Alcance:** só o cliente do BusinessMap. Não é base genérica para outros coletores: um cliente de saída novo (Metabase ou outro) decide a biblioteca quando existir, por esta ADR (critérios de dependência nova) e não por herança deste cliente.
- **Critério de reversão (fato observável):** volta-se a ky (e a um limitador de biblioteca) se (a) um segundo cliente de saída precisar dos mesmos controles (o código seria duplicado), ou (b) a F1 ou a F3 do 052 registrarem defeito no limitador ou na nova tentativa (falha em `ctl_coleta_falha` com código 429 repetido ou execução que excede a cota de 30/min da API). Em qualquer volta, a biblioteca escolhida precisa manter os dois controles pedidos pela segurança da F0 (`docs/security/052-f0-fundacoes.md`, ffa261f): redirect não seguido (`redirect: 'manual'`, 3xx vira erro, para que o cabeçalho `apikey` não vá a outro host) e erro sem `cause` (nem corpo da resposta). Sem os dois, a volta não acontece.
- **Alternativas consideradas:** manter ky + p-throttle como no desenho original (rejeitada pelos três motivos acima); `undici` direto (dependência sem ganho sobre o `fetch` do Node 24).
- **Consequências:** zero dependência nova no caminho da chave; o limitador e a nova tentativa passam a ser código nosso, com cobertura de 100% obrigatória; a seção "Não adotar" deixa de ter o ky como cobertura do `axios` para o BusinessMap (o `axios` segue não adotado).

| Leitura | O que se leu | Data |
|---|---|---|
| Review da F0 do 052, achado A1 e item "Troca de ky e p-throttle" | `docs/reviews/052-f0-fundacoes.md` (branch `feature/052-f0-fundacoes`) | 2026-10-30 |
| Cliente da F0 | `server/src/plataforma/http.ts` (cabeçalho de controles, limitador, laço de tentativas) | 2026-10-30 |
| Parecer de segurança da F0, item "Troca de ky e p-throttle" | `docs/security/052-f0-fundacoes.md` (ffa261f, branch `feature/052-f0-fundacoes`) | 2026-10-30 |

## Alternativas consideradas
- **Manter `pg` puro (0014 rev. 2):** zero dependência a mais, mas mantém tipos de linha à mão, a mistura BM × AC detectada só por lint e o SQL interpolado com `${S}`. O usuário liberou a troca.
- **Prisma/Drizzle:** ver tabela; o conflito com o GRANT por coluna e com o schema por prefixo é estrutural.
- **pg-boss no lugar da outbox e da agenda:** removeria mais código, mas a outbox está fixada e o pg-boss exige privilégios e schema próprios.

## Consequências
- **Mais fácil:** consultas tipadas pelo catálogo real; BM × AC e coluna de pessoa na API viram erro de compilação, além do lint e do GRANT; transação e `onConflict` sem código próprio; encerramento e timeouts uniformes; coletores nascem com retentativa e limite de taxa padronizados.
- **Mais difícil:** gerar tipos exige banco migrado (`db:tipos` depois de `migrate`); desenvolvedor precisa conhecer o Kysely; consultas de desempenho usam `sql\`\`` e exigem revisão.
- **Riscos:**
  - `withSchema` não alcança tabela escrita dentro de `sql\`\``. Mitigação: regra de lint e teste do schema por repositório (já existe), que passa a ler o SQL compilado.
  - Overhead do builder no caminho quente: o critério de aceite da S-16 é o p95 do `server.md`.
  - Tipos gerados defasados: `--verify` no CI.

## Decisões que cabem ao usuário
Nenhuma. Todas as bibliotecas escolhidas têm licença permissiva (MIT; `lru-cache` é BlueOak-1.0.0, permissiva), custo zero e nenhum envio de dado a terceiros.

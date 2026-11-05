# 0026 - Métricas só com dado real: o mapa de origem como portão e o mock só em teste e homologação

Estado: vigente (decisões do dono de 2026-11-02 no pedido 060). Data: 2026-11-02.
Propósito: impedir que o painel de uso diário e a base real misturem dado fictício com real, e fixar o que cada métrica mostra quando não tem fonte real. Público: node-backend, react-frontend, ux-designer, devops-engineer, security-engineer, qa-engineer, tech-lead. Revisão: 2026-12-02.

Plano de origem: `docs/architecture/060-sem-mock.md` (E2.1, K-195). Revoga o modo de duas bases da F6 do plano 052 (`DSPD_SCHEMA_PREFIXO_SEED`) e o passo 4 de `docs/architecture/server.md` (regenerar o mock com prefixo próprio). Não muda a forma de leitura do Acelerato (ADR 0023, revisada no pedido 061).

## Contexto

O dono decidiu em 2026-11-02: "B para as métricas prontas com dados reais funcionando e que ele não regere com dados fakes" e "É isso é urgente para não misturar dados reais com falsos". O levantamento do plano 060-sem-mock achou quatro portas por onde o mock entra:

1. O front usa o mock por padrão (`VITE_FONTE ?? 'mock'` em `web/src/app/App.tsx`; `ARG VITE_FONTE=mock` no `docker/web/Dockerfile`).
2. A API sobe com extensões e pesquisa fictícias por padrão (`DADOS_FONTE` com padrão `mock` em `server/src/plataforma/config.ts`).
3. No modo de duas bases, as métricas fora do mapa de origem real são calculadas sobre a base do seed. Na base única, as métricas marcadas como mock são calculadas sobre a base real com extensões fictícias por cima: o número não é real nem fictício, é misto (achado A12 do plano).
4. O `seed` gravava no esquema do `DSPD_SCHEMA_PREFIXO`, caía em `PG_MIGRADOR_URL` (o papel e o banco da base real) e não conferia se ali já havia coleta real. Essa é a única porta que mistura dado na base. A prova é o próprio `limpar-seed.ts` (linhas 11 e 12): o seed de 2026-10-09 gravou `dim_card`, `fato_transicao`, `fato_bloqueio`, `ref_*` e duas linhas de `ctl_coleta` "no mesmo esquema da carga real".

O mapa `METRICAS_ORIGEM_REAL` (`packages/contratos/src/origem.ts`) já dizia quais métricas têm fonte real (17 ids), mas era só um rótulo: o selo "Dados fictícios" aparecia no cartão e o número saía mesmo assim.

O review do P1 (`docs/reviews/060-seed-recusa-real.md`) deixou ao arquiteto o achado A3: o webhook do BusinessMap (`server/src/modulos/businessmap/webhook.ts:46`) grava `stg_webhook_evento` mesmo num esquema com seed, e a guarda do seed não conta essa tabela.

## Decisão

Princípio: **o mapa de origem do contrato é um portão, não um rótulo.** Só métrica dentro do mapa real é calculada no painel de uso diário. O mock continua existindo só onde é declarado e isolado: testes, E2E, CI efêmera e homologação.

**P1. O seed nunca grava na base real** (autorizado pelo dono, "A", antes das perguntas Q1 a Q5; PR próprio):
- `semear()` recusa, dentro da trava `dspd:seed` e antes de escrever, o esquema que tenha linha de `ctl_coleta` sem o prefixo `seed-mock` ou item (`dim_card`, `dim_chamado`) de coleta que não é do seed. Falha fechada; a mensagem traz só tabela e contagem.
- O `seed-cli` exige `PG_SEED_URL` explícita e não cai mais em `PG_MIGRADOR_URL`. O `db:seed` da raiz e o ramo `seed` do `scripts/db.sh` saem.
- No sentido inverso, a coleta e o projetor do BusinessMap e do Acelerato recusam esquema com coleta `seed-mock` (o dono roda o `db:limpar-seed` antes).

**P2. A API de produção não tem modo mock:**
- `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED` saem da configuração. Se aparecerem no ambiente, a API recusa a partida com uma mensagem que diz que a variável foi removida no pedido 060. Isso evita que um `.env` antigo religue o mock em silêncio.
- O modo de duas bases sai: uma base, a real. As extensões e a pesquisa fictícias só entram por injeção explícita (testes e `servidor-api-mock.ts`). Uma regra de lint impede `server/src/**` de importar `@metricas-dspd/mock`; a exceção nomeada é o seed e o `limpar-seed`.

**P3. Mapa real e resposta sem dado real:**
- O mapa real passa a ter os 17 ids atuais (O1-O7, O9-O11, O13, EI_FL1, S2, S3, S4, S8, S10) mais **PV1** (Q2 "A": entra agora e mostra "sem pesquisa" enquanto não houver carga) e **BLOQUEADOS** (QV1 "A": a carga real já lê os bloqueios).
- **Métrica fora do mapa real responde "sem dado real" com o motivo.** Ela não chama a biblioteca de cálculo e não devolve número, percentil nem histograma. O motivo vem de `motivoDaOrigemMock(id)` ou, sem motivo próprio, de um texto genérico ("fonte real ainda não definida"). O estado fica no envelope da resposta de métrica, igual para todos os cartões; o formato exato é do node-backend.
- `VISAO_GERAL` fica fora do mapa e responde "sem dado real" (Q4 "A"). O desenho dela com dado real, em dois blocos independentes (BusinessMap e Acelerato), está validado pelo dono (E3.3) e entra pelo plano próprio da Visão Geral (E3.4 a E3.6), sem total comum.
- Nada muda nas métricas reais: a regra dos 20 itens continua (a biblioteca devolve `insuficiente`), e BusinessMap e Acelerato continuam sem se misturar.
- Uma métrica só entra no mapa real pelo plano dela, quando a fonte real existir (como entraram S2, S3, S4, S8 e S10 no plano 056).

### Decisão sobre o achado A3 (webhook do BusinessMap em esquema com seed)

**O receptor do webhook não ganha a guarda do seed. A invariante "seed e dado real nunca no mesmo esquema" vale para quem projeta e para o seed, não para o staging de entrada.** Por quê:

- Hoje não existe consumidor de `bm.webhook.recebido` no worker (ADR 0022, contexto). O que o webhook grava em `stg_webhook_evento` não chega a `dim_*`, `fato_*` nem a métrica nenhuma. A mistura que o dono quer evitar está no cálculo e na base analítica, e essas portas já estão fechadas pelo P1 (coleta e projetor recusam esquema com seed).
- Para conferir o seed, o receptor precisaria ler `ctl_coleta`. O papel `dspd_webhook` só tem `INSERT` em `stg_webhook_evento` e `outbox` e `SELECT (webhook_sk, payload_sha256)` (`server/src/plataforma/db/grants.ts:141-142`, ADR 0020). Dar mais leitura ao papel que fica exposto a quem chama de fora amplia privilégio para proteger uma tabela que nada consome.
- Recusar a entrega (resposta de erro) faz o BusinessMap repetir ou descartar o evento. Num esquema real com seed esquecido, isso perderia evento real, contra a regra de nunca perder histórico.
- O webhook não está exposto (a API escuta em 127.0.0.1, ADR 0014; F7 da ADR 0022 condicionada).

Duas exigências fecham o caso:
1. **O seed conta `stg_webhook_evento` como dado real** (node-backend, junto com os recomendados da E2.12 ou num cartão próprio, se a E2.12 já tiver fechado). Esquema com entrega de webhook não recebe seed. Sem isso, o seed poderia gravar num esquema que só tem eventos reais de webhook; não haveria mistura no cálculo (o projetor recusaria depois), mas os eventos ficariam presos até a limpeza. O seed roda com o papel migrador, que já lê a tabela; não muda grant nenhum.
2. **Todo consumidor futuro de `bm.webhook.recebido`** (a T2.3, F7 da ADR 0022) chama a mesma guarda do projetor (`guarda-seed.ts`) antes de gravar, dentro da trava da fonte. Isso é critério de pronto do plano da F7, conferido pelo tech-lead no review e pelo QA com um teste "consumidor recusa esquema com seed".

## Alternativas

- **Manter o mapa como rótulo, com o selo "Dados fictícios" por cartão (situação anterior).** Não atende: o selo não impedia o número misto do caso A12, e o dono pediu dado real, não um dado fictício identificado.
- **Esconder do painel o cartão sem fonte (Q1 "B").** Recusada pelo dono (Q1 "A"): o cartão fica visível com o estado "Sem dado real" e o motivo, para mostrar o que falta e por quê.
- **Calcular a Visão Geral só com as partes reais agora (Q4 "B").** Recusada (Q4 "A"): ela junta os dois domínios, e o desenho que separa BusinessMap e Acelerato precisava ser validado antes. Foi validado depois (E3.3) e segue pelo plano próprio.
- **Homologação com dado real (Q3 "B").** Recusada (Q3 "A"): a homologação continua demonstração com mock e selo global, em ambiente, volume e porta próprios (ADR 0018), sem tocar a base real.
- **Manter o modo de duas bases com prefixo validado** (fecharia o achado A1 de `docs/security/052-f6-painel.md`). Recusada: preserva o caminho em que o painel de uso diário mostra número do seed. Tirar a variável fecha o A1 de quebra.
- **A3: guarda do seed também no receptor do webhook.** Recusada pelos motivos da decisão: amplia o privilégio do papel exposto, arrisca perder evento real e protege uma tabela que nada consome hoje.
- **A3: não fazer nada.** Recusada: deixaria o seed gravar sobre eventos reais de webhook e não obrigaria o futuro consumidor a conferir o seed.

## Consequências

- Melhora: o painel de uso diário mostra só número calculado sobre a base real; FL2, FL3, sete cartões do FL1 (O8, O12, O14-O18), O19-O26 e oito da sustentação (S1, S5, S6, S7, S9, S11, S12, EI_SUST) passam a "Sem dado real" com o motivo. O caso A12 (número misto) deixa de existir. Nenhum comando grava fictício na base real.
- Piora: o painel fica com muitos cartões sem número até cada fonte real ser planejada (é o efeito pedido). O dono precisa tirar `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED` do `.env` dele (só ele mexe no arquivo), senão a API não sobe. Se a base real ainda tiver o seed de 2026-10-09, a coleta para até o `db:limpar-seed --aplicar`. Os esquemas `seed_` criados pelo passo 4 revogado ficam órfãos: nenhum código os apaga, e o dono decide.
- Consequências em P4 e P5, citadas aqui só como efeito desta decisão; o detalhe fica no plano 060-sem-mock e nos pareceres:
  - P4 (react-frontend com ux-designer): a web lê a API por padrão (`VITE_FONTE` padrão `api`, também no Dockerfile); o cartão fora do mapa mostra "Sem dado real" e o motivo, sem número e sem usar só cor como sinal; a exportação segue igual; `?mock=` vale só com a fonte mock. O mock fica só por `VITE_FONTE=mock` explícito, para testes (Q5 "A"). Quando o dono pedir para subir o sistema, ele sobe com dado real.
  - P5 (devops-engineer e qa-engineer): a homologação declara `VITE_FONTE=mock` e `PG_SEED_URL`; os testes passam a injetar o mock explicitamente; o E2E `@mock` builda com `VITE_FONTE=mock`; os projetos `*-api` verificam que cartão fora do mapa não mostra número.
- Fica a manter: o mapa `METRICAS_ORIGEM_REAL` é a fonte única de "real ou não" na fonte API; o catálogo `CATALOGO_CARTOES.status` vale só no modo demonstração. A dependência de produção do server em `@metricas-dspd/mock` continua por causa do seed, contida pela regra de lint; tirar o seed da imagem fica como melhoria posterior.
- Segurança (`R-SEGURANCA`): banco (P1), configuração de ambiente (P2) e Docker (P4/P5) passam pelo security-engineer. A decisão do A3 não muda grant nenhum.

## Por que o existente não basta

O que existia para a mesma necessidade, e a evidência de que não bastou:
- **A idempotência do seed pela coleta `seed-mock`** era a única guarda do `semear()`. Ela some com o `db:limpar-seed`, e o seed seguinte gravaria tudo de novo na base real. O seed de 2026-10-09 caiu na base real e precisou do comando de limpeza da ADR 0020 (`limpar-seed.ts:11-12`). Daí a guarda nova, que confere coleta real e não só a coleta do seed.
- **O selo "Dados fictícios" e o mapa como rótulo** (`OrigemDosCartoes.tsx:24-34`, `Ficticios.tsx`) mostravam número fictício ou misto com uma marca. O mapa A12 do plano mostra que, na base única, o número saía calculado sobre o dado real com extensões fictícias. Daí o portão na API (P3).
- **O padrão `mock` das variáveis** (`DADOS_FONTE`, `VITE_FONTE`) fazia a API do Compose e a imagem web subirem em mock sem ninguém escolher (A14, W3 do plano). Daí a recusa na partida (P2).
- Para o A3 não entra mecanismo novo no receptor: a guarda que já existe (`guarda-seed.ts`) é reusada pelo seed e pelo futuro consumidor.

## Critério de reversão

O dono pedir número fictício ou modo demonstração no painel de uso diário (fora da homologação e dos testes), ou uma métrica precisar ler a base real e a do seed ao mesmo tempo. Para a decisão do A3: aparecer um consumidor de `bm.webhook.recebido` em produção sem a guarda do seed, ou um evento de `stg_webhook_evento` gravado num esquema com seed chegar a `dim_*` ou `fato_*`. Nesses casos, a guarda passa para o receptor.

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-12-02 | Pedidos do dono por mock no painel de uso diário; métricas que precisaram de duas bases; consumidores de `bm.webhook.recebido` sem a guarda do seed (review e `rg guarda-seed` no worker) | pendente |

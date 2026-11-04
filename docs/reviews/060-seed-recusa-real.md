---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-seed-recusa-real
commit: 63a9d91e8af463757dd373580330f7dc5a7660a8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 060-triagem-dependabot, P1 do plano 060-sem-mock (E2.4, K-195)

**Rodada 1. Veredito: aprovado em `63a9d91`.** O diff `d05bbfc...63a9d91` (commits `ac333ed`, `b032aaf`, `63a9d91`) cumpre o item P1 de `docs/architecture/060-sem-mock.md`. Nenhum bloqueante. Quatro recomendados (A1 a A4), que não devolvem.

## O que foi lido
- `server/src/plataforma/db/guarda-seed.ts`: três contadores só de leitura, com o esquema validado por expressão (`^[a-z][a-z0-9_]*$`) antes de entrar no SQL e o prefixo `seed-mock` passado como parâmetro. `versao_coletor` nula conta como coleta real (falha fechada). A mensagem traz só tabela e contagem, sem dado de pessoa (ADR 0020).
- `server/src/plataforma/db/seed.ts:236-244`: a recusa roda depois do `pg_advisory_xact_lock` da trava `dspd:seed` e antes do primeiro `SELECT ... WHERE versao_coletor = $1` e de qualquer `INSERT`, na mesma transação. Confere os dois esquemas antes de gravar em qualquer um deles, então coleta real só no Acelerato também barra o BusinessMap. `VERSAO_SEED` passa a vir do `PREFIXO_COLETA_SEED`, e `seed-mock-coleta` começa pelo mesmo prefixo, então o `ja_semeado` continua passando.
- `server/src/plataforma/db/seed-cli.ts`: só `PG_SEED_URL`, sem cair em `PG_MIGRADOR_URL`, e a mensagem de erro não leva a URL.
- Saída do `db:seed`: o script sai do `package.json` da raiz, e o ramo `seed` sai do `scripts/db.sh`, junto com o texto de uso. Os chamadores restantes (`homolog:subir`, `restauracao.yml`, `com-api-mock.sh`) passam a definir `PG_SEED_URL`. A conferência de chamadores é do parecer de devops (`docs/devops/060-seed-recusa-real.md`), que não refaço.
- Recusas `esquema-com-seed`: a coleta do BusinessMap (`coleta.ts:253`, dentro da trava da fonte pelo `coleta-comando.ts:103`) e o worklog (`apontamento/coleta.ts`) recusam antes do `fecharInterrompidas`, que é a primeira escrita. O projetor do BusinessMap e o do Acelerato recusam dentro da transação, antes do `INSERT` em `ctl_coleta`. A coleta do Acelerato (`coletor.ts:169`) recusa antes do `try`, então não grava o registro de falha. O `dspd_coletor` tem `SELECT` inteiro em `ctl_coleta` dos dois esquemas (`grants.ts`), então a consulta da guarda não esbarra em GRANT por coluna.
- BusinessMap e Acelerato seguem separados: cada recusa lê só o próprio esquema, e o seed confere cada esquema com a própria tabela de itens.
- Testes: `guarda-seed.test.ts` (parâmetro, identificador inválido, mensagem), `esquema-com-seed.test.ts` (as cinco entradas recusam sem escrever, as transações terminam em `ROLLBACK`, a API do BusinessMap não é chamada e o MySQL não é aberto), `seed.duble.test.ts` (ordem entre a trava e a recusa, sem `INSERT`) e `seed-recusa-real.pg.test.ts` contra PostgreSQL. Esse último cobre os quatro casos do plano: seed aceito em esquema vazio e idempotente, seed recusado com coleta real (no BusinessMap, só no Acelerato, depois do seed e por card de coleta real), coleta e projetor recusados sobre o seed sem mudar `ctl_coleta` nem `ctl_coleta_falha`, e o CLI sem `PG_SEED_URL` falhando na partida mesmo com `PG_MIGRADOR_URL`, sem a URL na saída. O `cli.test.ts` limpa `PG_SEED_URL` e `PG_MIGRADOR_URL` no `beforeEach`, então o caso da recusa não herda variável de outro teste.
- Práticas (`docs/engineering/praticas.md`, seções 2 e 3 para o que o diff alcança): sem `any` novo (os `as never` ficam só nos testes, para montar as dependências parciais), erro de domínio tipado (`ErroSeedEmBaseReal`, código novo nas uniões fechadas), sem `catch` vazio. Sem migração, então não há revisão de modelagem.
- Documentação: `README.md`, `docs/architecture/server.md` (o passo 4 foi revogado, como o plano pede), `homologacao.md` e `.env.example` foram atualizados na mesma entrega.

## Ferramentas, teto e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". A pendência do tech-lead com o arquiteto continua, a mesma do `059-alfa.md`, e não fiz review manual de lint nem de formatação. Cito o autor, sem refazer: `pnpm run pronto` deu rc=0 e o `test:pg` passou com 33 arquivos e 231 testes no `63a9d91`, rodados fora do sandbox por causa da trava em `/tmp`.
- Decisão M14: `git diff --numstat --no-renames d05bbfc...63a9d91` dá **350 linhas**, sem o `.md`: 125 de código, script e configuração e 225 de teste. O comportamento é um só, a invariante "seed e coleta real nunca dividem o esquema" vista pelos dois lados. O dono decidiu que o P1 vai num PR próprio (2026-11-02, "A"). Aceito a exceção. O PR da E2.7 leva no corpo `teto: excedido, <n> linhas, P1 do plano 060-sem-mock: seed e coleta real nunca dividem o esquema (as duas recusas e a saída do db:seed), PR único por decisão do dono`, com o `<n>` recontado na abertura. Se o PR sair sem essa linha, o teto vira achado bloqueante.
- Devops: `docs/devops/060-seed-recusa-real.md` (workflow de restauração, `homolog:subir`, scripts), que cito sem refazer. Segurança: o parecer da E2.5 (banco e configuração) é do security-engineer, ainda não estava na branch quando fiz esta leitura, e fica fora deste review.

## Achados
- A1 (recomendado) server/src/plataforma/db/seed.ts:236 · O seed trava `dspd:seed` e a coleta usa a trava da fonte. Um seed e uma coleta simultâneos no mesmo banco passam os dois pela guarda e misturam. Hoje o risco é baixo, porque o PG_SEED_URL nunca aponta para a base real. Sugestão: a coleta e o projetor tomam também a trava dspd:seed.
- A2 (recomendado) server/src/modulos/acelerato/coletor.ts:169 · A guarda do Acelerato roda fora do comTravaDaFonte e do try (sem d.log), enquanto a do BusinessMap roda dentro da trava. Sugestão: alinhar a posição nas duas fontes e registrar a recusa no log com o código.
- A3 (recomendado) server/src/modulos/businessmap/webhook.ts:46 · O webhook segue gravando stg_webhook_evento num esquema com seed, e a guarda do seed não conta essa tabela. Isso fica fora do item P1 do plano. Sugestão: o arquiteto decide no P2 ou no P5 se o webhook entra na invariante.
- A4 (recomendado) server/src/plataforma/db/seed.ts:240 · A variável cards também guarda a contagem de dim_chamado do Acelerato. Sugestão: renomear para itens.

## Parecer
Aprovado. O seed recusa esquema com coleta real dentro da trava e antes de escrever, exige `PG_SEED_URL`, e o `db:seed` sai da raiz e do `db.sh`. A coleta e o projetor das duas fontes recusam esquema com seed antes de qualquer escrita, e os testes cobrem os casos do plano contra PostgreSQL. A1 a A4 são recomendações que não devolvem. Condição do PR (E2.7): a linha `teto: excedido` no corpo. O QA (E2.6) pode começar.

---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-guardas-seed
commit: b1104f3b9c148aa40bd870a21a49f77a8dd55476
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-03
---
# Review: 060-triagem-dependabot, guardas do seed separadas da API (E2.24, K-195)

**Rodada 1. Veredito: aprovado em `b1104f3`.** O diff `3c284ff...b1104f3` (um commit, 11 arquivos) é o reforço das guardas do seed separado da branch da API pelo A1 do review `060-api-so-real` (ac077c5). Não há bloqueante. Há um recomendado (A1), que não devolve a entrega.

## O que foi lido
- `server/src/plataforma/db/guarda-seed.ts`: `tomarTravaDoSeed` centraliza o `pg_advisory_xact_lock(hashtext('dspd:seed'))`, que antes ficava como literal no seed. `contarEventosDeWebhook` conta `stg_webhook_evento` com o esquema validado pelo mesmo `ident` (o teste cobre a recusa de identificador inválido). A tabela existe no esquema do BusinessMap (`server/migrations/0004_bm_staging.ts`).
- `server/src/plataforma/db/seed.ts:228-246`: o seed conta os eventos de webhook só no alvo do BusinessMap (`webhook: true`), na mesma transação, depois da trava e antes de qualquer `INSERT`. A mensagem traz só tabela e contagem. A variável `cards` virou `itensReais` (A4 do review do P1). Isso cumpre o item 1 da decisão sobre o A3 da ADR 0026. `server/src/modulos/businessmap/webhook.ts` não muda, então o receptor não ganha guarda, como a ADR decide.
- Guardas da coleta: `exigirEsquemaSemSeed` das duas fontes toma a trava `dspd:seed` antes de contar (A1 do review do P1). A versão `...NoPool` abre uma transação curta para a coleta do BusinessMap (`coleta.ts:257`), para o worklog (`apontamento/coleta.ts:247`) e para a coleta do Acelerato (`coletor.ts:175`). Os projetores seguem chamando a guarda dentro da própria transação, e a trava vale até o commit.
- Acelerato (A2 do review do P1): a guarda passou para dentro de `comTravaDaFonte`, igual à do BusinessMap. A recusa vai ao log só com o código e sai antes do `registrarFalha`, então nem a linha de falha entra num esquema com seed.
- BusinessMap e Acelerato seguem separados: cada guarda lê só o próprio esquema, e a trava compartilhada só serializa, sem juntar dado.
- Testes: `esquema-com-seed.test.ts` afirma a ordem exata (`BEGIN`, trava, guarda, `ROLLBACK`; no Acelerato, primeiro a trava da fonte e por último a soltura) e zero escrita nas cinco entradas. Há um caso novo para a trava da fonte ocupada. `seed.duble.test.ts` e `seed-recusa-real.pg.test.ts` cobrem a recusa por evento de webhook com a mensagem exata, sem gravar nada e com o evento intacto. `guarda-seed.test.ts` cobre o contador novo. O dublê do Acelerato aceita o `pg_advisory_xact_lock`.
- Práticas (`docs/engineering/praticas.md`, seções 2, 3 e 4 para o que o diff alcança): não entra `any` novo (`as never` só nos testes), o erro de domínio é tipado e não há `catch` vazio. Não há migração nem GRANT novo: o seed lê com o papel migrador.

## Escopo e teto (M14)
- Um comportamento só: o reforço das guardas do seed (trava comum, posição da guarda do Acelerato e webhook contado pelo seed), que são os recomendados A1, A2 e A4 do review do P1 mais o item 1 do A3 da ADR 0026. O código da API não entra.
- `git diff --numstat --no-renames 3c284ff...b1104f3`: 103 adições e 25 remoções, 128 linhas de código e teste, dentro do teto de 150.

## Ferramentas (citadas, não refeitas)
- `npx vitest run --maxWorkers=4 tests/esquema-com-seed.test.ts tests/guarda-seed.test.ts tests/seed.duble.test.ts tests/acelerato` (em `server/`): 12 arquivos passaram e 2 foram pulados, 216 testes passaram e 10 foram pulados. O `seed-recusa-real.pg.test.ts` só roda com PostgreSQL e fica para o `test:pg` da CI do PR.
- `npx tsc --noEmit -p server`: código de saída 0.
- `pronto` e `test:pg` não rodaram aqui, por restrição do brief. Ficam para a CI do PR (E2.27).
- O parecer de segurança (E2.25, `docs/security/`) e o QA (E2.26, `docs/qa/`) são etapas próprias. Não os refaço.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/coleta.ts:257 · Na coleta (BM, worklog e Acelerato em coletor.ts:175), a trava dspd:seed solta no commit da transação curta, antes da 1ª escrita. Um seed nessa janela ainda passa. O projetor recusa depois, então o cálculo não mistura. Sugestão: anotar o limite no comentário de tomarTravaDoSeed.

## Parecer
Aprovado. O seed conta `stg_webhook_evento` (A3 da ADR 0026) e o receptor do webhook fica como está. A coleta do Acelerato, a do BusinessMap e a do apontamento recusam esquema com seed sob a trava `dspd:seed`, e a do Acelerato faz isso dentro da trava da fonte e sem gravar falha. Os testes cobrem cada recusa. A branch traz um comportamento só e fica dentro do teto de linhas. O A1 é recomendação e não devolve a entrega. A segurança (E2.25) e o QA (E2.26) podem seguir.

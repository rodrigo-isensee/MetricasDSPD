---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4c-colunas-grant
commit: ea3b51b5ad99a67e3a244395d62ef99e5200cb3a
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: lote 4c do pedido 075 (colunas e GRANT de bloqueio, CA-075-1 ponta a ponta)

Propósito: conferir o diff `3ae2d53d...ea3b51b5` (5 arquivos, +104 -3) contra os controles 3 e 4 do plano e do modelo de ameaças (`docs/security/075-modelo-ameacas.md`), SEG-A3, SEG-A4, CA-075-4 e CA-075-5. Público: tech-lead, node-backend, qa-engineer. Revisão estática; nada foi alterado em código.

## Gatilhos
Banco e projeção lida pela API (`R-SEGURANCA`): o lote só acrescenta testes sobre `fato_bloqueio`, `evt_bloqueio` e os GRANTs; o único diff em `src/` é comentário (`projetor.ts:26` e `:274`).

## Resultado por controle
- **SEG-A4, colunas escritas no teste e comparadas com o catálogo: conforme.** `bloqueio-colunas-grant.pg.test.ts` lista as colunas de `evt_bloqueio` e `fato_bloqueio` à mão e compara, em ordem, com `information_schema.columns` do banco migrado inteiro. Conferi a lista contra `0005_bm_historico.ts:49-53` e `0006_bm_projecoes.ts:32-36` mais as colunas padrão do `R(...)` e do `PROJ`: bate. Coluna nova (por `ALTER` de qualquer forma ou por migração nova) reprova o teste. Roda na CI com banco (`describe.skipIf(!url)`); aqui não rodou (sem banco de teste).
- **CA-075-4, estático de `ALTER TABLE`: conforme no caso comum, com folga.** O teste cobre as migrações posteriores à `0006` (`up` e `down`, todas em `MIGRACOES`) e reprova `ADD COLUMN` de `bloqueado_por`, `comentario` e `observacao` em `ALTER TABLE <esquema>.fato_bloqueio|evt_bloqueio`; o ok-caso (`dim_card`) passa. A regex não pega `ALTER TABLE ONLY`, `ALTER TABLE IF EXISTS` nem lista de tabelas (rodei a regex isolada: as três formas dão `false`). Como o teste do catálogo acima reprova a coluna do mesmo jeito, é folga e não furo: A1.
- **CA-075-5, `gerarGrants` fixado: conforme.** Compara com os quatro GRANTs esperados em literal (`stg_`/`evt_` só `SELECT, INSERT` ao coletor; `fato_bloqueio` com `UPDATE, DELETE` ao coletor e `SELECT` à API), sobre catálogo sintético. Troca de regex (`PROJECAO`, `IMUTAVEL`) ou GRANT novo à API muda a lista e reprova. `dspd_api` com `42501` em `evt_bloqueio` e `stg_bloqueio` está no `.pg`, por `SELECT 1` e `SELECT card_id`; o banco real está sem GRANT algum a eles (`grants.ts:54`, sem diff).
- **CA-075-1 ponta a ponta (SEG-A3): conforme.** Card com `block_reason {reason_id: 7, label, comment, user_id}` passa por `gravarStgCard` e `projetarBusinessMap`; o marcador não aparece em nenhuma `stg_*`, `evt_bloqueio`, `fato_bloqueio`, `ctl_coleta_falha` nem `ctl_coleta_contagem` (conferi o SQL: nas tabelas fora de `stg_card` conta qualquer linha com o marcador, e em `stg_card` a linha do card do teste, depois do ajuste de `ea3b51b5`), `user_id` não está no payload do card, e `evt_bloqueio.motivo_codigo` fica `'7'`. Reprova de fato se a allow-list deixar passar `label`, `comment` ou `user_id`. Limite: a saída é capturada em `process.stdout.write` e `process.stderr.write`, e sob vitest o `console.*` não passa por aí (A2); o projetor e o derivador não registram log hoje, então não há vazamento, só teste cego a ele.
- **Fronteira real de `block_reason_id` (observação do autor): não é achado de gravidade; recomendação baixa (A3).** `allow-list.ts:99` copia `reason_id` quando é escalar, e `ehEscalar` (`:12-13`) aceita string de qualquer tamanho. Texto livre ali chegaria ao `stg_card` como veio, e o CA-075-10 (`codigoDe`, só dígitos de 1 a 10) barra o caminho a `evt_bloqueio`, a `fato_bloqueio`, às contagens e à falha (`bloqueios.ts:58-60`). Contra a regra do projeto (nome, e-mail, `usuarioKey`, descrição e título nunca chegam ao staging, dito do Acelerato; a lista fechada vale na fronteira): `reason_id` é o id inteiro do motivo na API do BusinessMap, não campo de pessoa nem de texto livre; o texto está em `label` e `comment`, que a allow-list já descarta. Texto só entraria se a fonte violasse o contrato da própria API; ninguém de fora escolhe esse valor. O `stg_card` não é lido pela API (`IMUTAVEL`, fora do GRANT do `dspd_api`; mesmo `42501` do teste). Sem caminho de ataque realista, portanto fica como endurecimento da allow-list, fora deste lote (a regra deste lote é sem diff em `allow-list.ts`).
- **Sem diff** em `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos` (conferido por `git diff --stat` do intervalo). Sem GRANT novo, sem coluna nova, sem migração.
- **Testes:** `bloqueio-colunas-grant.test.ts`, 3 passados (vitest, 2 workers), e o teste de `projetor-businessmap.test.ts` do 4c lido no diff. Os `.pg` valem pela CI do push (verde segundo o brief). Suíte inteira é do QA.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não rodados aqui; sem dependência nova no diff, ficam com o CI.

## Achados
- A1 (recomendado) server/tests/bloqueio-colunas-grant.test.ts:7 · a regex do CA-075-4 não pega ALTER TABLE ONLY, ALTER TABLE IF EXISTS nem lista de tabelas; o teste do catálogo no .pg cobre, então é folga. Aceitar "(ONLY\s+|IF EXISTS\s+)?" e ", " entre tabelas na regex.
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:114 · a captura de saída do CA-075-1 espia process.stdout.write e process.stderr.write; sob vitest o console.* não passa por aí. Espiar também console.log, console.warn e console.error (hoje o projetor não loga).
- A3 (recomendado) server/src/modulos/businessmap/allow-list.ts:99 · block_reason_id copia qualquer escalar, inclusive string longa; só o stg_card o recebe, sem leitura pela API. Aceitar só número inteiro ou string de dígitos até 10 em lote futuro com teste.

## Plano em cartões
Nenhum bloqueante. A1 e A2 ao node-backend (testes) e A3 ao node-backend, em lote futuro que toque a allow-list, se o tech-lead concordar.

## Riscos aceitos
Nenhum.

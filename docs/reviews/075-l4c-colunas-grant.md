---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4c-colunas-grant
commit: ea3b51b5ad99a67e3a244395d62ef99e5200cb3a
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 075 L4c, colunas e GRANT de bloqueio (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 4c" de `docs/analises/075-plano.md` pede, sem contrato, migração nem versão de critério, e traz o CA-075-1 ponta a ponta e os itens (1) a (4) da decisão técnica de 2026-11-07 12:56. Os dois achados abaixo são recomendados e não devolvem.

## O que foi lido (diff `3ae2d53d...ea3b51b5`, 2 commits, 5 arquivos)

- **SEG-A4** (`bloqueio-colunas-grant.pg.test.ts`): lista de colunas de `evt_bloqueio` e `fato_bloqueio` escrita à mão e comparada, em ordem, com `information_schema.columns` do banco migrado. Coluna nova por qualquer caminho reprova. Atende ao plano (não derivada da migração).
- **CA-075-4** (`bloqueio-colunas-grant.test.ts`): reprova `ALTER TABLE` sobre as duas tabelas em `up` e `down` das migrações posteriores à `0006`, com mínimo de itens (`> 0`), caso ruim com `bloqueado_por`, `comentario` e `observacao` (4 reprovações) e caso bom em `dim_card`. Reprova o que diz.
- **CA-075-5**: `gerarGrants` fixado em literal nos quatro GRANTs de bloqueio; `dspd_api` com `42501` em `evt_bloqueio` e `stg_bloqueio` no `.pg`. GRANT novo ou troca de classe reprova.
- **CA-075-1 ponta a ponta**: `label`, `comment` e `user_id` do `block_reason` passam por `gravarStgCard` e `projetarBusinessMap`; o marcador não aparece em `stg_*`, `evt_bloqueio`, `fato_bloqueio`, `ctl_coleta_falha` nem `ctl_coleta_contagem` (mínimo de tabelas `> 8`), nem na saída capturada; `motivo_codigo` fica `'7'`. Reprova se a allow-list deixar passar os campos. O ajuste de `ea3b51b5` restringe a varredura de `stg_card` ao card do teste, o que mantém a prova (o card do teste é o que leva o marcador).
- **Itens da decisão de 12:56:**
  - (1) A1 do review do 4b: comentários de `projetor.ts:26` e `:274` corrigidos (fato atualizado em fim, duração e motivo, nunca apagado).
  - (2) A2 do review do 4b: `.pg` com bloqueio aberto que fecha na projeção seguinte; `atualizado_por_coleta_id` muda só na linha do card `a`, o `b` fica com a coleta da primeira projeção.
  - (3) A1 do QA do 4b: versão de 2026-10-21 na coluna 10 (entrega até 2026-10-31) fecha o bloqueio; o mutante M6 (vigência sempre em 2099) deixa de fechar e o teste reprova.
  - (4) A3 do QA do 4b: o dublê agora reprova M5 (sem `i.tipo = 'inicio'`) e M13 (`motivo` fora do SET) e confere os motivos mapeados enviados ao UPDATE.
- **Recomendados da segurança do 4c** (`docs/security/075-l4c-colunas-grant.md`, citado, não refeito): A1 (regex do `ALTER TABLE` com `ONLY`, `IF EXISTS` e lista) e A2 (espiar também `console.*`) são só de teste e cabem no lote 6a (node-backend, estimativa 100, margem 50), como os recomendados anteriores entraram no 4b e no 4c. A3 (`block_reason_id` só dígitos) muda `allow-list.ts`, é outro comportamento e tem gatilho de segurança: não cabe em 6a, 6b nem 9b; vai a lote próprio, com cartão.
- **Teto:** 104 adições + 3 remoções = 107 linhas de código e teste contra a ponta do 4b, dentro de 150. Um comportamento (fechar por teste colunas e GRANT), mais os recomendados destinados por decisão técnica.
- **Sem diff** em `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos` (`git diff --stat` do intervalo: só `projetor.ts`, comentário, e quatro arquivos de teste).
- **Desvio declarado** (segundo push com `| tail -3`, rc 0): o rc do pipe é o do `tail`, não o do `git push`; a prova vale porque a remota confere `ea3b51b5` (o `ls-remote` do autor e o `git fetch` deste review). Aceito; o comando puro segue como regra.
- **CI do push no head revisado:** run 42391385262 em `ea3b51b5`, verde, com o job `banco` rodando `bloqueio-colunas-grant.pg.test.ts` (4 testes) e `projetor-bloqueio.pg.test.ts` (8 testes) passados. A falha do run 42390486613 (`598c96b9`) é a varredura que `ea3b51b5` corrigiu.
- **Testes dos arquivos tocados (D-5):** `bloqueio-colunas-grant.test.ts` e `projetor-businessmap.test.ts`, 20 passados (vitest, 2 workers). Os `.pg` valem pela CI.
- **Pendência herdada:** TL-A6 (tempo da projeção e `EXPLAIN` do fato, ADR 0003) segue sem PostgreSQL local; vai à prova do dono no 6b, pela decisão de 12:56.

## Achados

- A1 (recomendado) server/tests/projetor-businessmap.test.ts:283 · M5 e M13 são provados pelo texto do SQL que o dublê recebe (regex e `toContain`); pega a remoção, mas reprova também reescrita equivalente. A prova de comportamento segue no `.pg`. Aceito como está.
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:135 · o caso que fecha confere só `duracao_horas_uteis` não nulo; um valor errado passa. Fixar o valor esperado pelo calendário do teste no próximo lote que tocar o arquivo.

---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t8-sprint-real
commit: 453348a218247c5f9ca0e451a99cc210366c3db5
parecer: aprovado
revisor: security-engineer
data: 2026-11-17
---

# Segurança do T8 com dado real (E7.529)

## Resumo
Diff 808a163c..453348a2 lido nas partes de segurança: fronteira do coletor, migração 0042 (TS e deploy/sql), GRANTs e leitura da API. Sem achado bloqueante.

- **Fronteira do coletor:** `server/src/modulos/businessmap/allow-list.ts` não muda nesta branch. `first_start_time`/`first_end_time` já estavam na allow-list 4a (linha 21) e `linked_cards` já era reduzido a `card_id` e `link_type` (linhas 212 e 230). O normalizador (`normalizador.ts:372-389`) só lê `type_id`, `linked_cards[].card_id`, `linked_cards[].link_type` e as duas datas. Não lê título, pessoa nem texto livre.
- **Migração 0042** (`server/migrations/0042_bm_sprint.ts`, `deploy/sql/0042_bm_sprint.sql`): as duas tabelas guardam só ids (com CHECK de ASCII imprimível), instantes, um booleano e o id da coleta. Não há coluna de pessoa nem título. `fato_sprint_filho` é append-only, com gatilhos que barram UPDATE, DELETE e TRUNCATE, e a releitura não duplica (`ON CONFLICT DO NOTHING`). `sistema_origem` fica preso a `businessmap`, sem mistura com o Acelerato.
- **GRANTs** (`grants.ts:57-58,113`, `deploy/sql/9000_grants.sql`): `dspd_coletor` tem SELECT/INSERT/UPDATE/DELETE em `dim_sprint` (projeção refeita, como `dim_card`) e SELECT/INSERT em `fato_sprint_filho`. `dspd_api` tem só SELECT nas duas. Isso bate com o detalhe do pedido. Sem coluna de pessoa, o GRANT de tabela inteira à API não expõe nada além de ids e datas.
- **Leitura** (`repositorio.ts:72-78`): SQL estático, sem entrada do usuário interpolada (só o nome do esquema, que vem da configuração).

Suíte: não há PR para a branch. A suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. O teste unitário do normalizador não rodou aqui porque o sandbox não permite escrever o cache do vite. Lacuna registrada: o QA cobre o teste em test:pg.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/projetor.ts:314 · `dim_sprint` é apagada e reinserida por card. A janela de uma Sprint que muda no BusinessMap só sobrevive no staging append-only. É aceitável como projeção (mesmo padrão de `dim_card`), sem caminho de ataque; só registro.

## Plano em cartões
Nenhum cartão obrigatório.

## Riscos aceitos
Nenhum.

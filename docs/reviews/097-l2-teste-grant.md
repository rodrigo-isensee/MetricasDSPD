---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/097-l2-teste-grant
commit: 061143ec29bd60f3907440bb6edbd7b1f1bc7d3b
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: teste do GRANT de dim_card sem responsavel_id (097 L2, E4.4)

Classe T (só teste). Diff lido: `git diff 4b1e3122 061143ec`, um arquivo, `server/tests/apontamento-rota.pg.test.ts` (+1 −1, linha 253).

## O que foi conferido
- **Causa:** `dim_card` não tem `responsavel_id` (`server/migrations/0006_bm_projecoes.ts:13-26`; nenhuma migração posterior acrescenta coluna a `dim_card`). `responsavel_id` é de `dim_responsavel` (`server/migrations/0020_bm_dim_responsavel.ts`). O `SELECT` dava 42703 (coluna inexistente) e não 42501, então a asserção não provava permissão nenhuma: tirá-la não afrouxa a prova.
- **A prova continua provando que o papel da aba não lê pessoa de `dim_card`:** a única coluna de pessoa de `dim_card` em `COLUNAS_PESSOA` é `responsaveis` (`server/src/plataforma/db/lgpd.ts:12`), e ela segue na lista com 42501. `card_pai` segue como coluna fora do GRANT. O GRANT do papel da aba em `dim_card` é `card_id, titulo, tipo, equipe` (`server/src/plataforma/db/grants.ts:17`), e o caso afirma o positivo (`SELECT equipe` resolve) ao lado dos negativos.
- **Escopo:** só a linha do teste; código, migração e GRANT intocados.
- **Ferramentas:** o `.pg` roda só no CI (sem PostgreSQL de teste local). No commit 061143ec o run 43127372329 foi cancelado (sobreposto pelo push do parecer do QA); o run 43127744522 em ceb799ad (mesmo teste, só o parecer do QA a mais) estava em andamento na hora do review, com `banco` ainda rodando. O merge espera o `banco` verde no PR.

## Achados
- A1 (recomendado) server/tests/apontamento-rota.pg.test.ts:253 · a lista de colunas proibidas é escrita à mão e divergiu do esquema; derivá-la de `COLUNAS_PESSOA` (prefixo `dspd_bm.dim_card.`) faria a prova acompanhar coluna de pessoa nova e não citar coluna inexistente.

## Veredito
**Aprovado** em 061143ec29bd60f3907440bb6edbd7b1f1bc7d3b: a asserção removida testava coluna inexistente (42703) e não provava nada; a coluna de pessoa real de `dim_card` (`responsaveis`) continua provada com 42501. Sem bloqueante; o job `banco` do CI é a prova de execução, pendente na hora do review.

---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k282-grant-colunas-pessoa
commit: 72b9892823876ffac0d2f1f4a98d40a259ccb81d
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: provas de GRANT derivadas de COLUNAS_PESSOA (097, K-282, E4.6)

Classe T (só testes). Diff lido: `git diff aa2c3c01d166 72b9892823876ffac0d2f1f4a98d40a259ccb81d`, três arquivos (+39 −7): `server/tests/pg/colunas-pessoa.ts` (novo), `server/tests/apontamento-rota.pg.test.ts`, `server/tests/projetor-businessmap.pg.test.ts`. Nada de produção mudou (`server/src/`, migrações e GRANT intocados).

## O que foi conferido
- **Helper claro e reutilizável:** `colunasDePessoa(chave)` filtra `COLUNAS_PESSOA` (`server/src/plataforma/db/lgpd.ts:11-24`, fonte única que o próprio `grants.ts` importa) pela chave `schema.tabela` sem prefixo de teste e falha se a tabela não tiver coluna listada. `provarSemPessoa` confere no catálogo (`information_schema.columns`, lido pelo dono) que cada coluna existe e exige 42501 exato do papel; 42703 ou leitura permitida derrubam a prova com mensagem que nomeia a coluna.
- **Provas mais fortes:** a falha vista no PR 337 (asserção sobre coluna inexistente) agora quebra a prova em vez de passar despercebida. Em `projetor-businessmap.pg.test.ts`, `dim_responsavel` passa a provar as três colunas de pessoa (`responsavel_id`, `responsavel_nome`, `pessoa_ref`) para o `dspd_api`, onde antes só `responsavel_id`; os `SELECT *` seguem.
- **Coerência com o GRANT:** o papel da aba lê `dim_card` só em `card_id, titulo, tipo, equipe` (`server/src/plataforma/db/grants.ts:17`) e lê `dim_responsavel.pessoa_ref` e `responsavel_nome` por desenho (`grants.ts:18`); o diff aplica `provarSemPessoa` à aba só em `dim_card` e `dim_card_versao`, que é o correto. `card_pai` segue como guarda própria, com comentário de que não é coluna de pessoa.
- **Lista `negados` (`apontamento-rota.pg.test.ts:156`):** usa `colunasDePessoa` sem a checagem de existência, mas a asserção `toBe('42501')` já recusa 42703, então não afrouxa.
- **Ferramentas:** `tsc --noEmit -p server` rc=0 (o `tsconfig` inclui `tests`); `eslint` nos três arquivos rc=0. O `.pg` roda só no CI (sem PostgreSQL de teste local); o merge espera o job `banco` verde no PR.
- **Parecer do QA:** `docs/qa/097-k282-grant-colunas-pessoa.md` (commit 33bf338d), citado, não refeito.

## Achados
- A1 (recomendado) server/tests/papeis.pg.test.ts:28 · ainda há provas de pessoa à mão em outros .pg (papeis.pg:28, apontamento.pg:91-92, projetor-businessmap-qa.pg:163, apontamento-rota.pg:181 e 317); migrar para provarSemPessoa num cartão próprio, fora deste diff.

---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: test/k283-provas-pessoa-helper
commit: df78e1a65fe2646b5b7653b208b608679454743f
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: provas de pessoa dos testes .pg pelo helper provarSemPessoa (097, K-283, E3.2)

Classe T (só testes). Diff lido: `git diff origin/develop...df78e1a65fe2646b5b7653b208b608679454743f`, um commit, quatro arquivos (+9 −6): `server/tests/apontamento-rota.pg.test.ts`, `server/tests/apontamento.pg.test.ts`, `server/tests/papeis.pg.test.ts`, `server/tests/projetor-businessmap-qa.pg.test.ts`. Nada de produção mudou (`server/src/`, migrações e GRANT intocados).

## O que foi conferido
- **Cobre o A1 do review do K-282** (`docs/reviews/097-k282-grant-colunas-pessoa.md`): os seis pontos listados (papeis.pg:28, apontamento.pg:91-92, projetor-businessmap-qa.pg:163, apontamento-rota.pg:181 e 317) passaram a `provarSemPessoa`; nenhum ficou de fora.
- **Nenhuma prova mais frouxa:** cada troca é superconjunto da asserção antiga. O helper exige 42501 exato em toda coluna de `COLUNAS_PESSOA` da tabela e falha se a coluna não existir no catálogo. `dim_responsavel` passa de uma coluna (`pessoa_ref` ou `responsavel_nome`) às três; `dim_card`, `fato_apontamento` e `apt_pessoa_time` mantêm a mesma coluna, agora com a checagem de existência. Os `SELECT *` e `count(*)` de cada bloco seguem.
- **Uso do helper:** o papel certo em cada chamada (`api` = `dspd_api`; o `dono` só lê `information_schema`); o schema com prefixo (`S.bm`, e `E.bm` no QA do projetor, coerente com o resto daquele arquivo). Imports pelo mesmo caminho `./pg/colunas-pessoa.js`; nomes sem mudança.
- **Ficaram à mão, por desenho:** apontamento-rota.pg:151 (`responsavel_id` negado à aba, que lê `pessoa_ref` e `responsavel_nome` por GRANT; o helper exige todas negadas e não se aplica); coleta-businessmap.pg:197 já prova as colunas e ainda a ausência de qualquer privilégio no catálogo, que é mais forte.
- **Ferramentas:** `tsc --noEmit -p server` rc=0; `eslint` nos quatro arquivos (rodado de `server/`) rc=0. Os `.pg` rodam só no CI (sem banco de teste local); o merge espera o job `banco` verde.
- **Parecer do QA:** `docs/qa/097-k283-provas-pessoa-helper.md` (commit 5bb4e47e, aprovado), citado, não refeito.

## Achados
- A1 (recomendado) server/tests/metricas.pg.test.ts:72 · ainda prova à mão `dim_card.responsaveis` para o dspd_api, com `toThrow(/permission denied/)`; não estava no A1 do K-282. Passar a `provarSemPessoa(api, dono, 'dspd_bm.dim_card', E.bm)` num cartão próprio.

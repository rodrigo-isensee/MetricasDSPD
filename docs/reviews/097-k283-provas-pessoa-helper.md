---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: test/k283-provas-pessoa-helper
commit: affd76f5a660a1c538c2f4f4b8f74030a0e0fb9f
parecer: aprovado
revisor: tech-lead
data: 2026-11-14
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

## Revalidação sobre `affd76f5` (2026-11-14, E4.55)
Junção da `develop` (`62823ca0`, K-299) na branch; o parecer acima valia para `df78e1a6`. **Veredito mantido: aprovado.**
- **Delta lido:** `forge-check parecer delta docs/reviews/097-k283-provas-pessoa-helper.md` (intervalo `df78e1a6..affd76f5`, sem o que veio da base) listou só `server/tests/apontamento.pg.test.ts`, hunks 303 e 323: `quantas: 4` → `5` no down da 0032, que é a mudança da 0036 (D3) vinda da develop, não do K-283. `git show --remerge-diff affd76f5` vazio: merge automático, sem resolução de conflito.
- **K-283 igual ao aprovado:** as linhas `+`/`-` de `git diff 62823ca0 affd76f5 -- server` são idênticas às de `df78e1a6` contra a base dele (`diff` sem saída); os quatro arquivos seguem com o helper (`provarSemPessoa`: apontamento-rota.pg 5, apontamento.pg 3, papeis.pg 2, projetor-businessmap-qa.pg 2 ocorrências, import incluso).
- **Testes .pg novos da develop** (`git diff 02272442 62823ca0 -- server/tests`: alvos-acelerato, calendario-referencia, acelerato-reprojecao-etapas do K-308, o25-real-a3, projetor-businessmap C2a/C8a, dominio-businessmap e outros): nenhuma prova de pessoa à mão. Os `42501` novos são negação de escrita (`UPDATE`/`DELETE` em `ref_calendario_turno` e `ref_alvo_prioridade`), não leitura de coluna de pessoa. A 0037 ainda não está na develop (última: 0036).
- **CI do PR 391** (`gh pr checks 391`, head `affd76f5`): `banco` pass nas duas execuções (1m55s, 1m50s); `testes`, `rapida`, `build`, `seguranca`, `openapi`, `imagem`, `filtro` e `e2e-parte (1/2)` pass; `e2e-parte (2/2)` ainda pendente na leitura (não alcança este diff, só testes `.pg` do server; o merge espera o verde).
- O A1 (recomendado, `metricas.pg.test.ts:72`) segue aberto: a prova à mão de `dim_card.responsaveis` está agora em `metricas.pg.test.ts:71` (a develop mudou outra linha do arquivo, +1 −1).

## Achados
- A1 (recomendado) server/tests/metricas.pg.test.ts:72 · ainda prova à mão `dim_card.responsaveis` para o dspd_api, com `toThrow(/permission denied/)`; não estava no A1 do K-282. Passar a `provarSemPessoa(api, dono, 'dspd_bm.dim_card', E.bm)` num cartão próprio.

---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/k236-k243-testes-tecnicos
commit: d4feb4495cbbd69461ac6bef9e9595787142c054
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-14
---
# Code review: K-236, grants do dspd_api coluna a coluna, e K-243, campos do grupo de lista (E1.29)

Diff lido: `git diff 7cb86b26...d4feb449` (1 commit): `server/tests/grants-api-colunas.pg.test.ts` (novo), `server/src/modulos/acelerato/controle.ts` e `server/tests/acelerato-e10-recusa.test.ts`.

## Ferramentas (citadas, não refeitas)
- CI do head `d4feb449` (check-runs do commit, run 43553234180): `banco` verde, com `tests/grants-api-colunas.pg.test.ts (7 tests)` no log do job (45 arquivos, 303 testes); `testes`, `rapida`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes; `e2e` e `perf` pulados pelo filtro. Sem banco local (regra do dono de 2026-11-12).
- Teste novo do K-243 rodado aqui: `npx vitest run tests/acelerato-e10-recusa.test.ts`, 11/11. Os mutantes são os do autor (relato da E1.28); não refeitos.
- Tamanho (M14): 94 linhas de código e teste (`git diff --numstat --no-renames`), dentro das 150.

## Conferência
- **K-243:** `fluxo_sha256` passa a `[CAMPO_ETAPA_FLUXO]` de `referencia.ts` (a mesma constante que a leitura da referência usa), sem mudar valor. O `it.each` novo compara a lista recebida pela consulta de vigência com listas escritas no teste (`['tipo_recorte', 'organizacao_recorte', 'equipe']`, `['etapa_fluxo']`), não com a constante: o duplo deixa de ser tautológico. Atende.
- **K-236, as quatro regras:** coluna de `COLUNAS_PESSOA`/`COLUNAS_FORA_DA_API` nunca legível; as listas existem no banco; nenhuma tabela de `TABELAS_FORA_DA_API` legível; tabela com coluna de pessoa só parcial em `dim_card`; mais nome de pessoa por `colunaDePessoa` salvo `EXCECOES_PESSOA`, a guarda contra catálogo vazio e o 42501 real nas tabelas de GRANT parcial. `has_column_privilege` cobre GRANT de tabela e de coluna, e `information_schema.columns` inclui as views.
- **Exceções justificadas:** `AINDA_SEM_TABELA` cita a própria documentação de `grants.ts:35-36` e diz quando sai; `LEITURA_PARCIAL_PERMITIDA` é o caso descrito em `gerarGrants` (GRANT por coluna em `dim_card`); `EXCECOES_PESSOA` vem da fonte única `lgpd.ts`, com justificativa por entrada.
- **Cobertura:** falha. O `dspd_api` recebe GRANT também no `dspd_core` (`grants.ts:123` os `ref_` do core; `grants.ts:135` os `pesq_` e `vw_pesq_`), e o teste só lê `dspd_bm` e `dspd_ac` (A1). Os `pesq_`/`vw_pesq_` não estão em teste nenhum de privilégio por coluna (`guarda-api.pg.test.ts` só varre `agg_`/`ref_`), e a entrada `dspd_core.ref_conta_automacao` de `TABELAS_FORA_DA_API` nunca é conferida por este teste.
- **Regras invioláveis:** reforça o GRANT por coluna do `dspd_api` (LGPD); nada de cálculo nem fonte.

## Achados
- A1 (bloqueante) server/tests/grants-api-colunas.pg.test.ts:32 · requisito "toda tabela com GRANT ao dspd_api" não cumprido: varre só bm e ac, e o dspd_api tem SELECT no dspd_core (ref_, pesq_, vw_pesq_). Sugestão: incluir `${prefixo}dspd_core` no array e no comentário da linha 7.
- A2 (recomendado) server/tests/grants-api-colunas.pg.test.ts:73 · nomes de coluna e tabela interpolados sem aspas no `SELECT ... LIMIT 0`; uma coluna com nome reservado ou maiúscula daria erro diferente de 42501 e um falso vermelho. Sugestão: citar com aspas duplas (`"${c.coluna}"`, `"${c.schema}"."${c.tabela}"`).

## Sondas

## Parecer
Reprovado pelo A1: o K-243 está pronto e o teste do K-236 é correto no que varre, mas não varre o schema core, onde o `dspd_api` também tem GRANT. A correção é de uma linha; na volta, leio só o delta e o `banco` do novo head.

---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f2-referencia
commit: 9c6bb3a1d231c9fde721ff84369d177bbf50f4be
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 1
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---
# QA: F2 do coletor do BusinessMap, referência real do quadro (pedido 052, E2.35, K-182)

Links: plano `docs/architecture/features/052-integracao-businessmap.md` (F2), review `docs/reviews/052-f2-referencia.md` (aprovado), segurança `docs/security/052-f2-referencia.md` (aprovado), bug `docs/qa/bugs/052-F2-001-versao-de-criterio-com-metrica-falha-no-postgres.md`.

**Parecer: reprovado.** A gravação contra PostgreSQL real tem um defeito alto: toda carga com mudança de processo (a que grava a versão de critério com métricas, marca T2.6) falha. O resto da gravação passou. O código é o de 75ee953 (o HEAD 9c6bb3a só soma pareceres).

## Escopo e método
Sem especificação de UX (tarefa de dados). Os critérios são o "Pronto" da F2 do plano e os 7 pontos do review. Plano e testes: `server/tests/referencia-businessmap.pg.test.ts` (11 testes contra o PostgreSQL 17 do Compose, schemas de teste, nenhum dado fica: cada teste roda em transação desfeita, porque as tabelas de vigência não aceitam DELETE). Papéis reais: `dspd_ref` (o da F3), `dspd_coletor`, dono dos objetos. Nenhuma chamada ao BusinessMap e o `.env` não foi lido.

## Critério, teste e resultado
| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Ponto 1 do review: carga inicial grava as 4 tabelas com os grants por coluna (section, flow_type, eh_folha, eh_descarte, motivo) | CT-1 | passou | grant de INSERT por coluna; nível de quadro |
| Ponto 1: CHECKs (nível de quadro, regex de id, seção 1 a 5, flow_type, limite, tipo_api, nível, eh_item = categoria) | CT-2 | passou (12 recusas 23514 e 1 válido) | valor logo fora do limite (0 e 6) |
| Ponto 2: UPDATE só de vigente_ate; gatilho; demais UPDATE, DELETE e TRUNCATE recusados | CT-3 | passou (42501 do papel, 55000 do gatilho) | permissão; histórico nunca sobrescrito |
| Ponto 1 e 5: coletor lê e não escreve em ref_coluna, ref_workflow, ref_tipo_card e versão (42501) | CT-4 | passou | permissão |
| Ponto 2 e 4: mudança de processo fecha e abre vigência, versão de critério com 12 métricas (inclui EI_FL1), sem duplicar no mesmo dia | CT-5 | **FALHOU** (bug A1) | mínimo e máximo de métricas |
| U-1 e H-12: só limite = O1; correção sem marca, motivo `correcao` | CT-6 | **FALHOU** (bug A1) | marca só do O1 |
| Ponto 3: comparação de datas com date como texto; mesmo dia ou antes é `ErroReferencia vigencia`, nunca PK; sem motivo nada grava | CT-7 | passou | data igual e anterior |
| Ponto 5: contagem pelo `dspd_coletor` (INSERT depois UPDATE, sem duplicar, DELETE negado) | CT-8 | passou | idempotência |
| Pronto da F2: nenhuma folha sem papel e sem motivo; folha nova fora da lista entra pela regra e é contada; folha sem seção fica sem papel e contada; chave ausente contada e não fechada | CT-9 | passou | folha sem seção; chave que some |
| Ponto 6: erro real do banco no meio da carga desfaz quadro, workflows, colunas, tipos e versão | CT-10 | passou (23514 e contagens zeradas) | rollback |
| Ponto 7: `lerColunas` e `montarBaseBM`: "Backlog (2530)" e "Backlog (2540)", nome único fica como é, dimensão e transições com o mesmo rótulo | CT-11 | passou | nomes homônimos |

CT-6 também cobre a parte "correção" do critério U-1. Pontos 2, 3 e 4 do review ficam parcialmente cobertos por CT-5, CT-6 e CT-7: a parte que depende de CT-5 e CT-6 só se prova depois da correção do bug.

## Resultado real
- Vermelho antes do verde: a base `64644b1` não tem `referencia.ts`, então o teste novo não carrega nela (vermelho por ausência). No HEAD, CT-5 e CT-6 são vermelhos pelo defeito: `error: inconsistent types deduced for parameter $2` (`referencia.ts:289-291`, `registrarVersao`). Numa cópia descartável fora do repositório com `$1::bigint` e `$2::varchar` no mesmo trecho, os 11 testes passam. O código de produção não foi tocado.
- `nice -n 19 pnpm run pronto`: rc=0. Server 46 arquivos passaram, 19 pulados (os `.pg`, sem `PG_TESTE_URL`), 931 testes passaram, 117 pulados, cobertura 100% (3005/3005 instruções, 2012/2012 ramos, 695/695 funções, 2404/2404 linhas). Web 1228, metricas 1092, mock 258, contratos 161, homolog 73, pesquisa 33, spec-check 14, todos aprovados.
- Suíte `.pg` do server (`PG_TESTE_URL` do migrador de teste): 19 arquivos, 117 testes, **2 falhos (CT-5 e CT-6)**, 115 aprovados. Os outros 18 arquivos `.pg` passaram.
- Nenhum teste foi marcado como skip. Mutação: não rodei (a prova é por banco real, sem ferramenta de mutação definida em `praticas.md`).
- O pronto não cobre o `.pg`: o defeito só aparece com banco, o que o review já tinha previsto ("o dublê não confere tipos").

## Bugs
- 052-F2-001 (alta, node-backend): a versão de critério com métricas falha no PostgreSQL. Detalhes e passos em `docs/qa/bugs/052-F2-001-versao-de-criterio-com-metrica-falha-no-postgres.md`. Efeito: sem a correção, a primeira mudança de processo no quadro real abortaria a carga (sem perda de dado, a transação desfaz).

## Achados
- A1 (bloqueante) server/src/modulos/businessmap/referencia.ts:290 · registrarVersao: SELECT $1, $2 não tem tipo para $2 no PostgreSQL; use $1::bigint e $2::varchar. CT-5 e CT-6 do teste .pg provam. Dono: node-backend.
- A2 (recomendado) server/tests/referencia-businessmap.pg.test.ts:1 · O teste .pg não roda no pronto (sem PG_TESTE_URL); o gate de CI com banco o roda. Sem ação de código.

## Revalidação
Depois da correção do A1: rodar de novo `referencia-businessmap.pg.test.ts` e a suíte `.pg`; a expectativa é 11 de 11 e 117 de 117, e o delta cabe numa linha de SQL.

# Code review: banco C1/R1 (leitura de transições pela view canônica)

Branch `fix/banco-view-canonica` (4241e70 contra origin/develop). Revisor: tech-lead. Uma rodada.

## Parecer: aprovado com ressalvas (nenhum item bloqueia o merge; o item 1 é recomendado antes do QA)

## O que foi verificado
- Única leitura de `fato_transicao` no código de produção: `server/src/modulos/metricas/repositorio.ts:64`, agora `vw_transicao_canonica`. Os demais usos em `src/` são seed (escrita), `lgpd.ts` e `grants.ts`. Nenhuma outra leitura de transição escapou.
- A view (`server/migrations/0005_bm_historico.ts:62-67`) é `security_invoker`, não expõe `usuario`, e `grants.ts:55` dá à `dspd_api` SELECT na view (prefixo `vw_`) e nas tabelas que ela lê. `usuario` segue sem privilégio (`papeis.pg.test.ts:28`, `metricas.pg.test.ts:71`). Sem coluna de pessoa.
- A consulta toca só o schema `bm`; nenhuma regra inviolável afetada (sem mistura BM/Acelerato, histórico preservado, sem filtro de arquivados).
- `pnpm --filter ./server run pronto`: 261 testes passam, 46 pulados; cobertura 100% (instruções, ramos, funções e linhas).

## Achados
1. **Recomendado.** `server/tests/transicao-canonica.pg.test.ts:23-38`: cobre par casado e webhook sem par, mas falta o terceiro caso pedido, **revision sem webhook** (deve contar uma linha). É o caminho de todo dado de hoje; sem ele, uma regressão da cláusula `fonte = 'revision'` da view passaria. Adicionar um teste de 4 linhas.
2. **Ressalva de verificação.** `test:pg` terminou com 10 arquivos e 46 testes pulados: não há Postgres disponível neste ambiente. O novo teste **nunca foi executado**, e a afirmação da auditoria ("o teste falha com a leitura antiga") não foi comprovada. O QA (ou o autor) precisa rodá-lo com Postgres real, e também medir o p95 da view, como a própria auditoria registra.
3. **Observação.** `server/tests/base-duble.ts:36`: o dublê devolve todas as linhas de `fato_transicao` sem aplicar o filtro da view. Isso não esconde divergência de tipo (os campos do SELECT são idênticos), mas passa a depender do teste PG para a semântica de deduplicação. Aceitável, desde que o item 2 seja cumprido. Vale um comentário de uma linha no dublê dizendo isso.
4. **Menor.** `server/tests/pg/desempenho.ts:71`: o rótulo continua `fato_transicao (carga)`, e o SELECT/ORDER BY dele não é o da consulta real. Renomear o rótulo para `vw_transicao_canonica (carga)`. Já é dívida registrada na auditoria (item 3), então não bloqueia.
5. **Menor.** `server/src/modulos/metricas/repositorio.ts:6`: a frase do cabeçalho ficou truncada e confusa ("`fato_transicao.usuario` (a view canônica também não a expõe) NÃO estão..."). Sugestão: "`fato_transicao.usuario` (a view também não a expõe)".
6. Documentação (`auditoria-banco.md`): atualizada de forma coerente (R1, tabela de ordem, resumo). Sem ajuste.

## Commits e escopo
Mudança mínima e coesa, sem dependência nova, sem migração (correto: a view já existia).

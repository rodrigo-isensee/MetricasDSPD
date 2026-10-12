# Parecer de QA - correção C1 do banco (view canônica de transições)

Branch `fix/banco-view-canonica` (commit 4241e70), 2026-10-12. Escopo: `lerTransicoes` passa a ler `vw_transicao_canonica` em vez de `fato_transicao`.

## Resultado
**Aprovado.** Nenhum bug aberto.

| Verificação | Resultado |
|---|---|
| `test:pg` (Postgres 17 local do Compose, `PG_TESTE_URL` de dev, prefixo de teste isolado) | 10 arquivos, 46 testes aprovados, nenhum pulado |
| `transicao-canonica.pg.test.ts` isolado | 2 aprovados (par casado conta 1, a da revision; webhook sem par continua contando) |
| Mutação: `lerTransicoes` voltando a `FROM fato_transicao` | o teste "par casado" falha (`expected length 1 but got 2`); mutação desfeita, árvore limpa |
| Métricas do mock | o diff contra a base da branch não toca `packages/` nem `scripts/` (mock e biblioteca intactos); `metricas.paridade.test.ts` e `metricas.pg.test.ts` aprovados, sem mudança de valores esperados. Nenhum hash de base foi recalculado: a evidência é a paridade e a ausência de alteração no mock |
| `pnpm --filter ./server run pronto` | typecheck, lint e cobertura aprovados: 261 testes, 100% em instruções, ramos, funções e linhas |

## Observações
- O duble de testes (`base-duble.ts`) agora casa por `vw_transicao_canonica`; os testes unitários dependem do texto da consulta, o que a mutação pg cobre.
- Não há teste que rode a view com `dspd_api` sobre dados do mock completo; a paridade usa o duble. Risco baixo.

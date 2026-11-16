---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-sal-apontamento
commit: 9025b3875d3e3e97b3429f13855a96e9e9ebe7c5
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-sal-apontamento (K-382, E7.272)

Escopo: `bm:coleta incremental --projetar` sem `PESSOA_ELIMINADA_SAL` deixa de pular o Apontamento calado. Diff lido (5 arquivos: `coleta-comando.ts`, `coleta-businessmap.ts`, `index.ts`, teste, CHANGELOG). Sem especificação de UX nem contrato de API: o critério vem do brief e do CHANGELOG (aviso no log e no stderr, `avisos: ["apontamento-sem-sal"]` no resumo, código de saída inalterado, sem valor de segredo).

## Achados
- A1 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:142 · a condição exclui `coleta.estado === 'falha'` (sem aviso), mas nenhum teste cobre esse ramo; mutante que o remove sobreviveria. Não bloqueia: aviso extra em coleta falha é inofensivo.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Incremental com --projetar sem sal registra `avisos` e imprime, sem segredo | `apontamento-comando-coleta.test.ts` "incremental com --projetar sem sal" (apontamento nulo, avisos igual a `['apontamento-sem-sal']`, 1 mensagem com o nome da variável, sem valor) | sal ausente | passou |
| Com sal não há aviso | "com sal: sem aviso" | sal presente | passou |
| Sem --projetar ou na carga inicial não há aviso (etapa não esperada) | "sem --projetar ou na carga inicial" | modo e flag | passou |
| Saída de código inalterada | leitura do diff: só acrescenta `avisos` e chama `avisar`; nenhum `throw` novo | n/a | passou (por leitura) |
| Aviso no log e stderr sem segredo | `coleta-businessmap.ts`: `log.warn({aviso: código}, m)` e `stderr.write` com texto fixo | n/a | passou (por leitura; a ligação da entrada não tem teste, ver observação abaixo) |

## Cenários e resultado real
- Local: `npx vitest run tests/apontamento-comando-coleta.test.ts` no head 9025b387: 14 passados, 0 falhos.
- Vermelho (cópia do `coleta-comando.ts` da base 7d7ea285 no lugar do novo): 3 dos 3 testes novos falham (`expected undefined to deeply equal ['apontamento-sem-sal']`). Restaurado, árvore limpa.
- Mutação manual (diff): removi `args.projetar === true` da condição: 1 teste cai ("sem --projetar ou na carga inicial"); mutante morto. Não rodei mutação do ramo `estado !== 'falha'` (A1).
- A fiação `avisar` em `entradas/coleta-businessmap.ts` (log + stderr) não tem teste automatizado; é uma linha de texto fixo, risco baixo. Fica como observação, sem bloqueio.
- Suíte inteira: CI de push no head 9025b387, run 43918661346, concluído com sucesso (testes, banco, seguranca, rapida, build, openapi, imagem verdes; perf e e2e pulados). Sem PR para a branch.
- Bugs: nenhum.

---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-k354-contadores-chamado
commit: 6b1ae7b74f7e1c04044343b3e1f44ed261a26073
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: contadores fluxo_multiplo e sem_agente por chamado distinto (pedido 105, K-354, E3.47)

Branch `fix/105-k354-contadores-chamado`, head 6b1ae7b7, base 2e02d5c6. Diff: `allow-list.ts` (`Contadores.somarChamado`), `normalizador.ts` (os dois contadores usam `somarChamado`; `fluxoDoChamado` recebe `idOrigem`), `acelerato-projetor.test.ts` e `CHANGELOG.md`. Sem UX nova: a obrigação vem da decisão do dono (15/11, "A"). A suíte inteira fica para o CI (I5): run 43753464004 do mesmo sha, success (testes, banco, build, openapi, seguranca, rapida, imagem verdes; e2e e perf skipped por filtro).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Duas versões do mesmo chamado contam `fluxo_multiplo` 1 vez | acelerato-projetor.test.ts, "duas versões do mesmo chamado contam fluxo_multiplo uma vez só" | mesmo id repetido | passou |
| Lote com duas versões do mesmo chamado conta `fluxo_multiplo` e `sem_agente` 1 cada | acelerato-projetor.test.ts, "lote com duas versões do mesmo chamado..." (via `projetarAcelerato`, `versoes: 2, chamados: 1`) | versões repetidas dentro do lote | passou |
| Chamados diferentes seguem contando cada um | "mais de um workflow distinto..." (ids 1 e 2, total 2) e o teste do projetor com 3 chamados | ids distintos | passou |
| Distinto vale para toda a rodada, não só o lote | leitura: `Contadores` é criado uma vez em `projetarAcelerato` (projetor.ts:160) e passado a todos os lotes; `vistos` vive na instância | fronteira entre lotes | passou por leitura (sem teste de dois lotes; ver nota) |

Nota: o conjunto de `vistos` está no mesmo objeto que acumula a rodada, então a persistência entre lotes decorre da estrutura; não há teste com versões do mesmo chamado em lotes diferentes (só se atinge com mais de um lote de pendentes). Não bloqueia.

## Vermelho antes do verde e mutação no diff
- M1: em `normalizador.ts` voltei `c.somarChamado('fluxo_multiplo', idOrigem)` para `c.somar('fluxo_multiplo')` e `c.somarChamado('sem_agente', idOrigem)` para `c.somar('sem_agente')` (soma por versão, o comportamento antigo). Resultado: os dois testes novos caem (`expected [['fluxo_multiplo', 2]] to deeply equal [['fluxo_multiplo', 1]]` e `expected { fluxo_multiplo: 2, sem_agente: 2 } to match object { fluxo_multiplo: 1, sem_agente: 1 }`; 2 failed, 13 passed). Morto. Árvore restaurada (`git status` limpo).
- Chamados diferentes no mesmo lote: os testes pré-existentes seguem verdes com a mudança (esperam 2 para ids 1 e 2).

## Cenários e resultado real
- acelerato-projetor.test.ts local, head 6b1ae7b7: 15 passed (15).
- CI do mesmo sha: success; sem skip novo.

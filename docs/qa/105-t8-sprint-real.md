---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t8-sprint-real
commit: 453348a218247c5f9ca0e451a99cc210366c3db5
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---

# QA: T8 com dado real (105, E7.528)

parecer: aprovado. A regra entregue confere com D-T8 = A (janela first_start a first_end, teto de 30 dias úteis, mínimo de 20 sprints, só BusinessMap); os testes novos ficam vermelhos na base e verdes no head; o test:pg descartável passa com a 0042 e o GRANT. Limite: não li a base real do BusinessMap (credenciais ficam em `.env`); "dado real" é o caminho de leitura real com fixtures. Sem PR e sem CI: não afirmo suíte inteira verde; o único vermelho local é o esperado (numeração, abaixo).

## Escopo e diff contra a obrigação
Diff `808a163c..453348a2` (43 arquivos): `t8.ts`, `extensao.ts`, `criterios.ts`, contrato (`foraDaConta`, `sprintsNoRecorte`, opcionais), migração `0042_bm_sprint`, normalizador, projetor, mapa, repositório, serviço, `grants.ts`, cartão `previsao.tsx` e testes. Sem especificação de UX própria: as obrigações são D-T8 e o detalhe do portão.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| 20 sprints publicam comprometido x entregue, carry-over, entrada não planejada | `t8.test.ts` "com 20 sprints publica..." | verde; vermelho na base | mínimo exato (20) |
| Filho criado no dia do início é planejado; um dia depois, não planejado; `ligado_em` vale no lugar da criação | `t8.test.ts` (2 testes) | verde; vermelho na base | limite do dia |
| Sem as duas datas ou acima de 30 dias úteis: `foraDaConta` | `t8.test.ts` "sem as duas datas..." | verde; vermelho na base | teto 30; datas nulas |
| Sprint sem filho nos filtros não conta | `t8.test.ts` | verde; vermelho na base | recorte vazio |
| Abaixo de 20 sprints não publica, só a contagem | `t8.test.ts` | verde; vermelho na base | 19 |
| Sem extensão: vazio, nunca 0% | `t8.test.ts` | verde; vermelho na base | base sem sprint |
| Normalizador: janela, filhos pelo vínculo child, sem título nem pessoa; nulos sem inferir; pai Sprint | `normalizador-businessmap.test.ts` (4) | verde; vermelho na base | allow-list; data inválida |
| Banco: `dim_sprint`, `fato_sprint_filho` append-only, GRANT coletor/api | `projetor-sprint.pg.test.ts`, `esquema.snapshot`, `catalogo.pg.test.ts` (test:pg) | verde | api só SELECT; sem pessoa |
| Mapa de dado real e contrato opcional | `painel-real-f6.test.ts`, `qa-f6-painel.test.ts` | verde | campos opcionais |
| Cartão: frase de menos de 20 sprints e nota "Fora da conta" | `t8-dado-real.test.tsx` | verde | menos de 20 |

## Vermelho antes do verde
Cópia da árvore com `t8.ts`, `criterios.ts`, `extensao.ts` e `normalizador.ts` trazidos de `808a163c` (restaurados depois; árvore limpa):
- `packages/metricas`, `t8.test.ts`: 9 falhas, 7 do bloco novo "T8 com dado real".
- `server`, `normalizador-businessmap.test.ts`: 4 falhas, todas do bloco "Sprint e vínculo dos filhos".
Não usei `forge-testes` (comando do Forge, não deste projeto).

## Execução
- `pnpm run test:pg` descartável (Postgres em Compose próprio, sem `.env` na worktree): 54 arquivos, 361 testes, verdes.
- `packages/metricas`: 58 arquivos, 1495 testes verdes. `packages/mock`: 263 verdes. `web` (complementares): 393 verdes.
- `server/tests/migracoes.estatico.test.ts`: 1 falha, `0042_bm_sprint: expected 42 to be 41`. Esperada até a 0041 do T3 entrar na develop; não é defeito do T8. Reteste depois do merge do T3.
- Teste de web e mock rodam por workspace; da raiz, dois arquivos falham por resolução de alias (ambiente, não defeito).

## Achados
- A1 (recomendado) server/tests/migracoes.estatico.test.ts:1 · revalidar após o T3 (0041) entrar na develop; se a numeração ainda falhar, vira bloqueante.

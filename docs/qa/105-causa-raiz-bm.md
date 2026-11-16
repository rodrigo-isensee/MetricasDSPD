---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 43f5bd9ced0106086545e67f8cb2e11253e6eab9
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-causa-raiz-bm (coleta da causa raiz do bug do fluxo, E7.86)

Sem especificação de UX nem contrato de API novos: a obrigação vem do brief e das decisões do dono (campo 48, dropdown, 12 opções; descrição de "Outros" nunca entra; valor fora da lista vira desconhecido e contado; `afeta` vazio). Código só de coleta e projeção.

## Achados

## Achados da rodada anterior (resolvidos; nenhum aberto)
Revalidação do delta 28b25cf2..43f5bd9c (`forge-check parecer delta`: CHANGELOG, plano de carga, dominio-businessmap.ts, allow-list.test.ts, dominio-businessmap.pg.test.ts). Nenhum achado aberto.
- A1 (bloqueante, resolvido) server/tests/dominio-businessmap.pg.test.ts:59 · bug 105-001 corrigido (1 campo, 13 linhas do campo, 370 inseridas, `afeta` vazio); o job `banco` do CI passou.
- A2 (recomendado, resolvido) server/tests/allow-list.test.ts:97 · teste do valor desconhecido com comment, text, description e label; o mutante M1 agora morre.
- A3 (recomendado, resolvido) server/src/modulos/businessmap/dominio-businessmap.ts:33 · o comentário separa a versão da E7.5 (afeta O15) da do campo 48 (`afeta` vazio).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E7.86-a dropdown aceito, outro tipo recusado | dominio-businessmap.test.ts (12 opções; `single_line_text` recusado) | tipo fora da lista positiva | passou |
| E7.86-b `value` e `values[]` lidos, só o código sai | allow-list.test.ts (escalar, `value_id`, `value` em `values[]`, itens escalares) | forma da seleção | passou |
| E7.86-c descrição de Outros e texto livre descartados | allow-list.test.ts (nunca o texto; extras em comment, text, description e label; `JSON.stringify` sem a descrição) | texto livre na fronteira | passou (A2 fechado) |
| E7.86-d fora da lista vira desconhecido, nota contada | allow-list.test.ts; normalizador-businessmap.test.ts (`campo_fora_do_dominio`, dim nulo) | valor fora do domínio, campo ausente | passou |
| E7.86-e 12 opções do dono no arquivo | dominio-businessmap.test.ts (rótulos escritos no teste) | 12 códigos únicos | passou |
| E7.86-f `afeta` vazio, nenhuma métrica muda | dominio-businessmap.test.ts; dominio-businessmap.pg.test.ts | n/a | passou (unitário e pg; A1 fechado) |

## Cenários e resultado real
- Vermelho antes do verde (projeto, sem `forge-testes`): rodada anterior, `vermelho: base=ba45668f head=28b25cf2`, 6 falharam de 165 (values[], arquivo do domínio, tipo recusado, dim.causa_raiz e 2 de L2-b). Vale: no delta nenhuma linha de produção mudou além de comentário.
- Mutação no diff: M2 a M6 mortos na rodada anterior (código inalterado). M1 de novo (`valor ?? c.comment` em allow-list.ts, restaurado, árvore limpa): `Tests  1 failed | 30 passed (31)`, morto.
- Local: `allow-list.test.ts` com 31 testes, incluindo os novos (extras em comment, text, description e label; values[] escalar; `value_id` sem rótulo vira desconhecido).
- CI do head, run 43846051567 (push, sha 43f5bd9c): `testes` (9m29s, cobertura do server incluída, que falhava no head anterior), `banco`, `rapida`, `build`, `filtro`, `seguranca`, `imagem` e `openapi` passaram; `e2e`, `perf` e `e2e-parte` não rodam em push. O run de pull_request 43846061576 ainda estava na fila ao fechar.
- Plano de carga (`docs/architecture/fontes/businessmap-causa-raiz-carga.md`) lido: spike, conferência da versão da E7.5, `bm:ref-sync`, carga inicial e `bm:projetar` cobrem o risco do `value_id`. O `bm:spike` fica com o dono depois do merge.
- `forge-mutante` não se aplica (não é pedido de controle).

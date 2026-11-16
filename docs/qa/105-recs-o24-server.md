---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-o24-server
commit: a806f3f0ecd4489831f8cbfa416f62cd5f2c54c0
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---

# QA: recomendados do O24 no servidor (E7.49)

resultado: aprovado, sem bloqueante. Diff `4d89240d..a806f3f0`: CHANGELOG, `coleta.ts`, `tags.ts` e `classe-servico-etiquetas.test.ts`; escopo bate com o brief (A1 e A2 do parecer `docs/qa/105-o24.md`). Sem especificação de UX; as obrigações são os recomendados A1 e A2.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1: rótulo de até 120 caracteres vale, 121 não | `A1: a guarda de tamanho do rótulo vale na borda` | 120 e 121 (com forma normalizada igual a classe), 500 espaços | passou |
| A2: teto de páginas avisa só com contagens | `A2: catálogo que declara mais páginas que o teto...` | 57 declaradas, 50 lidas, sem rótulo | passou |
| A2: no teto exato não avisa, sem ouvinte não quebra | `A2: no teto exato (50 páginas declaradas)...` | 50 e 51 páginas, callback ausente | passou |
| A2: coleta grava `tags_teto_paginas` (só números), status segue sucesso | `A2: a coleta registra o aviso do teto...` | lidos 50, falhas 2, sem falha de coleta | passou |
| A2: dentro do teto não grava aviso | `A2: catálogo dentro do teto não registra aviso` | 1 página | passou |

## Execução
- Local, só meu arquivo: `classe-servico-etiquetas.test.ts`, 23 testes verdes.
- CI do mesmo sha: run 43767609231, head a806f3f0ecd4489831f8cbfa416f62cd5f2c54c0, conclusão success (testes, banco, openapi, seguranca, build, filtro, rapida, imagem verdes; perf e e2e pulados pelo próprio fluxo).

## Vermelho antes do verde e mutação
O projeto não tem `forge-testes`. A prova por teste é a mutação, à mão, com o arquivo revertido a cada rodada (árvore limpa ao final):
| Mutante | Resultado |
|---|---|
| M1 tirar `rotulo.length <= 120` (allow-list.ts:110) | morto: 1 falha (A1) |
| M2 não chamar o aviso (`if (false)` em tags.ts) | morto: 2 falhas (A2 do teto e da coleta) |
| M3 avisar dentro do teto (`total >= TETO`) | morto: 1 falha (teto exato) |

## Achados

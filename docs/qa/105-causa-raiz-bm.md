---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-causa-raiz-bm-coleta
commit: 28b25cf22c3fdb5e0cd5d6e16fa6ae8be9ff26f8
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 1
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-causa-raiz-bm (coleta da causa raiz do bug do fluxo, E7.86)

Sem especificação de UX nem contrato de API novos: a obrigação vem do brief e das decisões do dono (campo 48, dropdown, 12 opções; descrição de "Outros" nunca entra; valor fora da lista vira desconhecido e contado; `afeta` vazio). Código só de coleta e projeção.

## Achados
- A1 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:59 · defeito provado, bug 105-001: teste pg com o contrato antigo (campos: 0, metricas ['O15']); o job banco do CI falha (run 43841142798). Atualizar para 1 campo e `afeta` vazio.
- A2 (recomendado) server/tests/allow-list.test.ts:97 · mutante M1 sobrevive: valor desconhecido com texto em `comment` não tem caso; falta teste que prove que o texto extra não vira o valor.
- A3 (recomendado) server/src/modulos/businessmap/dominio-businessmap.ts:33 · o comentário ainda diz que a fase de detecção afeta O15, mas o arquivo agora traz `afeta` vazio; confirmar com o dono que a marca do O15 de 2026-11-15 basta.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E7.86-a dropdown aceito, outro tipo recusado | dominio-businessmap.test.ts (12 opções; `single_line_text` recusado) | tipo fora da lista positiva | passou |
| E7.86-b `value` e `values[]` lidos, só o código sai | allow-list.test.ts (escalar, `value_id`, `value` em `values[]`) | forma da seleção | passou |
| E7.86-c descrição de Outros e texto livre descartados | allow-list.test.ts (nunca o texto; `JSON.stringify` sem a descrição) | texto livre na fronteira | passou (lacuna em A2) |
| E7.86-d fora da lista vira desconhecido, nota contada | allow-list.test.ts; normalizador-businessmap.test.ts (`campo_fora_do_dominio`, dim nulo) | valor fora do domínio, campo ausente | passou |
| E7.86-e 12 opções do dono no arquivo | dominio-businessmap.test.ts (rótulos escritos no teste) | 12 códigos únicos | passou |
| E7.86-f `afeta` vazio, nenhuma métrica muda | dominio-businessmap.test.ts; dominio-businessmap.pg.test.ts | n/a | unitário passou; pg falhou (A1) |

## Cenários e resultado real
- Local: allow-list, dominio-businessmap e normalizador-businessmap: 165 passaram de 165.
- Vermelho antes do verde (projeto, sem `forge-testes`): código e JSON da base `ba45668f` com os testes do head, na própria árvore e restaurados depois (árvore limpa). `vermelho: base=ba45668f head=28b25cf2`: 6 falharam de 165 (values[], arquivo do domínio, tipo recusado, dim.causa_raiz e 2 de L2-b). Os testes provam a mudança.
- Mutação no diff (allow-list.ts e dominio-businessmap.ts): M2 texto livre aceito: morto (4 falhas); M3 fora da lista vira a 1ª opção: morto (2); M4 `values[]` ignorado: morto (1); M5 tipos vazios: morto (4); M6 `causa_raiz` fora de COLUNAS_LISTA: morto (7); M1 descrição de Outros como fallback pelo `comment`: SOBREVIVEU (165 passaram), ver A2. A saída monta só `{field_id, valor}`, então a descrição só vazaria pelo fallback.
- CI do head, run 43841142798 (push, sha 28b25cf2): job `banco` falhou (`Tests  1 failed | 328 passed`, A1); job `testes` falhou em `server cobertura: Failed` com 2350 testes passando e nenhum vermelho identificado (causa não apurada, provável limiar de cobertura; o autor confere). `rapida`, `build`, `filtro`, `seguranca`, `imagem` e `openapi` passaram.
- Não verificado: `bm:spike` (risco do autor: a API pode mandar `value_id` em vez do rótulo); o domínio é por rótulo, então `value_id` numérico vira desconhecido contado, sem vazamento. `forge-mutante` não se aplica (não é pedido de controle).

---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-o24-aviso-mapa-vazio
commit: 0610c5f4
parecer: aprovado
resultado: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: aviso de mapa de etiquetas de classe vazio (pedido 105, O24, E7.54)

Head 0610c5f4, base 4ec9de5c. Diff: `coleta.ts`, `allow-list.ts` (`cardTemEtiqueta`), `classe-servico-etiquetas.test.ts` (3 testes) e `CHANGELOG.md`. Obrigação: a coleta registra em `ctl_coleta_contagem`, só números, `tags_classe_no_mapa` e `cards_com_etiqueta`; mapa vazio grava `aviso_mapa_classe_vazio` e a coleta segue com sucesso; falha do `/tags` não grava essas contagens. Nenhum rótulo nem dado de pessoa chega à tabela.

## Achados


## Critério → teste → resultado
| Obrigação | Teste (classe-servico-etiquetas.test.ts) | Fronteira protegida | Resultado |
|---|---|---|---|
| Registra `tags_classe_no_mapa` (5) e `cards_com_etiqueta` (1 de 3 cards), sem aviso com mapa cheio | "O24: a coleta registra tags_classe_no_mapa..." (:218) | card com `tag_ids` vazio e card sem a chave não contam; mapa cheio sem aviso | passou |
| Mapa vazio grava o aviso, coleta segue com sucesso, sem falha e sem rótulo | "O24: mapa vazio registra o aviso..." (:229) | mapa com 0 classes (etiqueta existe, mas não é de classe); rótulo "Tema" ausente da contagem | passou |
| Falha do `/tags` (403) não grava contagem de etiqueta | "O24: falha do /tags não registra..." (:241) | falha da fonte | passou (guarda negativa: também passa na base, por desenho) |

## Vermelho antes do verde
`coleta.ts` da develop sobre o head (allow-list e testes do head), `vitest run tests/classe-servico-etiquetas.test.ts`: 2 falharam, 24 passaram (os dois testes que exigem as contagens novas; o terceiro é guarda negativa e passa na base). Árvore restaurada depois.

## Mutação no diff (4 mutantes, vitest do mesmo arquivo)
| Mutante | Resultado |
|---|---|
| M1 não gravar o aviso com mapa vazio (`if (false)`) | morto (1 falhou) |
| M2 gravar o aviso com mapa cheio (`size >= 0`) | morto (1 falhou) |
| M3 contar card sem etiqueta (`cardTemEtiqueta` sem `length > 0`) | morto (1 falhou) |
| M4 contar todo card (sem `cardTemEtiqueta`) | morto (1 falhou) |

Nenhum sobrevivente. Sem acessibilidade nem E2E: não há interface.

## Execução
Local: `classe-servico-etiquetas.test.ts` 26 passaram. Suíte inteira: CI do mesmo sha, run 43782011623, conclusão `success`.

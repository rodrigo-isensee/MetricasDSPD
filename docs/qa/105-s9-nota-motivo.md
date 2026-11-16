---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s9-nota-motivo
commit: 235e3acb32abd470e05f80e49873b8f398656f31
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105 S9, nota do motivo da pendência (K-381, E7.281)

Obrigação: decisão D5b (A) do dono: o cartão do S9 avisa que o motivo da Pendente não é preenchido no Acelerato e por isso aparece como Não classificado. Diff `57989aa0..235e3acb`: só `notas.ts` (texto), `notas.test.ts` (1 teste) e `CHANGELOG.md`. Cálculo, contrato e base não mudam.

## Achados
Nenhum.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| S9 mostra a nota do motivo não preenchido (D5b A) | `web/src/features/complementares/notas.test.ts` ("S9 avisa que o motivo da pendência não é preenchido no Acelerato") | n/a | passou local (2 de 2 no arquivo) |
| Notas não terminam em ".." (regressão do texto concatenado) | mesmo arquivo, teste já existente | frase concatenada com ponto duplo | passou local |
| Texto anterior preservado (limite de 20 pendências) | leitura do diff: frase mantida antes da nova | n/a | conferido |

## Vermelho antes do verde
Projeto, não Forge: `forge-testes --vermelho` não se aplica. Rodei o teste novo com o `notas.ts` da base `57989aa0` numa troca temporária (restaurada, árvore limpa):

```
FAIL  src/features/complementares/notas.test.ts > notas complementares > S9 avisa que o motivo da pendência não é preenchido no Acelerato
AssertionError: expected 'Motivos com menos de 20 pendências nã…' to contain 'O motivo da pendência não está sendo …'
Tests  1 failed | 1 passed (2)
```
Com o código do head: `Tests 2 passed (2)`. Mutação formal não aplicada: só há texto constante, e o próprio vermelho acima é o mutante (nota removida).

## Observações
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde. Não li o PQ do autor (não consta no brief).
- O `CHANGELOG.md` cita E7.254 e o brief E7.281; rastreio, sem efeito no comportamento.

## Resultado
Aprovado. Nenhum bug aberto.

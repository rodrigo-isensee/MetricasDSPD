---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-sem-prioridade-zero
commit: 7e75897e6c048feaa1ccf6dd16571bb804b21784
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-sem-prioridade-zero (K-378, E7.460)

Correção sem especificação de UX nova: a obrigação vem do brief (com n = 0 a faixa Sem prioridade diz só que não há cartão sem prioridade). Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde e cita o pronto do autor (rc=0 na 3a execução; as anteriores caíram por instabilidade sob carga, não por teste).

## Achados

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| n = 0 mostra só "nenhum cartão sem prioridade neste recorte", sem frase fixa, complemento nem "de 40" | SemPrioridade.test.tsx, caso n = 0 | n = 0 com total e complemento presentes | passou |
| n > 0 mantém contagem, frase fixa e complemento | SemPrioridade.test.tsx, caso n > 0 | n = 5 (acima de 0) | passou |
| T4 com n = 0 usa o texto novo | tatico.test.tsx, T4 D1/D2 (ajustado) | n = 0 no cartão real | passou |
| Outros cartões com a faixa (T1, T2, fluxo, previsão, operacionais) | operacionais.test.tsx e tatico.test.tsx inteiros | n/a | passaram |

## Provas
- Diff lido (4 arquivos): a mudança é só o ramo n === 0 em SemPrioridade.tsx; os demais usos (CartaoT1, CartaoT2, CartaoT4, fluxo, previsão, operacionais) passam pelo mesmo componente e só mudam com n = 0. Só o teste do T4 afirmava o texto antigo; foi ajustado.
- Head: 3 módulos (SemPrioridade, tatico, operacionais), 3 arquivos, 67 testes, todos passaram.
- Vermelho: com SemPrioridade.tsx da base (d65624e7) no lugar, 2 falham (o teste novo n = 0 e o T4 D1/D2); 65 passam. Restaurado o arquivo do head, árvore limpa. A reversão do ramo n === 0 é o mutante, e morreu.

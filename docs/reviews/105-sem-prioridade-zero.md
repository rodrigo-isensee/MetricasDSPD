---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-sem-prioridade-zero
commit: 7e75897e6c048feaa1ccf6dd16571bb804b21784
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: faixa Sem prioridade com n = 0 (105, K-378, E7.459)

Passada única de `d65624e7` (Base-sha) até `7e75897e`. 4 arquivos, +55/-8 (código e teste: +52/-8, dentro do teto M14).

## Leitura
- **Faz o que o cartão pede.** `SemPrioridade.tsx:44`: com `n === 0` a faixa mostra só "nenhum cartão sem prioridade neste recorte.", sem contagem, sem a frase fixa e sem o `complemento`. No T4 isso é correto: sem cartão sem prioridade, a nota "A chegada total é maior que a soma das prioridades acima" seria falsa.
- **Com n > 0 nada se perde.** O ramo `else` é o bloco antigo sem alteração de texto (contagem com e sem total, frase fixa, complemento). `destaque` e `data-destaque` seguem calculados como antes; com `n = 0`, `pct = 0`, sem destaque, como já era. Usos conferidos: T1, T2, T4, T6, O6, O24, todos pelo mesmo componente, sem cálculo próprio.
- **Testes.** `SemPrioridade.test.tsx` novo cobre n = 0 (ausência de frase fixa, complemento e "de 40") e n > 0 (contagem, frase, complemento). Rodei o arquivo: 2 de 2 verdes. Mutante mental `n === 0` para `false`: o primeiro caso falha (afirma o texto "nenhum cartão..."). `tatico.test.tsx` (T4) ajustado ao texto novo e à ausência do complemento.
- **Regras invioláveis.** Só texto de tela; sem pessoa, sem mistura de fontes, sem cálculo novo.
- **Suíte.** Sem PR: a suíte inteira fica para o CI do PR; cito o PQ do autor (`pnpm run pronto` rc=0, 3a execução, as anteriores caíram por instabilidade sob carga). Não afirmo CI verde.

## Achados
- A1 (recomendado) web/src/components/ui/SemPrioridade.tsx:13 · o comentário do contrato diz "a contagem aparece sempre"; com n = 0 ela não aparece mais. Ajustar para "com n = 0, só a frase de ausência".

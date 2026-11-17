---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t7-sem-limite
commit: 7626f762bc250ac71ad90557d09ced3c4b8870a2
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T7 sem limite de frentes (105, E7.498, review E7.505)

Passada única de `6fb535ed` (Base-sha) até `7626f762`. 5 arquivos, +17/-50, dentro do teto M14.

## Leitura
- **Faz o que a decisão do dono pede (17/11).** `CartaoT7.tsx`: o status do cartão é fixo "Sem limite de frentes" com `statusMeta="sem-meta"`; o número grande mostra "sem limite", sem `StatusMeta` de acima/dentro. Nenhuma leitura de `acimaDoLimite` ou `limiteFrentes` sobra no front; o resto do cartão (frentes em andamento, projetos com frentes, leitura, gráficos) segue igual.
- **Back-end intacto.** O diff não toca `server/` nem `contratos`; os campos do contrato seguem existindo e só deixam de ser exibidos, como o brief pede.
- **Nota.** `notas.ts`: meta passa a "Sem limite de frentes, por decisão do dono."; coerente com o cartão.
- **Testes.** `ramos.test.tsx` troca os dois ramos dentro/acima por um caso com `acimaDoLimite = true` na fonte que afirma ausência de comparação e de selo: bom guarda contra regressão. `tatico.test.tsx` afirma "sem limite", "Sem limite de frentes" e ausência de "não definido". Rodei os dois arquivos filtrando T7: 7 passaram, 0 falharam.
- **Regras invioláveis.** Só texto de tela; sem pessoa, sem mistura de fontes, sem cálculo novo.
- **Imports.** `StatusMeta` saiu do import; `fmtInteiro` segue em uso (linhas 26 e 49). Sem código morto no front.
- **Suíte.** Sem PR: a suíte inteira fica para o CI do PR; cito o PQ do autor (`pnpm run pronto`, com timeouts alheios sob carga, segundo o brief). Não afirmo CI verde.

## Achados
- A1 (recomendado) web/src/features/tatico/components/CartaoT7.tsx:60 · o `rotulo` segue "limite de frentes simultâneas" sob o valor "sem limite"; lê bem, mas vale a UX confirmar a redação.

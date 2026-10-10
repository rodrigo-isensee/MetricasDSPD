# B12-002 - Cartão de Espera invisível do nível não aparece em Operacional semanal, Tático e Estratégico
- Severidade: baixa neste commit (esperado até o K-043 chegar; reavaliar quando entrar)
- Responsável sugerido: react-frontend
- Ambiente: 567e995, Chromium

## Passos para reproduzir
1. Abrir `/operacional?cadencia=semanal`, `/tatico` e `/estrategico`.
## Resultado esperado
TAT-01, EST-01, OP-02 e EI-04: `metrica-EI-FL1`, `metrica-EI-FL2` e `metrica-EI-FL3` presentes na ordem prevista.
## Resultado obtido
Nenhum cartão de EI (compacto) no DOM; a seção "Espera invisível do nível" não existe. Em `567e995` as páginas não importam o `CartaoEI`; a árvore de trabalho atual (K-043) já importa. Os casos de EI por nível ficam para a próxima rodada; os testes B12 não exigem EI.
## Evidência
`e2e/tests/b12-fluxo.spec.ts` (listas de cartões sem EI); `git show 567e995:web/src/features/tatico/TaticoPage.tsx`.

## Status: FECHADO (revisão 2)
EI compacto presente nos três níveis; OP-02, TAT-01, EST-01 e EI-04 passam na suíte E2E.

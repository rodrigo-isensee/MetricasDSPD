# B3-001 - /sustentacao sem a faixa "Pede atenção"
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: e4ccab7 (K-008), Chromium, `vite preview`

## Passos para reproduzir
1. Abrir `/sustentacao`.
2. Procurar `data-testid="faixa-atencao"`.

## Resultado esperado
SUS-01 e SUS-16: faixa "Pede atenção" com S2 < 90% por prioridade e S1 com mediana acima do alvo, com links `#s2` e `#s1`.
## Resultado obtido
A faixa não existe (os dados justificariam: S2 P2 a P4 abaixo de 90% no mock).
## Evidência
`e2e/tests/b3-sust-ei-vg.spec.ts` > SUS-01; `docs/qa/evidencias/b3/sustentacao-1280-claro.png`.

# IR-001 - CLS a 375x812 acima do orçamento (0,1) em /, /sustentacao e /espera-invisivel
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: branch feature/integracao-real, build de produção, `VITE_MOCK_LATENCIA=0`, Chromium

## Passos para reproduzir
1. `cd e2e && npx playwright test --project=perf -g "F2 CLS a 375x812"`

## Resultado esperado
CLS < 0,1 (ADR 0003).

## Resultado obtido
`/` 0,186; `/sustentacao` 0,150; `/espera-invisivel` 0,224 (reproduzido em 2 execuções). Suspeita: selo de frescor e faixa de calibração entram após o primeiro desenho e empurram o conteúdo no viewport estreito. Não confirmado se é regressão da branch (não medido na base).
A medição desktop `/` falhou uma vez na suíte completa em série e passou isolada (instável, observar).

## Evidência
Saída do `test:perf`; traces em `e2e/test-results/` (não versionados).

# 005 - Link da marca tem 28 px de altura em < 768 px
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: develop @ 252bed4, vite preview (VITE_MOCK_LATENCIA=0), Chromium 1280x800

## Passos para reproduzir
1. Abrir /operacional a 375 px. 2. Medir o link "Métricas DSPD" do cabeçalho (150x28).

## Resultado esperado
A11Y-13 / critério 102: alvos >= 44x44 px abaixo de 768 px (>= 24 px sempre; 2.5.8 AA é atendido).

## Resultado obtido
150x28 px.

## Evidência
e2e/tests/responsivo.spec.ts (A11Y-13).

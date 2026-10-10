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

## Correção (K-061)
Causa medida (layout-shift sources): "Atualizado em", selo e "Entenda" entravam quando o estado de coleta chegava (linha de 20 px para 68 px a 375 px) e a faixa de calibração (108 px) empurrava recorte, filtros e cartões. Correção: o "Verificando a coleta…" reserva a linha final (placeholder invisível com a mesma quebra); o painel e a Visão geral seguram o resto da tela num bloco reservado até o estado das fontes da rota chegar (exceto `?mock=carregando`).
CLS a 375 antes -> depois (3 execuções idênticas): `/` 0,186 -> 0,007; `/sustentacao` 0,150 -> 0,000; `/espera-invisivel` 0,224 -> 0,007. Desktop `/` 0,021. Resta 0,007 pela linha "Coleta falhou..." do BusinessMap (mock padrão), que não dá para prever.

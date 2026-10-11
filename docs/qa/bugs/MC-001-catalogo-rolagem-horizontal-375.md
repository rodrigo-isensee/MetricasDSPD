# MC-001 - /metricas com rolagem horizontal da página em 375 px
- Situação: corrigido (51dc4b5) e verificado em 2026-10-11; COMP-03 a 375 px passa.
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: branch feature/metricas-complementares (dbf3235), Chromium headless, viewport 375x812

## Passos para reproduzir
1. Abrir `/metricas` com viewport de 375 px de largura.
2. Medir `document.documentElement.scrollWidth` contra `clientWidth`.

## Resultado esperado
Sem rolagem horizontal da página; só o contêiner da tabela rola (região com `overflow-x-auto`), como nos demais painéis.

## Resultado obtido
`scrollWidth` = 898 contra `clientWidth` = 375. A tabela (`TABLE.w-full`, largura direita 998) extravasa o contêiner da tabela e alarga a página, com o filtro "Todos" e com "Complementar". Axe não acusa violação (zero bloqueantes).

## Evidência
Teste `e2e/tests/complementares.spec.ts` COMP-03 a 375 px falha em `semRolagemHorizontal` (mantido vermelho, sem skip). Suspeita: pai flex/grid sem `min-w-0` no contêiner da tabela em `CatalogoPage`.

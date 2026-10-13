---
contrato: 0
---
# Estratégia de cobertura de testes

Meta: 100% de linhas, funções, branches e statements por pacote, mais 100% das rotas e estados em E2E. Este documento só mede e planeja; os thresholds ainda não estão ligados.

## Linha de base (medida em 2026-10-10, `npm run cobertura`)
| Pacote | Linhas | Funções | Branches | Statements |
|---|---|---|---|---|
| contratos | 0 | 0 | 100 (nada a medir) | 0 (sem nenhum teste) |
| metricas | 97,13 | 95,09 | 83,72 | 95,61 |
| mock | 99,29 | 100 | 93,60 | 97,39 |
| web | 91,62 | 87,07 | 86,48 | 89,37 |

Maiores lacunas: contratos inteiro (zod sem teste); `metricas/core/montecarlo.ts` (0%, sem teste direto); web `AreaEmpilhada`, `ErroPagina`, `PlaceholderPainel`, `main.tsx`, `TooltipTema`, `Erros`, `Dica`, `CabecalhoPainel`.
Observação: os testes do web falham de forma intermitente por timeout sob carga (coverage v8 deixa a suíte mais lenta); `app.test.tsx` oscilou em 2 testes. Medir web com `--testTimeout` maior ou tratar como instabilidade a corrigir.

## Níveis
1. **Unitário**: uma função/componente isolado, sem rede, com dublês. Vitest junto do código. Property-based (fast-check) para a biblioteca de cálculo.
2. **Sistêmico (integração entre pacotes e camadas)**: sem navegador, com as peças reais conectadas. Hoje: gerador (`mock`) -> biblioteca (`metricas`) -> `MockFonteMetricas` -> hooks (React Query) -> UI renderizada (Testing Library). No 002: API + MySQL (somente leitura, banco de teste) via Supertest, coletor -> base analítica -> API -> contrato (`contratos`). Arquivos `*.sistemico.test.ts(x)`.
3. **E2E**: Playwright em Chromium (Firefox/WebKit no CI), app real servida, seletores por papel. Valida fluxos, rotas, estados e acessibilidade (axe).

## Meta e exclusões permitidas
Meta por pacote: 100% nas quatro métricas. Exclusões (`coverage.exclude`), cada uma justificada em comentário no config:
- `*.test.*` e `*.d.ts`: não são código de produção.
- Arquivos só de tipos (`types.ts`, interfaces/`type`): não geram código executável.
- Arquivos de configuração (`vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `playwright.config.ts`): sem lógica de negócio.
- Entrypoints triviais (`web/src/main.tsx`, apenas `createRoot().render`): cobertos pelo E2E (a página carrega).
- `web/src/features/painel/PlaceholderPainel.tsx` (exclusão transitória, K-057): componente sem nenhum uso, resto da fase A. O correto é removê-lo; a remoção está pendente de aprovação (política de permissões). Sai do `coverage.exclude` junto com o arquivo.
- Barrels `index.ts` que só reexportam: cobertos por importação.
Proibido: excluir por conveniência, `/* v8 ignore */` sem justificativa e issue vinculada. Branch inalcançável vira remoção de código, não exclusão.

## Bloqueio no `npm run pronto`
1. Corrigir as lacunas por pacote (contratos primeiro, depois metricas/montecarlo, web).
2. Ligar `coverage.thresholds` `{ lines: 100, functions: 100, branches: 100, statements: 100 }` em cada config, um pacote por vez, quando o pacote chegar a 100%.
3. Trocar `test` por `vitest run --coverage` dentro do `pronto` de cada workspace (ou chamar `npm run cobertura`); falta de cobertura reprova o comando. `coverage/` fica no .gitignore.
4. E2E: o gate (`e2e/scripts/gate.mjs`) passa a exigir que cada linha do mapa abaixo tenha teste.

## Mapa de E2E por rota e estado
Estados por painel: carregado, carregando, vazio (`?mock=vazio`), erro geral e por cartão (`?mock=erro`, `erro:<id>`), amostra < 20 (não publicar), filtro inválido na URL. Transversais: teclado, axe (wcag2a/aa/22aa), responsivo (375/1280).
| Rota | Carregado | Carregando | Vazio | Erro | Filtros/URL | Teclado + axe | Responsivo | Hoje |
|---|---|---|---|---|---|---|---|---|
| `/` visão geral | sim | sim | sim | sim | sim | sim | sim | estados/shell/a11y |
| `/operacional` | sim | sim | sim | sim | sim | sim | sim | estados/filtros/a11y |
| `/tatico` | sim | sim | sim | sim | sim | sim | sim | estados/filtros/a11y |
| `/estrategico` | sim | sim | sim | sim | sim | sim | sim | estados/filtros/a11y |
| `/sustentacao` | sim | sim | sim | sim | sim | sim | sim | b3-sust-ei-vg |
| `/espera-invisivel` | sim | sim | sim | sim | sim | sim | sim | b3-sust-ei-vg |
| `/ajuda` | sim | n/a | n/a | n/a | n/a | sim | sim | a11y/shell |
| `*` não encontrada | sim | n/a | n/a | n/a | n/a | sim | sim | shell |
| erro de chunk (errorElement) | n/a | n/a | n/a | sim | n/a | sim | n/a | b12-fluxo |
A coluna "Hoje" é indicativa; a primeira tarefa de QA é auditar cada célula contra `e2e/tests/` e criar o que faltar. Critérios de aceite novos (preferências, 002) entram nesta tabela ao serem especificados, com um E2E por critério.

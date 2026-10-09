# 0001 - Stack do front-end do dashboard de métricas (etapa mock)
- Status: aceita
- Data: 2026-10-09
- Pedido: `docs/pedidos/001-dashboard-mock.md` · Plano técnico: `docs/architecture/features/dashboard-mock.md`

## Contexto
O pedido 001 constrói os painéis (Visão geral, FL1, FL2, FL3, Sustentação, Espera invisível) só em `web/`, com dados fictícios gerados no navegador, para validar a experiência. Forças:
- Trocar o mock por API real depois **sem mudar os painéis**.
- Gráficos exigidos pelo catálogo: histograma (O3, T7, E1), linhas com faixas de percentis (O3, S1), área empilhada / CFD (O7, T4), dispersão de tempo de ciclo e aging (O2, O3), barras simples e empilhadas (O4, O15, O18, S3 a S7), linhas de referência (percentis, limite de WIP, marcação de mudança de critério da T2.6).
- WCAG 2.2 AA, tema claro e escuro, responsivo, teclado.
- Filtros na URL (link compartilhável).
- Cálculo determinístico e testável (biblioteca única, T2.5), sem dependência do fuso do navegador.
- Critério de pronto: `npm install && npm run dev` em `web/`; lint, type-check, unitários e E2E passando.

## Decisão
| Tema | Escolha |
|---|---|
| Runtime / build | Node 24 LTS, **Vite** (versão estável corrente), **React 19**, **TypeScript `strict: true`** + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Pacotes | `web/` e `e2e/` como pacotes npm independentes (sem workspaces nesta etapa); versões fixadas no `package-lock.json` |
| Gráficos | **Recharts 3** (SVG), encapsulado em `web/src/components/charts/`; nenhum painel importa Recharts diretamente |
| Alternativa textual dos gráficos | Todo gráfico tem tabela de dados equivalente (botão "Ver dados em tabela") e resumo textual em `figcaption`; é o mecanismo principal de acessibilidade, não o SVG |
| Roteamento | **React Router 7** em modo biblioteca (`createBrowserRouter`), rotas com `lazy` por painel |
| Filtros na URL | `URLSearchParams` como fonte da verdade, lidos e escritos por um único hook `useFiltros(dominio)` com **schema zod** por domínio (fluxo × sustentação); valores inválidos caem no padrão e a URL é normalizada com `replace` |
| Dados assíncronos | **TanStack Query 5** sobre a interface `FonteMetricas` (plano técnico §5). O mock também é assíncrono, para a troca pela API ser transparente |
| Estilo e tema | **Tailwind CSS 4** com tokens em CSS variables (`--cor-*`), tema por `data-theme="light|dark"` no `<html>`, padrão = `prefers-color-scheme`, escolha persistida em `localStorage`. Gráficos leem as mesmas variáveis |
| Componentes acessíveis | **Radix UI Primitives** (Dialog, Popover, Tabs, Tooltip, Select, ToggleGroup) sem kit visual pronto |
| Datas | Sem biblioteca de datas na lógica: instantes em epoch ms; calendário em `lib/metrics/core` com deslocamento fixo `-03:00` (sem horário de verão desde 2019). Formatação na UI via `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })` |
| Validação | **zod 4** para filtros da URL e para os DTOs do contrato (validados nos testes da fonte mock; na fonte HTTP, em tempo de execução) |
| Testes unitários | **Vitest** + **Testing Library** + jsdom; **fast-check** para propriedades da biblioteca de cálculo. Script de teste roda com `TZ=UTC` para provar que nada depende do fuso da máquina |
| E2E e acessibilidade | **Playwright** + **@axe-core/playwright** em `e2e/`, contra `vite preview` (`webServer` do Playwright); Chromium obrigatório, Firefox e WebKit opcionais |
| Lint / formatação | **ESLint 9** (flat config) + `typescript-eslint` (`strictTypeChecked`) + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` + **Prettier** |
| Regras de lint arquiteturais | `no-restricted-imports`: `features/**` e `components/**` não importam `lib/metrics` nem `mock`; `lib/metrics/businessmap` e `lib/metrics/acelerato` não se importam; `no-restricted-properties`/`no-restricted-globals`: `Math.random`, `Date.now`, `new Date()` sem argumento proibidos em `mock/` e `lib/metrics/` |
| Scripts em `web/` | `dev`, `build`, `preview`, `lint`, `typecheck` (`tsc -b`), `test`, `test:watch`, `check` (lint + typecheck + test) |

## Alternativas consideradas
**Gráficos**
- *Apache ECharts (echarts-for-react)*: cobre tudo (inclusive decals e `aria` automático), muito performático em canvas. Contras: bundle grande (~300 KB gz mesmo com `echarts/core`), canvas exige a mesma tabela alternativa de qualquer forma, tema por objeto JS separado dos tokens CSS, API imperativa por opções. Descartado por peso e por destoar do React.
- *Nivo*: visual bom, mas cada tipo de gráfico é um pacote, faixas de percentis e linhas de referência exigem camadas customizadas; acessibilidade irregular entre tipos.
- *visx / D3 direto*: controle total, mas transforma o time em mantenedor de biblioteca de gráficos; custo alto para uma etapa de validação.
- *Observable Plot*: excelente para histograma e faixas, mas é imperativo (renderiza DOM fora do React), sem interação/teclado prontos.
- *Chart.js*: canvas, plugins para anotação, acessibilidade fraca.
- **Recharts** venceu: SVG estilizável por CSS variables (tema claro/escuro grátis), `Area` com intervalo `[min, max]` para faixas de percentis, `ReferenceLine`/`ReferenceArea` para percentis, WIP e mudança de critério, `ScatterChart`, áreas e barras empilhadas, `accessibilityLayer` com teclado. Histograma é `BarChart` sobre faixas já calculadas pela biblioteca (o que é desejável: nenhum componente calcula). Volume de pontos do mock (milhares) é compatível com SVG.

**Roteamento e URL**
- *TanStack Router*: search params tipados e validados nativamente, ótimo para filtros. Contras: diverge da stack padrão da skill, curva para o time, ganho coberto por um hook de ~60 linhas com zod.
- *nuqs*: bom para estado na URL, mas é mais uma dependência para o que um hook resolve.
- *Estado global (Zustand/Context) sincronizado com a URL*: duas fontes da verdade; descartado. A URL é a única.

**Estilo**
- *CSS Modules puro*: sem dependência, mas mais lento para construir layout responsivo e manter consistência de espaçamento.
- *MUI / Mantine / Chakra*: rápidos, mas trazem identidade visual própria e bundle maior; a UX deste pedido é desenhada pelo `ux-designer`.
- *shadcn/ui*: seria Radix + Tailwind com código copiado; pode ser usado como referência, sem obrigação.

**Componentes acessíveis**
- *React Aria Components*: acessibilidade ainda mais completa; descartado por API mais extensa. Reavaliar se a revisão de acessibilidade apontar falhas nos primitivos Radix.

**Datas**
- *date-fns / Day.js*: operam no fuso local da máquina, o que torna testes e cálculo de horas úteis dependentes do ambiente. *Temporal*: ainda sem suporte uniforme nos navegadores alvo. O cálculo necessário (dia da semana, expediente, feriados) é pequeno e precisa de testes próprios de qualquer forma.

**E2E**
- *Cypress*: mais pesado, integração com axe menos direta e paralelismo pago. Playwright já é o padrão do `qa-engineer`.

## Consequências
- Mais fácil: trocar mock por API (fonte assíncrona por trás de interface); compartilhar link de qualquer visão; tema escuro sem duplicar estilos de gráfico; garantir por lint que componentes não calculem e que BusinessMap e Acelerato não se cruzem.
- Mais difícil: cada novo tipo de gráfico precisa entrar em `components/charts/` com a tabela alternativa; o hook de filtros é código nosso e precisa de testes.
- Riscos:
  - Recharts em jsdom precisa de `ResizeObserver` simulado e dimensões fixas nos testes; testar o conteúdo pela tabela alternativa e não pelo SVG.
  - Acessibilidade do SVG do Recharts é limitada; por isso a tabela alternativa é obrigatória e coberta pelo axe e pelos E2E.
  - Se o volume de pontos crescer (dados reais), avaliar amostragem no servidor ou troca de dispersões para canvas; a encapsulação em `components/charts/` limita o impacto.
  - Cálculo no navegador é transitório: a biblioteca em `lib/metrics` é TypeScript puro, sem React/DOM, para migrar para `packages/shared` ou `server/` quando houver back-end (ver plano técnico).

# Parecer de QA - métricas complementares (17)
Branch `feature/metricas-complementares` (dbf3235). Data: 2026-10-11. Ambiente: Chromium headless (Playwright, `vite preview` do build de produção, dados mock), WSL2.
Links: `docs/ux/metricas-fora-do-nucleo/`, `docs/architecture/features/metricas-complementares.md`, `docs/alinhamentos/2026-10-11-decisoes-complementares.md`.

## Escopo
Cobre: O5, O6, O8, O11, O13, O14, O16, O17 (Operacional), T6, T8 (Tático), E4, E5 (Estratégico), S8 a S12 (Sustentação). Seção "Mais métricas deste painel", "Leia junto", catálogo `/metricas`, preferências, sem alerta, fora da Visão geral, selo "Dados fictícios".
Não cobre: a correção do conteúdo numérico das métricas (coberto pelos unitários de `packages/metricas` e `packages/mock`), Firefox/WebKit (só no CI), API real (as complementares são só mock).

## Cenários (E2E em `e2e/tests/complementares.spec.ts`)
| ID | Cenário | Prioridade | Resultado |
|---|---|---|---|
| COMP-01 | Seção recolhida com contagem (8/2/2/5), nenhum cartão montado antes de abrir; ao abrir, todos com selo "Dados fictícios"; axe AA e sem rolagem horizontal; sem erro de console. 4 painéis x 375 e 1280 | Alta | 8 de 8 passam |
| COMP-02 | Teclado: Enter abre, Espaço fecha o summary (375 e 1280) | Alta | passa |
| COMP-03 | Catálogo: 45 de 45; Complementar = 17; Núcleo = 28; axe AA; sem rolagem horizontal | Alta | 1280 passa; 375 falha (MC-001) |
| COMP-04 | Preferências: grupo "Complementares" por painel, contadores (+8)/(+5); axe AA | Alta | passa (375 e 1280) |
| COMP-05 | "Leia junto" abre a seção e leva o foco ao título do cartão (O6) | Alta | passa |
| COMP-06 | Link direto `/sustentacao#s9` abre a seção no cartão | Média | passa |
| COMP-07 | Nenhuma complementar em "Pede atenção" (4 painéis, com a seção aberta) | Alta | passa |
| COMP-08 | Visão geral sem seção nem complementares | Alta | passa |
| COMP-09 | Ocultar O6: contagem 7 e o "Leia junto" some | Média | passa |
| COMP-10 | Todas ocultas no painel: seção some | Média | passa |
| COMP-11 | "Restaurar padrão" devolve as ocultas e abre a seção no painel (D-4) | Alta | passa |

Ajustes em testes existentes, por mudança prevista da entrega: `shell.spec.ts` NAV-01/02 (agora 8 destinos, com "Catálogo de métricas") e `preferencias.spec.ts` PREF-10 (contador "11 de 12 (+8) visíveis"). Nenhum teste foi marcado como skip.

## Resultado da execução
- `pnpm run pronto`: saída 0 (lint, format, typecheck, cobertura e build; contratos 23, mock 145, metricas 458, web 687 testes passando; server 251 passando e 44 ignorados, que são os testes de PostgreSQL já existentes; limites de tamanho do bundle ok).
- Suíte E2E completa (Chromium): 313 passaram e 4 falharam antes dos ajustes. Dos 4: NAV-01/02 e PREF-10 eram testes desatualizados (ajustados e agora passam); A11Y-03 falhou sob carga paralela e passou ao rodar de novo (instável, sem relação com a entrega; segue em observação); COMP-03 a 375 px é defeito real. Reexecução focada (shell, preferências, a11y e complementares): 81 passaram, 1 falhou (COMP-03 a 375).
- Acessibilidade (axe wcag2a, wcag2aa, wcag22aa) a 375 e 1280: zero violações críticas ou sérias em seção aberta dos 4 painéis, catálogo e preferências.
- Regras invioláveis: nenhum texto de pessoa/ranking nas telas testadas; complementares fora de "Pede atenção" e da Visão geral.

## Bugs
| ID | Severidade | Responsável | Resumo |
|---|---|---|---|
| MC-001 | média | react-frontend | `/metricas` a 375 px alarga a página (scrollWidth 898 > 375); `docs/qa/bugs/MC-001-catalogo-rolagem-horizontal-375.md` |

## Parecer
Aprovado com ressalva. Todos os cenários de prioridade alta passam, exceto COMP-03 a 375 px por MC-001 (média, sem contorno de função, só de layout). Sem bugs críticos ou altos e sem violações de acessibilidade críticas ou sérias. Recomenda-se corrigir MC-001 antes do pull request (ou aceitá-lo explicitamente) e reexecutar COMP-03. O teste vermelho permanece como guarda.

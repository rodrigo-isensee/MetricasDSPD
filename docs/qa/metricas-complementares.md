# Parecer de QA - métricas complementares (17)
Branch `feature/metricas-complementares` (7aa4d6c, após as correções). Data: 2026-10-11. Ambiente: Chromium headless (Playwright, `vite preview` do build de produção, dados mock), WSL2.
Links: `docs/ux/metricas-fora-do-nucleo/`, `docs/architecture/features/metricas-complementares.md`, `docs/alinhamentos/2026-10-11-decisoes-complementares.md`.

## Escopo
Cobre as 17 complementares: Operacional 7 (O5, O6, O8, O11, O13, O14, O16), Sustentação 6 (O17, S8 a S12), Tático 2 (T6, T8), Estratégico 2 (E4, E5). Seção "Mais métricas deste painel", "Leia junto", catálogo `/metricas`, preferências, sem alerta, fora da Visão geral, selo "Dados fictícios".
Não cobre: a correção do conteúdo numérico das métricas (coberto pelos unitários de `packages/metricas` e `packages/mock`), Firefox/WebKit (só no CI), API real (as complementares são só mock).

## Cenários (E2E em `e2e/tests/complementares.spec.ts`)
| ID | Cenário | Prioridade | Resultado |
|---|---|---|---|
| COMP-01 | Seção recolhida com contagem (Operacional 7, Sustentação 6, Tático 2, Estratégico 2), nenhum cartão montado antes de abrir; ao abrir, selo "Dados fictícios" só onde o status é mock; axe AA e sem rolagem horizontal; 4 painéis a 375 e 1280 | Alta | 8 de 8 passam |
| COMP-02 | Teclado: Enter abre, Espaço fecha o summary (375 e 1280) | Alta | passa |
| COMP-03 | Catálogo: 45 de 45; Complementar = 17; axe AA; sem rolagem horizontal a 375 e 1280 (MC-001) | Alta | passa (375 e 1280) |
| COMP-04 | Preferências: grupo "Complementares" por painel; axe AA | Alta | passa |
| COMP-05 | "Leia junto" no núcleo abre a seção e leva o foco ao cartão | Alta | passa |
| COMP-05b | "Leia junto" do O3 lista O5, O6 e O8; caminho O3 para O5 abre o cartão (bloqueante do UX) | Alta | passa |
| COMP-06 | Link direto `/sustentacao#s9` abre a seção no cartão | Média | passa |
| COMP-07 | Nenhuma complementar em "Pede atenção" (4 painéis) | Alta | passa |
| COMP-08 | Visão geral sem seção nem complementares | Alta | passa |
| COMP-09 | Ocultar O6 reduz a contagem e remove o "Leia junto" | Média | passa |
| COMP-10 | Todas ocultas no painel: seção some | Média | passa |
| COMP-11 | "Restaurar padrão" devolve as ocultas e abre a seção | Alta | passa |
| COMP-12 | Catálogo: O17 na Sustentação (Acelerato); só os 6 de status mock são "Fictícios" (O17, T8, E4, S8, S11, S12) | Alta | passa |
| COMP-12 (S8) | S8: reincidência pelo mês de abertura; cobertura "n de N" só quando n < N | Alta | passa após ajuste do teste (abre a seção antes de procurar o cartão) |

"Campo sem fonte" (S12): coberto no unitário `web/src/features/complementares/estados.test.tsx` e `ramos.test.tsx` (709 testes do web passam); sem E2E dedicado, porque os dados mock do build de E2E não produzem esse estado.

Nenhum teste foi marcado como skip.

## Resultado da execução (2026-10-11, revalidação)
- `pnpm run pronto`: saída 0 na execução isolada (contratos 26, mock 146, metricas 461, web 709, server 252 passando e 44 ignorados de PostgreSQL já existentes; limites de bundle ok). Duas execuções anteriores falharam só por carga da máquina (load average acima de 11, com outras frentes rodando): 33 timeouts de 15 s no web e `desempenho.test.ts` do mock; ambos passam isolados e na terceira execução completa. Instabilidade de ambiente, não da entrega.
- Suíte E2E completa (Chromium, `E2E_SEM_ALT=1`): 317 passaram, 3 falharam, 1 não rodou. Falhas: (1) A11Y-03 sob carga, passa ao rodar de novo (instável, já registrado, segue em observação); (2) COMP-12 S8, defeito do próprio teste (cartão fica na seção recolhida), ajustado e passa; (3) FIL-04, bug 004 já conhecido e aberto (baixa, react-frontend), sem relação com as complementares. Reexecução de `complementares.spec.ts`: 27 de 27.
- MC-001 confirmado corrigido: `/metricas` a 375 px sem rolagem horizontal (COMP-03 passa).
- Acessibilidade (axe wcag2a, wcag2aa, wcag22aa) a 375 e 1280: zero violações em seção aberta dos 4 painéis, catálogo e preferências.
- Regras invioláveis: nenhum texto de pessoa/ranking; complementares fora de "Pede atenção" e da Visão geral; O17 só na Sustentação (Acelerato, sem mistura com BusinessMap).

## Bugs
| ID | Severidade | Responsável | Situação |
|---|---|---|---|
| MC-001 | média | react-frontend | corrigido e verificado |
| 004 (FIL-04) | baixa | react-frontend | aberto, anterior a esta entrega (`docs/qa/bugs/004-marcar-todas-as-equipes-nao-remove-parametro.md`) |

## Parecer
Aprovado. Todos os cenários de prioridade alta passam, sem bugs críticos ou altos abertos e sem violações de acessibilidade críticas ou sérias. Observações: A11Y-03 instável sob carga; bug 004 (baixa) aberto e fora do escopo; "Campo sem fonte" coberto só em unitário.

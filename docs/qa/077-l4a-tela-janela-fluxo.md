---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 68d5e1ee148a8b1894d746241a0d5018a9d4753e
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 Lote 4a (tela da janela incompleta no fluxo, K-211, E2.3)

Sobre o commit `68d5e1ee` (lote e volta 1). Review aprovado em `ec8bbdaf`; revisão de interface em `docs/ux/077-revisao-l4a.md` (sem commit, vai ao PR). Especificação: `docs/ux/077-tendencias.md` (CA-1 a CA-7, CA-14, seção 6); desenho: seção "Lote 4a" de `docs/analises/077-desenho.md`.

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:97 · o vazio de janela não cita a data de início do histórico (A-4 da interface); avaliar no Lote 4b, junto do `vazioJanela` próprio da sustentação (A2 do review).
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:308 · a frase da SLA na sustentação perde o ponto final com o texto do ponto de SLA (A1 do review); alinhar no Lote 4b, onde o caso aparece.

## Escopo conferido
- Diff `718d46be...68d5e1ee`: 8 arquivos, todos em `web/src` (3 de código, 4 de teste) mais o parecer do review. `server/`, `packages/` e `docs/contratos`: sem diferença contra a base (conferido em `git diff --stat`). Escopo do plano igual ao do desenho: nenhum componente novo.
- Nenhuma conta na tela: o mapeador só repassa a data do contrato (`historicoDesde`) e o `n` fica `null` no mês de janela incompleta (T2.5).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 (sem valor, nunca zero, marcador vazado sem linha) | `modelo.test.ts` "mês de janela incompleta (CA-1, CA-4)" (valor null, n null); `graficos.test.tsx` marcador vazado; `resumo.test.tsx` "sem ligar os vizinhos" | valor nulo, nunca 0 | passou |
| CA-2 (motivo na lista com mês) | `componentes.test.tsx` "lista o motivo em texto, a frase no subtítulo e o resumo do gráfico" | texto exato da seção 6 | passou |
| CA-3 ("Poucos itens (n=N). Estatística não publicada.") | `modelo.test.ts` "P85 do tipo escolhido..."; `resumo.test.tsx` mês de poucos itens | n=14 abaixo de 20, sem texto de janela | passou |
| CA-4 (só "janela incompleta" quando os dois motivos) | `modelo.test.ts` (poucos itens e 30 itens com janela incompleta); `graficos.test.tsx` rótulo do eixo "janela incompleta" e sem "poucos itens" | os dois motivos juntos | passou |
| CA-5 (tabela com "—" e "não publicado · janela incompleta") | `componentes.test.tsx` "tabela mostra ..." | valor e base vazios | passou |
| CA-6 (frase do subtítulo só com o motivo) | `componentes.test.tsx` "frase do subtítulo some sem janela incompleta; sozinha quando não há subtítulo" | sem o motivo, sem subtítulo | passou |
| CA-7 (tudo não publicado: vazio, sem tabela) | `componentes.test.tsx` "tudo não publicado: vazio com a janela de 12 semanas completa, sem tabela" | série toda vazia | passou |
| CA-14 (motivo em texto: lista, tabela, resumo do gráfico) | `componentes.test.tsx` (resumo do gráfico no `figcaption`), mais CA-2 e CA-5 | sem cor nem hover | passou |
| Microcopy da seção 6 | leitura do código: texto do ponto, da lista, da tabela, do subtítulo e do vazio iguais à seção 6 | n/a | passou |
| Contraste 3:1 do marcador vazado (A-5 da interface, 1.4.11) | medido por cálculo da razão de luminância WCAG, traço `--serie-1` sobre `--fundo` (`tokens.css`) | tema claro e escuro | passou |

## Contraste do marcador vazado (WCAG 1.4.11)
Medido por cálculo (script Python, fórmula WCAG), sem render: o traço do marcador usa `--serie-1` e o miolo `--fundo`. Tema claro: `#0072b2` sobre `#f6f7f9` = 4,84:1 (sobre `--superficie` `#ffffff`, 5,19:1). Tema escuro: `#6aa8ff` sobre `#0f1420` = 7,59:1 (sobre `--superficie` `#161c2a`, 7,02:1). Todos acima de 3:1. O axe de tela fica com o e2e do PR (não rodei aqui).

## Execução
- Suíte: CI do push no head, run 42361902072: `{"conclusion":"success","headSha":"68d5e1ee148a8b1894d746241a0d5018a9d4753e"}`.
- Testes do lote, `--maxWorkers=2`, na worktree: `Test Files 4 passed (4)`, `Tests 78 passed (78)` (`graficos.test.tsx`, `componentes.test.tsx`, `modelo.test.ts`, `resumo.test.tsx`).

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-engineer-077-l4a/c` (head com os 3 arquivos de código voltados ao `718d46be`; os testes novos mantidos), mesmo comando, `--maxWorkers=2`: `Test Files 4 failed (4)`, `Tests 10 failed | 68 passed (78)`. Caem: o caso de eixo de `graficos.test.tsx` (CA-4); 4 casos de janela incompleta de `componentes.test.tsx` (CA-1 a CA-7, CA-14); 4 de `modelo.test.ts`; 1 de `resumo.test.tsx` (texto de CA-3). Worktree não tocada. O `forge-testes --vermelho` não se aplica a esta stack no caminho usado; a prova é a cópia.

## Mutação à mão (o forge-mutante não lê a stack web)
O vermelho prova a ausência do código; por isso 7 mutantes sobre o head, em cópia (`/tmp/claude-1000/qa-engineer-077-l4a/m`), mesmo comando de teste; todos mortos:
| Mutante | Resultado |
|---|---|
| M1 rótulo do eixo com os motivos trocados (`GraficoMensal.tsx`) | 2 falham |
| M2 frase do subtítulo sempre (sem a condição) | 1 falha |
| M3 vazio sempre sem a variante de janela | 1 falha |
| M4 situação da tabela sem "janela incompleta" | 1 falha |
| M5 mapeador ignora `janelaIncompleta` | 1 falha |
| M6 `n` do mês de janela incompleta vira 0 em vez de nulo | 1 falha |
| M7 lista sem o texto de janela incompleta | 1 falha |
Sobrevivente: nenhum. Não rodei mutante para a ordem das guardas em `serieP85`; CA-4 tem teste próprio no modelo (30 itens com janela incompleta).

## Observações sem bloqueio
- A-1 a A-3 da revisão de interface estão corrigidos no `68d5e1ee` (microcopy dos dois motivos); A-4 e A-3 (vazio da sustentação) seguem como recomendação para o 4b (achados acima).
- Bugs abertos: nenhum; `docs/qa/bugs/` sem entrada nova.
- Não coberto aqui: axe de tela e leitura por leitor de tela real (e2e do PR).

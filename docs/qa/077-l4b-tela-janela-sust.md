---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4b-tela-janela-sust
commit: 0236c717c874000b6c96921aa7323afb88932a6a
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 077 Lote 4b (tela da janela incompleta na série de SLA da sustentação, K-211, E2.3)

Sobre o commit `0236c717` (lote mais a volta 1). Review aprovado e conferido em `9e77b82e`. Especificação: `docs/ux/077-tendencias.md` (seções 1, 5 e 6; CA-1, CA-2, CA-4, CA-5, CA-14); desenho: seção "Lote 4b" de `docs/analises/077-desenho.md`. Escopo incremental: os testes dos arquivos do lote e o E2E da sustentação; a suíte inteira não foi rodada nesta etapa. Diff lido: `git diff ab423d02...0236c717 -- web e2e`, 8 arquivos, só `web/` e `e2e/`.

## Achados
- A1 (recomendado) web/src/components/charts/GraficoMensal.tsx:99 · o mutante que inverte a precedência no eixo (motivo antes de janela incompleta) sobrevive: nenhum teste põe os dois campos no mesmo ponto (CA-4 no eixo); inalcançável pelo modelo hoje.
- A2 (recomendado) web/src/components/charts/GraficoMensal.tsx:68 · a 320 px o rótulo de mês sai sobreposto ao vizinho (abr 66-120, mai 101-158) e "set/2026" passa 14 px da borda do cartão (301 contra 287); não é do lote, já existia com 6 meses.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 mês de janela incompleta sem valor, nunca zero, antes de outro motivo | `modelo.test.ts` "SLA: mês de janela incompleta sai sem valor e sem base" (valor null, n null, prioridades vazias) | prioridades vazias com janela incompleta (não vira "nenhuma prioridade avaliada") | passou |
| CA-2 texto do motivo na lista com o mês | `componentes.test.tsx` "SLA: motivo na lista e na tabela" (`...-sla-sem-valor`: "jul/2026 · Janela incompleta: o histórico começa em 14/08/2026. Estatística não publicada.") | data de início no texto | passou |
| CA-4 só o motivo "janela incompleta" | `modelo.test.ts` (texto único, sem "Poucos itens"); `graficos.test.tsx` "janela incompleta ... não 'poucos itens'" (já do 4a) | janela incompleta vence poucos itens | passou (A1) |
| CA-5 tabela: "—" e "não publicado · janela incompleta" | `componentes.test.tsx`, clique em "Ver como tabela", linha jul/2026 | valor e base vazios | passou |
| CA-14 motivo como texto (lista, tabela, resumo) e rótulo do eixo por motivo | `graficos.test.tsx` "o ponto sem prioridade avaliada leva o próprio motivo no eixo"; `modelo.test.ts` (`motivo`, frase) | ponto sem prioridade: "sem prioridade avaliada"; demais sem valor seguem "poucos itens" | passou |
| Seção 1: série de volume sem marcador nem frase | `componentes.test.tsx` (volume sem "Janela incompleta", sem `-volume-sem-valor`) | contagem do mês-calendário | passou |
| Seção 1: frase do subtítulo só com ponto incompleto | `componentes.test.tsx` (regex "Meses cuja janela de 12 semanas começa antes da primeira carga") | frase presente só na SLA | passou |
| Seção 1: vazio próprio da sustentação, sem tabela | `componentes.test.tsx` "todos os meses incompletos" (texto exato, sem `-alternar`, volume segue) | todos os meses incompletos | passou |
| Frase da SLA sem dois-pontos duplo (A-4) | `modelo.test.ts` "Em julho, janela incompleta: ..." | último mês incompleto | passou |
| Texto do ponto sem prioridade (A1 do 4a) | `resumo.test.tsx` e e2e CA-27 ("Nenhuma prioridade com 20 chamados ou mais. Estatística não publicada.") | n = 0 prioridades avaliadas | passou |
| Seção 5: acessibilidade da tela | e2e CA-19 (axe, visão resumo, 375 e 1280 px) | 375 e 1280 px | passou |

## Execução
- Vitest, `--maxWorkers=2`: `graficos.test.tsx` e `features/operacional/resumo` (4 arquivos): `Tests 82 passed (82)`.
- E2E, Chromium, `--workers=2`: `npx playwright test tests/sustentacao-no-operacional.spec.ts --project=chromium` resultou em `40 passed (1.2m)`, incluindo CA-27 (texto novo) e CA-19 (axe, resumo a 375 e 1280 px).
- Lição do 4a (texto de tela trocado): `grep -rnE "nenhuma prioridade com 20 chamados\)|jul/2026 · não publicado" e2e/tests web/src` saiu vazio; nenhum texto antigo restou.
- Fora do diff: nenhum arquivo de `server`, `packages`, `docs/contratos` ou `docs/api` mudou; o lote não calcula nada (T2.5).

## Vermelho antes do verde
Cópia em `$TMPDIR` com a árvore da base `ab423d02` (`git archive`) e os 4 arquivos de teste do commit `0236c717`: `Tests 6 failed | 76 passed (82)`. Caíram: `graficos.test.tsx` (rótulo "sem prioridade avaliada": recebeu 'abr/2026poucos itens...'), `componentes.test.tsx` (os 2 testes novos), `modelo.test.ts` (a frase "Em julho: Janela incompleta: ..." contra "Em julho, janela incompleta: ..." e o `serieSla` do mês incompleto) e `resumo.test.tsx` (texto do ponto sem prioridade). Os comportamentos novos têm teste que falha na base. A ferramenta `forge-testes --vermelho` não foi usada (árvore com arquivo não rastreado de outro agente, `docs/ux/077-revisao-l4b.md`).

## Mutantes à mão (cópia de `0236c717`, vitest nos mesmos 4 arquivos)
| Mutante | Resultado |
|---|---|
| M1 apagar o ramo `janelaIncompleta` de `serieSla` (`modelo.ts:279`) | morto (3 falhas) |
| M2 desligar o ramo da frase `fraseDaSerieSla` (`if (false)`) | morto (1 falha) |
| M3 tirar o `motivo: 'sem prioridade avaliada'` do ponto | morto (1 falha) |
| M4 inverter a precedência no eixo (motivo antes de janela incompleta, `GraficoMensal.tsx:99`) | sobrevive (A1) |
| M5 renomear o `vazioJanela` da sustentação | morto (1 falha) |
| M6 eixo ignora `motivo` (volta a "poucos itens") | morto (1 falha) |
| M7 tirar a inicial minúscula da frase | morto (2 falhas) |
| M8 `if (av === 0)` para `av === 1` em `serieSla` | morto (4 falhas) |

M4 é o único sobrevivente: com o modelo atual o ponto de janela incompleta nunca traz `motivo`, então o mutante é inalcançável pela tela; vira recomendação (A1), não bloqueio.

## Acessibilidade e A-6 da revisão de interface
- Axe do E2E existente: zero violações sérias na visão Resumo a 375 e a 1280 px (CA-19). O estado de janela incompleta não existe na semente do mock; o texto do ponto é o mesmo componente já coberto.
- Medida a 320 e a 375 px (Chromium, semente `tendencia-poucos`, script descartável que não entrou no commit): sem rolagem horizontal (`scrollWidth` 320 e 375). O rótulo longo "sem prioridade avaliada" (11 px) ocupa 136-269 px a 320 px, dentro do cartão (33-287), e não colide com outro rótulo de segunda linha, porque só o ponto sem valor tem segunda linha. Os rótulos de mês de primeira linha já se sobrepõem a 320 px e o último passa da borda (A2), sem relação com este lote.
- Contraste do marcador vazado (1.4.11): contorno `--serie-1` `#0072b2` sobre `--fundo` `#f6f7f9` no tema claro, e `#6aa8ff` sobre `#0f1420` no escuro; ambos acima de 3:1 pelas cores dos tokens (estimativa por leitura dos tokens, sem medidor).
- Não coberto aqui: leitor de tela real.

## Observações
- Bugs abertos: nenhum; `docs/qa/bugs/` sem entrada nova.
- O A3 do review (`fraseDaSerie` do fluxo com dois-pontos duplo) está fora do lote, com o Jarvis.

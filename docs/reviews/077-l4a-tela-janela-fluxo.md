---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 9342bc7aaef52c2b05773d11725c8bd5fdc4320c
parecer: reprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 4a, a tendência do fluxo mostra o mês de janela incompleta (K-211, E2.2)

Diff lido: `718d46be...9342bc7a` (4 arquivos, 102 adições e 5 remoções), contra `## Lote 4a` de `docs/analises/077-desenho.md` e os CA-1 a CA-7 e CA-14 de `docs/ux/077-tendencias.md`. Lido também, fora do diff, `web/src/components/charts/GraficoMensal.tsx`, que desenha os pontos que o `SerieMensal` lhe passa.

## Parecer
**Reprovado**, por um achado: o eixo do gráfico rotula o mês de janela incompleta como "poucos itens" (A1). O resto do lote está conforme.

- **Mapeador (`modelo.ts:236-251`):** `serieP85` testa `m.janelaIncompleta` antes de procurar o tipo, então o mês sai `valor: null`, `n: null` e o texto do motivo mesmo com 30 itens ou com poucos (CA-1, CA-4). A data vem do contrato (`historicoDesde`); a tela não conta nem calcula nada (T2.5). `serieConcluidos` não ganha marca, como o desenho manda (a contagem fica para o Lote 8).
- **Desvio de arquivo:** o desenho cita o mapeador em `TendenciaFluxo.tsx`; ele vive em `modelo.ts` (`serieP85`, usado em `TendenciaFluxo.tsx:86`). Correto: é onde o mapeador já estava.
- **`SerieMensal`:** lista `{id}-sem-valor` com "Janela incompleta: o histórico começa em {data}. Estatística não publicada." (CA-2); tabela com "—" e "não publicado · janela incompleta" (CA-5); frase do subtítulo só com ao menos um ponto marcado, sozinha sem subtítulo (CA-6); vazio com a janela de 12 semanas completa e sem botão de tabela (CA-7); motivo no `figcaption` pelo `texto` do ponto (CA-14). Nenhum componente novo.
- **`vazioJanela`:** desvio aceito. É prop opcional, não componente, e o 4b precisa dela para o texto próprio da sustentação (A3).
- **CA-1 (zero):** o ponto nunca vira zero no dado; o `GraficoMensal` já desenha o marcador vazado sem linha para `valor: null`, padrão anterior ao lote. Contraste do marcador fica com o QA (revisão de interface, A-5).
- **Fora do diff, como pedido:** `server/`, `packages/` e `docs/contratos` sem diff.
- **Revisão de interface:** `docs/ux/077-revisao-l4a.md` (ux-designer, aprovado com ressalvas), sem commit nesta worktree; vai ao PR. O A2 abaixo é o A-1 dela.

## Ferramentas
- CI do push no head `9342bc7a`: run 42358191516, `CI`, `completed`, `success` (`gh run list --commit`).
- Testes dos arquivos tocados e dos vizinhos que leem `SerieMensal` e `GraficoMensal`, 2 workers: `componentes.test.tsx`, `modelo.test.ts`, `resumo.test.tsx`, `graficos.test.tsx`, 77 verdes.
- Lint, tipos, cobertura e `docs:check`: cobertos pela mesma CI verde; não refeitos.

## Teto M14
107 linhas de código e teste (`SerieMensal.tsx` 26+4, `componentes.test.tsx` 42+0, `modelo.test.ts` 21+0, `modelo.ts` 13+1), dentro de 150. Um comportamento só.

## Achados
- A1 (bloqueante) web/src/components/charts/GraficoMensal.tsx:65 · o eixo escreve "poucos itens" sob todo mês com valor null, inclusive o de janela incompleta (até com 30 itens): o gráfico mostra o motivo errado, contra o CA-4. Levar o motivo do ponto ao TickMes e testar o rótulo.
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:233 · o CA-3 pede "Poucos itens (n=N). Estatística não publicada." e a lista mostra "poucos itens (n=14)"; texto anterior ao lote, igual ao A-1 da revisão de interface; alinhar na mesma volta do A1.
- A3 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:59 · o padrão de `vazioJanela` é o texto do fluxo num componente compartilhado; o Lote 4b deve passar o texto da sustentação (spec, seção 1), senão a sustentação fala em "itens".

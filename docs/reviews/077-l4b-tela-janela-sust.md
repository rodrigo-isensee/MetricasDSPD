---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4b-tela-janela-sust
commit: a5fcab66378410a3d7d2a60aa3a4f54ba985bdcd
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 4b, tela da janela incompleta na sustentação (K-211, E2.2)

Diff lido: `git diff ab423d02...a5fcab66` (6 arquivos, `web/` e `e2e/`). Referências: seção "Lote 4b" do desenho (`docs/analises/077-desenho.md`), seções 1, 5 e 6 e os CA-1, CA-2, CA-4, CA-5 e CA-14 da especificação (`docs/ux/077-tendencias.md`), parecer do 4a na develop (`docs/reviews/077-l4a-tela-janela-fluxo.md`, A1 a A3).

## Parecer
**Aprovado.** O lote faz o que o desenho pede, nem mais nem menos.

- **Aderência ao Lote 4b:** `serieSla` (`modelo.ts:277`) trata a janela incompleta antes de qualquer outro motivo, pelo mesmo `janelaIncompleta` do 4a; a tela reaproveita o `SerieMensal` do 4a, sem componente novo. A série de volume não passa por esse ramo: segue contagem do mês-calendário (spec seção 1, ADR 0019 item 5).
- **CA-1 e CA-4:** ponto incompleto sai com `valor: null` e `n: null`; o teste de `modelo.test.ts` usa `prioridades: []` com `janelaIncompleta`, ou seja, os dois motivos juntos, e espera só o de janela incompleta.
- **CA-2, CA-5 e CA-14:** `componentes.test.tsx` afirma a linha da lista ("jul/2026 · Janela incompleta: o histórico começa em 14/08/2026. Estatística não publicada."), a frase do subtítulo, o resumo do gráfico ("julho: Janela incompleta") e, na tabela, valor "—" com "não publicado · janela incompleta". Volume sem marcador e sem lista `-sem-valor`: afirmado.
- **Microcopy (seção 6):** o texto do ponto em `modelo.ts:237-243` (do 4a) é igual ao da seção 6; a linha da lista e a situação da tabela também.
- **`vazioJanela` próprio (A2 do review do 4a, A-3 da interface do 4a):** `TendenciaSustentacao.tsx:49` passa o texto da sustentação, igual ao da seção 1 da spec; o teste do vazio com todos os meses incompletos o afirma, sem botão de tabela.
- **A1 do review do 4a (frase da SLA sem ponto final):** resolvido no texto do ponto, não na frase: o motivo "nenhuma prioridade avaliada" virou "Nenhuma prioridade com 20 chamados ou mais. Estatística não publicada." (`modelo.ts:285`), no molde do CA-3, e `fraseDaSerieSla` (`modelo.ts:309`) passa a terminar com ponto. O e2e (`sustentacao-no-operacional.spec.ts:433`) e o `resumo.test.tsx:240` foram alinhados ao texto novo; `grep` do texto antigo em `web/src` e `e2e/` vazio.
- **T2.5:** nenhuma conta na tela; o lote só escolhe texto pela marca que o contrato traz.
- **Fora do diff:** `git diff --stat ab423d02...a5fcab66 -- server packages docs/contratos docs/api` vazio.
- **A3 do review do 4a (fora do formato):** sem ação de código; o PR 261 foi mesclado pelo dono (c4dc19d0) e o teto do 4a ficou registrado no histórico do pedido (2026-11-07 12:00). O parecer da develop não é editado aqui (fora do escopo).
- **Revisão de interface do 4b** (ux-designer-4, `docs/ux/077-revisao-l4b.md`, sem commit): citada, não refeita. A1 e A2 abaixo coincidem com os A-1 e A-3 dela.

## Ferramentas
- CI do push no head `a5fcab66`: run 42386360326, `CI`, `push`, `completed`, `success` (`gh run list --commit`); ponta remota igual a `a5fcab66` (`git ls-remote`).
- Testes dos arquivos tocados (D-5): `vitest run --maxWorkers=2` em `modelo.test.ts`, `componentes.test.tsx` e `resumo.test.tsx`: 3 arquivos, 68 testes verdes. Suíte inteira: com o QA.

## Teto M14
`git diff --numstat --no-renames ab423d02...a5fcab66 -- web e2e`: 1+1, 1+0, 49+0, 25+1, 2+1, 1+1 = 83 linhas, dentro do teto de 150. Um comportamento só (janela incompleta na série de SLA da sustentação, com o texto do ponto sem prioridade alinhado).

## Achados
- A1 (recomendado) web/src/components/charts/GraficoMensal.tsx:97 · no ponto de SLA sem prioridade avaliada o rótulo do eixo diz "poucos itens", e a lista diz "Nenhuma prioridade com 20 chamados ou mais"; o motivo deve ser o mesmo nos dois (CA-14). Mesmo ponto do A-1 da interface; fica para a volta conjunta.
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:309 · com o último mês incompleto a frase sai "Em julho: Janela incompleta: ...", com dois dois-pontos; reescrever sem o segundo. Mesmo ponto do A-3 da interface.

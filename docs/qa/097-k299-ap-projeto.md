---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k299-ap-projeto-l9
commit: 6279c8a40092d7826d3414a4801a886ecc2aeca8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---

# QA: ajustes do AP-PROJETO depois do L9 (097 K-299, E4.39)

Links: revisão de UX `docs/ux/097-revisao-l9.md` (M-1, M-2, B-2, B-3) e `docs/ux/097-revisao-k299.md`, pedido `docs/pedidos/097-resumo-filtro-time.md`, base develop e5092e05. Pedido de correção, sem especificação nova: sem plano antecipado, os itens da revisão de UX são os critérios.

## Veredito
**Aprovado.** Os quatro itens estão atendidos no código e provados por teste que cai quando o código é desfeito. Axe com zero violações críticas ou sérias no cartão AP-PROJETO e na página, nos estados cortado e "ver todos", nos temas claro e escuro. O diff é só de `web/` do apontamento (cartão, `dezMaiores.ts`, `textos.ts`, testes): sem tempo, percentil ou previsão, sem misturar fontes, sem pessoa. A suíte inteira é o check-run `bateria` do mesmo sha; aqui rodei os cenários afetados.

## Execução
- `vitest run src/features/apontamento --maxWorkers=2` (web): 14 arquivos, 199 testes passaram, 0 pulados.
- e2e chromium `--workers=1`: `apontamento-qa.spec.ts` (49 testes, cobre o AP-PROJETO) mais o spec novo: 51 passaram.
- Spec novo `e2e/tests/apontamento-ap-projeto-k299.spec.ts` (commit b715046b, meu): 12 projetos fictícios (um a mais que o corte), `rodarAxe` (WCAG 2.2 AA) no cartão e na página, nos dois estados, nos dois temas (`data-theme` conferido), com região viva e foco no botão.
- Vermelho antes do verde: os testes novos de B-2 e B-3 caem com o código desfeito (mutantes abaixo). Não rodei a base inteira contra os testes novos; o veredito é por mutante.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| M-1 sem `aria-expanded`, rótulo alterna, foco mantido | `dez-maiores.test.tsx` CA-33/34 e CA-35; e2e novo (`toBeFocused` no botão "Ver só os 10 maiores") | botão montado nos dois estados | passou |
| M-2 região viva `role=status` com texto nos dois estados | CA-35 (unitário); e2e novo (texto dos dois estados, 2 temas) | região montada antes da troca | passou |
| B-2 selo na linha Demais só se incompleto fora dos 10 | "B-2 ... leva o selo" e "B-2 sem incompleto" (p0 incompleto, visível, sem selo) | incompleto dentro x fora do corte | passou |
| B-3 altura piso 200, 40 por linha, teto 1200 | `alturaGrafico` (0, 5, 12, 30, 500) e "B-3" com 60 projetos | piso, 30 (limite), logo acima | passou |
| Acessibilidade do cartão, claro e escuro | e2e novo, axe nos dois estados | n/a | passou, zero bloqueantes |
| Sem métrica individual | diff lido: só projeto e horas | n/a | passou |

## Mutação no código alterado (restaurada pelo `git show HEAD:`; `git status` limpo)
- M1 selo do Demais calculado sobre todas as linhas: morto por "B-2 sem incompleto".
- M2 remove `role="status"`: morto por CA-35.
- M3 devolve `aria-expanded`: morto por CA-33/34 e CA-35.
- M4 teto 1201: morto por `alturaGrafico` e "B-3".
- M5 piso 199: morto por `alturaGrafico`.
- M6 texto "Mostrando todos" volta ao de corte: morto por CA-35.

Nenhum sobrevivente.

## Observações (sem bloqueio, já registradas pela UX)
- B-4 (teto 1200 px, rótulos se sobrepõem a partir de ~75 projetos) e B-5 (frase "reúne a maior parte das horas"): baixos da UX, opcionais; não medi sobreposição. Decisão da UX e do dono.
- Leitor de tela real não foi usado; o anúncio da região viva está provado só por DOM (`role=status` montado antes da troca).

## Bug
Nenhum aberto.

## Achados

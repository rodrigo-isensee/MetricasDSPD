---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k320-nomes-ocultos
commit: 0e0e41bd096a193ff1f5759366631ac7213216c7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---

# QA: K-320, linha de nomes ocultos nos quatro cartões do Apontamento (E4.51)

Links: A3 de `docs/ux/097-revisao-l3.md` e de `docs/ux/097-revisao-k303-k289.md` (a especificação do K-320), revisão de UX `docs/ux/097-revisao-k320.md`, review `docs/reviews/097-k320-nomes-ocultos.md`, pedido `docs/pedidos/097-resumo-filtro-time.md`. Base develop `4bb55c33`; código em `0e0e41bd`. Contrato da API: sem mudança (só web).

## Veredito
**Aprovado.** A linha aparece uma vez em cada um dos quatro cartões com nomes ocultos, some com nomes reais e não aparece no mapa sem pessoas. O A1 do review e o A2 da UX estão fechados: o mutante sem a guarda `linhas.length > 0` agora morre. Axe sem violação nos dois temas. Nenhum bug.

## Execução
- `npx vitest run src/features/apontamento --maxWorkers=2` (web, com o teste novo): 15 arquivos, 223 testes passaram, 0 pulados.
- `npx playwright test tests/apontamento-qa.spec.ts --project=chromium --workers=1 -g "CT-67|nomes ocultos"`: 3 passaram (CT-67 e os 2 axe novos).
- Suíte inteira: não rodada aqui; vale o check-run `testes` do PR. O projeto não tem check-run `bateria` nem `forge-testes`; o vermelho antes do verde sai por mutação (abaixo).

## Critério → teste → resultado
| Critério (A3) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Linha uma vez em Matriz, Qualidade, Capacidade e Mapa diário, com o texto único | `revisao-ux.test.tsx` K-320 (4 cartões, `toHaveLength(1)`, texto literal) | exatamente 1 por cartão | passou |
| Some com nomes reais | `revisao-ux.test.tsx` K-320 (4 cartões); `apontamento.test.tsx`; e2e CT-67 | `nomesReais` ligado | passou |
| Mapa sem pessoas (vazio ou só Outra área) não mostra a linha (A1 review, A2 UX) | **novo** `vazio-e-mapa.test.tsx` CA-5, os 2 testes (`queryByTestId('linha-nomes-ocultos')` nulo) | mapa sem pessoa | passou |
| Contraste e a11y da linha (`text-xs text-texto-2`) | **novo** e2e `acessibilidade automática`, "linha de nomes ocultos nos quatro cartões", tema claro e escuro: 4 linhas visíveis, zero críticas ou sérias, zero `color-contrast` | contraste em 2 temas | passou (2 de 2) |
| Sem ranking, métrica ou ordenação individual novos | leitura do diff (só um parágrafo de texto) | n/a | passou |

## Mutação à mão (restaurada pelo conteúdo do HEAD com `git show`; `git status` sem mudança em produção)
| Mutante | Arquivo | Resultado |
|---|---|---|
| M1 guarda `{linhas.length > 0 && <NotaNomesOcultos .../>}` vira `<NotaNomesOcultos .../>` | `CartaoDiario.tsx:279` | morto: `vazio-e-mapa.test.tsx` CA-5, 2 testes falham (13 passam). Antes do teste novo sobrevivia (223 verdes, relato do review). |
| M2 `if (r.nomesReais) return null` vira `if (false)` | `NotaNomesOcultos.tsx` | morto no review (4 testes "não mostra a linha com nomes reais"); não repeti |

## Dados e fronteiras
Fixtures fictícias (`respostaVazia`, `respostaVaziaComMapa`, "Pessoa n"). Fronteiras: mapa sem pessoa, nomes reais ligados e ocultos, 1280 px, tema claro e escuro.

## Bug
Nenhum. Médios e baixos: nenhum. Os dois baixos da revisão de UX (posição da linha varia entre cartões, A1 da UX) já estão registrados por ela, sem exigência de QA.

## Achados

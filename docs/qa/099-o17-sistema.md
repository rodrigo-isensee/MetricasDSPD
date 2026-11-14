---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-o17-sistema
commit: 6de12a7bf77278db64321c25e153d790a7f5107a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA: O17 por sistema com dado real (pedido 099, E3.189)

Branch `feature/099-o17-sistema`, código em 6de12a7b (head da branch ce2a47d8, só review por cima). Base 4bb55c33. Classe N. Decisão B' da Q-099-7 do dono: o O17 passa a ser dado real por sistema (`categoria_sistema`); a causa raiz fica "Sem dado real" com o motivo até o Registro de Problemas ter vínculo ao incidente; a causa aparente não vale como causa raiz. Sem especificação `099-*` própria do O17 em `docs/ux/`: os critérios abaixo vêm da decisão, da ADR 0030, do brief e da revisão de UX (`docs/ux/099-revisao-o17-sistema.md`). A suíte inteira e os `.pg` ficam para o check-run `bateria` do PR (I5); aqui rodei só os meus cenários.

## Achados
- A1 (recomendado) web/src/features/complementares/ramos.test.tsx:328 · `toHaveTextContent('Por sistema')` é satisfeito pelo texto de Cuidados ("Por sistema, nunca por pessoa"); apagar o `h4` "Por sistema" sobrevive na web (318 passam). Use `getByRole('heading', {level: 4, name: 'Por sistema'})`; o meu e2e QA-O17-1 já o pega.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 O17 só com Acelerato, por sistema real | o17-qa.test.ts (13 incidentes: Fluig 5, Protheus 5, Senior 3); complementares.test.ts (soma por sistema = base) | requisição, reaberto, excluído e fora da janela de 12 semanas ficam fora | passou |
| CA-2 ordem neutra: contagem decrescente, desempate por nome | o17-qa.test.ts (empate Fluig/Protheus) | empate | passou |
| CA-3 abaixo de 20 itens não publica estatística | O17 é contagem, sem percentil nem estatística; "Sem mínimo de amostra: é contagem" (`o17.ts:10`, nota "Como se calcula"); base 0 vira estado vazio, sem gráfico nem número | vazio (base 0): o17-qa.test.ts e QA-O17-3 | passou; ver observação abaixo |
| CA-4 causa raiz: "Sem dado real" com o motivo, nunca `[]` nem "Não informada" inflado | o17-qa.test.ts; complementares.test.ts; QA-O17-1 (claro e escuro) | `porCausa` nulo | passou |
| CA-5 sem selo de fictício; catálogo diz "Real" | e2e COMP-01 sustentação (1280 e 375) e COMP-12 | O17 fora do MOCK do e2e | passou |
| CA-6 contrato `resultados/O17` bate com o snapshot | `pnpm run docs:check`; `forge-check docs` | mudança incompatível com aceite (review) | passou |
| CA-7 subtítulos "Por causa raiz" e "Por sistema" e texto sem Metabase | QA-O17-1 e QA-O17-2, `h4` por papel, nos dois temas | com causa e sem causa | passou |
| CA-8 acessibilidade do cartão (claro e escuro) | axe AA em `[data-testid=metrica-O17]` nos 3 estados, zero críticas ou sérias e zero `color-contrast` (estado sem dado real) | tema claro e escuro | passou |
| CA-9 T2.6: critério datado e marcado | complementares.test.ts (marca só em período que cruza 2026-11-12) | período que não cruza | passou |
| CA-10 BusinessMap e Acelerato não se misturam; sem pessoa nem ranking individual | `selecionarAC`, `dominio: 'acelerato'`; cartão por sistema e causa, "nunca por pessoa" | n/a | lido no diff, sem achado |

Observação CA-3: o cartão exibe "Regra de amostra mínima: estatísticas com menos de 20 itens não são publicadas" como regra geral; o O17 não publica estatística, só contagem, então não há o que suprimir entre 1 e 19 incidentes (decisão de contagem anterior à 099, inalterada). Não é defeito.

## Execução
- packages/metricas, suíte inteira, `--maxWorkers=2`, 6de12a7b: `Test Files 46 passed (46)`, `Tests 1316 passed (1316)`. Com o meu `o17-qa.test.ts`: 4 testes, passam.
- packages/contratos: `Tests 220 passed (220)`.
- `pnpm run docs:check`: `docs:check: ok (1382 páginas Markdown, 69 métricas, 2 eventos).` `forge-check docs`: rc 0.
- e2e chromium, `--workers=1`, `-g COMP-12`: `2 passed (13.2s)`; `-g COMP-01`: `8 passed (1.3m)` (4 painéis a 1280 e 375, axe AA incluso).
- e2e chromium-api (`tests-api/o17-sistema-qa.spec.ts`, 6 testes, stub da API num só comando): `6 passed (27.5s)`, claro e escuro. Lint e `tsc --noEmit` do e2e limpos.
- O stub `api-stub-065` responde 500 para o O17 (o regex `SUST` do stub não inclui o O17, que cai nos filtros do fluxo e quebra em `prioridade.length`). É limite do stub de teste, não do produto (o servidor usa os filtros de Sustentação); por isso o meu spec fornece o corpo do O17 com o formato do contrato. O e2e `chromium` não alcança o ramo da base real (o mock traz a extensão).
- Vermelho antes do verde: os testes novos são de caracterização de regra já implementada, não de correção; a prova de que mordem é a mutação abaixo (nenhum teste novo nasceu verde sem poder cair). `forge-testes` não se aplica ao projeto (sem o binário no pedido); os mutantes foram feitos à mão e restaurados por `git show HEAD:<arquivo>` (árvore limpa ao fim).

## Mutação à mão nas regras (arquivos do diff)
| Mutante | Arquivo | Quem matou | Resultado |
|---|---|---|---|
| `motivoCausaRaiz: null` sempre | o17.ts | complementares.test.ts ("sem extensão") | morto |
| `campoDisponivel: true` | o17.ts | complementares.test.ts ("sem extensão") | morto |
| `afeta: ['S2']` (versão do critério) | criterios.ts | complementares.test.ts (marcação do O17) | morto |
| `{true && (` no `Leia` do cartão | sustentacao.tsx | ramos.test.tsx ("O17 sem causa raiz...") | morto |
| ordem `[s.n, s.sistema]` (cresc.) | o17.ts | **sobrevivia** à suíte inteira (1316); morto por o17-qa.test.ts (1 falha) | morto após o meu teste |
| `natureza !== 'incidente'` | o17.ts | **sobrevivia** à suíte inteira; morto por o17-qa.test.ts (3 falhas) | morto após o meu teste |
| remove `x.fechado &&` | o17.ts | **sobrevivia**; morto por o17-qa.test.ts depois de somar o caso "reaberto" (2 falhas) | morto após o meu teste |
| `... \|\| true` no filtro de período | o17.ts | o17-qa.test.ts (3 falhas) | morto |
| apaga o `h4` "Por sistema" | sustentacao.tsx | **sobrevive** na web (318 passam); morto pelo e2e QA-O17-1 | A1 (recomendado) |

Os três primeiros sobreviventes eram linhas de regra já existentes (não mudadas pelo diff) sem teste que fixasse o conjunto de incidentes; o meu `o17-qa.test.ts` os cobre com números à mão, não derivados da função.

## Cenários extras (bordas)
- Período sem incidentes: cartão `data-estado="vazio"`, "Nenhum item encontrado", sem gráfico, sem `NaN`, sem erro de carga; axe passa nos dois temas (resposta à UX achado 6). Nesse estado o motivo da causa raiz não aparece (o cartão inteiro está vazio); é coerente e honesto, sem bug.
- Causa presente (extensão/mock): subtítulos, frase "A causa raiz vem do Registro de Problemas; a lista de causas é uma proposta do time." e nada de "Metabase" nem "Sem dado real".
- Teclado e leitor de tela: sem mudança de interação no diff (o foco do "Leia junto" para `#o17` segue em COMP-14 do review); subtítulos por `h4` sob o `h3` do cartão, verificados por papel.
- Regras do projeto: sem ranking individual, sem comparação entre times, sem mistura BusinessMap/Acelerato, nenhum dado de pessoa nem texto livre no resultado.

## Commits desta rodada
- ccdcdbbd `docs/ux/099-revisao-o17-sistema.md` (revisão de UX, só ela).
- 0a72b90e testes do QA: `packages/metricas/src/acelerato/o17-qa.test.ts` e `e2e/tests-api/o17-sistema-qa.spec.ts` (teste fora do domínio do review, `R-REVIEW`).
- Este parecer.

## Parecer
Aprovado, sem bugs abertos. Recomendado (não bloqueia): A1. Suíte inteira, `.pg` e o e2e completo no check-run `bateria` e no `e2e` do PR (I5).

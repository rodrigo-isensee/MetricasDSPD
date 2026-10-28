---
tipo: qa
contrato: 1
pedido: 026-front-do-011-lote3
branch: feature/026-lote3-operacionais
commit: 15ad62ab9efae690f7082a3ab9f28acc06a8c40d
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---
# QA do front do lote 3 das operacionais (pedido 026, etapa E1.3, cartão K-111), reteste

Links: especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (fichas O19 a O26), review `docs/reviews/026-lote3-operacionais.md` (re-review em 15ad62a), pedido `docs/pedidos/026-front-do-011-lote3.md`. Reteste do parecer reprovado de 6199302 (testado em c72b955/adc93fa).

## Resultado
- `pnpm run pronto` completo em 15ad62a: rc=0.
- E2E completa, comando `cd e2e && pnpm exec playwright test --retries=0 --workers=2 --reporter=line`: **746 passaram, 0 falharam** (24,9 min). `pgrep` limpo antes de cada rodada (esperei o `pronto` do 042 terminar).
- A1 (L3-001) resolvido: SIS-CONS-02 passou; "Leia junto" da visão diária leva a `cadencia=semanal#o19` e `#o20`.
- A2 (L3-002) resolvido: F4 pela regra nova da ADR 0003 (primeira medição fora do p95, n >= 20): n=20 em 40 trocas, mediana 37,4 ms, **p95 44,1 ms** contra 100 ms. Primeira medição a frio, à parte: 131,5 ms (informativa, sem limite próprio). As leituras de 134 a 141 ms vinham da regra antiga. Sem regressão na branch, então a develop (9cc84d3) não foi medida e a worktree temporária não foi criada.
- A3 a A5 resolvidos pelo 041: CLS a 375 px em /operacional 0,021 e no Resumo 0,021; COMP-01 a 1280 px (e 375 px) das quatro cadências passou com axe AA.
- Vermelho/mutação: não se aplicam à volta (sem teste novo nem `bin/`); os testes que falhavam no parecer anterior (SIS-CONS-02, perf F4, CLS, COMP-01) agora passam sem edição de teste desde 0e78a55.

## Escopo
Coberto: os 7 cartões na seção "Mais métricas" do `/operacional?cadencia=semanal` e o bloco O23 no O2 (visão diária). Não coberto: valores numéricos (unitários do front), integrações reais, back (E2.1, em mock, entra pela E2E do front).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Presença dos 7 cartões, estado ok/vazio/insuficiente, axe AA, sem rolagem horizontal, 1280 e 375 px | `operacional-lote3` L3-01 | 375 px | passou |
| O23 é bloco do O2, não cartão; axe | L3-01b | n/a | passou |
| O22 e O26 sem pessoa nem ranking | L3-02 e CT-63 a CT-65 | ranking, pessoa | passou |
| Carregando | L3-03 | esqueleto, aria-busy | passou |
| Vazio (sem percentil) | L3-04 | vazio | passou |
| Erro isolado, "Tentar de novo", erro permanente, erro do O2 | L3-05, L3-06, L3-07 | erro | passou |
| Abaixo de 20: sem percentual e sem P50/P85 | L3-08 | n = 2 de 20 | passou |
| Catálogo 65, 33, 32, "14 de 14" | COMP-03, COMP-12, LV-14, SIS-CONS-01, preferências | contagem | passou |
| "Leia junto" da visão diária leva ao O19 e ao O20 | SIS-CONS-02 | link entre cadências | passou (era A1) |
| Orçamento ADR 0003 (F4, CLS a 375 px) | perf | CLS < 0,1; F4 < 100 ms | passou (F4 p95 44,1 ms; CLS 0,021) |

## Achados
- A6 (recomendado) web/src/components/ui/BadgeBase.tsx:41 · Em `mock=vazio`, O21, O22, O24 e O25 mostram "Amostra insuficiente: 0 de 20" junto de "Nenhum item encontrado", misturando vazio e insuficiente. Padrão anterior ao lote 3; cartão da UX.
- A7 (recomendado) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:157 · O26 mostra percentual de faixa com 6 entregas, mas a nota diz "só com 20 entregas ou mais na faixa" (A12 do review). Decisão do dono de 2026-10-27 (A10) ajusta a ficha; cartão da UX.
- A8 (recomendado) e2e/tests/sustentacao-no-operacional-qa.spec.ts:630 · A varredura de pessoa ignora "trocas de responsável" (nome do O26); remover o ajuste se a UX trocar o termo. Aceito pelo Jarvis.

## Resultado da execução
Ambiente: Chromium, preview local, `--workers=2`, uma suíte por vez. Bugs: `docs/qa/bugs/L3-001-leia-junto-da-visao-diaria-nao-leva-ao-o19-e-o20.md` (resolvido) e `docs/qa/bugs/L3-002-f4-resposta-visual-acima-de-100-ms.md` (resolvido).

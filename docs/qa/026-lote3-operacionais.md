---
tipo: qa
contrato: 1
pedido: 026-front-do-011-lote3
branch: feature/026-lote3-operacionais
commit: adc93fa9359083e249901f08bc17fe7a8e4b700e
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 2
bugs_baixos: 0
aceite_usuario: sim
data: 2026-10-27
---
# QA do front do lote 3 das operacionais (pedido 026, etapa E1.3, cartão K-111)

Links: especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (fichas O19 a O26), review `docs/reviews/026-lote3-operacionais.md` (c72b955), pedido `docs/pedidos/026-front-do-011-lote3.md`. Código testado: c72b955 (sem mudança em `web`, `server`, `packages`); testes novos em adc93fa.

## Resultado
- `pnpm run pronto` completo: rc=0 (depois das últimas edições, só de E2E, `format:check`, `lint` e `typecheck` do e2e também rc=0).
- E2E completa, comando `cd e2e && pnpm exec playwright test --retries=0 --workers=2 --reporter=line`: **714 passaram, 5 falharam, 1 não rodou** (23,7 min). Das 5 falhas, 3 são as do 041 (A3, A4, A5) e 2 são novas (A1, A2).
- A4 do review cumprido: contagens 65, 33 e "14 de 14" nas E2E (`complementares`, `intensivo-sistemico`, `lacuna-de-valor`, `preferencias`); também a lista de 14 cartões do COMP-01, o selo fictício de O22 e O26, "13 complementares" no COMP-09 e os pares do COMP-13.
- Vermelho: na primeira rodada completa, com o head sem edição de teste, deram 11 falhas, 6 delas por contagem antiga ou cartão novo; ficaram verdes depois do ajuste.
- Mutação e `forge-testes` não se aplicam (pedido de front, sem `bin/` nem mutante declarado).

## Escopo
Coberto: os 7 cartões na seção "Mais métricas" do `/operacional?cadencia=semanal` e o bloco O23 no O2 (visão diária). Não coberto: valores numéricos (unitários do front), integrações reais, back (E2.1, sem commit).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Presença dos 7 cartões, estado ok/vazio/insuficiente, axe AA, sem rolagem horizontal, 1280 e 375 px | `operacional-lote3` L3-01 | 375 px | passou |
| O23 é bloco do O2, não cartão; axe | L3-01b | n/a | passou |
| O22 e O26 sem pessoa nem ranking; "conta trocas, nunca quem" | L3-02 e CT-63 a CT-65 (varredura do DOM) | ranking, pessoa | passou |
| Carregando | L3-03 | esqueleto, aria-busy | passou |
| Vazio (sem percentil) | L3-04 | vazio | passou |
| Erro isolado, "Tentar de novo", erro permanente, erro do O2 sem bloco órfão | L3-05, L3-06, L3-07 | erro | passou |
| Abaixo de 20: sem percentual e sem P50/P85 (O25, O21, O19, O22, O24) | L3-08 | n = 2 de 20 | passou |
| Catálogo 65, 33, 32, "14 de 14", fictícios 65 | COMP-03, COMP-12, LV-14, SIS-CONS-01, preferências | contagem | passou |
| "Leia junto" da visão diária leva ao O19 e ao O20 | SIS-CONS-02 | link entre cadências | **falhou** (A1) |
| Orçamento ADR 0003 (F4, CLS a 375 px) | perf | CLS < 0,1; F4 < 100 ms | **falhou** (A2, A3, A4) |

## Achados
- A1 (bloqueante) web/src/features/complementares/LeiaJunto.tsx:34 · Na visão diária, "Leia junto: O19" (BLOQUEADOS) e "O20" (O1) não fazem nada: tratam o par como do mesmo painel, mas O19 e O20 só existem na semanal. Falha SIS-CONS-02. Bug L3-001. Navegar a `cadencia=semanal#o19`.
- A2 (bloqueante) e2e/perf/perf.spec.ts:126 · F4 resposta visual 134 a 141 ms contra 100 ms (ADR 0003), em 2 rodadas (2 e 1 worker). Fora da lista do 041; causa não isolada (a `develop` não foi medida). Bug L3-002. Repetir na `develop` e corrigir.
- A3 (bloqueante) e2e/perf/perf.spec.ts:171 · CLS a 375 px em /operacional: 0,115 (limite 0,1). Falha conhecida, corrigida no pedido 041 (ainda fora da `develop`); conta para o veredito, sem correção aqui.
- A4 (bloqueante) e2e/perf/perf.spec.ts:195 · CLS do Resumo a 375 px: 0,115. Mesma referência: 041.
- A5 (bloqueante) e2e/tests/complementares.spec.ts:61 · COMP-01 da Sustentação a 1280 px: axe `target-size` no botão "Sobre a janela fixa" (#ei-sust). Falha conhecida, corrigida no 041; fora do lote 3.
- A6 (recomendado) web/src/components/ui/BadgeBase.tsx:41 · Em `mock=vazio`, O21, O22, O24 e O25 (e O5, O6, O8 do lote 1) mostram "Amostra insuficiente: 0 de 20" junto de "Nenhum item encontrado", misturando vazio e insuficiente. Padrão anterior ao lote 3; a UX decide.
- A7 (recomendado) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:157 · O26 mostra percentual de faixa com 6 entregas (7,9%), mas a nota diz "percentual só com 20 entregas ou mais na faixa". É o A12 do review; texto e comportamento divergem.
- A8 (recomendado) e2e/tests/sustentacao-no-operacional-qa.spec.ts:630 · A varredura de pessoa agora ignora "trocas de responsável" (nome do O26). Se a UX trocar o termo, remover o ajuste.

## Resultado da execução
Ambiente: Chromium, preview local, `--workers=2`, uma suíte por vez (`pgrep` limpo antes de cada rodada). Bugs: `docs/qa/bugs/L3-001-leia-junto-da-visao-diaria-nao-leva-ao-o19-e-o20.md`, `docs/qa/bugs/L3-002-f4-resposta-visual-acima-de-100-ms.md`.

---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l2b-apaga-simulado
commit: 456e103e5556b7ff117f1762d4fffcf5ebe00fc7
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: pedido 099, L2b e L2c (apagar o simulador e o selo Simulado da web)

Links: análise `docs/analises/099-varredura-simulado.md`, decisão do dono no pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

## Veredito
**Aprovado** sobre o HEAD 456e103e (base 58882fcf). Nenhum bug aberto. O diff (18 arquivos em `web/src`, 38 inserções e 1053 remoções) apaga `FonteComSimulado`, `simulado.ts`, `SeloSimulado`, `OrigemCartao.simulado`, `SemDadoRealErro.simulavel`, o ramo simulado de `CartaoMetrica`, `StatusMeta`, `CartaoT3`, `OrigemDosCartoes` e o token do selo em `tokens.css`. Sobra um achado recomendado (E2E de API desatualizado, fora do CI).

## Critério, teste, resultado
| Critério (L2b, L2c e decisão do dono) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nenhum caminho da web produz ou mostra métrica simulada | `grep -rniE "simulav\|podeSimular\|useCartaoSimulado\|SeloSimulado\|RegistroSimulados\|ehFonteSimuladora\|origensSimuladas\|selo-simulado" web/src`: zero ocorrências; `tsc --noEmit` em `web/`: rc 0 (nada importa o que foi apagado) | símbolo apagado: import residual não compila | passa |
| Restos de `simulad` em `web/src` | `grep -ri simulad web/src`: só falha/erro/latência simulados do mock de desenvolvimento (`useMetrica.ts` falhasSimuladas, `useErroDePainelSimulado`, `data/simulacao.ts`, `nucleoMock.ts`, `MockFonteMetricas.ts`, `?mock=erro`) e fixtures de teste ("falha simulada", "Erro simulado"). Nenhum produz número de métrica, e `?mock=` é ignorado contra a API (`origem.test.tsx`) | fonte `api` ignora o modo mock | aceito (não é dado de métrica) |
| Cartão sem dado real mostra "Sem dado real" e o motivo, sem selo | `features/coleta/origem.test.tsx` (O12, Tático inteiro, acessibilidade em texto, `?mock=` ignorado) | cartão sem fonte real vs cartão real no mesmo painel | passa |
| Mesmo com `simulavel: true` na resposta, nenhum selo Simulado | `app/composicao.test.tsx` (fetch stub sem `simulavel`; `queryByText(/Simulado/i)` ausente, "Sem dado real" presente) | ausência do selo em todos os cartões do Operacional | passa |
| Selo de desvio do T3 e `StatusMeta` sem ramo simulado | `features/tatico/tatico.test.tsx` (o teste A-9 do simulado foi removido com o ramo; os de desvio seguem) | `Desvio acima de 10 p.p.` só por regra de dado real | passa |
| Cobertura dos painéis Sustentação e Visão geral sem dado real, antes em `coleta/simulado.test.tsx` (apagado) | seguem em `sustentacao.test.tsx`, `bloqueio-sem-dado.test.tsx`, `calibracao.test.tsx` e `origem.test.tsx` | n/a | passa (cobertura migrada, nada perdido) |
| Cobertura web 100% e suíte inteira | check `testes` do CI, run 43143807262, sha 456e103e | limiar 100% bloqueante | passa (success) |

## Execução
- `TZ=UTC VITEST_MAX_WORKERS=2 vitest run src/app/composicao.test.tsx src/features/tatico/tatico.test.tsx src/features/coleta/origem.test.tsx` na worktree 041b: 3 arquivos, 40 testes, 40 passaram. Nada contra base real nem `.env*`.
- CI do head (run 43143807262, push, conclusão success): `rapida`, `filtro`, `openapi`, `testes` (cobertura bloqueante), `seguranca`, `imagem`, `build` e `banco` success; `e2e-parte`, `e2e` e `perf` ficaram `skipped` neste run de push, então o E2E do head não foi visto. O projeto `chromium` do E2E (CI) roda sobre a fonte mock; os projetos `chromium-api` e `perf-api` não rodam no CI.
- Vermelho antes do verde: a mudança é remoção; o teste ajustado de `composicao.test.tsx` já cobre a ausência do selo, e o `tsc` e o grep provam a ausência de importadores. Os testes de regressão "Sem dado real" vieram vermelhos na mutação do L2a (parecer `docs/qa/099-l2a-sem-opcao-simulado.md`) e não mudaram aqui. Sem mutação nova: o diff não adiciona regra.

## Achados
- A1 (recomendado) e2e/tests-api/simulado-070-l3.spec.ts:29 · o spec ainda espera `selo-simulado-*` visível (também e2e/perf/perf-api.spec.ts:181); falha se rodado contra a API desde o L1. Fora do CI; apagar ou inverter na etapa L5 de E2E.

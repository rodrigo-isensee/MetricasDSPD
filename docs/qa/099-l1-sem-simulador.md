---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l1-sem-simulador
commit: dec8924c79b0ea678d889272f68237c1c3f8dc48
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: pedido 099, L1 (desligar o simulador na web)

Links: análise `docs/analises/099-varredura-simulado.md` (lote L1, guardas G1 a G4), decisão do dono no pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

## Veredito
**Aprovado** sobre o HEAD dec8924c (base develop eac38a64). Nenhum bug aberto. Escopo conferido contra o diff: `web/src/app/App.tsx` (remove o import e o uso de `FonteComSimulado`; `fonte === 'api'` devolve `HttpFonteMetricas` pura) e dois testes novos em `web/src/app/composicao.test.tsx`. Ramos `mock` e valor inválido de `VITE_FONTE` intactos no diff.

## Critério, teste, resultado
| Critério (L1 / decisão do dono) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Fonte de uso diário (`VITE_FONTE=api`) é a HTTP pura | `composicao.test.tsx` "a fonte padrão (api) é a HTTP pura..." | `instanceof HttpFonteMetricas` (o decorador não é instância dela) | passa; cai na mutação |
| Cartão sem dado real mostra "Sem dado real", sem selo "Simulado", mesmo com `simulavel: true` | `composicao.test.tsx` "sem dado real, nenhum cartão do Operacional..." | `simulavel: true` da API, o caso que antes acionava o simulado | passa |
| Modo homologação (`VITE_FONTE` diferente de `api`) não mudou | testes existentes de `composicao.test.tsx` (mock explícito, valor inválido falha na partida, base absoluta rejeitada) | `VITE_FONTE=mock` e valor inválido | passam, sem alteração no diff |

## Execução
- `vitest run src/app --maxWorkers=2` (R-TETO) em `web/` da worktree 041b: 5 arquivos, 78 testes, 78 passaram (16,8 s).
- Mutação (religar o `FonteComSimulado` em `App.tsx`, import e retorno): `composicao.test.tsx` 1 falhou, 8 passaram. Caiu o teste da fonte HTTP pura: `AssertionError: expected FonteComSimulado{ …(5) } to be an instance of HttpFonteMetricas`. O teste do selo continuou verde. `App.tsx` restaurado; `git status` limpo antes do parecer.
- Vermelho antes do verde: a mutação reproduz o estado da base (decorador ligado) e derruba o teste que prova a correção; o teste do selo não é prova de vermelho (ver nota).

## Nota: o teste do selo é guarda de regressão
O teste "nenhum cartão mostra o selo Simulado" passa nos dois casos em jsdom (observado: com o decorador religado ele continuou verde); ele protege contra volta do selo, mas não prova a correção. A prova do L1 é o teste da fonte HTTP pura. A prova em navegador real fica com o E2E do CI (G3 da análise, projeto `chromium-api`), ainda não escrito neste lote (é o L5).

## Fora do escopo desta passada
Suíte completa e E2E: rodam no CI do PR (check-run `bateria` do mesmo sha). Não rodei a suíte inteira local. Guardas G1 a G4 e remoção do código (L2 a L5) são de outras etapas; `perf-api` mede painel com simulado e a referência muda (R2 da análise), a ajustar no L5.

## Achados

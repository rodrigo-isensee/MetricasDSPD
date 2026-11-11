---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-l1-sem-simulador
commit: b7d0e684bbed4b52373dcce4a9451256330c2cd6
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: pedido 099, L1 (desligar o simulador na web)

Links: análise `docs/analises/099-varredura-simulado.md` (lote L1, guardas G1 a G4), decisão do dono no pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

Esta é uma revalidação do parecer anterior (commit dec8924c), agora no head b7d0e684.

## Veredito
**Aprovado** sobre o HEAD b7d0e684 (base develop f4c122f1). Nenhum bug aberto. O escopo testado não mudou: `web/src/app/App.tsx` (remove o import e o uso de `FonteComSimulado`; `fonte === 'api'` devolve `HttpFonteMetricas` pura) e os dois testes novos em `web/src/app/composicao.test.tsx`. Ramos `mock` e valor inválido de `VITE_FONTE` intactos.

## Delta do domínio do QA (dec8924c..b7d0e684)
`forge-check parecer delta` lista só documentação no domínio: `docs/analises/099-dado-real-operacional.md`, `docs/analises/099-varredura-simulado.md`, ADR 0028 e ADR 0030. `git diff dec8924c b7d0e684 -- web/src/app` vazio e nenhum commit tocou `web/src/app` no intervalo. O resto do diff do intervalo é o merge limpo da develop (código e testes de outros pedidos, fora do escopo) e pareceres de outros papéis. O que foi testado não mudou.

## Critério, teste, resultado
| Critério (L1 / decisão do dono) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Fonte de uso diário (`VITE_FONTE=api`) é a HTTP pura | `composicao.test.tsx` "a fonte padrão (api) é a HTTP pura..." | `instanceof HttpFonteMetricas` (o decorador não é instância dela) | passa; cai na mutação (parecer anterior) |
| Cartão sem dado real mostra "Sem dado real", sem selo "Simulado", mesmo com `simulavel: true` | `composicao.test.tsx` "sem dado real, nenhum cartão do Operacional..." | `simulavel: true` da API, o caso que antes acionava o simulado | passa |
| Modo homologação (`VITE_FONTE` diferente de `api`) não mudou | testes existentes de `composicao.test.tsx` (mock explícito, valor inválido falha na partida, base absoluta rejeitada) | `VITE_FONTE=mock` e valor inválido | passam, sem alteração no diff |

## Execução
- `vitest run src/app --maxWorkers=2` (R-TETO) em `web/` da worktree 041b no head b7d0e684: 5 arquivos, 78 testes, 78 passaram (12,7 s).
- Mutação e vermelho antes do verde: valem os do parecer anterior (religar o `FonteComSimulado` derruba o teste da fonte HTTP pura, `expected FonteComSimulado{ …(5) } to be an instance of HttpFonteMetricas`); `App.tsx` e o teste são idênticos no head novo, então não repeti.
- O teste do selo continua guarda de regressão (passa com e sem o decorador em jsdom); a prova em navegador real fica com o E2E do CI (G3, projeto `chromium-api`, lote L5).

## Fora do escopo desta passada
Suíte completa e E2E rodam no CI do PR (check-run `bateria` do mesmo sha); não rodei a suíte inteira local. Guardas G1 a G4 e remoção do código (L2 a L5) são de outras etapas; `perf-api` mede painel com simulado e a referência muda (R2 da análise), a ajustar no L5.

## Achados

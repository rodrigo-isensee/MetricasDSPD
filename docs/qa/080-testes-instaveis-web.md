---
tipo: qa
contrato: 1
pedido: 080-testes-instaveis-web
branch: feature/080-testes-instaveis-web
commit: 8784bf130f3290f5bfb6e0c9d30f8e20d1782605
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: 080-testes-instaveis-web (volta 2, rodadas refeitas do zero)

Veredito: aprovado. A violação de target-size que reprovou a rodada anterior não reapareceu em 50 rodadas. O L3-01 a 375 px passou 20 de 20. A 1280 px passou 17 de 20 nas 20 rodadas pedidas, e as 3 falhas foram estouro do timeout de 30 s (nenhuma foi violação do axe), com a máquina saturada por outros agentes (carga 16 em 8 núcleos na primeira série). Uma série extra de 10, com a máquina livre (carga cerca de 2), passou 10 de 10.

## Achados
- A1 (recomendado) e2e/tests/operacional-lote3.spec.ts:42 · L3-01 a 1280 px estourou o timeout de 30 s em 3 de 20 rodadas sob carga alta (page.evaluate); com a máquina livre passou 10 de 10; observar a CI e, se repetir, medir o custo do helper.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1 (K-173, `técnico`) | `operacionais.test.tsx`, 5 rodadas do parecer anterior | espera da renderização antes de ler o SVG | evidência anterior vale: 5 de 5; sem código novo |
| E2 (K-192, `técnico`) | E2E L3-01 (`operacional-lote3.spec.ts`), Chromium, workers=1 | target-size 24 px a 1280 px e 44 px a 375 px, com a altura da página estável antes do axe | 1280 px: 17 de 20 (3 timeouts sob carga) e 10 de 10 sem carga; 375 px: 20 de 20 |

## Cenários e resultado real
- K-173: sem código novo desde o parecer anterior; pela DECISÃO TÉCNICA de 2026-11-07 10:11 do pedido, a evidência anterior (5 de 5) vale. `git diff 852b9406f019223acd82563cd21fc3a3d42a493a 8784bf130f3290f5bfb6e0c9d30f8e20d1782605 --stat -- web` sem saída: `web/` sem diferença contra a base.
- K-192, comando em lotes de 10: `npx playwright test tests/operacional-lote3.spec.ts -g "L3-01 os 7.*a <largura> px" --project=chromium --workers=1 --repeat-each=10 --reporter=line`. A 1280 px: lote 1, 8 passaram e 2 falharam (5,9 min, carga 16); lote 2, 9 passaram e 1 falhou (3,2 min). Série extra a 1280 px: 10 passaram (1,8 min). A 375 px: 10 e 10 passaram (1,7 min cada). Falhas lidas no `error-context.md` e na saída: `Test timeout of 30000ms exceeded`, uma delas em `page.evaluate`.
- O A2 anterior (375 px por tempo) não reapareceu.
- Helper `esperarAlturaEstavel`: espera por condição (cartões sem `aria-busy="true"` e `scrollHeight` estável em leituras seguidas, `expect.poll`); sem `waitForTimeout` nem espera fixa.
- Escopo: o diff de `e2e/` contra a base é só `e2e/tests/operacional-lote3.spec.ts`; nenhuma regra do axe, timeout, retry nem scroll ao topo mudou. `LeiaJunto.tsx` igual à base; `web/`, `server/`, `packages/` e `.github` sem diferença contra a base.
- Não rodei a suíte inteira, o vermelho antes do verde nem a mutação neste parecer: rodei só o L3-01 em repetição (E2) e reaproveitei a evidência anterior do K-173. O motivo é que a mudança é só de teste E2E (um helper de espera), sem código de produção nem guarda nova. A revisão de interface (E1.4) deixou de se aplicar.
- O commit testado é o do código, 8784bf13; a ponta da branch tem só pareceres depois dele.

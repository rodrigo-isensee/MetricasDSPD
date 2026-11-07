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
# QA: 080-testes-instaveis-web (volta 2)

Veredito: aprovado. O L3-01 passou em 59 de 60 rodadas locais (1280 px: 19 de 20 e, em segunda série, 20 de 20; 375 px: 20 de 20), contra 7 de 9 a 1280 px no parecer anterior. Resta uma falha isolada a 1280 px, de causa não capturada, registrada como recomendação.

## Achados
- A1 (recomendado) e2e/tests/operacional-lote3.spec.ts:42 · L3-01 a 1280 px falhou 1 de 20 na primeira série (a segunda série passou 20 de 20); o erro não foi capturado (saída cortada), então a causa ficou sem prova; observar a CI.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1 (K-173, `técnico`) | `operacionais.test.tsx` linhas 170 a 178, 5 rodadas do parecer anterior | espera da renderização antes de ler o SVG | evidência anterior vale: 5 de 5; sem código novo |
| E2 (K-192, `técnico`) | E2E L3-01 (`operacional-lote3.spec.ts`), Chromium, workers=1, `--repeat-each=20` | target-size 24 px a 1280 px e 44 px a 375 px, com a altura da página estável antes do axe | 1280 px: 19 de 20 e 20 de 20; 375 px: 20 de 20 |

## Cenários e resultado real
- K-173: sem código novo desde o parecer anterior; pela DECISÃO TÉCNICA de 2026-11-07 10:11 do pedido, a evidência anterior (5 de 5) vale. `git diff 852b9406f019223acd82563cd21fc3a3d42a493a HEAD -- web` sem saída: `web/` sem diferença contra a base.
- K-192, comando: `npx playwright test tests/operacional-lote3.spec.ts -g "L3-01 os 7.*a <largura> px" --project=chromium --workers=1 --repeat-each=20`. A 1280 px, primeira série: 19 passaram, 1 falhou (4,6 min); segunda série: 20 passaram (3,4 min). A 375 px: 20 passaram (3,4 min). O A2 anterior (375 px por tempo) não reapareceu.
- Helper `esperarAlturaEstavel`: espera por condição (cartões sem `aria-busy="true"` e `scrollHeight` igual em 5 leituras seguidas, `expect.poll` com intervalo de 100 ms); nenhum `waitForTimeout` nem espera fixa.
- Escopo: o diff de `e2e/` contra a base é só `e2e/tests/operacional-lote3.spec.ts` (helper e chamadas); nenhuma regra do axe, timeout, retry nem scroll ao topo mudou. `LeiaJunto.tsx` igual à base; `web/`, `server/`, `packages/` e `.github` sem diferença.
- Fora de escopo, conforme o brief: suíte inteira, vermelho antes do verde e mutação (sem código de produção nem guarda nova); revisão de interface (E1.4) deixou de se aplicar.
- Observação: a head da branch é 64b2ed0c (parecer do review sobre o 8784bf13); o commit testado é o do código, 8784bf13.

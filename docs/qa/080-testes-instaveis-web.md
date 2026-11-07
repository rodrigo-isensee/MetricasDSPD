---
tipo: qa
contrato: 1
pedido: 080-testes-instaveis-web
branch: feature/080-testes-instaveis-web
commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-07
---
# QA: 080-testes-instaveis-web

Veredito: reprovado. O K-173 está provado estável. O K-192 (E2) continua intermitente no head: o E2E L3-01 falhou em 2 de 9 rodadas locais, a 1280 px, com o mesmo `target-size` em `leia-junto-o15`.

## Achados
- A1 (bloqueante) web/src/features/complementares/LeiaJunto.tsx:38 · E2 não cumprida: o L3-01 a 1280 px falhou com target-size em `leia-junto-o15 li:nth-child(3) a` em 2 de 9 rodadas locais no head; o gap-y-1 não eliminou a instabilidade.
- A2 (recomendado) e2e/tests/operacional-lote3.spec.ts:22 · L3-01 a 375 px estourou 30000 ms na rodada 1 do segundo lote (a mesma que falhou o axe a 1280 px), com o servidor frio; reportar à parte, sem causa provada.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| E1 (K-173, `técnico`) | `operacionais.test.tsx` linha 170 a 178, 5 rodadas com `--maxWorkers=2` | espera da renderização antes de ler o SVG | passou: 5 de 5, 46 testes por rodada |
| E2 (K-192, `técnico`) | E2E L3-01 (`operacional-lote3.spec.ts`), Chromium local | target-size 24 px a 1280 px e 44 px a 375 px | falhou: intermitente (abaixo) |

## Cenários e resultado real
- K-173: confirmei que o teste do O20 (`operacionais.test.tsx`, 170 a 178) usa `waitFor` antes de ler `.marca-criterio` e o `title`. Comando: `TZ=UTC npx vitest run src/features/complementares/operacionais.test.tsx --maxWorkers=2`, 5 vezes, na worktree; resultado de cada uma: `Test Files 1 passed`, `Tests 46 passed (46)`. Sem código no K-173, como o item E1 prevê.
- K-192, medida do alvo (achado da revisão de interface): script temporário no Playwright, Chromium, 12 cargas de `/operacional?cadencia=semanal` por largura, com `getBoundingClientRect` dos 3 links de `leia-junto-o15` e axe. A 1280 px: altura 24 px nos 3 links (larguras 157,5; 206,6; 524,7), o terceiro numa segunda linha 28 px abaixo (folga de 4 px). A 375 px: altura 44 px nos 3 links (larguras 157,5; 206,6; 309), 48 px entre os topos. Nessas 24 cargas o axe não acusou target-size (0 de 12 a 1280 px, 0 de 12 a 375 px). O script foi apagado e não foi commitado.
- K-192, E2E L3-01 (Chromium disponível, `chromium-1248`): `npx playwright test tests/operacional-lote3.spec.ts -g "L3-01 os 7" --project=chromium --workers=1`, 9 rodadas de 2 testes (1280 e 375 px). Rodadas 1 a 3 do primeiro lote: 2 passaram, 2 passaram, 1280 px falhou na terceira (a 375 px passou). Segundo lote, 6 rodadas: a primeira falhou nos dois testes, as cinco seguintes passaram. A 1280 px: 7 de 9 passaram, 2 falharam. A 375 px: 8 de 9 passaram, 1 estourou o tempo. Erro das duas falhas de 1280 px: `target-size`, impacto serious, alvo `div[data-testid="leia-junto-o15"] > .gap-x-3.list-none.p-0 > li:nth-child(3) > a`.
- Nas medidas fora do axe o alvo tem 24 px e 44 px, então o defeito não é o tamanho declarado: a falha do axe aparece em parte das cargas do L3-01 e a causa não ficou provada (sem trace analisado). O `gap-y-1` não a eliminou. Quem corrige é o `react-frontend`.
- Conferência de escopo: `git diff 852b9406f019223acd82563cd21fc3a3d42a493a HEAD --stat` lista só `docs/reviews/080-testes-instaveis-web.md` e `web/src/features/complementares/LeiaJunto.tsx` (2 inserções e 2 remoções em código). `server/`, `packages/`, `.github` e `e2e/` sem diferença; nenhuma regra do axe, timeout ou retry mudou.
- Não rodei a suíte inteira (unitários e E2E completos) nem vermelho antes do verde: o diff não traz teste novo nem guarda de código, só classes CSS (sem mutante declarável). A CI do push (run 42365672784) está registrada no review.
- Bug: não gravei `docs/qa/bugs/` (o brief limita o commit ao parecer); o relato está no A1.

# W037-001 - 101 E2E do projeto chromium falham com o Worker (ADR 0021) e passam na develop
- Status: corrigido (K-113, E2.2b); aguarda reconfirmação do QA
- Severidade: alta (o E2E `chromium` do portão fica vermelho e bloqueia a promoção; produto ou teste, a decidir)
- Responsável sugerido: forge:react-frontend (corrigir o Worker/estado inicial se o produto estiver errado), com forge:qa-engineer para a espera nos testes se o erro for do helper
- Ambiente: head `85d1896` (feature/037-c6-operacional) × develop `794b982`; Playwright 1.64.1, projeto `chromium`, `--retries=0`, build e porta exclusivos por lado (4473 e 4373), load 8 a 11 (outros agentes na máquina)

## Passos para reproduzir
1. Worktree em `85d1896`; criar `e2e/playwright.porta.config.ts` igual ao `playwright.config.ts` com `PORTA = 4473` (sem `vite preview` de outra worktree escutando: `ss -ltnp`).
2. `cd e2e && E2E_SEM_ALT=1 pnpm exec playwright test -c playwright.porta.config.ts --project=chromium --retries=0 tests/intensivo-filtros.spec.ts tests/b12-fluxo.spec.ts tests/intensivo-filtros-bordas.spec.ts tests/filtros.spec.ts`
3. Mínimo: `... --repeat-each=3 tests/b12-fluxo.spec.ts -g "B3-002"`.
4. Controle: mesmo comando na develop `794b982`, porta 4373.

## Resultado esperado
Mesmo resultado da develop: 213 passam, 3 falham (IF-B05, IF-B17 com `S2=carregando`, IF-U-operacional; instabilidade sob carga, D2).

## Resultado obtido
`85d1896`: 101 falham e 115 passam. B3-002: 3/3 falham em `85d1896` e 3/3 passam na develop. Amostra:
- `b12-fluxo.spec.ts:239` B3-002: `Expected value: "O12"  Received array: []` (cartões ausentes no DOM quando `esperarCartoesProntos` retorna).
- `intensivo-filtros.spec.ts` IF-C (96 casos): `expect(r2.botoes).toEqual(r.botoes)`, esperado `{}`/`[]` (6 linhas de diferença) e recebido o painel preenchido: o retrato é lido com o painel ainda sem cartões e depois com eles.
- `IF-U-*`: `Error: Voltar até o estado 0`, mesma diferença de retrato; `filtros.spec.ts:129`: `toHaveURL` recebe `http://localhost:4473/tatico`.
Hipótese (não verificada no código): com o Worker os cartões chegam depois do primeiro paint e `PainelPage.esperarCartoesProntos` (`e2e/pages/PainelPage.ts:53`) retorna ao ver só o h1, pois `cartoes.count() === 0`.

## Evidência
Logs da sessão do QA em 2026-10-21 (`head.log`, `dev.log` no scratchpad); trace e screenshot em `e2e/test-results/` do head. Esta medição **retifica o parecer anterior**: o D1 ("100 E2E defasados já na develop") veio de medição com `reuseExistingServer` na porta 4173, que serviu o build do Worker nas duas árvores.

## Causa raiz e correção (forge:react-frontend, E2.2b)
Causa: os helpers de espera dos E2E consideravam o painel "pronto" quando o h1 aparecia e não havia cartão no DOM. Com o mock no Worker (ADR 0021) o estado de coleta (e as preferências) chega depois do primeiro paint, e até lá `Casca` (`web/src/features/painel/PainelPagina.tsx`) mostra só o cabeçalho e o bloco reservado `data-testid="aguardando-coleta"`: sem filtros e sem cartões. Na develop o cálculo era síncrono na thread principal e a janela não existia. A hipótese do QA sobre `PainelPage.esperarCartoesProntos` se confirmou; o mesmo buraco existia nas cópias locais `esperarPronto` (intensivo-filtros), `pronto` (intensivo-filtros-bordas) e em `PainelPage.ir`. O app está correto (o bloco é o estado de carregando do painel); nada mudou no produto.
Correção: os quatro pontos passam a aguardar `aguardando-coleta` ausente (`toHaveCount(0)`), o estado real, sem `waitForTimeout`, sem retirar asserção e sem aumentar timeout.
Resultado: 4 specs + paridade `mock-transporte-worker`, `--project=chromium --retries=0`, porta 4473 exclusiva: 220 passam (216 das 4 specs + 4 da paridade), 0 falham.

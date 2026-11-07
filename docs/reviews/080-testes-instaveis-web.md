---
tipo: review
contrato: 1
pedido: 080-testes-instaveis-web
branch: feature/080-testes-instaveis-web
commit: 8784bf130f3290f5bfb6e0c9d30f8e20d1782605
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---

# Code review: testes instáveis da web (K-173 e K-192), volta 2

**Veredito: aprovado.** Sem achado bloqueante.

Diff lido: `git diff 852b9406f019223acd82563cd21fc3a3d42a493a...8784bf130f3290f5bfb6e0c9d30f8e20d1782605`. Esta rodada substitui o parecer da rodada 1 (commit 6b7b3f5e), cujo único achado (A1, sobre o `gap-y-1`) perdeu o objeto com a reversão.

## Escopo e teto
- `git diff --numstat --no-renames` da base à ponta: `e2e/tests/operacional-lote3.spec.ts` 23 adições e 2 remoções (25 linhas de teste); o resto é `docs/qa/` e `docs/reviews/` (fora da conta). Dentro do teto M14 de 150 (a entrega declarou 91 pela soma dos commits, ida e volta do `gap-y-1` incluídas; os dois números ficam abaixo do teto). Um comportamento só: o L3-01 espera a página estabilizar antes do axe.
- `web/src/features/complementares/LeiaJunto.tsx` igual à base: `git diff --stat` da base à ponta em `web/` e `e2e/fixtures/` vazio. Como a tela voltou ao original, a revisão de interface (E1.4) deixa de se aplicar, como registrado no pedido.
- `server/`, `packages/` e `.github/` sem diff.

## K-192: o helper `esperarAlturaEstavel`
- Espera por condição, não por tempo fixo: primeiro nenhum `[data-testid^="metrica-"][aria-busy="true"]` (conferi que `CartaoMetrica.tsx:207-209` põe `data-testid="metrica-<código>"` e `aria-busy` no mesmo elemento, então o seletor não passa vazio), depois `expect.poll` sobre `scrollHeight` até 5 leituras seguidas iguais, com intervalo de 100 ms e o timeout padrão do `expect` (nenhum timeout novo).
- Age na causa registrada na DECISÃO TÉCNICA de 08:46: roda antes e depois do clique em "Mais métricas" e de novo depois do `painel.esperarPronto()`, antes do axe. Sem scroll ao topo, sem mudar `rodarAxe` (fixtures sem diff), sem regra do axe desligada, sem timeout e sem retry (escopo, "Fora do escopo").
- O parâmetro `estavel` de `abrir` é opcional e falso por padrão: os outros testes do arquivo (L3-02 em diante) seguem iguais.
- Prova da entrega: 40 de 40 rodadas (20 a 1280 px, 20 a 375 px) e CI do push verde (run 42370666658). Rodei o teste do arquivo tocado na worktree: `npx playwright test tests/operacional-lote3.spec.ts -g "L3-01 os 7" --project=chromium --workers=1 --repeat-each=2` deu `4 passed (39.8s)`. A suíte inteira é do QA (D-5).

## K-173
Sem mudança desde a rodada 1: o teste do O20 já espera a renderização; fecha sem código, como o item E1 prevê.

## Ferramentas, guardas e segurança
- Guardas de produto mudadas: nenhuma (só teste E2E), sem mutante declarável. Lint e tipos do `e2e/` cobertos pela CI do push.
- Segurança, dados pessoais e regras invioláveis do projeto: não alcançadas pelo diff.

## Achados
- A1 (recomendado) e2e/tests/a11y.spec.ts:1 · risco da DECISÃO TÉCNICA de 08:46: outros testes de axe em páginas longas com barra sticky podem medir a página ainda mudando de altura; levar à retrospectiva (E1.6) e, se confirmar, cartão próprio, fora deste PR.

---
tipo: review
contrato: 1
pedido: 109-pendencias-de-dado
branch: fix/109-k416-alvo-toque
commit: dcc54314066d7a3114d8057b4f849fcbdb7ba566
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-18
---
# Review r3: K-416, delta da volta 1 (72691cd8..dcc54314, E1.11)

Delta lido: `git diff 72691cd8 dcc54314` na worktree `/home/rodrigoisensee/MetricasDSPD-092`, só leitura. São 4 arquivos, +42 -2. Fora do e2e e do teste unitário, o código soma 13 linhas, todas de `IndiceDeSecoes.tsx` e `tokens.css`, e um comportamento só. O teto H1 é cumprido. O delta é idêntico ao patch medido (`~/.metricas-k416/v3/diff.patch`): o `diff` entre os dois sai vazio.

## Achados da r2
- **A1 (bloqueante): resolvido.** `IndiceDeSecoes.tsx:16-17` publica a altura do `<nav>` em `--h-indice` com `useAlturaCss`. `tokens.css:43` dá o valor inicial `0rem`, e `tokens.css:117` soma a variável ao `scroll-padding-top` de md+. Ao desmontar, o hook remove a propriedade (`useAlturaCss.ts`), então as páginas sem índice voltam a `0rem`. Abaixo de 768 px o padding não usa a variável, e o celular não muda.
- **A2 (recomendado): atendido.** O teste em `e2e/tests/apontamento-qa.spec.ts:811-834`, no CT-65 escuro a 1280x900, clica em "Dia a dia" e afirma duas coisas. O topo do título fica no bottom da área fixa (cabeçalho, barra e índice) ou abaixo dele. O `elementFromPoint` no centro do link devolve o próprio link. Pela conta da r2, sem o A1 o título parava a h-cab+h-fil+16 px e o índice ia até pelo menos +24 px. Por isso a primeira asserção distingue a correção do defeito. Sobre os testes unitários: `indice.test.tsx:33-38` afirma o comportamento do hook, que publica `px` e remove ao desmontar, e não o texto da fonte.
- **A3 (recomendado): atendido.** O comentário em `IndiceDeSecoes.tsx:27-29` cita `--h-indice`, o motivo (WCAG 2.4.11) e o caso abaixo de 768 px.

## Medida (fila302, logs em ~/.metricas-k416/v3)
Cito as medidas sem rerrodar:
- `vitest.log`: 2 arquivos, 6 testes passaram.
- `tsc.log`: `tsc -b` sem erro.
- `ct65-escuro.log`: `apontamento-qa.spec.ts:798`, 1 passou.
- `apontamento-qa.log`: 55 passaram em chromium, e o log não registra retry.

A suíte inteira roda no CI do PR. O e2e só roda no CI do PR (pedido 099), então o PR precisa sair verde nesse job.

## Achados
- A4 (recomendado) e2e/tests/apontamento-qa.spec.ts:823 · O seletor `[data-testid="barra-filtros"]` não existe na página do Apontamento, onde a barra é `barra-filtros-apontamento` e não publica `--h-filtros`. Por isso o `base()` devolve 0 para a barra. Hoje isso não muda o resultado, porque o `<nav>` fica abaixo da barra e é ele que dá o máximo. Mesmo assim, o termo é morto: retirar ou trocar pelo testid certo.

## Sondas
- S1 · leitura do delta: 1280x900, salto por "Dia a dia" · espera: título abaixo do bottom do índice · obtido: coberto pelo e2e da linha 798, verde em `ct65-escuro.log` e `apontamento-qa.log` (fila302).

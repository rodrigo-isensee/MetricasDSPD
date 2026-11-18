---
tipo: review
contrato: 1
pedido: 109-pendencias-de-dado
branch: fix/109-k416-alvo-toque
commit: 910cbab7598c3c4f71fd1f2cef541fb62f94dc63
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-18
---
# Review r4: K-416, delta da volta 2 (9ebb7c6e..910cbab7, E1.13)

Delta lido: `git diff 9ebb7c6e 910cbab7` na worktree `/home/rodrigoisensee/MetricasDSPD-092`, só leitura. São 3 arquivos, +24 -8. O código soma cerca de 17 linhas (`IndiceDeSecoes.tsx` e `ApontamentoPage.tsx`) e um comportamento só, então o teto H1 é cumprido. O delta é idêntico ao patch medido: o `diff` contra `~/.metricas-k416/v4/diff.patch` sai vazio.

## Leitura do delta
- **Causa do CI do #553.** As duas falhas determinísticas (COMP-01 em `/operacional?cadencia=sustentacao` e `espera-invisivel-nos-paineis.spec.ts:82`, axe `target-size`) vinham do `<nav>` sticky cobrindo alvos da Sustentação. A correção liga o sticky só com a prop `fixo` (`IndiceDeSecoes.tsx:16-23`), e só o Apontamento a passa (`ApontamentoPage.tsx:150`). Operacional (`OperacionalPage.tsx:80`) e Sustentação (`VisaoSustentacao.tsx:70`) chamam sem a prop. A correção ataca a causa e não toca o teste.
- **Sem `fixo`, a página volta ao comportamento da develop (`790a136a`).** O `<nav>` perde `z-20` e as classes `md:sticky`/`md:top-*`. O `useAlturaCss` recebe `SEM_REF` (`current: null`), retorna cedo e não publica `--h-indice`. O `scroll-padding-top` (`tokens.css:117`) então soma `0rem`, o valor inicial, e o salto por âncora nesses painéis fica como na develop. `SEM_REF` é uma constante do módulo, então a dependência `[ref]` do efeito fica estável. Se `fixo` mudar em execução, a limpeza do efeito retira a variável. A única diferença para a develop é o `bg-fundo`, que também vale fora do modo fixo: é inofensivo, porque o `<nav>` está no fluxo e o fundo é o da página.
- **Testes.** `indice.test.tsx:25-30` é novo e afirma o comportamento padrão pelo DOM: o `<nav>` sem `md:sticky` e o `--h-indice` vazio. Os dois testes do K-416 passaram a usar `fixo` (`:32-38` e `:40-45`). Esses testes afirmam o ramo de cada lado da condição `fixo ? … : …`, e não o texto da fonte.
- **Comentário.** O comentário em `IndiceDeSecoes.tsx:21` e o de `:34` dizem que só o Apontamento é fixo e por quê.

## Medida (fila 081008, logs em ~/.metricas-k416/v4)
Cito as medidas sem rerrodar. `vitest.log` registra 7 testes passando. `tsc.log` registra `tsc` com rc=0. `e2e.log` registra 71 testes passando, dos quais 55 do `apontamento-qa`, 8 do `complementares` e 8 do `espera-invisivel-nos-paineis`. No `complementares`, o COMP-01 `/operacional?cadencia=sustentacao` passou (linha `✓ 59`).

## CI do head (#553, run pull_request 44292206652, head 910cbab7)
O check `rapida` passou, e também os checks `testes`, `seguranca` e `e2e-parte (1/2)`. O `e2e-parte (1/2)` é a parte que falhou no #553 com as duas falhas do K-416. O `e2e-parte (2/2)` saiu vermelho, com 399 testes passando, 1 instável e 1 com falha. A falha é `intensivo-sistemico.spec.ts:329` (SIS-INV-03): `Test timeout of 30000ms exceeded` no helper `prontos()` (`:33`), nas duas tentativas. Essa falha é a mesma de tempo de parede sob carga já registrada no #551 (fila314) e aberta no K-418. Nada no delta toca o `prontos()` nem o carregamento dos painéis: na Sustentação, o delta só devolve o índice ao fluxo. O instável foi o SIS-ROB-04, que passou no retry. Os checks `build`, `openapi`, `filtro` e `e2e` (agregador) estavam na fila quando gravei o parecer. O push run 44292195169 foi cancelado.

O brief só aprova com o CI do head todo verde, e2e incluso. Esse critério não foi cumprido, e por isso o parecer é reprovado. **Não há defeito de código no delta.** O caminho é rerrodar o e2e-parte 2/2 com a vaga livre (fila315), e não abrir volta ao autor. Com o CI do head 910cbab7 verde, sem commit novo, o delta lido é zero e o parecer vira aprovado só pela citação do CI, sem nova leitura.

## Achados
- A5 (bloqueante) e2e/tests/intensivo-sistemico.spec.ts:33 · pendente: CI do head 910cbab7 vermelho no e2e-parte (2/2), com SIS-INV-03 por timeout de parede (K-418) e não pelo delta; rerrodar com a vaga livre. O critério do brief é CI todo verde.
- A4 (recomendado) e2e/tests/apontamento-qa.spec.ts:823 · segue da r3, porque o delta não toca o e2e: o seletor `barra-filtros` não existe no Apontamento, e o termo é morto.

## Sondas
- S1 · `diff` do delta contra `~/.metricas-k416/v4/diff.patch` · espera: vazio · obtido: vazio.
- S2 · `gh run view 44292206652` (jobs) · espera: todos success · obtido: `e2e-parte (2/2)` failure (SIS-INV-03, timeout 30 s nas 2 tentativas). Os outros jobs estão em success ou ainda na fila.

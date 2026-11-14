---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k285-sem-dado-real-ux
commit: 0d1fae199da5736fa95cac71b2addddcc87d1203
parecer: aprovado
revisor: tech-lead
data: 2026-11-14
---

# Code review: K-285, estado sem dado real (B-2 a B-4 da revisão de UX do L2b e L2c) (E2.12)

**Revalidação (segunda junção com a develop, E3.208), aprovado sobre 0d1fae19.** Delta lido por `forge-check parecer delta` (79c5cab7..0d1fae19, sem o que veio da base): só `web/src/components/ui/CartaoMetrica.tsx`. O `git show --remerge-diff 0d1fae19` mostra um conflito só, na faixa de selos; a resolução fica com o lado da develop (o recolher do L8b sobre o L8a: a faixa sempre montada, com base, janela e selos extras dentro de `!recolhido`, e `SeloCalibracao` e `SeloOrigem` visíveis no recolhido) e põe nela só as duas mudanças do K-285 (`min-h-6` só com `!recolhido && p.base`, no lugar do `min-h-6` fixo, e `data-testid="selos-<codigo>"`), com o comentário do K-285 somado ao do M1. Contra `6c441aff` (develop), o CartaoMetrica difere só nessas linhas; botão de recolher, `resumoDoRecolhido` (erro, carregando, sem dado real, vazio, atualizando) e selos recolhidos com origem e calibração ficam intactos. `EstadoSemDadoReal.tsx` e `NumeroChave.tsx` não mudam na junção. Nenhum ramo perdido. Vitest com `--maxWorkers=2` em `recolhidos.test.tsx` e `componentes.test.tsx` (ui e resumo): 3 arquivos, 110 testes, 110 passaram. CI do PR 392 sobre 0d1fae19: runs 43566631977 (push) e 43566638390 (pull_request), ambos success (testes, e2e 1/2 e 2/2, banco, build, seguranca, openapi, rapida). O A1 segue recomendado, sem mudança.

**Revalidação (junção com a develop, E3.200), aprovado sobre 79c5cab7.** Delta lido por `forge-check parecer delta` (5dcf0e4d..79c5cab7, sem o que veio da base): só `web/src/components/ui/CartaoMetrica.tsx`. O `git show --remerge-diff 79c5cab7` mostra um conflito só, na faixa de selos e na `BlocoNota`; a resolução fica com o lado da develop (o recolher do L8a: faixa e nota dentro de `!recolhido`) e põe nele as duas mudanças do K-285 (`min-h-6` só com `p.base` e `data-testid="selos-<codigo>"`), com o comentário novo. Contra `62823ca0` (develop), o CartaoMetrica difere só nessas linhas; o resto do recolher (botão com `aria-expanded`/`aria-controls`, resumo recolhido, ações, alternar tabela, rodapé e corpo em `idCorpo`) está intacto, e `calibrando && !semDadoReal` e o bloco `EstadoSemDadoReal` seguem no corpo não recolhido. `EstadoSemDadoReal.tsx` (`role="status"`) e `NumeroChave.tsx` (motivo em `text-sm`, 14 px) não mudam na junção. Nenhum ramo perdido. Vitest com `--maxWorkers=2` em `recolhidos.test.tsx`, `componentes.test.tsx` (ui e resumo) e `ui.test.tsx`: 4 arquivos, 120 testes, 120 passaram. CI do PR 392 sobre 79c5cab7: runs 43549889578 (push) e 43549894601 (pull_request), ambos success. O A1 segue recomendado, sem mudança.

## O que foi conferido
- Diff `origin/develop...5dcf0e4d` (base `02272442`): cinco arquivos em `web/src/`, 39 linhas adicionadas e 3 removidas. Dentro do teto de 150 linhas; um comportamento só (o estado sem dado real na interface).
- Faz o que B-2, B-3 e B-4 de `docs/ux/099-revisao-l2b-l2c.md` pedem, nem mais nem menos. B-1 fica fora com razão: a própria revisão de UX diz "nenhum ajuste de interface agora" (o motivo por cartão depende do back-end).
  - B-2: `NumeroChave.tsx:65` passa de `text-xs` para `text-sm`, igual ao `EstadoSemDadoReal`.
  - B-3: `CartaoMetrica.tsx:240` reserva `min-h-6` só com `p.base`; o comentário foi atualizado para o novo porquê. O `data-testid="selos-<codigo>"` é novo e único por cartão.
  - B-4: `EstadoSemDadoReal.tsx:11` ganha `role="status"`, sem `aria-live` explícito, como a revisão de UX sugere. Alcança os quatro usos do componente (cartão, Visão Geral e as duas tendências do resumo); nenhum deles fica dentro de outra região viva.
- Regras invioláveis do `CLAUDE.md` e ADR 0030: nada de cálculo, fonte nem simulado tocado; só apresentação.
- Testes: um por obrigação, de comportamento renderizado (classe e atributo no DOM, não leitura da fonte). O parecer do QA (`docs/qa/099-k285-sem-dado-real-ux.md`, commit `8d0f2cf3`) registra os três mutantes do diff mortos; não refeitos aqui.
- Ferramenta (só os testes tocados): `npx vitest run src/components/ui/componentes.test.tsx src/features/operacional/resumo/componentes.test.tsx` → 2 arquivos, 84 testes passam. Suíte completa e `pnpm run pronto` ficam com o CI do PR. Nada contra banco; nenhum `.env*` aberto.
- Commit `5dcf0e4d`: Conventional Commits em português, corpo por obrigação, trailer `Cartão: K-285`. O texto sem acentos ("espaco", "so", "ha") é cosmético, não pede volta.

## Achados
- A1 (recomendado) web/src/components/ui/EstadoSemDadoReal.tsx:11 · o `role="status"` nasce junto com o conteúdo (o bloco só monta quando o estado vira sem dado real); vários leitores de tela não anunciam região viva inserida já preenchida. Confirmar no leitor de tela (UX) ou mover a região viva para um nó fixo do cartão.

---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k285-sem-dado-real-ux
commit: 5dcf0e4da462c35e2f338d763980124eb40c1d5f
parecer: aprovado
revisor: tech-lead
data: 2026-11-12
---

# Code review: K-285, estado sem dado real (B-2 a B-4 da revisão de UX do L2b e L2c) (E2.12)

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

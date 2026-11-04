---
tipo: review
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: df21afda697d9b4e4331950adfe31ab8754d15d4
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-03
---
# Review: 060-triagem-dependabot, branch do web com dado real (P4 e a parte de web do P5) (E2.20, K-195)

Histórico: 2026-11-03, commit atualizado para df21afd; o código revisado em b85663e não mudou (depois dele entraram só pareceres, tudo em docs/).

**Veredito: aprovado em `b85663e`.** Sem bloqueante. Revalidação por delta: li `bd6d6f2..b85663e` (11 arquivos, web mais 3 documentos). O resto da branch (P4, P5, contrato sem-dado-real, PDF) é "já lido" no parecer de `bd6d6f2` e não mudou.

## Delta lido
- **Rótulo "Motivo:"** em `EstadoSemDadoReal.tsx` (cartão) e `NumeroChave.tsx` (Resumo); os testes `origem.test.tsx` e `resumo/componentes.test.tsx` passam a esperar o rótulo. Correto.
- **Faixa de atenção parcial:** `estadoFaixa` dá `parcial` quando parte das consultas está sem dado real; a faixa vazia mostra aviso e nunca "Nada pede atenção"; alertas, omitidos e "Ver todos" seguem aparecendo; sem calibração pronta, vira carregando. Dois testes novos cobrem o caso misto.
- **A2 resolvido:** o comentário de `modelo.ts` saiu da linha de `tabela` e ficou em linha própria.
- **A1 resolvido:** `docs/security/041-estabilidade.md` voltou ao texto da base; `git diff b446021 b85663e` do arquivo não tem diferença.

## Testes
vitest do web, 2 workers (MemAvailable 13 GB, load 0,4): 92 arquivos e 1412 testes verdes, rc=0. Sem E2E nem build. O pronto completo da ponta nova fica com o dono (K-201: não roda no sandbox).

## Ferramentas e teto
- Sem regra de `praticas.md` por comando para citar; sem pendência nova.
- A3 do parecer anterior segue válido: o PR (E2.23) precisa da linha `teto: excedido, <n> linhas, <motivo>`, recontada na abertura; sem ela é bloqueante.

## Achados
- A3 (recomendado) PR da branch · Acima do teto M14 de 150 linhas de código e teste. Sugestão: a abertura do PR leva `teto: excedido, <n> linhas, <motivo>`; sem a linha vira bloqueante.

## Parecer
Aprovado em `b85663e`. A1 e A2 do parecer anterior foram resolvidos; só A3 segue, e não devolve a branch.

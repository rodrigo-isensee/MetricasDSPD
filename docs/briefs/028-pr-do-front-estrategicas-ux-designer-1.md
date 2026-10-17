Agente destino: forge:ux-designer
Pedido: docs/pedidos/028-pr-do-front-estrategicas.md
Branch: feature/011-front-estrategicas   Base: develop   Base-sha: 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92

## Objetivo
Reconferir a UX do front do lote 1 do 011 (PR #108) sobre o commit final e8507885737e23579591cf4259de3c30ba88e677 da branch, porque 075a5a8bb72961c6ff43d7f92e91aca501654d0c e 65fcd720c0d6fc5facc2913e72b1376773b20f43 mudaram a interface depois da sua reconferência (seção 9, sobre ae3ea929a7a83f40d23d2390198559ca6343b90d). O pedido 028 exige UX aprovada sobre o commit final antes do merge. Cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- O delta de interface: `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/bb718795-0b13-41a0-8af6-548bc3e933c2/scratchpad/108-delta-ux.diff` (104 linhas: `SeletorLocal.tsx`, `ui.test.tsx`, `estrategicas.tsx`).
- `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/revisao-011-front-estrategicas.md`, seções 4, 5 e 9.

## Entregar
- (E1) Na worktree, acrescentar ao fim de `docs/ux/revisao-011-front-estrategicas.md` a seção "10. Reconferência sobre e850788 (2026-10-17)": para cada mudança do delta (anúncio do tipo do E9 ao leitor de tela, plural "demais sistemas" no E7, e o que mais o diff trouxer), o veredito contra a especificação validada e a WCAG 2.2 AA, e o veredito final (`aprovado` ou `reprovado`, com os achados).
- Sem commit: o arquivo fica gravado na worktree, e o tech-lead commita junto com o merge (prática dos pedidos 021 e 024: quem não tem Bash grava e o tech-lead commita).

## Fora do escopo
- "E1.1 (forge:tech-lead): PR do front do lote 1, mesclado na develop." · etapa de outro papel; continua no pedido.
- O nome do E7 (pendente de confirmação do usuário); mudar código; mudar a especificação; os lotes 2 e 3 do front.

## Decisões e restrições
- Decisões do usuário: D2 = A (E7 sem R$, pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- NÃO tocar: código, outros pareceres, o diretório principal, as worktrees `-011-fase2` e `-024`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/revisao-011-front-estrategicas.md` e o arquivo tem a seção "10. Reconferência sobre e850788" com o veredito final.
- PQ-2 (cmd): `grep -c '^## 10\. Reconferência sobre e850788' /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/revisao-011-front-estrategicas.md` · espera: igual '1'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o veredito de cada mudança; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

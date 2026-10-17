Agente destino: forge:ux-designer
Pedido: docs/pedidos/029-pr-do-024.md
Branch: docs/jarvis-quadro-2026-10-17-noite   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Revisar a interface implementada no pedido 024 contra a especificação validada, antes do PR: o E7 passou a se chamar "Entregas por sistema" (decisão do dono, pedido 021) no catálogo e no título do cartão, e o texto do E8 manda ler junto com "as entregas por sistema (E7)". Etapa E1.1 do pedido 029.

## Ler
- O delta de interface: `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/bb718795-0b13-41a0-8af6-548bc3e933c2/scratchpad/024-delta-ux.diff` (28 linhas: `catalogo-metricas.ts` e `estrategicas.tsx`).
- `/home/rodrigoisensee/MetricasDSPD-024/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, seção do E7 e o registro de revisões do dia 2026-10-17.

## Entregar
- (E1) Gravar `/home/rodrigoisensee/MetricasDSPD/docs/ux/revisao-024-e7-nome.md`: para cada mudança do delta, o veredito contra a especificação (texto, maiúsculas, consistência entre catálogo, cartão e texto do E8) e a WCAG 2.2 AA quando couber, e o veredito final (`aprovado` ou `reprovado`, com os achados). Sem commit: o Jarvis commita na branch de docs.

## Fora do escopo
- "E2.1 (forge:tech-lead): PR do 024 para a develop, mesclado depois do parecer do QA." · etapa de outro papel.
- Gravar qualquer arquivo na worktree `-024` (o commit lá invalidaria review e QA); mudar código ou a especificação; as pendências baixas antigas (A-9, A-11, `aria-hidden` do ícone `info`).

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão técnica do time (pedido 029, 2026-10-17): a revisão de UX do 024 fica no diretório principal, fora da branch do 024.
- NÃO tocar: `/home/rodrigoisensee/MetricasDSPD-024`, código, `.github/`.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/ux/revisao-024-e7-nome.md`, com o veredito final.
- PQ-2 (cmd): `grep -c -i 'veredito final' /home/rodrigoisensee/MetricasDSPD/docs/ux/revisao-024-e7-nome.md` · espera: linhas=1

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o veredito de cada mudança; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

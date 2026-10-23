Agente destino: forge:ux-designer
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Revisão de UX da interface implementada no pedido 036, contra a especificação, antes do PR (etapa E1.6; passo 5 do fluxo do `CLAUDE.md`). A única mudança visível é a pergunta do E7 ("Qual a participação de cada sistema nas nossas entregas?") no cartão de /estrategico. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head 97f8545).

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, ficha do E7 (§5) e a linha de 2026-10-20 da §11.
- `web/src/content/catalogo-metricas.ts`, a entrada do E7.
- `docs/qa/036-estrategicas-pendentes.md`, a verificação do E7 no cartão.
- Modelo: `docs/ux/revisao-024-e7-nome.md`.

## Entregar
- (E1) (E3) Revisão em `/home/rodrigoisensee/MetricasDSPD-030/docs/ux/revisao-036-e7-pergunta.md`, no formato de `docs/ux/revisao-024-e7-nome.md`: o texto do catálogo e o da especificação são iguais; a pergunta cabe no cartão e é neutra (sem leitura de avaliação individual nem comparação, CLAUDE.md); achados (bloqueante, recomendado ou nenhum) e parecer. Sem commit e sem push: você não tem Bash; o tech-lead commita o arquivo no PR (E1.5).

## Fora do escopo
- "E1.5 (forge:tech-lead): PR para a develop e merge." · etapa de outro papel, depois desta.
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa de outro papel, cumprida (97f8545).
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel, cumprida (fc9ecf2).
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas de outro papel, cumpridas.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." · etapa de outro papel, cumprida.
- "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapa do mesmo papel, cumprida (a711371).
- Editar outros arquivos; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): não se aplica a esta revisão de texto.
- ADR 0004 (citada no pedido): o documento de revisão segue o formato com frontmatter do modelo.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-030/docs/ux/revisao-036-e7-pergunta.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

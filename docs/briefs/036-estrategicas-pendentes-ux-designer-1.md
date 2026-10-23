Agente destino: forge:ux-designer
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Levar à especificação a nova pergunta do E7, decidida pelo dono (opção A), para a especificação e o catálogo (já trocado em bf137a9) dizerem o mesmo. Etapa E3.3 do pedido 036. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes`.

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, a ficha do E7 (linha com "**Pergunta:** Quanto da nossa capacidade vai para manter cada sistema do parque?").
- `docs/ux/revisao-024-e7-nome.md`, achado 1.

## Entregar
- (E3) Em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, trocar a pergunta do E7 por "Qual a participação de cada sistema nas nossas entregas?", com uma nota curta de mudança (data 2026-10-20, decisão do dono, pedido 036). Se o §11 da especificação diz que a pergunta não muda, atualizar essa frase.
- (E3) Um commit só desse arquivo, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md`; push da branch.

## Fora do escopo
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." · etapa de outro papel, já cumprida (bf137a9).
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido.", "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." e "E1.4 (forge:qa-engineer): QA e parecer." · etapas de outro papel.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica.
- "E1.3 (forge:tech-lead): code review." e "E1.5 (forge:tech-lead): PR para a develop e merge." · etapas de outro papel.
- Outras fichas e seções da especificação; `web/`, `e2e/`, `server/`; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): não se aplica a esta troca de texto.
- Pode haver commit do forge:qa-engineer na mesma branch (e2e e bug do IFA-001): não toque; se aparecer `index.lock`, espere e tente de novo.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h -- docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: o hash do commit da troca.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `grep -c 'Qual a participação de cada sistema nas nossas entregas?' /home/rodrigoisensee/MetricasDSPD-030/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: docs/pedidos/036-estrategicas-pendentes.md
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Code review (R-REVIEW, antes do QA) da branch das estratégicas pendentes, etapa E1.3 do pedido 036, depois de levar à branch o commit da especificação que o forge:ux-designer editou sem poder commitar (etapa E3.3; ele não tem Bash). Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head 154f43a). Segunda instância do tech-lead (a primeira está no PR de documentação do pedido 035, no diretório principal; R-WIP, fila).

## Ler
- `docs/pedidos/036-estrategicas-pendentes.md`, seções Escopo, Etapas e Andamento.
- `git -C /home/rodrigoisensee/MetricasDSPD-030 log --oneline origin/develop..HEAD` e o diff de cada commit; `git -C /home/rodrigoisensee/MetricasDSPD-030 diff -- docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (edição do UX, sem commit).
- Modelo de frontmatter: `docs/reviews/011-front-estrategicas.md`.

## Entregar
- (E3) Revisar a edição do UX em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` (pergunta do E7 igual à decisão do dono, nota de mudança na §11) e commitá-la sozinha, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md` (com a linha do cartão K-119 e autoria do ux-designer citada no corpo).
- (E1) (E2) (E3) Code review dos commits da branch sobre `origin/develop`: bf137a9 (catálogo do E7), f3a2995 (reteste do FA-006, não reproduz), 154f43a (IF-A de /estrategico com mínimo de verificados) e o commit da especificação. Conferir regras invioláveis do `CLAUDE.md` que se aplicam (nenhuma métrica individual, texto neutro), coerência catálogo × especificação e o teste do IF-A (o mínimo só onde esperado; a mutação descrita no bug). Comando de pronto do projeto (`pnpm run pronto`, ver `CLAUDE.md`) rodado da raiz da worktree, ou o motivo de não rodar.
- (E1) Parecer em `docs/reviews/036-estrategicas-pendentes.md` (frontmatter no padrão do projeto: `tipo: review`, `pedido: 036-estrategicas-pendentes`, `branch: feature/036-estrategicas-pendentes`, `commit:` o sha40 do head revisado, `parecer:`, `revisor: tech-lead`), com bloco `## Achados`; registrar que o commit 154f43a ficou sem a linha "Cartão: K-091" e que ela vai na mensagem do squash do PR. Um commit só do parecer, no mesmo push da especificação.

## Fora do escopo
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa de outro papel, depois deste review.
- "E1.5 (forge:tech-lead): PR para a develop e merge." · etapa do mesmo papel em outro momento, em brief próprio, depois do QA.
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas de outro papel, cumpridas.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica (FA-006 não reproduz).
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel (a edição do E3.3 só ganha o commit aqui).
- Reescrever commits já enviados (sem `--force`, R-VERIFY); PR; o quadro (`KANBAN.md`).

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): F2, CLS < 0,1; o FA-006 não reproduz (0,021 em api); o limite não muda.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h` da branch · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-030 status --short` · espera: linhas=0
- PQ-4 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD-030/docs/reviews/036-estrategicas-pendentes.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

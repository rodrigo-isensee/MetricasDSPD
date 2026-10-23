Agente destino: forge:qa-engineer
Pedido: 036-estrategicas-pendentes
Branch: feature/036-estrategicas-pendentes   Base: develop   Base-sha: bbbc70c84335f5ca332ebc42d4813d2b245bd924

## Objetivo
Revalidar por delta o parecer de QA das estratégicas pendentes (R-QA), que ficou desatualizado porque o tech-lead commitou depois dele a revisão de UX (90d35a6, só `docs/ux/revisao-036-e7-pergunta.md`). Sem isso o `forge-check pr` recusa o PR (etapa E1.5). Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/036-estrategicas-pendentes` (head local fe6a50a, revalidação do review, ainda sem push; origin em 90d35a6).

## Ler
- `docs/qa/036-estrategicas-pendentes.md` (seu parecer, frontmatter `commit:`).
- `docs/ux/revisao-036-e7-pergunta.md` (o delta).
- `docs/reviews/036-estrategicas-pendentes.md`, seção "Revalidação (delta)" (modelo de revalidação).

## Entregar
- (E1) (E2) (E3) Rodar `forge-check delta` para o seu parecer e confirmar que o delta é só documentação de UX (sem código de `web/`, `server/` ou `e2e/`); se houver código no delta, pare e relate.
- (E1) Atualizar `docs/qa/036-estrategicas-pendentes.md`: `commit:` com o sha40 do head revalidado e uma seção "Revalidação (delta)" com o que mudou e o parecer mantido. Um commit só desse arquivo, com `git add` explícito e a linha `Cartão: K-119` na mensagem, conforme a seção de commits do `docs/engineering/praticas.md`; um push da branch (leva junto o fe6a50a do tech-lead).

## Fora do escopo
- "E1.5 (forge:tech-lead): PR para a develop e merge." · etapa de outro papel, depois desta revalidação.
- "E1.4 (forge:qa-engineer): QA e parecer." · etapa do mesmo papel, cumprida (97f8545); aqui só a revalidação por delta.
- "E1.6 (forge:ux-designer): revisão de UX da interface implementada (texto do E7 no cartão de /estrategico) contra a especificação, antes do PR; parecer gravado sem commit (o UX não tem Bash), commitado pelo tech-lead no E1.5." · etapa de outro papel, cumprida (90d35a6).
- "E1.3 (forge:tech-lead): code review." · etapa de outro papel, cumprida e revalidada (fe6a50a).
- "E1.1 (forge:qa-engineer): medição do FA-006 (3 execuções, mock e api), na branch do pedido." e "E2.1 (forge:qa-engineer): teste do IFA-001 em /estrategico, na mesma branch, depois do E1.1 (R-WIP)." · etapas do mesmo papel, cumpridas.
- "E1.2 (forge:react-frontend): correção do FA-006, só se a medição confirmar o estouro." · etapa de outro papel; não se aplica.
- "E3.1 (dono): decidir o texto do E7 no catálogo (feito: opção A)." · etapa do dono, cumprida.
- "E3.2 (forge:react-frontend): trocar o texto no catálogo e o teste que o cita." e "E3.3 (forge:ux-designer): trocar o texto na especificação." · etapas de outro papel, cumpridas.
- Rodar de novo a suíte E2E (o delta não tem código); editar outros arquivos; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-20): recibo do pedido 036 aceito ("sim").
- DECISÃO DO DONO (2026-10-20): E7 no catálogo, opção A ("A"): a pergunta passa a ser "Qual a participação de cada sistema nas nossas entregas?" (catálogo `web/src/content/catalogo-metricas.ts` e especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §E7).
- ADR 0003 (citada no pedido): F2, CLS < 0,1; não se aplica a esta revalidação de documento.
- ADR 0004 (citada no pedido): o parecer mantém o frontmatter.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-030 log -1 --format=%h` da branch · espera: o hash do commit da revalidação do QA.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/036-estrategicas-pendentes` igual ao head local.
- PQ-3 (cmd): `forge-check pr 036-estrategicas-pendentes --ref feature/036-estrategicas-pendentes --base origin/develop` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

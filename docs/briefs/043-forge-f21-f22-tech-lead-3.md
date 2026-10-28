Agente destino: forge:tech-lead
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E1.3 do pedido 043 (cartão K-152), retomada pela decisão A do dono: o hook recusa ao agente escrever em `templates/projeto/.githooks/pre-push`, então o dono aplica esse diff de manhã e o time prepara agora todo o resto do F21, sem commit (o commit só fecha com o pre-push aplicado). Clone de contribuição `~/.forge-contrib/MetricasDSPD`, branch `melhoria/MetricasDSPD-f21-worktree` (sem commit, hoje em 41ba611); atualize-a para `origin/develop` do Forge (03de0115ed3bf62571083c7c63f1ab0000049a69 na hora deste brief) por fast-forward antes de editar. Os campos Branch e Base-sha do cabeçalho são do projeto (nada muda nele); a entrega mora no repositório do Forge.

## Ler
- Skill `contribuir-com-o-forge` (passos 3 a 5): acesso, mudança e testes.
- `docs/analises/043-f21-worktree-sem-dependencias.md` deste projeto: opção C e a seção de medida.
- `docs/security/043-forge-f21-f22-ameacas.md` deste projeto, seção F21: mitigações M1 a M8 e a tabela de casos de abuso.

## Entregar
- (E1, E1.3) Opção C da análise, sem o pre-push: comando de preparação declarado em `stacks/node-react/pronto.md` e citado em `docs/regras/R-TETO.md` e `skills/qa-testing/SKILL.md`; testes na classe `HookPrePush` de `tests/test_forge.py` com os casos de abuso; fragmento em `changelog.d/` com `bin/forge-changelog novo` (decisão técnica do Jarvis no Histórico do pedido, 19:39). Não tocar `skills/ci-cd/SKILL.md` (decisão técnica do Jarvis no Histórico do pedido, 19:27). Tudo sem commit e sem push.
- (E1, E1.3) Diff da dica no `templates/projeto/.githooks/pre-push` (dica fixa quando o `pre-push.local` falha numa worktree vinculada, M1 a M8) gravado como patch em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-pre-push.patch`, gerado contra a branch atualizada e aplicável com `git apply` na raiz do clone. Não escreva no `.githooks/` do clone nem tente outro caminho para ele (R-CONFORMIDADE): só o patch.
- (E1, E1.3) Instruções ao dono em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-instrucoes-ao-dono.md`: até 10 linhas, os comandos exatos para aplicar o patch no clone e para rodar os três comandos do passo 5 da skill depois. Rascunho do corpo do PR em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-corpo-do-pr.md` (modelo de PR do Forge: situação observada sem dados deste projeto, o que muda, como medir: dica ou "not found" no pre-push em worktree nova, base 1, meta 0). Os três sem commit.
- (E1, E1.3) Prova de que o conjunto fecha: numa cópia descartável do clone no scratchpad do sistema (`git worktree add` em `/tmp/claude-1000/f21-prova` a partir da branch, com as suas mudanças copiadas e o patch aplicado lá), rode os três comandos do passo 5 e relate o resultado; remova a worktree descartável ao fim. Se o hook recusar também na cópia, pare e relate, sem contornar.
- (E2) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.4 (forge:security-engineer): parecer de segurança de cada branch, antes do PR." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada branch (testes do Forge), antes do PR." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:tech-lead): code review do F22 e push da branch, antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:tech-lead): PR do F22 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Commit e push do F21 (depois do patch aplicado pelo dono, noutra delegação); abrir, mesclar, rotular, fechar ou editar PR no Forge; enviar para `develop`, `homolog` ou `main` do Forge; a worktree `~/.forge-contrib/MetricasDSPD-wt/f22` e a branch do F22; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); o pre-push deste projeto ou qualquer arquivo dele fora dos três de `docs/analises/`; subir a versão do manifesto do plugin; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-27): F21 bloqueado pelo hook, opção A ("Da decisão time a A"): o dono aplica no clone de contribuição o diff do templates/projeto/.githooks/pre-push; o resto do F21 segue com o time.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- R-NEUTRO: a dica e o texto não supõem node nem pnpm no hook (o comando vem da stack); nada de dados deste projeto no PR. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONTRIB: só propor. R-CONFORMIDADE: o bloqueio do hook não se contorna. Os testes do Forge são Python e leves; o QA do 026 roda a suíte deste projeto agora: não rode suíte deste projeto. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-pre-push.patch` · patch do pre-push
- PQ-2 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD apply --check /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-pre-push.patch` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD rev-parse HEAD` · espera: igual '03de0115ed3bf62571083c7c63f1ab0000049a69'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD diff --name-only -- skills/ci-cd templates/projeto/.githooks` · espera: linhas=0
- PQ-5 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-instrucoes-ao-dono.md` · instruções ao dono
- PQ-6 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-corpo-do-pr.md` · rascunho do corpo do PR
- PQ-7 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD worktree list --porcelain | grep -c f21-prova` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o resultado dos três comandos do passo 5 na cópia descartável e como cada mitigação M1 a M8 foi atendida. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

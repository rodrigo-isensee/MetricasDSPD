Agente destino: forge:tech-lead
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E1.3 do pedido 043 (cartão K-152): implementar o F21 no Forge (worktree nova sem dependências não pode deixar o push falhar sem explicação), com commit e push da branch, sem PR: o PR (E1.7) só sai depois do review, da segurança e do QA. Clone de contribuição `~/.forge-contrib/MetricasDSPD` (criar, se não existir), branch `melhoria/MetricasDSPD-f21-worktree` a partir de `origin/develop` do Forge (41ba6111694be47fe997b48b21ddea0b44fe6151 na hora deste brief). Os campos Branch e Base-sha do cabeçalho são do projeto (nada muda nele); a entrega mora no repositório do Forge.

## Ler
- Skill `contribuir-com-o-forge` (passos 2 a 5): clone, acesso, mudança e testes.
- `docs/analises/043-f21-worktree-sem-dependencias.md` deste projeto: opção C e a seção de medida.
- `docs/security/043-forge-f21-f22-ameacas.md` deste projeto, seção F21: mitigações M1 a M8 e a tabela de casos de abuso.

## Entregar
- (E1, E1.3) Clone `~/.forge-contrib/MetricasDSPD` (git clone do Forge, `core.hooksPath .githooks`, `git fetch origin`) e a branch `melhoria/MetricasDSPD-f21-worktree` de `origin/develop`. Se o ambiente recusar o clone, pare e relate (R-CONFORMIDADE), sem contornar.
- (E1, E1.3) Opção C da análise: dica fixa no `templates/projeto/.githooks/pre-push` quando o `pre-push.local` falha numa worktree vinculada, com as mitigações M1 a M8 do modelo de ameaças; comando de preparação declarado em `stacks/node-react/pronto.md` e citado em `docs/regras/R-TETO.md` e `skills/qa-testing/SKILL.md`; testes na classe `HookPrePush` de `tests/test_forge.py` com os casos de abuso; fragmento em `changelog.d/`. Não tocar `skills/ci-cd/SKILL.md` (decisão técnica do Jarvis no Histórico do pedido: evita sobreposição com o F22).
- (E1, E1.3) Os três comandos do passo 5 da skill verdes; commit com `git add` explícito por caminho; push da branch (sem `-u`). Rascunho do corpo do PR em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-corpo-do-pr.md` (modelo de PR do Forge: situação observada sem dados deste projeto, o que muda, como medir: dica ou "not found" no pre-push em worktree nova, base 1, meta 0), sem commit. Sem PR; depois do push, pare.
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
- Abrir, mesclar, rotular, fechar ou editar PR no Forge; enviar para `develop`, `homolog` ou `main` do Forge; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); mudar o pre-push ou qualquer arquivo deste projeto fora do rascunho do corpo do PR; subir a versão do manifesto do plugin; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- R-NEUTRO: a dica e o texto não supõem node nem pnpm no hook (o comando vem da stack); nada de dados deste projeto no PR. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONTRIB: só propor. Os testes do Forge são Python e leves; o QA de outros pedidos roda suítes neste momento: não rode suíte deste projeto.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD log -1 --format=%H melhoria/MetricasDSPD-f21-worktree` · espera: o sha40 do commit do F21
- PQ-2 (push): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD ls-remote origin refs/heads/melhoria/MetricasDSPD-f21-worktree` igual ao head local · branch no remoto
- PQ-3 (cmd): `cd /home/rodrigoisensee/.forge-contrib/MetricasDSPD && python3 -m unittest discover -s tests` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD diff --name-only origin/develop -- skills/ci-cd` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD status --porcelain` · espera: linhas=0
- PQ-6 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-corpo-do-pr.md` · rascunho do corpo do PR

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha da branch e como cada mitigação M1 a M8 foi atendida. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

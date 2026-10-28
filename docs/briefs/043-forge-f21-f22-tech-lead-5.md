Agente destino: forge:tech-lead
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: review

## Objetivo
Etapa E2.3 do pedido 043 (cartão K-153): push da branch e code review do F22 (R-REVIEW), para a segurança (E1.4) e o QA (E1.5) revisarem antes do PR; o push vem antes do review, porque a etapa review confere o commit do autor no remoto (decisão técnica do Jarvis no Histórico do pedido, 2026-10-27). Os campos Branch e Base-sha do cabeçalho são do projeto (o forge-check só aceita base da develop do repositório do pedido; decisão técnica do Jarvis no Histórico, que substitui a nota das 20:46; nada muda no projeto); a entrega mora no clone de contribuição do Forge: worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`, branch `melhoria/MetricasDSPD-f22-release`, commit 0b595051930e4207d5a65eb3a5d551bf8f7b7180 sobre `origin/develop` do Forge em 41ba6111694be47fe997b48b21ddea0b44fe6151, sem push. O autor (devops-engineer) relatou a suíte `unittest` do Forge com rc 1 dentro do Claude: falhas em testes que se recusam a rodar dentro do Claude (`bin/forge_versoes.py:510-521`) e em `Neutralidade` lendo `__pycache__` não versionado; o conferente não achou falha ligada aos 4 arquivos do commit.

## Ler
- `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 show 0b595051930e4207d5a65eb3a5d551bf8f7b7180` (4 arquivos, 5 linhas).
- `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-pr-de-release.md`: seções 4 a 6 (opção A e medida).
- `/home/rodrigoisensee/MetricasDSPD/docs/security/043-forge-f21-f22-ameacas.md`: seção F22 (N1 a N6).
- `/home/rodrigoisensee/MetricasDSPD/docs/devops/043-f22-release.md` (parecer do autor) e `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` (rascunho do PR).
- Skill `contribuir-com-o-forge`, passos 4 e 5 (mudança, testes e envio).

## Entregar
- (E2, E2.3) Primeiro, o push: `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 push origin melhoria/MetricasDSPD-f22-release` (sem `-u`, sem `--force`), sem PR.
- (E2, E2.3) Code review do commit contra a opção A, as mitigações N1 a N6, R-NEUTRO (nada deste projeto no texto; o nome `melhoria/<projeto>-<tema>` e o fragmento `changelog.d/<branch-sem-prefixo>.md` seguem a skill) e o rascunho do PR. Parecer em `/home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md`, gravado com a ferramenta Write, com `pedido: 043-forge-f21-f22`, `commit:` 0b595051930e4207d5a65eb3a5d551bf8f7b7180, `## Achados` e veredito; sem commit (o arquivo fica no projeto, como o parecer de devops).
- (E2, E2.3) Testes: os três comandos do passo 5 da skill na worktree, com `PYTHONDONTWRITEBYTECODE=1` e sem `__pycache__` (apague o que a suíte gerar); compare as falhas da `unittest` com as de `origin/develop` do Forge numa worktree descartável em `/tmp/claude-1000/f22-base` (removida ao fim): o commit não pode acrescentar falha. Registre os números no parecer.
- (E2, E2.3) Reprovado o review: a branch fica empurrada e sem PR; os achados vão no parecer e no relatório, e o ajuste volta ao autor.
- (E1) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, commit e push da branch, sem PR." · etapa de outra delegação (outra instância do tech-lead, em curso); continua no pedido
- "E1.4 (forge:security-engineer): parecer de segurança de cada branch, antes do PR." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada branch (testes do Forge), antes do PR." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; já entregue (0b59505)
- "E2.4 (forge:tech-lead): PR do F22 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Mudar o commit do F22 (ajuste volta ao autor); abrir, mesclar, rotular, fechar ou editar PR no Forge; enviar para `develop`, `homolog` ou `main` do Forge; o clone principal `~/.forge-contrib/MetricasDSPD` e a branch do F21; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); rodar suíte deste projeto (o QA do 026 ocupa a máquina); commit no projeto; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-27): F21 bloqueado pelo hook, opção A ("Da decisão time a A"): o dono aplica no clone de contribuição o diff do templates/projeto/.githooks/pre-push; o resto do F21 segue com o time.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- Decisões técnicas do Jarvis no Histórico do pedido (2026-10-27): F22 com a opção A; fragmento em `changelog.d/` em cada PR do 043; a falta de rc 0 da suíte dentro do Claude se prova na CI do PR do Forge. R-NEUTRO, R-VERIFY (nunca `--no-verify` nem `--force`), R-CONTRIB (só propor), R-CONFORMIDADE (bloqueio do hook vira relato). Os testes do Forge são Python e leves. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md` · parecer de review
- PQ-2 (cmd): `grep -c '^commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180$' /home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md` · espera: igual '1'
- PQ-3 (push): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 ls-remote origin refs/heads/melhoria/MetricasDSPD-f22-release` · espera: contém '0b595051930e4207d5a65eb3a5d551bf8f7b7180'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD worktree list --porcelain | grep -c f22-base` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito, os números da `unittest` na branch e na base e os achados. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

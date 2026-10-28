Agente destino: forge:qa-engineer
Pedido: 043-forge-f21-f22
Tipo: qa
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: qa

## Objetivo
Etapa E1.5 do pedido 043 para o F22 (cartão K-153): parecer de QA da branch do F22 antes do PR (R-QA). Os campos Branch e Base-sha do cabeçalho são do projeto (o forge-check só confere a base no repositório do pedido); a entrega mora no clone de contribuição do Forge: worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`, branch `melhoria/MetricasDSPD-f22-release`, commit 0b595051930e4207d5a65eb3a5d551bf8f7b7180 sobre `origin/develop` do Forge em 41ba6111694be47fe997b48b21ddea0b44fe6151, já no remoto, sem PR. Code review (E2.3) aprovado: `unittest` na branch e na base com a mesma lista de 59 falhas (testes que recusam rodar dentro do Claude, `bin/forge_versoes.py:510-521`).

## Ler
- `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 show 0b595051930e4207d5a65eb3a5d551bf8f7b7180` (4 arquivos, só texto).
- `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-pr-de-release.md`: seção 6 (medida).
- `/home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md`: `## Achados` e a seção de testes.
- Skill `contribuir-com-o-forge`, passo 5 (testes).

## Entregar
- (E2, E1.5) Testes do Forge na worktree, com `PYTHONDONTWRITEBYTECODE=1`: `scripts/validar-plugin.sh`, `scripts/verificar-contribuicao.sh` e os testes que leem os 4 arquivos do commit (texto de R-FLUXO, skill ci-cd, agents/tech-lead.md, changelog.d); a suíte `unittest` inteira uma vez, comparando a lista de falhas com a do review (a base não precisa ser medida de novo). Apague o `__pycache__` que a suíte gerar.
- (E2, E1.5) Conferir a medida da seção 6 da análise contra o texto do commit (o PR de release só nasce depois do portão; o `homolog-aprovada` não corre antes).
- (E2, E1.5) Parecer em `/home/rodrigoisensee/MetricasDSPD/docs/qa/043-f22-release.md`, gravado com a ferramenta Write, com `pedido: 043-forge-f21-f22`, `commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180`, `parecer: aprovado` ou `parecer: reprovado`, `## Achados` e os números; sem commit (o arquivo fica no projeto, como os pareceres de devops e review).
- (E1) Nada a entregar aqui: não nesta delegação (as etapas do F21 estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, commit e push da branch, sem PR." · etapa de outra delegação; continua no pedido (aguarda o dono)
- "E1.4 (forge:security-engineer): parecer de segurança de cada branch, antes do PR." · etapa de outra delegação (em paralelo a esta); continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; já entregue (0b59505)
- "E2.3 (forge:tech-lead): code review do F22 e push da branch, antes do E1.4 e do E1.5." · etapa de outra delegação; já entregue
- "E2.4 (forge:tech-lead): PR do F22 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- A parte F21 do E1.5 (o F21 aguarda o patch do dono); mudar o commit do F22 (defeito vira achado e volta ao autor); qualquer ato no GitHub ou push; editar `/home/rodrigoisensee/Forge`, o clone principal `~/.forge-contrib/MetricasDSPD` ou o cache do plugin (R-COPIA); rodar suíte deste projeto; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-27): F21 bloqueado pelo hook, opção A ("Da decisão time a A"): o dono aplica no clone de contribuição o diff do templates/projeto/.githooks/pre-push; o resto do F21 segue com o time.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041). O react-frontend do 026 pode estar rodando `pnpm run pronto`: antes da suíte `unittest`, `pgrep -fa 'playwright|vitest|vite|unittest'`; com outra suíte em curso, espere ela acabar.
- Decisões técnicas do Jarvis no Histórico do pedido (2026-10-27): F22 com a opção A; a falta de rc 0 da suíte dentro do Claude se prova na CI do PR do Forge. R-NEUTRO, R-VERIFY (nunca `--no-verify` nem `--force`), R-CONTRIB (só propor), R-CONFORMIDADE (bloqueio do hook vira relato). O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/qa/043-f22-release.md` · parecer de QA
- PQ-2 (cmd): `grep -c '^commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180$' /home/rodrigoisensee/MetricasDSPD/docs/qa/043-f22-release.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^parecer: ' /home/rodrigoisensee/MetricasDSPD/docs/qa/043-f22-release.md` · espera: igual '1'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 rev-parse HEAD` · espera: igual '0b595051930e4207d5a65eb3a5d551bf8f7b7180'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito, os números da `unittest` e os achados. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

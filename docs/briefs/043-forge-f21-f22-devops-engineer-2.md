Agente destino: forge:devops-engineer
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E2.2 do pedido 043 (cartão K-153): implementar o F22 no Forge (o fluxo de release diz quando abrir o PR homolog → main e que o passo do tech-lead é editar o PR existente, sem corrida com o portão), com commit na branch, sem push nem PR: o push é do review (E2.3) e o PR (E2.4) só sai depois do review, da segurança e do QA. Clone de contribuição `~/.forge-contrib/MetricasDSPD` (já criado; está com a branch do F21 em uso, não a toque): trabalhe numa worktree própria `~/.forge-contrib/MetricasDSPD-wt/f22`, branch `melhoria/MetricasDSPD-f22-release` a partir de `origin/develop` do Forge (41ba6111694be47fe997b48b21ddea0b44fe6151 na hora deste brief). Os campos Branch e Base-sha do cabeçalho são do projeto (nada muda nele); a entrega mora no repositório do Forge.

## Ler
- Skill `contribuir-com-o-forge` (passos 3 a 5): acesso, mudança e testes.
- `docs/analises/043-f22-pr-de-release.md` deste projeto: seções 4 a 6 (opção A e medida).
- `docs/security/043-forge-f21-f22-ameacas.md` deste projeto, seção F22: mitigações N1 a N6 e o que o parecer vai conferir.

## Entregar
- (E2, E2.2) Worktree `~/.forge-contrib/MetricasDSPD-wt/f22` com a branch `melhoria/MetricasDSPD-f22-release` de `origin/develop` (`git -C ~/.forge-contrib/MetricasDSPD fetch origin` antes). Se o ambiente recusar, pare e relate (R-CONFORMIDADE), sem contornar.
- (E2, E2.2) Opção A da análise: só texto em `skills/ci-cd/SKILL.md`, `agents/tech-lead.md` e `docs/regras/R-FLUXO.md` (quando abrir o PR de release, como achar e editar o existente), com as mitigações N1 a N6 do modelo de ameaças; fragmento em `changelog.d/` com `bin/forge-changelog novo` (decisão técnica do Jarvis no Histórico do pedido, base: skill `contribuir-com-o-forge`); teste em `tests/test_forge.py` só se o contrato do Forge pedir. Nenhum workflow nem hook alterado.
- (E2, E2.2) Os três comandos do passo 5 da skill verdes; commit com `git add` explícito por caminho; sem push. Parecer de devops em `/home/rodrigoisensee/MetricasDSPD/docs/devops/043-f22-release.md` (N1 a N6 por `arquivo:linha`, medida: 0 checks vermelhos por corrida e 0 PR duplicado em 2 releases) e rascunho do corpo do PR em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` (modelo de PR do Forge, sem dados deste projeto), os dois sem commit. Depois do commit, pare.
- (E1) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, commit e push da branch, sem PR." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:security-engineer): parecer de segurança de cada branch, antes do PR." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada branch (testes do Forge), antes do PR." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.3 (forge:tech-lead): code review do F22 e push da branch, antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:tech-lead): PR do F22 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Push; abrir, mesclar, rotular, fechar ou editar PR no Forge; a branch e a árvore do F21 no clone; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); a CI, o pre-push ou qualquer arquivo deste projeto fora do parecer e do rascunho; subir a versão do manifesto do plugin; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- Decisões técnicas do Jarvis no Histórico do pedido (2026-10-27): F22 com a opção A; a corrida do `homolog-aprovada` deste projeto fica no K-108, fora do Forge. R-NEUTRO: nada de dados deste projeto no texto nem nos exemplos. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONTRIB: só propor. Os testes do Forge são Python e leves; o QA do 026 roda a suíte deste projeto agora: não rode suíte deste projeto. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 log -1 --format=%H` · espera: o sha40 do commit do F22
- PQ-2 (cmd): `cd /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 && python3 -m unittest discover -s tests` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 diff --name-only origin/develop -- .github templates/projeto/.githooks hooks` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 status --porcelain` · espera: linhas=0
- PQ-5 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/devops/043-f22-release.md` · parecer de devops
- PQ-6 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` · rascunho do corpo do PR

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o sha da branch e como cada mitigação N1 a N6 foi atendida. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

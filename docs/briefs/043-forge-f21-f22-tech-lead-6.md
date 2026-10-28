Agente destino: forge:tech-lead
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: pr

## Objetivo
Etapa E2.4 do pedido 043 (cartão K-153): abrir o PR do F22 para a `develop` do Forge e parar aí (R-CONTRIB, só propor), agora que review (E2.3), segurança (E1.4) e QA (E1.5) aprovaram sem bloqueante. Os campos Branch e Base-sha do cabeçalho são do projeto (decisão técnica do Jarvis no Histórico do pedido, 2026-10-27 20:50); a entrega mora no clone de contribuição do Forge: worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`, branch `melhoria/MetricasDSPD-f22-release`, já empurrada em 0b595051930e4207d5a65eb3a5d551bf8f7b7180, sobre `origin/develop` do Forge em 41ba6111694be47fe997b48b21ddea0b44fe6151; repositório `rodrigo-isensee/Forge`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` (rascunho do corpo do PR, inteiro).
- `## Achados` de `/home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md`, `/home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md` e `/home/rodrigoisensee/MetricasDSPD/docs/qa/043-f22-release.md`.
- Skill `contribuir-com-o-forge`, passo do PR (título, corpo, base `develop`).

## Entregar
- (E2, E2.4) Corpo final do PR em `/home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md`, editado com a ferramenta Edit: a linha do rótulo `afrouxa-regra` vira `- [x] Rótulo afrouxa-regra: n/a, não afrouxa regra protegida` (A2 do QA, A1 do review); uma seção `## Pendências para o mantenedor` cita o A1 do QA e da segurança (`docs/regras/R-FLUXO.md:15` não diz quem é o autor esperado do PR de release) e diz que a suíte `unittest` do Forge deu 2130 testes e 59 falhas dentro do Claude na branch e na base 41ba611, mesma lista (testes que recusam rodar dentro do Claude), e que o rc 0 se prova na CI do PR; o corpo termina com as duas linhas de atribuição: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, uma linha em branco e `https://claude.ai/code/session_01VGwu56Tfg29UZnqDRmsU9H`. Sem nada deste projeto além da seção "Projeto de origem" já neutra (R-NEUTRO).
- (E2, E2.4) PR: `gh pr create --repo rodrigo-isensee/Forge --base develop --head melhoria/MetricasDSPD-f22-release --title "<título curto em português, no padrão de commits do Forge, citando o PR de release>" --body-file /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md`; antes, `gh pr list --repo rodrigo-isensee/Forge --head melhoria/MetricasDSPD-f22-release --state open` para não duplicar. Depois de criado, para: sem rótulo, sem revisor, sem merge, sem editar outro PR.
- (E1) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, commit e push da branch, sem PR." · etapa de outra delegação; continua no pedido (aguarda o patch do dono)
- "E1.4 (forge:security-engineer): parecer de segurança de cada branch, antes do PR." · etapa de outra delegação; F22 já entregue, F21 continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada branch (testes do Forge), antes do PR." · etapa de outra delegação; F22 já entregue, F21 continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; já entregue (0b59505)
- "E2.3 (forge:tech-lead): code review do F22 e push da branch, antes do E1.4 e do E1.5." · etapa de outra delegação; já entregue
- Mudar o commit ou a branch do F22 (o A1 fica como pendência ao mantenedor); mesclar, rotular, fechar ou revisar PR no Forge; enviar para `develop`, `homolog` ou `main` do Forge; o clone principal `~/.forge-contrib/MetricasDSPD` e a branch do F21; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); rodar suítes; commit no projeto; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-27): F21 bloqueado pelo hook, opção A ("Da decisão time a A"): o dono aplica no clone de contribuição o diff do templates/projeto/.githooks/pre-push; o resto do F21 segue com o time.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- Decisões técnicas do Jarvis no Histórico do pedido (2026-10-27): F22 com a opção A; fragmento em `changelog.d/` em cada PR do 043; a falta de rc 0 da suíte dentro do Claude se prova na CI do PR do Forge; os achados recomendados (A1, A2) não devolvem a entrega: o A2 se corrige no corpo e o A1 vai como pendência ao mantenedor (21:37 e 21:59). R-NEUTRO, R-VERIFY (nunca `--no-verify`, `--force` nem `--admin`), R-CONTRIB (só propor: abre o PR da própria branch e para), R-CONFORMIDADE (bloqueio do hook vira relato). O hook barra `$`, crase e `?` no Bash e lê nomes de teste do Forge num comando como o comando de sugestão: comandos literais, sem citar esses nomes no Bash.

## Pronto quando
- PQ-1 (cmd): `grep -c 'n/a, não afrouxa regra protegida' /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` · espera: igual '1'
- PQ-2 (cmd): `grep -c '^## Pendências para o mantenedor' /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f22-corpo-do-pr.md` · espera: igual '1'
- PQ-3 (pr): `gh pr list --repo rodrigo-isensee/Forge --head melhoria/MetricasDSPD-f22-release --base develop --state open --json number,url` · espera: contém 'url'
- PQ-4 (cmd): `gh pr list --repo rodrigo-isensee/Forge --head melhoria/MetricasDSPD-f22-release --state open --json number --jq length` · espera: igual '1'
- PQ-5 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 rev-parse HEAD` · espera: igual '0b595051930e4207d5a65eb3a5d551bf8f7b7180'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o número e a URL do PR e os checks da CI do Forge que já tiverem resultado. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

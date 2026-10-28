Agente destino: forge:security-engineer
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: seguranca

## Objetivo
Etapa E1.4 do pedido 043 para o F22 (cartão K-153): parecer de segurança da branch do F22 antes do PR (R-SEGURANCA: fluxo de release é gatilho). Os campos Branch e Base-sha do cabeçalho são do projeto (o forge-check só confere a base no repositório do pedido); a entrega mora no clone de contribuição do Forge: worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`, branch `melhoria/MetricasDSPD-f22-release`, commit 0b595051930e4207d5a65eb3a5d551bf8f7b7180 sobre `origin/develop` do Forge em 41ba6111694be47fe997b48b21ddea0b44fe6151, já no remoto, sem PR. Code review (E2.3) aprovado sem bloqueante.

## Ler
- `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 show 0b595051930e4207d5a65eb3a5d551bf8f7b7180` (4 arquivos, só texto).
- `/home/rodrigoisensee/MetricasDSPD/docs/security/043-forge-f21-f22-ameacas.md`: seção F22 (N1 a N6, mitigações exigidas).
- `/home/rodrigoisensee/MetricasDSPD/docs/reviews/043-f22-release.md`: só `## Achados` e veredito.

## Entregar
- (E2, E1.4) Parecer de segurança do commit 0b59505 contra N1 a N6 (R-MAIN: o PR na `main` é do dono; `gh pr edit` só sobre PR próprio; sem troca de base; nada que afrouxe portão), em `/home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md`, gravado com a ferramenta Write, com `pedido: 043-forge-f21-f22`, `commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180`, `## Achados` e veredito (aprovado ou reprovado); sem commit (o arquivo fica no projeto, como os pareceres de devops e review).
- (E1) Nada a entregar aqui: não nesta delegação (as etapas do F21 estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, commit e push da branch, sem PR." · etapa de outra delegação; continua no pedido (aguarda o dono)
- "E1.5 (forge:qa-engineer): parecer de QA de cada branch (testes do Forge), antes do PR." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead, outra instância): code review do F21 (R-REVIEW), antes do E1.4 e do E1.5." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): PR do F21 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; já entregue (0b59505)
- "E2.3 (forge:tech-lead): code review do F22 e push da branch, antes do E1.4 e do E1.5." · etapa de outra delegação; já entregue
- "E2.4 (forge:tech-lead): PR do F22 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- A parte F21 do E1.4 (o F21 aguarda o patch do dono); mudar o commit do F22 (ajuste volta ao autor); qualquer ato no GitHub ou push; editar `/home/rodrigoisensee/Forge`, o clone de contribuição ou o cache do plugin (R-COPIA); rodar suíte de teste; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-27): F21 bloqueado pelo hook, opção A ("Da decisão time a A"): o dono aplica no clone de contribuição o diff do templates/projeto/.githooks/pre-push; o resto do F21 segue com o time.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- Decisões técnicas do Jarvis no Histórico do pedido (2026-10-27): F22 com a opção A; push antes do review e cabeçalho dos briefs com Branch e Base-sha do projeto (20:50). R-NEUTRO, R-CONTRIB (só propor), R-CONFORMIDADE (bloqueio do hook vira relato). Análise estática, só leitura. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md` · parecer de segurança
- PQ-2 (cmd): `grep -c '^commit: 0b595051930e4207d5a65eb3a5d551bf8f7b7180$' /home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md` · espera: igual '1'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

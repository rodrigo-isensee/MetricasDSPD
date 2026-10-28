Agente destino: forge:security-engineer
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E1.2 do pedido 043 (cartões K-152 e K-153): modelo de ameaças das duas melhorias do Forge antes da implementação (R-SEGURANCA: hooks e fluxo de release são gatilho), para que o E1.3 (F21) e o E2.2 (F22) já nasçam com as mitigações. Sem worktree nem branch de código: só leitura e um documento.

## Ler
- `docs/analises/043-f21-worktree-sem-dependencias.md`: opção recomendada C (dica no pre-push do modelo quando o pre-push.local falha em worktree vinculada; comando de preparação declarado na stack) e a opção D descartada (instalador no hook).
- `docs/analises/043-f22-pr-de-release.md`: opção recomendada A (só texto em skill ci-cd, agents/tech-lead.md e R-FLUXO.md: quando abrir o PR de release e editar o existente com `gh pr edit`).
- No clone local do Forge (`/home/rodrigoisensee/Forge`, develop em 363ceee; leitura apenas): `templates/projeto/.githooks/pre-push` e `docs/regras/R-VERIFY.md`.

## Entregar
- (E1, E1.2) Modelo de ameaças do F21 em `docs/security/043-forge-f21-f22-ameacas.md`, seção F21: o que a dica do pre-push pode vazar ou induzir (texto de saída de comando, execução de comando sugerido, contorno de `--no-verify`), a detecção de worktree por `git rev-parse` e o risco de a dica mascarar falha real; mitigações exigidas ao E1.3 e o que o parecer E1.4 vai conferir.
- (E2, E1.2) Na mesma análise, seção F22: o risco do texto novo de release (`gh pr edit` sobre PR de outro autor, troca de base, PR na `main` que é do dono, R-MAIN); mitigações exigidas ao E2.2. Se não houver ameaça relevante, diga isso com a base.
- (E1, E2, E1.2) Sem commit (o arquivo entra no PR de docs do Jarvis).

## Fora do escopo
- "E1.1 (forge:software-architect): discovery do F21 na develop do Forge: onde nascem as worktrees (skills, modelo de brief) e o pre-push do modelo de projeto; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, PR para a develop do Forge; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:security-engineer): parecer de segurança de cada PR." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada PR (testes do Forge)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:tech-lead): code review do F22, push e PR para a develop do Forge; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); editar hooks, workflows ou qualquer arquivo deste projeto fora do documento; ato no GitHub que escreva; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- Decisões técnicas do Jarvis já registradas no Histórico do pedido (2026-10-27): F21 segue com a opção C; F22 com a opção A. R-NEUTRO: nada de dados deste projeto no texto que irá ao Forge. Teste: nenhum. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/security/043-forge-f21-f22-ameacas.md` · modelo de ameaças gravado
- PQ-2 (cmd): `grep -c -e '^## F21' -e '^## F22' /home/rodrigoisensee/MetricasDSPD/docs/security/043-forge-f21-f22-ameacas.md` · espera: igual '2'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui as mitigações exigidas a cada implementação. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

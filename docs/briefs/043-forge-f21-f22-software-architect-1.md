Agente destino: forge:software-architect
Pedido: 043-forge-f21-f22
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E1.1 do pedido 043 (cartão K-152): discovery do F21 do Forge: numa worktree recém-criada não há `node_modules` e o pre-push falha com "eslint: not found", só na hora do push. Decidir onde a fábrica corrige isso (roteiro de criar worktree ou aviso no pre-push), com a opção recomendada e a medida, para o tech-lead implementar num PR à develop do Forge (E1.3). Sem worktree nem branch de código: só leitura e um documento de análise.

## Ler
- `docs/kanban/prompt-jarvis-forge-2026-10-21.md`, seção "F21" (problema, evidência, sugestão, medida).
- No clone local do Forge (`/home/rodrigoisensee/Forge`, develop em 363ceee; o delta até a develop remota não toca estes caminhos): `templates/projeto/.githooks/pre-push` (o hook chama `.githooks/pre-push.local` do projeto), `skills/contribuir-com-o-forge/SKILL.md` seção 2 (worktree), `docs/regras/R-WIP.md` (formato `worktree:` do cartão) e o que mais citar `worktree` em `skills/` e `agents/` (busca por "worktree").
- Neste projeto, só para a evidência: `.githooks/pre-push.local` (o lint e o typecheck que falham sem dependências).

## Entregar
- (E1, E1.1) Análise em `docs/analises/043-f21-worktree-sem-dependencias.md`: onde as worktrees nascem no fluxo da fábrica (quem roda `git worktree add` e em que passo); 2 ou 3 opções (ex.: passo `pnpm install --frozen-lockfile` no roteiro de worktree; aviso no `pre-push` do modelo quando falta `node_modules`; as duas), cada uma com os arquivos do Forge que muda, o custo e o risco; a opção recomendada; como medir (pushes barrados por dependência ausente em worktree nova = 0) e a neutralidade de stack (R-NEUTRO: o Forge serve a outras stacks além de node).
- (E1, E1.1) Sem commit (o arquivo entra no PR de docs do Jarvis).
- (E2) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.2 (forge:security-engineer): modelo de ameaças do F21 e do F22 (hooks e workflows são gatilho de R-SEGURANCA)." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:tech-lead): implementar o F21 numa branch `melhoria/*` do clone de contribuição, testes do Forge verdes, PR para a develop do Forge; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:security-engineer): parecer de segurança de cada PR." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): parecer de QA de cada PR (testes do Forge)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): discovery do F22 nos modelos de CI/CD da fábrica: quem cria o PR de release e como o `homolog-aprovada` espera o portão; opção recomendada e medida." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:devops-engineer): implementar o F22 numa branch `melhoria/*` do clone de contribuição, com parecer de devops." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:tech-lead): code review do F22, push e PR para a develop do Forge; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Editar qualquer arquivo em `/home/rodrigoisensee/Forge` ou no cache do plugin (R-COPIA); mudar o pre-push deste projeto; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): melhorias F21 e F22 do Forge (docs/kanban/prompt-jarvis-forge-2026-10-21.md), opção A ("A"): agora, em paralelo às entregas do projeto, um cartão e um PR por melhoria na develop do Forge, só propor (R-CONTRIB); vira pedido próprio (043).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- R-NEUTRO: a solução não pode supor node nem pnpm para todos os projetos. R-CONTRIB: sessão de projeto só propõe. Nada de dados do projeto no texto que irá ao PR do Forge.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-worktree-sem-dependencias.md` · análise gravada
- PQ-2 (cmd): `grep -i 'recomend' /home/rodrigoisensee/MetricasDSPD/docs/analises/043-f21-worktree-sem-dependencias.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui a opção recomendada e os arquivos do Forge que ela muda. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

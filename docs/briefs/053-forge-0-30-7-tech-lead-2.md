Agente destino: forge:tech-lead
Pedido: 053-forge-0-30-7
Tipo: codigo
Branch: forge/upgrade-0.30.7   Base: develop   Base-sha: 1a6617ec31c40c496e12708b5bf313904f90c350
Etapa: pr

## Objetivo
Etapa E1.4 do pedido 053 (E1, cartão K-184): abrir o PR da `forge/upgrade-0.30.7` para a develop, sem merge (o merge é do dono, E1.5). Worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, HEAD 3ebdf8131fdafa63077fba5f94da2cfa17d95a41 (igual ao origin): f865e94 (registro do Forge 0.30.7), review aprovado em fa43103 e QA aprovado em 3ebdf81, os dois conferidos. O pedido do dono: "atualize o projeto para a Forge 0.30.7 (forge-upgrade) numa branch propria a partir do develop, abra PR para o develop e, depois do merge, leve a atualizacao para os worktrees que continuam em uso (MetricasDSPD-0xx). Nunca na main."

## Ler
- `docs/reviews/053-forge-0-30-7.md` e `docs/qa/053-forge-0-30-7.md` na worktree.
- A seção de pull request do `docs/engineering/praticas.md`; o PR #162 (pedido 049, Forge 0.30.5) como modelo de título e corpo (`gh pr view 162`).

## Entregar
- (E1.4, E1) Rodar `forge-check pr 053-forge-0-30-7 --ref origin/forge/upgrade-0.30.7 --base origin/develop` de dentro da worktree; saída com pendência: pare e relate a mensagem literal, sem abrir o PR.
- (E1.4) Abrir o PR com `gh pr create --base develop --head forge/upgrade-0.30.7`, título no padrão do `praticas.md` citando o Forge 0.30.7 e o K-184, corpo com o resumo do diff, os pareceres de review e de QA (caminho e veredito), a nota de que o merge é do dono e a linha de atribuição de PR da sessão. Sem merge, sem auto-merge, sem aprovar.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, a partir da develop 1a6617ec31c40c496e12708b5bf313904f90c350; branch `forge/upgrade-0.30.7`, commit f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-30 05:31 por ordem literal do dono." · etapa de outra delegação; já entregue (f865e94)
- "E1.2 (forge:tech-lead): code review do f865e94 (R-REVIEW), parecer `docs/reviews/053-forge-0-30-7.md` commitado na branch `forge/upgrade-0.30.7`, e push, sem PR." · etapa de outra delegação; já entregue (fa43103, aprovado)
- "E1.3 (forge:qa-engineer): parecer de QA da branch (R-QA), `docs/qa/053-forge-0-30-7.md`, commitado na branch, com push." · etapa de outra delegação; já entregue (3ebdf81, aprovado)
- "E1.5 (dono): merge do PR (como no PR #162 do pedido 049: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:tech-lead): depois do E1.5, merge da develop (merge commit, sem rebase) em cada branch de trabalho ainda aberta das worktrees `MetricasDSPD-0xx` em uso, com push; conflito: para e relata." · etapa de outra delegação; continua no pedido
- Commit, push, merge ou `gh pr update-branch`; editar a pasta `.forge/` ou os pareceres; rodar a suíte ou o `pronto`; o quadro e o arquivo do pedido; outras worktrees, o PR #171, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/053-forge-0-30-7.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 9 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 7 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 4 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook ou check vermelho: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (pr): `gh pr list --head forge/upgrade-0.30.7 --base develop --state open --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `gh pr view forge/upgrade-0.30.7 --json headRefOid --jq .headRefOid` · espera: igual '3ebdf8131fdafa63077fba5f94da2cfa17d95a41'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o número e o link do PR, a saída do `forge-check pr` e o estado dos checks; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:qa-engineer
Pedido: 049-forge-0-30-5
Tipo: codigo
Branch: forge/upgrade-0.30.5   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 049 (E1, cartão K-179): parecer de QA (R-QA) do registro do Forge 0.30.5 no projeto, depois do review aprovado (E1.2, `docs/reviews/049-forge-0-30-5.md`, commit 2b395a846096b8fbf2d96ec8510dffd8210e178f). Worktree `/home/rodrigoisensee/MetricasDSPD-upg`, branch `forge/upgrade-0.30.5`, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upg show 5d7c199 --stat` e o parecer `/home/rodrigoisensee/MetricasDSPD-upg/docs/reviews/049-forge-0-30-5.md`.
- Um parecer anterior em `docs/qa/` como modelo de forma.

## Entregar
- (E1.3, E1) Verificar que a versão registrada no projeto é a do plugin em uso: o conteúdo do arquivo de versão do Forge na worktree é `0.30.5` e existe a pasta `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.5`; o diff da branch contra `origin/develop` traz só esse arquivo e o parecer de review; nenhum arquivo de código, teste, pipeline ou interface muda (sem E2E nem revisão de UX a fazer).
- (E1.3) Parecer `docs/qa/049-forge-0-30-5.md` na worktree, com o cabeçalho dos pareceres de QA (`tipo: qa`, `pedido: 049-forge-0-30-5`, `branch: forge/upgrade-0.30.5`, `commit:` o head conferido, `parecer:`, `data:`), as verificações feitas com a saída real e a seção `## Achados` (vazia se não houver).
- (E1.3) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-179` e `git add docs/qa/049-forge-0-30-5.md`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-upg branch --show-current` (espera `forge/upgrade-0.30.5`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-upg push origin HEAD:refs/heads/forge/upgrade-0.30.5`, sem `-u` e sem PR.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg`, a partir da develop 7c94348; branch `forge/upgrade-0.30.5`, commit 5d7c199 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-29 07:42 por ordem literal do dono." · etapa de outra delegação; já entregue (5d7c199)
- "E1.2 (forge:tech-lead): code review do 5d7c199 (R-REVIEW), parecer `docs/reviews/049-forge-0-30-5.md` commitado na branch `forge/upgrade-0.30.5`, e push, sem PR." · etapa de outra delegação; já entregue (2b395a8)
- "E1.4 (forge:tech-lead): PR da `forge/upgrade-0.30.5` para a develop, depois do review e do QA aprovados, sem merge." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): merge do PR (como no PR #151 do K-140: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- Editar a pasta `.forge/` ou rodar o `forge-upgrade`; rodar a suíte de testes, a E2E ou o `pronto` (o diff não tem código, e há outra suíte rodando: uma por vez); abrir PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono (`docs/pedidos/049-forge-0-30-5.md`, linha 4): "se o projeto precisar do forge-upgrade para 0.30.5, faca numa branch (nunca na main)".
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash, e crase também dentro de heredoc: comandos literais, um por linha; escreva o parecer com a ferramenta Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upg/docs/qa/049-forge-0-30-5.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-upg log --format=%H 2b395a846096b8fbf2d96ec8510dffd8210e178f..HEAD` · espera: linhas=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg ls-remote origin refs/heads/forge/upgrade-0.30.5` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-upg rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg diff --name-only 2b395a846096b8fbf2d96ec8510dffd8210e178f HEAD` · espera: igual 'docs/qa/049-forge-0-30-5.md'

## Relatório
Até 8 linhas, resultado real: o veredito, as verificações com a saída e os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

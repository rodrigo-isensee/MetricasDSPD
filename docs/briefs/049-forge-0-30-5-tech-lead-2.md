Agente destino: forge:tech-lead
Pedido: 049-forge-0-30-5
Tipo: codigo
Branch: forge/upgrade-0.30.5   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo

## Objetivo
Etapa E1.2 do pedido 049 (E1, cartão K-179): code review do registro do Forge 0.30.5 no projeto. A worktree `/home/rodrigoisensee/MetricasDSPD-upg` tem a branch `forge/upgrade-0.30.5` com o commit 5d7c199 (gerado pelo `forge-upgrade` a partir da develop 7c94348b9bdc12850f40bad00cd38669ba8cc0e5), ainda sem push. O pedido do dono: "se o projeto precisar do forge-upgrade para 0.30.5, faca numa branch (nunca na main)".

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upg show 5d7c199`.
- A seção de code review e a de commits do `docs/engineering/praticas.md`; um parecer anterior em `docs/reviews/` como modelo de forma.

## Entregar
- (E1.2, E1) Code review do 5d7c199 (R-REVIEW): o diff é só o registro de versão do Forge (0.30.3 para 0.30.5), sem outro arquivo; a mensagem do commit segue o padrão; nada da `main` envolvido. Parecer `docs/reviews/049-forge-0-30-5.md` na worktree, com veredito, o `commit:` revisado e a seção `## Achados` (vazia se não houver).
- (E1.2) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-179` e `git add docs/reviews/049-forge-0-30-5.md`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-upg branch --show-current` (espera `forge/upgrade-0.30.5`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-upg push origin HEAD:refs/heads/forge/upgrade-0.30.5`, sem `-u` e sem PR.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg`, a partir da develop 7c94348; branch `forge/upgrade-0.30.5`, commit 5d7c199 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-29 07:42 por ordem literal do dono." · etapa de outra delegação; já entregue (5d7c199)
- "E1.3 (forge:qa-engineer): parecer de QA da branch (R-QA), `docs/qa/049-forge-0-30-5.md`, commitado na branch, com push." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR da `forge/upgrade-0.30.5` para a develop, depois do review e do QA aprovados, sem merge." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): merge do PR (como no PR #151 do K-140: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- Editar a pasta `.forge/` ou rodar o `forge-upgrade` de novo; rodar a suíte de testes ou o `pronto` (o diff não tem código); abrir PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/049-forge-0-30-5.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upg/docs/reviews/049-forge-0-30-5.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-upg log --format=%H 5d7c199..HEAD` · espera: linhas=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg ls-remote origin refs/heads/forge/upgrade-0.30.5` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-upg rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg diff --name-only 5d7c199 HEAD` · espera: igual 'docs/reviews/049-forge-0-30-5.md'

## Relatório
Até 8 linhas, resultado real: o veredito do review e os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

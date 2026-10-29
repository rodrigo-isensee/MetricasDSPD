Agente destino: forge:tech-lead
Pedido: 049-forge-0-30-5
Tipo: codigo
Branch: forge/upgrade-0.30.5   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo

## Objetivo
Etapa E1.2 do pedido 049 (E1, cartão K-179): publicar o registro do Forge 0.30.5 no projeto. A worktree `/home/rodrigoisensee/MetricasDSPD-upg` já tem a branch `forge/upgrade-0.30.5` com o commit 5d7c199 (só `.forge/versao`), feito a partir da develop 7c94348b9bdc12850f40bad00cd38669ba8cc0e5 e ainda sem push. O pedido do dono: "se o projeto precisar do forge-upgrade para 0.30.5, faca numa branch (nunca na main)".

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upg show --stat HEAD`, para conferir que o diff é só `.forge/versao`.
- A seção de pull requests do `docs/engineering/praticas.md`.

## Entregar
- (E1.2, E1) Conferir `git -C /home/rodrigoisensee/MetricasDSPD-upg branch --show-current` (espera `forge/upgrade-0.30.5`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-upg push origin HEAD:refs/heads/forge/upgrade-0.30.5`, sem `-u`.
- (E1.2, E1) PR para a `develop` com `gh pr create --base develop --head forge/upgrade-0.30.5`, título `chore(forge): registra versão 0.30.5 (K-179)`, corpo com o pedido 049, o diff (só `.forge/versao`, 0.30.3 → 0.30.5) e a nota de que o merge é do dono, como no PR #151 do K-140. Não mesclar.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg`, a partir da develop 7c94348; branch `forge/upgrade-0.30.5`, commit 5d7c199 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-29 07:42 por ordem literal do dono." · etapa de outra delegação; já entregue (5d7c199)
- "E1.3 (dono): merge do PR (como no PR #151 do K-140: `.forge/versao` é do dono)." · etapa de outra delegação; continua no pedido
- Novo commit, edição de `.forge/`, rodar o `forge-upgrade` de novo, rodar testes ou o `pronto` (os checks da CI do PR cobrem); mesclar o PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/049-forge-0-30-5.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- `.forge/versao` é do dono: o merge fica com ele (R-MAIN no espírito do PR #151).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg ls-remote origin refs/heads/forge/upgrade-0.30.5` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-upg rev-parse HEAD`
- PQ-2 (pr): `gh pr list --head forge/upgrade-0.30.5 --base develop --state open --json number --jq length` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg diff --name-only origin/develop HEAD` · espera: igual '.forge/versao'

## Relatório
Até 8 linhas, resultado real: o número e a URL do PR, o estado dos checks no momento do relatório; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

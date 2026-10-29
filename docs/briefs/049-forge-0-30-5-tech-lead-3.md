Agente destino: forge:tech-lead
Pedido: 049-forge-0-30-5
Tipo: codigo
Branch: forge/upgrade-0.30.5   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: pr

## Objetivo
Etapa E1.4 do pedido 049 (E1, cartão K-179): abrir o PR do registro do Forge 0.30.5 para a develop, com review (E1.2, 2b395a8) e QA (E1.3, 0dd83ad2c6626f766f28e996073bbac1785e7c4e) aprovados e sem achados. Worktree `/home/rodrigoisensee/MetricasDSPD-upg`, branch `forge/upgrade-0.30.5`, head 0dd83ad2c6626f766f28e996073bbac1785e7c4e, já no origin. O pedido do dono: "se o projeto precisar do forge-upgrade para 0.30.5, faca numa branch (nunca na main)".

## Ler
- Os pareceres `docs/reviews/049-forge-0-30-5.md` e `docs/qa/049-forge-0-30-5.md` na worktree.
- A seção de pull requests do `docs/engineering/praticas.md`.

## Entregar
- (E1.4, E1) PR para a `develop` com `gh pr create --base develop --head forge/upgrade-0.30.5`, rodado da worktree, título `chore(forge): registra versão 0.30.5 (K-179)`, corpo com o pedido 049, o diff (o arquivo de versão do Forge de 0.30.3 para 0.30.5, mais os dois pareceres), os vereditos de review e QA e a nota de que o merge é do dono, como no PR #151 do K-140. Não mesclar.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg`, a partir da develop 7c94348; branch `forge/upgrade-0.30.5`, commit 5d7c199 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-29 07:42 por ordem literal do dono." · etapa de outra delegação; já entregue (5d7c199)
- "E1.2 (forge:tech-lead): code review do 5d7c199 (R-REVIEW), parecer `docs/reviews/049-forge-0-30-5.md` commitado na branch `forge/upgrade-0.30.5`, e push, sem PR." · etapa de outra delegação; já entregue (2b395a8)
- "E1.3 (forge:qa-engineer): parecer de QA da branch (R-QA), `docs/qa/049-forge-0-30-5.md`, commitado na branch, com push." · etapa de outra delegação; já entregue (0dd83ad)
- "E1.5 (dono): merge do PR (como no PR #151 do K-140: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- Novo commit, edição da pasta `.forge/`, rodar testes ou o `pronto`; mesclar o PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/049-forge-0-30-5.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash, e crase também em heredoc: grave o corpo do PR com a ferramenta Write num arquivo `pr-049-forge-0-30-5.md` no diretório temporário e use `--body-file`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (pr): `gh pr list --head forge/upgrade-0.30.5 --base develop --state open --json number --jq length` · espera: igual '1'
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg ls-remote origin refs/heads/forge/upgrade-0.30.5` igual a 0dd83ad2c6626f766f28e996073bbac1785e7c4e

## Relatório
Até 8 linhas, resultado real: o número e a URL do PR, o estado dos checks no momento do relatório; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

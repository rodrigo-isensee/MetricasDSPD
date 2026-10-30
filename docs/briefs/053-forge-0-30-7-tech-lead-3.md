Agente destino: forge:tech-lead
Pedido: 053-forge-0-30-7
Tipo: codigo
Branch: feature/048-ajustes-front   Base: develop   Base-sha: 7c94348b9bdc12850f40bad00cd38669ba8cc0e5
Etapa: codigo   Cobre: E2.1

## Objetivo
Levar o Forge 0.30.7 (PR #172, mesclado pelo dono em 2026-10-30, develop 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5) às worktrees em uso do projeto (pedido 053, E2), por merge da develop em cada branch de trabalho aberta. Cartão K-184. Em uso: as três branches sem PR mesclado (`gh pr list --state merged` vazio em 2026-10-30 08:21).

## Ler
- `docs/engineering/praticas.md`, seção de commits (mensagem do merge).

## Entregar
- "E2.1 (tech-lead): depois do E1.5, merge da develop (merge commit, sem rebase) em cada branch de trabalho ainda aberta das worktrees `MetricasDSPD-0xx` em uso, com push; conflito: para e relata." (E2.1)
- (E2.1) Em cada uma das três worktrees em uso, uma por vez, nesta ordem: `/home/rodrigoisensee/MetricasDSPD-048d` (`feature/048-ajustes-front`), `/home/rodrigoisensee/MetricasDSPD-048b` (`feature/048-usabilidade`) e `/home/rodrigoisensee/MetricasDSPD-048f` (`feature/048-k129-pico`): `git fetch origin`; `git branch --show-current` deve dar a branch listada; `git merge --no-ff origin/develop` (develop 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5, com o `.forge/versao` em 0.30.7), mensagem no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-184`; push com `git push origin HEAD:refs/heads/<branch>`, sem `--force`. Conflito ou recusa de hook: `git merge --abort`, pare e relate a mensagem literal.
- (E2.1) Sem testes nem `pronto` (cada branch passa por review e QA antes do PR) e sem PR.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, a partir da develop 1a6617ec31c40c496e12708b5bf313904f90c350; branch `forge/upgrade-0.30.7`, commit f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-30 05:31 por ordem literal do dono." · etapa de outra delegação; já entregue (f865e94)
- "E1.2 (tech-lead): code review do f865e94 (R-REVIEW), parecer `docs/reviews/053-forge-0-30-7.md` commitado na branch `forge/upgrade-0.30.7`, e push, sem PR." · etapa de outra delegação; já entregue (fa43103)
- "E1.3 (qa-engineer): parecer de QA da branch (R-QA), `docs/qa/053-forge-0-30-7.md`, commitado na branch, com push." · etapa de outra delegação; já entregue (3ebdf81)
- "E1.4 (tech-lead): PR da `forge/upgrade-0.30.7` para a develop, depois do review e do QA aprovados, sem merge." · etapa de outra delegação; já entregue (PR #172)
- "E1.5 (dono): merge do PR (como no PR #162 do pedido 049: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; já entregue (PR #172 mesclado pelo dono, 9aa6b29)
- Worktrees de branch com PR já mesclado (026, 026c, 026d, 041b, 045, 048c, 048e, 050, 051, 052, upg, upgrade, upg7): ficam para a remoção pelo dono. O re-review do delta da 048d (pedido 048, E5.1) e o PR das branches: outras delegações. Rodar testes, mexer em código, resolver conflito, o arquivo não versionado `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` da 048b, o quadro e os pedidos; ler ou editar o `.env`.

## Decisões e restrições
- Erro recorrente deste destino (forge-check, 30 dias): base em 9 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 9 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 5 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- O pedido 053 não tem linha de decisão do dono além da frase do Objetivo do pedido: "atualize o projeto para a Forge 0.30.7 (forge-upgrade) numa branch propria a partir do develop, abra PR para o develop e, depois do merge, leve a atualizacao para os worktrees que continuam em uso (MetricasDSPD-0xx). Nunca na main."
- Merge commit, sem rebase (E2.1). Nunca a `main` nem a `homolog`.
- A 048b tem `docs/ux/revisao-geral-usabilidade/06-parecer-ca-b.md` não versionado (parecer do ux-designer): não apague, não commite e não mova.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- Não ler nem editar o `.env`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook ou check vermelho: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d merge-base --is-ancestor 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5 HEAD` · espera: rc=0
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048d ls-remote origin refs/heads/feature/048-ajustes-front` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048d rev-parse HEAD`
- PQ-3 (cmd): `cat /home/rodrigoisensee/MetricasDSPD-048d/.forge/versao` · espera: igual '0.30.7'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048d status --porcelain --untracked-files=no` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b merge-base --is-ancestor 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5 HEAD` · espera: rc=0
- PQ-6 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048b ls-remote origin refs/heads/feature/048-usabilidade` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048b rev-parse HEAD`
- PQ-7 (cmd): `cat /home/rodrigoisensee/MetricasDSPD-048b/.forge/versao` · espera: igual '0.30.7'
- PQ-8 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048b status --porcelain --untracked-files=no` · espera: linhas=0
- PQ-9 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048f merge-base --is-ancestor 9aa6b29bddb25ca6189b64537584f8f0a6f8d1a5 HEAD` · espera: rc=0
- PQ-10 (push): `git -C /home/rodrigoisensee/MetricasDSPD-048f ls-remote origin refs/heads/feature/048-k129-pico` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-048f rev-parse HEAD`
- PQ-11 (cmd): `cat /home/rodrigoisensee/MetricasDSPD-048f/.forge/versao` · espera: igual '0.30.7'
- PQ-12 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-048f status --porcelain --untracked-files=no` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real, na ordem: estado; o que precisa do dono; suposições com a base; por worktree, o sha do merge e o resultado do push; conflitos ou recusas; riscos. Depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

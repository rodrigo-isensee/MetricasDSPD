Agente destino: forge:tech-lead
Pedido: 053-forge-0-30-7
Tipo: codigo
Branch: forge/upgrade-0.30.7   Base: develop   Base-sha: 1a6617ec31c40c496e12708b5bf313904f90c350
Etapa: review

## Objetivo
Etapa E1.2 do pedido 053 (E1, cartão K-184): code review do registro do Forge 0.30.7 no projeto. A worktree `/home/rodrigoisensee/MetricasDSPD-upg7` tem a branch `forge/upgrade-0.30.7` com o commit f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 (gerado pelo `forge-upgrade` a partir da develop 1a6617ec31c40c496e12708b5bf313904f90c350), já enviada pelo Jarvis (origin igual ao f865e94). O pedido do dono: "atualize o projeto para a Forge 0.30.7 (forge-upgrade) numa branch propria a partir do develop, abra PR para o develop e, depois do merge, leve a atualizacao para os worktrees que continuam em uso (MetricasDSPD-0xx). Nunca na main."

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upg7 show f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5`.
- A seção de code review e a de commits do `docs/engineering/praticas.md`; o parecer anterior `docs/reviews/049-forge-0-30-5.md` como modelo de forma.

## Entregar
- (E1.2, E1) Code review do f865e94 (R-REVIEW): o diff é só o registro de versão do Forge (0.30.5 para 0.30.7), sem outro arquivo; a mensagem do commit segue o padrão; a base é a develop atual; nada da `main` envolvido. Parecer `docs/reviews/053-forge-0-30-7.md` na worktree, gravado com a ferramenta Write (não com `sed` nem redirecionamento, para o registro de autoria), com veredito, o `commit:` revisado, `pedido: 053-forge-0-30-7`, `branch: forge/upgrade-0.30.7` e a seção `## Achados` (vazia se não houver).
- (E1.2) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-184` e `git add docs/reviews/053-forge-0-30-7.md`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-upg7 branch --show-current` (espera `forge/upgrade-0.30.7`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-upg7 push origin HEAD:refs/heads/forge/upgrade-0.30.7`, sem `-u` e sem PR.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, a partir da develop 1a6617ec31c40c496e12708b5bf313904f90c350; branch `forge/upgrade-0.30.7`, commit f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-30 05:31 por ordem literal do dono." · etapa de outra delegação; já entregue (f865e94)
- "E1.3 (forge:qa-engineer): parecer de QA da branch (R-QA), `docs/qa/053-forge-0-30-7.md`, commitado na branch, com push." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR da `forge/upgrade-0.30.7` para a develop, depois do review e do QA aprovados, sem merge." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): merge do PR (como no PR #162 do pedido 049: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:tech-lead): depois do E1.5, merge da develop (merge commit, sem rebase) em cada branch de trabalho ainda aberta das worktrees `MetricasDSPD-0xx` em uso, com push; conflito: para e relata." · etapa de outra delegação; continua no pedido
- Editar a pasta `.forge/` ou rodar o `forge-upgrade` de novo; rodar a suíte de testes ou o `pronto` (o diff não tem código); abrir PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/053-forge-0-30-7.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 9 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): base em 6 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): etapa em 4 entregas · evita: confira a ordem das etapas do pedido e `forge-check pr <pedido>`; marque toda etapa de outra instância do mesmo agente (D-ETAPAS)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upg7/docs/reviews/053-forge-0-30-7.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 log --format=%H f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5..HEAD` · espera: linhas=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 ls-remote origin refs/heads/forge/upgrade-0.30.7` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-upg7 rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 diff --name-only f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 HEAD` · espera: igual 'docs/reviews/053-forge-0-30-7.md'

## Relatório
Até 8 linhas, resultado real: o veredito do review e os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

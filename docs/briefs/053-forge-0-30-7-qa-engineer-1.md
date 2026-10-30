Agente destino: forge:qa-engineer
Pedido: 053-forge-0-30-7
Tipo: codigo
Branch: forge/upgrade-0.30.7   Base: develop   Base-sha: 1a6617ec31c40c496e12708b5bf313904f90c350
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 053 (E1, cartão K-184): parecer de QA (R-QA) da branch `forge/upgrade-0.30.7`, que registra o Forge 0.30.7 no projeto. Worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, HEAD fa43103b028d8b985a9cafa28d433d61d0408e31 (f865e94, só o registro de versão, mais o parecer de review aprovado em fa43103). O pedido do dono: "atualize o projeto para a Forge 0.30.7 (forge-upgrade) numa branch propria a partir do develop, abra PR para o develop e, depois do merge, leve a atualizacao para os worktrees que continuam em uso (MetricasDSPD-0xx). Nunca na main."

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upg7 diff --stat 1a6617ec31c40c496e12708b5bf313904f90c350 HEAD`.
- `docs/reviews/053-forge-0-30-7.md` na worktree; o parecer de QA anterior `docs/qa/049-forge-0-30-5.md` como modelo de forma.

## Entregar
- (E1.3, E1) QA da branch (R-QA): conferir que o diff contra a base é só o registro de versão do Forge (0.30.5 para 0.30.7) e o parecer de review; rodar `forge-check docs` de dentro da worktree; sem suíte de testes nem `pronto` (o diff não tem código, como no 049). Parecer `docs/qa/053-forge-0-30-7.md` na worktree, gravado com a ferramenta Write (não com `sed` nem redirecionamento), com veredito, `commit:` igual ao HEAD fa43103b028d8b985a9cafa28d433d61d0408e31, `pedido: 053-forge-0-30-7`, `branch: forge/upgrade-0.30.7`, o que foi verificado com o resultado real e a seção `## Achados` (vazia se não houver). O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- (E1.3) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-184` e `git add docs/qa/053-forge-0-30-7.md`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-upg7 branch --show-current` (espera `forge/upgrade-0.30.7`) e push com `git -C /home/rodrigoisensee/MetricasDSPD-upg7 push origin HEAD:refs/heads/forge/upgrade-0.30.7`, sem `-u` e sem PR.

## Fora do escopo
- "E1.1 (dono): `forge-upgrade` na worktree `/home/rodrigoisensee/MetricasDSPD-upg7`, a partir da develop 1a6617ec31c40c496e12708b5bf313904f90c350; branch `forge/upgrade-0.30.7`, commit f865e947c2cd6371f3ad1d6ad765f3cced7ce4e5 (só `.forge/versao`). Rodado pelo Jarvis em 2026-10-30 05:31 por ordem literal do dono." · etapa de outra delegação; já entregue (f865e94)
- "E1.2 (forge:tech-lead): code review do f865e94 (R-REVIEW), parecer `docs/reviews/053-forge-0-30-7.md` commitado na branch `forge/upgrade-0.30.7`, e push, sem PR." · etapa de outra delegação; já entregue (fa43103, aprovado)
- "E1.4 (forge:tech-lead): PR da `forge/upgrade-0.30.7` para a develop, depois do review e do QA aprovados, sem merge." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): merge do PR (como no PR #162 do pedido 049: o arquivo de versão do Forge é do dono)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:tech-lead): depois do E1.5, merge da develop (merge commit, sem rebase) em cada branch de trabalho ainda aberta das worktrees `MetricasDSPD-0xx` em uso, com push; conflito: para e relata." · etapa de outra delegação; continua no pedido
- Editar a pasta `.forge/` ou rodar o `forge-upgrade`; mudar o parecer de review; rodar a suíte de testes ou o `pronto`; abrir PR; o quadro e o arquivo do pedido; outras worktrees, a `main` e a branch `docs/jarvis-2026-10-23`; ler ou editar o `.env`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; vale o pedido literal do dono citado no Objetivo (`docs/pedidos/053-forge-0-30-7.md`, linha 4).
- Erro recorrente deste destino (forge-check, 30 dias): base em 3 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 2 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upg7/docs/qa/053-forge-0-30-7.md`
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 log --format=%H fa43103b028d8b985a9cafa28d433d61d0408e31..HEAD` · espera: linhas=1
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 ls-remote origin refs/heads/forge/upgrade-0.30.7` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-upg7 rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upg7 diff --name-only fa43103b028d8b985a9cafa28d433d61d0408e31 HEAD` · espera: igual 'docs/qa/053-forge-0-30-7.md'

## Relatório
Até 8 linhas, resultado real: o veredito do QA, o que foi verificado e os achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 079-trava-suite-tmpdir
Tipo: codigo
Branch: feature/079-trava-suite-tmpdir   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: merge-integracao   Cobre: E1.4

## Objetivo
Abrir e mesclar na develop (squash) o PR do pedido 079 (K-201): a trava de `scripts/suite-unica.sh` sai do `/tmp` fixo para `/tmp/claude-<uid>/metricas-dspd-suite.lock`. Código em 61cafba2e287808c570be923193739ba5d3088ad; devops (d3832481f3c2fcf90bb8a4c3de78924fa72a94b6), review (dcb48efbb4630ff39b80d6a60b75e3feafbea742) e QA (e63dcc6d76e7519210cf3aeec0601d261d6f210d) aprovados. Os merges na develop vão em série: o Jarvis libera a janela. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/079-trava-suite-tmpdir`; ainda não há PR.

## Ler
- docs/pedidos/079-trava-suite-tmpdir.md: só `## Etapas` e, do `## Histórico`, as linhas da entrega, do review e do QA.
- Na branch: `docs/devops/079-trava-suite-tmpdir.md`, `docs/reviews/079-trava-suite-tmpdir.md` e `docs/qa/079-trava-suite-tmpdir.md` (só o veredito e os achados).

## Entregar
- "E1.4 (tech-lead): PR para a develop, depois do QA." (E1.4)
- (E1) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/079-trava-suite-tmpdir`; `forge-check pr 079-trava-suite-tmpdir --ref origin/feature/079-trava-suite-tmpdir --base origin/develop` limpo (pareceres em dia no head); se a develop tiver andado, o PR fica BEHIND: abra-o assim mesmo, espere os checks e pare antes do merge, relatando (o `gh pr update-branch` foi recusado pelo classificador no PR 258 e fica com o dono).
- (E1) (E1.4) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/079-trava-suite-tmpdir --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-079.md` e passado por esse caminho literal), com o resumo, `contrato: sem mudança`, `migração: nenhuma`, os três pareceres com veredito, os recomendados como pendência (devops; review A1 a A3; QA A1 e A2) e `Cartão: K-201`.
- (E1) (E1.4) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas (decida pelo estado de cada check), e mesclar por squash com `gh pr merge feature/079-trava-suite-tmpdir --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head em sha40>`, pelo nome da branch e cada comando sozinho na chamada (sem pipe nem variável). Se ficar BEHIND, não rode o update-branch: pare e relate; se o hook R-REVIEW recusar por tempo, espere 1 minuto e tente mais uma vez; se o sandbox, outro hook ou a proteção da branch barrar, pare, relate a mensagem literal e deixe o PR pronto para o dono. Sem `--admin`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 06:28).
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres, o pedido, `KANBAN.md`, outras worktrees, a `homolog` e a `main`; nenhum commit na branch; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.5 (agile-coach): retrospectiva do pedido 079." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/079-trava-suite-tmpdir --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/079-trava-suite-tmpdir --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

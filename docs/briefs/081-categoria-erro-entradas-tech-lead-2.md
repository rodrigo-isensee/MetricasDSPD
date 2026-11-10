Agente destino: forge:tech-lead
Pedido: 081-categoria-erro-entradas
Tipo: codigo
Branch: feature/081-categoria-erro-entradas   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: merge-integracao   Cobre: E1.5

## Objetivo
Abrir e mesclar na develop (squash) o PR do pedido 081 (K-241): as entradas de referência dizem a categoria do erro, sem expor valor. Código em 1f8a19c608f8e363eafd1f629eb50ec5efb2a3af; segurança (dbdbb4170264ae3c16e23d31f17253b75d18751a), review (5f906a661e60b145e4aebb755dc4d05e7e658863) e QA (a4e143bb05a966b9d81ed059af955b0ae956d368) aprovados. Os merges na develop vão em série: o Jarvis libera a janela. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/081-categoria-erro-entradas`; ainda não há PR.

## Ler
- docs/pedidos/081-categoria-erro-entradas.md: só `## Etapas` e, do `## Histórico`, as linhas da entrega, da segurança, do review e do QA.
- Na branch: `docs/security/081-categoria-erro-entradas.md`, `docs/reviews/081-categoria-erro-entradas.md` e `docs/qa/081-categoria-erro-entradas.md` (só o veredito e os achados).

## Entregar
- "E1.5 (tech-lead): PR para a develop, depois do QA." (E1.5)
- (E1) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/081-categoria-erro-entradas`; `forge-check pr 081-categoria-erro-entradas --ref origin/feature/081-categoria-erro-entradas --base origin/develop` limpo (pareceres em dia no head); se a develop tiver andado, o PR fica BEHIND: abra-o assim mesmo, espere os checks e pare antes do merge, relatando (o `gh pr update-branch` foi recusado pelo classificador no PR 258 e fica com o dono).
- (E1) (E1.5) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/081-categoria-erro-entradas --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-081.md` e passado por esse caminho literal), com o resumo, `contrato: sem mudança`, `migração: nenhuma`, os três pareceres com veredito, os recomendados como pendência (review A1; review A2 no cartão K-244; QA A1) e `Cartão: K-241`.
- (E1) (E1.5) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas (decida pelo estado de cada check), e mesclar por squash com `gh pr merge feature/081-categoria-erro-entradas --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head em sha40>`, pelo nome da branch e cada comando sozinho na chamada (sem pipe nem variável). Se ficar BEHIND, não rode o update-branch: pare e relate; se o hook R-REVIEW recusar por tempo, espere 1 minuto e tente mais uma vez; se o sandbox, outro hook ou a proteção da branch barrar, pare, relate a mensagem literal e deixe o PR pronto para o dono. Sem `--admin`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 08:04).
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres, o pedido, `KANBAN.md`, outras worktrees, a `homolog` e a `main`; nenhum commit na branch; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): implementação com testes, numa função única de classificação usada pelas entradas de referência." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (security-engineer): parecer de segurança (mensagem de erro e log de entrada que lida com segredo)." · etapa de outra delegação; feita
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.6 (agile-coach): retrospectiva do pedido 081." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/081-categoria-erro-entradas --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/081-categoria-erro-entradas --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

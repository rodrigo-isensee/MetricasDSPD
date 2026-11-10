Agente destino: forge:tech-lead
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: merge-integracao   Cobre: E1.5

## Objetivo
Abrir e mesclar na develop (squash) o PR do pedido 080 (K-192, com K-173 fechado sem código): o E2E L3-01 espera a altura da página estabilizar antes do axe. Código em 8784bf130f3290f5bfb6e0c9d30f8e20d1782605; review (64b2ed0c6e47a0c5cecac1eabe214b24dc897ee7) e QA (f96d4b9228f08ed54438cde8d744796ca7a38edb) aprovados e conferidos. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/080-testes-instaveis-web`; ainda não há PR. O arquivo sem commit `docs/ux/080-revisao-leia-junto.md` não entra no PR nem se apaga.

## Ler
- docs/pedidos/080-testes-instaveis-web.md: só `## Etapas` e, do `## Histórico`, as linhas da volta 2, do review da volta 2, do QA e da volta do parecer de QA, e as DECISÕES TÉCNICAS de 08:46, 08:49 e 10:11.
- Na branch: `docs/reviews/080-testes-instaveis-web.md` e `docs/qa/080-testes-instaveis-web.md` (só o veredito e os achados).

## Entregar
- "E1.5 (tech-lead): PR para a develop, depois do QA." (E1.5)
- (E1) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/080-testes-instaveis-web`; `forge-check pr 080-testes-instaveis-web --ref origin/feature/080-testes-instaveis-web --base origin/develop` limpo (pareceres em dia no head); se a develop tiver andado, o PR fica BEHIND: abra-o assim mesmo, espere os checks e pare antes do merge, relatando (o update-branch é do dono).
- (E1, E2) (E1.5) Abrir o PR para a `develop` (`gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/080-testes-instaveis-web --title ... --body-file <arquivo>`, corpo escrito pela ferramenta Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-080.md` e passado por esse caminho literal), com o resumo, `contrato: sem mudança`, `migração: nenhuma`, os dois pareceres com veredito, a E1.4 que deixou de se aplicar (DECISÃO TÉCNICA de 10:11), o A2 do primeiro QA retirado (08:49) e os recomendados como pendência (review A1: outros axe em páginas longas com barra sticky; QA A1: timeout a 1280 px sob carga) e `Cartão: K-192`.
- (E1, E2) (E1.5) Esperar todos os checks do PR concluídos e verdes no head, por chamadas curtas (decida pelo estado de cada check), e mesclar por squash com `gh pr merge feature/080-testes-instaveis-web --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head em sha40>`, pelo nome da branch e cada comando sozinho na chamada (sem pipe nem variável). Se ficar BEHIND, não rode o update-branch: pare e relate; se o hook R-REVIEW recusar por tempo, espere 1 minuto e tente mais uma vez; se o sandbox, outro hook ou a proteção da branch barrar, pare, relate a mensagem literal e deixe o PR pronto para o dono. Sem `--admin`.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres, o pedido, `KANBAN.md`, outras worktrees, a `homolog` e a `main`; nenhum commit na branch; a develop só muda pelo merge do PR. Não apagar branch nem worktree depois do merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; feita
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; deixou de se aplicar (DECISÃO TÉCNICA de 10:11)
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/080-testes-instaveis-web --state all --json number,state` com o número do PR aberto para a develop.
- PQ-2 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/080-testes-instaveis-web --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

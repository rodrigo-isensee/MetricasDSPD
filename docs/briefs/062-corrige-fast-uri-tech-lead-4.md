Agente destino: forge:tech-lead
Pedido: 062-corrige-fast-uri
Tipo: codigo
Branch: feature/062-fast-uri   Base: develop   Base-sha: d05bbfccaba07f5a5d4bdf7932b396291c0e7ee9
Etapa: merge-integracao   Cobre: E1.5

## Objetivo
Abrir o PR do override do fast-uri para a develop e mesclar com review, segurança e QA aprovados (pedido 062, E1.5, K-198). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/062-fast-uri`.

## Ler
- Os pareceres da branch: `docs/reviews/062-fast-uri.md`, `docs/security/062-fast-uri.md` e `docs/qa/062-fast-uri.md`.

## Entregar
- "E1.5 (tech-lead): PR para a develop e merge." (E1.5)
- (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/062-fast-uri`; `forge-check pr 062-corrige-fast-uri --raiz /home/rodrigoisensee/MetricasDSPD-052h --ref HEAD --base origin/develop` limpo (achado: pare e relate).
- (E1.5) `gh pr create --base develop --head feature/062-fast-uri --body-file <arquivo>` com título citando a correção do fast-uri (pedido 062, alertas #18 a #25), corpo com o que muda (overrides de patch em pnpm-workspace.yaml e o lockfile), os três pareceres aprovados e os recomendados; a CI prova `pronto`, testes com PostgreSQL e E2E.
- (E1.5) Esperar os checks; job que falhe por rede do runner: reexecutar só os que falharam (`gh run rerun <id> --failed`), uma vez; branch atrás da develop: `gh pr update-branch feature/062-fast-uri` (merge commit, sem force) e esperar de novo; com tudo verde, ler a ponta e `gh pr merge feature/062-fast-uri --squash --match-head-commit <sha40 lido>`, sem `--admin`; check vermelho de código ou recusa: pare e relate; relatar número, URL e o sha do squash.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-02): "A" na E1.2 do pedido 060 (alertas): corrigir já os 11 recomendados; os 3 de desenvolvimento depois; #16 risco aceito.
- DECISÃO DO DONO (2026-11-02): "É isso" (recibo do 062): o node-backend troca a versão do fast-uri pela corrigida (#18 a #25) e atualiza o lockfile, com review, segurança, QA e PR para a develop; não mexe em #12, #14, #15, nos 3 do lhci nem no #16, e não dispensa alerta.
- 2026-11-03 04:05: E1.3 cumprida pelo security-engineer: parecer de segurança APROVADO em 5c85b0e (parecer 77c463ce28bcaff9991bb85dca5e3336a85a7319); lockfile só com fast-uri 3.1.9 e 4.2.3, os corrigidos de #18 a #25; nenhum pacote nem fonte nova; alertas fecham pelo Dependabot depois do merge, sem fechar à mão. A1 recomendado: integridade não conferida contra o registry (sem rede; a instalação congelada da CI valida).
- 2026-11-03 04:06: E1.2 cumprida pelo tech-lead: code review APROVADO em 5c85b0e (parecer d5499aa88abcd981f19c21b7e500d2856b4c7d61); 2 arquivos, 25 linhas; overrides só de patch (3.1.8 para 3.1.9 e 4.2.2 para 4.2.3); nenhuma outra dependência muda. A1 recomendado: tirar os overrides quando fastify, swagger e type-provider exigirem a faixa corrigida. Próximo: conferente das duas entregas paralelas (review e segurança); QA (E1.4).
- 2026-11-03 04:16: E1.4 cumprida pelo qa-engineer: QA APROVADO em 5c85b0e (parecer 7123ec3), sem bugs; lockfile só com o fast-uri e os 4 consumidores em 3.1.9 ou 4.2.3; 222 testes unitários do server que passam pelo fastify verdes; pronto, testes com PostgreSQL, E2E e lhci ficam para a CI do PR (A1 recomendado).
- 2026-11-03 04:20: volta 1 da E1.2 cumprida pelo tech-lead: parecer de review regravado pela ferramenta Write (6984a2785b1803fae3f1bb8906f609ce2f1e6456), mesmo veredito e mesmo commit; forge-check pr do 062 sem saída. Próximo: conferente; PR e merge (E1.5).
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- A main é do dono; o PR vai só para a develop. O hook aceita `gh pr merge` pelo nome da branch, não pelo número, e recusa variável de shell junto de ação crítica: leia o sha da ponta numa chamada e cole o literal na seguinte. O corpo do PR é gravado pela ferramenta Write num arquivo com caminho literal em `/tmp/claude-1000/` com o slug da branch no nome, e passado com `--body-file`.
- Não fechar nem dispensar alerta do Dependabot à mão.
- Recursos da máquina: esperar checks pelo laço da skill esperar-estado, sem `--watch`; nunca `pkill` amplo.
- NÃO tocar: código, dependências, workflows, pareceres, o `CLAUDE.md`, as outras worktrees e a `main`; sem `--force`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): override e lockfile, pronto verde." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança (dependência)." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr view feature/062-fast-uri --json state --jq .state` · espera: igual 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
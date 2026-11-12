Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: merge
Branch: docs/101-documentos-da-noite   Base: develop   Base-sha: 38e5c2fc24c0699c47dad4e29313548e5dea3b80
Etapa: pr   Cobre: E1.8

## Objetivo
PR só de documentos da noite (revisões de UX, análises e a segunda rodada do UX do 097) na branch `docs/101-documentos-da-noite`, head 1628d4b755e34615aec0b438a6ddbdcbb68d620f, conferida; review aprovado no commit 69a5c48e da branch (classe T, sem QA).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff --stat origin/develop...1628d4b755e34615aec0b438a6ddbdcbb68d620f`.

## Entregar
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.8) Nesta delegação, o PR e o merge.
- (E1.8) Se o parecer de review (`docs/reviews/101-documentos-da-noite.md` na branch) não estiver aprovado em `commit: 1628d4b755e34615aec0b438a6ddbdcbb68d620f`, pare e relate. Abrir o PR para a `develop` (squash) com o corpo já gravado em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/pr-101-documentos-da-noite.md` (acrescente o parecer de review) por `--body-file`. Mesclar só depois que os PRs 355 e 351 não estiverem mais abertos, em laços de até 170 s (`timeout --foreground` e `< /dev/null` em cada gh), por até 3 horas; imediatamente antes, `gh pr view docs/101-documentos-da-noite --json mergeStateStatus,headRefOid`: só com CLEAN; se BEHIND, `gh pr update-branch docs/101-documentos-da-noite` e esperar os checks do head novo. Merge num comando sozinho: `gh pr merge docs/101-documentos-da-noite --squash --match-head-commit` seguido do sha completo, nunca `--admin`. Permissão negada ou check vermelho: pare e relate.
- Nada a entregar aqui: não nesta delegação.
- arquivos: docs/ux/, docs/analises/ (escopo da entrega revisada; esta delegação não edita arquivo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, pareceres, outras worktrees, a `homolog` e a `main`; o único merge é o do PR desta delegação, na `develop`, com os checks verdes.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view docs/101-documentos-da-noite --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: review
Branch: docs/101-documentos-da-noite   Base: develop   Base-sha: 38e5c2fc24c0699c47dad4e29313548e5dea3b80
Etapa: review   Cobre: E1.8
Revisar-sha: 1628d4b755e34615aec0b438a6ddbdcbb68d620f

## Objetivo
PR só de documentos da noite (revisões de UX, análises e a segunda rodada do UX do 097) na branch `docs/101-documentos-da-noite`, head 1628d4b755e34615aec0b438a6ddbdcbb68d620f, conferida. O hook pede o parecer de review antes do PR (classe T, sem QA).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff --stat origin/develop...1628d4b755e34615aec0b438a6ddbdcbb68d620f`.

## Entregar
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.8) Nesta delegação, o review (classe T, só documentos).
- (E1) (E1.8) Review do diff `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff origin/develop...1628d4b755e34615aec0b438a6ddbdcbb68d620f`: só documentos, nenhum dado de pessoa real, nenhum segredo, o protótipo e a especificação na versão final da segunda rodada. Parecer novo pela ferramenta Write com `branch: docs/101-documentos-da-noite`, `commit: 1628d4b755e34615aec0b438a6ddbdcbb68d620f` e o veredito; `## Achados` com linhas de até 300 caracteres, ou vazio. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin docs/101-documentos-da-noite` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --rebase --autostash origin docs/101-documentos-da-noite`, sem `--force`; push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/101-documentos-da-noite` (`github.com` em allowed_domains). Sem PR, sem merge.
- Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/101-documentos-da-noite.md, docs/ux/, docs/analises/ (escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/101-documentos-da-noite:docs/reviews/101-documentos-da-noite.md` · espera: contém 'commit: 1628d4b755e34615aec0b438a6ddbdcbb68d620f'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: merge
Branch: docs/101-release   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: merge-integracao   Cobre: E1.5

## Objetivo
Release 101: pareceres de review, segurança e QA aprovados na branch `docs/101-release` sobre a develop do PR 357. Próximo degrau da release.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/engineering/fluxo-homologacao.md`.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." (E1.5)
- (E1.5) Seguir `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/engineering/fluxo-homologacao.md`: PR de `develop` para `homolog` (merge commit, não squash), com o resumo da release (CHANGELOG). Esperar checks em laços de até 170 s (`timeout --foreground` e `< /dev/null` em cada gh; `github.com`, `api.github.com` e `cafe.github.com` em allowed_domains), por até 3 horas. Merge só com CLEAN e o portão verde, num comando sozinho: `gh pr merge` com `--merge --match-head-commit` seguido do sha completo, nunca `--admin`. Depois do merge, esperar o portão da homolog (o workflow que roda no push em `homolog`) terminar verde e citar o run. Vermelho ou permissão negada: pare e relate.
- arquivos: CHANGELOG.md (escopo da entrega revisada; esta delegação não edita arquivo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até 16829ad18af47c29b5f7d60a1cd9398db9144e0a6e39ce47455052a018ca8764 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, pareceres, outras worktrees, a `homolog` e a `main`; o único merge é o do PR desta delegação, na `develop`, com os checks verdes.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --base homolog --state merged --limit 1 --json number,mergedAt` · espera: contém 'mergedAt'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

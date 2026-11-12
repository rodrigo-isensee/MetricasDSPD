Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: review
Branch: docs/101-release   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: review   Cobre: E1.1
Revisar-sha: 72cc6d38a1898650116b87fbd1fc8c81429eea34

## Objetivo
A develop da release 101 andou com o PR 357 (a ponta de `origin/develop`, o seu merge;  a correção dos specs do e2e chromium-api que reprovaram o QA). Os pareceres da release precisam ir para o commit novo.

## Ler
- `forge-check parecer delta /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/101-release.md` (de `/home/rodrigoisensee/Metricas/MetricasDSPD-041`).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --oneline -3 origin/develop`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." (E1.1) Nesta delegação, a revalidação do review na develop nova.
- (E1) (E1.1) O delta é só a correção dos specs (PR 357, com review aprovado). Acrescentar o PR 357 ao CHANGELOG (seção Não publicado) e revalidar o review. Veredito novo. Antes, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin docs/101-release develop` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --rebase --autostash origin docs/101-release`, sem `--force`. Atualizar o parecer pela ferramenta Edit com `commit:` igual ao sha completo de `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 rev-parse origin/develop`, o veredito e uma linha de revalidação que cite o PR 357; `## Achados` só com linhas de achado, ou vazio. Commit só do que a lista permite com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/101-release` (`github.com` e `cafe.github.com` em allowed_domains). Sem PR, sem merge.
- arquivos: docs/reviews/101-release.md, CHANGELOG.md, e2e/tests-api/ (escopo da entrega revisada, para a conferência)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até 16829ad18af47c29b5f7d60a1cd9398db9144e0a6e39ce47455052a018ca8764 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): specs velhos do e2e chromium-api que reprovaram o QA da release (A1 a A3 do parecer de QA da release; o A4 investigado), branch fix/101-specs-e2e-api a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052g. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/101-release:docs/reviews/101-release.md` · espera: contém 'PR 357'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

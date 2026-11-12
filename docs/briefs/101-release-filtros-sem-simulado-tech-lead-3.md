Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: codigo
Branch: docs/101-release   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: codigo   Cobre: E1.1

## Objetivo
Release 101: a develop em ea826a9ca695f84e810387ff85ea86befa997d1f (PR 351 por último; o CI desse commit roda agora) vai à homolog, e o PR de release homolog para main fica aberto para o dono. Primeiro degrau: CHANGELOG e review na branch `docs/101-release`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` (livre, o PR 356 já mesclado).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --oneline origin/homolog..ea826a9ca695f84e810387ff85ea86befa997d1f`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." (E1.1)
- (E1) (E1.1) Criar a branch: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 switch --no-track -c docs/101-release ea826a9ca695f84e810387ff85ea86befa997d1f` (se o config.lock antigo deixar a troca pela metade, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff --cached --quiet docs/101-release` sai 0 e então `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 switch docs/101-release`; sem remover o lock, stash ou reset); conferir `branch --show-current` = `docs/101-release` e status vazio (senão pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs que estão na develop e não na homolog, no formato das entradas anteriores, em linguagem de quem usa os painéis (busca nos filtros, Equipe no Apontamento e no Resumo, opções do dado real, nada simulado na web, guardas G1 a G4, correções K-277 a K-292). Esperar o CI da develop em ea826a9ca695f84e810387ff85ea86befa997d1f terminar (`gh run list --branch develop --limit 3`, laços de até 170 s com `timeout --foreground` e `< /dev/null`); se vermelho, pare e relate. Review da release (develop contra homolog: diff por área, migrações, contrato, nada de pessoa nem segredo, nada simulado na web), parecer novo pela ferramenta Write em `docs/reviews/101-release.md` com `branch: docs/101-release`, `commit: ea826a9ca695f84e810387ff85ea86befa997d1f`, o veredito e `## Achados` com linhas de até 300 caracteres, ou vazio. Commits só desses dois arquivos com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/101-release` (`github.com` em allowed_domains). Sem PR, sem merge.
- arquivos: CHANGELOG.md, docs/reviews/101-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/101-release:docs/reviews/101-release.md` · espera: contém 'branch: docs/101-release'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

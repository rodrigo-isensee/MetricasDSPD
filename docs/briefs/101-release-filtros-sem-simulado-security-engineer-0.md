Agente destino: forge:security-engineer
Pedido: 101-release-filtros-sem-simulado
Tipo: review
Branch: docs/101-release   Base: develop   Base-sha: ea826a9ca695f84e810387ff85ea86befa997d1f
Etapa: seguranca   Cobre: E1.2
Revisar-sha: 72cc6d38a1898650116b87fbd1fc8c81429eea34

## Objetivo
Release 101 (develop em ea826a9ca695f84e810387ff85ea86befa997d1f, CI verde no run 43201970764) à homolog. CHANGELOG e review aprovados na branch `docs/101-release` (72cc6d38). Este é o próximo portão.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/101-release:CHANGELOG.md` (a seção Não publicado).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --oneline origin/homolog..ea826a9ca695f84e810387ff85ea86befa997d1f`.

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/101-release." (E1.2)
- (E1) (E1.2) Revisão de segurança da release (develop em ea826a9ca695f84e810387ff85ea86befa997d1f contra a homolog): GRANT por coluna e a lista COLUNAS_PESSOA, nenhum dado de pessoa novo na API, recorte por equipe no Apontamento (o aviso de reidentificação de equipe pequena segue como pergunta ao dono), opções de equipe e tipo vindas do dado real (sem texto livre), web sem mock no build api (G1 e G2), nenhum segredo. Parecer novo pela ferramenta Write em `docs/security/101-release.md` com `branch: docs/101-release`, `commit: ea826a9ca695f84e810387ff85ea86befa997d1f`, o veredito e `## Achados` só com linhas de achado, ou vazio. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin docs/101-release` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --rebase --autostash origin docs/101-release`, sem `--force`; push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/docs/101-release` (`github.com` em allowed_domains). Sem PR, sem merge.
- arquivos: docs/security/101-release.md, CHANGELOG.md, server/, web/, e2e/, packages/ (escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 101-release-filtros-sem-simulado até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/101-release-filtros-sem-simulado.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/101-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/101-release para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog e merge com o portão verde (o merge até a homolog é do time, pela autorização do dono de 17:51)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta da release." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/docs/101-release:docs/security/101-release.md` · espera: contém 'commit: ea826a9ca695f84e810387ff85ea86befa997d1f'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

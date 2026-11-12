Agente destino: forge:tech-lead
Pedido: 101-release-filtros-sem-simulado
Tipo: codigo
Branch: docs/101-documentos-da-noite   Base: develop   Base-sha: 38e5c2fc24c0699c47dad4e29313548e5dea3b80
Etapa: codigo   Cobre: E1.8

## Objetivo
O ux-designer e o software-architect gravaram documentos na árvore principal, fora do git. Eles entram na develop antes da release 101, num PR só de documentos, junto da segunda rodada do UX do 097, que está na branch `docs/097-ux-recolher-setor` sem PR.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD status --short` (os arquivos `??` em `docs/`).
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --oneline origin/develop..origin/docs/097-ux-recolher-setor`.

## Entregar
- "E1.8 (tech-lead): PR só de documentos para a develop com o que os agentes gravaram sem commit na árvore principal (revisões de UX e análises) e a segunda rodada do UX do 097 (branch docs/097-ux-recolher-setor), branch docs/101-documentos-da-noite, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E1.8)
- (E1) (E1.8) Na worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` (branch antiga já mesclada), `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 fetch origin develop docs/097-ux-recolher-setor` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 checkout -b docs/101-documentos-da-noite origin/develop`; se falhar pelo config.lock, `git checkout` da branch e `git status` vazio; não remova o lock. Trazer a branch `docs/097-ux-recolher-setor` por merge (ela tem a versão final de `docs/ux/097-filtros-time-busca.md` e do protótipo: vale a dela). Copiar da árvore principal para a worktree os arquivos `??` de `docs/ux/` e `docs/analises/` que não estão na develop ou que diferem só por ser a versão mais nova da mesma noite; os que já estão na develop com conteúdo diferente, pare e relate antes de sobrescrever. Nenhum outro diretório. Rodar `pnpm run docs:check` e `format:check`. Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito por arquivo) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push -u origin HEAD:refs/heads/docs/101-documentos-da-noite` (`github.com` em allowed_domains). Abrir o PR para a `develop` (squash). Mesclar só depois que os PRs 355 e 351 (do 099) não estiverem mais abertos, com os checks verdes e CLEAN, em laços de até 170 s (`timeout --foreground` e `< /dev/null`), por `gh pr merge docs/101-documentos-da-noite --squash --match-head-commit` seguido do sha completo, nunca `--admin`; se BEHIND, `gh pr update-branch docs/101-documentos-da-noite`.
- Nada a entregar aqui: não nesta delegação.
- arquivos: docs/ux/, docs/analises/

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

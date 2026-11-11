Agente destino: forge:qa-engineer
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release   Base: develop   Base-sha: 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047
Etapa: codigo   Cobre: E1.3

## Objetivo
QA da release 100: a develop em 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 (CI verde no run 43084376256) contra a homolog. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `docs/100-release` (CHANGELOG fc0f952ab1d746fbd0a4cd1728cf086126a66cfb, review a71366af e segurança aeba81a0, aprovados).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md` (os achados).
- Os pareceres de QA dos PRs do range, lidos na worktree em `docs/qa/` (075-l9a-web, 075-l9b-contrato, 097-k272-ap-tipo, 099-l1-sem-simulador, 096-criterios-apontamento-env, 095-runner-ubuntu-2404).

## Entregar
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." (E1.3)
- (E1) (E1.3) Na worktree, rodar `pnpm run pronto` com no máximo 2 workers (teto do dono: dois terços da máquina), saída para arquivo no scratchpad, em segundo plano se passar de 170 s, esperando o fim; a trava da suíte única pode fazer esperar outras suítes (relate a espera). Conferir o rc; falha por carga ou intermitente que passe com o arquivo sozinho vai como achado. Conferir no CI da develop (run 43084376256) os jobs `banco` e `e2e` (os testes `.pg` e de navegador não rodam aqui). Parecer `docs/qa/100-release.md` (novo) só pela ferramenta Write, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release`, `commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/qa/100-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release:docs/qa/100-release.md` · espera: contém 'commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release   Base: develop   Base-sha: 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047
Etapa: codigo   Cobre: E1.4

## Objetivo
Release 100, segundo degrau: os três pareceres estão aprovados na branch `docs/100-release` (review a71366af, segurança aeba81a0, QA 17ffe670, todos sobre o CHANGELOG fc0f952a). Durante a release o dono mesclou na develop o PR 325 (K-271, com QA e review próprios aprovados), e a ponta da develop (`origin/develop`) já tem o PR 325. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- Os três pareceres da release na worktree: `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/100-release.md` (os achados).

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Atualizar `docs/100-release` com a develop só por merge (sem rebase nem force); acrescentar ao `CHANGELOG.md` a nota do PR 325 (K-271), num commit só do CHANGELOG com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/100-release --base develop`; se pedir revalidação de parecer por algo que não veio só da base (o PR 325 veio da base), pare e relate a saída. Aprovado, enviar com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains) e abrir o PR da `docs/100-release` para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file` (o que entra na release, os três pareceres, os achados recomendados, `Cartão: K-204`). Esperar os checks até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- arquivos: CHANGELOG.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head docs/100-release --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

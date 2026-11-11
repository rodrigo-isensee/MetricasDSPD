Agente destino: forge:devops-engineer
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release-b   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E1.8

## Objetivo
Parecer de devops da release 100: o range da develop contra a homolog muda `.github/actions/playwright/action.yml`, `ci.yml` e `homolog.yml` (PR 318, jobs com navegador no container oficial do Playwright), e a promoção para a homolog pede o parecer de devops da release. Branch `docs/100-release-b`, worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 27ac9064fc4ffad4e7f3bf18241aa1979912c009 -- .github`.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/095-runner-ubuntu-2404.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md` (o portão da homolog).

## Entregar
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." (E1.8)
- (E1) (E1.8) Conferir que os workflows da homolog (`homolog.yml`, portão e rodada noturna) e a ação de conferência do Chromium funcionam no container fixado, que os nomes dos checks exigidos pela proteção da `homolog` e pelo `homolog-aprovada` não mudaram, e que nada da release exige passo manual no ambiente. Parecer `docs/devops/100-release.md` (novo) pela ferramenta Write, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release-b`, `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release-b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/devops/100-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release-b:docs/devops/100-release.md` · espera: contém 'branch: docs/100-release-b'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

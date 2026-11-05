Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: feature/068-zod   Base: develop   Base-sha: 939e091725f880bf57cdf1d0ef7753b0f7c0a02e
Etapa: merge-integracao   Cobre: E1.3

## Objetivo
PR da feature/068-zod (ws 8.22.1 e o histórico da main que a develop não tem) para a develop, merge por squash com a CI verde (pedido 068, E1.3, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- Os pareceres na branch: `docs/reviews/068-zod.md` e `docs/qa/068-zod.md`.

## Entregar
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." (E1.3)
- (E1) (E1.3) PR 218 já aberto; a worktree já está na ponta remota 5ecf38b (o merge local 7dbbcfc, de conteúdo igual, foi descartado pelo Jarvis); conferir os checks no head atual do PR por laço com pausa (sem `--watch`); `forge-check pr 068-release-065-067 --ref origin/feature/068-zod --base origin/develop` limpo; com todos verdes, `gh pr merge 218 --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch 218 --repo rodrigo-isensee/MetricasDSPD` e esperar de novo; se um check falhar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:25: E1.6 cumprida pelo security-engineer (parecer aprovado em da33f45: só o puppeteer-core 25.13.0 do mermaid-cli, devDependency do e2e, passa ao ws 8.22.1; A1 recomendado: conferir a auditoria de dependências na CI do PR) e volta do review cumprida pelo tech-lead (341c56e, pedido: 068-release-065-067, mesmo veredito; forge-check pr limpo). DECISÃO TÉCNICA (Jarvis): E1.3 com o tech-lead.
- 2026-11-04 20:08: E1.3 não cumprida pelo tech-lead: PR 218 aberto, checks verdes no head 5ecf38b (merge da develop já enviado à branch), mas o GitHub recusou o merge commit (Merge commits are not allowed on this repository); a worktree 052f ficou com um merge local 7dbbcfc não enviado. DECISÃO TÉCNICA (Jarvis): merge por squash, como o CLAUDE.md manda para feature/* na develop; o conteúdo que a develop recebe é o mesmo (só o ws 8.22.1 no lockfile), e a release homolog para main segue sem conflito porque a mudança é igual dos dois lados; a etapa E1.3 do pedido fica cumprida por squash.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- Nada na `main` nem na `homolog`.
- NÃO tocar: código, dependências, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/068-zod --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: develop   Base: homolog   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: merge-integracao   Cobre: E1.4

## Objetivo
Promover a develop (f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc, com os 11 PRs da release 068 e os pareceres dos PRs 226 e 227) para a homolog por merge commit, com o portão verde (pedido 068, E1.4, K-219). Sem worktree: tudo pelo `gh` a partir de `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/homolog..origin/develop` (os PRs que a promoção leva) e os pareceres da release na develop: `docs/reviews/068-release.md`, `docs/reviews/068-z1-release.md`, `docs/reviews/068-z2-release-docs.md`, `docs/reviews/068-z3-release-z1.md`, `docs/qa/068-release.md`, `docs/qa/068-z1-release.md`, `docs/security/068-release.md` e `docs/security/068-z1-release.md`; `docs/engineering/fluxo-homologacao.md` (o portão).

## Entregar
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." (E1.4)
- (E1) (E1.4) `forge-check pr 068-release-065-067 --ref origin/develop --base origin/homolog` e relatar a saída (se pedir parecer novo, pare e relate); abrir o PR `develop` → `homolog` com o corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, listando os PRs que entram (212, 214 a 221, 224, 225, 226 e 227) com uma linha do que cada um muda e os pareceres da release; esperar os checks exigidos por laço com pausa (sem `--watch`), cada chamada abaixo de 2 minutos; vermelho por ruído só se rerroda uma vez, vermelho de verdade: pare e relate; mesclar por merge commit com `gh pr merge develop --repo rodrigo-isensee/MetricasDSPD --merge --match-head-commit f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc`, sem `--admin`; depois do merge, acompanhar o portão da homologação disparado pelo push na `homolog` até terminar e relatar o resultado com o link do run; não apagar a develop nem a homolog; sem PR para a main.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b ou saía sem ele): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 02:53: Pareceres renovados na develop, promoção liberada: PR 227 da docs/068-release-z1 (QA e segurança renovados 068-z1-release e review 068-z3-release-z1) mesclado na develop por squash (f615704), checks verdes; forge-check pr da develop para a homolog aprovado (review, QA e revisão de segurança) na ponta f615704. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead, PR da develop f615704 para a homolog por merge commit, checks verdes e depois o portão da homologação acompanhado até o fim; sem worktree, tudo pelo gh a partir do clone principal; o L7-a e o 070 entram na develop só depois desta promoção.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O GitHub precisa também de `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- NÃO tocar: código, testes, dependências, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, as worktrees e a `main`; a homolog só muda pelo merge do PR, a develop não muda.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da release (develop contra homolog), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.9 (security-engineer): parecer de segurança da release, na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR da docs/068-release para a develop, squash com a CI verde, antes da E1.4." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --base homolog --head develop --state merged --json mergeCommit --limit 1` · espera: contém 'oid'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD merge-base --is-ancestor f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc origin/homolog` · espera: rc=0
- PQ-3 (run): o run do portão da homologação no push da homolog, com link e conclusão relatados

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

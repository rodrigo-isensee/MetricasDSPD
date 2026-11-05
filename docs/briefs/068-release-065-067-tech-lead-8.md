Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: docs/068-release   Base: develop   Base-sha: b66179b9f014768197a9017cd721b67cda2c3a47
Etapa: merge-integracao   Cobre: E1.10

## Objetivo
PR da docs/068-release (pareceres de review, QA e segurança da release e as notas do CHANGELOG já escritas) para a develop, squash com a CI verde, antes da E1.4 (pedido 068, E1.10, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/068-release`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c log --oneline 92c58922fe23852a7504b85f1e496f25e7e02f85..b66179b9f014768197a9017cd721b67cda2c3a47` (os PRs que a release leva) e `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --stat 92c58922fe23852a7504b85f1e496f25e7e02f85...b66179b9f014768197a9017cd721b67cda2c3a47`; os pareceres já aprovados de cada PR estão em `docs/reviews/`, `docs/qa/` e `docs/security/` da develop.

## Entregar
- "E1.10 (tech-lead): PR da docs/068-release para a develop, squash com a CI verde, antes da E1.4." (E1.10)
- (E1) (E1.10) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin docs/068-release` depois que o review renovado `docs/reviews/068-release-v2.md` estiver no remoto; o CHANGELOG já está escrito (d665e8a) e não muda; `forge-check pr 068-release-065-067 --ref origin/docs/068-release --base origin/develop` limpo; PR para a develop com título citando o pedido 068 e a release, corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, com os pareceres (review 068-release e 068-release-v2, QA e segurança 068-release) e os achados recomendados (A2 do review como ação na base da homolog depois da E1.4; A1 da segurança: conferir o job de segurança verde); esperar os checks por laço com pausa (sem `--watch`), conferindo o job de segurança; com todos verdes, `gh pr merge docs/068-release --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b ou saía sem ele): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 01:38: E1.10 parada pelo forge-check: CHANGELOG depois do review: o tech-lead escreveu as notas dos PRs 212, 214 a 221, 224 e 225 no CHANGELOG.md (d665e8a, A1 do review) e o forge-check pr deu o review 068-release desatualizado por CHANGELOG.md; QA isento (só .md); nada aberto nem mesclado. DECISÃO TÉCNICA (Jarvis): review renovado por delta só do CHANGELOG na ponta d665e8aa48d5c441d32fc7aab7cbcafd14995eec, parecer docs/reviews/068-release-v2.md (o mais recente do pedido); depois a E1.10 abre o PR e mescla, sem escrever de novo o CHANGELOG.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O GitHub precisa também de `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados.
- NÃO tocar: código, testes, dependências, o CHANGELOG, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da release (develop contra homolog), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.9 (security-engineer): parecer de segurança da release, na branch docs/068-release." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head docs/068-release --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

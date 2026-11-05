Agente destino: forge:qa-engineer
Pedido: 068-release-065-067
Tipo: codigo
Branch: feature/068-zod   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: qa   Cobre: E1.2

## Objetivo
QA da branch feature/068-zod (ws 8.22.1) junto com a develop, instalando as dependências num store do pnpm na área temporária (pedido 068, E1.2, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/068-zod.md`; `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/develop...origin/feature/068-zod --stat`.

## Entregar
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." (E1.2)
- (E1) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052f switch feature/068-zod`; `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/068-zod`; anote a ponta; `git -C /home/rodrigoisensee/MetricasDSPD-052f merge --no-commit --no-ff origin/develop` só para testar; `cd /home/rodrigoisensee/MetricasDSPD-052f && pnpm install --frozen-lockfile --store-dir $TMPDIR/pnpm-store-068` com `registry.npmjs.org` em `allowed_domains` (se o lockfile mudar, pare e relate); rodar com no máximo 2 workers o typecheck, o vitest do server e do web e o `pnpm run docs:check`; depois `git -C /home/rodrigoisensee/MetricasDSPD-052f merge --abort` e conferir `git -C /home/rodrigoisensee/MetricasDSPD-052f status --short` vazio; parecer `docs/qa/068-zod.md` pela ferramenta Write com `commit:` = a ponta anotada, o resultado real e veredito; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-219' -- docs/qa/068-zod.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/068-zod`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- 2026-11-04 18:15: E1.1 cumprida pelo tech-lead: feature/068-zod saiu da origin/main (30e8091) e foi enviada; review aprovado em ffbf897: o zod 4 já está na develop (^4.6.7 e lockfile em 4.6.7); o único diff develop...main é o pnpm-lock.yaml com ws 8.22.0 para 8.22.1 (transitiva do puppeteer); typecheck verde na ponta da main; CI do PR 213 verde menos homolog-aprovada; A1 recomendado: a main não tem os PRs 212 a 216, então o QA deve rodar a suíte sobre a develop mais esta branch. DECISÃO TÉCNICA (Jarvis): E1.2 com o QA trazendo a develop para a branch num merge local de teste (sem commit nem push), rodando as suítes e descartando o merge; o PR (E1.3) roda a CI no resultado do merge.
- 2026-11-04 18:41: E1.2 não cumprida de novo: o store do pnpm (/home/rodrigoisensee/.local/share/pnpm/store) é só leitura no sandbox (ERR_PNPM_EROFS); merge de teste desfeito, status limpo. DECISÃO TÉCNICA (Jarvis): o QA usa um store próprio na área temporária gravável do sandbox ($TMPDIR, com 068 no nome), pela opção --store-dir do pnpm, que é configuração e não contorno; o lockfile continua travado.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- O merge com a develop é só local, para testar; nunca commite nem envie esse merge.
- NÃO tocar: código, dependências (só instalar o que o lockfile trava), outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge commit com a CI verde." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --format=%H -1 origin/feature/068-zod -- docs/qa/068-zod.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
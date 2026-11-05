Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: feature/068-zod   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: review   Cobre: E1.1

## Objetivo
Criar a branch feature/068-zod a partir da origin/main e revisar o que ela muda em relação à develop (zod 4 do PR 213) (pedido 068, E1.1, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/develop...origin/main --stat` e o diff de `pnpm-lock.yaml` e dos `package.json`; onde o projeto usa zod (`packages/contratos/`, `server/`, `web/`).

## Entregar
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." (E1.1)
- (E1) (E1.1) `git -C /home/rodrigoisensee/MetricasDSPD-052f status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/068-zod origin/main --no-track`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/068-zod`; review: o que muda além do lockfile, se a API do zod 4 quebra algum uso (schemas, refine, transform, z.infer), se a CI do PR 213 passou e o que ela cobriu; rodar o typecheck do projeto; parecer em `docs/reviews/068-zod.md` pela ferramenta Write com `commit:` = a ponta da branch, veredito e achados de até 300 caracteres (severidade só entre parênteses); commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-219' -- docs/reviews/068-zod.md` (sem heredoc e sem pipe); push; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- 2026-11-04 18:06: conferente reprovou o brief do PR direto da main para a develop (Branch igual à Base e merge sem review nem QA). DECISÃO TÉCNICA (Jarvis): branch feature/068-zod saindo da main, com review e QA do zod 4 (versão maior) antes do PR para a develop; etapas refeitas.
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa em código nem em dependências; achado bloqueante vai ao parecer e ao relatório.
- Recursos: uma tarefa pesada por vez, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, dependências, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge commit com a CI verde." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --format=%H -1 origin/feature/068-zod -- docs/reviews/068-zod.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
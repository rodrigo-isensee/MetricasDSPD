Agente destino: forge:security-engineer
Pedido: 068-release-065-067
Tipo: codigo
Branch: docs/068-release   Base: develop   Base-sha: b66179b9f014768197a9017cd721b67cda2c3a47
Etapa: seguranca   Cobre: E1.9

## Objetivo
Parecer de segurança da release 068: a develop b66179b9f014768197a9017cd721b67cda2c3a47 contra a homolog 92c58922fe23852a7504b85f1e496f25e7e02f85 (pedido 068, E1.9, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/068-release`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c log --oneline 92c58922fe23852a7504b85f1e496f25e7e02f85..b66179b9f014768197a9017cd721b67cda2c3a47` (os PRs que a release leva) e `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --stat 92c58922fe23852a7504b85f1e496f25e7e02f85...b66179b9f014768197a9017cd721b67cda2c3a47`; os pareceres já aprovados de cada PR estão em `docs/reviews/`, `docs/qa/` e `docs/security/` da develop.

## Entregar
- "E1.9 (security-engineer): parecer de segurança da release, na branch docs/068-release." (E1.9)
- (E1) (E1.9) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin docs/068-release`; conferir que cada PR da lista com gatilho de segurança (dependência, banco, dados de pessoa, CI) tem parecer de segurança aprovado, que o allow-list do Acelerato e os GRANT por coluna seguem fechados e que nada pessoal entrou no staging; parecer em `docs/security/068-release.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/068-release`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b ou saía sem ele): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 01:05: L9-b na develop, release liberada: PR 224 do L9-b mesclado (b66179b); a develop também tem o L9-a (PR 225), o L2-b (PR 221), o L2-a (PR 220), o M1-a (PR 219) e o zod 4 (PR 218). DECISÃO TÉCNICA (Jarvis): E1.7 (review), E1.8 (QA) e E1.9 (segurança) sobre a develop b66179b na branch docs/068-release, que o tech-lead cria na E1.7 a partir da origin/develop na worktree /home/rodrigoisensee/MetricasDSPD-052c (livre depois do merge do L9-b); QA e segurança começam assim que a branch existir no remoto; a develop fica parada até a E1.4 (o L7-a espera).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 068-release-065-067`, `branch: develop`, `commit: b66179b9f014768197a9017cd721b67cda2c3a47`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres da release são gravados ao mesmo tempo nesta branch: `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin docs/068-release` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052c add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-219' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, dependências, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da release (develop contra homolog), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR da docs/068-release para a develop, squash com a CI verde, antes da E1.4." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/docs/068-release:docs/security/068-release.md` · espera: contém 'commit: b66179b9f014768197a9017cd721b67cda2c3a47'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

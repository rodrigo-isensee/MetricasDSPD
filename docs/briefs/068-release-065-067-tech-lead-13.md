Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: docs/068-release-z1   Base: develop   Base-sha: c3bc0e8436a8cbd13af8b148ae0eaa9b0ecebedb
Etapa: review   Cobre: E1.7

## Objetivo
Review curto do que a branch docs/068-release-z1 acrescenta à develop c3bc0e8 (os pareceres renovados de QA e segurança da release), na ponta abef2ad173b1f9ba79621224a51c0f7fda153e10, para o PR dela (pedido 068, E1.7, K-219). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/068-release-z1`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --stat c3bc0e8436a8cbd13af8b148ae0eaa9b0ecebedb..abef2ad173b1f9ba79621224a51c0f7fda153e10` (o que a branch acrescenta à develop: os pareceres renovados de QA e segurança).

## Entregar
- "E1.7 (tech-lead): review da release (develop contra homolog), parecer na branch docs/068-release." (E1.7); nesta rodada, na branch docs/068-release-z1, pela DECISÃO TÉCNICA de 2026-11-05 02:22 do Histórico.
- (E1) (E1.7) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin docs/068-release-z1`; conferir que o diff contra a develop são só os dois pareceres `docs/qa/068-z1-release.md` e `docs/security/068-z1-release.md`, sem código; parecer em `docs/reviews/068-z3-release-z1.md` com `branch: docs/068-release-z1` e `commit: abef2ad173b1f9ba79621224a51c0f7fda153e10`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/068-release-z1`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b ou saía sem ele): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do Histórico deste pedido, docs/pedidos/068-release-065-067.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 02:22: Promoção pede QA e segurança renovados: o forge-check pr da develop (c3bc0e8) para a homolog dá os pareceres 068-release de QA e de segurança desatualizados por CHANGELOG.md (escrito depois deles) e o de QA sem registro de autoria; o review 068-z2-release-docs vale. DECISÃO TÉCNICA (Jarvis): QA e segurança renovam por delta (só o CHANGELOG e os pareceres desde b66179b) na ponta da develop c3bc0e8436a8cbd13af8b148ae0eaa9b0ecebedb, pareceres docs/qa/068-z1-release.md e docs/security/068-z1-release.md numa branch docs/068-release-z1 criada pelo QA a partir da develop; depois review curto dessa branch, PR para a develop e a promoção (E1.4). MELHORIA ao Forge: na release, cada documento escrito depois dos pareceres (o CHANGELOG pedido pelo próprio review) obriga a renovar QA e segurança.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 068-release-065-067`, `branch: docs/068-release-z1`, `commit: abef2ad173b1f9ba79621224a51c0f7fda153e10`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres da release são gravados ao mesmo tempo nesta branch: `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin docs/068-release-z1` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052c add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-219' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, dependências, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): branch feature/068-zod a partir da origin/main (traz o zod 4 do PR 213 e os merges de release que a develop não tem) e review do que ela muda em relação à develop." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da branch feature/068-zod (suítes com o zod 4)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR da feature/068-zod para a develop, merge por squash com a CI verde (a develop não aceita merge commit; decisão técnica de 20:08 no Histórico)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança da mudança de dependência da feature/068-zod (ws 8.22.0 para 8.22.1 no pnpm-lock.yaml), antes da E1.3." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.9 (security-engineer): parecer de segurança da release, na branch docs/068-release." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): PR da docs/068-release para a develop, squash com a CI verde, antes da E1.4." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/docs/068-release-z1:docs/reviews/068-z3-release-z1.md` · espera: contém 'branch: docs/068-release-z1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

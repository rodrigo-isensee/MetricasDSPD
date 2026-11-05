Agente destino: forge:qa-engineer
Pedido: 071-release-069-070
Tipo: codigo
Branch: docs/071-release   Base: develop   Base-sha: 39b761d4d04e14457690a547ba1f39d65ff2e8d7
Etapa: qa   Cobre: E1.2

## Objetivo
QA da release 071: as suítes na ponta da develop 39b761d4d04e14457690a547ba1f39d65ff2e8d7 (pedido 071, E1.2, K-222). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/071-release`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe..39b761d4d04e14457690a547ba1f39d65ff2e8d7` (os PRs que a release leva) e `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe...39b761d4d04e14457690a547ba1f39d65ff2e8d7`; os pareceres já aprovados de cada PR estão em `docs/reviews/`, `docs/qa/` e `docs/security/` da develop.

## Entregar
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/071-release." (E1.2)
- (E1) (E1.2) esperar, por laços curtos (chamadas abaixo de 2 minutos, até 40 minutos), o commit do CHANGELOG na `origin/docs/071-release` (mensagem docs(changelog)); sem ele, pare e relate; `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin docs/071-release`; rodar com no máximo 2 workers o vitest do server, dos pacotes e do web com cobertura, `npx eslint .` com cwd em `server/` e em `web/`, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; registrar no parecer que os testes pg e o E2E rodam no portão da homolog; parecer em `docs/qa/071-release.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/071-release`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "isso" (resposta ao recibo: "vou fazer: levar à main o que está na develop e não está na homolog (069 L7-a e L7-b; 070 simulado por cartão, correção do contraste, E2E e ADR 0028 vigente; Forge 0.32.0) por review, QA e segurança da release, develop para homolog com o portão verde e PR de release homolog para main aberto; não vou fazer: merge na main, incluir o L9-c; é isso?"): release confirmada com esse escopo.
### Do Histórico deste pedido, docs/pedidos/071-release-069-070.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:57: Release começa: a develop está em 39b761d4d04e14457690a547ba1f39d65ff2e8d7 com PRs 222, 223, 230, 231, 232, 233 e 234; a homolog em 3f71950d9d7becc7ea66e67cf41a53e0919ddcbe. DECISÃO TÉCNICA (Jarvis): o tech-lead cria docs/071-release da develop na worktree 052f, escreve primeiro as notas desses PRs no CHANGELOG.md (commit e push) e só então revisa (lição do 068: CHANGELOG depois do review invalidou os pareceres); QA e segurança começam quando o commit do CHANGELOG estiver no remoto e citam esse sha em commit:; pareceres no nome 071-release.md.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 071-release-069-070`, `branch: docs/071-release`, `commit:` igual a o sha do commit do CHANGELOG (a ponta de `origin/docs/071-release` depois do pull, com a mensagem docs(changelog)), veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres da release são gravados ao mesmo tempo nesta branch: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin docs/071-release` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052f add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-222' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- Testes que lançam tsx em processo filho falham no sandbox com mkdir negado em /tmp/tsx-1000: registre no parecer e rode só esses arquivos fora do sandbox, se a permissão deixar.
- NÃO tocar: código, testes, dependências, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): review da release (develop contra homolog), parecer na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release (L7-a grava em tabelas de referência), na branch docs/071-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/071-release para a develop, squash com a CI verde, antes da E1.5." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 071." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/docs/071-release:docs/qa/071-release.md` · espera: contém 'pedido: 071-release-069-070'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

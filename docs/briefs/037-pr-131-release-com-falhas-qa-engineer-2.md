Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Sonda S0 da proposta 037 (alternativa A, Web Worker da ADR 0021), antes de qualquer código: confirmar onde está a maior tarefa longa de /operacional e se o render sozinho cabe na margem. O veredito decide se o react-frontend começa o Worker (S0 < 120 ms), se entra também o render fatiado (120 a 169 ms) ou se a proposta é reaberta (≥ 170 ms). Etapa E2.1 do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 1f715e8).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md`, seções 4 (condição de parada) e 6 (linha S0).
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md` (medição anterior).
- `e2e/perf/perf.spec.ts` e a configuração do projeto `perf-api` no `e2e/playwright.config.ts`.

## Entregar
- (E2) `perf-api`: o teste "F2 CLS e C6 tarefa longa em" em `/operacional`, `/operacional?cadencia=diaria` e `/`, sobre a develop (12018de), com `PERF_RODADAS_C6=3` e `PERF_REPETICOES_C6=5`, registrando o load de 1 minuto antes de cada execução (de preferência < 2). Sem `flock` (o hook do Forge recusa): antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio; uma suíte pesada por vez (R-TETO).
- (E2) Dois perfis do Chromium (Performance, com pilha) de uma carga de `/operacional` no build mock: um com a latência ligada (o build da CI) e outro com latência 0, nomeando a função da maior tarefa em cada um. Guardar os perfis fora do repositório (scratchpad), só citando o caminho.
- (E2) Registrar em `docs/qa/bugs/C6-operacional-playwright-1-64.md` uma seção `## Sonda S0 (2026-10-20)` com os valores, o load, as funções nomeadas e o veredito pela condição de parada da proposta (< 120, 120 a 169 ou ≥ 170 ms). Um commit só desse arquivo, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md` (cartão K-113); push da branch. Não commitar a proposta do arquiteto (vai com a implementação).

## Fora do escopo
- "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0." e "E2.4 (forge:tech-lead): review, PR para a develop e promoção para a homolog." · etapas de outro papel.
- "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." · etapa do mesmo papel em outro momento, depois da implementação.
- "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada)." · etapa do mesmo papel, cumprida (1f715e8).
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A." e "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde." · etapas do dono.
- "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas de outro papel, cumpridas.
- Código de `web/`, `server/` ou do teste de perf; mudar o limite da ADR 0003; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia; não muda.
- O QA final do pedido 036 roda na worktree `-030` com E2E: se houver playwright ou vitest rodando, espere terminar antes de cada medição (as duas medem tempo).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h` da branch · espera: o hash do commit da sonda.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (cmd): `grep -c '^## Sonda S0 (2026-10-20)' /home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

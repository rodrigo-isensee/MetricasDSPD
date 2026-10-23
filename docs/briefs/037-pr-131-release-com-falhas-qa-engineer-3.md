Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Medir o Web Worker da ADR 0021 (entrega 0bde5eb, conferida) contra o critério de pronto da proposta 037: C6 com margem (mediana < 150 ms nas 7 rotas), sem regressão, e dar o parecer de QA. Etapa E2.3 do pedido 037, cartão K-113. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head 0bde5eb).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md`, seção 6, a lista "O que o QA mede depois" (itens 1, 2, 3, 5 e 6).
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md`, seção `## Sonda S0 (2026-10-20)`.
- `docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md`, seção de testes (paridade E2E).

## Entregar
- (E2) Itens 1, 2, 3, 5 e 6 da lista "O que o QA mede depois" da proposta: C6 nas 7 rotas de `ROTAS_PAINEL` (build mock com latência 0, 2 execuções, `PERF_RODADAS_C6=3`, `PERF_REPETICOES_C6=5`, load de 1 min registrado); C6 de `/operacional` no build da CI; comparação com a develop na mesma sessão; sem regressão (F5, F3, F1, F6/F9 com `pnpm --filter web size`, C5 somando os dois heaps); determinismo e paridade E2E (o mesmo painel com `transporte` Worker e em processo). Sem `flock` (o hook recusa): antes de cada medição, `pgrep -f 'node.*(vitest|playwright)'` sem processo de outra worktree; uma suíte pesada por vez (R-TETO).
- (E2) O CLS 0,103 de /tatico visto na S0: medir de novo F2 em /tatico e registrar.
- (E2) Parecer em `docs/qa/037-c6-operacional.md` com os valores, o load, o veredito por item e a lista de defeitos (passos para reproduzir), aprovado ou reprovado. Um commit só desse arquivo (e de testes E2E de paridade, se escrever), com `git add` explícito por caminho, mensagem conforme a seção de commits do `docs/engineering/praticas.md` e a linha `Cartão: K-113`; push da branch.

## Fora do escopo
- "E2.4 (forge:tech-lead): review, PR para a develop e promoção para a homolog (com os pareceres de review e QA da promoção), deixando o portão verde no PR de release #136." · etapa de outro papel, em paralelo (review) e depois (PR).
- "E2.5 (dono): mesclar o #136 (homolog → main) com o homolog-aprovada verde." · etapa do dono.
- "E2.2 (forge:react-frontend): implementar a ADR 0021 (núcleo puro e Worker), depois do veredito da S0." · etapa de outro papel, cumprida (0bde5eb).
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6." e "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada)." · etapas do mesmo papel, cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A.", "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde.", "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." e "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapas de outro papel ou do dono, cumpridas.
- Item 4 da lista (CI do PR e do portão: vai com o E2.4); corrigir código de `web/` (defeito vira relato); mudar `e2e/perf/perf.spec.ts`, o método do C6 ou os limites da ADR 0003; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; F6 sem aumento além de 2 KB gzip e F9 dentro do limite. ADR 0021 (citada no pedido): paridade 1 a 3; o Worker fica atrás da `MockFonteMetricas`.
- O autor da E2.2 avisou: F9 em 117,35 KB (alerta 120 KB). A worktree -025 roda suítes do pedido 025 ao mesmo tempo: espere-as antes de medir tempo.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h` da branch · espera: o hash do commit do parecer.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-037/docs/qa/037-c6-operacional.md`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

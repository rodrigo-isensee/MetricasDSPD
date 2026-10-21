Agente destino: forge:react-frontend
Pedido: 037-pr-131-release-com-falhas
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Tirar da thread principal a geração da base de exemplo e o cálculo do mock (ADR 0021), para o C6 de /operacional sair do limite de 200 ms com margem e o portão do PR #131 ficar verde de forma estável. Etapa E2.2 do pedido 037, cartão K-113. A sonda S0 (eeb59fa) deu pior caso de 113 ms (< 120): pela condição de parada da proposta, segue o Worker **sem** o render fatiado. Worktree `/home/rodrigoisensee/MetricasDSPD-037`, branch `feature/037-c6-operacional` (head da entrega: 0bde5eb). Segunda rodada, depois da conferência da entrega 0bde5eb: só formaliza o escopo, sem código.

## Ler
- `docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md` (inteira: é a especificação desta entrega).
- `/home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md`, seções 4 (recomendação), 5 (o que NÃO muda) e 6, linha "1" da tabela e a lista "O que o QA mede depois".
- `/home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md`, seção `## Sonda S0 (2026-10-20)` (funções da maior tarefa).
- A `MockFonteMetricas` em `web/` e `web/scripts/size.mjs`.

## Entregar
- (E2) Ficam formalmente no escopo desta entrega, sem mudança de código (decisão técnica registrada no pedido, Andamento de 2026-10-21): `eslint.config.js` (globais do Worker), `web/vite.config.ts` (`worker: { format: 'es' }`, exigido pelo Worker em módulo ES da ADR 0021) e `docs/tecnica/arquitetura-front.md` (diagrama de sequência, documentação afetada). Nesta volta não há código a mudar: confirme que o head da branch continua 0bde5eb, sem mudança pendente na worktree, e rode o PQ-5.

## Fora do escopo
- "E2.3 (forge:qa-engineer): paridade E2E, C5 com o heap do Worker e medição do pronto (mediana < 150 ms nas 7 rotas)." · etapa de outro papel, depois desta (o E2E de transporte e o C5 são do QA).
- "E2.4 (forge:tech-lead): review, PR para a develop e promoção para a homolog." · etapa de outro papel, depois desta.
- "E2.1 (forge:qa-engineer): sonda S0 da proposta 037 (C6 do perf-api em /operacional, /operacional?cadencia=diaria e /, e dois perfis do Chromium com pilha), registrada no arquivo do bug C6." · etapa de outro papel, cumprida (eeb59fa).
- "E1.5 (forge:software-architect): proposta de tratamento do C6 de /operacional sem afrouxar o limite (K-113), a partir da medição 1f715e8, gravada na worktree -037 (sem commit: o arquiteto não tem Bash; o commit vai com a implementação)." · etapa de outro papel, cumprida (aqui só o commit do arquivo).
- "E1.2 (forge:qa-engineer): medir localmente o C6 de /operacional no código da main (9180c7e) e no da develop/homolog (12018de, mesmo conteúdo da homolog), registrando as versões do Playwright e do Chromium; o T5 não precisa (passou na nova rodada)." e "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." · etapas de outro papel, cumpridas.
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A." e "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde." · etapas do dono.
- Render fatiado (alternativa B; a S0 não o pede); mudar `e2e/perf/perf.spec.ts`, o método do C6 ou os limites da ADR 0003; mudar a CSP; o CLS de /tatico visto na S0 (vai para a medição do E2.3); o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- ADR 0003 (citada no pedido): C6 < 200 ms bloqueia e não muda; F6 sem aumento além de 2 KB gzip e F9 dentro do limite (`pnpm --filter web size`).
- ADR 0021 (citada no pedido): o Worker fica atrás da `MockFonteMetricas` (a interface já é assíncrona; nenhum painel muda); paridade 1 a 3 em Vitest.
- Regras invioláveis do `CLAUDE.md`: todo cálculo de tempo, percentil e Monte Carlo passa pela biblioteca compartilhada (T2.5); o núcleo chama `@metricas-dspd/metricas`, sem cálculo próprio. No modo Worker, a thread principal não importa `@metricas-dspd/mock` nem `@metricas-dspd/metricas`.
- R-TETO: `pnpm run pronto` e Vitest são pesados; antes de cada execução, `pgrep -fa 'playwright|vitest'` vazio (sem `flock`, que o hook recusa). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h` da branch · espera: o hash do último commit da implementação.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (cmd): `pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-037` · espera: rc=0
- PQ-4 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-037/docs/architecture/propostas/037-c6-operacional.md` e o arquivo versionado na branch (`git ls-files`).
- PQ-5 (cmd, do autor): `forge-check entrega 037-pr-131-release-com-falhas --branch feature/037-c6-operacional --base develop --base-sha 12018deb8e35a7b473d6e8c1b7a693795a80c1ac --etapa codigo --desde eeb59fa202c2b1583c1dedd18c14a8b6676616f3` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

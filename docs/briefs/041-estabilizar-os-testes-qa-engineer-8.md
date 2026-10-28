Agente destino: forge:qa-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Corrigir as causas das instabilidades da E2E achadas no diagnóstico (etapa E2.1 do pedido 041, cartões K-135, K-092, K-115 e K-132), sem aumentar timeout e sem retry: testes longos demais, espera de "painel pronto" duplicada, medição do F4 com amostra curta e paralelismo local sem limite. Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade` (diagnóstico 8d8bdfd, E2.2 em a999345 e f61db60, E3.1 em bd8742c e 97f0e63). Máquina nova: Node 24 pelo nvm (`. ~/.nvm/nvm.sh`), pnpm 10.34.6 e Chromium 1248 instalados (pedido 042, E2.2); o banco local é recriado na E2.3 do 042, em curso: confira `docker compose -f /home/rodrigoisensee/MetricasDSPD/docker-compose.yml ps postgres` antes da primeira suíte e, sem banco saudável, relate e pare.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`: seções 5, 6, 7, 10 e os achados A1 a A3 e A7.
- `e2e/pages/PainelPage.ts`, `e2e/playwright.config.ts`, `e2e/perf/perf.spec.ts` (teste da linha 93), `e2e/tests/intensivo-filtros.spec.ts` (IF-U, linha 356) e `e2e/tests/sustentacao-no-operacional.spec.ts` (CA-19, linha 297).

## Entregar
- (E2) K-135: um helper único de "painel pronto" em `e2e/pages/PainelPage.ts`, que espera por estado (atributo, `aria-busy` ou papel) e não por tempo, usado no lugar de `aguardar`, `aguardarResumo` e `esperarPronto`; nenhuma asserção fica mais fraca.
- (E2) K-092 e K-115: o IF-U-operacional e o CA-19 axe divididos em testes por comportamento (IF-U: ida e volta pela URL, Voltar/Avançar e outra aba; CA-19: um teste por visão), cada um abaixo de 10 s sozinho, medido em 10 repetições com 1 worker, sem `setTimeout` maior e sem retry; a cobertura de cada asserção antiga continua.
- (E2) F4 pela decisão F4 = A: o teste do F4 descarta a primeira medição a frio do p95 (e a reporta à parte), garante n >= 20 medições de verdade e mantém o limite de 100 ms; prova: o teste do F4 isolado, 10 repetições com 1 worker, sem falha, com o n de cada repetição registrado.
- (E2) Workers pela decisão workers = A: `e2e/playwright.config.ts` limita a 2 workers fora da CI, com uma variável de ambiente para subir; na CI, nada muda.
- (E2) Commitar a ADR 0003 já alterada pelo software-architect na mesma worktree (`docs/architecture/adr/0003-orcamento-de-performance.md`, etapa E2.3, hoje sem commit), no commit desta E2.1 que muda o teste do F4 (`Cartão: K-138`), sem mudar o texto dela.
- (E2) Uma suíte por vez, no máximo 1 worker nas medições; nenhuma suíte E2E completa nesta entrega. `pnpm run pronto` uma vez antes do commit final, da raiz da worktree. Commits por cartão (K-135, K-092, K-115 e o F4 com `Cartão: K-138`), `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push.
- (E1) Diagnóstico: já entregue (8d8bdfd); a correção do K-107 na seção 4 não é desta delegação.
- (E3, E4) Portões e prova de estabilidade com parecer de QA: não nesta delegação (E4.1 vem depois do review).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue (8d8bdfd)
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outro papel; aqui só o commit do arquivo.
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outro papel.
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa posterior do mesmo papel, depois do review; a correção da leitura do K-107 na seção 4 do diagnóstico vai no E4.1 (Histórico do pedido, 2026-10-23 20:55).
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outro papel.
- Os dois acréscimos do arquiteto na ADR 0003 (n < 20 acusa amostra insuficiente; critério de reversão): vão ao code review da E5.1 (Histórico do pedido, 2026-10-27 12:40).
- Atualizar o relatório de QA da E1.1: as medições vão no relatório desta entrega; relatório e parecer ficam na E4.1.
- Mudar código de produto (`web/`, `server/`, `packages/`), limites de performance, `.github/`; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-23): F4, opção A ("A"): corrigir a medição do F4: a primeira medição a frio sai da amostra, o teste colhe pelo menos 20 medições de verdade e a ADR 0003 registra a mudança da regra de medição com data; o limite de 100 ms não muda.
- DECISÃO DO DONO (2026-10-23): workers da E2E, opção A ("A"): limitar a 2 workers na máquina local pela configuração do Playwright, com variável de ambiente para subir quando quiser; a CI não muda.
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): custo do `homolog-aprovada`, opção B ("B"): sem espera paga; o fim do portão do `homolog.yml` dispara de novo o `homolog-aprovada` do PR (segundos de Actions por release); se o devops mostrar que não funciona, a opção A volta ao dono.
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- Pedido 041: sem aumentar timeout e sem retry como solução, mantendo a cobertura de cada asserção (Escopo E2, Critério PQ-3); nenhum limite de performance ou de cobertura afrouxa.
- ADR 0003 (citada no pedido): só a regra de medição do F4 muda, pela decisão F4 = A.
- R-CONFORMIDADE: bloqueio não se contorna (nem por glob nem por outro caminho); o hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. Antes de cada rodada, `pgrep -fa 'playwright|vitest|vite'` sem processo sobrando desta worktree.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- e2e/pages/PainelPage.ts` · espera: o sha40 do commit do K-135
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 97f0e63fc0db88fc409ba0146e492f4fba4bb76d -U0 -- e2e | grep -cE '^\+.*(setTimeout|retries)'` · espera: igual '0'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o tempo de cada teste dividido e o n do F4 por repetição. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

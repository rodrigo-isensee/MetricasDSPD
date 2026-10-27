Agente destino: forge:qa-engineer
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Branch: feature/037-c6-operacional   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Descobrir se o C6 de /operacional (tarefa longa, limite < 200 ms na ADR 0003) passou do limite por causa do @playwright/test 1.64.1 que o #130 trouxe, comparando a medição local no código da main com a no código da develop (igual ao da homolog do #131). Etapa E1.2 do pedido 037; decisão do dono: opção A (medir antes).

## Ler
- `docs/pedidos/037-pr-131-release-com-falhas.md`, seções Diagnóstico, Decisões e Andamento.
- `docs/architecture/adr/0003-orcamento-de-performance.md`, linhas 47, 91 e 137 (C6).
- `e2e/perf/perf.spec.ts`, o teste "F2 CLS e C6 tarefa longa em" e como ele agrega a mediana.

## Entregar
- (E1) Lado main: na worktree existente `/home/rodrigoisensee/MetricasDSPD-main` (destacada em 9180c7e, só leitura: não editar nem commitar nela), garantir o navegador da versão dela (`pnpm exec playwright install chromium` no `e2e/`) e rodar 5 vezes `pnpm exec playwright test --project=perf -g "/operacional$"` no `e2e/` (ou o filtro que pegue só a rota /operacional), anotando o C6 (mediana agregada) de cada execução.
- (E1) Lado develop: criar a worktree `/home/rodrigoisensee/MetricasDSPD-037` com a branch nova `feature/037-c6-operacional` a partir de `origin/develop` (12018de), `pnpm install --frozen-lockfile`, garantir o navegador e rodar as mesmas 5 execuções.
- (E1) Uma suíte pesada por vez (R-TETO; sem `flock`, que o hook recusa; `pgrep -fa 'playwright|vitest'` vazio antes de cada uma). Anotar as versões do @playwright/test e do Chromium de cada lado (`pnpm exec playwright --version` e a versão do navegador no relatório do Playwright).
- (E1) Registrar em `docs/qa/bugs/C6-operacional-playwright-1-64.md` (na worktree -037): passos, as 10 medições, versões, conclusão ("o Playwright novo explica" ou "não explica") e o que fica para o forge:software-architect (K-113). Um commit só desse arquivo, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md` (cartão K-113); push da branch.

## Fora do escopo
- "E1.1 (dono): autorizar ou não rodar de novo os jobs que falharam (custo de minutos do Actions). Feito: opção A." e "E1.3 (forge:dono): mesclar o #131 na main quando o portão ficar verde." · etapas do dono.
- "E1.4 (forge:devops-engineer): rodar de novo os jobs que falharam do portão de homologação do #131 e, depois, o `homolog-aprovada`, e relatar o resultado." · etapa de outro papel, cumprida.
- Corrigir o C6, mudar dependência, mudar o limite da ADR 0003 ou o teste de perf (tratamento é do software-architect, depois); tocar no #131, na homolog ou na main; o quadro; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- ADR 0003 (citada no pedido): C6 < 200 ms, medido por `PerformanceObserver('longtask')` no Playwright; o limite não muda.
- A worktree `-main` é usada pelo ambiente de homologação local do pedido 034 (portas 15432, 13000 e 18080): não derrubar nem mexer nos containers.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-037 log -1 --format=%h` da branch · espera: o hash do commit do registro.
- PQ-2 (push): `git ls-remote origin refs/heads/feature/037-c6-operacional` igual ao head local.
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-037/docs/qa/bugs/C6-operacional-playwright-1-64.md`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-main status --short` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

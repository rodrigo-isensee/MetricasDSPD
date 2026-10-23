Agente destino: forge:qa-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Terminar o diagnóstico medido das instabilidades (etapa E1.1 do pedido 041, cartão K-138) sem derrubar o WSL. As duas execuções anteriores mataram o WSL por falta de memória: a primeira com 8 workers e a segunda com até 2 workers. O relatório parcial sem commit (`/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`) tem a unidade 0/5, a E2E com 8 workers dando 20 falhas e com 2 workers dando 1, e os achados F-1 e F-2. Continue a partir dele. O consumo de memória da suíte passa a ser um dos achados a medir. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/041-estabilidade` (c4db73e).

## Ler
- O relatório parcial acima, inteiro.
- `docs/pedidos/041-estabilizar-os-testes.md`, seções "Diagnóstico inicial" e "Histórico" (as linhas de 2026-10-23 11:40, 15:00 e 16:10).
- `e2e/playwright.config.ts` (projetos, workers, timeouts, `webServer`) e `e2e/pages/PainelPage.ts`.

## Entregar
- (E1) Antes de cada rodada: `pgrep -fa 'playwright|vitest|vite|tsx'` sem processo sobrando; encerrar com `pkill -f` só os processos desta worktree (`MetricasDSPD-041`); `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 checkout -- docs/qa/evidencias` (achado F-2).
- (E1) Não use `systemd-run`: ele criaria um escopo fora do `jarvis.slice`, que é o teto de recursos definido pelo dono (memória alta em 7 GB, máxima em 9 GB). Antes e depois de cada rodada, grave `cat /sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service/jarvis.slice/memory.current` e `memory.peak` do mesmo diretório. Se um processo for morto por falta de memória, registre (é resultado) e repita a rodada com menos coisa em paralelo.
- (E1) Uma suíte por vez, com 1 worker e `--retries=0`. Fazer:
  - a E2E completa 1 vez com 1 worker, que mede a linha de base de tempo e memória;
  - os testes do Diagnóstico (K-092, K-107, K-115, K-123 e o perf F4), 10 vezes cada, isolados;
  - a unidade só de `@metricas-dspd/metricas` uma vez, com o pico de memória.

  Nada de cenário "sob carga" nem de E2E com 2 ou mais workers.
- (E1) Completar o relatório: para cada teste instável, arquivo e nome, taxa de falha por cenário, mensagem de erro, causa raiz provável com a evidência e o grupo (carga e tempo, aleatoriedade, espera frágil, portão, memória). Para cada grupo, a correção proposta e quem a faz (E2 a E4 do pedido), sem aumentar timeout nem ligar retry. Registre o pico de memória de cada rodada e o achado das duas quedas do WSL. O frontmatter reflete o diagnóstico, sem "aprovado" por padrão.
- (E1) Gravar a cada rodada (o que já foi medido não se perde numa queda), só com Write ou Edit, nunca por script no Bash. No fim, um commit só do relatório, com `git add` explícito por caminho, a linha `Cartão: K-138` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Sem push.
- (E2, E2.1) Esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132): não nesta delegação. Vêm numa delegação seguinte ao qa-engineer, pelo plano que este diagnóstico propuser.
- (E4, E4.1) Prova de estabilidade e parecer de QA: não nesta delegação. Vêm depois das correções do E2 e do E3.

## Fora do escopo
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outro papel.
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." e "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapas de outro papel.
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outro papel.
- Mudar código, testes, configuração ou limites; o quadro; push; PR; sudo.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- Pedido 041, Fora do escopo: afrouxar limite de performance (C6, F6, F9, ADR 0003) ou de cobertura não entra.
- R-TETO e R-CONFORMIDADE: bloqueio não se contorna. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do relatório
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `grep -c 'memory.peak' /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

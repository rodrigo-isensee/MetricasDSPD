Agente destino: forge:qa-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Terminar o diagnóstico medido das instabilidades (etapa E1.1 do pedido 041, cartão K-138), agora dentro do teto de memória do WSL. A execução anterior derrubou o WSL por falta de memória quando rodava a E2E com 8 workers. Ela deixou um relatório parcial sem commit em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`, com a unidade 0/5, a E2E com 8 workers dando 20 falhas e com 2 workers dando 1, e os achados F-1 e F-2. Continue a partir dele, sem repetir o que já foi medido. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/041-estabilidade` (c4db73e).

## Ler
- O relatório parcial acima, inteiro.
- `docs/pedidos/041-estabilizar-os-testes.md`, seções "Diagnóstico inicial" e "Histórico" (a linha de 2026-10-23 11:40).
- `e2e/playwright.config.ts` (projetos, workers, timeouts) e `e2e/pages/PainelPage.ts`.

## Entregar
- (E1) Primeiro, desfazer as imagens regravadas pela execução anterior: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 checkout -- docs/qa/evidencias`. Repita depois de cada rodada de E2E (achado F-2).
- (E1) Completar as medições com no máximo 2 workers e uma execução de E2E por vez, sem o cenário de 8 workers (a r1 com 8 workers já mediu esse caso). Fazer:
  - mais 2 rodadas da E2E completa com 1 worker e mais 1 com 2 workers, todas com `--retries=0`;
  - os testes do Diagnóstico (K-092, K-107, K-115, K-123 e o perf F4), 20 vezes cada, isolados, com 1 worker;
  - a mesma repetição "sob carga", com 2 workers e os testes de unidade de um pacote (`@metricas-dspd/metricas`) rodando em paralelo.

  Se a memória livre (`free -g`, coluna available) cair abaixo de 3 GB, pare a rodada e registre isso.
- (E1) Completar o relatório: para cada teste instável, arquivo e nome, taxa de falha por cenário, mensagem de erro, causa raiz provável com a evidência e o grupo (carga e tempo, aleatoriedade, espera frágil, portão). Para cada grupo, a correção proposta e quem a faz (E2 a E4 do pedido), sem aumentar timeout nem ligar retry. Registre também como achado o consumo de memória da E2E com 8 workers, que foi a causa da queda. O frontmatter precisa refletir o diagnóstico: `parecer:` e contagens conforme o que foi achado, sem "aprovado" por padrão.
- (E1) Gravar só com Write ou Edit, nunca por script no Bash. Um commit só do relatório, com `git add` explícito por caminho, a linha `Cartão: K-138` e mensagem conforme a seção de commits do `docs/engineering/praticas.md`. Sem push.
- (E2, E2.1) Esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132): não nesta delegação. Vêm numa delegação seguinte ao qa-engineer, pelo plano que este diagnóstico propuser.
- (E4, E4.1) Prova de estabilidade e parecer de QA: não nesta delegação. Vêm depois das correções do E2 e do E3.

## Fora do escopo
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outro papel.
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." e "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapas de outro papel.
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outro papel.
- Mudar código, testes, configuração ou limites; o quadro; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- Pedido 041, Fora do escopo: afrouxar limite de performance (C6, F6, F9, ADR 0003) ou de cobertura não entra.
- R-TETO: antes de cada execução pesada, `pgrep -fa 'playwright|vitest'` sem processo de outra worktree. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do relatório
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `grep -c 'workers' /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

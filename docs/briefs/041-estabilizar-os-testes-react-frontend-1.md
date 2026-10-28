Agente destino: forge:react-frontend
Pedido: 041-estabilizar-os-testes
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E6.1 do pedido 041 (cartão K-149): corrigir no front as 3 falhas determinísticas que a E2E completa do E4.1 achou, iguais na base e342a2c, para o 041 abrir o PR com a suíte verde. Worktree `/home/rodrigoisensee/MetricasDSPD-041` (já existe; não a recrie), branch `feature/041-estabilidade`, head 87151625c87c309a9dc436f5658b3aee077d12b5.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`: linhas 40 a 70 (as 3 falhas e o bloco `## Achados`, A1 e A2).
- `/home/rodrigoisensee/MetricasDSPD-041/e2e/tests/complementares.spec.ts`, teste da linha 45 (COMP-01), e `/home/rodrigoisensee/MetricasDSPD-041/e2e/perf/perf.spec.ts`, testes das linhas 174 e 195 (F2 CLS), só para reproduzir.
- `docs/tecnica/arquitetura-front.md`: trechos que citam SNO-004 (`grep -n SNO-004`).
- ADR 0003 (`docs/adr/`), só a parte do CLS.

## Entregar
- (E6, E6.1) Correção da falha A1 do parecer de QA: o axe `target-size` (serious) no botão "Sobre a janela fixa" em `/operacional?cadencia=sustentacao` a 1280 px (COMP-01), com a área de toque exigida pelo axe, sem desligar regra do axe.
- (E6, E6.1) Correção da falha A2 do parecer de QA: CLS de 0,115 a 375 px em `/operacional` e no Resumo, abaixo de 0,1, reservando o espaço do que entra depois do primeiro desenho. Ache o elemento que desloca (por exemplo, com o PerformanceObserver de `layout-shift` no navegador do Playwright) e registre a causa no relatório; o QA viu que a falha não existia em 2026-10-23 com o mesmo código do `web`, então confira se algo do conteúdo depende da data.
- (E6, E6.1) Teste unitário de cada correção quando couber (por exemplo, dimensão mínima do botão ou altura reservada) e a doc técnica afetada (`docs/tecnica/arquitetura-front.md`) na mesma entrega.
- (E6, E6.1) Durante o desenvolvimento, só os testes e o typecheck do `web` e os 3 testes E2E isolados, um por vez, com `--retries=0` e 1 worker; `pnpm run pronto` completo uma vez, antes do commit final. Commits com `Cartão: K-149`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação; continua no pedido
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação; continua no pedido
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação; continua no pedido
- "E6.2 (forge:tech-lead): code review do E6.1." · etapa de outra delegação; continua no pedido
- "E6.3 (forge:qa-engineer): reteste das 3 falhas e E2E completa com 2 workers; parecer de QA atualizado." · etapa de outra delegação; continua no pedido
- Mudar testes E2E, limites, timeouts ou retries (o `e2e/` é do QA; limite não afrouxa); outros defeitos de produto (L2T-003, K-126 a K-129); o parecer de QA; push; PR; o quadro; ler ou editar o `.env`; a worktree do 026.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): F4, opção A ("A"): corrigir a medição do F4: a primeira medição a frio sai da amostra, o teste colhe pelo menos 20 medições de verdade e a ADR 0003 registra a mudança da regra de medição com data; o limite de 100 ms não muda.
- DECISÃO DO DONO (2026-10-23): workers da E2E, opção A ("A"): limitar a 2 workers na máquina local pela configuração do Playwright, com variável de ambiente para subir quando quiser; a CI não muda.
- DECISÃO DO DONO (2026-10-23): custo do `homolog-aprovada`, opção B ("B"): sem espera paga; o fim do portão do `homolog.yml` dispara de novo o `homolog-aprovada` do PR (segundos de Actions por release); se o devops mostrar que não funciona, a opção A volta ao dono.
- DECISÃO DO DONO (2026-10-27): 3 falhas pré-existentes da E2E completa do E4.1, opção A ("A"): corrigir dentro do 041 antes do PR (react-frontend corrige, code review, QA dos 3 testes e E2E completa), na fila atrás da volta do 026, que mexe em /operacional.
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- ADR 0003 (citada no pedido): CLS < 0,1 é o limite e não muda; a correção reserva espaço, não mexe no limite nem na medição.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. Dúvida de regra de negócio vira pergunta, não inferência.
- Antes de rodar qualquer teste, `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso (a do 026 roda na worktree -026), espere ela acabar. Node 24 pelo nvm (`. ~/.nvm/nvm.sh`); banco local saudável (`docker compose -f /home/rodrigoisensee/MetricasDSPD/docker-compose.yml ps postgres`). R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%B` · espera: contém 'Cartão: K-149'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 87151625c87c309a9dc436f5658b3aee077d12b5 --name-only -- e2e server packages` · espera: linhas=0
- PQ-5 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-041 && pnpm run pronto` · espera: rc=0
- PQ-6 (cmd): os 3 testes isolados (`complementares.spec.ts:45`, `perf.spec.ts:174`, `perf.spec.ts:195`) com `--retries=0` e 1 worker, pelo comando da seção 11 do parecer de QA · espera: contém '3 passed'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

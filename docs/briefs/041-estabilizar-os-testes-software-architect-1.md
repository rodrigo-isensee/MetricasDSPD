Agente destino: forge:software-architect
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Registrar na ADR 0003 a nova regra de medição do F4 decidida pelo dono (etapa E2.3 do pedido 041, decisão F4 = A): no F4, a primeira medição a frio sai da amostra do p95 (e continua reportada à parte) e a amostra tem pelo menos 20 medições de verdade; o limite de 100 ms não muda. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/041-estabilidade`. Você não tem Bash: grave com Edit e não commite; o arquivo vai no commit do E2.1 (qa-engineer).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/adr/0003-orcamento-de-performance.md` inteiro.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`, seção 5 (F4, 10 repetições) e a linha "Perf F4" da seção 10.

## Entregar
- (E2) Na ADR 0003, nas condições de medição (linha 78) e na linha do F4: para o F4, a primeira medição a frio não entra no p95 e é reportada à parte; o p95 do F4 só vale com n >= 20 medições; o limite de 100 ms continua igual. As demais métricas (C3, A1 e as outras) não mudam.
- (E2) Registro da mudança de critério com data (2026-10-23), o motivo (diagnóstico do 041: 6 falhas em 10 com mediana de 49 a 76 ms e p95 de 3 a 11 amostras virando o máximo) e a decisão do dono, numa seção de histórico ou de revisão da própria ADR, sem trocar o número da ADR.
- (E2) Gravar só com Edit; sem commit.
- (E1, E3, E4) Diagnóstico, portões e prova de estabilidade: não nesta delegação.

## Fora do escopo
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outro papel; ela muda o teste do F4 e commita este arquivo.
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." e "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapas de outro papel.
- Mudar qualquer limite (os 100 ms do F4 e os demais), outras ADRs, código e testes.

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
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- ADR 0003 (citada no pedido): muda só a regra de medição do F4, pela decisão acima; nenhum limite muda.
- Regra do projeto: mudança de critério de cálculo é registrada com data (CLAUDE.md, T2.6).

## Pronto quando
- PQ-1 (cmd): `grep -c '2026-10-23' /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/architecture/adr/0003-orcamento-de-performance.md` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain -- docs/architecture/adr/0003-orcamento-de-performance.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:security-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E5.2 do pedido 041 (cartões K-135, K-092, K-115, K-138, K-107, K-123, K-134, K-132), volta da conferência da entrega: a seção do script `e2e/scripts/evidencias-fase-a.mjs` no seu parecer `docs/security/041-estabilidade.md` (commit 29068f3a25c4bb71dc350fdf1756a9bac4407c4f) diz "24 PNG"; o script grava 22 (6 larguras × 2 temas = 12 `operacional-*` e 5 estados × 2 temas = 10 `estado-*`, linhas 16 e 24 do script). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`, head 29068f3a25c4bb71dc350fdf1756a9bac4407c4f.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/e2e/scripts/evidencias-fase-a.mjs`, linhas 16 a 30.
- O seu parecer, só a seção do script.

## Entregar
- (E5.2) Corrigir no parecer a contagem para 22 PNG (e qualquer outro número da seção que divirja do script); veredito e achados ficam como estão.
- (E5.2) Commit só do parecer, com os `Cartão:` do 041, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e push da branch (sem `--force`).
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (diagnóstico, correções, portões e prova de estabilidade são das etapas listadas em Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação (branch `feature/041-homolog-aprovada`)
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outro papel
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · review já entregue; a volta do review e o PR são de outra delegação, depois desta
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação
- Alterar o script, código, testes ou o parecer de review; rodar o script ou suítes de teste; ler ou editar o `.env`; o quadro.

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
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- ADR 0003 (citada no pedido): orçamento de performance; nada nela muda nesta volta.
- Regra inviolável do `CLAUDE.md`: credenciais só no `.env`, nunca no código. R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '24 PNG' /home/rodrigoisensee/MetricasDSPD-041/docs/security/041-estabilidade.md` · espera: igual '0'
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/security/041-estabilidade.md` · espera: o sha40 do commit da volta, com os `Cartão:` do 041
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-041 ls-remote origin refs/heads/feature/041-estabilidade` igual ao head local · branch no remoto com o commit da volta
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%B -- docs/security/041-estabilidade.md` · espera: contém 'Cartão: K-135'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

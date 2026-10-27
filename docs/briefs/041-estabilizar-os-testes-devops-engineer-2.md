Agente destino: forge:devops-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Volta da etapa E3.2 do pedido 041 (cartão K-108): trocar a espera paga por sondagem do commit 31fc370 pela opção B decidida pelo dono (o fim do portão do `homolog.yml` dispara de novo o `homolog-aprovada` do PR) e fechar a brecha vista na conferência (o laço não esperava uma execução do portão ainda não listada na API). Worktree `/home/rodrigoisensee/MetricasDSPD-041b`, branch `feature/041-homolog-aprovada` (já criada, em 54c1a7f).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041b/.github/workflows/homolog-aprovada.yml` e `/home/rodrigoisensee/MetricasDSPD-041b/.github/workflows/homolog.yml` (job `portao` e gatilhos).
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/devops/041-homolog-aprovada.md` (o seu parecer anterior).
- `/home/rodrigoisensee/MetricasDSPD-041b/docs/engineering/fluxo-homologacao.md`, a parte do `homolog-aprovada`.

## Entregar
- (E3.2) `homolog-aprovada` sem sondagem nem espera paga: o check do PR de release avalia o estado atual do portão do mesmo sha (portão verde = aprova; em curso ou ausente = falha com mensagem clara de "portão ainda não terminou", sem esperar), e o fim do job `portao` do `homolog.yml` (por `workflow_run` ou disparo equivalente) reavalia o check do PR aberto daquele sha. `timeout-minutes` volta ao valor de antes de 31fc370. O critério não afrouxa: candidato = ponta de `homolog` com portão verde.
- (E3.2) Se a opção B não funcionar no GitHub Actions (por exemplo, `workflow_run` não atualiza o check do PR), não implemente outra coisa: registre a prova no parecer e pare; a opção A volta ao dono.
- (E3.2) `docs/engineering/fluxo-homologacao.md` e o parecer `docs/devops/041-homolog-aprovada.md` atualizados com o novo comportamento, a validação feita (`actionlint` se disponível ou leitura do YAML) e o raciocínio de por que não há corrida nem execução perdida.
- (E3.2) Commits com `Cartão: K-108`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push, sem PR; nada roda no GitHub.
- (E1, E2, E4) Diagnóstico, correções dos testes e prova de estabilidade: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue (8d8bdfd)
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outra delegação
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação
- `ci.yml`, `restauracao.yml`, rodada noturna, push, PR e rodar workflow no GitHub.

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
- Arquivos de `.github/` são gatilho de segurança (R-SEGURANCA): o parecer de segurança vem na E5.1, não aqui. Não contorne bloqueio de hook (R-CONFORMIDADE): bloqueio vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041b log -1 --format=%H -- .github/workflows/homolog-aprovada.yml` · espera: o sha40 de um commit posterior a 54c1a7f com `Cartão: K-108`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041b diff e342a2cd71c46df5acf60b756637ebf5a6c84709 --name-only -- .github/workflows/ci.yml .github/workflows/restauracao.yml` · espera: linhas=0
- PQ-4 (cmd): `grep -c 'sleep' /home/rodrigoisensee/MetricasDSPD-041b/.github/workflows/homolog-aprovada.yml` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

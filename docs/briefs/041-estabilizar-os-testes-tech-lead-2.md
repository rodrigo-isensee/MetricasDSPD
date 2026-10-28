Agente destino: forge:tech-lead
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Etapa E5.1 do pedido 041 (cartões K-135, K-092, K-115, K-138, K-107, K-123, K-134, K-132), primeira parte: code review da branch `feature/041-estabilidade` antes da prova de estabilidade do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`, head ca0905f4bd717dd2e945cf7259c91cd243080ffb.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-041 log --oneline c4db73e666e560f2120ab0b0d4cff1307d7710c9..ca0905f4bd717dd2e945cf7259c91cd243080ffb` e o diff do mesmo intervalo (a branch inteira).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`: só as seções de causas e plano de correção.
- Desvios relatados pelo qa-engineer na E2.1, para julgar: (a) `CartaoMetrica` manteve o `esperarPronto` próprio (espera de um cartão só); (b) IF-U de Voltar/Avançar em janelas de 2 passos (1 no operacional), com menos profundidade de histórico por teste que o teste original, e o teste de ida e volta pela URL ganhou uma asserção; (c) o F5 passou a ter mais de 20 amostras porque o laço segue até juntar as 20 do F4; (d) `N_F4 = max(20, N)`.

## Entregar
- (E5.1) Push da branch `feature/041-estabilidade` para o origin (sem `--force`).
- (E5.1) Parecer de review em `docs/reviews/041-estabilidade.md`, da branch inteira: correção das causas sem aumentar timeout nem usar retry (E2), cobertura de cada asserção mantida (E2), os desvios (a) a (d) aceitos ou não, typecheck do e2e no `pronto` (E3, K-134) e evidências fora do caminho versionado (E3, K-132), ADR 0003 coerente com a decisão F4 = A. Bloco `## Achados`, cada achado com até 300 caracteres e, se reprovar, ao menos um marcado bloqueante. Commit com os `Cartão:` do 041, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e push.
- (E5.1) PR para a develop: não nesta delegação (depois do parecer de QA da E4.1).
- (E1, E2, E3, E4) Diagnóstico, correções, portões e prova de estabilidade: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação (branch `feature/041-homolog-aprovada`, review próprio)
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outro papel, depois desta
- Rodar suítes de teste (E2E, unidade ou `pronto` completo): o QA roda na E4.1, uma suíte por vez; aqui só leitura, lint e typecheck. Alterar código ou testes; a branch `feature/041-homolog-aprovada`; o quadro.

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
- ADR 0003 (citada no pedido): orçamento de performance; nesta branch, a seção "Medição do F4" (fria fora do p95, n >= 20, limite de 100 ms igual) entrou pela E2.3; o review confere que o `perf.spec.ts` segue essa regra.
- R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`. Outro tech-lead pode estar mesclando o PR #148 do pedido 042 em paralelo: não toque nessa branch nem na worktree `MetricasDSPD-042p`.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-041 ls-remote origin refs/heads/feature/041-estabilidade` igual ao head local · branch no remoto com o commit do parecer
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/reviews/041-estabilidade.md` · espera: o sha40 do commit do parecer, com os `Cartão:` do 041
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:qa-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E4.1 do pedido 041 (cartões K-135, K-092, K-115, K-138, K-107, K-123, K-134, K-132): prova de estabilidade das correções (os testes corrigidos rodando N vezes seguidas sem falha) e parecer de QA da branch, último portão antes do PR para a develop. Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`, head 6d40d688f7d7cb3cf61983a544eadb51761269f8 (review e segurança aprovados). Node 24 pelo nvm (`. ~/.nvm/nvm.sh`); confira `docker compose -f /home/rodrigoisensee/MetricasDSPD/docker-compose.yml ps postgres` antes da primeira suíte e, sem banco saudável, relate e pare.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`: seções 4 a 8 e 10 (os comandos de medição e as taxas de falha de antes).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md` e `/home/rodrigoisensee/MetricasDSPD-041/docs/security/041-estabilidade.md`, só os blocos `## Achados`.

## Entregar
- (E4, E4.1) Prova de estabilidade, `--retries=0`, uma suíte por vez, 1 worker nas repetições: 20 repetições seguidas de cada teste corrigido da seção 8 (PQ-1 do pedido) (F4 de `e2e/perf/perf.spec.ts`; os testes em que o IF-U-operacional e o CA-19 foram divididos; `montecarlo.test.ts` e `mock.test.ts` da unidade), com os mesmos comandos da seção de cada um, trocando só o filtro pelos nomes novos; depois uma E2E completa com 2 workers (padrão local da decisão do dono) e a contagem de falhas. Para cada teste: falhas em N, duração mediana e máxima, e o n do F4 por repetição.
- (E4, E4.1) Parecer de QA em `docs/qa/041-estabilidade.md` (nova seção da prova, frontmatter `parecer:` atualizado, bloco `## Achados` com cada achado de até 300 caracteres e os bloqueantes marcados), e na seção 4 a nota de que a propriedade do K-107 era falsa por deslocamento da sequência do PRNG entre k e k + 5, não só estatística (Histórico do pedido, 2026-10-23 20:55).
- (E4, E4.1) `pnpm run pronto` completo uma vez, antes do commit. Commit só de `docs/qa/041-estabilidade.md` (sem PNG nem relatório de teste), com os `Cartão:` do 041, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
- (E1, E2, E3) Diagnóstico, correções e portões: não nesta delegação; review, segurança e PR são etapas de outros papéis (Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação (branch `feature/041-homolog-aprovada`)
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · review entregue; o PR é de outra delegação, depois desta
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · já entregue
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação
- Corrigir código ou testes (defeito achado vira achado no parecer, com passos para reproduzir); aumentar timeout ou ligar retry; rodar duas suítes ao mesmo tempo; ler ou editar o `.env`; o quadro; outras worktrees.

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
- ADR 0003 (citada no pedido): orçamento de performance; o limite de 100 ms do F4 não muda e a amostra segue a regra nova da ADR.
- Pré-condições: banco local saudável; Chromium do Playwright instalado; nenhuma outra suíte rodando na máquina (o Jarvis não dispara outra enquanto esta roda).
- R-QA: portão obrigatório. R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`.

## Pronto quando
- PQ-1 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: igual '1'
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do parecer
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%B -- docs/qa/041-estabilidade.md` · espera: contém 'Cartão: K-138'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-041 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui, por teste, falhas em N e duração mediana e máxima, o n do F4 e o pico de memória do slice. Se a prova reprovar, PQ-1 fica "não cumprido" com o teste e a taxa. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

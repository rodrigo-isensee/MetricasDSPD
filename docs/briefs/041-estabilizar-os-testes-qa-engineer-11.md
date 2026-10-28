Agente destino: forge:qa-engineer
Pedido: 041-estabilizar-os-testes
Tipo: qa
Branch: feature/041-estabilidade   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E6.3 do pedido 041 (cartão K-149): portão de QA (R-QA) da correção das 3 falhas determinísticas da E2E completa (A1 COMP-01 axe `target-size` a 1280 px; A2 CLS 0,115 a 375 px em /operacional e no Resumo), feita no E6.1 (ea54fbffd51ed146cc14b32bd9f2b15428ea9d89) e aprovada no code review E6.2 (83aa9fa6f41bcfc0b526d1c17c988d256e0b1dce, já no remoto). Worktree `/home/rodrigoisensee/MetricasDSPD-041`, branch `feature/041-estabilidade`, head 83aa9fa.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md`: seção 11 (comandos e resultados do E4.1) e bloco `## Achados` (A1 e A2).
- `git -C /home/rodrigoisensee/MetricasDSPD-041 show 6d40d688f7d7cb3cf61983a544eadb51761269f8:docs/qa/041-estabilidade.md`: seções 1 a 10 (o texto a restaurar).
- `/home/rodrigoisensee/MetricasDSPD-041/docs/reviews/041-estabilidade.md`, seção "Revisão do E6.1 (K-149)" e os achados A6 e A7.

## Entregar
- (E6, E6.3) Reteste das 3 falhas, `--retries=0`, 1 worker, 5 repetições de cada, em `e2e/` (portas 4273/4274, como na seção 11): `complementares.spec.ts:45` (COMP-01, as 4 variantes), `perf.spec.ts:174` (F2 CLS a 375x812 em /operacional) e `perf.spec.ts:195` (F2 CLS do Resumo a 375px). Para cada um: falhas em N, o valor medido (CLS por repetição; violações do axe) e o comando exato usado, gravado no parecer.
- (E6, E6.3) Depois, uma E2E completa com 2 workers (padrão local da decisão do dono), `--retries=0`, com a contagem de passaram e falharam; falha nova vira achado com passos para reproduzir.
- (E6, E6.3) Parecer de QA em `docs/qa/041-estabilidade.md`: (a) restaurar literalmente as seções 1 a 10 e o cabeçalho "## 11." que o commit 8715162 apagou, a partir de 6d40d688f7d7cb3cf61983a544eadb51761269f8, mantendo as subseções 11.1 a 11.3; (b) na seção 4, a nota de que a propriedade do K-107 era falsa por deslocamento da sequência do PRNG entre k e k + 5, não só estatística (Histórico do pedido, 2026-10-23 20:55); (c) seção nova "## 12. Reteste do E6 (K-149)" com os dois itens acima; (d) bloco `## Achados` com A1 e A2 marcados como resolvidos ou mantidos pela medição, cada achado de até 300 caracteres e os bloqueantes marcados; (e) frontmatter com `commit: 83aa9fa6f41bcfc0b526d1c17c988d256e0b1dce` e `parecer:` atualizado.
- (E6, E6.3) `pnpm run pronto` completo uma vez, antes do commit. Commit só de `docs/qa/041-estabilidade.md` (sem PNG nem relatório de teste), com `Cartão: K-149`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:qa-engineer): diagnóstico medido (E1), em `docs/qa/041-estabilidade.md`, com a lista de causas e um plano de correção por grupo." · já entregue; aqui só se restaura o texto apagado
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · já entregue
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · já entregue
- "E2.3 (forge:software-architect): ADR 0003 com a nova regra de medição do F4 (sem a medição a frio, n >= 20, limite de 100 ms igual), pela decisão F4 = A; sem Bash, o arquivo vai no commit do E2.1." · já entregue
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · já entregue
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outra delegação (branch `feature/041-homolog-aprovada`)
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · já entregue (8715162); as 20 repetições não se refazem
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa de outra delegação, depois desta
- "E5.2 (forge:security-engineer): parecer de segurança da `feature/041-estabilidade` (scripts dos `package.json`, gatilho de R-SEGURANCA), antes do PR." · etapa de outra delegação
- "E5.3 (forge:security-engineer): parecer de segurança da `feature/041-homolog-aprovada` (workflows, gatilho de R-SEGURANCA), junto com o code review dela." · etapa de outra delegação
- "E6.1 (forge:react-frontend): corrigir as 3 falhas do E6 na `feature/041-estabilidade` (K-149), depois da volta do 026, que mexe em /operacional." · já entregue (ea54fbf)
- "E6.2 (forge:tech-lead): code review do E6.1." · já entregue (83aa9fa)
- Corrigir código ou testes (defeito vira achado com passos para reproduzir); os achados A6 e A7 do review; aumentar timeout ou ligar retry; trazer a develop nova para a branch; push; PR; o quadro; ler ou editar o `.env`; as worktrees -026 e -151.

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
- DECISÃO DO DONO (2026-10-27): medição a frio do F4, opção A ("A"): o dono não percebe demora na primeira troca de filtro; a 2ª condição do critério de reversão da ADR 0003 (seção "Medição do F4") não se cumpre e nada muda; a primeira medição segue informativa. Registro da leitura no quadro de leituras da ADR vai junto do PR do 041 (técnico).
- ADR 0003 (citada no pedido): CLS < 0,1 e o limite de 100 ms do F4 não mudam; o reteste mede contra eles, sem mexer em limite nem em medição.
- Uma suíte por vez: o 026 e o K-151 rodam `pnpm run pronto` nas worktrees -026 e -151. Antes de cada rodada (reteste, E2E completa, pronto), `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar. Nunca dois Playwright ao mesmo tempo. Pré-condições: banco local saudável; Chromium do Playwright instalado. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.
- R-QA: portão obrigatório. R-VERIFY: nunca `--no-verify` nem `--force`. R-MAIN: nada na `main`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (cmd): `grep -c '^parecer: aprovado' /home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: igual '1'
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%H -- docs/qa/041-estabilidade.md` · espera: o sha40 do commit do parecer
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 log -1 --format=%B -- docs/qa/041-estabilidade.md` · espera: contém 'Cartão: K-149'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `grep -c '^## [0-9]' /home/rodrigoisensee/MetricasDSPD-041/docs/qa/041-estabilidade.md` · espera: igual '12'
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-041 diff 83aa9fa6f41bcfc0b526d1c17c988d256e0b1dce --name-only` · espera: igual 'docs/qa/041-estabilidade.md'
- PQ-7 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-041 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui, por teste retestado, falhas em N e o valor medido; a contagem da E2E completa (passaram, falharam, duração) e o pico de memória do slice. Se o parecer reprovar, PQ-1 fica "não cumprido" com o teste e a taxa. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

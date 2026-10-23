Agente destino: forge:node-backend
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Tirar a causa de dois testes de unidade instáveis (etapa E2.2 do pedido 041, cartões K-107 e K-123), sem aumentar limite nem ligar retry: a propriedade do Monte Carlo é estatística e falha de vez em quando, e o teste do gerador mede tempo de relógio absoluto, que estoura com a máquina carregada. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/041-estabilidade` (8d8bdfd, com o diagnóstico).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`, seção 4 e as linhas de "Aleatoriedade (K-107)" e "Carga e tempo, unidade (K-123)" da seção 10.
- `packages/metricas/src/core/montecarlo.test.ts`, linhas 120 a 160 (as duas propriedades `fast-check`).
- `packages/mock/src/mock.test.ts` (teste "gera a base completa em menos de 1,5 s") e `packages/mock/src/desempenho.test.ts` (o `cpuMs` e o `calibrar`, que são o modelo).

## Entregar
- (E2) K-107: a propriedade "mais itens nunca terminam antes" passa a ser determinística: `seed` fixo no `fc.assert` ou a mesma sequência do PRNG para `k` e `k + 5`, sem trocar a asserção por outra mais fraca; o contraexemplo do cartão (semente 1324607460, `[[2,0,6,5,0,7,0,8],29]`) entra como caso de regressão (`examples`). Nada muda no código de cálculo do `montecarlo` (biblioteca compartilhada, T2.5).
- (E2) K-123: o teste do gerador mede em tempo de CPU e calibra contra o trabalho de referência, como o `desempenho.test.ts`, sem subir o limite em relação ao trabalho de referência.
- (E2) Provar cada um: o arquivo de teste rodado 20 vezes seguidas, isolado, sem falha (uma suíte por vez; nada de E2E), e registrar os comandos e o resultado no relatório.
- (E2) Testes e typecheck só dos pacotes `@metricas-dspd/metricas` e `@metricas-dspd/mock` durante o trabalho; `pnpm run pronto` uma vez antes do commit final, da raiz da worktree. Um commit por cartão (K-107 e K-123), `git add` explícito por caminho, linha `Cartão:`, mensagem conforme a seção de commits do `docs/engineering/praticas.md`; sem push.
- (E1) Diagnóstico: já entregue (8d8bdfd); não refazer.
- (E3, E4) Portões (K-134, K-108, evidências) e prova de estabilidade com parecer de QA: não nesta delegação.

## Fora do escopo
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outro papel.
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." e "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapas de outro papel.
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." e "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapas de outro papel.
- E2E, configuração do Playwright, `package.json` da raiz, o relatório de QA; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- Pedido 041: sem aumentar timeout nem limite e sem retry como solução, mantendo a cobertura de cada asserção (Escopo E2 e Critério PQ-3). Afrouxar limite de performance ou de cobertura não entra (Fora do escopo).
- ADR 0003 (citada no pedido, orçamento de performance): nada muda nela nesta etapa; o teste do gerador não é limite da ADR 0003.
- Regra inviolável: todo cálculo de Monte Carlo passa pela biblioteca compartilhada (CLAUDE.md); a mudança é só no teste.
- R-CONFORMIDADE: o hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- packages/metricas/src/core/montecarlo.test.ts` · espera: o sha40 do commit do K-107
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- packages/mock/src/mock.test.ts` · espera: o sha40 do commit do K-123
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff c4db73e666e560f2120ab0b0d4cff1307d7710c9 --name-only -- packages/metricas/src/core/montecarlo.ts` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

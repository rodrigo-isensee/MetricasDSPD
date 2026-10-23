Agente destino: forge:tech-lead
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-estabilidade   Base: develop   Base-sha: c4db73e666e560f2120ab0b0d4cff1307d7710c9

## Objetivo
Fechar os buracos de portão achados no diagnóstico do 041 (etapa E3.1, cartões K-134 e K-132, segunda parte): o `pronto` não faz o typecheck do e2e, o `pnpm test` da raiz dispara a E2E inteira (achado F-1) e a E2E regrava `docs/qa/evidencias`, que é versionado (achado F-2). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/041-estabilidade` (com o diagnóstico 8d8bdfd e a E2.2 em a999345 e f61db60).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/041-estabilidade.md`: achados F-1 e F-2 (seção 2 e seção 9), a linha "Portão" da seção 10 e os achados A6 e A7.
- `package.json` da raiz (scripts `test`, `pronto`), `e2e/package.json` e `e2e/playwright.config.ts` (onde as evidências são gravadas).
- `docs/engineering/praticas.md`, seção de commits.

## Entregar
- (E3) K-134: o `pnpm run pronto` passa a rodar o typecheck do pacote `e2e`, e falha quando há erro de tipo nele; prova: um erro de tipo temporário em um arquivo do e2e faz o `pronto` falhar (desfeito antes do commit).
- (E3) F-1: o `pnpm test` da raiz deixa de rodar a E2E; a E2E fica num script próprio (por exemplo `test:e2e`), e o que a CI e a documentação chamam continua cobrindo a E2E onde ela roda hoje. Se a mudança exigir tocar `.github/`, não toque: registre no relatório o ajuste necessário, que vai ao devops-engineer.
- (E3) F-2 e K-132 (segunda parte): as execuções comuns da E2E gravam evidências fora de `docs/qa/evidencias` (por exemplo numa pasta ignorada pelo git), e só uma execução explícita de QA grava no caminho versionado; depois de rodar a E2E, `git status` fica limpo.
- (E3) Documentação afetada atualizada na mesma entrega (README ou `docs/engineering/` onde os comandos de teste aparecem).
- (E3) Rodar o `pronto` uma vez antes do commit final, da raiz da worktree; nenhuma suíte E2E completa nesta entrega (no máximo um teste E2E isolado, com 1 worker, para provar o F-2). Commits por cartão (K-134; F-1 e F-2 com `Cartão: K-132`), `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push.
- (E1) Diagnóstico: já entregue (8d8bdfd); não refazer.
- (E2, E4) Esperas do E2E, prova de estabilidade e parecer de QA: não nesta delegação.

## Fora do escopo
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." · etapa de outro papel.
- "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapa de outro papel, entregue.
- "E3.2 (forge:devops-engineer): `homolog-aprovada` espera o portão (K-108) e parecer de devops." · etapa de outro papel.
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." · etapa de outro papel.
- "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapa posterior do mesmo papel, depois do E4.1.
- `.github/`, workers do Playwright, limites de performance, o relatório de QA; push; PR.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- Pedido 041: sem aumentar timeout nem limite e sem retry como solução (Critério PQ-3); afrouxar limite de performance (ADR 0003) ou de cobertura não entra.
- ADR 0003 (citada no pedido): nada muda nela nesta etapa.
- R-VERIFY: nunca `--no-verify`. R-CONFORMIDADE: o hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%H -- package.json` · espera: o sha40 do último commit desta entrega que toca o `package.json`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff f61db606c65bf88570e4df43d01db58149b83a2f --name-only -- .github` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui a saída do `pronto` que falhou com o erro de tipo temporário e a do `git status` depois do teste E2E isolado. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

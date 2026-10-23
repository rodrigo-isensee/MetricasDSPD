Agente destino: forge:devops-engineer
Pedido: docs/pedidos/041-estabilizar-os-testes.md
Tipo: codigo
Branch: feature/041-homolog-aprovada   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Acabar com a corrida do check `homolog-aprovada` (etapa E3.2 do pedido 041, cartão K-108): ele roda antes de o job `portao` do `homolog.yml` terminar no mesmo sha e fica vermelho por corrida (visto no #90, no #96 e no #144, onde foi preciso rodar de novo à mão). Crie a worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b` com a branch `feature/041-homolog-aprovada` a partir de `origin/develop` (e342a2c).

## Ler
- `.github/workflows/homolog-aprovada.yml` e `.github/workflows/homolog.yml` (job `portao` e os gatilhos).
- `docs/engineering/fluxo-homologacao.md`, a parte do `homolog-aprovada`.
- `docs/kanban/prompt-jarvis-forge-2026-10-21.md`, item F22 (a evidência do #144).

## Entregar
- (E3) O `homolog-aprovada` passa a esperar o resultado do portão do mesmo sha em vez de falhar quando ele ainda roda: por exemplo, disparar também por `workflow_run` do `homolog.yml` concluído, ou esperar com limite de tempo e falhar só se o portão terminar sem sucesso. O critério não afrouxa: candidato = ponta de `homolog` com portão verde, como hoje.
- (E3) `docs/engineering/fluxo-homologacao.md` atualizado com o novo comportamento, na mesma entrega.
- (E3) Parecer de devops em `docs/devops/041-homolog-aprovada.md` (frontmatter do projeto), com a validação feita: `actionlint` se disponível ou leitura do YAML, e o raciocínio de por que não há corrida; nada roda no GitHub nesta entrega.
- (E3) Commits com `Cartão: K-108`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`; sem push, sem PR.
- (E1, E2, E4) Diagnóstico, correções dos testes e prova de estabilidade: não nesta delegação.

## Fora do escopo
- "E3.1 (forge:tech-lead): typecheck do e2e no `pronto` (K-134)." · etapa de outro papel, em curso em outra worktree.
- "E2.1 (forge:qa-engineer): esperas do E2E e helper único de "painel pronto" (K-135, K-092, K-115, K-132)." e "E2.2 (forge:node-backend): semente fixa ou propriedade determinística no montecarlo (K-107) e limite de tempo do gerador que não dependa da carga da máquina (K-123)." · etapas de outro papel.
- "E4.1 (forge:qa-engineer): prova de estabilidade (E4) e parecer de QA." e "E5.1 (forge:tech-lead): code review e PRs para a develop." · etapas de outro papel.
- O PR de release criado vazio pela automação (segunda parte do F22): fica no Forge, não neste pedido. `ci.yml`, `restauracao.yml`, rodada noturna, push, PR, rodar workflow no GitHub.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-22): "Jarvis preciso que voce melhore os testes, porque to achando muito estranho algumas instabilidades".
- DECISÃO DO DONO (2026-10-22): recibo do 041 aceito ("Ok"), sem instabilidade específica além das do Diagnóstico.
- DECISÃO DO DONO (2026-10-23): "Faca suas recomendacoes": E2E completo no portão (K-131) e religar a rodada noturna da homolog ficam para depois do 041 entregue, porque dependem de a suíte estar estável. Melhorias do Forge: o dono leva o texto (docs/kanban/prompt-jarvis-forge-2026-10-21.md, F1 a F20).
- DECISÃO DO DONO (2026-10-23): "Atenção a consumo: rode as suítes de teste sem paralelismo excessivo, pois o WSL agora tem teto de 14 GB." (depois de o WSL cair sem memória durante o diagnóstico com 8 workers).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (depois da segunda queda do WSL por falta de memória).
- DECISÃO DO DONO (2026-10-23): sessão do Jarvis dentro do jarvis.slice (memória alta em 7 GB e máxima em 9 GB, CPU até 8 núcleos), que vale para tudo o que ele dispara; "Se um processo for morto por falta de memória, rode menos coisas em paralelo e tente de novo."
- DECISÃO DO DONO (2026-10-23): "Use poucos agentes em paralelo e uma suíte de teste por vez (a máquina tem teto de memória)." (depois de corrigir o pagefile do Windows).
- DECISÃO DO DONO (2026-10-23): "Sobe o pra lelismo dentro do limite" (lido como: mais agentes em paralelo, dentro do teto de R-TETO e do `jarvis.slice`; a suíte de teste segue uma por vez).
- Pedido 041: sem retry como solução e sem afrouxar portão; afrouxar limite de performance (ADR 0003) ou de cobertura não entra.
- ADR 0003 (citada no pedido): nada muda nela nesta etapa.
- R-CUSTO: nada que custe minutos novos do Actions sem autorização (não rodar workflow). R-SEGURANCA: mudança em CI/CD tem gatilho; o review de segurança vem depois, em outra delegação. R-CONFORMIDADE: o hook barra `$`, crase e `?` no Bash.
- Nesta entrega não roda suíte de teste nenhuma (só lint de YAML), por causa da suíte que o tech-lead roda em paralelo.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%H -- .github/workflows/homolog-aprovada.yml` · espera: o sha40 do commit do K-108
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/devops/041-homolog-aprovada.md`
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b status --porcelain` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff e342a2cd71c46df5acf60b756637ebf5a6c84709 --name-only -- .github/workflows/ci.yml .github/workflows/restauracao.yml` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

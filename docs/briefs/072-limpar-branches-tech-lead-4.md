Agente destino: forge:tech-lead
Pedido: 072-limpar-branches
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 39b761d4d04e14457690a547ba1f39d65ff2e8d7
Etapa: review   Cobre: E1.4

## Objetivo
Conferir, nas 22 branches com PR mesclado na develop e commit a mais, se o conteúdo de cada commit a mais já está na develop, e se a triagem do Dependabot ainda vale, para o dono apagar com segurança o que não perde nada, mais as 10 branches sem PR que ele descartou (pedido 072, E1.4, K-223). Só leitura: nada é apagado, commitado nem enviado.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline <headRefOid do PR>..<branch>` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff --stat <headRefOid do PR> <branch>` de cada branch (local ou `origin/<branch>`, a que existir; use a de sha mais novo).
- Para cada arquivo tocado nesses commits: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff origin/develop <branch> -- <arquivo>` (vazio = já está na develop igual).
- O headRefOid de cada PR: `gh pr view <n> --repo rodrigo-isensee/MetricasDSPD --json headRefOid,state,baseRefName`.

## Entregar
- "E1.4 (tech-lead): conferir, nas 22 branches com PR mesclado e commit a mais (as 21 da decisão 2 mais a forge/upgrade-0.32.0, do mesmo grupo), se o conteúdo de cada commit a mais já está na develop; conferir se a triagem da docs/060-triagem-dependabot ainda vale para os alertas abertos hoje; devolver os comandos de apagar das que já estão na develop e das 10 sem PR que o dono descartou, e a lista das que não estão (sem apagar, sem PR)." (E1.4)
- (E1) (E1.4) As 22 branches: `feature/069-l7-calendario` (PR 222), `feature/070-simulado-por-cartao` (230), `docs/060-claude-md-acelerato` (203), `docs/063-worklog-teto` (212), `docs/070-adr-0028-vigente` (234), `feature/052-f4-projetor` (184), `feature/056-carga-inicial` (185), `feature/060-api-so-real` (207), `feature/060-guardas-seed` (205), `feature/061-coleta-diaria` (204), `feature/062-fast-uri` (206), `feature/065-bloqueados` (214), `feature/067-dia-atipico` (215), `feature/069-l9a-sem-zero` (225), `feature/069-m1-frescor` (219), `feature/070-l3-e2e` (233), `forge/upgrade-0.30.8` (183), `feature/011-metricas-tambem-back` (92), `feature/060-seed-recusa-real` (202), `docs/059-excecao-apontamento` (193), `feature/041-estabilidade` (150), mais `forge/upgrade-0.32.0` (223), que o relatório da E1.1 listou no mesmo grupo à parte da contagem (22 no total; Histórico do pedido). Para cada uma, uma linha: branch, PR, commits a mais (sha e assunto), arquivos, e o veredito "já na develop" (todo arquivo tocado igual na develop, ou o conteúdo coberto por outro arquivo já na develop, com a evidência) ou "falta na develop" (qual arquivo e o que falta).
- (E1) (E1.4) No relatório, um bloco de comandos literais para o dono rodar no terminal, só para as branches "já na develop": `git -C /home/rodrigoisensee/Metricas/MetricasDSPD push origin --delete <remotas existentes>` numa linha, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -D <locais existentes>` numa linha, e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree remove <caminho>` para worktree limpa de branch apagada (`/home/rodrigoisensee/MetricasDSPD-052d` da docs/070-adr-0028-vigente, `/home/rodrigoisensee/MetricasDSPD-056d` da feature/069-l9a-sem-zero, `/home/rodrigoisensee/MetricasDSPD-forge032` da forge/upgrade-0.32.0), se estiverem limpas (`git -C <caminho> status --porcelain` vazio).

- (E2) (E1.4) docs/060-triagem-dependabot (a branch sem PR que pode estar pronta; subir, se valer, é cartão próprio depois da promoção da release 071, aqui só o veredito): comparar o arquivo dela com os alertas abertos hoje (`gh api repos/rodrigo-isensee/MetricasDSPD/dependabot/alerts --jq` só com estado, pacote, severidade e número; sem copiar descrição), veredito "vale" ou "não vale" com a evidência; se não vale, entra nos comandos de apagar (a worktree `/home/rodrigoisensee/MetricasDSPD-052b` dela só se estiver limpa); se vale, fica fora dos comandos.
- (E1) (E1.4) Nos comandos ao dono, também as 10 sem PR descartadas: remotas `feature/011-fase2-back`, `feature/048-ajustes-front`, `feature/048-k129-pico`, `feature/048-usabilidade` e as remotas que existirem de `docs/056-acelerato-discovery`, `docs/061-coleta-diaria`, `feature/059-spike-worklog`, `feature/063-spike-paginacao`; locais que existirem dessas e de `forge/prep-032` e `backup/jarvis-local-2026-10-24`.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-05): "limpe as branchs" (resposta ao recibo: "vou fazer: apagar a branch remota, a local e a worktree de cada branch de trabalho com PR já mesclado na develop e sem nada além do que entrou; as sem PR, com PR não mesclado ou com commit local a mais vêm numa lista ao dono; não vou fazer: mexer em main, develop e homolog, nas branches em uso (L9-c, release 071 na worktree 052f, quadro do Jarvis), apagar o que não foi mesclado sem confirmação; é isso?"): limpeza confirmada com esse escopo. Completou, literal: "que ja foram apra develop" (só as que já entraram na develop).
- DECISÃO DO DONO (2026-11-05): "A" (fim da limpeza das 10 branches já mescladas e conferidas): o dono roda no terminal os três comandos (push origin --delete das 5 remotas que o classificador negou, branch -D das 10 locais e worktree prune); o time não repete.
- DECISÃO DO DONO (2026-11-05): "A" (as 21 branches com PR mesclado e commit a mais): o time confere uma a uma; se o conteúdo dos commits a mais já está na develop, devolve ao dono os comandos para apagar; se não está, abre PR só com esse conteúdo depois da promoção da release 071.
- DECISÃO DO DONO (2026-11-05): "A" (as 11 branches sem PR): descartar as 10 (docs/056-acelerato-discovery, docs/061-coleta-diaria, feature/059-spike-worklog, feature/063-spike-paginacao, feature/011-fase2-back, feature/048-ajustes-front, feature/048-k129-pico, feature/048-usabilidade, forge/prep-032, backup/jarvis-local-2026-10-24), com os comandos de apagar para o dono rodar; a docs/060-triagem-dependabot é conferida e, se ainda valer, sobe por PR depois da promoção da release 071; se não valer, é descartada.
### Restrições
- Só leitura: nenhum `push`, `branch -d/-D`, `worktree remove`, `checkout`, `switch`, `reset`, `stash`, `clean` nem commit; os comandos de apagar vão só no relatório, para o dono.
- NÃO tocar: `main`, `develop`, `homolog`, `feature/069-l9c-projecao` e a worktree 052c, `docs/071-release` e a worktree 052f, `docs/jarvis-2026-10-23` e a worktree principal, os arquivos `.env*`; não entram nos comandos ao dono.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. Comandos com nomes literais (sem variável de shell).

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): levantar cada branch com `gh pr list --state all --head`, apagar as que cumprem a regra do E1 (remota, local e worktree) e relatar a lista das que não cumprem, com o motivo de cada uma; na mesma levantada, classificar cada branch não mesclada em pronta (trabalho terminado, sem conflito relevante com a develop, com ou sem pareceres) ou não, com a evidência; as prontas viram cartão próprio e sobem pelo fluxo normal depois da promoção da release 071 (a develop está parada até lá)." · etapa de outra delegação; continua no pedido
- "E1.2 (dono): decidir, uma a uma ou em bloco, o destino das branches da lista." · etapa de outra delegação; continua no pedido
- O PR do conteúdo que falta na develop: cartão próprio depois da promoção da release 071.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD ls-remote --heads origin develop homolog main feature/069-l9c-projecao docs/071-release` · espera: linhas=5

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo; depois a tabela das 22 branches e o bloco de comandos ao dono. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

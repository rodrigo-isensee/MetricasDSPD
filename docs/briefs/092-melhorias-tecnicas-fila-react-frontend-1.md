Agente destino: forge:react-frontend
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: fix/k268-simulado-intermitente   Base: develop   Base-sha: d8d52103c20837fce3ece3d5bed5f6c68c88c8a2
Etapa: codigo   Cobre: E6.1

## Objetivo
K-268: o caso "o mock é criado uma só vez, pelo primeiro cartão simulável" de `web/src/features/coleta/simulado.test.tsx` (perto da linha 94) é intermitente: o `selo-simulado-O12` não aparece a tempo e o job `testes` cai (CI dos PRs 311 e 315), passando na rodada seguinte do mesmo commit. O caso foi trocado no lote 6b (O12 na visão semanal no lugar de BLOQUEADOS). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `fix/k268-simulado-intermitente` (a partir da develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/coleta/simulado.test.tsx`, o caso citado e o ajudante `fonteApiComSimulado`.
- O componente que mostra o selo de simulado e a criação do mock (o caminho está nos imports do teste).

## Entregar
- "E6.1 (react-frontend): K-268, teste intermitente de simulado.test.tsx, na branch fix/k268-simulado-intermitente, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E6.1)
- (E6) (E6.1) Achar por que o selo do O12 demora (ordem de carga dos cartões, criação assíncrona do mock, cartão fora da área visível) e fazer o teste esperar a condição certa (por exemplo o cartão do O12 sair do estado de carregando antes de procurar o selo), sem aumentar timeout, sem retry e sem afrouxar o que o caso prova (o mock nasce uma vez só, pelo primeiro cartão simulável). Prova: o arquivo 30 vezes seguidas com no máximo 2 workers (R-TETO), sem falha (sem rodar outra suíte junto, R-TETO). Só o arquivo de teste; se a causa for no componente, pare e relate. Commit com `Cartão: K-268` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k268-simulado-intermitente` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/coleta/simulado.test.tsx

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): K-121, frontmatter nos 8 documentos de docs/qa que o forge-check docs acusa, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): K-121, frontmatter em docs/reviews/front-via-api.md, na mesma branch, depois da E1.1." · etapa de outra delegação; continua no pedido
- "E1.5 (software-architect): K-121, frontmatter em docs/architecture/features/front-via-api.md, na mesma branch (o tech-lead leva o arquivo ao commit)." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-172." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-insumos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052c (primeira tentativa em fix/k174-docs-contratos-carga, 052g, sem PR)." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review e envio das retrospectivas do 091 e do 092 (worktree 052g, branch docs/retros-2026-11-11b): parecer de review, commit, push e PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E5.2 (tech-lead): review do K-264." · etapa de outra delegação; continua no pedido
- "E5.3 (qa-engineer): QA do K-264." · etapa de outra delegação; continua no pedido
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-268." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-268." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-268; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/fix/k268-simulado-intermitente` · espera: contém 'Cartão: K-268'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

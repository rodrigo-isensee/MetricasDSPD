Agente destino: forge:tech-lead
Pedido: 092-melhorias-tecnicas-fila
Tipo: codigo
Branch: docs/k172-pronto-praticas   Base: develop   Base-sha: 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13
Etapa: codigo   Cobre: E2.2

## Objetivo
Review do K-172: branch `docs/k172-pronto-praticas`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, commit 87079bef3a22cd3215d99576fd96a1d38e04f068 (entrega conferida; 1 linha trocada em `docs/engineering/praticas.md`), base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13. Só documentação, classe T (sem QA).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 87079bef3a22cd3215d99576fd96a1d38e04f068`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/026-front-do-011-lote3.md`, linhas 40 e 143.

## Entregar
- "E2.2 (tech-lead): review do K-172." (E2.2)
- (E2) (E2.2) Review: o texto novo diz o mesmo que a decisão do dono de 2026-10-21 (pronto completo uma vez, antes do commit final; testes e typecheck do pacote durante o desenvolvimento), não afrouxa e não contradiz o resto de `praticas.md`. Parecer `docs/reviews/092-k172-pronto-praticas.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: docs/k172-pronto-praticas`, `commit: 87079bef3a22cd3215d99576fd96a1d38e04f068` e o veredito. Commit só do parecer com `Cartão: K-172` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/docs/k172-pronto-praticas` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k172-pronto-praticas.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 092-melhorias-tecnicas-fila até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/092-melhorias-tecnicas-fila.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-121, na branch docs/k121-frontmatter, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-121." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (tech-lead): K-172, na branch docs/k172-pronto-praticas, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-174." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-174 (E1 e E2 são só documentação, classe T)." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/docs/k172-pronto-praticas:docs/reviews/092-k172-pronto-praticas.md` · espera: contém 'commit: 87079bef3a22cd3215d99576fd96a1d38e04f068'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

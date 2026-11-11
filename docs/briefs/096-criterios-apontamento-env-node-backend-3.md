Agente destino: forge:node-backend
Pedido: 096-criterios-apontamento-env
Tipo: codigo
Branch: fix/k271-criterios-robustez   Base: develop   Base-sha: 00758ca1151a23148b5e41880c515098e47f75d2
Etapa: codigo   Cobre: E2.1

## Objetivo
K-271: os recomendados da segurança e do review do K-270 na entrada `criterios-apontamento` (já na develop pelo PR 319). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `fix/k271-criterios-robustez` (a partir da develop 00758ca1151a23148b5e41880c515098e47f75d2).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/security/096-criterios-apontamento-env.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/096-criterios-apontamento-env.md` (só `## Achados`).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/server/src/entradas/criterios-apontamento.ts` e `ref-sync-apontamento.ts` (o modelo de tratamento de erro e de data).

## Entregar
- "E2.1 (node-backend): K-271, recomendados da segurança (A1 erro do banco só pela categoria; A2 data por dataCivilValida e quantidade de argumentos) e do review (A2 uso com o nome do script; A3 teste do ramo não ENOENT) na entrada criterios-apontamento, na branch fix/k271-criterios-robustez, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.1)
- (E3) (E2.1) Na falha do banco, imprimir só a categoria (`categoriaDoErro`), nunca a pilha, host, porta ou usuário; validar a data com `dataCivilValida` e recusar argumento a mais, com a mensagem de uso trazendo o nome do script `bm:criterios-apontamento`; teste do ramo de falha que não é ENOENT na leitura do `.env`. Sem extrair o carregador repetido (é outro cartão). Rodar `pnpm run pronto` da raiz da worktree, com no máximo 2 workers (teto do dono). Commit com `Cartão: K-271` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/k271-criterios-robustez` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/entradas/criterios-apontamento.ts, server/tests/criterios-apontamento-entrada.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 096-criterios-apontamento-env até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/096-criterios-apontamento-env.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (gatilho: server/package.json e leitura do .env)." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-271." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-271." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-271; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/k271-criterios-robustez` · espera: contém 'Cartão: K-271'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

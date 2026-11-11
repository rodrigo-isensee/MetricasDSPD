Agente destino: forge:tech-lead
Pedido: 096-criterios-apontamento-env
Tipo: codigo
Branch: fix/k271-criterios-robustez   Base: develop   Base-sha: 00758ca1151a23148b5e41880c515098e47f75d2
Etapa: codigo   Cobre: E2.2

## Objetivo
Review do K-271: branch `fix/k271-criterios-robustez`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em 567634140ff377ac20e017ca68bd1f9e7be9df37 (robustez da entrada `criterios-apontamento`), QA aprovado em d39c5624, base develop 00758ca1151a23148b5e41880c515098e47f75d2.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 00758ca1151a23148b5e41880c515098e47f75d2 567634140ff377ac20e017ca68bd1f9e7be9df37`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/096-k271-criterios-robustez.md`.

## Entregar
- "E2.2 (tech-lead): review do K-271." (E2.2)
- (E3) (E2.2) Review: o tratamento de erro segue o modelo do `ref-sync-apontamento` (só a categoria), o pool fecha no finally, a validação da data e dos argumentos está certa, os testes provam sem vazar segredo, e a mudança da mensagem de falta do `.env` está declarada. Rodar o arquivo de teste com no máximo 2 workers (R-TETO). Parecer `docs/reviews/096-k271-criterios-robustez.md` (novo) pela ferramenta Write, com `pedido: 096-criterios-apontamento-env`, `branch: fix/k271-criterios-robustez`, `commit: 567634140ff377ac20e017ca68bd1f9e7be9df37` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-271` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/k271-criterios-robustez` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/096-k271-criterios-robustez.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 096-criterios-apontamento-env até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/096-criterios-apontamento-env.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 095; o PR continua do tech-lead (E1.4)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (gatilho: server/package.json e leitura do .env)." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-271, recomendados da segurança (A1 erro do banco só pela categoria; A2 data por dataCivilValida e quantidade de argumentos) e do review (A2 uso com o nome do script; A3 teste do ramo não ENOENT) na entrada criterios-apontamento, na branch fix/k271-criterios-robustez, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-271." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-271; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/k271-criterios-robustez:docs/reviews/096-k271-criterios-robustez.md` · espera: contém 'branch: fix/k271-criterios-robustez'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

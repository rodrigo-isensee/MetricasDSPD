Agente destino: forge:tech-lead
Pedido: 096-criterios-apontamento-env
Tipo: codigo
Branch: fix/k271-criterios-robustez   Base: develop   Base-sha: 00758ca1151a23148b5e41880c515098e47f75d2
Etapa: codigo   Cobre: E2.4

## Objetivo
PR do K-271 para a develop: branch `fix/k271-criterios-robustez`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head 343270ee (código 56763414; QA aprovado em d39c5624; review aprovado em 343270ee com A1 recomendado).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/096-k271-criterios-robustez.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/qa/096-k271-criterios-robustez.md`.

## Entregar
- "E2.4 (tech-lead): PR do K-271; o merge é do dono." (E2.4)
- (E3) (E2.4) Rodar da worktree `forge-check pr 096-criterios-apontamento-env --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/k271-criterios-robustez --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Não atualizar a branch com a develop. Abrir o PR para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file`: o que muda, a troca da mensagem de falta do `.env` (A1 do review: de "Configuração inválida (variáveis: PG_MIGRADOR_URL)" para "bm:criterios-apontamento falhou: configuração: PG_MIGRADOR_URL"), os pareceres e `Cartão: K-271`. Esperar os checks até o fim e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

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
- "E2.2 (tech-lead): review do K-271." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-271." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k271-criterios-robustez --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

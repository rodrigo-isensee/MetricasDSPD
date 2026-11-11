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

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/k271-criterios-robustez:docs/reviews/096-k271-criterios-robustez.md` · espera: contém 'branch: fix/k271-criterios-robustez'

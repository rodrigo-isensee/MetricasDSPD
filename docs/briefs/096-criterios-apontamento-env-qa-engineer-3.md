## Objetivo
QA do K-271: branch `fix/k271-criterios-robustez`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, código em 567634140ff377ac20e017ca68bd1f9e7be9df37 (a entrada `criterios-apontamento` imprime só a categoria do erro do banco, valida a data por `dataCivilValida`, recusa argumento a mais e testa o ramo do `.env` que não é ENOENT), base develop 00758ca1151a23148b5e41880c515098e47f75d2.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b diff 00758ca1151a23148b5e41880c515098e47f75d2 567634140ff377ac20e017ca68bd1f9e7be9df37`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/security/096-criterios-apontamento-env.md` (A1 e A2).

## Entregar
- "E2.3 (qa-engineer): QA do K-271." (E2.3)
- (E3) (E2.3) Rodar `server/tests/criterios-apontamento-entrada.test.ts` com no máximo 2 workers (R-TETO); conferir que nenhuma saída de falha traz pilha, host, porta, usuário, senha ou conteúdo do `.env` (com segredo falso e banco falso, nunca o real), que data inválida e argumento a mais são recusados com o uso certo, e o ramo EACCES. Uma mutação (voltar a imprimir a mensagem crua do erro) que o teste pega, restaurada antes do commit. Grave `docs/qa/096-k271-criterios-robustez.md` (novo) só pela ferramenta Write, com `pedido: 096-criterios-apontamento-env`, `branch: fix/k271-criterios-robustez`, `commit: 567634140ff377ac20e017ca68bd1f9e7be9df37`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-271` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/k271-criterios-robustez` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/096-k271-criterios-robustez.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b show origin/fix/k271-criterios-robustez:docs/qa/096-k271-criterios-robustez.md` · espera: contém 'commit: 567634140ff377ac20e017ca68bd1f9e7be9df37'

## Objetivo
Volta 1 do comando de consultas só de leitura (pedido 099, E3.1): a segurança aprovou sem bloqueante, mas com três recomendados que valem antes de o dono rodar o comando na máquina dele com as credenciais reais. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099`, head 83bf09d6 (código aa8b6f20).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/099-consultas-leitura.md` (A1, A3, A4 e as sondas S1 a S7).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1) Nesta volta, o A1, o A3 e o A4 da segurança.
- (E4) (E3.1) A1: trocar a recusa por lista de palavras proibidas por uma lista do que é permitido (um único `SELECT` ou `WITH` por arquivo, sem `;` no meio, sem meta-comando do cliente `\`, sem `SET`, `DO`, `EXECUTE`, `system`, `\!`, `\gexec`), e rodar o cliente mysql com `--sandbox` (e o equivalente no psql, sem leitura de `.psqlrc` e sem meta-comandos); um teste por sonda S1 a S7 provando a recusa. A3: fixar o certificado do MySQL por `ssl-fp` com a impressão, usar `--defaults-file` no lugar de `--defaults-extra-file`, e documentar que a verificação nunca se desliga. A4: gravar a saída fora do repositório quando chamado de dentro dele (por exemplo na pasta pessoal do dono) e acrescentar `consultas-098-099-*.txt` ao `.gitignore`. Rodar só o teste do script e o shellcheck. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar nada contra a base real nem abrir `.env*`.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, scripts/sql/consultas-098-099/, docs/engineering/demo-dado-real.md, .gitignore

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/chore/consultas-leitura-098-099` · espera: contém 'Cartão: K-275'

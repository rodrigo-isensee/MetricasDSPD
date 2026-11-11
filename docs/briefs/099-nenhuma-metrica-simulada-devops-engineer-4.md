## Objetivo
Volta 2 do comando de consultas só de leitura (pedido 099, E3.1): o review aprovou sem bloqueante, com três recomendados que valem antes de o dono rodar. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099`, head 2b5590e7 (código 1a3d8dd1).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/099-consultas-leitura.md` (A1 a A3).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1) Nesta volta, o A1, o A2 e o A3 do review.
- (E4) (E3.1) A1: consulta MySQL sem nenhuma linha (o `mysql --batch` não imprime cabeçalho) tem de sair como "0 linhas" no arquivo, não como recusa nem rc 1; a recusa fica só para cabeçalho errado ou valor fora do tipo; teste com saída vazia. A2: a verificação de que a saída fica fora do repositório resolve links (`pwd -P` ou equivalente); teste com link. A3: levar para a branch, sem mudar o texto, as análises que as consultas citam (`docs/analises/099-revisao-campos.md`, `docs/analises/098-discovery.md`, `docs/analises/099-dado-real-operacional.md`, copiadas de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/`), num commit só de documentação. Rodar só o teste do script e o shellcheck. Commits com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar nada contra a base real nem abrir `.env*`.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh, docs/analises/099-revisao-campos.md, docs/analises/098-discovery.md, docs/analises/099-dado-real-operacional.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/chore/consultas-leitura-098-099` · espera: contém 'Cartão: K-275'

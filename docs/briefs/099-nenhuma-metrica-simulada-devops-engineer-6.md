## Objetivo
Volta 3 do comando de consultas só de leitura (pedido 099, E3.1): o QA aprovou com um bug baixo e dois testes que faltam, e o bug pode mostrar um pedaço do `.env` na tela. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `chore/consultas-leitura-098-099`, head 790fb801 (código dcfa78f3).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/099-consultas-leitura.md` (A1 a A3 e a observação sobre `set_config` e `pg_read_file`).

## Entregar
- "E3.1 (devops-engineer): um comando único para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), que grava a saída num arquivo sem dado de pessoa, na branch chore/consultas-leitura-098-099, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E3.1) Nesta volta, o A1 a A3 do QA.
- (E4) (E3.1) A1: um `.env` malformado não pode imprimir nada dele (nem a primeira palavra da linha): silenciar o stderr da leitura do `.env` e sair por `falhar` com a categoria `env`; teste com `.env` malformado provando que nenhuma palavra dele aparece na tela. A2: teste de `\gexec` sem `INTO` (prova a guarda da barra invertida). A3: teste de `SELECT 1; SELECT 2;` (prova o limite de um único `;`). Também recusar na lista do permitido as funções que mudam a sessão ou leem arquivo do servidor (`set_config`, `pg_read_file`, `pg_read_binary_file`, `lo_import`, `dblink`), com teste. Rodar só o teste do script e o shellcheck. Commit com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/chore/consultas-leitura-098-099` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Nada contra a base real nem `.env*` de verdade.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: scripts/consultas-leitura-098-099.sh, scripts/consultas-leitura-098-099.test.sh

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/chore/consultas-leitura-098-099` · espera: contém 'Cartão: K-275'

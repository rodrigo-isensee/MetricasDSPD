---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 0fb2e35aaefb3eada16ab83a96768b74376f70b6
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: recomendados da produção da VM (K-388, E7.336, review E7.338, revalidação E7.344)

## Revalidação no head 0fb2e35a
Delta lido: `forge-check parecer delta docs/reviews/105-vm-recomendados.md`, intervalo `3c8267ae..0fb2e35a`, domínio código e testes: `deploy/sql/00_papeis_e_banco.sql`, `scripts/gerar-sql-migracoes.mjs` e `server/tests/papeis-sql-senhas-log.test.ts` (novo). Do lado de fora do domínio, li só o trecho de `docs/devops/105-implantacao-vm.md` que o A3 aponta (commit `0fb2e35a`).

- **A1 corrigido.** O gerador emite `\set ON_ERROR_STOP on` e os três `SET` de log (`log_statement = 'none'`, `log_min_duration_statement = -1`, `log_min_error_statement = panic`) logo depois do cabeçalho, antes do `\getenv` e de qualquer `SELECT` com `:'pwd_x'`; o `SET` antigo, depois da conferência, saiu. O `00_papeis_e_banco.sql` versionado é a saída do gerador (rodar a fase de arquivos não mudou o `00`). A sonda S4 repete a S1 com o arquivo inteiro e o log no máximo: nenhuma senha no log do servidor, inclusive no erro.
- **btrim:** senha só de espaços é recusada como vazia, com a mensagem nomeando a variável (S4: `PWD_APONTAMENTO='   '` dá rc=3 antes do primeiro `CREATE`).
- **A3 corrigido.** Todos os `docker compose` do roteiro usam `-f docker-compose.prod.yml` (nenhum ficou sem `-f`); o `export COMPOSE_FILE` saiu e o `COMPOSE_ENV_FILES` ficou. O rollback ganhou o passo 0 (parar os quatro `.timer`, que existem em `deploy/systemd/`, e esperar a coleta em curso) e o passo 4 religa os timers. A nota de redeploy (sem `systemctl start` manual com os timers ligados) está certa.
- **Teste novo (`server/tests/papeis-sql-senhas-log.test.ts`), a pergunta de escopo:** está certo e pertence a este item. É o teste que o A2 sugeriu, trava a regressão do A1 e confere o `btrim`. Rodei-o: 7 passam. Mutante: com o `SET log_min_error_statement` movido para depois da conferência, dois testes falham (a ordem e "nenhum SELECT, DO ou CREATE antes dos SET"). Ele lê o SQL gerado e não executa o `psql`; o comportamento ficou com as sondas. O pedido deveria ter declarado o arquivo; é falha de declaração, não de entrega.
- **A2** segue como recomendado só na parte que sobra: o ramo de falha "ausente/vazia" não tem teste que execute o `psql` (as sondas S2, S3 e S4 provam). Não bloqueia.
- **Ferramentas e CI:** sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head. O brief não traz PQ do autor para citar. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- **Segurança e pipeline:** o `security-engineer` e o `devops-engineer` revalidam em paralelo; não refaço os pareceres deles.

## Escopo lido (primeira rodada, 3c8267ae)
`git diff d999ee29..3c8267ae` (Base-sha da develop com o #502): `deploy/sql/00_papeis_e_banco.sql`, `docker-compose.prod.yml`, `docs/devops/105-implantacao-vm.md`, `scripts/gerar-sql-migracoes.mjs`. Código e teste, somando a volta: gerador (16 linhas) e o teste novo (37), dentro do teto M14.

Conferido e correto na primeira rodada: `restart: unless-stopped` em `api`, `worker` e `web`; teto de log `x-log` (json-file, 5 x 10 MB) nos cinco serviços; rollback em ordem (banco antes do código); `verify-full` com CA no `db:migrate` e no backup fora do Docker; pós-deploy conferindo também o painel; conferência das cinco senhas com `\if` antes do primeiro `CREATE`, nomeando a que falta (rc=3).

## Sondas
- S1 · trecho de `00_papeis_e_banco.sql` (em 3c8267ae) até antes do `SET`, com `PGOPTIONS='-c log_statement=all'` e `PWD_MIGRADOR=SONDA_K388_MIG` · espera: senha fora do log do servidor · obtido: `LOG:  statement: SELECT ('SONDA_K388_MIG' = '') AS pwd_migrador_vazia` no `docker logs`
- S2 · arquivo inteiro (3c8267ae) sem `PWD_REF` · espera: rc=3, mensagem nomeando PWD_REF, nada criado · obtido: `ERROR:  falta a variável de ambiente PWD_REF; nada foi criado`, rc=3
- S3 · arquivo inteiro (3c8267ae) com `PWD_COLETOR=` (vazia) · espera: rc=3, mensagem nomeando PWD_COLETOR · obtido: `ERROR:  PWD_COLETOR está vazia; nada foi criado`, rc=3
- S4 · `00` inteiro (0fb2e35a), `log_statement=all`, `log_min_duration_statement=0`, senhas `SONDA_R2_*`, `PWD_APONTAMENTO='   '` · espera: rc=3, nenhuma senha no log · obtido: rc=3 nomeando PWD_APONTAMENTO; `grep -c SONDA_R2` no `docker logs` = 0

## Achados
- A1 (bloqueante) scripts/gerar-sql-migracoes.mjs:54 · o `SELECT (:'pwd_x' = '')` mandava cada senha ao servidor antes do `SET log_statement = 'none'` (S1). Corrigido em 0fb2e35a (S4).
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:39 · a guarda ausente/vazia não tem teste que execute o ramo de falha; o teste novo trava a ordem dos `SET` e o `btrim`, e as sondas provam o resto. Fica para quando houver teste com `psql` no CI.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:245 · o rollback dependia do `export COMPOSE_FILE`. Corrigido em 0fb2e35a (`-f docker-compose.prod.yml` em todos os comandos; timers parados e religados).

## Parecer
Aprovado no head `0fb2e35aaefb3eada16ab83a96768b74376f70b6`. A1 e A3 corrigidos; o teste novo está certo e no escopo do item.

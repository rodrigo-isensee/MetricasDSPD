---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: aa8b6f20588c354d83e3eb559f9b554615afc2c7
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.2)

Propósito: parecer de segurança do `pnpm run consultas:098-099`, que o dono roda na demo dele contra o PostgreSQL da demo e o MySQL do Acelerato. Revisão estática do diff `c7c3e092..aa8b6f20` (35 arquivos, +689 -1): `scripts/consultas-leitura-098-099.sh`, o teste, os 31 `.sql` em `scripts/sql/consultas-098-099/`, `package.json` e `docs/engineering/demo-dado-real.md`. Nada rodou contra base real e nenhum `.env*` foi aberto. Rodado só o teste do script (29 casos verdes) e `shellcheck` (limpo).

## Gatilhos
- Segredos e configuração: lê o `.env` (senha do `dspd_coletor`, credencial e certificado do MySQL do Acelerato).
- Banco real: leitura nas duas fontes, com papel que tem escrita no PostgreSQL.
- Dado de pessoa (LGPD, regra inviolável do `CLAUDE.md`): a saída vai a um arquivo que o dono cola em análises.
- Controle que analisa entrada: a recusa de escrita e a guarda de colunas.

## Resultado por ponto do brief

**1. Nada do `.env` impresso nem no argv: conforme.**
- A conferência de variáveis só usa `grep -Eq` e imprime os nomes (`scripts/consultas-leitura-098-099.sh:49-52`); o `falhar` cita o caminho do arquivo, nunca valor (`:44`). A impressão do certificado é comparada sem eco (`:62-64`, `openssl` com `2>/dev/null`).
- PostgreSQL: `PGPASSWORD` vai só no ambiente do `docker compose` e entra no contêiner por `-e PGPASSWORD` sem valor (`:113`); o argv tem só `PGOPTIONS` e o `-U`. MySQL: a senha vai num arquivo de opções (`:66-76`) e o argv tem só `--defaults-extra-file=<caminho>` (`:120`).
- O `set -a` (`:55`) exporta todo o `.env` para os filhos (docker, mysql, awk), igual ao `demo-dado-real.sh`; fica no ambiente do processo (legível só pelo próprio usuário), nunca no argv. Conforme.
- Texto de erro do driver vai para `/dev/null` (`:152`); só o código de saída chega à tela e ao arquivo. O teste prova os três (casos "senha só por ambiente", "senha só no arquivo 0600", "texto de erro do driver nunca impresso").

**2. Senha por ambiente ou arquivo 0600 apagado: conforme.** `umask 077` antes do `mktemp -d` (`:39-40`), então a pasta é 0700 e o arquivo nasce 0600 (o `chmod 600` em `:76` é redundante e inofensivo); `trap 'rm -rf "$TMP"' EXIT` (`:41`) apaga no fim, inclusive em falha e em Ctrl+C. Só um `kill -9` deixaria o arquivo, ainda 0600 dentro de pasta 0700 do próprio usuário: residual informativo.
- Observação (sem achado): no contêiner oficial do `postgres`, a conexão por socket local costuma ser `trust`; a senha não é o controle ali, e quem tem o docker do host já é superusuário do banco. O controle efetivo é o `-U dspd_coletor` fixo no script.

**3. Só leitura nos dois bancos.**
- **MySQL: garantido no servidor.** A conta só tem `SELECT` e `SHOW VIEW` (ADR 0023 §1 item 2, §8); a sessão e a transação `READ ONLY` com `ROLLBACK` (`:118-119`) são a segunda camada. Conforme.
- **PostgreSQL: não garantido pelo privilégio.** O `dspd_coletor` tem `INSERT` em `stg_`, `evt_` e `ctl_`, `INSERT, UPDATE, DELETE` nas projeções e `DELETE` no `outbox` (`server/src/plataforma/db/grants.ts:100-107`, `:132-133`). A sessão `default_transaction_read_only=on` e o `BEGIN READ ONLY` (`:112-114`) protegem contra **erro**, mas o próprio texto do `.sql` os desliga: `SET TRANSACTION READ WRITE` como primeira instrução da transação, ou `COMMIT;` seguido de `SET default_transaction_read_only = off`. Nenhuma dessas palavras está na recusa (A2).
- **Recomendação sobre o papel:** para esta demanda, `dspd_coletor` com sessão e transação `READ ONLY` basta, **porque** os 31 `.sql` desta versão foram lidos um a um (abaixo) e a recusa passa a ser uma lista de permissão (A1). O `dspd_api` não serve (não lê `stg_`, que 8 consultas usam). Se o comando virar rotina ou ganhar consultas novas sem esta revisão, criar um papel `dspd_leitura` só com `SELECT` e o GRANT por coluna sem `COLUNAS_PESSOA` (decisão do arquiteto, fora deste PR): aí o banco garante a leitura e a guarda de pessoa, e o script vira defesa em profundidade.
- **Os 31 `.sql` versionados (lidos):** todos começam por `SELECT` ou `WITH` depois dos comentários, têm exatamente um `;` (o final), nenhuma barra invertida (meta-comando do `psql` ou do cliente `mysql`), nenhum `SET`, `COMMIT`, `DO`, `EXECUTE`, `LOCK`, `FOR UPDATE`, `nextval`/`setval`, `pg_*`, `lo_*`, `dblink`, `SLEEP`, `BENCHMARK` nem `LOAD_FILE` (as ocorrências da busca estão só em comentários). Nenhum seleciona coluna de pessoa: das `stg_` saem só `priority`, `deadline`, `prioridade`, `link_type` e o booleano `troca_responsavel`, sempre em contagem.

**4. Recusa de escrita e DDL antes de rodar: funciona para o que lista, mas é lista negra e tem desvio (A1).** O `grep` sobre o texto sem `--…` (`:148`) pega as palavras listadas (o teste prova `DELETE` sem chamar o banco), mas deixam passar, conferido com o mesmo `sed` e o mesmo `grep` do script sobre texto literal, sem executar o script (S1 a S7): instrução depois de um `'--'` dentro de literal ou de `1--1` no MySQL (o `sed` corta o resto da linha que o banco executa); `SET TRANSACTION READ WRITE`; `\gexec` do `psql` com o comando montado por concatenação; `DO $$ … EXECUTE 'DEL'||'ETE …' $$`; e os comandos do cliente `mysql` `system id` e `\! id`, que executam no **host do dono**, fora do banco e fora de qualquer `READ ONLY`. Caminho de ataque: um `.sql` novo (de um agente ou de um PR) ou uma pasta apontada por `CONSULTAS_SQL_DIR`; nesta versão nenhum `.sql` faz isso, por isso não bloqueia.

**5. Guarda de colunas: correta no que promete, com limite documentado.**
- O cabeçalho precisa ser exatamente o declarado, a lista negra de nomes vale para a declaração e para a saída, e cada valor cumpre o tipo (`:81-107`). Falha recusa a consulta inteira e o motivo cita coluna e linha, nunca o valor (provado no teste com `Maria Silva` e `joao@empresa.com`).
- Saída do `psql -A` com tabulação ou quebra de linha dentro de um valor muda o número de campos e é recusada (falha fechada); o `--batch` do `mysql` já escapa esses caracteres.
- **Limite:** a declaração `-- COLUNAS:` é do mesmo autor do `.sql`, então a guarda protege contra **acidente** (consulta que devolve coluna inesperada), não contra `.sql` mal-intencionado (uma `usuarioKey` com apelido `chave:numero` passaria). E o tipo `dominio` (`:103`) aceita qualquer texto até 120 caracteres sem `@`: nome de pessoa ou de cliente dentro de nome de equipe, workflow, tipo ou campo passa. As consultas mais expostas são C-AC1 (tipos de todas as organizações), C-AC4 (equipes de todo o Acelerato) e C-BM1/C-BM3 (nomes de workflow). O documento já manda o dono conferir a saída antes de colar (`docs/engineering/demo-dado-real.md`, "O que a guarda não pega") e o cabeçalho do arquivo repete o aviso (`:128`). Com a leitura dos 31 `.sql`, aceito sem cartão.

**6. Certificado do MySQL: falha fechada, sem caminho para texto puro; recomendada a fixação de verdade (A3).**
- O script confere que o **arquivo** local tem a impressão fixada (`:61-64`) e passa esse arquivo como `ssl-ca` com `ssl-verify-server-cert` (`:73-74`). Isso não fixa o certificado **recebido** do servidor, como faz o `checkServerIdentity` do driver Node (`server/src/modulos/acelerato/tls.ts:55-58`); a confiança passa a ser a validação de cadeia e de nome do cliente.
- Não há falha aberta: o cliente na estação é o MariaDB 11.8 (`mysql --help` lista `ssl-verify-server-cert` padrão `TRUE`, `local-infile` padrão `FALSE`), e a verificação acontece antes do envio da senha. Mas o certificado do Acelerato é autogerado (ADR 0023 §3: emitido por uma CA autogerada que não temos, sem o nome do endereço), então a validação de cadeia contra a folha e a de nome contra o IP devem **falhar**, e as 10 consultas MySQL sairão `falhou`. O risco real é o contorno: o servidor aceita texto puro (`require_secure_transport = OFF`), e tirar `ssl-ca` ou `ssl-verify-server-cert` "para funcionar" manda a senha da conta compartilhada sem verificação.
- O mesmo cliente lista `--ssl-fp` e `--ssl-fplist` (impressão do certificado do servidor): é a fixação equivalente à do Node.

**7. Arquivo de saída fora do repositório: não garantido (A4).** A saída vai para `INIT_CWD` (`:20`, `:125`). O comando principal documentado, `pnpm run consultas:098-099`, chamado da raiz, grava em `<raiz>/consultas-098-099-<data>.txt`; o script só avisa (`:130`) e o `.gitignore` não cobre o padrão (só `.env` e `.env.*`). O arquivo nasce 0600 (`umask 077`). Caminho: o arquivo (com o limite da guarda do item 5) entra num `git add -A` ou `git add .` e vai ao histórico, que não se apaga.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; nenhum rodou. Sem dependência nova (`pnpm-lock.yaml` sem diff); o `package.json` só ganha um script e um teste no `test:trava`.

## Achados
- A1 (recomendado) scripts/consultas-leitura-098-099.sh:148 · a recusa é lista negra e deixa passar SET, COMMIT, DO/EXECUTE, \gexec, '--' em literal e os comandos system e \! do cliente mysql (shell no host do dono); trocar por lista de permissão e usar mysql --sandbox. Dono: devops-engineer.
- A2 (recomendado) scripts/consultas-leitura-098-099.sh:113 · dspd_coletor tem escrita e a sessão e a transação READ ONLY são desligáveis pelo texto do .sql; com A1 e os 31 .sql lidos basta; papel dspd_leitura só SELECT se o comando virar rotina. Dono: software-architect.
- A3 (recomendado) scripts/consultas-leitura-098-099.sh:73 · ssl-ca com a folha autogerada e conferência de nome devem falhar (fecha, mas convida a tirar o TLS); usar ssl-fp com a impressão fixada, --defaults-file no lugar de --defaults-extra-file e documentar nunca desligar a verificação. Dono: devops-engineer.
- A4 (recomendado) scripts/consultas-leitura-098-099.sh:125 · o comando documentado, rodado da raiz, grava a saída dentro do repositório e o .gitignore não cobre consultas-098-099-*.txt; incluir o padrão no .gitignore. Dono: devops-engineer.

### Detalhe das correções
- **A1:** depois de tirar as linhas inteiras de comentário (`^[[:space:]]*--`), recusar se: o primeiro token não for `SELECT` ou `WITH`; houver mais de um `;` ou `;` fora do fim; houver qualquer `\`; aparecer, como palavra, qualquer de `insert update delete drop alter create truncate grant revoke copy call merge replace set reset commit rollback begin start do execute prepare lock vacuum analyze cluster reindex refresh listen notify discard load handler system source tee pager outfile dumpfile load_file sleep benchmark pg_sleep nextval setval dblink`; e acrescentar `--sandbox` ao `mysql` (`:120`). Um caso no teste para cada desvio de S1 a S7 e o caso feliz com os 31 `.sql` (corpus de legítimos), que precisam continuar passando.
- **A2:** nada a mudar no script agora. O papel `dspd_leitura` (só `SELECT`, `GRANT` por coluna sem `COLUNAS_PESSOA`, `USAGE` nos três schemas) entra em `PAPEIS` de `grants.ts` e no `01-databases-papeis.sh` se o dono quiser o comando como rotina.
- **A3:** no arquivo de opções, `ssl-fp=<impressão normalizada>` (a `FIXADA` de `:62`) no lugar de `ssl-ca` mais `ssl-verify-server-cert`, mantendo o TLS obrigatório; confirmar na primeira execução que o Connector/C aceita a impressão SHA-256 (se não aceitar, a conexão falha, não abre). `--defaults-file` em vez de `--defaults-extra-file` (`:120`), para um `~/.my.cnf` do dono não religar `local-infile` nem desligar a verificação. Em `demo-dado-real.md`: se o MySQL falhar por TLS, não tirar a verificação; levar ao time (alternativa: rodar as consultas MySQL pelo driver Node com `opcoesSsl`).
- **A4:** `consultas-098-099-*.txt` no `.gitignore`. Opcional: recusar gravar dentro do repositório em vez de só avisar.

## Sondas
- S1 · `SELECT '--'; DELETE FROM t;` · espera: recusa · obtido: passa
- S2 · `SELECT 1--1; DELETE FROM t;` · espera: recusa · obtido: passa
- S3 · `SET TRANSACTION READ WRITE;` · espera: recusa · obtido: passa
- S4 · `SELECT 'INS'||'ERT INTO t VALUES (1)' \gexec` · espera: recusa · obtido: passa
- S5 · `system id` · espera: recusa · obtido: passa
- S6 · `\! id` · espera: recusa · obtido: passa
- S7 · `DO $$BEGIN EXECUTE 'DEL'||'ETE FROM t'; END$$;` · espera: recusa · obtido: passa

## Plano em cartões
Nenhum bloqueante: o comando, nesta versão e com estes 31 `.sql`, pode ir ao dono. A1, A3 e A4 ao devops-engineer, de preferência nesta branch antes de o dono rodar (A3 provavelmente decide se as consultas MySQL funcionam). A2 ao software-architect, só se o comando virar rotina.

## Riscos aceitos
Nenhum.

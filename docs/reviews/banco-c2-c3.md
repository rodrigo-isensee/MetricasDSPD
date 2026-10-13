---
contrato: 0
---
# Code review: banco C2 (backup, restauração, trava do down) e C3 (timeouts)

Revisor: tech-lead · 2026-10-12 · Branch `fix/banco-backup-noturno` (d9b9554, 6e81a22, 37d41d0, 35fff96, ae889da, d0fbfad) · Referência: `docs/architecture/auditoria-banco.md` C2/C3 e a decisão do usuário (backup 03:30 BRT fora do projeto, 7 dias; restauração verificada aos domingos 04:30 e na CI; nada de dia; roteiro de agendamento para o usuário).

Verificação: `flock /tmp/metricas-pesado.lock pnpm --filter ./server run pronto` verde (273 testes passam, 54 pulados por serem de Postgres; cobertura 100% em statements, branches, funções e linhas). `bash -n` nos três scripts ok. Não rodei `timeouts.pg.test.ts` (exige `PG_TESTE_URL`; fica para o QA) nem o workflow de restauração (só roda no GitHub).

## Parecer: ajustes necessários (0 bloqueantes, 2 importantes, 5 menores)

Aderência ao pedido: o desenho cobre o que a auditoria e o usuário pediram. Nenhum achado impede o uso hoje, mas os dois importantes devem ser corrigidos antes do PR.

## Importantes

1. **`scripts/db-backup.sh:94` — `grep -q` com `pipefail` falha o backup por SIGPIPE (latente).** `pg pg_restore --list < dump | grep -q 'TABLE'`: o `grep -q` sai no primeiro acerto, o `pg_restore` leva SIGPIPE e o pipeline devolve 141 sob `set -o pipefail`. Reproduzi o padrão com `seq 1 200000 | grep -q 1` (141 nas três tentativas). Hoje a saída do `--list` tem 36 KB, abaixo do buffer de pipe de 64 KB, então passa; ao crescer (mais migrações, índices, tabelas) o backup passa a "falhar" sem motivo, não confirma `ultimo-backup-ok` e trava o `down`. Falha segura, mas intermitente e confusa. Sugestão: `LISTA="$(pg pg_restore --list < "$BASE.dump.tmp")"; grep -q 'TABLE' <<<"$LISTA"` (ou `grep -c`, que lê tudo). Revisar o mesmo padrão em qualquer outro `| grep -q` com `pipefail` (os `grep -q` de `db-restaurar-verificada.sh:159` leem de `echo`, que é pequeno, mas vale o mesmo cuidado).
2. **`server/src/plataforma/db/pool.ts:349` e `:352` — os ouvintes de `error` engolem a falha sem rastro.** `() => undefined` evita derrubar o processo, mas uma queda de conexão deixa de aparecer em qualquer lugar (nem log, nem contador). O critério era "não engolem falhas silenciosamente". Sugestão: receber um logger opcional em `OpcoesPool` (o projeto usa pino/Fastify) e registrar em nível `warn` com o `application_name` do pool e a mensagem do erro, sem repassar a string de conexão; o teste de `plataforma.test.ts` passa a verificar que o log foi chamado.

## Menores (recomendado)

3. **`docs/engineering/operacao-banco.md` (exemplos com `/mnt/d/...`) e `scripts/db-backup.sh:78` — permissões em NTFS.** `umask 077` produz 0600/0700 em ext4, mas `/mnt/d` (drvfs) não honra permissões POSIX: o dump com dado de pessoa fica legível por qualquer usuário Windows da máquina. Registrar no guia que o destino deve ser disco cifrado (BitLocker) ou diretório ext4 do WSL, e que o script não garante o modo fora do ext4. Sugestão extra: `*.dump` e `ultimo-backup-ok` no `.gitignore` como segunda barreira (hoje só `exigir_dir_fora_do_repo`).
4. **`server/src/plataforma/db/pool.ts:340` — `new URL(url)` pode lançar.** URLs aceitas pelo `pg` (socket Unix, `%` mal formado em `decodeURIComponent`) fazem `criarPool` estourar antes de conectar, o que antes não acontecia. Embrulhar com fallback para `dspd-app` ou usar `aplicacao` explícito nesses casos.
5. **`server/src/plataforma/db/migrar.ts:294` — `singleTransaction: true` muda o comportamento.** Era uma transação por migração; agora um `up` com várias migrações é atômico (tudo ou nada). É bom e está documentado, mas não está no cartão: citar a decisão na descrição do PR e confirmar que nenhuma migração futura precisa de `CREATE INDEX CONCURRENTLY` (hoje não há; grep em `server/migrations` vazio).
6. **`scripts/db-restaurar-verificada.sh:42` e `:176` — pontas soltas.** (a) `${PGPASSWORD:-$DSPD_PWD_MIGRADOR}` com `set -u` aborta de forma obscura se a senha vier só de `.pgpass`, e a senha entra na URL sem codificação (quebra com `@`, `/`, `:`); (b) o arquivo `VIVO` de `mktemp` não é removido quando `falhar` sai dentro de `comparar` (só contém contagens e colunas, sem dado sensível). Usar `trap` único para ambos os temporários e um `encodeURIComponent` (ou exigir senha só de caracteres seguros no guia).
7. **`.github/workflows/restauracao.yml:13` e `docs/engineering/operacao-banco.md` (seção CI) — frequência.** A decisão do usuário foi "domingo 04:30 e na CI"; a CI roda mensal (dia 1) e só dispara a partir do branch padrão (`main`), ou seja, só depois do release. Está coerente com o plano original da auditoria ("mensal ou `workflow_dispatch`"), mas confirmar com o usuário se mensal basta, e registrar no PR que o agendamento só vale após a promoção. O workflow nunca foi executado: rodar uma vez por `workflow_dispatch` na branch antes de contar com ele.

## Verificações de segurança (skill cyber-security): sem achado

- **Senhas:** nenhuma na linha de comando nem versionada nos scripts. `.env` e `PGPASSWORD`/`.pgpass` só por ambiente; no modo contêiner `docker exec -e PGPASSWORD` (sem valor) herda do ambiente, então não aparece em `argv`. As senhas do workflow (`postgres_ci`, `migrador_dev` etc.) são as mesmas do `ci.yml`, de contêiner descartável ligado em `127.0.0.1`: aceitável. `pg_dumpall --no-role-passwords`: correto.
- **Permissões do backup:** `umask 077` antes de criar diretório e arquivos; escrita em `.tmp` e `mv` só após verificação; `ultimo-backup-ok` só depois de tudo e por último. Ressalva no item 3.
- **`GRANT CREATE, CONNECT ON DATABASE ... TO dspd_migrador`** (restauração): idêntico ao concedido no init (`docker/postgres/init/01-databases-papeis.sh:23-24` dá CONNECT a todos os papéis e CREATE só ao migrador). Não amplia privilégio; aplica-se só ao banco descartável `metricas_restauracao_*`, removido ao final. Nomes do banco vêm de `date`, sem entrada externa (sem injeção em `$ALVO`).
- **Trava do `down`/`redo`:** só o CLI é o caminho (`migrate` em `package.json`/`scripts/db.sh`); exige `DSPD_PERMITIR_DOWN` exatamente `1` e o arquivo do backup do dia de Brasília; recusa acontece antes de abrir conexão (teste de CLI confere que `migrar` não é chamado). Contorno acidental improvável: `DSPD_SCHEMA_PREFIXO` não vazio só atinge schemas de teste. Observação (sem ação): se alguém exportar `DSPD_PERMITIR_DOWN=1` no `.env`, a primeira metade da trava fica permanente; o guia já manda defini-la só no comando.
- **Timeouts:** 30 s (statement), 5 s (lock), 30 s (idle in transaction), 5 s (conexão): razoáveis e sobrescrevíveis por pool; testes de Postgres provam o efeito no servidor (55P03, derrubada da sessão ociosa, pool esgotado).
- **Workflow:** `permissions: contents: read`, actions fixadas por SHA (mesmos SHAs do `ci.yml`), `timeout-minutes: 20`, só dado mock, sem `pull_request`. Imagem `postgres:17` por tag, como no restante do CI.
- **Testes que falham se a regra quebrar:** trava-down (fronteira UTC/Brasília, `redo`, prefixo, confirmação ausente/antiga), CLI (recusa antes de migrar), `destruidos` do dublê para `ROLLBACK` e `unlock`, `options` do `migrar` (`lock_timeout=5s`, `singleTransaction`), `TIMEOUTS_PADRAO` no `criarPool`. Cobertura 100%.

## Commits

Granularidade boa (6 commits coerentes). Não verifiquei um a um que cada commit compila isolado; o conjunto passa no `pronto`.

## Rodada 2 — correções

| Achado | Commit | Resolução |
|---|---|---|
| 1 (SIGPIPE) | fb9c5a6 | Lista do `pg_restore --list` capturada em variável antes do `grep -q`; teste `backup-script.test.ts` com lista de ~700 KB (falha no script antigo, passa no novo). Os `grep -q` de `db-restaurar-verificada.sh` leem de `echo` pequeno, sem pipe de processo: mantidos. |
| 2 (ouvintes de `error`) | 7129a20 | `OpcoesPool.log` opcional; `warn` com `aplicacao` e a mensagem do erro (nunca URL/senha); `api` e `worker` passam o pino. O pool descarta o cliente ocioso. Testes. |
| 3 (NTFS) | f703706 | Aviso no guia (ext4 ou disco cifrado), comentário no script, `*.dump` e `ultimo-backup-ok` no `.gitignore`. |
| 4 (`new URL`) | 7129a20 | `aplicacaoDaUrl` com fallback `dspd-app`; testes. |
| 5 (`singleTransaction`) | f703706 | Mantido; decisão documentada no código e teste que proíbe `CONCURRENTLY` nas migrações. Citar no PR. |
| 6 (restauração) | eabce33 | Senha codificada (`urlenc`), `${...:-}` com `set -u` (URL sem senha se vier só de `.pgpass`), `trap` único para os dois temporários. |
| 7 (CI) | f703706 | Guia documenta que o `schedule` só vale a partir da `main` e que se roda por `workflow_dispatch`. Frequência mensal segue pendente de confirmação do usuário; o workflow ainda não foi executado. |

Verificação: `pronto` verde (279 testes, cobertura 100%); `timeouts.pg.test.ts` 7/7 contra Postgres em banco temporário (removido).

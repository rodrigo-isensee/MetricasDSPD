# Operação do banco: backup, restauração e agendamento

Versão 1 · 2026-10-12 · Mantido pelo node-backend e pelo tech-lead. Origem: cartões C2 e C3 de [`auditoria-banco.md`](../architecture/auditoria-banco.md). Público: quem opera a máquina local (WSL + Docker Compose).

## Decisão do usuário

- Backup diário com `pg_dump` às **03:30 (Brasília)**, para uma pasta **fora do projeto**, guardando os **últimos 7 dias**.
- Teste de restauração automático **aos domingos 04:30**.
- **Nada roda de dia.**
- Os dumps contêm dado de pessoa (staging): nunca no repositório, nunca em nuvem sem cifra (H-7 em [`alinhamentos/2026-10-12-homologacao.md`](../alinhamentos/2026-10-12-homologacao.md)).

## Variáveis

| Variável | Uso | Padrão |
|---|---|---|
| `DSPD_BACKUP_DIR` | Pasta de destino. **Obrigatória**; os scripts recusam uma pasta dentro do repositório | nenhum |
| `DSPD_BACKUP_RETENCAO` | Quantos conjuntos guardar | 7 |
| `DSPD_PG_CONTAINER` | Nome do contêiner (`metricasdspd-postgres-1`): usa o `pg_dump`/`psql` de dentro dele, útil quando o host não tem as ferramentas do PostgreSQL 17 | vazio (binários do host) |
| `PGHOST` `PGPORT` `PGUSER` `PGDATABASE` | Conexão | `127.0.0.1`, `5432`, `dspd_migrador`, `metricas` |
| `PGPASSFILE` ou `PGPASSWORD` | Senha, só por arquivo `.pgpass` (modo 0600) ou ambiente. Sem nenhum dos dois, o script usa `DSPD_PWD_MIGRADOR` do `.env` | `.env` |
| `PGUSER_ADMIN`, `PGPASSWORD_ADMIN` | Só na restauração (criar o banco novo). Sem `PGPASSWORD_ADMIN`, usa `POSTGRES_PASSWORD` do `.env` | `postgres` |

Nenhuma senha vai na linha de comando; no modo contêiner o `docker exec -e PGPASSWORD` herda o valor do ambiente.

## Backup (`scripts/db-backup.sh`)

```bash
DSPD_BACKUP_DIR=/mnt/d/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-backup.sh
```

Grava na pasta: `metricas-AAAAMMDD-HHMMSS.dump` (`pg_dump -Fc`), `.inventario.txt` (contagens por tabela e colunas no instante do backup), `roles-AAAAMMDD-HHMMSS.sql` (`pg_dumpall --roles-only --no-role-passwords`; as senhas dos papéis ficam só no `.env`) e `ultimo-backup-ok` (data de Brasília). O dump é relido com `pg_restore --list` antes de qualquer confirmação; falha deixa o arquivo de confirmação como estava. A rotação mantém os 7 conjuntos mais recentes, por nome.

**Permissões e disco:** o script usa `umask 077` (arquivos 0600, pasta 0700), que só vale em sistemas de arquivos POSIX como o ext4 do WSL. Em `/mnt/d` (NTFS/drvfs) o modo **não é honrado**: o dump, que tem dado de pessoa, fica legível por qualquer usuário Windows da máquina. Use um diretório ext4 do WSL ou um disco cifrado (BitLocker). `*.dump` e `ultimo-backup-ok` estão no `.gitignore` como segunda barreira.

## Restauração verificada (`scripts/db-restaurar-verificada.sh`)

```bash
DSPD_BACKUP_DIR=/mnt/d/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-restaurar-verificada.sh [arquivo.dump]
```

Restaura o dump mais recente (ou o indicado) num banco novo `metricas_restauracao_*`, roda `migrate up` (exige **0 migração aplicada**), compara contagens e colunas com o inventário do backup e remove o banco novo ao final. `DSPD_COMPARAR_COM_VIVO=1` compara também com o banco vivo (a CI usa, porque semeia e faz o backup em seguida). O banco `metricas` nunca é alterado. Qualquer divergência sai com código diferente de 0.

Recuperação de desastre de verdade: criar o servidor, aplicar `roles-*.sql`, definir as senhas dos papéis a partir do `.env`, criar o banco e `pg_restore -d metricas` com o dump.

## Trava do `down` e do `redo`

`pnpm run db:migrate down` e `redo` apagam tabelas (o staging não tem outra cópia). Sem `DSPD_SCHEMA_PREFIXO` (schemas reais), o CLI **recusa**, salvo se:

1. `DSPD_PERMITIR_DOWN=1` estiver definido **e**
2. `$DSPD_BACKUP_DIR/ultimo-backup-ok` trouxer a data de hoje (Brasília), isto é, o backup de hoje terminou bem.

Com prefixo de teste (testes de banco) nada muda. Regra em `server/src/plataforma/db/trava-down.ts`.

## Agendamento (para o usuário instalar; este repositório não instala nada)

O agendamento é do computador, não da CI. Duas opções; use uma. As duas exigem que o Docker/WSL esteja de pé na hora. Os horários abaixo são os do relógio da máquina (Brasília).

### A. Agendador de Tarefas do Windows (recomendado: acorda a máquina)

No PowerShell, ajuste a distribuição (`wsl -l`), o caminho do projeto e a pasta de destino:

```powershell
$cmd = 'cd /home/<usuario>/MetricasDSPD && docker compose up -d --wait postgres && DSPD_BACKUP_DIR=/mnt/d/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-backup.sh >> /mnt/d/backups-metricas/backup.log 2>&1'
$acao = New-ScheduledTaskAction -Execute 'wsl.exe' -Argument "-d Ubuntu -- bash -lc `"$cmd`""
$gatilho = New-ScheduledTaskTrigger -Daily -At 3:30am
$cfg = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1)
Register-ScheduledTask -TaskName 'DSPD backup noturno' -Action $acao -Trigger $gatilho -Settings $cfg
```

Para a restauração de domingo, repita trocando `db-backup.sh` por `db-restaurar-verificada.sh`, `-Weekly -DaysOfWeek Sunday -At 4:30am` e o nome da tarefa. Para remover: `Unregister-ScheduledTask -TaskName 'DSPD backup noturno'`.

### B. cron dentro do WSL (precisa de `systemd=true` em `/etc/wsl.conf` e do WSL aberto)

```cron
30 3 * * *  cd /home/<usuario>/MetricasDSPD && DSPD_BACKUP_DIR=/mnt/d/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-backup.sh >> /mnt/d/backups-metricas/backup.log 2>&1
30 4 * * 0  cd /home/<usuario>/MetricasDSPD && DSPD_BACKUP_DIR=/mnt/d/backups-metricas DSPD_PG_CONTAINER=metricasdspd-postgres-1 bash scripts/db-restaurar-verificada.sh >> /mnt/d/backups-metricas/restauracao.log 2>&1
```

`crontab -e` para instalar. Fuso: o cron do WSL usa o fuso do Linux; confira com `date` (se for UTC, use 06:30 e 07:30).

### Conferir

`cat $DSPD_BACKUP_DIR/ultimo-backup-ok` deve mostrar a data de hoje; `tail backup.log` e `restauracao.log` mostram o resultado. A cópia para fora da máquina (disco externo ou nuvem cifrada) é decisão do usuário (I-14).

## Teste de restauração na CI

`.github/workflows/restauracao.yml` (`workflow_dispatch` e mensal, dia 1 às 04:00 de Brasília): sobe um PostgreSQL 17 descartável, migra, semeia o mock, roda o **mesmo** `db-backup.sh` e `db-restaurar-verificada.sh` com `DSPD_COMPARAR_COM_VIVO=1`. Só dado fictício.

**Quando dispara:** o agendamento (`schedule`) só vale a partir da branch padrão, a `main`; portanto o disparo mensal só começa depois da primeira release com este workflow. Antes disso, e a qualquer momento, rode por `workflow_dispatch` (Actions, Restauração verificada, Run workflow, escolhendo a branch). Rode uma vez por `workflow_dispatch` antes de contar com ele.

## Timeouts e higiene de conexão (C3)

| Onde | Regra |
|---|---|
| `criarPool` | `statement_timeout` 30 s, `lock_timeout` 5 s, `idle_in_transaction_session_timeout` 30 s, `connectionTimeoutMillis` 5 s e `application_name = dspd-<papel>` (aparece em `pg_stat_activity`); cada um é uma opção do pool |
| `emTransacao` | Se o `ROLLBACK` falhar, a conexão é destruída (`release(true)`) e o erro original é preservado |
| `comTravaDaFonte` | Se o `pg_advisory_unlock` falhar, a conexão é destruída (solta o lock) e o resultado ou erro de `fn` é preservado |
| `migrar` | Cliente com `lock_timeout=5s` (falha com `55P03` em vez de enfileirar leituras) e `singleTransaction: true` explícito |

Testes: `server/tests/timeouts.pg.test.ts` e os unitários de `plataforma*.test.ts`, `migrar.test.ts`, `trava-down.test.ts`.

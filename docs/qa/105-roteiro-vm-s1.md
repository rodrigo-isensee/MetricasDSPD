---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-roteiro-vm-s1
commit: f0b151ca869346e8cf7bc2c556d71f043deedd5b
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: roteiro da VM depois do S1 (pedido 105, E7.431 e E7.434)

Branch `docs/105-roteiro-vm-s1`, head f0b151ca, base develop e1c98633. Revalidação da volta que reescreveu o rollback (migrações 0038, 0039 e 0040). Diff só de texto: `docs/devops/105-implantacao-vm.md` e `docs/devops/105-roteiro-dono.md`. Sem PR, então a suíte inteira fica para o CI do PR; este parecer não afirma CI verde. Testei como quem implanta, num Postgres 17 descartável (projeto Compose `qa061z`, `docker compose up -d --wait postgres` do próprio `docker-compose.yml`, porta 55433, papéis do `docker/postgres/init`), usando os comandos do roteiro tal como escritos (o `docker compose exec -T postgres ...` literal). O contêiner e o volume foram removidos ao fim; o Postgres de desenvolvimento (5432) não foi tocado. Os achados A1, A2 e A3 do parecer anterior estão fechados.

## Achados

## Critério → teste → resultado
| Critério (brief) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 (volta): receita A restaura o backup e tira as três migrações | CT-08: base na 0037, backup (4.1), `db:migrate` (0.2, aplica 0038 a 0040), tabela-marcador criada depois do backup, os 5 comandos da receita A, 3 conferências | restauração sobre banco existente | passou: `DROP DATABASE`, `CREATE DATABASE`, `ALTER DATABASE`, `GRANT`, `pg_restore` rc=0; conferência `0`, `0`, `0`; marcador pós-backup sumiu (`0`); última migração `0037_ac_alvo_prioridade_exibicao`. `docker compose stop api worker coleta web` rc=0 (os quatro serviços existem no compose) |
| Receita A deixa o banco reaplicável | CT-09: `db:migrate` depois da restauração | papéis e GRANTs após DROP/CREATE | passou: `up: 3 migração(ões), 218 GRANT(s)` (0038, 0039, 0040) |
| A2 (volta): receita B, só a 0040, com as travas | CT-10: consulta da última migração, `down 1` sem travas, `down 1` com `DSPD_PERMITIR_DOWN=1` e `DSPD_BACKUP_DIR` | permissão (sem as duas variáveis) | passou: pré-checagem imprime `0040_ac_dim_chamado_escala_p`; sem travas rc=1 e nada apagado; com travas `0040_... (DOWN)`, `down: 1 migração(ões)`, rc=0; conferência `0`, `2`, `0039_bm_toque_primeiro`; `fluxo` segue `1` |
| Tabela do SQL até a 0040 (A3) | leitura do diff contra `server/migrations` (0040 é a última) | n/a | passou: `0001_...sql` a `0040_...sql` |
| Passo 0.2 lista as três migrações | CT-08: saída do `db:migrate` | n/a | passou: `0038_ac_dim_chamado_fluxo`, `0039_bm_toque_primeiro`, `0040_ac_dim_chamado_escala_p`, `up: 3 migração(ões)`, rc=0 |
| Texto contra o código da develop | leitura: `scripts/db-restaurar-verificada.sh` existe; ordem 0038, 0039, 0040 confere com `server/migrations`; trava do `down` confere com `cli.ts` e `trava-down.ts` | n/a | passou |
| Itens do parecer anterior (vm:preparar 8 passos, K-397, coleta parada, `ac:criterios`) | sem mudança no diff desses trechos; resultados de 9b603503 mantidos (CT-01 a CT-05) | n/a | mantido |

## Provas
- Ambiente: `postgres:17` descartável, 40 migrações, backup pelo `scripts/db-backup.sh` do roteiro (`[backup] ok`, rc=0, `ultimo-backup-ok` com a data de hoje).
- Desvios do roteiro por ambiente (não são defeito): pasta de backup em `~/qa061z-backups` em vez de `~/backups-metricas`; `PG_PORT=55433`, `PGPASSWORD`, `DSPD_PG_CONTAINER` e `COMPOSE_PROJECT_NAME` no lugar do `.env`; o banco foi levado ao estado pré-release (0037) com `down 3` de preparo, fora das receitas.
- Teste de documentação contra o código: não há teste novo de código, então `forge-testes --vermelho` e mutação não se aplicam.
- `forge-check parecer delta`: nenhum arquivo do domínio de código e testes mudou entre 9b603503 e f0b151ca.

## Decisão
Aprovado: as duas receitas de rollback executam como escritas e as conferências imprimem o que o texto promete. Nenhum bug aberto.

---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 3c8267ae348c82a635614f601527f25d36b4daee
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: recomendados da VM (K-388, E7.341)

## Parecer
Aprovado, sem achado bloqueante. Dois recomendados sobre o roteiro de operação.

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:244 · o rollback não para os timers de coleta antes de restaurar o banco; uma coleta agendada no meio grava em banco em reconstrução. Sugestão: passo 0 `systemctl stop 'metricas-*.timer'`, religar após a conferência do passo 4.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:232 · o pós-deploy diz "antes de ligar ou religar os timers", mas num redeploy eles já estão ligados e o `systemctl start` manual pode coincidir com a rodada agendada. Sugestão: parar os timers no redeploy e religar no fim.

## Detalhes
Lido por diff `develop...3c8267ae` (compose de produção, `docs/devops/105-implantacao-vm.md`, gerador e SQL regenerado), do ponto de vista de quem opera a VM. Suíte e CI não afirmados: sem PR, ficam para o CI do PR (vale o PQ do autor).

- docker-compose.prod.yml (restart) · aprovado. `unless-stopped` volta com o Docker após reboot e respeita `stop`/`down`. O `depends_on` com `service_completed_successfully` não é reavaliado no reinício do daemon: `api` e `worker` sobem direto sobre o banco já migrado, como se quer. `docker compose config` com valores fictícios valida e mostra `unless-stopped` em `api`, `worker` e `web`, `"no"` em `migrate` e `coleta`.
- docker-compose.prod.yml (log) · aprovado. `json-file` com `max-size 10m` e `max-file 5` nos cinco serviços (confirmado no `config`). O teto vale só para contêiner novo: o `up -d` do próximo deploy recria os serviços, então a rotação passa a valer sem passo extra. Pior caso 50 MB por serviço.
- Rollback (105-implantacao-vm.md:244) · a ordem down, banco, código, conferência está certa e os comandos existem (`DSPD_PERMITIR_DOWN` em `server/src/plataforma/db/trava-down.ts` e `cli.ts`). Ainda no A1: registrar que restaurar o backup perde o gravado desde ele (a coleta incremental refaz na rodada seguinte, mas o operador precisa saber).
- Itens 3 e 8 (`verify-full` e CA fora do Docker) · aprovado: nunca baixa o `sslmode`, pede `NODE_EXTRA_CA_CERTS`, `PGSSLROOTCERT` e cliente 17. `db-backup.sh` não executado (sem VM nem banco aqui).
- scripts/gerar-sql-migracoes.mjs e deploy/sql/00_papeis_e_banco.sql · aprovado. A conferência das cinco senhas fica antes do primeiro `CREATE`, nomeia a variável e trata vazia; com `ON_ERROR_STOP` o `RAISE EXCEPTION` termina com rc 3 e nada é criado. Sem `psql` no PATH, o SQL foi só lido. O gerador não foi rodado (sem dependências na worktree); o trecho gerado confere à mão com o template do `.mjs`.

Ferramentas: `docker compose config` usado; `psql` ausente; `actionlint` não se aplica (nenhum workflow mudou).

## Custo e rollback
Sem minutos de CI novos nem recurso pago. Volta: reverter o commit; o compose volta a subir sem `restart` e sem teto de log.

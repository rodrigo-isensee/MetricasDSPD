---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 6aa86177
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: 105-melhorias-15-11 (produção da VM)

## Achados
- A1 (recomendado) docker-compose.prod.yml:23 · api, worker e web sem `restart:` (padrão "no"): depois de reinício da VM o painel e o worker ficam parados até alguém rodar `up -d`. Usar `unless-stopped`; o `migrate` e o `coleta` seguem "no".
- A2 (recomendado) docs/devops/105-implantacao-vm.md:229 · O rollback não diz a ordem com a migração: `git checkout` + `up -d` roda o `migrate` do código antigo sobre um banco já migrado. Escrever: restaurar o backup ou `down` com `DSPD_PERMITIR_DOWN=1`, depois checkout, build, up, health.
- A3 (recomendado) docker-compose.prod.yml:23 · Sem `logging` (driver json-file, `max-size`/`max-file`): o log dos contêineres cresce sem teto e pode encher o disco da VM. Definir no serviço ou em `/etc/docker/daemon.json`, e dizer como ler (`docker compose logs`).
- A4 (recomendado) docs/devops/105-implantacao-vm.md:109 · Backup (item 8) e `pnpm run db:migrate` (item 3) fora do Docker conectam sem CA e sem `verify-full` (padrão do libpq é `prefer`): faltam `PGSSLMODE=verify-full`, `PGSSLROOTCERT` e cliente `pg_dump` 17 no host; o agendador do backup segue LACUNA.
- A5 (recomendado) docs/devops/105-implantacao-vm.md:224 · Pós-deploy só confere `/health/ready` da API: acrescentar o painel (`curl -fsS http://127.0.0.1:8080/`) e uma coleta de teste (`systemctl start metricas-coleta-businessmap.service`) antes de ligar os timers.

## Detalhes
Aprovado. Nada bloqueia: não há defeito provado nem requisito ou segurança com gatilho em aberto; o parecer de segurança já aprovou os segredos e o TLS. O que conferi, de operação:
- Subir: `docker compose -f docker-compose.prod.yml config -q` sem variáveis falha com `defina DSPD_PWD_MIGRADOR`; com valores fictícios e `--profile coleta` monta (rc 0). Sem serviço postgres, portas só em `127.0.0.1`, CA montada só leitura, `sslmode=verify-full` fixo. `api` espera `migrate` concluído e tem healthcheck; `web` espera a `api` saudável. A sequência da seção 7 do documento está completa e na ordem certa.
- Migrar: dois caminhos (aplicação, serviço `migrate`; SQL do DBA, `deploy/sql`, 43 arquivos, `0000` a `0039` mais `00`, `9000` e `consolidado`, 39 migrações em `server/migrations`, o que bate com a conferência "deve dar 39"). O gerador falha se esquema, GRANTs ou registro diferirem; não o reexecutei (precisa de Docker com imagem Postgres; fica no PQ do autor e no CI).
- Parar: `down` no compose de produção; o banco é da empresa e os dados ficam lá. Correto.
- Timers: `systemd-analyze verify` sem erro nos quatro `.timer`. Horários 06:00, 06:30, domingo 07:30 e 05:00 em `America/Sao_Paulo`, `Persistent=true`, `Type=oneshot`, `TimeoutStartSec` por unidade, `OnFailure` ao aviso de falha, `host.env` sem `-` (falta o arquivo, a unidade falha em vez de cair no Compose de desenvolvimento). O `aviso-falha.sh` valida unidade e e-mail e não leva segredo. O `list-timers 'metricas-*'` do documento lista os quatro.
- Logs: `journalctl -u metricas-coleta-businessmap.service` para as coletas; dos contêineres de longa vida, ver A3.
- Documento: basta para quem implanta (variáveis só por nome, comandos, tecnologia, chamado à infraestrutura, DBA passo a passo, lacunas assumidas). Os cinco achados acima são melhorias, nenhum impede a primeira implantação feita por quem acompanha.
- Ferramentas: `shellcheck` rodou em `aviso-falha.sh` e `gerar-sql-migracoes.sh` (só SC1003 informativo, falso positivo num padrão de `grep`); `docker compose config` e `systemd-analyze verify` rodaram. `actionlint` não se aplica (nada em `.github/`). Não rodei a suíte nem o teste de migração: a suíte inteira fica para o CI do PR; este parecer cita o PQ do autor e não afirma CI verde.
- Branch: avançou depois do commit revisado (`6aa86177`) apenas em `docs/qa`, `docs/reviews` e `docs/security`; o domínio de devops (compose, `deploy/`, scripts de geração, documento) não mudou desde `6aa86177`. Revalidar com `forge-check parecer delta docs/devops/105-vm-producao.md`.

## Custo e rollback
Sem minutos de CI novos e sem recurso pago (`R-CUSTO`): tudo roda na VM e no banco internos da empresa. Rollback da mudança: reverter o merge; em produção, reimplantar a tag anterior com a migração conforme A2 (restaurar o backup anterior à migração, que é a volta segura descrita na seção 6).

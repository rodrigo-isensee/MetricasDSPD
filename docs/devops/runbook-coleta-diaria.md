# Runbook: coleta diária no servidor interno (pedido 061, K-196)

Decisões do dono e riscos aceitos: ADR 0022 item 6 e ADR 0023 §8. Desenho: `docs/devops/061-coleta-diaria.md` (opção B1). Nada neste documento foi executado no servidor; é o roteiro para quem instala.

## 1. O que roda e quando

Horários em America/Sao_Paulo (o fuso está na própria unidade, o relógio do host pode ficar em UTC).

| Unidade (`deploy/systemd/`) | Quando | Comando dentro do container |
|---|---|---|
| `metricas-coleta-businessmap.timer` | todo dia 06:00 | `src/entradas/coleta-businessmap.ts incremental --projetar` |
| `metricas-coleta-acelerato.timer` | todo dia 06:30 | `src/entradas/coleta.ts ac` |
| `metricas-coleta-acelerato-releitura.timer` | domingo 07:30 | `src/entradas/coleta.ts ac --releitura` |
| `metricas-coleta-falha@.service` | `OnFailure=` de cada serviço acima | e-mail ao dono |

Cada serviço chama `docker compose --profile coleta run --rm coleta <script> [args]` (serviço `coleta` do `docker-compose.yml`, imagem do servidor, sem porta publicada). Carga inicial, `ac:ref-sync`, `bm:ref-sync-apontamento` e a pesquisa de percepção NÃO são agendados: são manuais, com o dono presente (ADR 0022 item 4; ADR 0023 §8).

## 2. Pré-requisitos na VM

- Linux com systemd 235 ou mais novo, Docker Engine com o plugin Compose, relógio sincronizado, `sendmail` (MTA local, por exemplo msmtp ou postfix) capaz de entregar ao e-mail do dono, e rede até: Postgres (do próprio Compose), API do BusinessMap, MySQL do Acelerato.
- Repositório clonado em `/opt/metricas-dspd`, na versão liberada pelo dono (nunca em `main` sem merge dele; `R-MAIN`).
- Banco já migrado: `docker compose up -d postgres` e `docker compose run --rm migrate` (ou a stack completa) antes da primeira coleta.

## 3. Segredos que o dono providencia (só os nomes; nada disso vai ao repositório)

Todos ficam no servidor, dono o usuário do job, permissão 600 (diretório 700).

1. `/etc/metricas-dspd/coleta.env` (lido SÓ pelo serviço `coleta`, via `env_file`): `BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `PESSOA_ELIMINADA_SAL` (32 caracteres ou mais), `ACELERATO_MYSQL_HOST`, `ACELERATO_MYSQL_PORT`, `ACELERATO_MYSQL_DATABASE`, `ACELERATO_MYSQL_USER`, `ACELERATO_MYSQL_PASSWORD`, `ACELERATO_MYSQL_TLS_SHA256`, `ACELERATO_MYSQL_TLS_CERT_FILE=/segredos/acelerato.pem`; opcionais: `BUSINESSMAP_LIMITE_POR_MINUTO` (teto 25), `ACELERATO_MYSQL_MAX_EXEC_MS`, `ACELERATO_MYSQL_MARGEM_HORAS`. Não definir `NODE_TLS_REJECT_UNAUTHORIZED` (a partida é recusada).
2. `/etc/metricas-dspd/segredos/acelerato.pem`: certificado do servidor MySQL (montado somente leitura em `/segredos`). Quando o certificado mudar, a coleta falha com categoria `tls`: atualizar a impressão e o PEM, nunca afrouxar o TLS.
3. `/etc/metricas-dspd/host.env`: `AVISO_EMAIL=<endereço do dono>` (usado só pelo aviso de falha). Pode conter também `COLETA_ENV_FILE` e `COLETA_SEGREDOS_DIR` se os caminhos forem outros.
4. Senhas dos papéis do Postgres, no `.env` do Compose do servidor (que o Compose lê da pasta do projeto): `POSTGRES_PASSWORD`, `DSPD_PWD_MIGRADOR`, `DSPD_PWD_COLETOR`, `DSPD_PWD_API`, `DSPD_PWD_REF`, `DSPD_PWD_WEBHOOK`, `DSPD_PWD_AUTOMACAO`, `DSPD_PWD_PESQUISA`, `DSPD_PWD_APONTAMENTO`. O Compose tem valores de desenvolvimento como padrão: em servidor, defina todos, senão valem os padrões públicos.

A apikey do BusinessMap só existe no `coleta.env`: não colocar na API, no `worker`, na imagem, na CI nem na homologação. Se aparecer fora dali, rotacionar a chave (gatilho de reversão da ADR 0022 item 6).

## 4. Instalação

Como root ou com sudo, na VM, com os segredos do item 3 já criados:

```
install -d -m 700 /etc/metricas-dspd /etc/metricas-dspd/segredos
chmod 600 /etc/metricas-dspd/coleta.env /etc/metricas-dspd/host.env
cd /opt/metricas-dspd
docker compose build coleta
cp deploy/systemd/metricas-coleta-* /etc/systemd/system/
systemctl daemon-reload
systemd-analyze verify /etc/systemd/system/metricas-coleta-*.service /etc/systemd/system/metricas-coleta-*.timer
```

Antes de ligar os timers, uma execução manual acompanhada pelo dono (a primeira carga é manual; não é a coleta do timer): confirmar o `docker compose run --rm coleta ...` com a carga inicial combinada, depois `systemctl start metricas-coleta-businessmap.service` e `...acelerato.service` e conferir o item 6. Medir e anotar a duração de cada uma (ainda não medida).

Teste do aviso de falha (sem tocar na coleta): `systemctl start metricas-coleta-falha@metricas-coleta-businessmap.service` e confirmar que o e-mail chegou.

Ligar a agenda:

```
systemctl enable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer
systemctl list-timers 'metricas-coleta-*'
```

## 5. Reexecutar

- Uma fonte: `systemctl start metricas-coleta-businessmap.service` (ou `-acelerato`, `-acelerato-releitura`). Em caso de falha o aviso por e-mail dispara de novo.
- Seguro repetir: marca d'água, staging idempotente e trava por fonte (`pg_try_advisory_lock`). Trava ocupada: BusinessMap sai com erro `trava`, Acelerato com estado `em-uso` (código 3); esperar a execução em curso terminar.
- Códigos de saída: 0 ok; 3 parcial, `em-uso` ou worklog que falhou (cards gravados); 1 erro; 2 uso ou configuração ilegível.
- Log: `journalctl -u metricas-coleta-businessmap.service -n 100` (a saída é JSON só com contagens e códigos; nunca segredo).
- Perdeu a janela (servidor desligado): `Persistent=true` roda a execução perdida na volta; a marca d'água recupera o atraso.

## 6. Conferir o frescor depois de cada execução

1. `systemctl status metricas-coleta-businessmap.service metricas-coleta-acelerato.service` (resultado `success`, hora do último término) e `systemctl list-timers 'metricas-coleta-*'` (próximo disparo).
2. Linha nova em `ctl_coleta` da fonte, com estado ok (consulta pelo papel de leitura do dono, no servidor).
3. Selo de frescor na API, uma fonte por chamada (nunca somar as duas): `curl -s http://127.0.0.1:3000/fontes/<dominio>/estado` e `.../fontes/<dominio>/coletas` (`docs/api/fontes.md`).
4. Meta de aceitação da ADR 0022 item 6: sete execuções diárias consecutivas em 30 dias corridos, vistas em `ctl_coleta`. Se não fechar, o local volta ao dono (reversão da ADR).

## 7. Desligar (rollback)

Não há migração nesta mudança: voltar é parar a agenda, e o dado já coletado permanece (carga incremental nunca sobrescreve).

```
systemctl disable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer
systemctl stop 'metricas-coleta-*.service'
rm /etc/systemd/system/metricas-coleta-*
systemctl daemon-reload
```

Se o motivo for vazamento da chave ou da senha: além disso, rotacionar a apikey do BusinessMap (e pedir ao DBA a troca da senha da conta do Acelerato), apagar `/etc/metricas-dspd/coleta.env` e só religar com o endurecimento previsto nas ADRs (usuário só leitor; usuário próprio, host amarrado e `REQUIRE SSL`). A coleta pode voltar à máquina do dono, à mão, contra o mesmo banco (as travas impedem execução dupla).

Para voltar uma versão da imagem: `git -C /opt/metricas-dspd checkout <tag ou commit anterior>`, `docker compose build coleta`, e reexecutar o item 5.

## 8. Lacunas e verificações feitas na entrega

- `docker build` da imagem e `docker compose config`: feitos; a imagem traz `docs/architecture/fontes/`.
- `shellcheck` no `aviso-falha.sh`: limpo. `systemd-analyze calendar` confirma os horários em America/Sao_Paulo. `systemd-analyze verify` não pôde validar por completo no ambiente do agente (diretório de trabalho `/opt/metricas-dspd` inexistente fora da VM): rodar na instalação (item 4).
- Nenhuma coleta foi executada e nenhum container subiu contra base real.

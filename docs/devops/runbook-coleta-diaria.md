# Runbook: coleta diária no servidor interno (pedido 061, K-196)

Decisões do dono e riscos aceitos: ADR 0022 item 6 e ADR 0023 §8. Desenho: `docs/devops/061-coleta-diaria.md` (opção B1). Nada neste documento foi executado no servidor; é o roteiro para quem instala.

> Produção na VM da empresa (banco e HTTPS da empresa): use `docker-compose.prod.yml` e siga `docs/devops/105-implantacao-vm.md`; as senhas padrão `_dev` citadas no item 3.4 só existem no Compose de desenvolvimento. Na VM, sem `PESSOA_ELIMINADA_SAL` no `coleta.env`, o Apontamento para sem dado (a coleta passa a avisar, K-382).

## 1. O que roda e quando

Horários em America/Sao_Paulo (o fuso está na própria unidade, o relógio do host pode ficar em UTC).

| Unidade (`deploy/systemd/`) | Quando | Comando dentro do container |
|---|---|---|
| `metricas-coleta-businessmap.timer` | todo dia 06:00 | `src/entradas/coleta-businessmap.ts incremental --projetar` |
| `metricas-coleta-acelerato.timer` | todo dia 06:30 | `src/entradas/coleta.ts ac` |
| `metricas-coleta-acelerato-releitura.timer` | domingo 07:30 | `src/entradas/coleta.ts ac --releitura` |
| `metricas-referencias.timer` | domingo 05:00 | em sequência: `ref-sync-businessmap.ts`, `ref-sync-ac.ts`, `ref-sync-calendario.ts`, `ref-sync-apontamento.ts` (todas em `src/entradas/`) |
| `metricas-coleta-falha@.service` | `OnFailure=` de cada serviço acima | e-mail ao dono |

Cada serviço chama `docker compose --profile coleta run --rm coleta <script> [args]` (serviço `coleta` do `docker-compose.yml`, imagem do servidor, sem porta publicada). O **Apontamento** (horas do BusinessMap) não tem timer próprio: o incremental roda como etapa do `coleta-businessmap.ts incremental` das 06:00, desde que `PESSOA_ELIMINADA_SAL` esteja no `coleta.env` e a carga inicial do Apontamento (item 4a) já tenha sido feita. As referências (dicionários do BusinessMap e do Acelerato, calendário e subgrupos do Apontamento) rodam toda semana na unidade `metricas-referencias` (domingo 05:00); ela só usa o banco (papel `dspd_ref`), não chama BusinessMap nem Acelerato e não leva credencial no arquivo da unidade. O container `coleta` recebe o `coleta.env` inteiro (apikey, senha do MySQL, sal), embora esses scripts só leiam o banco; o Compose já define `PG_REF_URL` do `dspd_ref` a partir de `DSPD_PWD_REF`, então **não** ponha `PG_REF_URL` no `coleta.env` (nunca com a URL do migrador nem a do coletor). Com `Persistent=true`, se a VM estiver desligada no domingo a unidade roda no boot, talvez junto da coleta; os scripts são idempotentes. A carga inicial (BusinessMap, Apontamento, Acelerato), `bm:criterios-classe-servico` (usa o papel migrador, que o container de coleta não recebe, e grava uma vez só) e a pesquisa de percepção NÃO são agendados: são manuais, com o dono presente (ADR 0022 item 4; ADR 0023 §8).

## 2. Pré-requisitos na VM

- Linux com systemd 235 ou mais novo, Docker Engine com o plugin Compose 2.24 ou mais novo (o `env_file` com `path` e `required` do serviço `coleta` é recusado em versão anterior; conferir com `docker compose version`), relógio sincronizado, `sendmail` (MTA local, por exemplo msmtp ou postfix) capaz de entregar ao e-mail do dono, e rede até: Postgres (do próprio Compose), API do BusinessMap, MySQL do Acelerato.
- Repositório clonado em `/opt/metricas-dspd`, na versão liberada pelo dono (nunca em `main` sem merge dele; `R-MAIN`). O clone pertence a root e só root escreve nele (`chown -R root:root /opt/metricas-dspd`, sem permissão de escrita para grupo ou outros): quem escreve ali executa código como root na próxima coleta.
- Banco já migrado: `docker compose up -d postgres` e `docker compose run --rm migrate` (ou a stack completa) antes da primeira coleta.

## 3. Segredos que o dono providencia (só os nomes; nada disso vai ao repositório)

Todos ficam no servidor, dono root, permissão 600 (diretório 700), com uma exceção: o PEM do Acelerato e o diretório `segredos` (item 2), que o container lê como `node` (uid 1000).

1. `/etc/metricas-dspd/coleta.env` (lido SÓ pelo serviço `coleta`, via `env_file`): `BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `PESSOA_ELIMINADA_SAL` (32 caracteres ou mais, gerado por quem instala, por exemplo `openssl rand -hex 32`; obrigatório para o Apontamento; **só entra no `coleta.env` junto da carga inicial do Apontamento (item 4a), porque com o sal presente o incremental das 06:00 já roda o Apontamento**; guarde uma cópia no cofre do dono, porque trocar o sal invalida a lista de supressão), `ACELERATO_MYSQL_HOST`, `ACELERATO_MYSQL_PORT`, `ACELERATO_MYSQL_DATABASE`, `ACELERATO_MYSQL_USER`, `ACELERATO_MYSQL_PASSWORD`, `ACELERATO_MYSQL_TLS_SHA256`, `ACELERATO_MYSQL_TLS_CERT_FILE=/segredos/acelerato.pem`; opcionais: `BUSINESSMAP_LIMITE_POR_MINUTO` (teto 25), `ACELERATO_MYSQL_MAX_EXEC_MS`, `ACELERATO_MYSQL_MARGEM_HORAS`. Não definir `NODE_TLS_REJECT_UNAUTHORIZED` (a partida é recusada).
2. `/etc/metricas-dspd/segredos/acelerato.pem`: certificado do servidor MySQL (montado somente leitura em `/segredos`). O diretório `segredos` fica com 755 e o PEM com 644: o certificado é público e o container roda como `node` (uid 1000), que não consegue ler um arquivo 600 de root. Com 700/600 a coleta do Acelerato falha sempre na categoria `tls`. Quando o certificado mudar, a coleta falha com categoria `tls`: atualizar a impressão e o PEM, nunca afrouxar o TLS.
3. `/etc/metricas-dspd/host.env`: `AVISO_EMAIL=<endereço do dono>` (usado só pelo aviso de falha). Pode conter também `COLETA_ENV_FILE` e `COLETA_SEGREDOS_DIR` se os caminhos forem outros.
4. Senhas dos papéis do Postgres, no `.env` do Compose do servidor (que o Compose lê da pasta do projeto): `POSTGRES_PASSWORD`, `DSPD_PWD_MIGRADOR`, `DSPD_PWD_COLETOR`, `DSPD_PWD_API`, `DSPD_PWD_REF`, `DSPD_PWD_WEBHOOK`, `DSPD_PWD_AUTOMACAO`, `DSPD_PWD_PESQUISA`, `DSPD_PWD_APONTAMENTO`. O Compose tem valores de desenvolvimento como padrão: em servidor, defina todos, senão valem os padrões públicos. Esse `.env` fica com `chmod 600` (dono root). Na instalação, confirme que nenhuma senha padrão `_dev` restou: cada variável `DSPD_PWD_*` e `POSTGRES_PASSWORD` tem valor próprio, diferente do padrão do `docker-compose.yml` (conferência por leitura do dono; o agente não abre arquivos `.env*`).

A apikey do BusinessMap só existe no `coleta.env`: não colocar na API, no `worker`, na imagem, na CI nem na homologação. Se aparecer fora dali, rotacionar a chave (gatilho de reversão da ADR 0022 item 6).

## 4. Instalação

Como root ou com sudo, na VM, com os segredos do item 3 já criados:

```
docker compose version   # 2.24 ou mais novo
install -d -m 700 /etc/metricas-dspd
install -d -m 755 /etc/metricas-dspd/segredos
chmod 600 /etc/metricas-dspd/coleta.env /etc/metricas-dspd/host.env
chmod 644 /etc/metricas-dspd/segredos/acelerato.pem   # certificado público; o container (uid 1000) precisa ler
chown -R root:root /opt/metricas-dspd
chmod 600 /opt/metricas-dspd/.env   # .env do Compose do servidor
cd /opt/metricas-dspd
docker compose build coleta
cp deploy/systemd/metricas-coleta-* deploy/systemd/metricas-referencias.* /etc/systemd/system/
systemctl daemon-reload
systemd-analyze verify /etc/systemd/system/metricas-coleta-*.service /etc/systemd/system/metricas-coleta-*.timer /etc/systemd/system/metricas-referencias.service /etc/systemd/system/metricas-referencias.timer
```

### 4a. Primeira carga do Apontamento (manual, só na primeira vez)

O Apontamento depende de três coisas, nesta ordem: (1) banco migrado; (2) carga de cards do BusinessMap feita (`coleta-businessmap.ts carga-inicial --projetar`); (3) dicionário de subgrupos carregado (`ref-sync-apontamento.ts`). Só então:

```
cd /opt/metricas-dspd
docker compose --profile coleta run --rm coleta src/entradas/ref-sync-apontamento.ts
docker compose --profile coleta run --rm coleta src/entradas/apontamento-businessmap.ts carga-inicial
```

A `carga-inicial` do Apontamento roda **uma vez**, com o dono presente, e exige `PESSOA_ELIMINADA_SAL` (sem o sal ela se recusa a partir). Depois dela o incremental diário já inclui o Apontamento (`bm:coleta incremental`, timer das 06:00): não agende nem rode a `carga-inicial` de novo. Conferir pelo item 6 que a execução do BusinessMap ficou ok e, no log, as contagens do worklog (só números; nunca nome nem id de pessoa).

Antes de ligar os timers, uma execução manual acompanhada pelo dono (a primeira carga é manual; não é a coleta do timer): confirmar o `docker compose run --rm coleta ...` com a carga inicial combinada, depois `systemctl start metricas-coleta-businessmap.service` e `...acelerato.service` e conferir o item 6. Medir e anotar a duração de cada uma (ainda não medida).

Conferir o estouro do `TimeoutStartSec`: depois de um `systemctl stop` (ou de um estouro real) de uma unidade em andamento, rodar `docker ps`. Se o container `coleta` seguir vivo, ele segura a trava da fonte: use `--name` fixo no `docker compose run` e `ExecStopPost=/usr/bin/docker rm -f <nome>` na unidade, e remova o container à mão antes de reexecutar.

Teste do aviso de falha (sem tocar na coleta): `systemctl start metricas-coleta-falha@metricas-coleta-businessmap.service` e confirmar que o e-mail chegou.

Ligar a agenda:

```
systemctl enable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer metricas-referencias.timer
systemctl list-timers 'metricas-*'
```

## 5. Reexecutar

- Referências: `systemctl start metricas-referencias.service` (seguro repetir; `ac:ref-sync` grava a vigência dos alvos com a data do dia, então evite rodá-lo duas vezes no mesmo dia).
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
systemctl disable --now metricas-coleta-businessmap.timer metricas-coleta-acelerato.timer metricas-coleta-acelerato-releitura.timer metricas-referencias.timer
systemctl stop 'metricas-coleta-*.service' metricas-referencias.service
rm /etc/systemd/system/metricas-coleta-* /etc/systemd/system/metricas-referencias.*
systemctl daemon-reload
```

Se o motivo for vazamento da chave ou da senha: além disso, rotacionar a apikey do BusinessMap (e pedir ao DBA a troca da senha da conta do Acelerato), apagar `/etc/metricas-dspd/coleta.env` e só religar com o endurecimento previsto nas ADRs (usuário só leitor; usuário próprio, host amarrado e `REQUIRE SSL`). A coleta pode voltar à máquina do dono, à mão, contra o mesmo banco (as travas impedem execução dupla).

Para voltar uma versão da imagem: `git -C /opt/metricas-dspd checkout <tag ou commit anterior>`, `docker compose build coleta`, e reexecutar o item 5.

## 8. Lacunas e verificações feitas na entrega

- `docker build` da imagem e `docker compose config`: feitos; a imagem traz `docs/architecture/fontes/`.
- `shellcheck` no `aviso-falha.sh`: limpo. `systemd-analyze calendar` confirma os horários em America/Sao_Paulo. `systemd-analyze verify` não pôde validar por completo no ambiente do agente (diretório de trabalho `/opt/metricas-dspd` inexistente fora da VM): rodar na instalação (item 4).
- Nenhuma coleta foi executada e nenhum container subiu contra base real.

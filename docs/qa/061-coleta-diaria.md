---
tipo: qa
contrato: 1
pedido: 061-coleta-diaria
branch: feature/061-coleta-diaria
commit: ce363ba1c32639c2c78668d83e4d450ff0186d36
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: 061-coleta-diaria (E2.5, K-196)

Ponta testada: `ce363ba` (`6dece9a` mais o parecer de review; só docs sobre o código). Intervalo: `d05bbfc...ce363ba`, 18 arquivos, só infraestrutura e documentação (Dockerfile, `.dockerignore`, Compose, `deploy/systemd/`, runbook, ADRs 0022 e 0023). Nenhum código de `server/src` mudou. O pedido não tem especificação de UX nem `CA-n`: os critérios são os da entrega do brief (E2.5). Nenhum `.env` aberto, nenhuma coleta rodada, nenhum container contra base real.

## Achados
- A1 (recomendado) docs/devops/runbook-coleta-diaria.md:42 · O Compose monta `segredos` com `create_host_path: true`: se o diretório faltar, o Docker cria um vazio como root e a coleta do Acelerato falha só em runtime (`tls`). Vale uma linha no passo 4 mandando conferir `ls /etc/metricas-dspd/segredos/acelerato.pem` antes de ligar os timers.
- A2 (recomendado) deploy/systemd/aviso-falha.sh:17 · `sendmail` é caminho fixo (`/usr/sbin/sendmail`) e não existe nesta máquina; o runbook já lista MTA como pré-requisito, e o teste do aviso (passo 4) cobre. Com `pipefail`, falha do `journalctl` deixa a unidade de aviso em erro mesmo com o e-mail enviado.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Imagem leva `docs/architecture/fontes/` | `docker build -f server/Dockerfile` e `docker run --entrypoint sh` listando `/repo/docs/architecture/fontes` | só `docs/architecture` entra; resto de `docs/` fora | passou: 5 arquivos (iguais aos 5 versionados), `/repo/docs` só com `architecture`, uid 1000 |
| Caminho relativo do código resolve na imagem | `node --import tsx` em `/repo/server` resolvendo `src/../../docs/architecture/fontes` | caminho `../../` do `import.meta.url` | passou: 5 arquivos listados |
| `docker compose config` sem resolver o `env_file` | `docker compose --profile coleta config --no-env-resolution` | `env_file` ausente (`required: false`) | passou: serviço `coleta` sem `ports`, `env_file` não resolvido, sem apikey/senha na saída, `restart: "no"` |
| `docker compose run` sem TTY (como no systemd) | `run --rm --no-deps --entrypoint true coleta < /dev/null` (volume de segredos num diretório temporário) | stdin sem terminal | passou: rc 0, imagem montada pelo próprio Compose |
| Timer BusinessMap 06:00 BRT | `systemd-analyze calendar "*-*-* 06:00:00 America/Sao_Paulo"` | fuso do host em UTC | passou: 06:00 -03 = 09:00 UTC |
| Timer Acelerato 06:30 BRT | idem com 06:30 | idem | passou: 06:30 -03 = 09:30 UTC |
| Releitura de domingo depois do Acelerato | `systemd-analyze calendar "Sun *-*-* 07:30:00 America/Sao_Paulo"` mais leitura do `After=` | colisão com a trava da fonte | passou: domingo 07:30 -03 (10:30 UTC), uma hora depois do incremental, e `After=metricas-coleta-acelerato.service` |
| Aviso de falha sem dado de pessoa | `aviso-falha.sh` com `sendmail` trocado por `cat` (cópia em scratchpad) | unidade fora do padrão, e-mail com `;`, e-mail ausente | passou: `foo.service` rc 2, `a@b.com;rm -rf` rc 2, sem `AVISO_EMAIL` rc 1; corpo só com unidade, hora, comandos e journal (saída JSON de contagens); `shellcheck` limpo |
| Runbook executável na ordem | leitura passo a passo (§2 a §4) contra Compose e unidades | permissões e ordem | passou: instalação cria diretórios e permissões antes do `build`; segredos só por nome; `segredos` 755 e PEM 644; `chown` root antes do `build`; `.env` 600; `/etc/metricas-dspd` 700 |
| Unidades chamam entradas que existem | grep das opções `--releitura` e `--projetar` em `coleta.ts` e `coleta-businessmap.ts` | argumento desconhecido | passou |
| `pnpm run pronto` | `pnpm run pronto` | suíte completa | não rodou: o sandbox nega o lock em `/tmp/metricas-dspd-suite.lock` (somente leitura). Rodei as partes sem banco: `test:trava`, `lint` e `format:check`, todas rc 0. Suíte e e2e ficam para a CI do PR |

## Cenários e resultado real
- Ambiente: Docker 29.1.3, Compose 2.40.3, systemd 259 (o runbook pede Compose 2.24 ou mais novo e systemd 235 ou mais novo; a sintaxe usada passou na versão local, sem teste nas versões mínimas).
- Sem vermelho antes do verde nem mutação: o diff não tem teste novo nem lógica de produto (infraestrutura e texto), e não toca `bin/`, `hooks/` nem `.githooks/`.
- Não foi possível testar: `systemd-analyze verify` completo (o sandbox recusa o diretório de trabalho, e `/opt/metricas-dspd` só existe na VM); envio real de e-mail; estouro de `TimeoutStartSec` com container vivo; execução real da coleta contra BusinessMap e MySQL do Acelerato; `docs:check`; suíte completa. Tudo isso fica para a instalação na VM, já prevista no runbook (§4), e para a CI.
- Efeito colateral: o teste do Compose gerou a imagem local `metricasdspd-coleta` e `qa061-coleta:test` (Docker local da máquina, sem container restante).
- Bugs abertos: nenhum.

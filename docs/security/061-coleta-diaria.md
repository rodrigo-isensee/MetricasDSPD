---
tipo: revisao-seguranca
contrato: 1
pedido: 061-coleta-diaria
branch: feature/061-coleta-diaria
commit: e992a5fdbf0acf82ebd707bb0191d298f0f1b065
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: coleta diária no servidor interno (pedido 061, E2.4, K-196)

Rodada 1. Intervalo revisado: `d05bbfc...e992a5f` (`3034e96` ADRs 0022 item 6 e 0023 §8; `e992a5f` Dockerfile, `.dockerignore`, serviço `coleta` do Compose, unidades `deploy/systemd/`, runbook). Lidos também `docs/devops/061-coleta-diaria.md` e `docs/devops/runbook-coleta-diaria.md`. Revisão estática: nenhum `.env` lido, nada executado, nenhum container subiu, nenhuma coleta rodou.

**Veredito: aprovado.** Nenhum bloqueante. Três recomendações de operação (A1 a A3), nenhuma com caminho de ataque que vá além de quem já é root na VM.

## Gatilhos
Credenciais de integração (apikey do BusinessMap com escrita, senha da conta compartilhada do MySQL do Acelerato) passam a ficar num host administrado por outras pessoas; imagem e Compose alterados; agendador com e-mail de saída; riscos aceitos pelo dono (ADRs 0022 e 0023). R-SEGURANCA.

## Achados
- A1 (recomendado) docs/devops/runbook-coleta-diaria.md:40 · `segredos` em 700 root, montado em `/segredos` e lido pelo `node` (uid 1000, `server/Dockerfile:20`): a coleta ac falha `tls`. O PEM é público; diga 755/644 ou dono 1000 para não induzir afrouxar o resto às pressas. Dono: devops-engineer.
- A2 (recomendado) docs/devops/runbook-coleta-diaria.md:21 · `aviso-falha.sh` roda como root a partir de `/opt/metricas-dspd`, e o `docker compose build` também: fixar no runbook que o clone pertence a root e só root escreve nele, senão quem escreve no clone ganha root. Dono: devops-engineer.
- A3 (recomendado) docker-compose.yml:86 · Sem as senhas no `.env` do servidor, Postgres e `coleta` usam os padrões públicos (`coletor_dev` etc.); o loopback limita. No item 4 do runbook: `chmod 600` desse `.env` e conferir que nenhum `_dev` restou. Dono: devops-engineer.

## O que foi verificado

**Nenhum segredo na imagem, no Compose, nas unidades nem no runbook.** Varredura por padrão de chave, senha, token, chave privada, e-mail e IP nas linhas adicionadas do intervalo: nada (só exemplos de unidade e `127.0.0.1`). O `gitleaks` não está no PATH (lacuna; a varredura de segredos fica com o CI). A imagem final copia só `node_modules`, `packages`, `server`, `docs/architecture/fontes` e dois manifestos (`server/Dockerfile:14-19`); o `.dockerignore:6-8` segue excluindo `.env` e `.env.*`, e a nova regra `docs/*` com exceção só de `docs/architecture/fontes` (`.dockerignore:11-14`) não reabre nada. Os cinco arquivos de `fontes/` são listas de domínio versionadas (etapas, prioridades, dicionário de subgrupos, regras de coluna, SQL constante), sem segredo nem dado de pessoa. As unidades leem `host.env` (só `AVISO_EMAIL` e caminhos) e dizem no comentário que segredo não entra nelas (`metricas-coleta-*.service:10-11`). O runbook só nomeia as variáveis (`runbook-coleta-diaria.md:27-31`).

**Apikey do BusinessMap e senha do MySQL só no serviço `coleta`.** Elas chegam por `env_file` (`docker-compose.yml:82-84`, `/etc/metricas-dspd/coleta.env`, 600), que só o serviço `coleta` declara; `api`, `worker`, `migrate` e `web` não têm `env_file` e o `environment` deles não cita `BUSINESSMAP_*` nem `ACELERATO_*`. O `.env` do Compose (raiz) só interpola senhas de papel do Postgres e não é injetado em container; dentro do container `/repo/.env` não existe (fora da imagem, sem volume), então o `loadEnvFile` das entradas cai no ENOENT e vale o `env_file`. A `coleta` recebe `PG_COLETOR_URL` e `DSPD_PWD_REF`, ambos exigidos por `carregarConfigColetaBusinessMap` (`server/src/plataforma/config.ts:97-104`): mínimo necessário. Que a coleta do Acelerato e a do BusinessMap partilhem o mesmo `env_file` é o desenho decidido ("só no serviço de coleta").

**PEM montado só leitura.** `docker-compose.yml:90-91` monta o diretório de segredos em `/segredos:ro`. Ver A1 sobre a permissão do diretório.

**Nenhuma porta publicada.** O serviço `coleta` não tem `ports:` e as unidades usam `docker compose run --rm` sem `--service-ports` (`metricas-coleta-*.service:12`). O `depends_on` sobe o `postgres`, que segue publicado só em `127.0.0.1` (`docker-compose.yml:20`). Perfil `coleta`: não sobe com `up`.

**Aviso de falha sem dado de pessoa.** `deploy/systemd/aviso-falha.sh` valida o nome da unidade (`:6`) e o endereço por lista de caracteres (`:8`, sem quebra de linha, então sem injeção de cabeçalho no `sendmail -t`); o corpo leva unidade, hora, comandos e as 30 últimas linhas do journal da unidade (`:16`). Essas linhas são a saída das entradas, sem mudança neste intervalo: JSON de contagens e códigos (`server/src/entradas/coleta.ts:30-38`, `coleta-businessmap.ts:49-56`), pino com redação de apikey, senha, comentário e nome (`server/src/plataforma/log.ts:5-27`), erro do pool só com a mensagem, nunca a URL (`server/src/plataforma/db/pool.ts:65-66`), e o erro do driver do Acelerato nunca registrado (`ErroColeta.paraLog`). `shellcheck` limpo. O endereço vem de `host.env`, fora do repositório.

**ADRs 0022 e 0023 fiéis às decisões do dono.** ADR 0022 item 6 cita literalmente "B1", "A" (servidor), "A, porém pode manter minha chave..." e "A" (aviso e horário), descreve o risco (chave com escrita num host administrado por outros, vazamento por host, arquivo, log ou imagem), a mitigação que este intervalo implementa e um critério de reversão concreto (alteração no quadro sem ação do dono, ou chave fora do serviço de coleta). ADR 0023 §8 cita "B" literal, descreve os três riscos (senha válida de qualquer endereço, servidor que aceita texto puro, log do MySQL que não separa os usuários da conta) e o critério de reversão. Nada foi suavizado.

**TLS do coletor mantido.** ADR 0023 §8 diz explicitamente que "sem SSL" é o servidor não exigir TLS e que o §3 (certificado fixado pela impressão, recusa de texto puro) continua; o intervalo não toca `server/src` nem `packages`, e a recusa de `NODE_TLS_REJECT_UNAUTHORIZED=0` segue em `server/src/modulos/acelerato/config.ts:48`. O runbook manda trocar impressão e PEM quando o certificado mudar, "nunca afrouxar o TLS" (`runbook-coleta-diaria.md:28`).

**Rollback e rotação.** O runbook prevê rotação da apikey e troca da senha pelo DBA em caso de vazamento (`runbook-coleta-diaria.md` §7), coerente com os critérios de reversão das duas ADRs.

## Ferramentas e lacunas
`shellcheck` (limpo). Não estão no PATH: `gitleaks`, `hadolint`, `trivy`, `semgrep`, `actionlint`, `zizmor`; nenhuma instalada (R-CUSTO). Sem workflow alterado no intervalo. `systemd-analyze verify` completo fica para a instalação na VM, como o runbook já registra.

## Riscos aceitos
Os do dono, já registrados nas ADRs: apikey pessoal com escrita guardada no servidor interno (ADR 0022 item 6) e conta compartilhada do MySQL sem host amarrado nem `REQUIRE SSL` no servidor (ADR 0023 §8). Este parecer não cria risco aceito novo.

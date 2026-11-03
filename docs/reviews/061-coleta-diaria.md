---
tipo: review
contrato: 1
pedido: 061-coleta-diaria
branch: feature/061-coleta-diaria
commit: e992a5fdbf0acf82ebd707bb0191d298f0f1b065
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 061-coleta-diaria, coleta diária no servidor interno (E2.3, K-196)

**Veredito: reprovado** em `e992a5f`. Um bloqueante, o A1: seguido ao pé da letra, o runbook deixa o PEM ilegível para o usuário do container, e a coleta do Acelerato falha sempre na categoria `tls`. A correção cabe no runbook, sem mudar código. O resto está correto e dentro do que o dono decidiu: Dockerfile, `.dockerignore`, serviço `coleta`, unidades systemd e o texto das ADRs 0022 e 0023. Os recomendados A2 a A5 não devolvem a entrega.

## Escopo lido
- `git diff d05bbfc...e992a5f`: `3034e96` (ADR 0022 item 6, ADR 0023 §8) e `e992a5f` (`.dockerignore`, `server/Dockerfile`, `docker-compose.yml`, 8 arquivos em `deploy/systemd/`, `docs/devops/runbook-coleta-diaria.md`). Lidos também `docs/devops/061-coleta-diaria.md` (§1, §4) e o parecer de segurança `docs/security/061-coleta-diaria.md` (aprovado, A1 a A3).
- Fora do diff, para conferir o contrato: `server/src/entradas/coleta-businessmap.ts` e `coleta.ts` (argumentos e códigos de saída), `server/src/plataforma/config.ts` (`PG_COLETOR_URL`, `DSPD_PWD_REF`), `scripts/coleta.sh` e os leitores de `docs/architecture/fontes/` (`conferencia.ts`, `dicionario.ts`, `dominio-acelerato.ts`).
- Revisão estática: nenhum `.env` lido, nada executado, nenhum container subiu.

## Teto por PR (decisão M14)
Código e configuração: `.dockerignore` 5, `server/Dockerfile` 2, `docker-compose.yml` 22, `deploy/systemd/` 92, num total de 121 linhas (`git diff --numstat --no-renames`, sem o texto `.md`). Fica abaixo de 150 e traz um comportamento só, a coleta agendada. Sem exceção a registrar.

## Conferência pelo que o brief pede
- **Dockerfile e `.dockerignore`:** a negação em quatro linhas (`docs/*`, `!docs/architecture`, `docs/architecture/*`, `!docs/architecture/fontes`) reabre só `fontes`, que tem 5 arquivos versionados sem segredo. `COPY --from=deps` põe a pasta em `/repo/docs/architecture/fontes`, o caminho que os `new URL('../../../../docs/architecture/fontes/...')` resolvem a partir de `/repo/server/src`. O `.env` continua fora da imagem. Ponto pequeno: o comentário do Dockerfile cita `../../`, mas a profundidade real varia por módulo. Não é achado.
- **Serviço `coleta`:** fica no perfil `coleta`, então não sobe com `up`. Não publica porta e usa `restart: "no"`. O `env_file` vem do host (`COLETA_ENV_FILE`, `required: false`) e o PEM é montado `:ro`. Só ele recebe a apikey e a senha do MySQL, como mandam os itens de mitigação das ADRs 0022 (item 6) e 0023 (§8). O `DSPD_PWD_REF` se justifica, porque o `esquemaColetaBusinessMap` exige `PG_REF_URL` ou `DSPD_PWD_REF`. O `entrypoint` com `node --import tsx` segue a forma de `migrate` e `worker`, e o `tsx` está nas dependências de produção do servidor.
- **Comandos:** `coleta-businessmap.ts incremental --projetar` e `coleta.ts ac [--releitura]` batem com os analisadores de argumento. Chamar `coleta.ts` direto, sem `scripts/coleta.sh`, está certo no container: o script só carrega o `.env` e chama o `tsx`.
- **Unidades systemd:** três timers rodam às 06:00 e às 06:30 todo dia e às 07:30 de domingo, em `America/Sao_Paulo` explícito, com `Persistent=true`. O `Type=oneshot` tem `TimeoutStartSec` de 2 h e de 3 h. `OnFailure=metricas-coleta-falha@%n.service` passa à instância o nome completo da unidade (`*.service`), que é o que o `case` do `aviso-falha.sh` aceita. O endereço vem de `AVISO_EMAIL` em `/etc/metricas-dspd/host.env`, nunca do repositório, e o script valida o endereço contra injeção de cabeçalho antes do `sendmail -t`. Os horários correspondem às decisões do dono "B1" e "A" (aviso e horário). Shellcheck limpo e `systemd-analyze calendar` conferido pelo autor (runbook §8). O `systemd-analyze verify` fica para a instalação, como o próprio runbook registra.
- **Runbook:** traz instalação, teste do aviso, reexecução com os códigos de saída 0, 1, 2 e 3 (corretos contra `process.exitCode` das duas entradas), frescor por fonte sem somar as duas, e um rollback sem migração, com o caminho de vazamento. A carga inicial, os `ref-sync` e a pesquisa ficam de fora da agenda, como mandam a ADR 0022 (item 4) e a decisão do dono "A" (pesquisa manual).
- **Decisões do autor:**
  - A releitura de domingo às 07:30 está aceita: fica uma hora depois do incremental, e a trava por fonte protege contra a execução dupla. O ajuste fino está no A2.
  - As senhas `DSPD_PWD_*` no `.env` do Compose do servidor também estão aceitas. É o mecanismo que todos os serviços já usam por interpolação, o arquivo não entra em nenhum container e está de acordo com a regra de credenciais só em `.env` do `CLAUDE.md`. O endurecimento (`chmod 600`, nenhum `_dev` restante) é o A3 do parecer de segurança e não se repete aqui.
- **ADRs 0022 e 0023:** o texto registra literalmente as decisões do dono, com risco aceito, mitigação obrigatória, caminho de endurecimento, critério de reversão próprio do item 6 e do §8, e uma linha nova em Leituras. A ADR 0023 §8 deixa claro que "sem SSL" quer dizer que o servidor não exige TLS, e que o TLS fixado do coletor (§3) continua. Os itens antigos (0022 item 5, 0023 §1 item 2 e §6) ficam com a marca de revisão, sem apagar o histórico. Mecanismo novo não há: o que entra é agenda de mecanismo existente.
- **Segurança:** o parecer de segurança está aprovado e não foi refeito aqui. Ele já registra a mesma causa do A1 (o A1 dele) como recomendado, porque não tem caminho de ataque. Aqui ela é bloqueante por ser defeito funcional provado.

## Achados
- A1 (bloqueante) docs/devops/runbook-coleta-diaria.md:40 · `install -d -m 700` (root) e o PEM em 600, montados `:ro`, ficam ilegíveis ao `node` (uid 1000, `server/Dockerfile:20`): o `prepararTls` falha e a coleta ac quebra sempre em `tls`. Dê ao `segredos/` 755 e ao PEM 644 (é público) e corrija a linha 26.
- A2 (recomendado) deploy/systemd/metricas-coleta-acelerato-releitura.service:4 · No domingo, com `Persistent=true` depois de o host ficar desligado (ou com o incremental passando de 1 h), as duas unidades do Acelerato disputam a trava e saem `em-uso` (3), o que manda um aviso falso. `After=metricas-coleta-acelerato.service` põe as duas em fila.
- A3 (recomendado) docs/devops/runbook-coleta-diaria.md:20 · `env_file` com `path`/`required` (docker-compose.yml:82) exige Compose 2.24 ou mais novo, porque versão anterior recusa o arquivo. Ponha a versão mínima nos pré-requisitos e o `docker compose version` na instalação.
- A4 (recomendado) deploy/systemd/metricas-coleta-businessmap.service:13 · Quando o `TimeoutStartSec` estoura, o systemd mata o `docker compose run`, mas o container pode seguir vivo, segurando a trava. Na instalação, confira com `docker ps` depois de um `systemctl stop` e, se sobrar container, use `--name` fixo e `ExecStopPost=docker rm -f`.
- A5 (recomendado) docs/devops/runbook-coleta-diaria.md:1 · Nada em `docs/` aponta para o runbook nem para `deploy/systemd/`, e quem instala chega só pelo PR. Cite o runbook no README (seção de execução ou de implantação) ou no `fluxo-homologacao.md`.

## Volta
O Entregar da volta sai do A1: corrigir as permissões do `segredos/` e do PEM no runbook (§3 linha 26 e §4 linha 40), como commit novo do autor. Os recomendados A2 a A5 ficam a critério do autor, que pode aplicá-los na mesma volta. A revalidação será por delta (`forge-check delta`) sobre este parecer.

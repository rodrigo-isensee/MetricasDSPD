---
tipo: review
contrato: 1
pedido: 104-release-2026-11-14
branch: docs/104-roteiro-dono
commit: a1896e540f63bd1c6690954610db95541ff00542
parecer: reprovado
revisor: tech-lead
data: 2026-11-14
---

# Code review: roteiro do dono depois da release 104 (K-333, E1.9)

Só documento: `docs/devops/104-roteiro-dono.md` (+137, commit e9bb171f sobre a develop 64826e90). O brief traz `Revisar-sha:` igual ao `Base-sha` (64826e90, a develop sem o roteiro); o commit revisado é o e9bb171f, único da branch. Nada foi executado na base real nem com o `.env`.

Conferido contra: `CHANGELOG.md` da `origin/docs/104-release` (3518966d), seção "Ações do dono na base real depois da release 104"; `package.json` e `server/package.json` (nomes e filtro `@metricas-dspd/server`); `scripts/coleta.sh` e `scripts/db.sh`; `docs/devops/runbook-coleta-diaria.md`; `docker-compose.yml`; `docs/devops/076-publicacao-local.md` (como o dono já rodou estes comandos).

## O que confere
- Os 7 passos estão na ordem do CHANGELOG (db:migrate, ref:sync-calendario, ac:ref-sync num dia diferente do último, bm:ref-sync, `coleta ac --reconhecer-mudanca`, ac:reprojetar-etapas com a coleta parada, coleta dos dois), com os nomes exatos dos scripts.
- Parada da coleta pelos nomes das três unidades do runbook (runbook-coleta-diaria.md:11-13, :87); comando da coleta do BusinessMap igual ao do timer (`incremental --projetar`).
- K-216 depois dos 7 passos (decisão do dono, item 8), migração antes da API, nenhum valor de `PG_APONTAMENTO_URL` no texto.
- Três mensagens prontas sem credencial, e-mail ou nome de pessoa; nenhuma métrica individual nem comparação entre times; a de horas sem comentário diz que o painel não avalia pessoas. BusinessMap e Acelerato conferidos em separado na seção 4.

## Corrigido pelo revisor (commit 6cd30936; nome de comando e ordem)
- Passos 2, 3, 4, 6 e a seção 3: `ref-sync-calendario.ts`, `ref-sync-ac.ts`, `ref-sync-businessmap.ts` e `reprojetar-etapas-ac.ts` não carregam o `.env` (só `coleta-businessmap.ts` e os scripts `coleta.sh`/`db.sh` carregam); pelo `pnpm --filter` puro paravam com rc=1. Passaram a `(set -a; . ./.env; set +a; pnpm --filter ...)`, a forma já usada pelo dono no 076 (076-publicacao-local.md:24), e o "Como usar" explica.
- Seção 0: `systemctl disable --now` exige root (runbook-coleta-diaria.md:37, "como root ou com sudo"); ganhou `sudo`, e o `enable` da seção 4 também.
- Seção 0: "religar no passo 5" apontava para o reconhecimento do Acelerato; agora "seção 4".
- Seção 0: `grep -E "coleta|tsx"` casava com a API rodando por `tsx` e nunca esvaziaria; agora `grep "entradas/coleta"`, que pega as duas coletas.
- Passo 3: na dúvida sobre o último `ac:ref-sync`, "não rode" virou "pare aqui e só siga para o passo 4 depois da resposta".
- Seção 3: o "peça ao Jarvis para confirmar a data antes de rodar" estava no "se der erro", depois do comando; foi para antes dele.
- Seção 4: religar a agenda vinha antes das conferências e do "avise antes de religar"; agora confere, para se estranho e só então religa, com `list-timers` listando os 3.

## Detalhe dos achados
- A1: na VM a API sobe pelo Compose, que monta `PG_APONTAMENTO_URL` no próprio serviço a partir de `DSPD_PWD_APONTAMENTO` (docker-compose.yml:50). Uma linha `PG_APONTAMENTO_URL=` no `.env` da VM não chega ao contêiner, e o `grep -c` da conferência dá 1 com a aba quebrada ou com a senha padrão pública `apontamento_dev`. O passo precisa dizer a variável que o dono define na VM (`DSPD_PWD_APONTAMENTO` no `.env` de `/opt/metricas-dspd`, runbook-coleta-diaria.md:31) e como a senha do papel `dspd_api_apontamento` na base da VM passa a ser essa (`docker/postgres/reparar-papeis.sh`), sem valor nenhum. Muda o sentido do passo e é implantação na VM: volta ao devops-engineer.
- A2: na VM a migração é `docker compose run --rm migrate` (runbook-coleta-diaria.md:22), e a API do Compose já espera o `migrate` terminar (`depends_on: service_completed_successfully`). `pnpm run db:migrate` pressupõe pnpm e dependências no clone de root, que o runbook não prevê, e o passo 3 ("suba a API") não diz o comando. Escrever os comandos do Compose na ordem, com o que conferir.
- A3: os itens 2, 3, 4 e 6 da seção "Ações do dono na base real depois da release 104" do CHANGELOG trazem os mesmos comandos sem carregar o `.env`; avisar o E1.1 para alinhar com o roteiro corrigido.

## Delta (047757d4..b51cbe52)
Lido só o diff da seção 2 (K-216) de `docs/devops/104-roteiro-dono.md`, contra `docker-compose.yml` e `docs/devops/runbook-coleta-diaria.md`. `forge-check parecer delta`: intervalo e9bb171f..b51cbe52, "nenhum arquivo do domínio mudou" (o diff é só `.md`).

- A1 resolvido: o passo 1 manda conferir `DSPD_PWD_APONTAMENTO` no `.env` do Compose, sem valor, e diz que `PG_APONTAMENTO_URL` no arquivo não chega à API (docker-compose.yml:50; runbook-coleta-diaria.md:31).
- A2 resolvido: migração pelo serviço `migrate` (docker-compose.yml:31-38, roda `migrar.ts`, todas as migrações), antes da API; subida por `up -d --build api` com `ps` saudável (healthcheck em `/health/ready`, docker-compose.yml:57-62); aba na porta 8080 do serviço `web` (docker-compose.yml:98); logs da API no erro. Pasta `/opt/metricas-dspd` e nomes dos serviços conferem.
- A3 cortado pelo devops (E1.1 é outra etapa): aceito.

Corrigido pelo revisor (forma, sem mudar sentido):
- `sudo` em todos os `docker compose` da seção: o clone e o `.env` de `/opt/metricas-dspd` são de root com 600 (runbook-coleta-diaria.md:21, :45-46); sem root o Compose não lê o `.env` e as senhas viram as padrão.
- Passo 2: `docker compose run --rm migrate` virou `run --rm --build migrate`: o `run` usa a imagem `migrate` que já existe, construída na versão anterior, e daria rc=0 sem aplicar a 0034.

## Delta 2 (b750fbf0..a1896e54)
Lido só o diff de `docs/devops/104-roteiro-dono.md` (+42 −5), contra `docker-compose.yml`, `server/Dockerfile` (não há `Dockerfile` na raiz), `server/src/plataforma/config.ts`, os `src/entradas/*.ts` citados e `docs/devops/runbook-coleta-diaria.md`. `forge-check parecer delta`: intervalo b51cbe52..a1896e54, "nenhum arquivo do domínio mudou" (só `.md`). Nada rodado na VM nem na base real.

- A4 resolvido: o 0-B leva o clone à `main` com `fetch`, `checkout main`, `pull --ff-only` e conferência do commit, antes do passo 1, com a coleta parada; é o caminho do runbook (clone de root em `/opt/metricas-dspd` na versão liberada pelo dono, runbook-coleta-diaria.md:21; troca de versão por `git checkout` e `build`, :95). `--profile coleta build` refaz `migrate`, `api`, `worker`, `coleta` e `web` (docker-compose.yml:32, 42, 66, 79, 97; `coleta` só entra com o perfil, :78). A seção 2 recria `api` e `web` e pede o 0-B como pré-requisito.
- A5 resolvido: item 6 com a contagem em `pg_roles` (usuário `postgres`, base `metricas`, docker-compose.yml:10; socket local do contêiner) e os dois caminhos (senha divergente; papel ausente com `reparar-papeis.sh`), sem valor de senha.
- Conferem: passo 1 pelo serviço `migrate` (docker-compose.yml:31-35); passo 5 e seção 4 no serviço `coleta` com `src/entradas/coleta.ts ac` e o comando padrão `coleta-businessmap.ts incremental --projetar` (docker-compose.yml:80-81, runbook :11-12), que recebem `PG_COLETOR_URL` e `DSPD_PWD_REF` (:86-87); passo 6 no `migrate` com o comando trocado (o `server/Dockerfile` não tem `ENTRYPOINT`, então `node --import tsx src/entradas/reprojetar-etapas-ac.ts` substitui o `command`), e `reprojetar-etapas-ac.ts:13-14` lê só `PG_MIGRADOR_URL`, que só o `migrate` recebe (docker-compose.yml:35). Os arquivos de `docs/architecture/fontes/` que os ref-sync leem estão na imagem (server/Dockerfile:18).

Corrigido pelo revisor (forma, sem mudar sentido):
- 0-B, conferência do commit: `git log -1 --oneline` virou `sudo git log -1 --oneline`. O clone é de root (runbook-coleta-diaria.md:21) e o git recusa repositório de outro dono ("dubious ownership"); sem `sudo` o dono veria erro no lugar do commit.
- 0-B, imagens: "servidor (uma imagem só, usada por migrate, api, worker e coleta)" virou "o mesmo `server/Dockerfile` para ..."; o Compose constrói uma imagem por serviço (nenhum tem `image:`), todas do mesmo Dockerfile.

Detalhe do A6: os três ref-sync usam `carregarConfigRef` (server/src/entradas/ref-sync-calendario.ts:20, ref-sync-ac.ts:23, ref-sync-businessmap.ts:21), cujo esquema exige `PG_REF_URL` (server/src/plataforma/config.ts:72, 147) sem derivá-la de `DSPD_PWD_REF`; a derivação só existe no esquema da coleta do BusinessMap (config.ts:95-106). O `coleta` recebe só `PG_COLETOR_URL` e `DSPD_PWD_REF` (docker-compose.yml:86-87) e o `coleta.env` não traz `PG_REF_URL` (runbook-coleta-diaria.md:28): os três param em "Configuração inválida (variáveis: PG_REF_URL)" com rc=1 já no passo 2, e o passo 6 depende do calendário. Nenhum serviço do Compose recebe `PG_REF_URL`, e passá-la na linha de comando poria a senha do `dspd_ref` no histórico do shell. Caminho possível (decisão do devops-engineer): montar a URL dentro do contêiner a partir de `DSPD_PWD_REF`, com a senha codificada, ou mudar Compose ou config num item próprio de código, conferido com `docker compose config`.

## Achados
- A6 (bloqueante) docs/devops/104-roteiro-dono.md:65 · na VM os ref-sync dos passos 2, 3, 4 e da seção 3 (:76, :86, :139) rodam no serviço coleta, que não recebe PG_REF_URL (docker-compose.yml:86-87; config.ts:72): param com rc=1

## Achados da rodada anterior (b51cbe52)
- A4 (bloqueante) docs/devops/104-roteiro-dono.md:94 · nenhum passo leva o clone de /opt/metricas-dspd à release 104 antes do migrate (o build usa o clone, docker-compose.yml:32; runbook:95); sem isso a 0034 não sai e a aba falha. Escrever a atualização do clone e dizer se o web é refeito
- A5 (recomendado) docs/devops/104-roteiro-dono.md:100 · em volume anterior ao pedido 059 o papel dspd_api_apontamento não existe (docker/postgres/reparar-papeis.sh:2-3), e o script não troca senha de papel existente; citar essa causa no passo 5 para o Jarvis saber o caminho

## Achados da rodada anterior (047757d4)
- A1 (bloqueante) docs/devops/104-roteiro-dono.md:94 · na VM o Compose monta PG_APONTAMENTO_URL a partir de DSPD_PWD_APONTAMENTO (docker-compose.yml:50); a variável no .env não chega à API e o grep confere a coisa errada
- A2 (bloqueante) docs/devops/104-roteiro-dono.md:95 · na VM a migração e a subida da API são pelo Compose (runbook-coleta-diaria.md:22); pnpm run db:migrate não é o caminho e "suba a API" não tem comando
- A3 (recomendado) docs/devops/104-roteiro-dono.md:43 · o CHANGELOG da docs/104-release traz os comandos dos passos 2, 3, 4 e 6 sem carregar o .env; alinhar no E1.1

## Ferramentas
- `forge-check docs`: ver a prova do relatório (PQ-2). Sem código no diff: suíte, mutação e `shellcheck` não se aplicam.

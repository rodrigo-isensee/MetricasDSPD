---
tipo: review
contrato: 1
pedido: 104-release-2026-11-14
branch: docs/104-roteiro-dono
commit: e9bb171fa928339129c3205ac280f22cbe0c2fa1
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

## Achados
- A1 (bloqueante) docs/devops/104-roteiro-dono.md:94 · na VM o Compose monta PG_APONTAMENTO_URL a partir de DSPD_PWD_APONTAMENTO (docker-compose.yml:50); a variável no .env não chega à API e o grep confere a coisa errada
- A2 (bloqueante) docs/devops/104-roteiro-dono.md:95 · na VM a migração e a subida da API são pelo Compose (runbook-coleta-diaria.md:22); pnpm run db:migrate não é o caminho e "suba a API" não tem comando
- A3 (recomendado) docs/devops/104-roteiro-dono.md:43 · o CHANGELOG da docs/104-release traz os comandos dos passos 2, 3, 4 e 6 sem carregar o .env; alinhar no E1.1

## Ferramentas
- `forge-check docs`: ver a prova do relatório (PQ-2). Sem código no diff: suíte, mutação e `shellcheck` não se aplicam.

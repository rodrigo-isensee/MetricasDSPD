---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-test-pg-ambiente
commit: 944aa74c86daea77411965377cc82f9c528f13b9
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: test:pg com Postgres descartável por execução (105, K-392, E7.333)

Intervalo: `655029ad` (Base-sha) até `944aa74c`, um commit (`fix(test-pg): Postgres descartável por execução, senhas de um só lugar (K-392)`). 2 arquivos, +32/-6 (código: `scripts/test-pg.sh` +28/-6, dentro da orientação M14).

## O que foi conferido
- **Mecânica do descartável.** Projeto Compose `metricasdspd-teste-<8 hex>` (o `name:` do `docker-compose.yml` lê `COMPOSE_PROJECT_NAME`), então volume (`<projeto>_dspd-pg-data`) e contêiner são próprios; porta livre pedida ao SO; `POSTGRES_PASSWORD` aleatória por instância; `trap limpar EXIT` com `down -v --remove-orphans`. Sondas locais: o `trap` de EXIT não troca o código de saída (`exit 7` com `limpar` falhando sai 7) e o `TERM` passa por `exit 130` e roda a limpeza.
- **Senhas.** O script fixa os `DSPD_PWD_*` com padrão e exporta todos; o Compose (init `01-databases-papeis.sh`) e os testes (`process.env.DSPD_PWD_* ?? '<x>_dev'`) leem as mesmas variáveis, então não há mais divergência entre papel e teste dentro da execução. Os padrões literais seguem repetidos no `docker-compose.yml:12-19` e nos testes, mas como o script sempre exporta, no `test:pg` eles não entram.
- **CI.** Os jobs `banco` (`ci.yml:145`) e de `homolog.yml:123` chamam `pnpm --filter @metricas-dspd/server run test:pg` direto, sem o script: nada muda na CI.
- **Regras invioláveis.** Sem efeito em cálculo, fonte ou dado pessoal; nenhuma credencial real no código (valores `_dev` de desenvolvimento, já públicos no Compose e no `.env.example`).
- **shellcheck** em `scripts/test-pg.sh`: SC2164 na linha 8 (`cd` sem `|| exit`) e SC1091 informativo na 9; as duas linhas são anteriores ao diff.

## Suíte
Sem PR para a branch: a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. Cito o PQ do autor: `test:pg` completo sem `.env`, 342 de 342. Não rerrodei o SHA; rodei as sondas abaixo com `docker` e `pnpm` falsos.

## Achados
- A1 (bloqueante) scripts/test-pg.sh:9 · o `.env` carrega antes da guarda da linha 17 e o `.env.example:22` traz `PG_TESTE_URL`; com o `cp .env.example .env` do README, o script pula o descartável e volta ao `metricas_test` compartilhado na 5432 (S1).
- A2 (recomendado) docs/architecture/adr/0014-stack-tecnica-do-back-end.md:88 · nota de revisão datada: `test:pg` local em instância descartável por execução; prefixo e "sem Testcontainers" mantidos; CI no service container.
- A3 (recomendado) README.md:18 · ainda diz "no mesmo Postgres"; `docs/engineering/carga-da-pesquisa-de-percepcao.md:10` ensina reparar o `metricas_test` compartilhado (K-095), que o K-392 elimina.
- A4 (recomendado) docs/engineering/operacao-banco.md:104 · a CI não passa pelo script; reescrever o caso `PG_TESTE_URL` depois do A1 e dizer como limpar resto `metricasdspd-teste-*` após `SIGKILL`.

## Detalhe dos achados
- **A1.** O primeiro uso documentado (`README.md:18`, `docs/architecture/server.md:156`) é `cp .env.example .env`, e esse `.env` define `PG_TESTE_URL=postgres://dspd_migrador:migrador_dev@127.0.0.1:5432/metricas_test`: exatamente o ambiente que o K-392 quer eliminar. O autor provou só o caminho sem `.env` (S2). Sugestão: guardar `PG_TESTE_URL` do ambiente antes de carregar o `.env` e decidir por ela (só a CI ou quem a exporta explicitamente usa banco externo), ou um interruptor explícito; e tirar `PG_TESTE_URL` do `.env.example` (arquivo `.env*`, edição do tech-lead no retorno). Teste do ramo de falha: `.env` com `PG_TESTE_URL` e o `docker` falso tem de ser chamado.
- **A2.** As linhas 30, 77, 89-91 e 95 do ADR descrevem o "mesmo `postgres` do compose", o `metricas_test` compartilhado, senhas do `.env` e `db:limpar-testes` para restos. A decisão central não cai: o prefixo continua (o `globalSetup` o aplica, a CI depende dele, `DSPD_TESTE_MANTER` segue valendo) e Testcontainers segue fora (um contêiner por execução da suíte, não por teste). Nota curta do `software-architect` com o tech-lead, na mesma entrega, com critério de reversão: voltar ao compartilhado se subir o Postgres por execução passar a pesar no `pronto`.
- **A3.** Definição de pronto: documentação afetada atualizada na mesma entrega.
- **A4.** O `trap` não roda em `SIGKILL`; o resto sai com `docker compose -p <projeto> down -v`.

## Sondas
- S1 · cópia de `scripts/test-pg.sh` com `.env` = `.env.example`, `docker` e `pnpm` falsos, `env -i` · espera: `docker compose up` chamado e porta própria · obtido: `docker` não chamado; `pnpm PG_TESTE_URL=postgres://dspd_migrador:migrador_dev@127.0.0.1:5432/metricas_test COMPOSE_PROJECT_NAME=<vazio>`
- S2 · mesma cópia, sem `.env` · espera: descartável · obtido: `DOCKER CHAMADO: compose up -d --wait postgres`; `PG_TESTE_URL=...@127.0.0.1:33169/metricas_test COMPOSE_PROJECT_NAME=metricasdspd-teste-a01bbd55`

## ADR 0014
Precisa de nota (A2), não de ADR nova: a decisão (Compose, prefixo por execução, sem Testcontainers) se mantém e só o ambiente local passa a ser descartável. A nota é do arquiteto; não bloqueia este código, mas deve entrar antes do merge.

---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: efe4fb86203357427d789aff8198603595497494
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: configuração de produção da VM (E7.270, review E7.274)

## O que foi conferido
- Diff `ffc38fe7...efe4fb86`, 1 commit, 6 arquivos: `docker-compose.prod.yml` (novo), `deploy/sql/papeis-producao.sql` (novo), `docs/devops/105-implantacao-vm.md` (novo), `docs/devops/runbook-coleta-diaria.md`, `.env.example`, `CHANGELOG.md`. Sem código de aplicação nem teste; compose e SQL somam menos de 150 linhas (M14).
- **Sem senha padrão:** `docker compose -f docker-compose.prod.yml config -q` com ambiente vazio falha com `required variable DSPD_PWD_COLETOR is missing a value: defina DSPD_PWD_COLETOR`. Com valores fictícios (e `--profile coleta`) monta api, coleta, migrate, web e worker, sem serviço postgres, as 5 URLs com `sslmode=require`, portas da api e do web com `host_ip: 127.0.0.1`.
- **Papéis:** `papeis-producao.sql` espelha `docker/postgres/init/01-databases-papeis.sh` (mesmos papéis, `CONNECT`, `CREATE` do migrador, `REVOKE` do `public`), sem `metricas_test`; webhook, automação e pesquisa `NOLOGIN` e fora do `GRANT CONNECT`; senhas por `\getenv`, nenhuma no arquivo. Sem `PG_WEBHOOK_URL` no compose: webhook desligado, como pedido.
- **Regras invioláveis:** `APONTAMENTO_NOMES` fixo em `0`; segredos da coleta só no `coleta.env` (600) do host; nada de credencial versionada.
- **Pronto do autor:** histórico do pedido, 14:55, "efe4fb86, pronto verde". Sem PR para a branch: a suíte fica com o CI do PR; não afirmo CI verde.
- **Integração com a develop (PR 497 e 498):** `git merge-tree --write-tree origin/develop efe4fb86` dá `CONFLICT (add/add)` em `docs/devops/105-implantacao-vm.md` e `CONFLICT (content)` em `CHANGELOG.md`; `.env.example` e o runbook entram sozinhos. Ver A2.

## Achados
- A1 (bloqueante) docker-compose.prod.yml:15 · `sslmode=require` no `pg` 8 vale `verify-full` (S1) e o compose não recebe a CA (sem `NODE_EXTRA_CA_CERTS` nem volume do PEM): com CA privada da empresa o `migrate` não conecta. Corrigir: `verify-full` explícito, CA por variável e volume ro, texto do item 1.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:1 · conflito add/add com o documento do PR 497 e no `CHANGELOG.md`; o da develop exige `POSTGRES_PASSWORD` e senhas de webhook, automação e pesquisa. Fundir num documento só; a resolução volta ao review e à segurança.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:45 · `host.env` é opcional nas unidades systemd; sem `COMPOSE_FILE` a coleta usa o compose de desenvolvimento (postgres local, senhas `_dev`) em silêncio. Sugestão: `-f docker-compose.prod.yml` nas unidades. Cito à segurança (E7.275).
- A4 (recomendado) docker-compose.prod.yml:15 · senha crua na URL: `@`, `:`, `/`, `#` ou `%` quebram a conexão. Documentar senha segura para URL (`openssl rand -hex 32`).
- A5 (recomendado) deploy/sql/papeis-producao.sql:22 · sem transação nem `IF NOT EXISTS`: falha a partir do `CREATE DATABASE` deixa papéis criados e a reexecução para no primeiro `CREATE ROLE`. Dizer como retomar.

## Detalhe de A1
O documento (`105-implantacao-vm.md:11`) e o `.env.example:57` tratam `require` como TLS sem CA e `verify-full` como o modo com a CA da empresa. No `pg` 8 (pg-connection-string 2.14.1) os dois validam cadeia e nome do host com as CAs do Node; `DB_HOST` por IP fora do certificado também falha. Com `require`, o aviso de depreciação sai no log a cada conexão. Os dois textos precisam dizer o que cada modo faz no `pg` 8.

## Sondas
- S1 · `parse('postgres://u:x@db.empresa/metricas?sslmode=require')` (pg-connection-string 2.14.1) · espera: `require` sem verificar certificado, como diz o documento · obtido: `ssl: {}` igual ao de `verify-full`, com aviso "treated as aliases for 'verify-full'"

## Parecer
Reprovado por A1. A2 deve sair na mesma volta, por ser a integração que o merge vai exigir; A3 a A5 ficam a critério do autor, com A3 pendente da segurança.

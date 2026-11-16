---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 13d6d524
parecer: reprovado
resultado: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 2
bugs_baixos: 2
data: 2026-11-16
---
# QA: configuração de produção da VM (pedido 105, E7.288)

Branch `feature/105-vm-producao`, head 13d6d524 (merge sobre 9c3c2eba, o `Revisar-sha:` do brief; review e segurança aprovados). Ponto de vista de quem implanta: compose de produção, SQL gerado, roteiro de papéis e migrações num Postgres descartável, e o documento `docs/devops/105-implantacao-vm.md` conferido contra os arquivos. Sem credencial real e sem ler `.env`: senhas fictícias, Postgres 17 em contêiner próprio (`qa-vm-*`, apagado ao fim; o contêiner do projeto não foi tocado). Sem PR para a branch: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde e não rodou `pnpm run pronto`. O PQ do autor não foi rerrodado.

O que mudou no domínio do QA e não foi exercitado: `docker compose build` e `up` (imagens) e a conexão real da VM ao banco da empresa; só o cliente `pg` com TLS foi provado contra um Postgres com certificado de teste.

## Critério → teste → resultado

A especificação desta etapa é o brief e o documento de implantação; não há `CA-n` de UX. Cada linha abaixo é uma obrigação nomeada do brief (E7.270, E7.276, E7.246).

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Compose sem variável obrigatória falha com a mensagem (E7.270) | `docker compose -f docker-compose.prod.yml config -q` sem nada: rc 1, `required variable DSPD_PWD_API is missing a value: defina DSPD_PWD_API`; depois uma execução por variável faltando (`DB_HOST`, `DB_CA_ARQUIVO`, os cinco `DSPD_PWD_*`): as sete rc 1 com `defina <VAR>`; `DB_HOST=` vazio também rc 1 | variável ausente e variável vazia | passou |
| Compose com variáveis monta, sem postgres local, `verify-full`, CA só leitura, portas em loopback | `config` completo rc 0; serviços `migrate api web worker`; `image: postgres` 0; `sslmode=verify-full` 4 de 4 (nenhum outro modo); `ca.pem` montado `:ro` em migrate, api e worker; `host_ip: 127.0.0.1` em 3000 e 8080 | modo de TLS, porta exposta | passou |
| O uso do documento (`COMPOSE_FILE` + `COMPOSE_ENV_FILES`) funciona | `config -q` com os dois exportados e um `compose.env` fictício: rc 0; só com `COMPOSE_FILE`: falha com `defina DSPD_PWD_MIGRADOR` | env file ausente | passou |
| TLS `verify-full` é de fato exigente (E7.276) | cliente `pg` do repositório contra Postgres 17 com certificado de CA de teste (SAN `localhost`): host no certificado + CA conecta; sem a CA `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; IP fora do certificado `ERR_TLS_CERT_ALTNAME_INVALID`; `sslmode=require` também recusa (alias de `verify-full`, com aviso do `pg`) | CA errada, nome fora do certificado | passou |
| `pnpm run db:sql` gera o que está commitado (E7.246) | `pnpm run db:sql` (11 s): "39 migrações", "OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)", "OK: 39 migracoes registradas nos dois caminhos"; `git status` sem nenhum arquivo de `deploy/sql` alterado | geração determinística | passou |
| `00_papeis_e_banco.sql` do zero com as cinco senhas por ambiente | psql 17 no contêiner com `PWD_*` em `-e`: rc 0; 5 papéis LOGIN, 3 NOLOGIN, nenhum superusuário/createdb/createrole; senha só nos 5; `metricas` UTF8, `TimeZone=UTC`, ACL do banco só com os 5 de login e `CREATE` só ao migrador | papel sem senha, NOLOGIN, CONNECT | passou |
| Os oito papéis e o `public` fechados | `dspd_webhook` login: `not permitted to log in`; `dspd_api` cria em `public` e em `dspd_core`: `permission denied`; migrador cria em `public`: `permission denied`; NOLOGIN sem CONNECT em `metricas` (3 de 3 falso); `PUBLIC` sem GRANT em schema `dspd*` (0) | privilégio mínimo | passou |
| Migrações em ordem, como `dspd_migrador`, depois `9000_grants.sql` | 40 arquivos (`0000` a `0039`) aplicados um a um, 0 falhas; `9000` rc 0; `count(*)` em `dspd_core.pgmigrations` = 39; primeiras `0001_schemas`, `0002_bm_controle` | ordem, registro | passou |
| `consolidado.sql` em instalação nova | rc 0, 39 registros; reaplicar em banco já migrado falha (`relation "pgmigrations" already exists`) sem alterar nada, como o documento descreve (tudo ou nada) | repetição | passou |
| Variável de senha ausente "falha fechada" (cabeçalho do `00`) | só 4 de 5 `PWD_*`: falha (rc 3), mas só na 5ª linha, depois de criar 4 papéis com senha, e com `syntax error at or near ":"` | variável ausente | falhou parcialmente (A4) |
| "Recomeçar do zero" do documento (§6) | `DROP DATABASE IF EXISTS metricas` + `DROP ROLE IF EXISTS` nos oito: rc 0; roteiro `00` reaplicado rc 0 | recuperação de falha no meio | passou |
| `dspd_api` e `dspd_api_apontamento` sem coluna de pessoa (§6, linha 187) | `has_column_privilege` em `dspd_bm`, `dspd_ac`, `dspd_core`: `dspd_api` nenhuma; `dspd_api_apontamento` lê `fato_apontamento.pessoa_ref`, `apt_pessoa_time.pessoa_ref`, `dim_responsavel.pessoa_ref` e `dim_responsavel.responsavel_nome`; `dspd_api` sem INSERT/UPDATE/DELETE | coluna de pessoa | falhou no documento (A2); o banco tem o GRANT de propósito (`grants.ts:20`, `9000_grants.sql:411`) |
| Unidades systemd válidas | `systemd-analyze verify` nas 9 unidades copiadas: sem erro além do caminho `/opt` inexistente na máquina de teste; todas com `COMPOSE_FILE=docker-compose.prod.yml`, `COMPOSE_ENV_FILES` e `EnvironmentFile=/etc/metricas-dspd/host.env` (sem `-`) | env de produção | passou |
| Passos do documento batem com os arquivos | scripts `db:migrate`, `db:sql`, `coleta`, `stack:up`, `homolog:*` na raiz; os oito comandos do `server`; os 23 arquivos citados existem; horários dos timers 06:00, 06:30, dom 07:30 | referência quebrada | passou, com A1 e A3 |

## Achados

- A1 (recomendado) docs/devops/105-implantacao-vm.md:146 · a LACUNA diz que "nenhum timer" chama as referências, mas `deploy/systemd/metricas-referencias.timer` (domingo 05:00) existe e o runbook item 4 o liga. O `systemctl enable` da linha 106 e "3 timers" da linha 169 omitem esse quarto timer: quem segue o documento não o ativa.
- A2 (bloqueante) docs/devops/105-implantacao-vm.md:187 · "dspd_api e dspd_api_apontamento sem coluna de pessoa" é falso para o 2º: 9000_grants.sql:411 dá SELECT em dim_responsavel(pessoa_ref, responsavel_nome) e :403 em pessoa_ref. Provado por has_column_privilege. Corrigir o texto.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:55 · o texto diz que `PESSOA_ELIMINADA_SAL` "não está em nenhum `.env.example`" (e a linha 145 repete), mas `.env.example:46` traz `PESSOA_ELIMINADA_SAL=`.
- A4 (recomendado) deploy/sql/00_papeis_e_banco.sql:20 · com uma das cinco senhas ausente, o script não falha antes de agir: cria os papéis anteriores e falha com erro de sintaxe, sem nomear a variável (provado: 4 papéis criados). Checar as cinco no início, no gerador, e rodar db:sql.

## Bugs

Sem arquivo em `docs/qa/bugs/`: os quatro achados acima são o registro (A1 média, A2 média e bloqueante, A3 baixa, A4 baixa). Responsável: `devops-engineer` para o documento (A1 a A3) e o gerador (A4). A1, A3 e A4, se não corrigidos, viram cartão (`R-QA`). A4 é recuperável pelo roteiro do §6, que funciona (provado).

Observação, não é achado: os papéis de login conectam em `postgres` e `template1` pelo `CONNECT` padrão do `PUBLIC` (o `00` fecha só o banco `metricas`). É postura do servidor da empresa; o documento (item 5 da seção 5) pode pedir `REVOKE CONNECT` de `PUBLIC` nesses bancos, se quiserem.

## Provas

- Compose: as sete execuções com uma variável faltando rc 1; completo rc 0, sem `image: postgres`.
- `pnpm run db:sql`: `OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)`; árvore sem mudança em `deploy/sql`.
- Roteiro e migrações: 40 arquivos aplicados em ordem, `9000` rc 0, `pgmigrations` = 39.
- Vermelho antes do verde e mutação: não se aplicam; não há teste novo no pedido (configuração e SQL gerado).

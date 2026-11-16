---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 6aa86177
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
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

## Revalidação (volta 2, head d9f8bb9b)

`forge-check parecer delta` (intervalo 13d6d524..d9f8bb9b, sem o que veio da base): no domínio do QA só `CHANGELOG.md` (entrada do O12, de outra branch via develop) e o comentário de `deploy/systemd/metricas-referencias.service` (`docker-compose.yml` virou `docker-compose.prod.yml`, correto). O resto da volta 2 é documento (`docs/devops/105-implantacao-vm.md`), lido no diff e conferido contra os arquivos. Sem PR: não afirmo CI verde.

- A2 (bloqueante): resolvido. Linha 187 agora diz `dspd_api` sem coluna de pessoa e `dspd_api_apontamento` lê `responsavel_nome` e `pessoa_ref`, com nome eliminado pelo sal; bate com o `has_column_privilege` da 1ª rodada (`9000_grants.sql:403,411`).
- A1 (recomendado): resolvido. O `enable --now` (linha 106) e a linha 169 trazem os 4 timers; `metricas-referencias.timer` existe e é `Sun 05:00 America/Sao_Paulo`; a LACUNA da linha 146 já cita o timer. Observação menor, não bloqueia: o `list-timers 'metricas-coleta-*'` da linha 106 não lista `metricas-referencias.timer` (nome fora do padrão).
- A3 (recomendado): resolvido. Linhas 55 e 145 dizem que consta no `.env.example`; `.env.example:46` traz `PESSOA_ELIMINADA_SAL=`.
- A4 (recomendado): aberto, fora da volta 2 (`deploy/sql/00_papeis_e_banco.sql` e o gerador não mudaram). Recuperável pelo roteiro do §6. Vira cartão (`R-QA`), sem bloquear.

## Revalidação (volta 3, head 6aa86177)

`forge-check parecer delta` (intervalo d9f8bb9b..6aa86177): `delta: nenhum arquivo do domínio mudou`. A volta 3 mexeu só em `docs/devops/105-implantacao-vm.md` (3 linhas), lido no diff e conferido contra o código. Sem PR: não afirmo CI verde; não rerrodei o PQ do autor.

- Linha 187 (colunas de pessoa de `dspd_api_apontamento`): confere. `9000_grants.sql:403` dá `pessoa_ref` em `fato_apontamento`; `:411` dá `(pessoa_ref, responsavel_nome)` em `dim_responsavel`; o GRANT de `apt_pessoa_time(pessoa_ref, vigencia_ate)` também está no arquivo. `usuarios.ts:92,95` grava `responsavel_nome = u.nome`, então "nome real em claro" é verdade. O sal só alimenta o HMAC-SHA256 do `user_id` na lista `cfg_pessoa_eliminada` (`supressao.ts:7,13`); a eliminação a pedido apaga a linha de `dim_responsavel` e anula `pessoa_ref` no fato (`eliminacao.ts:89,90`). A redação nova bate com os quatro arquivos. A frase "com o nome eliminado pelo sal" da volta 2, que passou pelo QA e estava errada, saiu.
- Linha 146: sem contradição. `metricas-referencias.service` tem as quatro `ExecStart` (`ref-sync-businessmap`, `-ac`, `-calendario`, `-apontamento`); a ressalva de `bm:criterios-classe-servico` (papel migrador, manual) e da carga inicial bate com `runbook-coleta-diaria.md:19`, e a ADR 0022 item 4 trata só da carga inicial manual, como o texto diz.
- Linha 106: `list-timers 'metricas-*'` alcança os quatro timers; a nota sobre o padrão `metricas-coleta-*` está certa. A observação menor da volta 2 está resolvida.
- `forge-check docs`: rc 0.
- A4 segue aberto, fora desta volta (`00_papeis_e_banco.sql` não mudou); vira cartão (`R-QA`).

## Achados

- A4 (recomendado) deploy/sql/00_papeis_e_banco.sql:20 · com uma das cinco senhas ausente, o script cria os papéis anteriores e falha com erro de sintaxe sem nomear a variável. Aberto; vira cartão.

## Achados da 1ª rodada (histórico, A1 a A3 resolvidos)

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

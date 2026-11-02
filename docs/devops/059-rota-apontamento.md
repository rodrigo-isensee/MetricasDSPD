---
tipo: revisao-devops
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-rota-apontamento
commit: 58ef21982ca6e9ac40734b4ff95c84324d040578
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-02
---
# Review de devops: rota da aba Apontamento (pedido 059, E2.23 e E2.56, K-193)

## Renovação por delta (E2.56)
Base do delta: `8a92a498f5b5a71d7477d30dd12dcc7be995db66` (ponta do parecer anterior); ponta revisada: `58ef21982ca6e9ac40734b4ff95c84324d040578`. O parecer segue aprovado, e o campo `pedido` do frontmatter foi corrigido para `059-aba-apontamento`.
- **Infra no intervalo:** `git diff 8a92a49..58ef219` em `.github`, `docker`, `docker-compose.yml`, `docker-compose.homolog.yml`, `.env.example`, `.env.homolog.example`, `server/.env.example` e `web/.env.example` volta vazio. Workflows, compose, nginx, scripts de papéis e exemplos de env são os mesmos do parecer abaixo, e as conclusões valem sem mudança (`R-CUSTO`, `R-MAIN`, `R-VERIFY`).
- **Fora desses caminhos (leitura de devops, sem reabrir o mérito dos outros papéis):** `server/package.json` ganha três scripts manuais (`bm:apontamento`, `bm:eliminar-pessoa`, `bm:ref-sync-apontamento`), que nenhum workflow chama; `grants.ts` inclui `type_id` nas colunas do papel da aba; `config.ts` ganha dois esquemas de entrada que exigem `PESSOA_ELIMINADA_SAL`. Nenhum workflow nem compose passa essa variável, então CI e homologação não a usam, e a coleta do worklog não roda lá; o sal fica só no `.env` do dono (documentado em `docs/architecture/server.md`). Migrações 0029 a 0033 não mudam a mecânica de papéis: o `reparar-papeis.sh` continua cobrindo o papel da aba.
- **Ferramentas:** `shellcheck`, `actionlint` e `docker build` não rodaram de novo porque os arquivos não mudaram; `actionlint` e `docker build` seguem fora do PATH (lacuna, nada instalado).
- **Achados do parecer anterior:** os três recomendados continuam como estão, mais um novo abaixo; nenhum bloqueante.

## Parecer original (E2.23), sobre 8a92a49
Aprovado, sem achado bloqueante. Escopo: `git diff origin/develop...origin/feature/059-rota-apontamento` em `.github`, `docker`, `docker-compose.yml`, `docker-compose.homolog.yml` e os exemplos de env (10 arquivos, 38 linhas a mais, 12 a menos), lido por diff, sem rodar workflow nem suíte. Ferramentas: `shellcheck` nos dois scripts de papéis, sem aviso; `actionlint` e `docker build` não estão no PATH (lacuna registrada, nada instalado).

## O que muda
- **Workflows** (`ci.yml:133`, `homolog.yml:114` e `:242`, `restauracao.yml:32` e `:48`): só a variável `DSPD_PWD_APONTAMENTO`. Nos jobs de CI vale o valor de desenvolvimento fixo `apontamento_dev`, no mesmo padrão das outras seis senhas de papel (banco efêmero do runner, sem dado real). No portão de homologação (`homolog.yml:251`) a senha entra na lista gerada por `openssl rand -hex 16` a cada execução. Nenhum `permissions`, ação, gatilho, cache ou `timeout-minutes` mudou; nenhuma ação nova; nada de `continue-on-error`, `[skip ci]` ou teste pulado (`R-VERIFY`); nenhum passo escreve na `main` (`R-MAIN`). Custo: zero minuto novo (`R-CUSTO`).
- **Scripts de papéis**: `01-databases-papeis.sh` cria o papel `dspd_api_apontamento` com a senha passada por `psql -v` e variável de psql (`:'pwd_apontamento'`, citada pelo próprio psql), com `GRANT CONNECT` nos dois bancos. `reparar-papeis.sh` cria o papel se faltar (`WHERE NOT EXISTS` mais `\gexec` com `quote_literal`, idempotente), exige `DSPD_PWD_APONTAMENTO` com `:?` e concede CONNECT; a validação do nome do banco por regex continua. Sem SUPERUSER, CREATEDB nem herança de papel; os GRANTs por coluna ficam na migração, do dev da stack e do parecer de segurança E2.24.
- **Compose de desenvolvimento** (`docker-compose.yml:19` e `:48-52`): a senha entra no Postgres com padrão `apontamento_dev`; a API recebe `PG_APONTAMENTO_URL` com o papel próprio, `APONTAMENTO_NOMES` com padrão `0` (nome real desligado) e `APONTAMENTO_PUBLICACAO_LOOPBACK` fixo em `1`.
- **Compose de homologação** (`docker-compose.homolog.yml:21`): só a senha do papel, com `:?` (falha alto se faltar no `.env.homolog`). O serviço da API de homologação não recebe `PG_APONTAMENTO_URL` nem `APONTAMENTO_NOMES`, então a rota não existe e o nome real não liga lá (decisão do dono sobre P-1: nome real só no ambiente dele).
- **nginx** (`docker/web/nginx.conf:5`): `proxy_set_header Host $host` em `/api/`. Sem isso o proxy mandaria `Host: api:3000` à API e a validação 421 de Host/Origin da aba valeria sobre o nome interno, não sobre o que o navegador usou. `$host` é o cabeçalho do cliente sem a porta, em minúsculas, e não é campo novo de confiança: a API continua validando contra lista (421 fora dela). Não afeta `/health`, que não repassa o Host.
- **Exemplos de env**: `.env.example` e `.env.homolog.example` com `DSPD_PWD_APONTAMENTO=` vazio (sem valor real) e o bloco comentado da aba com o texto da guarda; `PG_APONTAMENTO_URL` de exemplo só com a senha de desenvolvimento e comentada. Nada em `server/.env.example` nem `web/.env.example` (não mudaram).

## Pontos pedidos no brief
- **`DSPD_PWD_APONTAMENTO` em workflows, compose e scripts**: consistente nos 8 pontos; todo uso é por nome de variável, sem valor real, nenhum `echo` da senha, nenhuma interpolação de entrada não confiável em `run:` (o laço do `homolog.yml:251` só lista nomes fixos). Sem segredo na imagem, em `ARG` ou `ENV` de Dockerfile (nenhum Dockerfile mudou).
- **`proxy_set_header Host`**: correto e mínimo; ver nginx acima.
- **API publicada só em 127.0.0.1**: `docker-compose.yml:54` (`127.0.0.1:${API_PORT:-3000}:3000`), `:76` (web) e `:20` (Postgres) seguem em loopback; nenhuma porta nova foi publicada. Compose de homologação idem (`127.0.0.1:${HOMOLOG_PG_PORT:-15432}`). O `APONTAMENTO_PUBLICACAO_LOOPBACK=1` fixo só é verdadeiro porque as portas são de loopback: quem mudar o `ports:` da API tem de revisar a variável (ver o achado de recomendação).
- **`APONTAMENTO_NOMES` só no compose de desenvolvimento**: confirmado por `git grep` na ponta: aparece só em `docker-compose.yml:51`, com padrão `0`; ausente de `.github/`, do compose de homologação e dos workflows. O CI e o portão de homologação sobem sem nome real.

## Achados
- docker-compose.yml:52 · `APONTAMENTO_PUBLICACAO_LOOPBACK` fixo em `"1"` declara a publicação em loopback sem derivar do `ports:`; se alguém publicar a API em outro endereço com `APONTAMENTO_NOMES=1`, a guarda de partida confia na declaração · deixar um comentário ao lado do `ports:` da API (`:54`) avisando que os dois andam juntos · recomendado
- docker-compose.yml:48-52 · com `APONTAMENTO_NOMES=1` a API escuta `0.0.0.0` no contêiner e qualquer outro contêiner da rede do compose alcança `api:3000` sem passar pela porta publicada; a defesa ali é só a validação de Host/Origin (421) · o parecer de segurança E2.24 decide se basta; nenhuma mudança de devops agora · recomendado
- docker/postgres/reparar-papeis.sh:10 · volume antigo precisa rodar o script com `DSPD_PWD_APONTAMENTO` antes do `db:migrate`, senão a migração que concede GRANT ao papel falha por papel inexistente; já está como ação do dono no relatório da E2.16 · repetir a ordem na descrição do PR de integração · recomendado
- .env.example · falta a linha `PESSOA_ELIMINADA_SAL=` vazia, exigida por `bm:apontamento` e `bm:eliminar-pessoa` (guarda de partida) · o tech-lead acrescenta na integração, como já decidido; sem valor real no exemplo · recomendado

## Custo e rollback
- Custo: nenhum minuto de CI novo, nenhum recurso novo, nenhum serviço pago (`R-CUSTO`).
- Rollback: reverter o merge da branch devolve workflows, compose, nginx e scripts ao estado anterior. O papel `dspd_api_apontamento` criado num volume existente fica órfão e inofensivo (só CONNECT mais GRANTs por coluna da migração); remoção, se desejada, é `DROP OWNED BY` e `DROP ROLE` pelo administrador depois de reverter a migração com o caminho de volta do dev da stack. Reversão do nginx é imediata (recarregar a imagem `web`).
- Mudança em `.github/` exige o rótulo `afrouxa-regra` do dono no PR (aviso ao `tech-lead`); o ruleset e os checks exigidos não são afetados (nomes de job preservados).

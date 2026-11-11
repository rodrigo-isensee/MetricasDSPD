# Demo com dado real: um comando

Pedido 087, E4.1 (K-258). Quem roda é o **dono**, com o `.env` dele, no checkout da `main` (depois do merge) ou da branch combinada com o Jarvis. O time não tem o `.env` e nunca roda isto contra a base real.

```
pnpm run demo:dado-real
```

Primeira coleta do Acelerato depois do L9-c (o `ac:` recusa com a categoria `parametros-mudaram`): rode de novo com a opção, que o script repassa só à etapa do Acelerato.

```
pnpm run demo:dado-real -- --reconhecer-mudanca
```

## O que roda, nesta ordem (para no primeiro erro)

| # | Etapa | Comando reusado | Fonte externa |
|---|---|---|---|
| 1 | Confere o `.env` (só os **nomes** das variáveis; nenhum valor é lido para a tela) | `grep` no próprio script | nenhuma |
| 2 | Sobe o PostgreSQL do Compose (volume de dev) | `docker compose up -d --wait postgres` | nenhuma |
| 3 | Migrações até a última (antes da API: o aviso de registro incompleto lê `ctl_apontamento_cobertura`) | `scripts/db.sh migrate` (`pnpm run db:migrate`) | nenhuma |
| 4 | Dicionários versionados no repositório | `bm:ref-sync`, `bm:ref-sync-apontamento`, `ac:ref-sync` | nenhuma |
| 5 | Carga inicial do BusinessMap | `bm:coleta carga-inicial` | BusinessMap, só GET |
| 6 | Carga inicial do Acelerato | `scripts/coleta.sh ac [--reconhecer-mudanca]` (inclui a projeção do Acelerato) | Acelerato, só leitura |
| 7 | Carga inicial do apontamento | `bm:apontamento carga-inicial` | BusinessMap, só GET `/loggedTime` |
| 8 | Projeção do BusinessMap | `bm:projetar` | nenhuma |
| 9 | Sobe API e web (build, espera de saúde) | `docker compose up -d --build --wait api web` | nenhuma |
| 10 | Consulta de prova do 075 | `psql` no contêiner, papel `dspd_coletor` | nenhuma |

Diferenças do `pnpm run homolog:subir`, de propósito: a homologação usa outro Compose (`docker-compose.homolog.yml`, `.env.homolog`, portas 15432/13000/18080) e **semeia dado mock**; a demo usa o Compose da raiz e o `.env`, **sem seed**, nas portas `PG_PORT` (5432), `API_PORT` (3000) e `WEB_PORT` (8080), todas só em `127.0.0.1`. Base que já recebeu seed é recusada pela coleta (`esquema-com-seed`): rode antes `pnpm --filter @metricas-dspd/server run db:limpar-seed` (decisão do dono; o script não limpa nada).

## Antes de rodar

- `.env` com as variáveis de senha dos papéis (`DSPD_PWD_MIGRADOR`, `DSPD_PWD_COLETOR`, `DSPD_PWD_API`, `DSPD_PWD_REF`, `DSPD_PWD_APONTAMENTO`), do BusinessMap (`BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `PESSOA_ELIMINADA_SAL`) e do Acelerato (`ACELERATO_MYSQL_HOST`, `_PORT`, `_DATABASE`, `_USER`, `_PASSWORD`, `_TLS_SHA256`, `_TLS_CERT_FILE`). Falta alguma: o script para na etapa 1 e lista só os nomes.
- Atenção, `.env` anterior à mudança: quem o configurou antes tem os nomes antigos das variáveis do Acelerato e precisa renomear as quatro (só o nome muda; o valor fica como está):

  | Nome antigo | Nome novo |
  | --- | --- |
  | `ACELERATO_MYSQL_PORTA` | `ACELERATO_MYSQL_PORT` |
  | `ACELERATO_MYSQL_BANCO` | `ACELERATO_MYSQL_DATABASE` |
  | `ACELERATO_MYSQL_USUARIO` | `ACELERATO_MYSQL_USER` |
  | `ACELERATO_MYSQL_SENHA` | `ACELERATO_MYSQL_PASSWORD` |

- Docker com o plugin Compose; a porta do Postgres livre.
- Dados que são de pessoas e não do código (calendário/feriados via `ref:sync-calendario`, domínios do BusinessMap e campos do Acelerato) já preenchidos; o script não os cria.

## Quanto tempo leva

Não medido: o time não tem acesso às fontes. Esperar de minutos a algumas dezenas de minutos, dominado pelas etapas 5 a 7 (limite de 25 chamadas por minuto ao BusinessMap) e pelo build das imagens na etapa 9. O dono anota a duração na devolução abaixo; o runbook da coleta diária pede a mesma medida.

## Se falhar

A mensagem traz a etapa e a categoria (`env`, `docker`, `migracao`, `referencia`, `coleta`, `projecao`, `consulta`) e nunca valor de credencial. Se a etapa 1 (`env`) falhar, ela lista os nomes que faltam: com um `.env` antigo, são os quatro nomes novos da tabela acima. As cargas são repetíveis (marca d'água, staging idempotente, trava por fonte): corrija e rode de novo o mesmo comando; as etapas já feitas passam rápido. Não há `--force` nem passo que apague dado.

## O que o dono devolve ao Jarvis

1. A saída da etapa 10, três valores: `fato_bloqueio` (esperado > 0), `evt_bloqueio_fim` (esperado pelo menos 1; se der 0 com cards sabidamente bloqueados e desbloqueados, o Lote 6b para e vira pergunta ao dono) e `primeira_coleta_stg_card` (vira a data da versão de critério do 075).
2. A duração total e a etapa que mais demorou.
3. Se precisou de `--reconhecer-mudanca`.
4. Qualquer mensagem de erro (etapa e categoria bastam; sem credencial, nome, e-mail nem texto de chamado).

Nada disso carrega nome, e-mail nem texto livre: a consulta só conta linhas e pega um instante.

## Consultas só de leitura dos pedidos 098 e 099 (K-275)

Um comando que roda, na demo do dono, as consultas que o arquiteto escreveu em `docs/analises/099-revisao-campos.md` §3 (B2-a a B6-c, as de banco), `docs/analises/098-discovery.md` §1 (C-AC1 a C-AC4, C-BM1 a C-BM5) e `docs/analises/099-dado-real-operacional.md` §5 (Q-RO-1 a Q-RO-11, com a 6b). Quem roda é o **dono**; o time nunca roda isto contra a base real.

```
pnpm run consultas:098-099            # PostgreSQL da demo e MySQL do Acelerato
pnpm run consultas:098-099 -- --so-pg
pnpm run consultas:098-099 -- --so-mysql
```

- **Saída:** `consultas-098-099-<data>.txt` na pasta de **onde** o comando foi chamado (com `pnpm`, a pasta em que você digitou o comando, por `INIT_CWD`; chamando o script direto, a pasta corrente). Chamado de dentro do repositório, o script grava a saída na pasta pessoal (`$HOME`) e avisa, para ela nunca cair num `git add -A`; o `.gitignore` também cobre `consultas-098-099-*.txt`. Para escolher a pasta, rode de fora dele: `cd /mnt/d/consultas && bash <projeto>/scripts/consultas-leitura-098-099.sh`. Cada consulta aparece sob `## <id> (fonte; análise e seção)`, na ordem dos arquivos `scripts/sql/consultas-098-099/NN-<id>.sql` (B, depois C, depois Q), com o texto copiado das análises (sem mudança de sentido; os `-- ` de comentário e o rótulo `(*)` foram mantidos).
- **PostgreSQL:** pelo contêiner do Compose, como a etapa 10 da demo: papel `dspd_coletor`, senha só por ambiente, sessão `default_transaction_read_only=on`, `statement_timeout` de 120 s e cada consulta dentro de `BEGIN READ ONLY ... ROLLBACK`. Pede só `DSPD_PWD_COLETOR` no `.env`.
- **MySQL:** a conta só leitura da coleta (`ACELERATO_MYSQL_*`), `SET SESSION TRANSACTION READ ONLY`, `START TRANSACTION READ ONLY`, `max_execution_time` de 120 s e `ROLLBACK`. A senha vai num arquivo temporário `0600` apagado no fim (nunca no argv). O script confere a impressão SHA-256 do certificado (`ACELERATO_MYSQL_TLS_CERT_FILE`) contra `ACELERATO_MYSQL_TLS_SHA256` antes de conectar e o cliente fixa o certificado **recebido** do servidor por `ssl-fp` com essa impressão (TLS obrigatório). O cliente roda com `--sandbox` e `--defaults-file` (um `~/.my.cnf` seu nunca é lido). **A verificação do certificado nunca se desliga:** se o MySQL falhar por TLS, não tire o `ssl-fp` nem ligue texto puro; leve o caso ao time (alternativa: as consultas MySQL pelo driver Node com `opcoesSsl`). Na primeira execução confirme que o cliente aceita a impressão SHA-256; se não aceitar, a conexão falha (não abre). Pede o cliente `mysql` (ou `mariadb`) e o `openssl` no PATH.
- **Guarda de colunas:** cada `.sql` declara `-- COLUNAS: nome:tipo,...` (`numero`, `data` ou `dominio`; chaves de domínio contam como `numero`). A saída só entra no arquivo se o cabeçalho for exatamente esse, nenhuma coluna for de pessoa ou texto livre (e-mail, `usuarioKey`, solicitante, agente, responsável, título, descrição) e cada valor cumprir o tipo: `numero` só dígitos, `data` só data, `dominio` com até 120 caracteres e sem `@`. Falhou: a consulta é **recusada** e o arquivo recebe só o motivo (coluna e linha), nunca o valor. O próprio `.sql` passa por uma **lista do que é permitido** antes de rodar: um único `SELECT` ou `WITH` por arquivo, um único `;` e só no fim, nenhuma barra invertida (meta-comando do cliente) e nenhuma palavra de escrita, DDL, sessão ou comando do cliente (`SET`, `DO`, `EXECUTE`, `COMMIT`, `system`, `source`, `INTO`, `SLEEP` e as demais do script). O `psql` roda com `-X` (sem `.psqlrc`). Fora da lista, a consulta é recusada sem tocar no banco. Texto de erro de driver nunca é impresso, só o código de saída.
- **O que a guarda não pega:** um nome de **domínio** (equipe, organização, tag, etapa, campo) que alguém escreveu com nome de pessoa ou de cliente passa como domínio. Por isso o dono confere a saída antes de colar qualquer coisa e apaga o que for nome de pessoa (regra das próprias análises).
- **Fora do comando, de propósito:** B1-b e B3-b (API do BusinessMap por `curl`, com a apikey), B3-a (`pnpm run bm:diagnostico`, já existe) e C-AC5 (precisa das listas de tipo, organização e equipe que o dono escolhe depois de C-AC1 a C-AC4; o `/*tipos*/` não é consulta pronta). B1-a e B1-c não são consultas. Q-RO-10 tem duas variantes (`10a` em `campos_personalizados`, `10b` em `campos_personalizados_etapa`), rodadas em separado pelo erro 1271 do `UNION`.
- **Prefixo de esquema:** as consultas usam `dspd_bm` e `dspd_ac` literais (a demo não usa `DSPD_SCHEMA_PREFIXO`). As marcadas `(*)` leem `payload` do staging ou colunas que o arquiteto não confirmou no DDL: uma que falhe aparece como `falhou <id> (codigo N)` e as outras seguem; o script termina com código 1 se alguma falhou ou foi recusada.
- **Teste:** `bash scripts/consultas-leitura-098-099.test.sh` (também em `pnpm run test:trava`), com `docker` e `mysql` falsos: sem base real.

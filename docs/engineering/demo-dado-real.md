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

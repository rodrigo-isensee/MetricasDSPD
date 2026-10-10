# 0013 - Back-end: monólito modular em Node, publicado como funções serverless na AWS
- Status: **aceita** (decisões do usuário em 2026-10-10, confirmadas ao Jarvis para reconciliação com a `main`)
- Data: 2026-10-10
- Origem: proposta escrita em outra sessão com o usuário, preservada sem alteração em `docs/architecture/propostas/serverless-outra-sessao/` (lá numerada 0004, número que já existia na `main`). Pedidos do usuário, nesta ordem: (1) "arquitetura modular com microsserviços dentro dos módulos, padrão serverless"; (2) "AWS; os dados do Acelerato vêm de uma tabela no Metabase, puxada uma vez ao dia; o SSO será informado"; (3) **"mantenha a arquitetura simples, com o melhor que podemos para Node, mas simples"**. Uma primeira versão (barramento de eventos, outbox, filas, um workspace e uma função por responsabilidade) foi descartada pela instrução (3), antes de qualquer código.
- Pedido: `docs/pedidos/002-arquitetura-completa.md`
- **Substitui:** ADR 0006 (processos, agendamento, automações), ADR 0008 (framework e execução), ADR 0010 (implantação e CI), exceto o que está listado em "Continua valendo".
- **Substitui parcialmente:** ADR 0004 (leitura do Acelerato e onde roda o MySQL), ADR 0005 (conexão do Acelerato), ADR 0007 (rotas Fastify e `@fastify/swagger`), ADR 0009 (biblioteca de sessão e "mesmo proxy").
- Complementa: ADR 0002 (o `server/` continua **um** workspace), ADR 0003 (M3 ajustado ao Metabase, S1 novo).
- Visão geral: `docs/architecture/overview.md` · Modelo: `docs/architecture/data-model.md`

## Contexto
- **Carga pequena e previsível:** coleta diária, webhook esporádico do BusinessMap, poucos usuários internos, milhares de cards e chamados (o mock tem cerca de 6 mil de cada). Nenhum problema de escala justifica serviços distribuídos.
- **Time pequeno:** cada peça a mais (fila, barramento, outbox, deploys independentes) custa mais em operação e depuração do que devolve.
- **AWS é o provedor** (resposta do usuário, fecha I-1, I-2, I-8, I-10, I-11). Serverless serve porque o sistema fica quase sempre ocioso.
- **Acelerato via Metabase:** a fonte deixa de ser o MySQL `acelerato_dev_corporativo` e passa a ser uma tabela no Metabase, lida uma vez ao dia, só leitura (substitui I-4).
- **O que já existe na `main` continua:** pacotes `contratos`, `metricas` (biblioteca única, T2.5) e `mock`; o front com a porta `FonteMetricas`; no `server/`, Kysely + `mysql2`, as migrações 0001–0010 dos schemas `dspd_bm`, `dspd_ac`, `dspd_core`, os usuários por papel (`grants.ts`), o seed e o estado de coleta (`src/coletas/`). **Não há servidor HTTP implementado** (nem Fastify), então a troca de framework não tem custo de migração.

## Decisão

### 1. Forma: um back-end, módulos em pastas, duas funções
- `server/` é **um** workspace npm (`@metricas-dspd/server`), um código e um build.
- Dentro dele, **módulos por assunto em pastas**, cada um com API pública em `index.ts`. Módulo não importa arquivo interno de outro; o lint garante.
- O mesmo código é publicado em **duas Lambdas**, separadas porque gatilho, tempo máximo e risco são diferentes:

| Lambda | Gatilho | Faz | Timeout | Usuário MySQL |
|---|---|---|---|---|
| `api` | API Gateway HTTP (`/api/v1/*` e `/webhooks/businessmap`) | métricas, `/fontes`, referência, preferências **e** o webhook do BusinessMap (só valida o segredo, grava `stg_webhook_evento` e responde 202, K4) | 30 s | `dspd_api` + `dspd_webhook` |
| `coleta` | EventBridge Scheduler: `{ fonte: 'bm' }` e `{ fonte: 'ac' }` diários; `{ fonte: 'bm', tarefa: 'varredura' }` semanal | coleta → normalização → projeção → registro em `ctl_coleta`, **uma fonte por invocação** (falha ou atraso de uma não afeta a outra, CA-10) | 15 min | `dspd_coletor` |

- Função operacional, sem gatilho: `migrar`, invocada só pelo pipeline de deploy, com o usuário `dspd_migrador` (o RDS é privado; o runner do GitHub não alcança o banco). Não é um serviço: é o `npm run migrate` empacotado.
- **Localmente:** um processo Node (`npm run dev -w @metricas-dspd/server`) com o mesmo app HTTP, mais `npm run coleta -w @metricas-dspd/server -- bm|ac`. MySQL 8.4 em Docker (já decidido, `server.md`).

### 2. Módulos e onde cada um grava
A proposta original previa um banco com prefixo por módulo (`bm_`, `ac_`, `ref_`, `ops_`, `pref_`). Na reconciliação **ficam os três schemas já migrados** (ADR 0004): mesma garantia, com grants por schema, e sem refazer código.

| Módulo (`server/src/modulos/`) | Responsabilidade | Tabelas |
|---|---|---|
| `businessmap` | API REST v2, webhook, staging append-only, normalização, projeções (`dim_card`, `fato_transicao`, `fato_bloqueio`), marcos (T2.2–T2.4), reconciliação webhook × revisions | `dspd_bm.*` (lê `dspd_core.ref_*`) |
| `acelerato` | extração diária da tabela do Metabase, staging append-only, projeções e views do recorte (T5.1) | `dspd_ac.*` (lê `dspd_core.ref_*`) |
| `referencia` | calendário, feriados, domínios com vigência, critérios (T2.6), `ref:sync` | `dspd_core.ref_*`, `ref_*` de cada schema |
| `metricas` | monta `BaseBM`/`BaseAC` das projeções e chama `@metricas-dspd/metricas`; cache em memória | só leitura |
| `operacao` | estado e histórico de coleta para `/fontes` e selos de frescor (hoje `src/coletas/`) | `ctl_*` de cada schema, uma consulta por fonte |
| `preferencias` | preferências de métricas do próprio usuário (pedido 007) | `dspd_core.pref_*` (a modelar no plano do 007) |

As automações da T4.3 ficam **fora** até existir meio de escrita no Acelerato (P4/I-6). Quando voltarem, entram por ADR própria (provável terceira Lambda, com credencial própria).

Estrutura (sem cerimônia):
```
server/
  migrations/         migrações Kysely já existentes (0001..), SQL explícito
  src/
    app.ts            monta o Hono com as rotas de todos os módulos
    plataforma/       config (env validado com zod), db (Kysely + mysql2), log (pino), erros, auth
    modulos/<m>/      index.ts · rotas.ts · servico.ts · repositorio.ts · cliente-api.ts (só coleta) · *.test.ts
    entradas/         lambda-api.ts · lambda-coleta.ts · lambda-migrar.ts · local.ts · coleta-cli.ts
infra/                AWS CDK em TypeScript, uma stack
```

### 3. Da coleta à métrica (sem barramento)
1. A agenda chama `coleta` com `{ fonte: 'bm' }`. `businessmap` pega `GET_LOCK('dspd:bm', 0)`, lê desde a marca d'água menos a sobreposição, grava o staging (idempotente por chave natural; só o erro 1062 conta como já existente), normaliza (inclusive o webhook acumulado), projeta e fecha `ctl_coleta`. Tudo em chamadas de função, no mesmo processo. Contrato de execução, retentativas e timeouts da ADR 0006 continuam.
2. Igual para `{ fonte: 'ac' }` com `acelerato`, lendo o Metabase.
3. **Versão de carga** = último `coleta_id` com `status = 'sucesso'` do schema da fonte (já existe em `ctl_coleta`; sem tabela nova).
4. Na `api`, `metricas` monta a base da fonte na primeira requisição, cria o contexto da biblioteca e guarda resultados em memória com chave `(metricaId, filtros normalizados, versão de carga)`. A versão é relida a cada 60 s; mudou, o cache se renova.
5. O webhook não é processado a cada minuto (como na ADR 0006): a normalização acontece na coleta seguinte, junto da reconciliação (T2.3).

Sem snapshot em S3, fila nem eventos. Se a partida a frio estourar S1: primeiro, concorrência provisionada de 1 na `api`; depois, gravar a base montada como blob.

### 4. Acelerato pelo Metabase
- **API do Metabase** com chave de API (`x-api-key`) de usuário só de leitura, no Secrets Manager (no dev, `.env`). A consulta sai de uma pergunta salva (*card*) com exportação JSON (`POST /api/card/:id/query/json`), sem o limite de 2.000 linhas da consulta interativa.
- **Histórico sem sobrescrever:** cada linha extraída ganha hash. Linha nova = registro novo; hash diferente = nova versão (SCD2); linha que some = registro de ausência, nunca apagada (data-model §4).
- **Contrato da tabela:** schema zod por coluna. Coluna faltando, renomeada ou com tipo diferente faz a coleta **falhar com aviso** em `/fontes/acelerato/estado`, sem carregar dado torto. O SQL da pergunta fica versionado em `docs/architecture/fontes/acelerato-metabase.sql`; mudar o SQL é mudança de critério (T2.6).
- Pendências P5–P10 abaixo. **Nenhuma métrica de sustentação é implementada sobre suposição.**

### 5. Escolhas de Node e TypeScript
| Tema | Escolha | Por quê |
|---|---|---|
| Runtime | Node 24 LTS (`nodejs24.x`, ou a LTS suportada mais recente) | igual ao dev |
| HTTP | **Hono** + `@hono/zod-validator`; `hono/aws-lambda` na Lambda, `@hono/node-server` local | leve (partida a frio curta), mesmo app nos dois lugares, valida com os schemas de `contratos` |
| Banco | **Kysely** + `mysql2` (ADR 0005, sem mudança) | SQL tipado, migrações próprias |
| Validação | **zod 4** em toda fronteira: HTTP, env, respostas do BusinessMap e do Metabase | erro de formato aparece na borda |
| Log | **pino** JSON, `requestId` por requisição, `execucaoId` (= `coleta_id`) por coleta, redação de segredos | CloudWatch sem configuração |
| Erros | formato da ADR 0007 (`{ error: { code, message, details? } }`), sem detalhe sensível (CA-15) | o front já consome esse formato; a proposta sugeria problem+json (RFC 9457), **não adotado** para não mudar contrato |
| OpenAPI | gerado dos schemas zod das rotas (`hono-openapi` ou `@hono/zod-openapi`), versionado em `docs/api/openapi.json` | substitui `@fastify/swagger` (ADR 0007) |
| Testes | **Vitest**; serviço com dependências falsas; repositório contra MySQL em Docker; rotas com `app.request()` | sem servidor de pé |
| Build | **esbuild**, um pacote por entrada; pacotes internos inlinados | TS-fonte (ADR 0002) |
| Estilo | funções e módulos ES, sem classes de serviço nem contêiner de DI; tempo por parâmetro (`agora`) | mesmo padrão da biblioteca |
| IaC | **AWS CDK** em TypeScript, uma stack | mesma linguagem |

### 6. Infraestrutura na AWS
| Peça | Serviço |
|---|---|
| Front (SPA) | S3 + CloudFront; `/api/*` (e `/auth/*`, se BFF) roteados ao API Gateway na mesma origem, sem CORS |
| API | API Gateway HTTP API → Lambda `api` (concorrência reservada 10) |
| Coleta | EventBridge Scheduler (fuso `America/Sao_Paulo`) → Lambda `coleta` |
| Banco | **RDS MySQL 8.4**, privado na VPC, backup automático com recuperação pontual (fecha I-14 por padrão) |
| Saída para a internet | NAT Gateway com IP fixo (BusinessMap, Metabase, liberação em firewall se preciso) |
| Segredos | Secrets Manager: apikey do BusinessMap, chave do Metabase, segredo do webhook, senhas dos usuários MySQL por papel |
| Observabilidade | CloudWatch Logs; alarme por coleta falha ou sem `sucesso` em 26 h, por fonte; 5xx > 1 % em 5 min; aviso via SNS para o canal do I-7 |
| Autenticação | SSO corporativo (P3, aguardando o usuário); ver §8 |

Sem RDS Proxy por enquanto: concorrência 10 na `api` × pool de 2 + `coleta` ≈ 22 conexões. Se crescer, entra o proxy.

### 7. Ambientes e pipeline
| Ambiente | Onde | Dados | Autenticação |
|---|---|---|---|
| local | Docker (MySQL 8.4) + `npm run dev` | seed do mock | autenticador falso |
| CI | GitHub Actions, MySQL 8.4 como `services` | seed do mock | autenticador falso |
| homologação | conta/estágio AWS de homologação (P11) | coletas reais, só leitura | SSO |
| produção | conta/estágio AWS de produção (P11) | coletas reais | SSO |

Jobs `check`, `db`, `e2e`, `openapi` da ADR 0010 continuam. `imagem` e o runner interno saem. `deploy` (manual para homologação, com aprovação para produção): o GitHub assume um papel na AWS por **OIDC** (sem chave de longo prazo), `cdk deploy`, invoca `migrar`, roda `ref:sync`, publica o `web/dist` no S3 e invalida o CloudFront. Migrações seguem expandir → migrar → contrair; snapshot do RDS antes de cada migração em produção.

### 8. Autenticação (pendente do SSO, P3)
O mecanismo fecha quando o SSO for informado. As duas formas cabem na Lambda `api`:
- **Recomendação da proposta:** OIDC com PKCE no front e JWT validado pelo autorizador do API Gateway (sem estado na API).
- **ADR 0009:** OIDC no servidor (BFF) com cookie `httpOnly`; com Hono, `hono/cookie` com cookie assinado e cifrado no lugar de `@fastify/secure-session`. Vantagem: o SPA nunca vê token.
Continua valendo da ADR 0009 em qualquer caso: papel único `leitor`, `sub` só como HMAC, nenhum nome ou e-mail persistido, autenticador falso proibido em produção.

### 9. Fronteiras garantidas por lint (somam-se às da ADR 0002)
| Onde | Proibido |
|---|---|
| `server/src/modulos/<a>/**` | importar arquivos internos de `<b>` (só `modulos/<b>/index.ts`) |
| `modulos/businessmap/**` ↔ `modulos/acelerato/**` | qualquer import entre os dois, nem pelo `index.ts` |
| repositórios de `businessmap` / `acelerato` | SQL em `dspd_ac` / `dspd_bm`, respectivamente (teste que lista os schemas usados por repositório, somado ao teste de esquema da ADR 0004) |
| `server/src/**` fora de `modulos/metricas` | importar a raiz de `@metricas-dspd/metricas` (`businessmap` pode usar `/core` e `/businessmap` para marcos; `acelerato`, `/core` e `/acelerato`; `operacao`, `/core`) |
| `server/src/**` fora do seed e dos testes de paridade | importar `@metricas-dspd/mock` |
| `servico.ts`, `repositorio.ts` | `Date.now`, `new Date()` sem argumento, `Math.random` |

### Continua valendo
- **ADR 0004:** MySQL 8.4, três schemas, `DATETIME(3)` UTC, "o banco seleciona, a biblioteca calcula", usuários por papel, proibição de `INSERT IGNORE`/`ON DUPLICATE KEY`.
- **ADR 0005:** Kysely + migrações em SQL explícito com `down`, `kysely-codegen`, seed.
- **ADR 0006:** contrato de execução (marca d'água só avança em sucesso, contagens, `ctl_coleta_falha`, retentativa com backoff e `Retry-After`, timeouts), `GET_LOCK` por fonte, webhook só grava staging com hash único, regras da T4.3 para quando ela voltar.
- **ADR 0007:** contratos zod únicos, entrada `strict`, saída validada, paridade, `/api/v1`, formato de erro.
- **ADR 0008:** pino com `requestId` e redação, cache por chave, esbuild, `/health/live` e `/health/ready`, Vitest.
- **ADR 0010:** jobs de CI, migrações compatíveis com a versão anterior, alertas.

## Alternativas consideradas
- **Primeira versão da proposta** (sete workspaces, uma função por responsabilidade, barramento com outbox, filas com DLQ, snapshot em S3): fronteiras fortíssimas, muitas peças para um sistema diário e pequeno. Descartada pela instrução de manter simples. Pode voltar em partes por necessidade concreta (ex.: fila só se a coleta passar de 15 min).
- **Uma Lambda só:** mais simples, mas o timeout de 15 min valeria para a API e uma coleta disputaria memória e concorrência com quem abre painel.
- **Contêiner sempre ligado** (ECS Fargate, ou a VM com Docker Compose das ADRs 0006/0010): sem partida a frio nem limite de 15 min; custo fixo e mais rede (balanceador). **Plano B** se a coleta passar de 15 min ou a partida a frio incomodar; muda só `entradas/`.
- **Fastify** (ADR 0008): mais maduro em servidor longo, mas na Lambda depende de adaptador e tem partida a frio maior. **NestJS:** pesado.
- **Prefixo por módulo num banco só** (proposta original): equivalente; não adotado porque os três schemas já estão migrados e os grants por schema são mais fortes.
- **Ler o MySQL do Acelerato direto** (ADRs 0004–0006): substituído pelo Metabase, por decisão do usuário.

## Consequências
- **Mais fácil:** um build, um código, um processo local; custo próximo de zero fora do horário de uso; nada de imagem Docker, nginx nem runner interno; o mock continua com a mesma forma (`BaseBM`/`BaseAC`).
- **Mais difícil:** fronteiras entre módulos dependem de lint e revisão; partida a frio da `api` precisa ser medida (S1); migração exige a função `migrar` porque o banco é privado.
- **Riscos:**
  - Coleta do BusinessMap acima de 15 min (limite de taxa desconhecido, I-5) → incremental desde o início; se estourar, `coleta` vai para o Fargate (plano B).
  - Tabela do Metabase sem histórico de etapas (P6) → várias métricas de sustentação (tempo em pendência, reabertura, aging por etapa) ficariam inviáveis ou com granularidade diária. Responder antes do WS5.
  - Tabela do Metabase mudar sem aviso → contrato zod, falha explícita, SQL versionado.
  - Leitura de um "estado atual" diário perde transições intradiárias → registrado como limitação na documentação de cada métrica afetada, se P6 confirmar.
  - **CLAUDE.md desatualizado:** cita "usuário do MySQL do Acelerato" e "acesso ao MySQL somente leitura". Sugestão ao usuário: "chave do Metabase, só leitura". `docs/engineering/praticas.md` §credenciais idem (tech-lead).

## Perguntas ao usuário
| # | Pergunta | Recomendação |
|---|---|---|
| P3 | Qual é o SSO corporativo (Entra ID, Keycloak, Google...) e quem registra a aplicação? | OIDC; decidir entre autorizador JWT e BFF (§8) com a resposta |
| P4 | Como as automações da T4.3 registrariam no chamado? | API oficial do Acelerato com credencial própria; até lá a T4.3 fica fora |
| P5 | O Metabase é acessível pela internet ou só pela rede da Unifique? | liberar no firewall o IP fixo do NAT da AWS |
| P6 | A tabela tem uma linha por mudança de etapa (com data/hora) ou uma linha por chamado com o estado atual? | histórico de etapas é necessário para S1–S7; senão, pedir uma segunda tabela de transições |
| P7 | O recorte DSPD-SSSC (3.2) já está aplicado na tabela? Quem mantém a consulta e avisa mudanças? | recorte explícito e SQL versionado no repositório |
| P8 | Que horas a tabela é atualizada? | agendar a coleta `ac` uma hora depois |
| P9 | Quantas linhas e quanto histórico? Inclui fechados antigos? | pelo menos 12 meses (janela e calibração) |
| P10 | Datas em UTC ou horário de Brasília? | gravar em UTC; converter na extração |
| P11 | Conta AWS: já existe? Uma conta por ambiente ou estágios na mesma? Região? Quem administra (IAM, VPC, faturamento)? | contas separadas homologação/produção na organização da Unifique, `sa-east-1` |
| P12 | Credenciais do Metabase: URL, id da pergunta salva, usuário de serviço só leitura para gerar a chave de API? | usuário de serviço dedicado, acesso só à coleção da pergunta |
| P13 | Frequência da coleta do BusinessMap: uma vez ao dia basta, ou mantém "a cada 2 h em horário útil" (ADR 0006)? | começar diária (como o Acelerato) e ajustar só a agenda, sem código |

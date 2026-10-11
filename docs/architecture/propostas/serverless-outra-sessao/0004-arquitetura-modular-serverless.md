# 0004 - Back-end: monólito modular em Node, publicado como funções serverless na AWS
- Status: **aceita** (2026-10-10)
- Data: 2026-10-10
- Origem: pedidos do usuário na sessão de 2026-10-10, nesta ordem: (1) "arquitetura modular com microsserviços dentro dos módulos, padrão serverless"; (2) "AWS; os dados do Acelerato vêm de uma tabela no Metabase, puxada uma vez ao dia; o SSO será informado"; (3) **"mantenha a arquitetura simples, com o melhor que podemos para Node, mas simples"**. A primeira versão desta ADR (barramento de eventos, outbox, filas, um workspace e uma função por responsabilidade) foi descartada no mesmo dia pela instrução (3), antes de qualquer código.
- Pedido: `docs/pedidos/002-arquitetura-completa.md`
- Relacionadas: ADR 0001 (front, sem mudança), ADR 0002 (monorepo; o `server/` fica como **um** workspace), ADR 0003 (orçamento; item M3 ajustado ao Metabase e item S1 novo)
- Visão geral: `docs/architecture/overview.md`

## Contexto
- **Carga pequena e previsível:** coleta uma vez ao dia, webhook esporádico do BusinessMap, poucos usuários internos e volume de milhares de cards e chamados (o mock tem cerca de 6 mil de cada). Não há problema de escala que justifique serviços distribuídos.
- **Time pequeno:** cada peça de infraestrutura a mais (fila, barramento, outbox, deploys independentes) custa em operação e depuração mais do que devolve aqui.
- **AWS é o provedor** (resposta do usuário). Serverless serve porque o sistema fica quase sempre ocioso.
- **Acelerato via Metabase:** a fonte deixa de ser o MySQL `acelerato_dev_corporativo` e passa a ser uma tabela no Metabase com os dados atualizados, lida uma vez ao dia, só leitura.
- **O que já existe continua:** `contratos`, `metricas` (biblioteca única, T2.5), `mock` e o front com a porta `FonteMetricas`.
- **Regras invioláveis:** BusinessMap e Acelerato nunca se misturam, nenhuma visão individual, carga append-only, biblioteca única.

## Decisão

### 1. Forma: um back-end, módulos em pastas, duas funções
- `server/` é **um** workspace npm (`@metricas-dspd/server`), com **um** código e **um** build.
- Dentro dele, **módulos por assunto em pastas**, cada um com uma API pública (`index.ts`). Módulos não leem tabelas nem arquivos internos uns dos outros, e o lint garante isso.
- O mesmo código é publicado em **duas Lambdas**, separadas porque o gatilho, o tempo máximo e o risco são diferentes:

| Lambda | Gatilho | Faz | Timeout |
|---|---|---|---|
| `api` | API Gateway HTTP (`/api/v1/*`) | métricas, `/dados`, referência, preferências **e** o webhook do BusinessMap (só grava no staging e responde 202) | 30 s |
| `coleta` | EventBridge Scheduler, duas agendas diárias: `{ fonte: 'bm' }` e `{ fonte: 'ac' }` | coleta → normalização → registro da execução, **uma fonte por invocação** (falha ou atraso de uma não afeta a outra, CA-10) | 15 min |

- **Localmente** é um único processo Node (`npm run dev:server`) com o mesmo app HTTP, mais o comando `npm run coleta -- bm|ac`. O MySQL 8.4 roda em Docker (já decidido).

### 2. Módulos
| Módulo (pasta) | Responsabilidade | Prefixo das tabelas |
|---|---|---|
| `businessmap` | Coleta pela API REST v2, webhook, staging append-only, `dim_card`, `fato_transicao`, `fato_bloqueio`, marcos (T2.2–T2.4), reconciliação webhook × API | `bm_` |
| `acelerato` | Extração diária da tabela no Metabase, staging append-only, base analítica de chamados (T5.1) | `ac_` |
| `referencia` | Calendário e feriados, domínios fechados com vigência, critérios (T2.6), janela de calibração automática | `ref_` |
| `metricas` | Monta `BaseBM`/`BaseAC` a partir das tabelas e chama a biblioteca `@metricas-dspd/metricas`; cache em memória | — |
| `operacao` | Registro das execuções de coleta para `/dados` e para os selos de frescor (K3) | `ops_` |
| `preferencias` | Preferências de métricas do próprio usuário (pedido 007) | `pref_` |

As automações da T4.3 ficam **fora** até existir um meio de escrita no Acelerato (P4).

Estrutura de um módulo, em três arquivos-tipo e sem cerimônia:
```
server/src/modulos/businessmap/
  index.ts          API pública do módulo (o que os outros e as entradas podem usar)
  rotas.ts          rotas Hono: validam a entrada com zod e chamam o serviço
  servico.ts        casos de uso: funções que recebem as dependências por parâmetro
  repositorio.ts    SQL do módulo (Kysely)
  cliente-api.ts    cliente HTTP da origem (só nos módulos de coleta)
  *.test.ts
```
O restante do `server/`:
```
server/
  src/
    app.ts            monta o Hono com as rotas de todos os módulos
    plataforma/       config (env validado com zod), db (Kysely + mysql2), log (pino), erros, auth
    entradas/
      lambda-api.ts      adaptador Hono → Lambda
      lambda-coleta.ts   handler agendado: { fonte } → businessmap.coletar() ou acelerato.coletar()
      local.ts           servidor local (@hono/node-server)
      coleta-cli.ts      npm run coleta -- bm|ac
  migracoes/          migrações Kysely, versionadas, executadas pelo pipeline
infra/                AWS CDK em TypeScript: uma stack
```

### 3. Como a coleta vira métrica (sem barramento)
1. A agenda chama `coleta` com `{ fonte: 'bm' }`. O módulo `businessmap` lê desde a marca d'água, grava o staging (idempotente por chave natural), normaliza para as tabelas analíticas e registra a execução no módulo `operacao` (contagens, duração, resultado). Tudo em chamadas de função, no mesmo processo.
2. O mesmo vale para `{ fonte: 'ac' }` com o módulo `acelerato`, que lê o Metabase.
3. Cada carga ok grava uma **versão de carga** por fonte (`ops_carga`).
4. Na `api`, o módulo `metricas` monta `BaseBM`/`BaseAC` direto das tabelas na primeira requisição (partida a frio), cria o contexto da biblioteca e guarda os resultados em memória com a chave `(metricaId, filtros normalizados, versão de carga)`. Quando a versão muda, o cache se renova sozinho.
5. O webhook grava no staging com origem `webhook` e o instante real; a normalização acontece na coleta seguinte (e a reconciliação também, T2.3).

Não há snapshot em S3, fila nem eventos. Se a partida a frio estourar S1, o primeiro remédio é concorrência provisionada mínima de 1 na `api`; o segundo é gravar a base montada como blob em `ops_carga`.

### 4. Acelerato pelo Metabase
- A leitura usa a **API do Metabase**, com chave de API (`x-api-key`) de um usuário só de leitura, guardada no Secrets Manager (no dev, `.env`). A consulta sai de uma pergunta salva (*card*) com exportação JSON (`POST /api/card/:id/query/json`), que não tem o limite de 2.000 linhas da consulta interativa.
- **Histórico sem sobrescrever:** se a tabela trouxer o estado atual, cada linha extraída ganha um hash. Linha nova vira registro novo; linha com hash diferente vira **nova versão** (SCD tipo 2); linha que some é marcada como ausente, nunca apagada.
- **Contrato da tabela:** o formato esperado de cada coluna fica num schema zod. Coluna faltando, renomeada ou com tipo diferente faz a coleta **falhar com aviso** em `/dados`, e nunca carrega dado torto. A consulta SQL da pergunta do Metabase é copiada para o repositório (`docs/architecture/fontes/acelerato-metabase.sql`), e qualquer mudança nela é mudança de critério (T2.6).
- O que falta saber sobre a tabela está em P5 a P10. Nenhuma métrica de sustentação será implementada sobre suposição.

### 5. Escolhas de Node e TypeScript
| Tema | Escolha | Por quê |
|---|---|---|
| Runtime | Node 24 LTS na Lambda (`nodejs24.x`, ou a LTS suportada mais recente) | Mesmo runtime do dev |
| HTTP | **Hono** + `@hono/zod-validator` | Leve (partida a frio curta), roda igual em Node e na Lambda, valida com os schemas de `contratos` |
| Banco | **Kysely** + `mysql2` | SQL tipado, sem gerador de código nem binário; **migrações do próprio Kysely**, sem outra ferramenta |
| Validação | **zod 4** em toda fronteira: HTTP, variáveis de ambiente, resposta do BusinessMap e do Metabase | Por dentro do código só tipos; erro de formato aparece na borda |
| Log | **pino** em JSON, com `requestId` por requisição e `execucaoId` por coleta | Integra com o CloudWatch sem configuração |
| Erros | Respostas no formato problem+json (RFC 9457), sem detalhe sensível (CA-15) | Um formato só para o front tratar |
| Testes | **Vitest**; serviço com dependências falsas; repositório contra MySQL em Docker; rotas com `app.request()` do Hono | Rápidos e sem servidor de pé |
| Build | **esbuild** gera um pacote por Lambda | Os pacotes internos (TS-fonte, ADR 0002) entram no bundle |
| Estilo | Funções e módulos ES; sem classes de serviço, sem contêiner de injeção de dependência; tempo sempre por parâmetro (`agora`), nunca `Date.now()` em regra de negócio | Mesmo padrão da biblioteca; fácil de testar |
| IaC | **AWS CDK** em TypeScript, uma stack | Mesma linguagem do resto |

Práticas detalhadas de código e revisão ficam com o `tech-lead`, em `docs/engineering/praticas.md`.

### 6. Infraestrutura na AWS
| Peça | Serviço |
|---|---|
| Front (SPA) | S3 + CloudFront; `/api/*` roteado para o API Gateway na mesma origem (sem CORS) |
| API | API Gateway HTTP API → Lambda `api` |
| Coleta | EventBridge Scheduler (duas agendas diárias) → Lambda `coleta` |
| Banco | RDS MySQL 8.4, privado na VPC, com backup automático |
| Saída para a internet | NAT Gateway com IP fixo (BusinessMap, Metabase e liberação no firewall, se preciso) |
| Segredos | Secrets Manager (apikey do BusinessMap, chave do Metabase, credencial do banco) |
| Observabilidade | CloudWatch Logs e um alarme por coleta falha ou atrasada, por fonte |
| Autenticação | Autorizador JWT do API Gateway com o SSO corporativo (P3, aguardando o usuário) |

Sem RDS Proxy por enquanto: com a concorrência da `api` reservada em 10 e um pool de 2 conexões por instância, o máximo fica em ~22 conexões. Se a concorrência crescer, entra o proxy.

### 7. Fronteiras garantidas por lint (somam-se às da ADR 0002)
| Onde | Proibido |
|---|---|
| `server/src/modulos/<a>/**` | importar arquivos internos de `<b>` (só `modulos/<b>/index.ts`) |
| `modulos/businessmap/**` ↔ `modulos/acelerato/**` | qualquer import entre os dois, nem pelo `index.ts` |
| `server/src/modulos/**` | SQL em tabela de outro prefixo (verificado em revisão e por teste que lista as tabelas usadas por cada repositório) |
| `server/src/**` fora de `modulos/metricas` | importar a raiz de `@metricas-dspd/metricas` (só o módulo `metricas` calcula; `businessmap` pode usar `/core` e `/businessmap` para derivar os marcos, `acelerato` pode usar `/core` e `/acelerato`) |
| `server/src/**` fora das migrações de seed e dos testes de paridade | importar `@metricas-dspd/mock` |
| regras de negócio (`servico.ts`, `repositorio.ts`) | `Date.now`, `new Date()` sem argumento, `Math.random` |

### 8. Dados
- Um banco MySQL 8.4 com **prefixo por módulo** (`bm_`, `ac_`, `ref_`, `ops_`, `pref_`), InnoDB, `utf8mb4`, datas em UTC. Nenhuma tabela mistura BusinessMap e Acelerato.
- Um usuário de banco para a aplicação e outro para as migrações. A chave do Metabase é só de leitura.
- Detalhe (ER, chaves naturais, índices, versionamento): `docs/architecture/data-model.md`, próximo entregável.

## Alternativas consideradas
- **Primeira versão desta ADR** (sete workspaces, uma função por responsabilidade, barramento com outbox, filas com DLQ, snapshot em S3): fronteiras fortíssimas, mas com muitas peças para um sistema diário e pequeno. **Descartada** pela instrução do usuário de manter simples. Pode voltar em partes se surgir necessidade concreta (ex.: fila só se a coleta passar de 15 min).
- **Uma Lambda só** (API e coleta juntas): ainda mais simples, mas o timeout teria de ser o da coleta (15 min) também na API, e uma coleta pesada disputaria memória e concorrência com quem está abrindo painel. Duas funções do mesmo código custam quase nada.
- **Contêiner sempre ligado** (ECS Fargate com Fastify e cron interno): código igualmente simples, sem partida a frio e sem limite de 15 min. Contras: custo fixo para um sistema ocioso e mais infraestrutura de rede (balanceador). É o **plano B** se a coleta passar de 15 min ou a partida a frio incomodar; o código muda só em `entradas/`.
- **Fastify** em vez de Hono: mais maduro em servidor longo, mas na Lambda depende de adaptador e tem partida a frio maior. **NestJS:** pesado e cerimonioso para este tamanho.
- **Prisma** em vez de Kysely: produtivo, mas traz gerador de código e etapa de build, além de pacote maior na Lambda. **Drizzle:** boa opção também; o Kysely ficou pelas migrações simples e pelo SQL explícito, mais fácil de conferir com o `EXPLAIN` (M2).
- **Ler o MySQL do Acelerato direto:** substituído pelo Metabase, por decisão do usuário.

## Consequências
- **Mais fácil:** um build, um código e um processo local; depuração com stack trace inteira; quase nenhuma infraestrutura além do necessário; custo próximo de zero fora do horário de uso; o mock continua com a mesma forma (`BaseBM`/`BaseAC`) que a API monta a partir das tabelas.
- **Mais difícil:** as fronteiras entre módulos dependem de lint e revisão, não de deploy separado; a partida a frio da `api` precisa ser medida (S1).
- **Riscos:**
  - **Coleta do BusinessMap acima de 15 min** (limite de taxa ainda desconhecido) → coleta incremental pela marca d'água desde o início; se ainda assim estourar, a `coleta` vai para o Fargate (plano B), sem mudar módulo.
  - **A tabela do Metabase não ter histórico de etapas** → várias métricas de sustentação (tempo em pendência, reabertura, aging por etapa) ficariam inviáveis ou com granularidade diária. Pergunta P6, a responder antes de implementar o WS5.
  - **A tabela do Metabase mudar sem aviso** → contrato zod, falha explícita em `/dados` e SQL versionado no repositório.
  - **CLAUDE.md desatualizado:** ainda cita "usuário do MySQL do Acelerato". Sugiro ajustar para "chave do Metabase, só leitura" (decisão do usuário/Jarvis).

## Perguntas ao usuário
| # | Pergunta | Recomendação |
|---|---|---|
| P3 | Qual é o SSO corporativo? (**o usuário vai informar**) | OIDC com PKCE no front e JWT validado no API Gateway |
| P4 | Como as automações da T4.3 registrariam no chamado? | API oficial do Acelerato, com credencial própria; até lá a T4.3 fica fora |
| P5 | O Metabase é acessível pela internet ou só pela rede da Unifique? | Liberar no firewall o IP fixo do NAT da AWS |
| P6 | A tabela tem **uma linha por mudança de etapa** (com data/hora) ou **uma linha por chamado** com o estado atual? | Precisamos do histórico de etapas para S1–S7; se não houver, pedir uma segunda tabela de transições |
| P7 | O recorte DSPD-SSSC (seção 3.2) já está aplicado na tabela? Quem mantém a consulta e avisa as mudanças? | Recorte explícito e consulta versionada no repositório |
| P8 | Que horas a tabela é atualizada? | Agendar a `coleta` de `ac` uma hora depois |
| P9 | Quantas linhas e quanto tempo de histórico? Inclui chamados fechados antigos? | Pelo menos 12 meses, para a janela e a calibração |
| P10 | As datas estão em UTC ou no horário de Brasília? | Gravar em UTC; converter na extração, se preciso |

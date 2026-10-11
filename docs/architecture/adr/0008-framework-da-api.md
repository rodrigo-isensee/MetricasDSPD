# 0008 - Framework e execução do servidor
Estado: substituída por [0013](0013-arquitetura-modular-serverless.md) e [0014](0014-stack-tecnica-do-back-end.md)
- Status: **substituída pelas ADRs 0013 e 0014.** A 0013 trocou Fastify por Hono; a **0014** (stack do usuário) volta a **Fastify 5**, com execução na Lambda via `@fastify/aws-lambda` (ou contêiner, P14) e rotas testadas com `app.inject()`. Continuam valendo daqui: plugins e logger pino com `requestId` e redação, cache por chave, esbuild, `/health/live` e `/health/ready`, Vitest. Saem: `worker` e imagem Docker (ADR 0013), e "Testcontainers" (ADR 0014: MySQL do compose com prefixo por execução). O cálculo do §Decisão usa `ctl_coleta` (versão de carga) e, agora, o evento `coleta.concluida` da outbox.
- Status anterior: aceita
- Data: 2026-10-09
- Origem: ata kickoff 002, D13 (Fastify recomendado); pendência do runner na ADR 0002

## Contexto
API somente leitura, poucos usuários, cálculo pesado sob demanda (biblioteca em memória) com cache; validação por zod (ADR 0007); pacotes internos são TS-fonte (ADR 0002).

## Decisão
- **Fastify 5** com type provider zod, `@fastify/helmet`, `@fastify/cors` (só a origem do web, se não for mesma origem), `@fastify/rate-limit` (webhook e autenticação), `@fastify/swagger`, logger **pino** nativo com `requestId` (cabeçalho `x-request-id` aceito ou gerado) e redação de `authorization`, `cookie`, segredos.
- Estrutura por módulo da skill `node-backend` (`routes/service/repository/schemas`), com módulos: `metricas`, `filtros`, `criterios`, `referencia`, `webhooks`, `saude`, `auth`; e fora do HTTP: `coleta/businessmap`, `coleta/acelerato`, `projecao/businessmap`, `projecao/acelerato`, `automacoes/acelerato`. Módulos `*/businessmap` e `*/acelerato` não se importam (regra de lint da ADR 0002 estendida ao `server/`).
- **Cálculo no servidor:** por domínio, o `worker` sinaliza (tabela `ctl_coleta`) e a `api` monta o **contexto** da biblioteca a partir do MySQL uma vez por (domínio, data de referência, versão de critério), em memória; resultados memoizados por chave do rascunho da API (LRU, limite de memória). Primeira requisição após coleta aquece; o `worker` pode pré-aquecer chamando as rotas de painel.
- **Execução:** `tsx watch` em dev; produção empacotada com **esbuild** (bundle único por entrada, pacotes internos inlinados, `mysql2` externo), Node 24 LTS, imagem Docker não root.
- **Saúde:** `GET /health/live` (processo) e `GET /health/ready` (MySQL acessível, contexto montado, idade da última coleta por domínio).
- **Testes:** Vitest; rotas com `app.inject()` (sem Supertest); integração contra MySQL 8 em container (Testcontainers ou serviço do CI).

## Alternativas consideradas
- **Express 5**: mais conhecido. Contras: sem schema/serialização nativos, validação e OpenAPI por bibliotecas avulsas, desempenho inferior. Descartado.
- **NestJS**: estrutura forte. Contras: decorators e `emitDecoratorMetadata` conflitam com `erasableSyntaxOnly` (ADR 0002); peso desproporcional. Descartado.
- **Hono**: leve e moderno. Contras: ecossistema de plugins (rate limit, swagger com zod 4, cookies seguros) menos maduro no Node; ganho pequeno. Descartado.
- **Node com remoção nativa de tipos em produção**: sem build. Contras: imports sem extensão (`moduleResolution: bundler`) não resolvem no Node puro. Descartado por ora.

## Consequências
- Mais fácil: validação, OpenAPI e logs com correlação saem do framework; bundle único simplifica a imagem.
- Mais difícil: cache em memória por instância (aceitável com uma ou duas instâncias; com mais, avaliar cache compartilhado).
- Risco: contexto grande em memória com volume real → medir heap no A1/M1 com 2 anos de seed; limite de memória do contêiner definido a partir da medição.

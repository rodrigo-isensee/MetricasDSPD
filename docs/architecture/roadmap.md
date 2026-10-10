# Roadmap de implementação (pedido 002)

- Data: 2026-10-09 · Revisão: 2026-10-10 (ADR 0013) · Base: `overview.md`, `data-model.md`, ADRs 0004–0013
- Ordem obrigatória do briefing: configuração (WS1, WS4, por pessoas) → coleta (WS2, WS5) → painéis (WS3). Os painéis do 001 já existem sobre o mock; aqui "painel" = ligar na API real, o que só acontece depois do critério de pronto da coleta do domínio.
- Domínios avançam separados: BM pode ir à produção sem AC e vice-versa (flag de fonte por domínio no web).

```mermaid
flowchart LR
  R0[R0 Fundação do servidor] --> R1[R1 WS2 coleta BM]
  R0 --> R2[R2 WS5 coleta AC T5.1]
  R1 --> R3a[R3 WS3 painéis de fluxo na API]
  R2 --> R3b[R3 WS5 painéis de sustentação na API]
  WS1([WS1 config BM, pessoas]) -.->|T1.1, T1.3| R1
  WS4([WS4 parametrização AC, pessoas]) -.->|T4.1| R3b
  WS4 -.->|T4.1| R4[R4 T4.3 automações]
  R2 --> R4
```

## Fases

| Fase | Briefing | Entrega | Pronto quando | Depende de |
|---|---|---|---|---|
| **R0 Fundação** (K-017) | — | `server/` com Hono e módulos em pastas (ADR 0013), entradas `lambda-api`, `lambda-coleta`, `lambda-migrar`, `local`, `coleta-cli`; saúde, config zod, pino; migrações dos três schemas (feitas), `ref:sync`, seed (feito), usuários por papel (feito), Docker local (feito), jobs `db` e `openapi` no CI, autenticador falso; `infra/` CDK (uma stack) | `up/down/up` verde; paridade mock × seed verde em todas as métricas; teste de esquema verde; A1/M1 e S1 medidos sobre 2 anos de seed | extração do 001 (D3), ADR 0013; P11 só para o deploy |
| **R1 WS2 BusinessMap** | T2.1 → T2.2 → T2.4 → T2.3; T2.5/T2.6 integrados | de-para da OpenAPI (apoio ao T2.1), coletor incremental, varredura semanal de excluídos, normalizador (inclusive do webhook), projetor (marcos via biblioteca), webhook + reconciliação, `ctl_*` e alarmes | T2.2: 7 execuções seguidas sem falha, contagem reconcilia, arquivados presentes; T2.4: 20 cards sorteados conferem; T2.3: divergência < 1 % em 1 semana; K1 (< 15 min, limite da Lambda), K3, K4 | T1.1, T1.3 (WS1); I-5, P11, P13 |
| **R2 WS5 Acelerato (base)** | T5.1 | cliente do Metabase com schema zod da tabela, SQL da pergunta versionado, staging AC com versão e ausência, projeções, views do recorte, exceção de SLA segregada | contagem de fechados e abertos reconcilia com o painel atual em 1 %; M3, K2 dentro do orçamento | **P5–P10, P12** (substituem I-4, I-4b); independe de WS4 |
| **R3 Painéis na API** | WS3 (T3.1–T3.4), WS5 (T5.2–T5.4) | `HttpFonteMetricas`, rotas `/api/v1` por métrica, cache, aquecimento; troca de fonte por domínio; E2E projeto `api` | painéis idênticos ao mock sobre o seed (paridade) e coerentes com dados reais; A1, F1–F5 dentro do orçamento; S-métricas só publicadas após T4.1 (as que dependem de 3.4) | R1 para fluxo; R2 + T4.1/T4.2 para sustentação; I-3 para produção |
| **R4 Automações** (fora até P4/I-6; nova ADR ao voltar) | T4.3 | função própria (provável terceira Lambda), cliente de escrita com ações fechadas, idempotência, modo simulação, alertas | cada automação testada em homologação em simulação e depois ativa, com registro no chamado e sem tocar no relógio de SLA | T4.1 (WS4), I-6, I-7 |
| Contínuo | T5.5, T6.x | apoio: consulta trimestral das justificativas (pessoa autorizada), relatórios de higiene | — | — |

R1 e R2 correm em paralelo depois do R0 (módulos e schemas distintos, sem dependência entre si).

## O que cada agente faz

| Agente | R0 | R1 | R2 | R3 | R4 |
|---|---|---|---|---|---|
| `software-architect` | revisão de modelagem das migrações; ajuste das ADRs com respostas I-* e L-* | de-para T2.1 (apoio), regras de reconciliação | mapeamento das colunas do Acelerato | plano técnico da troca de fonte | revisão da lista fechada de ações |
| `node-backend` | K-017: servidor, migrações, seed, `ref:sync`, CI `db` | coletor, normalizador, projetor, webhook, contratos `docs/api/` | leitor AC, views, projeções | rotas, cache, aquecimento, OpenAPI | processo de automações |
| `react-frontend` | ajuste dos tipos da biblioteca/mock (L-1) e função única de marcos em `metricas/businessmap` | — | — | `HttpFonteMetricas`, flag de fonte por domínio, estados de frescor (`GET /fontes/:dominio/estado`) | — |
| `ux-designer` | — | — | — | microcopy de dados defasados, marcação de critério e "dados reais" | texto dos registros no chamado |
| `qa-engineer` | paridade, teste de esquema, `up/down/up` | testes de idempotência (rodar 2×), reconciliação, sorteio dos 20 cards | reconciliação 1 % com o painel atual | E2E `api`, perf A1/F*, Lighthouse | roteiro de homologação T4.3 em simulação |
| `tech-lead` | review de modelagem e de código, commits | idem | idem | idem | idem |
| `jarvis` | levar I-*, L-*, N-* ao usuário | — | — | — | — |

## Cartões do `node-backend` pela ADR 0013 (para o quadro)
Estado do `server/` na `main`: Kysely + `mysql2`, migrações 0001–0010, `grants.ts`, `lgpd.ts`, `staging.ts`, seed e `src/coletas/` (estado de coleta). **Não há servidor HTTP nem Fastify**; nada a desfazer, só reorganizar e acrescentar.

| # | Cartão | Pronto quando | Depende de |
|---|---|---|---|
| S-01 | Reorganizar em `src/plataforma/` (config zod, db, log pino, erros) e `src/modulos/<m>/index.ts`; mover `src/coletas/` para `modulos/operacao` e `src/db/staging.ts` para `modulos/businessmap`; `migrations/` fica onde está | testes atuais verdes sem mudar comportamento; imports só por `index.ts` | — |
| S-02 | Regras de lint da ADR 0013 §9 (fronteira entre módulos, BM × AC, raiz da biblioteca só em `metricas`, mock, relógio) + teste que lista os schemas usados por repositório | lint falha com exemplo proibido em cada regra | S-01 |
| S-03 | `app.ts` Hono + `@hono/zod-validator` com os schemas de `contratos`; formato de erro da ADR 0007; `requestId`; `/health/live` e `/health/ready`; rotas `/api/v1/fontes/*` sobre `operacao`; testes com `app.request()` | `docs/api/fontes.md` atendido; entrada `strict` recusa `?responsavel=` | S-01 |
| S-04 | Entradas `local.ts` (`@hono/node-server`), `lambda-api.ts` (`hono/aws-lambda`), `lambda-coleta.ts`, `coleta-cli.ts`, `lambda-migrar.ts`; build esbuild por entrada; scripts `dev`, `coleta`, `build` | `npm run dev` serve o app; bundles gerados; handler de coleta recusa fonte desconhecida | S-03 |
| S-05 | Módulo `metricas`: monta `BaseBM`/`BaseAC` das projeções, cache por `(metricaId, filtros, versão de carga)`, versão relida a cada 60 s; rotas `/api/v1/metricas/:id` | paridade mock × seed verde; S1 e A1 medidos | S-03 |
| S-06 | Webhook `POST /webhooks/businessmap` (segredo, 256 KB, `dspd_webhook`, hash único, 202) | reenvio não duplica; K4 < 1 s | S-03, I-5 |
| S-07 | OpenAPI gerado dos schemas (`hono-openapi` ou `@hono/zod-openapi`, escolha do node-backend) em `docs/api/openapi.json` + job `openapi` | gerado = versionado | S-03 |
| S-08 | Migração nova: `ausente_na_extracao` em `dspd_ac.stg_chamado` e `stg_etapa` (data-model §4), com `down` | `up/down/up` verde; revisão de modelagem | — |
| S-09 | Cliente do Metabase (`modulos/acelerato/cliente-api.ts`): chave por env, timeout e retentativa, schema zod da tabela, falha explícita em coluna divergente; testes com resposta gravada | **bloqueado** até P6/P12 (sem formato real, só o esqueleto com falso) | S-01 |
| S-10 | `infra/` CDK (uma stack): VPC, NAT, RDS, Secrets, 3 Lambdas, API Gateway, Scheduler, S3 + CloudFront, alarmes; job `deploy` com OIDC do GitHub | `cdk synth` verde no CI; deploy só após P11 | S-04, P11 |

S-03, S-08 e S-09 podem correr em paralelo depois do S-01; S-05, S-06 e S-07 em paralelo depois do S-03.

## Gates entre fases
- Nenhuma migração sem revisão de modelagem (praticas §6).
- Nenhum painel ligado à API real sem o critério de pronto da coleta do domínio.
- Nenhuma automação ativa sem homologação em modo simulação e sem I-6 respondida.
- Pergunta de regra de negócio pendente vira célula `pendente-usuario`, nunca escolha no código.

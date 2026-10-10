# Roadmap de implementação (pedido 002)

- Data: 2026-10-09 · Base: `overview.md`, `data-model.md`, ADRs 0004–0010
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
| **R0 Fundação** (K-017) | — | `server/` (Fastify, módulos vazios, saúde, config zod, pino), migrações iniciais dos três schemas, `ref:sync` com calendário/critérios/domínios, seed do mock, usuários MySQL por papel, `docker compose`, jobs `db` e `openapi` no CI, autenticador falso, remoção de `responsaveis`/`usuario` dos tipos (se L-1 confirmada) | `up/down/up` verde; paridade mock × seed verde em todas as métricas; teste de esquema (sem pessoa, sem cruzamento BM × AC) verde; A1/M1 medidos sobre 2 anos de seed | extração do 001 (D3), ADRs 0004–0010 revisadas |
| **R1 WS2 BusinessMap** | T2.1 → T2.2 → T2.4 → T2.3; T2.5/T2.6 integrados | de-para da OpenAPI (apoio ao T2.1), coletor incremental, varredura de excluídos, normalizador, projetor (marcos via biblioteca), webhook + reconciliação, `ctl_*` e alertas | T2.2: 7 execuções seguidas sem falha, contagem reconcilia, arquivados presentes; T2.4: 20 cards sorteados conferem; T2.3: divergência < 1 % em 1 semana; K1, K3, K4 dentro do orçamento | T1.1, T1.3 (WS1); I-1, I-2, I-5 |
| **R2 WS5 Acelerato (base)** | T5.1 | leitor somente leitura, staging AC, projeções, views do recorte, exceção de SLA segregada | contagem de fechados e abertos reconcilia com o painel atual em 1 %; M3, K2 dentro do orçamento | I-4, I-4b; independe de WS4 |
| **R3 Painéis na API** | WS3 (T3.1–T3.4), WS5 (T5.2–T5.4) | `HttpFonteMetricas`, rotas `/api/v1` por métrica, cache, aquecimento; troca de fonte por domínio; E2E projeto `api` | painéis idênticos ao mock sobre o seed (paridade) e coerentes com dados reais; A1, F1–F5 dentro do orçamento; S-métricas só publicadas após T4.1 (as que dependem de 3.4) | R1 para fluxo; R2 + T4.1/T4.2 para sustentação; I-3 para produção |
| **R4 Automações** | T4.3 | processo `automacoes`, cliente de escrita com ações fechadas, idempotência, modo simulação, alertas | cada automação testada em homologação em simulação e depois ativa, com registro no chamado e sem tocar no relógio de SLA | T4.1 (WS4), I-6, I-7 |
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

## Gates entre fases
- Nenhuma migração sem revisão de modelagem (praticas §6).
- Nenhum painel ligado à API real sem o critério de pronto da coleta do domínio.
- Nenhuma automação ativa sem homologação em modo simulação e sem I-6 respondida.
- Pergunta de regra de negócio pendente vira célula `pendente-usuario`, nunca escolha no código.

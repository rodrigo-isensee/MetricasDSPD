# Visão geral da arquitetura

Estado: 2026-10-10. Decisões: [ADR 0001](adr/0001-stack-front-dashboard-mock.md) (front), [ADR 0002](adr/0002-monorepo-pacotes-compartilhados.md) (monorepo), [ADR 0003](adr/0003-orcamento-de-performance.md) (performance), [ADR 0004](adr/0004-arquitetura-modular-serverless.md) (back-end modular em duas Lambdas na AWS).

Resumo: **um back-end Node em TypeScript, com módulos em pastas, publicado em duas Lambdas** (`api` e `coleta`), com MySQL 8.4 no RDS e a SPA React no S3 + CloudFront. Os dados vêm do BusinessMap (API e webhook) e do Acelerato (tabela no Metabase), uma vez ao dia.

## 1. Contexto (C4 nível 1)

```mermaid
flowchart LR
  pessoas(["Times, coordenação e gestão do DSPD"])
  sistema["MetricasDSPD<br/>painéis FL1, FL2, FL3, Sustentação, EI e /dados"]
  bm["BusinessMap<br/>API REST v2 + webhook"]
  mb["Metabase<br/>tabela com os dados do Acelerato"]
  sso["SSO corporativo (a informar)"]
  pessoas -->|navegador| sistema
  sistema -->|coleta diária| bm
  bm -->|mudança de coluna| sistema
  sistema -->|leitura diária, só leitura| mb
  sistema -->|login| sso
```

## 2. Containers (C4 nível 2, AWS)

```mermaid
flowchart TB
  user(["Usuário"]) --> cf["CloudFront"]
  cf -->|"/*"| s3["S3: SPA React (web/)"]
  cf -->|"/api/*"| gw["API Gateway HTTP<br/>(autorizador JWT do SSO)"]
  bmext["BusinessMap"] -->|"webhook"| gw
  gw --> api["Lambda api<br/>Hono + módulos"]
  sched["EventBridge Scheduler<br/>bm diário · ac diário"] --> col["Lambda coleta<br/>mesmo código, outra entrada"]
  subgraph vpc["VPC"]
    api --> db[("RDS MySQL 8.4<br/>bm_ · ac_ · ref_ · ops_ · pref_")]
    col --> db
    col --> nat["NAT (IP fixo)"]
  end
  nat --> bmext
  nat --> mb["Metabase"]
  sm["Secrets Manager"] -.-> api
  sm -.-> col
  api -.-> cw["CloudWatch Logs + alarmes"]
  col -.-> cw
```

## 3. Módulos dentro do `server/`

```mermaid
flowchart LR
  subgraph entradas
    la["lambda-api / local"]
    lc["lambda-coleta / coleta-cli"]
  end
  subgraph modulos
    bm["businessmap"]
    ac["acelerato"]
    ref["referencia"]
    met["metricas"]
    ops["operacao"]
    pref["preferencias"]
  end
  lib[("@metricas-dspd/metricas")]
  la --> met & ops & ref & pref
  la -->|webhook| bm
  lc --> bm & ac
  bm --> ops
  ac --> ops
  bm --> ref
  ac --> ref
  met --> lib
  met --> ref
  met --> ops
  bm -. "proibido" .- ac
```

Os módulos se chamam só pelo `index.ts` de cada um, e cada módulo só toca nas tabelas do próprio prefixo. Só o módulo `metricas` chama a biblioteca de cálculo; os coletores usam apenas o `core` e a derivação de marcos do próprio domínio.

## 4. Da coleta ao cartão

```mermaid
sequenceDiagram
  autonumber
  participant AG as Scheduler
  participant C as Lambda coleta
  participant O as Origem (BusinessMap ou Metabase)
  participant DB as MySQL
  participant A as Lambda api
  participant UI as Cartão (web)
  AG->>C: { fonte: 'bm' } (e, em outro horário, { fonte: 'ac' })
  C->>O: lê desde a marca d'água / extrai a tabela
  C->>DB: staging append-only (idempotente) → tabelas analíticas
  C->>DB: ops_execucao (contagens, duração, resultado) + nova versão de carga
  UI->>A: GET /api/v1/metricas/O3?equipe=...
  A->>DB: versão de carga atual (cache de 60 s)
  alt cache em memória vazio ou versão nova
    A->>DB: monta BaseBM/BaseAC
    A->>A: calcularMetrica (biblioteca única)
  end
  A-->>UI: DTO validado pelos contratos
```

## 5. Onde cada regra inviolável é garantida
| Regra (CLAUDE.md) | Garantia |
|---|---|
| BusinessMap e Acelerato nunca se misturam | módulos sem import entre si (lint), prefixos de tabela separados, coleta de cada fonte em invocação separada |
| Nenhuma visão individual | nenhuma rota ou DTO agrega por pessoa; `preferencias` responde só ao próprio usuário; `/dados` sem campo de pessoa |
| Biblioteca única (T2.5) | só o módulo `metricas` calcula (lint) |
| Nunca sobrescrever histórico | staging append-only; versão nova (SCD tipo 2) quando a linha muda; nada é apagado |
| Mudança de critério marcada (T2.6) | módulo `referencia`; a consulta do Metabase é versionada no repositório |
| Credenciais fora do código, fonte só de leitura | Secrets Manager (`.env` no dev); chave do Metabase só de leitura |

## 6. Próximos entregáveis
1. `docs/architecture/data-model.md`: ER por prefixo, chaves naturais, índices e versionamento.
2. `docs/architecture/roadmap.md`: ordem WS2 → WS3/WS5, com a divisão por agente.
3. ADR de autenticação, quando o SSO for informado.

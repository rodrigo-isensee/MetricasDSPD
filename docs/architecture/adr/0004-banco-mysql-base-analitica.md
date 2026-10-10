# 0004 - MySQL 8 como banco da base analítica
- Status: aceita (escolha do solicitante, pedido 002; não reabrir). **Parcialmente substituída pela ADR 0013** (2026-10-10) em dois pontos: (1) o Acelerato deixa de ser lido por MySQL somente leitura e passa a vir de uma tabela no Metabase (API, chave só leitura), então o contexto "o Acelerato já é MySQL" e o usuário `acelerato_leitor` não valem mais; (2) a instância é **RDS MySQL 8.4** na AWS, privada na VPC (responde I-2). Schemas, tipos, privilégios por papel e "o banco seleciona; a biblioteca calcula" continuam.
- Data: 2026-10-09
- Origem: `docs/pedidos/002-arquitetura-completa.md` (seção "Banco de dados"); ata kickoff 002, D13
- Substitui, para este projeto, o padrão "PostgreSQL + Prisma" das skills `software-architecture` e `node-backend`
- Modelo: `docs/architecture/data-model.md`

## Contexto
O solicitante fixou MySQL 8.x. A base guarda eventos imutáveis de duas origens (BusinessMap via API, Acelerato via MySQL somente leitura), alimenta a biblioteca de cálculo (T2.5) e precisa ser reconciliável contra as ferramentas. O Acelerato já é MySQL, o que facilita operação e conhecimento interno.

## Decisão
- **MySQL 8.4 LTS** (8.0 saiu de suporte em abril de 2026; se a infra só oferecer 8.0, aceitar e registrar como risco), InnoDB, `utf8mb4` / `utf8mb4_0900_ai_ci`, `sql_mode` estrito padrão (`STRICT_TRANS_TABLES`, `ONLY_FULL_GROUP_BY`...), `time_zone = '+00:00'` na sessão.
- Três **schemas** (databases) na mesma instância: `dspd_bm`, `dspd_ac`, `dspd_core` (referência compartilhada sem dados de origem: calendário, critérios). Nenhuma view, consulta ou FK junta `dspd_bm` com `dspd_ac`; verificado por teste de esquema no CI.
- Instantes em `DATETIME(3)` UTC (não `TIMESTAMP`: limite de 2038 e conversão implícita pelo fuso da sessão). Datas civis (feriado, vigência) em `DATE`. Conversão para `America/Sao_Paulo` só na apresentação.
- **O banco seleciona; a biblioteca calcula.** SQL nunca calcula horas úteis, percentil, mediana, taxa publicada nem Monte Carlo (T2.5). Consultas trazem as linhas do recorte; o servidor monta o contexto e chama `@metricas-dspd/metricas`.
- **Usuários e privilégios por papel** (detalhe em data-model §8): migrador (DDL), coletor (INSERT em staging e eventos, escrita só em projeções), webhook (INSERT só na tabela de staging do webhook), API (SELECT só em analítico, referência e controle; **sem acesso ao staging**, onde há dados pessoais).
- Payloads de origem em coluna `JSON` (validação nativa) com hash `BINARY(32)` (SHA-256) para idempotência.

## Alternativas consideradas
- **PostgreSQL** (padrão das skills): índices parciais, `TIMESTAMPTZ`, `jsonb`, schemas de verdade, RLS. Descartado pelo solicitante.
- **Um schema com prefixos** (`bm_`, `ac_`): mais simples de conectar. Contras: grants por tabela em vez de por schema e fronteira BM × AC menos visível. Schemas separados ganham.
- **Calcular em SQL** (window functions, `PERCENT_RANK`): rápido. Contras: segunda implementação de percentil e tempo útil, viola T2.5; método de percentil do MySQL difere do da biblioteca. Descartado.

## Consequências
- Mais fácil: operação conhecida pela infra; grants por schema reforçam BM × AC e "API não vê staging"; reprocessar coleta é seguro (chaves `UNIQUE` + `INSERT` normal, tratando só o erro 1062 `ER_DUP_ENTRY` como "já existente"). **Proibidos** `INSERT IGNORE` (rebaixa truncamento, valor inválido e FK a aviso, anulando o `sql_mode` estrito) e `ON DUPLICATE KEY UPDATE` (exige UPDATE, que o coletor não tem no staging nem nos eventos); regra verificada por lint/grep no CI.
- Mais difícil (o que o MySQL não tem e como compensamos):
  | Falta no MySQL | Compensação |
  |---|---|
  | Índice parcial | Coluna gerada (`IF(cond, 1, NULL)`) + índice/UNIQUE sobre ela (ex.: "uma só vigência aberta por chave em `ref_*`": `aberta = IF(vigente_ate IS NULL, 1, NULL)`, UNIQUE (chave, `aberta`)) |
  | `TIMESTAMPTZ` | `DATETIME(3)` sempre UTC, fuso da sessão fixo em `+00:00`, driver com `timezone: 'Z'` |
  | DDL transacional | Uma mudança por migração; migração com `down` testada no CI; falha no meio exige `down` manual (runbook) |
  | Schemas = databases | Conexão sem database padrão; toda consulta qualifica `dspd_bm.tabela` |
  | RLS | Grants por papel + nenhuma coluna de pessoa no analítico |
- Riscos: crescimento do staging (payload JSON integral) → particionamento por mês de `coletado_em` se passar de ~50 GB, avaliado no M1; versão 8.0 em fim de suporte, se for a única oferecida (pergunta I-2).

# 0005 - Acesso a dados e migrações: Kysely + SQL versionado
- Status: aceita
- Data: 2026-10-09
- Origem: ata kickoff 002, D13 (Prisma × Kysely + SQL versionado; posição do node-backend e do tech-lead)
- Substitui, para este projeto, "Prisma como ORM" da skill `node-backend`

## Contexto
O modelo (data-model) depende de recursos que precisam ser escritos em SQL e revisados como SQL: três schemas na mesma instância, colunas geradas com UNIQUE (substituto de índice parcial), `INSERT IGNORE`/`ON DUPLICATE KEY` para idempotência, views do recorte DSPD-SSSC (T5.1), `CHECK`, grants por papel e, talvez, particionamento. Além disso o coletor lê um banco **que não é nosso** (Acelerato, somente leitura) e que nunca pode receber migração.

Argumento central (praticas §6, do tech-lead, e D13): o esquema é o artefato revisado ("revisão de modelagem antes da migração"), então a migração tem de ser o SQL que vai rodar, legível no PR; e o acesso precisa ser tipado sem esconder o SQL das consultas de painel, cujo `EXPLAIN` é registrado (ADR 0003, M2). A ata não registra o argumento detalhado do node-backend; se divergir deste, revisar a ADR antes do K-017.

## Decisão
- **Kysely** como query builder tipado, driver `mysql2` (pool, `timezone: 'Z'`, `supportBigNumbers`, `dateStrings: false`).
- **Migrações** em `server/migrations/NNNN_descricao.ts`, executadas pelo `Migrator` do Kysely; cada arquivo contém `up` e `down` escritos em **SQL explícito** (`sql\`...\``), uma mudança por migração. Migração aplicada nunca é editada. Tabela de controle em `dspd_core`.
- **Tipos do banco** gerados por `kysely-codegen` a partir do MySQL migrado do CI e versionados (`server/src/db/tipos.gen.ts`); o CI falha se a geração divergir do arquivo (esquema e tipos não se descolam).
- **Acelerato**: tipos escritos à mão, só das colunas lidas (`server/src/coleta/acelerato/fonte.tipos.ts`), em conexão separada com usuário somente leitura; nenhuma migração aponta para lá.
- **Seed** (K-017): script que gera a base com `@metricas-dspd/mock` e grava na camada analítica e nas referências (não no staging), com o mesmo `hoje` e semente do hash da fase A; base dos testes de paridade (D15).
- Repositórios por módulo convertem linhas em tipos da biblioteca (`DimCard`, `Chamado`...) e instantes `Date` em epoch ms; nenhum tipo do Kysely sai do repositório.

## Alternativas consideradas
- **Prisma (Client + Migrate)**: DX excelente, migração gerada do `schema.prisma`. Contras para este caso: o esquema vira DSL e o SQL fica gerado (revisão de modelagem passa a revisar o que a ferramenta decidiu); colunas geradas, views, `CHECK`, grants e particionamento exigem editar o SQL gerado ou ficam fora do modelo; suporte a vários databases MySQL na mesma conexão é limitado (multi-schema não cobre MySQL como cobre PostgreSQL); `INSERT IGNORE`/upsert sem efeito e consultas de carga de contexto acabariam em `$queryRaw` sem tipo; engine binária a mais na imagem. Descartado.
- **SQL puro com dbmate/Flyway + `mysql2` sem builder**: migrações idênticas às nossas, sem dependência TS. Contras: consultas sem tipo. Mantido como plano B: se o Kysely atrapalhar, as migrações em SQL já são portáveis.
- **Drizzle**: tipado e próximo do SQL. Contras: migrações geradas a partir do schema TS (mesmo problema do Prisma, em menor grau), suporte a vários databases MySQL menos maduro; ganho pequeno sobre Kysely.
- **TypeORM / Sequelize**: ORMs com padrão ativo e mutável, contrários ao append-only. Descartados.

## Consequências
- Mais fácil: o PR de migração mostra o SQL real; idempotência e coluna gerada são cidadãs de primeira classe; `EXPLAIN` das consultas é do SQL que roda.
- Mais difícil: sem DSL de modelo nem migração automática; o node-backend escreve `up`/`down` à mão (o CI aplica `up`, `down`, `up` em MySQL 8 de container para provar reversibilidade).
- Riscos: tipos gerados desatualizados → verificação no CI; MySQL sem DDL transacional → uma mudança por migração e runbook de recuperação.

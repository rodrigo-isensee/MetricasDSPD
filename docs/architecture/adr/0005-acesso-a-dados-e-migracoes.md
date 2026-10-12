# 0005 - Acesso a dados e migrações: Kysely + SQL versionado
Estado: vigente (trechos substituídos pela [0013](0013-arquitetura-modular-serverless.md) e pela [0014](0014-stack-tecnica-do-back-end.md), marcados no texto)
- **Substituída em parte pela ADR 0014, revisão 2** (2026-10-10, decisão do usuário): **Kysely, `Migrator`, `kysely-codegen` e `mysql2` saem**; acesso por **`pg` puro** (PostgreSQL) e migrações por **node-pg-migrate** (TS que emite SQL explícito via `pgm.sql`, tabela `pgmigrations` em `dspd_core`, advisory lock, uma transação por migração). As migrações MySQL 0001–0010 são reescritas para Postgres (nunca aplicadas em ambiente compartilhado). Idempotência por `ON CONFLICT ON CONSTRAINT <chave natural> DO NOTHING` (alvo explícito obrigatório) no lugar do erro 1062. Tipos: declarados por repositório + teste de esquema (sem codegen). A revisão 1 (executor próprio sobre `mysql2`) não vale mais. **Continuam:** SQL explícito com `down`, uma mudança por migração, migração aplicada nunca editada, CI `up → down → up`, seed, repositórios sem vazar tipos do driver, conexão sem database padrão. É, na prática, o "plano B" listado abaixo.
- Status original: aceita (confirmada pelo tech-lead no parecer K-014 r1; de acordo do node-backend dado em 2026-10-09). **Parcialmente substituída pela ADR 0013** (2026-10-10) só no item "Acelerato": não há conexão MySQL ao Acelerato; a extração é pela API do Metabase, com o formato de cada coluna em schema zod (`server/src/modulos/acelerato/`). Em produção, as migrações rodam pela função `migrar` (RDS privado). O resto continua.
- Data: 2026-10-09
- Origem: ata kickoff 002, D13 (Prisma × Kysely + SQL versionado; posição do node-backend e do tech-lead)
- Substitui, para este projeto, "Prisma como ORM" da skill `node-backend`

## Contexto
O modelo (data-model) depende de recursos que precisam ser escritos em SQL e revisados como SQL: três schemas na mesma instância, colunas geradas com UNIQUE (substituto de índice parcial), idempotência por `INSERT` + tratamento do erro 1062 (sem `INSERT IGNORE`/`ON DUPLICATE KEY`, ADR 0004), views do recorte DSPD-SSSC (T5.1), `CHECK`, grants por papel e, talvez, particionamento. Além disso o coletor lê um banco **que não é nosso** (Acelerato, somente leitura) e que nunca pode receber migração.

Argumento central (praticas §6, do tech-lead, e D13): o esquema é o artefato revisado ("revisão de modelagem antes da migração"), então a migração tem de ser o SQL que vai rodar, legível no PR; e o acesso precisa ser tipado sem esconder o SQL das consultas de painel, cujo `EXPLAIN` é registrado (ADR 0003, M2).

### Divergência registrada (D13)
- **Posição do node-backend (kickoff):** Prisma (Client + Migrate) com migrações em SQL cru editado à mão. Motivo: é o padrão da skill `node-backend` (time já conhece; Client tipado e Migrate prontos) e o SQL cru cobriria o que a DSL não expressa (colunas geradas, views, `CHECK`, grants). A ata não detalha o argumento: este motivo é a leitura do arquiteto, **a confirmar ou corrigir pelo node-backend** junto com o de acordo.
- **Resposta (tech-lead, parecer `docs/reviews/002-K-014-r1.md`, que confirma Kysely + SQL):** (1) o Prisma Migrate não tem migração `down`, e praticas §6 exige caminho de volta com CI `up` → `down` → `up`; (2) o `multiSchema` do Prisma não cobre MySQL, e o modelo usa três databases na mesma conexão; (3) com SQL cru o Prisma vira só executor de arquivo, sem ganho sobre o `Migrator` do Kysely; (4) as consultas de carga de contexto cairiam em `$queryRaw` sem tipo.
- **De acordo do node-backend (2026-10-09, K-017):** de acordo com Kysely + SQL versionado. Correção do motivo registrado: a posição original pelo Prisma era a conveniência do padrão da skill, e os quatro argumentos do tech-lead procedem (sem `down`, sem multi-schema MySQL, Prisma reduzido a executor de SQL, `$queryRaw` sem tipo). Detalhe de implementação: no Kysely 0.29 o `Migrator` vem de `kysely/migration`; as migrações são TS com listas `up`/`down` de SQL explícito, registradas num provider estático. Spike pendente de ambiente (sem Docker na máquina do K-017): tabela do `Migrator` em `dspd_core` e `kysely-codegen`; os testes estão prontos em `server/tests/migracoes.mysql.test.ts`.
- **A provar no spike do R0:** `kysely-codegen` gerando tipos dos três databases; tabela do `Migrator` em `dspd_core` com conexão sem database padrão. Se falhar, plano B abaixo (SQL puro + dbmate/Flyway).

## Decisão
- **Kysely** como query builder tipado, driver `mysql2` (pool, `timezone: 'Z'`, `supportBigNumbers`, `dateStrings: false`).
- **Migrações** em `server/migrations/NNNN_descricao.ts`, executadas pelo `Migrator` do Kysely; cada arquivo contém `up` e `down` escritos em **SQL explícito** (`sql\`...\``), uma mudança por migração. Migração aplicada nunca é editada. Tabela de controle em `dspd_core`.
- **Tipos do banco** gerados por `kysely-codegen` a partir do MySQL migrado do CI e versionados (`server/src/db/tipos.gen.ts`); o CI falha se a geração divergir do arquivo (esquema e tipos não se descolam).
- **Acelerato**: tipos escritos à mão, só das colunas lidas (`server/src/coleta/acelerato/fonte.tipos.ts`), em conexão separada com usuário somente leitura; nenhuma migração aponta para lá.
- **Seed** (K-017): script que gera a base com `@metricas-dspd/mock` e grava na camada analítica e nas referências (não no staging), com o mesmo `hoje` e semente do hash da fase A; base dos testes de paridade (D15).
- Repositórios por módulo convertem linhas em tipos da biblioteca (`DimCard`, `Chamado`...) e instantes `Date` em epoch ms; nenhum tipo do Kysely sai do repositório.

## Alternativas consideradas
- **Prisma (Client + Migrate)**: DX excelente, migração gerada do `schema.prisma`. Contras para este caso: o esquema vira DSL e o SQL fica gerado (revisão de modelagem passa a revisar o que a ferramenta decidiu); colunas geradas, views, `CHECK`, grants e particionamento exigem editar o SQL gerado ou ficam fora do modelo; suporte a vários databases MySQL na mesma conexão é limitado (multi-schema não cobre MySQL como cobre PostgreSQL); Migrate sem `down`; consultas de carga de contexto acabariam em `$queryRaw` sem tipo; engine binária a mais na imagem. Descartado.
- **SQL puro com dbmate/Flyway + `mysql2` sem builder**: migrações idênticas às nossas, sem dependência TS. Contras: consultas sem tipo. Mantido como plano B: se o Kysely atrapalhar, as migrações em SQL já são portáveis.
- **Drizzle**: tipado e próximo do SQL. Contras: migrações geradas a partir do schema TS (mesmo problema do Prisma, em menor grau), suporte a vários databases MySQL menos maduro; ganho pequeno sobre Kysely.
- **TypeORM / Sequelize**: ORMs com padrão ativo e mutável, contrários ao append-only. Descartados.

## Consequências
- Mais fácil: o PR de migração mostra o SQL real; idempotência e coluna gerada são cidadãs de primeira classe; `EXPLAIN` das consultas é do SQL que roda.
- Mais difícil: sem DSL de modelo nem migração automática; o node-backend escreve `up`/`down` à mão (o CI aplica `up`, `down`, `up` em MySQL 8 de container para provar reversibilidade).
- Riscos: tipos gerados desatualizados → verificação no CI; MySQL sem DDL transacional → uma mudança por migração e runbook de recuperação.

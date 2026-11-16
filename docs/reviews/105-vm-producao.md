---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-vm-producao
commit: 9c3c2ebae42ece652e02bbbca92b73cbe99f0353
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: configuração de produção da VM (E7.270, volta 1 E7.276, review E7.282)

## Delta lido (volta 1)
`forge-check parecer delta docs/reviews/105-vm-producao.md`: intervalo `efe4fb86..9c3c2eba`, sem o que veio da develop; no domínio `.env.example`, `CHANGELOG.md`, `deploy/sql/00_papeis_e_banco.sql` (gerado), `deploy/sql/papeis-producao.sql` (removido), as quatro unidades `deploy/systemd/*.service`, `docker-compose.prod.yml`, `scripts/gerar-sql-migracoes.mjs` e `.sh`. O documento `docs/devops/105-implantacao-vm.md` fundido foi lido só nas seções de papéis, TLS e systemd.

## O que foi conferido
- **A1 (TLS) resolvido:** as 6 URLs com `sslmode=verify-full` fixo; `NODE_EXTRA_CA_CERTS` e o volume `${DB_CA_ARQUIVO:?}` somente leitura em migrate, api, worker e coleta. `docker compose -f docker-compose.prod.yml --profile coleta config -q` sem `DB_CA_ARQUIVO` falha com `required variable DB_CA_ARQUIVO is missing a value`; com ele, a CA aparece montada nos quatro serviços. `.env.example` e o compose dizem que no `pg` 8 `require` já valia `verify-full` e que `DB_HOST` tem de ser o nome do certificado.
- **A2 resolvido:** develop integrada (merge `9c3c2eba`, pais `c804e375` e `a04bd2f2`); um roteiro de papéis só, o do gerador (`pnpm run db:sql`), com `\getenv`, `SET log_statement = 'none'` e webhook, automação e pesquisa NOLOGIN e fora do `CONNECT`; `papeis-producao.sql` removido. O arquivo versionado bate com o modelo do gerador; o `.sh` aplica o próprio SQL com as senhas por `-e` no ambiente.
- **A3 resolvido:** as quatro unidades fixam `COMPOSE_FILE=docker-compose.prod.yml` e `COMPOSE_ENV_FILES` e exigem o `host.env` (sem `-`). Compose 2.24+ exigido no documento.
- **A4 resolvido:** `.env.example` pede senhas `openssl rand -hex 32` (seguras para URL).
- **A5 resolvido:** documento, "Se o roteiro de papéis falhar", diz como recomeçar ou continuar.
- **Sondas no Postgres 17 descartável (S2 a S4):** o roteiro completo cria os 5 papéis de login e os 3 NOLOGIN; a variável ausente para o script com `ON_ERROR_STOP`; o administrador sem superusuário para no `SET log_statement`, antes de criar qualquer papel, e o documento (item 1 da seção do DBA) dá a saída por `\password`.
- **Ferramentas:** `shellcheck scripts/gerar-sql-migracoes.sh`: só SC1003 (info) na linha 34, que já existia na develop, fora do diff.
- **Tamanho (M14):** sem `.md`, 163 linhas alteradas contra a develop (compose 81, gerador 36, SQL gerado 26, unidades 16, `.env.example` 4); passa da orientação por 13 linhas, 26 delas geradas; um comportamento só (configuração de produção). O PR registra `teto: excedido, 163 linhas, SQL gerado e compose novo`.
- **CI:** o pronto local do autor não rodou (fila). O CI de push do head `9c3c2eba` (run 43931502369) terminou `success`: rapida, seguranca, testes, build, imagem, openapi e banco verdes; e2e e perf pulados pelo filtro. Sem PR para a branch: o CI do PR fica para o merge.
- **Segurança:** cito o parecer do `security-engineer` (`docs/security/105-vm-producao.md`); não o refaço.

## Achados
- A6 (recomendado) deploy/systemd/metricas-referencias.service:11 · o comentário diz que `PG_REF_URL` está "montada no docker-compose.yml", mas a unidade agora fixa `docker-compose.prod.yml`; trocar o nome do arquivo no comentário.
- A7 (recomendado) deploy/sql/00_papeis_e_banco.sql:10 · "Variável ausente para o script (falha fechada)" é verdade, mas só no primeiro `CREATE ROLE` que a usa: sem `PWD_API`, `dspd_migrador` e `dspd_coletor` já ficaram criados (S2). Opcional: conferir as cinco variáveis com `\if` antes do primeiro `CREATE`, no gerador.

## Sondas
- S2 · roteiro sem `PWD_API`, superusuário · espera: para sem criar papel · obtido: `syntax error at or near ":"` em `dspd_api`; `dspd_migrador` e `dspd_coletor` criados (falha parcial, coberta pela seção de retomada)
- S3 · roteiro com administrador `CREATEROLE CREATEDB` sem superusuário · espera: falha antes de criar papel · obtido: `permission denied to set parameter "log_statement"`, nenhum papel criado
- S4 · roteiro completo, superusuário · espera: 5 LOGIN e 3 NOLOGIN · obtido: igual

## Parecer
Aprovado. A1 a A5 da volta anterior resolvidos; A6 e A7 ficam a critério do autor e não voltam ao review.

---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-implantacao-vm
commit: b0552e47
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: pacote de implantação na VM (E7.244 e E7.246, review E7.248)

Branch `docs/105-implantacao-vm` contra `develop` (base `57989aa0`), head `b0552e47`. São dois commits: `e16602fe` (documento) e `b0552e47` (pedido à infraestrutura e SQL para o DBA). Código e teste somam 143 linhas: `scripts/gerar-sql-migracoes.sh` (47), `.mjs` (95) e `package.json` (1). Ficam fora `deploy/sql/`, que é gerado, e o `.md`. O total está abaixo do teto de 150 e cobre um comportamento: gerar o SQL das migrações para o DBA.

O brief traz `Revisar-sha: 57989aa0`, que é a base, e pede `commit: b0552e47` no Entregar. Revisei o `b0552e47`, que é o head da branch.

## Parecer
**Aprovado.** O documento bate com o código, e o SQL se reproduz. Os quatro achados são recomendados e nenhum bloqueia.

## O que conferi
- **SQL reprodutível.** Rodei `pnpm run db:sql` no head `b0552e47`, com Docker local e um Postgres 17 descartável. A saída teve `rc=0` e terminou assim: `39 migrações`, `9000_grants.sql e consolidado.sql gerados (41 arquivos)`, `OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)` e `OK: 39 migracoes registradas nos dois caminhos`. Depois, `git status` não mostrou nenhuma diferença em `deploy/sql/`: os arquivos commitados são exatamente o que o comando gera. O `consolidado.sql` não tem `CREATE EXTENSION`, o que confirma o item 3 da seção 5.
- **Sem segredo.** O `00_papeis_e_banco.sql` usa as variáveis do psql `:'pwd_*'`. O gerador usa a senha fixa `descartavel` só no contêiner local, publicado em 127.0.0.1, que é apagado no `trap`.
- **Variáveis (seção 1).** Os nomes conferem com `server/src/plataforma/config.ts`, `server/src/plataforma/db/*.ts`, `server/src/**` (`ACELERATO_MYSQL_*` aparece nos nove nomes que o documento cita) e `docker-compose.yml` (`POSTGRES_PASSWORD` e os oito `DSPD_PWD_*`). Não li o conteúdo dos `.env*.example` porque a sandbox nega a leitura de `.env*`. Por isso a frase "`PESSOA_ELIMINADA_SAL` não está em nenhum `.env.example`" (linha 57) **não foi conferida** por mim.
- **Comandos (seção 2).** `stack:up`, `stack:down`, `db:migrate`, `db:sql`, `homolog:subir`, `homolog:derrubar`, `homolog:smoke`, `homolog:migracao` e `pronto` existem em `package.json`. `bm:ref-sync`, `ac:ref-sync`, `ref:sync-calendario`, `bm:ref-sync-apontamento`, `bm:criterios-classe-servico`, `bm:coleta`, `bm:apontamento` e `migrate` existem em `server/package.json`. A exigência de `DSPD_PERMITIR_DOWN` para a volta está no código.
- **Versões (seção 3).** As versões citadas batem com os arquivos: `node >=24`, `pnpm@10.34.6`, imagens `node:24-slim`, `nginx:alpine` e `postgres:17`, Fastify 5, React 19, Vite 8, TanStack Query 5, Recharts 3, Vitest e fast-check. O Compose 2.24 está no runbook, linha 20.
- **Contagem.** `server/migrations` tem 39 migrações, como diz "deve dar 39". A tabela `pgmigrations` fica em `S.core`, como no runner (`migrar.ts:74,90`). A frase "sem o passo 1, a aplicação recusa migrar" está certa: sem os papéis, `migrar.ts:33` falha. Se faltar só o `CONNECT`, ele apenas avisa.
- **Regras invioláveis.** O pacote não muda cálculo e não mistura as fontes. Credenciais aparecem só pelo nome. A divergência entre o `CLAUDE.md` (Acelerato pela API, só GET) e o código (MySQL só leitura, ADR 0023) está apontada com honestidade nas seções 4 e 5. Quem decide qual texto fica certo é o dono, pelo Jarvis.
- **Ferramenta.** `shellcheck scripts/gerar-sql-migracoes.sh` deu só um aviso SC1003 de nível info, que vira o A4. Não há PR, então não afirmo CI verde. Também não rodei a suíte, que fica para o CI do PR.

## Achados
- A1 (recomendado) scripts/gerar-sql-migracoes.sh:1 · Nada no CI nem no `pronto` confere `deploy/sql/` contra `server/migrations`: migração sem `db:sql` deixa o pacote do DBA velho sem aviso. Sugestão: teste sem Docker da fase `arquivos` contra o commitado.
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:41 · Com banco já existente, `ALTER DATABASE` e `REVOKE ALL ON DATABASE` exigem dono ou superusuário; o comentário e o documento (linha 187) não dizem isso.
- A3 (recomendado) scripts/gerar-sql-migracoes.sh:29 · A prova cobre o `consolidado.sql`, não os arquivos soltos `0000`…`0039` + `9000` do caminho de atualização (documento, linha 197). Risco baixo: mesmo conteúdo.
- A4 (recomendado) scripts/gerar-sql-migracoes.sh:34 · O shellcheck acusa SC1003 (info) em `grep -v '^\\'`. É falso positivo. Use `grep -v '^[\]'` ou um `# shellcheck disable=SC1003` com o motivo.

## Sem teste
O gerador não tem teste automatizado próprio. Ele se confere sozinho (diff dos dumps e contagem de `pgmigrations`) e eu o rodei aqui. Como é uma ferramenta de apoio que não roda em produção, aceito como está. O A1 é o próximo passo.

---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: 54a2c06eebe21fd7e1812f70d3c5e8154cf1796e
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: gerador do SQL do DBA recusa chamada fora do wrapper (pedido 105, K-394, E7.379 e E7.387)

Revalidação pelo delta (`forge-check parecer delta`, intervalo d1917f11..54a2c06e): no domínio do QA só `server/tests/gerador-sql-recusa.test.ts` (novo); `scripts/` não mudou, e o roteiro da VM ganhou o comando do aviso ao DBA. A seção "Revalidação 54a2c06e" no fim traz as provas novas. Parecer anterior, head d1917f11, base ab12a37f: diff de 3 arquivos, `scripts/gerar-sql-migracoes.mjs` (trava), `scripts/gerar-sql-migracoes.sh` (define a variável) e `docs/devops/105-implantacao-vm.md` (roteiro). Sem PR: a suíte inteira fica para o CI do PR e este parecer não afirma CI verde. Nenhum `.env` lido.

## Achados

## Critério → teste → resultado
| Obrigação (brief K-394) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Gerador chamado direto não altera `deploy/sql` | `tsx scripts/gerar-sql-migracoes.mjs` sem a variável, nas fases `arquivos`, `grants` e sem fase: mensagem `recusado: ... Nada foi alterado.`, saída 3 (pnpm repassa como `exit code 3`); hash da pasta antes e depois `c831ceee374fb24f`, igual. Revalidado em 54a2c06e: teste novo 6 de 6 e chamada direta rc=3 | fase `arquivos` apagava os .sql; fases sem banco | passou |
| Só o valor exato `1` libera | `DSPD_GERADOR_VIA_WRAPPER` em `0`, `true` e vazia, fase `arquivos`: recusa nos três (exit 3); hash da pasta inalterado; coberto também pelo teste novo | valores quase certos, vazio | passou |
| Pelo wrapper sai igual | `pnpm run db:sql` rc=0: 39 migrações, 41 arquivos gerados, "OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)", "OK: 39 migracoes registradas nos dois caminhos"; hash da pasta idêntico ao anterior; `git status` limpo (repetido em 54a2c06e) | regeneração byte a byte | passou |
| `pnpm run db:sql` segue igual | `package.json:33` aponta para `bash scripts/gerar-sql-migracoes.sh`; o `.sh` define a variável só dentro de `gerar()`, que cobre as duas chamadas (`arquivos` e `grants`) | as duas fases | passou |
| Nenhum outro chamador quebra | busca por `gerar-sql-migracoes`: só `package.json`, o `.sh` e o `.mjs` | chamadores ocultos | passou |
| Roteiro da VM descreve `ON_ERROR_STOP` e os três `SET` | leitura contra `deploy/sql/00_papeis_e_banco.sql`: `\set ON_ERROR_STOP on`, `log_statement = 'none'`, `log_min_duration_statement = -1`, `log_min_error_statement = panic`; o texto bate | texto × arquivo gerado | passou (leitura) |
| Aviso ao DBA sobre `pg_stat_statements`: comando com `PGOPTIONS` na mesma conexão e privilégio citado | executado em PG 17 descartável com a extensão carregada e senha fictícia: 5 ocorrências sem, 0 com (cenários A a E abaixo) | mesma conexão do `-f`; papel sem privilégio | passou (executado) |
| Teste da recusa do gerador (E7.387) | `server/tests/gerador-sql-recusa.test.ts`: verde 6 de 6, vermelho 6 de 6 na base, 2 mutantes mortos | fase, valor da variável, pasta intacta | passou |

## Observações
- A trava vem antes de qualquer `import` e de qualquer escrita; por isso `deploy/sql` fica intacta mesmo com `server/` sem dependências corretas.
- A recomendação do parecer anterior (teste que chame o `.mjs` sem a variável e confira saída 3 e a pasta intacta) foi atendida em 54a2c06e.
- Docker: o contêiner descartável do wrapper e o do aviso ao DBA foram removidos ao fim; permanece só `metricasdspd-postgres-1`, que já existia.

## Revalidação 54a2c06e (delta)
Provas rodadas por mim neste head, sem PR e sem afirmar CI verde (a suíte inteira fica para o CI do PR).

### Aviso ao DBA (pg_stat_statements): comando executado
PostgreSQL 17.11 descartável (`postgres:17` com `-c shared_preload_libraries=pg_stat_statements`, `CREATE EXTENSION`, `track_utility=on`), senha fictícia `senha_ficticia_qa105` nas cinco `PWD_*`, `psql -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql` como superusuário, estado reiniciado entre cenários (`pg_stat_statements_reset()`, banco e papéis apagados). Ocorrências = linhas da view com a senha no texto.

| Cenário | rc | Ocorrências da senha | Papéis `dspd_*` |
|---|---|---|---|
| A: sem `PGOPTIONS` | 0 | 5 | 8 |
| B: `PGOPTIONS='-c pg_stat_statements.track=none'` com `-f` (comando do roteiro) | 0 | 0 | 8 |
| C: `-c "SET pg_stat_statements.track = 'none'" -f` (alternativa do roteiro) | 0 | 0 | 8 |
| D: `SET` numa sessão à parte, depois `-f` (contraprova do texto "mesma conexão") | 0 | 5 | 8 |
| E: `PGOPTIONS` com papel `CREATEROLE` sem superusuário nem GRANT | conexão recusada: `permission denied to set parameter "pg_stat_statements.track"` | n/a | 0 (nada criado) |

Confere o que o roteiro afirma: 5 sem, 0 com, mesma conexão, privilégio exigido, nada criado sem ele.

### Teste novo da recusa (`server/tests/gerador-sql-recusa.test.ts`)
- Verde no head: 6 de 6 (`vitest run --project unit`, numa cópia em `$TMPDIR`, porque a worktree é somente leitura no sandbox; o teste já roda o `.mjs` numa raiz temporária).
- Vermelho: com o `scripts/gerar-sql-migracoes.mjs` da base ab12a37f na cópia, 6 de 6 falham (`expected 1 to be 3`). Na cópia o `.mjs` da base sai 1 por falta de dependências e não apaga nada; o vermelho prova o código de saída e a mensagem, não a destruição da pasta. Não rodei `forge-testes --vermelho` (exige a árvore do autor limpa e gravável fora do sandbox); o vermelho foi por cópia.
- Mutação no trecho alterado (cópia): M1 `!== '1'` trocado por `=== undefined`: 3 de 6 caem (morto). M2 `process.exit(3)` trocado por `process.exit(2)`: 6 de 6 caem (morto). Sobreviventes: 0.
- Redundância: os dois blocos cobrem classes distintas (fase sem variável; valor da variável diferente de 1); aceitável.

### Gerador direto e pelo wrapper (head 54a2c06e)
- Direto: `node scripts/gerar-sql-migracoes.mjs arquivos`: "recusado ... Nada foi alterado.", rc=3; hash da pasta `deploy/sql` antes e depois `710f3f873750bc10`.
- Wrapper: `pnpm run db:sql` rc=0, 39 migrações, 41 arquivos, "OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)", "OK: 39 migracoes registradas nos dois caminhos"; hash `710f3f873750bc10`, idêntico; `git status` limpo.

### Resultado
Sem defeito. Achados: nenhum. A prova de 5 para 0 do autor se reproduziu de forma independente.

---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: d1917f11fae09baefe4e83297d390e46e4ce5d70
parecer: aprovado
resultado: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: gerador do SQL do DBA recusa chamada fora do wrapper (pedido 105, K-394, E7.379)

Branch `fix/105-gerador-sql-seguro`, head d1917f11, base ab12a37f. Diff de 3 arquivos: `scripts/gerar-sql-migracoes.mjs` (trava), `scripts/gerar-sql-migracoes.sh` (define a variável) e `docs/devops/105-implantacao-vm.md` (roteiro). Sem PR: a suíte inteira fica para o CI do PR e este parecer não afirma CI verde. Nenhum `.env` lido.

## Achados

## Critério → teste → resultado
| Obrigação (brief K-394) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Gerador chamado direto não altera `deploy/sql` | `tsx scripts/gerar-sql-migracoes.mjs` sem a variável, nas fases `arquivos`, `grants` e sem fase: mensagem `recusado: ... Nada foi alterado.`, saída 3 (pnpm repassa como `exit code 3`); hash da pasta antes e depois `c831ceee374fb24f`, igual | fase `arquivos` apagava os .sql; fases sem banco | passou |
| Só o valor exato `1` libera | `DSPD_GERADOR_VIA_WRAPPER` em `0`, `true` e vazia, fase `arquivos`: recusa nos três (exit 3); hash da pasta inalterado | valores quase certos, vazio | passou |
| Pelo wrapper sai igual | `pnpm run db:sql` rc=0: 39 migrações, 41 arquivos gerados, "OK: runner e SQL gerado produzem o mesmo esquema (4304 linhas de dump)", "OK: 39 migracoes registradas nos dois caminhos"; hash da pasta `c831ceee374fb24f`, idêntico ao anterior; `git status` limpo | regeneração byte a byte | passou |
| `pnpm run db:sql` segue igual | `package.json:33` aponta para `bash scripts/gerar-sql-migracoes.sh`; o `.sh` define a variável só dentro de `gerar()`, que cobre as duas chamadas (`arquivos` e `grants`) | as duas fases | passou |
| Nenhum outro chamador quebra | busca por `gerar-sql-migracoes`: só `package.json`, o `.sh` e o `.mjs` | chamadores ocultos | passou |
| Roteiro da VM descreve `ON_ERROR_STOP` e os três `SET` | leitura contra `deploy/sql/00_papeis_e_banco.sql`: `\set ON_ERROR_STOP on`, `log_statement = 'none'`, `log_min_duration_statement = -1`, `log_min_error_statement = panic`; o texto bate | texto × arquivo gerado | passou (leitura) |
| Aviso ao DBA sobre `pg_stat_statements` | presente: `SET pg_stat_statements.track = 'none'` na sessão (superusuário) e `pg_stat_statements_reset()` depois, condicionado à política da empresa; o aviso diz que os `SET` cobrem o log, não as estatísticas | n/a | passou (leitura); não executado, o contêiner do projeto não tem a extensão carregada por mim |

## Observações
- A trava vem antes de qualquer `import` e de qualquer escrita; por isso `deploy/sql` fica intacta mesmo com `server/` sem dependências corretas.
- Teste automatizado novo: não há no diff. A obrigação é de comportamento do script e foi provada por execução acima; vermelho antes do verde: na base ab12a37f o `.mjs` não tinha a trava, e o próprio texto do roteiro registra que, chamado direto, apagava os `.sql`. Não reexecutei a base para não destruir a pasta; recomendo, se o autor quiser blindar, um teste que chame o `.mjs` sem a variável e confira saída 3 e a pasta intacta (não bloqueia, sem defeito provado).
- Docker: o contêiner descartável do wrapper foi removido ao fim; permanece só `metricasdspd-postgres-1`, que já existia.

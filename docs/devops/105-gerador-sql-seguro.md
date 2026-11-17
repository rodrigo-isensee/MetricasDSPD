---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: 54a2c06eebe21fd7e1812f70d3c5e8154cf1796e
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: gerador do SQL do DBA seguro (K-394, E7.397)

## Parecer
Aprovado, sem achado bloqueante. Visto de quem opera a VM e de quem gera o SQL do DBA: a recusa do `.mjs` fora do wrapper fecha o caminho que apagava `deploy/sql`, e o roteiro da VM agora manda desligar o `pg_stat_statements` na mesma conexão do `psql -f`.

## Detalhes
Lido por diff `ab12a37f..54a2c06e` (o head da branch já andou só com pareceres de QA, review e segurança; `54a2c06e` é ancestral do tip, sem mudança de código depois). Suíte e CI não afirmados: sem PR, ficam para o CI do PR (vale o PQ do autor).

- `scripts/gerar-sql-migracoes.mjs` · aprovado. A recusa (código 3, mensagem com `pnpm run db:sql`) fica antes do `import` dinâmico e de qualquer leitura ou escrita em disco; `COMANDO` está definido na linha 14. Rodei o `.mjs` sem a variável nas três formas (`arquivos`, `grants`, sem fase): as três saíram com rc=3 e a mensagem "Nada foi alterado", e `git status deploy` ficou limpo.
- `scripts/gerar-sql-migracoes.sh:12` · aprovado. O wrapper define a variável só na função `gerar`, que cobre as duas fases (`arquivos` e `grants`). Único chamador do `.mjs`: `package.json:33` (`db:sql` chama o `.sh`); `grep` em `.github/`, `scripts/` e `server/package.json` não achou outro uso, então a trava não quebra CI nem outro script. `shellcheck` no `.sh`: só SC1003 informativo na linha 34, anterior a esta entrega e falso positivo (aspas dentro de `grep`).
- `server/tests/gerador-sql-recusa.test.ts` · fora do domínio de devops no conteúdo; olhei só a segurança operacional: roda uma cópia do `.mjs` em diretório temporário, de modo que o `deploy/sql` do repositório nunca é exposto, e cobre fases e valores da variável (`0`, `true`, vazio). Vale o PQ do autor e o CI do PR (não afirmado).
- `docs/devops/105-implantacao-vm.md` · aprovado. Para o operador da VM: `PGOPTIONS='-c pg_stat_statements.track=none' psql ... -f deploy/sql/00_papeis_e_banco.sql` põe o ajuste na própria conexão do `-f`; a alternativa `-c "SET ..." -f` corre na mesma conexão, como diz o texto. O privilégio exigido (superusuário ou `GRANT SET ON PARAMETER`, PostgreSQL 15 ou mais novo) é o mesmo dos `SET` de log que o script já pede, e a falha sem ele é segura (conexão recusada, nada criado). O texto traz a prova em PostgreSQL 17 descartável (5 comandos com a senha sem `PGOPTIONS`, 0 com ele); não repeti, pois não há `psql` no PATH aqui. Sem segredo no documento. A frase nova do gerador ("sem o wrapper recusa, código 3") bate com o código.

Observações, sem exigir correção:
- `scripts/gerar-sql-migracoes.mjs:31` · a trava confere `DSPD_GERADOR_VIA_WRAPPER === '1'`. Quem exportar a variável no shell a contorna; é trava contra engano (chamada direta do `.mjs`), não contra má-fé. Proporcional.
- `docs/devops/105-implantacao-vm.md` passo 1 · `PGOPTIONS` não vale por pooler (por exemplo pgbouncer em modo transação, que ignora opções de partida). O roteiro já dá a alternativa `-c "SET ..." -f` na mesma conexão e o reset das estatísticas como último recurso; basta o DBA ir direto ao servidor com o `psql`.

Ferramentas: `shellcheck` usado; `actionlint` não se aplica (nenhum workflow mudou) e não está no PATH; `psql` ausente.

## Custo e rollback
Sem minutos de CI novos nem recurso pago. Volta: reverter o commit; o `.mjs` volta a rodar direto (e a apagar `deploy/sql` se chamado sem o wrapper).

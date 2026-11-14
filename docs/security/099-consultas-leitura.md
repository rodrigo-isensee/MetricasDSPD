---
tipo: revisao-seguranca
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: chore/consultas-leitura-098-099
commit: 7bf135762d25c6d7e95089128e9f69c20ca1b8cd
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: comando único das consultas só de leitura dos pedidos 098 e 099 (K-275, E3.2), revalidação

Propósito: revalidar o `pnpm run consultas:098-099` depois das voltas 1 a 3 do devops-engineer. Volta por delta: `forge-check parecer delta` do parecer anterior (`aa8b6f20`) até `7bf13576` toca, no domínio, só `.gitignore`, `scripts/consultas-leitura-098-099.sh` e o teste; nenhum `.sql` de `scripts/sql/consultas-098-099/`, nenhuma migração, nada em `server/`. Nada rodou contra base real e nenhum `.env*` foi aberto. Rodados só `bash scripts/consultas-leitura-098-099.test.sh` (todos os casos verdes, incluindo S1 a S7) e `shellcheck` nos dois arquivos (limpo).

## Gatilhos
- Segredos e configuração: lê o `.env` (senha do `dspd_coletor`, credencial e certificado do MySQL do Acelerato).
- Banco real: leitura nas duas fontes, com papel que tem escrita no PostgreSQL.
- Dado de pessoa (LGPD, regra inviolável do `CLAUDE.md`): a saída vai a um arquivo que o dono cola em análises.
- Controle que analisa entrada: a lista do permitido no `.sql` e a guarda de colunas.

## Resultado por ponto do brief

**1. `.env` malformado sem eco: conforme.** `scripts/consultas-leitura-098-099.sh:61-64`: o `.` roda com `2>/dev/null`, então a mensagem do bash (que traria a primeira palavra da linha ruim) não sai; erro de sintaxe vira `falhar "env" "env"` com texto fixo, depois de `set +a`. O teste prova os dois casos (linha que vira comando inexistente e aspas sem fechar): nada do `.env` na tela, rc 1 e banco não chamado. Os controles do parecer anterior (nomes só por `grep -Eq`, senha só por ambiente ou arquivo 0600 apagado no `trap`, texto do driver em `/dev/null`) continuam como estavam.

**2. Recusa das funções de sessão e de arquivo: conforme no que lista, com contorno de baixo impacto (A5).**
- A lista (`:90`) agora inclui `set`, `set_config`, `pg_read_file`, `pg_read_binary_file`, `lo_import`, `dblink`, `into`, `do`, `execute`, `system`; e `validar_sql` (`:91-104`) exige primeiro token `SELECT` ou `WITH`, no máximo um `;` e só no fim, nenhuma barra invertida. As sondas S1 a S7 do parecer anterior, mais `set_config`, `pg_read_file`, `pg_read_binary_file`, `lo_import`, `dblink`, `\gexec` sem `INTO` e dois `;`, viraram casos do teste e são recusadas sem chamar o banco. O corpus de legítimos (os 31 `.sql`) continua passando.
- Contorno (S8 a S12, só sobre a função `validar_sql` extraída e texto literal, sem banco): identificador Unicode do PostgreSQL com escape próprio, `U&"s!0065t!005fconfig" UESCAPE '!'(...)`, não tem barra invertida nem palavra da lista e passa; `pg_terminate_backend`, `pg_advisory_lock` e `lo_create` também passam, por não estarem na lista.
- Por que não bloqueia: a consulta roda numa sessão `default_transaction_read_only=on`, dentro de `BEGIN READ ONLY` e seguida de `ROLLBACK`, num `psql` que termina em seguida (`:138-143`). Com um só comando, `set_config('transaction_read_only','off')` falha depois do primeiro snapshot, `lo_create` e `nextval` são recusados em transação só de leitura, e mudar `default_transaction_read_only` só valeria para uma transação seguinte, que não existe. `pg_read_*` exige `pg_read_server_files`, que o `dspd_coletor` não tem. Resta negação de serviço: `pg_terminate_backend` derruba sessões do mesmo papel (a carga do coletor, retomável) e `pg_sleep` fica no teto de `statement_timeout`. O autor seria quem versiona um `.sql` que passa por review; nos 31 atuais não há `pg_`, `lo_`, `U&` nem `UESCAPE` fora de comentário (conferido nesta volta).

**3. Nada novo lê dado de pessoa nem escreve na base: conforme.** Nenhum `.sql` mudou desde o parecer anterior (os 31 continuam os lidos um a um); o script não ganhou consulta, só validação. O executor do PostgreSQL continua com papel, sessão e transação do parecer anterior; o MySQL ganhou `--sandbox` e `--defaults-file` (`:147`), o que fecha `system` e `\!` no host do dono e impede um `~/.my.cnf` de religar `local-infile` ou desligar a verificação.

**4. Achados anteriores.**
- A1 (lista negra): corrigido pela estrutura do permitido (`:91-104`) e pelo `--sandbox`; o resíduo é A5.
- A2 (papel `dspd_coletor` com escrita): segue recomendado, sem mudança; vale se o comando virar rotina.
- A3 (TLS): corrigido. O arquivo de opções leva `ssl` e `ssl-fp=<impressão fixada>` (`:82-83`), sem `ssl-ca`; o teste prova a impressão no arquivo e a ausência de `skip-ssl` e de verificação desligada. Falha fechada se o cliente não aceitar a impressão SHA-256; o cabeçalho (`:12`) manda nunca tirar o `ssl-fp`.
- A4 (saída no repositório): corrigido. Chamado de dentro do repositório, inclusive por link simbólico (`pwd -P`, `:26-27`), o arquivo vai para `$HOME` (`:153`); o `.gitignore` cobre `consultas-098-099-*.txt`.

**Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; nenhum rodou. Sem dependência nova.

## Achados
- A2 (recomendado) scripts/consultas-leitura-098-099.sh:142 · dspd_coletor tem escrita; sessão e transação READ ONLY com um comando só bastam para os 31 .sql lidos; papel dspd_leitura só com SELECT se o comando virar rotina. Dono: software-architect.
- A5 (recomendado) scripts/consultas-leitura-098-099.sh:90 · U&"..." UESCAPE contorna a lista de palavras e pg_terminate_backend, pg_advisory_lock e lo_create não estão nela; impacto só de negação de serviço no READ ONLY; recusar U&, UESCAPE e os prefixos pg_ e lo_. Dono: devops-engineer.

### Detalhe das correções
- **A2:** nada a mudar no script agora. O papel `dspd_leitura` (só `SELECT`, `GRANT` por coluna sem `COLUNAS_PESSOA`, `USAGE` nos três schemas) entra em `PAPEIS` de `server/src/plataforma/db/grants.ts` e no `01-databases-papeis.sh` se o dono quiser o comando como rotina.
- **A5:** em `validar_sql`, recusar também quando o corpo (sem as linhas de comentário) casar, sem diferença de caixa, `U&`, a palavra `uescape`, ou um identificador começado por `pg_` ou `lo_` (`\b(pg|lo)_[a-z_]*`); um caso no teste para cada (S8 a S12). Os 31 `.sql` não usam nenhum deles, então o corpus de legítimos segue passando. Pode ir numa próxima volta; não segura o comando.

## Sondas
- S8 · `SELECT U&"s!0065t!005fconfig" UESCAPE '!'('transaction_read_only','off',false);` · espera: recusa · obtido: passa
- S9 · `SELECT U&"pg!005fsleep" UESCAPE '!'(100);` · espera: recusa · obtido: passa
- S10 · `SELECT pg_terminate_backend(pid) FROM pg_stat_activity;` · espera: recusa · obtido: passa
- S11 · `SELECT pg_advisory_lock(1);` · espera: recusa · obtido: passa
- S12 · `SELECT lo_create(0);` · espera: recusa · obtido: passa

## Plano em cartões
Nenhum bloqueante: o comando, neste head e com estes 31 `.sql`, pode ir ao dono. A5 ao devops-engineer, numa próxima volta desta branch ou em cartão próprio. A2 ao software-architect, só se o comando virar rotina.

## Riscos aceitos
Nenhum.

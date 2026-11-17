---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: 54a2c06eebe21fd7e1812f70d3c5e8154cf1796e
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: gerador do SQL do DBA e aviso de estatísticas (pedido 105, K-394, E7.388)

Revalidação por delta no head 54a2c06e (parecer anterior: reprovado em d1917f11, A1 bloqueante e A2 recomendado). `forge-check parecer delta` sobre d1917f11..54a2c06e: "nenhum arquivo do domínio mudou"; fora do domínio, `server/tests/gerador-sql-recusa.test.ts`. A correção dos dois achados está em `docs/devops/105-implantacao-vm.md:191` (documentação, fora do domínio da ferramenta, mas objeto dos achados), que reli inteira nessa linha. Sem PR: a suíte inteira fica para o CI do PR; este parecer cita a prova do autor (PG 17 descartável: 5 ocorrências da senha sem `PGOPTIONS`, 0 com) e o QA de d1917f11 (`docs/qa/105-gerador-sql-seguro.md`), e não afirma CI verde. Nenhum `.env` lido.

## Gatilhos
`R-SEGURANCA`: credenciais (as cinco senhas dos papéis de login criadas por `00_papeis_e_banco.sql`) e o texto ao DBA que deve impedir que elas fiquem legíveis no servidor da empresa.

## Achados
- A3 (recomendado) scripts/gerar-sql-migracoes.mjs:54 · O cabeçalho gerado (vai a deploy/sql/00_papeis_e_banco.sql:5) ainda mostra o psql -f sem PGOPTIONS; quem ler só o SQL não vê o aviso do roteiro. Alinhar com o comando do roteiro e regenerar por pnpm run db:sql.

## Sondas
- S1 · sessão 1: SET pg_stat_statements.track = 'none'; sessão 2: psql -c "CREATE ROLE r_outra_sessao LOGIN PASSWORD 'SegredoS1'" · espera: sem linha em pg_stat_statements · obtido: CREATE ROLE r_outra_sessao LOGIN PASSWORD 'SegredoS1' (PG 17 e PG 16)
- S2 · psql -c "SET pg_stat_statements.track = none" -f f.sql (f.sql com CREATE ROLE ... PASSWORD) · espera: sem linha em pg_stat_statements · obtido: sem linha (PG 17 e PG 16)
- S3 · PGOPTIONS='-c pg_stat_statements.track=none' psql -f g.sql (g.sql com CREATE ROLE ... PASSWORD) · espera: sem linha em pg_stat_statements · obtido: sem linha (PG 17 e PG 16)
- S4 · como papel LOGIN CREATEROLE sem superusuário: SET pg_stat_statements.track = 'none' e SET log_statement = 'none' · espera: recusa · obtido: permission denied to set parameter nos dois (PG 17 e PG 16)
- S5 · GRANT SET ON PARAMETER pg_stat_statements.track TO dba_cr; como dba_cr: SET ...='none'; SHOW · espera: none · obtido: none (PG 17 e PG 16)
- S6 · como dba_cr (CREATEROLE, sem GRANT): PGOPTIONS='-c pg_stat_statements.track=none' psql -v ON_ERROR_STOP=1 -c "CREATE ROLE r_s6 ..." · espera: conexão recusada, nada criado · obtido: FATAL permission denied to set parameter, rc=2 (PG 17)
- S7 · após GRANT SET ON PARAMETER pg_stat_statements.track TO dba_cr e reset: PGOPTIONS=... psql -c "CREATE ROLE r_s7 LOGIN PASSWORD 'SegredoS7'" · espera: papel criado, 0 linhas com a senha · obtido: CREATE ROLE, rc=0, 0 linhas (PG 17)
- S8 · papel CREATEROLE sem GRANT: psql -v ON_ERROR_STOP=1 -c "SET pg_stat_statements.track = 'none'" -f g.sql · espera: para antes do -f · obtido: permission denied, rc=1, r_s8 não existe (PG 17)

## Detalhe dos achados
Ambiente das sondas S6 a S8: imagem oficial do PostgreSQL 17 já presente localmente, contêiner descartável sem rede (`--network none`), `shared_preload_libraries=pg_stat_statements`, `CREATE EXTENSION`, apagado ao fim; senhas fictícias. S1 a S5 são da rodada anterior (d1917f11) e ficam como histórico do A1 e do A2.

**A1 (bloqueante na rodada anterior): resolvido.** `docs/devops/105-implantacao-vm.md:191` agora diz que o desligamento tem de valer na mesma conexão do `psql -f`, explica por que um `SET` em sessão à parte não protege e dá o comando com `PGOPTIONS='-c pg_stat_statements.track=none'` na própria linha do `psql -f`, com a alternativa `-c "SET ..." -f`. As duas formas já estavam provadas (S2, S3) e o autor reproduziu o efeito no PG 17 com o script real (5 ocorrências sem, 0 com). S7 confirma que, com o privilégio concedido, a forma `PGOPTIONS` cria o papel e não deixa a senha na view. O `pg_stat_statements_reset()` ficou como recurso para quem não puder usar o ajuste.

**A2 (recomendado na rodada anterior): resolvido.** O texto diz "superusuário ou `GRANT SET ON PARAMETER pg_stat_statements.track` (PostgreSQL 15 ou mais novo)", o mesmo privilégio dos três `SET` de log, o que confere com S4 e S5. A afirmação nova, "sem ele, com `PGOPTIONS` a conexão é recusada e nada é criado", foi sondada (S6): falha fechada, `FATAL` na partida da conexão. A alternativa `-c ... -f` sem o privilégio também falha fechada graças ao `ON_ERROR_STOP` (S8). O informativo sobre o `\password` gravar só o verificador SCRAM não entrou; não bloqueia.

**A3 (recomendado, novo).** Evidência: `scripts/gerar-sql-migracoes.mjs:54`, que vai ao cabeçalho de `deploy/sql/00_papeis_e_banco.sql:5`, ainda mostra `psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f 00_papeis_e_banco.sql`, sem `PGOPTIONS`. Caminho: DBA que recebe só o pacote `deploy/sql` e segue o cabeçalho, num banco com a extensão carregada, deixa as senhas na view (mesmo caminho do A1, agora só para quem não lê o roteiro). Severidade: baixa (o roteiro, que é o documento de implantação, está certo). Correção mínima (P): pôr no cabeçalho o mesmo comando do roteiro (`PGOPTIONS='-c pg_stat_statements.track=none' psql ... -f 00_papeis_e_banco.sql`) com uma linha remetendo ao aviso, e regenerar pelo wrapper. Dono: `devops-engineer`. Era "desejável" no parecer anterior; segue recomendado.

**Teste novo (fora do domínio, lido por ser da trava).** `server/tests/gerador-sql-recusa.test.ts` copia o `.mjs` para um diretório temporário, de modo que o `deploy/sql` afetado seria o do temporário, nunca o do repositório; cobre as três fases sem a variável e os valores `0`, `true` e vazio, conferindo saída 3 e a pasta intacta. Rodei o arquivo: 6 de 6 passaram. Sem novo caminho de ataque.

**Trava do gerador e roteiro dos `SET` de log:** sem mudança desde d1917f11 (delta vazio no domínio); valem as conclusões da rodada anterior, sem achado.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: `forge-check parecer delta`, leitura do diff d1917f11..54a2c06e, contêiner descartável local (imagem já presente, sem rede) para S6 a S8 e execução do teste novo. Sem varredura de segredos nem SAST locais nesta passada (delta sem código de produção nem segredo, conferido na leitura); as varreduras ficam no CI do projeto.

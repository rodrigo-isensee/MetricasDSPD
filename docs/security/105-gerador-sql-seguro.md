---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-gerador-sql-seguro
commit: d1917f11fae09baefe4e83297d390e46e4ce5d70
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-16
---
# Review de segurança: gerador do SQL do DBA e aviso de estatísticas (pedido 105, K-394, E7.380)

Branch `fix/105-gerador-sql-seguro`, head revisado d1917f11, base ab12a37f. Diff de 3 arquivos: `scripts/gerar-sql-migracoes.mjs` (trava), `scripts/gerar-sql-migracoes.sh` (define a variável) e `docs/devops/105-implantacao-vm.md` (roteiro da VM: `ON_ERROR_STOP`, os três `SET` de log e o aviso A6 do parecer `105-vm-recomendados`). Sem PR: a suíte inteira fica para o CI do PR; este parecer cita o QA do autor (`docs/qa/105-gerador-sql-seguro.md`, commit 06015043, provas de execução da trava e da regeneração idêntica) e não afirma CI verde. Nenhum `.env` lido.

## Gatilhos
`R-SEGURANCA`: credenciais (as cinco senhas dos papéis de login criadas pelo roteiro `00_papeis_e_banco.sql`) e o texto ao DBA que deve impedir que elas fiquem legíveis no servidor da empresa.

## Achados
- A1 (bloqueante) docs/devops/105-implantacao-vm.md:191 · O aviso manda desligar o pg_stat_statements "na sessão" antes de rodar, mas o psql -f abre outra sessão: o SET não vale e as cinco senhas ficam em texto puro na view (S1, PG 16 e 17). Pôr o SET na mesma conexão (PGOPTIONS ou -c antes do -f).
- A2 (recomendado) docs/devops/105-implantacao-vm.md:191 · "exige superusuário" está certo, mas incompleto: GRANT SET ON PARAMETER (PG 15+) também libera, e é o mesmo privilégio que os três SET de log já exigem. Dizer isso e que o \password grava só o hash SCRAM.

## Sondas
- S1 · sessão 1: SET pg_stat_statements.track = 'none'; sessão 2: psql -c "CREATE ROLE r_outra_sessao LOGIN PASSWORD 'SegredoS1'" · espera: sem linha em pg_stat_statements · obtido: CREATE ROLE r_outra_sessao LOGIN PASSWORD 'SegredoS1' (PG 17 e PG 16)
- S2 · psql -c "SET pg_stat_statements.track = none" -f f.sql (f.sql com CREATE ROLE ... PASSWORD) · espera: sem linha em pg_stat_statements · obtido: sem linha (PG 17 e PG 16)
- S3 · PGOPTIONS='-c pg_stat_statements.track=none' psql -f g.sql (g.sql com CREATE ROLE ... PASSWORD) · espera: sem linha em pg_stat_statements · obtido: sem linha (PG 17 e PG 16)
- S4 · como papel LOGIN CREATEROLE sem superusuário: SET pg_stat_statements.track = 'none' e SET log_statement = 'none' · espera: recusa · obtido: permission denied to set parameter nos dois (PG 17 e PG 16)
- S5 · GRANT SET ON PARAMETER pg_stat_statements.track TO dba_cr; como dba_cr: SET ...='none'; SHOW · espera: none · obtido: none (PG 17 e PG 16)

## Detalhe dos achados
Ambiente das sondas: imagens oficiais já presentes localmente (17 e 16), contêiner descartável sem rede (`--network none`), `shared_preload_libraries=pg_stat_statements`, `CREATE EXTENSION`, apagado ao fim. As senhas das sondas são fictícias.

**A1 (bloqueante).** Evidência: `docs/devops/105-implantacao-vm.md:191`, trecho "Antes de rodar, desligue o registro na sessão (`SET pg_stat_statements.track = 'none';`, exige superusuário)", e, no mesmo passo, o comando `psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql`. Um `SET` de sessão vale só para a conexão em que foi dado; o `psql -f` abre uma conexão nova, onde `pg_stat_statements.track` volta ao valor do servidor (`top`). A sonda S1 mostra que, seguindo o texto ao pé da letra, o `CREATE ROLE ... PASSWORD '<senha>'` entra na view com a senha literal (no PG 16 e 17 o texto desse comando utilitário não é normalizado). O aviso existe para fechar o A6 do parecer `105-vm-recomendados`; do jeito que está, dá ao DBA a segurança de ter desligado o registro sem desligar. Por isso é defeito provado (critério de bloqueio de `R-REVIEW`), não recomendação.
Caminho de ataque: banco da empresa com a extensão carregada (comum em monitoramento) → DBA segue o roteiro → as cinco senhas (`dspd_migrador`, `dspd_coletor`, `dspd_api`, `dspd_ref`, `dspd_api_apontamento`) ficam em `pg_stat_statements` até o próximo reset → quem tem `pg_read_all_stats` (equipe ou ferramenta de monitoramento) lê as senhas e entra com o papel do migrador (DDL no esquema) ou do coletor (escrita na base analítica).
Severidade: baixa a média (exige a extensão e um leitor privilegiado de estatísticas; o ganho é o papel dono do esquema).
Correção mínima (esforço P): no passo 1 do roteiro, trocar o comando por um que leve o `SET` à mesma conexão, por exemplo `PGOPTIONS='-c pg_stat_statements.track=none' psql "host=<servidor> dbname=postgres sslmode=verify-full" -v ON_ERROR_STOP=1 -f deploy/sql/00_papeis_e_banco.sql` (S3) ou `psql ... -v ON_ERROR_STOP=1 -c "SET pg_stat_statements.track = none" -f deploy/sql/00_papeis_e_banco.sql` (S2), e reescrever a frase "desligue o registro na sessão" para dizer que o desligamento vai na própria linha do `psql -f`, não numa sessão à parte. Manter o `pg_stat_statements_reset()` como opção para quem já rodou sem isso. O mesmo comando de exemplo está no cabeçalho gerado (`scripts/gerar-sql-migracoes.mjs:54`, que vai para `deploy/sql/00_papeis_e_banco.sql:5`); alinhar lá e regenerar com `pnpm run db:sql` é desejável, não obrigatório, desde que o roteiro esteja certo. Alternativa equivalente, a critério do autor: incluir `SET pg_stat_statements.track = 'none';` no próprio `00_papeis_e_banco.sql`, logo depois dos três `SET` de log (mesma conexão e mesmo privilégio); não a sondei com a extensão ausente, então, se escolhida, o QA confere esse caso. Dono: `devops-engineer`.

**A2 (recomendado).** O privilégio: `pg_stat_statements.track` tem contexto `superuser` (pg_settings, PG 16 e 17), igual a `log_statement`, `log_min_duration_statement` e `log_min_error_statement`. Um papel só com `CREATEROLE` é recusado nos dois (S4); `GRANT SET ON PARAMETER` (PG 15+) libera (S5). Logo, o DBA que consegue rodar o `00` como está (os três `SET` de log no topo, com `ON_ERROR_STOP`) também consegue esse `SET`; e o DBA sem o privilégio cai na recusa do primeiro `SET` de log antes de qualquer `CREATE` (falha fechada) e vai para o caminho `\password`. "Exige superusuário" não está errado, mas pode levar um DBA de serviço gerenciado (sem superusuário de fato, com `GRANT SET ON PARAMETER` concedível) a desistir sem necessidade. Correção: "exige superusuário ou `GRANT SET ON PARAMETER` (PG 15 ou mais novo), o mesmo dos três `SET` de log". Informativo no mesmo texto: no caminho `\password` o psql envia só o verificador SCRAM, que pode ir às estatísticas e ao log como hash, não como senha. Esforço P. Dono: `devops-engineer`.

**Trava do gerador (sem achado).** `scripts/gerar-sql-migracoes.mjs:32-35` recusa com código 3 antes do primeiro `import` dinâmico (linha 36) e de qualquer `rmSync`/`writeFileSync`; acima dela só há constantes e imports estáticos de módulos do runtime, sem efeito em disco. A variável `DSPD_GERADOR_VIA_WRAPPER` protege contra execução acidental, não contra um adversário (quem roda o script na própria máquina define a variável), e é proporcional a esse fim. `scripts/gerar-sql-migracoes.sh:12` define a variável só no ambiente de `gerar()`, sem exportar ao resto do shell. O QA provou a recusa nas três formas de chamada, os valores quase certos (`0`, `true`, vazio) e a regeneração byte a byte pelo wrapper. Sem novo caminho de ataque.

**Roteiro dos `SET` de log (sem achado).** O texto bate com `deploy/sql/00_papeis_e_banco.sql:10-13` (`\set ON_ERROR_STOP on` e os três `SET`), na ordem certa, antes do primeiro `\getenv`.

## Riscos aceitos e ferramentas
Nenhum risco aceito. Ferramentas: leitura do diff e contêiner descartável local (imagens já presentes, sem rede) para as sondas S1 a S5. Sem varredura de segredos nem SAST locais nesta passada (diff de 3 arquivos sem segredo, conferido na leitura); as varreduras ficam no CI do projeto.

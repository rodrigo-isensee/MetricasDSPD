---
tipo: revisao-devops
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-s1-escala-p1-p5
commit: fb20f3fb51388ddcffe8d745920481836c563fb6
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-16
---
# Review de devops: S1 só com a escala P1 a P5 (E7.396)

## Achados
- A1 (recomendado) docs/devops/105-roteiro-dono.md:64 · o roteiro não cita o `ac:reprojetar-escala` (nem a 0039 e a 0040: linha 31 diz que a última migração é a 0037); acrescentar passo 0.4 depois do 0.3, com a ordem e as contagens do Detalhes.
- A2 (recomendado) server/package.json:36 · a marca `105:S1-escala-p` só é gravada pelo `criterios-ac.ts`, que não tem script `pnpm` nem passo em roteiro; o roteiro deve trazer `pnpm --filter @metricas-dspd/server exec tsx src/entradas/criterios-ac.ts AAAA-MM-DD` ou o dev dar um script.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:94 · a seção 2.1 não lista `ac:reprojetar-fluxo` nem `ac:reprojetar-escala` (migrador, uma vez, coleta parada); incluí-los após a migração do item 3.

## Revalidação da junção com o #517 (head fb20f3fb)
Revalidado: o head fb20f3fb integra a `origin/develop` (018d9817, o #517 `vm:preparar`) à branch. O único conflito foi `server/package.json`; `git diff origin/develop -- server/package.json` mostra só a linha `ac:reprojetar-escala` (o `ac:criterios` e o `vm:preparar` do #517 estão intactos: os três scripts presentes). Nada em `.github/`, `Dockerfile*` nem IaC mudou; o `docker-compose.prod.yml`, o `package.json` da raiz e o `vm-preparar` vieram da develop, não são do S1.

Efeito na subida da VM, conferido no código: `PASSOS` em `server/src/plataforma/db/vm-preparar.ts` tem `ac:reprojetar-escala` com `opcional: true`, entre `ac:reprojetar-fluxo` e `ac:criterios`, e `server/src/entradas/vm-preparar.ts` só o roda se `src/entradas/reprojetar-escala-ac.ts` existir (agora existe). A ordem está certa: `migrar` (aplica a 0040 e exige o backup de hoje sobre base com dados) vem primeiro; a reprojeção usa o migrador (`PG_MIGRADOR_URL`, já no serviço `migrate`), é idempotente (`WHERE escala_p IS NULL`), só lê o staging e não chama o Acelerato; o `ac:criterios` vem depois, no mesmo dia, e grava `105:S1-escala-p` (`criterios-acelerato.ts:67`), o que resolve o A2 na subida. O teste `server/tests/vm-preparar.test.ts:17` trava que o único passo opcional é o `ac:reprojetar-escala`. Falha de passo interrompe a subida nomeando o passo, e API e worker só sobem com o `migrate` concluído com sucesso.

Atenção operacional, já escrita em `docs/devops/105-implantacao-vm.md:110`: a coleta do Acelerato deve estar parada antes do `up`, porque a reprojeção não pode correr junto de uma coleta. É risco de execução coberto pela ordem do roteiro, não defeito. O A3 está atendido pela seção 2.1 (itens 7 e 8); o item 7 ainda diz que o comando "não está na develop", texto a acertar na release (recomendado, não bloqueia). O A1 segue recomendado: a seção 5 do roteiro do dono já cobre `ac:reprojetar-escala` e `ac:criterios`; falta só a receita de rollback da 0040 com `down 1`, que remete à seção 4.

Não rodei a suíte nem o `db:sql` (ficam para o CI do PR). `forge-check` e `shellcheck` no PATH; `actionlint` ausente, desnecessário (sem workflow alterado). Parecer segue aprovado.

## Revalidação anterior da junção (head 549dfd8b)
Revalidado: o tech-lead integrou a `origin/develop` (edfff4d8, com #505 e #515) em 549dfd8b. `forge-check parecer delta docs/devops/105-s1-escala-p.md` (intervalo 07cfc675..549dfd8b, escopo sem o que veio da base) responde "delta: nenhum arquivo do domínio mudou"; os arquivos listados fora do domínio são código de produto e `CHANGELOG`. O `package.json` e o `.env.example` que o `forge-check pr` aponta vieram da develop (não são do S1): `git diff origin/develop 549dfd8b -- package.json` sai vazio. O S1 não mudou do ponto de vista de devops: sem alteração em `.github/`, `Dockerfile*`, `compose*`, IaC, `deploy/sql/` nem `scripts/`. Os achados A1 a A3 continuam valendo como recomendados; nada novo bloqueia.

## Detalhes
Aprovado: sem defeito provado. O diff de `07cfc675` não toca `.github/`, `Dockerfile*`, `compose*` nem IaC; a mudança de devops é só o SQL do DBA em `deploy/sql/`, o comando novo e a ordem na VM. A branch andou depois de `07cfc675` só com commits de parecer em `docs/` (`git diff 07cfc675 HEAD --stat`: três arquivos em `docs/`); o código é o mesmo.

**SQL do DBA (coerente com as 40 migrações).** `deploy/sql/` tem 0000 a 0040 mais `00_papeis_e_banco.sql`, `9000_grants.sql` e `consolidado.sql` (44 arquivos). `server/migrations` tem 40 migrações e `consolidado.sql` tem 40 `INSERT INTO dspd_core.pgmigrations` (última, linha 1571, a 0040). A 0040 do DBA é a tradução fiel do `up` da migração (`ALTER TABLE dspd_ac.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL`, na mesma transação do registro em `pgmigrations`), igual no consolidado (linhas 1569 a 1571), antes dos GRANTs finais (linhas 1807 e 1831: `dim_chamado` ao `dspd_coletor` e `SELECT` ao `dspd_api`; tabela inteira, sem GRANT por coluna novo, e `escala_p` é booleano derivado, não dado de pessoa). `ADD COLUMN IF NOT EXISTS` nulo é metadado em Postgres 11 ou mais novo: sem reescrita da tabela, bloqueio curto; repetir é seguro. O nome e o checksum em `server/migrations/checksums.json` estão presentes (`ec2572f4`). O DBA que aplica o consolidado em banco novo ou a 0040 avulsa em banco na 0039 chega ao mesmo esquema. Não rodei `pnpm run db:sql` (sobe um Postgres descartável em Docker, tarefa do CI/autor); a prova é a leitura do diff do consolidado contra a migração.

**Comando `ac:reprojetar-escala`.** Entrada `server/src/entradas/reprojetar-escala-ac.ts` com `carregarConfigMigrar` (`PG_MIGRADOR_URL`), `max: 1`, uma transação só (tudo ou nada), lotes de `TAMANHO_LOTE`, `UPDATE ... WHERE escala_p IS NULL` e só grava resultado não nulo: nunca troca valor, repetir não muda dado (só soma uma linha `projecao` em `ctl_coleta`). Lê só o staging, não chama o Acelerato, imprime contagens (`coletaId`, `lidos`, `escalaP`, `outrasEscalas`, `semEscala`) e só a categoria do erro. Script registrado em `server/package.json:25`. Mesma família e mesmos efeitos do `ac:reprojetar-fluxo` (a tela "última carga" mostra a hora da reprojeção).

**Ordem na VM (a que o roteiro deve trazer).**
1. Backup do dia, depois migrar: `docker compose -f docker-compose.prod.yml up -d` (o serviço `migrate` roda a 0040 antes da API) ou `pnpm run db:migrate` à mão. O DBA que aplica o SQL faz o equivalente. Coluna nasce nula.
2. Reprojetar com a coleta parada (timers do Acelerato desligados ou fora da janela das 06:30 e 07:30 de domingo): `ac:reprojetar-escala`, uma vez, com o migrador. Rc=0 e `lidos` batendo com os chamados com prioridade; o `ac:reprojetar-fluxo` do passo 0.3 não conflita (colunas diferentes), mas rode um de cada vez.
3. Registrar o critério `105:S1-escala-p` com a data civil da reprojeção (`criterios-ac.ts AAAA-MM-DD`; idempotente, grava também as demais marcas de `CRITERIOS_ACELERATO` que faltarem). A marca depois da reprojeção, no mesmo dia, para a data nos gráficos coincidir com a primeira medição pela escala nova.
4. Religar os timers e conferir a tela S1.
Atenção: com o código novo no ar e a reprojeção ainda por fazer, `escala_p` é nulo e o S1 mostra os chamados como sem escala; por isso 1 e 2 devem ser seguidos, sem abrir o painel entre eles.

**Rollback.** O `down` da 0040 tira a coluna (derivada, refeita pelo projetor); o sistema recusa o `down` sem `DSPD_PERMITIR_DOWN=1` e o backup do dia. Com a coluna fora, o código da release usa `escala_p`: reverter o merge da release junto (`git revert`, pelo `tech-lead`). O roteiro traz hoje a volta só da 0038 (seção 4 do roteiro); a da 0040 é a mesma receita com `down 1` e deve entrar junto com o A1.

**CI e custo.** Nada novo em workflow: sem minutos de CI a mais, sem serviço pago (`R-CUSTO`), sem `continue-on-error`, `[skip ci]` ou teste pulado (`R-VERIFY`), nada escreve na `main` (`R-MAIN`). O parecer cita o PQ do autor e os pareceres de review, QA e segurança do mesmo head; não afirmo CI verde (sem PR para a branch, a suíte inteira fica para o CI do PR).

Ferramentas: `forge-check`, `shellcheck` no PATH; `actionlint` não está e não era necessário (nenhum workflow mudou); o gerador de SQL (`db:sql`, que usa Docker) não foi rodado aqui (lacuna registrada acima).

## Custo e rollback
Sem custo novo. Volta: `down 1` da 0040 com `DSPD_PERMITIR_DOWN=1` e backup do dia, mais o revert do merge da release; sem o revert, o painel S1 quebra.

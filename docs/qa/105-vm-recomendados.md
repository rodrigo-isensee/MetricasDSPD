---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 0fb2e35aaefb3eada16ab83a96768b74376f70b6
parecer: aprovado
resultado: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: recomendados da implantação na VM (pedido 105, K-388, E7.345)

Branch `fix/105-vm-recomendados`, head 0fb2e35a, base d999ee29. Revalidação pelo delta 3c8267ae..0fb2e35a (`forge-check parecer delta`); a rodada anterior (head 3c8267ae, E7.339) está no fim deste arquivo. Sem PR ainda: a suíte inteira fica para o CI e este parecer não afirma CI verde. Senhas fictícias `SEGREDO_*`; nenhum `.env` lido.

## Achados
- A1 (recomendado) scripts/gerar-sql-migracoes.mjs:40 · fechado: o teste novo `server/tests/papeis-sql-senhas-log.test.ts` cobre a ordem dos SET e a recusa de espaços; ausente e vazia seguem provadas só por execução (abaixo), sem bloquear.
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:40 · fechado: `btrim(:'pwd_x') = ''` recusa senha só de espaços; provado no Postgres (PWD_REF com três espaços: rc=3, "PWD_REF está vazia ou só de espaços", nada criado).

## Revalidação no head 0fb2e35a
No domínio do QA, o delta tem `deploy/sql/00_papeis_e_banco.sql`, `scripts/gerar-sql-migracoes.mjs` e `server/tests/papeis-sql-senhas-log.test.ts`.

| Obrigação | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Senha nunca chega ao log do servidor (K-388, segurança) | contêiner `postgres:17` descartável com `-c log_statement=all -c log_min_duration_statement=0 -c log_min_error_statement=debug1`; 5 execuções do roteiro (sem PWD_REF, PWD_API vazia, PWD_REF só de espaços, todas, repetição com erro no CREATE ROLE); `docker logs` com 102 linhas: 0 ocorrências de `SEGREDO`; só aparecem 5 `SET log_statement = 'none'` | log_statement=all, erro no CREATE ROLE | passou |
| Controle negativo | `CREATE ROLE ... PASSWORD 'SEGREDO_CONTROLE_zz'` direto, sem os SET, no mesmo servidor: 1 ocorrência no log (o log não estava cego) | log cego | passou |
| Senha só de espaços recusada (A2) | PWD_REF com três espaços: rc=3, `PWD_REF está vazia ou só de espaços; nada foi criado`; 0 papéis `dspd_*`, 0 banco `metricas` | espaços | passou |
| Ausente e vazia seguem barradas | sem PWD_REF: rc=3, `falta a variável de ambiente PWD_REF`; PWD_API vazia: rc=3, `PWD_API está vazia ou só de espaços`; nada criado | ausente, vazia | passou |
| Todas as senhas | rc=0; 8 papéis `dspd_*` e o banco `metricas` | caminho feliz | passou |
| Repetição | rc=3, `role "dspd_migrador" already exists`, sem senha no log (ON_ERROR_STOP) | erro no CREATE ROLE | passou |
| SQL regenerado pelo gerador | `pnpm run db:sql`: "OK: runner e SQL gerado produzem o mesmo esquema", "39 migracoes registradas"; `git status` limpo, então `deploy/sql` é idêntico ao commit | arquivo gerado à mão | passou |
| Teste novo `papeis-sql-senhas-log.test.ts` | verde no head: 7 de 7. Vermelho: com o `00_papeis_e_banco.sql` de 3c8267ae no lugar, 6 testes caem (4 de ordem, o de nenhum SELECT/DO/CREATE antes dos SET e o do btrim); arquivo restaurado em seguida | ordem dos SET, espaços | passou |
| Rollback com `-f docker-compose.prod.yml` e timers | muda `docs/devops/105-implantacao-vm.md`, fora do domínio de código; não reexecutado | n/a | não reexecutado |

Limite: o log observado é o `docker logs` (stderr) do servidor; não há `log_destination` em arquivo. Contêiner removido ao fim.

## Rodada anterior, head 3c8267ae (E7.339, histórico)
Diff de `deploy/sql/00_papeis_e_banco.sql`, `scripts/gerar-sql-migracoes.mjs`, `docker-compose.prod.yml` e `docs/devops/105-implantacao-vm.md`; contêiner `postgres:17` descartável, três cenários mais borda. Resultados mantidos no head atual (o `docker-compose.prod.yml` não está no delta):

| Obrigação (brief K-388) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem uma senha, vazia, nenhuma, todas, repetição | rc=3 nomeando a variável nos três primeiros, rc=0 com 8 papéis e o banco, rc=3 na repetição | ausente, vazio, reexecução | passou |
| Compose de produção: restart unless-stopped em api, worker, web | `docker compose -f docker-compose.prod.yml config`: api, web e worker `unless-stopped`; migrate `"no"` | serviços pontuais fora | passou |
| Teto de log json-file 5 x 10 MB | mesmo `config`: `max-file: "5"`, `max-size: 10m` nos quatro serviços | todos os serviços | passou |
| Compose falha fechado sem segredo | `config -q` sem variáveis: `required variable DSPD_PWD_COLETOR is missing a value` | variável obrigatória | passou |
| Rollback em ordem, pós-deploy com painel, verify-full e CA | conferido por leitura em `docs/devops/105-implantacao-vm.md` | n/a | conferido por leitura |

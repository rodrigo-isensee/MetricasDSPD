---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-recomendados
commit: 3c8267ae348c82a635614f601527f25d36b4daee
parecer: aprovado
resultado: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: recomendados da implantação na VM (pedido 105, K-388, E7.339)

Branch `fix/105-vm-recomendados`, head 3c8267ae, base d999ee29. Diff de 4 arquivos: `deploy/sql/00_papeis_e_banco.sql`, `scripts/gerar-sql-migracoes.mjs`, `docker-compose.prod.yml` e `docs/devops/105-implantacao-vm.md`. Sem teste novo e sem código de produção da aplicação, então não há vermelho nem mutante; a prova é de execução. A suíte inteira fica para o CI do PR (sem PR ainda): não afirmo CI verde. Senhas fictícias (`a1`..`a5`); nenhum `.env` lido. O Postgres foi um contêiner novo `postgres:17`, removido ao fim (o contêiner de desenvolvimento em execução não foi tocado).

## Achados
- A1 (recomendado) scripts/gerar-sql-migracoes.mjs:40 · nenhum teste automatizado cobre a conferência das cinco senhas; o roteiro só se prova rodando num Postgres descartável, como aqui. Cartão, não bloqueia.
- A2 (recomendado) scripts/gerar-sql-migracoes.mjs:40 · senha só de espaços passa na conferência (só ausente e vazia são barradas). Decisão do dono se vale barrar; não bloqueia.

## Critério → teste → resultado
| Obrigação (brief K-388) | Prova | Fronteira protegida | Resultado |
|---|---|---|---|
| Sem uma senha: para antes do primeiro CREATE e nomeia a que falta | psql 17, `-v ON_ERROR_STOP=1`, PWD_REF ausente: `ERROR: falta a variável de ambiente PWD_REF; nada foi criado`, rc=3; zero papéis `dspd_*`, zero banco `metricas` | variável ausente | passou |
| Senha vazia: idem, nomeando | PWD_API vazia: `ERROR: PWD_API está vazia; nada foi criado`, rc=3; zero papéis, zero banco | vazio | passou |
| Nenhuma senha | `falta a variável de ambiente PWD_MIGRADOR`, rc=3; nada criado | ausência total | passou |
| Todas as senhas | rc=0; 8 papéis (5 login e 3 NOLOGIN), banco `metricas` criado | caminho feliz | passou |
| Repetir o roteiro (borda) | rc=3, `role "dspd_migrador" already exists`; é o caso do texto "Se o roteiro de papéis falhar" do doc | reexecução | observado, coerente com o doc |
| 00_papeis_e_banco.sql regenerado do gerador | `tsx scripts/gerar-sql-migracoes.mjs arquivos` numa cópia do HEAD: o `00_papeis_e_banco.sql` gerado é idêntico ao do commit (`IGUAL`); 39 migrações geradas | arquivo gerado à mão | passou |
| Compose de produção: restart unless-stopped em api, worker, web | `docker compose -f docker-compose.prod.yml config` (variáveis fictícias): api, web e worker `restart: unless-stopped`; migrate `"no"` | serviços pontuais fora | passou |
| Teto de log json-file 5 x 10 MB | mesmo `config`: api, migrate, web e worker com `driver: json-file`, `max-file: "5"`, `max-size: 10m` (coleta, de perfil, usa o mesmo `*log` no diff) | todos os serviços | passou |
| Compose falha fechado sem segredo | `config -q` sem variáveis: `required variable DSPD_PWD_COLETOR is missing a value`, rc != 0 | variável obrigatória | passou |
| Rollback em ordem, pós-deploy com painel, verify-full e CA | lido no `docs/devops/105-implantacao-vm.md` (rollback 1 a 4 com o banco antes do código; pós-deploy confere `/health/ready` e `127.0.0.1:8080`; itens 3 e 8 com `verify-full` e CA). Texto, sem execução | n/a | conferido por leitura |

## Provas
- Execução do roteiro (cópia do contêiner `postgres:17`, 3 cenários mais borda): saídas na tabela acima.
- `forge-check docs` rodado antes do push (ver relatório).

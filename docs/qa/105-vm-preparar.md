---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-vm-criterios-ac
commit: e0b84358cc250856eec48476842b47bb375a2d30
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 2
data: 2026-11-16
---
# QA: vm:preparar (pedido 105, K-396, E7.406)

Branch `fix/105-vm-criterios-ac`, head e0b84358, base 8a40f662. Cobre o `vm:preparar` (`server/src/entradas/vm-preparar.ts`, `server/src/plataforma/db/vm-preparar.ts`), o serviço `migrate` do `docker-compose.prod.yml` e os roteiros `docs/devops/105-implantacao-vm.md` e `105-roteiro-dono.md`. Sem especificação de UX: as obrigações vêm do brief (decisões A e 2 do dono). Ambiente: Postgres 17 descartável (container `qa-vmprep-pg`, porta 55432, senhas de teste), com `deploy/sql/00_papeis_e_banco.sql` aplicado, e a imagem `server/Dockerfile` construída do head. Nenhuma credencial real; sem `.env`; nenhuma chamada ao BusinessMap nem ao Acelerato (nenhum passo as faz).

Nenhum bloqueante: nenhum defeito provado nos quatro cenários pedidos; os achados A1 e A2 (recomendados) viram cartão (R-QA).

Fora do escopo: suíte inteira (fica para o CI do PR, sem PR ainda; não afirmo CI verde), mutação (sem ferramenta declarada para este diff; o teste do autor `server/tests/vm-preparar.test.ts` passou local neste head, 11 testes), `ac:ref-sync` com arquivo de alvos mudado no mesmo dia (descrito no roteiro; não reproduzido, exigiria editar a árvore da branch), a tela "última carga" do Acelerato, e o `up` real do Compose com TLS `verify-full` (a imagem rodou com o mesmo comando e as mesmas variáveis, sem TLS).

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:174 · toda subida imprime "Aviso: sem CONNECT ... Rode docker/postgres/reparar-papeis.sh" (script de desenvolvimento); o roteiro não diz que é esperado com webhook, automação e pesquisa NOLOGIN. Bug docs/qa/bugs/105-vm-preparar-aviso-reparar-papeis.md
- A2 (recomendado) server/src/plataforma/db/vm-preparar.ts:50 · a recusa sugere DSPD_BACKUP_DIR, que no Compose não chega ao serviço migrate; na CLI a DSPD_BACKUP_CONFIRMADO vazia mascara o DSPD_BACKUP_DIR. Falha fechada. Bug docs/qa/bugs/105-vm-preparar-mensagem-backup-dir.md

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Subida do zero: 7 passos em ordem, base preparada | CT-01 `pnpm run vm:preparar` em base só com papéis | base virgem (nada aplicado, sem recusa de backup) | passou: 39 migrações, 218 GRANTs, `ok, 7 passo(s)`, rc 0; `ac:criterios` gravou 8 marcas |
| Segunda subida idempotente | CT-02 repetir o comando | repetição no mesmo dia | passou: 0 inseridas, 0 fechadas, `versaoRegistrada:false`, `gravadas:[]`, rc 0 |
| Efeito em `ctl_coleta` descrito no roteiro | CT-03 coletaId das duas subidas | n/a | passou: 1 e 2 na subida 1, 3 e 4 na subida 2 (cada subida soma 2 linhas) |
| Para no primeiro erro e nomeia o passo | CT-04 senha errada do `dspd_ref` | passo 2 de 7 | passou: `FALHOU no passo "ref:sync-calendario" (código 1); passos feitos: migrar`, nada depois rodou, rc 1 |
| Erro sem vazar segredo | CT-05 senha errada e variável ausente | URL, senha e texto do banco | passou: saída só `autenticação` e `configuração: PG_REF_URL`; a senha errada não aparece |
| Falha no passo 1 (migrador) | CT-06 senha errada do migrador | passo 1 | passou: `migrar recusado: autenticação`, `passos feitos: nenhum`, rc 1 |
| Recusa sem backup confirmado | CT-07 `db:migrate down 1` (travas do roteiro), depois `vm:preparar` sem variável | migração pendente sobre base com dados | passou: recusa nomeando a 0039 e a data de hoje, nada migrou (38) |
| Recusa com data errada, valor lixo, variável vazia | CT-08 ontem, `sim`, vazia | data de hoje em Brasília | passou: as três recusam, rc 1, base inalterada |
| Aceita com a data de hoje | CT-09 `DSPD_BACKUP_CONFIRMADO=<hoje>`; e só `DSPD_BACKUP_DIR` com `ultimo-backup-ok` de hoje | confirmação válida | passou: migra a 0039 (39) e roda os 7 passos |
| Sem pendência não pede backup | CT-10 base em dia, confirmação vazia (como o Compose) | sem migração pendente | passou |
| Serviço `migrate` na imagem do Compose | CT-11 `docker run` da imagem do head com `node --import tsx src/entradas/vm-preparar.ts` e as variáveis do serviço | caminhos dentro do container (migrações, fontes, `.env` ausente) | passou: base em dia ok, recusa com 1 pendente sem data, ok com a data de hoje |
| Compose valida | CT-12 `docker compose -f docker-compose.prod.yml config` | `DSPD_PWD_REF` obrigatória | passou: command é o `vm-preparar.ts`, PG_REF_URL e DSPD_BACKUP_CONFIRMADO presentes; sem `DSPD_PWD_REF` o config falha com "defina DSPD_PWD_REF" |
| Teste do autor | `vitest run tests/vm-preparar.test.ts` | n/a | passou, 11 testes |

## Roteiro seguido como quem implanta (`docs/devops/105-implantacao-vm.md`, seção 2.1)
- Item 1 (comparar `server/migrations` com `SELECT count(*) FROM dspd_core.pgmigrations`): a consulta responde (39). OK.
- Itens 2 e 3 (config, build, `up` com `DSPD_BACKUP_CONFIRMADO`): config e build OK; o serviço `migrate` rodou como o Compose o define. O `up` completo com TLS e a API ficou fora.
- Item 4 (conferir o resumo): `vm:preparar: ok, 7 passo(s): ...` e `FALHOU no passo "<nome>" (código N)` existem como o roteiro descreve; a mensagem do passo traz só a categoria.
- Lista dos passos e efeitos: a ordem, o `ac:ref-sync` repetido sem gravar (`inseridos: 0, fechados: 0`) e o efeito em `ctl_coleta` conferem. O `ac:reprojetar-escala` é opcional e o arquivo não existe na versão: rodam 7 passos, como o roteiro diz.
- Ponto que travaria o dono: o aviso do `reparar-papeis.sh` (A1) aparece sem explicação.
- O rollback usado para criar a pendência (`DSPD_PERMITIR_DOWN=1 DSPD_BACKUP_DIR=... db:migrate down 1`) funcionou como o roteiro descreve.

## Provas
- Subida do zero: rc 0, "vm:preparar: ok, 7 passo(s): migrar, ref:sync-calendario, bm:ref-sync, ac:ref-sync, ac:reprojetar-etapas, ac:reprojetar-fluxo, ac:criterios".
- Passo com erro: "vm:preparar: FALHOU no passo "ref:sync-calendario" (código 1); passos feitos: migrar. Nada depois dele rodou".
- Recusa: "vm:preparar: migrar recusado: há 1 migração(ões) pendente(s) (0039_bm_toque_primeiro) e o backup de hoje (2026-11-16) não foi confirmado."
- Vermelho antes do verde: o brief não pede `forge-testes --vermelho` (os testes são do autor; o QA não escreveu teste novo); não executado.

---
tipo: qa
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/grants-por-coluna
commit: c626cd0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-15
---

# QA: K-085, GRANT por coluna do dspd_api e guarda de classificação

Links: ADR 0020 (M-4 e B-3), review `docs/reviews/k085-grants-por-coluna.md` (aprovado), segurança `docs/security/k085-grants-por-coluna.md` (aprovado, 21dabc0), `docs/architecture/data-model.md` §8.

## Veredito
**Aprovado.** Nenhum bug aberto. Nenhum teste novo foi acrescentado: os do autor já cobrem as obrigações e os casos de abuso extras foram exercidos em arquivo temporário descartado. O HEAD testado, 01e965e, difere de 21dabc0 só em documentação. Nenhum código de produção foi alterado pelo QA.

Revalidado em 2026-10-15 no HEAD `1094cf7` (atualização com a `develop`, só docs) e, depois, no commit `c626cd0` (integração com o K-084): ver as seções finais.

## Execução real (HEAD 01e965e, Postgres do Compose)
- `pnpm run test:pg`: 64 aprovados, 7 falhas, todas em `tests/pesquisa.pg.test.ts` (ambiente, já conhecidas, fora do diff). Guarda, papéis e catálogo: verdes.
- Unitários do servidor: 22 arquivos, 414 testes, verdes. `pnpm run lint`: limpo.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| M-4: API lê `tem_entrega` e a faixa, não `entregas`; `SELECT *` dá 42501 | `papeis.pg.test.ts` "api lê tem_entrega e a faixa..." (papel real) | coluna fora do GRANT | passou |
| B-3: API não lê `ref_conta_automacao`; lê as demais `ref_`; coletor lê | `papeis.pg.test.ts` "api não lê ref_conta_automacao..." | tabela fora do GRANT, coletor preservado | passou |
| B-K2: exclusão vale em `dspd_bm`, `dspd_ac`, `dspd_core`; coletor e automação mantêm o SELECT no core | `plataforma.test.ts` (2 testes de `gerarGrants`) | schema | passou |
| B-K1: toda `agg_`/`ref_` está classificada | `guarda-api.pg.test.ts` | tabela nova sem decisão | passou (e falha no abuso A4) |
| B-K1: zero privilégio da API no que está "fora" | `guarda-api.pg.test.ts` | privilégio residual | passou (e falha no abuso A5) |
| B-K1: coluna de pessoa ou vazão em `agg_` concedida à API | `guarda-api.pg.test.ts` (regex) | coluna renomeada | passou (e falha no abuso A6) |
| Guarda contra suíte vazia | `guarda-api.pg.test.ts` (`> 10` tabelas) | varredura vazia | passou |

## Casos de abuso (dspd_api)
- A1 `SELECT entregas` em `agg_conhecimento_sistema`: 42501 (papeis.pg).
- A2 `SELECT *` na mesma tabela: 42501 (papeis.pg).
- A3 `SELECT 1` e `SELECT conta_id` em `ref_conta_automacao`: 42501 (papeis.pg, schema `dspd_bm`); `dspd_ac` e `dspd_core` cobertos pelo SQL gerado (unitário) e pela guarda de privilégio.
- A4 `ref_` e `agg_` novas sem classificação (arquivo temporário nos schemas migrados): a guarda falhou listando `dspd_bm.ref_nova_nao_classificada, dspd_bm.agg_abuso`.
- A5 `ref_conta_automacao` criada em `dspd_ac` com GRANT à API: guarda de privilégio falhou ("dspd_api com privilégio em dspd_ac.ref_conta_automacao").
- A6 coluna `total_entregas` legível pela API em `agg_`: guarda de regex falhou.
O arquivo temporário (`server/tests/zz-abuso.pg.test.ts`) foi removido; árvore sem resíduos.

## Vermelho antes do verde
`grants.ts` de `origin/develop` mais as duas listas exportadas vazias (para os imports compilarem):
- `bash scripts/test-pg.sh`: os 2 testes de `papeis.pg.test.ts` do K-085 falharam (9 falhas contra 7 de ambiente).
- `vitest run tests/plataforma.test.ts`: 2 testes de `gerarGrants` falharam.
- Observação: `guarda-api.pg.test.ts` passou com o código antigo, porque as migrações atuais não criam `agg_conhecimento_sistema` nem `ref_conta_automacao` (R-2 da segurança). A guarda é de classificação e só reage a tabela nova, como mostram A4 a A6; não é teste de regressão do `grants.ts`.

## Mutação em `grants.ts` (6 mutantes, 6 mortos)
| Mutante | Morto por |
|---|---|
| M1 remove `entregas` de `COLUNAS_FORA_DA_API` | papeis.pg + unitário |
| M2 `paraApi` sem o filtro de tabelas fora | papeis.pg + 2 unitários |
| M3 core: API volta a ler `refCore` inteiro | unitário |
| M4 remove `dspd_core.ref_conta_automacao` da lista | unitário |
| M5 remove `dspd_ac.ref_conta_automacao` da lista | unitário |
| M6 coletor perde o SELECT nas `ref_` | papeis.pg + unitário |
Nenhum sobrevivente. Arquivo restaurado após cada mutante.

## Riscos e limites
- As tabelas do K-085 ainda não existem nas migrações; o efeito no banco é exercido só em schemas isolados do `papeis.pg.test.ts`. Quando a fase 3 criar as tabelas, a guarda passa a rodar sobre elas (B-K3 da segurança, checklist do tech-lead).
- M3 a M5 só são pegos pelo unitário (texto do SQL), não pelo teste de papel real nos schemas `dspd_ac` e `dspd_core`. Aceitável: a guarda de privilégio cobre o banco migrado quando as tabelas existirem. Sugestão baixa ao node-backend, sem bloquear.
- R-1 da segurança (regex sem `owner|user`, só `agg_`) segue como recomendação.
- 7 falhas de `pesquisa.pg` não pertencem a este diff. Na revalidação de 2026-10-15 (commit c626cd0) a falha se repetiu com a mesma mensagem (`permission denied for database`, papel `dspd_pesquisa`) também com o `.env` do repositório principal, então a causa não é só o ambiente da worktree. Causa não investigada aqui; é registro para o `tech-lead` decidir (ver seção final).

## Revalidação: atualização com a develop (só docs)
- Data: 2026-10-15. Parecer original no commit `01e965e`; HEAD revalidado: `1094cf7` (branch `fix/grants-por-coluna`, worktree `MetricasDSPD-k085`). O campo `commit:` passa a ser o HEAD testado.
- Motivo: a branch mergeou a `develop` (`911625a`), que trouxe só documentação. O `forge-check pr` acusava o parecer como desatualizado por causa de `docs/alinhamentos/2026-10-14-revisao-desenho-011.md`, que não é caminho livre (LIVRES).
- Código e teste: `git diff 01e965e 1094cf7 --stat -- server packages web e2e` vazio. Os 18 arquivos que mudaram desde o parecer são de `docs/` e `KANBAN.md`. Nenhum código de produção, teste, migração, fixture ou configuração de pronto mudou.
- Unitário do `server` em `1094cf7` (`npx vitest run --project unit`, com `flock /tmp/metricas-pesado.lock nice -n 19`): 22 arquivos, **414 passaram**, 0 falharam. Igual ao parecer original.
- Não reexecutei `test:pg` nem `lint`: o código testado é idêntico ao de `01e965e` (mesmo resultado de 64 aprovados e as mesmas 7 falhas de `pesquisa.pg` de ambiente).
- Veredito mantido: **aprovado**, zero bugs abertos.

## Revalidação: integração com o K-084

- Data: 2026-10-15. Commit testado: `c626cd0` (merge da `develop` com o K-084, `0fe209a`). O commit de review `ab982b5` está por cima e muda só `docs/reviews/k085-grants-por-coluna.md`, caminho LIVRE; `git diff c626cd0 ab982b5 -- server packages web e2e` vazio. O código testado é o de `c626cd0`.
- Escopo da revalidação: o que o K-084 trouxe e que toca o K-085 (`grants.ts` x `stg_`, allow-list x `COLUNAS_PESSOA`). O K-084 não altera `grants.ts`.
- Nenhum teste novo nesta revalidação; nenhum código alterado pelo QA.

### Execução real
| Comando | Resultado |
|---|---|
| `flock /tmp/metricas-pesado.lock nice -n 19 vitest run --project pg` nos 4 arquivos (`guarda-api.pg`, `papeis.pg`, `allow-list.qa.pg`, `responsaveis.pg`) | **EXIT=0, 4 arquivos, 26 testes passaram**, 0 falharam |
| `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run test:pg` (suíte pg completa, worktree sem `.env`) | EXIT=1: 15 arquivos, 83 testes, **76 passaram, 7 falharam**; as 7 são todas de `tests/pesquisa.pg.test.ts` |
| Mesmo `test:pg` com o `.env` do repositório principal carregado | EXIT=1, mesmas 7 falhas de `pesquisa.pg` (76/83) |

Logs salvos em `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/d48e2c6b-73ac-47f2-9ee3-664a2a4ab172/scratchpad/` (`test-pg-k085.log`, `pg-k085-4arquivos.log`, `test-pg-k085-env-principal.log`).

### Critério → teste → resultado (integração com o K-084)
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| M-4: API não lê colunas de pessoa nem `entregas` | `papeis.pg` "api lê o card sem a coluna de pessoa; pedir responsaveis ou SELECT * falha com 42501"; "api lê tem_entrega e a faixa..." | coluna de pessoa fora do GRANT | passou |
| B-3: API não lê `ref_conta_automacao`; coletor lê as `ref_` | `papeis.pg` "api não lê ref_conta_automacao..." | tabela fora do GRANT | passou |
| ADR 0020: API não lê staging, eventos, versões nem outbox | `papeis.pg` "api não lê staging, eventos nem versões, nem a outbox; não escreve em nada" | `stg_` fora do GRANT | passou |
| K-084: coletor escreve responsáveis só nas `dim_card`/`dim_card_versao`, nunca na staging | `responsaveis.pg` "responsáveis vão para dim_card e dim_card_versao...; a staging não tem id de pessoa" | pessoa fora da staging | passou |
| K-084: allow-list fechada, sem campo proibido na staging nem na outbox | `allow-list.qa.pg` (8 testes de abuso: campos extras, tipo desconhecido, fora de ordem, U+0000, JSON inválido) | campo fora da lista | passou |
| K-084: coletor sem UPDATE/DELETE na staging (append-only) | `allow-list.qa.pg` "o papel do coletor continua sem UPDATE nem DELETE na staging" | escrita na staging | passou |
| B-K1: toda `agg_`/`ref_` classificada; privilégio zero fora da API | `guarda-api.pg` (5 testes, incluindo guarda contra varredura vazia) | tabela nova sem decisão | passou |

### Verificação direta no banco (dspd_api)
Feita com `dspd_migrador` no Postgres do Compose, banco `metricas` (o único com schemas `dspd_*` migrados; `metricas_test` está sem schemas após o teardown):
- Tabelas `stg_` existentes: 11. Tabelas `stg_` legíveis pela `dspd_api` (`has_table_privilege` SELECT, INSERT, UPDATE, DELETE): **0**.
- Colunas de pessoa legíveis pela `dspd_api`, com o padrão de `SEGMENTO_PESSOA` de `server/src/plataforma/db/lgpd.ts`: apenas `dspd_bm.dim_card.area_solicitante`. Essa coluna está em `EXCECOES_PESSOA` (área organizacional, briefing 4.5, não é pessoa). Nenhuma coluna de `COLUNAS_PESSOA` é legível.
- Nota de método: uma primeira varredura com regex mais larga apontou `dspd_bm.ref_coluna.nome` e `dspd_core.ref_calendario.nome`. São nomes de coluna de quadro e de calendário, não de pessoa, e o padrão do LGPD não os classifica como pessoa; não são falso negativo.

### Veredito da revalidação
**Aprovado**, sem bugs abertos, para o escopo do K-085 no commit `c626cd0`: o `dspd_api` segue sem acesso às `stg_` e às colunas de pessoa após a escrita do coletor do K-084, e os 26 testes dos quatro arquivos pedidos passam com o Postgres real.

### Riscos abertos (não bloqueiam o K-085, mas o tech-lead precisa ver)
- A suíte `test:pg` completa está vermelha: 7 falhas em `tests/pesquisa.pg.test.ts` (`permission denied for database`, papel `dspd_pesquisa`; e asserções de carga vazia). A falha se repete com o `.env` principal, então não é só ambiente da worktree. Estava presente antes do K-084 e do K-085 (registrada no parecer do K-084). Não foi marcada como `skip`. Recomendo abrir bug `docs/qa/bugs/` para o `pesquisa` e confirmar se o job `banco` da CI passa; a suíte completa não deveria ser tratada como verde até lá.
- A CI (job `banco`) continua sendo o portão do `test:pg` completo; este parecer não o substitui.

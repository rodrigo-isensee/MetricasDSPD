---
tipo: qa
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/grants-por-coluna
commit: 1094cf7
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

Revalidado em 2026-10-15 no HEAD `1094cf7` (atualização com a `develop`, só docs): ver a seção final.

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
- 7 falhas de `pesquisa.pg` são de ambiente e não pertencem a este diff.

## Revalidação: atualização com a develop (só docs)
- Data: 2026-10-15. Parecer original no commit `01e965e`; HEAD revalidado: `1094cf7` (branch `fix/grants-por-coluna`, worktree `MetricasDSPD-k085`). O campo `commit:` passa a ser o HEAD testado.
- Motivo: a branch mergeou a `develop` (`911625a`), que trouxe só documentação. O `forge-check pr` acusava o parecer como desatualizado por causa de `docs/alinhamentos/2026-10-14-revisao-desenho-011.md`, que não é caminho livre (LIVRES).
- Código e teste: `git diff 01e965e 1094cf7 --stat -- server packages web e2e` vazio. Os 18 arquivos que mudaram desde o parecer são de `docs/` e `KANBAN.md`. Nenhum código de produção, teste, migração, fixture ou configuração de pronto mudou.
- Unitário do `server` em `1094cf7` (`npx vitest run --project unit`, com `flock /tmp/metricas-pesado.lock nice -n 19`): 22 arquivos, **414 passaram**, 0 falharam. Igual ao parecer original.
- Não reexecutei `test:pg` nem `lint`: o código testado é idêntico ao de `01e965e` (mesmo resultado de 64 aprovados e as mesmas 7 falhas de `pesquisa.pg` de ambiente).
- Veredito mantido: **aprovado**, zero bugs abertos.

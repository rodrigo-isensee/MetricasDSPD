---
tipo: review
contrato: 1
pedido: 011-metricas-tambem-disponiveis
branch: fix/grants-por-coluna
commit: 61f974c5c6425f89bdc500a5300d0ba4802d59ba
parecer: aprovado
revisor: tech-lead
data: 2026-10-15
---

# Code review: K-085, GRANT por coluna do `dspd_api` (ADR 0020, M-4 e B-3) (volta 2)

Propósito: parecer de code review do K-085. Público: node-backend (autor), software-architect, security-engineer, qa-engineer e Jarvis.

**Veredito da volta 2: aprovado.** O achado 1 (bloqueante) foi corrigido em 61f974c, e o 21dabc0 fechou o achado 2 já neste cartão. Resta o achado 3 (frase da ADR 0020), que é do software-architect e não bloqueia.

## Volta 2 (delta 2e90f3d..61f974c)

**Revisado:** `git diff 2e90f3d..HEAD` na worktree `MetricasDSPD-k085`: 21dabc0 (`grants.ts`, `plataforma.test.ts`, `guarda-api.pg.test.ts` novo), 2f36a77 (parecer de segurança) e 61f974c (`data-model.md` §8).

**Segurança (citada, não refeita):** `docs/security/k085-grants-por-coluna.md`, releitura de 21dabc0: aprovado (fecha B-K1 itens 1 a 3 e B-K2; ressalvas R-1 e R-2 informativas; B-K3 é checklist do tech-lead). O código de GRANT revisado aqui é o mesmo que ela leu. O commit 61f974c só mexe em documentação.

**Ferramentas (saída real, em 61f974c):**
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto; echo EXIT=$?`: **EXIT=0**. Server: 22 arquivos passaram, 13 foram pulados (os `.pg`, sem `DATABASE_URL`); 414 testes passaram, 71 pulados. Cobertura de `tools/docs-contratos` em 100%; `docs:check` ok (402 páginas).
- `test:pg` da guarda e do `papeis` contra o Postgres do compose (mesmas variáveis do `scripts/test-pg.sh`, `vitest run --project pg tests/guarda-api.pg.test.ts tests/papeis.pg.test.ts`): **EXIT=0, 2 arquivos e 15 testes passaram**. Isso prova o efeito no banco migrado: toda `agg_`/`ref_` classificada, `dspd_api` sem privilégio no que está fora da API, nenhuma coluna sensível de `agg_` legível, e o bloco "grants: colunas e tabelas fora da API" do `papeis`.
- Não rodei o `test:pg` completo: a falha anterior de `pesquisa.pg.test.ts` (permissão do `dspd_pesquisa` no banco local) é de ambiente e não toca este diff; o job `banco` da CI segue como portão.

**Leitura do delta:**
- `grants.ts`: `TABELAS_FORA_DA_API` cobre os três schemas, e o core passa a conceder à API só `refCoreApi` (filtrado). Coletor e automação mantêm `refCore` completo. Função continua pura, listas `readonly string[]`, comentário cita B-K2. Correto e mínimo.
- `plataforma.test.ts`: o novo teste afirma a ausência (`not.toMatch(/ref_conta_automacao/)` em GRANTs `TO dspd_api`) e os positivos (coletor e automação no core, coletor no ac). O alvo da ausência existe no catálogo sintético do teste (checklist 11).
- `guarda-api.pg.test.ts`: classificação à mão e independente de `grants.ts`; há mínimo de itens (`> 10`) contra consulta vazia, e checagem de entrada "na API" que já não existe. O regex é mais estreito que o proposto pela segurança (R-1), aceito por ela.
- `data-model.md` §8: a linha do `dspd_api` e a do `dspd_core`, as duas listas com motivo (M-4 e B-3), o filtro no core (B-K2), a regra "entrada nova passa por revisão de modelagem e de segurança", o bloco de teste do `papeis` e a guarda estão descritos. O achado 1 está atendido.

## Situação dos achados da volta 1

| # | Situação | Bloqueia? |
|---|---|---|
| 1 | `data-model.md` §8 desatualizado: **corrigido em 61f974c** | fechado |
| 2 | Exclusão por nome literal e padrão de `ref_` ser conceder: **fechado por 21dabc0** (guarda de classificação e de privilégio no banco migrado, filtro no core). A guarda só ganha força de fato quando a migração da fase 3 criar as tabelas (R-2 da segurança). Pré-condição da migração da fase 3: o cartão dela cita o K-085 e roda `guarda-api.pg.test.ts` no mesmo PR (B-K3, checklist do tech-lead). | **não bloqueia este cartão** |
| 3 | A ADR 0020, item 4g, diz "só o `dspd_coletor` lê" `ref_conta_automacao`, mas o `dspd_ref` também tem `SELECT, INSERT` (cadastro da WS1). O código e o §8 já dizem o certo; falta ajustar a frase da ADR ("só o `dspd_coletor` lê para coletar; o `dspd_ref` cadastra; a API não lê"). Dono: software-architect. | **não bloqueia**: é texto de ADR, sem efeito em código ou em privilégio |
| 4 | `agg_conhecimento_sistema` em `paraApi` pelo nome: informativo, mantido | não |

## Pendências fora deste cartão
- software-architect: frase da ADR 0020 (achado 3) e, opcionalmente, `ref_` da API por lista permitida (B-K1 item 4 da segurança).
- tech-lead: item no checklist do cartão da migração da fase 3 (rodar a guarda; classificar as tabelas novas).
- node-backend, quando houver ocasião: `owner|user` no regex da guarda e extensão às `ref_` (R-1).

## Próximo passo
QA. Sem push nem PR ainda: a ordem é parecer do QA em `docs/qa/` e, depois, envio e PR para a `develop` (squash).

---

## Volta 1 (resumo, sobre 2e90f3d): reprovada por documentação

Código correto, efeito provado no banco conectando como `dspd_api` e como `dspd_coletor` (`pronto` EXIT=0 em 2e90f3d; `papeis.pg` passou; só `pesquisa.pg` falhou por ambiente). Bloqueio único: `data-model.md` §8 não descrevia as duas listas novas (`COLUNAS_FORA_DA_API`, `TABELAS_FORA_DA_API`), `agg_conhecimento_sistema` no conjunto da API nem a exceção de `ref_conta_automacao` (práticas, seção 7, item 7, e seção 8, item 10). Recomendados: guarda no banco migrado (achado 2) e ajuste da frase da ADR (achado 3). Informativo: achado 4. O 21dabc0 chegou durante a volta 1 e foi revisado na volta 2, acima.

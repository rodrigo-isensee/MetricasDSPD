---
tipo: qa
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: docs/101-release
commit: 5d7fe1aac6db8b7f4a9f547719fc73cff7a887e5
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-12
---

# QA da release 101 (develop em ea826a9c contra a homolog)

Escopo: suítes sobre a ponta da develop (`ea826a9c`). A worktree da branch `docs/101-release` (8e451206) difere de `ea826a9c` só em `CHANGELOG.md`, `docs/reviews/101-release.md` e `docs/security/101-release.md` (`git diff --stat ea826a9c HEAD`), então o código rodado é o da release. O review (A1) registrou que nenhum e2e rodou sobre esse commit; este parecer fecha a lacuna. Máquina só para esta suíte, um comando por vez.

## Resultado por suíte

| Suíte | Comando | Resultado |
|---|---|---|
| Web (unidade e componente) | `pnpm --filter @metricas-dspd/web test` | 98 arquivos, 1540 testes, todos verdes |
| Servidor | `pnpm --filter @metricas-dspd/server test` | 104 arquivos verdes, 41 pulados pela própria suíte (banco), 1976 testes verdes, 276 pulados |
| G1 (mock fora do build `api`) | `pnpm run build` e `pnpm run sem-mock` em `web/` | "G1 ok: sem chunk, sentinela ou texto do mock" |
| E2E `chromium` + `chromium-semente-alt` | `playwright test --project=chromium --project=chromium-semente-alt` | 786 verdes, 2 caídos por tempo (abaixo) |
| E2E `chromium-api` | `scripts/com-api-mock.sh` com `--project=chromium-api` (banco `_test`) | 63 verdes, **6 caídos** |

Os 2 caídos de `chromium` (`integracao-real-evidencias.spec.ts:13` "axe dark /dados?mock=coleta-vazia:ac" e "axe dark /operacional?cadencia=sustentacao") estouraram 30 s (1,2 min e 1,3 min, contra 1 a 2 s nos vizinhos), em plena rodada de 28 min. O arquivo isolado (`E2E_SEM_ALT=1 playwright test --project=chromium tests/integracao-real-evidencias.spec.ts`) passou: 30 de 30 em 23 s. Caída só por tempo; não é achado.

O `chromium-api` na 1ª e 2ª tentativas não subiu a API (`ECONNREFUSED 127.0.0.1:5432`): o sandbox da sessão bloqueia o loopback do Postgres (`/dev/tcp/127.0.0.1/5432` recusado dentro, aceito fora). A 3ª tentativa, fora do sandbox e só contra o banco de teste, rodou a suíte.

## Os 6 caídos de `chromium-api` (todos de spec que a release deixou velha)

Nenhum spec de `e2e/tests-api/` mudou no range (`git log origin/homolog..ea826a9c` vazio para esses arquivos), e o push da develop pula o e2e, por isso a CI da release não os viu.

| Teste | Falha | Causa na release |
|---|---|---|
| `api.spec.ts:66` FA5-04 | `getByRole('checkbox', {name:'Incidente'})` não existe | 097 L6: tipo vem das opções reais da fonte; o Operacional semanal é BusinessMap e a lista é Requisição, Melhoria, Bug interno, Defeito em produção, Dívida técnica. "Incidente" é tipo do Acelerato |
| `api.spec.ts:164` FA5-16 | idem | idem |
| `tatico-011-lote2.spec.ts:71` TT-02 | `selo-ficticio` esperado 1 em T13/T14, recebido 0 | 099: o selo "Simulado/fictício" saiu da web (ADR 0030) |
| `tendencias.spec.ts:58` CT-58 (FLUXO e SUST) | `equipe=x` devia dar 400, deu 200 | 097 L4: `equipe` virou parâmetro opcional das tendências (`docs/api/metricas.md:324`, `schemas.ts` `queryTendenciaSchema`) |
| `tendencias.spec.ts:71` CT-59 SUST | `PESSOA` casa `"descricao"` no corpo | O corpo traz `criterios.serie[].descricao` (texto de marco de critério, `packages/mock/src/criterios.ts`), não texto de chamado. Servidor, mock e spec iguais na homolog; a regex é larga demais. Não causada por esta release; não confirmei na base (sem baseline limpa no sandbox) |

Nenhum dos 6 é defeito de produto: comportamento novo, previsto no contrato e no pedido, contra spec antiga. O efeito é prático: o portão da homolog roda e2e e cai nesses 6.

## Achados

- A5 (recomendado) .github/workflows/ci.yml:191 · Nenhum job da CI roda o `chromium-api` (`e2e-parte` roda só `test:chromium`); foi o que deixou os 6 specs velhos passarem pelo review. Criar job com a API e o banco de teste.

## Cartões para o quadro (R-QA)

A1 a A4 (specs velhos) fecharam, ver Revalidação. Aberto: 1 baixo (A5, lacuna de CI do `chromium-api`), vira cartão no quadro; sem bug de produto aberto.

## Revalidação

Revalidação na ponta da develop `5d7fe1aa` (PR 357, E1.9, cartão K-273). O delta de código e teste é só `e2e/tests-api/{api,tatico-011-lote2,tendencias}.spec.ts`, conferido no diff contra `ea826a9c`: A1 trocou "Incidente" por "Melhoria" (FA5-04 e FA5-16); A2 passou a esperar 0 `selo-ficticio` em T10 a T14; A3 tirou `equipe=x` da lista de 400 e cobriu `equipe` válida (200) e slug inválido (400); A4 tirou `criterios` da checagem de `descricao`, que segue valendo fora do marco de critério, mantendo `usuarioKey`, e-mail, nome e título. Prova de CI: `gh pr checks 357` com `e2e-parte` 1/2 e 2/2, `e2e`, `testes`, `banco`, `rapida` e `seguranca` verdes; CI da develop em `5d7fe1aa` (run 43227913561) verde (testes, rapida, seguranca, openapi, imagem, build, banco; `e2e` e `perf` pulados no push, como antes). Limite: a CI não executa o `chromium-api` (A5), então os 69 de 69 vêm do relatório do autor, citados e não refeitos por mim (regra do dono: sem banco local). Web, servidor, G1 e `chromium` seguem como na tabela acima, pois o código de produto não mudou.

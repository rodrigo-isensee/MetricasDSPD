---
tipo: qa
contrato: 1
pedido: 101-release-filtros-sem-simulado
branch: docs/101-release
commit: ea826a9ca695f84e810387ff85ea86befa997d1f
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 3
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

- A1 (bloqueante) e2e/tests-api/api.spec.ts:69 · FA5-04 e FA5-16 (linha 172) clicam o tipo "Incidente", que não existe nas opções do BusinessMap desde a 097 L6. Trocar por um tipo da lista real, como "Melhoria".
- A2 (bloqueante) e2e/tests-api/tatico-011-lote2.spec.ts:79 · TT-02 espera 1 `selo-ficticio` em T13 e T14; a 099 tirou o selo (ADR 0030). Esperar 0 em todas as métricas.
- A3 (bloqueante) e2e/tests-api/tendencias.spec.ts:64 · CT-58 manda `equipe=x` esperando 400; `equipe` é opcional desde a 097 L4. Tirar `equipe=x` da lista e cobrir `equipe` válida (200) e slug inválido (400).
- A4 (recomendado) e2e/tests-api/tendencias.spec.ts:26 · A regex PESSOA casa `"descricao"` do marco de critério (`criterios.serie[].descricao`) e derruba CT-59. Casar só `descricao` fora de `criterios`, ou checar chaves de `serie` de chamado.

## Cartões para o quadro (R-QA)

Os 4 achados acima são o mesmo trabalho: atualizar 3 specs e a regex. Bugs de teste: 3 médios (A1 a A3) e 1 baixo (A4); sem bug de produto aberto.

## Revalidação

Depois de corrigir os specs, rodar de novo `chromium-api` inteiro (63 + 6 = 69 testes) com a máquina livre. Nada mais a refazer: web, servidor, G1 e `chromium` ficam como acima, desde que o código de `ea826a9c` não mude.

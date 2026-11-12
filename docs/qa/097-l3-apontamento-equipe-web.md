---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l3-apontamento-equipe-web
commit: e6d98fb80cae74436ef0737001e4b05db0164f65
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: 097 L3, Equipe no lugar de Pessoa no Apontamento (web), volta 1

**Veredito: aprovado pelo delta.** A volta (494b79d2 → e6d98fb8) só acrescenta um teste em `web/src/features/apontamento/barra-e-ramos.test.tsx` para o ramo `opcoes.equipes` ausente, que fechava o B1 e o A1 do parecer anterior. Nenhum código de produção mudou, então CA-7, CA-8, CA-9, "Sem equipe", a nota junto da capacidade e o mapa diário seguem como provados no parecer da rodada 1 (mesma tabela critério → teste → resultado, inalterada).

## Delta
- Teste novo: "resposta sem `equipes` (contrato opcional): lista vazia, e filtro de equipe cai no recorte vazio". Exerce `opcoesDeEquipe` (filtros.ts:103) e `respostaFicticia` (fixture.ts:550) sem `equipes`; afirma lista vazia e `kpis.apontamentos` 0 com `equipe=['portal']`. Falharia se o `?? []` fosse trocado por acesso direto (TypeError) ou se o recorte ignorasse a equipe.
- Local (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real): `vitest run src/features/apontamento`: `Test Files 11 passed (11)`, `Tests 175 passed (175)` (eram 174).
- CI do head e6d98fb8 (run 43148850784): `testes` success (inclui `pnpm run cobertura`, limiar de 100% de branches do web, que reprovava no head anterior), `rapida`, `build`, `filtro`, `imagem`, `openapi`, `seguranca` e `banco` success. `e2e`, `e2e-parte` e `perf` ficaram "skipped" porque o workflow os roda só em `pull_request` ou `workflow_dispatch` (ci.yml:193, 233); o push de branch não os dispara.

## Pendente, sem bug
- E2E `apontamento-qa.spec.ts` CT-10 (filtro Pessoa ausente; nome real fora de URL, rota e storage) continua "a conferir no CI": roda no check-run do PR. Se falhar lá, reabre.

## Bugs (fora do bloco de achados)
- B1 (média) do parecer anterior: fechado pelo teste novo e pelo `testes` verde.

## Achados

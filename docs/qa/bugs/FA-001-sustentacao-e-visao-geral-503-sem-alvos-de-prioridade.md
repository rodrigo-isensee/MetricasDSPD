# FA-001 - Sustentação e Visão geral respondem 503 REFERENCIA_AUSENTE sobre a base semeada
- Severidade: alta (no modo `api` o painel de Sustentação e a Visão geral ficam com cartões em erro)
- Responsável sugerido: node-backend (seed/projeção de referência)
- Ambiente: branch feature/front-via-api (bd6d721 + testes FA-4/FA-5), API com `DADOS_FONTE=mock`, Postgres 17 de teste, Chromium headless

## Passos para reproduzir
1. `flock /tmp/metricas-pesado.lock bash scripts/com-api-mock.sh pnpm --dir web run test:paridade` (ou, com a API no ar, `GET /api/v1/metricas/S1?periodo=6m`).
2. Abrir `/sustentacao` na SPA em `VITE_FONTE=api` (`pnpm --dir e2e run test:api` sob o script).

## Resultado esperado
S1, S2, S3, S5, EI_SUST e VISAO_GERAL devolvem o mesmo resultado do mock (a base semeada vem do mock).

## Resultado obtido
`503 {"error":{"code":"REFERENCIA_AUSENTE","message":"Referência não carregada: alvos de prioridade (ref_alvo_prioridade)."}}`. O seed (`server/src/plataforma/db/seed.ts`) grava só dimensões e fatos; `ref_alvo_prioridade` fica vazia (`servico.ts:155`). No E2E: FA5-01 `/sustentacao` (cartão S1 em `data-estado="erro"`) e FA5-02 Visão geral falham.

## Evidência
Paridade: `docs/qa/front-via-api.md` (tabela). E2E: `[chromium-api] FA5-01 /sustentacao` e `FA5-02`: `503 /metricas/S1?periodo=6m ... REFERENCIA_AUSENTE`.

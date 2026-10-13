---
tipo: review
contrato: 1
pedido: perf-api-sem-servidor
branch: fix/perf-api-sem-servidor
commit: 8d71bf0d974a7505d6b079d8466221176ad51ad4
parecer: aprovado
revisor: tech-lead
data: 2026-10-13
---

# Code review: perf-api sem servidor na CI (PR #62)

Branch `fix/perf-api-sem-servidor` contra `develop`, commit `8d71bf0` (1 arquivo, +1 linha).

## Parecer
**Aprovado.** Sem itens bloqueantes.

## Achados
- `e2e/playwright.config.ts:81`: `testIgnore: /perf-api\.spec\.ts/` no projeto `perf` (mock). Causa correta: o projeto `perf` tem `testDir: ./perf` sem filtro e pegava o `perf-api.spec.ts` (A1, que exige a API), daí o ECONNREFUSED do job `perf` da CI. Correção mínima e no lugar certo.
- Nenhum gate enfraquecido: o `perf-api.spec.ts` só contém os dois testes A1, que dependem da API e continuam no projeto `perf-api` (`testMatch: /(perf|perf-api)\.spec\.ts/`, `test:perf:api`), inalterado. O job `perf` da CI roda só `test:perf` (projeto `perf`) e o Lighthouse, sem a API; A1 nunca teve como rodar ali.
- O perf mock segue medindo tudo o que media: `perf.spec.ts` (F1, F2, F3 a F5, C5, e F2 a 375) não é afetado pelo regex, que casa só o nome do arquivo da API.
- Recomendado (não bloqueia): como A1 não roda no job `perf`, a cobertura de A1 depende de alguém executar `test:perf:api` (local ou homologação); vale um cartão para ligá-lo na CI quando a API subir lá.
- Commit: mensagem Conventional em pt-BR, escopo coerente. Teste novo para o bug: a própria execução do job `perf` é a verificação (não há teste unitário aplicável a configuração).

## Verificação
Leitura do diff, do `playwright.config.ts`, dos dois specs e do job `perf` em `.github/workflows/ci.yml`. Execução fica com o QA e com a CI do PR.

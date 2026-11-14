# FORGE0442-001 - falhas pré-existentes do `pnpm run pronto` vistas no upgrade 0.44.2
- Status: corrigido na branch fix/forge0442-001 (aguarda review e QA) (não causado pelo upgrade; não bloqueia o pedido chore/forge-0442)
- Severidade: média
- Responsável sugerido: forge:node-backend (cobertura do server), forge:qa-engineer (trava do teste 4 e heap do eslint)
- Ambiente: branch chore/forge-0442, commit 232bb85

## Passos para reproduzir
1. `pnpm run pronto` na raiz.

## Resultado esperado
rc=0.

## Resultado obtido
- Teste 4 de `scripts/suite-unica.test.sh` trava (relato do autor da evidência).
- `eslint .` estoura o heap.
- Cobertura do server em 99,97%, abaixo da meta de 100%: linha `spike.ts:71` sem cobertura.
- Server: 274 testes skipped por PostgreSQL ausente no ambiente (o job `banco` da CI os cobre).

## Evidência
/tmp/claude-0/-workspaces/b37d1e9f-be92-464b-b166-7229b98dd0fa/scratchpad/pronto3.log e pronto-web.log. O diff do upgrade só muda `.forge/versao`, sem relação com essas áreas.

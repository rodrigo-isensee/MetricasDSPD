# IFA-001 - IF-A não verifica nenhum cartão em /operacional (default) e /estrategico
- Severidade: média
- Responsável sugerido: qa-engineer (código de teste em `e2e/tests/intensivo-filtros.spec.ts`)
- Ambiente: branch fix/e2e-if-a, commit 6aed3cc (HEAD testado no parecer e2e-if-a), Chromium headless (Playwright), ambiente local, dados do mock

## Passos para reproduzir
1. Na worktree `fix/e2e-if-a`, em `e2e/`, rodar `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-A" --reporter=json`.
2. Ler a anotação `verificados` dos testes `IF-A /operacional` e `IF-A /estrategico`.

## Resultado esperado
Cada teste IF-A verifica ao menos um cartão com "Não afetado por X" (o teste percorre a lista e compara a base com e sem o filtro). Ou o teste afirma um mínimo de cartões verificados, para que um estado sem cartões aplicáveis falhe em vez de passar em branco.

## Resultado obtido
- `IF-A /operacional` (sem cadência semanal): anotação `verificados` = `nenhum cartão com "Não afetado por"`. A asserção `expect(divergentes).toEqual([])` passa sem comparar nada.
- `IF-A /estrategico`: mesma situação, `nenhum cartão com "Não afetado por"`.
- Consequência: a mutação que inverte a comparação (`outro?.base !== c.base` → `===`) passa nesses dois testes. A verificação de "Não afetado por" só é efetiva em `IF-A /operacional?cadencia=semanal` (7 cartões) e `IF-A /tatico` (7 cartões). Confirmado pela mutação: o teste de `/tatico` falha; o de `/operacional` passa.
- Não é regressão desta correção: o diff de `757d732` só adiciona `test.setTimeout(120_000)`. O comportamento existia antes.

## Evidência
- Run JSON de 2026-10-14 (22:21 local), anotações:
  - `IF-A /operacional` passed 3.4 s: `nenhum cartão com "Não afetado por"`
  - `IF-A /estrategico` passed 4.3 s: `nenhum cartão com "Não afetado por"`
  - `IF-A /tatico` passed 26.7 s: 7 cartões verificados
  - `IF-A /operacional?cadencia=semanal` passed 30.2 s: 7 cartões verificados
- Mutação em `/operacional` (passou, vacuidade) e em `/tatico` (falhou com a mensagem "diz 'Não afetado por: ...', mas a base muda"): `scratchpad/mutacao2.log` na sessão de QA.

## Próximo passo sugerido
Acrescentar ao IF-A a afirmação de mínimo de cartões verificados por rota (ex.: `expect(verificados.length).toBeGreaterThan(0)` nas rotas em que o cenário é esperado), ou fixar os filtros de forma que a rota tenha cartões "Não afetado por". Escolha depende de regra de negócio: confirmar com o usuário se /operacional default deve mostrar "Não afetado por" com os filtros do IF-A.

## Correção 2026-10-20 (/estrategico)
- Filtros escolhidos para `/estrategico`: `sistema=protheus,crm` e `periodo=6m` (o padrão do painel é 12m, então o período fica ativo). Os cartões que só aplicam sistema ou nenhum filtro passam a exibir "Não afetado por".
- Verificados: 2 cartões, `E9 (Período)` e `E8 (Sistema/Período)`.
- Guarda contra lista vazia: a rota ganhou `minimo: 1` em `ROTAS_APLIC` e o teste afirma `verificados.length >= minimo`; lista vazia agora falha.
- Mutação (`outro?.base !== c.base` para `===`, rodada uma vez e desfeita): `IF-A /estrategico` falhou ("E9 diz 'Não afetado por: Período', mas a base muda"). Antes da correção esse teste passava na mutação.
- Execução: `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-A"` com as 4 rotas verdes.
- Pendente: `/operacional` sem cadência (fica para as operacionais, pedido 036).

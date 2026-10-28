---
tipo: review
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: feature/047-select-timeout
commit: b42b2610abf65e6ded9ce8db989ac06f4726aaa2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review: K-150, aquecimento do ESLint no teste "reprova: SELECT *"

Diff de `4137981` a `b42b2610`: 6 linhas em `server/tests/plataforma2.test.ts` (4 acrescentadas, 1 removida, mais comentário). Muito abaixo do teto M14.

## Contra a entrega do E1.1
- Mesma asserção: o `it` "reprova: SELECT *" e a função `regras` ficam intactos (`plataforma2.test.ts:259`, `:273-275`); a instância `ESLint` só sobe um escopo, com o mesmo `cwd`. Mesmo efeito.
- Sem aumentar timeout e sem retry: nenhum `testTimeout`, `retry` ou argumento de tempo no diff.
- Aquecimento não esconde falha: `await eslint.lintText(...)` está no topo do módulo (`:253`); se lançar, a coleta do arquivo rejeita e o arquivo falha, não passa calado. O resultado do lint de aquecimento não é asserido, correto, pois só serve para pagar o custo fixo; a regra continua medida nos `it`.
- Documentação: comentário em `:250-251` explica o porquê e cita K-150. Sem doc técnica a atualizar (só teste).
- Teste executado uma vez: `vitest run tests/plataforma2.test.ts` em `server/`, 1 arquivo, 34 testes passados, 1,43 s.

## Achados
- A1 (recomendado) server/tests/plataforma2.test.ts:253 · o nome `aquecer.ts` é fictício e não é asserido; aceitável como está, sem devolução. Destino: nenhum.

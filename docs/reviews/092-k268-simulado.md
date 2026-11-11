---
tipo: review
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k268-simulado-intermitente
commit: 52aa703de382c0e3e3eb55175ce2536b1f7991e2
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Code review: K-268, caso intermitente de simulado.test.tsx

**Veredito: aprovado.**

Escopo: `d8d52103..52aa703d`. Um arquivo só, `web/src/features/coleta/simulado.test.tsx`, com +4 −1. Nenhum componente mudou: `git diff --stat` não mostra nada fora desse teste.

## O que conferi
1. **A espera é por condição:** o caso procura o cartão `metrica-O12` com `findByTestId` e espera `data-estado` virar `ok` com `waitFor`. Só então procura o selo, com `within(o12).getByTestId`. Não há timeout novo, `sleep` nem retry. É o mesmo padrão dos casos de Tático e Sustentação do mesmo arquivo (T2, S1, S2). `within` já era importado.
2. **O caso continua provando o que diz:** O3 (real) fica `ok` antes e não cria o mock (T-W1). O selo do O12 confirma que o simulado respondeu. Depois disso, `expect(criarMock).toHaveBeenCalledTimes(1)` segue igual. Agora o selo é procurado dentro do cartão do O12, o que deixa a prova mais estreita que antes.
3. **Causa provável da intermitência:** antes, o `findByTestId('selo-simulado-O12')` podia esgotar o tempo padrão enquanto o cartão ainda carregava. Agora a espera vai até o estado que o próprio cartão publica (`CartaoMetrica.tsx:210`).
4. **Comentários:** a linha nova diz por que a espera existe. O comentário anterior (O12 é o único simulável da visão semanal) continua.

## Ferramentas (citadas, não refeitas)
- O arquivo tocado, nesta worktree, em `52aa703d`, com no máximo 2 workers (R-TETO): `TZ=UTC npx vitest run --maxWorkers=2 src/features/coleta/simulado.test.tsx`, rodado em `web/`. Rodei seis vezes e todas deram `Tests 6 passed (6)`. O autor relata 30 de 30.
- Lint, formatação, typecheck e a suíte completa ficam com o CI do PR.

## Achados

## Sondas

## Parecer
Aprovado. O K-268 troca uma busca de selo que dependia do tempo padrão por uma espera pelo estado `ok` do cartão do O12. Não afrouxa nenhuma asserção, mantém a prova de que o mock nasce uma vez só, pelo primeiro cartão simulável, e não toca em produção. Sem achados.

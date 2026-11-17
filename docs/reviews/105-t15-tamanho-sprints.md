---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-tamanho-sprints
commit: add0e640c7116452681f6f63e0f7fed54f048cb5
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T15 Tamanho das sprints (E7.577, revalidado em E7.582, head add0e640)

## Revalidação (E7.582, head add0e640)
Delta lido: `forge-check parecer delta docs/reviews/105-t15-tamanho-sprints.md`, intervalo `d698aefe..add0e640`, domínio código e testes; o código mudou só na volta E7.580 (`96c33020..add0e640`), 9 arquivos, 28 inserções e 22 remoções: `docs/api/metricas.md`, `packages/contratos/src/metricas.ts`, `packages/contratos/src/schemas.ts`, `packages/metricas/src/businessmap/t15.ts`, `t15.test.ts`, `packages/metricas/src/core/criterios.ts`, `web/src/features/complementares/notas.ts`, `previsao.tsx` e `t15-tamanho-sprints.test.tsx`.

| Achado da primeira rodada | Resultado | Evidência |
|---|---|---|
| A1 (bloqueante) "Um time por vez" no cartão | resolvido | `previsao.tsx:276-280` e `notas.ts:144` dizem "Com mais de um time no filtro (ou nenhum), as sprints dos times se somam; para ver um time, filtre por ele"; `t15-tamanho-sprints.test.tsx:41` trava a frase nova com `equipe: []`. Sonda S1 repetida: obtido o texto novo |
| A2 (recomendado) contrato e comentários | resolvido | `docs/api/metricas.md:115`, `metricas.ts:253`, `schemas.ts:1221`, `criterios.ts:415`, `t15.ts:13`, `previsao.tsx:224`; `grep -rni "um time por vez"` em `packages`, `web`, `server` e `docs/api`: nenhuma ocorrência |
| A3 (recomendado) comentário "tocam o período" | resolvido | `t15.ts:26`: a sprint entra pela conclusão, `first_end` dentro do período |

Também no delta, conferidos: cabeçalho "Média" com o aviso movido para a linha `Leia` (sem mudança de dado); legenda com o recorte do filtro; em `t15.test.ts` o `foraDaConta` passa a `semDatas: 1, acimaDoTeto: 2`, valores distintos que pegam a troca dos dois campos, e continua igual ao do T8. Sem mudança de cálculo, contrato de dados ou API; regras invioláveis inalteradas (sem comparação entre times, mínimo de 20, só BusinessMap).

## Ferramentas, suíte e mutante
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde. PQ do autor: `pnpm run pronto` verde, `docs:check` ok, sem aceite de contrato pendente (detalhe dos portões, seção Revalidação).
- Rodei os testes do item no add0e640: `t15.test.ts` (pacote `metricas`) 4 passam; `t15-tamanho-sprints.test.tsx` (pacote `web`) 3 passam.
- Mutante M1: frase do cartão (`previsao.tsx:277`) volta a "Um time por vez": o teste segue verde, porque a nota (`notas.ts:144`) também é renderizada no cartão e satisfaz o regex. Mutante M2: só a nota trocada: verde. M1 e M2 juntos: 1 teste falha. Cada cópia sozinha não está travada (A1 abaixo, recomendado: o texto entregue está correto). Árvore restaurada.
- `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Tamanho (M14): o delta da volta tem 50 linhas; o total do T15 segue acima de 150 (631 na primeira rodada), e o corpo do PR leva `teto: excedido, <n> linhas, <motivo>` (métrica nova de ponta a ponta, um comportamento só).

## Achados
- A1 (recomendado) web/src/features/complementares/t15-tamanho-sprints.test.tsx:41 · o regex casa com a nota e com a linha Leia: trocar só uma das duas cópias deixa o teste verde (M1, M2). Afirmar as duas (getAllByText com 2) ou mirar a linha Leia.

## Sondas
- S1 · `CartaoT15` com `FILTROS_FLUXO` (`equipe: []`, todos os times) · espera: texto que diga que as sprints dos times se somam · obtido: "Com mais de um time no filtro (ou nenhum), as sprints dos times se somam; para ver um time, filtre por ele." (`t15-tamanho-sprints.test.tsx:41` verde no add0e640)

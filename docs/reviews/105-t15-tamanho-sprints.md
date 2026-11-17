---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-tamanho-sprints
commit: d698aefe3ee6205e265cb1e9b4e89d8dbc288a45
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T15 Tamanho das sprints (E7.577, head d698aefe)

## Escopo lido
Só o delta do T15 sobre o T8 (`git diff origin/feat/105-t8-sprint-real..d698aefe`, 45 arquivos; o T8 está em `origin/feat/105-t8-sprint-real`, ancestral do head, e foi aprovado em separado). Li a biblioteca (`t15.ts`, a extração de `sprintsDoRecorte` em `t8.ts`, `amostra.ts`, `criterios.ts`, `regras.ts`, `calcular.ts`), o contrato (`schemas.ts`, `metricas.ts`, `origem.ts`, `cartoes.ts`, `comum.ts`, `validacao.ts`), a API (`servico.ts`, `calendario.ts`, `docs/api/openapi.json` e `docs/api/metricas.md`), o cartão (`previsao.tsx`, `notas.ts`, `registro.tsx`), o catálogo (`catalogo-metricas.ts`) e os testes novos. Contrato e fotografia (`T15.md`, `resultados/T15.json`, enum da `VISAO_GERAL`) conferidos com o schema: só acrescentam o T15.

Conferido e correto, contra a decisão do dono:
- **Janela comum:** `sprintsDoRecorte` é extração sem mudança de comportamento do corpo antigo do `calcularT8` (mesmos filtros, mesma ordem: filho nos filtros, depois `concluiNoPeriodo`, depois `janelaValida`); o T8 e o T15 leem a mesma função. Do `first_start` ao `first_end`, teto de 30 dias úteis, entrada pela conclusão (E7.536, 2 = A).
- **Percentis pela biblioteca (T2.5):** `resumoComMedia(amostraBM('sprint', ...))`; nenhum cálculo próprio. A classe de amostra `sprint` é nova e separada de story, frente e projeto.
- **Mínimo de 20:** vem da biblioteca (`estatistica` com `MINIMO_AMOSTRA`), também no modo mock (o T15, ao contrário do T8 do mock, não publica abaixo de 20).
- **Sem comparação entre times:** sem segmentação (`segmentacao: []`), sem quebra por time nem ranking; o time entra só pelo filtro `equipe`.
- **BusinessMap sem Acelerato:** `servico.ts` passa `ac: EXTENSAO_AC_VAZIA`; T15 só em `METRICAS_CALENDARIO.businessmap`.
- **T2.6:** `VERSAO_CRITERIO_T15_TAMANHO_SPRINT` datada e em `VERSOES_DA_BIBLIOTECA`; T15 em `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`.

## Ferramentas, suíte e mutante
- Sem PR para a branch: a suíte inteira fica para o CI do PR; não afirmo CI verde neste head. PQ do autor: `pnpm run pronto` completo verde (rc=0, web 1920/1920, `docs:check` ok), conforme o detalhe dos portões.
- Rodei os testes novos e os do T8: `t15.test.ts` e `t8.test.ts`, 14 passam.
- Mutante 1: guarda `if (!concluiNoPeriodo(s)) return []` de `sprintsDoRecorte` desligada: 1 teste do T15 falha ("sem first_end fica fora do período..."). Morto.
- Mutante 2: duração `diasUteisNoIntervalo(...).length + 1` em `t15.ts`: 1 teste falha. Morto. Árvore restaurada depois dos dois.
- `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Tamanho (M14): 631 linhas de código e teste no delta (fora `.md` e `.json`), acima da orientação de 150. Não há PR agora; quando houver, o corpo leva `teto: excedido, <n> linhas, <motivo>` (métrica nova de ponta a ponta: biblioteca, contrato, API e cartão, um comportamento só).

## Achados
- A1 (bloqueante) web/src/features/complementares/previsao.tsx:276 · "Um time por vez" contradiz a decisão do dono: com 0 ou 2+ times no filtro as sprints se somam (S1). Mesmo ponto do A-1 da UX; ver o detalhe.
- A2 (recomendado) docs/api/metricas.md:115 · "um time por vez" descreve o contrato errado para `equipe` com 0 ou 2+ times; diga que as sprints dos times do filtro se somam. Idem nos comentários do detalhe.
- A3 (recomendado) packages/metricas/src/businessmap/t15.ts:26 · o comentário diz "sprints que tocam o período", regra antiga; a sprint entra pela conclusão (`first_end` no período, E7.536).

## Detalhe do A1 e do A2
- A1: no filtro padrão (`equipe: []`, todos os times) o P50 e o P85 misturam todos os times e o cartão afirma o contrário. Troque o texto de `previsao.tsx:276` e de `notas.ts:144` pelo que a UX propõe no A-1 dela e ajuste `t15-tamanho-sprints.test.tsx:41`, que hoje trava a frase errada com `equipe: []`.
- A2: a mesma frase nos comentários de `packages/contratos/src/metricas.ts:253`, `packages/contratos/src/schemas.ts:1221`, `packages/metricas/src/core/criterios.ts:415`, `packages/metricas/src/businessmap/t15.ts:13` e `web/src/features/complementares/previsao.tsx:224`.

## Sondas
- S1 · `CartaoT15` com `FILTROS_FLUXO` (`equipe: []`, todos os times) · espera: texto que diga que as sprints dos times se somam · obtido: "Um time por vez, pelo filtro de time." (o próprio teste `t15-tamanho-sprints.test.tsx:41` afirma a frase com `equipe: []`)

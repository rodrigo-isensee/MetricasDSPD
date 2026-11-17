---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: test/105-k406-iniciativa
commit: 97aa77a8399af4b2c50172b57302a3286382b821
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: teste da Iniciativa no T3 e nome Dívida técnica (105, K-406, E7.569)

**Veredito: aprovado.** Classe T. Diff `origin/develop...97aa77a8` (base `acb62951`): 2 arquivos, 9 linhas a mais e 1 a menos. Fecha os dois recomendados do parecer do QA do T3 (`docs/qa/105-t3-habilitador.md`, A1 e A2).

## Conferência
- **A1 do QA (Iniciativa na fatia Produto).** `packages/metricas/src/businessmap/fixtures.cobertura.test.ts:662-668` monta 21 entregas Iniciativa e 21 Habilitador e afirma Produto = 21, Habilitador = 21 e Correção em produção = 0. Com 21 por fatia, o teste fica acima do mínimo de 20 sem depender dele: a contagem `itens.quantidade` sai em qualquer caso. O mapa testado é `FATIA_DO_TIPO` (`t3.ts:13-23`), sem lógica nova.
  - Rodei o teste novo na worktree em 97aa77a8: 1 passou (36 pulados pelo `-t`).
  - Mutante `Iniciativa: 'Produto'` → `Iniciativa: 'Habilitador'` em `t3.ts:15`: **morre** (`expected +0 to be 21`). O mutante do QA no A1 agora morre. Restaurei o arquivo e a árvore ficou limpa.
- **A2 do QA (nome do tipo).** `changelog.d/feat-105-t3-habilitador.md:4` passa a "Dívida técnica + Melhoria", o nome do tipo em `packages/contratos/src/comum.ts:42` e o da fatia em `t3.ts:21`. Não sobrou "Débito técnico" em `changelog.d/`.
- **Regras de leitura alcançadas.** O teste é determinístico: datas fixas a partir de `D0`, `HOJE_TESTE` e nenhuma hora corrente. Usa os ajudantes do bloco (`tipado`, `fatias`, `umaBase`), sem duplicar fábrica. Nada por pessoa, só BusinessMap e só stories.
- **Escopo.** Faz o que o cartão pede, nem mais nem menos. Um commit só, Conventional Commits em português (`test(metricas): ...`). Muito abaixo da orientação M14 (150 linhas). Não há guarda nova, então não há mutante a declarar.
- **Suíte.** Sem PR para a branch, a suíte inteira fica para o CI do PR. Vale o PQ do autor, e este parecer não afirma CI verde.

## Achados

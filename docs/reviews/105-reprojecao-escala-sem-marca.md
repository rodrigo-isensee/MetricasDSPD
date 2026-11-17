---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-reprojecao-escala-sem-marca
commit: a815f6aa74ae696efa38e5440fbc3a3d2c5a875c
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: `ac:reprojetar-escala` sem mudança não grava `ctl_coleta` (K-398, E7.429; review E7.437)

parecer: aprovado, sem achado.

## Escopo lido
`git diff e1c98633...a815f6aa`, um commit só (a815f6aa) sobre a base do brief: `server/src/modulos/acelerato/reprojecao-escala.ts` e os dois testes (`acelerato-reprojecao-escala.test.ts` e `acelerato-escala-p.pg.test.ts`). Para conferir o efeito, li a entrada que imprime o resultado (`server/src/entradas/reprojetar-escala-ac.ts`), o tipo de `rowCount` no `PoolLike` (`plataforma/db/pool.ts:8`), o banco falso (`tests/duble-pg.ts:16`) e o review do K-397 (`docs/reviews/105-reprojecao-sem-marca.md`), de que este cartão é o complemento.

Tamanho (M14): 51 linhas de código e teste (39 adições, 12 remoções), dentro da orientação, e um comportamento só.

## O que confere
- O `INSERT` em `ctl_coleta` desceu para depois do laço e só roda com `preenchidos > 0` (`reprojecao-escala.ts:52`). Nada no laço usava o `coletaId`. Sem preenchimento, a transação só lê e faz `COMMIT` sem escrita, e a data de referência do Acelerato (`lerMarcaDagua`) não se move na subida da VM (`vm:preparar`). É o mesmo desenho do `ac:reprojetar-fluxo` no K-397.
- `preenchidos` soma o `rowCount` do `UPDATE` (`:43`), não o tamanho de `novos`. É o critério certo: na segunda execução o `UPDATE` com `escala_p IS NULL` não toca linha, mesmo que o filtro de leitura devolva o chamado. `rowCount` nulo vira 0 por `Number(null)`, o lado seguro (não grava).
- Com preenchimento, o caminho é o de antes: `ctl_coleta` `em_andamento`, contagens, `UPDATE` para `sucesso`. O `inicio` continua lido antes do laço, então `iniciado_em` não muda de significado.
- `coletaId: number | null`: a entrada só faz `JSON.stringify` do resultado, e nenhum outro chamador lê o campo. O comentário de contrato do módulo foi atualizado na mesma entrega.
- Regras invioláveis: nada do BusinessMap, nenhum dado de pessoa novo, nenhum histórico sobrescrito (o `UPDATE` segue restrito a `escala_p IS NULL`).
- Testes: o unitário novo (`K-398: UPDATE que não muda linha`) prova o ramo de falha com `rowCount: 0` e um chamado lido, que é exatamente a segunda execução. O `.pg` roda a segunda execução com o relógio uma hora à frente e compara `ctl_coleta`, `ctl_coleta_contagem` e `lerMarcaDagua` antes e depois, o que pega uma marca movida pela hora.

## Verificações e ferramentas
- Suíte: sem PR para a branch, a suíte inteira fica para o CI do PR, e não afirmo CI verde neste head. Cito o PQ do autor registrado no brief: `test:pg` 347 de 347 e `pronto` rc=0.
- Rodei só o teste do item: `vitest run tests/acelerato-reprojecao-escala.test.ts`, `Tests 5 passed (5)`.
- Mutantes, um por linha de guarda mudada, no teste unitário; os três foram mortos:
  - M1: `if (preenchidos === 0) return` virou `if (false) return`. `Tests 3 failed | 2 passed (5)`.
  - M2: a mesma guarda virou `preenchidos <= 1`. `Tests 2 failed | 3 passed (5)`.
  - M3: `preenchidos += Number(r.rowCount)` virou `preenchidos += novos.length`. `Tests 1 failed | 4 passed (5)`.
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.

## Achados

## Fora do diff
`docs/devops/105-implantacao-vm.md:107` ainda diz que `ac:reprojetar-etapas` e `ac:reprojetar-fluxo` somam uma linha em `ctl_coleta` a cada subida, texto que o K-397 tornou antigo. Não cita o `ac:reprojetar-escala` nem é deste diff; fica como nota para a próxima mexida no roteiro.

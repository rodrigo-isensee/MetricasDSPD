---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-reprojecao-escala-sem-marca
commit: a815f6aa74ae696efa38e5440fbc3a3d2c5a875c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---

# QA: K-398, reprojeção da escala sem mudança não move a marca d'água (E7.438)

parecer: aprovado, sem achado. Testado em a815f6aa. Sem `CA-n` de UX (comando de dados); as obrigações são as do brief: `ac:reprojetar-escala` conta as linhas preenchidas pelo UPDATE; com zero não grava `ctl_coleta` nem contagens e devolve `coletaId: null`; com preenchimento segue como antes. Completa o K-397 para o `vm:preparar` não mover a data de referência do Acelerato.

## Diff contra a obrigação
Diff `e1c98633..a815f6aa` (3 arquivos): `reprojecao-escala.ts` (o INSERT em `ctl_coleta` desce para depois do laço; `preenchidos` soma `rowCount` do UPDATE; `preenchidos === 0` retorna antes de gravar `ctl_coleta` e contagens; `coletaId: number | null`), o unit `acelerato-reprojecao-escala.test.ts` e o pg `acelerato-escala-p.pg.test.ts`. `lerMarcaDagua` e a coleta incremental não aparecem no diff. Escopo bate com o brief.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Segunda reprojeção sem mudança: `ctl_coleta`, `ctl_coleta_contagem` e marca d'água (`lerMarcaDagua`) iguais, `coletaId: null` | pg `reprojeção: só onde nula… repetir não muda nada` | repetição, zero linhas preenchidas (relógio avançado 1 h para a data de referência mexer se gravasse) | passa |
| Com preenchimento, grava `ctl_coleta` e a marca aponta para a nova coleta | mesmo pg (1ª execução: `coletaId` não nulo e `marca1.coletaId == r1.coletaId`) | n/a | passa |
| UPDATE com `rowCount` 0 não grava `ctl_coleta` nem contagens e fecha com COMMIT | unit `K-398: UPDATE que não muda linha…` | rowCount 0 | passa |
| Lote só com prioridade fora do mapa, e sem chamado a preencher: nenhum INSERT em `ctl_coleta`, `coletaId: null` | unit (2 testes ajustados) | vazio, fora do mapa | passa |
| `coletaId: number \| null` compila | `tsc --noEmit` do servidor sem saída | n/a | passa |

## Provas
- Banco descartável (K-392), `bash scripts/test-pg.sh` (o `test:pg` com Postgres próprio) no head a815f6aa: `Test Files 51 passed (51)`, `Tests 347 passed (347)`. Inclui `acelerato-escala-p.pg.test.ts`. O rc do verde não foi capturado (saída passada por `tail`); a contagem acima só aparece com a suíte fechada.
- Vermelho antes do verde: mesma suíte pg com `reprojecao-escala.ts` restaurado da base (`git checkout e1c98633 -- server/src/modulos/acelerato/reprojecao-escala.ts`): rc=1, `Test Files 1 failed | 50 passed (51)`, `Tests 1 failed | 346 passed (347)`. A falha é `acelerato-escala-p.pg.test.ts > … repetir não muda nada`, `AssertionError: expected { coletaId: 5, lidos: 3, …(3) } to match object { coletaId: null, lidos: 3, …(3) }`: sem a correção a segunda reprojeção grava uma coleta nova. Fonte devolvida ao a815f6aa e árvore limpa (`git status` e `git diff a815f6aa` vazios). Feito à mão, não com `forge-testes --vermelho`, porque o pg depende do banco descartável do `test-pg.sh`.
- Unit: `vitest run tests/acelerato-reprojecao-escala.test.ts`: 1 arquivo, 5 testes passaram.
- Suíte inteira e CI: não rodei; sem PR para a branch, a suíte inteira fica para o CI do PR. O PQ do autor (pronto rc=0) não foi rerrodado. Este parecer não afirma CI verde.

## Bordas lidas
- `Number(r.rowCount)` soma só o que o UPDATE mudou (`escala_p IS NULL`); chamado já preenchido ou resultado nulo não conta, então a repetição fica em zero.
- Retorno antecipado dentro da transação: sai pelo caminho normal de COMMIT (conferido no unit), sem escrita pendente.
- Mudança de comportamento do retorno (`coletaId` nulo) só afeta quem lê o resultado; fora do diff nenhum chamador foi alterado e o `tsc` não acusa.

Sem achados: nenhum bloqueante nem recomendado.

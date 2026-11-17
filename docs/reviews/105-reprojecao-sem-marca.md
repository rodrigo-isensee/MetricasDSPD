---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-reprojecao-sem-marca
commit: abd6ce6f5f246512c8c6e36a74f5cc87755743e6
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: reprojeções do Acelerato sem mudança não gravam `ctl_coleta` (K-397, E7.409; review E7.414)

## Escopo lido
`git show abd6ce6f`, o único commit da branch sobre `fix/105-vm-criterios-ac`: `server/src/modulos/acelerato/reprojecao-etapas.ts`, `server/src/modulos/acelerato/reprojecao-fluxo.ts` e os quatro testes (`acelerato-reprojecao-{etapas,fluxo}.test.ts` e `.pg.test.ts`). Para conferir a equivalência, li `regravarIntervalos` (`projetor.ts:92-109`), `intervalosDasEtapas` (`etapas-sinteticas.ts:46-63`), o tipo das colunas (`ddl.ts:19`, `timestamptz(3)`) e as duas entradas que imprimem o resultado (`entradas/reprojetar-*-ac.ts`). Origem: decisão do dono de 2026-11-16 21:58 (opção A: a correção da data de referência vem no K-397).

Tamanho (M14): 129 linhas de código e teste (`git diff --numstat --no-renames origin/fix/105-vm-criterios-ac...abd6ce6f`), dentro da orientação, e um comportamento só.

## O que confere
- **`ac:reprojetar-fluxo`:** o `INSERT` em `ctl_coleta` desceu para depois do laço e só roda com `preenchidos > 0` (`reprojecao-fluxo.ts:48`). Nada no laço usava o `coletaId`, e o `UPDATE` continua só em `fluxo IS NULL`. Sem preenchimento, a transação lê e faz `COMMIT` sem escrita.
- **`ac:reprojetar-etapas`:** o `registrarCriterioD7528` subiu para antes do `ctl_coleta`, na mesma transação, sem efeito na atomicidade. Com versão já registrada, `compararComGravado` percorre os mesmos lotes e o mesmo filtro do laço de gravação (fechados, não excluídos, no recorte). Ela monta os intervalos com a mesma função e o mesmo calendário de `regravarIntervalos` e os compara como multiconjunto com `fato_etapa_chamado` dos mesmos ids, só lendo. Os chamados fora do filtro ficam fora dos dois caminhos, então a comparação cobre exatamente o que a regravação apagaria e reescreveria.
- **Precisão do tempo:** a coluna é `timestamptz(3)`, e a chave usa `getTime()` em ms dos dois lados. O `Date` do JS trunca o ms fracionário de `entradaPorHorasUteis` antes do `toISOString`, então o valor gravado e o recalculado batem. `saida` nula gravada vira `0` na chave e conta como mudança, o lado seguro.
- `motivo_pendencia`, `coletado_em` e `atualizado_por_coleta_id` ficam fora da comparação. A regravação grava `motivo_pendencia` nulo, e só o seed preenche a coluna, que `exigirEsquemaSemSeed` recusa antes.
- Reprojeção que muda linhas e versão nova seguem pelo caminho de antes: `ctl_coleta`, `DELETE` + `INSERT` por lote, `UPDATE` para `sucesso`.
- `coletaId: number | null`: as duas entradas só fazem `JSON.stringify` do resultado, e nenhum outro chamador lê o campo. `lerMarcaDagua` (`operacao/repositorio.ts:73-82`) e a coleta incremental não foram tocados, como pede o cartão.
- Regras invioláveis: nenhum dado de pessoa novo, nada do BusinessMap, nenhum histórico sobrescrito além do que a reprojeção já fazia.

## Verificações e ferramentas
- Suíte: sem PR para a branch, a suíte inteira fica para o CI do PR, e não afirmo CI verde neste head. Os dois `.pg.test.ts` foram ajustados mas não rodaram no autor (sem banco), como o brief registra: ficam para o CI do PR e para o QA.
- Rodei só os testes do item: `vitest run tests/acelerato-reprojecao-etapas.test.ts tests/acelerato-reprojecao-fluxo.test.ts`, `Tests 23 passed (23)`.
- Mutantes, um por guarda mudada, rodados nos dois testes unitários. Os sete foram mortos (`Tests N failed`):
  - M1: `if (!visto.mudou) return` virou `if (false)`. 2 falhas.
  - M2: `if (!versaoNova)` virou `if (true)`. 1 falha.
  - M3: sem o `atuais.length !== esperados.length`. 2 falhas.
  - M4: sem o `|| atuais.some(...)`. 1 falha.
  - M5: `if (!mudou)` virou `if (true)`. 1 falha.
  - M6: `if (preenchidos === 0) return` do fluxo virou `if (false)`. 2 falhas.
  - M7: a mesma guarda virou `preenchidos <= 1`. 2 falhas.
- O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.

## Achados
- A1 (recomendado) docs/devops/105-implantacao-vm.md:107 · O "Efeito colateral" ficou falso: reprojeção sem mudança não soma mais linha em `ctl_coleta` nem move a data de referência. Reescrever ou remover o item, aqui ou no PR da `fix/105-vm-criterios-ac`.
- A2 (recomendado) server/src/modulos/acelerato/reprojecao-etapas.ts:55 · Achada a mudança, `compararComGravado` segue recalculando os lotes só para contagens descartadas. Sair com `{ mudou: true }` no primeiro lote divergente e extrair a consulta do lote, duplicada com a do laço de gravação.
- A3 (recomendado) server/src/modulos/acelerato/reprojecao-etapas.ts:93 · O A3 do review do `vm:preparar` fica pela metade: a subida sem mudança não grava nem trava linha, mas ainda lê e recalcula a base inteira dos fechados a cada subida. Cabe no mesmo cartão de custo, se o dono quiser medir.

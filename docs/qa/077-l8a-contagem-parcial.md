---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l8a-contagem-parcial
commit: 50241b30c45bee9679fc24002de4051a8afe6c0a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-09
---
# QA: 077 lote 8a, contagemParcial no item de meses das tendências (E2.3, K-211)

Código testado: `50241b30` (merge da develop sobre `01877ac8`; código e testes em `4c60e099`, artefatos gerados em `01877ac8`). O HEAD `07736718` só soma o review. Obrigação: `docs/analises/077-desenho.md` ("Lote 8", P-077-5 = A confirmada em 2026-11-07 21:56). Sem alteração minha em código ou teste.

## Escopo
- Dentro: `contagemParcial(primeiroDiaDoMesIso, historicoDesde?)` em `core/series.ts`; marca `contagemParcial: { historicoDesde }` nos itens de `meses` das duas tendências, com `concluidos` e `volume` mantidos; schema aditivo e artefatos gerados.
- Fora: tela (8b), leitura do `historicoDesde` na carga, E2E e acessibilidade (sem mudança de tela, `web/` e `server/` sem diff).
- Escopo conferido contra o diff `54f02c42..01877ac8`: 12 arquivos, todos de `packages/`, `docs/api`, `docs/contratos`; `aceitas.json` sem diff (`"aceitas": []`).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Mês que começa no `historicoDesde` não é parcial; um dia depois é | `series.janela-incompleta.test.ts` "fronteira..." | igual ao limite e logo fora | passou |
| Ausente sem `historicoDesde` (função) | "historicoDesde ausente é falso" | campo ausente | passou |
| Fluxo: mês anterior marcado, `concluidos` numérico, mês do início sem marca, schema válido | `tendencia.test.ts` "fluxo: mês que começa antes..." | mês anterior e mês do limite | passou |
| Sustentação: idem (A1 do review: `volume` numérico no mês marcado) | "sustentação: idem" | mês anterior e mês do limite | passou; `volume` coberto por verificação minha em cópia (abaixo) |
| Sem `historicoDesde` nenhum mês leva a chave, nas duas tendências | "sem historicoDesde nenhum mês leva a marca" (`'contagemParcial' in m`) | campo ausente, chave com `undefined` | passou |
| Contrato aditivo: aceita ausente e presente nas duas tendências | `packages/contratos` `tendencia-janela.test.ts` | opcional | passou (guarda de regressão, ver vermelho) |
| `docs:check` verde, `aceitas.json` sem mudança | `pnpm run docs:check` no head | n/a | `ok (1096 páginas Markdown, 69 métricas, 2 eventos)` |
| BusinessMap e Acelerato sem mistura | leitura do diff: cada tendência lê o `historicoDesde` do próprio contexto | n/a | passou |

## Execução
- `packages/metricas`, `--maxWorkers=2`, `src/core/series.janela-incompleta.test.ts` e `src/tendencia.test.ts`: 38 passaram, 0 falharam.
- `packages/contratos`, `src/tendencia-janela.test.ts`: 6 passaram.
- Suíte completa: não rodei local; a CI do push no head `50241b30` (run 42571965393, citado no review) fechou `success`, e o lote não toca `web/` nem `server/`.

## Vermelho antes do verde
Cópia em `/tmp/claude-1000/qa-077-l8a/w` (sem `.git`): `packages/metricas/src` e `packages/contratos/src` na base `54f02c42`, com os três arquivos de teste do head. Resultado: 4 falham, 34 passam em `packages/metricas`.
- Falham: `contagemParcial` fronteira e ausente (`contagemParcial is not a function`), fluxo e sustentação da `tendencia.test.ts` (a marca não existe).
- Passam na base e no head, como guarda de regressão: "sem historicoDesde nenhum mês leva a marca" (a base já não emitia a chave) e o teste de contrato (o schema sem `.strict()` descarta a chave desconhecida em vez de recusar, então não distingue a base). O contrato aditivo se prova pelo `openapi.json`, pelos `.md` gerados e pelas fotografias, conferidos pelo `docs:check` verde.
- Nota: não usei `forge-testes --vermelho` (a cópia é por pacote, sem `.git`); a saída acima é do comando `vitest` na cópia.

## Mutação à mão (cópia descartável, cada mutante contra os 38 testes)
| Mutante | Resultado |
|---|---|
| M1 `<` por `<=` em `contagemParcial` | morto: fronteira, fluxo e sustentação (3 falham) |
| M2 trocar a guarda por `historicoDesde === undefined \|\| ... <` (sem `historicoDesde` marca tudo) | morto: 8 falham, entre eles "historicoDesde ausente é falso" e "sem historicoDesde nenhum mês leva a marca" |
| M3 só remover `historicoDesde !== undefined &&` | sobrevive, equivalente em tempo de execução: em JS `'2026-06-01' < undefined` é falso; a guarda existe para o tipo, e o TypeScript recusaria o mutante |
Nenhum sobrevivente que não seja equivalente.

## Verificação da A1 do review (cópia descartável, não vai ao repositório)
Na cópia, acrescentei ao caso da sustentação `typeof volume === 'number'` e `volume >= 0` no mês `2026-06` marcado: 3 passaram (os do bloco "contagem parcial"). Vale levar ao teste no próximo lote que tocar o arquivo.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) packages/metricas/src/tendencia.test.ts:468 · o caso da sustentação não afirma `volume` numérico no mês marcado; provei em cópia, levar ao teste no próximo lote que tocar o arquivo.

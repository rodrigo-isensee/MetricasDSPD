---
tipo: qa
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k174-insumos-carga
commit: e722029aacd63bb312f3cf016686ab5268579121
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: K-174 lote 1, feriados em número de dia no `ehDiaUtil`

**Veredito: aprovado.** Nenhum resultado muda (equivalência provada); o ganho é real, mas menor que o do autor e abaixo do limiar de 30% do plano (A1, recomendado, decisão do tech-lead). Classe C sem critérios `CA-n` de UX; as obrigações são as do plano `docs/analises/092-k174-plano.md` ("Como provar"). Base d8d52103, ponta e722029a, diff em `packages/metricas/src/core/calendario.ts` (37 linhas) e `calendario-equivalencia.test.ts` (213). Sem gatilho de segurança.

## Tabela obrigação, teste e resultado
| Obrigação (plano) | Teste ou prova | Fronteira protegida | Resultado |
|---|---|---|---|
| 1. Antigo e novo iguais bit a bit | `calendario-equivalencia.test.ts` (21 casos; 8 calendários, 1500 casos sorteados, `Object.is`) | feriado `2026-02-30` e `…T00:00`, turno invertido e fora de 0..1440, anos fora de 0..9999, dia fracionário | passou |
| 2. Suíte do `packages/metricas` com 100% de cobertura | `vitest run --coverage --maxWorkers=2` | ramos novos cobertos | passou |
| 3. Base mock idêntica | `e2e/scripts/hash-base-mock.mjs --salvar` na base, `--comparar` no head | n/a | passou |
| Calendário dono do seu `Set` | caso "é dono do seu conjunto" do teste de equivalência | mutação da origem depois de criar | passou |
| Efeito medido (≥30%, critério de parada) | medição abaixo | n/a | ganho menor, ver A1 |

## Execução (2 workers, R-TETO)
- `packages/metricas`, `TZ=UTC vitest run --coverage --maxWorkers=2`: `Test Files 45 passed (45)`, `Tests 1299 passed (1299)`; `Statements 100% (3629/3629)`, `Branches 100% (1820/1820)`, `Functions 100% (1293/1293)`, `Lines 100% (3035/3035)`.
- Base mock: no `calendario.ts` da base (restaurado depois), `--salvar`: `hashBase 68a67741`, `hashBusinessMap 4540bc56`, `hashAcelerato 0113e077`, 5792 cards, 6062 chamados. No head, `--comparar`: mesmos três hashes e `OK: base mock idêntica à linha de base.`
- A suíte inteira roda no CI do PR (cite o check-run `bateria` do mesmo sha quando existir); não rodei a suíte do repositório aqui.

## Mutação (restaurada com `git checkout` antes do commit; `git status` limpo)
- M1: `if (f.dias.has(dia)) return false` trocado por `f.dias.has(-1)` (feriado de um dia tratado como dia útil). Resultado: `Failed Tests 15` no teste de equivalência (`AssertionError: expected true to be false // Object.is equality`). Morto.
- M2: retirado o filtro de ida e volta (`if (isoDeDia(d) === f) dias.add(d)` virou `dias.add(d)`). Resultado: `Tests 3 failed | 18 passed (21)`. Morto.

## Vermelho antes do verde
O teste de equivalência é prova de não regressão contra a cópia do código antigo, não de regra nova; o vermelho é o das duas mutações acima (15 e 3 falhas), com o verde no head (21 de 21 dentro dos 1299).

## Tempo a frio do `carregarInsumos`
Processos novos (`tsx`, `carregarInsumos` cronometrado dentro do processo), `load average` da máquina em 2,6 a 2,7 (outros agentes em execução; sem carga artificial minha). Cinco rodadas intercaladas, base d8d52103 contra head e722029a, em ms:
- base: 1403, 1533, 1185, 1268, 1156 (mediana 1268)
- head: 1206, 1201, 1189, 1045, 1045 (mediana 1189), ou seja, cerca de −6%.
- Uma série anterior, em blocos de 5, deu base 1222 e head 1286 a 1393: ruído maior que o ganho.
- `geracaoMs` do `hash-base-mock.mjs`, cinco rodadas intercaladas: base 245, 261, 280, 237, 240 (mediana 245); head 200, 262, 180, 187, 165 (mediana 187), cerca de −24%.
Ordem de grandeza: o ganho existe e é na direção esperada (o gerador mais barato), mas não reproduzi os −34% do autor no `carregarInsumos`; fica abaixo do limiar de 30% do plano na minha máquina, com ruído. O estouro de `insumos.test.ts` sob carga (critério "gatilho" do plano) não foi reproduzido nem refeito aqui: não rodo teste sob carga artificial (R-TETO).

## Achados
- A1 (recomendado) packages/metricas/src/core/calendario.ts:219 · Ganho do `carregarInsumos` a frio medido pelo QA: mediana −6% (1268 para 1189 ms; mock −24%), abaixo do limiar de 30% do plano e dos −34% do autor. Tech-lead decide ajustar o limiar com justificativa ou pedir o lote 2.

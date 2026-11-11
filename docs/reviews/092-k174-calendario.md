---
tipo: review
contrato: 1
pedido: 092-melhorias-tecnicas-fila
branch: fix/k174-insumos-carga
commit: e722029aacd63bb312f3cf016686ab5268579121
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: 092-melhorias-tecnicas-fila, K-174 lote 1 (feriados em número de dia no `ehDiaUtil`)

Ponta revisada e722029a contra a develop d8d52103. Plano: `docs/analises/092-k174-plano.md`, opção A (lote 1) e "Como provar". Cartão K-174. Etapa E3.2.

## Achados

Nenhum.

## Parecer

Aprovado. Biblioteca compartilhada T2.5 (`packages/metricas/src/core/calendario.ts`) mais o teste de equivalência `calendario-equivalencia.test.ts`.

- **Nenhum resultado muda.** Para dia inteiro, `isoDeDia(dia) ∈ feriados` vale se e só se `dia ∈ dias` (só strings `AAAA-MM-DD` que fazem a ida e volta, logo `'2026-02-30'` e `'…T00:00'` continuam sem efeito; `isoDeDia` é injetora nos inteiros) ou `isoDeDia(dia) ∈ extras` (anos fora de 0..9999, inclusive negativos, cuja forma `00-1-…`/`10000-…` casa com `^[\d-]+-\d{2}-\d{2}$`). Dia fracionário segue o caminho antigo; NaN e infinito saem antes pelo `diaDaSemana`, como antes. Única fronteira não coberta: dia acima de ~3e23, onde o ano viraria notação exponencial; está muito além de `Number.MAX_SAFE_INTEGER`, onde `civilDeDias` já não é exato, e só divergiria com um feriado escrito nessa forma. Fora do domínio; sem achado.
- **Teste de equivalência:** cópia literal do `ehDiaUtil`, `horasUteisEntre` e `somarHorasUteis` antigos; 8 calendários (padrão, corrido, sem feriados, estranhos, turnos invertidos, fora de 0..1440, sobrepostos, fuso +330); dias de três faixas (inclusive virada 9999/10000), 1500 casos com `mulberry32` de semente fixa, inteiros e fracionários, comparados com `Object.is`; mais `diasUteisNoIntervalo`. O filtro de ida e volta e o conjunto `extras` têm asserção direta (2026-03-02 útil; 10000-01-01 feriado).
- **Cópia do `Set`:** `criarCalendario` faz `new Set(opcoes.feriados ?? FERIADOS_NACIONAIS)`; o teste "é dono do seu conjunto" muta a origem e prova que o calendário e o `ehDiaUtil` não mudam. `calendarioCorrido` reaproveita o mesmo `Set` (testado) e não consulta feriados.
- **`WeakMap`:** chave é o próprio `Set`; sai com o calendário no GC, sem vazamento. Não fica velho porque o calendário passa a ser dono do conjunto (tipo `ReadonlySet` e JSDoc de imutável); nenhum código de produção muta `cal.feriados` (procurei `.feriados.add/delete/clear`: nada). Calendários montados por requisição (`metricas/servico.ts:53`, `apontamento/servico.ts:107`, `projetor.ts:154`) pagam uma conversão de O(F) por calendário, compensada no primeiro laço de dias.
- **Servidor só ganha:** mesmo contrato e mesmos números; menos alocação por dia em `horasUteisEntre`, `somarHorasUteis` e no índice; memória de algumas dezenas de números por calendário.
- **Rodado aqui, 2 workers:** `packages/metricas` `vitest run --coverage --maxWorkers=2`: "Test Files 45 passed (45) · Tests 1299 passed (1299)"; cobertura "Statements 100% (3629/3629) · Branches 100% (1820/1820) · Functions 100% (1293/1293) · Lines 100% (3035/3035)". `tsc --noEmit -p .` sem erro. `prettier --check` nos dois arquivos: "All matched files use Prettier code style!"; `eslint` nos dois, sem saída.
- **Medidas do autor (citadas, não refeitas):** `carregarInsumos` a frio 1524 para 1004 ms (mediana de 10, −34%, acima do limiar de 30% do plano); `hash-base-mock --comparar` igual; pronto verde. A contagem do estouro sob carga antes e depois é do QA (E3.3).
- **Teto M14:** 250 linhas de código e teste (calendario.ts 37, teste 213); excedido por causa do teste de equivalência, com a cópia de referência do código antigo. O PR declara `teto: excedido, 250 linhas, teste de equivalência com a cópia literal do código anterior`. Um comportamento só.
- Segurança: sem gatilho (sem pessoa, banco, API, CI ou dependência). Regras invioláveis: cálculo continua na T2.5; sem mudança de critério, sem registro na T2.6.
- Pendência: suíte completa no CI do PR e QA do K-174 (E3.3).

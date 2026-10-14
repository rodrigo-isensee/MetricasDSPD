# IS-002 - Teste de desempenho do cálculo (C3) instável: O9 p95 de 327 ms contra o teto de 300 ms
- Severidade: baixa (instabilidade do portão, sem efeito no produto)
- Responsável sugerido: node-backend (`packages/mock/src/desempenho.test.ts`)
- Ambiente: main 0af552a (cópia limpa por `git archive`), Node 24.21, WSL 8 núcleos/8 GB, `pnpm run pronto`

## Passos para reproduzir
1. Numa cópia limpa da main, rodar `pnpm run pronto` três vezes seguidas com a estação compartilhada (load 1 min entre 5,8 e 8,8).
2. Observar `packages/mock pronto: src/desempenho.test.ts`.

## Resultado esperado
O teste mede CPU time com fator de calibração limitado a [1, 2] (ADR 0003, "Condições de medição"): deve passar sempre que o código não regrediu.

## Resultado obtido
Falhou 1 de 3 rodadas (a 2a): `O9 p95 de 20: expected 327.2950000000019 to be less than 300`. Nas outras duas rodadas e na rodada no worktree compartilhado, passou. Não houve mudança de código entre as rodadas.

CPU time não é imune a contenção num host com SMT/WSL: dois processos no mesmo núcleo físico disputam cache e unidades de execução, e o fator de calibração (medido uma vez no início) não acompanha picos durante a medição do O9. Com o teto em 2x, a margem do O9 sob carga é pequena.

## Evidência
Log `limpa-pronto-2.log` da execução (trecho):
```
packages/mock pronto:  FAIL  src/desempenho.test.ts > desempenho (ADR 0003) > cada métrica cabe no limite de CI: mediana a frio (5 contextos), mediana da 2a chamada e p95 de 20
packages/mock pronto: AssertionError: O9 p95 de 20: expected 327.2950000000019 to be less than 300
```
Como a rodada falhou no `mock`, o `pnpm -r` parou e o `web` nem rodou nela.

## Sugestão (para o dono decidir)
Recalibrar perto da medição de cada métrica (ou usar a mediana de várias calibrações) em vez de uma calibração única; não aumentar o teto às cegas (o teto é o que pega regressão real).

## Correção
Correção: 10765a8 (teste de perf do server: CPU time e melhor de 3 rodadas; o caso do packages/mock não foi alterado aqui)

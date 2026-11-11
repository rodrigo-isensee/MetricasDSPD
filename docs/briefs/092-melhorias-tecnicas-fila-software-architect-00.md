## Objetivo
Plano do K-174: o `carregarInsumos` de `tools/docs-contratos` leva de 0,9 a 1,4 s a frio e estoura o timeout de 5 s de um teste sob carga. O perfil da segunda tentativa (Histórico do pedido 092, 11:17) pôs o custo na biblioteca compartilhada de tempo (`packages/metricas/src/core/calendario.ts`: `horasUteisEntre`, `diaDeIso`, `ehDiaUtil`, cerca de 300 ms dos 500 ms do cálculo das métricas) e no `gerarBaseMock` de `packages/mock` (cerca de 210 ms). A biblioteca é a T2.5, compartilhada com o servidor.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/092-melhorias-tecnicas-fila.md`, entradas de 09:22 e 11:17.
- Na develop atual (pasta principal): `packages/metricas/src/core/calendario.ts` e quem chama essas funções; `packages/mock/src` (o `gerarBaseMock`).

## Entregar
- "E3.5 (software-architect): plano do K-174: tornar mais barato o cálculo de tempo da biblioteca compartilhada (packages/metricas/src/core/calendario.ts: horasUteisEntre, diaDeIso, ehDiaUtil) e o gerarBaseMock, sem mudar nenhum resultado, com o efeito no servidor e a forma de provar; só leitura, parecer em docs/analises/, sem commit." (E3.5)
- (E3) (E3.5) Plano curto em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` (novo), pela ferramenta Write: onde está o custo e por quê; opções (por exemplo memoização por dia e calendário, pré-cálculo dos dias úteis do intervalo, ou mudar só o teste), com o ganho esperado, o risco de mudar resultado (percentis, Monte Carlo, horas úteis), o efeito no servidor e na memória; a opção recomendada e como provar que nenhum número muda (testes existentes com 100% e comparação das páginas geradas). Regra de negócio em dúvida vira pergunta ao dono, não decisão. Sem commit nem push.
- (E1) (E2) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/analises/092-k174-plano.md

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` · espera: rc=0

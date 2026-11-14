---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-a3-o25-descarte
commit: 71f8b4f05161b9cae9c6ff0c9a316bbcf7d8999c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: A3 do pedido 099, O25 Descarte com dado real (E3.44)

## Achados
- A1 (recomendado) server/tests/o25-real-a3.pg.test.ts:79 · o caso (b) depende dos 5 descartes que o (a) grava e, rodado sozinho, pode ter n = 0. Mover o UPDATE para o beforeAll ou comentar a dependência. A data é robusta à semente (ver Conferência).
- A2 (recomendado) packages/contratos/src/origem.ts:63 · os comentários das linhas 63 e 87 e docs/api/metricas.md:220 ainda dizem que o O25 é mock ("O19 a O26 seguem mock", "status mock"). Trocar por "O20 a O24 e O26". É só texto.

## Sondas

## Conferência do molde (§3 de `docs/analises/099-dado-real-operacional.md`, linhas A3 e OP-9)
- **Item 2, portão:** o O25 entra em `METRICAS_ORIGEM_REAL` (`origem.ts:25-26`). Não estava em `MOTIVO_ORIGEM_MOCK`, que só lista O8, O12, O14 a O18 e o S, então não há o que tirar de lá. O repositório não muda: `repositorio.ts:56` já lê `arquivado_em` e `motivo_descarte` para as outras métricas reais, e o `calcularO25` é o mesmo.
- **Item 2, `.pg`:** (a) mede antes e depois de gravar descartes no formato que a coleta grava (`motivo_descarte` + `arquivado_em`) e confere que `k` e `n` sobem do mesmo tanto, com `porMotivo` nulo (CA-44) e percentil por tipo só com `n >= 20`. (b) confere `insuficiente`, `minimo` 20 e nenhum `pct` num dia com menos de 20 encerrados. (c) confere que nenhum campo de pessoa aparece, nem o texto do motivo (o marcador `Motivo-sigiloso-A3`) nem `Pessoa N`. A leitura é feita pelo papel `dspd_api`, com o GRANT por coluna. `docs/api/metricas.md` foi atualizado.
- **Item 3, versão de critério:** não é devida. A regra e a fonte não mudam e o diff não toca `packages/metricas`.
- **Item 4, front:** sem mudança, porque o DTO é o mesmo. O catálogo e o COMP-12 contam "Real" a partir de `origemDaMetrica`, sem número fixo por origem (65 no total). A G3 (`e2e/tests-api/sem-dado-real-099.spec.ts`) usa stub para todas as métricas e não depende do mapa.
- **Data do caso (b) (A1):** a semente é fixa (`CONFIG_PADRAO.hoje` = 2026-10-09, `packages/mock/src/config.ts:12`). 2026-09-20 é um domingo dentro das 12 semanas, e `n` fica entre 1 e o que a semente encerra nesse dia mais 5, longe de 20. O instante 15:00Z cai no mesmo dia em UTC-3. Hoje o caso passa porque o vitest roda os casos do arquivo em sequência.
- Regras invioláveis: só BusinessMap, nenhuma avaliação individual, abaixo de 20 não publica e nenhum dado de pessoa. Sem gatilho de `R-SEGURANCA`: não há migração nem coluna nova, e a leitura já tinha GRANT.

## Execução (Revisar-sha 71f8b4f0)
- `packages/contratos`: `vitest run src/origem.test.ts`: `Tests 15 passed (15)`.
- `server`: `vitest run tests/painel-real-f6.test.ts tests/qa-f6-painel.test.ts tests/o25-real-a3.pg.test.ts`: `45 passed | 3 skipped`. Os 3 casos pulados são o `.pg`, que fica sem `url` local e roda no CI, como o brief pede.
- Tamanho: 6 arquivos, +104 -4, abaixo de 150 linhas. Um comportamento só.

## Parecer
Aprovado sobre 71f8b4f0 (base develop d9f32012). O lote segue o molde: o O25 passa a real, sem cálculo próprio, sem critério novo e sem campo de pessoa. A1 e A2 são recomendados e não bloqueiam. O commit `feat(metricas): O25 Descarte com dado real (099, lote A3)` é limpo.

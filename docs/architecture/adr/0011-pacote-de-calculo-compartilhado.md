# 0011 - Pacote de cálculo compartilhado (`@metricas-dspd/metricas`)
Estado: vigente
- Status: aceita
- Data: 2026-10-10
- Relacionadas: ADR 0001 (origem no front), ADR 0002 (fronteiras e exports do pacote), ADR 0003 (orçamento de cálculo), ADR 0004 (o banco seleciona, a biblioteca calcula), ADR 0007 (DTOs e paridade); briefing T2.5, T2.6; `docs/architecture/regras-metricas.md`

## Contexto
O briefing (T2.5) exige que todo cálculo de tempo, percentil e Monte Carlo passe por uma biblioteca única. Hoje o mesmo cálculo precisa rodar no front com mock (`MockFonteMetricas`) e no servidor do 002 sobre o MySQL, com resultado idêntico. As decisões estavam espalhadas: estrutura e fronteiras na ADR 0002, regra "SQL não calcula" na ADR 0004, paridade na ADR 0007. Esta ADR consolida o contrato do pacote; o detalhe de exports e lint continua na ADR 0002.

## Decisão
1. **Um pacote, dois consumidores.** `@metricas-dspd/metricas` é a única implementação de cálculo. `web/` o usa via mock; `server/` o usa sobre as linhas que o SQL seleciona. Nenhum outro módulo calcula horas úteis, percentil, mediana, taxa publicada ou previsão.
2. **TypeScript-fonte, sem build próprio.** Consumido como `.ts` pelos workspaces (Vite no front, `tsx`/build do servidor). Sem dependência de runtime além de `@metricas-dspd/contratos`.
3. **Funções puras e determinísticas.** Proibido ler relógio (`Date.now()`, `new Date()` sem argumento) e usar `Math.random`. O "agora" entra como parâmetro (`hoje`/`agoraMs`); `new Date(ms)` só para formatar instante já recebido. Aleatoriedade, quando houver, vem de PRNG semeado e injetado. Imposto por lint (`no-restricted-globals`/`no-restricted-syntax`) no pacote.
4. **Calendário como parâmetro.** Expediente, feriados e fuso entram por `Calendario` (`criarCalendario`), nunca por constante global; `calendarioCorrido` cobre métricas em dias corridos. Mudança de calendário é mudança de critério (T2.6).
5. **Regras como dados: matriz `REGRAS_METRICA`** (`core/regras.ts`). Domínio, segmentação, ordem, arquivados, mínimo de 20, granularidade e referência ao briefing por métrica. Os testes de propriedade iteram a matriz; célula sem resposta no briefing vale `'pendente-usuario'` e não é preenchida por inferência.
6. **Monte Carlo previsto, não implementado.** `core/montecarlo.ts` reserva a assinatura (`preverTermino`) e lança erro; entra com T6/E5, com PRNG injetado, amostra de vazão de um único domínio e uma única granularidade, e mínimo de 20.
7. **Paridade mock × API.** Mesma semente e mesmo `hoje` geram a base do seed (ADR 0005) e o mock; o teste de paridade (D15, job `db` da ADR 0010) compara os DTOs do `MockFonteMetricas` com os da API. Divergência quebra o CI.

## Alternativas consideradas
- **Calcular no SQL (views/procedures).** Rápido para agregados simples. Contras: duplica a lógica do mock, horas úteis e percentis com calendário ficam ilegíveis em SQL, viola T2.5. Descartada (ADR 0004).
- **Cálculo só no servidor; front sem mock calculado.** Uma implementação a menos de consumidor. Contras: o front perde o modo mock (ADR 0001) até a API existir e a paridade deixa de ser testável. Descartada.
- **Pacote compilado (dist + d.ts).** Isola consumidores. Contras: build extra, source maps e watch para um pacote interno; nenhum consumidor externo. Descartada; revisitar se surgir consumidor fora do monorepo.

## Consequências
- Mais fácil: mock e produção dão o mesmo número por construção; regras do briefing viram testes executáveis; determinismo torna testes e snapshots estáveis.
- Mais difícil: todo chamador precisa montar e passar `hoje` e `Calendario`; nova métrica exige linha na matriz antes do código.
- Riscos: custo de CPU do cálculo em memória no servidor (orçamento A1–A3/M1, ADR 0003); paridade falsa se seed e mock divergirem de semente (mitigado: semente vem do mesmo hash).

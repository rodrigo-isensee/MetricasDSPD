---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l6a-ressalva-s2
commit: a8d3fa67dcb31b36f0e50f72471ca912bba64ac9
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 6a, a tendência de SLA leva a ressalva do S2 (K-211, E2.2)

Diff lido: `852b9406...a8d3fa67` (8 arquivos, 51 adições e 3 remoções; código e testes em `19cdbde6`, artefatos gerados em `a8d3fa67`), contra `## 4. Contrato` e `## Lote 6a` de `docs/analises/077-desenho.md` e contra o A7 de `docs/analises/077-desenho-revisao-tech-lead.md`.

## Parecer
**Aprovado.** Faz o que o lote pede; o único desvio declarado (a ligação no serviço) fica aceito, pelo motivo abaixo.

- **Contrato (§4):** `notas: z.array(notaSustentacaoIdSchema).optional()` no fim de `resultadoTendenciaSust` (`schemas.ts:1375-1376`), campo opcional novo, classe aditiva. Mesmo enum de ids do S2 (`ajuste-prioridade-sem-dado-real`, `excecao-sla-sem-fonte`); os textos seguem em `origem.ts`, sem cópia.
- **Sem entrada em `aceitas.json`:** `docs/contratos/snapshots/aceitas.json` sem diff. `docs:check` verde (rodado aqui: `ok (1066 páginas Markdown, 69 métricas, 2 eventos)`).
- **Artefatos à parte:** `openapi.json`, `TENDENCIA_SUST.md` (bloco gerado e data de revisão) e a fotografia `snapshots/resultados/TENDENCIA_SUST.json` só no commit `a8d3fa67`, uma fotografia como o §4 prevê.
- **Ramo `TENDENCIA_SUST` sem regra nova:** `parte-sem-dado.ts:46` junta o id ao mesmo `comNotaSust(r, 'excecao-sla-sem-fonte')` do S2; nenhum dado recalculado, nota sem repetição (o `comNotaSust` já deduplicava).
- **Desvio em `servico.ts` (aceito):** a constante `METRICAS_COM_AJUSTE_DE_PRIORIDADE` (`servico.ts:44`) troca o `id === 'S3' || id === 'S2'` e acrescenta `TENDENCIA_SUST` à mesma condição (`real && !AJUSTE_PRIORIDADE_COM_FONTE`, `servico.ts:322`), que é a "mesma condição do S2" do Lote 6a. Mantenho: sem a ligação, o ramo novo da função seria código que nada chama até o Lote 7; com ela, o efeito hoje é nulo, porque a `TENDENCIA_SUST` fora do mapa real volta em `sem-dado-real` (`servico.ts:268`) antes do cálculo, e o Lote 7 só acrescenta o id em `origem.ts` e prova de ponta a ponta (CA-8). Segue o molde de `METRICAS_SEM_AGENTE` e `METRICAS_COM_PARTE_DE_BLOQUEIO`. São 3 linhas a mais e 1 a menos, dentro do teto.
- **Testes (A7):** função pura em `painel-real-f6.test.ts:468-474`: nota presente para a `TENDENCIA_SUST`, `meses` intacto, sem repetir na segunda chamada, e `TENDENCIA_FLUXO` e `S4` devolvidos sem mudança (o mesmo objeto). Schema em `tendencia-janela.test.ts:72-83`: sem `notas` passa, id válido passa, id fora do enum é recusado. A ausência da nota quando a fonte existir é a condição do serviço, que fica com a prova do Lote 7.
- **Fora do diff, como pedido:** `web/`, `packages/contratos/src/origem.ts` e `server/migrations` sem diff.

## Ferramentas
- CI do push no head `a8d3fa67`: run 42364347274, `CI`, `completed`, `success` (`gh run list --branch`). Lint, tipos e cobertura cobertos por ela; não refeitos.
- Testes dos arquivos tocados, 2 workers: `packages/contratos/src/tendencia-janela.test.ts` 5 verdes; `server/tests/painel-real-f6.test.ts` 34 verdes.
- `pnpm run docs:check`: ok.

## Teto M14
28 linhas de código e teste (`schemas.ts` 2+0, `tendencia-janela.test.ts` 13+0, `parte-sem-dado.ts` 2+1, `servico.ts` 3+1, `painel-real-f6.test.ts` 6+0); 54 com os artefatos gerados, que ficam fora da conta. Um comportamento só.

## Achados
- A1 (recomendado) server/src/modulos/metricas/parte-sem-dado.ts:36 · o comentário de contrato de `semParteDeAjusteDePrioridade` ainda cita só S3 e S2; acrescentar a `TENDENCIA_SUST` (pedido 077, L6a) no próximo lote que tocar o arquivo, sem volta só por isso.

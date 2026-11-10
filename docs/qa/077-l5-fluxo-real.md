---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l5-fluxo-real
commit: e980596ee86020638853237ccb3eff63e4892b77
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: 077 lote 5, TENDENCIA_FLUXO no mapa real (E2.3, K-211)

Código testado: `e980596e` (o HEAD `e5f4d35c` só soma o review em `docs/reviews/`). Obrigações: `## Lote 5` de `docs/analises/077-desenho.md`, A8, A9, A11, A12 e A14 da revisão do desenho, ADR 0003 (A1, C3). Sem alteração minha em código ou teste: reversões e mutantes da rodada completa (sobre `e751242b`) foram feitos à mão e restaurados.

## Revalidação incremental
`forge-check parecer delta` (intervalo `e751242b..e5f4d35c`, sem o que veio da `develop`) lista uma só mudança no meu domínio: `packages/metricas/src/core/criterios.ts`, id e data da constante `VERSAO_CRITERIO_TENDENCIA_FLUXO_DADO_REAL` de `2026-11-09` para `2026-11-10`. Nada mais em código ou teste; o resto do parecer da rodada completa segue valendo.

Execução (Node 24.22.1, `TZ=UTC`, `--maxWorkers=2`, worktree no HEAD `e5f4d35c`, conteúdo de código igual a `e980596e`):
- `server/tests/tendencia-fluxo-real-l5.test.ts` e `server/tests/qa-f6-painel.test.ts`: 2 arquivos, 12 testes passaram (6 + 6).
- `packages/metricas/src/businessmap/e7.test.ts` (único teste do pacote que cobre `VERSOES_DA_BIBLIOTECA`): 13 passaram.
- Marca da virada com a data nova: o teste do lote compara com a constante, então conferi o literal à parte: cópia temporária do teste (`server/tests/zz-qa-data.test.ts`, removida; `git status` limpo) com `id: 'criterio-2026-11-10-tendencia-fluxo-dado-real'` e `data: '2026-11-10'` escritos à mão no `toContainEqual` de `criterios.serie`/`criterios.janela`: passou. A constante em `criterios.ts:139-140` traz os mesmos valores.
- Suíte completa: não rodei local. Prova a citar é o check-run `bateria` do sha do PR (I5), que o tech-lead confere; o run 42818122127 citado antes foi sobre `e751242b`, anterior a este head.

## Escopo
- Dentro: `TENDENCIA_FLUXO` em `METRICAS_ORIGEM_REAL` (e fora da simulação), constante da virada do BusinessMap, guarda A14 (`sem-dado-real` sem carga inicial com sucesso), prova de rota com `historicoDesde = 2026-07-01` e `dataReferencia = 2026-12-01`, `contagemParcial` (8a) pela rota.
- Fora: tela (L3/L4), `TENDENCIA_SUST` (Lote 7), E2E e acessibilidade (sem mudança de tela; `web/` sem diff), Postgres real.
- Escopo conferido contra o diff: nada além do Lote 5.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Junho a agosto com `janelaIncompleta` (sem estatística) e setembro a novembro publicados, no mesmo resultado, pelo schema | `tendencia-fluxo-real-l5.test.ts` "janela incompleta e mês publicado..." | mês logo antes e logo depois da janela de 12 semanas; `historicoDesde` | passou |
| Tipo com 19 entregues `insuficiente` num mês publicado | "tipo com 19 entregues sai insuficiente" | 19 (mínimo - 1) | passou |
| BusinessMap e Acelerato não se misturam | "dado do Acelerato não altera o resultado" | n/a | passou (nota 1) |
| `contagemParcial` no mês anterior ao histórico; mês que começa no histórico sem marca | "o mês que começa antes do histórico leva contagemParcial" | igual ao limite e logo fora | passou |
| Sem carga inicial com sucesso: `sem-dado-real`; com carga segue | "sem carga inicial com sucesso responde sem-dado-real..." | carga ausente | passou |
| Marca da virada em `criterios` (id e data 2026-11-10) | "a marca da virada aparece em criterios" + conferência do literal | n/a | passou |
| Id no mapa real e nunca simulável | `packages/contratos/src/origem.test.ts`, `qa-f6-painel.test.ts` | lista exata de ids | passou |
| Modo mock explícito não cai na guarda | `api.sistemico-intensivo.test.ts` (suíte) | modo mock | passou (ver A1) |

Nota 1: com o código do lote revertido o teste do Acelerato continua passando; a separação está em `dominioDe('TENDENCIA_FLUXO')` (`servico.ts:273`, `ac` é `null` para domínio `businessmap`).

## Vermelho antes do verde e mutação (rodada completa, sobre `e751242b`)
Com o código do lote revertido à base e os testes mantidos: `server` 6 falharam e 6 passaram; `origem.test.ts` 2 falharam e 15 passaram. Mutantes M1 a M7 (guarda A14, `modoMock`, `historicoDesde`, mapa real, constante em `VERSOES_DA_BIBLIOTECA`, `afeta`): todos mortos; M4 só pela suíte do `server` (A1). A mudança deste incremento é só id e data de uma constante, sem lógica nova; a revalidação não pede mutante novo.

## Latência (R3 do desenho, A1 e C3 da ADR 0003)
Medida na rodada completa, sem Postgres: primeira consulta sobre 18.324 cards em 268 a 290 ms (limite 300 ms), seguintes 6 a 12 ms; app novo a cada chamada chegou a 301 ms. Não medido contra o Postgres real nem o C3 em CPU time. Ver A2; não bloqueia.

## Bugs
Nenhum aberto.

## Achados
- A1 (recomendado) server/tests/tendencia-fluxo-real-l5.test.ts:98 · nenhum teste do lote cobre o modo mock explícito (M4 só cai na suíte, `api.sistemico-intensivo`); um caso com `modoMock` e sem carga, esperando 200, trava a guarda no lote.
- A2 (recomendado) server/src/modulos/metricas/servico.ts:275 · a primeira chamada com 18 mil cards mediu 268 a 290 ms (A1 = 300) sem Postgres; medir contra a base real na homologação e, se passar de 300, pré-calcular na carga (ADR 0019).
- A3 (recomendado) packages/metricas/src/core/criterios.ts:140 · o teste da marca compara com a própria constante e não pega data errada; um literal de id e data no teste travaria a virada de 2026-11-10 (conferi à mão, passou).

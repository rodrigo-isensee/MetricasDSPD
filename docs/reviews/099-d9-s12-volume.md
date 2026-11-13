---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d9-s12-volume
commit: fac4c624516c28d2b9d12358e13bbf9b7dc0d889
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Code review: D9 do 099, S12 no mapa real só com o volume (E3.73)

Diff lido: `git diff 4c4a7a33...fac4c624` (21 arquivos, 5 commits: `d86d33d3`, `970258a4`, `e80e647a`, `b3bac117`, `fac4c624`), classe N. O aceite do QA corre em paralelo e não foi tocado.

## Ferramentas (citadas, não refeitas)
- Testes dos arquivos tocados, sem banco: `packages/contratos` `vitest run src/origem.test.ts src/cartoes.test.ts` (33 testes), `packages/metricas` `vitest run src/complementares.test.ts` (21), `server` `vitest run tests/painel-real-f6.test.ts tests/qa-f6-painel.test.ts` (47), `web` `vitest run src/features/complementares/leitura-s12.test.ts` (3): todos passaram.
- Typecheck de `contratos`, `metricas`, `server` (`tsc --noEmit`) e `web` (`tsc -b`): verde.
- Os `.pg` (`painel-real-f6.pg.test.ts`, `qa-sust-real.pg.test.ts`) e o e2e (`complementares.spec.ts`) não rodaram aqui: são do CI do PR. Lidos.

## Conferência
- **Mapa de origem:** `S12` entra em `METRICAS_ORIGEM_REAL` e sai de `MOTIVO_ORIGEM_MOCK` e de `COM_EXTENSAO_MOCK`; catálogo com S12 `disponivel`. Os testes que fixam a lista de reais e de sem-dado (contratos, servidor, `.pg`, e2e `MOCK`) acompanham a mudança; o teste de ausência do e2e foi relido (o S12 saiu do conjunto e o comentário diz por quê).
- **Sem zero falso:** a biblioteca devolve `excecaoSla: null` sem extensão (a coluna real nasce `false` e não distingue "não" de "sem fonte"); o servidor só acrescenta a nota (`comNotaS12SemFonte`, publicação pura, idempotente, só para o S12, só no modo real). Os dois ramos da guarda (`ext === undefined`) têm teste de comportamento (`ctxSemExt` nulo e `ctxMock` com taxa) e a função do servidor tem os três ramos provados (outra métrica, taxa viva, nota já presente).
- **T2.5 e T2.6:** nenhum cálculo novo fora da biblioteca; versão de critério `criterio-2026-11-12-s12-volume-real` com `afeta: ['S12']` em `VERSOES_DA_BIBLIOTECA`.
- **Regras invioláveis:** só Acelerato, por sistema e nunca por pessoa; nada de estatística nova abaixo de 20; modo mock explícito inalterado (taxa e sem nota, provado).
- **Contrato:** nota em enum próprio (`NOTA_S12_IDS`), sem crescer o enum da sustentação (S2, S3 e tendência intactos, provado em `origem.test.ts`). `excecaoSla` nulável e `notas` opcional, `openapi.json`, `docs/contratos/metricas/S12.md` e fotografia regenerados; `aceitas.json` vazio no head (o `fotografias.ts` confronta o schema com a fotografia da própria branch, então `docs:check` passa).
- **Decisão: aceite de `resultados/S12` sem v2.** Aprovado. A mudança é incompatível (campo obrigatório não nulo passa a nulável), mas o único consumidor é a web, no mesmo deploy, e ela já lê a exceção nula desde `d86d33d3`, na mesma branch; não há consumidor externo da rota. Mesmo caso do S1 no PR 364 (E3.53). Um `/api/v2` duplicaria rota, schema e fotografia sem nenhum leitor para proteger. O registro fica em `docs/api/metricas.md` e no corpo do PR (A4).
- **Tamanho (M14):** 198 linhas de código e teste (`git diff --numstat --no-renames`, fora `.md`, `openapi.json` e a fotografia gerada); 503 com tudo. Um comportamento (S12 real só com o volume, ponta a ponta: biblioteca, contrato, servidor, web, catálogo). Acima de 150: o PR traz `teto: excedido, 198 linhas, contrato + biblioteca + servidor + web do mesmo campo nulável, indivisíveis sem quebrar o S12`.
- **Commits:** Conventional Commits em português, um por passo; cada um com o cartão.

## Achados
- A1 (recomendado) web/src/features/complementares/sustentacao.tsx:315 · O `CartaoS12` não passa `notasDoCartao={d?.notas}` ao `CartaoComplementar` (como fazem `CartaoS2` e `CartaoS3`): o texto de `TEXTO_NOTA_S12` vai na API e nunca aparece; a pessoa só vê "campo sem fonte" na leitura. Passar as notas, ou registrar que a leitura basta e então a nota é só contrato.
- A2 (recomendado) web/src/features/complementares/sustentacao.tsx:303 · `R12Leitura` ficou redundante: com o contrato nulável no head, `R12['excecaoSla']` já inclui `null`, e o comentário ("o tipo local já aceita antes da mudança") descreve um estado intermediário da branch. Tirar o tipo e usar `R12`.
- A3 (recomendado) packages/metricas/src/acelerato/s12.ts:92 · A exceção nula depende da ausência da extensão da reincidência (`ext`), não de uma fonte própria do campo `excecao_sla_registro_posterior`. Hoje coincidem; quando a coleta trouxer um campo sem o outro, a guarda erra calada. O comentário da função diz isso em parte; vale cartão para separar as duas fontes quando a coleta da exceção for desenhada.
- A4 (recomendado) docs/contratos/metricas/S12.md:271 · O exemplo gerado ("base fictícia") mostra `excecaoSla: null`, enquanto o modo mock da API devolve a taxa. O exemplo pode ficar se o corpo do PR disser que ele é o ramo sem extensão. O corpo do PR também traz a linha de contrato incompatível de `resultados/S12` com o aceite sem v2 e o hash, como no PR 364.

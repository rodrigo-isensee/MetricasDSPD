---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d9-s12-volume
commit: 57c74bc3707397b9d1d255969fd3b92b7752d4c0
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

## Revalidação por delta (E3.85, volta 1 da web)
Delta lido: `forge-check parecer delta docs/reviews/099-d9-s12-volume.md`, intervalo `fac4c624..047f9d60`, no domínio só a web: `catalogo/CatalogoPage.tsx`, `catalogo/catalogo.test.tsx`, `catalogo/linhas.ts`, `complementares/comuns.tsx`, `complementares/notas.ts`, `complementares/ramos.test.tsx` e `complementares/sustentacao.tsx`. Contrato, biblioteca e servidor não mudaram.
- **ALTO-1 (UX) e A1 deste parecer resolvidos:** com `excecaoSla === null` o `CartaoS12` mostra a nota em bloco fixo (`nota-S12-excecao-sla`), com o texto de `TEXTO_NOTA_S12` do contrato (fonte única), sem duplicar o texto na web. Os dois ramos têm teste de comportamento (nula com a nota; taxa informada sem a nota).
- **ALTO-2:** `CampoSemFonte` ganha `texto` opcional, com o texto antigo como padrão (os outros cartões não mudam); o S12 diz que só a reincidência está sem fonte e que o volume é real. O teste afirma o texto novo e a ausência de "nada é publicado". O e2e COMP-12 (`campo-sem-fonte-S12` com contagem 0) roda no mock, onde `campoDisponivel` é verdadeiro: segue certo.
- **MÉDIO-1 e MÉDIO-2:** cuidados do S12 em `notas.ts`; anotação "Parcial" como campo opcional `anotacao` em `LinhaCatalogo`, sem terceiro valor em `dados` (o tipo continua `'Real' | 'Sem dado real'`), provada na linha do S12 do catálogo.
- **Regras invioláveis:** só texto e apresentação; nenhum cálculo, nenhum dado simulado, nada por pessoa.
- **Ferramentas:** `vitest run src/features/catalogo/catalogo.test.tsx src/features/complementares/ramos.test.tsx src/features/complementares/leitura-s12.test.ts` em `web/`: 3 arquivos, 30 testes, passaram. `tsc -b` verde; `eslint src/features/catalogo src/features/complementares` sem saída. Suíte inteira e e2e no CI do PR.
- **Tamanho:** o delta soma cerca de 50 linhas de código e teste ao lote; o teto do PR é recontado pelo `git diff --numstat` no corpo.
- A2 a A4 seguem como estavam (recomendados, sem efeito no comportamento). A5 novo, recomendado.

## Revalidação por delta (E3.90, integração da develop)
Delta lido: `forge-check parecer delta docs/reviews/099-d9-s12-volume.md`, intervalo `047f9d60..57c74bc3`, sem o que veio da base. No domínio: `docs/api/metricas.md`, `packages/contratos/src/origem.ts`, `packages/contratos/src/origem.test.ts`, `server/tests/painel-real-f6.test.ts` e `server/tests/qa-f6-painel.test.ts`. É só a resolução da integração (`8d8b4739`) e a atualização da fila (`57c74bc3`, C8a vindo da develop).
- **Conflito resolvido certo:** o O25 do A3 (já aprovado em `docs/reviews/099-a3-o25-descarte.md`) entra em `METRICAS_ORIGEM_REAL` ao lado do S12 do D9, e nenhum dos dois se perdeu. Nos três testes, as listas de reais ficam com O25 e S12 juntos, e o O25 sai da lista de complementares sem dado em `qa-f6-painel.test.ts`. A linha do O25 em `docs/api/metricas.md` é a do A3, sem texto novo.
- **Regras invioláveis:** nenhum cálculo novo, nenhuma métrica além das duas já revisadas; Acelerato e BusinessMap seguem separados (O25 só BusinessMap, S12 só Acelerato).
- **Ferramentas:** `packages/contratos` `vitest run src/origem.test.ts` (16 testes) e `server` `vitest run tests/painel-real-f6.test.ts tests/qa-f6-painel.test.ts` (47 testes): passaram. Os `.pg`, a suíte inteira e o e2e ficam no CI do PR 370.
- A1 a A5 seguem como estavam (recomendados). Nenhum achado novo.

## Achados
- A1 (recomendado) web/src/features/complementares/sustentacao.tsx:315 · O `CartaoS12` não passa `notasDoCartao={d?.notas}` ao `CartaoComplementar` (como fazem `CartaoS2` e `CartaoS3`): o texto de `TEXTO_NOTA_S12` vai na API e nunca aparece; a pessoa só vê "campo sem fonte" na leitura. Passar as notas, ou registrar que a leitura basta e então a nota é só contrato.
- A2 (recomendado) web/src/features/complementares/sustentacao.tsx:303 · `R12Leitura` ficou redundante: com o contrato nulável no head, `R12['excecaoSla']` já inclui `null`, e o comentário ("o tipo local já aceita antes da mudança") descreve um estado intermediário da branch. Tirar o tipo e usar `R12`.
- A3 (recomendado) packages/metricas/src/acelerato/s12.ts:92 · A exceção nula depende da ausência da extensão da reincidência (`ext`), não de fonte própria da exceção; quando a coleta trouxer um campo sem o outro, a guarda erra calada. Cartão para separar as duas.
- A4 (recomendado) docs/contratos/metricas/S12.md:271 · O exemplo gerado mostra `excecaoSla: null` e o mock da API devolve a taxa; o corpo do PR diz que é o ramo sem extensão e traz a linha de contrato incompatível de `resultados/S12` com o hash.
- A5 (recomendado) web/src/features/complementares/sustentacao.tsx:368 · O padrão `['excecao-sla-s12-sem-fonte']` quando `notas` vem vazio não tem teste (o caso novo manda a nota). Um caso com `notas: undefined` e exceção nula fecha o ramo.

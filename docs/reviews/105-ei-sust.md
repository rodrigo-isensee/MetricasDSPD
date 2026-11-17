---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ei-sust
commit: f41125a4054935ec7f553d5245394cde3cc40c1c
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: EI_SUST com dado real pelo tempo por etapa, E7.243 (review E7.289, revalidações E7.322, E7.329 e E7.399)

Branch `feature/105-ei-sust` contra `develop` (base `57989aa0`). A primeira rodada revisou o head `7614d58a`, com um commit. São 26 arquivos e 1304 linhas no total. Sem `.md`, snapshots e `openapi.json` sobram 378 linhas de código e teste, acima da orientação de 150 (M14). O comportamento é um só (a regra da EI_SUST), e o resto é o contrato gerado e o ajuste dos testes que fixavam a EI_SUST como "sem dado". Quando houver PR, o corpo leva `teto: excedido`.

## Revalidação no head f41125a4 (E7.399)
Delta lido: `forge-check parecer delta docs/reviews/105-ei-sust.md`, intervalo `bb0b770b..f41125a4` (merge da `origin/develop` em `ab12a37f`, com o S8 #503 e o T10 #506), sem o que veio da base. No domínio: `CHANGELOG.md`, `docs/api/metricas.md`, `docs/api/openapi.json`, `packages/contratos/src/origem.ts`, `origem.test.ts`, `schemas.ts`, `server/src/modulos/referencia/criterios-acelerato.ts`, `server/tests/criterios-acelerato.test.ts`, `painel-real-f6.test.ts`, `qa-f6-painel.test.ts` e `web/src/features/coleta/origem.test.tsx`. Fora os três arquivos com conflito, o delta é só o que veio da develop (S8, T10 e S9) pela resolução do merge.
- Conferi a junção com `git diff origin/develop f41125a4` nos três arquivos com conflito. É uma união dos dois lados, sem perda:
  - `criterios-acelerato.ts`: a entrada `105:S8-so-respondidos` da develop fica em 8º, com o texto igual ao da develop. A `105:EI_SUST` fica em 9º, com o texto aprovado. O registro é idempotente pela referência, então a ordem só decide a ordem de gravação na primeira carga.
  - `criterios-acelerato.test.ts`: são nove entradas, e as métricas casam com o id do duble (`['8','S8']`, `['9','EI_SUST']`).
  - `qa-f6-painel.test.ts`: a lista de reais tem `EI_SUST` e `T10`, e a exclusão do FL2 inclui o `T10`. O título herda da develop uma vírgula a menos antes de "T10". É só cosmético e não vira achado.
- Rodei os testes tocados. No server, `vitest run tests/criterios-acelerato.test.ts tests/qa-f6-painel.test.ts tests/painel-real-f6.test.ts` deu 69 de 69 verdes. Nos contratos, `vitest run src/origem.test.ts` deu 26 de 26.
- Nenhum achado novo. A2 a A5 seguem recomendados.

## Revalidação no head bb0b770b (E7.329)
Delta lido: `forge-check parecer delta docs/reviews/105-ei-sust.md`, intervalo `bcbe9ff4..bb0b770b` (merge da `origin/develop` em `312a0152`), sem o que veio da base. No domínio: `CHANGELOG.md`, `docs/api/metricas.md`, `docs/api/openapi.json`, `packages/contratos/src/origem.ts`, `packages/contratos/src/origem.test.ts` e `server/tests/painel-real-f6.test.ts`. Os cinco últimos trazem mudanças da develop: o O12 pelo campo 51 (E7.214) e os motivos de bloqueio do BusinessMap (E7.184). O delta os mostra por causa da resolução do merge, e o EI_SUST não mexe neles.
- Patch do EI_SUST contra a develop: `git diff origin/develop bb0b770b` dá 30 arquivos, +1533/-42. Fora o `CHANGELOG.md`, comparei com o patch aprovado (`git diff origin/develop...bcbe9ff4`). Mudam só três coisas: os índices dos blobs, a posição dos hunks do `openapi.json` e o parecer do QA (`docs/qa/105-ei-sust.md`, fora do meu domínio). O código e os testes são os mesmos.
- `CHANGELOG.md`: contra a develop, o patch tem uma linha só, a entrada do EI_SUST em `### Adicionado`, igual à aprovada. A resolução do conflito manteve as entradas da develop.
- Nenhum achado novo. A2 a A5 seguem recomendados.

## Revalidação no head bcbe9ff4 (E7.322)
Delta lido: `forge-check parecer delta docs/reviews/105-ei-sust.md`, intervalo `7614d58a..bcbe9ff4`, três arquivos no domínio: `web/src/features/espera-invisivel/components/CartaoEI.tsx`, `web/src/features/espera-invisivel/espera-invisivel.test.tsx` e `web/src/features/espera-invisivel/notas.ts`. Não reli o resto.
- A1 resolvido. `ComposicaoSust` mostra no cartão da SUST a tabela "Composição dos chamados da janela": chamados, sem etapas, fila inicial, finais, não decididas e uma linha por etapa não decidida. A tabela tem `caption`, `th scope="col"` e `th scope="row"`. Ela só aparece com `nivel === 'SUST'` e `composicao` presente, e traz só somas e contagens, sem estatística. O texto de `notas.ts:26` agora aponta para essa tabela, então a promessa e a tela batem.
- Testes novos: a tabela rotulada na SUST, a ausência nos níveis do BusinessMap e os valores por etapa não decidida. Rodei `vitest run src/features/espera-invisivel/espera-invisivel.test.tsx`: 19 de 19 verdes.
- Mutante M4 (`naoDecididas.etapas.slice(1).map`, some a primeira etapa) derruba 1 teste ("lista cada etapa não decidida pelo nome"). Restaurei o arquivo.
- A2 a A5 seguem recomendados e ficam fora deste delta. O A3 pede cartão para o S1.

## Parecer
**Aprovado** no head `f41125a4`. As revalidações foram pelo delta. A junção com o S8 e o T10 foi conferida, e o patch do EI_SUST é o mesmo aprovado em `bcbe9ff4`, onde o A1 foi resolvido (veja acima). A primeira rodada, no head `7614d58a`, foi reprovada por um bloqueante (A1). O cálculo segue as decisões do dono:
- P-EI-1 B: cliente = soma de `porEtapa`; time = cliente menos as esperas da D5a.
- P-EI-2 A: as finais ficam fora das duas visões e são contadas.
- Suposição P-EI-3 da ordem do dono das 12:51: a fila inicial conta como espera.
- Regras invioláveis: só Acelerato; medianas e regra dos 20 pela biblioteca (`estatisticaEspera`, `pontoEspera`); versão de critério `105:EI_SUST` registrada.

## Achados
- A1 (bloqueante) web/src/features/espera-invisivel/notas.ts:26 · Resolvido em bcbe9ff4. O cartão diz "o tempo nelas é informado à parte", mas nenhum componente da web lê `composicao`. Não decididas, finais e sem etapas ficam só na API. Tire a frase ou mostre a composição no cartão.
- A2 (recomendado) packages/metricas/src/acelerato/ei.ts:114 · O filtro de janela do `semEtapas` não tem teste: o mutante `semEtapas = semEtapasPorDia.length` sobrevive. Falta um caso com chamado sem etapas fora da janela.
- A3 (recomendado) packages/metricas/src/acelerato/totalizadores.ts:122 · "Aguardando Validação" (nome real) é espera na EI, mas `pausaOSla` (S1) compara com caixa exata e não pausa. "As mesmas que pausam o SLA" não vale com dado real; abra cartão para o S1.
- A4 (recomendado) packages/metricas/src/acelerato/totalizadores.ts:125 · Etapas reais fora das quatro listas (ex.: "Aguardando Validação de Prioridade") viram tempo do time sem contagem; conte-as na `composicao`.
- A5 (recomendado) packages/metricas/src/acelerato/ei.ts:72 · `cliente <= 0` pega também o chamado só com etapas finais; o contrato diz "sem tempo por etapa". Ajuste o texto.

## Detalhe dos achados
- A1: na primeira rodada, a busca por `composicao`, `naoDecididas` e `semEtapas` em `web/src` e `e2e` não achava nada. A P-EI-2 pede as finais "contadas", e a proposta diz "o cartão mostra quanto tempo ficou nelas". Em `bcbe9ff4` o cartão da SUST mostra a composição (veja a revalidação).
- A2: com o mutante, os 53 testes de `src/acelerato/` ficam verdes. A conta também lê melhor como `semEtapasPorDia.filter((d) => d >= jIni && d <= jFim).length`, com `const`.
- A3: o nome real é "Aguardando Validação", com V maiúsculo (`server/tests/dominio-acelerato-real.test.ts:28`). `ETAPAS_PAUSA` tem `'Aguardando validação'`, e `pausaOSla` compara com caixa exata. A EI está certa pela proposta e pelo briefing 3.4. O defeito é do S1 e está fora deste diff: normalizar `pausaOSla`, com versão de critério para o S1, e depois tirar o caso à parte da EI.
- A4: a etapa está em `server/tests/dominio-acelerato.test.ts:278`. A proposta aceita isso (opção 2, "as 44 sem classificar"). Mesmo assim, a contagem ajudaria a ler o critério de reversão da proposta (não decididas mais fila inicial acima de 50% do cliente).
- A5: é o caso 501 do teste. Um texto possível: "sem tempo fora das etapas finais". O rótulo novo do cartão, "Sem tempo por etapa (fora das duas visões)", herda o mesmo texto.

## O que conferi
- `classeDaEtapaEI`: a ordem final, espera, fila inicial, não decidida e time não tem sobreposição entre os conjuntos. O nome é comparado sem diferença de caixa e espaços. Encerrado e Arquivar ficam como finais (relógio parado, já era assim).
- O time nunca fica negativo: espera e fila inicial são partes do cliente.
- A composição usa as prioridades do filtro e a janela de percentis. A ordem das etapas vem de `ordenarNeutro`. São só somas e contagens, sem estatística.
- O contrato tem `composicao` opcional, ausente nos níveis do BusinessMap. Os snapshots e o `openapi.json` foram regenerados. Não há migração, GRANT nem coluna de pessoa (só datas e tempo por etapa).
- `MOTIVO_ORIGEM_MOCK` deixa de ter a EI_SUST, e os testes de origem, painel real e QA F6 foram ajustados ao estado real.
- Teste novo rodado: `vitest run src/acelerato/ei-sust.test.ts src/acelerato/acelerato.test.ts`, 27 de 27 verdes.
- Mutantes: M1 (`time: cliente - espera`, sem a fila inicial) derruba 1 teste. M2 (`cliente < 0`) derruba 1 teste. M3 é o do A2 e sobrevive. M4 está na revalidação.

## CI e suíte
Não há PR para esta branch. A suíte inteira fica para o CI do PR. Na primeira rodada, o autor não tinha fechado um `pnpm run pronto` completo depois da última correção (só o pacote docs-contratos). O CI do push no head `7614d58a`, run 43933986407, passou em `rapida`, `build`, `banco`, `openapi`, `seguranca` e `imagem`, e o job `testes` foi cancelado pelo push seguinte. O run 43935238784 roda em `d54e6e41`, que tem o mesmo código, e terminou com `success`. No head `bcbe9ff4`, o autor informa que o `pnpm run pronto` completo terminou com EXIT 0 (PQ do autor). No head `bb0b770b`, que só integra a develop, não rodei a suíte e não afirmo CI verde. No head `f41125a4`, o autor informa `pnpm run pronto` com rc=0 (PQ do autor). O CI do push (runs 43986655096 e 43986647268) estava na fila durante a revalidação, então não afirmo CI verde: a suíte fica para o CI do PR.

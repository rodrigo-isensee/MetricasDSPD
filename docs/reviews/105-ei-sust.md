---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ei-sust
commit: bcbe9ff40d7f4de6611819ea5e9b15cb08fcfc87
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: EI_SUST com dado real pelo tempo por etapa, E7.243 (review E7.289, revalidação E7.322)

Branch `feature/105-ei-sust` contra `develop` (base `57989aa0`). A primeira rodada revisou o head `7614d58a`, com um commit. São 26 arquivos e 1304 linhas no total. Sem `.md`, snapshots e `openapi.json` sobram 378 linhas de código e teste, acima da orientação de 150 (M14). O comportamento é um só (a regra da EI_SUST), e o resto é o contrato gerado e o ajuste dos testes que fixavam a EI_SUST como "sem dado". Quando houver PR, o corpo leva `teto: excedido`.

## Revalidação no head bcbe9ff4 (E7.322)
Delta lido: `forge-check parecer delta docs/reviews/105-ei-sust.md`, intervalo `7614d58a..bcbe9ff4`, três arquivos no domínio: `web/src/features/espera-invisivel/components/CartaoEI.tsx`, `web/src/features/espera-invisivel/espera-invisivel.test.tsx` e `web/src/features/espera-invisivel/notas.ts`. Não reli o resto.
- A1 resolvido. `ComposicaoSust` mostra no cartão da SUST a tabela "Composição dos chamados da janela": chamados, sem etapas, fila inicial, finais, não decididas e uma linha por etapa não decidida. A tabela tem `caption`, `th scope="col"` e `th scope="row"`. Ela só aparece com `nivel === 'SUST'` e `composicao` presente, e traz só somas e contagens, sem estatística. O texto de `notas.ts:26` agora aponta para essa tabela, então a promessa e a tela batem.
- Testes novos: a tabela rotulada na SUST, a ausência nos níveis do BusinessMap e os valores por etapa não decidida. Rodei `vitest run src/features/espera-invisivel/espera-invisivel.test.tsx`: 19 de 19 verdes.
- Mutante M4 (`naoDecididas.etapas.slice(1).map`, some a primeira etapa) derruba 1 teste ("lista cada etapa não decidida pelo nome"). Restaurei o arquivo.
- A2 a A5 seguem recomendados e ficam fora deste delta. O A3 pede cartão para o S1.

## Parecer
**Aprovado** no head `bcbe9ff4`, com o A1 resolvido (veja acima). A primeira rodada, no head `7614d58a`, foi reprovada por um bloqueante (A1). O cálculo segue as decisões do dono:
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
Não há PR para esta branch. A suíte inteira fica para o CI do PR. Na primeira rodada, o autor não tinha fechado um `pnpm run pronto` completo depois da última correção (só o pacote docs-contratos). O CI do push no head `7614d58a`, run 43933986407, passou em `rapida`, `build`, `banco`, `openapi`, `seguranca` e `imagem`, e o job `testes` foi cancelado pelo push seguinte. O run 43935238784 roda em `d54e6e41`, que tem o mesmo código, e terminou com `success`. No head `bcbe9ff4`, o autor informa que o `pnpm run pronto` completo terminou com EXIT 0 (PQ do autor). Não afirmo CI verde neste head e não rodei a suíte.

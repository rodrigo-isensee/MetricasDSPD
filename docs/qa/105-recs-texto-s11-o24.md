---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-texto-s11-o24
commit: 02ee136620fb9b4ca72ec7901bab032939194328
parecer: aprovado
resultado: aprovado; texto novo coberto em contratos e web; nenhum e2e afirma o texto antigo; 1 recomendado (comentários trocados), resolvido em 02ee1366 na revalidação
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---
# QA: recomendados de texto do S11 e do O24 (pedido 105, E6.41)

Diff conferido contra a base 81d35af7 (6 arquivos, só texto e teste). Sem plano antecipado: pedido de texto sem especificação nova.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| `MOTIVO_S11_CONVERSAO_SEM_DADO_REAL` é frase (maiúscula, ponto final) e não cita fictício | `packages/contratos/src/origem.test.ts` (`/^[A-ZÀ-Ý].*\.$/`) | formato do texto | passa, 25 de 25 |
| A tela exibe o motivo como vem, sem duplicar nem cortar | `web/src/features/complementares/estados.test.tsx` (S11 conversão nula, 152 de 152; usa a constante e o texto literal) | texto final na tela | passa |
| Servidor e biblioteca devolvem a mesma constante | `server/tests/metricas.test.ts:241`, `painel-real-f6.test.ts:627`, `packages/metricas` s11 (por constante, sem literal) | contrato | não rerrodados: usam a constante, o CI cobre |
| Exemplo do contrato S11 com o texto novo | `docs/contratos/metricas/S11.md:236` confere com a constante | documento | conferido no diff |
| Catálogo não lista S11 como mock | `docs/api/metricas.md` perto da 100: lista só T8, E4, S8 e S12 | documento | conferido no diff |
| CHANGELOG diz que `cards_com_etiqueta` conta leituras de card | `CHANGELOG.md:94` | documento | conferido no diff |
| Nenhum e2e afirma o texto antigo | grep (abaixo) | n/a | sem ocorrência |

## Provas
- grep `vínculo do chamado|liga a avalia|aguardando o v` em `e2e`, `web/src`, `server`, `packages`: só `web/.../estados.test.tsx` (texto novo) e `packages/contratos/src/origem.ts` (a constante). Nenhum e2e.
- Vermelho antes do verde (à mão, cópia do autor revertida ao fim, árvore limpa): com a constante de volta ao texto antigo, `origem.test.ts` cai (1 falha, 24 passam) e `estados.test.tsx` cai (1 falha, 151 passam); com o texto novo, 25 de 25 e 152 de 152.
- CI: o run 43788731883 do sha 0fd1187f foi cancelado pelo push seguinte (só `docs/reviews/105-recs-texto-s11-o24.md`, 28 linhas, sem código). O run 43789216695 é do head que só soma esse documento; resultado em "CI" abaixo.

## Achados
- A1 (recomendado) packages/contratos/src/origem.ts:87 · resolvido em 02ee1366: os comentários do O12 (linha 87, minúsculas sem ponto) e do S11 (linha 106, frase completa) foram trocados de lugar; os valores não mudaram.

## CI
Run 43789216695 (push, head só com o documento de review a mais que 0fd1187f): success, com `testes`, `banco`, `build`, `openapi`, `seguranca` e `rapida` verdes; e2e e perf ficaram skipped no workflow.

## Revalidação (head 02ee1366, E6.44)
- Delta conferido: `forge-check parecer delta` de 0fd1187f a 60b0dfec. No domínio, só `packages/contratos/src/origem.ts`, e só linhas de comentário (2 trocadas); as constantes `MOTIVO_O12_RESPONSABILIDADE_SEM_DADO_REAL` e `MOTIVO_S11_CONVERSAO_SEM_DADO_REAL` seguem com o mesmo valor. O `02ee1366` também traz os pareceres de QA e review, que estão fora do domínio.
- O comentário do O12 agora diz "minúsculas sem ponto final" e o valor é minúsculo sem ponto; o do S11 diz "frase completa" e o valor é "Aguardando o vínculo do chamado com o Registro de Problema.". A1 resolvido.
- Testes: não rerrodados nesta revalidação. Mudança só de comentário não altera o resultado de `origem.test.ts` (25 de 25) nem de `estados.test.tsx` (152 de 152), validados no `0fd1187f`.
- Commit `60b0dfec` (review): só `docs/reviews/105-recs-texto-s11-o24.md`, fora do domínio do QA.
- CI do `02ee1366`: run 43790481019 (`CI`), sha `02ee136620fb9b4ca72ec7901bab032939194328`, conclusão success. Check-runs do sha: `testes`, `banco`, `build`, `openapi`, `seguranca`, `rapida`, `imagem` e `filtro` verdes; `e2e`, `e2e-parte` e `perf` skipped. Não há check-run chamado `bateria` neste repositório; o portão de testes é `testes`.

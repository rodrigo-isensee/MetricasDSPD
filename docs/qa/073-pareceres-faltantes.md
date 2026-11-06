---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: docs/073-pareceres-faltantes
commit: 2bb96c3ed749fdc465ece610c12411e33cde3a91
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-05
---
# QA: pedido 073, E7 (pareceres faltantes, K-230)

Escopo: entrega só de documentação copiada (4 pareceres de origem e o parecer de review). Não há código, teste ou configuração no diff, então não rodei suíte unitária nem E2E, nem vermelho antes do verde, nem mutação. Base-sha 8a789d43. Ponta da branch conferida: 33242d82 (parecer de review, E7.1). Commit do parecer: 2bb96c3e, o commit da cópia, conforme o brief.

## Achados
- A1 (recomendado) docs/reviews/011-back.md:6 · commit curto 8908d92 no cabeçalho do review copiado sem mudança de texto; é cópia de origem e não bloqueia. O review de origem cita a linha 7, mas o commit fica na linha 6.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1: o review do E7.1 está aprovado antes do QA | leitura de docs/reviews/073-pareceres-faltantes.md | review não aprovado: parar e relatar | passou (parecer: aprovado) |
| CA-2: os 4 arquivos copiados têm o mesmo blob da origem citada | git rev-parse HEAD:<arquivo> contra <origem>:<arquivo> | um byte diferente da origem | passou (4 de 4 iguais) |
| CA-3: nenhum arquivo além dos 4 e do review mudou | git log --stat 8a789d43..33242d82 | arquivo extra no diff | passou (5 arquivos: os 4 e o review) |
| CA-4: a documentação passa no docs:check | pnpm run docs:check | link ou frontmatter quebrado | passou (rc 0) |

## Cenários e resultado real
- git pull --ff-only origin docs/073-pareceres-faltantes: "Already up to date"; HEAD e origin/docs/073-pareceres-faltantes em 33242d82. Árvore limpa antes da conferência.
- Blobs (HEAD contra origem): docs/qa/069-zz2-l7a.md e7e72aa5 = e7e72aa5; docs/security/069-zz2-l7a.md 0167c3b1 = 0167c3b1; docs/qa/011-back.md ec6a010f = ec6a010f; docs/reviews/011-back.md f7dbea18 = f7dbea18.
- pnpm run docs:check: "docs:check: ok (1022 páginas Markdown, 69 métricas, 2 eventos)", rc 0. O review registrou 1021 páginas; a diferença de uma página é compatível com o próprio parecer de review, que entrou depois daquela contagem (não verifiquei isso item a item).
- Os cabeçalhos dos quatro arquivos batem com as origens: mesmo pedido de origem e mesmo commit de origem; o commit curto 8908d92 do 011 é o achado A1.

## Provas do PQ-1
- Saída do comando do PQ-1 colada no relatório de entrega, depois do push.

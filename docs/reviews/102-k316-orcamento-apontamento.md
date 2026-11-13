---
tipo: review
contrato: 1
pedido: 102-forge-0460
branch: fix/k316-orcamento-apontamento
commit: db38a48814526eedecf1c88d834ab95428fc47d0
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-316, orçamento do teste de 10 000 comentários por CPU do melhor lote (E1.8)

Diff lido: `git diff d71599f9...db38a488` (1 arquivo, 1 commit: `db38a488`), só `packages/metricas/src/coletor/classificarApontamento.test.ts` (+14/-5). Nenhum código de produção mudou; classe só testes.

## Ferramentas (citadas, não refeitas)
- Teste isolado (`vitest run -t 'melhor de 10 lotes'`): verde. Sonda numa cópia descartável do teste, sem tocar a branch: melhor lote 92 ms (pior 181 ms) sem cobertura; 168 ms (pior 287 ms) com `--coverage`, que é como o `pronto` roda.
- Sob carga: pacote `metricas` inteiro com `vitest run --coverage` (como o `pronto` do pacote): 46 arquivos, 1312 testes verdes, cobertura 100% nas quatro medidas, 77,9 s.
- CI do head `db38a488` (check-runs do commit): `testes` (16:54 a 17:03 UTC), `rapida`, `banco`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes; `e2e` e `perf` pulados pelo filtro (só teste mudou).
- Tamanho (M14): 19 linhas de teste, um comportamento só.

## Conferência
- **Faz o que o cartão pede:** troca relógio de parede por `process.cpuUsage` (user + system) e mede o melhor de 10 lotes de 1000, com o mesmo mix (metade pior caso, metade típico com sufixo). O descalonamento sob o pronto paralelo deixa de contar, e uma regressão de complexidade encarece todos os lotes, então o mínimo ainda a pega.
- **Escopo do `cpuUsage`:** é do processo inteiro. O vitest 5 roda por padrão em `forks` (um processo por arquivo), e a config do pacote não muda o pool; então não soma CPU de outros arquivos de teste, só a do próprio processo (GC incluso), o que só joga a favor da margem.
- **Sem cache que falseie o lote repetido:** `classificarApontamento` não memoriza por comentário (só `termosOrdenados` é pré-calculado por dicionário, igual ao teste antigo); repetir os mesmos 1000 textos em 10 lotes custa o mesmo que 10 000 textos distintos.
- **Limite: fica 500 ms, não 250 ms.** Com cobertura o melhor lote mede 168 ms nesta estação; 250 ms deixa margem de 1,5x, pouca para runner do CI mais lento e para a instrumentação do v8, e traria de volta o teste instável que o cartão quer tirar. 500 ms dá cerca de 3x com cobertura e preserva o contrato original (5 s por 10 000). A sensibilidade a regressão menor (cerca de 3x) já é do teste vizinho, "um comentário ... em menos de 5 ms (melhor de 7 medidas)", que segura o custo por item; este segura a ordem de grandeza, como o autor provou com a regressão plantada (1270 ms, cai).
- **Regras invioláveis:** nada de métrica, pessoa nem fonte; só teste de desempenho.

## Achados

## Conclusão
Parecer: aprovado no `db38a488`, com o limite de 500 ms e sem achados.

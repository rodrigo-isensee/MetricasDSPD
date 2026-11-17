---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t2-prazos-aprovados
commit: 0dde8f64e571e57e477b74d418ba1e040d3ccf03
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: prazos T2 aprovados (K-214, E7.497, review E7.500)

Diff lido: `f15e4e4b..0dde8f64` (6 arquivos, +22 -7).

- **Valores conferidos** contra `docs/analises/105-proposta-sle-t2.md` (linhas 11-14 e 18): Crítica 12,5 (P85 12,537), Alta 5,8 (5,840), Média 11,2 (11,217), Baixa 2,1 (2,058), uma casa, sem arredondamento a inteiro, `aprovado_em` 2026-11-17, como o dono aprovou em 17/11. A não monotonicidade (Crítica acima de Alta) e a amostra frágil de Baixa (n = 22) foram expostas ao dono na proposta; não há inferência do time.
- **vm:preparar:** passo `bm:ref-sync-sle` (entrada `ref-sync-sle`, existente em `server/src/entradas/`) logo depois do `bm:ref-sync`, antes dos passos do Acelerato; o teste trava a posição exata (`indexOf + 1`). Sem rede externa, idempotente pelo próprio sincronizador.
- **Teste do arquivo real:** troca o "nasce vazio" pela leitura dos quatro prazos, grava 4 na base vazia com versão de critério (T2.6) e a segunda rodada não insere nem fecha (idempotência). Rodei `vitest run tests/sle-businessmap.test.ts tests/vm-preparar.test.ts`: 2 arquivos, 34 testes passam.
- **Regras invioláveis:** só BusinessMap, nada de Acelerato; histórico preservado (só INSERT e fecho de vigência, já revisado em E7.485); mudança de critério registrada com data. Documentação (`docs/architecture/server.md`) e fragmento de changelog atualizados.
- **Suíte:** sem PR; vale o PQ do autor (`pnpm run pronto` rc=0). Não afirmo CI verde.
- Sem guarda nova ou mudada no diff (só dado e um passo de lista); sem mutante a declarar.

Sem achados: o bloco abaixo fica vazio.

## Achados

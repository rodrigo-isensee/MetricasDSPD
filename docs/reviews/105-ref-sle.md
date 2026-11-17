---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-ref-sle
commit: becf285c52b29b24ff3c3c4855222170fc2be9d7
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: carregador do ref_sle (K-214, E7.492)

**Veredito: aprovado.** Base ca6a1281..becf285c, um commit, 9 arquivos (+405).

## Escopo (conferência do Jarvis)
O desvio é aceitável. `docs/architecture/server.md` (+2) documenta o comando novo: é a documentação afetada que a definição de pronto exige na mesma entrega. `server/package.json` (+1) só registra o script `bm:ref-sync-sle`, sem o qual a entrada não roda. Nenhum dos dois muda comportamento além do K-214.

## Vigência e histórico
- `planejarSle` (sle-businessmap.ts:91-105): prazo igual ao vigente não grava; prazo diferente com `aprovado_em > hoje` é recusado; com `aprovado_em <= última data registrada` (maior de `vigente_de`/`vigente_ate` por prioridade) é recusado. A nova vigência é, portanto, sempre posterior à última e nunca futura. O fechamento usa `vigente_ate = aprovado_em`, que é maior que o `vigente_de` anterior, e o `CHECK` da tabela é respeitado.
- Nada é apagado: o módulo não tem `DELETE`; só faz `INSERT` e `UPDATE ... SET vigente_ate` restrito a `vigente_ate IS NULL`, numa transação (`emTransacao`), com o plano validado antes de qualquer escrita. A PK (`equipe, classe_servico, percentil, vigente_de`) impede a duplicata.
- Erros nomeiam o campo e a linha (`#n`), sem valor. A versão de critério (T2.6) é registrada uma vez por hash, com as métricas T2 e O3.
- A leitura (`metricas/repositorio.ts:164`) usa `equipe`/`percentil 85`/vigente, o mesmo que o carregador grava.

## Ferramentas
A suíte inteira fica para o CI do PR (não há PR; não afirmo CI verde), e vale o PQ do autor. Rodei só os testes novos: `vitest run tests/sle-businessmap.test.ts tests/ref-sync-sle-entrada.test.ts` deu 2 arquivos e 25 testes passando.

Tamanho: são cerca de 390 linhas de código e teste, acima da orientação de 150. É um comportamento só, e o corpo do PR deve trazer `teto: excedido`.

## Achados
- A1 (recomendado) server/tests/sle-businessmap.test.ts:117 · falta um teste que afirme que uma prioridade retirada do arquivo continua vigente na base (sem UPDATE nem DELETE). O código está correto (não há DELETE), mas a promessa do `regra` do JSON fica sem trava.

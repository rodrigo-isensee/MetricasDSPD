---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t7-sem-limite
commit: 41c275ef2936f483cdfa0ca2f9a07f64e76e53c0
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: 105-t7-sem-limite (E7.498, E7.506)

Pedido de correção por decisão do dono (17/11), sem especificação nova: sem plano antecipado. Obrigação: o cartão T7 mostra que não há limite de frentes, sem comparação com limite nem selo, e o resto do cartão fica igual.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Cartão diz "Sem limite de frentes" e o número "sem limite", sem "não definido" | tatico.test.tsx, "E7.498: sem limite de frentes, sem comparação nem selo de limite" | fonte sem limite vigente (null) | passou no head, falha na base |
| Nenhuma comparação, mesmo se a fonte trouxer `acimaDoLimite` | ramos.test.tsx, "T7 não compara com limite mesmo se a fonte trouxer um" | dado do back-end ainda presente (back-end intacto) | passou no head, falha na base |
| Sem selo "Acima/Dentro do limite" nem "Sem meta numérica" | os dois testes acima (queryByText ausente) | selo removido | passou |
| Resto do cartão e do tático igual | 117 arquivos do web | n/a | passou |

## Cenários e resultado real
- Vermelho antes do verde: com CartaoT7.tsx e notas.ts da base 6fb535ed e os testes do head, 2 falharam e 38 passaram (ramos.test.tsx e tatico.test.tsx); com o head, 40 de 40. Feito na worktree, arquivos restaurados ao head, árvore limpa.
- Suíte do web pela fila (`scripts/suite-unica.sh`, TZ=UTC, `vitest run`, head 7626f762): 117 arquivos, 1906 testes, todos passaram, em 373,8 s com as duas vagas disputadas por outras worktrees. Confirma que os timeouts alheios que o autor viu eram carga da máquina, não defeito. Não foi preciso rodar teste isolado: nenhum estourou.
- Diff lido (5 arquivos, só web): CartaoT7 passa a usar `textoStatus` fixo e `statusMeta="sem-meta"`; `StatusMeta` e a leitura de `limiteFrentes`/`acimaDoLimite` saem do cartão; nota de meta atualizada em notas.ts; back-end e contrato intactos, o campo continua vindo da API e é ignorado. Resto do cartão (projetos, histograma, tabela, AmostraInsuficiente) sem mudança.
- `fmtInteiro` continua usado no cartão (4 ocorrências), sem import morto.
- Mutação: sem ferramenta registrada para este diff; os dois testes de aceite matam a volta à comparação (vermelho acima).
- PQ do autor: pronto com timeouts alheios (informado no brief); não afirmo CI verde (sem PR ainda).
- Acessibilidade: texto de status e número em texto, sem cor como único canal; sem componente novo.

## Revalidação (volta, head 41c275ef)
Delta (`forge-check parecer delta`, intervalo 7626f762..41c275ef): CartaoT7.tsx e tatico.test.tsx. Saiu o indicador "sem limite" repetido (grade de 3 para 2 colunas); rótulo passou a "projetos com frentes em andamento".
- Teste atualizado (tatico.test.tsx): "Sem limite de frentes" presente, "sem limite" (indicador) ausente, rótulo novo presente, sem "não definido", "Sem meta numérica" nem "Acima do limite". Protege o indicador removido e o rótulo.
- Execução local do tático (`vitest run src/features/tatico`): 2 arquivos, 40 testes, todos passaram (57 s). Rodou fora do sandbox, que bloqueia escrita na worktree.
- A suíte inteira do web passou no head anterior (117 arquivos, 1906); o delta não toca outro arquivo. Não afirmo CI verde: sem PR.
- PQ do autor: pronto com timeout alheio, aceito como carga da máquina (já visto no 1º parecer).
- Resultado: aprovado, sem achados.

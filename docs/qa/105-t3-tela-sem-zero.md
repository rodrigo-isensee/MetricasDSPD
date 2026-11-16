---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-t3-tela-sem-zero
commit: 6d5137f9fadd79e9fe5a5451fb04941bcc9fa33f
parecer: aprovado
resultado: aprovado; 1 achado recomendado (A1, série Acordado sem teste)
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: T3 sem desvio 0 e T7 sem limite (pedido 105, E7.142)

Diff conferido contra `2c56d33b` (6 arquivos: `CartaoT3.tsx`, `CartaoT7.tsx`, `ramos.test.tsx`, `tatico.test.tsx`, `metricas.mapa.test.ts`, CHANGELOG). Decisão do dono: "T3 nao precisa comparar com o combinado".

## Critério → teste → resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T3 sem acordado não mostra acordado nem desvio | `tatico.test.tsx` "E7.62: sem acordado não mostra acordado nem desvio…" | acordado nulo em todas as naturezas | passa; cai na base |
| Percentual publicado sem desvio não mostra "desvio 0 p.p." | `ramos.test.tsx` "percentual publicado sem desvio…" | desvioPP nulo | passa; cai na base |
| Leitura diz que o cartão mostra a divisão, sem comparar | os dois acima (`leitura-T3`) | status ok sem acordado | passa |
| "Menos de 20 itens" só com status não ok | os dois acima (queryByText ausente) e "com menos de 20 itens e sem acordado…" | 20 itens (ok × insuficiente) | passa; cai na base |
| Lista sem acordado, status insuficiente, mostra só a quantidade | `tatico.test.tsx` "com menos de 20 itens e sem acordado…" | amostra insuficiente | passa; cai na base |
| T7 sem limite: chip "Limite não definido", sem "Sem meta numérica" | `tatico.test.tsx` "E7.62: sem limite vigente…" | limite ausente | passa; cai na base |
| Série Acordado sai do gráfico sem acordado (além do pedido) | nenhum | n/a | sem prova (A1) |
| Nome do teste do servidor | `metricas.mapa.test.ts` (só renomeia; a asserção já era `null`) | n/a | n/a |

## Vermelho antes do verde
Cópia da árvore com `CartaoT3.tsx` e `CartaoT7.tsx` de `2c56d33b` e os testes do head (`vitest run ramos.test.tsx tatico.test.tsx`, 32 testes): 4 falham, 28 passam.
- `ramos.test.tsx` T3 "percentual publicado sem desvio…"
- `tatico.test.tsx` T3 "E7.62: sem acordado…"
- `tatico.test.tsx` T3 "com menos de 20 itens e sem acordado…"
- `tatico.test.tsx` T7 "E7.62: sem limite vigente…"

No head, 32 de 32. Árvore restaurada ao head (`git checkout 6d5137f9 -- web`, status limpo).

## Mutação no diff (à mão, árvore revertida a cada um)
- M1 `desvioPP ?? 0` de volta na lista do T3: morreu (2 falhas).
- M2 leitura "menos de 20 itens" também com status ok: morreu (2 falhas).
- M3 retirar `textoStatus: 'Limite não definido'` do T7 (volta "Sem meta numérica"): morreu (1 falha).
- M4 `semAcordado = false` (série e descrição Acordado voltam): sobreviveu (32 de 32).

## Achados
- A1 (recomendado) web/src/features/tatico/components/CartaoT3.tsx:48 · `semAcordado` (série Acordado e descrição do gráfico) não tem teste: o mutante `semAcordado = false` sobrevive. Afirmar a série ou a descrição na prova "sem acordado".

## Nota sobre A1
Sem bloqueio: o comportamento foi acrescentado além do pedido e a legenda não aparece no DOM de teste; vira teste do autor ou cartão.

## CI
Run 43850842038 (push, sha 6d5137f9): success. O run 43851320577 (pull_request, PR 488) estava em andamento na consulta; este parecer cita só o do push.

## Provas locais
`vitest run src/features/tatico/ramos.test.tsx src/features/tatico/tatico.test.tsx` em `web`: 2 arquivos, 32 testes passam. Suíte inteira fica para o CI.

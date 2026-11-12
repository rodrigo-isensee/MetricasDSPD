# Retrospectiva do pedido 094: lote técnico (K-265, K-266, K-267)

Fontes: `docs/pedidos/094-lote-testes-e-guia.md` (Histórico inteiro), `docs/kanban/conferencias.md` (14 linhas do 094), `docs/kanban/historico.md` (K-265, K-266, K-267), `gh pr view` dos PRs 308, 309 e 310. Horas no relógio local (-03:00), de 2026-11-11 (o `gh` devolve UTC; convertido). Processo, nunca pessoa. PRs: 308 (K-265), 309 (K-266) e 310 (K-267), todos mesclados na develop pelo dono.

## 1. Dados do fluxo
| Marco | Hora | Intervalo |
|---|---|---|
| Pedido aberto; worktrees 052c, 052d e 052f | 10:15 | |
| K-265 entregue (26511df5), K-266 entregue (1d7c4291) | 10:18 | 3 min |
| Review do K-265 aprovado (sem achados); do K-266 aprovado (A1) | 10:21 e 10:22 | |
| K-266 QA aprovado (0 bugs) | 10:25 | |
| K-267 entregue (9f4ecf99); review aprovado com A1 e A2 recomendados | 10:34 e 10:37 | 3 min |
| K-267 volta com A1 e A2 resolvidos (91448084); revalidado (A3 recomendado, pendência) | 10:39 e 10:43 | 4 min |
| K-267 QA aprovado (0 bugs, mutação morta) | 10:46 | |
| PR 308 mesclado (GitHub, 13:42Z) | 10:42 | |
| PR 309 mesclado (GitHub, 13:57Z; o Histórico do pedido diz 10:58) | 10:57 | |
| PR 310 mesclado (GitHub, 13:58Z; sem linha no Histórico do pedido) | 10:58 | |

- **Lead time (medido pelo `historico.md` até "Em andamento", fim pelo `mergedAt` do `gh pr view`):** de "Em andamento" (K-266 e K-267 10:14:29; K-265 10:14:30) à mescla: K-265 27 min, K-266 43 min, K-267 44 min. O `historico.md` não tem movimento de "Pronto" nem de Code review e QA para os três cartões; o fim vem do GitHub. Amostra de 3 cartões: sem percentis.
- **Cycle time:** igual ao acima nos três, **estimado** (início no histórico, fim no GitHub), pois o quadro não registra "Pronto".
- **Dois relógios (D-4):** "pedido aberto para develop": 27 min (K-265), 42 min (K-266) e 43 min (K-267) (10:15 às 10:42, 10:57 e 10:58), **estimado** pelo Histórico do pedido e pelo GitHub, não por `forge-check voltas`. "Pronto para fazer para develop": **não medido** (os cartões entram em "Em andamento" direto da Entrada, sem "Pronto para fazer").
- **Custo:** `forge-check transcricao custo` não rodado, **não medido**; sem movimento de "Pronto", o `custo total` também não existe.
- **Vazão:** 3 cartões mesclados em 16 min (10:42 a 10:58).
- **Retrabalho de cartão:** 1 de 3 (K-267: A1 `quem` dentro de esquema e A2 `user_id`, `userId` e `motivo_texto` voltaram ao autor às 10:37, antes do QA; pequenos e do mesmo teste, decisão técnica do Jarvis). K-265 e K-266: 0 devoluções. Achados: K-265 0; K-266 1 (A1, trocar pelo ajudante `ajuda-cli-filho.ts` quando K-264 e K-266 estiverem na develop); K-267 3 recomendados (A1 e A2 resolvidos, A3 `QUEM` em maiúsculas segue pendência no PR). Bugs do QA: 0 nos dois cartões com QA. Esses valores vêm do Histórico do pedido, não dos pareceres.
- **Estabilidade (DORA):** 3 PRs mesclados, sem falha, reversão ou hotfix registrados; tempo de recuperação: não se aplica. Lead time de mudança por PR (primeiro commit à mescla): **não medido**. Velocidade sem queda de estabilidade.
- **Escape:** nenhum achado depois dos pareceres finais no Histórico.
- **Clareza:** sem a seção "Registro de clareza", `PERGUNTA:`, `NAO-ENTENDI:` e `DEVOLVIDA:` são **não medidas**. Lido à mão: 0 perguntas ao dono; marcas do cabeçalho: 0 confirmado, 3 técnico, 0 suposição, 0 delegado (0%); 0 `ESCOPO+` e 0 `ESCOPO-`; 0 `ERRO-JARVIS`; 2 `DECISÃO TÉCNICA` do Jarvis (ajuste local no K-266 sem o ajudante, e A1 e A2 do K-267 de volta ao autor).
- Esperas, escapes, corrigidos, afrouxamentos (linha de base M14b): não rodados nesta delegação; **não medidos**.

### Briefs e conferências (14 linhas do 094)
14 briefs distintos (node-backend 1 a 3, tech-lead 1 a 8, qa-engineer 1 e 2, agile-coach 1), 14 conferências, todas de `brief`, **todas aprovadas na 1ª rodada** (0 reprovadas; 100% de aprovação na 1ª conferência). Classe de causa de reprovação: 0 em escopo, decisão, forma, prova, estado, etapa e ferramenta. Um desvio foi registrado como decisão técnica já na conferência (o ajudante do K-264 ainda não estava na develop). **Sem linha de `entrega` do 094 em `conferencias.md`**: o Histórico do pedido registra "entrega conferida 9f4ecf99" às 10:34, sem número (como no 090, 091 e 092).

## 2. O que funcionou
- **Três cartões sem arquivo em comum, em paralelo:** guia (K-265), teste do seed (K-266) e regex do S6 (K-267) em três worktrees, sem conflito, entregues em até 20 min (K-265 e K-266 às 10:18, K-267 às 10:34) e mesclados dentro de 16 min uns dos outros.
- **Corte de uma linha ou de um teste por cartão:** diffs mínimos (K-265 só a linha 44; K-266 1 linha; K-267 regex mais o caso S6b), `tsc` e `docs:check` verdes, 39 de 39 no arquivo do K-267.
- **Review achou o que o modelo de ameaças do 075 pedia:** A1 e A2 do K-267 (T2 e T3: `user_id`, `userId`, `motivo_texto`) voltaram ao autor antes do QA, em vez de virar cartão novo; mutação morta no QA.
- **A pendência do K-264 virou cartão no mesmo dia e fechou neste pedido:** A1 do review do K-264 (092) virou K-266 e foi mesclado 42 min depois da abertura do pedido.
- **Brief controlado:** 14 de 14 aprovados na 1ª conferência; nenhum bypass (`--no-verify`, `--force`, `--admin`).

## 3. O que atrapalhou (fatos)
- **Quadro sem etapas intermediárias, de novo** (recorrência do 068, 090, 091 e 092): `historico.md` tem só "Em andamento" dos três cartões; Code review, QA e "Pronto" não estão lá, então cycle time e dois relógios saem **estimados** pelo GitHub.
- **Histórico do pedido incompleto no fim:** sem linha para a abertura do PR 310, nem para a mescla dos PRs 308 e 310; a hora do PR 308 aberto (10:41 no Histórico, 10:23 no GitHub) e a da mescla do PR 309 (10:58 contra 10:57) não batem com a fonte.
- **Dois PRs mesclados em ordem diferente da prevista:** o Histórico dizia que o merge do 308 esperava a promoção da release 093 (develop congelada); o `gh` mostra o 308 mesclado às 10:42, antes do 309.
- **K-266 com o ajuste local no lugar do ajudante:** o ajudante `ajuda-cli-filho.ts` só estava na branch do K-264 quando o brief saiu; o review pediu a troca depois (A1), sem cartão visto no quadro.
- **Pendência A3 do K-267 (`QUEM` em maiúsculas)** foi para o PR em vez de voltar ao autor ou virar cartão.
- **Pedido sem "Registro de clareza"** e sem linha de `entrega` em `conferencias.md`.

## 4. Ação (uma causa nova) e linhas `MELHORIA:`
Causa nova escolhida, uma só: **o `historico.md` e o Histórico do pedido não recebem o fim do cartão (Code review, QA, PR aberto, mescla), e as métricas saem estimadas pelo GitHub.** Já é a recorrência mais antiga do ciclo (068 a 092); a proposta formal só entra em `docs/kanban/melhorias.md` pelo `forge-placar propostas`, sem proposta aberta em paralelo, e fica com o `tech-lead` e o `agile-coach`.

MELHORIA: o `historico.md` tem só "Em andamento" (10:14) para K-265, K-266 e K-267, sem Code review, QA nem "Pronto", e a mescla dos PRs 308, 309 e 310 só aparece no `gh pr view` (mergedAt 13:42Z, 13:57Z, 13:58Z); medida: cartões com movimento de "Pronto" no `historico.md` até 1 h depois da mescla = 100% nos próximos 3 pedidos, por `forge-check movimento` ao registrar o merge do dono; recorrência do 068, 090, 091 e 092, já em ação aberta, fica só como dado.
MELHORIA: o Histórico do pedido ficou sem a abertura do PR 310 e sem a mescla dos PRs 308 e 310, e duas horas não batem com o `gh` (PR 308 aberto 10:41 contra 10:23; PR 309 mesclado 10:58 contra 10:57) (docs/pedidos/094-lote-testes-e-guia.md, entradas 10:41 e 10:58); medida: horas de PR no Histórico iguais ao `createdAt` e `mergedAt` do `gh pr view` (convertidas) = 100% nos próximos 3 pedidos, o Jarvis lendo o `gh` em vez da memória ao registrar; projeto.
MELHORIA: o ajudante `server/tests/ajuda-cli-filho.ts` está só no K-264 e o K-266 usa a cópia local no arquivo, com A1 do review pedindo a troca depois (docs/pedidos/094-lote-testes-e-guia.md, entradas 10:16 e 10:22): confirmar que a troca tem cartão e que os dois já estão na develop (PRs 305 e 309); sem duplicar; projeto.
MELHORIA: o A3 recomendado do K-267 (`QUEM` em maiúsculas) ficou como pendência do PR 310, sem cartão (docs/pedidos/094-lote-testes-e-guia.md, entrada 10:43); medida: recomendados de review sem devolução nem cartão no mesmo dia = 0 nos próximos 3 pedidos; projeto.
MELHORIA: o pedido não tem "Registro de clareza" e `conferencias.md` não tem linha de `entrega` do 094, apesar de "entrega conferida 9f4ecf99" no Histórico (docs/pedidos/094-lote-testes-e-guia.md, entrada 10:34; docs/kanban/conferencias.md, 14 linhas só de `brief`): recorrência do 090, 091 e 092, já em ação aberta, fica só como dado.
MELHORIA: o ciclo "lote de cartões técnicos sem arquivo em comum, em paralelo, um brief por etapa" fechou 3 PRs em 44 min de `Em andamento` (10:14) ao último merge (10:58), sem falha e com 14 de 14 briefs na 1ª conferência (docs/kanban/historico.md, K-265 a K-267; gh PRs 308 a 310): padrão a manter; medida: PRs de lote técnico mesclados em até 1 h da abertura do pedido sem falha = 3 de 3 nos próximos 3 lotes; projeto (dado, sem mudança proposta).

# Retrospectiva do pedido 092: melhorias técnicas da fila (K-121, K-172, K-174, K-264)

Fontes: `docs/pedidos/092-melhorias-tecnicas-fila.md` (Histórico inteiro), `docs/kanban/conferencias.md` (15 linhas do 092), `docs/kanban/historico.md` (K-121, K-172, K-174, K-264). Horas no relógio local (-03:00), de 2026-11-11. Processo, nunca pessoa. PRs: 307 (K-121), 303 (K-172) e 305 (K-264), mesclados na develop pelo dono entre 10:30 e 10:31; K-174 sem PR.

## 1. Dados do fluxo
| Marco | Hora | Intervalo |
|---|---|---|
| Pedido aberto (3 cartões: K-121, K-172, K-174) | 09:05 | |
| K-174 entregue sem efeito medido; branch sem PR | 09:22 | 17 min |
| Review do K-172 aprovado (A1 vira K-265) | 09:23 | |
| E5 (K-264) entra no lugar do K-174 (ESCOPO+); QA do K-264 aprovado | 09:25 e 09:42 | 17 min |
| PR 303 (K-172) aberto, checks verdes | 09:44 | |
| K-121 volta dividido por papel; QA com `contrato: 0` | 09:33 e 09:58 | 25 min |
| Review do K-121 aprovado | 10:03 | |
| PR 305 (K-264) aberto, CI verde | 10:19 | |
| PRs 303, 305 e 307 mesclados pelo dono | 10:30 e 10:31 | 11 min a 47 min de espera do dono por PR (develop congelada para a release 093 até então) |

- **Lead time (histórico.md, medido):** K-172, de "Pronto para fazer" (2026-10-28 17:45) a "Pronto" (11-11 10:30): 13 d 16 h 45 min. K-121, de "Pronto para fazer" (10-20 22:22) a "Pronto" (11-11 10:31): 21 d 12 h 09 min. K-264: 1h20 (reportado na retrospectiva do 091). Amostra de 3 cartões: sem percentis. O tempo longo de K-121 e K-172 é fila de "Pronto para fazer", não trabalho.
- **Cycle time:** **não medido**. Os três cartões vão de "Pronto para fazer" ou "Entrada" direto a "Pronto", sem "Em andamento", Code review nem QA no quadro (ação aberta desde o 068).
- **Dois relógios (D-4):** "pronto para fazer para develop" **não medido** (sem a linha de entrega em "Aguardando sua validação"); "pedido aberto para develop": 1h25 (09:05 a 10:30), **estimado** pelo Histórico do pedido, não pelo `forge-check voltas`.
- **Custo (movimento "Pronto", medido):** K-172 7 827 964 501 tokens, K-121 8 053 845 392 e K-264 133 244 210. O custo do K-174 não tem movimento de Pronto (voltou à fila): **não medido**. Custo por agente: `forge-check transcricao custo` não rodado, **não medido**.
- **Vazão:** 3 cartões em "Pronto" em 1 minuto (10:30 a 10:31); K-174 não entrou.
- **Retrabalho de cartão:** 0 devoluções de pai no `historico.md`. Retrabalho de etapa nos pareceres/Histórico: 1 (E1.1 do K-121 refeita pelo QA com `contrato: 0` no lugar de campos inventados, 09:36 para 09:58) e 1 entrega descartada (K-174, ganho dentro do ruído). Achados A1 dos reviews: 3 (K-172: guia-do-desenvolvedor.md:44, vira K-265; K-264: seed-recusa-real.pg.test.ts:108 com o mesmo padrão, vira cartão; K-121: linha em branco depois do frontmatter só nos 8 de docs/qa). QA do K-264: 0 bugs, mutação sem a pasta temporária derruba 31 testes.
- **Estabilidade (DORA):** 3 PRs mesclados, sem falha, reversão ou hotfix registrados; tempo de recuperação: não se aplica. Lead time de mudança por PR: **não medido** (sem hora do primeiro commit nesta delegação). A velocidade subiu sem queda de estabilidade; o maior intervalo foi a espera do dono, por regra.
- **Escape:** nenhum achado depois dos pareceres finais no Histórico.
- **Clareza:** o pedido não tem a seção "Registro de clareza", logo `PERGUNTA:`, `NAO-ENTENDI:` e `DEVOLVIDA:` são **não medidas**. Lido à mão: 0 perguntas ao dono; marcas do cabeçalho: 0 confirmado, 3 técnico, 0 suposição, 0 delegado (0%); 1 `ESCOPO+` técnico (E5 entrou no lugar do K-174); 0 `ERRO-JARVIS` no Histórico.
- Esperas, escapes, corrigidos, afrouxamentos (linha de base M14b): não rodados nesta delegação; **não medidos**.

### Briefs e conferências (15 linhas do 092)
15 briefs distintos, 15 conferências, todas de `brief`, **todas aprovadas na 1ª rodada** (0 reprovadas; 100% de aprovação na 1ª conferência). Classe de causa de reprovação: 0 em escopo, decisão, forma, prova, estado, etapa e ferramenta. **`conferencias.md` não tem linha de `entrega` do 092**: o Histórico do pedido registra "entrega conferida" em 09:15 (87079bef) e 09:36 (6d2e15be), mas nenhuma deixou número (como no 090 e no 091).

## 2. O que funcionou
- **Corte pequeno e sem arquivo em comum**: três cartões técnicos em paralelo; com o K-174 sem efeito, o Jarvis trocou por K-264 (ESCOPO+) em 3 min e o pronto local passou a rodar no sandbox (31 falhas antes, 0 depois).
- **Mudança sem efeito medido não entrou**: K-174 entregue, medido (26 a 67 ms o caso; custo real no `carregarInsumos`, ~1,2 s a frio) e deixado sem PR, com a pista registrada em vez de aumentar timeout ou retry.
- **Review achou o que seria replicado**: A1 do K-172 (guia do desenvolvedor) e do K-264 (outro teste com o mesmo padrão) viraram cartões no mesmo dia (K-265 em 09:23).
- **Brief controlado**: 15 de 15 aprovados na 1ª conferência.
- **Forma honesta no K-121**: `contrato: 0` em vez de parecer aprovado e bugs zero sem veredito.
- **Pedido aberto ao merge em 1h25**, 0 devoluções de cartão; nenhum bypass (`--no-verify`, `--force`, `--admin`).

## 3. O que atrapalhou (fatos)
- **K-121 com papel errado no primeiro brief e campos inventados no frontmatter.** O E1 foi adiado às 09:12 porque o tech-lead não grava em `docs/qa` nem em `docs/architecture`; voltou dividido por papel às 09:33. O QA entregou 7 dos 8 documentos com "parecer aprovado, bugs zero" sem veredito próprio (planos, medições, diagnósticos), corrigidos com `contrato: 0` às 09:58. Custo: cerca de 46 min entre o primeiro corte e a forma final.
- **K-174 sem causa reproduzida.** O teste gastava 26 a 67 ms; o custo estava no código do gerador, fora do brief. Uma entrega e uma rodada de brief sem efeito (09:22), K-174 de volta à fila com a pista.
- **Modelos de parecer ausentes no projeto.** O QA e o tech-lead não tinham modelo local do frontmatter do `docs/qa` e `docs/reviews` e o validador só aceita parecer aprovado ou reprovado e commit hexadecimal; planos e medições ficaram sem forma própria.
- **Merge da develop pelo dono durante a espera da CI do K-264** (09:57): a branch recebeu o merge, patch igual, pareceres continuaram valendo, CLEAN; sem custo medido, mas o commit extra foi conferido à mão.
- **Quadro incompleto, de novo** (recorrência do 068, 090 e 091): cycle time e dois relógios dos três cartões **não medidos**.
- **Pedido sem "Registro de clareza"** e sem linha de `entrega` em `conferencias.md`.

## 4. Ação (uma causa nova) e linhas `MELHORIA:`
Causa nova escolhida, uma só: **documentos sem veredito (planos, medições, diagnósticos) em `docs/qa` e `docs/reviews` não têm forma aceita pelo validador, e o K-121 só fechou depois de uma refação**. As demais são recorrências ou já têm cartão. A proposta formal entra em `docs/kanban/melhorias.md` só pelo `forge-placar propostas`, sem proposta aberta em paralelo.

MELHORIA: o validador `forge-check docs` só aceita parecer aprovado ou reprovado e commit hexadecimal, então 7 dos 8 documentos de `docs/qa` sem veredito (planos, medições, diagnósticos) receberam "aprovado, bugs 0" até a volta com `contrato: 0` (docs/pedidos/092-melhorias-tecnicas-fila.md, entradas 09:36 e 09:55; docs/kanban/historico.md, K-121); medida: documentos sem veredito corrigidos por campo inventado no frontmatter = 0 nos próximos 3 pedidos, com `parecer: n/a` para escopo plano; vai ao Forge.
MELHORIA: o primeiro brief do K-121 foi para o papel errado (tech-lead em `docs/qa` e `docs/architecture`, que são do qa-engineer e do software-architect) e o E1 foi adiado e refeito dividido por papel (docs/pedidos/092-melhorias-tecnicas-fila.md, entradas 09:12 e 09:33); medida: etapas com papel trocado depois do brief = 0 em 3 pedidos, conferindo o dono do diretório de destino na conferência do brief; vai ao Forge.
MELHORIA: o K-174 foi entregue como mudança no teste, mas o custo real estava no `carregarInsumos` do gerador, fora do brief, e a entrega ficou sem PR (docs/pedidos/092-melhorias-tecnicas-fila.md, entrada 09:22): já está no KANBAN.md (K-174 de volta a "Pronto para fazer", com a pista); fica só como dado.
MELHORIA: o guia do desenvolvedor ainda diz "pronto antes de cada commit" depois do K-172 (docs/pedidos/092-melhorias-tecnicas-fila.md, entrada 09:23): já tem o cartão K-265 (pedido 094, em andamento); fica só como dado.
MELHORIA: o teste `seed-recusa-real.pg.test.ts:108` tem o mesmo padrão de env só com PATH do K-264 (docs/pedidos/092-melhorias-tecnicas-fila.md, entrada 09:40): o A1 do review pediu cartão; confirmar que o cartão existe, sem duplicar (K-264 já está em Pronto); projeto.
MELHORIA: o merge da develop na branch do PR pelo dono durante a espera da CI (docs/pedidos/092-melhorias-tecnicas-fila.md, entrada 10:19, 09:57) obrigou a conferir "patch igual, pareceres valem" à mão; medida: PRs com merge da develop depois do parecer conferidos por `git range-diff` ou `git diff` citado no pedido = 100% nos próximos 3 pedidos; projeto.
MELHORIA: o quadro segue sem "Em andamento", Code review e QA nos cartões deste pedido, e `conferencias.md` sem linha de `entrega` (docs/kanban/historico.md, K-121, K-172, K-264; docs/kanban/conferencias.md, 15 linhas do 092 só de `brief`): recorrência do 068, 090 e 091; já em ação aberta, fica só como dado.

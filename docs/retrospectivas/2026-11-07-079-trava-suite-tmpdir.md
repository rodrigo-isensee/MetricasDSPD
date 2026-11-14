# Retrospectiva do pedido 079: trava da suíte única fora do /tmp fixo (K-201)

Data: 2026-11-07. Pedido: `docs/pedidos/079-trava-suite-tmpdir.md`. Mesclado na develop pelo dono às 11:59 (PR 263, squash b2105e54). Fala do processo, nunca de pessoa ou agente.

## Dados do fluxo (R-DECISAO: medido, estimado ou não medido)
- Pedido aberto 06:28, mesclado 11:59: 5h31 corridas (medido, pelo Histórico do pedido). Implementação, review e QA prontos às 07:09 (41 min depois da abertura, medido); o PR foi delegado só às 08:23 (1h14 de espera na fila de PRs em série, medido) e aberto às 08:38. Do PR aberto ao merge: 3h21 (medido). Percentis: não calculados (1 pedido, menos de 20 itens).
- Trabalho do time: E1.1 às 06:34, review 06:44, QA 06:56, conferência do QA 07:09 (medido).
- Esperando o dono: PR 263 BEHIND às 08:38 (update-branch pedido), feito às 09:40 (1h02); BEHIND de novo às 11:43 depois do merge do 264, mesclado às 11:59 (medido). Dois update-branch ao dono para um PR.
- Retrabalho, pelas conferências do 079 (`docs/kanban/conferencias.md`, linhas do 079): 5 briefs aprovados de 5 (devops-engineer-1, tech-lead-1, qa-engineer-1, tech-lead-2 e este, agile-coach-1; as linhas de brief do tech-lead-2 e do agile-coach conferi só pelo Histórico do pedido), 3 entregas conferidas e as 3 `cumpriu` (devops-engineer-1, tech-lead-1, qa-engineer-1); 0 `não cumpriu`, 0 devolvida. Bugs do QA: 0. Recomendados: 3 do review (A1 dono do diretório não conferido, A2 teste usa a trava real, A3 SC2174 sem anotação) e 2 do QA (A1 teste de link simbólico no caminho padrão, A2 TMPDIR provado só nesta sessão). Resultado de entrega do PR (tech-lead-2): não medido nas linhas lidas.
- Clareza (pedido): 0 confirmado, 2 técnico, 1 suposição, 0 perguntas, 0 delegado (medido, tags do pedido). Sem "não entendi", ESCOPO+/- ou DEVOLVIDA registrados: seção "Registro de clareza" ausente, então "não medido".
- DORA, só do que o pedido mostra: entrega 1 PR na develop; lead time de mudança, taxa de falha e tempo de recuperação: não medidos (nenhum comando rodado nesta retrospectiva).
- Custo em tokens: não medido (sem `forge-check transcricao custo` nesta etapa).

## O que correu bem
- O trabalho técnico saiu em 41 min sem retrabalho: teste do script com caso novo, vermelho na base (rc 2) e verde no pedido (rc 0), review e QA aprovados de primeira.
- O pedido abriu pela autonomia de melhoria técnica, com o discovery curto dentro da E1.1; o devops-engineer escolheu o caminho (`/tmp/claude-<uid>/`, fixo por usuário) e registrou o motivo: o dono no terminal e os agentes dividem a mesma trava.
- A suposição do pedido (TMPDIR = /tmp/claude-1000) foi confirmada e a escolha final a tornou menos dependente dela.
- Os cinco recomendados ficaram registrados nos pareceres, sem bloquear a entrega.

## O que travou (fatos)
1. O PR 263 ficou BEHIND da develop pela série de merges (258, 264, 260, 263): aberto às 08:38 já atrás de bc78a3b8, atualizado pelo dono às 09:40 (head 9401dc71), BEHIND de novo às 11:43 depois do merge do 264 (head 873dc755), e mesclado às 11:59 (Histórico do 079).
2. Cada update-branch muda o head e obriga novo `--match-head-commit`; o dono fez dois update-branch para este PR (08:38 e 11:43).
3. Uma mudança de 41 min de trabalho esperou 4h31 entre a conferência do QA e o merge (07:09 a 11:59, medido), quase toda em fila de PRs e espera do dono.
4. A suposição ("o sandbox grava em TMPDIR") só foi provada nesta sessão (QA A2): em outra sessão ou estação, não sabemos.

## Ações (até 3)
1. Tech-lead, com Jarvis: quando houver 3 ou mais PRs abertos, mesclar do menor para o maior ou pedir os update-branch em lote, num aviso só, antes do primeiro merge. Medida: update-branch por PR mesclado, alvo no máximo 1 (hoje 2 no 263); reforça a melhoria `(Projeto)` da retrospectiva do 081 sobre a série de merges, sem repeti-la.
2. Devops-engineer: criar o cartão dos recomendados QA A1 (link simbólico no caminho padrão) e review A1 (dono do diretório `/tmp/claude-<uid>`), com teste. Medida: recomendados do 079 sem cartão ou dispensa registrada = 0 em 7 dias.
3. Qa-engineer: na próxima sessão que rodar `pnpm run pronto` com a trava nova, registrar o valor de `TMPDIR` e o caminho da trava no parecer. Medida: sessões diferentes com a trava provada, hoje 1.

## MELHORIA
MELHORIA: (Projeto) a trava da suíte deve ter teste do link simbólico no caminho padrão e conferir o dono do diretório `/tmp/claude-<uid>` antes de usá-lo; problema: o caminho fixo em /tmp pode ser plantado por outro usuário da estação e só o caminho por variável tem teste de recusa de link; evidência: Histórico do 079 de 06:44 (review A1) e 06:56 (QA A1); medida: recomendados do 079 sem teste ou dispensa registrada = 0.
MELHORIA: (Forge) o qa-engineer deve registrar no parecer o valor real de `TMPDIR` e a data da prova quando uma suposição do pedido depende do ambiente do sandbox; problema: a suposição ficou "confirmada só nesta sessão" sem registro para a próxima; evidência: Histórico do 079 de 06:34 e 06:56 (QA A2); medida: pareceres de pedidos com suposição de ambiente que trazem o valor medido, alvo 100%.

## Linha de base (M14b)
`forge-check esperas`, `escape resumo`, `corrigidos` e `afrouxamentos`: não rodados nesta retrospectiva (fora do escopo do brief); não medido. Nenhuma das melhorias acima afrouxa controle.

## Revisão das ações da retrospectiva anterior
Não revisadas aqui: o brief pede só esta retrospectiva. O K-201 nasceu como MELHORIA vista na E1.6 do pedido 063 (trava presa ao /tmp fixo) e foi entregue e mesclada; o efeito (pronto de agente sem falha por trava) fica não medido até a próxima rodada de `pnpm run pronto` no sandbox.

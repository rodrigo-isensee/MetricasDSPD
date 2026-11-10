# Retrospectiva do pedido 081: entradas de referência dizem a categoria do erro (K-241)

Data: 2026-11-07. Pedido: `docs/pedidos/081-categoria-erro-entradas.md`. Mesclado na develop pelo dono às 11:35 (PR 264, squash 69225fc4). Fala do processo, nunca de pessoa ou agente.

## Dados do fluxo (R-DECISAO: medido, estimado ou não medido)
- Pedido aberto 08:04, mesclado 11:35: 3h31 corridas (medido, pelo Histórico do pedido). Entrega pronta para o PR às 08:48 (44 min depois da abertura); as 2h47 restantes foram espera de merge (medido, mesma fonte). Percentis: não calculados (1 pedido, menos de 20 itens).
- Trabalho do time: E1.1 às 08:25, segurança 08:33, review 08:41, QA 08:47: 4 etapas em 43 min depois da abertura (medido).
- Esperando o dono ou o sandbox: PR 264 aberto às 09:28 e mesclado às 11:35, 2h07 (medido); dois `gh pr merge` barrados no GraphQL e um `update-branch` pedido ao dono duas vezes (09:28 e 09:40).
- Retrabalho, pelas conferências do 081 (`docs/kanban/conferencias.md`, linhas do 081): 1 brief reprovado de 8 briefs (node-backend-1, motivo `forma`: regra do push citada do 075 sem registro no 081); 1 entrega não cumprida de 5 conferidas, motivo `ambiente` (agile-coach-1, hook R-REVIEW). Bugs do QA: 0. Achados do review: 2 (A1 cabeçalho desatualizado, A2 outra entrada com a mensagem antiga, virou K-244). Recomendado do QA: 1 (A1, `ac:ref-sync` sem teste da saída nova). O resultado de entrega do PR (tech-lead-2) não aparece nas linhas do 081 que li: não medido.
- Clareza (pedido): 0 confirmado, 2 técnico, 1 suposição, 0 perguntas, 0 delegado (medido, tags do pedido). Sem "não entendi", sem ESCOPO+/-, sem DEVOLVIDA registrados: seção "Registro de clareza" ausente, então "não medido".
- DORA, só do que o pedido mostra: entrega 1 PR na develop; lead time de mudança, taxa de falha e tempo de recuperação: não medidos (nenhum comando rodado nesta retrospectiva; `forge-check` e `gh` não foram usados).
- Custo em tokens: não medido (sem `forge-check transcricao custo` nesta etapa).

## O que correu bem
- A implementação saiu de primeira em 40 min e passou por segurança, review e QA sem bug: 22 testes, vermelhos na base, 6 mutantes mortos, 0 vazamento de senha, URL, host ou texto do banco.
- Segurança e review rodaram em sequência curta (08:28 a 08:41), com a suposição do pedido confirmada pelo parecer de segurança.
- A decisão técnica do Jarvis de 08:05 (regra de push do 075) evitou push preso.
- A conferência pegou uma frase atribuída ao arquivo errado na Suposição e a corrigiu no mesmo dia.

## O que travou (fatos)
1. `gh pr merge` do PR 264 barrado pelo sandbox no GraphQL às 09:28, duas vezes, sem `--admin`. O mesmo bloqueio atingiu o PR 258 às 10:01 (mesmo comando que passou no PR 260); o PR 258 só passou numa nova tentativa às 11:00. O PR 264 esperou até as 11:35 (Histórico do 081 e do 073).
2. Série de merges: cada squash na develop deixa os outros PRs abertos BEHIND (258, 263, 264 e 261). Cada um pede `update-branch` do dono, e o head muda, o que obriga novo `--match-head-commit`. O PR 264 foi atualizado duas vezes (c21f1747, depois 26bd5967).
3. O hook R-REVIEW recusou o commit da primeira tentativa desta retrospectiva na branch `docs/jarvis-2026-10-23` ("sem parecer para o pedido 073 (e mais 1)"): a branch está atrás da develop (base ae009a75, 1521 arquivos de diferença) e o hook lê os pedidos do diff. Custo: uma delegação perdida (agile-coach-1) e um brief novo (agile-coach-2).
4. Ainda nesta etapa: `git fetch origin develop` na worktree 052e falhou no sandbox (`CONNECT tunnel failed, response 403`, github.com:443 fora da lista); a branch foi criada do sha do brief, que já estava no repositório local.

## Ações (até 3)
1. Jarvis, com tech-lead: abrir o PR de documentação e as próximas branches de documentação sempre da develop atual, nunca de `docs/jarvis-2026-10-23`. Medida: commits recusados por R-REVIEW por diff antigo = 0 nas próximas 5 retrospectivas.
2. Jarvis: quando o merge do tech-lead for barrado pelo sandbox no GraphQL, registrar a lista exata de hosts da primeira tentativa e tentar uma vez só antes de pedir ao dono. Medida: minutos entre o PR CLEAN e o merge (hoje 2h07 no 264).
3. Tech-lead: quando houver 3 ou mais PRs abertos, pedir os `update-branch` ao dono em lote, depois de cada merge, num único aviso. Medida: avisos de `update-branch` por PR, hoje 2 no PR 264.

## MELHORIA
MELHORIA: (Forge) `forge-check entrega` em merge de integração não deve acusar "união de briefs" pelos merges da base; problema: veredito "não cumpriu" sem mérito no PR 258 (73, 11:33) e no PR 260 do 075; evidência: Histórico do 073 de 11:33; medida: conferências de merge com veredito `não cumpriu` só por esse aviso = 0.
MELHORIA: (Forge) o hook R-REVIEW deve dizer a causa quando a branch está muito atrás da base ("branch com N arquivos de diferença da develop") em vez de só "sem parecer para o pedido X"; problema: o agile-coach-1 e o Jarvis gastaram uma delegação até achar a causa; evidência: conferência de 11:46 do 081 (ambiente) e Histórico do 081 de 11:46; medida: recusas do R-REVIEW sem a causa nomeada = 0, e minutos entre recusa e causa conhecida.
MELHORIA: (Projeto) o sandbox do tech-lead deve permitir `api.github.com` com o GraphQL já na lista de hosts do merge; problema: `gh pr merge` barrado em 3 de 4 tentativas de hoje (264 duas vezes, 258 duas, 260 passou); evidência: Histórico do 073 de 10:01 e do 081 de 09:28; medida: PRs com `gh pr merge` barrado por sandbox por semana = 0 e minutos de PR CLEAN até o merge.
MELHORIA: (Projeto) a série de merges deixa os PRs abertos BEHIND; tentar a fila de merge ou `update-branch` pelo tech-lead com o aval prévio do dono; problema: 4 PRs BEHIND ao mesmo tempo e update-branch repetido pelo dono; evidência: Histórico do 081 de 09:40 e do 073 de 11:00; medida: `update-branch` pedidos ao dono por PR mesclado, alvo no máximo 1.

## Linha de base (M14b)
`forge-check esperas`, `escape resumo`, `corrigidos` e `afrouxamentos`: não rodados nesta retrospectiva (sandbox sem rede e fora do escopo do brief); não medido. Nenhuma das melhorias acima afrouxa controle.

## Revisão das ações da retrospectiva anterior
Não revisadas aqui: o brief pede só esta retrospectiva; a melhoria que originou o pedido (K-241, retrospectiva do 076, passo 4 da publicação local falhou sem a causa) foi entregue e mesclada. O resultado do efeito (falhas sem categoria na próxima publicação local) fica não medido até a próxima publicação.

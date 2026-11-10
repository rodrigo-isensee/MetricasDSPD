# Retrospectiva do pedido 083: pre-push com lint só nos arquivos alterados

Data: 2026-11-10. Escopo: `.githooks/pre-push` com eslint só nos `.ts`/`.tsx` alterados contra a base, com cache, sem lint em push só de documentação; a CI segue com `eslint .` inteiro. PR 268 mesclado pelo dono na develop (2026-11-09, 06:12Z); o typecheck só nos pacotes alterados veio no PR 270 (decisão do dono, fora deste pedido).

## Dados do pedido (marca R-DECISAO)
- Conferências do 083 (`docs/kanban/conferencias.md`, linhas do pedido): `medido`. Briefs: 10 conferidos (8 aprovados, 2 reprovados: devops-engineer-2 em 2026-11-08 20:13, por não dizer que `.githooks` é do dono; agile-coach-1 em 2026-11-09 10:20, por citar o cherry-pick sem a decisão técnica). Entregas: 6 conferidas (3 cumpriram, 3 não cumpriram).
- Retrabalho: 3 de 6 entregas `não cumpriu` (50%), nenhuma por defeito do código: escopo 1 (o commit e19c23b3 do dono em `.githooks` entrou no intervalo), ambiente 1 (limitação do `forge-check` com commit do dono, K-245), base 1 (corrida: o Desde mudou durante a rodada do QA). Amostra de 6: valores brutos, sem percentil. Review, QA e segurança: 0 bugs, 4 achados recomendados (A1 e A2 do review, repetidos no QA e na segurança).
- Lead time (Histórico do pedido: 2026-11-08 20:01 a 2026-11-09 03:13, merge do dono): cerca de 7 h 12 min, `estimado` (horas do Histórico do pedido; o `historico.md` do quadro não foi lido). Cycle time, vazão e DORA: `não medido`. A retrospectiva (E1.5) só começou 2026-11-09 10:19 e passou por uma volta por causa do `git switch -c` (abaixo).
- Escape: nenhum bug achado depois do QA; `forge-check escape` não se aplica.
- Clareza (tags do pedido): 0 perguntas, 1 confirmado, 3 técnico, 1 suposição, 0 delegado; 0 `ESCOPO+:` com tag, embora E1.6 (segurança) tenha sido acrescentada por DECISÃO TÉCNICA em 2026-11-09 02:07; 0 `DEVOLVIDA:`.

## O que correu bem
- O dono respondeu "A" com a opção descrita, o recibo foi confirmado e o trabalho começou no mesmo minuto.
- O hook novo cumpriu o objetivo: o push da 083 saiu em cerca de 30 s com "lint pulado" (Histórico de 2026-11-09 02:00), contra o corte de 15 min do push anterior.
- A recusa do hook R-CONFORMIDADE a `.githooks/` não foi contornada: virou ação do dono, cumprida em 3 h, e o agente seguiu com o que não tocava o hook (scripts, teste com 6 casos, parecer de devops).
- Review, segurança e QA aprovaram sem bug, com testes e 2 mutantes mortos; os três recomendaram o mesmo par (A1 `--` antes da lista, A2 `-z`).

## O que atrapalhou (fatos)
- O brief do devops-engineer-1 não previu que `.githooks/` é do usuário; a E1.1 não cumpriu e custou uma volta (Histórico de 2026-11-08 20:04, conferência 20:13).
- Os pushes ficaram presos antes do typecheck só nos alterados: o do security-engineer-1 encerrou no corte de 15 min (02:27) e os de 8a, 4c e 3b estouraram 40 min (Histórico de 2026-11-09 08:12), porque o typecheck seguiu inteiro e a máquina estava carregada por QA ao mesmo tempo; esperaram o PR 270.
- O guarda de lint do dono encerrava pushes de agentes como processos órfãos, e o comando de push em segundo plano contribuía para isso. Os dois pontos vêm do relato da delegação desta rodada; a evidência (saída do guarda) não foi lida aqui: `não medido`.
- O `git switch -c docs/retros-2026-11-09 origin/develop` na 052h criou a branch e levou índice e arquivos à develop, mas o HEAD ficou em outra branch, e o cherry-pick recusou e deixou o sequencer (Histórico de 2026-11-10 08:58). O mesmo sintoma ocorreu na 052e e no `switch -c` do 082 (23 entradas staged, 2026-11-07). Custou 2 delegações.
- A conferência de entrega do `forge-check` acusou "união de briefs" com o commit do dono no intervalo (K-245), repetida duas vezes sem mérito.
- A worktree 052e ficou com staging de operação interrompida; segue intocada.

## Ações (até 3)
1. Pre-push com duração medida. Responsável: devops-engineer. Mudança: o hook imprime a duração (lint e typecheck) no fim; o Jarvis lê no relatório do push. Medida: pushes de agente acima de 10 min por semana = 0 (hoje: 1 de 15 min e 3 de 40 min no dia 2026-11-09).
2. Brief que toca `.githooks/` diz de saída que o arquivo é do dono. Responsável: Jarvis. Mudança: o texto de brief de hooks traz "o diff vai ao dono". Medida: entregas `não cumpriu` por recusa de `.githooks/` = 0.
3. `git switch -c` na worktree com HEAD de outra branch confere `branch --show-current` antes de qualquer commit ou cherry-pick. Responsável: tech-lead. Medida: delegações de recuperação por HEAD trocado = 0 por semana (hoje: 3 em 2 dias).

## Linhas MELHORIA: (R-DECISAO, "Melhoria vista")
MELHORIA: (Forge) o brief de delegação que toca `.githooks/` deve dizer que o arquivo é do usuário e que o agente entrega o diff para o dono aplicar; problema: a E1.1 não cumpriu porque o hook R-CONFORMIDADE recusou a edição de `.githooks/` e o brief não previa isso; evidência: Histórico do 083 de 2026-11-08 20:04 e conferência de 20:13 (devops-engineer-2, `escopo`); medida: entregas `não cumpriu` por recusa de `.githooks/` por mês = 0.
MELHORIA: (Projeto) o pre-push deve imprimir a duração de cada etapa (lint e typecheck) e ter corte registrado; problema: pushes de agentes presos por 15 e 40 min antes do typecheck só nos alterados, sem número de duração no registro; evidência: Histórico do 083 de 2026-11-09 02:27 (corte de 15 min) e 08:12 (3 pushes acima de 40 min, PR 270); medida: pushes de agente acima de 10 min por semana = 0.
MELHORIA: (Projeto) o guarda de lint do dono não deve encerrar como órfão o processo de push em curso, e o push de agente roda em primeiro plano com timeout; problema: pushes mortos como órfãos e comando em segundo plano, relato da delegação (saída do guarda não lida nesta retrospectiva); evidência: Histórico do 083 de 2026-11-09 08:12 (pushes presos) e brief desta rodada; medida: pushes encerrados pelo guarda por semana = 0, após o dono dizer onde fica o guarda.
MELHORIA: (Forge) o `git switch -c <nova> origin/develop` em worktree com HEAD de outra branch deve ser substituído, na instrução do tech-lead e do agile-coach, por `git worktree add` ou por conferir `branch --show-current` e `status --short` logo depois; problema: o HEAD não trocou, o índice ficou igual à develop e o sequencer ficou preso, em 3 worktrees (052e, 052g no 082, 052h); evidência: Histórico do 083 de 2026-11-10 08:58 e retrospectiva `2026-11-07-082-conflito-pr-256.md` (o `switch -c` interrompido); medida: delegações de recuperação por HEAD trocado por semana = 0.

Não repetem as das retrospectivas trazidas (`2026-11-07-079-trava-suite-tmpdir.md`, `...-080-testes-instaveis-web.md`, `...-081-categoria-erro-entradas.md`, `...-082-conflito-pr-256.md`). A do `forge-check entrega` com "união de briefs" e commit do dono (K-245) já está em `2026-11-07-081-categoria-erro-entradas.md` (`forge-check entrega` em merge de integração), e a do 083 de 2026-11-09 02:04 é a mesma; não vira linha nova.

## Revisão das ações anteriores
Não há retrospectiva anterior deste pedido. As ações do 079 ao 082 seguem abertas nos arquivos próprios; a recorrência do `switch -c` (082 e 083) entra como dado na última linha MELHORIA acima.

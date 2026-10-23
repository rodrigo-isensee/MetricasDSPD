Jarvis, sou o dono. Trago melhorias de fábrica observadas no projeto MetricasDSPD (Forge 0.28.0), depois da lista F1 a F20 que já levei em 2026-10-23. Cada uma vale para todos os projetos. Abra um cartão por melhoria e um PR por melhoria para a develop do Forge (skill contribuir-com-o-forge), com o problema, a evidência e como medir o efeito. O que mudar processo, custo ou controle volta para mim como decisão, uma por vez, com recomendação.

## F21. Pre-push falha em worktree nova sem dependências instaladas
- Problema: numa worktree recém-criada não há `node_modules`, e o pre-push (lint e typecheck) falha com "eslint: not found". O agente só descobre na hora do push e precisa rodar o `pnpm install` antes.
- Evidência: QA da promoção do MetricasDSPD, 2026-10-23, worktree `-promo`: primeira tentativa de push barrada; resolvida com `pnpm install --frozen-lockfile`.
- Sugestão: o roteiro de criar worktree (skill ou modelo de brief) inclui o `pnpm install --frozen-lockfile` logo depois do `git worktree add`, ou o pre-push avisa "rode pnpm install" em vez de "eslint: not found".
- Medida: pushes barrados por dependência ausente em worktree nova = 0.

## F22. PR de release homolog → main criado vazio por automação, e a corrida do homolog-aprovada
- Problema: um workflow cria o PR `homolog` → `main`, vazio e com o título "Homolog", assim que a homolog avança. O `gh pr create` do tech-lead falha com "already exists", e o check `homolog-aprovada` desse PR roda antes de o portão da homolog terminar, e fica vermelho por corrida.
- Evidência: PR #144 do MetricasDSPD, 2026-10-23: `homolog-aprovada` falhou às 16:35:58Z com "portão de homolog sem sucesso em 7486836", enquanto o job `portao` do mesmo sha terminou verde logo depois; foi preciso rodar o check de novo.
- Sugestão: o modelo de CI/CD da fábrica cria o PR de release só depois do portão verde (ou o `homolog-aprovada` espera o portão terminar em vez de falhar), e o fluxo de release documenta que o passo do tech-lead é `gh pr edit` no PR existente.
- Medida: checks `homolog-aprovada` vermelhos por corrida = 0; tentativas de `gh pr create` duplicado = 0.

Agente destino: forge:qa-engineer
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: 5f2e79b2b793de2f5771aace7659cd03fa31c74d
Etapa: qa   Cobre: E1.10

## Objetivo
Regravar o parecer de QA do 066 na ponta a54ac8d2b72e29a3399d51142d572806954252c9, depois do merge da develop (pedido 066, E1.10, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff 7073c1ce637d2ecd42c5a34a396e15c530b76f67 a54ac8d2b72e29a3399d51142d572806954252c9` (o merge da develop; para o 066 só muda docs/api/metricas.md).
- o seu parecer `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/066-s8.md`.

## Entregar
- "E1.10 (qa-engineer): parecer de QA regravado na ponta depois do merge da develop." (E1.10)
- (E1) (E2) (E1.10) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/066-s8`; rodar com no máximo 2 workers o vitest do server e do web e o `pnpm run docs:check`, porque o merge trouxe o 065 e o 067; regravar `docs/qa/066-s8.md` com `commit: a54ac8d2b72e29a3399d51142d572806954252c9`, o resultado real e veredito; commit só do parecer; push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/066-s8`; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 16:23: E1.8 parcial pelo tech-lead: merge da develop em a54ac8d (conflito só numa linha de docs/api/metricas.md, as duas seções mantidas, sem código); docs:check ok; forge-check pr pede parecer novo de review e QA (delta só em docs/api/metricas.md). DECISÃO TÉCNICA (Jarvis): review (E1.9) e QA (E1.10) regravam ao mesmo tempo citando a ponta nova; depois o merge do PR 216 (E1.11).
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*`.
- Outro parecer é regravado ao mesmo tempo nesta worktree: pull antes do commit; commit só do próprio parecer com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-217' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos e repita.
- O parecer é gravado inteiro pela ferramenta Write, com `commit: a54ac8d2b72e29a3399d51142d572806954252c9`; achados de até 300 caracteres, severidade só entre parênteses.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- NÃO tocar: código, testes, o outro parecer, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): trazer a develop para a branch do 066 resolvendo o conflito em docs/api/metricas.md (as duas seções ficam), revalidar pelo forge-check pr e mesclar o PR 216." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): review regravado na ponta depois do merge da develop." · etapa de outra delegação; continua no pedido
- "E1.11 (tech-lead): merge do PR 216." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/066-s8:docs/qa/066-s8.md` · espera: contém 'commit: a54ac8d2b72e29a3399d51142d572806954252c9'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
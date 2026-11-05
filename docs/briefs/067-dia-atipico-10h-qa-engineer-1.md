Agente destino: forge:qa-engineer
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: qa   Cobre: E1.3

## Objetivo
QA do 067 (dia atípico acima de 10 h) na ponta 4181b56a1c8be5f07f03383a0b0ac29818ebb270 (pedido 067, E1.3, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/067-dia-atipico`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/develop...4181b56a1c8be5f07f03383a0b0ac29818ebb270`; `/home/rodrigoisensee/MetricasDSPD-052f/docs/api/apontamento.md`.

## Entregar
- "E1.3 (qa-engineer): QA." (E1.3)
- (E1) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/067-dia-atipico`; rodar com no máximo 2 workers o vitest de packages/metricas (com cobertura), do server e do web, e o `pnpm run docs:check`; conferir a fronteira (10 h não, 10 h e 1 min sim) e que a tela mostra o limite vindo da API; parecer em `docs/qa/067-dia-atipico.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/067-dia-atipico`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 14:34: E1.1 cumprida pelo node-backend: feature/067-dia-atipico em 4181b56a1c8be5f07f03383a0b0ac29818ebb270 (push ok): limite de 10 h numa constante única da biblioteca, lida pelo server; versão de critério 067:limite-dia-atipico (vigência 2026-11-04 só vai ao banco quando o dono rodar criterios-apontamento 2026-11-04); web lê o limite da API (só fixture e teste mudaram); docs/api/apontamento.md e o plano 059 atualizados; teste de 10 h e 1 min atípico e 10 h não; metricas 1258 e server 1615 com cobertura 100%, web 1420; docs:check ok; o teste com banco foi ajustado e não rodou. DECISÃO TÉCNICA (Jarvis): review (E1.2) e QA (E1.3) em paralelo na ponta 4181b56; sem revisão de interface (a tela só lê o valor da API); o dono roda criterios-apontamento e test:pg depois do deploy.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Outro parecer é gravado ao mesmo tempo nesta worktree: pull antes do commit; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-218' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos e repita.
- O parecer é gravado pela ferramenta Write (inteiro), com `commit: 4181b56a1c8be5f07f03383a0b0ac29818ebb270`, veredito e bloco `## Achados` (até 300 caracteres cada, severidade só entre parênteses).
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- NÃO tocar: código, testes de outros, o outro parecer, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/067-dia-atipico:docs/qa/067-dia-atipico.md` · espera: contém 'commit: 4181b56a1c8be5f07f03383a0b0ac29818ebb270'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
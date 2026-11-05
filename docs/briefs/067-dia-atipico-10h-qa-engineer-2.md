Agente destino: forge:qa-engineer
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: qa   Cobre: E1.6

## Objetivo
Regravar o parecer de QA do 067 na ponta 46ea94151e1d33658d6dea295400cc338e324a11 (só formatação depois do QA anterior) (pedido 067, E1.6, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/067-dia-atipico`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 4181b56a1c8be5f07f03383a0b0ac29818ebb270 46ea94151e1d33658d6dea295400cc338e324a11 --stat`; o seu parecer `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/067-dia-atipico.md`.

## Entregar
- "E1.6 (qa-engineer): parecer de QA regravado na ponta depois da formatação." (E1.6)
- (E1) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/067-dia-atipico`; rodar com no máximo 2 workers o vitest de packages/metricas e `pnpm exec prettier --check web packages tools`; regravar `docs/qa/067-dia-atipico.md` inteiro pela ferramenta Write com `commit: 46ea94151e1d33658d6dea295400cc338e324a11`, o resultado real e veredito; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-218' -- docs/qa/067-dia-atipico.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/067-dia-atipico`; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 15:39: E1.5 cumprida pelo tech-lead: formatação em 46ea94151e1d33658d6dea295400cc338e324a11 (só a reexportação do index.ts; prettier sem achado); review regravado em 3646202 (commit: 46ea941), aprovado. DECISÃO TÉCNICA (Jarvis): E1.6 com o QA regravando o parecer em 46ea941; depois E1.7, o merge do PR 215.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): formatação do index.ts do apontamento que o check rapida acusou, com o review regravado na ponta nova." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): merge do PR 215 por squash com a CI verde." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/067-dia-atipico:docs/qa/067-dia-atipico.md` · espera: contém 'commit: 46ea94151e1d33658d6dea295400cc338e324a11'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
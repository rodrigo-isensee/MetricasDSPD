Agente destino: forge:tech-lead
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: review   Cobre: E1.5

## Objetivo
Formatar o index.ts que o check rapida do PR 215 acusou e regravar o review na ponta nova (pedido 067, E1.5, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/067-dia-atipico`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/packages/metricas/src/businessmap/apontamento/index.ts`; o seu parecer `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/067-dia-atipico.md`.

## Entregar
- "E1.5 (tech-lead): formatação do index.ts do apontamento que o check rapida acusou, com o review regravado na ponta nova." (E1.5)
- (E1) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/067-dia-atipico`; `cd /home/rodrigoisensee/MetricasDSPD-052f && pnpm exec prettier --write packages/metricas/src/businessmap/apontamento/index.ts` (só formatação); `pnpm exec prettier --check web packages tools` sem achado; `git -C /home/rodrigoisensee/MetricasDSPD-052f add packages/metricas/src/businessmap/apontamento/index.ts` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-218'` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/067-dia-atipico`; anote a ponta; regravar `docs/reviews/067-dia-atipico.md` pela ferramenta Write com `commit:` = a ponta anotada e veredito (delta só de formatação); commit só do parecer; push; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 15:31: E1.4 parcial pelo tech-lead: PR 215 aberto (develop), sem merge: o check rapida falhou no format:check em packages/metricas/src/businessmap/apontamento/index.ts (run 41885563715); testes, banco, build, imagem, openapi e segurança passaram no push; forge-check pr limpo antes de abrir. DECISÃO TÉCNICA (Jarvis): E1.5 com o tech-lead (prettier só nesse arquivo, commit com -m, review regravado na ponta nova) e depois E1.6 com o QA regravando o parecer; então o merge no PR 215.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código além da formatação desse arquivo, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): parecer de QA regravado na ponta depois da formatação." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --format=%H -1 origin/feature/067-dia-atipico -- packages/metricas/src/businessmap/apontamento/index.ts` · espera: linhas=1
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052f log --format=%H -1 origin/feature/067-dia-atipico -- docs/reviews/067-dia-atipico.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
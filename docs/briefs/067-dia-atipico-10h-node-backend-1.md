Agente destino: forge:node-backend
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: codigo   Cobre: E1.1

## Objetivo
Trocar o limite do dia atípico do apontamento de 16 h para 10 h, com versão de critério com data (pedido 067, E1.1, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch nova `feature/067-dia-atipico`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/server/src/modulos/apontamento/servico.ts` (linha 14), `/home/rodrigoisensee/MetricasDSPD-052f/packages/metricas/src/businessmap/apontamento/tipos.ts` (linha 53) e onde mais o 16 aparece no apontamento (server, pacotes, web e docs); `/home/rodrigoisensee/MetricasDSPD-052f/server/src/modulos/apontamento/repositorio.ts` (linha 108, versões de critério do apontamento).

## Entregar
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." (E1.1)
- (E1) (E1.1) `git -C /home/rodrigoisensee/MetricasDSPD-052f status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052f switch -c feature/067-dia-atipico origin/develop --no-track`; trocar o limite do dia atípico para 10 h em todos os lugares onde o 16 é esse limite (código, textos da tela e documentação), sem mudar os outros limites; registrar a mudança de critério com data (2026-11-04) como as outras versões do apontamento; testes ajustados e um teste que prova 10 h e 1 min atípico e 10 h não; vitest do server, dos pacotes e do web com no máximo 2 workers; cobertura no padrão do projeto; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-218' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/067-dia-atipico`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 14:14: recibo confirmado pelo dono: "o demais pode seguir por enquanto". Sem gatilho de segurança. Sem discovery novo: troca de um valor já desenhado pelo UX (P-4) e pelo arquiteto, com o padrão T2.6. DECISÃO TÉCNICA (Jarvis): E1.1 com o node-backend na worktree 052f (limpa), branch nova feature/067-dia-atipico a partir da origin/develop.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data e marcada nos gráficos (T2.6); nenhuma métrica por pessoa (o dia atípico só marca, nunca descarta nem expõe a pessoa).
- Se a troca mudar o contrato da API, rode `pnpm run docs:check` e, se acusar mudança incompatível, pare e relate.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: os outros cinco limites, outras métricas, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052f ls-remote origin feature/067-dia-atipico` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052f && pnpm run docs:check` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
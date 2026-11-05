Agente destino: forge:react-frontend
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: codigo   Cobre: E1.3

## Objetivo
Ajustar os textos do cartão do S8 (dados insuficientes por falta de preenchimento do campo no Acelerato, coluna Com resposta, nota) e o E2E COMP-12, pelo desenho (pedido 066, E1.3, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`, ponta baf0b8e.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/analises/066-desenho.md` (parte do web e do E2E); o cartão do S8 e o `AmostraInsuficiente` em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/web/src/`; o E2E COMP-12 em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/e2e/`.

## Entregar
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." (E1.3)
- (E2) (E1.3) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 branch --show-current` deve dar `feature/066-s8`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/066-s8`; ajustar os textos do cartão do S8 conforme o desenho (quando não publica, dizer que falta preencher o campo de reabertura no Acelerato; coluna Com resposta; nota do S8; leitura só quando publica); testes do web e o E2E COMP-12 atualizados; typecheck, lint e format verdes; vitest do web com no máximo 2 workers; commits com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-217' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/066-s8`; sem PR.
- (E1) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 14:37: E1.2 cumprida pelo node-backend: feature/066-s8 em baf0b8e37c43ac81a387771283ba85e56b1a412a (push ok): extrasAC marca sem_resposta e null como ausentes; versão de critério 066:S8-com-resposta; testes do M5 (9 com resposta: insuficiente, nunca 0%) e das fronteiras 19 e 20; docs/api/metricas.md; contrato sem mudança de forma; docs:check ok; a worktree precisou de pnpm install offline (faltava o mariadb). DECISÃO TÉCNICA (Jarvis): E1.3 com o react-frontend na mesma worktree, depois do back: textos do cartão do S8 e o E2E COMP-12.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa em `server/` nem em `packages/`; se o contrato precisar mudar, pare e relate.
- Recursos: uma tarefa pesada por vez, vitest e playwright com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `server/`, `packages/`, outras métricas, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 ls-remote origin feature/066-s8` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff --name-only baf0b8e37c43ac81a387771283ba85e56b1a412a origin/feature/066-s8` · espera: contém 'web/'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
# Retomada do Jarvis (estado salvo antes do reinício para o Forge 0.30.5)

Salvo em 2026-10-29, depois das decisões do dono das 07:05 a 07:07. Nenhum agente em curso (todos concluídos). Branch do repositório principal: docs/jarvis-2026-10-23.

## Ao retomar (primeiro)
1. Confirmar que o plugin carregado é o 0.30.5 (caminho do forge-check passa a ser .../forge/0.30.5/bin/forge-check) e que `.forge/run/versao-nova` não diz mais `defasado: true`. O `.forge/versao` é do dono (atualização via PR numa branch do projeto).
2. Regerar e reconferir os briefs com o forge-check novo; disparar em paralelo, dentro de R-TETO e da regra do dono "no máximo uma suíte de teste por vez e poucos agentes em paralelo".

## Fila (pedido 048, docs/pedidos/048-o-que-falta-em-mock.md)
- E5.5 (tech-lead-11, sha 2f73095d…): worktrees 048c (`feature/048-ajustes-back`) e 048d (`feature/048-ajustes-front`) em 7c94348; refazer a conferência formal da entrega.
- E3.1 node-backend-5 (`docs/briefs/048-o-que-falta-em-mock-node-backend-5.md`, sha 309459ef…): mérito aprovado, reprovado só pela versão; regerar blocos e reconferir, depois delegar (K-129, K-093, O23) na 048c.
- E3.2 react-frontend (K-128, K-126, K-133) e E3.3 software-architect (K-127, ADR 0021) na 048d: briefs a escrever.
- E4.1 volta 2 (react-frontend) na 048b `feature/048-usabilidade`: DECISÃO DO DONO 048-03 = A (barra de filtros sem sticky a partir de 768 px; só cabeçalho e índice fixos; CA-A a CA-E em docs/ux/revisao-geral-usabilidade/05-parecer-048-03.md). Depois: re-review tech-lead (f82b656..head, inclui bugs 048-01, 048-02, A4 e specs do QA), segurança se gatilho, reteste QA, revisão UX (E4.3), PR. Depois o E4.2 (K-075).
- K-178 (DECISÃO DO DONO = A): dompurify para 3.4.17 em branch própria; security-engineer avalia impacto, tech-lead sobe versão, review/segurança/QA, PR para develop. Mover cartão da Entrada.
- E5.3 retro do 048 no fim.

## Pedido 047 (docs/pedidos/047-pendencias-decididas-2026-10-28.md)
- K-164: commit local a779854 em ~/.forge-contrib/MetricasDSPD-wt/k164, sem push (pre-push do Forge falhou). AÇÃO DO DONO: push pelo terminal. Depois: conferente, E3.2 a E3.5 e E5.1 (retro).

## Pedido 043 (docs/pedidos/043-forge-f21-f22.md)
- K-153 (DECISÃO DO DONO = B): conferir se o `forge-check pr` da 0.30.5 lê os pareceres no clone de contribuição. Se ler: tech-lead abre o PR do F22. Se não: dono abre pelo terminal com docs/analises/043-f22-corpo-do-pr.md e vira MELHORIA ao Forge.
- K-152 (F21): aplicar o patch, ação do dono. Arquivos 043 não versionados no repositório principal (docs/devops, qa, reviews, security 043-f22-release, 043-forge-f21-f22-ameacas) e docs/analises/047-k164-corpo-do-pr.md, docs/retrospectivas/2026-10-28-problemas-para-o-forge.md: vêm de outras delegações, não commitados por mim.

## Ações pendentes do dono
- push do K-164; encerrar vite preview na porta 4173 (PIDs 2807456, 2807378, 2807331); apagar branch remota docs/048-t14-desenho; K-141 (ambiente da máquina nova); K-152.

## Melhorias para o Forge (lista acumulada)
`--volta` × etapa nova; Desde por branch; target-size; PATH do pnpm; revalidação por merge da develop; timeout do brief gerar; `gh pr checks --watch` estoura 600 s; pre-push do Forge sem skip em sessão de agente; neutralidade varrendo __pycache__; hook recusa `git branch`/`git worktree list` ao conferente; `forge-check pr` não lê clone de contribuição.

# Pedido 021 — Front do pedido 011, lote 1 (estratégicas)

- **Data:** 2026-10-17
- **Origem:** pedido 011, antigo item E4 (front das 17 métricas). Decisão do usuário de 2026-10-17: estratégicas → táticas → operacionais, em lotes separados. Os lotes 2 e 3 do front ficam nos pedidos 025 e 026 (uma etapa por papel por pedido, regra do conferente).
- **Modo:** implementar. Protótipo validado em `~/MetricasDSPD-local/prototipos/metricas-tambem-disponiveis/03-prototipo/`; especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`.

## Escopo
- **E1 (K-109):** front do lote 1, estratégicas: E9, E6, E7 (participação percentual por entregas, sem R$, decisão D2 = A) e E8 (só a contagem de sistemas com 1 pessoa, R-1 = B).

## Etapas
- E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop.
- E1.4 (forge:tech-lead): code review do front do lote 1.
- E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A).
- E1.3 (forge:qa-engineer): QA do front do lote 1.

## Fora do escopo
- Os lotes 2 e 3 do front (pedidos 025 e 026); o PR (pedido a abrir depois do QA); o ajuste do back do E7 sem R$ (pedido 024).

## Decisões técnicas do time
- 2026-10-18 — Instabilidade do E2E sob carga local (IF-U-operacional, CA-19 axe de sustentacao-no-operacional; pré-existentes, passam sozinhos): vira o cartão K-115, fora deste PR; a prova da suíte completa do lote 1 é o check `e2e` da CI do PR do lote (#106, refeito como #108) sobre o commit final (portão oficial), e a suíte local roda só os specs afetados. Base: relatório do react-frontend em 357936b (load 3,3 a 6,3 nos runs) e CI verde em 3d2ee5b.
- 2026-10-18 — Bug 011F-002 (IF-I01 estoura 30 s na suíte E2E completa local, pré-existente, CI verde em 3d2ee5b): saída (a), o react-frontend dá orçamento de tempo próprio ao IF-I01 nesta branch (como o K-083 fez no IF-A), sem skip; depois review e QA revalidam. Base: relatório do QA em 3330f03; decisão técnica (R-DECISAO), não pede aceite do usuário.
- 2026-10-17 — O react-frontend pode tocar `packages/contratos/src/cartoes.ts` e os testes de contagem do catálogo, e só isso em `packages/`, para os cartões do lote aparecerem na seção "Mais métricas". O review do tech-lead cobre essa mudança. Base: relatório do react-frontend em 4c5d6f5 (os cartões não montam sem a entrada no catálogo).

- 2026-10-17 — O ux-designer não tem como commitar (sem Bash). Os arquivos de UX que ele grava com Write na worktree são commitados por quem roda a etapa seguinte na branch (tech-lead ou QA), com `git add` por caminho e num commit `docs(ux)` próprio, antes do seu próprio trabalho. Base: a reconferência da UX (seção 9 da revisão) ficou sem commit antes do QA.

## Decisões do usuário
- 2026-10-17 — **Título da seção nova do Estratégico = A** (usuário: "A"): "Onde o parque se concentra, e qual o risco de continuidade?". Recomendação do UX, na revisão `revisao-011-front-estrategicas.md`, porque o E7 deixou de mostrar custo (D2 = A).
- 2026-10-17 — **Renomear o E7: pendente de confirmação** (usuário respondeu "E3 pode renomear"; o Jarvis lê como o E7, que era a pergunta em aberto, mas só aplica depois de o usuário confirmar): se confirmado, o E7 passa a se chamar "Entregas por sistema" (sugestão A-10 da revisão de UX). Até lá, nada muda no código nem na especificação.

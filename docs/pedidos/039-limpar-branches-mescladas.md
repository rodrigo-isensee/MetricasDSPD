# Pedido 039: limpar as branches que já estão na develop

- **Data:** 2026-10-21
- **Origem:** usuário: "limpe as branchs que ja estao na develop".
- **Modo:** implementar
- **Objetivo:** apagar branches (remotas, locais e as worktrees delas) cujo conteúdo já entrou na develop.
- **Clareza:** 1 confirmado, 1 técnico; 0 perguntas.

## Diagnóstico (2026-10-21, `gh pr list` e `git branch`)
- PR mesclado na develop: `forge/upgrade-0.27.0` (#134; remota, local e worktree -038), `feature/030-dependabot-develop` (#121; remota e local), `forge/upgrade-0.26.0` (#127; local), `docs/jarvis-quadro-2026-10-17-noite` (#118; local), `feature/011-metricas-tambem-back` (#92; local).
- Sem PR (verificar se o conteúdo está na develop): `feature/011-fase2-back` (worktree -011-fase2, 11113d0), `ref/c6-cede-por-metrica`, `ref/c6-gerador-em-fases`, `test/qa-intensivo-main`, `tmp/taticas-sobre-develop`.

## Escopo
- E1. Apagar branch remota, local e worktree das branches cujo PR foi mesclado na develop (lista do Diagnóstico). · `confirmado`
- E2. Nas branches sem PR, apagar só as que têm todo o conteúdo na develop (sem commit exclusivo); as que têm conteúdo exclusivo ficam e voltam ao dono como lista. · `técnico`

## Etapas
- E1.1 (forge:tech-lead): limpeza (E1 e E2) e relatório com o que apagou e o que ficou.
- E2.1 (forge:tech-lead): apagar as 4 branches de experimento da decisão A de 2026-10-21.

## Fora do escopo
- `develop`, `homolog`, `main`; as branches em uso: `feature/025-front-taticas`, `feature/037-c6-operacional`, `docs/jarvis-2026-10-20-noite` (com trabalho sem commit do Jarvis) e as worktrees delas · `confirmado`
- Worktree `-main` (HEAD destacado, sem branch) · `técnico`
- feature/011-metricas-tambem-back e feature/011-fase2-back (mantidas pela decisão A; avaliação do conteúdo vira cartão próprio) · `confirmado`

## Suposições
- "já estão na develop" = PR mesclado na develop ou conteúdo inteiro contido nela · `suposição` · base: R-FLUXO, "Depois do merge"

## Critério de pronto
- PQ-1 nenhuma branch da lista do E1 na origin nem local · prova: cmd · `técnico`

## Decisões do usuário (registro literal)
DECISÃO DO DONO (2026-10-21): "limpe as branchs que ja estao na develop".
DECISÃO DO DONO (2026-10-21): branches com conteúdo fora da develop, opção A ("A"): apagar as 4 de experimento (ref/c6-cede-por-metrica, ref/c6-gerador-em-fases, test/qa-intensivo-main, tmp/taticas-sobre-develop), mesmo com alteração exclusiva; manter feature/011-metricas-tambem-back e feature/011-fase2-back para o tech-lead avaliar se o conteúdo ainda deve ir à develop.

## Registro de clareza
PERGUNTA: nenhuma

## Histórico
- 2026-10-21: pedido aberto.
- 2026-10-21 13:18: tech-lead apagou remotas feature/030-dependabot-develop e forge/upgrade-0.27.0, worktree -038 e as locais forge/upgrade-0.27.0, feature/030-dependabot-develop, forge/upgrade-0.26.0, docs/jarvis-quadro-2026-10-17-noite. Ficaram (com alteração exclusiva fora da develop): feature/011-metricas-tambem-back (3 commits de revalidação em docs/qa e docs/reviews), ref/c6-cede-por-metrica (44), ref/c6-gerador-em-fases (47), test/qa-intensivo-main (5), tmp/taticas-sobre-develop (2), feature/011-fase2-back (2, worktree -011-fase2). Decisão do dono pendente sobre essas 6.
- MELHORIA (tech-lead): o hook R-CONFORMIDADE bloqueia leitura com variável de shell em laço (for b in ...; git cherry), obrigando um comando por branch; levar ao Forge.
- 2026-10-21 13:22: E2.1 feita pelo tech-lead (só local, sem ato no GitHub): apagadas ref/c6-cede-por-metrica (6d64255fb140cdf8def70e09fecf80e3897ccf98), ref/c6-gerador-em-fases (a1283aef1d94fefa9a7fc517f845c781c1909383), test/qa-intensivo-main (79edf176570d24304cd2bfda2f0d71161fcf8134), tmp/taticas-sobre-develop (fb39c603af8be3a863cf357893386171199e689e); shas para recuperação pelo reflog. Mantidas as duas do 011 (cartão K-125). Pedido encerrado.

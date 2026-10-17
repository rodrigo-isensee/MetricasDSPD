## Objetivo
Code review do pedido 024 (E7 sem R$ pela decisão D2 = A, contrato do E8 e do E9 com a janela do cálculo, `concluidoEm` no E6), antes do QA (R-REVIEW). O node-backend entregou 7e92cd9 (E3), beb71c6 (E4), 1bdf1a5 (E1) e cb2502f (docs), pronto rc=0; o software-architect ajustou o plano do 011, sem commit (ele não tem Bash). Sem gatilho de segurança: a mudança tira dinheiro do E7 e não toca dado de pessoa, autenticação, segredo nem banco. Cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (cb2502f).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-024 diff 8516ff8..cb2502f` e `git -C /home/rodrigoisensee/MetricasDSPD-024 diff -- docs/architecture` (o plano do arquiteto, sem commit).

## Entregar
- (E2) Antes do review, commitar o plano do arquiteto num commit próprio (`docs(architecture): ...`, `git add` só de `docs/architecture/features/metricas-tambem-disponiveis.md`), depois de `pnpm run docs:check` da raiz da worktree; pela decisão técnica do time de 2026-10-17 (pedido 024, "Decisões técnicas do time").
- (E1, E2, E3, E4) Review de todo o diff contra a develop 8516ff8: o E7 sem nenhum campo de dinheiro (o teste anti-dinheiro de `e7.test.ts` cobre a saída), participação só com 20 ou mais entregas por sistema, mudança de critério registrada (`VERSAO_CRITERIO_E7_SEM_REAIS`, T2.6), cálculo pela biblioteca; E8/E9 com aplicabilidade `[]` e `['sistema']` sem mudar o cálculo; `concluidoEm` no E6 com teste; OpenAPI, `docs/api`, `docs/contratos`, `regras-metricas.md`, snapshots e o plano coerentes entre si (inclusive a linha 332 do plano, `participacao` anulável, contra o contrato); o front do E7 só lê `participacao` e `entregas` (confira na `origin/feature/011-front-estrategicas`). Parecer em `docs/reviews/024-e7-sem-reais.md` (`pedido: 024-e7-sem-reais`, `commit:` do commit revisado), gravado com a ferramenta Write; commit só do parecer, `git add` por caminho, e push.
- (E1, E2, E3, E4) Ajuste pedido no review volta ao node-backend (código) ou ao arquiteto (plano); não corrija você.
- Fora do escopo, outras etapas do pedido 024 (citadas de "## Etapas"; E1.1, E3.1, E4.1 e E2.1 já feitas, E2.2 coberta pelo commit ccb9443 do front): "E1.1 (forge:node-backend): E7 sem R$, com participação percentual."; "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo."; "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6."; "E1.3 (forge:qa-engineer): QA."; "E2.1 (forge:software-architect): plano §2 E7 e ADR."; "E2.2 (forge:ux-designer): CA do E7 na especificação."
- Fora do escopo: o PR (pedido a abrir depois do QA); o nome do E7 (pendente de confirmação do usuário); o front.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011, 2026-10-17): o E7 mostra a participação percentual de cada sistema pelas entregas do período (ex.: "Fluig: 23% das entregas"), sem R$; a D-1' e a Q-E7-1 deixam de valer; mudança de critério registrada com data (T2.6). Horas apontadas não entram (seção 7.1 do briefing): se aparecerem, reprove.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nenhuma métrica para avaliação individual; sem comparação entre times; BusinessMap e Acelerato nunca se misturam; cálculo pela biblioteca compartilhada. ADR 0011, ADR 0020, ADR 0003.
- R-REVIEW: o parecer é do tech-lead, com Write. R-VERIFY: sem `--no-verify` nem `--force`.
- NÃO tocar: código e testes (ajuste volta ao autor), `web/`, `e2e/`, `.github/`, a `main`, a develop direto, o diretório principal e as outras worktrees.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só o `docs:check`; o `pronto` já rodou com rc=0 em cb2502f.

## Pronto quando
- PQ-1 (push): commit do plano e commit do parecer de review em `feature/024-e7-sem-reais` no origin.
- PQ-2 (cmd): `pnpm run docs:check` da raiz de `/home/rodrigoisensee/MetricasDSPD-024` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (shas, achados); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

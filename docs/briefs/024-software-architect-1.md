## Objetivo
Alinhar a documentação de arquitetura à decisão do usuário D2 = A (o E7 sem R$, com a participação percentual por entregas), que o node-backend já aplicou no código na branch `feature/024-e7-sem-reais` (cb2502f). Hoje o plano do 011 ainda descreve o E7 em R$ (D-1' e Q-E7-1). Pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais`.

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`.
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: só a linha da **D2 = A**.
- Na worktree: `docs/architecture/features/metricas-tambem-disponiveis.md`, linhas 16, 25, 44, 161, 435 e 553 e a seção "E7 Capacidade por sistema" (perto da linha 291); o `docs/architecture/regras-metricas.md` já ajustado pelo node-backend (só a linha do E7).

## Entregar
- (E2) Plano do 011 (§2 E7 e as linhas citadas): o E7 mostra a participação percentual de cada sistema pelas entregas do período, sem R$; a D-1' e a Q-E7-1 aparecem como revistas pela D2 = A (com a data 2026-10-17), sem apagar o histórico; a menção à tabela `ref_` de custo do DSPD sai ou vira histórico.
- (E2) ADR afetada: nenhuma. A busca por `ref_custo`, "custo total do DSPD" e "E7" em `docs/architecture/adr/` só acha a ADR 0003 (tempo de cálculo do E7, sem custo) e a ADR 0020 (sem E7); o custo do E7 só vive no plano. Não mexa em ADR; se encontrar alguma que registre o custo do E7, relate.
- (E2) Gravar as mudanças nos arquivos da worktree, sem commit (você não tem Bash): pela decisão técnica do time de 2026-10-17 (pedido 024, "Decisões técnicas do time"), o próximo passo que roda git (o review do tech-lead) commita os documentos de arquitetura num commit próprio e roda o `docs:check`. Liste no relatório os caminhos alterados.
- Fora do escopo, outras etapas do pedido 024 (citadas de "## Etapas"; E1.1, E3.1 e E4.1 já feitas): "E1.1 (forge:node-backend): E7 sem R$, com participação percentual."; "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo."; "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6."; "E1.2 (forge:tech-lead): review."; "E1.3 (forge:qa-engineer): QA."; "E2.2 (forge:ux-designer): CA do E7 na especificação."
- Fora do escopo: código e testes; a especificação de UX; o nome do E7 (pendente de confirmação do usuário); o PR.

## Decisões e restrições
- Decisão do usuário D2 = A (pedido 011, 2026-10-17): o E7 mostra a participação percentual de cada sistema pelas entregas do período (ex.: "Fluig: 23% das entregas"), sem R$; a D-1' (custo em R$) e a Q-E7-1 (pró-rata do custo) deixam de valer; mudança de critério registrada com data (T2.6). Horas apontadas não entram (seção 7.1 do briefing).
- Regras invioláveis do `CLAUDE.md`; ADR 0011, ADR 0020, ADR 0003.
- NÃO tocar: código, testes, `web/`, `e2e/`, `docs/api`, `docs/contratos`, `docs/ux`, `.github/`, a `main`, a develop direto, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado nesta etapa.

## Pronto quando
- PQ-1 (cmd): `grep -n "D2 = A" /home/rodrigoisensee/MetricasDSPD-024/docs/architecture/features/metricas-tambem-disponiveis.md` · espera: linhas>=1
- PQ-2 (cmd): `grep -n -E "custoRateado|custoPorDemanda|ref_custo_dspd" /home/rodrigoisensee/MetricasDSPD-024/docs/architecture/features/metricas-tambem-disponiveis.md | grep -v -E "D2 = A|revist"` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (caminhos alterados e trechos); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

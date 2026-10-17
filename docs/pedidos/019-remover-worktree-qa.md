# Pedido 019 — Remover a worktree -qa preservando os protótipos

- **Data:** 2026-10-17
- **Origem:** pedido 013, E1: a `-qa` não saiu porque guarda os únicos 6 protótipos HTML das features K-074 e K-075 (relatório do tech-lead, 2026-10-17).
- **Modo:** implementar.

## Escopo
- **E1:** copiar os 6 protótipos HTML da `-qa` para `~/MetricasDSPD-local/prototipos/` (fora do repositório, até irem com as features) e remover a worktree, mantendo a branch local `test/qa-intensivo-main`.

## Etapas
- E1.1 (forge:tech-lead): preservar os protótipos e remover a worktree -qa.

## Fora do escopo
- Versionar os protótipos (vão com K-074 e K-075).

## Andamento
- 2026-10-17 07:20 — tech-lead: os 6 protótipos foram copiados para `~/MetricasDSPD-local/prototipos/` e conferidos com `cmp`. O `git worktree remove` recusou sem `--force` por 18 arquivos sem commit: 6 são os HTML copiados, 8 são idênticos na develop e 4 são versões antigas cujo texto está todo na branch `docs/retomada-2026-10-17`. **Ação pendente do usuário:** autorizar o `--force` (R-VERIFY) depois do merge da `docs/retomada-2026-10-17`. Antes disso, essa branch é a única cópia completa dos 4 documentos.

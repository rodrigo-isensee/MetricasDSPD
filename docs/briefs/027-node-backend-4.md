## Objetivo
Ajuste R8 da rodada 3 do review do lote 2 (táticas), só de documentação, antes da segurança e do QA para não invalidar os pareceres deles depois. Pedido 027. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a `feature/011-fase2-taticas` (226bb33, no origin) e volte no fim.

## Ler
- Na branch: `docs/reviews/011-fase2-taticas.md`, seção "Rodada 3" (R8).
- `docs/architecture/regras-metricas.md`, linhas do T10, do T14, das pendências e do O19.

## Entregar
- (E1, E2) O merge da develop (9e83bf5) e o B11-001 com teste (942c26a), mais os ajustes da rodada 2 (3c9a9cd), já foram entregues nas suas delegações anteriores deste pedido: só confirme com `git log --oneline origin/develop..origin/feature/011-fase2-taticas` que continuam na branch, e relate.
- (E2) Em `docs/architecture/regras-metricas.md` (escrita à mão): a linha do T10 cita o B11-001 (fornecedor agrupado pelo nome normalizado, com a versão de critério de 2026-10-17); a do T14 cita a Q-T14-9 = A, a Q-T14-10 = B e a T14-M1 = B como decisões do usuário; a lista de pendências deixa de dar a Q-T14-9 e a Q-T14-10 como pendentes; a do O19 descreve o `pctDoTotal` sobre os dias úteis bloqueados (O19-pct = B), com o mínimo de 20 contado em bloqueios.
- (E2) Em `packages/metricas/src/businessmap/t10.ts`, linha 15, completar o comentário truncado ("igual a menos de maiúsculas").
- (E2) `pnpm run pronto` verde, um commit `docs`, `git add` por caminho, push.
- Fora do escopo: a revalidação do review, da segurança e o QA do lote 2 (depois desta entrega); o PR (pedido 022); o lote 3; qualquer mudança de código além do comentário.

## Decisões e restrições
- Decisões do usuário (pedido 011): B11-001 = sim; Q-T14-9 = A; Q-T14-10 = B; T14-M1 = B (2026-10-17: com "outros times" oculto, a T14 mostra só a fatia do meu time, sem o total exato; vale antes da fase 3 e deve constar na linha do T14); O19-pct = B; R-1 = B de 2026-10-16; T14 nova = A; métricas por nível em lotes separados.
- Regra inviolável do `CLAUDE.md`: mudança de critério registrada com data (T2.6).
- NÃO tocar: `web/`, `.github/`, migrações, a `main`, o diretório principal, o parecer de review, as outras branches e os 2 pareceres de segurança sem commit na worktree. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O `pronto` uma vez, com `uptime` e `free -m` antes e load abaixo de 4; se o QA estiver rodando E2E na worktree `-011-front-estrategicas`, espere.

## Pronto quando
- PQ-1 (push): commit do R8 em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `pnpm run pronto` na `feature/011-fase2-taticas`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 show origin/feature/011-fase2-taticas:docs/architecture/regras-metricas.md` · espera: contém 'B11-001'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/api docs/contratos docs/architecture` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

## Objetivo
Ajustes do lote 2 (táticas) pedidos pela rodada 2 do review (reprovada por um bloqueante): registrar a mudança de critério do T10 que o B11-001 introduziu (regra inviolável T2.6) e os recomendados. Pedido 027. Worktree `/home/rodrigoisensee/MetricasDSPD-011-fase2` (hoje na `feature/011-fase2-back`): troque para a `feature/011-fase2-taticas` (0eb8404, no origin) e volte no fim.

## Ler
- Na branch: `docs/reviews/011-fase2-taticas.md`, seções "Rodada 1" e "Rodada 2" (R1 a R7).
- `packages/metricas/src/core/criterios.ts` (os registros de `VersaoCriterio` já feitos no 011, O19-pct e O20-destaque, como precedente).

## Entregar
- (E2) R4, bloqueante: registrar a mudança de critério do T10 (agrupamento do fornecedor pelo nome normalizado, B11-001) em `criterios.ts`, com data e `afeta: ['T10']`, seguindo o precedente do O19-pct e do O20-destaque, com teste.
- (E2) R5: documentar a normalização em `docs/api/metricas.md` (T10) e no `refBriefing` do T10; acentos nos comentários. R7: teste do empate de grafias.
- (E1) R6: em `REGRAS_METRICA.T14`, a Q-T14-9 sai de "suposição do time" e passa a decisão do usuário (A); R1, R2 (parte da Q-T14-4) e R3 da rodada 1, como o parecer descreve.
- (E1, E2) `pnpm run pronto` verde, commits por assunto, `git add` por caminho, push.
- Fora do escopo: a revalidação do review, da segurança e o QA do lote 2 (depois desta entrega); o PR (pedido 022); o lote 3; o E7 sem R$ (pedido 024).

## Decisões e restrições
- Decisões do usuário (pedido 011): B11-001 = sim; Q-T14-9 = A; Q-T14-10 = B; T14-M1 = B (antes da fase 3); R-1 = B de 2026-10-16; T14 nova = A; Q-T14-1 = B; Q-T14-5 = D; Q-T14-6 = A refinada pela R-1 = B; D-14' = A e R-4 (T13); D-10 = A (T10 sem prazo contratado); T10-janela = A; métricas por nível em lotes separados.
- Regra inviolável do `CLAUDE.md`: mudança de critério de cálculo é registrada com data e marcada nos gráficos (T2.6). ADR 0011, ADR 0020, ADR 0003. Dúvida de regra de negócio vira pergunta, sem decidir no código.
- NÃO tocar: `web/`, `.github/`, migrações, a `main`, o diretório principal, o parecer de review (é do tech-lead), as outras branches e os 2 pareceres de segurança sem commit na worktree. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O `pronto` uma vez, com `uptime` e `free -m` antes e load abaixo de 4; se o QA estiver rodando E2E na worktree `-011-front-estrategicas`, espere.

## Pronto quando
- PQ-1 (push): commits dos ajustes em `feature/011-fase2-taticas` no origin.
- PQ-2 (cmd): `pnpm run pronto` na `feature/011-fase2-taticas`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 show origin/feature/011-fase2-taticas:packages/metricas/src/core/criterios.ts` · espera: contém 'T10'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-fase2 status --short -- server packages docs/api docs/contratos` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (item por item: R1 a R7); riscos; mudanças de contrato. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

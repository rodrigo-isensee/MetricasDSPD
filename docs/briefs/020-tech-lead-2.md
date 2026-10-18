## Objetivo
Levar o lote 1 (estratégicas: E6, E7 com R$, E8) à develop. O merge do PR #104 foi barrado pelo hook `parecer` por pareceres desatualizados; agora review (82660ae, sobre 1193689) e QA (23f3be3, sobre 1193689) estão revalidados e a segurança está commitada (ac1519e). Pedido 020. Worktree temporária `/home/rodrigoisensee/MetricasDSPD-011-estrategicas`, branch `feature/011-fase2-estrategicas`, HEAD 23f3be3.

## Ler
- `docs/pedidos/020-prs-do-back-fase2-011.md`.
- `gh pr checks 104` e `gh pr view 104 --json mergeStateStatus`.

## Entregar
- (E1) Rodar `forge-check pr 011-fase2-estrategicas --ref feature/011-fase2-estrategicas` de dentro da worktree; se acusar algo, pare e relate.
- (E1) Fechar o #104 sem mesclar, com um comentário ("aberto antes das revalidações; substituído por um PR novo da mesma branch"), e abrir um PR novo de `feature/011-fase2-estrategicas` para a `develop` (squash), com o resumo e os links dos 3 pareceres; esperar a CI do PR novo e mesclar com os checks exigidos verdes; apagar a branch local e a remota do lote e remover a worktree temporária `-011-estrategicas` (R-FLUXO, "Depois do merge").
- Fora do escopo: os PRs das táticas e das operacionais e a promoção para a homolog (pedidos 022 e 023); corrigir código.

## Decisões e restrições
- Decisão do usuário (pedido 011, 2026-10-17): métricas por nível em lotes separados, estratégicas → táticas → operacionais.
- Squash na `develop`. R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código das branches, `.github/`, o diretório principal, as branches `feature/011-fase2-taticas`, `feature/011-fase2-operacionais` e `feature/011-fase2-back`, e a worktree `-011-fase2`.

## Pronto quando
- PQ-1 (pr): PR novo de `feature/011-fase2-estrategicas` para a `develop` aberto, e o #104 fechado sem merge.
- PQ-4 (merge): o PR novo mesclado na `develop`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/011-fase2-estrategicas` · espera: linhas=0
- PQ-3 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-011-estrategicas && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha do merge); riscos (inclui o que muda na branch das táticas, que sai desta). Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

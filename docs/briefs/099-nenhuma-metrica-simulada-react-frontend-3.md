## Objetivo
L2a do pedido 099: com o simulador desligado na develop (PR 322) e a remoção aceita pelo dono (Q-099-3 A, 14:05), sai a opção `simulado` de `useMetrica` e o `{ simulado: true }` dos cartões. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `fix/099-l2a-sem-opcao-simulado` (a partir da develop 27ac9064fc4ffad4e7f3bf18241aa1979912c009).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, lotes L2a a L2d (só o L2a é desta delegação).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/web/src/data/useMetrica.ts` (linhas 50 a 110).

## Entregar
- "E2.6 (react-frontend): L2a, tirar a opção simulado de useMetrica e dos cartões, na branch fix/099-l2a-sem-opcao-simulado, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.6)
- (E2) (E3) (E2.6) Tirar a opção `simulado` de `useMetrica` e o `{ simulado: true }` de todos os cartões, sem mudar o que cada cartão mostra com dado real nem o estado "Sem dado real"; não apagar ainda `FonteComSimulado`, `simulado.ts` nem o selo (L2b e L2c). Testes ajustados; `pnpm run pronto` da raiz da worktree com no máximo 2 workers, em segundo plano, esperando o fim (a cobertura do web leva uns 9 min). Commit com `Cartão: K-275` e a linha `teto:` se passar de 150 linhas (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l2a-sem-opcao-simulado` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E4) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/099-l2a-sem-opcao-simulado` · espera: contém 'Cartão: K-275'

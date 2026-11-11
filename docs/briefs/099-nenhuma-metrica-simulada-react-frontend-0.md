## Objetivo
O dono mandou desligar o simulador ("pode desligaro  simulador"): nenhum número inventado na web de uso diário. A origem é o `FonteComSimulado` ligado em `web/src/app/App.tsx:41-42`. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `fix/099-l1-sem-simulador` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/099-varredura-simulado.md`, a origem (início) e o lote L1.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/web/src/app/App.tsx` e os testes de composição citados no L1.

## Entregar
- "E2.1 (react-frontend): L1, App.tsx sem o FonteComSimulado e testes de composição ajustados, na branch fix/099-l1-sem-simulador, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.1)
- (E2) (E2.1) A web de uso diário passa a usar `HttpFonteMetricas` sem o `FonteComSimulado`; o cartão sem dado real mostra o estado "Sem dado real" com o motivo, que já existe; ajustar os testes de composição (`app/composicao.test.tsx`, `app/app.test.tsx`) e acrescentar um que prova que, sem dado real, nenhum cartão mostra o selo "Simulado". Neste lote não remover o código do simulador nem a opção `simulado` dos cartões: a remoção vem nos lotes L2a a L3 (Q-099-3 A, decisão do dono de 14:05); não mudar a API nem o modo homologação. Rodar `pnpm run pronto` da raiz da worktree. Commits com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/099-l1-sem-simulador` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/app/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/099-l1-sem-simulador` · espera: contém 'Cartão: K-275'

## Objetivo
A develop (443c99cf, com o PR 321 do K-272) está vermelha no check `banco`: `server/tests/apontamento-rota.pg.test.ts:215`, teste "filtro por tipo ponta a ponta... (caso do filtro por tipo ponta a ponta)", espera `['12', '34']` e recebe `['12']`, porque os dois type_id da massa caem na mesma categoria e o dono decidiu "Agrupar" (uma opção por categoria; o id é o menor type_id; filtrar por qualquer type_id cobre todos da categoria). O código está certo; o teste ficou com o comportamento antigo. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-teste-pg` (a partir da develop 443c99cf296ec830c50f077ef0efd9ff482ff152).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/server/tests/apontamento-rota.pg.test.ts` (linhas 180 a 240) e `server/src/modulos/apontamento/servico.ts` (o agrupamento por categoria).

## Entregar
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E6.5)
- (E6) (E6.5) Ajustar o caso do filtro por tipo ponta a ponta ao comportamento decidido: uma opção por categoria com o menor type_id; `tipo=12` e `tipo=34` dão a mesma soma da categoria inteira (revise também as linhas 218 a 220); sem afrouxar o que o teste prova sobre o filtro ponta a ponta. Se o teste puder separar categorias diferentes (dois type_id de categorias distintas), acrescente esse caso para continuar provando que o filtro separa. Só o arquivo de teste. Rodar o `.pg` com o banco de teste local se houver (`pnpm --filter @metricas-dspd/server exec vitest run tests/apontamento-rota.pg.test.ts --maxWorkers=2`); sem banco, diga e rode o `pnpm run pronto`. Commit com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-teste-pg` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/apontamento-rota.pg.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/fix/k272-teste-pg` · espera: contém 'Cartão: K-272'

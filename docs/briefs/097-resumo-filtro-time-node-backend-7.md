Agente destino: forge:node-backend
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: fix/k272-teste-pg   Base: develop   Base-sha: 443c99cf296ec830c50f077ef0efd9ff482ff152
Etapa: codigo   Cobre: E6.5

## Objetivo
A develop (443c99cf, com o PR 321 do K-272) está vermelha no check `banco`: `server/tests/apontamento-rota.pg.test.ts:215`, teste "filtro por tipo ponta a ponta... (caso do filtro por tipo ponta a ponta)", espera `['12', '34']` e recebe `['12']`, porque os dois type_id da massa caem na mesma categoria e o dono decidiu "Agrupar" (uma opção por categoria; o id é o menor type_id; filtrar por qualquer type_id cobre todos da categoria). O código está certo; o teste ficou com o comportamento antigo. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-teste-pg` (a partir da develop 443c99cf296ec830c50f077ef0efd9ff482ff152).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/server/tests/apontamento-rota.pg.test.ts` (linhas 180 a 240) e `server/src/modulos/apontamento/servico.ts` (o agrupamento por categoria).

## Entregar
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E6.5)
- (E6) (E6.5) Ajustar o caso do filtro por tipo ponta a ponta ao comportamento decidido: uma opção por categoria com o menor type_id; `tipo=12` e `tipo=34` dão a mesma soma da categoria inteira (revise também as linhas 218 a 220); sem afrouxar o que o teste prova sobre o filtro ponta a ponta. Se o teste puder separar categorias diferentes (dois type_id de categorias distintas), acrescente esse caso para continuar provando que o filtro separa. Só o arquivo de teste. Rodar o `.pg` com o banco de teste local se houver (`pnpm --filter @metricas-dspd/server exec vitest run tests/apontamento-rota.pg.test.ts --maxWorkers=2`); sem banco, diga e rode o `pnpm run pronto`. Commit com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-teste-pg` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/apontamento-rota.pg.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até b7f2fcada9845b5ac84cedf4736a2da181634dbdb635cbc49fef3ca98c67fc23 (11 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E6.5 (copiadas literalmente):
- - 2026-11-11 13:51: DECISÃO DO DONO repassada pela sessão "WSL ativação" (literal do dono): "Agrupar". P-097-7 respondida pela opção (a): no AP-TIPO e na lista do filtro tipo do Apontamento, uma linha e uma opção por categoria do contrato (dim_card.tipo), somando todos os type_id dela; filtrar por categoria cobre todos os type_id; lerCardsIncompletos deixa de filtrar por type_id; "Sem tipo" segue à parte; teste com dois type_id da mesma categoria. E6 (K-272) começa já, na worktree 041, branch fix/k272-ap-tipo-categoria, a partir da develop eac38a64.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/fix/k272-teste-pg` · espera: contém 'Cartão: K-272'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

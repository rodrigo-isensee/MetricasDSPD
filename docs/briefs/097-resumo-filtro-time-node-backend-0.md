## Objetivo
Bug K-272 relatado pelo dono na demo: no cartão AP-TIPO "Horas por tipo" da aba Apontamento, "Trabalho de produto" aparece em quatro linhas separadas, porque o serviço agrupa pelo `type_id` do BusinessMap e mostra o rótulo da categoria do contrato (`dim_card.tipo`). Decisão do dono: "Agrupar" (uma linha e uma opção por categoria). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-ap-tipo-categoria` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/server/src/modulos/apontamento/servico.ts` (linhas 20 a 160) e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/server/src/modulos/apontamento/repositorio.ts` (`lerCardsIncompletos`).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/contratos/politica-de-mudanca.md` (se o formato do valor do filtro `tipo` mudar).

## Entregar
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E6.1)
- (E6) (E6.1) Uma linha por categoria do contrato no AP-TIPO (gráfico e tabela), somando horas e apontamentos de todos os `type_id` dela; a lista `tipos` do filtro com uma opção por categoria, sem repetição; filtrar por uma categoria cobre todos os `type_id` dela, inclusive em `lerCardsIncompletos`; "Sem tipo" continua à parte e fora das opções. Teste com dois `type_id` da mesma categoria que exige uma linha só e uma opção só. Se o valor aceito pelo filtro `tipo` (hoje `type_id` em dígitos) mudar, aplicar a `politica-de-mudanca.md` (classificação, `docs:check`, aceite se incompatível) e relatar; link antigo com `tipo=<dígitos>` cai no aviso de valor inválido que já existe ou é traduzido, e o relatório diz qual. Ajustar a web só se o tipo do valor mudar e quebrar a compilação (relate o arquivo). Rodar `pnpm run pronto` da raiz da worktree. Commits com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/modulos/apontamento/, server/tests/, packages/contratos/, docs/contratos/, web/src/features/apontamento/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/fix/k272-ap-tipo-categoria` · espera: contém 'Cartão: K-272'

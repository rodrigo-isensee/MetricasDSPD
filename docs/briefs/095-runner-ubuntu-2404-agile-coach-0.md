## Objetivo
Retrospectiva curta do pedido 095 (jobs com navegador da CI: primeiro o ubuntu-24.04, que não resolveu; depois o container oficial do Playwright; PR 318 mesclado pelo dono com a correção completa). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem as retrospectivas do 093 e do 094, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/095-runner-ubuntu-2404.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 095.

## Entregar
- "E1.6 (agile-coach): retrospectiva curta." (E1.6)
- (E1) (E1.6) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-095-runner-ci.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (diagnóstico inicial errado da causa, a imagem e não o apt; PR barrado por faltar QA e parecer novo; brief de PR sem rodar forge-check pr; etapa E1.10 aberta sem conferir a develop), retrabalho pelas conferências, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` fica só como dado). Commit só da retrospectiva com `Cartão: K-269` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-095-runner-ci.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/docs/retros-2026-11-11c` · espera: contém 'Cartão: K-269'

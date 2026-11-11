## Objetivo
Retrospectiva curta do pedido 093 (release do lote 6b: PRs 306, 311, 312 para a develop, 313 para a homolog e 314 para a main, este mesclado pelo dono com bypass por falha de DNS do runner; duas voltas da release por pareceres envelhecidos; validação do 6b delegada pelo dono, decisão "A" de 13:06; a correção do runner seguiu no pedido 095). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem a retrospectiva do 094 em 9906d460, que não deve ser tocada).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/093-release-6b-homolog.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 093.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (o diagnóstico do runner).

## Entregar
- "E1.8 (agile-coach): retrospectiva curta." (E1.8)
- (E1) (E1.8) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-093-release-6b.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (pareceres da release envelhecidos quando a develop andou, duas voltas; PR 313 mesclado com checks pendentes; portão da homolog vermelho por DNS do runner e merge da main com bypass; validação do 6b sem conferência com dado real, risco aceito pelo dono), retrabalho medido pelas conferências do 093, lead time pelo Histórico (e pelo `gh pr view` quando faltar) e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` ou tem cartão fica só como dado). Commit só da retrospectiva com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-093-release-6b.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/docs/retros-2026-11-11c:docs/retrospectivas/2026-11-11-093-release-6b.md` · espera: contém '093'

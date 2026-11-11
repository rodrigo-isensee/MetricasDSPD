## Objetivo
Retrospectiva curta do pedido 096 (o passo de critérios do apontamento lê o .env sozinho, K-270; PR 319 mesclado pelo dono). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem as retrospectivas do 093, do 094 e do 095, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/096-criterios-apontamento-env.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 096.

## Entregar
- "E1.5 (agile-coach): retrospectiva curta." (E1.5)
- (E1) (E2) (E1.5) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-096-criterios-apontamento.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (brief do QA reprovado por o pedido não dizer quem envia o parecer; portões em sequência por uma escrita por branch; segurança com A1 e A2 recomendados, que viraram o K-271), retrabalho pelas conferências, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` fica só como dado). Commit só da retrospectiva com `Cartão: K-270` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-096-criterios-apontamento.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/docs/retros-2026-11-11c` · espera: contém 'Cartão: K-270'

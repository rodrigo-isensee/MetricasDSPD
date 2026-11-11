Agente destino: forge:agile-coach
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E4.1

## Objetivo
Retrospectiva curta do pedido 094 (K-265, K-266 e K-267 na develop pelos PRs 308, 309 e 310). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/094-lote-testes-e-guia.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 094.
- Uma retrospectiva recente da pasta como forma: `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/` (a mais nova).

## Entregar
- "E4.1 (agile-coach): retrospectiva curta." (E4.1)
- (E1) (E2) (E3) (E4.1) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-094-lote-testes-e-guia.md` (novo), no formato das retrospectivas da pasta: o que correu bem (três cartões sem arquivo em comum em paralelo), o que travou, retrabalho medido pelas conferências do 094, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` ou tem cartão fica só como dado). Commit só da retrospectiva com `Cartão: K-265` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-094-lote-testes-e-guia.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/docs/retros-2026-11-11c` · espera: contém 'Cartão: K-265'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

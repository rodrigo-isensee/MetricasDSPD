Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.10

## Objetivo
Review das retrospectivas da branch `docs/retros-2026-11-11c` (worktree `/home/rodrigoisensee/MetricasDSPD-052f`, ponta 2e910a6b17cbab52eaf6780f74e6261a8324d5a9): 5 arquivos novos em `docs/retrospectivas/` (093, 094, 095, 096 e 100), só documentação, classe T. O `forge-check pr` pede o parecer de review do pedido 100 antes do PR (R-REVIEW). Depois do parecer, o Jarvis confere a entrega no head novo e delega o PR e o merge em outra delegação.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/develop...origin/docs/retros-2026-11-11c`.

## Entregar
- "E1.10 (tech-lead): PR das retrospectivas do 093, 094, 095, 096 e 100 (branch docs/retros-2026-11-11c) para a develop, só documentação, e merge com os checks verdes." (E1.10) Nesta delegação, só o parecer de review.
- (E1) (E1.10) Review das 5 retrospectivas: formato da pasta, nenhum dado de pessoa nem de avaliação individual, nenhum segredo, links e caminhos válidos, `forge-check docs` sem erro novo nesses arquivos. Parecer novo pela ferramenta Write em `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/100-retros-2026-11-11c.md`, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/retros-2026-11-11c`, `commit: 2e910a6b17cbab52eaf6780f74e6261a8324d5a9` e o veredito; `## Achados` com linhas de até 300 caracteres, ou vazio. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/reviews/100-retros-2026-11-11c.md, docs/retrospectivas/ (a pasta é o escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até ee6ad176f90986e330fd15f348a79ad23b96804ef0e793331d8d5eb63930c237 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/docs/retros-2026-11-11c:docs/reviews/100-retros-2026-11-11c.md` · espera: contém 'commit: 2e910a6b17cbab52eaf6780f74e6261a8324d5a9'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

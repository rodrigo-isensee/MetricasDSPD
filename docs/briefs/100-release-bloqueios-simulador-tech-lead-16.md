Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.10

## Objetivo
PR das retrospectivas para a develop: branch `docs/retros-2026-11-11c` (worktree `/home/rodrigoisensee/MetricasDSPD-052f`, ponta 2e910a6b), com 5 arquivos novos em `docs/retrospectivas/` (093, 094, 095, 096 e 100), só documentação. O dono autorizou às 17:51 o merge do time até a homolog; a main é só dele. O pedido de permissão do merge pode aparecer para aprovação humana: se for negado, pare e relate.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff --stat origin/develop...origin/docs/retros-2026-11-11c`.

## Entregar
- "E1.10 (tech-lead): PR das retrospectivas do 093, 094, 095, 096 e 100 (branch docs/retros-2026-11-11c) para a develop, só documentação, e merge com os checks verdes." (E1.10)
- (E1) (E1.10) Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/retros-2026-11-11c --base develop` e confirmar `veredito: aprovado` (se pedir portão, pare e relate). Abrir o PR para a `develop` (squash) pelo gh, corpo escrito por Write num arquivo do scratchpad e `--body-file` (lista das 5 retrospectivas, `Cartão: K-204`). Esperar os checks em laços de até 170 s (laço num script do scratchpad). Antes do merge, conferir `mergeStateStatus`; se BEHIND, `gh pr update-branch docs/retros-2026-11-11c` e esperar os checks do head novo. Com todos verdes e CLEAN, mesclar pelo nome da branch, num comando sozinho, sem `$`, `;` nem `echo`: `gh pr merge docs/retros-2026-11-11c --squash --match-head-commit` seguido do sha completo do head, nunca `--admin`.
- arquivos: nenhum

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
- PQ-1 (cmd): `gh pr view docs/retros-2026-11-11c --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

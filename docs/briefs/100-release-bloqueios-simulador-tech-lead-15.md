Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: release/100-main   Base: homolog   Base-sha: 50387f96c41e1cb497507faaf3d804e82348cf03
Etapa: codigo   Cobre: E1.6

## Objetivo
PR de release da homolog para a main (release 100: bloqueios 9a e 9b, simulador desligado, volta com os pareceres revalidados sobre o K-271), aberto para o dono validar e mesclar. A homolog está em 50387f96c41e1cb497507faaf3d804e82348cf03 (PR 328), com o portão `Homologação` verde (run 43105079447) e o CI do push verde (run 43105079497). A main é só do dono: esta delegação só abre o PR e acompanha o check `homolog-aprovada`.

## Ler
- O PR 328 pelo gh (corpo e commits) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/engineering/fluxo-homologacao.md`, a parte do PR de release.

## Entregar
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." (E1.6)
- (E1) (E1.6) Conferir que não há PR aberto da homolog para a main e que a ponta da homolog é 50387f96 (outra: pare e relate). Abrir pelo gh o PR com head `homolog` e base `main` (merge commit), corpo escrito por Write num arquivo do scratchpad e `--body-file`: o que muda para o dono em linguagem simples, a lista dos PRs #315 a #327, o portão verde com os links das execuções, se a release muda a interface (validação manual só nesse caso) e que o merge é dele. Esperar em laços de até 170 s, relatando cada um, até o check `homolog-aprovada` terminar, e dizer no fim o estado de cada check e o `mergeStateStatus`. Nenhum merge, nenhum push, nada na main.
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
- "E1.7 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --base main --head homolog --state open --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

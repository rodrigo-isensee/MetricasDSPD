Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release-b   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E1.4

## Objetivo
PR da volta da release 100 para a develop: branch `docs/100-release-b` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 2b85b70e, já no remoto), com os quatro pareceres da release revalidados (review d5d9d40b, segurança 0c43e495, QA b2c8e252, devops 2b85b70e) e confirmados sob o pedido 100-REV. A entrega desse head foi conferida às 17:48.

## Ler
- Os pareceres da branch: `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/security/100-release.md`, `/home/rodrigoisensee/MetricasDSPD-052h/docs/qa/100-release.md` e `/home/rodrigoisensee/MetricasDSPD-052h/docs/devops/100-release.md`.

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4) Nesta delegação, o PR da volta.
- (E1) (E1.4) Rodar da worktree `forge-check pr 100-release-bloqueios-simulador --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref docs/100-release-b --base develop` e confirmar `veredito: aprovado` (se não, pare e relate). Abrir o PR da branch para a `develop` (squash) pelo gh, com o corpo escrito pela ferramenta Write num arquivo do scratchpad e passado por `--body-file` (os quatro pareceres revalidados, o motivo da volta, `Cartão: K-204`). Esperar os checks até o fim em laços de até 170 s e relatar cada um, dizendo no fim se o PR está todo verde. Não mesclar: o merge é do dono.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --head docs/100-release-b --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

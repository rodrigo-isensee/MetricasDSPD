Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release-b   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E1.4

## Objetivo
A volta da release 100 está com os quatro pareceres revalidados na branch da volta (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 2b85b70e: review d5d9d40b, segurança 0c43e495, QA b2c8e252, devops 2b85b70e, todos com `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`), mas o `forge-check entrega` recusa os três reescritos (review, segurança, QA) como "fora do declarado no brief", e sem a linha "entrega conferida" o `forge-check pr` não libera o PR. No seu diagnóstico do K-272 você mostrou que o caminho previsto pelo Forge para parecer reescrito com remoção depois de uma conferência é o pedido `<X>-REV` (`reescrito_por_portao`).

## Ler
- A saída do `forge-check entrega` do pedido 100-release-bloqueios-simulador para a branch da volta (worktree 052h, etapa codigo, `--sem-gravar`), rodado de `/home/rodrigoisensee/Metricas/MetricasDSPD`.
- No forge-check do plugin, `reescrito_por_portao` e `pedido_da_revalidacao`.

## Entregar
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." (E1.4) Nesta delegação, o caminho de conformidade da volta e o PR.
- (E1) (E1.4) Dizer, com a regra citada, qual é o caminho que o Forge aceita para esta volta sem contornar nada (por exemplo, registrar a revalidação sob o pedido `100-release-bloqueios-simulador-REV`, com os briefs no formato que a função procura, e quem grava cada coisa). Se o caminho for só registro do Jarvis (pedido, briefs, selo), relate os arquivos e o conteúdo exatos e pare. Se não houver caminho sem refazer os portões, diga quais refazer. Sem mudar parecer, sem push e sem PR nesta delegação.
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

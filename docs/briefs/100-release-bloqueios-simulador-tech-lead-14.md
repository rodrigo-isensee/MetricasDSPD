Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: release/100-homolog   Base: develop   Base-sha: 1d697d6a0d8268df66f94d9041f949ca32e2862d
Etapa: codigo   Cobre: E1.5

## Objetivo
Promover a release 100 para a homolog: a develop está em 1d697d6a0d8268df66f94d9041f949ca32e2862d (CI verde nessa ponta, com a volta da release no PR 327). DECISÃO DO DONO (17:51): "voce pode fazer ate o merge da main, esse so eu faco o resto pode fazer" — o tech-lead mescla na homolog com o portão verde; a main é só do dono.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/engineering/fluxo-homologacao.md`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/100-release-bloqueios-simulador.md`, Histórico desde as 17:45.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." (E1.5) Pela decisão do dono das 17:51, o tech-lead mescla na homolog.
- (E1) (E1.5) Abrir o PR `develop` para `homolog` (merge commit) fixado em 1d697d6a0d8268df66f94d9041f949ca32e2862d se a develop tiver andado (se tiver, relate o que entrou e pare antes de abrir), com o corpo escrito por Write num arquivo do scratchpad e `--body-file`. Esperar os checks em laços de até 170 s (a fila do Actions está sendo limpa pelo devops em paralelo). Com todos verdes, mesclar com `gh pr merge --merge --match-head-commit <sha>`, nunca `--admin`; recusa de proteção ou de hook: pare e relate. Esperar o portão do push na `homolog` até o fim. Relatar o resultado do portão; o PR para a main fica para outra delegação. Não tocar na main.
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
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --base homolog --head develop --state all --json number` · espera: contém 'number'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

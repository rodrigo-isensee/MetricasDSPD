Agente destino: forge:devops-engineer
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: ops/100-fila-actions   Base: develop   Base-sha: 1d697d6a0d8268df66f94d9041f949ca32e2862d
Etapa: codigo   Cobre: E1.9

## Objetivo
A fila do GitHub Actions do repositório está parada: cerca de 15 execuções em `queued` e uma só rodando por vez; a maioria é de push já substituído (a mesma branch tem execução mais nova) ou de branch já mesclada (`docs/100-release`, `docs/100-release-b`, PR 327 mesclado em 1d697d6a, develop verde nessa ponta). Limpar a fila para o CI do que está vivo andar.

## Ler
- `gh run list --limit 40 --json databaseId,status,event,headBranch,headSha,createdAt`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/.github/workflows/ci.yml` (bloco `concurrency`), só leitura.

## Entregar
- "E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar." (E1.9)
- (E1) (E1.9) Cancelar com `gh run cancel <id>` só execuções em `queued` que sejam: de `docs/100-release` e `docs/100-release-b` (já mescladas); push da `develop` mais antigo que a execução verde de 1d697d6a; push de `feature/097-l1-busca` e `chore/consultas-leitura-098-099` com execução mais nova da mesma branch. Manter a execução mais nova de cada branch viva. Nada de rerun, de mudar workflow ou de configuração do repositório. Relatar a lista cancelada e a fila que sobrou. Se a recusa vier de permissão, pare e relate. Diagnóstico do porquê o `cancel-in-progress` não limpou a fila e a proposta de correção (no `ci.yml` ou no limite de concorrência) vão no relatório, sem mudar nada.
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

## Pronto quando
- PQ-1 (cmd): `gh run list --status queued --limit 40 --json databaseId` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

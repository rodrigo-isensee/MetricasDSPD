Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador-REV
Tipo: codigo
Branch: docs/100-release-b   Base: develop   Base-sha: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
Etapa: codigo   Cobre: E1.1

## Objetivo
Revalidação, sob o pedido de revalidação, do parecer de review da release 100 na branch `docs/100-release-b` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 2b85b70e). O parecer já foi regravado na volta com `commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009`; o Forge só aceita o parecer reescrito se o portão o confirmar sob este pedido (G6).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/100-release.md`.
- A saída de `forge-check parecer delta` desse parecer, rodado na worktree 052h.

## Entregar
- "E1.1 (tech-lead): confirmar o parecer de review da release pelo delta." (E1.1)
- (E1) (E1.1) Rodar o `forge-check parecer delta` do parecer; se o delta do domínio for vazio (depois de 27ac9064 só entraram pareceres), confirmar no relatório que o parecer vale como está, sem commit nem push; se não for vazio, pare e relate o delta. Nada contra a base real nem `.env*`. Sem PR.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador-REV até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 2 fontes: docs/pedidos/100-release-bloqueios-simulador-REV.md, docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): confirmar o parecer de segurança da release pelo delta." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): confirmar o parecer de QA da release pelo delta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 083-pre-push-lint-alterados
Tipo: review
Branch: docs/retros-2026-11-09   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: review   Cobre: E1.2
Revisar-sha: 6368d936ace89f9e93cb0bfc9b09365c300b8726

## Objetivo
Volta só para registrar a autoria do parecer de review. Review das retrospectivas na branch `docs/retros-2026-11-09` (só documentação, classe T: isenta de QA, review exigido): as do 079, 080, 081 e 082 (trazidas por cherry-pick) e a do 083 (E1.5), ponta 6368d936ace89f9e93cb0bfc9b09365c300b8726, entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `docs/retros-2026-11-09`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/develop 6368d936ace89f9e93cb0bfc9b09365c300b8726` (5 arquivos em `docs/retrospectivas/`).

## Entregar
- "E1.2 (tech-lead): review." (E1.2) Nesta delegação, só o review da branch das retrospectivas, pela DECISÃO TÉCNICA do Histórico de 2026-11-10 09:38 (copiada em Decisões e restrições).
- (E1) (E1.2) Volta (DECISÃO TÉCNICA do Histórico de 2026-11-10 09:42): o parecer de review da branch, commitado em bf913e4101cf258a5caa1d021c18038f3677ea21, não é a última versão gravada pela ferramenta Write. Leia o arquivo na worktree `/home/rodrigoisensee/MetricasDSPD-052h` e regrave-o inteiro pela ferramenta Write com o mesmo conteúdo do commit bf913e41 (sem Edit, sem sed, sem outro comando que mexa no arquivo depois). Com o conteúdo idêntico, `git -C /home/rodrigoisensee/MetricasDSPD-052h status --porcelain` fica vazio e não há commit nem push; se o arquivo mudar, pare e relate o diff.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 083-pre-push-lint-alterados até 3f7a71dd21a9fbbf8e7b4f629c5df4aa41156a4e5dc5ee44cb9d88ce7325ace3 (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/083-pre-push-lint-alterados.md; valem todas, leia-as nas fontes)
- 2026-11-10 09:38: DECISÃO TÉCNICA (Jarvis): o forge-check pr 083-pre-push-lint-alterados --ref origin/docs/retros-2026-11-09 diz "classe T (só documentação)", "isento de QA" e que falta o parecer de review da branch. A E1.2 (review) vale também para a branch das retrospectivas antes do PR (E1.4): o tech-lead revisa a branch (tech-lead-3) e depois abre o PR (delegação própria).
- 2026-11-10 09:42: O brief gerar do PR das retrospectivas recusou: o parecer de review da branch não tem registro de autoria do papel tech-lead na versão commitada (bf913e41; a gravada pela ferramenta Write é outra versão). DECISÃO TÉCNICA (Jarvis): volta ao tech-lead (tech-lead-5) só para regravar o parecer idêntico pela ferramenta Write, sem novo commit.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (Histórico do 077 de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: as retrospectivas (o review não as edita), outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h status --porcelain` · espera: linhas=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

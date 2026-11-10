Agente destino: forge:tech-lead
Pedido: 087-paineis-dado-real-e-demo
Tipo: merge
Branch: feature/087-k244-erro-ref-sync-apont   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: pr   Cobre: E3.6

## Objetivo
PR do K-244 (pedido 087, E3.6): a `feature/087-k244-erro-ref-sync-apont` (head 0f252f4f, código em b98021961ea5bff74e452a3aee831cdc7cc53939 conferido; review e QA aprovados nesse head; `forge-check pr` aprovado) vai para a develop por squash com a CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`.

## Ler
- Os pareceres de review e de QA do K-244 na worktree (`087-k244-erro-ref-sync-apont.md` nas pastas de review e de QA).

## Entregar
- "E3.6 (tech-lead): PR de cada branch" (E3.6) Nesta delegação, só a branch do K-244: abrir o PR para a develop (corpo pelo modelo do projeto, `Cartão: K-244`), esperar a CI verde e mesclar com squash e `--match-head-commit`, sem `--admin`, a partir da worktree. Se a branch estiver atrás da develop e o GitHub recusar o merge por isso, pare e relate (sem commit nem push nesta delegação). Se um hook recusar o merge, pare e relate a mensagem literal (não contorne).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 087-paineis-dado-real-e-demo até b5c57ee36c8f03763459cab88c730903fa7e12a4d83ac61503fa8c866e69f5ce (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/087-paineis-dado-real-e-demo.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): release pelo pedido 078." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): lote 6b;" · etapa de outra delegação; continua no pedido
- "E2.2 (react-frontend): lote 9a;" · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): lote 9b; com review, QA e segurança por lote, pelo plano do 075." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): K-215." · etapa de outra delegação; continua no pedido
- "E3.2 (node-backend): K-244." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): review de cada branch do E3 (K-215 e K-244), parecer de review commitado e enviado na própria branch." · etapa de outra delegação; continua no pedido
- "E3.5 (qa-engineer): QA de cada branch do E3, parecer de QA commitado e enviado na própria branch." · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

- "E3.6 (tech-lead): PR de cada branch", parte do K-215 · a branch do K-215 ainda está em desenvolvimento; PR em outra delegação; continua no pedido
## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/087-k244-erro-ref-sync-apont --base develop --state merged --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

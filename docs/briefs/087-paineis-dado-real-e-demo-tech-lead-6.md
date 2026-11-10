Agente destino: forge:tech-lead
Pedido: 087-paineis-dado-real-e-demo
Tipo: merge
Branch: feature/087-demo-dado-real   Base: develop   Base-sha: 4388083c63ea04993f2b1fbb7c94d45e518008ce
Etapa: pr   Cobre: E4.5

## Objetivo
PR do comando da demo com dado real (pedido 087, E4.5): a `feature/087-demo-dado-real` (head 0e206636; código em 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa conferido; review, segurança, devops e QA aprovados nesse head; `forge-check pr` aprovado, classe C) vai para a develop por squash com a CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`.

## Ler
- Os quatro pareceres `087-demo-dado-real.md` da branch (review, segurança, devops e QA), na worktree.

## Entregar
- "E4.5 (tech-lead): PR." (E4.5) Abrir o PR para a develop (corpo pelo modelo do projeto, `Cartão: K-258`, com `teto: excedido` e o motivo dado no parecer de review), esperar a CI verde e mesclar com squash e `--match-head-commit`, sem `--admin`, a partir da worktree, com o PR indicado pelo nome da branch. Se a branch estiver atrás da develop e o GitHub recusar o merge por isso, pare e relate (sem commit nem push nesta delegação). Se um hook recusar o merge, pare e relate a mensagem literal (não contorne).

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
- "E3.4 (tech-lead): review de cada branch" · etapa de outra delegação; continua no pedido
- "E3.5 (qa-engineer): QA de cada branch" · etapa de outra delegação; continua no pedido
- "E3.6 (tech-lead): PR de cada branch" · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/087-demo-dado-real --base develop --state merged --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

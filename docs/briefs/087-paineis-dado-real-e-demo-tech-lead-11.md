Agente destino: forge:tech-lead
Pedido: 087-paineis-dado-real-e-demo
Tipo: merge
Branch: feature/087-bug2-campo-etapa   Base: develop   Base-sha: 6b43d980aa18eecaf94e190dc37b2fa22459057d
Etapa: pr   Cobre: E4.11

## Objetivo
PR da correção do BUG-087-2 (pedido 087): a `feature/087-bug2-campo-etapa` (head c26e5630; código em 6dd8b6824536132fd82b64888d28b293f311a75f conferido; review, segurança e QA aprovados nesse head; `forge-check pr` aprovado, classe N) vai para a develop por squash com a CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`.

## Ler
- `docs/reviews/087-bug2-campo-etapa.md` (novo), `docs/security/087-bug2-campo-etapa.md` (novo) e `docs/qa/087-bug2-campo-etapa.md` (novo), na worktree.

## Entregar
- "E4.11 (tech-lead): PR de cada branch (a da correção e a do aviso de documentação)." (E4.11) Nesta delegação, só a branch da correção (a do aviso já tem o PR 289): abrir o PR para a develop (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`, em chamada separada; `Cartão: K-258`; PR pelo nome da branch, a partir da worktree) e esperar a CI verde. Não mesclar: o merge fica com o dono (hook R-REVIEW por prazo). Sem commit nem push nesta delegação.

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
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E4.6 (node-backend): correção do BUG-087-2 (primeira execução da demo pelo dono: a carga do Acelerato para com dados-invalidos em campo_etapa.nome); o nome do campo de etapa que chega com outra grafia (acento, maiúscula, espaço no fim) é levado ao nome canônico da lista fechada com contagem da variante, e nome desconhecido continua falhando fechado; testes para cada variante." · etapa de outra delegação; continua no pedido
- "E4.7 (tech-lead): review;" · etapa de outra delegação; continua no pedido
- "E4.8 (qa-engineer): QA;" · etapa de outra delegação; continua no pedido
- "E4.9 (security-engineer): parecer (coletor do Acelerato, gatilho de segurança);" · etapa de outra delegação; continua no pedido
- "E4.10 (devops-engineer): aviso na documentação da demo sobre a troca dos nomes ACELERATO_MYSQL_PORTA/BANCO/USUARIO/SENHA para _PORT/_DATABASE/_USER/_PASSWORD;" · etapa de outra delegação; continua no pedido
- "E4.12 (tech-lead): com o dono, a release da correção." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

- "E4.11 (tech-lead): PR de cada branch (a da correção e a do aviso de documentação).", parte do aviso · PR 289 já aberto em outra delegação (tech-lead-9); continua no pedido
## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/087-bug2-campo-etapa --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

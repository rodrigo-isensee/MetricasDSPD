Agente destino: forge:devops-engineer
Pedido: 087-paineis-dado-real-e-demo
Tipo: codigo
Branch: feature/087-doc-env-acelerato   Base: develop   Base-sha: 6b43d980aa18eecaf94e190dc37b2fa22459057d
Etapa: codigo   Cobre: E4.10

## Objetivo
Pedido 087, E4.10: na primeira execução da demo, o `.env` do dono ainda tinha os nomes antigos das variáveis do Acelerato (`ACELERATO_MYSQL_PORTA`, `_BANCO`, `_USUARIO`, `_SENHA`), e o script pede os novos (`_PORT`, `_DATABASE`, `_USER`, `_PASSWORD`). A documentação da demo passa a avisar a troca. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/087-doc-env-acelerato` (já criada sobre a develop 6b43d980aa18eecaf94e190dc37b2fa22459057d).

## Ler
- `docs/engineering/demo-dado-real.md`, seção "Antes de rodar", na worktree.

## Entregar
- "E4.10 (devops-engineer): aviso na documentação da demo sobre a troca dos nomes ACELERATO_MYSQL_PORTA/BANCO/USUARIO/SENHA para _PORT/_DATABASE/_USER/_PASSWORD" (E4.10)
- (E4) (E4.10) Acrescentar à seção "Antes de rodar" de `docs/engineering/demo-dado-real.md` um aviso curto: quem configurou o `.env` antes da mudança tem os nomes antigos e precisa renomear as quatro variáveis (tabela antigo -> novo), sem nenhum valor; e na seção "Se falhar", que a etapa 1 lista os nomes que faltam. `pnpm run docs:check` verde. Um commit só, com `Cartão: K-258` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/087-doc-env-acelerato` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/engineering/demo-dado-real.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 087-paineis-dado-real-e-demo até b5c57ee36c8f03763459cab88c730903fa7e12a4d83ac61503fa8c866e69f5ce (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/087-paineis-dado-real-e-demo.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push além do commit e do push do Entregar.

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
- "E4.11 (tech-lead): PR e, com o dono, a release da correção." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/087-doc-env-acelerato:docs/engineering/demo-dado-real.md` · espera: contém 'ACELERATO_MYSQL_PORTA'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

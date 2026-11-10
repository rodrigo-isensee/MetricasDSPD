Agente destino: forge:software-architect
Pedido: 087-paineis-dado-real-e-demo
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: codigo   Cobre: E3.3

## Objetivo
K-213 (pedido 087, E3.3): dizer, lendo só o código da develop, o que significam os bits da flag de qualidade do apontamento e o subgrupo "não classificado" da aba Apontamento, e se os números medidos (M7: 40,0% não classificado, 95,8% com alguma flag, 8,3% sem tipo) são o retrato real ou indicam regra a revisar. Sem rodar nada contra a base real e sem commit.

## Ler
- `docs/analises/064-lacunas-dado-real.md`, linha do M7 (seção de lacunas).
- O código do apontamento na develop (projeção, flags de qualidade e classificação), achado por busca no repositório.

## Entregar
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." (E3.3) Parecer em `docs/analises/087-k213-qualidade-apontamento.md` (novo), sem commit: tabela bit -> significado -> onde é calculado (arquivo:linha); regra do "não classificado"; leitura do M7 (retrato real ou regra a revisar); se houver dúvida de regra de negócio, a pergunta ao dono com uma recomendação (não decida por inferência).

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
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/087-k213-qualidade-apontamento.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

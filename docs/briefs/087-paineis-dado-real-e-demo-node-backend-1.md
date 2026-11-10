Agente destino: forge:node-backend
Pedido: 087-paineis-dado-real-e-demo
Tipo: codigo
Branch: feature/087-k244-erro-ref-sync-apont   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: codigo   Cobre: E3.2

## Objetivo
K-244 (pedido 087, E3.2): `server/src/entradas/ref-sync-apontamento.ts` ainda imprime a frase fixa "configuração ou banco inválidos" na falha; passa a usar `categoriaDoErro` do pedido 081, como `ref-sync-ac.ts` e `ref-sync-businessmap.ts` já fazem. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/087-k244-erro-ref-sync-apont` (já criada sobre a develop 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2).

## Ler
- `docs/reviews/081-categoria-erro-entradas.md`, achado A2.
- `server/src/entradas/ref-sync-apontamento.ts`, `server/src/entradas/ref-sync-ac.ts` e `server/src/entradas/ref-sync-businessmap.ts`; como modelo de teste, `server/tests/ref-sync-ac-entrada.test.ts`.

## Entregar
- "E3.2 (node-backend): K-244." (E3.2) Mesmo padrão dos outros dois ref-sync: a saída de erro mostra só a categoria (nunca a mensagem crua do driver, senha ou string de conexão), com teste da saída para sem configuração, credencial recusada e conexão recusada. Um commit só, com `Cartão: K-244`, e push da branch (primeiro plano, timeout de 600 s), sem PR.
- arquivos: server/src/entradas/ref-sync-apontamento.ts, server/tests/ref-sync-apontamento-entrada.test.ts

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 087-paineis-dado-real-e-demo até b5c57ee36c8f03763459cab88c730903fa7e12a4d83ac61503fa8c866e69f5ce (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/087-paineis-dado-real-e-demo.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): release pelo pedido 078." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): lote 6b;" · etapa de outra delegação; continua no pedido
- "E2.2 (react-frontend): lote 9a;" · etapa de outra delegação; continua no pedido
- "E2.3 (node-backend): lote 9b; com review, QA e segurança por lote, pelo plano do 075." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): K-215." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052g`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g grep -n "banco inválidos" -- server/src/entradas/ref-sync-apontamento.ts` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log --oneline 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2..origin/feature/087-k244-erro-ref-sync-apont` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

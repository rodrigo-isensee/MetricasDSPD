Agente destino: forge:tech-lead
Pedido: 087-paineis-dado-real-e-demo
Tipo: review
Branch: feature/087-k244-erro-ref-sync-apont   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: review   Cobre: E3.4
Revisar-sha: b98021961ea5bff74e452a3aee831cdc7cc53939

## Objetivo
Review do K-244 (pedido 087, E3.4): `server/src/entradas/ref-sync-apontamento.ts` passa a imprimir só a categoria do erro (`categoriaDoErro` do pedido 081), com teste novo; entrega conferida em b98021961ea5bff74e452a3aee831cdc7cc53939 (classe N: review e QA no mesmo head). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/087-k244-erro-ref-sync-apont`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2 b98021961ea5bff74e452a3aee831cdc7cc53939`.
- `docs/reviews/081-categoria-erro-entradas.md`, achado A2.

## Entregar
- "E3.4 (tech-lead): review de cada branch do E3 (K-215 e K-244), parecer de review commitado e enviado na própria branch." (E3.4) Nesta delegação, só a branch do K-244.
- (E3) (E3.4) Review contra o padrão dos outros ref-sync e contra as regras do CLAUDE.md (a saída nunca mostra senha, host, string de conexão nem texto cru do driver). Grave `docs/reviews/087-k244-erro-ref-sync-apont.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 087-paineis-dado-real-e-demo`, `branch: feature/087-k244-erro-ref-sync-apont`, `commit: b98021961ea5bff74e452a3aee831cdc7cc53939`, veredito e `## Achados`; commit só do parecer com `Cartão: K-244` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/087-k244-erro-ref-sync-apont` (`github.com` em allowed_domains); sem PR. Grave só na worktree, nunca no checkout principal.
- arquivos: docs/reviews/087-k244-erro-ref-sync-apont.md

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
- "E3.2 (node-backend): K-244." · etapa de outra delegação; continua no pedido
- "E3.3 (software-architect): K-213, leitura só do código, parecer em docs/analises/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (qa-engineer): QA de cada branch do E3, parecer de QA commitado e enviado na própria branch." · etapa de outra delegação; continua no pedido
- "E3.6 (tech-lead): PR de cada branch do E3 para a develop (squash, CI verde)." · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

- "E3.4 (tech-lead): review de cada branch do E3 (K-215 e K-244)", parte do K-215 · a branch do K-215 ainda está em desenvolvimento; review em outra delegação; continua no pedido
## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/087-k244-erro-ref-sync-apont:docs/reviews/087-k244-erro-ref-sync-apont.md` · espera: contém 'commit: b98021961ea5bff74e452a3aee831cdc7cc53939'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

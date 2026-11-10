Agente destino: forge:qa-engineer
Pedido: 087-paineis-dado-real-e-demo
Tipo: qa
Branch: feature/087-demo-dado-real   Base: develop   Base-sha: 4388083c63ea04993f2b1fbb7c94d45e518008ce
Etapa: qa   Cobre: E4.3
Revisar-sha: d98db2b2184a0008ddc51c8b73118c8541b76248

## Objetivo
QA do comando da demo com dado real (pedido 087, E4.3), sem base real: simular o roteiro que o dono vai rodar com o `.env` dele. Review e segurança aprovados sobre 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa (pareceres dc7e2756 e 87626ab9). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/087-demo-dado-real`.
Volta incremental depois da correção do BUG-087-1 (A1 do QA: `--` repassado pelo pnpm; commits d98db2b2 e 9fc2ac6a, head 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa, entrega conferida). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/087-demo-dado-real`. Parecer da rodada anterior sobre 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa.

## Ler
- `docs/engineering/demo-dado-real.md` (novo), `scripts/demo-dado-real.sh` (novo) e `scripts/demo-dado-real.test.sh` (novo), na worktree.
- E4 do pedido 087 (o que o comando tem de fazer).

## Entregar
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258)" (E4.3)
- (E4) (E4.3) Rodar `bash scripts/demo-dado-real.test.sh` (dublês de docker e pnpm, sem rede e sem base); conferir contra o E4 e contra a documentação: ordem das etapas, saída de cada falha (`.env` ausente, variável faltando, Docker parado, migração falhando, coleta falhando) com mensagem clara e sem valor de credencial, e a consulta de prova só com contagens. Casos que a simulação não cobre ficam listados como "só na primeira execução do dono". Grave `docs/qa/087-demo-dado-real.md` pela ferramenta Write, inteiro e uma vez só (regrava o parecer da rodada anterior, marcando os achados resolvidos), com `pedido: 087-paineis-dado-real-e-demo`, `branch: feature/087-demo-dado-real`, `commit: 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa`, veredito, contagem de bugs e `## Achados`; commit só do parecer com `Cartão: K-258` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); Commite depois dos commits do review e da segurança na mesma worktree (se ainda não estiverem na branch, espere por chamadas curtas de `git log`). Push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/087-demo-dado-real` (`github.com` em allowed_domains); sem PR.
- arquivos: docs/qa/087-demo-dado-real.md

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
- "E3.4 (tech-lead): review de cada branch" · etapa de outra delegação; continua no pedido
- "E3.5 (qa-engineer): QA de cada branch" · etapa de outra delegação; continua no pedido
- "E3.6 (tech-lead): PR de cada branch" · etapa de outra delegação; continua no pedido
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/087-demo-dado-real:docs/qa/087-demo-dado-real.md` · espera: contém 'commit: 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 087-paineis-dado-real-e-demo
Tipo: review
Branch: feature/087-demo-dado-real   Base: develop   Base-sha: 4388083c63ea04993f2b1fbb7c94d45e518008ce
Etapa: review   Cobre: E4.2
Revisar-sha: 93844c459b2b4b1a5b6a110ac1d571e3bccf5cf6

## Objetivo
Review do comando da demo com dado real (pedido 087, E4.2): `scripts/demo-dado-real.sh`, o teste, o atalho no `package.json` e a documentação, volta incremental depois da correção A1/A2 (commits 93844c45 e 699ad94d; head 699ad94dd8efa5cc39362ae031b1dec978c196c0). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/087-demo-dado-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 1e4a8ba8a55c0fa0d57dcc7844dee5e478695dd8 699ad94dd8efa5cc39362ae031b1dec978c196c0`.

## Entregar
- "E4.2 (tech-lead): review, com parecer em docs/reviews/ commitado e enviado na branch (cartão K-258)" (E4.2)
- (E4) (E4.2) Review do comando contra o E4 do pedido (sobe o ambiente, migra, faz a carga inicial do BusinessMap, do Acelerato e do apontamento, projeta e imprime a consulta de prova do 075 só com contagens, sem dado de pessoa) e contra as regras invioláveis do CLAUDE.md (credenciais só no `.env`; Acelerato só por GET, com a allow-list). Grave `docs/reviews/087-demo-dado-real.md` pela ferramenta Write, inteiro e uma vez só (regrava o parecer da rodada anterior, marcando os achados resolvidos), com `pedido: 087-paineis-dado-real-e-demo`, `branch: feature/087-demo-dado-real`, `commit: 699ad94dd8efa5cc39362ae031b1dec978c196c0`, veredito e `## Achados`; commit só do parecer com `Cartão: K-258` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/087-demo-dado-real` (`github.com` em allowed_domains); sem PR.
- arquivos: docs/reviews/087-demo-dado-real.md

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
- "E4.1 (devops-engineer): o comando da demo (script e documentação), com parecer de devops, e o envio da branch de trabalho (o autor envia a branch, R-FLUXO);" · etapa de outra delegação; continua no pedido
- "E4.3 (qa-engineer): QA sem base real (simulação do roteiro), com parecer em docs/qa/ commitado e enviado na branch (cartão K-258);" · etapa de outra delegação; continua no pedido
- "E4.4 (security-engineer): parecer (o script lê credenciais do `.env` e roda contra a base real quando o dono o executa), commitado e enviado pelo próprio security-engineer na branch (o forge-check exige o parecer de segurança na branch e só o papel de segurança grava em docs/security/);" · etapa de outra delegação; continua no pedido
- "E4.5 (tech-lead): PR." · etapa de outra delegação; continua no pedido
- "E5.1 (tech-lead): PR do Lote 7 pelo pedido 077." · etapa de outra delegação; continua no pedido
- "E6.1 (dono): mesclar na main, rodar a primeira coleta pelo comando da demo e devolver a saída da consulta de prova; depois, a segunda release e a demo final." · etapa de outra delegação; continua no pedido
- "E6.2 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/087-demo-dado-real:docs/reviews/087-demo-dado-real.md` · espera: contém 'commit: 699ad94dd8efa5cc39362ae031b1dec978c196c0'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

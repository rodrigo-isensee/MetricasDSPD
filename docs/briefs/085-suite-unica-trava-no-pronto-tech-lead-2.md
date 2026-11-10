Agente destino: forge:tech-lead
Pedido: 085-suite-unica-trava-no-pronto
Tipo: merge
Branch: feature/085-suite-unica-pronto   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: pr   Cobre: E1.4

## Objetivo
PR do pedido 085 (K-256) para a develop: o teste 4 de `scripts/suite-unica.test.sh` deixa de pendurar sob `pnpm run pronto`, com pareceres de devops, review e QA aprovados e conferidos e o parecer de segurança aprovado e commitado (head 89cfd6a4); o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/085-suite-unica-pronto`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/085-suite-unica-trava-no-pronto.md`, só o `## Histórico`.

## Entregar
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." (E1.4)
- (E1) (E1.4) `forge-check pr 085-suite-unica-trava-no-pronto --ref origin/feature/085-suite-unica-pronto --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado; abrir o PR em rascunho com `gh pr create --draft --base develop --head feature/085-suite-unica-pronto --title "fix(scripts): teste da trava da suíte não pendura dentro do pronto (085)" --body-file <arquivo gravado por Write no scratchpad>` rodado da worktree (corpo: o problema, a correção, os pareceres de devops, review, QA e segurança e os achados recomendados); se o hook recusar só por prazo de decisão, repita até duas vezes e, persistindo, relate a mensagem literal; esperar os checks verdes por chamadas curtas; `gh pr ready <número>` uma vez; não mesclar. `api.github.com` e `github.com` em allowed_domains. Sem `--admin` nem `--force`.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 085-suite-unica-trava-no-pronto até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/085-suite-unica-trava-no-pronto.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): correção em `scripts/suite-unica.test.sh` (e, se preciso, em `scripts/suite-unica.sh`), com o próprio teste provando os dois casos, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`bash scripts/suite-unica.test.sh` sozinho e `pnpm run pronto` inteiro sem pendurar)." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o forge-check pr classifica o diff como classe C, arquivo sensível da catraca)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/085-suite-unica-pronto --state open --json number --jq length` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

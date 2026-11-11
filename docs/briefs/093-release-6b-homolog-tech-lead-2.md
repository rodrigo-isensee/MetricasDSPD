Agente destino: forge:tech-lead
Pedido: 093-release-6b-homolog
Tipo: codigo
Branch: docs/093-release   Base: develop   Base-sha: c6e5fd8f9025e651fb9113e4ae324bf99f47ab01
Etapa: codigo   Cobre: E1.4

## Objetivo
Release 093, segundo degrau: PR da branch `docs/093-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG ce704f9b61bb23ae2b1e197d50b71394f4dbf622, review 56e4e8af, segurança e5b17cfd e QA d2e2d5ec, todos aprovados; o pronto local caiu só nos testes de CLI do server pelo sandbox, K-264) para a develop.

## Ler
- Na worktree: `docs/reviews/093-release.md` (novo), `docs/security/093-release.md` (novo) e `docs/qa/093-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; os três pareceres e os achados recomendados; o aviso ao dono sobre o corte do O1 e os bloqueios reais, A3 do QA, para o PR de release) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/093-release --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

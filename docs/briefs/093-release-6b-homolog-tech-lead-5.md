Agente destino: forge:tech-lead
Pedido: 093-release-6b-homolog
Tipo: codigo
Branch: docs/093-release-b   Base: develop   Base-sha: 9fe4b61f1dab278cf2f2fc287c6c06402e711ba0
Etapa: codigo   Cobre: E1.4

## Objetivo
Release 093, segundo degrau (volta sobre a develop 9fe4b61f): PR da branch `docs/093-release-b` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG da volta 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0, review f632f8a6, segurança 9bbf0e80 e QA f7c556a1, todos aprovados; pronto rc=0 dentro do sandbox) para a develop.

## Ler
- Na worktree: `docs/reviews/093-release.md` (novo), `docs/security/093-release.md` (novo) e `docs/qa/093-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; os três pareceres e os achados recomendados; o aviso ao dono sobre o corte do O1 e os bloqueios reais, A2 do QA, para o PR de release; o A1 do QA, regex de pessoa, é o K-267, PR próprio) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

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
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/093-release-b --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

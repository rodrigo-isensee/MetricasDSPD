Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: merge
Branch: origin/homolog   Base: main   Base-sha: bf05ac596bf68bf97e85c1da43cca584d720637b
Etapa: pedido-de-merge-ao-dono   Cobre: E1.6

## Objetivo
Release 090, último degrau: o PR de release da homolog para a main fica aberto para a validação e o merge do dono. A homolog já recebeu a develop (PRs 293 a 297 e 299) com o portão verde.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção do PR de release e do check `homolog-aprovada`.
- Os pareceres `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo), na homolog: ler com `git show` sobre `origin/homolog` na worktree 052h.

## Entregar
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." (E1.6)
- (E1) (E1.6) Abrir o PR de release da homolog para a main (`--base main --head homolog`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-262`; o que entra (089 D2 e D3, retrospectivas, Forge 0.45.5, K-261); a ordem de implantação do 089 (A1 do review: `ref:sync` do dicionário v3 e `criterios-apontamento <data da primeira varredura completa>` no mesmo dia, depois a coleta de 12 meses); o que fica de fora (o 6b, PR 298, para a próxima release); a validação manual da tela do Apontamento pelo dono, porque a release muda a interface) e conferir o check `homolog-aprovada` em laços de até 170 s por chamada. Não mesclar (a main é do dono). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit, push nem merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do tech-lead pelo CLAUDE.md (DECISÃO TÉCNICA de 2026-11-11 02:58), ou do dono se o hook recusar (K-250)." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open --head homolog --base main --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

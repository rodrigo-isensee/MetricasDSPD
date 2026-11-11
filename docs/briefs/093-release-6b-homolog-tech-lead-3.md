## Objetivo
Release 093, degrau da homolog: a develop em 9fe4b61f (PR 298, lote 6b; PR 306, CHANGELOG e pareceres da release; e os PRs 303, 304, 305 e 307, mesclados pelo dono durante a release, cada um com review e QA próprios aprovados) vai à homolog por PR, com o portão verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (só para rodar o `gh` a partir do repositório).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção da promoção para a homolog.
- Os pareceres `docs/reviews/093-release.md` (novo), `docs/security/093-release.md` (novo) e `docs/qa/093-release.md` (novo), que o PR 306 levou à develop: ler com `git show` sobre `origin/develop` na worktree 052h.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." (E1.5)
- (E1) (E1.5) Conferir que cada PR que entrou na develop depois da base da release (303, 304, 305 e 307) tem parecer de review aprovado na develop (e de QA quando não é só documentação) e que nenhum mexe nos arquivos do 6b; se algum não tiver, pare e relate. Abrir o PR da develop para a homolog (`--base homolog --head develop`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; a lista dos PRs; o aviso ao dono para validar no Operacional da homolog o corte do O1 em 2026-11-01 e os bloqueios reais de BLOQUEADOS, O1, O2, O5 e O19) e esperar o portão verde em laços de até 170 s por chamada, com uma leitura final de `gh pr checks` depois do laço. Com o portão verde e o `forge-check pr 093-release-6b-homolog --ref origin/develop --base origin/homolog` aprovado, mesclar por merge commit com `gh pr merge develop --repo rodrigo-isensee/MetricasDSPD --merge --match-head-commit` e o sha40 do head (o PR pelo nome da branch; nunca `--admin`). Se o hook ou o sistema de permissões recusar, pare e relate a mensagem literal (o merge fica para o dono). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo
## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head develop --base homolog --json number --jq .[0].number` · espera: linhas=1
## Relatório

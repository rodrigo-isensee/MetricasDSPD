## Objetivo
Release 090, terceiro degrau: PR da develop (com o PR 299 da docs/090-release já mesclado: CHANGELOG e os pareceres de review, segurança e QA aprovados) para a homolog. Worktree `/home/rodrigoisensee/MetricasDSPD-052h` (só para rodar o `gh` a partir do repositório).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- Na develop: `docs/reviews/090-release.md`, `docs/security/090-release.md` e `docs/qa/090-release.md`.

## Entregar
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." (E1.5)
- (E1) (E1.5) Conferir que a develop contém o PR 299 e não contém o PR 298 (6b), que fica fora desta release (se o 298 estiver na develop, pare e relate antes de abrir). Abrir o PR da develop para a homolog (`--base homolog --head develop`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-262`; os PRs 293 a 297 e 299; o achado A1 do QA: conferir no check-run da suíte completa com banco os testes que ficaram pulados no pronto local) e esperar o portão da homolog verde em laços de até 170 s por chamada. Não mesclar (o merge, por merge commit, é do dono, E1.5). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head develop --base homolog --json number,state --jq .[0].number` · espera: linhas=1

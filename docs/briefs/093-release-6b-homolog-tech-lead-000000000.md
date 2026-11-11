## Objetivo
Release 093, último degrau: o PR de release da homolog para a main fica aberto para a validação e o merge do dono. A homolog já recebeu a develop pelo PR 313 (lote 6b, bloqueios reais; K-121, K-172, K-263, K-264, K-265, K-266 e K-267; CHANGELOG e pareceres da release).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`, seção do PR de release e do check `homolog-aprovada`.
- Os pareceres `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo), na homolog: ler com `git show` sobre `origin/homolog` na worktree 052h.

## Entregar
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." (E1.7)
- (E1) (E1.7) Abrir o PR de release da homolog para a main (`--base main --head homolog`; corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; o que entra (lote 6b com os bloqueios reais e os cartões técnicos); o aviso ao dono da E1.6: validar no Operacional da homolog os bloqueios reais de BLOQUEADOS, O1, O2, O5 e O19 e o corte da série do O1 em 2026-11-01 antes do merge; o que fica de fora (lotes 9a e 9b do 075, depois dessa validação)) e conferir o check `homolog-aprovada` em laços de até 170 s por chamada. Não mesclar (a main é do dono). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open --head homolog --base main --json number --jq .[].number` · espera: linhas=1

## Objetivo
PR do K-102 (fila de montagem dos gráficos que destrava o perf da visão semanal) para a develop, com review (revalidado sobre 36975e6), QA (36975e6) e UX aprovados. Pedido 018. Worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`.

## Ler
- `docs/pedidos/018-pr-do-k102.md`.
- Na worktree: os pareceres `docs/reviews/k102-perf-semanal.md`, `docs/qa/k102-perf-semanal.md` e `docs/ux/revisao-k102-perf-semanal.md`, só o frontmatter e o veredito.
- `docs/engineering/praticas.md`, seção de commits.

## Entregar
- (E1) Trazer a `develop` para a branch (R-FLUXO). Se o merge mudar código do escopo, os pareceres têm de ser revalidados: pare e relate em vez de abrir o PR.
- (E1) Push, PR para a `develop` (squash) com o resumo, os números do QA (Lighthouse e TBT da semanal) e os links dos 3 pareceres; mesclar com os checks exigidos verdes; depois, apagar a branch local e a remota e remover a worktree `-perf-semanal` (R-FLUXO, "Depois do merge").
- Fora do escopo: a promoção para a homolog; os 4 itens manuais do roteiro do QA (ficam para a validação do usuário na release); o K-103 e o front do 011.

## Decisões e restrições
- Squash na `develop` (fluxo do `CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Check vermelho por ruído só se rerroda uma vez; falha que persiste é relatada.
- NÃO tocar: código da branch, `.github/`, a worktree `-011-fase2` e o diretório principal.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): sem `pronto` local, que já rodou no QA; o portão é a CI do PR.

## Pronto quando
- PQ-1 (push): branch `fix/perf-visao-semanal` no origin.
- PQ-2 (pr): PR de `fix/perf-visao-semanal` para a `develop` aberto.
- PQ-3 (merge): PR mesclado na `develop`.
- PQ-4 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-perf-semanal && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

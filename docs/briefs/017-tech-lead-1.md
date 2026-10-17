## Objetivo
Levar à develop os docs da retomada de 2026-10-17 (pedidos 011 a 018, quadro, briefs, K-104), já revisados na branch `docs/retomada-2026-10-17` (parecer `013-docs-retomada.md`, aprovado, commit 112a928). Pedido 017. Diretório principal `/home/rodrigoisensee/MetricasDSPD`.

## Ler
- `docs/pedidos/017-pr-docs-da-retomada.md` (na branch `docs/retomada-2026-10-17`).
- `docs/engineering/fluxo-homologacao.md`, só a parte de PR só de docs.

## Entregar
- (E1) PR da branch `docs/retomada-2026-10-17` para a `develop` (squash), com o resumo do conteúdo e o link do parecer de review.
- (E1) Mesclar quando os checks de docs ficarem verdes; depois, apagar a branch local e a remota (R-FLUXO, "Depois do merge") e deixar o diretório principal na `develop` atualizada.
- Fora do escopo: a seção "Release #101" do parecer de devops, ainda sem commit no diretório principal (vai num PR de docs seguinte); a promoção para a homolog; os PRs de código.

## Decisões e restrições
- Squash na `develop` (fluxo do `CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `-011-fase2`, `-perf-semanal`, as branches `ref/*`, `homolog`, `main`, e o arquivo de devops com a seção "Release #101" (deixe sem commit no diretório principal).

## Pronto quando
- PQ-1 (pr): PR de `docs/retomada-2026-10-17` para a `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop`.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/docs/retomada-2026-10-17` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD branch --show-current` · espera: igual 'develop'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

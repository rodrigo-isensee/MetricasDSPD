## Objetivo
Voltar ao teto de worktrees (R-TETO: no máximo 2 além do diretório principal; hoje são 5) e preparar para a develop os docs soltos da retomada (branch, push e review; o PR é o pedido 017). Cartão K-105. Diretório principal `/home/rodrigoisensee/MetricasDSPD`, hoje na `develop` (b73bad3).

## Ler
- `docs/pedidos/013-limpeza-worktrees-e-docs-da-retomada.md` (E1 e E2).
- `git worktree list`; `git status --short` de cada worktree.
- `docs/engineering/praticas.md`, seção de commits; `docs/engineering/fluxo-homologacao.md`, só a parte de PR só de docs.

## Entregar
- (E1) Remover as worktrees `-011-back` (já mesclada; mantenha as branches `ref/*`), `-qa` e `-demo`, e apagar as branches locais e remotas já mescladas delas (R-FLUXO, "Depois do merge"). Antes de remover a `-qa`: confira se cada arquivo sem commit ou modificado nela (docs/qa/bugs/IF-004..., ADR 0019, plano da Sustentação, pedido 010, docs/ux/...) já está na develop com o mesmo conteúdo ou mais novo; o que não estiver, relate e não apague.
- (E1) Ficam: `-011-fase2` (K-103) e `-perf-semanal` (K-102).
- (E2) Branch `docs/retomada-2026-10-17` a partir da develop, com: a seção "Release #96" do parecer de devops de 2026-10-16 (já escrita pelo devops-engineer, arquivo modificado no diretório principal), `docs/pedidos/` (011 a 018), `KANBAN.md`, `docs/kanban/historico.md`, `docs/kanban/melhorias.md`, `docs/briefs/` e, do K-104 do architect (pronto, sem commit), `docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md` e `docs/architecture/features/metricas-tambem-disponiveis.md`. Commit (`git add` por caminho) e push da branch.
- (E2) Parecer de review dos docs da branch em `docs/reviews/013-docs-retomada.md` (o `pedido:` do parecer é `013`), gravado com Write e commitado na mesma branch: conferir que só há `.md`, que o `docs:check` passa e que nenhum arquivo traz segredo ou dado de pessoa.
- Fora do escopo: abrir e mesclar o PR (pedido 017, "E1.1 (forge:tech-lead): PR de docs da retomada, mesclado na develop."); promoção para a homolog; os PRs de código (K-102, pedidos 012 e 018; K-103, pedido 011); o #101 (pedido 014).

## Decisões e restrições
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: não apague `develop`, `homolog`, `main` nem `ref/*`. Não mexa em `-011-fase2` nem em `-perf-semanal`.
- `git add` explícito por caminho.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list` · espera: linhas=3
- PQ-2 (sha): commit(s) de docs na branch `docs/retomada-2026-10-17`.
- PQ-3 (push): branch `docs/retomada-2026-10-17` no origin.
- PQ-4 (arquivo): `docs/reviews/013-docs-retomada.md` na branch `docs/retomada-2026-10-17`.
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD status --short -- KANBAN.md docs/pedidos docs/kanban` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (worktrees e branches apagadas, arquivos da `-qa` conferidos); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

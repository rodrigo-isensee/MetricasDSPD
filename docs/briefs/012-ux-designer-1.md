## Objetivo
Revisão de UX do K-102: a fila de montagem faz os gráficos aparecerem um por vez, o que pode mudar o que a pessoa vê enquanto a página carrega (espaço reservado, ordem e anúncio para leitor de tela). Cartão K-102, worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`, branch `fix/perf-visao-semanal`, HEAD aeacff4.

## Ler
- `docs/reviews/k102-perf-semanal.md` (na worktree): itens 4 "Acessibilidade" e 5 "CLS" e a seção "Revisão de UX".
- `docs/tecnica/arquitetura-front.md` §10 (na worktree).
- Na worktree: `web/src/components/charts/filaDeGraficos.ts` e o `GraficoBase` em `web/src/components/charts/` (onde a fila é usada).

## Entregar
- (E1) Parecer de revisão de UX em `docs/ux/revisao-k102-perf-semanal.md` na worktree, com `pedido: k102-perf-semanal`, gravado com Write: o gráfico reserva o espaço antes de aparecer (sem salto de layout), a ordem de leitura e o foco não mudam, o leitor de tela não recebe anúncios repetidos, e nada some para quem usa `prefers-reduced-motion`. Achados com severidade.
- Fora do escopo, etapa anterior do E1 em paralelo (citada de "## Etapas"): "E1.3 (forge:qa-engineer): QA do K-102."
- Fora do escopo: mudar código; o PR (pedido 018); o commit do parecer (o QA ou o tech-lead commita junto).

## Decisões e restrições
- Especificações de UX vigentes em `docs/ux/` valem como referência; nenhuma especificação nova.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (arquivo): `docs/ux/revisao-k102-perf-semanal.md` na worktree `/home/rodrigoisensee/MetricasDSPD-perf-semanal`.
- PQ-2 (cmd): `grep -n -E "^pedido: k102-perf-semanal" /home/rodrigoisensee/MetricasDSPD-perf-semanal/docs/ux/revisao-k102-perf-semanal.md` · espera: linhas=1

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

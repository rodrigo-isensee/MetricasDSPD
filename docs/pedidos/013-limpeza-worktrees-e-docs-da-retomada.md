# Pedido 013 — Limpeza de worktrees e PR de docs da retomada

- **Data:** 2026-10-17
- **Origem:** retomada de 2026-10-17 ("continue o trabalho"); saiu do pedido 012.
- **Modo:** implementar.

## Escopo
- **E1:** limpeza de worktrees (`R-TETO`: no máximo 2 além do diretório principal). Hoje são 5: `-011-back` (mesclada; manter as `ref/*`), `-qa` (antiga), `-demo` (HEAD solto), `-011-fase2` e `-perf-semanal`.
- **E2:** branch `docs/retomada-2026-10-17` com commit, push e parecer de review do tech-lead, para o PR (pedido 017), levando o parecer de devops de 2026-10-16 (seção do release #96), os pedidos 011 a 018, o quadro, o histórico, os briefs e os arquivos do K-104 (ADR 0020 e plano do 011).

## Etapas
- E1.1 (forge:tech-lead): limpeza de worktrees.
- E2.1 (forge:tech-lead): commit, push e parecer de review da branch de docs da retomada.

## Fora do escopo
- Abrir e mesclar o PR de docs: pedido 017 (o review tem de existir antes do PR).
- Mexer na `main` (R-MAIN).

## Suposições
- Nenhuma.

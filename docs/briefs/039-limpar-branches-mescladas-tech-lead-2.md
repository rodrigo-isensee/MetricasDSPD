Agente destino: forge:tech-lead
Pedido: 039-limpar-branches-mescladas
Branch: develop   Base: develop   Base-sha: 794b9820cb4bab30e50b7de64748030b474a3074

## Objetivo
Apagar as 4 branches locais de experimento que o dono autorizou apagar mesmo com conteúdo fora da develop (decisão A de 2026-10-21). Etapa E2.1 do pedido 039, cartão K-124. Trabalhe a partir de `/home/rodrigoisensee/MetricasDSPD` sem trocar a branch dele.

## Ler
- `docs/pedidos/039-limpar-branches-mescladas.md`: Etapas, Fora do escopo e Decisões.

## Entregar
- (E2) Apagar, local e remota se existir, as branches `ref/c6-cede-por-metrica`, `ref/c6-gerador-em-fases`, `test/qa-intensivo-main` e `tmp/taticas-sobre-develop`, com `git branch -D` (autorizado pelo dono para estas 4, apesar das alterações exclusivas). Antes, registre no relatório o sha da ponta de cada uma (para recuperação pelo reflog).

## Fora do escopo
- "E1.1 (forge:tech-lead): limpeza (E1 e E2) e relatório com o que apagou e o que ficou." · etapa cumprida.
- `feature/011-metricas-tambem-back` e `feature/011-fase2-back` (e a worktree -011-fase2): mantidas; `develop`, `homolog`, `main`; `feature/025-front-taticas`, `feature/037-c6-operacional`, `docs/jarvis-2026-10-20-noite`; worktrees -025, -037, -main; o quadro; PR; nada se grava no repositório.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): "limpe as branchs que ja estao na develop".
- DECISÃO DO DONO (2026-10-21): branches com conteúdo fora da develop, opção A ("A"): apagar as 4 de experimento (ref/c6-cede-por-metrica, ref/c6-gerador-em-fases, test/qa-intensivo-main, tmp/taticas-sobre-develop), mesmo com alteração exclusiva; manter feature/011-metricas-tambem-back e feature/011-fase2-back para o tech-lead avaliar se o conteúdo ainda deve ir à develop.
- R-FLUXO: nunca `develop`, `homolog` nem `main`. R-MAIN: nada na `main`. Só estas 4 com `-D`.

## Pronto quando
- PQ-1 (cmd): `git branch --list ref/c6-cede-por-metrica ref/c6-gerador-em-fases test/qa-intensivo-main tmp/taticas-sobre-develop` · espera: linhas=0
- PQ-2 (cmd): `git branch --list feature/011-metricas-tambem-back feature/011-fase2-back develop main` · espera: linhas=4

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

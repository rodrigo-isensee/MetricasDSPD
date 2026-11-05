Agente destino: forge:software-architect
Pedido: 064-lacunas-dado-real
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: codigo   Cobre: E1.2

## Objetivo
Mapa das telas e indicadores das operacionais, da aba do apontamento e da sustentação, com a fonte de cada dado e a regra de sem dado, para o levantamento das lacunas de dado real (pedido 064, E1.2, K-202).

## Ler
- Na worktree de leitura `/home/rodrigoisensee/MetricasDSPD-056d` (develop atual, HEAD destacado): `web/src/features/` (operacional, apontamento, sustentação e o que a rota de cada tela usa), as rotas e consultas em `server/src/`, as migrações e grants em `server/migrations/` e `server/src/` para saber as tabelas; `docs/ux/` e `docs/api/` das telas; ADR 0026 (só dado real) em `docs/architecture/adr/`.
- Do briefing `/home/rodrigoisensee/MetricasDSPD-056d/docs/briefing-execucao-metricas.md`, só o catálogo de métricas e a regra de publicação (abaixo de 20 itens não publica).

## Entregar
- "E1.2 (software-architect): mapa de E1 a partir do código e das especificações da develop, na worktree 056d, em docs/analises/064-lacunas-dado-real.md (sem commit)." (E1.2)
- (E1.2) gravar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` pela ferramenta Write, sem commit: uma tabela por área (operacionais, apontamento, sustentação) com as colunas tela, indicador (ID do catálogo quando houver), rota da API, tabelas e colunas lidas, fonte (BusinessMap ou Acelerato), regra de sem dado (amostra mínima, janela, campo vazio) e o que precisa existir na base para o indicador aparecer com dado real; marcar onde o código ainda não lê dado real (mock, constante, TODO) com arquivo e linha; deixar uma coluna vazia `resultado na base` para o QA.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`; não chama as APIs do BusinessMap nem do Acelerato.
- Regras invioláveis do CLAUDE.md: nenhuma métrica por pessoa; BusinessMap e Acelerato nunca se misturam; a regra de abaixo de 20 itens é do briefing, não é lacuna.
- Achado vai à tabela, sem corrigir código nem documento.
- NÃO tocar: código, testes, outros documentos, a worktree (só leitura), o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): levar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-056d (HEAD destacado, limpa) para a origin/develop atual, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido; a conferência com a base, que é do QA.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` existe com as três tabelas e a coluna `resultado na base`

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
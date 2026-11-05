Agente destino: forge:qa-engineer
Pedido: 064-lacunas-dado-real
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: qa   Cobre: E1.3

## Objetivo
Conferir o mapa de lacunas de dado real contra a base e o código (pedido 064, E1.3, K-202).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (o mapa do arquiteto, com as lacunas L1 a L12); o código na worktree de leitura `/home/rodrigoisensee/MetricasDSPD-056d` (develop 1f1da67, HEAD destacado) para confirmar arquivo e linha de cada lacuna; as migrações em `/home/rodrigoisensee/MetricasDSPD-056d/server/migrations/` para os nomes de tabela e coluna.

## Entregar
- "E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar." (E1.3)
- (E2) (E1.3) para cada linha do mapa, confirmar no código a lacuna citada (arquivo e linha batem; o que lê, o que grava) e preencher `resultado na base` com: confirmado no código, não confirmado (e por quê) ou depende da base; escrever em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` uma consulta SELECT por indicador que dependa da base (contagem na janela de 12 semanas, linhas com a coluna preenchida, fatos existentes), cada uma com um comentário dizendo o indicador e o que o resultado significa; nada de INSERT, UPDATE, DELETE nem DDL; nenhuma coluna de pessoa (nome, e-mail, ids de usuário); tentar rodar contra a base só se der sem ler o `.env` (se não der, o dono roda na E1.4); arquivos gravados pela ferramenta Write ou Edit, sem commit.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- ADR 0026 (citada no pedido): o Histórico só registra que está ainda sem commit (branch docs/060-triagem-dependabot); não muda nesta etapa
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs do BusinessMap nem do Acelerato.
- Regras invioláveis do CLAUDE.md: nenhuma métrica por pessoa; BusinessMap e Acelerato nunca se misturam numa consulta; abaixo de 20 itens é regra do briefing, não lacuna.
- Achado vai ao mapa, sem corrigir código; worktree só leitura.
- NÃO tocar: código, testes, a worktree (só leitura), outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): levar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-056d (HEAD destacado, limpa) para a origin/develop atual, sem commit." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): mapa de E1 lido do código e das especificações da develop na worktree 056d (só leitura) e gravado em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md (sem commit)." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -cE 'confirmado no código|depende da base' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` · espera: rc=0
- PQ-2 (cmd): `grep -ciE 'insert|update|delete|drop|alter' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
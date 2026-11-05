Agente destino: forge:qa-engineer
Pedido: 064-lacunas-dado-real
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: codigo   Cobre: E1.1

## Objetivo
Criar a worktree de leitura do levantamento de lacunas de dado real (pedido 064, E1.1, K-202).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list`.

## Entregar
- "E1.1 (qa-engineer): criar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-052e na origin/develop atual (HEAD destacado), sem commit." (E1.1)
- (E1.1) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD fetch origin develop`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree add --detach /home/rodrigoisensee/MetricasDSPD-052e origin/develop`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052e rev-parse HEAD` igual a `git -C /home/rodrigoisensee/Metricas/MetricasDSPD rev-parse origin/develop`; sem commit, sem branch nova, sem instalar dependência.
- (E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Se a pasta já existir, pare e relate sem apagar.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--force`.
- NÃO tocar: outras worktrees e branches, código, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (software-architect): mapa de E1 a partir do código e das especificações da develop, na worktree 052e, em docs/analises/064-lacunas-dado-real.md (sem commit)." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list` · espera: contém 'MetricasDSPD-052e'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
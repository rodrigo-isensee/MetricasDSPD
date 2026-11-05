Agente destino: forge:agile-coach
Pedido: 064-lacunas-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.6

## Objetivo
Retrospectiva do pedido 064 (levantamento das lacunas de dado real) (pedido 064, E1.6, K-202).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/064-lacunas-dado-real.md` (Histórico inteiro); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md` (linhas do 064); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/historico.md` (K-202); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (seção Lacunas confirmadas).

## Entregar
- "E1.6 (agile-coach): retrospectiva do pedido 064." (E1.6)
- (E1.6) retrospectiva em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-04-064-lacunas-dado-real.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (hora de cada evento do Histórico), rodadas e reprovações de brief por classe de causa, e linhas `MELHORIA:` (uma por linha: problema, evidência por data e arquivo, medida do efeito, Forge ou projeto). Avalie pelo menos: o sandbox impedindo criar pasta de worktree; agentes sem acesso à base (consultas para o dono); o mapa real aceitar métrica sem gravador (L1); as rodadas de brief por citação de ADR sem commit. Um commit só da retrospectiva com `Cartão: K-202`, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/retrospectivas/2026-11-04-064-lacunas-dado-real.md` explícito; sem push.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- ADR 0026 (citada no pedido): o Histórico só registra que está ainda sem commit (branch docs/060-triagem-dependabot); não muda nesta etapa
- O agente não abre, lê nem edita arquivos `.env*`.
- Implementar melhoria não é desta etapa; o quadro e o arquivo do pedido são do Jarvis.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, `KANBAN.md`, `docs/kanban/historico.md`, o arquivo do pedido, outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`; sem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): levar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-056d (HEAD destacado, limpa) para a origin/develop atual, sem commit." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): mapa de E1 lido do código e das especificações da develop na worktree 056d (só leitura) e gravado em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md (sem commit)." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): ler a saída das consultas do dono, preencher o resultado na base de cada linha do mapa e listar as lacunas com o tamanho medido." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-04-064-lacunas-dado-real.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-11-04-064-lacunas-dado-real.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
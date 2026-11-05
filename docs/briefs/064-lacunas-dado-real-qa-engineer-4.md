Agente destino: forge:qa-engineer
Pedido: 064-lacunas-dado-real
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: qa   Cobre: E1.5

## Objetivo
Interpretar a saída das 32 consultas do dono e fechar o mapa de lacunas com o tamanho medido de cada uma (pedido 064, E1.5, K-202).

## Ler
- `/home/rodrigoisensee/logs-metricas/064-consultas-saida-20261104-0803.txt` (saída das consultas; só contagens); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (o mapa); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-consultas-dono.sql` (o que cada consulta mede).

## Entregar
- "E1.5 (qa-engineer): ler a saída das consultas do dono, preencher o resultado na base de cada linha do mapa e listar as lacunas com o tamanho medido." (E1.5)
- (E2) (E1.5) preencher no mapa `resultado na base` de cada linha com o número medido e a conclusão (lacuna confirmada na base, não confirmada, ou indicador com dado real); a Q20 falhou porque a migração 0034 não está aplicada na base local: registrar como esperado até o deploy; no fim do mapa, uma seção `## Lacunas confirmadas` com uma linha por lacuna: ID, o que falta, tamanho medido, telas afetadas, e quem corrige (papel do time, ou pessoas quando é configuração de ferramenta das frentes WS1 e WS4); gravar pela ferramenta Write ou Edit, sem commit.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- ADR 0026 (citada no pedido): o Histórico só registra que está ainda sem commit (branch docs/060-triagem-dependabot); não muda nesta etapa
- 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- O agente não abre, lê nem edita arquivos `.env*`; não roda consultas na base.
- Regras invioláveis do CLAUDE.md: nenhuma métrica por pessoa (nenhum número por pessoa no mapa); BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens é regra do briefing, não lacuna.
- A saída tem só contagens; se aparecer qualquer dado de pessoa, não copie e relate.
- NÃO tocar: código, testes, a saída das consultas, outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (qa-engineer): levar a worktree de leitura /home/rodrigoisensee/MetricasDSPD-056d (HEAD destacado, limpa) para a origin/develop atual, sem commit." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): mapa de E1 lido do código e das especificações da develop na worktree 056d (só leitura) e gravado em /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md (sem commit)." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): conferência de E2 contra a base local, só leitura (API local ou consultas SELECT), acrescentando a coluna de resultado ao mapa; o que não der para conferir no sandbox vira consulta para o dono rodar." · etapa de outra delegação; continua no pedido
- "E1.4 (dono): rodar as consultas que o QA não conseguir rodar, se houver." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido; abrir cartões (é do Jarvis).

## Pronto quando
- PQ-1 (cmd): `grep -c '^## Lacunas confirmadas' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
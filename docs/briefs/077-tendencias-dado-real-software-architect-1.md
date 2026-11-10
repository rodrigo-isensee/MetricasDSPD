Agente destino: forge:software-architect
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho curto para as tendências do Resumo (TENDENCIA_FLUXO e TENDENCIA_SUST) entrarem no mapa real, pela decisão do dono no K-211 (pedido 077, E1.1). Leitura na develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md`: linhas 80, 82 e 140 (L4) e a linha da L4 na tabela de lacunas confirmadas.
- Na 056d: a ADR 0019 (procure em `docs/architecture/adr/`), onde as tendências são montadas e o mapa de origem real (procure `TENDENCIA_FLUXO` em `server/src/` e `packages/`); só o necessário.

## Entregar
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." (E1.1)
- (E1) (E1.1) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` pela ferramenta Write, sem commit: o que as tendências calculam hoje e de onde (arquivo e linha), o que falta para entrarem no mapa real (origem, leitura das séries de O3, O4, S2 e S3, mínimo de 20 por ponto, versão de critério T2.6, BusinessMap e Acelerato nunca misturados), os lotes pequenos (até 150 linhas cada) com testes, o impacto em contrato e tela (se a tela mudar, diga, para o UX entrar), riscos e perguntas de regra de negócio ao dono. Até 60 linhas.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- ADR 0019 (citada no 064, L4): define as tendências a partir de O3, O4, S2 e S3; leia na develop.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c "TENDENCIA_SUST" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

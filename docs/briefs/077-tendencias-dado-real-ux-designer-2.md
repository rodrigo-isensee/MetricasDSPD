Agente destino: forge:ux-designer
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E2.0

## Objetivo
Especificação curta da tela das tendências do Resumo com dado real: como aparece o ponto de janela incompleta (P-077-1) e a ressalva do S2 na tendência de SLA (P-077-2) (pedido 077, E2.0). Leitura na develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`.
- Na 056d: `web/src/features/operacional/resumo/` (TendenciaFluxo.tsx, TendenciaSustentacao.tsx e o bloco que as contém), a nota `excecao-sla-sem-fonte` do S2 e como a tela do S2 a mostra hoje (procure o nome em `web/src/`), e o componente de marca de mudança de critério (`AvisoCriterio`); só o necessário.

## Entregar
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." (E2.0)
- (E2) (E2.0) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md` pela ferramenta Write, sem commit: como o ponto de janela incompleta aparece no gráfico (sem ponto, nunca zero; legenda ou texto de apoio), como a ressalva do S2 aparece na tendência de SLA reaproveitando o texto e o padrão que o S2 já usa, a marca de critério da passagem para dado real (reuso do AvisoCriterio), acessibilidade e critérios de aceite; sem componente novo se possível.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- ADR 0019 (citada no desenho): define as tendências a partir de O3, O4, S2 e S3; leia na develop.
- Nenhuma métrica serve para avaliação individual; nada de pessoa na tela.
- NÃO tocar: outros arquivos (código, testes, ADRs, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c "janela incompleta" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md` · espera: linhas>=1
- PQ-2 (cmd): `grep -c "S2" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

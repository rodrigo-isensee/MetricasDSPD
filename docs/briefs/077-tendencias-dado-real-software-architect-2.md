Agente destino: forge:software-architect
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Atualizar o desenho das tendências do Resumo (K-211) com as decisões do dono de 12:06 e com o que a especificação de UX pede do back-end (motivo por ponto e data da primeira carga), antes do código (pedido 077, E1.1). Leitura na develop em `/home/rodrigoisensee/MetricasDSPD-056d` (f21220fe).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` (o seu) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md` (necessidades de dados e critérios de aceite).
- Na 056d, só o que mudar o desenho: o contrato das tendências em `packages/contratos/` e `docs/contratos/politica-de-mudanca.md` (linhas 20 a 50).

## Entregar
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." (E1.1)
- (E1) (E1.1) Reescrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` pela ferramenta Write, sem commit: as P-077-1 a P-077-3 como decididas; os lotes revistos (até 150 linhas cada, um comportamento, uma seção `## Lote <n>` por lote) com o motivo por ponto, a data da primeira carga e o campo `notas`, cada mudança de contrato classificada pela política (aditiva ou incompatível, com a entrada em `aceitas.json` quando incompatível), quem faz cada lote (node-backend, react-frontend) e os testes ligados aos critérios de aceite da UX.
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- ADR 0019 (citada no 064, L4): define as tendências a partir de O3, O4, S2 e S3; leia na develop.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; feita
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `grep -c "^## Lote" /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` · espera: linhas>=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

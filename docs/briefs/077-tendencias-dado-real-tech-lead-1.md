Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.2

## Objetivo
Revisão do desenho das tendências com dado real (cartão K-211, pedido 077, E1.2) antes do código, para o Lote 1 começar com o node-backend. Só leitura; o código se lê na develop atual (d1f22008) por `git -C /home/rodrigoisensee/Metricas/MetricasDSPD show origin/develop:<caminho>`, sem worktree nova.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/077-tendencias.md`.
- Do pedido `docs/pedidos/077-tendencias-dado-real.md`: `## Escopo`, `## Etapas` e, do `## Histórico`, as linhas de 12:03, 12:10, 12:17 e as DECISÃO DO DONO.

## Entregar
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." (E1.2)
- (E1) (E1.2) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md` pela ferramenta Write, sem commit, com veredito (aprovado, aprovado com ressalvas ou reprovado) e um bloco `## Achados`, cada achado com lote, gravidade (bloqueante ou recomendado) e correção; foco: ordem e independência dos 7 lotes, contrato aditivo (janelaIncompleta e notas opcionais, sem aceitas.json), função única da janela na biblioteca, testes e provas (CI do push), teto de 150 linhas por lote, a P-077-4 já decidida (início do histórico carregado) no Lote 3, o efeito da P-077-5 ainda aberta (Lote 8 só se o dono escolher A) e conflito com os lotes abertos do 075 (origem.ts e o mapa real).
- (E2) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- 2026-11-06 11:11: DECISÃO DO DONO: "A" (K-211, registrada no pedido 073): as tendências do Resumo entram no mapa real, como pedido novo (077).
- 2026-11-06 12:06: DECISÃO DO DONO (literal "Faca suas recomendacoes", resposta às P-077-1 a P-077-3): as três recomendações do Jarvis.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-1, pela recomendação): ponto cuja janela de 12 semanas começa antes da primeira carga não publica e mostra janela incompleta.
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-2, pela recomendação): a tendência de SLA leva a ressalva do S2 (lote L3: notas no contrato e na tela, com o ux-designer).
- 2026-11-06 12:06: DECISÃO DO DONO: "A" (P-077-3, pela recomendação): a passagem para dado real vira marca de critério (T2.6) no eixo das tendências.
- 2026-11-06 14:54: DECISÃO DO DONO: "A" (P-077-4, pela recomendação): a primeira carga é a data em que o histórico carregado começa (inicio_carga da carga inicial), não o dia em que a carga rodou. Destrava o Lote 3. PERGUNTA: P-077-5 vai ao dono; na fila: tabela P-E10-2, P-E10-5 e P-E10-6 (073).
- ADR 0019 (citada no pedido): o cálculo das tendências já existe por ela (uma fonte por tendência, mínimo de 20); o desenho não muda o cálculo de O3, O4, S2 e S3 (Fora do escopo do pedido).
- 2026-11-06 12:17: DECISÃO TÉCNICA (Jarvis): revisão do desenho pelo tech-lead antes do lote 1.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`.
- NÃO tocar: código, o desenho, a especificação, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`; sem commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; feita
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; feita
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

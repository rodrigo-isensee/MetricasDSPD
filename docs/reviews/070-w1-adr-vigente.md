---
tipo: review
contrato: 1
pedido: 070-simulado-por-cartao
branch: docs/070-adr-0028-vigente
commit: 5a232d533cb9e003ecf903700d64401364fe62a4
parecer: aprovado
revisor: tech-lead
data: 2026-11-05
---
# Code review: 070, ADR 0028 e desenho para vigente (K-221, E1.13)

## Parecer

Aprovado. A ADR 0028 e o desenho do 070 passam a vigente desde 2026-11-05 só no estado e nas notas. A condição para vigente está cumprida e cada pergunta aponta a decisão do dono que a responde. D1 a D7 não mudam de conteúdo: o diff troca "proposta" pela decisão que confirmou a proposta, sem alterar o que cada item decide.

## Delta lido

- `git diff b8b2a22..5a232d5` (2 arquivos, 21 linhas a mais e 21 a menos): `docs/architecture/adr/0028-simulado-por-cartao.md` e `docs/analises/070-desenho.md`.
- Conferido contra as linhas `DECISÃO DO DONO` de 2026-11-04 (recibo, protótipo "A", cartão simulado no resumo "A") e de 2026-11-05 (S1 a S3 "A").

## Conferência

- Estado: "vigente desde 2026-11-05 (proposta em 2026-11-04)" na ADR e no desenho; a data original da ADR foi mantida.
- Condição cumprida: (1) selo pelo protótipo validado em 2026-11-04; (2) Q-070-2 e Q-070-6 pela decisão "A" de 2026-11-04 e Q-070-1, Q-070-3, Q-070-4 e Q-070-5 pela S1 a S3 de 2026-11-05. Bate com o pedido.
- Q-070-6: ligada à decisão "A" de 2026-11-04 (simulado fora da Visão geral), coerente com D5 (`VISAO_GERAL` fora da simulação).
- Q-070-4 item b: a nota diz que o plano das tendências para o mapa real não foi objeto da S3 e segue no L4 do 064; não cria decisão nova (R-DECISAO).
- Nota do F6: +2,33 KB, 197,04 KB, teto de 200 KB da ADR 0003 sem mudança, na ADR (Consequências) e no desenho (seção 6 e T-E4), com a origem no achado A2 do review 070-v4.
- Regras invioláveis do CLAUDE.md: nenhuma tocada; o texto não mistura domínios nem libera métrica individual.
- Ferramenta: `pnpm run docs:check` rodado antes do envio (saída no relatório da entrega).
- Segurança: só texto `.md`, sem gatilho; QA dispensado por decisão técnica do Jarvis de 2026-11-05 (só `.md` fora do controle).

## Achados

- A1 (recomendado) docs/architecture/adr/0028-simulado-por-cartao.md:7 · A linha da ADR 0026 ainda diz que ela está só na worktree 052b, sem commit na develop, mas o arquivo já está na develop; vale atualizar numa próxima edição. Fora do diff.

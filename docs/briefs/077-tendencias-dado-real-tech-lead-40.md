Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: review
Branch: feature/077-l7-sust-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: review   Cobre: E2.2
Revisar-sha: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3

## Objetivo
Review do Lote 7 das tendências com dado real (K-211, pedido 077): `TENDENCIA_SUST` no mapa real e constante da virada do Acelerato. Ponta 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3, entrega conferida, CI verde; a branch nasce da ponta do Lote 5 (`origin/feature/077-l5-fluxo-real`), e o escopo é `origin/feature/077-l5-fluxo-real..9dc0c0ef`. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/077-l7-sust-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/feature/077-l5-fluxo-real 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3` (5 arquivos).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: só "Lote 7"; `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9 e A11.

## Entregar
- "E2.2 (tech-lead): review por lote." (E2.2) Nesta delegação, só o review do Lote 7.
- (E2) (E2.2) Review do Lote 7 contra o desenho e a revisão: `TENDENCIA_SUST` no mapa real e fora da simulação (A9); constante da virada do Acelerato com `afeta: ['TENDENCIA_SUST']` e data a corrigir no merge (A8); testes de rota sem mock (19 apuráveis `insuficiente`; BusinessMap sem efeito; marca da virada; nota do S2 no resultado real); pela P-077-6 = (a), nenhum ponto com janela incompleta pelo Acelerato; BusinessMap e Acelerato nunca misturados; mínimo de 20 itens; nenhum cálculo novo (T2.5); o ajuste em `server/tests/qa-f6-painel.test.ts` só inclui o id; teto de 150 linhas. Refaça ao menos uma mutação (tirar o id do mapa real deve reprovar um teste) e restaure com `git -C /home/rodrigoisensee/MetricasDSPD-052f checkout HEAD -- packages server/src`. Grave `docs/reviews/077-l7-sust-real.md` (novo) pela ferramenta Write, uma vez só (sem Edit depois), com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l7-sust-real`, `commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3`, veredito e bloco `## Achados` (até 300 caracteres por achado; sondas no formato `... · espera: ... · obtido: ...`); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/077-l7-sust-real` (`github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/077-l7-sust-real:docs/reviews/077-l7-sust-real.md` · espera: contém 'commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

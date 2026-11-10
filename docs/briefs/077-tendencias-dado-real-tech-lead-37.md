Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: review
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: review   Cobre: E2.2
Revisar-sha: e751242b53f2aaac546ec2cd016d126fe8ea726e

## Objetivo
Review do Lote 5 das tendências com dado real (K-211, pedido 077): `TENDENCIA_FLUXO` no mapa real, constante da virada do BusinessMap e, pela A14, `sem-dado-real` sem carga inicial. Ponta e751242b53f2aaac546ec2cd016d126fe8ea726e, entrega conferida, CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/077-l5-fluxo-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc e751242b53f2aaac546ec2cd016d126fe8ea726e` (6 arquivos).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: só "Lote 5"; `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho-revisao-tech-lead.md`: só A8, A9, A11, A12 e A14.

## Entregar
- "E2.2 (tech-lead): review por lote." (E2.2) Nesta delegação, só o review do Lote 5.
- (E2) (E2.2) Review do Lote 5 contra o desenho e a revisão: id no mapa real e ainda não simulável (A9); constante da virada com `afeta: ['TENDENCIA_FLUXO']` e data a corrigir no merge (A8; hoje 2026-11-09); teste de rota sem mock com `historicoDesde = 2026-07-01` e `dataReferencia = 2026-12-01` (A12); sem carga inicial → `sem-dado-real` sem cálculo novo (A14, T2.5); BusinessMap e Acelerato nunca misturados; mínimo de 20 itens respeitado; o ajuste em `server/tests/qa-f6-painel.test.ts` só inclui o id; teto de 150 linhas. Refaça ao menos uma mutação (tirar o guarda da A14 em `servico.ts` deve reprovar o teste de rota) e restaure com `git -C /home/rodrigoisensee/MetricasDSPD-052g checkout HEAD -- server/src`. Grave `docs/reviews/077-l5-fluxo-real.md` (novo) pela ferramenta Write, uma vez só (sem Edit depois), com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l5-fluxo-real`, `commit: e751242b53f2aaac546ec2cd016d126fe8ea726e`, veredito e bloco `## Achados` (até 300 caracteres por achado; sondas no formato `... · espera: ... · obtido: ...`); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` (`github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- forge-check: o do PATH aponta para a cópia do Windows, quebrada (DECISÃO TÉCNICA do Histórico de 2026-11-10 08:56); se precisar dele e falhar, relate, sem contornar.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; `docs/ux/080-revisao-leia-junto.md` (não rastreado, de outro pedido) fica como está.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/077-l5-fluxo-real:docs/reviews/077-l5-fluxo-real.md` · espera: contém 'commit: e751242b53f2aaac546ec2cd016d126fe8ea726e'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

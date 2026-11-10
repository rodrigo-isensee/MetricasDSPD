Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: review
Branch: feature/077-l8b-tela-contagem-parcial   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: review   Cobre: E2.2
Revisar-sha: aa137dd451a22454409ccd833ecd0d11925590a1

## Objetivo
Review do Lote 8b das tendências com dado real (K-211, pedido 077): a tela não mostra a contagem (concluídos e volume) do mês marcado com `contagemParcial` e o mostra como "histórico incompleto", pela decisão do dono P-077-5 = A. Ponta aa137dd451a22454409ccd833ecd0d11925590a1, entrega conferida. Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/077-l8b-tela-contagem-parcial` (nasce da ponta do 6b; o escopo é `origin/feature/077-l6b-tela-ressalva..aa137dd4`).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/feature/077-l6b-tela-ressalva aa137dd451a22454409ccd833ecd0d11925590a1` (3 arquivos: `web/src/features/operacional/resumo/modelo.ts`, `SerieMensal.tsx` e `componentes.test.tsx`).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: só "Lote 8" e "P-077-5 revista".

## Entregar
- "E2.2 (tech-lead): review por lote." (E2.2) Nesta delegação, só o review do 8b.
- (E2) (E2.2) Review do 8b: o número do mês marcado nunca aparece em gráfico, tabela nem `figcaption`; meses sem a marca e a série de SLA não mudam; nenhum cálculo na tela (T2.5) nem componente novo; testes provam o que dizem (refaça ao menos uma mutação: tirar a checagem de `contagemParcial` em `modelo.ts` deve reprovar um teste, e restaure com `git -C /home/rodrigoisensee/MetricasDSPD-052d checkout -- web/src`); teto de 150 linhas. Grave `docs/reviews/077-l8b-tela-contagem-parcial.md` (novo) pela ferramenta Write, com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l8b-tela-contagem-parcial`, `commit: aa137dd451a22454409ccd833ecd0d11925590a1`, veredito e bloco `## Achados` (até 300 caracteres por achado; sondas no formato `... · espera: ... · obtido: ...`); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/077-l8b-tela-contagem-parcial` (`github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- paralelo na mesma branch: parecer, lê a branch sem escrever nela (Z10)
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/077-l8b-tela-contagem-parcial:docs/reviews/077-l8b-tela-contagem-parcial.md` · espera: contém 'commit: aa137dd451a22454409ccd833ecd0d11925590a1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

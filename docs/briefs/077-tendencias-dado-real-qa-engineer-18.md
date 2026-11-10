Agente destino: forge:qa-engineer
Pedido: 077-tendencias-dado-real
Tipo: qa
Branch: feature/077-l7-sust-real   Base: develop   Base-sha: 8e2889ba6a9bf5cf60f9873a1d1e561da27105fc
Etapa: qa   Cobre: E2.3
Revisar-sha: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3

## Objetivo
QA do Lote 7 das tendências com dado real (K-211, pedido 077): `TENDENCIA_SUST` no mapa real e constante da virada do Acelerato. Ponta do código 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3 (entrega conferida; review aprovado em 20042cb6); a branch nasce da ponta do Lote 5, e o escopo é `origin/feature/077-l5-fluxo-real..9dc0c0ef`. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/077-l7-sust-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff origin/feature/077-l5-fluxo-real 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3` (5 arquivos).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/077-desenho.md`: só "Lote 7"; a ADR 0003 (orçamento de performance), só as linhas da A1 e da C3.

## Entregar
- "E2.3 (qa-engineer): QA por lote." (E2.3) Nesta delegação, só o QA do Lote 7.
- (E2) (E2.3) Conferir pelos testes e por mutação: prioridade com 19 apuráveis `insuficiente` (abaixo de 20 não publica) e com 20 ou mais publicada; nenhum ponto com janela incompleta pelo Acelerato (P-077-6 = (a)); BusinessMap sem efeito no resultado; marca da virada em `criterios`; nota da ressalva do S2 no resultado real. Vermelho antes do verde (com o código do lote revertido à mão, os testes novos reprovam; restaure com `git -C /home/rodrigoisensee/MetricasDSPD-052f checkout HEAD -- packages server/src`). Rode com no máximo 2 workers `server/tests/tendencia-sust-real-l7.test.ts`, `server/tests/qa-f6-painel.test.ts` e `packages/contratos/src/origem.test.ts`. Latência da rota da tendência da sustentação medida localmente contra a A1 e a C3 da ADR 0003, com o número e o método no parecer (`medido` ou `não medido` com o motivo). Grave `docs/qa/077-l7-sust-real.md` (novo) pela ferramenta Write, uma vez só (sem Edit depois), com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l7-sust-real`, `commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3`, veredito, contagem de bugs e bloco `## Achados` (até 300 caracteres por achado); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/077-l7-sust-real` (`github.com` em allowed_domains); sem PR.
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
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/077-l7-sust-real:docs/qa/077-l7-sust-real.md` · espera: contém 'commit: 9dc0c0ef1dae57e23aad6349a86c4351fc85fca3'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

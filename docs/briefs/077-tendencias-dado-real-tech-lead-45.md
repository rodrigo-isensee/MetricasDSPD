Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: merge
Branch: feature/077-l7-sust-real-b   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: pr   Cobre: E2.4

## Objetivo
PR do Lote 7 das tendências com dado real (tendência da sustentação, K-211, pedido 077) a partir da branch limpa `feature/077-l7-sust-real-b` (head 65dcb677; código em 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed conferido; review e QA aprovados nesse head; `forge-check pr` aprovado). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- Os pareceres `077-l7-sust-real-b.md` de review e de QA da branch, na worktree.

## Entregar
- "E2.4 (tech-lead): PR por lote, depois do QA." (E2.4) Nesta delegação, só o Lote 7: abrir o PR da `feature/077-l7-sust-real-b` para a develop (corpo pelo modelo do projeto, `Cartão: K-211`, dizendo que substitui a `feature/077-l7-sust-real`, sem PR) e esperar a CI verde. Não mesclar: o merge fica com o dono (decisão do dono de 2026-11-07 21:57, um por vez, com update-branch se ficar BEHIND); relate o número do PR e o estado da CI. Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até e96111b3af39d71d503ae474c5b277cbe26a59291bdae143f65697ce5d4d3708 (15 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto em docs/analises/077-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): revisão do desenho docs/analises/077-desenho.md (lotes, contrato, testes, teto, ordem), parecer curto em docs/analises/077-desenho-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.0 (ux-designer): especificação curta da janela incompleta (P-077-1) e da ressalva do S2 na tendência de SLA (P-077-2), com acessibilidade e critérios de aceite, em docs/ux/077-tendencias.md, sem commit." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido
- "Mudar o cálculo de O3, O4, S2 e S3" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/077-l7-sust-real-b --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

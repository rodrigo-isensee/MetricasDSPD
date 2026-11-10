Agente destino: forge:qa-engineer
Pedido: 077-tendencias-dado-real
Tipo: qa
Branch: feature/077-l7-sust-real-b   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: qa   Cobre: E2.3
Revisar-sha: 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed

## Objetivo
QA do Lote 7 refeito em branch limpa (tendência da sustentação com dado real, K-211, pedido 077; DECISÕES TÉCNICAS de 2026-11-10 13:19 e 13:44): um commit só, 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed, sobre a develop 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2, entrega conferida, com o mesmo código da `feature/077-l7-sust-real`. Classe N: review e QA no mesmo head. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/077-l7-sust-real-b`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h show --stat 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed`.

## Entregar
- "E2.3 (qa-engineer): QA por lote." (E2.3) Nesta delegação, só o QA do Lote 7 na branch limpa.
- (E2) (E2.3) Rodar com no máximo 2 workers `server/tests/tendencia-sust-real-l7.test.ts`, `packages/contratos/src/origem.test.ts`, `server/tests/qa-f6-painel.test.ts` e os testes de `packages/metricas` que cobrem `VERSOES_DA_BIBLIOTECA`, na ponta da branch; conferir que a marca da virada da tendência da sustentação sai com a data da constante do Lote 7 em `criterios.ts` e uma mutação (tirar o id do mapa real) que os testes pegam. Sem base real. Grave `docs/qa/077-l7-sust-real-b.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 077-tendencias-dado-real`, `branch: feature/077-l7-sust-real-b`, `commit: 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed`, veredito, contagem de bugs e `## Achados`; commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho), depois do commit do review do tech-lead na mesma worktree (se ainda não estiver na branch, espere por chamadas curtas de `git log`); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/077-l7-sust-real-b` (`github.com` em allowed_domains); sem PR. Grave só na worktree.
- arquivos: docs/qa/077-l7-sust-real-b.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até e96111b3af39d71d503ae474c5b277cbe26a59291bdae143f65697ce5d4d3708 (15 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
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
- "Mudar o cálculo de O3, O4, S2 e S3" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/feature/077-l7-sust-real-b:docs/qa/077-l7-sust-real-b.md` · espera: contém 'commit: 42bf48aaf5535918e1e8f3f3af2d15c39f9528ed'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

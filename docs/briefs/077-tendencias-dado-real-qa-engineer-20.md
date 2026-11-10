Agente destino: forge:qa-engineer
Pedido: 077-tendencias-dado-real
Tipo: qa
Branch: feature/077-l7-sust-real   Base: develop   Base-sha: 7a44f9417b6be3cb0d87767ea3c19c2c8c7083c2
Etapa: qa   Cobre: E2.3
Revisar-sha: d0b7818a94086c77ef365c1fdd5c1d35147e9b26

## Objetivo
QA incremental do Lote 7 das tendências com dado real (tendência da sustentação, K-211, pedido 077) depois da preparação para o PR: develop 7a44f941 trazida no merge d0b7818a94086c77ef365c1fdd5c1d35147e9b26; review incremental aprovado sobre esse head (parecer 6a7ab1e4). O parecer de QA anterior do Lote 7 ficou desatualizado. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/077-l7-sust-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f show d0b7818a94086c77ef365c1fdd5c1d35147e9b26` e o seu parecer na branch (`docs/qa/077-l7-sust-real.md` (novo), na worktree).

## Entregar
- "E2.3 (qa-engineer): QA por lote." (E2.3) Nesta delegação, só o QA incremental do Lote 7.
- (E2) (E2.3) Rodar com no máximo 2 workers `server/tests/tendencia-sust-real-l7.test.ts`, `packages/contratos/src/origem.test.ts`, `server/tests/qa-f6-painel.test.ts` e os testes de `packages/metricas` que cobrem `VERSOES_DA_BIBLIOTECA`, na ponta da branch, e conferir que as marcas das viradas do BusinessMap e do Acelerato saem com a data 2026-11-10 no resultado. Regrave `docs/qa/077-l7-sust-real.md` inteiro pela ferramenta Write, uma vez só, com `commit: d0b7818a94086c77ef365c1fdd5c1d35147e9b26`, veredito, contagem de bugs e `## Achados` (os que seguem valendo continuam); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/077-l7-sust-real` (`github.com` em allowed_domains); sem PR.
- (E1) Nada a entregar aqui: não nesta delegação.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/077-l7-sust-real:docs/qa/077-l7-sust-real.md` · espera: contém 'commit: d0b7818a94086c77ef365c1fdd5c1d35147e9b26'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

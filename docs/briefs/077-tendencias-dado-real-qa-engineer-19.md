Agente destino: forge:qa-engineer
Pedido: 077-tendencias-dado-real
Tipo: qa
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: qa   Cobre: E2.3
Revisar-sha: e980596ee86020638853237ccb3eff63e4892b77

## Objetivo
QA incremental do Lote 5 das tendências com dado real (K-211, pedido 077) depois da preparação para o PR: develop trazida (6172e7a1) e data da constante da virada do BusinessMap corrigida para 2026-11-10 (e980596ee86020638853237ccb3eff63e4892b77); review incremental aprovado em e5f4d35c. O parecer de QA anterior (sobre e751242b) ficou desatualizado. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/077-l5-fluxo-real`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g show e980596ee86020638853237ccb3eff63e4892b77` e o seu parecer na branch (`docs/qa/077-l5-fluxo-real.md` (novo), na worktree).

## Entregar
- "E2.3 (qa-engineer): QA por lote." (E2.3) Nesta delegação, só o QA incremental do Lote 5.
- (E2) (E2.3) Rodar com no máximo 2 workers `server/tests/tendencia-fluxo-real-l5.test.ts`, `server/tests/qa-f6-painel.test.ts` e os testes de `packages/metricas` que cobrem `VERSOES_DA_BIBLIOTECA`, na ponta da branch, e conferir que a marca da virada sai com a data 2026-11-10 no resultado. Regrave `docs/qa/077-l5-fluxo-real.md` inteiro pela ferramenta Write, uma vez só, com `commit: e980596ee86020638853237ccb3eff63e4892b77`, veredito, contagem de bugs e `## Achados` (os que seguem valendo continuam); commit só do parecer com `Cartão: K-211` (mensagem por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/077-l5-fluxo-real` (`github.com` em allowed_domains); sem PR.
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
- "Mudar o cálculo de O3, O4, S2 e S3" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/077-l5-fluxo-real:docs/qa/077-l5-fluxo-real.md` · espera: contém 'commit: e980596ee86020638853237ccb3eff63e4892b77'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

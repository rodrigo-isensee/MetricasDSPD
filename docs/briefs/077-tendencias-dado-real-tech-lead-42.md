Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: merge
Branch: feature/077-l5-fluxo-real   Base: develop   Base-sha: 76be45ee28e633cdc949b74ba4c57a9dd6bde2ce
Etapa: pr   Cobre: E2.4

## Objetivo
PR do Lote 5 das tendências com dado real (K-211, pedido 077) para a develop: `TENDENCIA_FLUXO` no mapa real, constante da virada do BusinessMap em 2026-11-10 e `sem-dado-real` sem carga inicial (A14), já com a develop (o 8b entrou pelo PR 278), com review e QA aprovados e conferidos (head 7f4d08f5); o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/077-l5-fluxo-real`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/077-tendencias-dado-real.md`, só as linhas do `## Histórico` do Lote 5 de 2026-11-10.

## Entregar
- "E2.4 (tech-lead): PR por lote, depois do QA." (E2.4) Nesta delegação, só o Lote 5.
- (E2) (E2.4) `forge-check pr 077-tendencias-dado-real --ref origin/feature/077-l5-fluxo-real --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado; abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/077-l5-fluxo-real --title "feat(metricas): tendência do fluxo com dado real do BusinessMap (077, lote 5)" --body-file <arquivo gravado por Write no scratchpad>` (corpo: o lote, a marca da virada em 2026-11-10 e o que fazer se o merge cair em outro dia (A8), os pareceres de review e QA e os achados recomendados, inclusive a latência a frio do QA); se o hook recusar só por prazo de decisão, repita até duas vezes e, persistindo, relate a mensagem literal; esperar todos os checks verdes por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez; não mesclar. `api.github.com` e `github.com` em allowed_domains. Sem `--admin` nem `--force`.
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
- "E2.3 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E2.5 (react-frontend): parte de tela do lote L3 (ressalva e janela incompleta), pela especificação." · etapa de outra delegação; continua no pedido
- "E2.6 (ux-designer): revisão de interface do lote L3." · etapa de outra delegação; continua no pedido
- "E2.7 (devops-engineer): diagnóstico do pre-push preso no eslint . dentro do sandbox (só leitura, sem commit), para destravar os pushes da E2.4." · etapa de outra delegação; continua no pedido
- "Mudar o cálculo de O3, O4, S2 e S3" · fora do escopo do pedido; nada nesta delegação

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/077-l5-fluxo-real --state open --json number --jq length` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

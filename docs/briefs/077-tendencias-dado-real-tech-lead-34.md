Agente destino: forge:tech-lead
Pedido: 077-tendencias-dado-real
Tipo: merge
Branch: feature/077-l6b-tela-ressalva   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: pr   Cobre: E2.4

## Objetivo
PR do Lote 6b das tendências com dado real (K-211, pedido 077) para a develop: tela da ressalva do S2 na tendência de SLA, já com a develop 528ae770 e com review e QA incrementais aprovados e conferidos (head 00c033de76bc49dded3721062209dba8cac8cada); o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/077-l6b-tela-ressalva`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/077-tendencias-dado-real.md`, só as linhas do `## Histórico` do review e do QA do 6b (inclusive os incrementais de 2026-11-10).

- Saída do `forge-check pr 077-tendencias-dado-real --ref origin/feature/077-l6b-tela-ressalva --base origin/develop`, rodada pelo Jarvis às 09:11 de 2026-11-10: "pr: veredito: aprovado · "077-tendencias-dado-real" · exigidos review, qa · head 00c033d · base origin/develop".

## Entregar
- "E2.4 (tech-lead): PR por lote, depois do QA." (E2.4) Nesta delegação, só o Lote 6b.
- (E2) (E2.4) `forge-check pr 077-tendencias-dado-real --ref origin/feature/077-l6b-tela-ressalva --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado no head 00c033de (o `forge-check` do PATH está quebrado: se ele falhar, use a saída que o Jarvis rodou, colada em Ler); abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/077-l6b-tela-ressalva --title "feat(web): ressalva do S2 na tendência de SLA (077, lote 6b)" --body-file <arquivo gravado por Write no scratchpad>` (corpo: o lote, os pareceres de review, QA e interface e o A1 recomendado); esperar todos os checks verdes por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez (recusado: relate a mensagem literal); não mesclar.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 077-tendencias-dado-real até eb87204102afbb5c5d965f9a825dd1371c5ce9ab6a7e3ac1ff1888d6d4740cd7 (14 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/077-tendencias-dado-real.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0019
- ADR 0019 (citada no pedido): cálculo das tendências pela biblioteca; nada muda nesta etapa.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify`, `--force` nem `--admin`. Caminhos e números literais, sem `$VAR`; `github.com` e `api.github.com` em allowed_domains.
- NÃO tocar: arquivos do repositório (sem commit nesta etapa), outras worktrees, a `develop`, a `homolog` e a `main`.

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

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/077-l6b-tela-ressalva --state open --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-9b   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.6

## Objetivo
Review do lote 9b dos bloqueios reais (K-204): branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em e4eaa56c90f8424d86e7e37151e7ae27745375c2 (o contrato perde a nota `bloqueio-sem-dado-real`; aceite de contrato incompatível gravado, fotografado e removido no mesmo lote), QA aprovado em 8c3d905c, base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff f4c122f15c05fbf5fea86797c9c348656d11ab36 e4eaa56c90f8424d86e7e37151e7ae27745375c2`.
- `/home/rodrigoisensee/MetricasDSPD-056/docs/qa/075-l9b-contrato.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b" e a classificação de contrato (TL-A2).

## Entregar
- "E1.6 (tech-lead): review por lote." (E1.6) Nesta delegação, o review do lote 9b.
- (E1) (E1.6) Review: aderência ao lote 9b do plano; a classificação de contrato e o aceite pela `politica-de-mudanca.md` (incompatível, aceite de uso único, sem `/api/v2`, porque a web já não consome a nota desde o 9a); `VERSAO_CRITERIO_BLOQUEIO_SEM_DADO_REAL` mantida (T2.6); o nulo do O1 continua nulo; o achado 1 da revisão de UX do 9a (ramo "sem dado real" do O1) segue até o nulo sair do contrato, com o motivo; o A1 do QA. Rodar os testes tocados com no máximo 2 workers (R-TETO). Parecer `docs/reviews/075-l9b-contrato.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9b`, `commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2` e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/075-l9b-contrato.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até c166a8738a8bd344c2b9d3c3d78fffc1ddf47073e303a80503f9145ee45b4171 (21 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9b:docs/reviews/075-l9b-contrato.md` · espera: contém 'branch: feature/075-9b'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: merge
Branch: feature/075-l4c-colunas-grant   Base: develop   Base-sha: 3514e1c14309a371121538ff3bf1805ceb914d26
Etapa: pr   Cobre: E1.9

## Objetivo
PR do lote 4c do pedido 075 (K-204) para a develop: colunas e GRANT fechados por teste, já com a develop, com review e QA incrementais aprovados e conferidos em 2026-11-09 (review às 09:39, QA às 09:52; head 9c9819b3c66a3ae5002f1c5a809cfd6e7b2ea23b) e o parecer de segurança do lote de 2026-11-07 (d165049a); o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/075-l4c-colunas-grant`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/075-bloqueios-reais.md`, só as linhas do `## Histórico` do review e do QA incrementais do 4c (2026-11-09).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, só o lote 4c.
- (E1) (E1.9) `forge-check pr 075-bloqueios-reais --ref origin/feature/075-l4c-colunas-grant --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado no head 9c9819b3; abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/075-l4c-colunas-grant --title "feat(075): lote 4c, colunas e GRANT fechados por teste" --body-file <arquivo gravado por Write no scratchpad>` (corpo: o lote, os pareceres de review, segurança e QA e os achados recomendados); esperar todos os checks verdes por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez (recusado: relate a mensagem literal); não mesclar. Cada comando sozinho na chamada, caminhos e números literais (sem `$VAR`), `api.github.com` e `github.com` em `allowed_domains`. Sem `--admin` nem `--force`; não apagar branch nem worktree.
- (E4) Nada a entregar aqui: não nesta delegação.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-1): a via A: o bloqueio vem da comparação entre coletas do que já chega ao stg_card (is_blocked, block_reason_id, current_block_time), sem dado novo da fonte; perde bloqueio curto e o passado anterior à primeira coleta.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-2): início e fim do bloqueio = instante da coleta que viu a mudança.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-3): motivo sem mapa para os 7 do briefing aparece como "não classificado" na tela (o mapa dos motivos fica para quando as pessoas o definirem). DECISÃO DO DONO: "A" (P-075-3b): trocar de motivo sem desbloquear é o mesmo bloqueio.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-4): o fornecedor do bloqueio é o do card no início do bloqueio.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-5): card arquivado, descartado ou entregue ainda bloqueado: o bloqueio fecha nesse instante.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-6): O5 e a série do O1 voltam já com o histórico parcial, marcados nos gráficos (T2.6), respeitando o mínimo de 20 itens.
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-7): a coleta do BusinessMap passa a ter agenda diária (depois da VM).
- - 2026-11-06 11:11: DECISÃO DO DONO: "A" (P-075-8): O19, T10 e T12 entram no mapa real neste pedido.
- - 2026-11-06 11:28: DECISÃO DO DONO (literal "faca as recomendacoes", resposta às P-075-9 a P-075-12): as quatro recomendações do Jarvis.
- - 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-9, pela recomendação): fim antes do início observado vira fim = início (duração 0; o bloqueio conta).
- - 2026-11-06 11:28: DECISÃO DO DONO: "A" (P-075-10, pela recomendação): com troca de motivo no mesmo bloqueio, vale o motivo do início.
- - 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-11, pela recomendação): o T10 espera o campo fornecedor no mapa de campos (WS1); o lote 7 sai deste pedido.
- - 2026-11-06 11:28: DECISÃO DO DONO: "B" (P-075-12, pela recomendação): o T12 espera a WS1 preencher a área solicitante; o lote 8 sai deste pedido. ESCOPO- (dono): o T10 e o T12 da E4 (P-075-8) ficam para depois da WS1; o O19 continua.
- - 2026-11-06 15:08: DECISÃO DO DONO (pelo assistente do app): até 5 agentes simultâneos nos itens independentes, no máximo 2 pushes ao mesmo tempo, push com mais de 15 min é preso, matar push e eslint órfãos, nada novo com load acima de 8 (gravada no topo do KANBAN.md). O 076 já estava concluído às 13:26 (a mensagem repete a de reinício); nada a retomar nele.
- - 2026-11-06 23:54: DECISÃO DO DONO (literal "voce pode fazer todos os merges ate o da main hj a noite"): o time mescla hoje à noite o que estiver pronto, até a release. Nota do Jarvis: os merges na develop e na homolog são do tech-lead e seguem; o merge na main é do dono por regra inviolável (CLAUDE.md, "A main é do usuário"; R-MAIN), que a autorização não muda: o time prepara o PR de release homolog para main e o dono o mescla. O merge do PR 248 segue barrado pelo hook R-REVIEW (tempo), não por permissão.
- - 2026-11-07 12:56: DECISÃO DO DONO (literal): "Isso a 1" (merge agrupado, leitura 1): cada lote segue com review, QA e conferência próprios e entra numa branch de integração; só ela vira um PR único para a develop. DECISÃO TÉCNICA (Jarvis): branch `integracao/2026-11-07` criada pelo tech-lead a partir da develop atual; cada lote, depois do QA conferido, entra nela por merge (--no-ff) feito pelo tech-lead, com o forge-check pr do lote limpo; no fim, um PR único integracao/2026-11-07 → develop (merge commit), com a lista de lotes e pareceres; os PRs 256 e 266 ficam abertos até lá e fecham com o PR único. O dono faz um update-branch e um merge só.
- - 2026-11-07 19:13: DECISÃO DO DONO (literal): "A" (pushes presos): o dono roda no terminal os três pushes (075 4c QA e720eeed na 052f, 077 6b review b9291559 na 056d, 075 6a 0fa4d217 na 052g). O Jarvis confere o remoto e segue com as conferências.
- - 2026-11-07 21:57: DECISÃO DO DONO (literal): "A" (como fechar o merge agrupado: voltar a um PR por lote para a develop; a branch integracao/2026-11-07 é descartada). Revoga, para o que falta, a leitura 1 de 12:56. DECISÃO TÉCNICA (Jarvis): o tech-lead atualiza cada branch com a develop, abre os PRs do 4c e do 6a (075) e do 4b e do 6b (077, com os pareceres de interface commitados antes) e deixa cada um pronto pelo forge-fechar; o dono mescla, um por vez, com update-branch quando ficarem BEHIND. MELHORIA (cartão Forge): forge-check pr reconhecer os pareceres dos lotes mesclados numa branch de integração.
- - 2026-11-07 22:46: DECISÃO DO DONO (literal): "A" (o dono pausa o guarda de lint enquanto o time envia). Delegados os PRs do 4c e do 6a (tech-lead-35).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: código, testes, os pareceres, as ADRs, o `CLAUDE.md`, os arquivos `.env*`, a branch integracao/2026-11-07 (descartada pela decisão, sem apagar), a branch docs/retros-2026-11-07, worktrees além da 052f e da 052g, a `homolog` e a `main`.
- ADR 0020 (citada no pedido; leia na develop): a revisão 5 dela é a condição da via B, que o dono não escolheu; nada nesta entrega.
- ADR 0022 (citada no pedido; leia na develop): o item 3 nega o stg_bloqueio por padrão; a via A não o usa; nada nesta entrega.
- ADR 0004 (citada no pedido; leia na develop): formato dos pareceres e aceite do dono a bug médio ou baixo aberto; não muda este lote.
- ADR 0029 (citada no pedido; em proposta, na develop pelo PR 248): derivação de bloqueio por comparação de versões; este lote completa a derivação com os marcos.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/075-l4c-colunas-grant --state open --json number --jq length` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

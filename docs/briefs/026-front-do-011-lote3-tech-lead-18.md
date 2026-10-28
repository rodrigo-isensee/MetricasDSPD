Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-textos-lote3   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: merge-integracao

## Objetivo
Etapa E1.9 do pedido 026 (cartão K-154), PR para a develop: o review (a4c04f700a446b14e1659c12ca2fa54da2f5b603) e o QA (c92ece5db1b5fb996ba1ed07c4650804637a802f) aprovaram a especificação do lote 3 (commit final 081d2f1f7850959f993e814d67491cf8ec9f87c0). Registre a autoria do seu parecer de review, abra o PR da `docs/026-textos-lote3` para a `develop` e faça o merge com os checks verdes. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-026d`.

## Ler
- `docs/reviews/026-textos-lote3.md` da worktree, inteiro (é o seu parecer).
- `docs/engineering/praticas.md` da worktree, só a seção de pull request.

## Entregar
- (E1.9) Regrave o parecer `docs/reviews/026-textos-lote3.md` com a ferramenta Write, com o conteúdo idêntico ao atual, byte a byte: a gravação cria o registro de autoria do papel `tech-lead` que o `forge-check pr` exige (R-REVIEW). Sem diff, não há commit.
- (E1.9, E1) PR da `docs/026-textos-lote3` para a `develop` (squash), com o título no padrão do projeto, o resumo dos textos e o link dos pareceres de review e de QA no corpo. Merge depois de todos os checks exigidos pela proteção da develop ficarem verdes; sem `--admin`. Se um check falhar, não re-execute: pare e relate o check e o motivo.
- (E2, E3) Nada a entregar aqui: não nesta delegação (E2 já entregue no PR #152; E3 no E3.1).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (PR #152)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue (worktree limpa em d7c74b46203994362147a3fd3d78ec2db9fc0576)
- "E1.6 (forge:ux-designer): textos da especificação do lote 3 (K-154): mínimo de 20 do O26 sobre as entregas do tipo (A12 do review = A7 do QA), tabela de decisões da §11 (A13), regra do vazio: "Nenhum item encontrado" aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA, que achou os dois juntos em mock=vazio)." · etapa de outra delegação; já entregue (081d2f1f7850959f993e814d67491cf8ec9f87c0)
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; já entregue (081d2f1f7850959f993e814d67491cf8ec9f87c0)
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; já entregue (c92ece5db1b5fb996ba1ed07c4650804637a802f, aprovado)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido (espera decisão do dono, K-162)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Mudar o conteúdo ou o veredito do parecer de review; editar a especificação, os contratos ou o código (os achados recomendados do QA, A1 a A3, vão para o backlog); o `pronto` ou outra suíte (o `pronto` já rodou no 081d2f1); apagar a branch ou a worktree depois do merge (delegação própria); o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- ADR 0003 (citada no pedido): orçamento de performance; nada a decidir nesta etapa.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`. O commit final é o da última volta da especificação. O `pronto` completo roda nele, que é o commit que o QA (E1.8) valida, antes do PR para a develop.
- A `main` é do usuário: o PR é só para a `develop`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026d status --porcelain` · espera: linhas=0
- PQ-2 (pr): `gh pr view docs/026-textos-lote3 --json number,baseRefName,state` com `baseRefName` igual a `develop`
- PQ-3 (merge): `gh pr view docs/026-textos-lote3 --json state,mergeCommit` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: merge-integracao
Branch: docs/026-claude-md-enviada   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: merge-integracao

## Objetivo
Etapa E3.4 do pedido 026 (cartão K-162): a branch `docs/026-claude-md-enviada` tem review (fafefe9fb239e13b0198173498d82e9fc60a75e7, revalidado) e QA (c9f71f7e8deff2364b20fb89452b93c31c3463b2 e d4ba797fe9101a3af5f947e34047fc9e666d5a0c) aprovados e o `forge-check pr` limpo; abrir o PR para a develop e mesclar com os checks verdes. Worktree `/home/rodrigoisensee/MetricasDSPD-026c`, head fafefe9fb239e13b0198173498d82e9fc60a75e7, já no origin.

## Ler
- A saída de `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check pr 026-front-do-011-lote3 --ref docs/026-claude-md-enviada --base origin/develop`, rodado na worktree.
- `docs/engineering/praticas.md`, só a seção de PR e merge.

## Entregar
- (E3.4, E3) PR da `docs/026-claude-md-enviada` para a `develop` (squash), com o título citando K-162 e o corpo com o que muda no `CLAUDE.md`, os pareceres de review e QA e o resultado do `forge-check pr`. Se a develop tiver andado, traga-a para a branch por merge, sem `--force`.
- (E3.4) Merge squash só com todos os checks verdes, sem `--admin`; check vermelho: não re-execute, pare e relate o motivo. Depois do merge, apague a branch remota, a local e a worktree `/home/rodrigoisensee/MetricasDSPD-026c` (R-FLUXO, "Depois do merge").
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:ux-designer): textos da especificação do lote 3 (K-154): mínimo de 20 do O26 sobre as entregas do tipo (A12 do review = A7 do QA), tabela de decisões da §11 (A13), regra do vazio: "Nenhum item encontrado" aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA, que achou os dois juntos em mock=vazio)." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; continua no pedido
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; já entregue (c92ece5db1b5fb996ba1ed07c4650804637a802f, aprovado)
- "E1.9 (forge:tech-lead): code review do E1.6, depois do push do E1.7; o PR para a develop depois do parecer do QA." · etapa de outra delegação; já entregue (PR #155, 4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; continua no pedido
- "E3.1 (jarvis): registrar no CLAUDE.md a leitura da decisão de 2026-10-27 sobre push antes do QA (decisão do dono de 2026-10-28, K-162 opção A)." · etapa de outra delegação; já entregue
- "E3.2 (forge:tech-lead): trazer a branch docs/026-claude-md-enviada para a develop atual, code review do E3.1, commit da edição e do parecer de review, push sem PR." · etapa de outra delegação; já entregue (4c416829902e647ca959e607596f134ae300bbb9)
- "E3.3 (forge:qa-engineer): parecer de QA do E3.1 (texto do CLAUDE.md coerente com a decisão do dono de 2026-10-27 e com o resto do arquivo)." · etapa de outra delegação; já entregue (c9f71f7e8deff2364b20fb89452b93c31c3463b2)
- "E3.5 (forge:qa-engineer): revalidar o parecer de QA do E1.6 (docs/qa/026-textos-lote3.md) sobre o head da docs/026-claude-md-enviada, que mudou o CLAUDE.md, e encurtar o achado A1 para até 300 caracteres (forge-check pr)." · etapa de outra delegação; já entregue (d4ba797fe9101a3af5f947e34047fc9e666d5a0c)
- "E3.6 (forge:tech-lead): revalidar os pareceres de review do E1.6 e do E3.1 (docs/reviews/026-textos-lote3.md e docs/reviews/026-claude-md-enviada.md, este com o commit da base) sobre o head da branch, antes do E3.4." · etapa de outra delegação; já entregue (fafefe9fb239e13b0198173498d82e9fc60a75e7)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Alterar o `CLAUDE.md` ou os pareceres; o `pronto` ou outra suíte local; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- NÃO tocar: o `CLAUDE.md`, os pareceres e o código; a `main`; as outras worktrees; o `.env`.
- Outro tech-lead pode mesclar outro PR na develop ao mesmo tempo: se a develop andar, atualize a branch por merge e espere os checks de novo.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. A `main` é do usuário.

## Pronto quando
- PQ-1 (pr): `gh pr list --head docs/026-claude-md-enviada --state merged --json number` · espera: um PR mesclado, com o número no relatório
- PQ-2 (merge): o sha do merge do PR é ancestral de `origin/develop` (`git merge-base --is-ancestor <sha> origin/develop`, rc=0)
- PQ-3 (cmd): `git ls-remote origin refs/heads/docs/026-claude-md-enviada` · espera: linhas=0
- PQ-4 (cmd): `git worktree list` · espera: rc=0 e não contém 'MetricasDSPD-026c'

## Relatório
Até 8 linhas, resultado real: número do PR, checks e sha do merge; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

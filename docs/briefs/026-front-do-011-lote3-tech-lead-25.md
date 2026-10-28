Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: merge-integracao
Branch: docs/026-claude-md-enviada   Base: develop   Base-sha: 4137981e5333bee5b69f3c515b26c64d3a0b71c0
Etapa: merge-integracao

## Objetivo
Etapa E3.4 do pedido 026 (cartão K-162): mesclar na develop o PR #157 da `docs/026-claude-md-enviada` (head 14e01fc73ab78e151b3249f29d609bab91d9f3f9, review revalidado em `docs/reviews/026-textos-lote3.md` e `docs/reviews/026-claude-md-enviada.md`, QA em `docs/qa/026-textos-lote3.md` e `docs/qa/026-claude-md-enviada.md`) com os checks verdes. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-026c`.

## Ler
- `docs/engineering/praticas.md` da worktree, só a seção de pull request.
- `gh pr checks 157` e `gh pr view 157 --json headRefOid,mergeStateStatus`.

## Entregar
- (E3.4, E3) Merge por squash do PR #157 com `gh pr merge 157 --squash`, só com todos os checks obrigatórios verdes e o head igual a 14e01fc73ab78e151b3249f29d609bab91d9f3f9. Este brief só é delegado depois que os checks do head terminaram; se ainda houver check pendente ao começar, espere com `gh pr checks 157 --watch`, sem re-executar nada. Check vermelho: pare, não re-execute e relate. Se o GitHub recusar por branch desatualizada ou o hook `parecer` barrar: pare e relate a mensagem literal, sem trazer a develop, sem `--admin` e sem nova revalidação.
- (E1, E2) Nada a entregar aqui: não nesta delegação (já entregues nos PRs #152 e #155).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (PR #152)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue
- "E1.6 (forge:ux-designer): textos da especificação do lote 3 (K-154): mínimo de 20 do O26 sobre as entregas do tipo (A12 do review = A7 do QA), tabela de decisões da §11 (A13), regra do vazio: "Nenhum item encontrado" aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA, que achou os dois juntos em mock=vazio)." · etapa de outra delegação; já entregue (081d2f1f7850959f993e814d67491cf8ec9f87c0)
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; já entregue
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; já entregue (c92ece5db1b5fb996ba1ed07c4650804637a802f, aprovado)
- "E1.9 (forge:tech-lead): code review do E1.6, depois do push do E1.7; o PR para a develop depois do parecer do QA." · etapa de outra delegação; já entregue (PR #155, 4137981e5333bee5b69f3c515b26c64d3a0b71c0)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue
- "E3.1 (jarvis): registrar no CLAUDE.md a leitura da decisão de 2026-10-27 sobre push antes do QA (decisão do dono de 2026-10-28, K-162 opção A)." · etapa de outra delegação; já entregue (4c416829902e647ca959e607596f134ae300bbb9)
- "E3.2 (forge:tech-lead): trazer a branch docs/026-claude-md-enviada para a develop atual, code review do E3.1, commit da edição e do parecer de review, push sem PR." · etapa de outra delegação; já entregue (4c416829902e647ca959e607596f134ae300bbb9, review aprovado)
- "E3.3 (forge:qa-engineer): parecer de QA do E3.1 (texto do CLAUDE.md coerente com a decisão do dono de 2026-10-27 e com o resto do arquivo)." · etapa de outra delegação; já entregue (c9f71f7e8deff2364b20fb89452b93c31c3463b2, aprovado)
- "E3.5 (forge:qa-engineer): revalidar o parecer de QA do E1.6 (docs/qa/026-textos-lote3.md) sobre o head da docs/026-claude-md-enviada, que mudou o CLAUDE.md, e encurtar o achado A1 para até 300 caracteres (forge-check pr)." · etapa de outra delegação; já entregue (d4ba797fe9101a3af5f947e34047fc9e666d5a0c)
- "E3.6 (forge:tech-lead): revalidar os pareceres de review do E1.6 e do E3.1 (docs/reviews/026-textos-lote3.md e docs/reviews/026-claude-md-enviada.md, este com o commit da base) sobre o head da branch, antes do E3.4." · etapa de outra delegação; já entregue (fafefe9fb239e13b0198173498d82e9fc60a75e7)
- "E3.7 (forge:qa-engineer): revalidar o parecer de QA do E1.6 (docs/qa/026-textos-lote3.md) sobre o head 2a4191a da docs/026-claude-md-enviada: o hook `parecer` (sem `--base`) o acusa desatualizado porque o server/tests/plataforma2.test.ts entrou pela develop (merge 2a4191a); antes do E3.8." · etapa de outra delegação; já entregue (f61fae8788867b26f12844d3d0c22eaec379be07)
- "E3.8 (forge:tech-lead): revalidar o review do E1.6 (docs/reviews/026-textos-lote3.md) do mesmo jeito, depois do E3.7 e antes do E3.4." · etapa de outra delegação; já entregue (14e01fc73ab78e151b3249f29d609bab91d9f3f9)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Apagar a branch remota, a branch local ou a worktree (o apagar remoto foi negado antes nesta sessão e fica como ação do dono); editar arquivo; trazer a develop; a promoção develop → homolog; o quadro e o arquivo do pedido; as outras worktrees e outros PRs; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-28): K-162, opção A ("A"): o Jarvis edita o CLAUDE.md na branch docs/026-claude-md-enviada (worktree MetricasDSPD-026c); o tech-lead traz a branch para a develop atual, revisa, commita, abre o PR para a develop e faz o merge.
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- ADR 0003 (citada no pedido): orçamento de performance; nada a decidir nesta etapa.
- NÃO tocar: arquivos da branch; a `main`; as outras worktrees; o `.env`. Sem `--admin`; check vermelho não se re-executa.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. `gh pr merge` com o número do PR literal.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (merge): `gh pr view 157 --json state` · espera: contém 'MERGED'
- PQ-2 (cmd): `gh pr view 157 --json headRefOid --jq .headRefOid` · espera: igual '14e01fc73ab78e151b3249f29d609bab91d9f3f9'

## Relatório
Até 8 linhas, resultado real: estado dos checks e sha do merge, ou a mensagem literal da recusa; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-textos-lote3   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: review

## Objetivo
Etapa E1.9 do pedido 026 (cartão K-154): code review do E1.6, os textos da especificação do lote 3 (commit bbbef76f0c84f8f68755c08a69da27c598616291, já no remoto), antes do QA (R-REVIEW). Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-026d`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026d diff d7c74b46203994362147a3fd3d78ec2db9fc0576 bbbef76f0c84f8f68755c08a69da27c598616291` (só a especificação, +8 -3).
- `docs/pedidos/026-front-do-011-lote3.md`, seção Etapas (o texto do E1.6).
- `docs/engineering/praticas.md` da worktree, só a seção de commits.

## Entregar
- (E1.9, E1) Code review: os três textos pedidos no E1.6 estão na especificação e batem com as decisões abaixo (mínimo de 20 do O26 sobre as entregas do tipo; tabela de decisões da §11; "Nenhum item encontrado" sozinho, sem "Amostra insuficiente: 0 de 20"), sem contradizer o resto da especificação. Grave o parecer em `docs/reviews/026-textos-lote3.md`, com veredito e seção `## Achados` (bloqueante ou recomendado, `arquivo:linha` e destino).
- (E1.9) Commit só do parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-154` e `git add` explícito por caminho; push sem `--force`.
- (E2, E3) Nada a entregar aqui: não nesta delegação (E2 já entregue no PR #152; E3 no E3.1).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (PR #152)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue (worktree limpa em d7c74b46203994362147a3fd3d78ec2db9fc0576)
- "E1.6 (forge:ux-designer): textos da especificação do lote 3 (K-154): mínimo de 20 do O26 sobre as entregas do tipo (A12 do review = A7 do QA), tabela de decisões da §11 (A13), regra do vazio: "Nenhum item encontrado" aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA, que achou os dois juntos em mock=vazio)." · etapa de outra delegação; já entregue (bbbef76f0c84f8f68755c08a69da27c598616291)
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; já entregue (bbbef76f0c84f8f68755c08a69da27c598616291)
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido (espera decisão do dono, K-162)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Editar a especificação (ajuste volta ao ux-designer); código; rodar o `pronto` ou outra suíte (o commit só leva o parecer e não é o commit final; o `pronto` roda no QA, E1.8); o PR para a develop (fica para depois do parecer do QA); o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- Commit da entrega revisada: bbbef76f0c84f8f68755c08a69da27c598616291, sobre a base d7c74b46203994362147a3fd3d78ec2db9fc0576 (origin/develop).
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-026d/docs/reviews/026-textos-lote3.md`
- PQ-2 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD-026d/docs/reviews/026-textos-lote3.md` · espera: igual '1'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026d diff --name-only bbbef76f0c84f8f68755c08a69da27c598616291 HEAD` · espera: igual 'docs/reviews/026-textos-lote3.md'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026d ls-remote origin refs/heads/docs/026-textos-lote3` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-026d rev-parse HEAD`
- PQ-5 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026d rev-parse HEAD` · espera: o sha40 do commit do parecer

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

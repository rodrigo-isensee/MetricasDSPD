Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-claude-md-enviada   Base: develop   Base-sha: d55db80a87e82ca58aa25e309395d2a2e4590c95
Etapa: review

## Objetivo
Etapa E3.2 do pedido 026 (cartão K-162): o Jarvis editou o `CLAUDE.md` (E3.1, edição sem commit na worktree `/home/rodrigoisensee/MetricasDSPD-026c`, linha 48) para registrar que "enviada" quer dizer o PR para a develop e que o push é liberado antes do parecer do QA. Traga a branch `docs/026-claude-md-enviada` para a develop atual, faça o code review da edição (R-REVIEW), commite a edição e o parecer e faça o push, sem PR. Trabalhe só nessa worktree.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026c diff` (só o `CLAUDE.md`, uma linha).
- `CLAUDE.md` da worktree, seções "Fluxo de uma demanda" e "A main é do usuário".
- `docs/engineering/praticas.md` da worktree, só a seção de commits.

## Entregar
- (E3.2, E3) Leve a branch para `origin/develop` (4137981e5333bee5b69f3c515b26c64d3a0b71c0) por fast-forward, sem perder a edição do `CLAUDE.md` (a branch está em d55db80, sem commits próprios).
- (E3.2, E3) Code review da edição: o texto bate com a decisão do dono abaixo e não contradiz o resto do `CLAUDE.md`. Grave o parecer em `docs/reviews/026-claude-md-enviada.md` pela ferramenta Write (registro de autoria), com o veredito e a seção `## Achados` no formato do `R-REVIEW`. Se reprovar, não edite o `CLAUDE.md` (o hook só deixa o Jarvis): relate o achado com o texto proposto.
- (E3.2) Se aprovar: rode o `pnpm run pronto` completo (é o commit final do conteúdo) e faça um commit com o `CLAUDE.md` e o parecer, no padrão de commits do `docs/engineering/praticas.md`, com `Cartão: K-162`, o Jarvis citado como autor da edição no corpo e `git add` explícito por caminho; push sem `--force`, sem PR.
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
- "E3.1 (jarvis): registrar no CLAUDE.md a leitura da decisão de 2026-10-27 sobre push antes do QA (decisão do dono de 2026-10-28, K-162 opção A)." · etapa de outra delegação; já entregue (edição sem commit na worktree; o commit é deste brief)
- "E3.3 (forge:qa-engineer): parecer de QA do E3.1 (texto do CLAUDE.md coerente com a decisão do dono de 2026-10-27 e com o resto do arquivo)." · etapa de outra delegação; continua no pedido
- "E3.4 (forge:tech-lead): PR da docs/026-claude-md-enviada para a develop e merge com os checks verdes." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Editar o `CLAUDE.md` ou qualquer outro arquivo além do parecer; o PR para a develop (depois do QA, no E3.4); apagar branch ou worktree; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- DECISÃO TÉCNICA do Jarvis (2026-10-28 13:44, Histórico do pedido): o E3 passa pelo QA (E3.3) antes do PR, porque o CLAUDE.md diz que todo desenvolvimento passa pelo QA.
- A trava de suíte única (PR #156) serializa as suítes: se o `pronto` esperar a trava, espere, sem matar processo. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha. Se `pnpm` faltar no PATH, use `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin/`.
- A `main` é do usuário. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026c merge-base --is-ancestor 4137981e5333bee5b69f3c515b26c64d3a0b71c0 HEAD` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026c diff --name-only 4137981e5333bee5b69f3c515b26c64d3a0b71c0 HEAD` · espera: linhas=2
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-026c run pronto` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026c ls-remote origin refs/heads/docs/026-claude-md-enviada` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-026c rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026c status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito e achados; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

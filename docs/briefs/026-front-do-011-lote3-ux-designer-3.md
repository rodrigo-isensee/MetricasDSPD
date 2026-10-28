Agente destino: forge:ux-designer
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-textos-lote3   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: codigo

## Objetivo
Etapa E1.6 do pedido 026 (cartão K-154). O lote 3 (operacionais) já está na develop pelo PR #152. O review e o QA deixaram três recomendados para a especificação. Corrigir esses textos evita que a próxima entrega se guie por uma regra que a tela não segue. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-026d` (branch `docs/026-textos-lote3`, já criada a partir de d7c74b46203994362147a3fd3d78ec2db9fc0576). Você não tem Bash: grave só com Write e Edit. O commit é do tech-lead (E1.7).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026d/docs/reviews/026-lote3-operacionais.md`, linhas 143 e 144 (A12 e A13).
- `/home/rodrigoisensee/MetricasDSPD-026d/docs/qa/026-lote3-operacionais.md`, linhas 52 e 53 (A6 e A7).
- `/home/rodrigoisensee/MetricasDSPD-026d/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: a ficha do O26 (perto da linha 157), a seção 6 (Estados), a seção 9 (Microcopy comum) e a seção 11 (Registro de alinhamentos, perto da linha 400).
- `/home/rodrigoisensee/MetricasDSPD-026d/server/src/metricas/o26.ts`, linha 74, só para confirmar sobre o que o mínimo de 20 se aplica.

## Entregar
- (E1.6, E1) Na ficha do O26 da especificação, a regra do mínimo de 20 passa a valer sobre as entregas do tipo com dado, e não mais sobre a faixa (A12 do review = A7 do QA). O texto segue a decisão A10 do dono, citada abaixo.
- (E1.6, E1) Na seção 11 da especificação, duas linhas novas na tabela de decisões: A10, a leitura do O26 (opção A), e R8, a volta mais comum sem a reabertura (opção A). As duas são de 2026-10-27 (A13 do review).
- (E1.6, E1) Na seção 6 (Estados), a regra para quando não há nenhum item: o estado vazio ("Nenhum item encontrado") aparece sozinho, sem "Amostra insuficiente: 0 de 20" (A6 do QA). Registre na seção 11 que a tela ainda mistura os dois (padrão anterior ao lote 3, em `web/src/components/ui/BadgeBase.tsx:41`) e que a correção do front vai num cartão próprio.
- (E2, E3) Nada a entregar aqui: não nesta delegação (E2 já entregue no PR #152; E3 no E3.1).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (PR #152)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue (worktree limpa em d7c74b46203994362147a3fd3d78ec2db9fc0576)
- "E1.7 (forge:tech-lead): code review, commit e push do E1.6; o PR para a develop depois do parecer do QA." · etapa de outra delegação; continua no pedido
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido (espera decisão do dono, K-162)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Código (`web/`, `server/`, `e2e/`), incluindo a correção do `BadgeBase.tsx`; os contratos em `docs/contratos/`; as outras seções da especificação; commit; push; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- Regras invioláveis do `CLAUDE.md`: nada de métrica individual, e abaixo de 20 itens não se publica estatística. O texto novo não afrouxa o mínimo de 20; ele só diz sobre o que o mínimo se aplica.
- Se um texto pedir uma regra de negócio que não está nas decisões acima, não decida: escreva a dúvida no relatório como PERGUNTA.

## Pronto quando
- PQ-1 (cmd): `grep -c 'R8' /home/rodrigoisensee/MetricasDSPD-026d/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: linhas>=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026d status --porcelain` · espera: igual ' M docs/ux/metricas-tambem-disponiveis/02-especificacao.md'
- PQ-3 (cmd): `grep -c 'entregas ou mais na faixa' /home/rodrigoisensee/MetricasDSPD-026d/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com o trecho do arquivo que a cumpre (o conferente roda os comandos), ou "não cumprido" e o motivo. Inclui os trechos novos da especificação. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

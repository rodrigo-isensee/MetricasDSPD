Agente destino: forge:ux-designer
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-textos-lote3   Base: develop   Base-sha: d7c74b46203994362147a3fd3d78ec2db9fc0576
Etapa: codigo

## Objetivo
Etapa E1.6 do pedido 026 (cartão K-154), segunda versão. O review (E1.9, parecer em 806450213bcf12cce992bbab92e145f0b504d2c4) reprovou a especificação do lote 3 commitada em bbbef76f0c84f8f68755c08a69da27c598616291: duas linhas da tabela da §11 divergem da §5 e do código. Corrija só esses pontos. Trabalhe só na worktree `/home/rodrigoisensee/MetricasDSPD-026d` (branch `docs/026-textos-lote3`). Você não tem Bash: grave só com Write e Edit. O commit é do tech-lead.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026d/docs/reviews/026-textos-lote3.md`, só a seção `## Achados`.
- `/home/rodrigoisensee/MetricasDSPD-026d/docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: a Leitura do O21 (perto da linha 89), a ficha do O26 (linhas 155 a 162) e a tabela da §11 (linhas 410 a 420).
- `/home/rodrigoisensee/MetricasDSPD-026d/packages/metricas/src/businessmap/o26.ts`, linhas 74 e 75, só para confirmar sobre o que o mínimo de 20 se aplica.

## Entregar
- (E1.6, E1) Corrija na especificação os três achados abaixo, sem mudar o resto do texto.
- (E2, E3) Nada a entregar aqui: não nesta delegação (E2 já entregue no PR #152; E3 no E3.1).
- (review 8064502 A1) Linha de A10 diz que o mínimo de 20 vale para percentual e P85 sobre o tipo; contradiz a linha 161 e o26.ts:75 (P85 exige 20 na faixa). Destino: ux-designer separa as duas regras, como na 161. [docs/ux/metricas-tambem-disponiveis/02-especificacao.md:416]
- (review 8064502 A2) A linha de R8 diz que o §5 O21 ignora a reabertura, mas a Leitura do O21 (linha 89) não traz a regra. Destino: ux-designer acrescenta à Leitura do O21 a regra da DECISÃO DO DONO 2026-10-27 (R8, opção A: "A volta mais comum" ignora a reabertura, que segue na linha própria "reaberto"), para a linha 417 passar a ser verdade. [docs/ux/metricas-tambem-disponiveis/02-especificacao.md:417]
- (review 8064502 A3) Cita BadgeBase.tsx:41 e quatro cartões com número de linha, que envelhece. Destino: ux-designer cita só o arquivo ao reescrever; não devolve sozinho. [docs/ux/metricas-tambem-disponiveis/02-especificacao.md:418]

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (PR #152)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue
- "E1.5 (forge:tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-026d` com a branch `docs/026-textos-lote3` a partir da develop com o #152, para o E1.6." · etapa de outra delegação; já entregue (worktree limpa em d7c74b46203994362147a3fd3d78ec2db9fc0576)
- "E1.7 (forge:tech-lead): commit e push do E1.6 (o ux-designer não tem Bash)." · etapa de outra delegação; já entregue para a primeira versão (bbbef76f0c84f8f68755c08a69da27c598616291); o commit desta versão é outra delegação ao tech-lead
- "E1.9 (forge:tech-lead): code review do E1.6, depois do push do E1.7; o PR para a develop depois do parecer do QA." · etapa de outra delegação; review entregue (806450213bcf12cce992bbab92e145f0b504d2c4, reprovado: esta versão); nova rodada e PR continuam no pedido
- "E1.8 (forge:qa-engineer): parecer de QA do E1.6 (documentação: textos coerentes com a tela e os contratos)." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido (espera decisão do dono, K-162)
- "E4.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-026-lote3.md`, com as linhas `MELHORIA:`, depois do E3.1 e do E1.8." · etapa de outra delegação; continua no pedido
- Código (`web/`, `server/`, `e2e/`), incluindo a correção do `BadgeBase.tsx`; os contratos em `docs/contratos/`; o parecer de review; as outras seções da especificação além das citadas em Ler; commit; push; o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026d diff --name-only` · espera: igual 'docs/ux/metricas-tambem-disponiveis/02-especificacao.md'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026d status --porcelain` · espera: igual ' M docs/ux/metricas-tambem-disponiveis/02-especificacao.md'
- PQ-3 (cmd): `grep -c 'BadgeBase.tsx:' /home/rodrigoisensee/MetricasDSPD-026d/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com o trecho do arquivo que a cumpre (o conferente roda os comandos), ou "não cumprido" e o motivo. Inclui os trechos novos da especificação. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

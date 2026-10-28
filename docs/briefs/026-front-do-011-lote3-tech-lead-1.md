Agente destino: forge:tech-lead
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.4 do pedido 026 (cartão K-111): code review do front do lote 3 (O19 a O26 no painel Operacional), commit b1438586dbac82751d6def23673b870feae88ad9 do react-frontend, antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-026`, branch `feature/026-lote3-operacionais`, ainda sem push (o push sai nesta delegação, antes do review).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff e342a2cd71c46df5acf60b756637ebf5a6c84709 b1438586dbac82751d6def23673b870feae88ad9` (28 arquivos, cerca de 2.070 linhas).
- `docs/pedidos/026-front-do-011-lote3.md`, seções `## Escopo` e `## Histórico` (linhas de 14:25 e 15:33).
- `docs/api/metricas.md`, só as seções O19 a O26.

## Entregar
- (E1, E1.4) Antes do review, push da branch `feature/026-lote3-operacionais` com o commit do autor (b1438586dbac82751d6def23673b870feae88ad9), sem `--force`, liberado pela decisão do dono de 2026-10-27 sobre push antes do QA.
- (E1, E1.4) Code review do commit do front em `docs/reviews/026-lote3-operacionais.md`: aderência a `docs/engineering/praticas.md`, cálculo só pela biblioteca compartilhada (nada de cálculo próprio no front), regra de não publicar abaixo de 20 itens, nenhuma visão por pessoa, a exceção do O21 nos testes de alcance e a entrada de O19, O20, O21, O24 e O25 em `CATALOGO_CARTOES`. Bloco `## Achados`, cada achado com até 300 caracteres e os bloqueantes marcados; veredito.
- (E1, E1.4) Conta das 400 linhas por PR: registrar no parecer se o PR único cabe na exceção ou como dividir.
- (E2, E1.4) Registrar no parecer que o back em mock não mudou (E2.1 sem commit) e remover a worktree sem uso `/home/rodrigoisensee/MetricasDSPD-026b` (branch `feature/026-lote3-back`, sem commit próprio, igual a e342a2c) e a branch local dela.
- (E1, E2, E1.4) Commit só do parecer, com o `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e novo push da branch (sem `--force`). PR para a develop: não nesta delegação (depois do QA e da revisão de UX).
- (E3) Registro da leitura de "enviada" no `CLAUDE.md`: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · já entregue (b143858); correções de achados voltam ao autor em outra delegação
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outro papel, depois desta
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel, depois desta
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · já entregue (sem commit)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · outra delegação, em branch própria
- Corrigir código ou testes do front; rodar a suíte E2E; integração real com BusinessMap ou Acelerato; ler ou editar o `.env`; o quadro; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`.
- Teste: só os testes e o typecheck do `web` se precisar confirmar algo; nenhuma suíte E2E nesta etapa.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md` · parecer gravado
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H -- docs/reviews/026-lote3-operacionais.md` · espera: o sha40 do commit do parecer
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%B -- docs/reviews/026-lote3-operacionais.md` · espera: contém 'Cartão: K-111'
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` igual ao head local · branch no remoto com o parecer
- PQ-5 (cmd): `ls -d /home/rodrigoisensee/MetricasDSPD-026b 2>/dev/null` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

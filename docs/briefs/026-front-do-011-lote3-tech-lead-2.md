Agente destino: forge:tech-lead
Pedido: docs/pedidos/026-front-do-011-lote3.md
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.4 do pedido 026 (cartão K-111): re-review da volta do front do lote 3 (O19 a O26), commit eedcafcb114f62d26f8b9252f8735ddb5f1160dd do react-frontend, que corrige os achados A1 a A3 e A5 a A8 do parecer de 0a03c4ba32523d315b747038c15bb7f6e51bcfa2, antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-026`, branch `feature/026-lote3-operacionais`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 0a03c4ba32523d315b747038c15bb7f6e51bcfa2 eedcafcb114f62d26f8b9252f8735ddb5f1160dd` (3 arquivos, cerca de 70 linhas).
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`, bloco `## Achados` (o seu parecer anterior).
- `docs/pedidos/026-front-do-011-lote3.md`, linha do `## Histórico` de 17:31.

## Entregar
- (E1, E1.4) Antes do review, push da branch `feature/026-lote3-operacionais` com o commit do autor (eedcafcb114f62d26f8b9252f8735ddb5f1160dd), sem `--force`, liberado pela decisão do dono de 2026-10-27 sobre push antes do QA.
- (E1, E1.4) Re-review do intervalo 0a03c4b..eedcafc em `docs/reviews/026-lote3-operacionais.md`: cada achado A1 a A3 e A5 a A8 marcado como resolvido ou não, com a evidência; achado novo, se houver, no bloco `## Achados` (até 300 caracteres, bloqueantes marcados); veredito atualizado no frontmatter.
- (E1, E1.4) Registrar no parecer a nota do O25 em `web/src/features/complementares/notas.ts:251` ("Nesta fase não há divisão por motivo"), que o autor deixou como estava, e o destino que você recomenda para ela.
- (E1, E2, E1.4) Commit só do parecer, com o `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`, e novo push da branch (sem `--force`). PR para a develop: não nesta delegação (depois do QA e da revisão de UX).
- (E3) Registro da leitura de "enviada" no `CLAUDE.md`: não nesta delegação.

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · já entregue (eedcafc); correções de achados voltam ao autor em outra delegação
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outro papel, depois desta; leva A9 e A10 do review
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel, depois desta; leva o A4 do review (contagens do catálogo nas E2E)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · já entregue (sem commit)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · outra delegação, em branch própria
- Corrigir código ou testes do front; rodar a suíte E2E; o K-150 (timeout de `plataforma2.test.ts`); integração real com BusinessMap ou Acelerato; ler ou editar o `.env`; o quadro; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens, não publicar estatística; todo cálculo pela biblioteca compartilhada. R-VERIFY: nunca `--no-verify` nem `--force`; R-MAIN: nada na `main`.
- Teste: nenhum. O react-frontend do 041 roda testes na worktree -041 agora (uma suíte por vez); este review é só leitura do diff.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H -- docs/reviews/026-lote3-operacionais.md` · espera: o sha40 do commit do re-review
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%B -- docs/reviews/026-lote3-operacionais.md` · espera: contém 'Cartão: K-111'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` igual ao head local · branch no remoto com o parecer
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff eedcafcb114f62d26f8b9252f8735ddb5f1160dd --name-only` · espera: igual 'docs/reviews/026-lote3-operacionais.md'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o veredito e os achados bloqueantes. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

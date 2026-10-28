Agente destino: forge:react-frontend
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.1 do pedido 026 (cartão K-111), volta do code review: corrigir no front do lote 3 (O19 a O26 no painel operacional) os achados do parecer `docs/reviews/026-lote3-operacionais.md` (commit 0a03c4ba32523d315b747038c15bb7f6e51bcfa2, reprovado), seguindo a especificação de UX e o padrão dos lotes 1 e 2. Delegação anterior: `docs/briefs/026-front-do-011-lote3-react-frontend-1.md` (entrega b1438586dbac82751d6def23673b870feae88ad9).

## Ler
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: seções O19 a O26 (linhas 54 a 160).
- `docs/architecture/features/metricas-tambem-disponiveis.md`: seções O19 a O26 (linhas 95 a 230) e a seção 3, "Proteção de pessoa" (linha 338).
- Como modelo: `web/src/features/complementares/taticas.tsx` e `taticas.test.tsx` (lote 2) e `web/src/features/operacional/OperacionalPage.tsx`.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`, bloco `## Achados` (parecer de 0a03c4b).
- `/home/rodrigoisensee/MetricasDSPD-026/docs/tecnica/arquitetura-front.md`, §12 (linha 298 em diante), para o A1.

## Entregar
- (E1, E1.1) Correção dos achados abaixo na worktree `/home/rodrigoisensee/MetricasDSPD-026` (já existe; branch `feature/026-lote3-operacionais`, head 0a03c4ba32523d315b747038c15bb7f6e51bcfa2, já no remoto; não a recrie). O escopo da entrega original (E1, E2) já foi conferido e não muda.
- (E1, E1.1; review 0a03c4b A1) Falta a doc técnica do lote 3, e pela §7.7 e §8.10 a falta de doc bloqueia. Não há §13 sobre O19 a O26, O23 no O2, COM_TAMBEM com O22/O26 e a exceção do O21. A §12 ainda diz que o COM_TAMBEM lista só E6 e E8. [docs/tecnica/arquitetura-front.md:298]
- (E1, E1.1; review 0a03c4b A2) O CA-6 manda dizer qual grupo do par com × sem tem menos de 20. O contrato traz `grupoAbaixoDoMinimo`, mas o O21 mostra só o menor n. O T13 já faz (`taticas.tsx:463`). Teste 'com', 'sem' e 'ambos'. [web/src/features/complementares/operacionais.tsx:338]
- (E1, E1.1; review 0a03c4b A3) "12 semanas" está escrito à mão no O22. A §3 e o comentário de `JANELA_PERCENTIS_PADRAO` (`contratos/src/comum.ts:241`) mandam partir dessa constante. Use `JANELA_PERCENTIS_PADRAO`. [web/src/features/complementares/operacionais.tsx:474]
- (E1, E1.1; review 0a03c4b A5, recomendado) A matriz do O21 soma `retornos` com `filter().reduce()` na tela. O contrato dá uma célula por origem e destino, então use `find` e mostre o valor dela. Painel não agrega. [web/src/features/complementares/operacionais.tsx:417]
- (E1, E1.1; review 0a03c4b A6, recomendado) O texto do O25 é montado com `SEM_AMOSTRA.replace('— ', '')` e sai "P50 e P85 amostra insuficiente (menos de 20)". Escreva a frase inteira, por exemplo "P50 e P85 não publicados (menos de 20)". [web/src/features/complementares/operacionais.tsx:708]
- (E1, E1.1; review 0a03c4b A7, recomendado) A nota fixa "Nesta fase não há divisão por motivo" contradiz a tabela por motivo que aparece quando `porMotivo` vier preenchido. Condicione a frase a `porMotivo` nulo ou vazio. [web/src/features/complementares/operacionais.tsx:747]
- (E1, E1.1; review 0a03c4b A8, recomendado) O título "estado vazio e erro com 'tentar de novo'" testa só o vazio, e o erro está no teste seguinte. Renomeie para "estado vazio". [web/src/features/complementares/operacionais.test.tsx:126]
- (E1, E1.1) Durante o desenvolvimento, só os testes e o typecheck do `web`; `pnpm run pronto` completo uma vez, antes do commit final. Commits com `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Sem push (o envio é do tech-lead).
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outro papel; não toque em `server/`, `packages/metricas` nem no contrato.
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outro papel; leva os recomendados do review A9 (ligar O13 ou O5 ao O21 e tirar a exceção da alcançabilidade em `packages/contratos/src/cartoes.test.ts:145`; até lá a exceção fica como está) e A10 (frase de leitura do O26; não calcule faixas na tela).
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel; leva o bloqueante A4 do review (contagens antigas do catálogo nas E2E: 58, 26 e "7 de 7"); não toque em `e2e/`.
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outro papel; o re-review vem depois desta volta.
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel.
- Integrações reais; E2E (é do QA); push; PR; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual nem comparação entre times (O26 e O22 sem nome de pessoa nem ranking); BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens não publicar estatística; tempo, percentil e Monte Carlo só pela biblioteca compartilhada (`packages/metricas`); dúvida de regra de negócio vira pergunta, não inferência (relate e pare naquela métrica).
- R-TETO e a decisão de 2026-10-23: o QA do pedido 041 roda uma suíte na worktree -041. Antes de rodar os testes do `web` ou o `pnpm run pronto`, `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.
- ADR 0003: CLS < 0,1 e orçamento de interação em /operacional; reserve a altura dos cartões.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff e342a2cd71c46df5acf60b756637ebf5a6c84709 --name-only -- server packages/metricas` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 0a03c4ba32523d315b747038c15bb7f6e51bcfa2 --name-only -- e2e` · espera: linhas=0
- PQ-5 (cmd): `grep -c '12 semanas' /home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/operacionais.tsx` · espera: igual '0'
- PQ-6 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-026 && pnpm run pronto` · espera: rc=0
- PQ-7 (cmd, do autor): `forge-check entrega 026-front-do-011-lote3 --branch feature/026-lote3-operacionais --base develop --base-sha e342a2cd71c46df5acf60b756637ebf5a6c84709 --etapa codigo --desde 0a03c4ba32523d315b747038c15bb7f6e51bcfa2` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

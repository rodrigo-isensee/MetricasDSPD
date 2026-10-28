Agente destino: forge:react-frontend
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709
Volta-de: docs/briefs/026-front-do-011-lote3-react-frontend-4.md sha256 b77a55d8e80cb638286bd6d23985a1dd19ff23bf03e44760b2475117bdaf12b7

## Objetivo
Etapa E1.1 do pedido 026 (cartão K-111), volta da revisão de UX (E1.2, aprovada com ressalvas): aplicar no front do lote 3 (O19 a O26) os textos e ajustes decididos na revisão `docs/ux/revisao-026-front-operacionais.md` e nas duas decisões do dono de hoje, antes do QA. Worktree `/home/rodrigoisensee/MetricasDSPD-026` (já existe; não a recrie), branch `feature/026-lote3-operacionais`, head 78c6fcb12149d61afe91568423d6fca59158e165 (code review aprovado, já no remoto).

## Ler
- Esta volta: a entrega 8f6b32dd714f8928f07a7bbe910f4c99917c27ca (head atual) cumpriu o pedido anterior, mas o aviso "Dado fictício até a coleta real" saiu também de 4 notas fora do R9 (T13, T14, E6 e E8 em `notas.ts`), que ficaram terminando em "..". O erro de origem é do brief anterior (o PQ-5 contava o arquivo inteiro).
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 78c6fcb12149d61afe91568423d6fca59158e165 8f6b32dd714f8928f07a7bbe910f4c99917c27ca -- web/src/features/complementares/notas.ts`.
- `docs/pedidos/026-front-do-011-lote3.md`, linha do `## Histórico` de 18:33.

## Entregar
- (E1, E1.1; UX R9) Restaurar em `web/src/features/complementares/notas.ts` o texto anterior das 4 notas fora do R9 (as de T13, T14, E6 e E8, hoje nas linhas 300, 310, 320 e 342), com o aviso " Dado fictício até a coleta real." de volta e sem o ".." final; as notas do O22 e do O26 (R9) ficam sem o aviso, como estão.
- (E1, E1.1) Não mexa em nenhum outro texto de `notas.ts`, `operacionais.tsx`, `taticas.tsx` e `CartaoO2.tsx`; a numeração 13/14 e o espaçamento das tabelas em `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` ficam como estão (aceitos pelo Jarvis, histórico de 18:33). Nesta volta o QA do 041 roda E2E na worktree -041 e o K-151 roda testes na -151: a mesma checagem de `pgrep` antes de cada suíte.
- (E1, E1.1) Teste unitário que falha se alguma nota terminar em "..". Commit com `Cartão: K-111`, `git add` explícito por caminho, conforme a seção de commits do `docs/engineering/praticas.md`. Durante o desenvolvimento, só os testes e o typecheck do `web`; `pnpm run pronto` completo uma vez, antes do commit final. Sem push (o envio é do tech-lead).
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outro papel; não toque em `server/`, `packages/metricas` nem no contrato (a opção A dispensa campo novo).
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · cumprida; A9 mantém a exceção do O21 em `packages/contratos/src/cartoes.test.ts:145` (não mexa).
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outro papel, depois desta; leva o A4 do review (contagens do catálogo nas E2E); não toque em `e2e/`.
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outro papel; o re-review vem depois desta volta.
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel.
- Integrações reais; E2E; push; PR; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042; trazer a develop para a branch.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual (O22 e O26 sem pessoa nem ranking); abaixo de 20 itens não publicar estatística; mudança de critério marcada nos gráficos (T2.6); painel não agrega (nada de somar faixas na tela); dúvida de regra de negócio vira pergunta, não inferência (relate e pare naquela métrica).
- R-TETO e a decisão de 2026-10-23: o react-frontend do 041 roda testes E2E na worktree -041. Antes de rodar os testes do `web` ou o `pnpm run pronto`, `pgrep -fa 'playwright|vitest|vite'`; com outra suíte em curso, espere ela acabar. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.
- ADR 0003: CLS < 0,1 em /operacional; o que entrar no O2 (R6) reserva altura.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do último commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-3 (cmd): `grep -c 'Dado fictício até a coleta real' /home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/notas.ts` · espera: igual '4'
- PQ-4 (cmd): `grep -c "\.\.'" /home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/notas.ts` · espera: igual '0'
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff 8f6b32dd714f8928f07a7bbe910f4c99917c27ca --name-only -- server packages e2e docs` · espera: linhas=0
- PQ-6 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-026 && pnpm run pronto` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

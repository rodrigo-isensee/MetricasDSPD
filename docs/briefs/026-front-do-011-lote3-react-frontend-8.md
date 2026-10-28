Agente destino: forge:react-frontend
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: codigo

## Objetivo
Etapa E1.1 do pedido 026 (cartão K-111): estabilizar o teste unitário que derrubou o check obrigatório `testes` do PR #152. No run de pull_request 40665029650, `web/src/features/complementares/operacionais.test.tsx:177` ("marca a mudança de critério no gráfico com linha vertical e rótulo acessível") leu `.marca-criterio` como null; o mesmo head ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463 passou no run de push 40664226876. O teste lê o SVG logo depois de `data-estado` ok, sem esperar o gráfico. Worktree `/home/rodrigoisensee/MetricasDSPD-026` (já existe; não a recrie), branch `feature/026-lote3-operacionais`, head ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026/web/src/features/complementares/operacionais.test.tsx`: a função `abrir` (linha 22) e o teste da linha 170 a 181; procure no mesmo arquivo outras leituras síncronas de SVG por `querySelector` logo depois de `abrir`.
- `docs/pedidos/026-front-do-011-lote3.md`: as duas linhas do `## Histórico` de 2026-10-28 06:44.

## Entregar
- (E1, E1.1) No `operacionais.test.tsx`, o teste da linha 177 espera a marca com `waitFor` (ou `findBy` equivalente) antes de ler o `title`; aplique a mesma espera às outras leituras síncronas de SVG do mesmo arquivo que dependem do gráfico renderizado. Sem mudar código de produção nem o que o teste afirma.
- (E1, E1.1) `pnpm run pronto` uma vez, antes do commit final; commit com `git add` explícito do arquivo de teste, mensagem no padrão de commits do `docs/engineering/praticas.md` com `Cartão: K-111`; push da branch sem `--force` (push antes do QA liberado pela decisão do dono de 2026-10-27).
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; continua no pedido (revalidação do parecer depois desta volta)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; continua no pedido (re-review depois desta volta, e o merge do PR #152)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- E1.1 na `feature/026-lote3-operacionais`, voltas anteriores (react-frontend-1 a react-frontend-7) · etapa de outra delegação; já entregue
- Código de produção do `web`, `server/`, `packages/`, `e2e/`, `docs/`; outros arquivos de teste; pareceres; re-executar checks da CI; o PR #152 (comentar, editar ou mesclar); trazer a develop para a branch; o quadro; ler ou editar o `.env`; as worktrees dos pedidos 041 e 042.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega só mexe em teste e não muda limite nem medição.
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-28 06:44): sem rerun do check; o teste passa a esperar a marca; depois re-review, revalidação do QA e o PR #152 segue com o push novo.
- Regras invioláveis do `CLAUDE.md`: mudança de critério marcada nos gráficos (T2.6), e o teste segue afirmando a marca e o rótulo; nenhuma métrica para avaliação individual.
- Suíte por vez (R-TETO e a decisão de 2026-10-23): outros agentes podem estar rodando a CI remota, não suíte local; antes do `pnpm run pronto`, `pgrep -fa 'playwright|vitest|vite|unittest'` e, com outra suíte em curso, espere ela acabar. O hook barra `$`, crase e `?` no Bash: use o PATH `/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin` como prefixo literal. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 log -1 --format=%H` · espera: o sha40 do commit desta entrega
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463 --name-only` · espera: igual 'web/src/features/complementares/operacionais.test.tsx'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-4 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-026 && pnpm run pronto` · espera: rc=0
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 do PQ-1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

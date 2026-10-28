Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: docs/026-claude-md-enviada   Base: develop   Base-sha: d55db80a87e82ca58aa25e309395d2a2e4590c95
Etapa: codigo

## Objetivo
Registrar no `CLAUDE.md` do projeto a leitura de "enviada" decidida pelo dono em 2026-10-27 (E3.1 do pedido 026, cartão K-162): o push da feature branch é liberado antes do parecer do QA, e "enviada" quer dizer o PR para a develop, que só abre com o parecer do QA. Hoje o passo 4 do "Fluxo de uma demanda" diz "Nenhuma branch é enviada sem o parecer do QA em `docs/qa/`", e a frase já gerou uma reprovação de brief (pedido 026, 2026-10-27 15:43). Crie a worktree `/home/rodrigoisensee/MetricasDSPD-026c` com a branch nova `docs/026-claude-md-enviada` a partir de `origin/develop` (d55db80a87e82ca58aa25e309395d2a2e4590c95), com `git worktree add -b`; trabalhe só nela.

## Ler
- `CLAUDE.md`, seção "Fluxo de uma demanda", passos 4 e 6.
- `docs/pedidos/026-front-do-011-lote3.md`, linha "DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA" e o Histórico de 2026-10-27 15:43 a 15:45.

## Entregar
- (E3.1) No `CLAUDE.md` da worktree, o texto do passo 4 (e do passo 6, se precisar para não contradizer) diz que o push da feature branch é liberado antes do parecer do QA e que "enviada" é o PR para a develop, que só abre com o parecer do QA em `docs/qa/`, citando a decisão do dono de 2026-10-27. Mudança mínima, sem mexer nas regras invioláveis nem nas outras seções.
- (E3.1) Um commit só com o `CLAUDE.md`, `git add` explícito por caminho, no padrão de commits do `docs/engineering/praticas.md`, com a linha `Cartão: K-162`; push da branch nova (sem `--force`), liberado pela própria decisão.
- (E1, E2) Nada a entregar aqui: não nesta delegação (lote 3 no PR #152, em checks).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (fd66d8f6244dcb1165c2cde1c5d75a8c2de55ea3, aprovado)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue (tech-lead-1 a tech-lead-5, tech-lead-7 e tech-lead-9; merge da develop pelo tech-lead-6, PR #152 pelo tech-lead-8, checks e merge pelo tech-lead-10)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- O PR para a develop e o merge desta branch: vêm depois do parecer do QA, numa próxima delegação; o parecer de QA (qa-engineer); o PR #152 e a `feature/026-lote3-operacionais`; o cartão K-154; `homolog` e `main`; o quadro e o arquivo do pedido; as worktrees -041b, -upgrade e -026; rodar suítes de teste; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- ADR 0003 (citada no pedido): orçamento de performance; nada a decidir nesta entrega (só documentação).
- Documentação só: sem `pnpm run pronto` nem suíte de teste; a validação é o `pnpm run docs:check` da worktree, se as dependências estiverem instaladas nela; sem elas, rode `pnpm install --frozen-lockfile` antes, uma vez.
- R-VERIFY: nunca `--no-verify` nem `--force`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026c diff --name-only d55db80a87e82ca58aa25e309395d2a2e4590c95 HEAD` · espera: igual 'CLAUDE.md'
- PQ-2 (cmd): `grep -c 'PR para a .develop' /home/rodrigoisensee/MetricasDSPD-026c/CLAUDE.md` · espera: rc=0
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-026c run docs:check` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026c ls-remote origin refs/heads/docs/026-claude-md-enviada` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-026c rev-parse HEAD`
- PQ-5 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026c rev-parse HEAD` · espera: o sha40 do commit do CLAUDE.md

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o trecho novo do `CLAUDE.md`. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

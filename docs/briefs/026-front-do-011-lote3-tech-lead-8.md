Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: merge
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: merge-integracao

## Objetivo
Pedido 026 (cartão K-111, lote 3 operacionais), parte final da `feature/026-lote3-operacionais`: PR para a develop e merge por squash depois dos checks verdes, com a limpeza da branch e da worktree. Pareceres aprovados: review (15ad62a), UX (`docs/ux/revisao-026-front-operacionais.md`, aprovado com ressalvas) e QA (ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463, reteste com `pronto` rc=0 e E2E completa 746 de 746); o `forge-check pr` da worktree sai limpo contra `origin/develop` e sem base. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463, já no origin.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md`, `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md` e `/home/rodrigoisensee/MetricasDSPD-026/docs/ux/revisao-026-front-operacionais.md`: só o frontmatter e `## Achados` (ou o resumo do veredito).

## Entregar
- (E1, E1.4) `forge-check pr` da worktree limpo antes de abrir o PR.
- (E1, E1.4) PR para a `develop` com `gh pr create --base develop --head feature/026-lote3-operacionais --body-file <arquivo>`: título em português no padrão de commits do `docs/engineering/praticas.md`; corpo com o resumo (O19 a O26 no painel Operacional, O23 como bloco do O2, back só em mock), os pareceres de review, UX e QA citados por caminho, os achados recomendados que ficaram abertos e a linha `Cartão: K-111`.
- (E1, E1.4) Esperar os checks obrigatórios do ruleset (`gh pr checks feature/026-lote3-operacionais --watch --required`); verdes (o `banco` vale `pass` ou `skipped` por filtro), merge com `gh pr merge feature/026-lote3-operacionais --squash` (sem `--admin`). Check vermelho, conflito ou recusa de hook: sem merge, relate a mensagem inteira (R-CONFORMIDADE). Comandos por nome de branch, sem variáveis de shell.
- (E1, E1.4) Depois do merge: `rm -rf /home/rodrigoisensee/MetricasDSPD-026/node_modules` se existir, remover a worktree `/home/rodrigoisensee/MetricasDSPD-026` (sem `--force`) e apagar a branch remota e a local (R-FLUXO, "Depois do merge"); só se os heads remoto e local forem o `headRefOid` do PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; já entregue (ff5ef98, aprovado)
- E1.4 na `feature/026-lote3-operacionais`, code review e re-reviews (tech-lead-1 a tech-lead-5 e tech-lead-7) e merge da develop (tech-lead-6) · etapa de outra delegação; já entregue (último parecer em 15ad62a)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue (nada faltava no back em mock)
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- Mudar código, testes ou pareceres (achado vira relato, não correção); criar outro PR além deste; rodar suítes de teste locais (o reteste do QA já rodou no head); o cartão K-154 (textos da especificação, UX); `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-27 21:05 (b)): depois do merge do 041 na develop, o tech-lead traz a develop para a branch e o reteste do QA mede o F4 na branch e na develop.
- ADR 0003 (citada no pedido): orçamento de performance; o F4 do lote 3 foi medido pela regra nova no reteste do QA (p95 44,1 ms, limite 100 ms); esta entrega não mexe em limite nem em medição.
- Regras invioláveis do `CLAUDE.md`: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não publicar estatística. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): na raiz de `/home/rodrigoisensee/MetricasDSPD-026`, `/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.30.3/bin/forge-check --raiz-pedidos /home/rodrigoisensee/MetricasDSPD pr 026-front-do-011-lote3 --ref feature/026-lote3-operacionais --base origin/develop` · espera: rc=0 (antes de abrir o PR)
- PQ-2 (pr): `gh pr view feature/026-lote3-operacionais --json number,baseRefName,body` · espera: base `develop`, corpo com 'Cartão: K-111'
- PQ-3 (run): `gh pr checks feature/026-lote3-operacionais --required` · espera: todos os obrigatórios em pass (o `banco` pode ser skipping pelo filtro)
- PQ-4 (merge): `gh pr view feature/026-lote3-operacionais --json state,mergeCommit` · espera: state `MERGED` e o sha40 do commit do merge
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c MetricasDSPD-026` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o número do PR, o sha do merge e o tempo de espera dos checks. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

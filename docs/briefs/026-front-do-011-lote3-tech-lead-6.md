Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709
Etapa: codigo

## Objetivo
Pedido 026 (cartão K-111, lote 3 operacionais): trazer a develop, que agora tem o 041 (PR #150, merge 9cc84d3861b323fb84818a1458dc97cbfd09ae9b: regra nova de medição do F4, correções de CLS e COMP-01), para a `feature/026-lote3-operacionais` antes do re-review e do reteste do QA, pela decisão técnica do Jarvis de 2026-10-27 21:05 (b) no Histórico do pedido. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head local e3b9fa49a72cbd3f430685a4b3e52ef477ae2802 (volta do A1), remoto c72b955a8d373eff99e6c7916634c7eba70461c9.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 log --oneline c72b955..HEAD` e `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --stat HEAD origin/develop`.
- Histórico do pedido `docs/pedidos/026-front-do-011-lote3.md`: linhas de 2026-10-27 21:05 e 21:43.

## Entregar
- (E1, E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-026 fetch origin develop` e merge de `origin/develop` (9cc84d3) na branch, sem rebase; conflito se resolve preservando o comportamento das duas pontas (o lote 3 e as correções do 041); conflito que pede decisão de produto: pare e relate. Mensagem `chore(integracao): traz a develop (041) para a feature/026-lote3-operacionais`, com `Cartão: K-111`.
- (E1, E1.4) `pnpm run pronto` da raiz da worktree uma vez, depois do merge, só com a máquina livre: antes, `pgrep -af 'playwright test|vitest'` sem saída (outras frentes testam; espere e repita). Falha: relate o teste e a mensagem; corrija só o que o merge quebrou de forma mecânica (import, tipo), sem mudar comportamento.
- (E1, E1.4) Push da branch, sem `--force` e sem PR (o push antes do QA é liberado pela decisão do dono de 2026-10-27).
- (E2) Nada a entregar aqui: não nesta delegação (as etapas dele estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; continua no pedido (reteste depois deste merge)
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · o re-review (c72b955..head) é de outra instância do tech-lead, depois deste merge; continua no pedido
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- Mudar comportamento, testes ou pareceres; PR e merge na develop; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041, -041b e -upgrade.

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
- Regras invioláveis do `CLAUDE.md`: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não publicar estatística. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD` · espera: o sha40 do commit de merge
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 merge-base --is-ancestor 9cc84d3861b323fb84818a1458dc97cbfd09ae9b HEAD` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 merge-base --is-ancestor e3b9fa49a72cbd3f430685a4b3e52ef477ae2802 HEAD` · espera: rc=0
- PQ-4 (cmd): `pnpm run pronto` na raiz da worktree · espera: rc=0
- PQ-5 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 do PQ-1
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui os conflitos e como foram resolvidos. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: review

## Objetivo
Pedido 026 (cartão K-111, lote 3 operacionais): re-review do que entrou na branch depois do parecer de review aprovado (dd9a91d, que avaliou c72b955): a volta do A1 (e3b9fa4), o merge da develop com o 041 (9d0e4a9) e o ajuste do spec ao helper `esperarPronto` (0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6, tech-lead-6). O `forge-check` marca o parecer de review como desatualizado (`e2e/tests/complementares.spec.ts` mudou depois dele). Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head 0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6, já enviado.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff c72b955a8d373eff99e6c7916634c7eba70461c9 0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6 -- web e2e` (o que a develop trouxe já foi revisado no PR #150; olhe dele só os conflitos e os pontos de contato com o lote 3).
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`: inteiro (parecer anterior).

## Entregar
- (E1, E1.4) Code review do intervalo c72b955..0e78a55 (volta do A1, merge da develop, ajuste ao `esperarPronto`): regras invioláveis do `CLAUDE.md`, coerência do merge com as duas pontas, testes que cobrem a volta do A1.
- (E1, E1.4) Regravar `docs/reviews/026-lote3-operacionais.md` pela ferramenta de escrita (Write): frontmatter com `parecer:` (aprovado ou reprovado) e `commit: 0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6`; os achados anteriores resolvidos ou mantidos; seção `## Achados` só com linhas de achado, uma por linha, até 300 caracteres cada. Commit com `git add` explícito desse caminho, mensagem `docs(review): re-review do lote 3 depois da develop do 041` com `Cartão: K-111`; push sem `--force`, sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; continua no pedido (achado bloqueante volta a ele)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; continua no pedido (reteste depois deste re-review)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- Mudar código, testes ou outros pareceres; rodar suítes de teste (o `pronto` do head já rodou com rc=0 no tech-lead-6; o reteste é do QA); PR e merge na develop; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041b e -upgrade.

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
- Regras invioláveis do `CLAUDE.md`: BusinessMap e Acelerato nunca se misturam; nenhuma métrica individual; abaixo de 20 itens não publicar estatística. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O parecer é gravado pela ferramenta de escrita (Write), nunca por Bash, sed ou python, e sem `commit --amend`. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6' /home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --name-only 0e78a55a6c3f317bfc436f5fb43fc8e28430cdb6 HEAD` · espera: igual 'docs/reviews/026-lote3-operacionais.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, os achados bloqueantes e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

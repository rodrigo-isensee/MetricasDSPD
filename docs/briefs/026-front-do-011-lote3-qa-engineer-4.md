Agente destino: forge:qa-engineer
Pedido: 026-front-do-011-lote3
Tipo: qa
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 026 (cartão K-111), reteste do portão de QA (R-QA) do lote 3, pela sequência da decisão técnica do Jarvis de 2026-10-27 21:05 no Histórico do pedido: o parecer anterior (6199302) reprovou por A1 (L3-001) e A2 (L3-002, F4 de 134 a 141 ms), com A3 a A5 sendo falhas conhecidas corrigidas no 041. Desde então: volta do A1 (e3b9fa4), develop com o 041 na branch (9d0e4a9, regra nova de medição do F4 na ADR 0003, correções de CLS e COMP-01), ajuste ao `esperarPronto` (0e78a55) e re-review aprovado (15ad62ab9efae690f7082a3ab9f28acc06a8c40d). Com o parecer aprovado, o tech-lead abre o PR. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head 15ad62ab9efae690f7082a3ab9f28acc06a8c40d, já no remoto.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md`: inteiro (parecer anterior).
- `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/bugs/L3-001-leia-junto-da-visao-diaria-nao-leva-ao-o19-e-o20.md` e `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/bugs/L3-002-f4-resposta-visual-acima-de-100-ms.md`.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/architecture/adr/0003-orcamento-de-performance.md`, seção "Medição do F4".
- `docs/pedidos/026-front-do-011-lote3.md`, linhas do `## Histórico` de 2026-10-27 21:00 e 21:05.

## Entregar
- (E1, E1.3) Reteste do A1 (L3-001): a E2E que achou o defeito e o "Leia junto" da visão diária até O19 e O20; registre o resultado no bug e no parecer.
- (E1, E1.3) Reteste do A2 (L3-002): o teste do F4 pela regra nova da ADR 0003 na branch; com a branch acima de 100 ms, meça o mesmo teste na develop (9cc84d3) numa worktree temporária `git -C /home/rodrigoisensee/MetricasDSPD worktree add --detach /home/rodrigoisensee/MetricasDSPD-qa-dev 9cc84d3861b323fb84818a1458dc97cbfd09ae9b`, com `pnpm install --frozen-lockfile` nela e só o spec do F4; no fim, `rm -rf /home/rodrigoisensee/MetricasDSPD-qa-dev/node_modules` e `git -C /home/rodrigoisensee/MetricasDSPD worktree remove /home/rodrigoisensee/MetricasDSPD-qa-dev` (sem `--force`). Regressão é só a que existe na branch e não na develop.
- (E1, E1.3) Local, uma suíte por vez: `pnpm run pronto` completo uma vez; depois a E2E completa, `--retries=0`, 2 workers, com a contagem de passaram e falharam e o comando exato; A3 a A5 (COMP-01 a 1280 px, CLS a 375 px) conferidos nela.
- (E1, E1.3) Regravar `docs/qa/026-lote3-operacionais.md` pela ferramenta de escrita (Write): frontmatter com `parecer:` (aprovado ou reprovado) e `commit: 15ad62ab9efae690f7082a3ab9f28acc06a8c40d`; A1 a A5 resolvidos ou mantidos; seção `## Achados` só com linhas de achado, uma por linha, até 300 caracteres cada, bloqueantes marcados; status dos bugs L3-001 e L3-002 atualizado. Commit com `git add` explícito por caminho e `Cartão: K-111`; push sem `--force`, sem PR (push antes do PR liberado pela decisão do dono de 2026-10-27).
- (E2, E1.3) QA do E2 (back em mock): nada a testar à parte; as rotas das 8 métricas entram pela E2E do front.
- (E3) Nada a entregar aqui: não nesta delegação (a etapa dele está no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · já entregue (dd9a91d, volta do A1 em e3b9fa4); defeito vira achado e volta ao autor em outra delegação
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · cumprida (re-review em 15ad62ab9efae690f7082a3ab9f28acc06a8c40d); o PR para a develop vem depois desta
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outro papel
- Corrigir código do front ou do back (defeito vira achado); mudar o limite ou a regra do F4; aumentar timeout ou ligar retry; PR e merge; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041b e -upgrade.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): recibo do lote 3 aceito, com acréscimo ("Sim mas faca o que precisar de back mokado, so deixe as integracoes reais pro final").
- DECISÃO DO DONO (2026-10-20): ordem das pendências: "veja se tem algo das metricas estrategicas pendentes se tem comece por ele, senao va para taticas e por ultimo operacional. Depois de tudo isso faremos as integracoes oficiais funcionar."
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-27): integrações só depois de todo o backlog; prioridade nas operacionais ("prefiro deixar para mexer nas integracoes reais quando acabar tudo porque vai consumir poder computacional que eu quero usar para entregar as coisas, temos que fazer as metricas operacionais") (pedido 042).
- DECISÃO DO DONO (2026-10-27): push da feature branch antes do parecer do QA, opção A ("A"): o push é liberado; "enviada" no CLAUDE.md quer dizer o PR para a develop, que só abre com o parecer do QA; o tech-lead registra essa leitura no CLAUDE.md por PR. Vale para todas as branches do projeto.
- DECISÃO DO DONO (2026-10-27): ficha do O26 (A10), opção A ("A"): ajustar a ficha à frase da tela (faixa mais comum, com percentual e P85 por faixa quando houver 20 itens ou mais); sem campo novo no contrato.
- DECISÃO DO DONO (2026-10-27): R8 do O21, opção A ("A"): a frase "A volta mais comum" ignora a reabertura (retorno a partir de "Entregue"), que segue na linha própria "reaberto".
- Decisão técnica do Jarvis (Histórico do pedido, 2026-10-27 21:05 (b)): A2 a A5 sem ação de código até o 041 entrar; depois do merge da develop, o reteste do QA mede o F4 na branch e na develop; só com regressão persistente o F4 volta ao react-frontend.
- Regras invioláveis do `CLAUDE.md`: nenhuma métrica para avaliação individual; BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens, não publicar estatística; dúvida de regra de negócio vira pergunta, não inferência.
- ADR 0003: orçamento de performance; o QA mede contra ela, sem mexer em limite nem na regra.
- Uma suíte por vez: o QA do pedido 042 pode estar rodando o `pronto` na worktree -upgrade. Antes de cada rodada (pronto, E2E, F4 na develop), `pgrep -fa vitest` e `pgrep -fa playwright` sem saída; com outra suíte em curso, espere (confira a cada minuto, sem limite de tentativas) e confira de novo logo antes de começar. Se um processo for morto por falta de memória, rode com menos workers e tente de novo. Node: prefixo literal `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin` antes do `pnpm`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais. R-QA: o parecer é do QA, gravado pela ferramenta de escrita, nunca por Bash, e sem `commit --amend`. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 15ad62ab9efae690f7082a3ab9f28acc06a8c40d' /home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md` · espera: igual '2'
- PQ-2 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run pronto` na raiz de `/home/rodrigoisensee/MetricasDSPD-026` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --name-only 15ad62ab9efae690f7082a3ab9f28acc06a8c40d HEAD -- web server packages` · espera: linhas=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0
- PQ-6 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain | grep -c MetricasDSPD-qa-dev` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, os achados bloqueantes, o F4 medido (branch e, se medida, develop), a contagem da E2E completa com o comando exato e o sha do commit do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:qa-engineer
Pedido: 026-front-do-011-lote3
Tipo: qa
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: qa

## Objetivo
Etapa E1.3 do pedido 026 (cartão K-111): revalidação do portão de QA (R-QA) depois da correção do teste instável do O20 (172d008a94f56ed791e74b9e7553cd9a92bf26e7, react-frontend-8), que derrubou o check `testes` do PR #152 no run de pull_request 40665029650, e do re-review aprovado (ad302349d9400e8c47033b3fdba8525b39896872). O parecer de QA aprovado (ff5ef98) avaliou 15ad62a; desde então só mudaram o arquivo de teste e o parecer de review. Com o parecer revalidado, o tech-lead faz o merge do PR #152. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head ad302349d9400e8c47033b3fdba8525b39896872, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463 ad302349d9400e8c47033b3fdba8525b39896872 --stat`.
- `/home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md`: frontmatter e `## Achados`.
- `docs/pedidos/026-front-do-011-lote3.md`: as linhas do `## Histórico` de 2026-10-28 06:44 em diante.

## Entregar
- (E1, E1.3) Prova da estabilidade do teste corrigido: no diretório `web` da worktree, o arquivo `src/features/complementares/operacionais.test.tsx` sozinho 10 vezes seguidas (`TZ=UTC vitest run` com esse caminho), e a suíte do web com cobertura (`pnpm run cobertura`, a condição em que o CI falhou) uma vez; registre a contagem de passaram e falharam de cada rodada.
- (E1, E1.3) Revalidar `docs/qa/026-lote3-operacionais.md` pela ferramenta de escrita (Write): `commit:` passa a `ad302349d9400e8c47033b3fdba8525b39896872`; uma linha de revalidação com o que mudou desde 15ad62a (só o teste do O20 e o parecer de review) e o resultado das rodadas acima; veredito e achados anteriores iguais, salvo defeito novo achado agora. Commit com `git add` explícito desse caminho e `Cartão: K-111`; push sem `--force`, sem PR.
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (172d008; defeito vira achado e volta ao autor)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue
- "E1.4 (forge:tech-lead): code review do E1 e do E2." · etapa de outra delegação; já entregue (re-review em ad302349d9400e8c47033b3fdba8525b39896872); o merge do PR #152 vem depois desta
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- E1.3 na `feature/026-lote3-operacionais`, QA e retestes anteriores (qa-engineer-1 a qa-engineer-4) · etapa de outra delegação; já entregue (ff5ef98)
- E2E completa e `pnpm run pronto` (nada de produção nem de e2e mudou desde o reteste ff5ef98, que rodou os dois; o react-frontend-8 rodou o `pronto` em 172d008); corrigir código ou teste (defeito vira achado); aumentar timeout ou ligar retry; o PR #152 (comentar, editar, mesclar) e re-executar checks; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041b e -upgrade.

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
- Regras invioláveis do `CLAUDE.md`: mudança de critério marcada nos gráficos (T2.6); nenhuma métrica individual.
- Uma suíte por vez: antes de cada rodada, `pgrep -fa vitest` e `pgrep -fa playwright` sem saída; com outra suíte em curso, espere e confira de novo logo antes de começar. Node: prefixo literal `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin` antes do `pnpm` e do `npx vitest`. O hook barra `$`, crase, chaves e `?` no Bash: comandos literais, um por linha. R-QA: o parecer é do QA, gravado pela ferramenta de escrita, nunca por Bash, e sem `commit --amend`. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio vira relato.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: ad302349d9400e8c47033b3fdba8525b39896872' /home/rodrigoisensee/MetricasDSPD-026/docs/qa/026-lote3-operacionais.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --name-only ad302349d9400e8c47033b3fdba8525b39896872 HEAD` · espera: igual 'docs/qa/026-lote3-operacionais.md'
- PQ-3 (cmd): `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin pnpm run cobertura` no diretório `/home/rodrigoisensee/MetricasDSPD-026/web` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD`
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, a contagem das 10 rodadas do arquivo de teste e da cobertura, e o sha do commit do parecer. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

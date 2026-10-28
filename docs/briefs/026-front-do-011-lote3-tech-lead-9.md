Agente destino: forge:tech-lead
Pedido: 026-front-do-011-lote3
Tipo: codigo
Branch: feature/026-lote3-operacionais   Base: develop   Base-sha: 9cc84d3861b323fb84818a1458dc97cbfd09ae9b
Etapa: review

## Objetivo
Pedido 026 (cartão K-111, lote 3 operacionais): re-review do commit 172d008a94f56ed791e74b9e7553cd9a92bf26e7 (react-frontend-8), que estabiliza o teste do O20 em `web/src/features/complementares/operacionais.test.tsx` (o teste da linha 177 derrubou o check `testes` do PR #152 no run de pull_request 40665029650; o mesmo head ff5ef98 passou no run de push). O parecer de review aprovado (15ad62a) avaliou 0e78a55; o QA (ff5ef98) avaliou 15ad62a. Worktree `/home/rodrigoisensee/MetricasDSPD-026`, head 172d008a94f56ed791e74b9e7553cd9a92bf26e7, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-026 diff ff5ef981b3393d4a42b9b1c9a86e0f8a4509a463 172d008a94f56ed791e74b9e7553cd9a92bf26e7` (só o arquivo de teste).
- `/home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md`: frontmatter e `## Achados`.
- `docs/pedidos/026-front-do-011-lote3.md`: as linhas do `## Histórico` de 2026-10-28 06:44 e 06:55.

## Entregar
- (E1, E1.4) Code review do intervalo ff5ef98..172d008: a espera nova cobre a corrida que derrubou o check; o teste segue afirmando a marca e o rótulo (T2.6); outras leituras síncronas de SVG no mesmo arquivo, se houver, viram achado.
- (E1, E1.4) Regravar `docs/reviews/026-lote3-operacionais.md` pela ferramenta de escrita (Write): frontmatter com `parecer:` (aprovado ou reprovado) e `commit: 172d008a94f56ed791e74b9e7553cd9a92bf26e7`; os achados anteriores mantidos; seção `## Achados` só com linhas de achado, uma por linha, até 300 caracteres cada. Commit com `git add` explícito desse caminho, mensagem no padrão de commits do `docs/engineering/praticas.md` com `Cartão: K-111`; push sem `--force`.
- (E2, E3) Nada a entregar aqui: não nesta delegação (as etapas deles estão no Fora do escopo).

## Fora do escopo
- "E1.1 (forge:react-frontend): front do lote 3." · etapa de outra delegação; já entregue (172d008; achado bloqueante volta a ele)
- "E1.2 (forge:ux-designer): revisão da interface implementada do lote 3." · etapa de outra delegação; já entregue (a mudança é só de teste, sem revisão de UX)
- "E1.3 (forge:qa-engineer): QA do front do lote 3." · etapa de outra delegação; continua no pedido (revalidação depois deste re-review)
- "E2.1 (forge:node-backend): levantar e completar o back em mock das 8 métricas (E2), em branch própria, em paralelo ao E1.1." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): registrar no CLAUDE.md, por PR, a leitura da decisão de 2026-10-27 sobre push antes do QA." · etapa de outra delegação; continua no pedido
- E1.4 na `feature/026-lote3-operacionais`, reviews e re-reviews anteriores (tech-lead-1 a tech-lead-7) · etapa de outra delegação; já entregue (último parecer em 15ad62a)
- E1.4 na `feature/026-lote3-operacionais`, PR #152 e merge (tech-lead-8) · etapa de outra delegação; continua no pedido (o merge vem depois do QA, em outra delegação)
- Mudar código, testes ou outros pareceres (achado vira relato, não correção); rodar suítes de teste (o `pronto` do head já rodou com rc=0 no react-frontend-8); comentar, editar ou mesclar o PR #152; re-executar checks da CI; `homolog` e `main`; o quadro; ler ou editar o `.env`; as worktrees -041b e -upgrade.

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
- Regras invioláveis do `CLAUDE.md`: mudança de critério marcada nos gráficos (T2.6); nenhuma métrica individual. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio vira relato. O parecer é gravado pela ferramenta de escrita (Write), nunca por Bash, sed ou python, e sem `commit --amend`. O hook barra `$`, crase e `?` no Bash: comandos literais.

## Pronto quando
- PQ-1 (cmd): `grep -c -e '^parecer: ' -e '^commit: 172d008a94f56ed791e74b9e7553cd9a92bf26e7' /home/rodrigoisensee/MetricasDSPD-026/docs/reviews/026-lote3-operacionais.md` · espera: igual '2'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 diff --name-only 172d008a94f56ed791e74b9e7553cd9a92bf26e7 HEAD` · espera: igual 'docs/reviews/026-lote3-operacionais.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-026 ls-remote origin refs/heads/feature/026-lote3-operacionais` · espera: contém o sha40 de `git -C /home/rodrigoisensee/MetricasDSPD-026 rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-026 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Inclui o parecer, os achados bloqueantes e o sha do commit. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

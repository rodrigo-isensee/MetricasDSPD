Agente destino: forge:qa-engineer
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-spike-paginacao   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: qa   Cobre: E1.11

## Objetivo
QA do script de teste de paginação do /loggedTime, que o dono vai rodar com a chave dele (pedido 063, E1.11, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-spike-paginacao`, ponta 95e1dad2e1bbe11ab103106a26ad13e104f94906.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff b44602100416c953dc3ef6e6b496e0c381db2582 95e1dad2e1bbe11ab103106a26ad13e104f94906` (7 arquivos: script, entrada, módulo, reexport, package.json, teste e seção da ADR 0025).

## Entregar
- "E1.11 (qa-engineer): QA do script, sem chamar a API." (E1.11)
- (E1.11) QA da ponta 95e1dad2e1bbe11ab103106a26ad13e104f94906 com foco em: testes da entrega, casos de borda da saída (status de erro, envelope inesperado, id inválido), sem chamar a API; parecer em `docs/qa/063-spike-paginacao.md` gravado pela ferramenta Write, com `pedido: 063-worklog-cards-acima-do-teto`, `branch: feature/063-spike-paginacao`, `commit: 95e1dad2e1bbe11ab103106a26ad13e104f94906`, veredito e achados de até 300 caracteres cada (conferir antes do commit); `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/063-spike-paginacao` antes do commit, em chamada separada; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052h commit --only -m <mensagem com Cartão: K-200> -- docs/qa/063-spike-paginacao.md` (com `git -C /home/rodrigoisensee/MetricasDSPD-052h add -N docs/qa/063-spike-paginacao.md` antes, se o arquivo for novo); push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-spike-paginacao`; push recusado: `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin feature/063-spike-paginacao` antes de repetir o pull e o push; sem PR. Achado bloqueante vai ao parecer e ao relatório, sem corrigir o código.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards.
- ADR 0025 (citada no pedido): decide a coleta do worklog só por /loggedTime; ganhou a seção de como rodar o script
- ADR 0020 (citada no pedido): o plano propõe rever o R4-5; não muda nesta etapa
- 2026-11-03 10:02: recursos da máquina, mensagem do dono recebida às 2026-11-03 08:05 pelo assistente do app (também em KANBAN.md, linha 8): no máximo 2 tarefas pesadas por vez (suíte completa, e2e, build); até 3 worktrees testando; vitest e playwright com no máximo 6 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 10; nunca pkill amplo; com lentidão geral, voltar para 1 tarefa pesada.
- 2026-11-03 11:39: DECISÃO DO DONO "A" (quem roda o teste da D-2), resposta à PERGUNTA das 10:09. DECISÃO TÉCNICA (Jarvis): entram E1.9 (review), E1.10 (segurança) e E1.11 (QA) do script, em paralelo, antes de o dono rodar (E1.5); sem PR por ora (o script entra na develop junto com a E2.1 ou em PR próprio depois).
- 2026-11-03 11:42: DECISÃO TÉCNICA (Jarvis): sem brief de referência para a E1.6 (duas rodadas reprovadas só por forma do brief); a conferência da entrega das 10:37 já confirmou PQ-1, PQ-4, escopo, base e etapa no estado real, e o conteúdo vai aos portões E1.9 a E1.11 na ponta 95e1dad2e1bbe11ab103106a26ad13e104f94906. Marcada na D-2 a parte substituída pela decisão "A" de quem roda o teste.
- O agente não abre, lê nem edita arquivos `.env*` e não chama a API do BusinessMap.
- Os outros dois pareceres desta ponta (entre review, segurança e QA) são escritos em paralelo na mesma branch; commit só do próprio parecer.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- `pnpm run pronto` não roda no sandbox (trava em /tmp, cartão K-201); use `pnpm run pronto:interno`.
- Recursos da máquina (linha do Histórico do pedido acima, mensagem do dono das 08:05): no máximo 2 tarefas pesadas por vez na máquina (suíte completa, e2e, build); vitest e playwright com no máximo 6 workers; antes de tarefa pesada, conferir MemAvailable acima de 3000 MB e load abaixo de 10 (`cat /proc/loadavg`); nunca `pkill` amplo.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: código, testes, a ADR, o `CLAUDE.md`, os arquivos `.env*`, os outros pareceres, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e push só da documentação do discovery (plano do arquiteto e especificação do aviso)." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): rodar o script de spike de 1 GET /loggedTime (D-2), só forma e contagens; o node-backend escreve o script sem tocar no .env (E1.6) e o dono o roda." · etapa de outra delegação; continua no pedido
- "E1.6 (node-backend): script de spike que lê a chave do ambiente sem exibi-la e grava só a forma da resposta e as contagens." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da branch docs/063-worklog-teto, por outra instância." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR da branch docs/063-worklog-teto para a develop, depois do review." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): review da branch feature/063-spike-paginacao." · etapa de outra delegação; continua no pedido
- "E1.10 (security-engineer): parecer de segurança do script (chave no cabeçalho, allow-list da saída)." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas por período até caber no teto, se a E1.1 confirmar o filtro por card e data e o dono validar o plano (E1.3); com review, segurança e QA em etapas próprias, abertas depois do plano." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/063-spike-paginacao -- docs/qa/063-spike-paginacao.md` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/feature/063-spike-paginacao:docs/qa/063-spike-paginacao.md | grep -c '^commit: 95e1dad2e1bbe11ab103106a26ad13e104f94906'` · espera: igual '1'
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h && pnpm --filter @metricas-dspd/server exec vitest run --maxWorkers=6 tests/spike-paginacao-businessmap` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: docs/063-worklog-teto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: codigo   Cobre: E1.4

## Objetivo
Branch, commit e push só de documentação com o plano do arquiteto e a especificação do aviso do 063, para a develop (pedido 063, E1.4, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/063-worklog-teto` a criar a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/063-worklog-acima-do-teto.md` e `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/063-aviso-registro-incompleto.md` (sem commit na worktree); seção de commits de `/home/rodrigoisensee/MetricasDSPD-052d/docs/engineering/praticas.md`.

## Entregar
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e push só da documentação do discovery (plano do arquiteto e especificação do aviso)." (E1.4)
- (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c docs/063-worklog-teto b44602100416c953dc3ef6e6b496e0c381db2582` (os dois arquivos sem commit vão junto); um commit só com `docs/architecture/063-worklog-acima-do-teto.md` e `docs/ux/063-aviso-registro-incompleto.md`, com `Cartão: K-200` (sem mudar o texto dos documentos, salvo o que o `pnpm run docs:check` recusar, relatando a troca); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/063-worklog-teto`; sem PR e sem merge; mover cartão K-200 não é desta etapa.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora.
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards.
- ADR 0025 (citada no pedido): o plano propõe a revisão dela; a ADR não muda nesta etapa
- ADR 0020 (citada no pedido): o plano propõe rever o R4-5; a ADR não muda nesta etapa
- 2026-11-03 08:01: E1.3 cumprida: dono aceitou todas as recomendações do Jarvis ("faca trodas suas recomendacoes"). D-3 fica para confirmar com o dono na hora da retomada. Próximo: E1.5 (spike D-2) e E1.4 (commit e PR dos documentos do discovery); depois as etapas de entrega do aviso e da coleta por período.
- 2026-11-03 08:01: correção do Jarvis sobre a D-2: o sandbox não deixa nenhum agente ler os arquivos .env, então o agente não consegue fazer a chamada com a chave; a recomendação A vira: o node-backend escreve o script de spike (E1.6) e o dono o roda (E1.5), como na opção C. Avisado ao dono.
- 2026-11-03 09:57: prioridade do dono para finalizar as operacionais e o apontamento (registrado no 060). DECISÃO TÉCNICA (Jarvis): E1.6 na worktree /home/rodrigoisensee/MetricasDSPD-052h, branch feature/063-spike-paginacao a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582, no padrão do diagnóstico já existente (scripts/bm-diagnostico.sh e server/src/modulos/businessmap/diagnostico.ts): o script carrega o .env no processo do dono, a chave só no cabeçalho e nunca na saída; a saída é só contagens e metadados de paginação. E1.4 na worktree /home/rodrigoisensee/MetricasDSPD-052d.
- 2026-11-03 10:02: recursos da máquina, mensagem do dono recebida às 2026-11-03 08:05 pelo assistente do app (também em KANBAN.md, linha 8): no máximo 2 tarefas pesadas por vez (suíte completa, e2e, build); até 3 worktrees testando; vitest e playwright com no máximo 6 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 10; nunca pkill amplo; com lentidão geral, voltar para 1 tarefa pesada.
- 2026-11-03 10:07: DECISÃO TÉCNICA (Jarvis): a E1.4 vira só commit e push; entram a E1.7 (review) e a E1.8 (PR), porque o fluxo exige review aprovado antes do PR (conferente, rodada 3); docs/architecture e docs/ux não têm isenção de QA, então o QA documental entra como etapa própria antes do PR se o review não a dispensar.
- Recursos da máquina (linha do Histórico do pedido acima, mensagem do dono das 08:05): no máximo 2 tarefas pesadas por vez na máquina (suíte completa, e2e, build); vitest e playwright com no máximo 6 workers; antes de tarefa pesada, conferir MemAvailable acima de 3000 MB e load abaixo de 10 (`cat /proc/loadavg`); nunca `pkill` amplo.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: código, testes, ADRs, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): rodar o script de spike de 1 GET /loggedTime (D-2), só forma e contagens; o node-backend escreve o script sem tocar no .env (E1.6) e o dono o roda." · etapa de outra delegação; continua no pedido
- "E1.6 (node-backend): script de spike que lê a chave do ambiente sem exibi-la e grava só a forma da resposta e as contagens." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da branch docs/063-worklog-teto, por outra instância." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR da branch docs/063-worklog-teto para a develop, depois do review." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas por período até caber no teto, se a E1.1 confirmar o filtro por card e data e o dono validar o plano (E1.3); com review, segurança e QA em etapas próprias, abertas depois do plano." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/docs/063-worklog-teto` · espera: linhas=1
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin docs/063-worklog-teto` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only b44602100416c953dc3ef6e6b496e0c381db2582 origin/docs/063-worklog-teto | sort` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
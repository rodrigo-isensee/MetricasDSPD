Agente destino: forge:node-backend
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-spike-paginacao   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: codigo   Cobre: E1.6

## Objetivo
Script de teste de 1 chamada GET /loggedTime que o dono roda na máquina dele, para resolver se a API pagina acima de 1000 registros (pedido 063, E1.6, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-spike-paginacao` a criar a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/scripts/bm-diagnostico.sh` e `/home/rodrigoisensee/MetricasDSPD-052h/server/src/modulos/businessmap/diagnostico.ts` (padrão a seguir: só GET, caminho fechado, chave só no cabeçalho, allow-list na saída); `/home/rodrigoisensee/MetricasDSPD-052h/server/src/entradas/diagnostico-businessmap.ts`; seção (b) e a pergunta D-2 de `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/063-worklog-acima-do-teto.md`; `/home/rodrigoisensee/MetricasDSPD-052h/docs/architecture/adr/0025-coleta-do-worklog-businessmap.md` (Contexto).

## Entregar
- "E1.6 (node-backend): script de spike que lê a chave do ambiente sem exibi-la e grava só a forma da resposta e as contagens." (E1.6)
- (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052h switch -c feature/063-spike-paginacao b44602100416c953dc3ef6e6b496e0c381db2582`; script `scripts/bm-spike-paginacao.sh` (carrega o .env no processo de quem roda, como o bm-diagnostico.sh) e entrada TypeScript que recebe um id de card numérico por argumento, faz exatamente 1 GET em `/loggedTime` (`card_ids` = o id e `page=2`, como na pergunta D-2 do plano) e imprime só: o status HTTP, a quantidade de registros devolvidos, as chaves do envelope e os campos de paginação (números, como `all_pages`); nunca o conteúdo dos registros, nome, id de usuário, comentário, a chave nem a URL com parâmetros; script `bm:spike-paginacao` no package.json da raiz; testes unitários com fetch falso (allow-list da saída, recusa de id não numérico, chave fora da saída e dos erros); uma seção curta no fim da ADR 0025 dizendo como o dono roda o script e onde cola a saída; commit com `Cartão: K-200`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-spike-paginacao`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora.
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards.
- ADR 0025 (citada no pedido): decide a coleta do worklog só por /loggedTime e registra o spike E2.3 (sem paginação), que este script confere; ganha só a seção de como rodar
- ADR 0020 (citada no pedido): o plano propõe rever o R4-5; não muda nesta etapa
- 2026-11-03 08:01: correção do Jarvis sobre a D-2: o sandbox não deixa nenhum agente ler os arquivos .env, então o agente não consegue fazer a chamada com a chave; a recomendação A vira: o node-backend escreve o script de spike (E1.6) e o dono o roda (E1.5), como na opção C. Avisado ao dono.
- 2026-11-03 09:57: prioridade do dono para finalizar as operacionais e o apontamento (registrado no 060). DECISÃO TÉCNICA (Jarvis): E1.6 na worktree /home/rodrigoisensee/MetricasDSPD-052h, branch feature/063-spike-paginacao a partir da develop b44602100416c953dc3ef6e6b496e0c381db2582, no padrão do diagnóstico já existente (scripts/bm-diagnostico.sh e server/src/modulos/businessmap/diagnostico.ts): o script carrega o .env no processo do dono, a chave só no cabeçalho e nunca na saída; a saída é só contagens e metadados de paginação. E1.4 na worktree /home/rodrigoisensee/MetricasDSPD-052d.
- 2026-11-03 10:02: recursos da máquina, mensagem do dono recebida às 2026-11-03 08:05 pelo assistente do app (também em KANBAN.md, linha 8): no máximo 2 tarefas pesadas por vez (suíte completa, e2e, build); até 3 worktrees testando; vitest e playwright com no máximo 6 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 10; nunca pkill amplo; com lentidão geral, voltar para 1 tarefa pesada.
- 2026-11-03 10:36: E1.6 entregue pelo node-backend: commit 95e1dad na feature/063-spike-paginacao (enviada, sem PR); 1 GET /loggedTime com page=2, saída só com status, contagem, chaves e paginação; 22 testes. PQ-2 não cumprido por erro do brief (o filtro src/modulos/businessmap não casa testes, que ficam em server/tests; o teste da entrega passou); PQ-3 não rodou no sandbox (trava em /tmp; pronto:interno rc=0). Conferente modo entrega disparado. MELHORIA vista: trava da suite-unica em /tmp, vira K-201.
- O agente não abre, lê, imprime nem edita arquivos `.env*` e não chama a API do BusinessMap: quem roda o script é o dono (E1.5). Nada é escrito no BusinessMap; só GET.
- Recursos da máquina (linha do Histórico do pedido acima, mensagem do dono das 08:05): no máximo 2 tarefas pesadas por vez na máquina (suíte completa, e2e, build); vitest e playwright com no máximo 6 workers; antes de tarefa pesada, conferir MemAvailable acima de 3000 MB e load abaixo de 10 (`cat /proc/loadavg`); nunca `pkill` amplo.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: a coleta e o código de produção do apontamento, os outros scripts, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e push só da documentação do discovery (plano do arquiteto e especificação do aviso)." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): rodar o script de spike de 1 GET /loggedTime (D-2), só forma e contagens; o node-backend escreve o script sem tocar no .env (E1.6) e o dono o roda." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): review da branch docs/063-worklog-teto, por outra instância." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR da branch docs/063-worklog-teto para a develop, depois do review." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): review da branch feature/063-spike-paginacao." · etapa de outra delegação; continua no pedido
- "E1.10 (security-engineer): parecer de segurança do script (chave no cabeçalho, allow-list da saída)." · etapa de outra delegação; continua no pedido
- "E1.11 (qa-engineer): QA do script, sem chamar a API." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas por período até caber no teto, se a E1.1 confirmar o filtro por card e data e o dono validar o plano (E1.3); com review, segurança e QA em etapas próprias, abertas depois do plano." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido, inclusive rodar o script (E1.5, do dono).

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin feature/063-spike-paginacao` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h && pnpm --filter @metricas-dspd/server exec vitest run --maxWorkers=6 tests/spike-paginacao-businessmap` · espera: rc=0
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h && pnpm run pronto` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show --stat --format= HEAD | grep -c 'bm-spike-paginacao.sh'` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
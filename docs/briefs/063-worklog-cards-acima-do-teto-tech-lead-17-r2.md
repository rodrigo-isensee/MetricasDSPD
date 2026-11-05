Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-worklog-paginas   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: merge-integracao   Cobre: E2.17

## Objetivo
Limpeza autorizada pelo dono: apagar todas as branches que já estão na develop, no origin e na máquina, e as worktrees delas (pedido 063, E2.17, K-200). Rode os comandos a partir de `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD fetch --prune origin`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -a`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list`; `gh pr list --repo rodrigo-isensee/MetricasDSPD --state merged --limit 200 --json number,headRefName,headRefOid,baseRefName`.

## Entregar
- "E2.17 (tech-lead): limpeza de todas as branches que já estão na develop (origin e local) e das worktrees delas, inclusive feature/063-worklog-paginas e a worktree 052g." (E2.17)
- (E2.17) montar a lista de candidatas (locais e remotas) e, para cada uma, aplicar o critério da DECISÃO TÉCNICA do Histórico: head contido em origin/develop (`git merge-base --is-ancestor`), ou head local e remoto iguais ao headRefOid de um PR mesclado na develop ou contidos nele (caso das branches trazidas para um lote, como feature/063-worklog-paginas, contida em 3b42ac9 do PR 209); para as que passam: remover a worktree se existir e estiver limpa (`git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree remove <pasta>`), `git -C /home/rodrigoisensee/Metricas/MetricasDSPD push origin --delete <branch>` se existir no origin, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -D <branch>` se existir local; no fim `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree prune`. A branch que não passa (commit a mais, sem PR mesclado, worktree suja ou HEAD destacado) fica, e vai ao relatório com o motivo. Relatório com a tabela: branch, critério, o que foi apagado.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): não muda nesta etapa
- ADR 0015 (citada no pedido): não muda nesta etapa
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): não muda nesta etapa
- 2026-11-04 04:19: DECISÃO DO DONO (literal: "Pode limpar", em resposta à oferta de limpar a branch do back feature/063-worklog-paginas e a worktree 052g): o time apaga essa branch (origin e local) e a worktree. A branch do spike (feature/063-spike-paginacao) foi só citada na oferta e não entra: tem commits fora da develop. Conferido pelo Jarvis: worktree 052g limpa; head local e remoto 3c3740d801560129a899e8540128f513143b083c, contido em 3b42ac9 (headRefOid do PR 209, mesclado). DECISÃO TÉCNICA (Jarvis): E2.17 com o tech-lead.
- 2026-11-04 04:20: DECISÃO DO DONO (literal: "Pode excluir todas as branchs que já estão na develop"): o time apaga, no origin e na máquina, toda branch cujo conteúdo já está na develop, e remove as worktrees delas. DECISÃO TÉCNICA (Jarvis): critério de "já está na develop": head contido em origin/develop, ou PR mesclado na develop (ou numa branch já contida nela) com headRefOid igual ao head local e ao remoto; branch sem esse critério, com commit a mais ou worktree suja fica e vai à lista do relatório; nunca develop, homolog, main nem docs/jarvis-2026-10-23 (commits locais sem push, decisão do dono).
- Nunca apagar `develop`, `homolog`, `main` nem `docs/jarvis-2026-10-23` (commits locais sem push); nunca a worktree principal `/home/rodrigoisensee/Metricas/MetricasDSPD`.
- Recusa de hook, do sandbox ou do classificador: pare naquela branch, relate a mensagem literal e siga com as outras, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force` (nem `worktree remove --force`).
- NÃO tocar: branches fora do critério, código, pareceres, o `CLAUDE.md`, os arquivos `.env*`, o PR 211 e a `main`.

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
- "E1.11 (qa-engineer): QA do script, sem chamar a API." · etapa de outra delegação; continua no pedido
- "E1.12 (software-architect): revisar o plano da coleta e a ADR 0025 com o resultado do spike (a API pagina: 200 por página), na branch docs/063-worklog-teto, antes da E2.1." · etapa de outra delegação; continua no pedido
- "E1.13 (qa-engineer): QA documental da branch docs/063-worklog-teto antes do PR." · etapa de outra delegação; continua no pedido
- "E1.14 (ux-designer): corrigir o A1 do review da branch de docs (Q-1 da especificação sem a coleta por período), sem commit; o tech-lead commita." · etapa de outra delegação; continua no pedido
- "E1.15 (software-architect): corrigir o A2 do review da branch de docs (plano registrando a semeadura no coletor), sem commit; o tech-lead commita." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review do lote do 063 (coleta, sinal na API e aviso na aba)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." · etapa de outra delegação; continua no pedido
- "E2.10 (ux-designer): na especificação da branch de docs do 063, o CA-4 passa a dizer que a dica abre ao ativar o selo (achado A3 do review e médio 1 da revisão de interface)." · etapa de outra delegação; continua no pedido
- "E2.11 (tech-lead): trazer a develop atual (com o 060 do web, PR 208, e o PR 203) para a branch do lote por merge commit, resolvendo conflito sem mudar comportamento, e enviar." · etapa de outra delegação; continua no pedido
- "E2.12 (tech-lead): review regravado na ponta depois da E2.11 (delta com o E2E do QA e o merge da develop)." · etapa de outra delegação; continua no pedido
- "E2.13 (security-engineer): parecer de segurança regravado na ponta depois da E2.11." · etapa de outra delegação; continua no pedido
- "E2.14 (qa-engineer): parecer de QA regravado na ponta depois da E2.11, com o E2E rodado de novo." · etapa de outra delegação; continua no pedido
- "E2.15 (tech-lead): abrir o PR de release da homolog para a main com o 063 e o 060, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- "E2.16 (tech-lead): limpeza depois do merge do lote: apagar a branch feature/063-aviso-incompleto no origin e local e remover a worktree 052h." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD ls-remote origin feature/063-worklog-paginas` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch --list develop homolog main docs/jarvis-2026-10-23` · espera: linhas>=3

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
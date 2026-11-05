Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: 4e755edd1a00aa2d934899b4deb7c944435f54f8
Etapa: merge-integracao   Cobre: E2.16

## Objetivo
Limpeza depois do merge do lote do 063, autorizada pelo dono: apagar a branch `feature/063-aviso-incompleto` no origin e local e remover a worktree `/home/rodrigoisensee/MetricasDSPD-052h` (pedido 063, E2.16, K-200). Rode os comandos a partir de `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `gh pr view 209 --repo rodrigo-isensee/MetricasDSPD --json state,headRefOid`; `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short`; `git -C /home/rodrigoisensee/MetricasDSPD-052h rev-parse HEAD`; `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin feature/063-aviso-incompleto`.

## Entregar
- "E2.16 (tech-lead): limpeza depois do merge do lote: apagar a branch feature/063-aviso-incompleto no origin e local e remover a worktree 052h." (E2.16)
- (E2.16) conferir que o PR 209 está MERGED e que o head remoto e o local da branch são iguais ao headRefOid dele (3b42ac9e1b055b3db12b3fa34fcf4b475ff8f203) e que a worktree está limpa; se algo diferir (commit a mais, arquivo sem commit), pare e relate sem apagar; então `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin --delete feature/063-aviso-incompleto`, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree remove /home/rodrigoisensee/MetricasDSPD-052h`, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch -D feature/063-aviso-incompleto` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree prune`.

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
- 2026-11-04 02:59: E2.8 cumprida pelo tech-lead: PR 209 mesclado por squash na develop em 1f1da67 (CI verde, linha teto 1154 linhas); PR 210 develop para homolog mesclado por merge commit (92c58922fe23852a7504b85f1e496f25e7e02f85, leva o 060 do web); portão da homolog em andamento. A remoção da branch feature/063-aviso-incompleto foi negada pelo classificador ao tech-lead (head igual ao headRefOid do PR, 3b42ac9): fica como ação do dono. Conferente: conferência única do lote não cumpriu só por texto do parecer de QA (diz que o E2E não mudou depois de 27bae58, mas o playwright.config.ts mudou no merge; os números da seção Execução são de 675ed96); PQ, escopo, etapa e base ok. DECISÃO TÉCNICA (Jarvis): o texto do parecer de QA vira escape registrado e é corrigido no PR da branch de docs do 063 (E1.8), sem reabrir o lote já mesclado.
- Só esta branch e esta worktree; nunca `develop`, `homolog`, `main`, a `docs/063-worklog-teto` nem a worktree 052d.
- Recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: outras branches e worktrees, código, pareceres, o `CLAUDE.md`, os arquivos `.env*`, o PR 211 e a `main`.

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
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD ls-remote origin feature/063-aviso-incompleto` · espera: linhas=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD worktree list` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD branch --list feature/063-aviso-incompleto` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
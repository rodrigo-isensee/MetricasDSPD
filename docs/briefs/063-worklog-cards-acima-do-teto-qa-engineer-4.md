Agente destino: forge:qa-engineer
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: docs/063-worklog-teto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: qa   Cobre: E1.13

## Objetivo
QA documental da branch de docs do 063 antes do PR (pedido 063, E1.13, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/063-worklog-teto`, ponta ded2bf0.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...origin/docs/063-worklog-teto --stat` e os documentos: `docs/architecture/063-worklog-acima-do-teto.md`, `docs/architecture/adr/0025-coleta-do-worklog-businessmap.md`, `docs/ux/063-aviso-registro-incompleto.md`; o review `docs/reviews/063-docs-worklog-teto.md`; na develop, o código do lote (`server/src/modulos/businessmap/apontamento/`, `web/src/features/apontamento/`) para conferir que o texto bate com o que foi entregue.

## Entregar
- "E1.13 (qa-engineer): QA documental da branch docs/063-worklog-teto antes do PR." (E1.13)
- (E1.13) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin docs/063-worklog-teto`; conferir que o plano, a ADR 0025 e a especificação batem com o código já na develop (leitura de todas as páginas, page na lista fechada, migração 0034, semeadura no coletor, sinal registroIncompleto, aviso nos 3 lugares, dica ao ativar o selo); `pnpm run docs:check` se rodar no sandbox; parecer `docs/qa/063-docs-worklog-teto.md` pela ferramenta Write com veredito, `commit:` = a ponta da branch e bloco `## Achados` (até 300 caracteres cada); commit só do parecer com `Cartão: K-200`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/063-worklog-teto`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas
- ADR 0015 (citada no pedido): não muda nesta etapa
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): não muda nesta etapa
- 2026-11-04 01:53: E1.7 volta cumprida pelo tech-lead: commits a8d62bd (especificação) e 63db837 (plano); parecer da branch de docs aprovado em ded2bf0dbf099a5782f9478bb195c08c4adc6281 (commit: 63db837), A1 e A2 resolvidos; forge-check docs dá 16 linhas, nenhuma do 063. Conferente: entrega do QA (qa-engineer-2) não cumpriu por etapa: o E2E novo (a4c9bba) entrou depois do commit que o review cita; forge-check pr marca review, segurança e QA como desatualizados e sem autoria; a develop andou (4e755ed: PR 208 do 060 web e PR 203) e não está na branch do lote. DECISÃO TÉCNICA (Jarvis): E2.11, o tech-lead traz a develop para o lote; depois E2.12 a E2.14, os três pareceres regravados por cada papel na ponta nova, em paralelo; aí o PR (E2.8). Melhoria: o brief do QA deve dizer que teste novo do QA entra antes do review ou pede review do delta.
- 2026-11-04 02:59: E2.8 cumprida pelo tech-lead: PR 209 mesclado por squash na develop em 1f1da67 (CI verde, linha teto 1154 linhas); PR 210 develop para homolog mesclado por merge commit (92c58922fe23852a7504b85f1e496f25e7e02f85, leva o 060 do web); portão da homolog em andamento. A remoção da branch feature/063-aviso-incompleto foi negada pelo classificador ao tech-lead (head igual ao headRefOid do PR, 3b42ac9): fica como ação do dono. Conferente: conferência única do lote não cumpriu só por texto do parecer de QA (diz que o E2E não mudou depois de 27bae58, mas o playwright.config.ts mudou no merge; os números da seção Execução são de 675ed96); PQ, escopo, etapa e base ok. DECISÃO TÉCNICA (Jarvis): o texto do parecer de QA vira escape registrado e é corrigido no PR da branch de docs do 063 (E1.8), sem reabrir o lote já mesclado.
- O agente não abre, lê nem edita arquivos `.env*`.
- Achado no texto vai ao parecer, sem corrigir o documento.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, os documentos revisados, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

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
- "E2.17 (tech-lead): limpeza de todas as branches que já estão na develop (origin e local) e das worktrees delas, inclusive feature/063-worklog-paginas e a worktree 052g." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/docs/063-worklog-teto -- docs/qa/063-docs-worklog-teto.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
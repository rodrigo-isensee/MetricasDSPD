Agente destino: forge:security-engineer
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: seguranca   Cobre: E2.5

## Objetivo
Parecer de segurança do lote do 063 (coleta lendo todas as páginas, sinal na API e aviso na aba), ponta 675ed965bfddb152f22b6a797c1deb4ff756c922 (pedido 063, E2.5, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-aviso-incompleto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff b44602100416c953dc3ef6e6b496e0c381db2582 675ed965bfddb152f22b6a797c1deb4ff756c922 --stat` e os diffs de `server/` e `web/`; o review `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/063-aviso-incompleto.md`.

## Entregar
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." (E2.5)
- (E2.5) Revisão estática: page na lista fechada CONSULTA_WORKLOG (ADR 0015) e o limite do valor; nenhum campo de pessoa ou texto livre novo atravessa a fronteira; migração 0034 append-only e GRANT por coluna sem pessoa; contrato registroIncompleto sem pessoa, sem horas e sem SQL montado com valor da requisição; o aviso não expõe dado individual. Parecer `docs/security/063-aviso-incompleto.md` com veredito, `commit: 675ed965bfddb152f22b6a797c1deb4ff756c922` e bloco `## Achados`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-aviso-incompleto`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas
- ADR 0015 (citada no pedido): lista fechada: ganha só page em CONSULTA_WORKLOG
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): migrações sem INSERT; a semeadura ficou no coletor
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 21:55: E2.7 cumprida pelo ux-designer: aprovado com ressalvas, sem crítico nem alto (parecer sem commit na 052h); médio 1 CA-4 (Dica não abre por foco simples; recomenda ajustar o CA-4 para ao ativar o selo e corrigir o comentário do Dica); médio 2 CA-9 (375 px sem prova de layout, o QA confere no navegador); selo em lista abaixo do gráfico aceito. DECISÃO TÉCNICA (Jarvis): E2.4 com o tech-lead: commit do parecer de interface e review do lote na ponta seguinte; segurança e QA citam essa ponta.
- 2026-11-04 01:21: E2.4 volta 1 cumprida pelo tech-lead: review do delta aprovado em 675ed965bfddb152f22b6a797c1deb4ff756c922 (commit: 46933d4); A1 resolvido; A2 em menor ou igual: o tech-lead concorda com a DECISÃO TÉCNICA (retomada da carga em outro dia recalcula o início a partir de hoje); A3 e A4 resolvidos. Conferente: entrega do react-frontend (react-frontend-5) não cumpriu só por escopo do intervalo (o server de 48de420 sem conferida própria). DECISÃO TÉCNICA (Jarvis): reconferir a entrega do node-backend (node-backend-7) com a DECISÃO TÉCNICA do A2 e o review aprovado; com a conferida dela, reconferir a do react-frontend e a do review, nessa ordem.
- O GitHub precisa de `github.com` em `allowed_domains`; comando barrado por hook, sandbox ou classificador: pare e relate a mensagem literal, sem tentar outro comando no mesmo alvo. R-VERIFY: nunca `--no-verify` nem `--force`.
- O agente nunca abre nem lê arquivos `.env*` e não chama a API do BusinessMap.
- O parecer é gravado pela ferramenta Write; frase de regra só pelo ID; cada achado com até 300 caracteres contando o `- ` inicial; `pedido: 063-worklog-cards-acima-do-teto` e `branch: feature/063-aviso-incompleto`.
- Outro parecer pode ser gravado em paralelo na mesma branch: pull antes do commit, em chamada separada; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052h add -N <parecer>` e depois `git -C /home/rodrigoisensee/MetricasDSPD-052h commit --only -m <mensagem com Cartão: K-200> -- <parecer>`; push recusado por estar atrás: repita o pull e o push.
- Não rodar `pronto` nem testes pesados (o dono roda test:pg e pronto); nunca `pkill` amplo.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

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
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review do lote do 063 (coleta, sinal na API e aviso na aba)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." · etapa de outra delegação; continua no pedido
- "E2.10 (ux-designer): na especificação da branch de docs do 063, o CA-4 passa a dizer que a dica abre ao ativar o selo (achado A3 do review e médio 1 da revisão de interface)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/063-aviso-incompleto -- docs/security/063-aviso-incompleto.md` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h grep -c 'commit: 675ed965bfddb152f22b6a797c1deb4ff756c922' origin/feature/063-aviso-incompleto -- docs/security/063-aviso-incompleto.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
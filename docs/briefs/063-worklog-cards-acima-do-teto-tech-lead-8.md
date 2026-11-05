Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: review   Cobre: E2.4

## Objetivo
Code review do lote do 063 (coleta lendo todas as páginas, sinal de incompleto na API e aviso na aba), depois de commitar o parecer de interface (pedido 063, E2.4, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-aviso-incompleto`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff b44602100416c953dc3ef6e6b496e0c381db2582 origin/feature/063-aviso-incompleto --stat` e os diffs; `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/063-worklog-acima-do-teto.md` (C1-R, C2, C3-R); o parecer de interface `/home/rodrigoisensee/MetricasDSPD-052h/docs/ux/063-revisao-aviso-incompleto.md` (sem commit).

## Entregar
- "E2.4 (tech-lead): review do lote do 063 (coleta, sinal na API e aviso na aba)." (E2.4)
- (E2.4) `git -C /home/rodrigoisensee/MetricasDSPD-052h pull --ff-only origin feature/063-aviso-incompleto`; commit só de `docs/ux/063-revisao-aviso-incompleto.md` com `git -C /home/rodrigoisensee/MetricasDSPD-052h commit --only -m <mensagem com Cartão: K-200> -- docs/ux/063-revisao-aviso-incompleto.md` (com `git -C /home/rodrigoisensee/MetricasDSPD-052h add -N docs/ux/063-revisao-aviso-incompleto.md` antes); push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-aviso-incompleto`; anote o sha dessa ponta (`git -C /home/rodrigoisensee/MetricasDSPD-052h rev-parse HEAD`); review do lote nessa ponta: paginação e completude, instabilidade de all_pages sem exclusão, falha de página, page na lista fechada, migração 0034 append-only e GRANT por coluna, contrato registroIncompleto sem pessoa nem horas, aviso nos 3 lugares; avaliar os 3 desvios que o node-backend declarou (semeadura no coletor, teto de páginas, ctl_ no GRANT) e o comentário do Dica (médio 1 do UX); vitest do server e do web com no máximo 2 workers; parecer em `docs/reviews/063-aviso-incompleto.md` pela ferramenta Write com `commit:` = o sha anotado, veredito e achados de até 300 caracteres cada; commit só do parecer; push; sem PR. Achado bloqueante vai ao parecer e ao relatório, sem corrigir o código.

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
- 2026-11-03 20:59: E2.1 entregue pelo node-backend: feature/063-worklog-paginas em 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7 (base b446021), sem PR. Coleta lê page=1..all_pages; all_pages instável = consulta incompleta sem exclusão; falha de página não marca o card; page na lista fechada; migração 0034 bm.ctl_apontamento_cobertura (append-only) com GRANT por coluna; GET /api/apontamento ganhou registroIncompleto {{ total, cards: [{{ cardId, titulo, projeto: {{ id, rotulo, foraDoEscopo }} }}], projetoIds }} (aditivo, sem horas nem pessoa), documentado em docs/api/apontamento.md. Server unit 1610 testes; test:pg NÃO rodou (sandbox bloqueia o Postgres local) e as consultas novas só têm banco falso. Desvios para o review: semeadura dos 5 cards no coletor, não em migração (ADR 0014); teto de páginas não vale para o worklog; ctl_ no GRANT do dspd_api por prefixo. DECISÃO TÉCNICA (Jarvis): E2.3 (front) começa já sobre o contrato; o test:pg e o pronto da branch do back ficam com o dono, fora do sandbox; review e segurança do back em seguida.
- 2026-11-03 21:33: volta 1 da E2.1 entregue pelo node-backend: 3c3740d801560129a899e8540128f513143b083c; ctl_apontamento_cobertura entrou na lista append-only do teste de catálogo (sem afrouxar; migração 0034 igual); 2 testes novos cobrem o que faltava; server unit 1612 com cobertura 100% nas quatro métricas. PQ-3 do brief com texto literal frágil (saída com prefixo da ref; contagem 1). Próximo: o dono roda test:pg e pronto na 052g em 3c3740d.
- 2026-11-03 21:55: E2.7 cumprida pelo ux-designer: aprovado com ressalvas, sem crítico nem alto (parecer sem commit na 052h); médio 1 CA-4 (Dica não abre por foco simples; recomenda ajustar o CA-4 para ao ativar o selo e corrigir o comentário do Dica); médio 2 CA-9 (375 px sem prova de layout, o QA confere no navegador); selo em lista abaixo do gráfico aceito. DECISÃO TÉCNICA (Jarvis): E2.4 com o tech-lead: commit do parecer de interface e review do lote na ponta seguinte; segurança e QA citam essa ponta.
- O agente não abre, lê nem edita arquivos `.env*`.
- Nesta rodada só você roda teste (vitest do server e do web, no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes); o QA vem depois. test:pg e pronto da ponta 3c3740d do back já deram rc=0 com o dono (Histórico).
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: código, testes, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

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
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/063-aviso-incompleto -- docs/reviews/063-aviso-incompleto.md` · espera: linhas=1
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052h log --format=%H -1 origin/feature/063-aviso-incompleto -- docs/ux/063-revisao-aviso-incompleto.md` · espera: linhas=1
- PQ-3 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h/web && pnpm exec vitest run --maxWorkers=2` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
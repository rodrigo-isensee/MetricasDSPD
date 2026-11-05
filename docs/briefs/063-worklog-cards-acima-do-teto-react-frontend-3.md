Agente destino: forge:react-frontend
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: feature/063-aviso-incompleto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: codigo   Cobre: E2.3

## Objetivo
Aviso de registro de horas incompleto na aba do apontamento, a partir do contrato registroIncompleto da E2.1 (pedido 063, E2.3, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `feature/063-aviso-incompleto` a criar a partir de 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7 (a branch do back, para ter o contrato).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/063-aviso-registro-incompleto.md` (os 3 lugares, textos, tela estreita, acessibilidade e os 12 critérios); `git -C /home/rodrigoisensee/MetricasDSPD-052h show 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7:docs/api/apontamento.md` (seção registroIncompleto) e `778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7:packages/contratos/src/apontamento.ts`; `/home/rodrigoisensee/MetricasDSPD-052h/web/src/features/apontamento/`.

## Entregar
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." (E2.3)
- (E2.3) `git -C /home/rodrigoisensee/MetricasDSPD-052h switch -c feature/063-aviso-incompleto 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7`; faixa-resumo no topo da aba com a lista dos cards incompletos do recorte (título do card, sem pessoa nem horas), selo no projeto e nota no cartão de indicadores, com o texto da especificação, decidido na Q-1 (sem prazo); o aviso aparece só quando o card incompleto entra no recorte filtrado e some quando `registroIncompleto.total` é 0, por qualquer caminho (onde a especificação fala em a coleta por período completar o card, vale a leitura de todas as páginas da D-5; o período é só contingência); tela estreita e acessibilidade (não depende só de cor); testes do web; vitest com no máximo 2 workers; commits com `Cartão: K-200`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/feature/063-aviso-incompleto`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas; o aviso mostra o card ainda incompleto
- ADR 0015 (citada no pedido): lista fechada de consultas ao BusinessMap; não muda no front
- ADR 0020 (citada no pedido): o plano propõe rever o R4-5; não muda nesta etapa
- ADR 0014 (citada no pedido): migrações sem INSERT; não muda no front
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 20:59: E2.1 entregue pelo node-backend: feature/063-worklog-paginas em 778ff0a65ae3d7b3444dd83c8b65e7df5b6adbe7 (base b446021), sem PR. Coleta lê page=1..all_pages; all_pages instável = consulta incompleta sem exclusão; falha de página não marca o card; page na lista fechada; migração 0034 bm.ctl_apontamento_cobertura (append-only) com GRANT por coluna; GET /api/apontamento ganhou registroIncompleto {{ total, cards: [{{ cardId, titulo, projeto: {{ id, rotulo, foraDoEscopo }} }}], projetoIds }} (aditivo, sem horas nem pessoa), documentado em docs/api/apontamento.md. Server unit 1610 testes; test:pg NÃO rodou (sandbox bloqueia o Postgres local) e as consultas novas só têm banco falso. Desvios para o review: semeadura dos 5 cards no coletor, não em migração (ADR 0014); teto de páginas não vale para o worklog; ctl_ no GRANT do dspd_api por prefixo. DECISÃO TÉCNICA (Jarvis): E2.3 (front) começa já sobre o contrato; o test:pg e o pronto da branch do back ficam com o dono, fora do sandbox; review e segurança do back em seguida.
- A branch nasce de 778ff0a (branch do back, feature/063-worklog-paginas, ainda fora da develop) para ter o contrato; os arquivos de server/, packages/ e docs/ que vêm de b446021..778ff0a são da E2.1 e não desta etapa; o escopo desta entrega é o diff 778ff0a..ponta, só em web/; o PR desta branch entra depois do PR do back.
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: nenhuma métrica para avaliação individual (o aviso não mostra pessoa nem horas); nada estimado.
- Recursos: no máximo 1 tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes (`cat /proc/loadavg`); `pnpm run pronto` não roda no sandbox (K-201).
- O GitHub precisa de `github.com` em `allowed_domains`; recusa de hook, do sandbox ou do classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `server/`, `packages/`, a especificação do UX, o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

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
- "E2.4 (tech-lead): review da branch do back (E2.1)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052h ls-remote origin feature/063-aviso-incompleto` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052h/web && pnpm exec vitest run --maxWorkers=2` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h grep -q 'registroIncompleto' origin/feature/063-aviso-incompleto -- web/src/features/apontamento` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
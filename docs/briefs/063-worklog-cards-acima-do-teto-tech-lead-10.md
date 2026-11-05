Agente destino: forge:tech-lead
Pedido: 063-worklog-cards-acima-do-teto
Tipo: codigo
Branch: docs/063-worklog-teto   Base: develop   Base-sha: b44602100416c953dc3ef6e6b496e0c381db2582
Etapa: review   Cobre: E1.7

## Objetivo
Commitar as revisões pendentes da documentação do 063 e revisar a branch de docs (pedido 063, E1.7, K-200). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `docs/063-worklog-teto`, ponta 2d42d95.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` e `git -C /home/rodrigoisensee/MetricasDSPD-052d diff` (3 arquivos sem commit: `docs/architecture/063-worklog-acima-do-teto.md`, `docs/architecture/adr/0025-coleta-do-worklog-businessmap.md` do arquiteto; `docs/ux/063-aviso-registro-incompleto.md` do UX); `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...HEAD`.

## Entregar
- "E1.7 (tech-lead): review da branch docs/063-worklog-teto, por outra instância." (E1.7)
- (E1.7) `git -C /home/rodrigoisensee/MetricasDSPD-052d switch docs/063-worklog-teto` se preciso; commit 1, só plano e ADR: `git -C /home/rodrigoisensee/MetricasDSPD-052d commit --only -m <docs(arquitetura): revisão do plano e da ADR 0025 com a paginação, com Cartão: K-200> -- docs/architecture/063-worklog-acima-do-teto.md docs/architecture/adr/0025-coleta-do-worklog-businessmap.md`; commit 2, só a especificação: `git -C /home/rodrigoisensee/MetricasDSPD-052d commit --only -m <docs(ux): dica do selo abre ao ativar, com Cartão: K-200> -- docs/ux/063-aviso-registro-incompleto.md`; anote a ponta (`git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse HEAD`); review da branch nessa ponta: o plano e a ADR 0025 batem com a D-5 (ler todas as páginas; período só como contingência) e com o que o lote implementou (page na lista fechada, migração 0034, sinal registroIncompleto); a especificação bate com o aviso (3 lugares, dica ao ativar o selo); `forge-check docs`; parecer em `docs/reviews/063-docs-worklog-teto.md` pela ferramenta Write com `commit:` = a ponta anotada, veredito e achados de até 300 caracteres cada; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/docs/063-worklog-teto`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-03): "A" (D-5, como buscar o restante dos 5 cards): a coleta lê todas as páginas de cada consulta do /loggedTime (page=1 até all_pages), e o card só conta como completo com todas as páginas certas; a divisão por período fica só como contingência; o resto da decisão "B" continua (aviso de incompleto até completar, sem estimar horas).
- DECISÃO DO DONO (2026-11-03): "A" (quem roda o teste da D-2): o node-backend escreve o script de 1 GET /loggedTime e o dono o roda na máquina dele (E1.5), depois do review e da segurança do script; substitui, na D-2, "o node-backend faz 1 chamada", que o sandbox impede.
- DECISÃO DO DONO (2026-11-03): "faca trodas suas recomendacoes" (E1.3, validação do discovery): D-2 = A, o node-backend faz 1 chamada GET /loggedTime de teste com a chave do .env lida sem exibir o valor, guardando só a forma e as contagens ao lado da ADR 0025; D-1 = o aviso aparece quando o card incompleto entra no recorte filtrado da aba; Q-1 = manter "Estamos buscando o restante", sem prazo; Q-2 = mostrar o título do card do BusinessMap na lista, como a aba já mostra; Q-3 = os três lugares do aviso (faixa no topo, selo no projeto, nota no cartão de indicadores); D-3 = rodar a retomada manual da carga depois da E2.1, pelo dono, confirmada na hora. [Nota do Jarvis: a parte "o node-backend faz 1 chamada" da D-2 foi substituída pela DECISÃO DO DONO "A" (quem roda o teste da D-2) de 2026-11-03.]
- DECISÃO DO DONO (2026-11-03): "Isso" (recibo do 063): o software-architect faz o discovery (API do BusinessMap aceita consultar um card por faixa de datas, só GET; como a coleta marca o card no teto; plano e revisão da ADR 0025 se precisar) e o ux-designer define o texto e o lugar do aviso de registro de horas incompleto, em paralelo; o dono valida antes de qualquer código; não estimar horas, não escrever no BusinessMap, nenhuma métrica por pessoa.
- DECISÃO DO DONO (2026-11-03): "B" (os 5 cards com registro de horas incompleto): pedido novo para buscar o restante; o arquiteto avalia se a API deixa consultar um único card por faixa de datas e, se deixar, a coleta divide por período até caber nas 1000; enquanto isso, entra o aviso de registro de horas incompleto nesses cards. [Nota do Jarvis: a divisão por período desta decisão foi substituída pela DECISÃO DO DONO "A" (D-5) de 2026-11-03; fica só como contingência.]
- ADR 0025 (citada no pedido): proposta revista: coleta lendo todas as páginas; revisar se o texto bate com a D-5
- ADR 0015 (citada no pedido): lista fechada: ganha só page em CONSULTA_WORKLOG
- ADR 0020 (citada no pedido): não muda nesta etapa
- ADR 0014 (citada no pedido): migrações sem INSERT
- 2026-11-03 13:48: recursos da máquina, mensagem do dono pelo assistente do app (PC pesado, "REDUZA JA"); substitui a de 08:05 até o dono avisar: núcleos 0-5, nice 15, até ~6 GB; no máximo 1 tarefa pesada por vez, 1 worktree testando, vitest e playwright com no máximo 2 workers; antes de tarefa pesada, MemAvailable acima de 3000 MB e load abaixo de 4; nada em andamento é encerrado.
- 2026-11-03 19:46: DECISÃO DO DONO "A" na D-5 (ler todas as páginas), resposta à PERGUNTA das 16:11. Texto da E2.1 ajustado à D-5. Próximo: leitura do security-engineer sobre aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015), que a ADR 0025 revista cita; review da branch docs/063-worklog-teto (E1.7) com o plano revisto; depois as etapas de entrega do aviso e da E2.1.
- 2026-11-04 01:35: E2.10 cumprida pelo ux-designer, sem commit na 052d: CA-4 (linha 100) e linha 60 da especificação dizem que a dica abre ao ativar o selo e fecha com Esc; nenhuma linha diz que abre por foco. DECISÃO TÉCNICA (Jarvis): o tech-lead commita na branch de docs a revisão do plano e da ADR 0025 (arquiteto) e a especificação (UX), em commits separados, e revisa a branch (E1.7); o PR (E1.8) vem depois.
- O agente não abre, lê nem edita arquivos `.env*`.
- Achado no texto do plano, da ADR ou da especificação vai ao parecer e ao relatório, sem corrigir o documento (o autor corrige numa volta).
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Comando barrado por hook, sandbox ou classificador: pare e relate a mensagem literal; não tente outro comando no mesmo alvo. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, o conteúdo dos três documentos (só commitar), o `CLAUDE.md`, os arquivos `.env*`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): discovery: como a coleta marca o card que parou no teto e como a API mostra isso; se a API do BusinessMap aceita consultar um card por faixa de datas (só leitura, só GET); plano do aviso e da coleta por período, com revisão da ADR 0025 se precisar." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): texto e lugar do aviso de incompleto na aba do apontamento, que some quando a coleta por período completar o card, em paralelo à E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o plano e o aviso." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): branch docs/063-worklog-teto a partir da develop, commit e push só da documentação do discovery (plano do arquiteto e especificação do aviso)." · etapa de outra delegação; continua no pedido
- "E1.5 (dono): rodar o script de spike de 1 GET /loggedTime (D-2), só forma e contagens; o node-backend escreve o script sem tocar no .env (E1.6) e o dono o roda." · etapa de outra delegação; continua no pedido
- "E1.6 (node-backend): script de spike que lê a chave do ambiente sem exibi-la e grava só a forma da resposta e as contagens." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR da branch docs/063-worklog-teto para a develop, depois do review." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): review da branch feature/063-spike-paginacao." · etapa de outra delegação; continua no pedido
- "E1.10 (security-engineer): parecer de segurança do script (chave no cabeçalho, allow-list da saída)." · etapa de outra delegação; continua no pedido
- "E1.11 (qa-engineer): QA do script, sem chamar a API." · etapa de outra delegação; continua no pedido
- "E1.12 (software-architect): revisar o plano da coleta e a ADR 0025 com o resultado do spike (a API pagina: 200 por página), na branch docs/063-worklog-teto, antes da E2.1." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): coleta do registro de horas lendo todas as páginas de cada consulta (D-5; período só como contingência) e o sinal de registro incompleto por card na API do apontamento (C2 e C3-R do plano), com o contrato documentado para o front; review, segurança e QA nas etapas E2.4 a E2.6." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): aviso de registro incompleto na aba do apontamento nos três lugares da especificação 063-aviso-registro-incompleto, a partir do contrato da E2.1." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): review do lote do 063 (coleta, sinal na API e aviso na aba)." · etapa de outra delegação; continua no pedido
- "E2.5 (security-engineer): parecer de segurança da branch do back, inclusive aceitar page na lista fechada CONSULTA_WORKLOG (ADR 0015)." · etapa de outra delegação; continua no pedido
- "E2.6 (qa-engineer): QA do back e do front." · etapa de outra delegação; continua no pedido
- "E2.7 (ux-designer): revisão de interface do aviso." · etapa de outra delegação; continua no pedido
- "E2.8 (tech-lead): PRs e merge na develop, e a promoção para homolog junto com o 060." · etapa de outra delegação; continua no pedido
- "E2.9 (tech-lead): trazer a branch do back (feature/063-worklog-paginas, 3c3740d) para a branch do aviso (feature/063-aviso-incompleto) por merge commit, sem mudar código além da resolução de conflito, e enviar; a branch do aviso vira o lote do 063." · etapa de outra delegação; continua no pedido
- "E2.10 (ux-designer): na especificação da branch de docs do 063, o CA-4 passa a dizer que a dica abre ao ativar o selo (achado A3 do review e médio 1 da revisão de interface)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/docs/063-worklog-teto -- docs/reviews/063-docs-worklog-teto.md` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` · espera: linhas=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/docs/063-worklog-teto -- docs/ux/063-aviso-registro-incompleto.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
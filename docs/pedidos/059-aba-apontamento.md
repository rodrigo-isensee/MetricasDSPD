# Pedido 059: aba "Apontamento" no painel operacional

- **Modo:** implementar (discovery enxuto primeiro; código só depois do desenho validado)
- **Objetivo:** "Preciso de uma aba dentro de operacional chamada apontamento" (dono, 2026-11-01), seguindo a "Especificação do Painel de Capacidade" que ele colou e o HTML gerado hoje fora do sistema, com os dados do worklog do BusinessMap.
- **Clareza:** 6 confirmados; 2 suposições; 0 perguntas
- **Depende de:** nenhum pedido aberto (o coletor do BusinessMap do 052 já está na develop)

## Escopo
- E1. Exceção formal à regra de métrica individual, só para a aba Apontamento, escrita no `CLAUDE.md` e no briefing §7.1, por PR que o dono revisa e mescla; visível a qualquer usuário do painel · `confirmado` (dono, "A" e "C", 2026-11-01)
- E2. Discovery enxuto: a especificação e o HTML valem como protótipo; UX ajusta ao padrão do painel e propõe melhorias; arquiteto desenha coleta do worklog pela API, de-para de pessoa por id, hierarquia até a iniciativa, calendário e dicionário configurável; segurança faz o modelo de ameaças e a revisão da ADR 0020; as correções e melhorias propostas vão ao dono · `confirmado` (dono, "A, mas veja senão tem melhorias a propor e correções então toque o discovery", 2026-11-01)
- E3. Aba Apontamento no painel operacional com os blocos, filtros e cálculos da especificação (seções 3 a 8), incluindo a visão por pessoa do time, com o que o dono validar no discovery · `confirmado` (dono, especificação e decisões de 2026-11-01)

## Etapas
- E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes.
- E1.2 (software-architect): texto da exceção no `CLAUDE.md` e no briefing §7.1, e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit.
- E1.3 (ux-designer): a especificação do dono (texto, sem o HTML) como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2.
- E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2.
- E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR.
- E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso).
- E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR.

## Fora do escopo
- Comparação entre times, meta por pessoa e qualquer outra aba com dado de pessoa · `confirmado` (recibo do dono, 2026-11-01)
- Misturar o worklog com o Acelerato · `confirmado` (regra inviolável do CLAUDE.md)
- Guardar o texto do comentário do apontamento na base · `técnico` (ADR 0020: texto livre fica fora; a classificação roda na fronteira)
- Guardar o HTML de referência ou os nomes de pessoa da especificação no repositório · `técnico` (ADR 0020)

DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).

## Suposições
- "irracional" na mensagem do dono é "operacional" (erro de ditado) · base: único painel com esse sentido no sistema.
- "Veja como é feito pela explicação e siga" fala da aba Apontamento: a especificação vale como protótipo · base: a resposta "A" do dono à pergunta de quando começar, que partia dessa leitura.

## Histórico
- 2026-11-01: pedido do dono, literal: "Preciso de uma aba dentro de operacional chamada apontamento", seguido de "Segue a especificação" e do texto "Especificação do Painel de Capacidade" (seções 1 a 10). O HTML de referência e os nomes de pessoa citados não são guardados no repositório (ADR 0020).
- 2026-11-01: PERGUNTA: o que a aba mostra, dado que a especificação tem visão por pessoa e horas como esforço (opções A a C).
- 2026-11-01: anexou o HTML gerado (fora do repositório) e escreveu: "Gostaria d efundir ele em uma aba dentro do irracional. Todas as infos vem do bm". NAO-ENTENDI: "irracional" lido como "operacional".
- 2026-11-01: dono, literal: "Neste caso sim pode usar os nomes e pessoas de dentro do time não tem problema". PERGUNTA: registrar formalmente a exceção ou seguir na versão do time.
- 2026-11-01 17:30: DECISÃO DO DONO (exceção à regra de métrica individual), literal: "A" — registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020). Cartão K-193.
- 2026-11-01 17:40: DECISÃO DO DONO (quem vê a aba Apontamento), literal: "C" — qualquer usuário do painel, inclusive fora do time. Recomendação do time era A (só a gestão).
- 2026-11-01 17:45: DECISÃO DO DONO (recibo), literal: "Por enquanto sim" — recibo confirmado.
- 2026-11-01 17:50: dono, literal: "Veja como é feito pela explicação e siga não é muito complexo". NAO-ENTENDI: lida como "seguir a especificação" da aba.
- 2026-11-01 17:55: DECISÃO DO DONO (início), literal: "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" — começa agora em paralelo ao 052; o discovery propõe melhorias e correções à especificação; o dono quer entregar até 2026-11-02. SUPERAÇÃO: a DECISÃO TÉCNICA de 17:45 (discovery depois de 2026-11-02) está superada por esta decisão. DECISÃO TÉCNICA (Jarvis): discovery enxuto já (E1.1 a E1.5) na worktree 052c; o prazo de 2026-11-02 para a aba inteira é risco (estimativa de 3 a 4 dias), avisado ao dono.
- 2026-11-01 17:50: DECISÃO TÉCNICA (Jarvis): o time não lê o HTML de referência do dono (traz nomes e horas por pessoa; ADR 0020); a especificação em texto, sem nomes, guardada fora do repositório, faz o papel de protótipo; a E1.3 passa a dizer isso.
- 2026-11-01 17:47: E1.1 cumprida: docs/059-apontamento-discovery criada na worktree 052c a partir da origin/develop (4a01e39384ef108d6adba942f56623a2750d3cfd), push ok. E1.4 (segurança) delegada.
- 2026-11-01 17:47: conferente reprovou o brief do arquiteto (software-architect-1): a exceção "A" cobre a regra de métrica individual, mas a especificação usa horas apontadas, proibidas como proxy de esforço no §7.1 do briefing, sem decisão do dono. PERGUNTA: as horas apontadas entram na exceção, só para capacidade e distribuição do tempo, nunca como esforço de entrega.
- 2026-11-01 17:50: E1.3 cumprida: docs/ux/059-aba-apontamento.md na worktree 052c, sem commit: ajuste ao padrão do operacional, 16 melhorias e correções (M-1 a M-16), 7 perguntas ao dono (P-1 a P-7) com recomendação, critérios de aceite CA-1 a CA-11; prazo: discovery e validação cabem até 2026-11-02, a aba utilizável não (hipótese a confirmar com E1.2 e E1.4). As perguntas vão ao dono uma por vez, depois da pergunta das horas.
- 2026-11-01 17:50: E1.4 cumprida: docs/security/059-aba-apontamento-ameacas.md na worktree 052c, sem commit: API sem autenticação (qualquer usuário = quem alcança a porta; nome real fora da máquina do dono depende da P-1 da segurança), papel novo dspd_api_apontamento com GRANT por coluna e interruptor desligado por padrão, comentário nunca na base, spike do endpoint de worklog antes do código, 13 casos de abuso, 5 limites de projeto para a exceção, 8 perguntas ao dono; até 2026-11-02 cabe só a fatia 1 (tela sobre mock com pessoas fictícias). Melhoria vista: API sem autenticação, para cartão.

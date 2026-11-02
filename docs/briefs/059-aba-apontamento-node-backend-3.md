Agente destino: forge:node-backend
Pedido: 059-aba-apontamento
Tipo: codigo
Branch: feature/059-spike-worklog   Base: develop   Base-sha: 5c679daaa56ce8b988a5f36808b4cfc475620d3c
Etapa: codigo   Cobre: E2.3

## Objetivo
Ler a forma real do worklog do BusinessMap, que define a allow-list e o coletor da aba Apontamento (pedido 059, E2.3, K-193). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`; a branch `feature/059-spike-worklog` é criada nesta etapa.

## Ler
- O §3 do plano (`git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/059-apontamento-discovery:docs/architecture/features/059-aba-apontamento.md`); o cliente HTTP e o comando `bm:spike` do 052 em `server/src/modulos/businessmap/` como modelo; a seção AP-6 do modelo de ameaças (`git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/docs/059-apontamento-discovery:docs/security/059-aba-apontamento-ameacas.md`).

## Entregar
- "E2.3 (node-backend): na worktree `/home/rodrigoisensee/MetricasDSPD-052d` (branch da F1 do 052, já mesclada), criar a `feature/059-spike-worklog` a partir da `origin/develop` e escrever o spike só leitura do worklog (comando `pnpm` do server, nunca agendado, só GET pelo cliente do 052): `/loggedTime`, `/loggedTime/history` e `/loggedTimeCategories` num lote pequeno de cards já coletados, sem gravar a resposta bruta em lugar nenhum e com só forma (chaves e tipos) e contagens ao Jarvis, sem nome, id de pessoa nem comentário; testes contra servidor falso; rodar na máquina do dono com o `.env` lido só pelo programa; commit e push." (E2.3)
- (E2.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`, `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/059-spike-worklog --no-track origin/develop`, `pnpm -C /home/rodrigoisensee/MetricasDSPD-052d install --frozen-lockfile` em prioridade baixa.
- (E2.3) Comando `pnpm` do server, manual e nunca agendado, só GET pelo cliente do 052, com lista fechada de caminhos (`/loggedTime`, `/loggedTime/history`, `/loggedTimeCategories`): lê um lote pequeno (até 20) de cards já coletados, não grava a resposta bruta em lugar nenhum: em memória, descarta os valores de nome, id de pessoa e comentário e imprime só forma (chaves e tipos) e contagens; nome, id de pessoa e comentário nunca em arquivo, saída nem log; testes contra servidor falso.
- (E2.3) Rodar o comando uma vez na máquina do dono, com o `.env` lido só pelo programa; relatório ao Jarvis só com forma e contagens (quantos apontamentos, quantos com categoria, quantos com comentário, tipos dos campos, campos do evento de histórico).
- (E2.3) Commit do comando e dos testes com `Cartão: K-193`, mensagem gravada pela ferramenta Write em `/tmp/claude-1000/commit-059-e23.txt`, `git add` explícito por caminho; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/059-spike-worklog`; sem PR.
- (E3) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-01): "A" (exceção à regra de métrica individual): registrar formalmente a exceção para a aba Apontamento no CLAUDE.md e no briefing, por PR que o dono revisa e mescla; discovery com o security-engineer (controle de acesso, revisão da ADR 0020).
- DECISÃO DO DONO (2026-11-01): "C" (quem vê a aba): qualquer usuário do painel, inclusive fora do time.
- DECISÃO DO DONO (2026-11-01): "Por enquanto sim" (recibo confirmado).
- DECISÃO DO DONO (2026-11-01): "A" (texto da exceção, Q-A12): aprova os textos 1.1 (CLAUDE.md) e 1.2 (briefing §7.1) do plano docs/architecture/features/059-aba-apontamento.md com as quatro cláusulas opcionais o1 a o4 (ordem neutra, sem semáforo, piso de 20 apontamentos para percentual por pessoa, aba fora da exportação).
- DECISÃO DO DONO (2026-11-01): "A" (recomendações em bloco): aceita as recomendações do time para as perguntas Q-A1 a Q-A11 do plano, P-1 a P-7 do UX e P-3 a P-8 da segurança (as já respondidas pelas cláusulas o1 a o4 seguem as cláusulas); pode reabrir qualquer item depois. Ficam fora do bloco e vêm separadas: P-1 da segurança (onde o painel roda e quem o alcança) e P-2 da segurança (retenção e base legal).
- DECISÃO DO DONO (2026-11-01): "Faça sua recomendação depois vamos ter login pelo ad" (onde o painel com nome real roda, P-1 da segurança): por enquanto, nome real só na máquina do dono ou na rede local sob controle dele, desligado em qualquer outro ambiente; depois entra login pelo AD da empresa (fatia futura).
- DECISÃO DO DONO (2026-11-01): "A" (retenção, P-2 da segurança): o vínculo entre horas e pessoa fica enquanto a aba usar o dado; no pedido de eliminação saem o nome e o vínculo (chave de pessoa anulada no fato) e as horas ficam como agregado do time, sem sobrescrever valor de métrica; o prazo exato vai ao DPO antes da fatia de retenção.
- DECISÃO DO DONO (2026-11-01): "A" (horas apontadas): a exceção da aba Apontamento cobre também as horas apontadas, só para capacidade, utilização e distribuição do tempo do time e de cada pessoa; nunca como esforço de entrega, velocidade, custo de card ou meta.
- DECISÃO DO DONO (2026-11-01): "A, mas veja senão tem melhorias a propor e correções então toque o discovery gostaria de entregar ata amanhã também" (começa agora, discovery com melhorias e correções, entrega desejada até 2026-11-02).
- ADR 0020 (citada no pedido): nome de pessoa e comentário do apontamento nunca em documento, saída ou log; o comentário não chega à base.
- Erro recorrente deste destino (forge-check, 30 dias): base em 5 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 4 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- 2026-11-01 20:52: E1.2 cumprida: plano em docs/architecture/features/059-aba-apontamento.md (worktree 052c, sem commit): proposta literal da exceção (CLAUDE.md e briefing 7.1, com cláusulas opcionais o1 a o4), coleta por GET /loggedTime com chave logged_time_id e histórico de edição e exclusão, comentário classificado na fronteira e descartado, pessoa por id, hierarquia até a iniciativa, dicionário versionado, API agregada com papel dspd_api_apontamento; 12 correções e 5 melhorias à especificação; perguntas Q-A1 a Q-A12; até 2026-11-02 cabe a F0 (discovery, validação e PR da exceção), código e tela não. Próximo: E1.5 (commit do discovery) e a validação do dono, uma pergunta por vez.
- 2026-11-01 21:09: DECISÃO DO DONO (prazo), literal (/goal): "entregar a aba do apontamento toda até amanhã às dez da noite" — a aba inteira até 2026-11-02 22:00. SUPERAÇÃO: as fatias de 2026-11-01 (só a F0 até 2026-11-02) estão superadas por este prazo; o time replaneja F1 a F4 em paralelo.
- 2026-11-01 21:12: E1.5 cumprida: discovery commitado na docs/059-apontamento-discovery (784659c5efb8eaabeb521772f2a21b105d1c32f8), push ok.
- 2026-11-01 21:30: registro da redação das cláusulas como apresentada ao dono na pergunta Q-A12 e aprovada por ele ("A"): o1 "a lista de pessoas vem em ordem neutra (alfabética); ordenar por total é escolha de quem lê"; o2 "a utilização por pessoa não tem semáforo, faixa de bom ou ruim, nem comparação com a média"; o3 "percentual por pessoa só aparece com 20 apontamentos ou mais; abaixo disso, só soma e contagem"; o4 "a aba fica fora da exportação do painel".
- Sandbox: comandos que começam com pnpm, tsx, psql e docker rodam fora dele; o GitHub precisa de `github.com` em `allowed_domains`; o BusinessMap só por GET (CLAUDE.md).
- Recursos: antes de pnpm install ou suíte, conferir `free -m` (MemAvailable acima de 4000 MB) e `uptime` (load abaixo de 14); se não, esperar; uma suíte por vez nesta worktree; matar só o processo que lançou.
- O hook barra cifrão, crase, chaves e interrogação no Bash, e o cd com pipe em comando composto: comandos literais, um por linha, com `git -C` ou `pnpm -C`.
- O agente nunca abre nem lê o `.env`.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`; recusa de hook: pare e relate a mensagem literal.
- NÃO tocar: o coletor do 052, a base, o banco do dono (nada gravado), pareceres, o `CLAUDE.md`, as outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): na worktree `/home/rodrigoisensee/MetricasDSPD-052c` (branch da F0 já mesclada), criar a `docs/059-apontamento-discovery` a partir da `origin/develop` e fazer push, sem commit novo e sem testes." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): proposta literal do texto da exceção para o `CLAUDE.md` e o briefing §7.1 (aplicada depois por PR que o dono revisa e mescla, sem editar os dois nesta etapa), e o desenho técnico enxuto da aba (coleta do worklog pela API do BusinessMap, carga incremental com chave do apontamento, de-para de pessoa por id, hierarquia até a iniciativa, calendário com feriados, dicionário de subgrupo configurável, classificação do comentário na fronteira, cálculos pela biblioteca T2.5) com as correções e melhorias à especificação, em `docs/architecture/features/059-aba-apontamento.md`, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): a especificação do dono (texto, sem o HTML) como protótipo: ajuste ao padrão do painel operacional e lista de melhorias e correções de interface, em `docs/ux/059-aba-apontamento.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.4 (security-engineer): modelo de ameaças da aba (nome de pessoa na API, visível a qualquer usuário; comentário do apontamento; chave do BusinessMap) e revisão proposta da ADR 0020, em `docs/security/059-aba-apontamento-ameacas.md`, na worktree 052c, sem commit, em paralelo à E1.2." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push do discovery (E1.2 a E1.4) na `docs/059-apontamento-discovery`, sem PR." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o desenho e as melhorias (ponto de compromisso)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): depois da E1.5, branch própria a partir da develop com a exceção aprovada (textos 1.1 e 1.2 do plano, com as cláusulas o1 a o4) aplicada no `CLAUDE.md` e no briefing §7.1, review, PR só de documentação para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA documental do PR da exceção na `docs/059-excecao-apontamento` (worktree 052b): texto no `CLAUDE.md` e no briefing igual ao aprovado pelo dono (textos 1.1 e 1.2 com as cláusulas registradas às 21:30 e a frase da ADR ajustada), `docs:check` verde, parecer em `docs/qa/059-excecao-apontamento.md`; commit, antes do push e do PR da E1.7." · etapa de outra delegação; continua no pedido
- "E2.1 (a definir depois da E1.6): implementação, segurança, code review, QA, revisão de UX e PR." · etapa de outra delegação; continua no pedido
- "E2.2 (software-architect): plano de execução da aba inteira até 2026-11-02 22:00 (fatias F1 a F4 do §7 refeitas em trilhas paralelas, o que cada agente faz e em que ordem, com os pontos de espera), o contrato zod da API da aba (§3), a revisão 4 da ADR 0020 e a ADR da coleta do worklog, na worktree 052c, sem commit." · etapa de outra delegação; continua no pedido
- As outras trilhas da aba (código do coletor definitivo, biblioteca, rota, front, QA), definidas pelo plano da E2.2; o PR da exceção (E1.7); o quadro e o arquivo do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin refs/heads/feature/059-spike-worklog` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-052d rev-parse HEAD`
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/feature/059-spike-worklog` · espera: contém 'Cartão: K-193'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

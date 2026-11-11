# Pedido 097: filtro por time no Resumo

- **Modo:** implementar
- **Objetivo:** pedido do dono (literal): "melhoria no resumo deve ser possivel filtrar por time." O Resumo (web/src/features/operacional/resumo) mostra os blocos de fluxo (BusinessMap) e de sustentação (Acelerato) sem o filtro de equipe que os outros painéis já têm.
- **Clareza:** 4 confirmado; 0 técnico; 1 suposição; 0 perguntas
- **Origem:** dono, 2026-11-11.

## Escopo
- E1. Filtro de time no Resumo, nos dois blocos (fluxo e sustentação), cada um com os times da sua fonte · `confirmado`
- E2. Aba Apontamento: sai o filtro Pessoa e entra o filtro Time; o cartão de capacidade por pessoa fica igual · `confirmado`
- E3. Busca digitando em todos os filtros de lista · `confirmado`
- E4. Todas as opções de filtro vêm do dado real (Tipo do Operacional sem a lista fixa; times da Sustentação junto com o pedido 098) · `confirmado`
- E5. Botão de recolher (minimizar) em todo cartão de gráfico dos painéis, lembrando a escolha · `confirmado`
- E6. Bug K-272: AP-TIPO e filtro tipo do Apontamento agrupam por categoria do contrato, sem linhas nem opções repetidas · `confirmado`

## Etapas
- E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar.
- E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX.
- E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041.
- E6.2 (tech-lead): review do K-272.
- E6.3 (qa-engineer): QA do K-272.
- E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono.

## Fora do escopo
- Comparar times lado a lado ou ranking de times (proibido pelo CLAUDE.md) · `confirmado`
- Misturar BusinessMap e Acelerato num mesmo número · `confirmado`

## Suposições
- O filtro reusa a lista de equipes e o comportamento do filtro que já existe nos outros painéis.

## Perguntas na fila
- PERGUNTA P-097-1: o filtro vale para os dois blocos do Resumo (fluxo e sustentação, cada um com a sua lista de times) ou só para o de fluxo? Recomendação: os dois, cada bloco com o time da sua fonte.
- PERGUNTA P-097-2: recibo do pedido (vou fazer / não vou fazer).

## Histórico
- 2026-11-11 13:27: pedido registrado pelo Jarvis; recibo enviado ao dono.
- 2026-11-11 13:31: DECISÃO DO DONO (literal): "A". P-097-1 e o recibo respondidos: o filtro de time vale para os dois blocos do Resumo, cada um com a lista de times da sua fonte; sem comparação entre times nem mistura de fontes. Próximo: discovery (ux-designer e software-architect).
- 2026-11-11 13:31: PERGUNTA do dono (literal): "outro ponto nao vi ou demais times so vi SSC, porque?". Leitura do Jarvis: no Acelerato o recorte coletado é só o tipo "DSPD - SSSC" com as equipes SSSC TOTVS, SSSC SENIOR e SSSC FLUIG (decisão D-8 do dono, docs/architecture/fontes/acelerato-listas.md); no BusinessMap o time vem do dicionário de times do bm:ref-sync. Falta saber em que tela o dono viu só SSC.
- 2026-11-11 13:34: PEDIDO DO DONO (literal): "no apontamento nao quero filtro por pessoa e sim por time." ESCOPO+ (confirmar no recibo): E2, na aba Apontamento, sai o filtro por pessoa e entra o filtro por time. Visto no código: além do filtro (BarraFiltrosApontamento.tsx:102), o cartão de capacidade lista por pessoa (CartoesCapacidade.tsx:100, AP-CAPACIDADE-PESSOA). PERGUNTA P-097-3: a lista de capacidade por pessoa também sai (ou vira por time)?
- 2026-11-11 13:34: DECLARAÇÃO DO DONO (literal): "nao o sistem coleta de todos, nao so de sssc". Diverge do código: a coleta do Acelerato só aceita o tipo "DSPD - SSSC", as organizações do DSPD e as equipes SSSC TOTVS, SSSC SENIOR e SSSC FLUIG (server/src/modulos/acelerato/coletor.ts:155, lista em docs/architecture/fontes/acelerato-dominio.json, decisão D-8). Não se resolve por inferência: PERGUNTA P-097-4 ao dono.
- 2026-11-11 13:35: DECISÃO DO DONO (literal): "capacidade fica igual". P-097-3 respondida: o cartão de capacidade por pessoa (AP-CAPACIDADE-PESSOA) não muda; E2 fica só a troca do filtro Pessoa pelo filtro Time na aba Apontamento. P-097-4 (A: Acelerato com todos os times; B: só SSC visto no BusinessMap) segue aberta.
- 2026-11-11 13:35: DECISÃO DO DONO (literal): "2-A". P-097-4 respondida: o Acelerato passa a coletar todos os times, e não só o SSSC. Mudança de recorte da decisão D-8: vira o pedido 098, com o recorte exato a definir pelo dono a partir de uma consulta só de leitura.
- 2026-11-11 13:36: PEDIDO DO DONO (literal): "nos combobox dos filtros sem possivel ir digitando para achar a opcao interna". ESCOPO+ (confirmar no recibo): E3, nos filtros de lista (FiltroMulti, web/src/features/filtros), digitar filtra as opções da lista; vale para todos os painéis.
- 2026-11-11 13:38: PERGUNTA do dono (literal): "porque no operacional ainda temos filtros siomulados?". Visto no código (server/src/modulos/referencia/servico.ts:25-27): no Operacional, Time e Sistema vêm da base; Tipo é a lista fixa TIPOS_FILTRO do contrato (packages/contratos/src/comum.ts:48), não lida do BusinessMap; na Sustentação, os times são a lista fixa das 3 equipes SSSC (packages/contratos/src/filtros.ts:12). Falta o dono dizer qual filtro viu como simulado.
- 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- 2026-11-11 13:44: brief selado docs/briefs/097-resumo-filtro-time-ux-designer-1.md 92c71ef50ffbdd456c240f32618b4bac767989d18ee34259607a602f13ba6a85
- 2026-11-11 13:44: brief selado docs/briefs/097-resumo-filtro-time-software-architect-1.md 4f4d18a7784cc15444170dbe578acf8ed4c8ddcf410e82997eef6a2f9ccd03cd
- 2026-11-11 13:44: PEDIDO DO DONO (literal, com print do cartão AP-PROJETO "Horas por projeto" da aba Apontamento): "este cara ficou enorme, tem que ter opcao para ocultar ou minimizar". ESCOPO+ (a confirmar no recibo): E5, opção de recolher (minimizar) o cartão. PERGUNTA P-097-5: vale só para o AP-PROJETO ou para todo cartão de gráfico dos painéis? E, no AP-PROJETO, mostrar só os 10 projetos com mais horas e um "ver todos"? Recomendação: recolher em todo cartão, lembrando a escolha, e os 10 maiores com "ver todos" no AP-PROJETO.
- 2026-11-11 13:45: DECISÃO DO DONO (literal): "A". P-097-5 em parte: o botão de recolher vale para todo cartão de gráfico dos painéis (E5). Os 10 maiores com "ver todos" no AP-PROJETO seguem sem resposta.
- 2026-11-11 13:45: DECLARAÇÃO DO DONO (literal): "outra coisa, no apontamento pode aparecer o nome das pessoas reais eu ja tinha decidido isso". Confere com as decisões do pedido 059 (2026-11-01: nome real só na máquina do dono ou na rede local dele). Não é código: o interruptor APONTAMENTO_NOMES fica desligado por padrão (docker-compose.yml:51) e o dono liga no .env dele (APONTAMENTO_NOMES=1) e recria a api. Comando enviado ao dono.
- 2026-11-11 13:47: E1.1 discovery do UX entregue (sem commit): docs/ux/097-filtros-time-busca.md (CA-1 a CA-23, Q-1 a Q-5) e protótipo docs/ux/prototipos/097-filtros.html (abas Resumo, Apontamento, Busca e estados); filtro Time dentro de cada bloco do Resumo; Pessoa trocado por Time no Apontamento. E5 (recolher cartão) ainda não está no protótipo: entra numa segunda rodada do UX. Arquiteto (E1.2) em curso.
- 2026-11-11 13:48: PEDIDO DO DONO repassado pela sessão "WSL ativação" (literal do dono): "Todos os filtros de combo devem dar a opcao de ir digitando para achar a pessoa dentro". Já é o E3 deste pedido. Diverge em parte da decisão de 13:34 ("no apontamento nao quero filtro por pessoa e sim por time"): PERGUNTA P-097-6, no Apontamento o filtro Pessoa sai (troca por Time) ou ficam os dois (Time e Pessoa, ambos com busca)?
- 2026-11-11 13:49: BUG relatado pelo dono, repassado pela sessão "WSL ativação" (main c9354a82): no cartão AP-TIPO "Horas por tipo" da aba Apontamento, "Trabalho de produto" aparece em quatro linhas separadas (240,5 h, 136,7 h, 43,2 h e 1 h). Diagnóstico da sessão pela leitura do código: servico.ts:58-59 agrupa pelo type_id do BusinessMap e mostra o rótulo da categoria do contrato (dim_card.tipo, ADR 0024, normalizador.ts:226); vários type_id caem em "Trabalho de produto"; a lista do filtro tipo (servico.ts:156) também repete. ESCOPO+ (bug): E6. PERGUNTA P-097-7: (a) agrupar pela categoria do contrato, ou (b) agrupar pelo tipo real do BusinessMap e mostrar o nome real (com a categoria como complemento)? Recomendação do Jarvis: (b), que segue o "tudo real" de 13:42; nos dois casos, teste com dois type_id da mesma categoria.
- 2026-11-11 13:51: DECISÃO DO DONO repassada pela sessão "WSL ativação" (literal do dono): "Agrupar". P-097-7 respondida pela opção (a): no AP-TIPO e na lista do filtro tipo do Apontamento, uma linha e uma opção por categoria do contrato (dim_card.tipo), somando todos os type_id dela; filtrar por categoria cobre todos os type_id; lerCardsIncompletos deixa de filtrar por type_id; "Sem tipo" segue à parte; teste com dois type_id da mesma categoria. E6 (K-272) começa já, na worktree 041, branch fix/k272-ap-tipo-categoria, a partir da develop eac38a64.
- 2026-11-11 13:53: E1.2 análise do arquiteto entregue (docs/analises/097-filtros-plano.md, sem commit): time no Apontamento pelo card (dim_card.equipe; falta só GRANT); o front ignora opcoes.tipos e usa TIPOS_FILTRO (BarraFiltros.tsx:27, codec.ts, taticas.tsx); times da Sustentação passam a vir de dim_chamado; Resumo já aceita equipe nos cartões (tendências ganham parâmetro novo compatível); não tirar `pessoa` da API agora (front deixa de enviar); 7 lotes, gatilho de segurança só no L2; risco para o 098 E4 (renomear times sem reprojetar dim_card.equipe). Perguntas ao dono: P-097-A (time pelo card e "Sem time"), P-097-B (Tipo = categoria ou tipo nativo), P-097-C (opções da base toda ou do período), C1 a C4 (consultas só de leitura).
- 2026-11-11 13:54: brief selado docs/briefs/097-resumo-filtro-time-node-backend-1.md d3362715dc06dfc952ff6b2b99affa515a3c4948dfe2ac50ce0b2bf6bd998671
- 2026-11-11 13:54: DECISÃO DO DONO (literal): "A". P-097-6 respondida: no Apontamento o filtro Pessoa sai e entra o Time (como no protótipo); a busca digitando vale para todos os filtros de lista. Seguem abertas: validação do protótipo com Q-1 a Q-5, P-097-A, P-097-B e P-097-C. E6.1 (K-272) delegada ao node-backend.

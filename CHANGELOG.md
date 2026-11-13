# Changelog

Formato conforme `docs/engineering/fluxo-homologacao.md` §8; versões pelo SemVer (enquanto `0.x`, MINOR absorve o que seria MAJOR). Escrito à mão a partir dos Conventional Commits de `origin/homolog..origin/develop`.

## [Não publicado]

### Adicionado
- Painel: BLOQUEADOS e O5 sem dado real até a coleta gravar bloqueios (pedido 065) (#214).
- Aba Apontamento: dia atípico acima de 10 h (pedido 067) (#215) e aviso de coleta parcial (pedido 069, lote M1-a) (#219).
- Sustentação: S8 conta só incidentes com resposta (pedido 066) (#216).
- Métricas: O2 e parados por etapa acham as colunas pela equipe (pedido 069, lote L3-a) (#217).
- BusinessMap: mapa de campos e `bm:ref-sync` (lote L2-a) (#220) e projeção das colunas de lista do `dim_card` (lote L2-b) (#221).
- Acelerato: S3 e S2 sem zero falso nos campos que o Acelerato não traz (lote L9-a) (#225) e campos de etapa até o staging (lote L9-b) (#224).
- Documentação: plano, ADR 0025 e especificação do aviso de registro incompleto (pedido 063) (#212).
- Referência: calendário por domínio (BusinessMap e Acelerato) em arquivo versionado e `ref:sync-calendario`, começando pelos feriados nacionais 2025-2026 do código (pedido 069, lote L7-a; ADR 0027) (#222).
- Métricas do fluxo e da sustentação leem o calendário da referência do próprio domínio (pedido 069, lote L7-b) (#232).
- Painéis: dado simulado por cartão com o selo Simulado onde ainda não há dado real, fora do Resumo, da Visão geral e da exportação (pedido 070, L1 e L2) (#230); E2E de API do simulado e medição C6 no perf-api (pedido 070, L3) (#233).
- Documentação: ADR 0028 e desenho do 070 passam a vigente (#234).
- Acelerato: projeção das colunas da F3 na `dim_chamado` (campo de etapa repetido vale o último valor preenchido, vazio nunca apaga) e comando `ac:apoio-l9c` (pedido 069, lote L9-c) (#238); `ac:ref-sync` registra versão a cada mudança de vigência (E10 L1) (#252); a coleta recusa lista fechada sobrescrita (E10 L2) (#258); listas de `ref_dominio` no CA-8 do coletor (#244); categoria do erro nas entradas de referência (pedido 081) (#264).
- BusinessMap: domínio `motivo_bloqueio` no `bm:ref-sync` (pedido 075, lote 3) (#246); derivador puro de bloqueio por comparação de versões (lotes 2a e 2b, marcos de saída e fornecedor) (#248, #257); projetor grava `evt_bloqueio` idempotente (lote 4a) (#260) e monta `fato_bloqueio` dos eventos (lote 4b) (#266); versão de critério e corte do O1, com data pendente (lote 6a) (#267).
- Bloqueios: BLOQUEADOS, O2 e O19 aceitam e leem o motivo "não classificado", com 8 motivos no O19 (pedido 075, lotes 1a e 1b) (#245, #247); a tela mostra o motivo não classificado (lote 5a) (#253). O interruptor `AJUSTE_PRIORIDADE_COM_FONTE` segue desligado.
- Tendências (pedido 077): janela incompleta nos contratos, nas tendências e nas telas do fluxo e da sustentação (#249, #254, #261, #269); herdam as marcações de critério (#251); `historicoDesde` do BusinessMap (#259); ressalva do S2 na tendência de SLA, contrato e tela (#262, #276); contagem parcial do mês anterior ao histórico, no servidor e na tela (#272, #278); tendência do fluxo com dado real do BusinessMap (lote 5) (#279) e tendência da sustentação com dado real do Acelerato (lote 7, `TENDENCIA_SUST` no mapa real, fora da simulação) (#285).
- Demonstração: comando único `pnpm run demo:dado-real` (pedido 087), que confere só os nomes do `.env`, sobe o banco, migra, faz a carga inicial do BusinessMap, do Acelerato e do apontamento, projeta, sobe API e web e imprime a consulta de prova do 075 (só contagens); para no primeiro erro, com etapa e categoria. Só roda com o `.env` do dono (#284).
- Documentação: ADR 0023 vigente e pareceres de segurança do E1 (pedido 073, E2) (#243); pareceres antigos trazidos para a `develop` (#241); retrospectivas dos pedidos 079 a 083 (#277).
- Bloqueios com dado real: BLOQUEADOS, O5 e O19 voltam ao mapa real, o O1 e o O2 saem com a parte de bloqueio calculada (sem a nota `bloqueio-sem-dado-real`), a data da versão de critério é 2026-11-01 e `BLOQUEIOS_COM_DADO_REAL` fica ligado; T10 e T12 seguem fora (pedido 075, lote 6b, K-204) (#298).
- Aba Apontamento (pedido 089, D2 e D3): o subgrupo `nao-classificado` passa a se chamar "Sem comentário" (dicionário v3 `2026-11-10-v3`), com explicação visível que o separa da marca de qualidade; comentário escrito que o dicionário não reconhece vira `execucao-tecnica` e aparece numa nota própria no cartão de Qualidade, fora das flags, com contagem e percentual das horas (sem percentual abaixo de 20) (#293, #294).
- Documentação: retrospectivas dos pedidos 078, 084 e 085 (#295) e 088, 089 e 090 (#302).
- Documentação: o pronto do autor em `praticas.md` segue a decisão do dono (só testes e typecheck do pacote durante o desenvolvimento; `pnpm run pronto` antes do commit final da branch) (K-172) (#303); `contrato: 0` no frontmatter de dez documentos antigos de `docs/qa`, `docs/reviews` e `docs/architecture`, sem mudar o corpo (K-121) (#307); o guia do desenvolvedor segue a mesma decisão para o `pnpm run pronto` (K-265) (#308).
- Bloqueios com dado real (pedido 075, K-204): a web deixa de depender da nota `bloqueio-sem-dado-real` no O1 e no O2, e a coluna Bloqueado do O2 mostra o motivo real ou "—" (lote 9a) (#320); o id da nota sai do contrato e o servidor perde o ramo dela, com `bloqueados` nulo do O1 seguindo nulo, nunca 0 (lote 9b) (#323).
- Documentação: retrospectivas dos pedidos 091 e 092 (#315); ADR 0030, que revoga a ADR 0028 (simulado por cartão) por decisão do dono (pedido 099) (#322).
- Filtros (pedido 097, L1): todo filtro de lista ganha o campo Buscar; a busca ignora maiúsculas e acentos, anuncia quantas opções sobraram, mantém marcado o que ficou fora da busca e avisa quantas são, funciona pelo teclado e não vai para o link (#336).
- Filtros (pedido 097, L6): as opções de tipo do fluxo e de prioridade da sustentação passam a ser as que existem no dado real, com o mesmo corte das listas, para nenhuma opção filtrar para vazio; tipo que não está nas opções, num link antigo, é ignorado e avisado (#330, #353).
- Aba Apontamento (pedido 097, L2 e L3): o filtro Pessoa dá lugar ao filtro Equipe (o time do card ou do card pai, com a opção "Sem equipe"), logo depois do período; a equipe só recorta, nunca agrupa nem compara times. Os nomes ocultos e a nota "Outra área" passam para o cartão de capacidade por pessoa (#337, #345).
- Resumo (pedido 097, L4 e L5): filtro Equipe dentro de cada bloco, o do Fluxo com as equipes do BusinessMap e o da Sustentação com as do Acelerato, cada um mudando só os números, os alertas e a tendência do próprio bloco; com duas ou mais equipes o número é consolidado (soma), nunca comparação (#333, #350).
- Sustentação (pedido 097, L7a e L7b): as equipes vêm do dado real do Acelerato, identificadas pelo nome (por exemplo `sssc-totvs`), e não mais de uma lista fixa de três (#344).
- Ferramentas: comando único `pnpm run consultas:098-099` para o dono rodar as consultas só de leitura dos pedidos 098 e 099 (PostgreSQL da demo e MySQL do Acelerato), com sessão só de leitura, certificado fixado, senha fora da linha de comando e saída recusada se trouxer coluna de pessoa ou texto livre (K-275) (#329).
- Documentação: retrospectivas dos pedidos 093, 094, 095, 096 e 100 (#334); revisões de UX, análises e a segunda rodada de UX do 097 (#356).
- Sustentação (pedido 099, D3): os alvos de prioridade do PROC 30.000.010 passam a vir de arquivo versionado, carregado pelo `ac:ref-sync`, com a unidade de cada prazo: P1 e o primeiro atendimento da P2 em tempo corrido, os demais em tempo útil; o S1 e a Visão geral medem cada célula na unidade do seu alvo (#363, #364).
- Sustentação (pedido 099, D3b): o dia útil da Sustentação passa a 8 h 48 (528 min, turnos 08:00-12:00 e 13:00-17:48 no calendário do Acelerato); alvos em dias do PROC viram dias x 8,8 h; o S9 sai em horas úteis e a tela do S1 explica o dia útil. O fluxo (BusinessMap) segue com 8 h (#371).
- Fluxo (pedido 099, C8a): a severidade do card vem do campo de prioridade nativo do BusinessMap (1 Crítica, 2 Alta, 3 Média, 4 Baixa), por de-para versionado carregado pelo `bm:ref-sync`; card sem prioridade fica sem severidade e valor fora do mapa é recusado e contado, nunca vira Baixa (#369).
- Fluxo (pedido 099, C2a): o prazo combinado do card (`data_acordada`) vem do deadline nativo do BusinessMap, com leitura estrita da data (#366).
- Métricas com dado real (pedido 099): O25 Descarte (lote A3) (#367) e S12 só com o volume por sistema; a exceção de SLA por registro posterior e a reincidência aparecem sem fonte, com nota, nunca como 0% (D9) (#370).

### Corrigido
- Painéis: gate de fronteiras do 070, sem import do pacote mock na fonte com simulado e F9 abaixo de 120 KB (#231); marca d'água SIMULADO em SVG, sem violação de contraste do axe (bug 070-001) (#233).
- Suíte: trava em `/tmp/claude-uid` (pedido 079) (#263); teste da trava não pendura dentro do `pronto` (pedido 085) (#280); E2E L3-01 espera a altura da página estabilizar antes do axe (pedido 080) (#265).
- Testes: regra de fronteira do eslint cobre todo `src` fora de `modulos` (pedido 073, E4) (#240); sustentação sem início de histórico do Acelerato (077, lote 3b) (#273); colunas e GRANT de `fato_bloqueio` e `evt_bloqueio` (075, lote 4c) (#274).
- Entradas: `ref-sync-apontamento` imprime só a categoria do erro, como `ref-sync-ac` e `ref-sync-businessmap` (K-244) (#283).
- Testes: o caso sem configuração do `ref-sync-apontamento` não lê mais o `.env` da máquina (K-261) (#297).
- Ferramentas: pre-push com lint e typecheck só nos arquivos e pacotes alterados (pedido 083) (#268, #270).
- Homologação: o check `homolog-aprovada` consulta de novo o portão recém-concluído (até 6 vezes, com 10 s de intervalo) antes de falhar; a regra não muda (K-263) (#304).
- Testes: os testes de CLI do servidor repassam `TMPDIR` ao processo filho, que no sandbox não achava pasta temporária; o `.env` real segue ignorado (K-264) (#305); o teste do CLI do seed faz o mesmo (K-266) (#309).
- Testes: a sonda de dado de pessoa do 6b (S6) passa a pegar "bloqueado por", "quem", "comentário", "observação", `user_id` e `motivo_texto` nas respostas da API (K-267) (#310).
- Web: o simulador de métricas está desligado; nenhum número simulado aparece na web de uso diário, e o cartão sem dado real mostra "Sem dado real" com o motivo. O código do simulador fica no repositório, parado, até os lotes L2a a L3 (pedido 099, L1; ADR 0030) (#322).
- Aba Apontamento: o AP-TIPO e o filtro tipo agrupam por categoria (`dim_card.tipo`), uma linha e uma opção por categoria somando todos os `type_id` dela; o link antigo `tipo=<dígitos>` continua válido (decisão do dono P-097-7, K-272) (#321); o teste ponta a ponta do filtro no PostgreSQL acompanha o agrupamento (#324).
- Entradas: o passo de critérios do apontamento lê o `.env` da raiz sozinho, pelo novo script `bm:criterios-apontamento` (K-270) (#319); a falha do banco imprime só a categoria do erro, sem pilha nem dados de conexão, a data é validada como data civil e argumento a mais é recusado (K-271) (#325).
- Testes: o caso "o mock é criado uma só vez" de `simulado.test.tsx` deixa de ser intermitente (K-268) (#317).
- CI: os jobs com navegador (`e2e-parte`, `perf`, `e2e-homolog-parte`, `perf-homolog`) ficam em `ubuntu-24.04`, porque a imagem `ubuntu-latest` não resolve os espelhos do apt; voltam a `ubuntu-latest` quando a imagem 26 resolver (K-269) (#318).
- Web, nada simulado (pedido 099, ADR 0030): sai a opção simulado dos cartões (L2a) (#331); sai o código do simulador e o selo "Simulado" (L2b e L2c) (#342); o Catálogo e as notas deixam de falar em dado simulado ou fictício (L4) (#347); o código do mock não entra mais no build de uso diário (L2d) (#351). Cartão sem dado real mostra só "Sem dado real" e o motivo.
- Guardas da ADR 0030 contra a volta do simulado: G1 (o build de uso diário é recusado se levar código ou texto do mock) e G2 (só a escolha da fonte importa o mock fora dos testes) (#351); G3 (os testes ponta a ponta contra a API conferem que cartão sem dado real não mostra número) e G4 (painel inteiro sem dado real mostra só "Sem dado real") (#355).
- Filtros: ressalvas de UX da busca, com nome acessível no popover, contagem "de N", foco que não salta na folha do celular e anúncio das marcações fora da busca (K-278) (#341); o aviso "Marcada: X." não se repete no clique nem no Esc (K-284) (#346); as opções de tipo e prioridade usam o mesmo corte das listas (K-279) (#335).
- Sustentação: duas equipes cujo nome dá o mesmo identificador ficam sempre com o mesmo nome, independente do banco (K-288) (#352).
- Leia junto: espaço entre os links, para o alvo de toque não oscilar (K-292) (#354).
- Consultas só de leitura (K-275): o comando recusa `U&`, `UESCAPE` e funções `pg_` e `lo_` (K-277) (#338) e funções que executam texto como SQL (K-281) (#343).
- Referência: condição única do corte de cards e chamados, usada pelas listas e pelas opções; nenhum número muda (K-280) (#339).
- Testes: GRANT de `dim_card` sem `responsavel_id` (097 L2) (#340); as provas de GRANT tiram as colunas de pessoa de `COLUNAS_PESSOA`, a lista única (K-282) (#349).
- Testes: três specs do E2E contra a API acompanham os pedidos 097 e 099 (filtro de tipo pelo tipo que existe no dado real, sem selo fictício no T13 e no T14, equipe válida aceita nas tendências), sem afrouxar a checagem de dado de pessoa (K-273) (#357).
- Acelerato (pedido 099, D1a e K-305): os campos de etapa e a consulta B6-a usam os nomes exatos do Acelerato; campo de texto livre fica fora da lista fechada e é recusado, nunca chega à base (#368, #375).
- Coleta: falta de variável de ambiente lista os nomes que faltam, nunca o valor (K-304) (#372); a lista sai completa também com TLS desligado e prefixo de schema inválido é nomeado (K-311) (#376).
- Consultas só de leitura (pedido 099): a Q-RO-1 lê as tabelas com o filtro da view, que o papel do coletor não lê (#365).
- CI: o lint da CI e da homologação passa a cobrir o servidor, que antes só era lintado no `pnpm run pronto`; o `pronto` volta a verde na `develop` (K-315); teste no PostgreSQL do caminho prioridade até a severidade do card (K-306) (#378).
- Guardas da ADR 0030: ajustes depois do L2d na G1 e na G2 (K-294) (#373); o E2E COMP-12 exige "Sem dado real" no O17 (K-290) (#361); o teste de tempo do `classificarApontamento` mede CPU e fica estável sob carga (K-316) (#379); a `develop` volta a verde depois do D3 (#364).
- Contratos: o estado de origem `mock` passa a se chamar `sem-dado`, como já significava desde a ADR 0030; nenhum comportamento muda (K-296) (#362).

### Desempenho
- Métricas: `ehDiaUtil` consulta os feriados como número de dia, sem gerar texto por dia; nenhum resultado muda (teste de equivalência com o código antigo) (K-174, lote 1) (#316).

### Mudanças que quebram
- Contrato (pedido 075, lote 9b): o valor `bloqueio-sem-dado-real` sai do enum de `notas` de O1, O2 e O3 e de `TEXTO_NOTA_CARTAO`; aceite de uso único em `aceitas.json`, fotografado e removido no mesmo PR, sem `/api/v2`. A API não emite a nota desde o 6b e a web não a lê desde o 9a (#323).
- Migração 0035 (pedido 069, L9-c, decisão do dono D-L9-1): `previsao_retorno` de `dim_chamado` e `dim_chamado_versao` passa de `timestamptz` a booleano "tem previsão de retorno"; a coluna nunca foi projetada e está nula, a migração recusa a troca sem alterar nada se achar valor, e recria as três views que a leem (#238). `down` volta o tipo só com a coluna toda nula.
- A primeira coleta do Acelerato depois do L9-c recusa com `parametros-mudaram` até o reconhecimento: rode `pnpm coleta ac --reconhecer-mudanca` uma vez (o hash `fluxo_sha256` entrou nos parâmetros comparados) (#238).
- Contrato (pedido 099, L3): o campo opcional `simulavel` sai da resposta "sem dado real", e `podeSimular` e `METRICAS_SEM_SIMULACAO` saem do pacote de contratos; a web não lê o campo desde o L2a (#348).
- Aba Apontamento (097 L3): link antigo com `pessoa=` deixa de filtrar; o valor é ignorado e avisado como inválido (#345).
- Sustentação (097 L7a): os ids antigos de equipe `totvs`, `senior` e `fluig` seguem aceitos na URL e na API como apelido de `sssc-totvs`, `sssc-senior` e `sssc-fluig` por um ciclo de release (#344).
- Implantação: o papel da aba Apontamento passa a ler `dim_card.equipe` (coluna de time, não de pessoa). Sem migração nova; o GRANT é reaplicado pelo `db:migrate`, que precisa rodar na implantação desta versão (#337).
- Migração 0036 (pedido 099, D3): em `ref_alvo_prioridade`, as colunas de prazo passam a `prazo_pa_horas` e `prazo_r_horas` e entram `unidade_pa` e `unidade_r` (corrido ou útil, sem padrão). `down` recusa sem mudar nada se houver unidade `corrido` gravada (#363).
- Contrato (pedido 099, D3): `prioridades[].primeiroAtendimento.unidade` e `prioridades[].restauracao.unidade` obrigatórios no S1, com aceite de uso único; único consumidor é a web deste repositório (#363, #364). O S1 ganha `horasPorDiaUtil`, aditivo (D3b) (#371); o S12 ganha nota própria para a exceção de SLA nula (D9) (#370); `origemDaMetrica` `mock` vira `sem-dado` e `motivoDaOrigemMock` vira `motivoDaOrigemSemDado` (K-296) (#362).
- A primeira coleta do Acelerato depois desta versão recusa com `parametros-mudaram` até o reconhecimento, porque os nomes dos campos de etapa mudaram (D1a, K-305) (#368, #375). Veja "Ações do dono na base real".

### Mudanças de critério de cálculo
- 2026-11-04, aba Apontamento: limite do dia atípico passa de 16 h para 10 h; só marca, nunca descarta (decisão do dono, pedido 067; versão `067:limite-dia-atipico`) (#215).
- 2026-11-04, S8 (Acelerato): conta só incidentes com resposta; sem resposta sai do denominador e abaixo de 20 não publica (decisão do dono, pedido 066; versão `066:S8-com-resposta`) (#216).
- Pedido 065: versão de critério registrada em `core/criterios.ts` para BLOQUEADOS e O5 (#214).
- Lote L9-b: versão `069:L9-b-campos-etapa`, sem métrica afetada (#224). L3-a e L9-a não recalculam e ficam sem versão.
- Lote L7: o calendário passa a vir da referência; com o arquivo inicial nenhum número muda (teste de paridade); cada mudança do arquivo aplicada pelo `ref:sync-calendario` grava versão de critério do domínio, com data e marca (ADR 0027) (#222, #232). O simulado do 070 não entra em cálculo e fica sem versão.
- Pedido 075: versão de critério e corte da série do O1 com data pendente; sem dado real de bloqueio, BLOQUEADOS, O2, O19 e O5 seguem sem a parte de bloqueio (`BLOQUEIOS_COM_DADO_REAL` desligado) (#267). Lote 6b: a versão de critério do bloqueio com dado real ganha a data 2026-11-01 (primeira coleta real do BusinessMap), que também corta a série do O1; o interruptor liga e BLOQUEADOS, O1, O2, O5 e O19 passam a calcular a parte de bloqueio; T10 e T12 seguem fora (#298).
- Pedido 077: janela incompleta, contagem parcial e ressalva do S2 marcadas nas tendências; as marcações herdam a versão de critério (#251, #262, #272, #276). Lotes 5 e 7: versões de critério de `TENDENCIA_FLUXO` e `TENDENCIA_SUST` com data 2026-11-10, ao passarem para dado real (#279, #285).
- Pedido 089, aba Apontamento: o bit `sem-vinculo` só liga para apontamento sem comentário e sem regra por tipo; comentário não reconhecido deixa de contar como falha de qualidade. Versão `089:sem-vinculo-so-sem-comentario`, com a data da primeira varredura completa, gravada por `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data>` (INSERT idempotente, sem editar as versões 059 e 067); a releitura gera versão nova na staging e não sobrescreve histórico (#293). Ordem de implantação, no mesmo dia: 1) `ref:sync` do dicionário v3; 2) `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data da primeira varredura completa>`; 3) coleta com janela de 12 meses. Rodar 1 e 2 em dias diferentes gera duas marcas T2.6 para a mesma mudança.
- Pedido 099, D3: a versão de critério dos alvos do Acelerato é gravada pelo `ac:ref-sync` ao carregar o arquivo, com data da carga, e marca o S1 e a Visão geral (#363).
- Pedido 099, D3b: o dia útil de 528 min do Acelerato vale a partir da vigência gravada pelo `ref:sync-calendario`, que registra a versão de critério do domínio Acelerato (ADR 0027) (#371).
- Pedido 099, C8a: a versão de critério do de-para de severidade é gravada pelo `bm:ref-sync` e marca o O16 (#369).
- Pedido 099, D9: versão `criterio-2026-11-12-s12-volume-real` (2026-11-12), marca o S12 (#370).

### Dependências e Forge
- `zod` 4 e `ws` 8.22.0 para 8.22.1 (#218).
- Forge 0.32.0 (#223). Sem dependência nova; `server/package.json` ganha só o script `ref:sync-calendario` (#222).
- Forge 0.33.0, 0.34.0, 0.42.0, 0.44.2, 0.45.2 e 0.45.5 (#239, #250, #271, #275, #281, #296).
- Dependências: grupos `producao` (#256) e `dev-dependencies` (#255) do Dependabot; `body-parser` 1.20.9, `qs` 6.16.1 e `ip-address` 10.7.4 no lockfile (pedido 073, E8) (#242).
- Forge 0.46.0 (pedido 102) (#374). Sem dependência nova.

### Ações do dono na base real depois desta release
Na base real, depois do merge na `main`, nesta ordem (cada carga grava a própria versão de critério com a data em que roda):
1. `pnpm run db:migrate`: aplica a migração 0036 e reaplica os GRANTs.
2. `pnpm --filter @metricas-dspd/server run ref:sync-calendario`: grava os turnos do dia útil de 8 h 48 da Sustentação (D3b).
3. `pnpm --filter @metricas-dspd/server run ac:ref-sync`: carrega os alvos de prioridade do PROC com a unidade de cada prazo (D3).
4. `pnpm --filter @metricas-dspd/server run bm:ref-sync`: carrega o de-para da prioridade do BusinessMap para a severidade (C8a).
5. `pnpm run coleta ac --reconhecer-mudanca`, uma vez: reconhece a mudança dos nomes dos campos de etapa (D1a, K-305); sem isso a coleta do Acelerato para com `parametros-mudaram`.
6. Coleta do BusinessMap e do Acelerato como de costume, para o projetor gravar a severidade e o prazo combinado dos cards.

## [0.2.0] - 2026-10-29

### Adicionado
- Painel Operacional: métricas operacionais do lote 3 (O19 a O26) (#152).
- Cadastro simulado de membros no mock, com ids opacos e sem dado de pessoa, e T14 sem agregado dedutível (K-112, K-130) (#161).
- Trava de suíte única, comum a todas as worktrees (#156).
- Contrato da O23 em `docs/contratos/metricas/O23.md`, sem lacunas e com as regras decididas pelo dono (K-093, K-180) (#163, #164).
- CI e homologação: E2E dividida em 2 partes com agregador (#154, #159); `homolog-aprovada` sem espera paga e reavaliação por `workflow_run` (K-108) (#153); proteção da `develop` pelo ruleset 25003880 com 9 checks (K-148) (#148).
- Documentação: textos do lote 3 das métricas também disponíveis (K-154) (#155); política do Dependabot (K-169) (#160); leitura de "enviada" como PR para a `develop` (K-162) (#157).

### Corrigido
- Web: `develop` voltou ao verde após o Dependabot (`no-deprecated` do `matchMedia`, aquecimento do teste da PV1) (K-151) (#149).
- Teste do servidor `SELECT *` que estourava 30 s (K-150) (#158).
- Testes E2E do 041 estabilizados (F4, helper único, Monte Carlo, CLS) (#150).

### Desempenho
- Nenhuma mudança nesta versão.

### Mudanças que quebram
- Contrato do resultado da T14 (`resultadoT14`): união discriminada por `oculto`; o bloco oculto traz só `meuTime.k` e o visível traz `outrosTimes` inteiro. Aceito pelo dono (T14-M1 = B e Q-T14-12 = B), sem consumidor publicado (#161).

### Mudanças de critério de cálculo
- 2026-10-28, T14: `total` do bloco, `base.n` e `base.complemento.n` passam a somar só os times visíveis; time oculto não entra em soma. Visíveis ordenados por total decrescente e código; ocultos depois, só por código (T14-M1 = B, Q-T14-12 = B, K-130) (#161).

### Dependências e Forge
- `react-router` 7.18.4 para 8.5.0 (#147); `@tanstack/react-query` 5.104.2 para 5.104.5 (#146); `typescript-eslint` 8.71.2 para 8.72.0 (#145).
- Forge atualizado para 0.30.3 (#151) e registrado em 0.30.5 (#162).

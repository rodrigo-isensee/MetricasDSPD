# Plano de testes - aba Apontamento (pedido 059, E2.7, trilha D1)

Estado: **plano antecipado** (escrito da especificação, sem ler o código do autor; skill `qa-testing`, "Plano antecipado"). Não é parecer: o parecer sai por PR (α, β, γ, δ), sobre o commit final e depois do review, em `docs/qa/059-<pr>.md`. Nenhum nome de pessoa, comentário real ou chave real neste documento nem nas fixtures (ADR 0020); só marcadores sintéticos.

Links:
- Especificação de UX: `docs/ux/059-aba-apontamento.md` (CA-1 a CA-11, §5).
- Modelo de ameaças e casos de abuso: `docs/security/059-aba-apontamento-ameacas.md` (CA-AP-1 a CA-AP-13, §7).
- Plano técnico e contrato zod v1: `docs/architecture/features/059-aba-apontamento.md` (§3 desenho, §3.9 contrato, §7 trilhas e PRs).
- Decisões do dono que o plano trata como obrigação: o1 a o4 (§1.3 do plano técnico), finalidade das horas, piso de 20, ordem neutra, nome real só com `APONTAMENTO_NOMES`, retenção "A".

## 1. Escopo
Coberto: os 11 critérios de UX (CA-1 a CA-11), os 13 casos de abuso (CA-AP-1 a CA-AP-13), as cláusulas o1 a o4, a carga incremental do worklog (nunca sobrescrever, remoção por marca), a regra de piso de 20 (`MINIMO_AMOSTRA`), a regra "BusinessMap e Acelerato nunca se misturam" na aba, o cálculo só pela T2.5, a acessibilidade WCAG 2.2 AA e o teclado.

Não coberto neste plano (fora do prazo por decisão do plano técnico §7.4, ou de outro dono):
- capacidade por vigência (M-5), categoria de tempo como fonte do subgrupo, expurgo automático por prazo, limite de taxa na rota, lista "Ver apontamentos" (M-12), login pelo AD;
- carga real com dado real (PE-6) e validação do dono (PE-8): são do dono; o QA só confere a carga contra o servidor falso;
- correção da regra de negócio do dicionário de subgrupo (conferência do dono, PE-5): o QA testa o mecanismo (casamento, normalização, prioridade) com dicionário sintético, não a verdade do dicionário;
- parecer de segurança (R-SEGURANCA): é do security-engineer; aqui só o código de teste dos casos de abuso.

Regra de dado: **E2E e CI só com mock de pessoas fictícias** (AP-8). Nenhum teste lê o `.env`, chama o BusinessMap real nem grava resposta bruta. Saída de E2E (screenshot, trace, vídeo) só com as pessoas fictícias.

## 2. Mapa por PR (onde cada caso nasce)
| PR | Conteúdo (plano §7.2) | Casos que chegam com ele |
|---|---|---|
| α `feature/059-contrato-biblioteca` | B1 contrato zod, B2 `classificarApontamento`, B3 cálculos T2.5 | contrato (CA-6 dado, CA-9 forma, CA-11 forma), CA-3, CA-7, CA-9, CA-10, CA-11 e CA-AP-9/CA-AP-12 no nível da biblioteca; bundle do `web/` sem biblioteca |
| β `feature/059-coleta-worklog` | A1 migrações e grants, A2 cliente e allow-list, A3 coleta e projetor, A4 eliminação | CA-AP-1 (parte coletor), 2, 3 (coletor), 8, 9, 10, 11, 13 |
| γ `feature/059-rota-apontamento` | B4 papel, pool, rota única, interruptor | CA-AP-1, 3 (rota), 4, 5, 6, 7 (cabeçalho), 12; CA-10 no DTO |
| δ `feature/059-aba-front` | C1 e C2, tela | CA-1 a CA-11 (tela), CA-AP-7 (exportação e `localStorage`), CA-AP-12 (tela), acessibilidade |

Ordem de execução do QA (D2): α, β, γ, δ, uma suíte por vez (`pnpm run pronto`, teto de 8 GB). E2E da aba (D3) só contra mock, depois do δ.

## 3. Critérios de UX (CA-1 a CA-11): critério, teste, PR, fronteira
Formato do ID: `CT-nn`. Nível: U = unitário/biblioteca, C = contrato, I = integração de API, E = E2E (Playwright), A = acessibilidade (axe com tags WCAG 2.2 AA). Prioridade: A alta, M média.

| CA | CT | O que prova (e o que precisa quebrar para falhar) | Fronteira protegida | Nível | PR | Pri. |
|---|---|---|---|---|---|---|
| CA-1 | CT-01 | Ao abrir a aba aparecem o selo de frescor BusinessMap com ícone **e** texto e o período "Dados de AAAA-MM-DD a AAAA-MM-DD". Falha se o selo faltar, vier só com cor ou não mostrar o período. | frescor atrasado (coleta velha: texto "Atrasado: última coleta há N h"); fonte única BusinessMap (nenhum chip Acelerato) | E | δ | A |
| CA-1 | CT-02 | Selo: três estados (em dia, atrasado, sem coleta) com texto distinto, sem depender de cor (axe `color-contrast`, ícone presente). | sem coleta nenhuma | E, A | δ | M |
| CA-2 | CT-03 | Filtros que zeram o recorte: `EstadoVazio` "Nenhum apontamento encontrado", botão "Limpar filtros" e um "Remover filtro X" para **cada** filtro ativo; remover um filtro restaura o recorte. Falha se faltar um botão ou se remover o errado. | zero itens; um filtro; os sete filtros ativos ao mesmo tempo | E | δ | A |
| CA-2 | CT-04 | Rota com recorte vazio devolve 200 com `n=0` por bloco e listas vazias (nunca 404 nem 500) e frescor preenchido. | zero apontamentos | I | γ | A |
| CA-3 | CT-05 | Biblioteca: recorte de 19 apontamentos devolve `status: 'insuficiente'` (sem `pct`) para percentual de qualidade e utilização; 20 devolve `ok` com `pct`. Soma de horas e contagem seguem presentes nos dois. Falha se o piso virar `<=` ou `<`. | 0, 1, **19, 20, 21** apontamentos | U | α | A |
| CA-3 | CT-06 | Contrato zod rejeita `status:'insuficiente'` com `n>=20` e `status:'ok'` com `n<20`, e rejeita `pct` em `insuficiente`. | `n` = 19 e 20 | C | α | A |
| CA-3 | CT-07 | Tela com fixture de 19 apontamentos mostra `AmostraInsuficiente` no lugar de percentual e utilização, e ainda mostra a soma de horas e a contagem; com 20, mostra o percentual. | 19 e 20 na tela | E | δ | A |
| CA-4 | CT-08 | Cada um dos sete filtros (Pessoa, Mês/período, Tipo, Subtarefa, Subgrupo, Projeto, Qualidade) grava na URL e atualiza só os cartões que o aplicam; recarregar a página e "voltar" do navegador restauram o filtro. Falha se um filtro não persistir na URL ou se alterar cartão que não o aplica. | filtro vazio, filtro múltiplo, valor inexistente na URL (cai em estado limpo com aviso, sem 500) | E | δ | A |
| CA-4 | CT-09 | O mapa de calor ignora todo filtro exceto Pessoa e o chip do cartão diz "não afetam: ..."; mudar Tipo não muda nenhuma célula do mapa. | filtro que o cartão não aplica | E | δ | A |
| CA-4 | CT-10 | Filtro de pessoa na URL é `pessoaRef` (`p<n>`), nunca nome nem `user_id`; o nome da pessoa nunca aparece em `location.search` (URL) nem em `localStorage`/`sessionStorage`. | URL e armazenamento do navegador | E | δ | A |
| CA-5 | CT-11 | Matriz pessoa × categoria com seletor (grupo de botões rádio) Tipo, Subtarefa, Subgrupo: um nível por vez, o nível na URL, nunca dois níveis no mesmo gráfico; a soma da linha bate com a soma do nível escolhido. Falha se dois níveis coexistirem ou se a troca mantiver o nível anterior. | os três níveis, um de cada vez; nível inválido na URL | E | δ | A |
| CA-5 | CT-12 | Rota recusa `nivelMatriz` fora de `tipo|subtarefa|subgrupo` (400) e devolve um só nível por resposta. | valor fora da lista | I | γ | M |
| CA-6 | CT-13 | **Todo** gráfico da aba, incluindo o mapa de calor, tem "Ver como tabela" com os mesmos números (comparação célula a célula com o contrato). Falha se um cartão não oferecer a tabela ou se ela divergir do gráfico. Guarda de suíte vazia: o teste afirma pelo menos 9 cartões com tabela (a lista do §1.1 do UX: KPIs, projeto, tipo, subgrupo, qualidade geral, qualidade por pessoa, matriz, capacidade mensal, capacidade por pessoa, achados, mapa; margem de 2). | cartão sem dado; mapa de calor com 60 dias | E | δ | A |
| CA-7 | CT-14 | Biblioteca: soma do dia da pessoa acima do limite configurado (padrão 16 h, P-4 do UX) vira flag `valor-atipico`; 16 h exatas não; 16 h + 1 s sim; o apontamento não é descartado e continua na soma (P-5 da segurança) salvo `anomalos=ocultar`. | 15 h 59 min 59 s, 16 h, 16 h 00 min 01 s, **115 h**; limite configurável alterado | U | α | A |
| CA-7 | CT-15 | Tela marca "Possível erro de apontamento" com texto **e** ícone no mapa e na tabela; a escala de cor do mapa **não** é esmagada pelo valor de 115 h (faixas fixas, M-6); "Ocultar anômalos" tira o valor dos totais e volta ao desmarcar. | 115 h num dia; célula só com anomalia | E | δ | A |
| CA-8 | CT-16 | Em 375 px a página não tem rolagem horizontal (`document.documentElement.scrollWidth <= innerWidth`), a rolagem horizontal existe só dentro do bloco do mapa, e a coluna da pessoa e a de total ficam fixas. Falha se a página rolar. | 375 px, mapa de 60 dias, nome de pessoa longo (fixture de 200 caracteres) | E | δ | A |
| CA-8 | CT-17 | Alvos de toque dos filtros >= 44 px em 375 px; a barra recolhe em "Filtros (n)". | 375 px | E | δ | M |
| CA-9 | CT-18 | Contrato: o schema da utilização por pessoa **não tem** campo de meta, faixa, status, semáforo nem média da equipe por pessoa (teste estrutural do schema: lista de chaves permitidas, falha se surgir uma chave nova); utilização sem teto (pode passar de 100%). | utilização > 100%; utilização com 19 apontamentos (insuficiente, o3) | C, U | α | A |
| CA-9 | CT-19 | Tela: utilização por pessoa sem cor de bom/ruim (todas as barras com o mesmo tom, afirmação por estilo computado), sem texto "acima/abaixo da média", sem meta, com o selo "Comparação relativa; não é jornada total". | utilização 40%, 100%, 130% (mesma aparência) | E | δ | A |
| CA-10 | CT-20 | De-para por id: dois `user_id` diferentes com o **mesmo nome** viram duas `pessoaRef` distintas; a variação de grafia do mesmo `user_id` entre coletas dá uma só pessoa. Falha se juntar por nome. | nomes iguais, grafia diferente, acento | U, I | α, γ | A |
| CA-10 | CT-21 | Pessoa sem de-para resolvido aparece como "Pessoa não identificada" (`identificada:false`), sem juntar duas pessoas sem de-para num só rótulo ambíguo (cada uma com a própria `pessoaRef`, o rótulo repete mas as linhas ficam separadas) e sem usar outro nome. | duas pessoas sem de-para no mesmo recorte | I, E | γ, δ | A |
| CA-11 | CT-22 | Biblioteca: os achados são gerados do recorte; trocando a fixture, o texto muda; nenhum número fixo no código (mutação: trocar o limiar muda o achado); **nenhum nome de pessoa** no texto do achado (o nome-marcador da fixture não aparece em `achados[]`). | recorte sem achado (lista vazia), recorte com todos os códigos de achado | U | α | A |
| CA-11 | CT-23 | Tela: cada achado mostra a frase do código (H1) com os números do contrato; o número do achado bate com o do cartão ao lado (consistência). | achados vazios (C-1: bloco some, sem erro) | E | δ | M |

## 4. Cláusulas o1 a o4 e regras do projeto (obrigações além dos CA-n)
| ID | Obrigação | Teste | PR | Pri. |
|---|---|---|---|---|
| CT-24 | o1: ordem neutra. Lista de pessoas em ordem alfabética do rótulo (com nomes desligados, "Pessoa n" na ordem de `pessoaRef`); "Ordenar por total" é ação explícita e local (não refaz a chamada, não grava a ordem na URL de modo a virar padrão). Fronteira: acentos e maiúsculas na ordenação (`Álvaro` antes de `Bruno`), empate. | U (rota/biblioteca), E | γ, δ | A |
| CT-25 | o2: sem semáforo, faixa de bom ou ruim nem comparação com a média por pessoa: coberto por CT-18 e CT-19; acrescenta busca textual de "média da equipe" nos cartões por pessoa. | E | δ | A |
| CT-26 | o3: piso por pessoa. Pessoa com 19 apontamentos na janela: só soma e contagem; com 20: percentual. A contagem é por pessoa, não do recorte inteiro (recorte com 100 apontamentos e pessoa com 5 não mostra percentual dela). | U, I, E | α, γ, δ | A |
| CT-27 | o4: aba fora da exportação. O diálogo de exportar não lista a aba/cartões do Apontamento e a exportação de qualquer outro painel não inclui dado da aba; não existe botão de CSV na aba. | E | δ | A |
| CT-28 | Horas só em segundos inteiros no contrato (C-3); o front só formata: 3 600 s mostra "1 h"; 5 400 s mostra "1,5 h"; soma de milhares de apontamentos sem erro de ponto flutuante. | U, E | α, δ | M |
| CT-29 | BusinessMap e Acelerato nunca se misturam: a rota e as tabelas da aba não aceitam nem devolvem chamado do Acelerato; teste estrutural (`import` cruzado `businessmap`/`acelerato` na biblioteca da aba falha o lint; a fronteira existente cobre, o teste afirma que ela alcança a pasta nova). | U (estático) | α | A |
| CT-30 | Cálculo só pela T2.5: teste estrutural que falha se `server/src/modulos/apontamento/` ou `web/src/features/apontamento/` dividir, somar percentual ou calcular dia útil por conta própria (varredura por `/`-divisão sobre campos de horas é frágil: critério = o front não importa `@metricas-dspd/metricas`, regra de lint existente, e a rota só repassa o que a biblioteca devolve; afirma-se por comparação rota × biblioteca com a mesma fixture). | I | γ | A |
| CT-31 | Mudança de critério (dicionário, calendário) aparece em `criterios[]` com data e é marcada no gráfico (T2.6); ao subir a versão do dicionário, o cartão mostra a marca. | I, E | γ, δ | M |
| CT-32 | Capacidade por pessoa: dias úteis com feriados (calendário da referência, nunca `FERIADOS_NACIONAIS` provisório) × `horasPorDia`; fim de semana e feriado em cinza no mapa, distinto de "dia útil sem apontamento" (M-8). Fronteiras: feriado em dia de semana, feriado no fim de semana, primeiro e último dia da base, mês corrente cortado na data da última coleta (C-7), fevereiro bissexto. | U, E | α, δ | A |
| CT-33 | Classificação (`classificarApontamento`, §3.4): normalização (minúsculas, sem acento, espaços colapsados), casamento por **início de palavra** (C-6; "reuniao" casa "reuniões", não casa "areunião"), prioridade do subgrupo, comentário vazio, só espaços, 10 000 caracteres, emoji, `\u0000`, surrogate isolado. Função pura: duas chamadas iguais dão o mesmo resultado; não registra log. Property test: nunca lança e a saída é sempre de lista fechada. | U | α | A |
| CT-34 | Flags de qualidade: `sem-comentario`, `generico` (até 3 palavras; 3 sim, 4 não), `sem-vinculo`, `sem-iniciativa`, `valor-atipico`; flags não excludentes (soma de percentuais pode passar de 100%, a nota do cartão diz isso, M-11); "completo" = nenhuma flag. | U, E | α, δ | M |
| CT-35 | Hierarquia até a iniciativa (`dim_card_raiz`): cadeia simples, card sem pai (é a própria raiz), ciclo (guarda), profundidade 10 e 11, pai fora do escopo (`raiz_fora_do_escopo`, rótulo "Fora dos quadros coletados"), pai do tipo Sprint não vale. | I (PG) | β | A |
| CT-36 | Carga incremental: marca d'água própria `bm_apontamento`; a coleta de apontamentos não roda se a de cards falhou; sobreposição de 1 h relê sem duplicar; segunda execução sem mudança grava 0 linhas novas. | I (PG) | β | A |
| CT-37 | Cota: o cliente respeita o limitador local (<= 25/min) e a exclusão mútua com a coleta de cards; 429 do servidor falso vira espera e nova tentativa, 401/403 interrompem **sem retry** (A2 do 052); o lote de `card_ids` tem no máximo 200. | I | β | A |
| CT-38 | Frescor e janela: rota rejeita `de`/`ate` com janela > 366 dias, `de > ate`, só um dos dois, data impossível (`2026-02-30`), `diarioDe/diarioAte` > 62 dias; erro sem eco do valor. | I | γ | A |

## 5. Casos de abuso (CA-AP-1 a CA-AP-13), em arquivo do QA
Arquivos de teste próprios do QA (independentes dos do node-backend), nomeados `server/tests/qa-059-*.test.ts` e `server/tests/qa-059-*.pg.test.ts`; sem gatilho de segurança zerado: a aba tem os gatilhos dados-pessoais, credencial-externa e banco (plano técnico, frontmatter).

| CA-AP | CT | Entrada e caminho | Resultado esperado (o que quebra o teste) | Fronteira | PR | Pri. |
|---|---|---|---|---|---|---|
| CA-AP-1 | CT-40 | Conexão com o papel `dspd_api` tenta `SELECT` em `dim_responsavel`, em `fato_apontamento`, `stg_apontamento`, `evt_apontamento`, `dim_card_raiz`, `ref_apontamento_*` e em cada coluna de `COLUNAS_PESSOA` (inclusive `pessoa_ref`). | Permissão negada em **todas**; o teste de grants de K-085 segue verde. Quebra se uma tabela da aba entrar em `paraApi`. Inverso: `dspd_api_apontamento` é **negado** em `stg_`, `evt_`, `ctl_`, `dim_card*` (fora das colunas listadas), `responsavel_id` e `user_id`; e nega `INSERT/UPDATE/DELETE` em tudo. | tabela nova; coluna nova | β (negado ao `dspd_api` desde as migrações), γ (papel novo) | A |
| CA-AP-2 | CT-41 | Worklog do servidor falso com `comment` contendo o marcador `MARCADOR-COMENTARIO-059`, `reporter`, e-mail `marcador059@exemplo.invalido`, chave desconhecida `campo_novo_059`. Percorre cliente, coletor, staging, projeção, log e `ctl_coleta_falha`. | Só as chaves da allow-list e a classificação de lista fechada chegam à base; marcador, e-mail, `reporter`, `campo_novo_059` ausentes de **todas** as tabelas (varredura de `information_schema` + `SELECT` em todas as colunas texto/jsonb), do log capturado e de `ctl_`. Quebra se o `comment` for gravado em qualquer coluna, hash incluído. | comentário só em memória | β | A |
| CA-AP-3 | CT-42 | Fixture com nome-marcador `PESSOA-FICTICIA-MARCADOR-059` em `/users` e na resposta da rota, com erro forçado (zod inválido, falha do banco, timeout). | Marcador só na resposta autorizada da rota (com `APONTAMENTO_NOMES` ligado); nunca em log, `ctl_coleta_falha`, mensagem de erro, exceção, `redact` do pino (testa `*.responsavel_nome`, `*.realname`, `*.comment`, `*.comentario`). | log e erro | β, γ | A |
| CA-AP-4 | CT-43 | Rota com `APONTAMENTO_NOMES` desligado, ligado, valor inválido (`talvez`, vazio) e ausente. | Desligado ou ausente (padrão): nenhum nome, só "Pessoa n" estável por `pessoaRef`; ligado: nome só em `pessoas[].rotulo`; valor inválido: a partida **falha** (zod). Ligado fora do perímetro permitido (host não local): a partida recusa (R4-5; plano §5, R-5). Qualquer outra rota nunca devolve nome. | padrão desligado; ambiente fora da máquina do dono | γ | A |
| CA-AP-5 | CT-44 | Varredura do OpenAPI (e do contrato) de toda rota fora da aba. | Nenhum campo de nome, `responsavel_id`, `user_id` do BusinessMap ou `pessoaRef` em DTO fora da aba. Guarda de suíte vazia: afirma pelo menos N rotas varridas (N do dia menos 2). | rota nova | γ | A |
| CA-AP-6 | CT-45 | Query com parâmetro desconhecido, nome de pessoa em vez de `pessoaRef`, mês inválido, filtro com texto livre, `'; DROP TABLE`, valor de 10 000 caracteres, lista com 201 itens, `pessoa=p0`, `pessoa=p1,p1`. | 400 pelo `strict`; nenhuma consulta ao banco executada (contador do duble de banco); nenhum eco do valor na resposta nem no log. | cada limite de lista (200, 50, 6) e +1 | γ | A |
| CA-AP-7 | CT-46 | Exportação da aba (PDF, imagem, CSV), persistência do filtro de pessoa e cabeçalhos. | Sem opção de CSV e sem linhas brutas por pessoa e dia; aba fora da exportação (o4); `localStorage` e `sessionStorage` sem pessoa; resposta com `Cache-Control: no-store`; sem CORS aberto (`Access-Control-Allow-Origin` ausente). | cache, URL, armazenamento | γ (cabeçalhos), δ | A |
| CA-AP-8 | CT-47 | Mesmo apontamento coletado duas vezes; editado (horas diferentes); removido na origem (evento `logged_time_deleted` e, na falta dele, varredura de presença). | Uma linha por `logged_time_id` no fato; edição cria versão (`versoes` +1) sem `UPDATE` na staging; remoção marca `excluido_em` e `evt_apontamento`, **sem** `DELETE`; histórico preservado; o removido sai das somas. | duplicidade; edição para o mesmo valor (nenhuma versão nova) | β | A |
| CA-AP-9 | CT-48 | Apontamento de **115 h num dia** (vários apontamentos que somam 115 h e um único de 115 h), horas <= 0, `time` = 86 400 e 86 401 s, data futura (hoje + 1 dia; hoje), id fora da forma (`abc`, vazio, 13 dígitos). | Soma diária acima do limite: aceita, marcada `valor-atipico`, nunca descartada em silêncio; `time` > 86 400, <= 0, data futura, id inválido: **recusados** com `ctl_coleta_falha` (código e `id_origem`, nunca o valor) e coleta `parcial`; a coleta **não** cai. | 0, 1, 86 400, 86 401; hoje e amanhã | β, α (flag) | A |
| CA-AP-10 | CT-49 | Procedimento de eliminação de uma pessoa (migrador). Sujeito ao corte C-4 do plano (§7.4); se cortado, o teste fica `pendente de cartão` registrado no parecer, nunca `skip` mudo. | Linha de `dim_responsavel` apagada, `pessoa_ref` anulada no fato, horas preservadas como agregado do time, valor de métrica não sobrescrito, id não relido na coleta seguinte (não recria a pessoa). | pessoa com 0 apontamentos; pessoa inexistente | β | M |
| CA-AP-11 | CT-50 | Cliente HTTP: caminho do worklog fora da lista, método diferente de GET (`POST`, `PUT`, `DELETE`), `fields` com `comment` fora do fixo, caminho com `..`, redirecionamento 302 para outro host. | Recusado **antes** de enviar (nenhum pedido chega ao servidor falso, contador = 0); redirecionamento não é seguido; o host é só o de `BUSINESSMAP_URL_BASE`. | caminho; método; host | β | A |
| CA-AP-12 | CT-51 | Pessoa com 19 e com 20 apontamentos na janela, na rota e na tela. | 19: sem utilização nem percentual, só soma e contagem; 20: com. Contagem na janela do filtro ativo (muda ao mudar o período). Coincide com CT-26. | 19 e 20 | α, γ, δ | A |
| CA-AP-13 | CT-52 | Teste estrutural dos `INSERT` do worklog e do esquema. | Falha se um `INSERT` gravar chave fora da constante `CAMPOS_APONTAMENTO` ou se existir coluna `text`/`varchar`/`jsonb` de texto livre em `stg_apontamento`/`fato_apontamento` (lista fechada de colunas esperadas; coluna nova derruba o teste até ser justificada). | coluna nova | β | A |

## 6. Erros, falha da API, permissões, teclado e acessibilidade
| ID | Cenário | Tipo | PR | Pri. |
|---|---|---|---|---|
| CT-60 | Falha da rota (500, timeout, rede): erro **por cartão** com "Tentar de novo"; os outros cartões e o cabeçalho seguem; nova tentativa funciona. A mensagem não mostra detalhe técnico nem dado de pessoa. | E (rota interceptada) | δ | A |
| CT-61 | Estado de carregamento: esqueleto com altura reservada, sem salto de layout (CLS ~ 0 medido). | E | δ | M |
| CT-62 | Resposta que viola o contrato (campo extra, `pessoaRef` inválida, `status` desconhecido): o front não quebra, mostra o erro do cartão; o contrato `strict` registra. | C, E | α, δ | M |
| CT-63 | Permissão: **sem papel/autenticação** (decisão C: qualquer usuário do painel vê a aba). Teste afirma que não há tela de acesso negado e que a rota responde sem credencial; o teste de rede (CT-43) guarda que o nome real só sai com o interruptor ligado dentro do perímetro. Não há "usuário sem permissão" para testar. | I, E | γ, δ | A |
| CT-64 | Teclado: percorrer a aba só por Tab/Shift+Tab/setas/Enter/Espaço: índice "Ir para", filtros (`FiltroMulti`), seletor da matriz (rádio com setas), "Ver como tabela", "Tentar de novo", "Ordenar por total", células do mapa com setas e leitura "Pessoa A, 12/08, 6,5 horas"; foco visível, ordem lógica, sem armadilha de foco, `Esc` fecha diálogos. | E | δ | A |
| CT-65 | Acessibilidade automática (axe, tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) em cada estado da aba: carregada, vazia, amostra insuficiente, erro, com anomalia, mapa com tabela aberta, 375 px, nome real ligado. **Zero violações críticas ou sérias.** Contraste 3:1 entre faixas do mapa e 4,5:1 do texto da célula; flags com texto e ícone. | A | δ | A |
| CT-66 | `prefers-reduced-motion` respeitado (sem animação de entrada com a preferência ligada). | E | δ | M |
| CT-67 | Aviso de nome real: com `nomesReais=true` a aba mostra o aviso e a legenda da finalidade (capacidade e qualidade do apontamento, "não avaliação individual"); com `false` mostra "Pessoa n" e **não** mostra o aviso. | E | δ | A |
| CT-68 | Ocultar cartão por preferência (ids `ap-*`, contrato do 007): ocultar e reexibir; id novo sem migração de estado salvo; pessoa não persistida junto. | E | δ | M |
| CT-69 | Bundle: o `web/` não importa `@metricas-dspd/metricas` fora de `data/mock/**` (lint existente) e a biblioteca da aba não entra no bundle da rota (teste de bundle do B2). | estático | α, δ | A |
| CT-70 | Caracteres especiais e limites no texto exibido: rótulo de projeto de 200 caracteres, com `<script>`, emoji, RTL e aspas: renderizado como texto (sem HTML), truncado com título acessível, sem quebra de layout. | E | δ | A |

## 7. Fixtures sintéticas (D1)
Tudo inventado e marcado como teste; nenhuma fixture contém nome, comentário ou id reais (ADR 0020). Ids numéricos na faixa `9 000 000 000+` para nunca colidir com id real. Marcadores: `MARCADOR-COMENTARIO-059`, `PESSOA-FICTICIA-A` a `PESSOA-FICTICIA-F` (e `-MARCADOR-059` para o caso de log), `marcador059@exemplo.invalido`.

Arquivo sugerido: `server/tests/fixtures/apontamento-worklog.ts` (fábrica `linhaWorklog(sobrescrever)` + cenários nomeados), reutilizado pelo servidor falso e pela biblioteca; fixture tipada do front: a do §3.9 (a do C1), separada, **sem** reaproveitar a do servidor.

| Fixture | Conteúdo | Casos que a usam |
|---|---|---|
| F-BASE | 6 pessoas fictícias (`p1` a `p6`), 30 dias úteis, apontamentos de 0,5 h a 8 h, três tipos de card, dois subgrupos, uma subtarefa; soma por pessoa >= 20 apontamentos para a maioria | CT-05, 08, 11, 13, 19, 24 |
| F-MARCADOR | worklog com `comment: "MARCADOR-COMENTARIO-059 ..."`, `reporter`, `email` e `campo_novo_059` | CT-41 (CA-AP-2) |
| F-115H | um dia com 115 h para uma pessoa (um apontamento de 115 h e, separado, 30 apontamentos de 3 h 50 min no mesmo dia) | CT-14, 15, 48 |
| F-FUTURA | apontamento com data de amanhã, outro de hoje, outro de ontem | CT-48 |
| F-LIMITES-HORA | `time` = 0, -1, 1, 86 400, 86 401, não inteiro (`1.5`), string `"3600"`, `null` | CT-48 |
| F-IDS-RUINS | `logged_time_id` = `abc`, vazio, 13 dígitos, `0`, com espaço | CT-48 |
| F-EDITADO | o mesmo `logged_time_id` em duas coletas, horas 2 h e depois 3 h; um terceiro caso com `updated` mas horas iguais | CT-47 |
| F-EXCLUIDO | apontamento presente na coleta 1, ausente na 2, com e sem evento `logged_time_deleted` no histórico | CT-47 |
| F-DUPLICADO | dois apontamentos distintos com mesma data, card, pessoa e horas (ids diferentes): **ambos contam** (nunca deduplicar por combinação, C-4) | CT-47 |
| F-19-20 | pessoa com exatamente 19 apontamentos e outra com 20; recorte total de 100 | CT-05, 07, 26, 51 |
| F-VAZIO | zero apontamentos; filtros que zeram o recorte | CT-03, 04 |
| F-HOMONIMOS | dois `user_id` com o mesmo nome; mesmo `user_id` com grafias diferentes; um `user_id` sem retorno em `/users` | CT-20, 21 |
| F-NOME-LONGO | rótulo de pessoa e de projeto com 200 caracteres, `<script>`, emoji | CT-16, 70 |
| F-HIERARQUIA | cadeia de 3 níveis, card sem pai, ciclo A→B→A, cadeia de 10 e de 11, pai fora do escopo, pai Sprint | CT-35 |
| F-CALENDARIO | feriado em dia útil, feriado em sábado, fevereiro bissexto, mês corrente, calendário só com nacionais | CT-32 |
| F-COMENTARIOS | comentários vazios, só espaços, 1, 3, 4 palavras, acentos, maiúsculas, `reuniões`, `areunião`, 10 000 caracteres, `\u0000`, surrogate isolado, emoji | CT-33, 34 |
| F-CONTRATO-RUIM | respostas com campo extra, `pessoaRef` inválida, `status` desconhecido, `pct` com `n<20` | CT-06, 62 |

## 8. Servidor falso dos três caminhos (D1)
Extensão de `server/tests/businessmap-coleta-duble.ts` (o servidor falso e o banco falso do 052/F3), sem arquivo novo de servidor se possível; se o autor preferir arquivo próprio, a mesma interface (`ServidorBm`, `Cenario`, `Pedido`). Nenhuma chamada ao BusinessMap real; só `127.0.0.1` em porta efêmera.

| Caminho | Comportamento do falso | Para quê |
|---|---|---|
| `GET /loggedTime` | Aceita só `card_ids` (até 200; 201 devolve 400), `logged_from`, `logged_to`, `from_date`, `to_date`, `include_logged_time_for_subtasks`, `fields`, paginação (`per_page`, `page`); **valida `fields` como a API v2 real** (valores não aceitos devolvem 400, como o falso do 052 já faz); pode **ignorar** `fields` por cenário (para provar a 2ª camada, R-2 do plano); aplica os filtros de data e a paginação como a API; devolve `comment`, `reporter`, e-mail e chave desconhecida quando o cenário pede (F-MARCADOR); `Retry-After` em 429 | CT-36, 37, 41, 47, 48, 50 |
| `GET /loggedTime/history` | Eventos `logged_time_created`, `logged_time_updated`, `logged_time_deleted`, `..._transferred_...`, `..._converted_...`; filtros `logged_time_ids`, `card_ids`, `user_ids`, `event_types`, `from`/`to`, `per_page` até 200; **dois formatos de evento** por cenário (com e sem `logged_time_id` em `logged_time_deleted`) para exercitar o caminho da varredura de presença (R-1, C-3 do plano) | CT-36, 47 |
| `GET /loggedTimeCategories` | Catálogo fechado de categorias (usado só se Q-A3 mudar; hoje o teste afirma que o coletor **não** depende dele e que o `category_id` desconhecido não derruba a coleta) | CT-36 |
| Comuns | `GET /users` com `fields=user_id,realname` (R3-1); status forçado por caminho (401, 403, 404, 429, 500, timeout, corpo truncado, JSON inválido, corpo gigante); contador de pedidos por caminho e método; **qualquer método diferente de GET registrado como violação** (o teste falha se o contador de não-GET for > 0) | CT-37, 50, todos |

Os formatos reais do `/loggedTime/history` e da paginação só se confirmam no spike (E2.3, PE-1). Até lá, os campos do evento são **hipótese do plano** `[NÃO LIDO]`: o falso deve ser ajustado pelo QA quando o PE-1 chegar (a forma, nunca os dados reais) e a mudança entra no parecer do β.

## 9. Dados de teste e ambiente
- Banco: PostgreSQL de teste efêmero (os `*.pg.test.ts` existentes) com as migrações novas; o duble de banco (`duble-pg.ts`) para os unitários; papéis `dspd_api`, `dspd_api_apontamento`, `dspd_coletor`, `dspd_migrador` criados pelo `gerarGrants` do próprio teste.
- Variáveis: `APONTAMENTO_NOMES` desligado por padrão em todo teste; ligado só nos casos CT-42, 43, 67, sempre com pessoas fictícias.
- Relógio injetado (`hoje`), nunca `Date.now` (regra do projeto).
- Cada teste cria e limpa os próprios dados; sem dependência de ordem; sem espera fixa (esperas automáticas do Playwright); seletores por papel e texto acessível; `data-testid` só em último caso.
- E2E: Chromium no desenvolvimento, demais navegadores no CI; **somente mock**, nenhuma captura com dado real.
- Nenhum teste é marcado `skip` para passar; teste instável vira relatório.

## 10. Vermelho antes do verde, mutação e execução por PR
- **Vermelho antes do verde (R-QA):** para cada PR, `forge-testes --vermelho <base>` (base = `origin/develop`), com a saída colada no parecer (abre com `vermelho: base=… head=…`). Como α e β criam arquivos novos, o teste prova pela falha de carga da base só o que a base não tinha; teste de regra que **já existia** na base sai "não prova (herdada da base)" e precisa de mutante. Onde o autor entrega teste junto do código no mesmo commit, o QA remove a implementação numa cópia em `$TMPDIR` e confere a falha.
- **Mutação (Stryker, gratuito):** nos arquivos do diff, `pnpm stryker run --mutate "$(git diff --name-only origin/develop -- '*.ts' '*.tsx' | grep -v '\.test\.' | paste -sd,)"`, meta de `docs/engineering/praticas.md`. Prioridade de mutantes **à mão** (fronteiras que o Stryker pode errar): piso `20` (`>=`/`>`), limite diário `16 h`, `86 400`, janela 366, limite de lista 200, `no-store`, padrão de `APONTAMENTO_NOMES`, ordem alfabética, chave de dedupe `(logged_time_id, registro_sha256)`, `DELETE` ausente. Sobrevivente vira teste novo ou justificativa no parecer.
- **Execução (D2):** uma suíte por vez (teto de 8 GB): `pnpm run pronto` (unitários do back e do front + contrato + E2E conforme o `scripts/suite-unica.sh`), depois os `qa-059-*`. Parecer por PR em `docs/qa/059-alfa.md`, `059-beta.md`, `059-gama.md`, `059-delta.md` (nomes a confirmar com o tech-lead), com a tabela critério → teste → resultado (coluna "fronteira protegida"), bloco `## Achados` e frontmatter do ADR 0004.
- **Primeira tarefa quando o código chegar:** conferir o diff contra a lista de CA-n e CA-AP-n deste plano; escopo que mudou invalida o plano (em particular: o corte C-1 a C-5 do §7.4 do plano técnico muda o que é testável; cada corte vira linha "não aplicável por corte Cn" no parecer, nunca teste apagado).

## 11. Critério de pronto da aba (QA)
Todos os casos de prioridade alta passando; nenhum bug crítico ou alto aberto; zero violações de acessibilidade críticas ou sérias; todo CA-n e CA-AP-n com ao menos um teste e resultado; nenhum teste `skip`; vermelho registrado e mutação rodada nos arquivos do diff, por PR.

Bloqueantes por natureza (devolvem o PR): marcador de comentário, nome, e-mail ou `user_id` em qualquer tabela, log ou resposta fora da rota autorizada (CA-AP-2, 3, 5); `dspd_api` com acesso à aba (CA-AP-1); piso de 20 violado (CT-05, 26, 51); semáforo, meta ou ordem por total como padrão (CT-18, 19, 24); apontamento sobrescrito ou apagado (CA-AP-8); aba na exportação (CT-27).

## 12. Resultado da execução
Pendente: nenhum código recebido. Preenchido por PR (α, β, γ, δ) no parecer correspondente.

## 13. Perguntas e hipóteses do plano (registradas, não decididas)
- H-1: limite de 16 h por pessoa e dia (P-4 do UX, recomendação aceita em bloco) é o padrão testado; se o dono mudar, CT-14 muda.
- H-2: formatos do `/loggedTime/history` e da paginação `[NÃO LIDO]` até o PE-1; o servidor falso cobre dois formatos de evento de exclusão.
- H-3: o CT-63 interpreta a decisão C ("qualquer usuário do painel") como ausência de papel de acesso; se o login pelo AD entrar, entra um caso de permissão novo.
- H-4: CT-13 conta cartões pelo §1.1 do UX (11 com os da capacidade); o número exato fecha quando o C1 definir os ids `ap-*`.
- H-5: os nomes dos arquivos de parecer por PR (`059-alfa` etc.) seguem a convenção do tech-lead; o `forge-check docs` valida o frontmatter.

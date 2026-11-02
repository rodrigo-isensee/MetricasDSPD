---
contrato: 0
---

# Plano de testes - coletor do Acelerato pela tabela MySQL (F1 e F2)

Pedido 056, etapa E4.3 (K-190). Escrito só da especificação, sem ler código do coletor (que ainda não existe). Não é parecer: o parecer (`R-QA`) sai sobre o commit final, depois do review.

Links: plano técnico `docs/architecture/features/056-acelerato-mysql.md` (§2, §2.1, §3, §3.3, §4; citado "plano"); modelo de ameaças `docs/security/056-acelerato-mysql-ameacas.md` (M1 a M11 e os casos de abuso CA-1 a CA-14 da §7; citado "ameaças"). Sem especificação de UX (fonte de dados, sem interface). Sem contrato de API novo.

## Escopo
- Dentro: F1 (config, cliente MySQL com TLS fixado, filtro de origem, allow-list, staging, `ctl_coleta`, releitura semanal e saída do recorte) e F2 (normalizador, projetor, veredito de SLA, marcas da D-7 e da D-10, reconciliação de 1%).
- Fora: F3 (S5, S6, S7, S11, quebras por prioridade, MTTA, fila: dependem de D-11 a D-15 e P-DS-19); E2E de navegador e acessibilidade (sem mudança de interface); nada contra o MySQL real (nenhum agente conecta nele, E4.8 é do dono); o parecer de segurança (é do `security-engineer`).
- "CA-n" aqui é a numeração da §7 das ameaças (CA-1 a CA-10 pedidos; CA-11 a CA-14 entram porque a F1 os cobre). Os critérios de aceite do plano são a lista do §3.3 e as pré-condições do §5 das ameaças.

## Tipos de teste
- **U** = unitário, sem banco e sem rede (módulos puros, driver simulado).
- **I** = integração com PostgreSQL local (padrão `*.pg.test.ts`, `server/tests/pg/`).
- **S** = estático (lê o código-fonte e afirma forma; guarda contra suíte vazia: afirma número mínimo de arquivos lidos).
- MySQL real: nunca. O servidor MySQL é um duble: `cliente-mysql` recebe a conexão por injeção, e os casos de rede (CA-3, CA-6, CA-14) usam um servidor TCP de teste local que fala só o necessário.
- Vermelho antes do verde: cada teste novo é rodado contra a base (`11141d7`, sem o módulo) e contra a implementação com a guarda removida (mutação do trecho da guarda); a saída entra no parecer.

## Dados de teste e fixture
Arquivo: `server/tests/fixtures/acelerato-linha-50-colunas.ts` (pasta nova `server/tests/fixtures/`: o `server/` não tinha pasta de fixtures; os auxiliares de teste ficam em `server/tests/`, então a nova pasta fica ao lado deles).
- `linhaCompleta()`: as 50 colunas da §2, ordem do plano; valores inventados; marcador `MARCADOR-056-<rótulo>` em toda coluna barrada (titulo, agente, agente_email, solicitante, solicitante_email, origem, url, tempo_workflow_total, solicitantes, raw), números-marcador em `agente_key` (7650561) e `sla_r_tempo_min` (-4056056), e nos `json`: nomes e valores de pessoa ou texto livre em `campos_personalizados` e `campos_personalizados_etapa` ("Acelerato - Atendente", "Acelerato - Solicitante", Cargo, Bairro, "Complemento do Problema", nomes `_LOGIN`, "Informe abaixo:", justificativa, `valor` de campo texto), `estatisticas.impedimentos.usuarios` e uma chave nova de `estatisticas`, mais campo desconhecido nos dois `json`.
- `linhaComColunaDesconhecida()` (51ª coluna com marcador); `linhaForaDoRecorte()` (tipo, organização e equipe fora das listas, ids 9999, 9199, 9299).
- `PROIBIDOS`: lista de marcadores escrita à mão (não derivada de constante de produção, B-1 da ADR 0020); `COLUNAS_BARRADAS`, `NOMES_CAMPO_PROIBIDOS`, `DOMINIO_FIXTURE` (os valores que o teste cadastra em `ref_dominio` do ambiente de teste; os de "Fora" nunca entram lá).
- Teste de guarda da fixture (F-0): `Object.keys(linhaCompleta())` é igual às 50 colunas, sem repetição, e a lista de 11 barradas está contida nelas; `PROIBIDOS` tem pelo menos 30 itens e cada um aparece pelo menos uma vez no JSON de `linhaCompleta()` (marcador que não existe na fixture não prova nada).
- Valores de domínio do teste de SLA, fuso, duplicidade e contagens: criados por helper no próprio teste a partir de `linhaCompleta({...})`.
- Varredura de vazamento (helper do teste, usado em todos os casos "marcador ausente"): procura cada item de `PROIBIDOS` no JSON de todas as tabelas de `dspd_ac` (inclusive `payload`), na saída do logger capturado (pino em memória), em `ctl_coleta_falha`, em `ctl_coleta.parametros` e na exceção propagada (`message`, `cause`, `stack`, `JSON.stringify`).

## Cenários da F1 (fronteira) por critério CA
| ID | Origem | Entrada | Resultado esperado | Tipo | Prio | Fronteira |
|---|---|---|---|---|---|---|
| CT-01 | CA-1 · M4 a, b, e | `linhaComColunaDesconhecida()` | falha fechado `dados-invalidos`; nenhuma linha gravada em `stg_chamado` nem `stg_etapa` (nada parcial); varredura sem marcador, incluindo `ctl_coleta_falha` | I | alta | coluna fora da lista |
| CT-02 | CA-1 · M4 a, d | `linhaCompleta()` | grava exatamente 1 linha; o `payload` tem só as colunas lidas da §2; nenhuma coluna barrada; nenhum nome de `NOMES_CAMPO_PROIBIDOS`; varredura sem marcador nas tabelas de `dspd_ac` | I | alta | pessoa e texto livre em json |
| CT-03 | CA-1 · M4 a | a consulta constante (texto) | lista as colunas da §2 explicitamente: sem `*`, sem `titulo`, `agente`, `agente_email`, `solicitante`, `solicitante_email`, `solicitantes`, `raw`, `url`, `origem`, `tempo_workflow_total`, `sla_r_tempo_min`, sem `estatisticas` ou `campos_*` inteiros fora de caminho fixo; `agente_key` só como `IS NOT NULL` | S | alta | lista fechada de colunas |
| CT-04 | CA-1 · plano §2 | contagem da §2 | 35 colunas lidas (8 só reconciliação), 3 json por caminho/nome, 1 derivada, 11 barradas: o teste conta no SELECT e confere os totais | S | média | classificação das 50 |
| CT-05 | CA-1b · M4 c, d | linha só com colunas permitidas; `status`, `categoria`, `prioridade`, `equipe` com texto livre longo e com marcador; campo de seleção ("Motivo da Escalação") com valor fora do domínio | valor fora do domínio vira nulo com contagem em `ctl_coleta_contagem`, sem o valor; varredura sem marcador; linha de código inválido (tipo fora da lista) recusada (M4 c) | I | alta | domínio fechado |
| CT-06 | CA-12 · M4 d | `campos_personalizados_etapa` com `tipo` texto (justificativa, `valor` livre, previsão de retorno) e `estatisticas.impedimentos.usuarios` | só `justificativa_informada = true` e booleanos "preenchido" (previsão); o texto nunca grava; impedimentos não lidos; varredura sem marcador | I | alta | tipo texto livre |
| CT-07 | CA-13 · M4 f, D-9 | `agente_key = 7650561`; e `agente_key = null` | grava `com_agente` verdadeiro ou falso; o número 7650561 não aparece na base nem no log; `COLUNAS_PESSOA` de `lgpd.ts` não ganha entrada do Acelerato (teste estático sobre o arquivo) | I+S | alta | id de agente |
| CT-08 | CA-1 · §2.1 | nomes de campo: exato × variação (caixa, espaço, prefixo, sufixo, trecho) | só igualdade exata com a lista da §2.1 entra; "Motivo da Escalação " (espaço final) e "motivo da escalação" ficam fora e contados | U | média | igualdade exata (dash procura por trecho) |
| CT-09 | CA-2 · M2 | senha de teste fixa como marcador; erros simulados do driver: acesso negado, timeout, rede caída, falha de TLS (o erro do driver carrega a configuração e o usuário) | marcador (senha, usuário, host) ausente do log, de `ctl_coleta_falha`, da exceção (`message`, `cause`, `stack`, serialização); erro próprio só com `codigo`, entidade, `id_origem`; acesso negado: 1 tentativa só | U+I | alta | segredo em erro |
| CT-10 | CA-2 · M2 | config sem host, usuário ou senha; porta fora de faixa; URL com senha | partida recusada com mensagem fixa que não imprime o valor recebido; sem valor padrão | U | alta | vazio, inválido |
| CT-11 | CA-2 · M2 | log do pino com objeto `config.password`, `senha` e as variáveis `ACELERATO_MYSQL_*` | `redact` cobre os caminhos; marcador sai como `[Redacted]` | U | média | redact |
| CT-12 | CA-3 · M3 | config sem TLS; `rejectUnauthorized: false`; sem CA nem impressão; `NODE_TLS_REJECT_UNAUTHORIZED=0` no ambiente; servidor de teste sem TLS | partida ou conexão recusada, mensagem fixa sem valor; nunca cai para texto puro; nenhum bit de consulta enviado | U+I | alta | sem TLS |
| CT-13 | CA-3 · M3 (fato: impressão SHA-256 fixada em `ACELERATO_MYSQL_TLS_SHA256`) | servidor de teste com certificado autoassinado: (a) impressão igual; (b) impressão com 1 caractere trocado; (c) impressão em maiúsculas e com `:`; (d) impressão vazia ou de tamanho errado | (a) conecta; (b) e (d) recusados, senha não enviada; (c) aceito só se a normalização for documentada, senão recusado (regra decidida pelo node-backend; o teste fixa a escolha dele) | I | alta | impressão digital |
| CT-14 | CA-5 · M5 | texto da consulta | começa por `SELECT`, sem `;`, contém o filtro de origem (`tipo_ticket_key`, `organizacao_key`, `equipe_key` por placeholder), a ordenação (`data_atualizacao`, `ticket_key`), `LIMIT` e a dica ou `SET SESSION max_execution_time`; sem `OFFSET`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `LOAD` | S | alta | só SELECT |
| CT-15 | CA-5 · M5 | marca d'água `' OR 1=1 --`; ticket_key `1; DROP TABLE x` | valor só por placeholder (o driver recebe a consulta constante e o valor à parte); erro de tipo antes de chegar ao driver | U | alta | injeção |
| CT-16 | CA-5 · M5 | nome de tabela no `.env` com `;`, espaço, aspas, 130 caracteres, vazio | recusado na partida (`^[A-Za-z0-9_.]{1,129}$`); 129 aceito (fronteira) | U | média | limite do nome |
| CT-17 | CA-5 · M5 | opções de conexão do cliente | `multipleStatements` falso, `LOCAL_FILES`/`infileStreamFactory` ausentes (teste estático e de opção efetiva); só `execute`, nunca `query` com texto montado | S+U | alta | statement empilhado |
| CT-18 | CA-6 · M5 | servidor TCP de teste que, depois do handshake, responde com pedido de arquivo local apontando para um arquivo-sentinela criado no teste | cliente recusa; sentinela não lido (ele conta acessos por `fs` espiado ou conteúdo marcador não chega ao servidor); a coleta falha com código fixo | I | alta | LOCAL INFILE |
| CT-19 | CA-14 · M6 | servidor de teste que aceita e nunca responde à consulta | consulta interrompida pelo tempo máximo; conexão fechada; no máximo 3 tentativas com backoff para rede; nenhuma para autenticação; `ctl_coleta` registra falha por categoria | I | alta | timeout, retry |
| CT-20 | M6 | execução normal e execução com falha no meio | conexão sempre fechada ao fim (sem pool ocioso); `SET SESSION TRANSACTION READ ONLY` enviado antes da primeira consulta; 1 conexão por vez | U | média | conexão ociosa |
| CT-21 | CA-4 · M8 | `\u0000`, surrogate isolado, `json` malformado, `json` com tipo errado (número onde vem lista) com marcador no trecho | caracteres removidos ou linha recusada; erro só com código, entidade, `id_origem`; erro do zod reduzido ao caminho do campo, sem o valor; erro de parse sem trecho; marcador ausente | U+I | alta | caractere inválido |
| CT-22 | CA-11 · M11 | `linhaForaDoRecorte()` (marcador nos campos de pessoa); e uma por vez: só tipo fora, só organização fora, só equipe fora | falha fechado, nada gravado, marcador ausente da base e do log; cada um dos três filtros sozinho é suficiente para recusar | I | alta | filtro de origem |
| CT-23 | CA-11 · M11 | `lixeira = 1` e `arquivado = 1` dentro do recorte | entra no staging (guarda do histórico: o filtro de `lixeira` é só da view); `vw_populacao_sssc` exclui `lixeira = 1` e mantém `arquivado = 1` | I | alta | excluído permanece |
| CT-24 | M11 | filtro de origem nas listas | listas fechadas constantes (não vêm do `.env`): teste muda a variável de ambiente homônima e o filtro não muda | U | média | filtro fora do .env |

## Cenários da F1 (incremental, histórico, ctl) por critério CA
| ID | Origem | Entrada | Resultado esperado | Tipo | Prio | Fronteira |
|---|---|---|---|---|---|---|
| CT-25 | CA-7 · M6 | duas coletas `ac` ao mesmo tempo | a segunda não inicia (trava por fonte em `ctl_coleta`); nada gravado por ela; trava liberada se a primeira cai | I | alta | exclusão mútua |
| CT-26 | CA-7 · M7, plano §4.2 | marca d'água, margem de 1 dia, página de 1.000 | lê `data_atualizacao >= marca − margem` na ordem (`data_atualizacao`, `ticket_key`); 2.500 linhas = 3 páginas (1.000, 1.000, 500); página de exatamente 1.000 pede a seguinte e termina vazia; empate de `data_atualizacao` não perde nem duplica linha entre páginas | U+I | alta | página cheia, empate |
| CT-27 | CA-7 · M7, §4.3 | backfill: toda a população reaparece com mesma `data_atualizacao` e conteúdo idêntico | hash igual ignora: 0 versões novas, 0 apagadas, 2ª rodada idempotente | I | alta | idempotência |
| CT-28 | §4.3 | mesma linha com `status` mudado; e mudada só em coluna barrada (marcador novo) | status mudado = versão nova (SCD2), a antiga permanece; mudança só em coluna barrada não gera versão (hash só sobre campos lidos) | I | alta | append-only |
| CT-29 | §4.3 · briefing "nunca sobrescrever" | tentativa de `UPDATE`/`DELETE` em `stg_chamado` e `stg_etapa` pelo papel do coletor | negada (GRANT) e barrada por gatilho | I | alta | histórico |
| CT-30 | §4.3 | releitura semanal: lê o recorte sem marca d'água; linha regravada pelo backfill sem mudar `data_atualizacao` | versão nova só se o hash mudou; sem duplicata | I | alta | marca perdida |
| CT-31 | §4.3 | ids conhecidos e não vistos: (a) ainda na origem, fora do recorte; (b) ausentes | (a) versão com `fora_do_recorte = true`; (b) `ausente_na_extracao = true`; consulta desses ids só pelas 6 colunas (`ticket_key`, 3 chaves, `lixeira`, `data_atualizacao`) e por placeholder; nada apagado | I | alta | saída do recorte |
| CT-32 | CA-7 · M7 | ausentes: 4,9% (passa) e 5,0% / 5,1% (para) de 1.000 ids; recarga com todos ausentes | em 5,1% a coleta para com alerta de recarga suspeita e não marca em massa; 5,0% é a fronteira (comportamento fixado pelo node-backend e escrito no teste: "acima de 5%" = estritamente maior); volume acima do teto idem | I | alta | limiar de 5% |
| CT-33 | A2 do review (decisão técnica do Jarvis) | F1 na carga: SSSC das 3 equipes fora das 2 organizações | a F1 informa só a contagem (sem id, sem valor); contagem > 0 aparece no resultado para virar pergunta ao dono | I | média | contagem sem dado |
| CT-34 | CA-8 · M7 | host, banco, tabela, hash das colunas, das listas de nomes ou do SQL diferentes do registrado em `ctl_coleta.parametros` (uma mudança por vez, 6 casos) | coleta recusada na partida sem migração explícita; nenhuma conexão aberta; `parametros` guarda hash do host e do banco, nunca o valor | I | alta | mudança de origem |
| CT-35 | CA-8 | `ctl_coleta.parametros` | contém o SHA-256 do `docs/architecture/fontes/acelerato-mysql.sql` e o do texto constante do código, iguais; maior `sincronizado_em`; marcador de senha, host e usuário ausentes | I+S | média | SQL versionado |
| CT-36 | §4.4 | `sincronizado_em` igual ao anterior | sucesso sem novidade; selo mostra a data da fonte | I | média | sem novidade |
| CT-37 | CA-9 · M7 | módulo `server/src/modulos/acelerato/` | nenhum `INSERT`/`UPDATE`/`DELETE`/DDL em esquema que não seja `dspd_ac`; nenhum import de `modulos/businessmap`; afirma pelo menos N arquivos lidos (guarda de suíte vazia) | S | alta | BusinessMap × Acelerato |
| CT-38 | CA-10 · M4 | `dspd_api` lendo `payload` da `stg_chamado`, colunas fora do GRANT, `dim_chamado*` com coluna de pessoa | permissão negada; schema final: nenhuma coluna de pessoa em `dspd_ac` (consulta ao `information_schema` com lista de nomes proibidos escrita no teste) | I | alta | GRANT por coluna |
| CT-39 | M2 | `.env.example` e repositório | só nomes `ACELERATO_MYSQL_*`, sem valor; `ACELERATO_MYSQL_TLS_SHA256` presente; nenhum valor de impressão real | S | média | segredo no repo |

## Cenários da F2 (normalizador, projetor, métricas) e casos da §3.3
| ID | Origem | Entrada | Resultado esperado | Tipo | Prio | Fronteira |
|---|---|---|---|---|---|---|
| CT-40 | §3.1 D-2 | `*_status` e `*_violado`: "Realizado..." com violado 0 e 1; "Em andamento" com 1 e 0; os dois nulos; status fora dos 4 valores | "realizado" vale como está; senão violado 1 = fora, 0 = dentro; nulos ficam sem veredito e fora do denominador; status fora dos 4 valores recusa a linha (CHECK) | U | alta | tabela-verdade |
| CT-41 | §3.1 | status e flag divergentes (status "dentro", flag 1) | veredito conforme regra; divergência contada em `ctl_coleta_contagem`, sem valor | U+I | média | divergência |
| CT-42 | D-9 · S2 | `com_agente` falso | sai do denominador da S2 e é contado à parte; sem agente nunca some do staging | I | alta | sem agente |
| CT-43 | §1 P-DS-2 | `data_criacao` '2026-09-01 09:00:00', 23:59:59 e 00:00:00 de virada de dia e de mês | normalizador aplica -03:00 fixo; instante UTC conferido nas viradas | U | alta | fuso, virada |
| CT-44 | §2 `data_pronto` | `data_pronto` preenchida, nula; `encerrado = 1` com `data_pronto` nula | fechado = `data_pronto` preenchida; `encerrado` nunca define fechamento (só conferência) | U | alta | fechado |
| CT-45 | §2 col. 9 | categoria com prefixo (Incidente, Requisição etc., valores inventados no `ref_dominio` de teste) e sem prefixo | `natureza` pelo mapa de `ref_dominio`; sem prefixo vira nulo contado, nunca inferido | U | média | prefixo |
| CT-46 | §2 col. 19 | prioridade: valores dos 3 vocabulários, vazio, valor desconhecido | domínio fechado; vazio = nulo; desconhecido recusa a linha; nenhum mapeamento entre vocabulários (D-12 pendente) | U | média | domínio |
| CT-47 | D-7 · S4, S9, S10 | `estatisticas.workflow.etapas[]` com 2 etapas; `quantidadeDeVezes` 0, 1, 3; `tempoSla` 0 e muito grande | uma linha em `stg_etapa` por etapa (não por passagem); segundos e `quantidade_vezes` gravados; sem instante de entrada ou saída; a biblioteca não reaplica horas úteis | I+U | alta | etapa |
| CT-48 | §1 · risco | `estatisticas` nula (10,7%) | linha entra sem etapas; contada em `ctl_coleta_contagem`; nunca imputada | I | alta | nulo |
| CT-49 | D-7 · T2.6 | entrada da D-7 e da D-10 | `ref_versao_criterio` tem as duas entradas com data; os resultados de S4, S9, S10 e S8 carregam a marca de critério | I | alta | marca nos gráficos |
| CT-50 | T2.5 · mínimo de 20 | S4, S9, S10 com 19, 20 e 21 itens na janela de 12 semanas | 19: não publica; 20 e 21: publica (percentis 50/85/95 só pela biblioteca compartilhada, teste estático de que o módulo não calcula percentil) | U | alta | mínimo 20 |
| CT-51 | T2.5 · janela | itens a 83, 84 e 85 dias de hoje | só a janela móvel de 12 semanas (84 dias) entra; fronteira conferida | U | média | janela |
| CT-52 | D-10 · S8 | campo dos 90 dias: sim, não, sem resposta, ausente; 171 de 6.350 (2,7%) | denominador = todos os criados; cobertura do campo ao lado; nota fixa de subestimativa; mínimo de 20 vale sobre o denominador | U+I | alta | S8 |
| CT-53 | S2 | 4 valores de SLA, mais sem agente, por mês | proporção calculada pela biblioteca e igual à contagem manual da fixture (sem arredondar antes) | U | alta | S2 |
| CT-54 | S3 | contagem por valor bruto de prioridade, sem agrupar | só contagem; sem quebra por P1-P5 (D-12) | U | média | S3 |
| CT-55 | S12 · D-4 | categoria recorrente por `categoria_key` | volume e recorrentes; limiar é parâmetro versionado em `ref_versao_criterio` | U+I | média | S12 |
| CT-56 | S1 · D-3 | `data_criacao`, `data_pronto`, `data_primeiro_comentario` | resolução em horas úteis pela biblioteca; `*_tempo_min` e `primeiro_comentario_min_uteis` só em reconciliação; MTTA não publicado (D-13 pendente) | U | alta | S1 |
| CT-57 | proibidas · briefing 7.1 | busca no código e no OpenAPI | nenhuma rota, métrica ou coluna por agente, ranking individual, comparação entre equipes; `equipe` nunca aparece como série de comparação | S | alta | métrica individual |
| CT-58 | §3.3 tempos | tempos publicados | só percentis 50/85/95 com janela; nenhuma média publicada; consulta de conferência de tempos só em teste, nunca publicada | S+U | alta | média sem percentil |
| CT-59 | §3.3 período | reconciliação por mês civil e por janela | conferência intermediária por mês; janela móvel só no painel | I | média | período |
| CT-60 | §3.3 população e SLA sem agente | população do coletor × consulta de conferência independente (escrita no teste) | iguais por construção; diferença > 0 falha o teste (defeito, não tolerância) | I | alta | população |
| CT-61 | §3.3 histórico até 2026-08 | meses até 2026-08 e depois | reconciliação só dos meses depois de 2026-08 | U | média | corte de data |
| CT-62 | §3.3 mínimo | mês em que o dash publica e aqui há menos de 20 itens | compara só onde os dois publicam; o resto sai como "não comparável", não como diferença | U | média | mínimo |
| CT-63 | §3.3 fila nova e antiga | dados com os dois vocabulários de prioridade na mesma organização | sem atributo `fila` (D-11 pendente); nenhuma quebra por organização como fila | U | média | fila |
| CT-64 | §3.3 `sla_r_tempo_min` | coluna barrada com `SLA_R_TEMPO_MARCADOR` | nenhum número derivado dela em nenhuma tabela, conferência ou métrica | I | alta | coluna barrada |
| CT-65 | §3.3 tempo por etapa | S4/S9/S10 × tempos do dash | dois vocabulários de espera: a conferência não unifica; só compara a etapa por `etapaKey` | U | baixa | vocabulário |
| CT-66 | D-6 · reconciliação de 1% | contagens e proporções do banco × conferência independente | diferença relativa <= 1% (fronteira: 1,00% passa, 1,01% falha) | U | alta | tolerância |
| CT-67 | regra inviolável | consulta de Acelerato com tabela do BusinessMap, e o inverso | nenhuma view, cálculo, histograma ou percentil cruza `dspd_ac` com o esquema do BusinessMap | S+I | alta | fontes separadas |
| CT-68 | plano §3 | `Chamado` (biblioteca): `arquivado`, `natureza`, `com_agente`, `reincidente_90d`, 4 valores de `status_sla_*` | tipos presentes; `fila` ausente | U | média | modelo |

## Mitigações M1 a M11 que o coletor cobre
| M | Cobertura | Casos |
|---|---|---|
| M1 (conta compartilhada) | segunda camada: transação só leitura, consulta fixa, filtro de origem, falha de autenticação sem retry; o resto (usuário próprio, host) é do DBA | CT-20, CT-14, CT-22, CT-09 |
| M2 (credencial em log) | zod sem padrão, erro próprio, redact, `.env.example` | CT-09, CT-10, CT-11, CT-39 |
| M3 (TLS) | TLS obrigatório, impressão fixada, sem texto puro | CT-12, CT-13 |
| M4 (pessoa e texto livre) | allow-list, domínio, `com_agente`, fixture das 50 colunas, `COLUNAS_PESSOA` | CT-01 a CT-08, CT-38 |
| M5 (consulta) | constante, placeholder, nome da tabela, multipleStatements, LOCAL INFILE | CT-14 a CT-18 |
| M6 (disponibilidade) | tempo máximo, 1 conexão, retry, página, trava | CT-19, CT-20, CT-25, CT-26 |
| M7 (fonte de outro time) | backfill, ausência, limiar, parametros, só `dspd_ac` | CT-27 a CT-32, CT-34, CT-35, CT-37 |
| M8 (log com valor) | caractere inválido, erro só com código | CT-21, CT-09 |
| M9 (leitura da estrutura) | n/a ao coletor (processo): nenhuma linha real em teste, fixture inventada | F-0 |
| M10 (LGPD da cópia) | n/a ao coletor; minimização por CT-02, CT-38 | CT-02, CT-38 |
| M11 (outras organizações) | filtro no WHERE, zod com a lista, `lixeira` só na view | CT-22, CT-23, CT-24, CT-33 |

## Matriz CA -> teste
| CA (ameaças §7) | Testes |
|---|---|
| CA-1 | CT-01, CT-02, CT-03, CT-04, CT-08 |
| CA-1b | CT-05 |
| CA-2 | CT-09, CT-10, CT-11 |
| CA-3 | CT-12, CT-13 |
| CA-4 | CT-21 |
| CA-5 | CT-14, CT-15, CT-16, CT-17 |
| CA-6 | CT-18 |
| CA-7 | CT-25, CT-26, CT-27, CT-32 |
| CA-8 | CT-34, CT-35 |
| CA-9 | CT-37 |
| CA-10 | CT-38 |
| CA-11 a CA-14 | CT-22, CT-06, CT-07, CT-19 |

## Abuso e outras bordas fora do que o plano nomeia (o que o código pode revelar)
Quando o código chegar: conferir o diff contra esta lista; completar bordas novas (linha com 0 linhas, página vazia, `ticket_key` acima de 2^53 como texto decimal, `data_atualizacao` nula, datas "0000-00-00"); rodar vermelho antes do verde (`git stash` na árvore do autor só como recuo; cópia da base em `$TMPDIR`) e mutação nos arquivos do diff (stryker, conforme `docs/engineering/praticas.md`).

## Ambiente e execução
- Suíte: `pnpm run pronto` (unitários, `*.pg.test.ts` com PostgreSQL local, estáticos). Nada de E2E de navegador nem de acessibilidade (sem interface).
- Servidores de teste TCP (CT-13, CT-18, CT-19) em porta efêmera local, criados e fechados pelo próprio teste; sem espera fixa.
- Não pode: conectar no MySQL real, ler `.env`, usar dado real, `skip`.

## Resultado da execução
Ainda não executado: o código do coletor entra com a E4.5 (F1) e a E4.6 (F2). Os testes executáveis são escritos depois da E4.4, com a fixture acima. Bugs: nenhum até agora.

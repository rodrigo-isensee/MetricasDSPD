# Modelo de ameaças da fonte MySQL do Acelerato (pedido 056, E3.3 e E3.6)

Propósito: modelo de ameaças e requisitos de segurança da nova fonte do Acelerato, a tabela MySQL mantida pelo time de ciência de dados (decisões do dono de 2026-10-30, perguntas 1 = B e 2 = B), antes de qualquer código. Público: software-architect (E3.5, revisão da ADR 0013), tech-lead (E2.1), node-backend, qa-engineer, devops-engineer, Jarvis. Data: 2026-10-30 (E3.3); revisado em 2026-10-30 (E3.6) com as respostas do time de ciência de dados e as decisões do dono sobre o §6 (coleta só na máquina do dono, conta compartilhada por enquanto, cálculo em memória). Estado: modelo de ameaças e requisitos, **não é parecer**; o parecer de segurança (R-SEGURANCA) vem sobre o commit final de cada fatia de código.

Base: `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (citado abaixo como "respostas, item n"), `docs/architecture/features/056-acelerato-mysql.md` §2 (classificação das 50 colunas, proposta), `docs/integracao/acelerato-dash-atual.md`, `docs/security/adr-0020-protecao-de-pessoa.md`, `docs/security/k084-coletor-allow-list.md`, `docs/security/052-integracao-businessmap-ameacas.md`, `docs/integracao/metabase-acelerato-configuracao.md` §1, §2 e §4, `docs/briefing-execucao-metricas.md` §3.2, `server/src/plataforma/db/lgpd.ts`, `server/src/plataforma/db/grants.ts`, `server/src/plataforma/db/ddl.ts:56-68, 96-118`, `server/migrations/0008_ac_staging_historico.ts`, Histórico do pedido 056 (decisões do dono de 14:23, 14:24 e 14:25). Leitura estática; o `.env` não foi lido, nada foi conectado ao MySQL nem ao Metabase, nenhuma linha de dado foi lida.

**Gatilhos (R-SEGURANCA):** credencial de integração externa nova (usuário e senha de banco), rede de saída nova (protocolo MySQL), dado pessoal e texto livre na fronteira (inclusive dentro de colunas `json`), dado de clientes externos na mesma tabela, consulta SQL escrita pelo projeto, log e erro com dado de terceiro, mudança de regra do `CLAUDE.md` (E2.1).

## 0. O que mudou na E3.6
| Tema | Antes (E3.3) | Agora (respostas) | Efeito no modelo |
|---|---|---|---|
| Conta | desconhecida | conta de desenvolvimento compartilhada, só `SELECT` e `SHOW VIEW` na tabela, host `'%'` (item 10); usada por enquanto, risco aceito pelo dono (14:24) | M1 cai de alta para média; sobra leitura ampla e host aberto |
| TLS | desconhecido | servidor oferece TLS, `require_secure_transport` desligado, CA desconhecida, cliente de teste sem verificação (item 11) | M3 continua alta; caminho sem CA definido |
| Pessoa e texto livre | lista provisória | colunas e campos novos dentro de `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos` (item 13) | M4 com lista fechada atualizada e regra por `tipo` do campo |
| Escopo | a confirmar | dezenas de organizações, inclusive clientes externos; o tipo SSSC tem cerca de 6,9 mil linhas em 6 organizações (itens 9 e 14) | filtro na origem exigido (M11, novo) |
| Carga e limites | a confirmar | incremental contínua, sem janela parada; sem tempo máximo de consulta no servidor; índices não medidos (itens 1, 15 e 17) | M6 e M7 revistos |

## 1. Ativos
| Ativo | Por que importa | Onde vive |
|---|---|---|
| Credencial do MySQL (host, porta, banco, usuário, senha, CA ou impressão do certificado) | Hoje é uma conta compartilhada de desenvolvimento com host aberto: vazada, dá leitura da tabela inteira (cerca de 292 mil chamados de dezenas de organizações, inclusive clientes externos, com pessoa e texto livre). Escrita não: o GRANT é só `SELECT` e `SHOW VIEW` (item 10). | `.env` local na máquina do dono (decisão de 14:23) |
| Dado de pessoa da tabela (nome, e-mail, `usuarioKey`, login e ids de solicitante, agente, atendente, reporter, seguidor e impedimento; cargo e bairro) | LGPD; ADR 0020; base append-only sem eliminação viável; proibição de métrica individual (briefing 7.1) | Tabela MySQL do time de ciência de dados; **nunca** na base analítica |
| Texto livre (título, descrição em `raw`, campos personalizados de texto, `valor` livre de campo de etapa, justificativas) | Pode conter nome de cliente, CPF, dado de terceiro | Tabela MySQL; nunca na base analítica (justificativa só como booleano `justificativa_informada`, exceção de `lgpd.ts:20-21`) |
| Dado de clientes externos (linhas de outras organizações) | Fora do propósito do projeto; vazamento ou mistura atinge terceiros sem relação com o DSPD | Tabela MySQL; nunca sai do MySQL (M11) |
| Base analítica do Acelerato (`dspd_ac`: `stg_chamado`, `stg_etapa`, `dim_chamado_versao`, `evt_etapa_chamado`, `ctl_`) | Integridade do histórico; separação BusinessMap × Acelerato; `payload jsonb` na staging versionada (`ddl.ts:67`) | PostgreSQL local do dono; papéis `dspd_coletor`, `dspd_api`, `dspd_migrador` |
| Disponibilidade do MySQL do time de ciência de dados | Carga deles roda o dia todo e serve o dash do dono; o servidor não limita tempo de consulta (item 15) | Servidor MySQL deles |
| Arquivos da máquina do dono (inclusive o `.env`) | Alvo do `LOCAL INFILE` quando o servidor é falso ou interceptado (M5) | Máquina do dono |

## 2. Fluxo e fronteiras de confiança

```mermaid
flowchart LR
  subgraph CD[Time de ciência de dados]
    AC[(Banco do Acelerato)] -->|carga contínua deles| TAB[(Tabela MySQL do Acelerato: todas as organizações)]
    TAB --> DASH[Dash atual do dono]
  end
  subgraph MD[Máquina do dono]
    ENV[.env: host, usuário, senha, CA] --> CO
    CO[Coletor Acelerato - dspd_coletor]
    CO -->|registro allow-list, sem pessoa nem texto livre| STG[(dspd_ac.stg_chamado, stg_etapa)]
    CO -->|código, entidade, id_origem| CTL[(dspd_ac.ctl_coleta_falha)]
    CO --> LOG[[log pino]]
    STG --> PR[Projetor] --> DIM[(dim_chamado_versao, evt_etapa_chamado)] --> API[API dspd_api] --> WEB[Painel de sustentação]
  end
  CO -->|TLS verificado, SELECT fixo: colunas da lista, caminhos json fixos, WHERE da população SSSC| TAB
  TAB -->|só linhas SSSC e só colunas e caminhos da lista| CO
```

Fronteiras: **F1** rede até o MySQL (faixa interna, caminho ainda não confirmado, item 12); **F2** MySQL → coletor (linha devolvida é entrada não confiável, mantida por outro time, com `json` de conteúdo variável); **F3** coletor → `dspd_ac` (allow-list, GRANT por papel); **F4** banco → `dspd_api` (GRANT por coluna, `grants.ts`); **F5** processo → log e `ctl_`; **F6** `.env` → processo (segredo); **F7** API → painel (reidentificação por agregado, ADR 0020; fora deste documento).

## 3. Ameaças (STRIDE), por prioridade
Severidade = probabilidade × impacto. Cada item traz o caminho e os controles exigidos.

### M1. Conta de banco compartilhada, com host aberto e leitura da tabela inteira (E, I) · **média** (era alta)
- Estado (respostas, item 10): a conta tem só `SELECT` e `SHOW VIEW` em `UNIFIQUE.ACELERATO_CHAMADOS`, host `'%'`; não há view filtrada. Escrita, outras tabelas e privilégio administrativo estão fora: o risco de alterar ou apagar a tabela do dash some. `SHOW VIEW` sobre uma tabela não dá acesso adicional (informativo).
- Risco que sobra: (1) a conta é de desenvolvimento e compartilhada: outras pessoas sabem a senha, a rotação não é nossa e o acesso do coletor não se distingue do delas no log do servidor; (2) com host `'%'`, a senha vazada (backup do `.env`, histórico do shell, log) funciona de qualquer máquina que alcance o servidor; (3) o GRANT é na tabela inteira: a credencial lê pessoa, texto livre e chamados de clientes externos, muito além da população SSSC.
- Decisão do dono (14:24, opção B): o coletor usa a conta compartilhada **por enquanto**; troca por usuário próprio antes da coleta agendada. O registro formal (`docs/security/aceites/`, ligado ao `commit:` do parecer da fatia do coletor) é pedido pelo Jarvis quando o parecer existir (§8).
- Pedido ao DBA (pelo dono, ao time de ciência de dados), em ordem de ganho:
  - (a) usuário **dedicado ao coletor**, sem pessoa por trás, senha longa e aleatória, rotação documentada;
  - (b) host amarrado à máquina do dono (`'usuario'@'ip'` ou a sub-rede dela), não `'%'`;
  - (c) uma **view** só com a população SSSC (M11) e sem as colunas barradas (M4), com GRANT `SELECT` só na view e não na tabela; melhor ainda se a view já extrair do `json` só os caminhos e nomes de campo da lista fechada (`JSON_EXTRACT` ou `JSON_TABLE`, se o servidor for MySQL 8). O que não sai do MySQL não vaza do coletor;
  - (d) `REQUIRE SSL` no usuário (M3) e `MAX_USER_CONNECTIONS` baixo (por exemplo 2);
  - (e) nenhum privilégio além de `SELECT` (a conta atual já cumpre).
- Segunda camada no coletor (vale já com a conta compartilhada): transação só leitura (`SET SESSION TRANSACTION READ ONLY`), consulta fixa (M5), filtro na origem (M11), falha de autenticação para sem retry.

### M2. Credencial em log, erro, URL ou mensagem (I) · **alta**
- Caminho: (1) a credencial é montada numa URL de conexão (`mysql://usuario:senha@host/banco`) e a URL aparece no log ou numa exceção; (2) o erro do driver é registrado inteiro pelo pino: a mensagem de acesso negado traz usuário e host, e o objeto de erro pode carregar a configuração da conexão; (3) a validação da configuração na partida ecoa o valor recebido; (4) a credencial aparece no histórico do shell ou num brief. Com a conta compartilhada, o vazamento atinge também quem mais a usa.
- Controles exigidos: variáveis separadas no `.env` (host, porta, banco, usuário, senha, caminho da CA ou impressão do certificado), sem URL de conexão com senha; validação por zod na partida, **sem valor padrão** para host, usuário e senha, com mensagem fixa que nunca imprime o valor; o coletor captura o erro do driver e relança erro próprio só com `codigo` (por exemplo `ER_ACCESS_DENIED_ERROR` vira categoria `autenticacao`), entidade e `id_origem`, sem `cause`, sem `message` do driver e sem a configuração; caminhos de `redact` no pino para `*.password`, `*.senha`, `*.config.password` e as variáveis novas; `.env.example` só com os nomes; teste do marcador (CA-2); `gitleaks --redact` no CI. Senha vazada: pedido de rotação ao time de ciência de dados pelo dono.

### M3. Conexão sem TLS ou sem verificação do servidor (I, S, T) · **alta**
- Estado (respostas, item 11): o servidor tem TLS (`have_ssl=YES`, sessão de teste em TLS 1.3), mas `require_secure_transport` está desligado, o `REQUIRE SSL` do usuário não é visível e a CA não foi obtida; o cliente de teste não verificou o certificado. Ou seja: hoje o texto puro é aceito pelo servidor, e o TLS só protege se o cliente o exigir e verificar.
- Caminho: sem TLS exigido no cliente, quem está na rede captura a autenticação e as linhas; com TLS sem verificação, um servidor falso (ou interceptação na faixa interna) recebe a senha, devolve dados forjados (envenenamento da base) e pode pedir arquivos locais (M5).
- Controles exigidos no coletor: TLS obrigatório (`ssl` sempre configurado, sem fallback para texto puro; conexão recusada se o servidor não negociar TLS); verificação do certificado sempre ligada (`rejectUnauthorized: true`); nunca `rejectUnauthorized: false` nem `NODE_TLS_REJECT_UNAUTHORIZED=0`; sem `insecureAuth`; host fixo validado na partida.
- Sem CA, o que fazer (em ordem de preferência):
  - (1) pedir ao DBA o certificado da CA do servidor (é público, não é segredo; se o servidor usa os certificados gerados pelo próprio MySQL, é o `ca.pem` do diretório de dados) e configurá-lo como `ca`. Como a conexão é por endereço 10.x, o nome no certificado pode não bater: nesse caso a cadeia continua verificada e a conferência de nome é trocada por conferência da impressão SHA-256 do certificado do servidor (`checkServerIdentity` próprio), nunca desligada;
  - (2) sem a CA, fixar a impressão SHA-256 do certificado do servidor: o dono obtém o certificado por ferramenta local (por exemplo `openssl s_client -starttls mysql`) e **confirma a impressão com o DBA por outro canal** antes de gravá-la no `.env`; o coletor recusa certificado com outra impressão. Troca de certificado no servidor para a coleta até nova confirmação;
  - (3) nem CA nem impressão confirmada: a coleta não começa; aceitar TLS sem verificação vira pergunta de risco ao dono (R-DECISAO), nunca exceção no código.
- Pedido ao DBA: `REQUIRE SSL` no usuário do coletor (M1 d); `require_secure_transport` é decisão deles (afeta outros clientes), só recomendação.

### M4. Dado de pessoa e texto livre chegam à base (I) · **alta**
- Caminho: a tabela tem "todas as infos" do dash; um `SELECT *`, uma coluna `json` lida inteira ou um campo personalizado novo levam nome, e-mail, `usuarioKey`, descrição ou texto livre para o `payload jsonb` da `stg_chamado` (`ddl.ts:67`), append-only e sem eliminação viável. As respostas (item 13) mostram pessoa e texto livre **dentro** de colunas `json` que o plano lê por caminho, não só nas colunas barradas.
- Controles exigidos, em camadas (mesmo princípio do K-084):
  - (a) a consulta tem **lista explícita de colunas e de caminhos `json`**, constante no código; nunca `SELECT *`, nunca uma coluna `json` inteira quando só um caminho é usado, nunca lista vinda do `.env`. De preferência a extração do caminho é feita no SQL (`JSON_EXTRACT(estatisticas, '$.workflow.etapas')`), para o resto do `json` não sair do MySQL;
  - (b) a linha recebida passa por allow-list estrita (schema zod `strict`): coluna ou chave fora da lista **falha fechado** (`dados-invalidos`, sem gravar parcial);
  - (c) valores de colunas de código validados por domínio fechado ou forma curta (B-K1 do K-084);
  - (d) campos personalizados (`campos_personalizados` e `campos_personalizados_etapa`) lidos só por **igualdade exata de nome** com a lista fechada; do campo aceito, o `valor` só entra se for de domínio fechado (`ref_dominio`), data, booleano ou identificador de forma curta validada; campo cujo `tipo` (chave presente no `json` de etapa, item 3) seja texto livre nunca grava o `valor`, só o booleano "preenchido" quando uma métrica o pedir, calculado em memória (decisão do dono de 14:25); valor fora do domínio vira nulo com contagem em `ctl_coleta_contagem`, sem o valor;
  - (e) teste com fixture que traz as 50 colunas, os `json` com todas as chaves de pessoa conhecidas e uma desconhecida com marcador, e uma lista de proibidos **escrita no teste**, não derivada da constante (B-1 da ADR 0020);
  - (f) nenhuma coluna nova de pessoa no analítico: `COLUNAS_PESSOA` (`lgpd.ts:11-14`) não ganha entrada do Acelerato; o booleano `com_agente` da D-9 é derivado em memória a partir de `agente_key`, sem gravar o id.
- **Lista fechada do que nunca entra na base** (substitui a lista provisória da E3.3; confere com a §2 do plano):
  - colunas barradas, fora do `SELECT`: `titulo`, `agente`, `agente_email`, `solicitante`, `solicitante_email`, `solicitantes`, `raw` (descrição, reporter, seguidores e solicitantes com nome, e-mail e `usuarioKey`), `url`, `origem`, `tempo_workflow_total`; `agente_key` só em memória para `com_agente`;
  - em `campos_personalizados`, nunca lidos (pessoa ou texto livre): "Acelerato - Atendente", "Acelerato - Solicitante", "Cargo", "Bairro", "Complemento do Problema", todo nome terminado em `_LOGIN`, e os de texto livre da população SSSC ("Informe abaixo:", "Público afetado:", os de benefícios e objetivos, o de indicar lei), salvo domínio fechado provado; os 759 nomes da tabela inteira ficam fora por padrão, só os da lista fechada entram;
  - em `campos_personalizados_etapa`: `valor` de campo de texto livre (por exemplo o de comentário) e a justificativa de ajuste de prioridade (só `justificativa_informada`); "Nº do Ticket Terceiros?" e "Número do ticket anterior" só com forma de identificador validada, senão nulo;
  - em `estatisticas`: tudo fora de `workflow.etapas[]` com `etapaKey`, `descricao`, `descricaoWorkflow`, `tempoSla` e `quantidadeDeVezes`; em especial `impedimentos.usuarios` (lista de pessoas) nunca é lido;
  - toda coluna ou chave cujo nome case com `SEGMENTO_PESSOA` (`lgpd.ts:7-8`) e não seja exceção registrada;
  - em dúvida (campo sem domínio conhecido, nome de grupo que seja nome de pessoa), fica fora até a resposta; não se decide por inferência.
- O texto de comentários não existe na tabela, só datas (item 13): nada a barrar ali.

### M5. Consulta montada com texto de fora ou além de SELECT (T, I, E) · **média**
- Caminho: (1) o nome da tabela, um filtro ou a marca d'água entram por concatenação de texto e viram SQL arbitrário com o privilégio do usuário (hoje leitura da tabela inteira, M1); (2) `multipleStatements` ligado permite empilhar comandos; (3) `LOCAL INFILE`: um servidor falso ou interceptado (M3) pede ao cliente um arquivo local e recebe, por exemplo, o `.env`.
- Controles exigidos: consulta **constante no código**, só `SELECT`, sem `;`; filtro da população (M11) e caminhos `json` também constantes; valores (marca d'água, chave de paginação) só por placeholder com instrução preparada (`execute` com `?`); identificadores constantes no código (se o nome da tabela vier do `.env`, validado por `^[A-Za-z0-9_.]{1,129}$` e citado pelo escape de identificador do driver); `multipleStatements: false` explícito; cliente sem `LOCAL_FILES` e sem fábrica de leitura de arquivo; um único módulo exporta a função de leitura e um teste falha se a consulta não começar por `SELECT` ou tiver `;` (CA-5).

### M6. Disponibilidade do MySQL do time de ciência de dados (D) · **média**
- Estado (respostas, itens 1, 15 e 17): a carga deles roda o dia todo em ciclos de 10 a 15 minutos e serve o dash, então não há janela parada; `max_execution_time = 0` (o servidor não corta consulta longa), `wait_timeout` de 8 horas, `max_connections = 151` compartilhado; índices e tempo das consultas não medidos. O dash já faz 3 `SELECT` só da população SSSC (cerca de 7 mil linhas). Incremental típico: dezenas a cerca de mil linhas por dia na tabela inteira, menos na população SSSC.
- Caminho: sem índice no filtro, cada coleta varre as cerca de 292 mil linhas (com `json` grandes) concorrendo com a carga e o dash; sem tempo máximo, uma consulta presa segura recursos indefinidamente; conexão esquecida aberta ocupa vaga do limite global por até 8 horas; retry sem limite multiplica isso.
- Controles exigidos: consulta só da população SSSC (M11), na mesma ordem de grandeza da que o dash já faz; uma conexão por vez, aberta para a coleta e **fechada ao fim** (sem pool ocioso); exclusão mútua da coleta (trava em `ctl_coleta`); tempo máximo **no servidor** por consulta, já que o servidor não impõe (`/*+ MAX_EXECUTION_TIME(n) */` na consulta constante ou `SET SESSION max_execution_time`), além do timeout do cliente (que sozinho não interrompe a consulta no servidor); paginação por chave (`WHERE (data, chave) > (?, ?) ORDER BY ... LIMIT n`), nunca por `OFFSET`; teto de linhas e bytes por execução (a população inteira, cerca de 7 mil, cabe; acima do teto, alerta de recarga, M7); no máximo 3 tentativas com backoff para rede, nenhuma para autenticação; frequência baixa (ADR 0013: uma vez por dia). Carga inicial: com o filtro na origem são cerca de 7 mil linhas, sem necessidade de horário especial, mas manual e com o dono presente.
- Pedido ao time de ciência de dados: o `EXPLAIN` da consulta final (o dono pode rodá-lo; não traz linha de dado) ou um índice que cubra o filtro e a marca d'água.

### M7. Fonte mantida por outro time: troca de estrutura, recarga e mistura (T) · **média**
- Estado (respostas, itens 1 e 8): carga incremental; houve uma carga em massa de cerca de 269 mil linhas em três dias (backfill); excluídos e arquivados ficam na tabela (sem remoção física observada); `ticket_key` único, estabilidade não provada; as 50 colunas sem comentário e sem aviso combinado de mudança de estrutura; `sincronizado_em` fica de 0 a 12 minutos depois de `data_atualizacao`.
- Caminho: (1) um backfill do lado deles reescreve todas as linhas e o incremental reprocessa a população inteira (inócuo se idempotente; perigoso se marcar ausências em massa); (2) mudança de estrutura sem aviso (coluna removida, renomeada, chave de `json` trocada, campo personalizado novo); (3) o `.env` passa a apontar outro servidor ou banco e outra origem se mistura ao histórico; (4) o mesmo papel `dspd_coletor` escreve no esquema do BusinessMap e no do Acelerato (`grants.ts:38, 58-66`); (5) marca d'água por `data_atualizacao` perde a linha gravada pela carga deles depois da coleta, mas com `data_atualizacao` anterior à marca (atraso de até 12 minutos): integridade, não confidencialidade.
- Controles exigidos: append-only mantido (ausência vira nova versão com `ausente_na_extracao`, `0008_ac_staging_historico.ts:7`, nunca `DELETE`); coluna ou chave nova falha fechado (M4 b) e campo personalizado novo fica fora por padrão (M4 d); registrar em `ctl_coleta` host, banco, tabela e hash da lista de colunas e caminhos, e recusar a coleta se mudarem sem migração explícita; alerta quando o volume ou a proporção de ausentes passar de um limiar (recarga suspeita), sem marcar em massa; o módulo do Acelerato só escreve em `dspd_ac` (teste estrutural, como o B-K3 do K-084). Recomendação ao arquiteto (E3.5), não bloqueante: marca d'água por `sincronizado_em`, ou janela de sobreposição de pelo menos 15 minutos com regravação idempotente; papel próprio para o coletor do Acelerato, sem GRANT no esquema do BusinessMap.

### M8. Log e erro com valor de linha (I) · **média**
- Caminho: erro de conversão de tipo, de parse do `json`, do zod ou do Postgres ecoa um trecho da linha (inclusive um campo personalizado de pessoa recebido por engano) no log ou em `ctl_coleta_falha.erro`, que o `dspd_api` lê.
- Controles exigidos: os do A5 do `052-integracao-businessmap-ameacas.md`: o catch grava só código, entidade e `id_origem`; erro do zod reduzido ao caminho do campo, sem o valor; erro de parse do `json` sem o trecho; nome de campo personalizado desconhecido pode ser contado, nunca registrado com o valor; remoção de `\u0000` e surrogate isolado antes do `jsonb`; `debug` e `trace` proibidos com dado real; teste do marcador (CA-4).

### M9. Leitura da estrutura pelo time (I) · **baixa**
- Conferido nesta revisão: as respostas trazem só estrutura, domínios de fila, nomes de campo e contagens; o único exemplo de `valor` é um texto de instrução do formulário, não dado de chamado; o endereço do servidor aparece só como faixa. Controle mantido: nenhum agente lê o `.env` nem conecta no MySQL; documento do projeto não traz linha de dado nem nome de organização cliente; saída nova com valor de dado não é gravada (o Jarvis pede outra).

### M10. LGPD da cópia e retenção (I) · **informativa para o projeto**
- A cópia com pessoa é do time de ciência de dados; base legal, retenção e acesso de terceiros seguem sem resposta (item 16), pergunta deles, não bloqueia o projeto. A minimização deste lado é M1 (c), M4 e M11. O projeto não guarda pessoa do Acelerato. Se algum ambiente já recebeu linhas do Acelerato pelo desenho anterior, vale o levantamento do K-097 (`docs/security/k097-levantamento-staging.md`) para o `dspd_ac` antes da primeira coleta real.

### M11. Linhas de outras organizações e de clientes externos saem do MySQL (I) · **alta** (novo)
- Estado (respostas, itens 9 e 14): a tabela tem dezenas de organizações, inclusive clientes externos; o tipo SSSC tem cerca de 6,9 mil linhas em 6 organizações, das quais 2 são as do DSPD da D-8.
- Caminho: consulta sem filtro na origem, ou com filtro só no coletor, traz para a máquina do dono, para a memória do processo e para eventuais logs de erro chamados de terceiros, com a pessoa e o texto livre deles; um erro de filtro em código grava esses chamados na base e mistura populações nas métricas.
- Controles exigidos: filtro da população **no `WHERE` da consulta constante** (tipo SSSC e, conforme a D-8 e a E3.5, as organizações e equipes da lista fechada), nunca depois de trazer; o filtro não vem do `.env`; segunda camada no coletor: o zod confere `tipo_ticket` (e organização, se fizer parte do filtro) contra a lista fechada e falha fechado se chegar linha fora dela (CA-11); a view do M1 (c) leva o filtro para o banco e torna o erro de código inócuo. Excluídos da população (lixeira) seguem a regra de guarda do histórico: se entram ou não no `WHERE` é decisão do plano (E3.5), não deste modelo.
- Pergunta: das 6 organizações do tipo SSSC, alguma é cliente externo? (resposta sim ou não, sem nome; define se o filtro por tipo basta ou se precisa também da lista de organizações.)

## 4. O que muda em relação ao desenho pelo Metabase
| Tema | Desenho pelo Metabase (ADR 0013 §4, `metabase-acelerato-configuracao.md`) | Fonte MySQL (este modelo) |
|---|---|---|
| Credencial | API key do Metabase, em grupo dedicado | Usuário e senha de banco (hoje conta compartilhada, risco aceito, M1) e a CA ou impressão do certificado |
| Transporte | HTTPS da API do Metabase | Protocolo MySQL; servidor aceita texto puro: TLS e verificação exigidos no cliente (M3) |
| Quem escreve o SQL | A pergunta salva no Metabase | O projeto; injeção, só SELECT, `LOCAL INFILE` e filtro da população são nossos (M5, M11) |
| Minimização na origem | Pergunta salva com lista de colunas | Hoje só a consulta constante (M4 a, M11); com a view do M1 (c), no banco |
| Quem controla o acesso | Administrador do Metabase | DBA do MySQL do time de ciência de dados |
| Superfície da credencial | Só perguntas da coleção permitida | A tabela inteira, de qualquer host, até o M1 (b) e (c) |
| Disponibilidade | Limites e timeouts do Metabase | Carga direta num servidor sem tempo máximo de consulta (M6) |
| Equivalente a "só GET" | Só leitura da API | Só `SELECT` (GRANT já é só leitura), transação só leitura |
| O que não muda | Allow-list estrita na fronteira, pessoa e texto livre nunca na staging, `dspd_api` com GRANT por coluna, append-only, separação das fontes | Igual |

O novo texto da regra do `CLAUDE.md` (E2.1) deve manter: usuário de banco só leitor, credencial só no `.env`, TLS verificado, consulta só SELECT com filtro da população na origem, e a allow-list de colunas e de caminhos `json` na fronteira com a mesma lista de proibidos.

## 5. Controles, em ordem de pré-condição
1. **Antes do primeiro código do coletor MySQL:** lista fechada do M4 conferida com a §2 do plano (E3.5); M4 (a) a (f), M5 e M11 no plano; ADR nova ou revisão da ADR 0013.
2. **Antes da primeira conexão do coletor (ainda com a conta compartilhada):** M3 com CA ou impressão confirmada pelo DBA; M2 (variáveis, zod, erro próprio, redact); teste do marcador; M6 (tempo máximo no servidor, conexão fechada ao fim).
3. **Antes do worker incremental:** M6, M7, M8; levantamento do `dspd_ac` (M10).
4. **Antes da coleta agendada:** usuário próprio do M1 (a), (b) e (d), fim do risco aceito de 14:24; view do M1 (c) se o DBA aceitar.
5. **Antes da coleta fora da máquina do dono:** nova rodada deste modelo (decisão de 14:23 restringe hoje à máquina dele).

## 6. Perguntas
### Ao time de ciência de dados e ao DBA (levadas pelo dono)
Respondidas (respostas, itens 1, 10, 13, 14 e 17): conta e GRANT atuais, colunas e campos de pessoa, escopo da tabela, forma de atualização, peso do dash. Seguem abertas:
1. Criar usuário dedicado ao coletor, com host amarrado à máquina do dono, `REQUIRE SSL`, `MAX_USER_CONNECTIONS` baixo e `SELECT` só numa view da população SSSC sem as colunas barradas (M1)?
2. Fornecer o certificado da CA do servidor ou confirmar por outro canal a impressão SHA-256 do certificado; o certificado tem o endereço usado como nome (M3)?
3. Por qual caminho de rede a máquina do dono chega ao servidor: rede interna ou VPN (item 12)?
4. Avisam antes de mudar a estrutura (item 8)?
5. Rodar ou aceitar o `EXPLAIN` da consulta final, ou criar índice para o filtro e a marca d'água (M6)?
6. Limites do usuário, política e responsável pela troca de senha da conta compartilhada enquanto ela for usada (item 15)?
7. Das 6 organizações do tipo SSSC, alguma é cliente externo (sim ou não, M11)?
8. Para cada campo personalizado da lista fechada do plano, qual é o `tipo` (seleção, data, booleano, texto) e, só para os de seleção, os valores possíveis do formulário, sem valor de chamado (M4 d)?
9. Base legal, retenção e acesso de terceiros da cópia (item 16; não bloqueia o projeto).

### Ao dono (R-DECISAO; nenhuma resolvida por inferência)
As 3 do E3.3 foram respondidas (14:23, 14:24, 14:25). Nova, só se a pergunta 2 acima não tiver resposta: sem CA e sem impressão confirmada pelo DBA, (A) esperar a resposta antes da primeira coleta (recomendado) ou (B) aceitar TLS sem verificação como risco registrado (M3).

## 7. Casos de abuso (para o qa-engineer escrever como teste na implementação)
| # | Entrada | Caminho | Resultado esperado |
|---|---|---|---|
| CA-1 | Linha com as 50 colunas, `raw` e `solicitantes` com marcador, `campos_personalizados` com os campos de pessoa e texto livre do M4 e um campo desconhecido com marcador, e uma coluna desconhecida | MySQL (fixture) → allow-list → `stg_chamado` | coluna extra falha fechado com `dados-invalidos`; campos fora da lista ignorados; nada gravado; marcador ausente da base, do log e de `ctl_coleta_falha` |
| CA-1b | Linha só com colunas permitidas, mas com texto livre numa coluna de código ou num campo de seleção | allow-list → staging | valor fora do domínio vira nulo com contagem; texto não gravado |
| CA-2 | Senha de teste fixa como marcador; acesso negado, timeout, rede caída, falha de TLS | cliente MySQL → catch → log e `ctl_coleta_falha` | marcador ausente do log, de `ctl_` e da exceção propagada; acesso negado para sem retry |
| CA-3 | Configuração sem TLS, com `rejectUnauthorized: false`, sem CA nem impressão; servidor sem TLS; certificado com impressão ou CA diferente | partida e conexão | partida ou conexão recusada, com mensagem fixa sem valor; nunca cai para texto puro |
| CA-4 | Linha com `\u0000`, surrogate isolado, `json` malformado e tipo errado com marcador | coletor → zod e Postgres → log e `ctl_` | caracteres removidos ou linha recusada; erro só com código, entidade e `id_origem`; marcador ausente |
| CA-5 | Consulta do módulo; marca d'água com `' OR 1=1 --`; nome de tabela no `.env` com `;` ou espaço | código-fonte e cliente | consulta constante começa por `SELECT`, sem `;`, com o filtro da população e a dica de tempo máximo; valor só por placeholder; nome inválido recusado na partida |
| CA-6 | Servidor simulado que pede arquivo local (`LOCAL INFILE`) | servidor de teste → cliente | o cliente recusa; nenhum arquivo lido |
| CA-7 | Duas coletas ao mesmo tempo; backfill (toda a população com atualização nova); recarga com todos os ids ausentes; volume acima do teto | coletor → `ctl_coleta` e staging | a segunda não inicia; backfill regrava de forma idempotente; recarga ou volume acima do teto gera alerta sem marcar ausência em massa; nada apagado |
| CA-8 | Host, banco, tabela ou lista de colunas e caminhos diferentes do registrado em `ctl_coleta` | partida do coletor | coleta recusada sem migração explícita |
| CA-9 | Módulo do Acelerato tentando `INSERT` em esquema do BusinessMap (teste estrutural) | código-fonte | o teste falha |
| CA-10 | `dspd_api` lendo `payload` da `stg_chamado` e colunas fora do GRANT | API → banco | permissão negada (K-085; reexecutar com o esquema final) |
| CA-11 | Linha de outro tipo ou de organização fora da lista fechada, com marcador | MySQL (fixture) → zod | falha fechado; nada gravado; marcador ausente da base e do log |
| CA-12 | `campos_personalizados_etapa` com campo de `tipo` texto e com a justificativa de ajuste, ambos com marcador; `estatisticas.impedimentos.usuarios` com marcador | coletor → staging e `stg_etapa` | só `justificativa_informada` e o booleano "preenchido" quando previsto; impedimentos não lidos; marcador ausente |
| CA-13 | `agente_key` preenchido com marcador numérico | coletor → staging | grava só `com_agente`; o id não aparece na base nem no log |
| CA-14 | Servidor simulado que não responde à consulta | cliente → MySQL de teste | consulta interrompida pelo tempo máximo; conexão fechada; no máximo 3 tentativas |

## 8. Riscos aceitos
- **R-1 (M1), conta compartilhada de desenvolvimento com host aberto:** aceito pelo dono em 2026-10-30 14:24 (Histórico do pedido 056, opção B), válido até o time de ciência de dados criar o usuário próprio e, no máximo, até a coleta agendada. Condições do aceite: mitigações do M1 (segunda camada), M2, M3, M5 e M11 implementadas. O registro formal em `docs/security/aceites/` é do dono, ligado ao `commit:` do parecer da fatia do coletor; o Jarvis o pede quando esse parecer existir.
- Nenhum outro. TLS sem verificação, se vier, é pergunta nova ao dono (§6), não aceite implícito.

## 9. Ferramentas e lacunas
Revisão estática de documentos. `gitleaks`, `semgrep` e `osv-scanner` não foram executados nesta etapa (sem código novo; as varreduras rodam no CI do projeto, `devops-engineer`). O driver MySQL do Node ainda não está escolhido: a dependência nova passa pela auditoria de cadeia de suprimentos quando entrar, e o parecer confere nele o padrão de `LOCAL INFILE`, `multipleStatements` e TLS. Versão do servidor MySQL (5.7 ou 8, define se `JSON_TABLE` existe para a view) não informada. Nada foi executado contra o MySQL, o Metabase ou produção.

# 0023 - Acelerato pela tabela MySQL do time de ciência de dados, só leitura, com TLS fixado e consulta de lista fechada

Estado: proposta. Data: 2026-10-30.
Propósito: fixar como o coletor lê o Acelerato (fonte, driver, transporte, consulta, incremental e histórico) para a fatia F1 do pedido 056 ser implementada sem decisão nova. Público: node-backend, security-engineer, tech-lead, qa-engineer. Revisão: 2026-11-30.

- Pedido: `docs/pedidos/056-acelerato-mysql.md` (E4.1). Plano: `docs/architecture/features/056-acelerato-mysql.md` (vigente desde 2026-10-30; §0, §2, §2.1, §4 e §5). Modelo de ameaças: `docs/security/056-acelerato-mysql-ameacas.md` (M1 a M11). Review do discovery: `docs/reviews/056-acelerato-discovery.md` (A1 a A4).
- **Substitui:** a ADR 0013 §4 ("Acelerato pelo Metabase") inteira. O resto da 0013 continua como está (módulos, fronteiras, coleta por fonte).
- Complementa: ADR 0020 (proteção de pessoa no coletor), ADR 0016 (SCD2), ADR 0014 (stack do back-end).
- Listas fechadas: `docs/architecture/fontes/acelerato-listas.md`. SQL versionado: `docs/architecture/fontes/acelerato-mysql.sql`, criado na E4.5 a partir das formas do item 4 abaixo.

## Contexto
- Decisões do dono de 2026-10-30, registradas no pedido 056: ler a tabela MySQL **só para leitura, com usuário só leitor** (pergunta 1, "B"), o que muda a regra do `CLAUDE.md` que mandava ler o Acelerato só pela API pública; a tabela é uma **cópia mantida pelo time de ciência de dados**, não o banco do Acelerato (pergunta 2, "B"); o Acelerato entra agora, em paralelo ao 052, sem misturar as fontes (pergunta 3, "A"); recorte para 2026-11-02 com as métricas operacionais e as do Acelerato.
- A tabela tem 50 colunas, um chamado por linha, cerca de 292 mil linhas, dezenas de organizações (inclusive clientes externos), cinco colunas `json` com pessoa e texto livre dentro (`raw`, `solicitantes`, `campos_personalizados`, `campos_personalizados_etapa`, `estatisticas.impedimentos`) e atualização contínua em ciclos de 10 a 15 min (plano §1).
- A conta de banco disponível é compartilhada, com só `SELECT` e `SHOW VIEW` nesta tabela e host aberto; o servidor aceita texto puro (`require_secure_transport = OFF`) e não há CA disponível (ameaças M1 e M3). Aceite do dono: conta compartilhada por enquanto, coleta só na máquina do dono (plano §0, linha E3.3 §6).
- Fato do Histórico do pedido (2026-10-30 17:14): a impressão SHA-256 do certificado do servidor foi obtida; é um certificado autogerado pelo MySQL 8.0.35, válido até 2035-10-22. Isso fecha a P-DS-20 do plano (versão do servidor): 8.0.35, com `JSON_TABLE` disponível.
- O desenho anterior (0013 §4: pergunta salva do Metabase exportada em JSON) nunca chegou a código; o roteiro `docs/integracao/metabase-acelerato-configuracao.md` nunca foi executado (sem URL nem chave).

## Decisão

### 1. Fonte e sessão (só leitura em três camadas)
1. **Fonte:** a tabela `ACELERATO_CHAMADOS` do MySQL do time de ciência de dados. O nome da tabela é **constante no código**; host, porta, banco, usuário e senha vêm do `.env` em variáveis separadas (nunca URL de conexão com senha, M2).
2. **Privilégio (primeira camada, no servidor):** a conta só tem `SELECT` e `SHOW VIEW` (resp. 10). Usuário próprio, host amarrado e `REQUIRE SSL` são pedidos ao DBA antes da coleta agendada (M1 a, b, d); até lá vale o aceite do dono.
3. **Sessão (segunda camada, no coletor):** por execução, **uma conexão** (sem pool ocioso; aberta no início e fechada ao fim, inclusive em erro); `SET SESSION TRANSACTION READ ONLY`, `START TRANSACTION READ ONLY`, as consultas, e `ROLLBACK` no fim (nunca `COMMIT`, como o dash); `SET SESSION max_execution_time` com o teto do coletor (padrão 120.000 ms, variável `ACELERATO_MYSQL_MAX_EXEC_MS`, o servidor não impõe limite, resp. 15); timeout do lado do cliente um pouco acima desse teto (padrão 150 s), que destrói a conexão; tempo de conexão de 10 s.
4. **Driver (terceira camada):** `multipleStatements: false` e `permitLocalInfile: false` explícitos na configuração, mesmo sendo o padrão; nenhuma fábrica de leitura de arquivo; `ssl` sempre configurado (item 3). Um único arquivo (`server/src/modulos/acelerato/cliente-mysql.ts`) importa o driver; um teste estrutural falha se outro arquivo o importar.
5. **Consulta só `SELECT`:** as consultas do item 4 são constantes; valores (marca d'água, chave de paginação, listas do recorte) só por placeholder em instrução preparada; teste que falha se alguma consulta não começar por `SELECT` (ou `WITH`) ou contiver `;` (CA-5, M5).
6. **Falhas:** acesso negado vira categoria `autenticacao`, sem nova tentativa; rede e tempo esgotado até 3 tentativas com backoff; o erro do driver nunca é registrado (só `codigo`, entidade e `id_origem`, sem `message`, sem `cause`, sem configuração, M2 e M8).

### 2. Driver: `mariadb` (MariaDB Connector/Node.js)
- **Escolha:** o pacote `mariadb` (versão 3.x, a fixar no lockfile pela E4.5 depois do parecer da E4.2), cliente do protocolo MySQL, com suporte a `caching_sha2_password` (padrão do MySQL 8.0).
- **Motivo (determinante):** o TLS fixado do item 3 exige passar ao `tls.connect` do Node opções próprias (`ca`, `allowPartialTrustChain` e uma `checkServerIdentity` que compara a impressão). O `mariadb` repassa o objeto `ssl` ao `tls.connect` (`Object.assign({}, opts.ssl, baseConf)` em `lib/connection.js`, ramo `develop`, lido em 2026-10-30). O `mysql2` não permite: monta o contexto seguro só com `ca`, `cert`, `ciphers`, `key`, `passphrase`, `minVersion` e `maxVersion`, e troca a `checkServerIdentity` pela padrão do Node ou por uma função vazia, conforme `verifyIdentity` (`lib/base/connection.js`, `startTLS`, lido em 2026-10-30). Com o `mysql2`, a única forma de aceitar o certificado autogerado sem a CA seria `rejectUnauthorized: false`, que o M3 proíbe.
- **Motivos secundários:** `permitLocalInfile` e `multipleStatements` desligados por padrão (documentação do conector, opções de conexão, lida em 2026-10-30).
- **Pontos para o parecer da E4.2 (cadeia de suprimentos):** licença LGPL-2.1 (uso sem modificação, como dependência); dependências transitivas; histórico de vulnerabilidades; mantenedor. Se o parecer recusar, vale a alternativa B abaixo (`mysql2` com a CA do servidor), que depende do DBA.
- **Compatibilidade com o MySQL 8.0.35:** a confirmar na primeira conexão real (E4.8), com o dono presente. Falha de autenticação ou de protocolo é critério de reversão do driver (abaixo).

### 3. TLS exigido e certificado fixado pela impressão (`ACELERATO_MYSQL_TLS_SHA256`)
- **Variáveis:** `ACELERATO_MYSQL_TLS_SHA256` (a impressão SHA-256 do certificado do servidor, 64 dígitos hexadecimais, com ou sem `:`; o coletor normaliza para minúsculas sem separador) e `ACELERATO_MYSQL_TLS_CERT_FILE` (caminho do arquivo PEM do certificado do servidor, que é público, não é segredo). As duas são obrigatórias, sem valor padrão, validadas por zod na partida com mensagem fixa (nunca ecoa o valor).
- **Na partida:** o coletor lê o PEM, calcula a SHA-256 do certificado (DER) e **recusa a partida** se ela não for igual a `ACELERATO_MYSQL_TLS_SHA256`. A impressão é a autoridade; o arquivo sozinho não muda a confiança.
- **Na conexão:** `ssl = { ca: <PEM>, allowPartialTrustChain: true, rejectUnauthorized: true, minVersion: 'TLSv1.2', checkServerIdentity }`, em que `checkServerIdentity` devolve erro se a impressão do certificado recebido (`fingerprint256`, normalizada) for diferente da fixada. O nome do servidor não é conferido (a conexão é por endereço da faixa interna e o certificado autogerado não traz esse nome); a conferência de nome é **trocada** pela de impressão, nunca desligada (M3, opção 2). `allowPartialTrustChain` existe no Node a partir da 22.9 e da 20.18 (runtime do projeto: Node 24, ADR 0013 §5).
- **Ordem garantida:** a verificação acontece no aperto de mão TLS, antes de o driver enviar a credencial. Certificado diferente: conexão destruída, categoria `tls`, sem nova tentativa, sem enviar usuário nem senha.
- **Proibido:** `rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED=0`, `insecureAuth`, `ssl` ausente ou fallback para texto puro.
- **Troca do certificado no servidor** (renovação ou recriação): a coleta para até o dono obter a nova impressão e **confirmá-la com o DBA por outro canal** (M3); só então o `.env` e o PEM mudam. A troca é registrada no pedido, não no código.
- Com a CA do servidor fornecida pelo DBA (M3, opção 1), o `ca` passa a ser a CA e `allowPartialTrustChain` sai; a impressão continua fixada. Não muda esta ADR, só o conteúdo do PEM.

### 4. Consultas constantes com lista fechada de colunas e `JSON_TABLE`
Três consultas constantes, nesta forma (o texto final vai para `docs/architecture/fontes/acelerato-mysql.sql` na E4.5; `?` = placeholder; listas entre `<>` = expansão de placeholders a partir das listas fechadas, nunca texto concatenado):

```sql
-- Q1 chamados (uma página)
SELECT ticket_key, tipo_ticket_key, tipo_ticket, status_key, status, encerrado,
       categoria_key, categoria, organizacao_key, organizacao, equipe_key, equipe,
       (agente_key IS NOT NULL) AS com_agente,
       prioridade, data_criacao, data_atualizacao, data_pronto, lixeira, arquivado,
       suspenso, impedido, tempo_vida_dias, tempo_ciclico_dias,
       sla_pa_tempo_min, sla_pa_saldo_min, sla_pa_prazo_min, sla_pa_violado, sla_pa_status,
       sla_r_saldo_min, sla_r_prazo_min, sla_r_violado, sla_r_status,
       data_primeiro_comentario, primeiro_comentario_min_uteis,
       sincronizado_em, estatisticas_em
FROM ACELERATO_CHAMADOS
WHERE tipo_ticket_key IN (<tipos>) AND organizacao_key IN (<organizacoes>) AND equipe_key IN (<equipes>)
  AND data_atualizacao >= ?
  AND (data_atualizacao > ? OR (data_atualizacao = ? AND ticket_key > ?))
ORDER BY data_atualizacao, ticket_key
LIMIT 1000

-- Q2 etapas dos chamados da página
SELECT c.ticket_key, e.etapa_key, e.descricao, e.descricao_workflow, e.tempo_sla, e.quantidade_vezes
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (
       etapa_key BIGINT PATH '$.etapaKey', descricao VARCHAR(255) PATH '$.descricao',
       descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow',
       tempo_sla BIGINT PATH '$.tempoSla', quantidade_vezes INT PATH '$.quantidadeDeVezes')) e
WHERE c.ticket_key IN (<chaves da página>)

-- Q3 campos por nome exato (só os nomes da lista fechada saem do MySQL)
SELECT c.ticket_key, f.nome, f.valor
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.campos_personalizados, '$[*]' COLUMNS (
       nome VARCHAR(255) PATH '$.nomeCampo', valor VARCHAR(80) PATH '$.valor')) f
WHERE c.ticket_key IN (<chaves da página>) AND f.nome IN (<nomes da fatia>)
```

- **Colunas:** exatamente as 35 lidas da §2 do plano (8 delas só para reconciliação) mais `com_agente`; as 11 barradas (`titulo`, `agente`, `agente_email`, `solicitante`, `solicitante_email`, `origem`, `url`, `sla_r_tempo_min`, `tempo_workflow_total`, `solicitantes`, `raw`) nunca aparecem no texto da consulta. Nunca `*`, nunca uma coluna `json` inteira. A lista com a origem de cada item está em `acelerato-listas.md` §1.
- **`com_agente` calculado no `SELECT`** (D-9): só `agente_key IS NOT NULL` sai do MySQL, como booleano; o id do agente não chega à memória do coletor. Isso **resolve o A3 do review**: vale a forma do plano (§2 linha 14, §4.2), mais estrita que a do modelo de ameaças (M4 f, "derivado em memória"); o security-engineer alinha o texto do modelo na revisão dele (E4.2).
- **`estatisticas`:** só `workflow.etapas[]` com as cinco chaves acima, via `JSON_TABLE`; `impedimentos` e o resto do `json` não saem do MySQL. Chamado com `estatisticas` nula não devolve linha na Q2 e é contado à parte em `ctl_coleta_contagem` (plano §1), nunca imputado.
- **Campos personalizados:** igualdade exata de nome no `WHERE` da Q3, então nome fora da lista não sai do MySQL (M4 d). `valor` limitado a 80 caracteres pela própria coluna do `JSON_TABLE` (o mesmo tamanho de `ref_dominio.codigo`; valor maior volta nulo ou cortado, conforme o servidor, e nos dois casos não casa com o domínio); no coletor, o valor só segue se estiver no domínio fechado do campo, senão vira nulo com contagem, sem o valor. **Na F1 e na F2, a Q3 pede só o campo dos 90 dias** (S8, D-10), o único da §2.1 com tratamento que não depende da P-DS-19. Os campos de `campos_personalizados_etapa` (S5, S6, S7, S9 motivo, S11) entram na F3, depois da P-DS-19 (tipo e domínio de cada campo), com uma Q4 de mesma forma sobre `'$[*]'` com `nome`, `tipo` e `valor` (do `tipo` texto livre, só o booleano "preenchido", calculado no `SELECT`). Incluir a Q4 é mudança do SQL versionado: novo hash e entrada em `ref_versao_criterio` (T2.6).
- **Segunda camada na fronteira:** cada linha passa pelo schema zod `strict` da allow-list (`allow-list.ts`); coluna ou chave fora da lista **falha fechado** (`dados-invalidos`, nada gravado pela metade). A lista de proibidos do teste é escrita no teste, não derivada da constante (ADR 0020, B-1). Nenhuma entrada nova em `COLUNAS_PESSOA`.

### 5. Filtro de origem e a contagem dos chamados fora das 2 organizações
- O recorte vai no `WHERE` da Q1 por **chave**: `tipo_ticket_key` (tipo DSPD - SSSC), `organizacao_key` (as duas organizações do DSPD, D-8; os documentos divergem sobre qual é a segunda, ver `acelerato-listas.md` §5, e a lista só fecha com o dono) e `equipe_key` (as 3 equipes SSSC, D-8). Os valores vêm de `ref_dominio` (campos `tipo_recorte`, `organizacao_recorte` e `equipe`, código = a chave em texto decimal, rótulo = o nome), arquivo versionado e carregado pelo `ref:sync`; nunca do `.env` (M11). Linha de outra organização nunca sai do MySQL.
- `lixeira` não filtra a coleta (o chamado excluído fica na base); filtra só a `vw_populacao_sssc`.
- **Segunda camada (CA-11):** o zod confere `tipo_ticket_key`, `organizacao_key` e `equipe_key` (e os nomes correspondentes) contra as listas vigentes; linha fora delas faz a coleta **falhar fechado**.
- **Contagem dos chamados fora das 2 organizações (A2 do review, decisão técnica do Jarvis de 2026-10-30):** na **primeira carga** e em toda releitura semanal, o coletor roda uma consulta só de contagem, `SELECT COUNT(*) FROM ACELERATO_CHAMADOS WHERE tipo_ticket_key IN (<tipos>) AND equipe_key IN (<equipes>) AND organizacao_key NOT IN (<organizacoes>)`, e grava o número em `ctl_coleta_contagem` (chave `fora_organizacoes_recorte`). Nenhuma linha, chave nem nome de organização é lido nessa consulta. Se o número for maior que zero, o painel de sustentação não é publicado com dado real até o dono responder (PERGUNTA ao dono, levada pelo Jarvis na E4.8). A consulta não muda o filtro: o filtro pelas 2 organizações fica (M11).

### 6. Incremental, releitura semanal e saída do recorte (plano §4.3)
- **Incremental diário:** página por chave composta (`data_atualizacao`, `ticket_key`), 1.000 linhas, sem `OFFSET`; início em `marca_dagua − margem`, margem de 24 h (variável `ACELERATO_MYSQL_MARGEM_HORAS`, padrão 24), que cobre a defasagem de até 15 min da cópia com folga. Marca d'água = maior `data_atualizacao` lida, gravada em `ctl_coleta.marca_dagua_ate` **só em sucesso** (ADR 0006). O hash do staging deduplica a sobreposição. Na primeira carga, sem marca, `?` = a menor data possível (lê o recorte inteiro, cerca de 7 mil linhas).
- **Staging append-only:** hash igual ignora, diferente vira versão nova (SCD2, `anterior_sk`), nada é apagado (gatilho e GRANT de `dspd_ac`, `data-model.md` §1).
- **Releitura semanal do recorte:** Q1 a Q3 sem marca d'água (recorte inteiro), para pegar o que a marca perdeu (backfill que regrava linha sem mudar `data_atualizacao`, como o de 2026-10).
- **Saída do recorte:** na releitura semanal, os ids já conhecidos e não vistos são consultados só por `ticket_key`, `tipo_ticket_key`, `organizacao_key`, `equipe_key`, `lixeira` e `data_atualizacao` (`WHERE ticket_key IN (<ids não vistos>)`, em lotes de 1.000). Presente fora do recorte: versão nova com `fora_do_recorte = true` (mesmo payload da versão anterior; o hash inclui a marca). Ausente da tabela: versão nova com `ausente_na_extracao = true`. Reaparecer gera versão com as marcas em `false`.
- **Recarga suspeita (M7):** acima de 5% de ausentes sobre os ids conhecidos, a coleta para sem gravar as ausências, com alerta.
- **`ctl_coleta.parametros`:** SHA-256 de host e banco (nunca o valor), nome da tabela, SHA-256 da lista de colunas, das listas de nomes de campo e do SQL versionado, a impressão fixada (`ACELERATO_MYSQL_TLS_SHA256`, que é pública) e o maior `sincronizado_em` lido. Mudança de qualquer hash sem migração ou versão de critério registrada recusa a coleta (CA-8).
- **Frequência:** uma vez por dia (sugestão: início da manhã) mais `pnpm coleta ac`; a primeira carga é manual, com o dono presente, na máquina dele. `sincronizado_em` sem mudança = sucesso sem novidade.

### 7. Tempo por etapa da ferramenta (exceção registrada da D-7)
O `tempoSla` de cada etapa entra como duração pronta (segundos) nas métricas S4, S9 e S10, exceção à D-3. A exceção é uma entrada em `ref_versao_criterio` (domínio `acelerato`, com as métricas afetadas em `ref_versao_criterio_metrica`) e aparece como marca nos gráficos dessas métricas (T2.6). A biblioteca não reaplica horas úteis sobre esse valor; só calcula percentis, janela de 12 semanas e o mínimo de 20 itens. A S8 pelo campo dos 90 dias (D-10) tem entrada própria.

## Alternativas
- **A. API pública do Acelerato (regra anterior do `CLAUDE.md`):** limitada a 10 resultados por chamada (doc do dash §8, item 7) e sem os relógios de SLA prontos; o dono a trocou pela tabela (pergunta 1, "B").
- **B. `mysql2` com a CA do servidor (M3, opção 1):** licença MIT e mais usado; mas sem a CA, a única forma de aceitar o certificado autogerado é `rejectUnauthorized: false` (proibido), e com `verifyIdentity` desligado não há conferência de nome nem de impressão. Fica como plano B se a E4.2 recusar o `mariadb` ou se a primeira conexão falhar, desde que o DBA forneça a CA.
- **C. Sondagem TLS própria antes da conexão** (abrir o aperto de mão do MySQL à mão, ler o certificado, conferir a impressão e só então conectar): dispensa o arquivo PEM, mas exige escrever parte do protocolo MySQL e ainda precisaria de `ca` na conexão real; mais código e mais risco que guardar um arquivo público.
- **D. Metabase (0013 §4):** nunca configurado; acrescenta uma camada (chave, grupo, pergunta salva) sem ganho, já que a tabela é a mesma que o dash lê.
- **E. View filtrada criada pelo DBA (M1 c):** preferida quando existir (filtro e colunas no banco, erro de código inócuo). Não depende deste projeto; quando existir, as consultas passam a ler a view com as mesmas colunas e esta ADR ganha uma nota, sem nova decisão.
- **F. Uma consulta só, com `JOIN` das etapas:** multiplicaria a linha do chamado por etapa e misturaria dois grãos no mesmo resultado; três consultas por página mantêm cada grão separado.
- **G. Extrair já na F1 todos os campos da §2.1:** traria para a memória valores sem domínio conhecido (P-DS-19), que viraram nulo de qualquer forma; contraria a minimização (M4) sem ganho até a F3.

## Consequências
- Melhora: dado real do Acelerato na base para o recorte de 2026-11-02 (S1 resolução, S2, contagem da S3, S4, S8, S9 tempo, S10, S12) com a mesma população do dash; pessoa, texto livre e chamados de outras organizações não saem do MySQL; o servidor falso não recebe a senha.
- Piora: dependência nova (`mariadb`, LGPL-2.1) a auditar; dois itens a manter no `.env` (impressão e PEM) e uma parada obrigatória quando o certificado do servidor mudar; a coleta depende da máquina do dono ligada; a conta compartilhada com host aberto continua até o DBA agir (risco aceito).
- A manter: o teste estrutural do único importador do driver; o teste de consulta só `SELECT` sem `;`; o teste de fronteira com a fixture das 50 colunas e os marcadores da §2.1 do plano; o teste da `checkServerIdentity` (impressão igual passa, diferente recusa, formato com `:` e sem `:`); a contagem `fora_organizacoes_recorte`; a revisão desta ADR quando a CA, o usuário próprio ou a view do DBA chegarem.
- `CLAUDE.md`: a regra nova (E2.1) não cita o TLS verificado nem o filtro na origem (A1 do review); fica com o security-engineer decidir se promove (E4.2). Esta ADR não edita o `CLAUDE.md`.

## Por que o existente não basta
Mecanismos novos: o cliente MySQL com certificado fixado por impressão e o filtro de origem por chave. O que existe para a mesma necessidade: o roteiro do Metabase (`metabase-acelerato-configuracao.md`), que pressupõe HTTPS com certificado público e uma pergunta salva com a lista de colunas fixada por quem administra o Metabase. A evidência de execução de que não serve: o roteiro nunca rodou (§11 dele: "Não foi testada nenhuma chamada real (não há URL nem chave)"), e a fonte decidida pelo dono é outra (MySQL direto, pergunta 1 "B"). Para o transporte, a resposta do time de ciência de dados (item 11) mostra servidor com `require_secure_transport = OFF`, sem CA disponível e cliente de teste que não validou o certificado; e a leitura do código do `mysql2` (`startTLS`) mostra que ele não aceita conferência de impressão. O cliente HTTP do BusinessMap (ADR 0022) não se aplica: outro protocolo.

## Critério de reversão
Qualquer um destes fatos reverte a parte indicada:
- **Fonte:** a tabela deixa de ser mantida, ou o maior `sincronizado_em` gravado em `ctl_coleta.parametros` fica parado por mais de 1 dia útil em duas coletas seguidas (a cópia é contínua), ou a releitura semanal acusa recarga com troca de ids (ausentes acima de 5%).
- **Driver:** a primeira conexão real (E4.8) falha por autenticação ou protocolo com o `mariadb`, ou o parecer da E4.2 recusa o pacote; nos dois casos, plano B (alternativa B), condicionado à CA do DBA.

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-11-02 | primeira conexão real (E4.8): conectou com o certificado fixado; impressão errada no `.env` recusada antes da autenticação; `fora_organizacoes_recorte` = ? | pendente |
| 2026-11-30 | `sincronizado_em` parado mais de 1 dia útil (sim ou não); ausentes na releitura semanal (maior %) | pendente |

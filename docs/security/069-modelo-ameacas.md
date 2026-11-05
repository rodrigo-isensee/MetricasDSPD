# Modelo de ameaças: lotes L2-a, L2-c e L9-b do pedido 069

Etapa E1.8 (cartão K-220). Autor: security-engineer. Data: 2026-11-04.
Base lida: `docs/analises/069-desenho.md` (gatilhos, L2-a, L2-c, L9-b, perguntas em aberto), `CLAUDE.md` (regras invioláveis: credenciais, allow-list da fonte, GRANT por coluna) e, só leitura, o código da worktree `MetricasDSPD-041` (develop com 065 a 067, HEAD 40a6b96): `server/src/modulos/businessmap/{allow-list,coleta}.ts`, `server/src/modulos/acelerato/{sql,allow-list,listas-fechadas,coletor}.ts`, `server/src/modulos/referencia/{dominio-acelerato,repositorio}.ts`, `server/src/entradas/ref-sync-ac.ts`, `server/src/plataforma/db/grants.ts`, `server/migrations/0007_bm_referencia.ts`, `docs/architecture/fontes/acelerato-listas.md` §3, e o M4 e os casos de abuso de `docs/security/056-acelerato-mysql-ameacas.md` (só no commit 19275cb, branch `docs/056-acelerato-discovery`; ver A6). Nenhum `.env` lido, nenhuma API nem base consultada, nada executado além de leitura.

Este documento é **modelo de ameaças, não parecer**: o parecer de cada lote (R-SEGURANCA) sai sobre o commit final dele, em `docs/security/069-<lote>.md`. Gatilhos: campo novo da fonte na fronteira (L2-a, L9-b), tratamento novo na allow-list (L2-c), consulta SQL nova sobre coluna `json` com pessoa e texto livre na origem (L9-b). Os casos de abuso (CA-069-n) são para o qa-engineer escrever como teste durante a implementação.

## Ameaças comuns aos três lotes

| # | Ameaça (STRIDE) | Caminho realista | Sev. |
|---|---|---|---|
| T1 | Dado de pessoa ou texto livre chega ao staging (I) | campo da fonte com nome, e-mail, id de usuário ou texto digitado entra no `payload`/`custom_fields` da `stg_*`, que é append-only: sem eliminação viável | alta |
| T2 | Campo novo fora da allow-list (I, T) | o mapa ou a lista de nomes passa a ser dado (arquivo ou `ref_dominio`), e quem escreve o dado amplia o que sai da fonte sem mudar código nem passar por review de segurança | alta |
| T3 | Papel com GRANT a mais (E, I) | o lote "resolve" uma permissão negada ampliando o GRANT (coletor no `ref_`, API no `stg_`, `dspd_ref` em tabela fora de `ref_`) | média |
| T4 | Segredo ou dado real em arquivo versionado (I) | fixture com nome ou e-mail real, saída do diagnóstico colada no repositório, host ou usuário do MySQL no SQL versionado, string de conexão em teste | média |
| T5 | Entrada não confiável do arquivo de mapa ou domínio (T, D) | JSON malformado, chave extra, `field_id` não numérico, coluna inexistente, rótulo com e-mail ou caractere invisível, arquivo enorme, caminho vindo de argumento | média |
| T6 | Valor da fonte em log, erro ou contagem (I) | mensagem de zod ou do banco com o valor; nome de contador montado a partir do texto recebido | média |

Controles transversais (valem para os três lotes):
- Nenhum GRANT novo: `dspd_ref` já tem `SELECT, INSERT` e `UPDATE (vigente_ate)` em todo `ref_` de `bm`, `ac` e `core` (`server/src/plataforma/db/grants.ts:115-117, 124-125`); `dspd_coletor` já lê `ref_` (`grants.ts:107`) e grava `stg_` (`grants.ts:91`); `dspd_api` nunca lê `stg_` (`grants.ts:108-113`). Qualquer diff em `grants.ts` nesses lotes é achado bloqueante do parecer. Teste: a saída da função de GRANT é idêntica antes e depois do lote.
- Credenciais só no `.env` (regra inviolável do `CLAUDE.md`): o `bm:ref-sync` usa `PG_REF_URL` pelo `carregarConfigRef` (molde `server/src/entradas/ref-sync-ac.ts:16-24`) e não lê a apikey do BusinessMap: carrega arquivo, não chama a API. Erro impresso só com código fixo, nunca URL, senha ou texto do banco (molde `ref-sync-ac.ts:27`).
- Fixtures só com marcadores sintéticos (`MARCADOR-PESSOA-069`, `marcador069@exemplo.invalid`), nunca dado real; nenhum host, usuário ou banco real em SQL, teste ou doc. `gitleaks` não está no PATH desta estação: lacuna registrada; a varredura de segredos fica com o CI.
- Lista de proibidos **escrita no teste**, não derivada da constante do código (B-1 da ADR 0020).
- Contadores (`fora_dominio_<campo>`, `campo_fora_do_dominio`) com nome vindo de constante do código, nunca do texto recebido; erro de validação só com código, entidade, `id_origem` e nome de coluna constante (molde `server/src/modulos/acelerato/allow-list.ts:70-74`).

---

## Lote L2-a · mapa `field_id` → coluna e domínios do BusinessMap

**Ativos:** o staging do BusinessMap (`stg_card`/revisões, `custom_fields`, append-only); `dspd_bm.ref_dominio` (lido pelo coletor e pela API, que leva o `rotulo` ao navegador: `server/src/modulos/referencia/repositorio.ts:25`, `server/src/modulos/metricas/repositorio.ts:134`); o arquivo versionado `docs/architecture/fontes/businessmap-dominio.json`; a credencial do `dspd_ref`.

**Fronteiras:** (1) arquivo versionado → `bm:ref-sync` (zod) → `ref_dominio`; (2) `ref_dominio` → `dominiosDaColeta()` → `reduzirCamposCustomizados` (`server/src/modulos/businessmap/allow-list.ts:67-81`); (3) resposta de `/cards` (`custom_fields`) → staging; (4) `ref_dominio` → API → navegador.

**Ameaças específicas:**
- T1/T2: hoje o mapa é constante vazia no código (`server/src/modulos/businessmap/coleta.ts:40-45`); o lote o move para dado. Quem escreve `ref_dominio` (arquivo + `dspd_ref`, ou `INSERT` direto com a credencial do `dspd_ref`) decide que campo sai da fonte. O field 42 (Responsável CR, pessoa) e o 36 (ID Acelerato) só ficam fora se a remoção sobreviver à troca da fonte do mapa.
- T2: a recusa por tipo, como desenhada ("usuário ou texto livre recusado", desenho :107), é lista de negação: um tipo que o diagnóstico mostrar e ninguém previu (número livre, link, arquivo, multi-usuário com outro nome) passa (A3).
- T1 pela porta da referência: o `rotulo` do domínio é o valor exato recebido e vai ao navegador; se um campo de lista tiver nomes de pessoa como opções (ex.: "responsável pela área"), o nome entra no git e na API sem passar pelo staging (A5).
- T5: o arquivo é entrada não confiável mesmo versionado.

**Controles exigidos:**
1. Esquema zod `strict` do arquivo (molde `server/src/modulos/referencia/dominio-acelerato.ts:37-71`): `field_id` só `^\d{1,10}$`; coluna destino num **enum fechado no código** com as colunas de lista de `dim_card` do desenho (`classe_servico`, `sistema`, `area_solicitante`, `fornecedor`, `objetivo_estrategico`, `tamanho_declarado`, `responsabilidade_atraso`, `origem_demanda`, `fase_deteccao`, `severidade`, e `causa_raiz` só quando a migração dela existir); `codigo` e `rotulo` com o `textoSeguro` existente (sem controle, sem formatação invisível, sem `@`); um `field_id` para uma coluna e vice-versa (duplicata recusada); tamanho máximo do arquivo e das listas; caminho do arquivo constante (argumento só a data).
2. `type` do campo por **lista positiva** escrita no código e no teste (só os tipos de seleção única que o diagnóstico mostrar); qualquer outro `type`, ausente ou desconhecido, recusa a carga inteira (A3).
3. Recusa nominal no `bm:ref-sync` dos fields 36 e 42 e, **também**, no coletor depois de ler o `ref_dominio`: `dominiosDaColeta` continua removendo `CAMPOS_CUSTOMIZADOS_FORA` e ignora linha `campo_customizado` com `field_id` não numérico ou coluna fora do enum (A4).
4. Arquivo nasce vazio de campos (desenho): o lote não muda o que é coletado; o preenchimento (P-L2-1) é PR próprio com parecer de segurança (gatilho: dado de origem em arquivo versionado), que confere `type` e rótulos de cada campo (A5).
5. Valor fora do domínio grava `desconhecido`, nunca o texto (comportamento atual de `allow-list.ts:78`, a preservar).
6. Sem GRANT novo; `bm:ref-sync` com `dspd_ref`; versão de critério com o hash do arquivo.

**Testes de segurança que o lote traz:**
- Unidade do esquema: field 36 e field 42 no arquivo → recusa (lista escrita no teste); `type` de usuário, de texto, desconhecido e ausente → recusa; `field_id` `"42 "`, `"4a"`, `"-1"` → recusa; coluna `owner_user_id` ou inexistente → recusa; rótulo com `@`, U+200B, U+202E, U+2028 → recusa; chave extra na raiz e no item → recusa; `__proto__` como chave → recusa sem efeito.
- Coletor: `ref_dominio` com linha `campo_customizado` para `42` e `36` inserida direto por SQL → mapa sem os dois, nada no staging; linha com coluna fora do enum → ignorada.
- Staging (fixture de `/cards` com `custom_fields` dos fields 36 e 42 com marcador, um campo mapeado com valor no domínio e outro com texto marcador fora do domínio): staging tem só `{field_id, valor: código}` e `desconhecido`; marcadores ausentes do staging, do log e de `ctl_coleta_falha`.
- Saída do `bm:ref-sync` com URL inválida e senha marcador → mensagem fixa, marcador ausente.
- GRANT: saída idêntica à da develop.

**Veredito: segue com condição** (controles 1 a 6; A3 e A4 resolvidos no código do lote; A5 vale para o PR que preencher o arquivo).

---

## Lote L2-c · campo de data `data_acordada`

**Ativos e fronteiras:** os mesmos do L2-a, com um segundo tipo de entrada em `reduzirCamposCustomizados` (valor por forma, não por domínio) e a coluna `date` de `dim_card`.

**Ameaças específicas:**
- T1: o tratamento por forma é a primeira exceção ao "só por domínio" do BusinessMap; validação fraca (regex sem data civil, prefixo `^\d{4}-` sem âncora final, aceitar `Date.parse`) deixa texto livre passar, ex. `2026-11-04 cliente Fulano`.
- T2: o tipo "data" aplicado a um `field_id` que não é de data (erro no arquivo) faz o tratamento por forma valer para texto; o risco residual é baixo (só sai o que tem forma de data), desde que a forma seja estrita.
- T1 (dado sensível por forma): data é pessoal quando é de pessoa (nascimento, admissão); o enum de colunas de data tem só `data_acordada`.
- T6: valor recusado ecoado em log.

**Controles exigidos:**
1. Pré-requisitos: P-L2-1 mostra o campo; revisão da ADR 0020 4d registrada **antes** do código (o desenho já pede).
2. Data civil estrita: string inteira casando `^\d{4}-\d{2}-\d{2}$` e existente no calendário (reusar `dataCivilValida`, `dominio-acelerato.ts:23-27`); se o diagnóstico mostrar data com hora ou fuso, a forma aceita e a conversão ficam escritas na revisão da ADR, com âncoras nos dois lados; tamanho máximo antes do teste; número (epoch) recusado salvo se a ADR disser o contrário.
3. Enum de colunas de data fechado em `data_acordada`; o arquivo marca o campo como tipo data e só a lista positiva de tipos de data do diagnóstico é aceita (mesma regra do L2-a, controle 2).
4. Fora da forma → `desconhecido` no staging e `null` na projeção, nunca o texto (A8).

**Testes de segurança:** texto marcador; data com texto depois (`2026-11-04 MARCADOR`); `2026-02-30`; `2026-11-04T25:00`; string de 10 mil caracteres; número; objeto; `null`. Todos viram `desconhecido`/`null`, marcador ausente do staging e do log. Data válida chega como data. Field de tipo data mapeado para coluna de lista → recusa no `ref-sync`.

**Veredito: segue com condição** (só depois de P-L2-1 e da revisão da ADR 0020 4d; controles 2 a 4).

---

## Lote L9-b · consulta dos campos de etapa até o staging (Acelerato)

**Ativos:** a coluna `json` `campos_personalizados_etapa` do MySQL do time de ciência de dados (mistura campos de seleção, texto livre e pessoa: "Acelerato - Atendente", `_LOGIN`), o `payload` de `stg_chamado` (append-only), o SQL versionado (`docs/architecture/fontes/acelerato-mysql.sql`, `server/src/modulos/acelerato/sql.ts`) e o seu hash em `ctl_coleta.parametros`, o `dspd_ac.ref_dominio`.

**Fronteiras:** (1) MySQL → resultado da consulta (o que não sai do MySQL não vaza); (2) linha → zod `strict` → domínio → `payload`; (3) arquivo `acelerato-dominio.json` → `ac:ref-sync` → `ref_dominio` (domínios dos valores, P-DS-19); (4) log e `ctl_coleta_falha`.

**Ameaças específicas:**
- T2 (A1): o desenho carrega os nomes da fatia F3 de `ref_dominio campo = 'campo_personalizado'` "como o da S8" (desenho :152). O S8 não faz isso: o nome é constante do código (`server/src/modulos/acelerato/listas-fechadas.ts:30-31`, usado em `coletor.ts:118`), como manda o M4 (a) do 056. Com o nome vindo do banco, uma linha a mais em `ref_dominio` (pelo arquivo ou por `INSERT` do `dspd_ref`) leva "Acelerato - Atendente" ou um campo de texto para fora do MySQL sem mudar código.
- T1 (A2): o desenho decide "valor ou só preenchido" pelo `tipo` que vem na própria linha da fonte. A fonte é mantida por outro time (M7 do 056): se o `tipo` da justificativa vier como lista, ou mudar, o texto (até 80 caracteres) sai do MySQL e chega à memória do coletor, e o schema desenhado aceita "valor de até 80 caracteres ou booleano".
- T1: "Previsão de retorno" e "Número do ticket anterior" (coluna 45, fatia "depois de D-15") são tratados como booleano; se D-L9-1 decidir data, muda o tratamento (forma, como o L2-c) e volta a este modelo.
- T1 pela porta da referência: os domínios da P-DS-19 vêm de consulta de valores distintos na fonte; se um campo dito de lista for texto na prática, a consulta despeja texto livre no `acelerato-dominio.json` versionado.
- T3/T5 de SQL: nome novo de consulta que não entra em `CONSULTAS` escapa do teste estrutural (só `SELECT`, sem `;`); `Q4` já é o nome de `Q4_FORA_ORGANIZACOES` (`sql.ts:52`) (A7).
- T6: linha com chave extra ou valor longo falha com mensagem que traz o valor.

**Controles exigidos:**
1. Nomes da fatia F3 como **constante do código** (molde `NOMES_CAMPO_FATIA_F1`), cada um com o seu tratamento fixo no código: `lista` (valor por domínio) ou `preenchido` (só booleano). Lista inicial, da `acelerato-listas.md` §3: lista = "Motivo da Escalação", "Qual suporte foi acionado?", "Motivo de Encerramento", "Categoria de solução" (só se o dono a preferir), "Classifique o chamado no Tipo de Prioridade corretamente!", "Motivo de Pendência", "Avaliação de Problema", "Prioridade ajustada manualmente?" (valores sim e não por domínio); preenchido = "Se a prioridade foi ajustada, justifique", "Previsão de retorno" (até D-L9-1). "Número do ticket anterior" fica fora até D-15. `ref_dominio` guarda só os **valores** permitidos de cada campo, nunca os nomes (A1).
2. Tratamento decidido **pelo nome no `SELECT`**, não pelo `tipo` da fonte: para nome `preenchido`, a consulta devolve só `valor IS NOT NULL AND valor <> ''` e nunca a coluna `valor`; para nome `lista`, `valor` em `VARCHAR(80)`; se a fonte disser `tipo` texto para um nome `lista`, o valor vai nulo com contagem (o `tipo` pode ser lido para essa recusa, nunca para liberar). Nomes por placeholder, só igualdade exata (`f.nome IN (...)`), nunca `LIKE` nem a coluna `json` inteira (A2).
3. Schema zod `strict` por forma de linha: linha de nome `preenchido` só aceita booleano; linha de nome `lista` só string de até 80 ou nulo; chave extra ou nome fora da constante falha fechado (`dados-invalidos`, sem gravar parcial).
4. Valor de lista só se estiver no domínio do campo; fora → nulo com contagem `fora_dominio_<campo>` (nome do contador da constante); domínio vazio → campo nulo com contagem, nada gravado do valor.
5. Consulta nova com nome próprio (não `Q4`), incluída em `CONSULTAS` (`sql.ts:64`) e no `acelerato-mysql.sql`; hash novo do SQL em `ctl_coleta.parametros` e versão de critério; mudança do SQL sem versão registrada recusa a coleta (CA-8 do 056).
6. Nenhuma coluna de pessoa nova no analítico; `COLUNAS_PESSOA` não ganha entrada do Acelerato; `dspd_api` continua sem `stg_`.
7. O PR que preencher os domínios da P-DS-19 no `acelerato-dominio.json` passa por parecer de segurança: valores com cara de texto livre (frase, contagem 1, nome próprio) ficam fora até o dono confirmar (R-DECISAO).

**Testes de segurança que o lote traz:** ver CA-069-6 a CA-069-12; mais o teste estrutural (consulta nova começa por `SELECT`, sem `;`, sem `campos_personalizados_etapa` fora de `JSON_TABLE`, sem `LIKE`) e o de GRANT inalterado.

**Veredito: segue com condição** (A1 e A2 corrigidos no desenho ou no código antes do primeiro commit do lote; controles 1 a 7; os booleanos `preenchido` não dependem da P-DS-19, os campos de lista só gravam valor depois dela).

---

## Casos de abuso (para o qa-engineer)

| # | Entrada | Caminho | Resultado esperado |
|---|---|---|---|
| CA-069-1 | `businessmap-dominio.json` com field 42 e field 36 mapeados | arquivo → `bm:ref-sync` | carga recusada inteira, nada gravado, mensagem sem valor |
| CA-069-2 | arquivo com `type` de usuário, de texto, desconhecido e ausente; rótulo com `@` ou U+202E; coluna `owner_user_id`; chave extra | arquivo → `bm:ref-sync` | recusa; nada gravado |
| CA-069-3 | `INSERT` direto em `dspd_bm.ref_dominio` de `campo_customizado` 42 → `area_solicitante` | `ref_dominio` → coletor → staging | coletor ignora; staging sem o field 42; marcador ausente |
| CA-069-4 | card com `custom_fields` 36 e 42 com marcador e campo mapeado com texto marcador fora do domínio | `/cards` (fixture) → allow-list → `stg_card` | só código ou `desconhecido`; marcadores ausentes do staging, log e `ctl_coleta_falha` |
| CA-069-5 | campo de data com `2026-11-04 MARCADOR`, `2026-02-30`, string longa, número | `/cards` → allow-list → staging → `dim_card.data_acordada` | `desconhecido` e `null`; marcador ausente |
| CA-069-6 | `campos_personalizados_etapa` com "Acelerato - Atendente", "Acelerato - Solicitante", "Cargo", "Bairro", "Complemento do Problema", `X_LOGIN` e um nome desconhecido, todos com marcador | MySQL (fixture) → consulta → zod → staging | nenhum sai da consulta; marcadores ausentes do staging, log e `ctl_` |
| CA-069-7 | "Se a prioridade foi ajustada, justifique" com texto marcador e `tipo` = lista | MySQL → consulta → staging | só o booleano preenchido; texto não sai do `SELECT` |
| CA-069-8 | "Motivo de Encerramento" com `tipo` texto e valor marcador | MySQL → consulta → staging | valor nulo com contagem; marcador ausente |
| CA-069-9 | linha com chave extra, nome fora da constante, valor de 81 caracteres, booleano em campo de lista | consulta → zod | falha fechado `dados-invalidos`; erro sem valor |
| CA-069-10 | valor de lista fora do domínio e domínio vazio | zod → domínio → staging | nulo com `fora_dominio_<campo>`; valor não gravado |
| CA-069-11 | linha a mais em `dspd_ac.ref_dominio` `campo_personalizado` = "Acelerato - Atendente" | `ref_dominio` → consulta | o nome não entra no `IN`: a lista é constante do código |
| CA-069-12 | SQL alterado sem versão registrada; consulta nova fora de `CONSULTAS` | código e partida do coletor | coleta recusada; teste estrutural falha |
| CA-069-13 | `dspd_api` lendo `stg_card.custom_fields` e `stg_chamado.payload` | API → banco | permissão negada |

## Perguntas (nenhuma decisão tomada aqui)
- Ao software-architect: aceitar A1 e A2 no desenho do L9-b (nomes e tratamento por constante do código) antes do código.
- Ao dono, já abertas no desenho e que mudam este modelo: P-L2-1 (tipos reais dos 20 campos; define a lista positiva), D-L9-1 (data ou booleano), D-15, P-DS-19.

## Achados
- A1 (bloqueante) docs/analises/069-desenho.md:152 · Nomes da Q4 lidos de ref_dominio ampliam a allow-list por dado; o S8 usa constante (listas-fechadas.ts:31). Nomes da F3 e o tratamento de cada um devem ser constante do código. Dono: software-architect, node-backend.
- A2 (bloqueante) docs/analises/069-desenho.md:152 · Valor ou só preenchido decidido pelo tipo da própria fonte: tipo errado na origem tira texto do MySQL. Decidir pelo nome no SELECT; o tipo só pode recusar. Dono: software-architect, node-backend.
- A3 (bloqueante) docs/analises/069-desenho.md:107 · Recusa por tipo de usuário ou texto é lista de negação: tipo não previsto passa. Exigir lista positiva de tipos de seleção (e de data no L2-c); desconhecido ou ausente recusa. Dono: node-backend.
- A4 (bloqueante) server/src/modulos/businessmap/coleta.ts:44 · Com o mapa vindo do ref_dominio, manter a remoção de 36 e 42 depois da leitura e ignorar field_id não numérico e coluna fora do enum, com teste de INSERT direto. Dono: node-backend.
- A5 (recomendado) server/src/modulos/referencia/repositorio.ts:25 · Rótulos do ref_dominio do BusinessMap vão à API e ao navegador; o PR que preencher o arquivo (P-L2-1) e o de domínios da P-DS-19 passam por parecer de segurança. Dono: Jarvis.
- A6 (recomendado) docs/analises/069-desenho.md:157 · O 056-acelerato-mysql-ameacas.md citado não está na develop (só em 19275cb); para o L9-b vale este modelo, que repete o necessário. Trazer o arquivo ou corrigir a citação. Dono: software-architect.
- A7 (recomendado) server/src/modulos/acelerato/sql.ts:52 · O nome Q4 já é Q4_FORA_ORGANIZACOES; a consulta nova precisa de nome próprio e de entrar em CONSULTAS (sql.ts:64) para o teste estrutural cobri-la. Dono: node-backend.
- A8 (recomendado) docs/analises/069-desenho.md:117 · Validar a data por data civil com âncoras (dataCivilValida), forma com hora ou fuso escrita na revisão da ADR 0020 4d; fora da forma, desconhecido no staging e null na projeção. Dono: node-backend.

## Ferramentas e lacunas
`gitleaks`, `osv-scanner` e `semgrep` não estão no PATH desta estação; nada foi instalado (R-CUSTO). As varreduras ficam com o CI; o parecer de cada lote registra a lacuna de novo.

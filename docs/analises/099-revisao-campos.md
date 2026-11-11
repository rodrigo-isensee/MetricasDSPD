# 099: revisão dos campos e do plano de dado real com as respostas do dono de 14:57 (E2.2)

- **Propósito:** aplicar as seis respostas do dono ao roteiro `docs/analises/099-campos-para-configurar.md` (pedido 099, Histórico de 2026-11-11 14:57) ao plano `docs/analises/099-dado-real-operacional.md`: de onde vem agora o dado de O8, O12, O14, O16, O24 e S9, o que muda nos lotes, as consultas só de leitura que faltam, a proposta da ordem das etapas do Acelerato (para o dono aprovar), o mapeamento de tag para classe de serviço e as perguntas que sobram, uma por campo.
- **Respostas aplicadas (literais, 14:57):** geral "a maioria e duvida e nao campo novo"; (1) classe de serviço: "Para os times que usam tem uma Tag para isso no card."; (2) O12: "Usar o deadline do card" (Q-099-10 = B); (3) pendência: "Depende do caso, Solicitante, Suporte terceiro aguardam pessoas de fora do time, Aguardando equipe interna e quando temos dependencia de alguem do time que esta ocupado"; (4) "Tamanho nao e necessario, e a severidade ja temos a criticidade do card padrao que o Bm tras."; (5) "Existe no card de projeto pai, o campo da diretoria e da gerencia para area solicitante, o do sistema vou criar fica como pendencia"; (6) ordem das etapas: "Jarvis propõe, eu aprovo". Campos do Acelerato da parte 2: perguntar um a um, com opções, antes de pedir campo novo.
- **Base lida:** as três análises 099 (roteiro, plano, PROC); briefing §3.4; na `develop` (worktree demo, base `ae009a75`): `docs/architecture/fontes/businessmap-dominio.json`, `acelerato-dominio.json`, `acelerato-listas.md` (§3, §7, §13), `docs/integracao/businessmap-api-configuracao.md` (§4.2, §4.5, §4.6), `server/src/modulos/businessmap/{allow-list,normalizador,coleta,diagnostico}.ts`, `server/migrations/0005`, `0006`, `0008`, `packages/metricas/src/businessmap/{o8,o12,o16}.ts`, `packages/contratos/src/comum.ts`. **Não li a base real nem `.env` e não rodei nada.**
- **Estado:** proposta. Nenhuma linha de código muda por esta revisão. Ela substitui, no que conflitar, o §1 do roteiro e as linhas OP-1, OP-4, OP-7, OP-11, OP-12 e OP-17 do plano.
- **Afrouxa?** Não. Nenhum texto de `docs/regras/`, item de `tests/config.json` ou controle sai. Duas definições de métrica mudam por decisão do dono (O8 sem tamanho declarado; severidade do O16 = criticidade nativa do card): cada uma entra como versão de critério (T2.6) e é marcada no gráfico.

## 0. Resumo para o dono

1. **Nenhum campo novo no BusinessMap para estes seis cartões**, salvo o Sistema afetado, que o próprio dono vai criar (pendência dele). O roteiro do §1 do `099-campos-para-configurar.md` encolhe de 8 campos para 1 (Sistema afetado); classe de serviço, data acordada, severidade, tamanho declarado e área solicitante saem do roteiro.
2. **O que já está na base e só falta projetar:** o prazo nativo (`deadline`) e a criticidade nativa (`priority`) já chegam ao staging em toda versão de card coletada (`allow-list.ts:17`). O12 e O16 andam só com código, sem esperar ninguém.
3. **O que a coleta ainda não traz:** as **tags** do card (o coletor não pede `tag_ids`, `coleta.ts:38`) e os valores dos campos **Diretoria** e **Gerência** do projeto (o coletor pede `custom_fields`, mas descarta todo campo fora do mapa, e o mapa está vazio: `businessmap-dominio.json`, `"campos": []`). Os dois pedem um lote de fronteira com o security-engineer e uma releitura dos cards já coletados.
4. **O8 vira cartão de dado real já:** sem o tamanho declarado, o O8 é só o tempo em execução, que é real. Entra num lote de portão, como O20, O21 e O25.
5. **S9 não espera mais o Acelerato ser reconfigurado:** o motivo da pendência vem da própria etapa de espera (decisão 3). Falta o dono dizer o que fazer com as outras seis etapas de espera que existem no fluxo real (Q-099-21).
6. **Perguntas novas:** Q-099-12 a Q-099-21 (§8), cada uma com opções e recomendação, e a aprovação AP-099-1 (ordem das etapas, §4). Uma correção que não depende de pergunta: o O12 hoje diria "meta cumprida" quando ninguém classificou a responsabilidade (§7.1).

## 1. Por cartão: de onde vem o dado agora e o que muda

| Cartão | Antes (plano 099) | Agora (resposta do dono) | De onde vem o dado | O que muda no plano | Lotes |
|---|---|---|---|---|---|
| **O8** Tamanho das demandas | Campo `tamanho_declarado` (WS1) para a comparação P, M, G; tempo em execução já real | Resposta 4: "Tamanho nao e necessario" | Tempo em execução pelas transições (`vw_transicao_canonica`, o mesmo ciclo do O3). Nada de tamanho | Sai a parte "por tamanho declarado". `calcularO8` hoje agrupa `porTamanho` com P, M, G e "Sem tamanho" (`o8.ts:11`, `:58`): com a parte fora, a função deixa de devolver `porTamanho` (ou devolve `null`), o contrato e o cartão perdem a divisão, e a mudança entra como versão de critério `afeta = ['O8']`. O O8 passa do grupo C para o grupo A. O campo nativo `size` do BusinessMap (já coletado) **não** entra: o dono disse que o tamanho não é necessário | **A4** (novo; substitui C5) |
| **O12** Acordos e vencidos | Campo `data_acordada` (WS1, Q-099-10 = A recomendada) e `responsabilidade_atraso` (WS1) | Resposta 2: "Usar o deadline do card" (Q-099-10 = B). Responsabilidade do atraso sem definição | `stg_card.payload->>'deadline'` (já na allow-list, `CAMPOS_CARD`), projetado em `dim_card.data_acordada` (coluna `date` que já existe, migração 0006; `mapa.ts` já trata como fim do expediente do dia civil) | C2 deixa de abrir caminho de campo customizado de data: só projeta o `deadline` nativo no normalizador. Duas regras ficam com o dono: qual valor do prazo vale quando ele muda (Q-099-13) e a responsabilidade do atraso (Q-099-14, §7). A biblioteca precisa de uma correção antes do portão (§7.1). Mudança de fonte da data acordada = versão de critério `afeta = ['O12']` | **C2** (refeito), **C3** |
| **O14** Origem da demanda | Campos `area_solicitante` e `sistema` nas stories (WS1), listas escritas pela WS1 | Resposta 5: área solicitante = campos Diretoria e Gerência do **card de projeto pai**; Sistema afetado: o dono cria, pendente | Campos customizados do card de projeto (quadro 35, nível projeto), no staging só depois de entrarem no mapa (`businessmap-dominio.json`); a story herda o valor do projeto ancestral pela cadeia `card_pai` (story → frente → projeto) | C1 passa a carregar os dois campos do projeto no mapa (com os domínios de valor), e a projeção ganha a herança do projeto ancestral para a story. Story sem projeto ancestral (sustentação e demanda não planejada, briefing §2: "sem pai") fica "sem área", nunca inferida. `porSistema` sai "sem dado real" até o campo do dono existir (Q-099-4 A). Qual dos dois campos é a "área" é a Q-099-16 | **C1b** (novo), **C7** |
| **O16** Estoque e idade de bugs | Campo `severidade` (WS1); entrada × correção e idade já reais | Resposta 4: "a severidade ja temos a criticidade do card padrao que o Bm tras" | `stg_card.payload->>'priority'` (já na allow-list), projetado em `dim_card.severidade` por um de-para versionado (Crítica, Alta, Média, Baixa, `SEVERIDADES` de `comum.ts:162`) | C8 deixa de esperar a WS1: um lote de projeção da criticidade (de-para num arquivo versionado) e o portão. O de-para e o tratamento do valor padrão do BusinessMap são a Q-099-15. A densidade (bug com origem) continua na Q-099-6 (O18) e sai "sem dado real" na parte até lá | **C8a** (novo), **C8** |
| **O24** Ordem de chegada | Campo `classe_servico` (WS1); Q-099-9 recomendada A (esperar o campo) | Resposta 1: "Para os times que usam tem uma Tag para isso no card." | Tags do card (`tag_ids` da API, `expand=tag_ids`, `businessmap-api-configuracao.md` §4.2), **ainda não coletadas**; mapa versionado tag → classe aprovado pelo dono (§5) | Lote de fronteira novo: a coleta pede `tag_ids` e a allow-list só guarda os ids de tag que estão no mapa (como os campos customizados: tag fora do mapa nunca chega ao staging). A projeção grava `dim_card.classe_servico` pela tag. Card com duas tags de classe diferentes: nulo com contagem, sem escolher. Q-099-9 muda: deixa de ser "esperar o campo" e vira a Q-099-12 (o que é card sem tag nos times que usam tag). Destrava também a nota "sem classe" do O6 e a divisão por classe do Tático (T1, T2, T6) | **C1a** (novo), **C6** |
| **S9** Tempo em pendência | Q-099-8 revista: Solicitante e Terceiros como pendência; "Aguardando Equipe Interna" dependia do uso; ou esperar a etapa `Pendente` e o campo "Motivo de Pendência" (WS4) | Resposta 3: Solicitante e Suporte Terceiros são pendência (pessoas de fora do time); "Aguardando Equipe Interna" é espera por alguém do próprio time, **não** é pendência | Etapas reais de espera em `fato_etapa_chamado` (intervalos por etapa, D-7); o motivo é a própria etapa por um de-para versionado | D5 deixa de depender de D0 e D1 (campo e domínio da WS4). De-para confirmado: "Aguardando Solicitante" → aguardando solicitante; "Aguardando Suporte Terceiros" → aguardando fornecedor; "Aguardando Equipe Interna" → fora da S9 e fora do desconto da S1 (o SLA corre, como no PROC). O fluxo real tem mais seis etapas de espera que a resposta não cobriu: Q-099-21. Versão de critério `afeta = ['S1', 'S9']`. Previsão de retorno sem dado real (D-14) | **D5** (refeito) |

## 2. Efeito nos lotes do plano 099 (§3 do plano)

| Lote | Antes | Agora | Depende de | Gatilho de segurança |
|---|---|---|---|---|
| C0 (WS1, pessoas) | 9 campos da T1.3 | **Só o Sistema afetado**, que o dono cria (resposta 5). Os outros saem do roteiro | dono | não é código |
| C1 | Diagnóstico P-L2-1 e mapa de todos os campos | **C1b:** mapa dos campos Diretoria e Gerência do card de projeto em `businessmap-dominio.json` (field_id, tipo de seleção única, coluna, valores) e a herança do projeto ancestral para a story na projeção. Se a Q-099-16 pedir as duas colunas, migração que acrescenta `diretoria_solicitante` (coluna de lista, enum `COLUNAS_LISTA`). Releitura dos cards de projeto já coletados (§9, R1) | Consulta B3 (§3), Q-099-16 | **sim:** fronteira (campo novo saindo da fonte; o tipo pode ser texto ou pessoa, ver B3) e banco, se houver migração. Modelo de ameaças do 069 confirmado pelo security-engineer |
| C1a | (não existia) | **Tags para classe:** `tag_ids` no `expand` da coleta; allow-list que reduz a lista de tags aos ids do mapa (como `reduzirCamposCustomizados`); seção nova `classe_servico_tag` em `businessmap-dominio.json` (tag_id → classe, das quatro de `CLASSES_SERVICO`); projeção em `dim_card.classe_servico`; contagens `classe_tag_empate` e `classe_sem_tag`. Revisão da ADR 0020 (campo novo na fronteira: `allow-list.ts:7` exige). Releitura (§9, R1) | Consulta B1, §5 aprovado, Q-099-12 | **sim:** fronteira e ADR 0020. Rótulo de tag é texto livre de quem cria a tag: só o id entra no staging, o rótulo nunca |
| C2 | Caminho de campo customizado de data | **Só projeção do `deadline` nativo** em `dim_card.data_acordada` (data civil no fuso do calendário), pela regra da Q-099-13. A allow-list não muda (`deadline` já está nela) | Q-099-13 | não (o campo já entra; nenhuma coluna nova) |
| C3 | O12 no mapa real | Igual, com a correção da §7.1 na biblioteca e a parte "por responsabilidade" pela Q-099-14 | C2, Q-099-14 | não |
| C5 | O8 no mapa real depois do campo | **Vira A4:** O8 no mapa real sem a parte por tamanho (contrato, cartão e versão de critério `afeta = ['O8']`); UX revê o cartão | Q-RO-1 | não |
| C6 | O24 no mapa real depois do campo | Igual, depois do C1a e da consulta A1 (§3) mostrar a classe preenchida | C1a | não |
| C7 | O14 no mapa real | Igual, com `porSistema` "sem dado real" até o campo do dono | C1b | não |
| C8a | (não existia) | **Criticidade para severidade:** de-para versionado (arquivo em `docs/architecture/fontes/`, carregado pelo `bm:ref-sync`) e projeção de `priority` em `dim_card.severidade`, pela Q-099-15 | Consulta B2, Q-099-15 | não (o campo já entra; a coluna já existe) |
| C8 | O16 no mapa real depois do campo | Igual, depois do C8a; densidade "sem dado real" até a Q-099-6 | C8a | não |
| D5 | S9 pela Q-099-8 e pelo campo da WS4 | **S9 pelas etapas de espera** (de-para da resposta 3 e da Q-099-21) como versão de critério `afeta = ['S1', 'S9']`; não espera D0 nem D1 | Q-099-21 | não |
| D0 e D1 | Domínios `cpe_*` e `etapa_fluxo` pela WS4 | `etapa_fluxo` pela proposta do §4 (AP-099-1); os domínios `cpe_*` pelas respostas Q-099-17 a Q-099-20. Campo novo no Acelerato só se a resposta for "criar" | AP-099-1, Q-099-17 a Q-099-20 | D1 como antes (vocabulário de fonte externa) |

**Ordem nova:** A4 entra com A1 a A3 já. C2 e C8a começam assim que as Q-099-13 e Q-099-15 forem respondidas (não dependem de pessoa nem de fronteira). C1a e C1b vêm depois das consultas B1 e B3 e do modelo de ameaças. D5 sai depois da Q-099-21. O `origem.ts` continua serializado pelo tech-lead (R3 do plano).

## 3. Consultas só de leitura para o dono

Regras de todas: só nomes de domínio (tag, campo, etapa, workflow) e contagens; nenhuma coluna de pessoa, título, descrição nem linha de card ou chamado. **Antes de o dono rodar, o node-backend confere as marcadas com (\*)**: nome de coluna do staging ou forma da resposta da API, que não confirmei no DDL nem na resposta real. Rótulo de tag e valor de Diretoria e Gerência são texto escrito por pessoas: **se algum trouxer nome de pessoa, o dono o apaga da saída antes de colar** e avisa (fica fora do mapa).

### 3.1 Tags dos cards dos quadros das equipes (O24, §5)

As tags não estão na base. Há três caminhos, do mais simples ao mais completo; qualquer um basta para a proposta do §5:

- **B1-a (sem comando):** no BusinessMap, a tela de administração de tags mostra o nome de cada tag. O dono (ou quem administra o quadro) escreve a lista das tags que significam classe de serviço, com o nome exato e os quadros das equipes que as usam.
- **B1-b (API, terminal do dono) (\*):** a chave é digitada sem eco e não fica no histórico do shell; a saída é só id e rótulo de tag e contagens. O endereço `/tags` é da documentação da API v2 e não foi chamado pelo time [INF]; a forma da resposta (`.data`, `.data.data`) é conferida pelo node-backend antes.

```bash
read -rs CHAVE_BM; echo   # cola a apikey e Enter; nada aparece na tela
URL_BM='https://<conta>.kanbanize.com/api/v2'   # o mesmo endereço base que o coletor usa

# B1-b.1: tags existentes (id e rótulo)
curl -s -H "apikey: $CHAVE_BM" "$URL_BM/tags" | jq -r '.data[] | [.tag_id, .label] | @tsv'

# B1-b.2: por quadro de equipe, quantos cards ativos têm cada tag e quantos têm duas ou mais tags
# (troque <quadro>; repita com state=archived&archived_from=<data de 84 dias atrás>T00:00:00Z para os entregues recentes)
curl -s -H "apikey: $CHAVE_BM" "$URL_BM/cards?board_ids=<quadro>&state=active&fields=card_id&expand=tag_ids&per_page=1000" \
  | jq -r '[.data.data[] | (.tag_ids // [])] as $c
           | ($c | map(.[]) | group_by(.) | map("tag \(.[0])\t\(length) cards") | .[]),
             "cards sem tag\t\($c | map(select(length == 0)) | length)",
             "cards com 2+ tags\t\($c | map(select(length > 1)) | length)"'
unset CHAVE_BM
```

- **B1-c (comando do time, opcional):** se o dono preferir não usar `curl`, o node-backend acrescenta `/tags` à lista fechada de caminhos de `bm:diagnostico` (`diagnostico.ts:7`, campos `tag_id` e `label`) e um contador de cards por tag por quadro; só GET, só id, rótulo e número. Isso é código (um lote pequeno, com review e QA).

### 3.2 Criticidade nativa do card (O16, Q-099-15) — PostgreSQL

```sql
-- B2-a (*): valores da criticidade (priority) na última versão de cada story, por tipo de card
-- (bugs = 'Bug interno' e 'Defeito em produção'); conta cards, nunca mostra card
SELECT d.tipo, s.payload->>'priority' AS criticidade, COUNT(*) AS cards
  FROM (SELECT DISTINCT ON (id_origem) id_origem, payload
          FROM dspd_bm.stg_card ORDER BY id_origem, coletado_em DESC) s
  JOIN dspd_bm.dim_card d ON d.card_id = s.id_origem
 WHERE d.granularidade = 'story' AND d.excluido_em IS NULL
 GROUP BY d.tipo, 2
 ORDER BY d.tipo, 2;

-- B2-b (*): a criticidade é mexida pelas pessoas? cards com mais de um valor ao longo das versões
SELECT COUNT(*) FILTER (WHERE n > 1) AS cards_com_mudanca, COUNT(*) AS cards
  FROM (SELECT id_origem, COUNT(DISTINCT payload->>'priority') AS n
          FROM dspd_bm.stg_card GROUP BY id_origem) x;
```

Leitura: se quase todo bug tiver o mesmo valor e quase nenhum card tiver mudança, o valor é o padrão da ferramenta, não uma criticidade escolhida (Q-099-15, opção sobre o valor padrão).

### 3.3 Prazo nativo (O12, Q-099-13) — PostgreSQL

```sql
-- B4-a (*): stories com prazo, e quantas tiveram o prazo mudado entre versões coletadas
SELECT COUNT(*) AS stories,
       COUNT(*) FILTER (WHERE com_prazo) AS com_prazo,
       COUNT(*) FILTER (WHERE prazos > 1) AS prazo_mudou
  FROM (SELECT d.card_id,
               bool_or(s.payload->>'deadline' IS NOT NULL) AS com_prazo,
               COUNT(DISTINCT s.payload->>'deadline') AS prazos
          FROM dspd_bm.dim_card d JOIN dspd_bm.stg_card s ON s.id_origem = d.card_id
         WHERE d.granularidade = 'story' AND d.excluido_em IS NULL
         GROUP BY d.card_id) x;
```

### 3.4 Diretoria e Gerência do card de projeto (O14, Q-099-16)

```bash
# B3-a: id, nome e tipo de cada campo customizado (comando que já existe, só leitura; não lê card)
pnpm run bm:diagnostico
```

Na seção "Campos customizados (id, nome e tipo)", o dono anota o `field_id` e o `type` de Diretoria e de Gerência. **Se o tipo for de pessoa (`contributor` ou usuário), o campo não entra** (ADR 0020 4d, como o 42) e a Q-099-16 volta ao dono. Se for texto livre, entra só com domínio fechado (como a categoria do Acelerato).

```bash
# B3-b (*): valores permitidos e preenchimento nos cards de projeto (quadro 35, H-1), na mesma sessão da B1-b
curl -s -H "apikey: $CHAVE_BM" "$URL_BM/customFields/<field_id>" | jq -r '.data.allowed_values[]? | [.value_id, .value] | @tsv'
curl -s -H "apikey: $CHAVE_BM" "$URL_BM/cards?board_ids=35&state=active&fields=card_id&expand=custom_fields&per_page=1000" \
  | jq -r --arg f '<field_id>' '[.data.data[] | ((.custom_fields // []) | map(select((.field_id|tostring) == $f)) | .[0].value)]
           | "projetos\t\(length)", "com valor\t\(map(select(. != null and . != "")) | length)",
             (map(select(. != null and . != "")) | group_by(.) | map("\(.[0])\t\(length)") | .[])'
```

```sql
-- B3-c (*): quantas stories têm um projeto como ancestral pela cadeia card_pai (story -> frente -> projeto)
WITH RECURSIVE sobe(story, ancestral, nivel) AS (
  SELECT card_id, card_pai, 1 FROM dspd_bm.dim_card WHERE granularidade = 'story' AND excluido_em IS NULL
  UNION ALL
  SELECT s.story, d.card_pai, s.nivel + 1
    FROM sobe s JOIN dspd_bm.dim_card d ON d.card_id = s.ancestral
   WHERE s.ancestral IS NOT NULL AND s.nivel < 4)
SELECT (SELECT COUNT(*) FROM dspd_bm.dim_card WHERE granularidade = 'story' AND excluido_em IS NULL) AS stories,
       COUNT(DISTINCT s.story) AS com_projeto_ancestral,
       (SELECT COUNT(*) FROM dspd_bm.dim_card WHERE granularidade = 'projeto' AND excluido_em IS NULL) AS projetos
  FROM sobe s JOIN dspd_bm.dim_card p ON p.card_id = s.ancestral
 WHERE p.granularidade = 'projeto';
```

A B3-c diz quanto do O14 pode sair com área: as stories sem projeto ancestral ficam "sem área".

### 3.5 Desenho do workflow do Acelerato (AP-099-1) — MySQL, conta só leitura (ADR 0023)

Rodar cada uma em separado (o `UNION` dá o erro 1271, `acelerato-listas.md` §12).

```sql
-- B5-a: etapas por workflow, com a chave e a posição média em que a ferramenta lista a etapa
-- (pos = ordem no array estatisticas.workflow.etapas; se for a ordem do desenho, ela substitui a proposta do §4)
SELECT e.descricao_workflow, e.etapa_key, e.descricao AS etapa, COUNT(*) AS n,
       MIN(e.pos) AS pos_min, ROUND(AVG(e.pos), 1) AS pos_media, MAX(e.pos) AS pos_max
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (
         pos FOR ORDINALITY,
         etapa_key BIGINT PATH '$.etapaKey' NULL ON ERROR,
         descricao VARCHAR(255) PATH '$.descricao',
         descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow')) e
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY e.descricao_workflow, e.etapa_key, e.descricao
 ORDER BY e.descricao_workflow, pos_media;

-- B5-b: em que etapas (chave) cada campo de etapa aparece e quantas vezes vem preenchido (o valor nunca sai)
SELECT f.nome, f.kanban_status_key, COUNT(*) AS ocorrencias,
       SUM(f.valor IS NOT NULL AND f.valor <> '') AS preenchidos
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome VARCHAR(255) PATH '$.nome',
         kanban_status_key BIGINT PATH '$.kanbanStatusKey' NULL ON ERROR,
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY f.nome, f.kanban_status_key
 ORDER BY f.nome, f.kanban_status_key;
```

Com a B5-a, a chave de cada etapa (que a lista `etapa_fluxo` exige como `codigo`, `acelerato-listas.md` §13) sai junto com o nome; com a B5-b, só os pares de etapas em que um mesmo campo aparece decidem alguma coisa. O comando `pnpm --filter @metricas-dspd/server ac:apoio-l9c` (já existe) diz se `kanbanStatusKey` é a mesma chave de `etapaKey` (consulta A) e quantos chamados a ordem decide por campo (consulta B).

### 3.6 Equivalentes já existentes para os campos da parte 2 (§6)

```sql
-- B6-a (MySQL): os campos equivalentes existem e com que tipo? (nomes e contagens; o valor nunca sai)
SELECT f.nome, f.tipo, COUNT(*) AS ocorrencias, SUM(f.valor IS NOT NULL AND f.valor <> '') AS preenchidos
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome VARCHAR(255) PATH '$.nome', tipo VARCHAR(60) PATH '$.tipo',
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
   AND f.nome IN ('Motivo de Encerramento', 'Categoria de solução', 'Motivo da Escalação', 'Qual suporte foi acionado?',
                  'Prioridade ajustada manualmente?', 'Classifique o chamado no Tipo de Prioridade corretamente!',
                  'Avaliação de Problema', 'Motivo de Pendência')
 GROUP BY f.nome, f.tipo;
```

```sql
-- B6-b (*) (PostgreSQL): etapas reais que servem de equivalente (espera, reclassificação, causa raiz, escalação),
-- em intervalos e chamados, na janela de 84 dias
SELECT e.etapa, COUNT(*) AS intervalos, COUNT(DISTINCT e.chamado_id) AS chamados
  FROM dspd_ac.fato_etapa_chamado e JOIN dspd_ac.dim_chamado c ON c.chamado_id = e.chamado_id
 WHERE c.fora_do_recorte = false AND c.aberto_em >= now() - interval '84 days'
   AND (e.etapa ILIKE 'Aguardando%' OR e.etapa IN ('Pendente', 'Data Acordada', 'Causa Raiz', 'Revisão',
        'Em Avaliação de Escalação', 'Em Atendimento N2', 'Em Atendimento N3'))
 GROUP BY e.etapa ORDER BY 2 DESC;

-- B6-c (*) (PostgreSQL): chamados cuja prioridade mudou entre versões coletadas (ajuste observado)
SELECT COUNT(*) FILTER (WHERE n > 1) AS chamados_com_mudanca, COUNT(*) AS chamados
  FROM (SELECT id_origem, COUNT(DISTINCT payload->>'prioridade') AS n
          FROM dspd_ac.stg_chamado GROUP BY id_origem) x;
```

## 4. Proposta da ordem das etapas do Acelerato (AP-099-1, para o dono aprovar)

**Fonte da proposta:** o desenho de 11 etapas do briefing §3.4 (que traduz o PROC 30.000.010), os estados do PROC (Aberto, Em diagnóstico, Em atendimento, Aguardando validação, Encerrado) e os 44 nomes reais de etapa em `acelerato-dominio.json`. Nada da base real.

**Como a ordem é usada (`acelerato-listas.md` §13):** só decide quando o mesmo campo de etapa tem valores diferentes em duas etapas do mesmo chamado; vale o da etapa que vem depois. Por isso a ordem precisa ser total (sem empate entre nomes) e só importa entre etapas que carregam o mesmo campo (B5-b mostra quais). O arquivo guarda a **chave** de cada etapa (`kanbanStatusKey`), não o nome: o mesmo nome em workflows diferentes tem chaves diferentes (79 pares para 44 nomes) e recebe a mesma posição, o que não gera empate porque um chamado percorre um workflow só.

**Proposta (posição 1 = início do atendimento):**

| Fase (briefing §3.4 / PROC) | Posições | Etapas reais, na ordem |
|---|---|---|
| 1. Registro (Novo; PROC etapa 1) | 1 a 6 | Novo Atendimento · Novo · Nova Demanda · Novo Mudança · Backlog · Retorno |
| 2. Triagem e classificação (Em triagem; PROC 2 e 3) | 7 a 11 | Em triagem · Em Classificação · Em Análise · Aguardando Validação de Prioridade · Aguardando Atribuição |
| 3. Diagnóstico (Em diagnóstico; PROC 7) | 12 a 14 | Em Diagnóstico · Em Investigação · Em Avaliação de Escalação |
| 4. Atendimento por nível (PROC 8 e 10) | 15 a 18 | Em Atendimento N1 · Em Andamento · Em Atendimento N2 · Em Atendimento N3 |
| 5. Solução, desenvolvimento e mudança | 19 a 30 | Em Definição de Solução · Em Planejamento · Planejamento · Pronto para Desenvolver · Encaminhar para Desenvolvimento · Encaminhar para Projeto · Aguardando Aprovação · Em Aprovação · Solicitar RDM · Aguardando Mudança · Aguardando Janela de Mudança (Deploy Produção) · Testes Integrados (Usuários) |
| 6. Esperas (Pendente; PROC 4.1.1 e 4.1.3) | 31 a 36 | Aguardando Solicitante · Aguardando Suporte Terceiros · Aguardando Fornecedor · Aguardando Equipe Interna · Data Acordada · Pendente |
| 7. Validação (Aguardando validação; PROC 12) | 37 a 39 | Aguardando Validação · Em Validação · Em Verificação de Efetividade |
| 8. Encerramento (Encerrado; PROC 15) | 40 a 42 | Encerramento · Concluído · Encerrado |
| 9. Depois do encerramento (Causa Raiz; PROC 13 e 14) | 43 a 44 | Causa Raiz · Revisão |

(Contagem por fase: 6, 5, 3, 4, 12, 6, 3, 3, 2 = os 44 nomes de `acelerato-dominio.json`, cada um com uma posição só.)

**Pontos em que a proposta escolhe e o dono confere (marcados para a aprovação):**
1. **Esperas depois do atendimento (fase 6 depois das 4 e 5).** Uma espera pode acontecer em qualquer ponto do atendimento; pôr a fase 6 depois significa que, se o mesmo campo for preenchido numa espera e numa etapa de atendimento, vale o da espera. Os campos de espera (Motivo de Pendência, Previsão de retorno) só aparecem nas esperas pelo briefing, então o efeito prático é pequeno; a B5-b confirma.
2. **Encerramento antes de Concluído e Encerrado (fase 8).** O dash antigo lista "Concluído, Encerramento, Causa Raiz, Revisão, Encerrado" sem dizer a ordem do desenho (`acelerato-listas.md` §7). A proposta põe a etapa em que se encerra (onde o PROC manda preencher Motivo de Encerramento e Avaliação de Problema) antes dos estados finais. **É o par que mais decide** (Motivo de Encerramento e Avaliação de Problema).
3. **Causa Raiz e Revisão depois do encerramento (fase 9).** Pelo PROC, a avaliação de problema vem depois da restauração; se a etapa "Causa Raiz" for, na verdade, anterior ao encerramento no desenho, ela troca de lugar com a fase 8.
4. **Em Avaliação de Escalação depois de Em Diagnóstico (fase 3).** O briefing pede Motivo da Escalação "na saída de Em diagnóstico"; se o campo também estiver na avaliação de escalação, vale o desta.

**Se a B5-a mostrar que a ferramenta lista as etapas na ordem do desenho** (posição média estável por workflow), a ordem da ferramenta substitui esta proposta onde as duas divergirem, e o dono aprova a lista resultante. **Reabre se:** a WS4 puser em produção o desenho de 11 etapas do briefing (a lista é refeita por desenho de fluxo, T4.1).

**O que o dono aprova:** a tabela acima (ou a versão ajustada pela B5-a), em uma linha ("aprovo a ordem do §4" ou as trocas). O node-backend monta o arquivo com as chaves da B5-a (lote D1); o dono roda `pnpm coleta ac --reconhecer-mudanca` depois do `ac:ref-sync`.

## 5. Mapeamento tag → classe de serviço (O24, §1 resposta 1)

**Pela documentação não dá:** nenhuma documentação do projeto nem a base tem as tags (o coletor nunca as pediu). A proposta abaixo é a regra; os pares tag → classe saem da B1 e o dono aprova cada um.

**O que a consulta precisa trazer (B1):** para cada quadro de equipe, o id e o rótulo de cada tag usada, quantos cards ativos e entregues nas últimas 12 semanas a têm, quantos cards não têm tag e quantos têm duas ou mais.

**Regra proposta para montar o mapa:**
1. Só entram tags cujo rótulo diga uma das quatro classes de `CLASSES_SERVICO` (Urgente, Prazo fixo, Padrão, Intangível). Equivalências de nome que o dono confere uma a uma, sem aceitação automática: "Urgente", "Expedite", "Emergencial" → Urgente; "Prazo fixo", "Data fixa", "Fixed date", "Legal", "Regulatório" → Prazo fixo; "Padrão", "Standard" → Padrão; "Intangível", "Intangible", "Débito técnico", "Melhoria contínua" → Intangível. Qualquer outra tag fica fora do mapa e nunca chega ao staging.
2. Várias tags podem levar à mesma classe (como o `motivo_bloqueio` do 075).
3. Card com duas tags de classes diferentes: classe nula, contagem `classe_tag_empate`, sem escolher.
4. A classe vale pela versão do card no instante do evento medido (a mesma regra U-2 da granularidade e da equipe); trocar a tag depois muda a classe só dali em diante, porque o staging guarda as versões.
5. Arquivo `docs/architecture/fontes/businessmap-dominio.json`, seção nova `classe_servico_tag` (`codigo` = tag_id, só dígitos; `rotulo` = classe, uma das quatro). Mudar o mapa é versão de critério `afeta = ['O6', 'O24', 'T1', 'T2', 'T6']`.

**Card sem tag:** é a Q-099-12.

## 6. Campos do Acelerato da parte 2: equivalentes e uma pergunta por campo

Lista conhecida de equivalentes: os nomes de campo de `acelerato-listas.md` §3 e as etapas reais de `acelerato-dominio.json`. Nenhum campo novo é pedido sem a resposta do dono.

| Campo do briefing §3.4 | Equivalente já existente | Situação conhecida |
|---|---|---|
| Motivo de Encerramento (S6, S7, S11) | Campo "Categoria de solução" (§3, alternativa do S6); etapas finais Encerramento, Concluído, Encerrado | Existência e tipo dos dois campos: B6-a. Os 5 valores do briefing não estão em nenhuma lista conhecida |
| Motivo da Escalação (S5) | Campo "Qual suporte foi acionado?" (§3, apoio do S5); etapas Em Atendimento N2, N3, Em Avaliação de Escalação (nível, S4) | O equivalente diz **para onde** escalou, não **por quê** |
| Prioridade ajustada manualmente? (S7, S3) | Campo "Classifique o chamado no Tipo de Prioridade corretamente!" (§3); etapa "Aguardando Validação de Prioridade"; a mudança do valor de `prioridade` entre versões do chamado no staging (append-only) | Hoje nenhum gatilho do Acelerato muda a prioridade (briefing §3.4, "O que não é nativo"): toda mudança observada é de pessoa. B6-c conta |
| Avaliação de Problema (S11) | Etapa "Causa Raiz" no fluxo real | Não se sabe se a etapa é a avaliação de problema do PROC (etapas 13 e 14) |
| Motivo de Pendência (S9) | As próprias etapas de espera (resposta 3) | Resolvido em parte; falta o de-para das outras esperas (Q-099-21) |

As perguntas Q-099-17 a Q-099-21 estão no §8.

## 7. Responsabilidade do atraso no O12 com o prazo nativo (Q-099-14)

### 7.1 Correção que não depende de pergunta

`calcularO12` devolve `vencidosCausaInterna = tot.Interno` e `statusMeta: tot.Interno === 0 ? 'dentro' : 'fora'` (`o12.ts:54-55`). Sem a responsabilidade preenchida, todo vencido cai em `naoClassificado`, `Interno` fica 0 e o cartão diria **"meta cumprida"** com vencidos que ninguém classificou: é o "0 falso" da classe C2 do critério de parada do plano. Antes do portão C3, a biblioteca passa a devolver `statusMeta` nulo (e `vencidosCausaInterna` nulo) quando houver vencido não classificado, com versão de critério `afeta = ['O12']`. Lote C3, node-backend, teste da biblioteca que espera nulo nesse caso.

### 7.2 Opções

- **(A) Publicar acordos e vencidos (dado real) e deixar a divisão por responsabilidade "sem dado real"** (Q-099-4 A), com `statusMeta` nulo pela §7.1. Nada a configurar.
- **(B) Derivar a responsabilidade dos bloqueios do card no período do atraso** (`fato_bloqueio`, pedido 075), por um de-para que o dono aprova: "Aguardando fornecedor" e "Aguardando licença ou contrato" → Terceiro; "Aguardando validação do negócio" e "Falta de informação no chamado" → Solicitante; os outros motivos e o card vencido sem bloqueio → **não classificado** (nunca Interno por omissão). Depende do mapa `motivo_bloqueio` (P-075-3, nasce vazio) e tem a precisão da frequência da coleta (bloqueio por instantâneo, `businessmap-api-configuracao.md` §4.4). "Interno" só existiria se o dono disser qual motivo é interno.
- **(C) Tag no card** ("Atraso: solicitante", "Atraso: terceiro", "Atraso: interno"), no mesmo mecanismo do C1a. Sem campo novo, mas depende de alguém pôr a tag no vencimento.
- **(D) Campo novo `responsabilidade_atraso`** (lista Interno, Solicitante, Terceiro) na WS1, como o roteiro original.

**Recomendação: A agora, e B quando o mapa de motivos de bloqueio do 075 estiver carregado, se o dono aprovar o de-para.** A põe o cartão em dado real sem número inventado; B usa um dado que já existe e não pede trabalho novo a ninguém; C e D contrariam o "a maioria e duvida e nao campo novo" e dependem de disciplina de preenchimento no vencimento. **Reabre se:** depois de B, mais da metade dos vencidos ficar "não classificado" por 12 semanas (o dado não basta e C ou D voltam à mesa).

## 8. Perguntas ao dono (novas; cada uma com recomendação)

- **AP-099-1. Ordem das etapas do Acelerato.** Aprovar a tabela do §4 (ou a versão ajustada pela B5-a). Recomendação: aprovar, com atenção aos quatro pontos marcados.
- **Q-099-12. O24: card sem tag de classe, nos times que usam tag.** (A) Fica "sem classe" e fora do O24 (o O24 só olha a classe Padrão). (B) Nos quadros que usam tag de classe (lista que o dono aprova), card sem tag é Padrão; nos outros quadros, "sem classe". **Recomendação: decidir com a B1 na mão.** Se não existir tag para Padrão (só para as exceções, como Urgente e Prazo fixo), B, porque é o uso comum de classe por exceção e, com A, o O24 ficaria sem base nesses times; se existir tag de Padrão, A. Nos times que não usam tag, o O24 fica "sem classe" em qualquer opção (nunca Padrão por omissão).
- **Q-099-13. O12: qual prazo vale quando o `deadline` muda?** (A) O primeiro prazo visto na coleta a partir do compromisso (entrada na seção 2): é o mais perto do "acordo" do briefing; mudar o prazo depois não esconde o vencimento. (B) O prazo da última versão (o atual, ou o da entrega). **Recomendação: A**, com a contagem de cards de prazo remarcado no cartão (B4-a). Limite dito no cartão: para card comprometido antes da primeira coleta, o primeiro prazo visto pode já ser remarcado. **Reabre se:** a B4-a mostrar quase nenhuma mudança de prazo (as duas opções dão o mesmo número e vale a mais simples, B).
- **Q-099-14. O12: responsabilidade do atraso.** Opções e recomendação no §7.2 (A agora, B depois).
- **Q-099-15. O16: criticidade nativa como severidade.** (a) **De-para:** Critical → Crítica, High → Alta, Average → Média, Low → Baixa (os nomes da tela do BusinessMap; o valor que a API grava é conferido pela B2-a). (b) **Valor padrão:** o BusinessMap põe um valor de criticidade em todo card criado; se a B2 mostrar que quase todo bug está no valor padrão e quase nenhum card muda, (A) publicar assim mesmo com a nota "criticidade padrão da ferramenta não diferenciada", ou (B) tratar o valor padrão como "Sem severidade". **Recomendação: aprovar o de-para (a) e, em (b), A com a nota**, porque B apagaria também os bugs que alguém classificou de propósito no valor padrão; a B2-b mostra quanto o campo é usado.
- **Q-099-16. O14: qual campo do projeto é a área solicitante?** (A) A Gerência (mais fina; o ranking de 10 áreas mais "demais" tem o que separar). (B) A Diretoria. (C) As duas: ranking por Diretoria e, dentro dela, por Gerência (contrato e cartão novos, com o UX). **Recomendação: A**, com a Diretoria guardada numa coluna própria (migração no C1b) para a visão C, se o dono quiser depois. Depende da B3-a: se um dos campos for de pessoa, ele não entra.
- **Q-099-17. Motivo de Encerramento (S6, S7, S11).** (A) Usar "Categoria de solução", se a B6-a mostrar que ela existe como lista e é preenchida, com um de-para dos valores dela para os 5 motivos do briefing, aprovado pelo dono. (B) Criar o campo "Motivo de Encerramento" (WS4) com os 5 valores do briefing. (C) S6 "sem dado real" e as partes do S7 ("não é incidente") e do S11 (contorno) também. **Recomendação: A se a B6-a achar a "Categoria de solução" como lista preenchida; senão B**, porque S6, S7 e S11 dependem deste campo e não há outro sinal de motivo de encerramento na base.
- **Q-099-18. Motivo da Escalação (S5).** (A) Publicar o S5 pelo destino da escalação (nível N2, N3 ou fornecedor, pelas etapas, e "Qual suporte foi acionado?", se lista) e deixar o motivo "sem dado real". (B) Criar o campo (WS4). **Recomendação: A**, porque o destino já tem dado e o motivo não tem equivalente; o cartão diz que o motivo falta. B só se o dono quiser o porquê da escalação.
- **Q-099-19. Prioridade ajustada manualmente (S7, S3).** (A) Ajuste = mudança do valor de `prioridade` entre versões coletadas do chamado (B6-c), com a nota de precisão da frequência da coleta e sem a justificativa ("sem dado real" na parte). (B) Ajuste = passagem pela etapa "Aguardando Validação de Prioridade". (C) Criar o campo (WS4). **Recomendação: A**, porque é o sinal direto e já está no staging; hoje nenhuma automação mexe na prioridade, então toda mudança é de pessoa. **Reabre se:** a automação externa da matriz de prioridade (T4.3) entrar em produção (aí a mudança automática precisa ser separada). Liga o interruptor `AJUSTE_PRIORIDADE_COM_FONTE` com versão de critério `afeta = ['S3', 'S7']`.
- **Q-099-20. Avaliação de Problema (S11).** Para que a equipe usa a etapa "Causa Raiz"? (A) É a avaliação de problema do PROC: P1, P2 e contorno que passaram por ela contam como "com avaliação". (B) É outra coisa: criar o campo (WS4) ou deixar o S11 "sem dado real". **Recomendação: A se o dono confirmar o uso, em uma linha**; a B6-b mostra quantos chamados passam por ela. A conversão em Registro de Problema continua sem fonte (D-15).
- **Q-099-21. S9: as outras etapas de espera do fluxo real.** A resposta 3 cobriu Solicitante, Suporte Terceiros e Equipe Interna. O fluxo real tem também: "Aguardando Fornecedor", "Aguardando Janela de Mudança (Deploy Produção)", "Aguardando Mudança", "Aguardando Aprovação", "Data Acordada" e "Pendente". Proposta pela regra do dono ("aguardam pessoas de fora do time"): Aguardando Fornecedor → aguardando fornecedor (pendência); Aguardando Janela de Mudança (Deploy Produção) → aguardando janela de mudança (pendência, motivo do briefing e do PROC); Pendente → pendência sem motivo ("não classificado"); Aguardando Mudança, Aguardando Aprovação e Data Acordada → **o dono diz** quem é esperado (de fora do time = pendência; do time = não é). Aguardando Validação fica fora da S9 (é estado próprio do PROC) e continua pausa da S1 pelo briefing. **Recomendação: aprovar a proposta e responder as três em uma linha cada**; a B6-b mostra o volume de cada uma.

Perguntas do plano que mudam: **Q-099-9** deixa de existir (vira a Q-099-12); **Q-099-10** respondida (B); **Q-099-8** respondida em parte (resto na Q-099-21); **Q-099-4** ganha O12 (responsabilidade), O14 (sistema) e S5 (motivo, se Q-099-18 = A) e perde O8 (a parte saiu do cartão).

## 9. Riscos, segurança e critério de parada

- **R1. Releitura dos cards antigos.** Tags e Diretoria/Gerência só existem no staging a partir da coleta que as pedir; a coleta incremental (`last_modified_from`) não relê card arquivado. O C1a e o C1b precisam de uma releitura única por estado (ativo, arquivado, descartado), que só acrescenta versões (nada é sobrescrito). Custo: dezenas de páginas de 1000 cards; o node-backend mede no lote. Sem a releitura, o O24 e o O14 só teriam classe e área nos cards mexidos depois da mudança.
- **R2. Critério muda de fonte.** O12 (data acordada = prazo nativo), O16 (severidade = criticidade nativa), O8 (sem tamanho), S9 e S1 (pendência pelas etapas) e O24 (classe por tag): cada um com versão de critério e marca no gráfico (T2.6), registrada no lote que o faz.
- **R3. Rótulos escritos por pessoas.** Tags e valores de Diretoria e Gerência podem conter nome de pessoa. Só o id (tag) ou o valor de domínio fechado aprovado (campo) entram; o rótulo de tag nunca chega ao staging.
- **Gatilhos de segurança (`R-SEGURANCA`):** fronteira de fonte externa (**sim**: C1a, C1b), banco (**sim**: C1b se houver coluna nova), dados pessoais (**sim**, indireto: rótulos e valores escritos por pessoas, R3), autenticação, webhook, CI, Docker, dependência nova (não). O security-engineer dá o modelo de ameaças antes do C1a (com a revisão da ADR 0020) e confirma o do 069 para o C1b. C2, C8a, A4 e D5 não mudam a fronteira.
- **Critério de parada (acrescenta ao §7 do plano):**
  - bloqueia: rótulo de tag, valor fora do domínio aprovado ou campo de tipo pessoa chegar ao staging; card sem tag, sem projeto ancestral ou com vencido não classificado ser publicado como Padrão, como área ou como "meta cumprida".
  - C5-tag-fora-do-mapa · tag sem entrada no mapa ou rótulo de tag gravado em `stg_card` · oráculo: teste de fronteira da allow-list do C1a com tag fora do mapa e rótulo na fixture, que espera só os ids do mapa
  - C6-classe-por-omissao · card sem tag ou com tags de classes diferentes saindo com classe · oráculo: teste do projetor do C1a com os dois casos, que espera nulo e as contagens `classe_sem_tag` e `classe_tag_empate`
  - C7-meta-falsa-o12 · `statusMeta = 'dentro'` com vencido não classificado · oráculo: teste de `calcularO12` (lote C3) que espera `statusMeta` nulo
  - gatilho · oráculo: os três testes falham antes do lote (o de C7-meta-falsa-o12 falha contra `o12.ts` da `develop` de hoje; os de C5 e C6 falham com o mapa de tags carregado e sem a redução na fronteira) e passam depois.

## 10. Critério de reversão desta revisão

Deixa de valer, no todo ou em parte, se: (1) a B1 mostrar que os times não usam tag para classe de serviço (o O24 volta à Q-099-9 original); (2) a B3-a mostrar Diretoria ou Gerência como campo de pessoa ou inexistente no quadro de projeto (o O14 volta ao roteiro); (3) a B2 mostrar a criticidade sem uso (todo bug no valor padrão e nenhuma mudança) e o dono escolher outra fonte para a severidade; (4) a WS4 puser em produção o desenho de 11 etapas do briefing (a ordem do §4 e o de-para da S9 são refeitos). Em qualquer um, o arquiteto refaz a linha do cartão no §1 e os lotes no §2.

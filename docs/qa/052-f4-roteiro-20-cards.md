---
tipo: roteiro
contrato: 0
pedido: 052-integracao-businessmap
estado: ajustado aos nomes reais da F4; sorteio e conferência só depois da carga real (E2.58)
commit_conferido: e1e5f86837c7755bcfab5857cc9919ff6c7f9851
data: 2026-10-31
---
# Roteiro de conferência: 20 cards sorteados, os 4 marcos contra o BusinessMap (F4, T2.4)

Pedido 052 (E2.57, K-182). Critério de pronto da T2.4 (briefing, T2.4): "para 20 cards sorteados, os quatro marcos derivados conferem com a inspeção manual do histórico". Plano: `docs/architecture/features/052-integracao-businessmap.md`, §4 F4. Quem executa: o dono, com o BusinessMap aberto e a base local da carga real (E2.58) já projetada pela F4 (E2.56).

Ajustado em 2026-10-31 (E2.61) contra a F4 entregue (ponta `e1e5f86`): os nomes de colunas, os valores e as consultas abaixo foram conferidos com as migrações e com o banco de teste, e os pontos que diziam "Confirmar na entrega" saíram. O frontmatter usa `tipo: roteiro` e `contrato: 0` de propósito: este documento não é parecer, e assim o `forge-check` não o lê como parecer de QA (o parecer da F4 é `docs/qa/052-f4-projetor.md`).

**Ordem obrigatória:** o sorteio (seção 2) e a conferência só acontecem **depois da carga real** (E2.58, feita pelo dono) e da projeção dessa carga por `bm:projetar`. Antes disso a base não tem card real e a semente do sorteio não vale.

## 1. O que está sendo conferido

Quatro marcos pedidos na E2.57, cada um pela decisão do dono que o define:

| Marco | Coluna na base (`dspd_bm.dim_card`) | Regra | Onde o dono olha no BusinessMap |
|---|---|---|---|
| entrada | `criado_em` | criação do card (briefing 4.1) | data de criação no cabeçalho do card |
| compromisso | `comprometido_em` | H-9: primeira entrada em folha da seção 2 do workflow; H-23: se o card pulou a seção 2, vale a primeira entrada na seção 3 | histórico (aba "Histórico" ou "Linha do tempo" do card): primeira linha de movimento para coluna da seção 2 |
| entrega | `concluido_em` | H-10: primeira entrada em folha da seção 4 que não seja "Descartado"; H-23: se pulou a seção 4, vale a primeira entrada na seção 5 | histórico: primeira linha de movimento para coluna da seção 4 (nunca "Descartado") |
| descarte | `motivo_descarte` (códigos `descarte_nativo` e `coluna_descartado`) e o instante, que a F4 grava em `arquivado_em` quando há `motivo_descarte` | H-11: card movido para a coluna "Descartado" conta como descartado, igual ao descarte nativo; sai da vazão e do tempo de ciclo, e `concluido_em` fica vazio | card com a marca de descartado do BusinessMap, ou histórico com movimento para a coluna "Descartado" |

Observações de leitura:
- O briefing 4.1 lista como marcos entrada, compromisso, **início** e entrega (aceite é à parte); a E2.57 pede entrada, compromisso, entrega e descarte. Este roteiro cobre os quatro da E2.57 e traz a coluna **início** (`iniciado_em`, primeira entrada em coluna de execução) como conferência extra, opcional, porque o texto do briefing a conta entre os 4 marcos. **Pergunta ao dono (não resolvida por inferência):** o critério T2.4 vale com entrada, compromisso, entrega e descarte, ou com entrada, compromisso, início e entrega? Enquanto não houver resposta, preencha também a coluna início.
- Seção de cada coluna: a seção (1 a 5) aparece no desenho do workflow no BusinessMap (fila, preparação, execução, validação e concluído, conforme o quadro). A base guarda o papel (`ref_coluna.papel`: backlog, compromisso, trabalho, homologacao, entrega) e `ref_coluna.section`, que vêm das seções pelas H-8 a H-11 mais o arquivo de conferência `docs/architecture/fontes/businessmap-conferencia.json`. A coluna de descarte é a marcada em `ref_coluna.eh_descarte` (a conferência lista 15 colunas "Descartado", entre elas as dos workflows 105, 177, 65, 232, 243, 251, 271, 76, 202, 205, 206 e 324; a do workflow 321 fica fora de todo cálculo, H-7). A consulta usa `eh_descarte`, não o nome.
- Descarte pela coluna e descarte nativo valem igual (H-11); o dono confere os dois tipos se aparecerem na amostra.

## 2. Como sortear os 20 cards (consulta só por id de card, sem nome de pessoa)

Regras:
- A consulta devolve **somente `card_id`** mais colunas que não são de pessoa (`granularidade`, estado derivado). Nunca `titulo` (texto livre pode ter nome), nunca `responsaveis`, nunca `SELECT *`. Quem roda usa o papel de leitura do projeto (`dspd_api`), que não lê colunas de pessoa; se a consulta falhar por permissão, é sinal de que pediu coluna indevida.
- No BusinessMap o dono localiza o card pelo id (campo de busca ou URL do card), sem precisar do título.
- O sorteio é reproduzível: `setseed` com um número que o dono escolhe e anota na seção 5. Quem repetir o número obtém os mesmos cards.
- Só a população BusinessMap (`dspd_bm`). Nada do Acelerato entra nesta amostra (CLAUDE.md: as fontes nunca se misturam).
- Fora da amostra: card de tipo Sprint (H-2, não é item) e card de workflow marcado fora de todo cálculo (H-7).

Estados derivados (a base não tem coluna "estado"; vale a ordem abaixo, do primeiro que casar):
1. descartado: `motivo_descarte IS NOT NULL`
2. arquivado: `arquivado_em IS NOT NULL` (e não descartado)
3. concluído: `concluido_em IS NOT NULL` (e nenhum dos anteriores)
4. aberto: o resto

Conferido na entrega da F4: o instante do descarte fica em `arquivado_em` (o descarte vale mais que o arquivamento), junto de `motivo_descarte`; os valores de `granularidade` são `story`, `frente` (nível feature ou pacote, H-1) e `projeto`. Sprint (H-2), workflow fora de todo cálculo (H-7) e story sem time ficam na base com `granularidade` nula; por isso o sorteio filtra `granularidade IS NOT NULL`.

### 2.1 Cotas (estratificação por nível e estado)

Total 20, tirando o máximo de cada nível e estado. O nível vem do workflow (H-1) e na base se chama `granularidade`: `story`, `frente` (feature ou pacote) e `projeto`.

| Nível (`granularidade`) | aberto | concluído | descartado | arquivado | subtotal |
|---|---|---|---|---|---|
| story | 3 | 3 | 2 | 2 | 10 |
| frente | 2 | 2 | 1 | 1 | 6 |
| projeto | 1 | 1 | 1 | 1 | 4 |
| total | 6 | 6 | 4 | 4 | 20 |

Se uma combinação não tiver cards na base (ex.: projeto descartado), o sorteio completa a cota com o mesmo estado no nível story e o dono registra a troca na seção 5. Não se completa trocando de estado, para o descarte e o arquivamento continuarem representados.

Casos dirigidos dentro das cotas (para exercitar as decisões H): se existirem na base, a amostra deve conter ao menos 2 cards que pularam a seção 2 ou a 4 (H-23) e ao menos 2 que foram à coluna "Descartado" (H-11). A consulta 2.3 os lista; o dono troca por eles o sorteado de mesmo nível e estado. Se não houver, anota "inexistente na base".

### 2.2 Consulta do sorteio

Rode no `psql` com a base local. Troque `0.42` pela semente anotada. Uma execução por nível e estado, repetindo o bloco com a cota da tabela 2.1.

```sql
SELECT setseed(0.42);

WITH base AS (
  SELECT card_id,
         granularidade,
         CASE
           WHEN motivo_descarte IS NOT NULL THEN 'descartado'
           WHEN arquivado_em IS NOT NULL THEN 'arquivado'
           WHEN concluido_em IS NOT NULL THEN 'concluido'
           ELSE 'aberto'
         END AS estado
  FROM dspd_bm.dim_card
  WHERE excluido_em IS NULL
    AND granularidade IS NOT NULL
)
SELECT card_id, granularidade, estado
FROM base
WHERE granularidade = 'story' AND estado = 'concluido'
ORDER BY random()
LIMIT 3;
```

Repita trocando `granularidade` (`story`, `frente`, `projeto`), `estado` e `LIMIT` até fechar as 20 linhas da tabela 2.1 (uma execução por célula da tabela). Sprint e workflow fora saem pelo filtro `granularidade IS NOT NULL`, já na consulta. Antes de sortear, confira: `SELECT granularidade, count(*) FROM dspd_bm.dim_card GROUP BY 1` deve mostrar só `story`, `frente`, `projeto` e nulo; outro valor é defeito da F4.

### 2.3 Consulta dos casos dirigidos (H-23 e H-11)

Colunas de papel e ordem vêm de `ref_coluna`. Card que pulou a seção 2: tem `comprometido_em` e nenhuma transição para coluna de papel `compromisso`. Card em "Descartado": transição para coluna de nome "Descartado".

```sql
SELECT DISTINCT c.card_id, 'pulou_compromisso' AS caso
FROM dspd_bm.dim_card c
WHERE c.comprometido_em IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM dspd_bm.vw_transicao_canonica t
    JOIN dspd_bm.ref_coluna r
      ON r.quadro_id = t.quadro_id AND r.coluna_id = t.coluna_destino_id
     AND t.ocorrido_em::date >= r.vigente_de
     AND (r.vigente_ate IS NULL OR t.ocorrido_em::date <= r.vigente_ate)
    WHERE t.card_id = c.card_id AND r.papel = 'compromisso')
LIMIT 10;

SELECT DISTINCT t.card_id, 'coluna_descartado' AS caso
FROM dspd_bm.vw_transicao_canonica t
JOIN dspd_bm.ref_coluna r
  ON r.quadro_id = t.quadro_id AND r.coluna_id = t.coluna_destino_id
 AND t.ocorrido_em::date >= r.vigente_de
 AND (r.vigente_ate IS NULL OR t.ocorrido_em::date <= r.vigente_ate)
WHERE r.eh_descarte
LIMIT 10;

SELECT DISTINCT c.card_id, 'pulou_entrega' AS caso
FROM dspd_bm.dim_card c
WHERE c.concluido_em IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM dspd_bm.vw_transicao_canonica t
    JOIN dspd_bm.ref_coluna r
      ON r.quadro_id = t.quadro_id AND r.coluna_id = t.coluna_destino_id
     AND t.ocorrido_em::date >= r.vigente_de
     AND (r.vigente_ate IS NULL OR t.ocorrido_em::date <= r.vigente_ate)
    WHERE t.card_id = c.card_id AND r.section = 4 AND NOT r.eh_descarte)
LIMIT 10;
```

A terceira consulta lista quem tem entrega sem nenhuma entrada na seção 4 (a entrega veio da seção 5, H-23). Se uma consulta ficar pesada, rode com `LIMIT` menor; o resultado só orienta a troca de cards da amostra.

Casos reais pela lista de conferência (`docs/architecture/fontes/businessmap-conferencia.json`), para trocar por eles o sorteado de mesmo nível e estado quando existirem na base (consulte só por id de workflow, sem título):
- coluna `Pre-Release` ou `Pre-release` dos workflows 250 e 202 e `Publicação APPLE e GOOGLE` do 212: contam como trabalho e a entrega é a entrada na folha seguinte da seção 4 (pergunta 2 do dono, 2026-10-31);
- workflows de liberação: a entrega é a entrada em qualquer folha da seção 4 (pergunta 1 do dono);
- workflows 222 e 262 (sustentação dentro do BusinessMap, H-16) e 221 e 245 (colunas "Pronto" tratadas como fila): conferir que o tempo de fila não vira trabalho;
- workflow 323 (fora do painel operacional, H-22): se aparecer card dele, anote, porque ele não entra no sorteio do painel.

```sql
SELECT t.card_id, w.workflow_id, w.nome AS workflow, r.nome AS coluna, r.section
FROM dspd_bm.vw_transicao_canonica t
JOIN dspd_bm.ref_coluna r
  ON r.quadro_id = t.quadro_id AND r.coluna_id = t.coluna_destino_id
 AND t.ocorrido_em::date >= r.vigente_de
 AND (r.vigente_ate IS NULL OR t.ocorrido_em::date <= r.vigente_ate)
JOIN dspd_bm.ref_workflow w
  ON w.quadro_id = r.quadro_id AND w.workflow_id = r.workflow_id AND w.vigente_ate IS NULL
WHERE r.workflow_id IN ('250', '202', '212', '222', '262', '221', '245')
  AND r.nome ILIKE ANY (ARRAY['Pre-release', 'Publicação APPLE e GOOGLE', 'Pronto%', 'Deploy Pronto'])
ORDER BY random()
LIMIT 10;
```

## 3. O que cada card traz da base (folha de cada card)

Para cada `card_id` sorteado, rode uma vez (só colunas sem pessoa):

```sql
SELECT card_id, granularidade, criado_em, comprometido_em, iniciado_em, concluido_em,
       arquivado_em, motivo_descarte
FROM dspd_bm.dim_card
WHERE card_id = '<ID>';
```

E a linha do tempo de colunas do card, para conferir o histórico lado a lado com o BusinessMap:

```sql
SELECT t.ocorrido_em, t.fonte, r.nome AS coluna_destino, r.papel, r.tipo_coluna, t.direcao
FROM dspd_bm.vw_transicao_canonica t
LEFT JOIN dspd_bm.ref_coluna r
  ON r.quadro_id = t.quadro_id AND r.coluna_id = t.coluna_destino_id
 AND t.ocorrido_em::date >= r.vigente_de
 AND (r.vigente_ate IS NULL OR t.ocorrido_em::date <= r.vigente_ate)
WHERE t.card_id = '<ID>'
ORDER BY t.ocorrido_em;
```

Nenhuma das duas lê `usuario`, `responsaveis` nem título.

## 4. Como conferir cada marco no BusinessMap

Para cada card, abra-o pelo id e abra o histórico (movimentos de coluna com data e hora).

| Marco | O que olhar | Está certo quando |
|---|---|---|
| entrada | data e hora de criação do card | `criado_em` da base cai dentro da tolerância da seção 4.1 |
| compromisso | primeira linha do histórico em que o card entra em coluna da seção 2 do workflow. Se o card nunca passou pela seção 2: a primeira entrada na seção 3 (H-23) | `comprometido_em` cai na tolerância desse instante. Se o card nunca entrou na seção 2 nem na 3, `comprometido_em` precisa estar vazio |
| entrega | primeira linha do histórico em que o card entra em coluna da seção 4, ignorando a coluna "Descartado". Se nunca passou pela seção 4: a primeira entrada na seção 5 (H-23) | `concluido_em` cai na tolerância desse instante; se o card nunca chegou à 4 nem à 5, ou foi descartado, `concluido_em` precisa estar vazio |
| descarte | marca de descartado no card, ou movimento para a coluna "Descartado" (H-11) | `motivo_descarte` preenchido (código `coluna_descartado` quando foi por coluna) e o instante do descarte dentro da tolerância; `concluido_em` vazio |
| início (extra) | primeira entrada em coluna de execução (fila não conta) | `iniciado_em` dentro da tolerância |

Armadilhas que o dono deve ficar de olho (cada uma é um defeito possível da F4):
- **Reentrada:** card que sai e volta para a seção 2 ou 4 vale a **primeira** entrada, não a última.
- **Retorno:** card que avançou até a seção 4 e voltou conserva a entrega da primeira entrada (regra da primeira entrada, H-10), salvo orientação diferente do dono; se o BusinessMap mostrar o contrário e o dono quiser outro critério, vira pergunta (registre como divergência, seção 6).
- **Volta da seção 3 para a 2 (A7 do review, aberto):** o card que foi da seção 3 para a 2 pode ficar com compromisso depois do início. A H-23 não cobre esse caso e a resposta é do dono; se aparecer na amostra, registre como pergunta ao dono, nunca como "dif" nem como "ok".
- **Coluna "Descartado" na seção 4:** não é entrega (H-10 e H-11).
- **Colunas homônimas:** colunas com o mesmo nome em workflows diferentes ou filhas de uma coluna mãe; confira pelo workflow e pela posição na seção, não só pelo nome (ADR 0016).
- **Card que mudou de workflow (U-2):** os marcos valem no instante de cada evento; conferir o nível e o time no instante, se aparecer.
- **Arquivado:** o card arquivado conserva os marcos que já tinha (nunca apagado da base); arquivar não é entregar nem descartar.

## 5. Tolerância aceita

Proposta do QA (suposição registrada; o dono confirma ou muda antes da conferência, por ser regra de aceite, não inferência de cálculo):

- **Instante (entrada, compromisso, entrega, descarte, início):** a base guarda `timestamptz` e o BusinessMap mostra a hora no fuso do usuário, em geral sem segundos. Aceita-se diferença de **até 1 minuto** depois de converter para o mesmo fuso; é só arredondamento de exibição.
- **Fuso:** compare no fuso local do dono. Diferença exata de 3 horas (ou de outro múltiplo de hora) em todos os cards é erro de fuso na conferência ou na gravação, não arredondamento: vale como divergência (seção 6), mesmo que o dia coincida.
- **Dia e hora úteis:** o roteiro compara instantes brutos. Horas úteis e percentis são da biblioteca T2.5 e ficam fora desta conferência.
- **Marco vazio:** vazio na base só é correto quando o BusinessMap prova que o evento nunca ocorreu (regra da seção 4). Marco vazio com evento visível no histórico é divergência, sem tolerância.
- **Aprovação do critério T2.4:** os **20 cards com os marcos conferidos sem divergência fora da tolerância**. Qualquer divergência aberta reprova o critério até ser explicada (seção 6). Não existe percentual de acerto aceitável.

Semente do sorteio e troca de cotas: anote aqui.

- Data da conferência: ____ / ____ / ______
- Semente (`setseed`): ______
- Fuso usado na comparação: ______
- Trocas de cota (nível, estado, motivo): ______

## 6. Tabela para o dono preencher

Uma linha por card. "Base" = valor da folha do card (seção 3). "BM" = o que o histórico do BusinessMap mostra. Marque "ok" se estiver dentro da tolerância, "dif" se não, "n/a" se o marco não se aplica (ex.: descarte em card não descartado). Escreva a diferença em minutos ou horas quando for "dif". Não escreva nome de pessoa em nenhuma célula.

| # | card_id | nível | estado | caso dirigido (H-23, H-11, nenhum) | entrada base | entrada BM | entrada | compromisso base | compromisso BM | compromisso | entrega base | entrega BM | entrega | descarte base | descarte BM | descarte | início base (extra) | início BM (extra) | início (extra) | observação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | | | | | | | | | |
| 2 | | | | | | | | | | | | | | | | | | | | |
| 3 | | | | | | | | | | | | | | | | | | | | |
| 4 | | | | | | | | | | | | | | | | | | | | |
| 5 | | | | | | | | | | | | | | | | | | | | |
| 6 | | | | | | | | | | | | | | | | | | | | |
| 7 | | | | | | | | | | | | | | | | | | | | |
| 8 | | | | | | | | | | | | | | | | | | | | |
| 9 | | | | | | | | | | | | | | | | | | | | |
| 10 | | | | | | | | | | | | | | | | | | | | |
| 11 | | | | | | | | | | | | | | | | | | | | |
| 12 | | | | | | | | | | | | | | | | | | | | |
| 13 | | | | | | | | | | | | | | | | | | | | |
| 14 | | | | | | | | | | | | | | | | | | | | |
| 15 | | | | | | | | | | | | | | | | | | | | |
| 16 | | | | | | | | | | | | | | | | | | | | |
| 17 | | | | | | | | | | | | | | | | | | | | |
| 18 | | | | | | | | | | | | | | | | | | | | |
| 19 | | | | | | | | | | | | | | | | | | | | |
| 20 | | | | | | | | | | | | | | | | | | | | |

Resumo para fechar (o dono preenche):

| Marco | cards conferidos | ok | dif |
|---|---|---|---|
| entrada | 20 | | |
| compromisso | 20 | | |
| entrega | 20 | | |
| descarte | 20 | | |
| início (extra) | 20 | | |

Resultado do critério T2.4: aprovado (zero "dif" fora da tolerância) / reprovado. Assinatura e data do dono: ______

## 7. O que fazer com divergência

1. **Não corrigir nada na base nem no quadro.** A base é derivada da staging e a coleta é só GET; um ajuste manual esconde o defeito. O dono só anota o card e a linha.
2. **Registrar** na coluna "observação" o que viu no histórico do BusinessMap (colunas e instantes, sem nome de pessoa; uma captura de tela do histórico serve, com o nome de quem moveu o card coberto).
3. **Classificar a causa** com a ajuda do time (o Jarvis chama o QA, que chama o desenvolvedor):

| Sinal | Provável causa | Quem resolve |
|---|---|---|
| diferença de múltiplo exato de hora | fuso na gravação ou na conferência | node-backend (gravação) ou dono (conferência) |
| marco da base posterior ao do BM, card passou por coluna não esperada | papel da coluna errado em `ref_coluna` (seção ou exceção) | dono (arquivo de conferência, H-8 a H-12, aceita exceção) e node-backend (recarga da referência) |
| marco da base posterior, com reentrada no histórico | regra da primeira entrada não aplicada (pegou a última) | node-backend (defeito) |
| marco vazio, evento visível | transição ausente na staging (coleta, `expand=transitions`) ou card sem folha mapeada | node-backend (coleta ou normalizador) |
| card pulou seção e marco vazio | H-23 não aplicada | node-backend (defeito) |
| card em "Descartado" com `concluido_em` preenchido | H-11 não aplicada | node-backend (defeito) |
| criado_em diferente | campo errado da API (criação x outro instante) | node-backend (defeito) |
| regra do dono parece errada diante do caso real | decisão H a rever | pergunta ao dono (R-DECISAO); nunca resolvida no código por inferência |

4. **Bug:** cada defeito confirmado vira `docs/qa/bugs/<id>-<titulo>.md` com severidade, card_id, passos e evidência (consulta da seção 3 e histórico do BM). Marco errado em dado publicado: severidade alta (todas as métricas de tempo e vazão dependem dele).
5. **Depois da correção:** reprocessar e **conferir de novo os cards divergentes e mais 5 novos sorteados** com a semente seguinte; o critério só fecha com os 20 originais ou substitutos conferidos, e a F4 não é dada por pronta antes disso.
6. **Dúvida de regra** (ex.: o BM mostra um caso que as H-9 a H-11 e H-23 não previram): pergunta ao dono, sem decisão do time, e entra como nova linha da lista de conferência de colunas quando for exceção.

## 8. Cuidados de privacidade e segurança

- Nenhuma célula, captura ou mensagem com nome, e-mail, id de responsável, título ou descrição do card. O id do card basta.
- A chave do BusinessMap não é usada neste roteiro: o dono confere só pela interface web, logado como ele mesmo. O agente não abre o `.env`, não consulta o quadro real e não recebe a tabela com dado de pessoa.
- A conferência só lê. Nenhuma ação de mover, editar ou arquivar card no BusinessMap durante a conferência (a chave do dono pode escrever; risco R-8 do plano).
- Painéis do Acelerato e de sustentação ficam fora: nenhum card ou chamado do Acelerato entra na amostra.

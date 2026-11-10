# 069 · L9-c: volta do A1, ordem das etapas do campo repetido (decisão "B")

- Data: 2026-11-05 · Autor: `software-architect` (pedido 069, E1.1, K-220) · Público: Jarvis, node-backend, tech-lead, qa-engineer, security-engineer.
- Leitura: `docs/analises/069-desenho.md` (E4, lotes L9-b e L9-c); review `docs/reviews/069-zz4-l9c.md` em `a4dd982c` (A1, A3); na worktree `MetricasDSPD-052c` (branch `feature/069-l9c-projecao`, commit `56bee453`): `server/src/modulos/acelerato/sql.ts` (Q2, Q6, Q7), `allow-list.ts` (`camposEtapa`, `registroEtapas`), `normalizador.ts`, `referencia.ts`, `controle.ts`, `coletor.ts`, `etapas-sinteticas.ts`, `docs/architecture/fontes/acelerato-listas.md` §2, §3 e §7; `docs/briefing-execucao-metricas.md` §3.4. Caminhos de código abaixo são relativos a essa worktree. Nenhum código, teste ou outro documento foi alterado.
- Regra a aplicar (DECISÃO DO DONO de 2026-11-05, "B", que refina a "A"): a lista `campos_personalizados_etapa` não é cronológica; no campo repetido em várias etapas vale o valor preenchido da etapa que vem **por último no desenho do fluxo de atendimento** (não na passagem real do chamado); um vazio nunca apaga um valor preenchido.

## 1. Estado: a fonte da ordem do desenho não está coletada de forma confiável

Para aplicar a "B", cada item de `campos_personalizados_etapa` precisa de uma posição no desenho do fluxo, ligada pelo `kanbanStatusKey` do item (listas §2: o item é `{nome, tipo, valor, obrigatorio, kanbanStatusKey}`). Conferi as fontes que o projeto já tem; nenhuma dá essa posição com confiança:

| Fonte candidata | O que dá | Por que não basta (evidência) |
|---|---|---|
| Ordem de `estatisticas.workflow.etapas[*]` (Q2) | `etapaKey`, nome, `tempoSla`, `quantidadeDeVezes` por chamado | Nenhum documento diz que o array está na ordem do desenho (listas §2 linha 25 só lista as chaves). A Q2 não numera os elementos (`sql.ts:32-40`, sem `FOR ORDINALITY`) e `registroEtapas` descarta a posição (`allow-list.ts:122-143`). O projeto já registra que "a ferramenta não informa a ordem das etapas" (`etapas-sinteticas.ts:10`). Também não está documentado que `kanbanStatusKey` é o mesmo identificador que `etapaKey`. |
| Ordem de `campos_personalizados_etapa` | posição do item no array | Afastada pelo dono na "B" (a lista não é tomada como ordem). |
| `ref_dominio` campo `etapa`, coluna `ordem` | 44 nomes | `ordem` é a frequência da consulta E4.40, não o desenho (listas §7, parágrafo "Preenchido na E4.42"); a lista é por nome, e o nome se repete em workflows diferentes (79 pares de chave e nome). |
| Briefing §3.4, tabela "Etapas (11)" | 11 nomes do fluxo-alvo do PROC 30.000.010 | É a parametrização-alvo da solicitação de mudança, por nome, sem chave; a base real tem 44 nomes de fluxo novo e antigo; a tabela não se declara sequência e o fluxo tem volta (Aguardando validação → Em diagnóstico, §3.4). |
| `STAGE_ORDER` do dash (20 etapas, dash §5.1, citado em listas §7) | ordem de exibição do dash | Ordem de tela do dash, por nome, fluxos misturados; o documento do dash não está no repositório para conferência. |
| Configuração do workflow no Acelerato | o desenho de fato, por chave | Não é coletada hoje (nem na tabela MySQL lida, nem pela API). |

Por isso a escolha da fonte **não está neste desenho**: vai como pergunta no relatório ao Jarvis (P-L9C-1 a P-L9C-3, seção 8). O que está abaixo é o mecanismo que vale para a opção recomendada na pergunta (lista versionada por `kanbanStatusKey`); a mudança na Q6, em `camposEtapa`, os testes e a versão de critério valem para qualquer fonte que entregue o par `kanbanStatusKey → posição`. Se o dono escolher a ordem do array de `estatisticas` (opção C da P-L9C-1), a seção 3 muda (Q2 ganha ordinal e `stg_etapa` ganha a posição); as seções 4 a 7 continuam.

## 2. Onde a ordem importa (reduz o alcance)

A "B" só precisa de ordem quando o mesmo campo tem **dois ou mais valores preenchidos diferentes** no mesmo chamado. Com um só valor preenchido, ou com valores iguais, o resultado é o mesmo em qualquer ordem, e o vazio já não apaga (regra da "A", mantida). Logo:

- **Q7 (tratamento `preenchido`) não muda.** "Qualquer linha verdadeira vale" (`allow-list.ts:180, 196-200`) é exatamente "vale o preenchido, vazio não apaga" para um booleano; não depende de ordem. Nem o texto da Q7 nem o hash dela mudam.
- **A recusa por `tipo` texto não muda.** Qualquer linha de `tipo` texto anula o campo (`allow-list.ts:190, 204`, A2 do modelo de ameaças); é independente de ordem e continua mais restritiva que a "B".
- **Só a Q6 (tratamento `lista`) e a fusão dela em `camposEtapa` mudam.**

A consulta de apoio B (seção 8) mede quantos chamados têm de fato dois valores preenchidos diferentes no mesmo campo; é o número de chamados que a ordem decide.

## 3. De onde vem a posição e como se liga ao item (opção recomendada)

- **Lista versionada em `dspd_ac.ref_dominio`, campo novo `etapa_fluxo`** (nome a confirmar no PR), carregada por `ac:ref-sync` a partir de `docs/architecture/fontes/acelerato-dominio.json`, como as outras listas do Acelerato: `codigo` = `kanbanStatusKey` em texto decimal; `rotulo` = nome exato da etapa (do domínio `etapa`); `ordem` = posição da etapa no desenho do fluxo de atendimento (maior = vem depois). O conteúdo é dado de configuração das pessoas (WS4) e do dono, nunca escrito pelo time por inferência; até ser preenchida, a lista fica vazia.
- **Não é mecanismo novo:** `ref_dominio` já tem `ordem` e vigência (`vigente_de`, `vigente_ate`), e o padrão `codigo` = chave decimal já existe (`referencia.ts:14-21`). Diferença a registrar em `acelerato-listas.md` (seção nova) e em `data-model.md`: nesta lista `ordem` carrega significado (posição no desenho), não é a "ordem neutra" das demais.
- **Leitura:** função nova `carregarOrdemFluxo(db, S): ReadonlyMap<number, number>` em `referencia.ts`, no molde de `carregarDominiosEtapa` (`referencia.ts:52-60`): `SELECT codigo, ordem FROM ${S.ac}.ref_dominio WHERE vigente_ate IS NULL AND campo = 'etapa_fluxo'`; `codigo` fora de `^\d{1,15}$` falha fechado `dados-invalidos` (como `paraChaves`). Lista vazia **não** é erro (como os domínios de campo de etapa, `referencia.ts:49-50`): sem lista, todo campo com valores diferentes em competição sai nulo com contagem, e o resto segue. Chamada em `coletor.ts:216`, ao lado de `carregarDominiosEtapa`, e passada a `camposEtapa`.
- **Ligação ao item:** `posicao = ordemFluxo.get(item.kanban_status_key)`. Uma posição por `kanbanStatusKey`; o chamado está num workflow só, então as posições de um chamado vêm do mesmo desenho (a consulta de apoio C confere esse fato antes da carga da lista).
- **Alternativa considerada e não recomendada:** guardar no staging a lista `{kanban_status_key, valor}` de cada campo e decidir no normalizador. Daria reprojeção sem recoleta quando a lista mudar, mas aumenta a forma do `payload` e o lote, e a releitura semanal já reaplica a regra (versão nova de staging quando o valor decidido muda, append-only, desenho 069 Lote L9-c). Fica como reversão se a lista mudar com frequência (seção 7).

## 4. Mudança na Q6 e em `camposEtapa`

**Q6** (`sql.ts:56-62` e o mesmo texto em `docs/architecture/fontes/acelerato-mysql.sql`, comparados por teste):

```sql
SELECT c.ticket_key, f.nome, f.tipo, f.valor, f.kanban_status_key
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
       nome VARCHAR(255) PATH '$.nome', tipo VARCHAR(40) PATH '$.tipo', valor VARCHAR(80) PATH '$.valor',
       kanban_status_key BIGINT PATH '$.kanbanStatusKey' NULL ON EMPTY NULL ON ERROR)) f
WHERE c.ticket_key IN (<chaves>) AND f.nome IN (<nomes>)
ORDER BY c.ticket_key, f.nome, f.kanban_status_key
```

- **Entra no SELECT:** só `kanban_status_key`, inteiro (`BIGINT`, com `NULL ON ERROR`: um texto na chave vira nulo no MySQL, nunca sai como texto). Nada de `obrigatorio`, nada do `json` inteiro.
- **ORDER BY:** dá resultado determinístico (mesma entrada, mesma sequência de linhas) para log, teste e repetição; **a regra não depende dele**. A decisão sai da posição no desenho, e o teste de linhas embaralhadas (seção 6) prova que a saída não muda com a ordem. Sem `FOR ORDINALITY`: a posição no array não é usada (decisão "B"), e não projetá-la evita que alguém volte a usá-la.
- **Custo:** a ordenação é sobre as linhas filtradas de até 1000 chamados por página e poucos nomes; cabe no `max_execution_time` vigente. O node-backend confere com o tempo da Q6 na carga de homologação.
- **Dado novo no staging:** nenhum. `kanban_status_key` só é usado na fusão e não é gravado; `payload.campos` mantém as mesmas chaves e a mesma forma (um valor por campo).

**Zod** (`allow-list.ts:168-170`): `esquemaEtapaLista` ganha `kanban_status_key: chave.nullable()` (inteiro positivo ou nulo); string, número não inteiro ou chave extra falham fechado `dados-invalidos`, erro só com o nome da coluna.

**`camposEtapa`** (`allow-list.ts:182-212`), assinatura com o mapa novo: `camposEtapa(listaLinhas, preenchidoLinhas, dominios, ordemFluxo, c)`. Para cada campo de tratamento `lista`:

1. Linhas de `tipo` texto: como hoje (anula o campo com `tipo_texto_<chave>`).
2. Descarta as linhas com `valor` nulo ou vazio (o vazio não apaga, regra mantida).
3. Se os valores preenchidos que restam forem todos iguais (ou um só), esse é o valor; a posição não é consultada.
4. Se houver dois ou mais valores preenchidos diferentes: cada linha recebe `posicao = ordemFluxo.get(kanban_status_key)`.
   - Alguma dessas linhas sem posição (`kanban_status_key` nulo ou fora da lista): o campo sai **nulo** com contagem `etapa_fora_do_fluxo_<chave>`, sem o valor.
   - Maior posição única: vale o valor dessa linha.
   - Maior posição empatada entre valores diferentes: o campo sai **nulo** com contagem `empate_fluxo_<chave>`, sem o valor.
5. Domínio: como hoje (fora do domínio vira nulo com `fora_dominio_<chave>`).

Os passos 4a e 4c não criam regra: são os casos em que a "B" não consegue apontar a etapa do desenho, tratados pelo princípio já vigente no coletor e na ADR 0026 (o que não se sabe sai nulo, com contagem, sem valor e sem zero falso); nenhum valor é escolhido por inferência. Se o dono preferir outro tratamento, é a P-L9C-2 (seção 8). Comentário e `data-model.md` deixam de dizer "na ordem da fonte".

## 5. Versão de critério (T2.6) e hash

- **SQL:** a Q6 muda, então `sqlSha256()` (`sql.ts:108`) muda; o node-backend registra o hash novo no PR e no texto versionado. Sem reconhecimento, a coleta recusa com `parametros-mudaram` (CA-8, `coletor.ts:204-209`).
- **Lista de ordem:** proposta de parâmetro novo `fluxo_sha256` em `ParametrosColeta` e em `CHAVES_COMPARADAS` (`controle.ts:17-22`): SHA-256 de `codigo|ordem` da lista vigente, ordenada por `codigo`. **Por que o existente não basta:** hoje nenhum dado de `ref_dominio` entra nos parâmetros comparados (`controle.ts:22-28` só hasheia constantes do código), então trocar a ordem do desenho mudaria o valor decidido sem recusa nem registro; listas §cabeçalho já manda "mudar qualquer lista é mudança de critério: novo hash em `ctl_coleta.parametros` e entrada em `ref_versao_criterio`". Com o parâmetro, a mudança da lista cai no mesmo CA-8.
- **`ref_versao_criterio`:** uma entrada para o L9-c (Q6 nova e escolha pela posição no desenho), no molde da D-7, com `afeta = ['S5', 'S6', 'S7', 'S9', 'S11']` (consumidores dos campos `lista`, listas §3); cada carga nova da lista `etapa_fluxo` gera entrada nova. As cinco SDR estão no portão (ADR 0026), então a marca nos gráficos só aparece quando cada uma sair pelo seu plano. A entrada da virada de `AJUSTE_PRIORIDADE_COM_FONTE` (S3, S7) segue no PR próprio, como no desenho 069.
- **Contrato da API:** não muda.

## 6. Testes

Unidade (`camposEtapa`, `server/tests/acelerato-l9c.test.ts`), com `kanbanStatusKey` **diferentes** em cada linha (o teste atual usa 1 em todas, `acelerato-l9c.pg.test.ts:79`):

- **Linhas embaralhadas:** 3 a 4 linhas do mesmo campo com valores diferentes e posições distintas; todas as permutações dão a mesma saída (a da maior posição).
- **Etapas fora de ordem:** a linha da etapa que vem por último no desenho chega primeiro no array e na consulta; vence ela, não a última linha.
- **Vazio depois de valor:** a etapa de maior posição tem `valor` nulo e, noutro caso, `''`; vence o preenchido de posição menor.
- **Valores iguais ou um só preenchido:** com `kanban_status_key` nulo ou fora da lista, o valor segue (a posição não é consultada) e nenhuma contagem é somada.
- **Etapa fora do fluxo em competição:** dois valores diferentes, um sem posição → nulo e `etapa_fora_do_fluxo_<chave>` = 1; o marcador do valor ausente da saída e das contagens.
- **Empate:** dois valores diferentes na mesma posição → nulo e `empate_fluxo_<chave>`.
- **Lista de ordem vazia:** competição → nulo com contagem; campos sem competição seguem; a coleta não falha.
- **Zod:** `kanban_status_key` string, decimal, negativo, ou chave extra → `dados-invalidos`, erro sem valor.
- **Regras mantidas:** `tipo` texto em qualquer linha anula; fora do domínio vira nulo; Q7 inalterada.

Estruturais: Q6 projeta `kanban_status_key` e termina em `ORDER BY c.ticket_key, f.nome, f.kanban_status_key`; Q6 não projeta `obrigatorio` nem a coluna `json` inteira; Q7 continua sem `valor`; texto de `sql.ts` igual ao de `acelerato-mysql.sql`; hash mudou e parâmetros antigos recusam a coleta (CA-8); `fluxo_sha256` muda quando a lista muda.

`referencia.ts`: `codigo` não decimal falha fechado; só linhas vigentes; campo vazio dá mapa vazio.

pg (`acelerato-l9c.pg.test.ts`): staging com chamado de campo repetido em posições diferentes e lista `etapa_fluxo` semeada → `dim_chamado` com o valor da maior posição; versão nova quando a lista muda e o valor decidido muda, versão antiga intacta (append-only); `kanban_status_key` ausente do `payload`. A paridade S2, S3, S4, S8, S10 fica como está.

## 7. Segurança, reversão e lote

- **Fronteira de pessoa e texto livre:** não muda o que sai de pessoa nem de texto. Entra no SELECT só um inteiro (`kanbanStatusKey`, chave de etapa, sem pessoa), tipado `BIGINT` com `NULL ON ERROR` no MySQL e inteiro positivo no zod; não é gravado. A lista `etapa_fluxo` traz chave e nome de etapa, vocabulário que já está no domínio `etapa`. Mesmo assim a Q6 lê a coluna `json` que tem pessoa e texto livre na origem (listas §3), então **o gatilho do L9-b vale e a Q6 nova precisa de parecer do security-engineer** (pedido do próprio A1 do review); casos de abuso a cobrir: texto ou objeto em `kanbanStatusKey` não sai como texto; a lista de nomes no `IN` continua constante do código.
- **Critério de reversão:** se a carga da lista `etapa_fluxo` for trocada mais de uma vez por trimestre (contagem de entradas de `ref_versao_criterio` desse campo), passar a guardar `{kanban_status_key, valor}` no staging e decidir no normalizador (alternativa da seção 3). Se a consulta de apoio B der zero chamados com valores diferentes em competição, o mecanismo de posição pode ser retirado num PR próprio sem mudar resultado.
- **Lote (um, pequeno, na mesma branch `feature/069-l9c-projecao`):** node-backend: Q6 e texto versionado, zod, `carregarOrdemFluxo`, `camposEtapa`, `fluxo_sha256`, entrada de versão, docs (`acelerato-mysql.sql`, `acelerato-listas.md`, `data-model.md`) e os testes da seção 6; estimativa cerca de 60 linhas de código e 120 de teste, somadas às 268 do commit atual (o A2 do review já pede a linha `teto: excedido` recontada). Depois, em série: review, segurança, QA (QA só depois do review aprovado, decisão do Jarvis de 14:01). A carga da lista é das pessoas e do dono, fora do lote; o lote pode entrar com a lista vazia sem publicar valor escolhido por inferência.

## 8. Perguntas (vão no relatório; nada aqui está decidido)

- **P-L9C-1 (dono):** de onde vem a ordem do desenho do fluxo de atendimento? A (recomendada): as pessoas (WS4) e o dono escrevem a lista versionada `etapa_fluxo` (chave da etapa, nome, posição) de cada workflow em uso; B: usar a ordem da tabela "Etapas (11)" do briefing §3.4, por nome, e etapa fora dela não decide; C: o time de ciência de dados confirma que o array `estatisticas.workflow.etapas` está na ordem do desenho, e a Q2 passa a guardar a posição.
- **P-L9C-2 (dono):** quando os valores preenchidos diferentes de um campo incluem etapa sem posição na lista, ou empatam na mesma posição, o campo fica nulo com contagem (proposta, pelo princípio vigente)?
- **P-L9C-3 (fato de fonte, antes da carga da lista):** consultas só leitura de apoio, para quem tem acesso ao MySQL (só contagens; nenhum nome de pessoa, texto livre ou valor sai):
  - A, `kanbanStatusKey` é a mesma chave que `etapaKey`?
    ```sql
    SELECT COUNT(*) AS itens, SUM(f.k IS NULL) AS sem_chave,
           SUM(EXISTS (SELECT 1 FROM JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (ek BIGINT PATH '$.etapaKey')) e WHERE e.ek = f.k)) AS casa_etapa_key,
           SUM(f.k = c.status_key) AS igual_status_atual
    FROM ACELERATO_CHAMADOS c,
         JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (nome VARCHAR(255) PATH '$.nome', k BIGINT PATH '$.kanbanStatusKey')) f
    WHERE c.tipo_ticket_key = 23 AND c.organizacao_key = 3 AND c.equipe_key IN (7, 9, 332)
      AND f.nome IN ('Motivo da Escalação', 'Qual suporte foi acionado?', 'Motivo de Encerramento', 'Classifique o chamado no Tipo de Prioridade corretamente!', 'Motivo de Pendência', 'Avaliação de Problema', 'Prioridade ajustada manualmente?');
    ```
  - B, quantos chamados a ordem decide (dois ou mais valores preenchidos diferentes no mesmo campo):
    ```sql
    SELECT x.nome, COUNT(*) AS chamados
    FROM (SELECT c.ticket_key, f.nome
          FROM ACELERATO_CHAMADOS c,
               JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (nome VARCHAR(255) PATH '$.nome', valor VARCHAR(80) PATH '$.valor')) f
          WHERE c.tipo_ticket_key = 23 AND c.organizacao_key = 3 AND c.equipe_key IN (7, 9, 332)
            AND f.nome IN (<os 7 nomes da consulta A>)
          GROUP BY c.ticket_key, f.nome
          HAVING COUNT(DISTINCT NULLIF(TRIM(f.valor), '')) >= 2) x
    GROUP BY x.nome ORDER BY x.nome;
    ```
  - C, chamado com chaves de etapa de mais de um workflow (com a confirmação de A): contagem de chamados em que os `kanbanStatusKey` dos itens casam com etapas de mais de um `descricaoWorkflow` em `estatisticas.workflow.etapas`; maior que zero vira pergunta ao dono antes de comparar posições.

## 9. Registro do A3 do review (S9)

A S9 compara a saída de Pendente com a data prevista (`packages/metricas/src/acelerato/s9.ts:59`); pela D-L9-1 a data não é coletada, só "tem previsão" (booleano). Nada muda neste lote: `mapa.ts:159` continua entregando `null` à biblioteca e a S9 **segue no SDR só com o booleano**. A pergunta ao dono (o que a S9 mede sem a data prevista, ou se a data volta a ser coletada) é do plano da S9, que a tira do portão da ADR 0026; o Jarvis a registra no pedido.

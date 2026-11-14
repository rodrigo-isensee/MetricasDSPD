# 099: campos para configurar no BusinessMap e no Acelerato (roteiro para quem configura as ferramentas)

- **Para quem:** o dono repassa este roteiro à equipe que configura o BusinessMap (frente WS1, tarefa T1.3) e à equipe que parametriza o Acelerato (frente WS4, tarefas T4.1 e T4.2). As duas frentes são configuração feita por pessoas; o time de desenvolvimento não as executa.
- **Por quê:** onze cartões da aba Operacional só terão dado real quando estes campos existirem e forem preenchidos: **O8, O12, O14, O15, O16 e O24** (BusinessMap) e **S5, S6, S7, S9 e S11** (Acelerato). Origem: plano de dado real `docs/analises/099-dado-real-operacional.md` (grupos C e D, lotes C0 e D0) e decisão do dono de 2026-11-11 13:55 ("faca tudo que for preciso para tornar elas com dados reais").
- **De onde vêm os campos e os valores:** briefing de execução §3.4 (Acelerato), §4.4 (BusinessMap), T1.3 e T4.1; o PROC 30.000.010 v002 confirma os motivos de pendência (`docs/analises/099-proc-sla-incidentes.md` §2 e §5.1). Nenhum campo de pessoa nem texto livre novo foi acrescentado além do que o briefing já pede.
- **Base lida:** briefing (§3.4, §4.4, WS1, WS4, catálogo), os dois documentos 099 acima, e na `develop` (worktree demo, base `ae009a75`) as listas que o coletor aceita: `docs/architecture/fontes/acelerato-listas.md` §3 e §13, `docs/architecture/fontes/businessmap-dominio.json`, `packages/contratos/src/comum.ts`. **Não li a base real nem `.env` e não rodei nada.**
- **Estado:** proposta para o dono repassar. Nenhuma linha de código muda por este roteiro.

## 0. Regras que valem para todos os campos

1. **Lista fechada, escolha única.** Todo campo de valor é uma lista com os valores escritos abaixo, **exatamente com a mesma grafia** (acento, maiúscula e vírgula contam). A coleta compara o valor letra por letra; valor com grafia diferente é contado como "fora da lista" e não entra na métrica.
2. **Nada de texto livre para medir.** Onde o briefing pede uma justificativa em texto (só no Acelerato: "Se a prioridade foi ajustada, justifique" e a justificativa de "Avaliação de Problema"), o texto fica só na ferramenta. A coleta registra apenas se foi preenchido (sim ou não), nunca o conteúdo.
3. **Nenhum campo de pessoa.** Nenhum campo deste roteiro guarda nome, e-mail ou usuário. Não crie campo do tipo "usuário" ou "responsável" para estas métricas, e não use nome de pessoa como valor de lista.
4. **Obrigatório só na etapa indicada**, nunca na criação do card ou do chamado (briefing T1.3: "nenhum campo obrigatório sem métrica que dependa dele").
5. **Valor novo ou renomeado depois é mudança de critério.** Se depois for preciso trocar um valor da lista, avise o dono antes: a troca é registrada com data e marcada nos gráficos (T2.6).
6. **"Quem preenche" é um papel do processo, nunca uma pessoa**, e nenhum destes campos serve para avaliar quem preencheu.

## 1. BusinessMap (frente WS1, tarefa T1.3)

Crie cada campo como **campo personalizado de lista com escolha única** nos quadros dos times (onde estão as stories e os bugs), com o mesmo nome e os mesmos valores em todos os quadros.

| Ordem | Campo (nome sugerido no quadro) | Tipo | Valores permitidos (grafia exata) | Quando é preenchido | Quem preenche (papel) | Destrava |
|---|---|---|---|---|---|---|
| 1 | Classe de serviço (`classe_servico`) | Lista, escolha única | Urgente · Prazo fixo · Padrão · Intangível **(a confirmar pelo dono, ver nota A)** | Na entrada do card no quadro do time (a confirmar pelo dono, ver nota A) | Quem prioriza a demanda | **O24** Ordem de chegada (a regra só olha a classe Padrão). Também tira a nota "sem classe" do O6 e abre a divisão por classe no Tático (T1, T2, T6) |
| 2 | Fase de detecção (`fase_deteccao`) | Lista, escolha única | Desenvolvimento · Revisão de código · Teste interno · Homologação do negócio · Produção | Na abertura do bug | Quem registra o bug | **O15** Onde os bugs são encontrados |
| 3 | Severidade (`severidade`) | Lista, escolha única | Crítica · Alta · Média · Baixa | Na abertura do bug | Quem registra o bug | **O16** Estoque e idade de bugs (a parte "abertos por severidade"; entrada × correção e idade já têm dado) |
| 4 | Tamanho declarado (`tamanho_declarado`) | Lista, escolha única | P · M · G | No refinamento | O time, no refinamento | **O8** Tamanho das demandas (a comparação com o tamanho declarado; o tempo em execução já é real) |
| 5 | Área solicitante (`area_solicitante`) | Lista, escolha única | Lista fechada das áreas que pedem trabalho ao DSPD: **as pessoas da WS1 escrevem a lista e o dono aprova** (o briefing não traz os valores) | Na abertura do card | Quem abre o card | **O14** Origem da demanda (ranking por área) |
| 6 | Sistema afetado (`sistema`; no briefing, `sistema_afetado`) | Lista, escolha única | Lista fechada dos sistemas atendidos: **as pessoas da WS1 escrevem a lista e o dono aprova** (o briefing não traz os valores) | Na abertura do card | Quem abre o card | **O14** Origem da demanda (ranking por sistema) |
| 7 | Data acordada (`data_acordada`) | **Data** | — (uma data) | No compromisso (entrada na coluna de priorizado ou comprometido) | Quem faz o compromisso com o solicitante | **O12** Acordos e vencidos, junto com o campo 8. **Depende ainda da pergunta Q-099-10** (ver nota B) |
| 8 | Responsabilidade do atraso (`responsabilidade_atraso`) | Lista, escolha única | Interno · Solicitante · Terceiro | No vencimento da data acordada, **nunca depois** | Quem acompanha o compromisso | **O12** Acordos e vencidos (a separação por responsabilidade) |

Notas do BusinessMap:

- **A. Classe de serviço.** O briefing usa a classe de serviço (modelo de dados §4.5, SLE por classe na T6.2), mas não a lista entre os 12 campos da §4.4 nem diz os valores ou o momento de preenchimento. Os quatro valores acima são os que o sistema já usa hoje para dividir por classe. **Antes de criar o campo, o dono confirma os valores e o momento** (dúvida de regra não se resolve por inferência). Se o quadro já tiver classe de serviço por outro meio (raia, cor ou tipo), avise o dono em vez de criar um campo duplicado.
- **B. Data acordada.** Está na pergunta Q-099-10 do plano: (A) este campo, preenchido no compromisso; (B) o prazo nativo do card ("deadline"), que a coleta já traz. A recomendação é A. Se o dono escolher B, **este campo não precisa ser criado**. Mesmo com A, o O12 precisa de um ajuste do time para ler campo de data (lote C2), porque hoje a coleta só lê campos de lista.
- **C. Origem da demanda (`origem_demanda`)** não é necessária para o O14 (o cartão ranqueia por área e por sistema). Ela é da §4.4 e destrava o T5 (Demanda de falha, aba Tático). Se a WS1 for criar todos os 12 campos da T1.3 de uma vez, os valores são: Erro em entrega anterior · Configuração incorreta · Falta de treinamento do usuário · Informação não repassada · Processo manual que deveria estar automatizado; preenchida na triagem.
- **D. Origem do bug (`origem_bug`)** só entra se o dono responder "B" à pergunta Q-099-6 (vínculo do bug com a entrega, cartão O18, que não está nesta lista). A recomendação é usar o vínculo nativo do BusinessMap, que já é coletado: nesse caso, nada a criar.
- **E. O que entregar ao dono depois de criar** (sem dado de card): o nome de cada campo, o número do campo no BusinessMap, o tipo como a ferramenta o mostra e a lista de valores exatamente como ficou. O time usa isso para liberar a leitura do campo (lote C1); sem esse passo o campo existe no quadro mas não chega à base. Os campos 36 (ID Acelerato) e 42 (Responsável CR) nunca entram.
- **F. Teste antes de liberar (critério da T1.3):** um card de cada tipo com a obrigatoriedade testada na etapa indicada.

## 2. Acelerato (frente WS4, tarefa T4.1)

Crie cada campo como **campo de etapa** (preenchido numa etapa do fluxo), no workflow de cada equipe (SSSC TOTVS, SSSC SENIOR, SSSC FLUIG), com o **nome exatamente como na tabela** (a coleta procura o campo pelo nome, letra por letra).

| Ordem | Campo (nome exato na ferramenta) | Tipo | Valores permitidos (grafia exata) | Quando é preenchido | Quem preenche (papel, briefing §3.4) | Destrava |
|---|---|---|---|---|---|---|
| 1 | **Ordem das etapas do fluxo** (não é campo: é uma lista escrita) | Lista escrita pelas pessoas da WS4 e aprovada pelo dono | Cada etapa do desenho do fluxo, na ordem em que vem no atendimento, com o número da etapa na ferramenta | Uma vez, e de novo quando o desenho do fluxo mudar | Quem parametriza o Acelerato (WS4) e o dono | **S5, S6, S7, S9 e S11**: quando o mesmo campo aparece em mais de uma etapa com valores diferentes, vale o da etapa que vem por último no desenho; sem esta lista, o campo fica vazio (decisão do dono de 2026-11-05) |
| 2 | Motivo de Encerramento | Lista, escolha única | Resolução definitiva · Contorno aplicado · Reclassificado, não é incidente · Encerrado sem retorno · Duplicado | No encerramento | Responsável pelo chamado | **S6** Motivos de encerramento; **S7** (encerramentos "não é incidente"); **S11** (encerrados por contorno) |
| 3 | Motivo da Escalação | Lista, escolha única | Sem conhecimento técnico no N1 · Sem solução ou contorno conhecido · Risco de estouro de SLA · Múltiplos sistemas ou dependências · Necessidade de atuação especializada | Na saída de "Em diagnóstico" (escalação) | N1, quem escala | **S5** Motivos da escalação |
| 4 | Prioridade ajustada manualmente? | Sim/Não | Sim · Não (a forma exata que a ferramenta grava é conferida pelo dono) | Na reclassificação | Quem reclassifica | **S7** Reclassificação (ajustes manuais) |
| 4a | Se a prioridade foi ajustada, justifique | Texto (o briefing pede) | — | Obrigatório quando a resposta acima for Sim | Quem reclassifica | **S7** (só "justificou ou não"; o texto nunca sai da ferramenta) |
| 5 | Classifique o chamado no Tipo de Prioridade corretamente! | Lista, escolha única (campo que já existe) | Os valores atuais da ferramenta: **o dono confere a lista** (consulta B do §4.2) | Na reclassificação | Quem reclassifica | **S7** (divisão por tipo de reclassificação) |
| 6 | Avaliação de Problema | Lista + texto | Aberto · Não aplicável (com justificativa em texto, que fica só na ferramenta) | No encerramento | Responsável pelo chamado | **S11** Avaliação de Problema (% de P1, P2 e contornos com avaliação). A taxa de conversão em Registro de Problema continua sem fonte (decisão D-15 do pedido 056) |
| 7 | Motivo de Pendência | Lista, escolha única | Aguardando fornecedor · Aguardando solicitante · Aguardando área vinculada · Aguardando janela de mudança | Na entrada na etapa "Pendente" | Responsável pelo chamado | **S9** Tempo em pendência. **Depende também da etapa "Pendente" em produção e da pergunta Q-099-8** (ver nota H) |
| 7a | Previsão de retorno | Data | — | Na entrada em "Pendente" | Responsável pelo chamado | Nenhuma parte nova: a base guarda só se há previsão, e o cumprimento da previsão fica sem dado real (decisão D-14 do pedido 056). Criar porque o briefing pede e por causa do alerta da T4.3 |

Notas do Acelerato:

- **G. A ordem das etapas vem primeiro** porque sem ela os cinco cartões ficam vazios mesmo com os campos preenchidos, sempre que o campo aparece em mais de uma etapa. Se o fluxo for diferente entre as equipes, uma lista por desenho de fluxo (T4.1: "replicar a configuração de workflow para cada equipe com fluxo distinto").
- **H. "Pendente" e as esperas de hoje.** Enquanto a etapa "Pendente" não estiver em produção, as esperas reais são "Aguardando Solicitante", "Aguardando Suporte Terceiros" e "Aguardando Equipe Interna". O dono responde a Q-099-8 e diz, numa linha, para que a equipe usa hoje "Aguardando Equipe Interna" (esperar outra equipe = "área vinculada", que pausa; esperar a própria equipe = não é pendência). Para quem configura: ao migrar as etapas antigas para "Pendente", registre qual etapa antiga virou qual motivo.
- **I. Nível de resolução (S4, apoio do S5):** vem das etapas "Em atendimento N1/N2/N3" e da escalação ao fornecedor; não é campo novo. Hoje 70% dos fechados não têm o nível; conferir que as etapas N2, N3 e fornecedor estão no fluxo de cada equipe (T4.1).
- **J. Fora desta lista, mas do mesmo pacote WS4** (não destravam nenhum dos 11 cartões): Impacto, Urgência, "Exceção de SLA por registro posterior" (S1, S2, S12) e "Incidente crítico coordenado". Seguem o briefing §3.4.
- **K. Teste antes de liberar (critério da T4.1 e T4.2):** um chamado de teste percorre pendência, escalação, validação negada com retomada (Aguardando validação → Em diagnóstico) e encerramento, com os campos obrigatórios nas etapas certas.

## 3. Ordem sugerida (o que destrava mais primeiro)

1. **Acelerato, ordem das etapas do fluxo** (§2, linha 1): sozinha, é condição dos 5 cartões de sustentação.
2. **Acelerato, Motivo de Encerramento**: 3 cartões (S6, S7, S11).
3. **BusinessMap, Classe de serviço**, depois da confirmação do dono (nota A): O24 e, fora desta lista, O6, T1, T2 e T6.
4. **BusinessMap, Fase de detecção, Severidade e Tamanho declarado**: um campo destrava um cartão inteiro (O15, O16, O8); os três podem ser criados juntos.
5. **Acelerato, Motivo da Escalação; Prioridade ajustada manualmente? com a justificativa; Tipo de Prioridade; Avaliação de Problema**: completam S5, S7 e S11.
6. **BusinessMap, Área solicitante e Sistema afetado**: o O14 precisa dos dois e das duas listas escritas pelas pessoas e aprovadas pelo dono, que levam mais tempo.
7. **Acelerato, Motivo de Pendência e Previsão de retorno**: dependem da etapa "Pendente" em produção e da Q-099-8.
8. **BusinessMap, Data acordada e Responsabilidade do atraso**: dependem da Q-099-10 e do ajuste do time para campo de data.

As duas ferramentas andam em paralelo (equipes diferentes). O time só libera a leitura de cada campo depois que ele existir (ordem obrigatória do CLAUDE.md: configuração, depois coleta, depois painel).

## 4. Como o time confere que o campo chegou à coleta

Sem ler a base real: **quem roda é o dono**, no terminal dele, com a conta só de leitura que ele já usa (PostgreSQL das consultas do pedido 064; MySQL do Acelerato da ADR 0023). Todas as consultas devolvem **só nomes de campo e contagens**, nunca linha de card ou chamado, nome de pessoa nem texto. O dono cola só os números no pedido 099. Antes de o dono rodar, o node-backend confere os nomes marcados com (\*).

O caminho de cada campo tem três passos; a consulta diz em qual ele está:

| Passo | O que significa | Como se vê |
|---|---|---|
| 1. Existe na ferramenta | A equipe criou e testou (nota F ou K) | Teste na ferramenta; no Acelerato, a consulta A do §4.2 |
| 2. A coleta conhece o campo | O time carregou o número do campo e a lista de valores (lotes C1 e D1) e a coleta seguinte rodou | Consulta 4.1-a e 4.2-C |
| 3. O campo está preenchido na base | Os cards e chamados novos têm valor e quase nada "fora da lista" | Consultas 4.1-b, 4.1-c e 4.2-D |

### 4.1 BusinessMap (PostgreSQL, só leitura)

```sql
-- 4.1-a: a coleta conhece os campos? (uma linha por campo carregado; vazio = passo 2 ainda não feito)
SELECT rotulo AS coluna, COUNT(*) AS campos
  FROM dspd_bm.ref_dominio
 WHERE campo = 'campo_customizado' AND vigente_ate IS NULL
 GROUP BY rotulo;

-- 4.1-b: preenchimento nas stories criadas desde a data em que o campo foi criado
-- (troque a data; contagens só)
SELECT COUNT(*) AS stories,
       COUNT(classe_servico) AS classe, COUNT(fase_deteccao) AS fase_deteccao,
       COUNT(severidade) AS severidade, COUNT(tamanho_declarado) AS tamanho,
       COUNT(area_solicitante) AS area, COUNT(sistema) AS sistema,
       COUNT(data_acordada) AS data_acordada, COUNT(responsabilidade_atraso) AS responsabilidade
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL AND criado_em >= DATE '2026-12-01';

-- 4.1-c: valores que chegaram com grafia fora da lista (devem ser zero ou quase)
SELECT COUNT(*) FILTER (WHERE classe_servico = 'desconhecido') AS classe,
       COUNT(*) FILTER (WHERE fase_deteccao = 'desconhecido') AS fase_deteccao,
       COUNT(*) FILTER (WHERE severidade = 'desconhecido') AS severidade,
       COUNT(*) FILTER (WHERE tamanho_declarado = 'desconhecido') AS tamanho,
       COUNT(*) FILTER (WHERE area_solicitante = 'desconhecido') AS area,
       COUNT(*) FILTER (WHERE sistema = 'desconhecido') AS sistema,
       COUNT(*) FILTER (WHERE responsabilidade_atraso = 'desconhecido') AS responsabilidade
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL;
```

Severidade e fase de detecção valem para os bugs: no 4.1-b, o número a olhar é o de bugs criados no período, não o total de stories. O 4.1-b com `criado_em` (\*) é a mesma consulta Q-RO-6 do plano, só limitada ao período novo.

### 4.2 Acelerato

No MySQL do Acelerato (conta só leitura, ADR 0023), **antes** de o time carregar as listas:

```sql
-- 4.2-A: os campos existem e com que tipo? quantos chamados os preenchem? (nomes e contagens; o valor nunca é mostrado)
SELECT f.nome, f.tipo, COUNT(*) AS ocorrencias,
       SUM(f.valor IS NOT NULL AND f.valor <> '') AS preenchidos
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome  VARCHAR(255) PATH '$.nome',
         tipo  VARCHAR(60)  PATH '$.tipo',
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
   AND f.nome IN ('Motivo da Escalação', 'Motivo de Encerramento', 'Prioridade ajustada manualmente?',
                  'Se a prioridade foi ajustada, justifique',
                  'Classifique o chamado no Tipo de Prioridade corretamente!', 'Motivo de Pendência',
                  'Previsão de retorno', 'Avaliação de Problema')
 GROUP BY f.nome, f.tipo;

-- 4.2-B: valores das listas (só para os campos que a 4.2-A mostrou como LISTA; nunca para
-- 'Se a prioridade foi ajustada, justifique' nem 'Previsão de retorno').
-- Serve para o dono conferir a grafia contra a tabela do §2 e entregar a lista ao time (lote D1).
-- Se algum valor tiver nome de pessoa, ele fica fora da lista e o dono avisa.
SELECT f.nome, f.valor, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome  VARCHAR(255) PATH '$.nome',
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
   AND f.nome IN ('Motivo da Escalação', 'Motivo de Encerramento', 'Prioridade ajustada manualmente?',
                  'Classifique o chamado no Tipo de Prioridade corretamente!', 'Motivo de Pendência',
                  'Avaliação de Problema')
 GROUP BY f.nome, f.valor
 ORDER BY f.nome, n DESC;
```

Se o campo vier com `tipo` de texto na 4.2-A (em vez de lista), **não rode a 4.2-B para ele**: o campo foi criado com o tipo errado e volta à equipe da WS4. Para a ordem das etapas, o dono tem a consulta de apoio do pedido 069 (`pnpm --filter @metricas-dspd/server ac:apoio-l9c`, só números), que diz quantos chamados a ordem decide por campo.

No PostgreSQL, **depois** de o time carregar as listas e de uma coleta rodar:

```sql
-- 4.2-C: listas carregadas (cada domínio cpe_* e a ordem das etapas, etapa_fluxo); zero = passo 2 não feito
SELECT campo, COUNT(*) AS valores
  FROM dspd_ac.ref_dominio
 WHERE vigente_ate IS NULL AND (campo LIKE 'cpe_%' OR campo = 'etapa_fluxo')
 GROUP BY campo;

-- 4.2-D: preenchimento nos chamados abertos desde a data em que o campo entrou (troque a data)
SELECT COUNT(*) AS chamados,
       COUNT(motivo_escalacao) AS motivo_escalacao, COUNT(motivo_encerramento) AS motivo_encerramento,
       COUNT(*) FILTER (WHERE prioridade_ajustada_manualmente) AS ajuste_prioridade,
       COUNT(avaliacao_problema) AS avaliacao_problema, COUNT(motivo_pendencia_atual) AS motivo_pendencia
  FROM dspd_ac.dim_chamado
 WHERE fora_do_recorte = false AND aberto_em >= DATE '2026-12-01';

-- 4.2-E (*): na última coleta, quantos valores ficaram fora da lista ou sem posição no fluxo
-- (só o nome da contagem e o número; o valor nunca é gravado)
SELECT n.entidade, n.lidos, n.falhas
  FROM dspd_ac.ctl_coleta_contagem n
 WHERE n.coleta_id = (SELECT MAX(coleta_id) FROM dspd_ac.ctl_coleta WHERE status = 'sucesso')
   AND (n.entidade LIKE 'fora_dominio%' OR n.entidade LIKE 'etapa_fora_do_fluxo%' OR n.entidade LIKE 'empate_fluxo%');
```

**Quando o cartão sai de "Sem dado real":** só depois de o passo 3 mostrar o campo preenchido e de o lote de código do cartão passar (lotes C3 a C8 e D2, D5, D6 do plano). Mesmo com o campo preenchido, abaixo de 20 itens na janela de 12 semanas o cartão mostra "insuficiente", nunca um número (regra do briefing §4.2). Os campos só valem dali para a frente: cards e chamados antigos sem o campo continuam sem ele, e nada do histórico é sobrescrito.

## 5. O que ainda depende do dono (já está no plano 099, sem pergunta nova)

| Item | Afeta | Onde |
|---|---|---|
| Valores e momento da classe de serviço | O24 | nota A (confirmação) |
| Listas de área solicitante e de sistema | O14 | §1, linhas 5 e 6 (as pessoas escrevem, o dono aprova) |
| Q-099-10 (data acordada ou prazo nativo) | O12 | nota B |
| Q-099-8 revista (o que é pendência hoje; uso de "Aguardando Equipe Interna") | S9 | nota H |
| Q-099-4 (publicar a parte real e marcar a parte sem fonte) | O8, O16 | plano §6 |
| Ordem das etapas do fluxo | S5, S6, S7, S9, S11 | §2, linha 1 (as pessoas escrevem, o dono aprova) |

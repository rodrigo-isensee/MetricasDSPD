# 097: viabilidade e dados dos filtros (E1 a E4)

- **Propósito:** viabilidade técnica, origem dos dados, impacto no contrato e divisão em lotes do pedido 097 (E1.2), em paralelo à especificação de UX `docs/ux/097-filtros-time-busca.md`.
- **Público:** dono, Jarvis, tech-lead, node-backend, react-frontend, qa-engineer, security-engineer, ux-designer.
- **Base lida:** `develop` em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo` (base-sha `ae009a75`). Nada foi lido da base real nem de `.env`; onde falta dado, há consulta só de leitura para o dono rodar (§7).
- **Estado:** proposta (sem validação do dono no protótipo ainda). Nenhuma linha de código muda por esta análise.

## 0. Conferência com as regras invioláveis
| Regra (CLAUDE.md) | Como o desenho cumpre |
|---|---|
| Sem avaliação individual nem comparação entre times | Time é só **recorte** (filtro); nenhuma resposta ganha bloco, série, matriz ou ordenação **por time**. `NIVEIS_MATRIZ` do apontamento não ganha o nível `time`. Vários times = um conjunto consolidado (aviso existente). |
| BusinessMap e Acelerato nunca se misturam | Cada bloco do Resumo filtra com a lista da sua fonte (`opcoes/businessmap` e `opcoes/acelerato`); ids de um nunca valem no outro (schemas de consulta separados, já hoje). |
| Abaixo de 20 itens, não publicar | Filtro menor só reduz `n`; a regra de 20 já está na biblioteca (`estatisticaSchema`) e vale igual. |
| Cálculo só na biblioteca (T2.5) | O filtro de time do apontamento entra em `filtrar()` da biblioteca (`packages/metricas/src/businessmap/apontamento/filtros.ts:42`), não no servidor. As tendências recebem o filtro pela própria função da biblioteca. |
| Dúvida de regra vira pergunta | §8 traz as perguntas, cada uma com recomendação. |
| Coluna de pessoa fora da API | Nenhuma coluna de pessoa nova; o único GRANT novo é `dim_card.equipe` (não é de pessoa) para o papel da aba. |

## 1. (a) Como o apontamento sabe o time de cada registro

### O que existe
- `fato_apontamento` guarda `card_id` e `parent_card_id` (`server/src/modulos/apontamento/repositorio.ts:31-41`); nenhuma coluna de time.
- `dim_card.equipe` já é o **time do card**, resolvido pelo projetor: workflow do card → `ref_time_workflow` (situação `time`) → `ref_time.nome`, no instante do evento medido (H-1, `server/src/modulos/businessmap/normalizador.ts:196-204`). Só cards de nível **story** têm equipe; frente e projeto (workflow de iniciativa) ficam com `equipe` nula, e workflow `fora` (H-7) também.
- É a mesma coluna que os painéis do fluxo já filtram (`m.slugEquipe`, `packages/metricas/src/businessmap/comum.ts:68`) e cuja lista vem de `ref_time` ativo (`server/src/modulos/referencia/repositorio.ts:15-19`, id = `slug(nome)`).
- O papel da aba, `dspd_api_apontamento`, lê de `dim_card` só `card_id, titulo, tipo` (`server/src/plataforma/db/grants.ts:17`).

### Alternativas
| Via | Como | Veredito |
|---|---|---|
| **A. Pelo card do lançamento** (recomendada) | `COALESCE(c.equipe, p.equipe)` no `lerLinhas`, o mesmo padrão já usado para o `tipo` (card, senão o pai). Lançamento sem time (card de frente/projeto, card fora do escopo, card ainda não projetado) vira a opção "Sem time" (como "Sem iniciativa" e "Sem tipo" já fazem). | Viável. Falta só o GRANT de `dim_card.equipe` ao papel da aba. Nenhuma migração de dado. |
| B. Pelo card, na versão vigente na data do lançamento | `dim_card_versao` com `vigente_de <= data_apontamento` | Mais fiel quando o card troca de workflow, mas dá ao papel da aba acesso a `*_versao` (hoje fora da API por desenho) e custa um JOIN por intervalo. Rejeitada agora; vira critério de reversão (§1, risco R1). |
| C. Pelo workflow da coluna do lançamento | `fato_apontamento.column_id` existe só no staging/fato do coletor, não no GRANT da aba, e a coluna do lançamento não diz em que workflow o card estava | Rejeitada: mais dado, mesma resposta que A. |
| D. Pela pessoa (time de quem apontou) | ligar `pessoa_ref` a time | **Rejeitada:** cria atribuição de pessoa a time (dado novo de pessoa, LGPD) e não existe na base; `apt_pessoa_time` é "do DSPD ou outra área", não time (`server/migrations/0033_bm_apt_pessoa_time.ts:17-25`). |

### Consequência para a capacidade por pessoa (decisão do dono: "capacidade fica igual")
- Com a via A, o filtro de time age como o filtro de projeto já age hoje: restringe as **linhas** antes do cálculo; o cartão de capacidade por pessoa continua o mesmo cartão e mostra quem tem horas em cards daquele time, com as horas desses cards. Pessoa que trabalha em dois times aparece nos dois recortes, cada um com a sua parte; ninguém é "atribuído" a um time. Isso responde a Q-4 do UX pelo lado do dado (a regra fica para o dono em P-097-A, §8).
- Atenção ao texto do CA-8 do UX ("restringir a lista às pessoas daquele time"): a regra real é "pessoas com horas em cards daquele time". O UX ajusta a frase; não muda o desenho.
- O dia atípico (`diasAtipicos`) continua calculado sobre todas as linhas do dia da pessoa, **antes** do filtro (`filtros.ts:12-18`): o filtro de time não muda o que é atípico.
- `lerCardsIncompletos` (`repositorio.ts:147`) recebe o mesmo filtro (hoje recebe projeto e tipo), para o bloco "registro incompleto" seguir o recorte.

### O que falta (back-end)
1. GRANT `dim_card.equipe` em `COLUNAS_API_APONTAMENTO` (`grants.ts:17`). Gatilho de segurança (banco/permissão).
2. `lerLinhas`: `COALESCE(c.equipe, p.equipe) AS equipe`; `LinhaApontamento` da biblioteca ganha `equipe: DimApontamento` (id `slug(nome)` ou `sem-time`).
3. Consulta: parâmetro novo opcional **`equipe`** (lista de slugs, mesmo formato do fluxo, `server/src/modulos/metricas/schemas.ts:10`). Uso `equipe`, e não `time`, porque no módulo do apontamento "time" já significa "pessoas do DSPD" (`MESES_DO_TIME`, `lerPessoasDoTime`, `servico.ts:30-31`); o mesmo nome evitaria um erro de leitura do código.
4. Resposta: `opcoes.equipes` opcional (lista do recorte, como `projetos` e `tipos` já são, `servico.ts:153-159`).
5. Nada vira agregado por time: nenhum bloco novo na resposta; teste de forma garante (estender `server/tests/times-sem-comparacao.test.ts`).

## 2. (b) De onde vêm o Tipo real e os times reais

### Tipo do Operacional (BusinessMap)
- Hoje a lista de opções é fixa duas vezes: no servidor (`TIPOS_FILTRO`, `server/src/modulos/referencia/servico.ts:26`) e **também no front**, que ignora `opcoes.tipos` da API e monta as opções de `TIPOS_FILTRO` (`web/src/features/filtros/BarraFiltros.tsx:27`; também `codec.ts:109`, `:254` e `features/complementares/taticas.tsx:272`). Mudar só o servidor não muda a tela.
- O dado real: `dim_card.tipo` guarda o **rótulo da categoria** (ADR 0024: tabela fechada `TIPO_DA_CATEGORIA`, 6 rótulos). "Incidente" está em `TIPOS_FILTRO` mas nenhum tipo real do BusinessMap cai nele (ADR 0024, decisão 2): é a opção "simulada" que o dono viu.
- O nome do tipo no BusinessMap existe em `ref_tipo_card.nome` (migração 0018), mas `dim_card` não guarda `type_id`; só o apontamento guarda (`fato_apontamento.type_id`).

| Opção | O que o filtro mostra | Custo | Contrato |
|---|---|---|---|
| **T-A. Categorias presentes** (recomendada) | `SELECT DISTINCT tipo FROM dim_card WHERE granularidade = 'story'` (o filtro de tipo só vale para story, `comum.ts:70`), mapeado para os ids estáveis de `TIPO_ID`. Some "Incidente"; some categoria sem card. | Pequeno: 1 consulta + o front passar a usar `opcoes.tipos`. | Sem mudança: a entrada continua o enum `TIPOS_FILTRO` (as opções são subconjunto); a resposta de `opcoes` não muda de forma. Compatível. |
| T-B. Tipos nativos do BusinessMap | nomes de `ref_tipo_card` com `eh_item` | Grande: coluna nova `dim_card.tipo_id` (migração + reprojeção, que grava versão nova em `dim_card_versao` por card), filtro por `type_id`, biblioteca filtrando por id e não por rótulo. | Incompatível na entrada (`tipo` deixa de ser enum de rótulo): `/api/v2` ou aceite (política §2). Muda o que "tipo" significa nas métricas (O7, O13 segmentam pela categoria). |

Recomendação: T-A. "Tipo" nos painéis é a taxonomia do briefing §4.3 (H-17), e o filtro precisa bater com a segmentação dos cartões. T-B é outra regra de negócio (P-097-B, §8).

Nota: no Apontamento o filtro de tipo usa `type_id` com o rótulo da categoria (`servico.ts:59`). Dois tipos nativos da mesma categoria aparecem como **duas opções com o mesmo rótulo** (ex.: duas "Melhoria"). Com a busca de E3 isso fica mais visível. Correção barata no mesmo lote do E2: agrupar por rótulo na lista de opções (id = lista dos `type_id` do rótulo) ou mostrar o nome nativo; decisão de UX, registrada como risco R5.

### Sistema (BusinessMap)
Já é dado real: domínio `sistema` vigente de `ref_dominio` (`referencia/repositorio.ts:23-28`). Nada a mudar além da busca (E3).

### Times da Sustentação (Acelerato)
- Hoje fixos em 5 lugares: `EQUIPES_SUSTENTACAO` (`packages/contratos/src/comum.ts:85`), `EQUIPES_SUSTENTACAO_ID` e `NOME_EQUIPE_SUSTENTACAO` (`packages/contratos/src/filtros.ts:12-19`), o enum de entrada (`filtros.ts:49` e `server/src/modulos/metricas/schemas.ts:60`), o tipo `Chamado['equipe']` e `SLUG_EQUIPE` na biblioteca (`packages/metricas/src/acelerato/modelo.ts:39`, `indice.ts:14-18`), e a validação do front (`web/src/features/filtros/codec.ts:249`).
- Dado real: `dim_chamado.equipe` (texto, da allow-list do coletor) com `fora_do_recorte = false` (o mesmo corte de `lerChamados`, `metricas/repositorio.ts:113`). O recorte vigente vem de `ref_dominio` campo `equipe` (`server/src/modulos/acelerato/referencia.ts:29`).
- Proposta: opções = `SELECT DISTINCT equipe FROM dspd_ac.dim_chamado WHERE fora_do_recorte = false AND equipe IS NOT NULL`, id = `slug(nome)` (o mesmo de BusinessMap). Biblioteca: `equipeId = slug(c.equipe)`, `equipe: string`. Entrada: `equipe` passa de enum a slug (`idSlug`).
- Ids mudam (`totvs` → `sssc-totvs`). Links e filtros guardados antigos: o front aceita os três ids antigos como apelido por um ciclo de release (tabela de 3 linhas no `codec.ts`) e cai no aviso existente de valor inválido depois. Sem apelido, o aviso já cobre; o apelido só evita que o dono veja o aviso logo após a release.

### Prioridade (Acelerato)
`PRIORIDADES` (P1 a P5) é o vocabulário do briefing; o enum de entrada fica. As opções passam a ser só as prioridades presentes em `dim_chamado` (subconjunto, compatível), para cumprir "tudo real" sem tocar no contrato.

### Classificação pela política de mudança (`docs/contratos/politica-de-mudanca.md` §2)
| Mudança | Classe | Ação |
|---|---|---|
| `opcoes.tipos`, `opcoes.prioridades` do dado (mesma forma) | sem mudança de contrato | PR normal |
| `equipe` da sustentação: enum → slug, na **entrada** (`filtrosSustentacaoSchema`, `querySustentacaoSchema`) | o §2 diz "valor novo de enum na entrada: compatível", mas o classificador do gate trata troca de `enum` por `pattern` como incompatível (ratificação do §2) | Se o gate acusar: aceite de uso único em `aceitas.json`, aprovado por arquiteto + tech-lead (§5), motivo "entrada mais ampla; todo valor antigo segue válido". Sem `/api/v2`: nenhum valor aceito antes é recusado depois. As fotografias de resultado não têm equipe de sustentação (conferido: nenhuma cita `SSSC`). |
| Tipo `EquipeSustentacao` e `EquipeSustentacaoId` saem do contrato (TS) | interno ao monorepo (web e server no mesmo deploy) | PR normal; o mock (`web/src/data/mock/nucleoMock.ts:228`) continua gerando as 3 SSSC como dado de exemplo |
| Tendências aceitam `equipe` (§3) | parâmetro de entrada novo opcional: compatível | PR normal; `openapi.json` atualizado |
| Apontamento: `equipe` na consulta e `opcoes.equipes` na resposta | parâmetro novo opcional + campo opcional novo: compatíveis | PR normal |
| Apontamento: tirar `pessoa` da consulta | endurecer a entrada: **incompatível** | Recomendação: **não tirar agora**. O front deixa de enviar; a API v1 segue aceitando (não expõe nada além do cartão por pessoa que já existe na resposta). Remoção vira cartão para a próxima versão do contrato da aba. |
| T-B (se o dono escolher) | incompatível | `/api/v2` ou aceite; ADR nova revendo a 0024 |

## 3. (c) O Resumo já recebe filtro na API?
- **Cartões do Resumo: sim.** O bloco do fluxo chama O3, O4, O2, O12, BLOQUEADOS, O1 e O10 com `FiltrosFluxo` (`web/src/features/operacional/resumo/BlocoFluxo.tsx:26-33`), e o da sustentação chama S2, S1 e S3 com `FiltrosSustentacao` (`BlocoSustentacao.tsx:22-24`). Os dois tipos já têm `equipe`; o Resumo só passa a constante vazia (`resumo/consultas.ts:9-19`). Para estes, E1 é **só front**.
- **Tendências: não.** `TENDENCIA_FLUXO` e `TENDENCIA_SUST` aceitam só `dataReferencia` (`packages/contratos/src/metricas.ts:157-160`; `queryTendenciaSchema` estrito, `server/src/modulos/metricas/schemas.ts:76`), e a biblioteca usa o filtro padrão fixo (`packages/metricas/src/acelerato/tendencia.ts:17`). Para o CA-3 do UX ("números **e a tendência** do bloco"), as duas tendências ganham `equipe` opcional: contrato (`FiltrosDe<'TENDENCIA_*'>`), schema de consulta, as duas funções da biblioteca e o comentário de `METRICAS_TENDENCIA` ("sem filtros de recorte"). Resultado com a mesma forma (fotografia não muda).
- Alternativa: tendência sempre sem filtro, com a nota "tendência de todos os times". Mais barata, mas o bloco mostraria dois recortes ao mesmo tempo e o CA-3 cairia. Não recomendada.
- Estado do filtro: chave própria por bloco na URL (`fluxoEquipe`, `sustEquipe`, nomes a fechar no front), sem compartilhar com os filtros guardados das outras visões (a `LinhaFiltrosGuardados` do Resumo continua só avisando). Com filtro, o cache deixa de ser o mesmo da Diária e da Semanal (`consultas.ts:5-8`); sem filtro, continua.
- Desempenho (ADR 0003): o filtro só reduz a amostra; o custo da tendência por requisição é o mesmo de hoje. O QA mede a tendência com e sem filtro no portão de desempenho existente.

## 4. Busca nos filtros (E3)
Só front, sem endpoint: a busca filtra a lista já carregada no `FiltroMulti` (`web/src/features/filtros`). A maior lista hoje é a de projetos do apontamento (até 200 ids aceitos na consulta, `packages/contratos/src/apontamento.ts:140`); centenas de itens filtram no navegador sem custo relevante. Busca no servidor só se uma lista passar de 1.000 opções (critério de reversão, §9).

## 5. Opção sem item no período (Q-5 do UX)
- Apontamento: as opções já são do recorte do período (`servico.ts:155-158`); fica como está.
- Painéis do fluxo e da sustentação: a rota de opções é por fonte, sem período (`GET /api/v1/opcoes/:dominio`). Recomendação técnica: opções de **toda a base** (o que tem dado em qualquer data), não do período. Motivo: com opções por período, trocar o período apagaria da lista um time já marcado e geraria "valor inválido" a cada troca. Diverge da recomendação do UX (Q-5: "não listar"); vai ao dono como P-097-C (§8).

## 6. (d) Lotes (até 150 linhas cada), ordem e dependências

| Lote | Agente | Escopo | Depende de | Gatilho de segurança |
|---|---|---|---|---|
| L1 · E3 busca | react-frontend | `FiltroMulti` com campo Buscar, teclado, contagem `aria-live`, folha mobile (CA-10 a CA-16) | protótipo validado | não |
| L2 · E2 back | node-backend | GRANT `dim_card.equipe` ao papel da aba; `lerLinhas` e `lerCardsIncompletos` com equipe; biblioteca: `equipe` em `LinhaApontamento` e em `filtrar()`; contrato: `equipe` na consulta, `opcoes.equipes` opcional; testes de forma "sem bloco por time" | — | **sim**: banco (permissão por coluna, consulta com entrada); LGPD (recorte de pessoas por time, R3) |
| L3 · E2 front | react-frontend | `BarraFiltrosApontamento`: sai Pessoa, entra Time; `pessoa=` na URL vira valor inválido ignorado (CA-9); linha de nomes ocultos e nota de outra área conforme Q-3 do UX | L2 (contrato) | não |
| L4 · E1 back | node-backend | `equipe` opcional nas duas tendências (contrato, `queryTendenciaSchema`, biblioteca fluxo e sustentação) | — | não (entrada nova validada pelo mesmo `idSlug`) |
| L5 · E1 front | react-frontend | filtro Time dentro de cada bloco do Resumo, estado na URL por bloco, aviso consolidado, estados de carregando/vazio/erro | L1, L4 | não |
| L6 · E4 fluxo | node-backend + react-frontend (duas partes pequenas) | servidor: `lerTiposBM` (distinct story) mapeado para `TIPO_ID`; front: `BarraFiltros`, `codec.ts` e `taticas.tsx` passam a usar `opcoes.tipos` em vez de `TIPOS_FILTRO`; prioridades presentes na sustentação | — | não (consulta sem entrada) |
| L7a · E4 sustentação back | node-backend | contrato e biblioteca: equipe da sustentação vira texto/slug; `querySustentacaoSchema` com `idSlug`; opções de `dim_chamado` | — | não (entrada mais ampla, mesma validação de slug) |
| L7b · E4 sustentação front | react-frontend | `codec.ts` sem `EQUIPES_SUSTENTACAO_ID`; apelido dos 3 ids antigos por um ciclo | L7a | não |

- **Ordem com o limite de 1 cartão por agente:** node-backend L2 → L4 → L6(servidor) → L7a; react-frontend L1 → L3 → L5 → L6(front) → L7b. O QA prepara os casos de L2 (abuso e forma) e de L1 (teclado) desde o início.
- **Pedido 098:** nenhum lote do 097 espera o 098. L7a/L7b generalizam o código; com o recorte atual a lista real mostra as mesmas 3 SSSC, e quando o 098 ampliar o recorte os times novos aparecem sem código novo. O que o 098 muda na tela do 097: (1) os times novos do Acelerato; (2) os nomes reais dos 47 times "Workflow <id>" (098 E4).
- **Risco de ordem com o 098 E4:** `dim_card.equipe` guarda o **nome** do time na projeção, e o id do filtro é `slug(nome)`. Renomear em `ref_time` sem reprojetar deixa a lista (de `ref_time`) com o nome novo e os cards com o antigo: o filtro fica vazio. O 098 E4 precisa incluir a reprojeção de `dim_card.equipe` (com a versão nova em `dim_card_versao`, por `correcao`) e conta com a quebra dos links antigos com `equipe=workflow-105` (aviso de valor inválido). Levo ao plano do 098.

## 7. Consultas só de leitura (o dono roda; nada é escrito)
Esquemas de produção `dspd_bm` e `dspd_ac`. Nenhuma lista horas por time nem por pessoa: só cobertura e contagem.

```sql
-- C1. Cobertura de time no apontamento (12 semanas): quanto das horas tem time pelo card (via A) e quanto ficaria em "Sem time".
SELECT (COALESCE(c.equipe, p.equipe) IS NOT NULL) AS tem_time,
       count(*) AS lancamentos, round(sum(f.segundos) / 3600.0) AS horas
FROM dspd_bm.fato_apontamento f
LEFT JOIN dspd_bm.dim_card c ON c.card_id = f.card_id
LEFT JOIN dspd_bm.dim_card p ON p.card_id = f.parent_card_id
WHERE f.excluido_em IS NULL AND f.data_apontamento >= current_date - 84
GROUP BY 1;

-- C2. Cards com apontamento que trocaram de time ao longo da vida (mede o risco R1 da via A).
SELECT count(*) AS cards_com_mais_de_um_time
FROM (SELECT v.card_id FROM dspd_bm.dim_card_versao v
      WHERE v.card_id IN (SELECT DISTINCT card_id FROM dspd_bm.fato_apontamento WHERE excluido_em IS NULL)
      GROUP BY v.card_id HAVING count(DISTINCT v.equipe) > 1) x;

-- C3. Tipos presentes nas stories (o que a opção T-A listaria).
SELECT tipo, count(*) AS cards FROM dspd_bm.dim_card WHERE granularidade = 'story' GROUP BY tipo ORDER BY tipo;

-- C4. Tipos nativos de item por categoria (dimensão da opção T-B).
SELECT categoria, count(*) AS tipos_nativos FROM dspd_bm.ref_tipo_card
WHERE vigente_ate IS NULL AND eh_item GROUP BY categoria ORDER BY categoria;
```
Os times do Acelerato com contagem são a consulta do 098 E2; não repito aqui.

## 8. (e) Perguntas ao dono
- **P-097-A** (Apontamento, Q-4 do UX): o time de um lançamento é o time do **card** em que a hora foi apontada (pessoa que trabalha para dois times aparece nos dois, cada um com as horas daquele time), e a hora apontada em card sem time (frente, projeto, card fora do escopo) aparece como **"Sem time"**? Recomendação: sim aos dois. É o dado que existe, não liga pessoa a time e mantém a soma do recorte batendo com o total.
- **P-097-B** (Tipo do Operacional): "Tipo real" é a **categoria** que já aparece nos cartões (Bug interno, Defeito em produção, Requisição, Dívida técnica, Melhoria, Trabalho de produto), só as que têm card, sem o "Incidente" que nunca acontece no BusinessMap; ou são os **tipos nativos** do quadro, com os nomes do BusinessMap? Recomendação: a categoria. É o que os cartões segmentam; os tipos nativos pedem migração, reprojeção e contrato novo, e mudariam O7 e O13.
- **P-097-C** (Q-5 do UX): nos painéis do Operacional e da Sustentação, a lista mostra o que existe em **toda a base** ou só o que tem dado **no período escolhido**? Recomendação: toda a base, para um time marcado não sumir da lista ao trocar o período. No Apontamento a lista já segue o período e fica assim.

## 9. Riscos e critérios de reversão
| Id | Risco | Mitigação | Reverter quando (fato observável) |
|---|---|---|---|
| R1 | Via A usa o time **atual** do card; card que mudou de workflow leva todas as horas para o time novo | Medir com C2 antes de L2 | C2 acima de 5% dos cards com apontamento: passar à via B (versão na data do lançamento), com ADR |
| R2 | Renomear time (098 E4) sem reprojetar esvazia o filtro | Reprojeção dentro do 098 E4 (§6) | Filtro de um time ativo de `ref_time` volta vazio com cards projetados nele |
| R3 | Recorte por time + cartão por pessoa estreita o grupo exibido: em time pequeno, "Pessoa n" fica mais fácil de reconhecer (com nomes desligados) | Parecer do security-engineer no L2; o piso de 20 apontamentos (o3) continua; avaliar piso de pessoas por recorte | Parecer de segurança com achado bloqueante |
| R4 | Ids da sustentação mudam (`totvs` → `sssc-totvs`) e quebram links guardados | Apelido por um ciclo + aviso existente | — |
| R5 | Apontamento: tipos nativos diferentes com o mesmo rótulo viram opções repetidas, mais visíveis com a busca | Agrupar por rótulo no L3 ou mostrar o nome nativo (UX decide) | — |
| R6 | Busca local lenta em lista muito grande | — | Lista de opções acima de 1.000 itens: busca no servidor |

## 10. Gatilhos de segurança (`R-SEGURANCA`)
- **Banco:** L2 muda permissão por coluna do papel `dspd_api_apontamento` (`grants.ts:14-31`) e acrescenta filtro com entrada na consulta da aba (valor vai por parâmetro, como os demais).
- **Dados pessoais (LGPD):** L2 cria recorte de pessoas por time na aba Apontamento (R3).
- Os demais lotes não tocam gatilho: sem migração, sem dependência nova, sem coluna de pessoa, sem `.env`, sem CI.
- O `security-engineer` faz o modelo de ameaças do L2 antes da implementação; o QA transforma os casos de abuso em testes.

## 11. Afrouxa alguma regra?
Não. Nenhum texto de `docs/regras/`, de `tests/config.json` ou de controle muda. Nenhum mecanismo novo (hook, regra, ferramenta, agente): os campos novos são parâmetros e opções de contrato já previstos pela política de mudança. Não há ADR nova se o dono escolher T-A; com T-B, ADR revendo a 0024.

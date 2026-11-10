# 069 · Desenho das correções de prioridade alta (L3, M1, L2, L9, L7)

Pedido 069, etapa E1.1 (K-220). Autor: software-architect. Data: 2026-11-04.
Leitura: `docs/analises/064-lacunas-dado-real.md` (L2, L3, L7, L9, M1 e as consultas Q05, Q06, Q15, Q18, Q24) e o código da worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041` (develop com 065, 066 e 067), só leitura. Caminhos de código abaixo são relativos a essa worktree. Nenhum código, teste ou outro documento foi alterado.

## Resumo

| Lacuna | Escopo (pedido) | O que o time faz | O que fica para pessoas ou para o dono | Lotes |
|---|---|---|---|---|
| L3 (E1) | O2 com filtro de equipe | troca a busca `quadro-<slug>` pela equipe da coluna, como o O1 já faz | nada | Lote L3-a |
| M1 (E2) | frescor da aba Apontamento | parcial continua não sendo "ok"; a resposta passa a dizer que a última coleta foi parcial e a tela mostra isso | rodar a carga inicial do worklog de novo com a develop atual (063) e conferir a Q15 | Lote M1-a; passo M1-op |
| L2 (E3) | colunas de `dim_card` | carregador do mapa `field_id` → coluna e domínio, projeção das colunas de lista, campo de data se existir | de-para dos 20 campos customizados do quadro com os 12 da §4.4 do briefing; criar no quadro os que faltam (WS1); regras de `eh_subtarefa`, `adicionado_apos_inicio_pai` e `origem_bug` | Lotes L2-a, L2-b, L2-c |
| L9 (E4) | colunas de `dim_chamado` | publicação sem zero falso (S3, S2); consulta dos campos de etapa (F3 da ADR 0023) e projeção das colunas | D-13 (MTTA), P-DS-19 (tipo e domínio de cada campo), fontes que a tabela não tem | Lotes L9-a, L9-b, L9-c |
| L7 (E5) | calendário e feriados | arquivo versionado e carregador `ref_calendario*`/`ref_feriado`; leitura nas métricas (a aba já lê) | conferir os feriados nacionais 2025-2026 do arquivo inicial; preencher 2027 em diante, estaduais, municipais e pontos facultativos; jornada | Lotes L7-a, L7-b |

Teto: 400 linhas de código e teste por PR (M14), um comportamento por PR. As estimativas abaixo são de código e teste, sem `.md`.

## Ordem sugerida

1. **Lote L3-a** (node-backend). Independente, pequeno, sem gatilho.
2. **Lote M1-a** (node-backend, depois react-frontend na mesma branch). Em paralelo, o passo **M1-op** (devops-engineer com o dono, sem código).
3. **Lote L7-a** (node-backend). Só o carregador: a aba Apontamento passa a ter feriado assim que o dono rodar o `ref-sync` (o serviço dela já lê a referência).
4. **Lote L7-b** (node-backend). As métricas do fluxo e da sustentação leem a referência.
5. **Lote L9-a** (node-backend e react-frontend), se o Jarvis aceitar no 069 (ver o lote).
6. **Lote L2-a** (node-backend, com parecer do security-engineer), depois **Lote L2-b**. O L2-c só se o de-para (P-L2-1) mostrar que o campo de data existe.
7. **Lote L9-b** (node-backend, com modelo de ameaças do security-engineer antes do código), depois **Lote L9-c**.

O qa-engineer prepara os testes de cada lote em paralelo à implementação. Com o limite de um cartão por agente, o node-backend segue a ordem acima; o security-engineer pode adiantar os pareceres de L2-a e L9-b enquanto o node-backend faz L3, M1 e L7.

## Gatilhos de segurança (`gatilhos_seguranca`, R-SEGURANCA)

Modelo de ameaças dos lotes L2-a, L2-c e L9-b: `docs/security/069-modelo-ameacas.md` (E1.8, K-220). Os achados bloqueantes A1 e A2 (L9-b) e A3 e A4 (L2-a) estão incorporados aos lotes abaixo, em "Onde muda" e "Testes"; os controles e os casos de abuso (CA-069-1 a CA-069-13) do modelo valem como parte de cada lote. O parecer de cada lote sai sobre o commit final dele, em `docs/security/069-<lote>.md`.

| Lote | Gatilho | Por quê |
|---|---|---|
| L3-a | nenhum | só cálculo de agrupamento sobre dado já carregado |
| M1-a | nenhum | campo novo na resposta com o resultado e o fim de uma coleta (já exposto em `/api/v1/fontes`); sem pessoa |
| L7-a | banco (leve) | grava em `dspd_core.ref_calendario`, `ref_calendario_aplicacao`, `ref_feriado`, `ref_versao_criterio`; o papel `dspd_ref` já tem `SELECT, INSERT` e `UPDATE (vigente_ate)` nas `ref_` do core (`server/src/plataforma/db/grants.ts:124-125`), então não há GRANT novo. Arquivo sem pessoa |
| L7-b | nenhum | só leitura, papel `dspd_api` já lê as três tabelas (`grants.ts:26-28`) |
| L9-a | nenhum | publicação; nada novo é lido |
| **L2-a** | **sim: campo novo da fonte na fronteira** | campos customizados do BusinessMap passam a entrar no staging (ADR 0020, 4d). Só campo de `type` da lista positiva de seleção única entra no mapa (A3 do modelo); o field 42 (Responsável CR, pessoa) e o field 36 (ID Acelerato, H-16) ficam fora, com teste nominal. Parecer do security-engineer antes do merge |
| L2-b | herda L2-a | lê do staging só o código de domínio que o L2-a deixou passar |
| **L2-c** | **sim: tratamento novo na allow-list** | campo de data na fronteira (formato, não domínio): revisão da ADR 0020 4d |
| **L9-b** | **sim: campo novo do Acelerato, `json` com pessoa e texto livre na origem** | `campos_personalizados_etapa` tem texto livre e está na mesma coluna `json` de campos de pessoa (listas §3: "Acelerato - Atendente", `_LOGIN`). Só nomes exatos da lista fechada, constante do código (A1 do modelo), saem do MySQL; dos nomes de tratamento `preenchido` só o booleano, calculado no `SELECT` e decidido pelo nome, não pelo `tipo` da fonte (A2 do modelo); nada de nome, e-mail, `usuarioKey`, descrição nem título. SQL versionado novo (hash, T2.6). Modelo de ameaças do security-engineer **antes** do código (ADR 0023 item 4, M4) |
| L9-c | herda L9-b | lê do staging só chaves da lista fechada |

---

## E1 · L3: O2 com filtro de uma equipe

**Defeito.** `packages/metricas/src/businessmap/o2.ts:49-61` monta as etapas com `c.quadro_id === \`quadro-${slug(eq.nome)}\``. Na base real o `quadro_id` é numérico (Q06: 6 quadros, nenhum `quadro-`), então com uma equipe filtrada `etapas` sai vazio e `parados.porEtapa` também. Os itens continuam com a coluna (`etapa: e.coluna`, linha 77), mas nenhuma etapa os agrupa. O O1 já resolve isso pela equipe da coluna (`o1.ts:57-62`: `c.equipe === undefined ? c.quadro_id === quadro : c.equipe === eq.nome`); a coluna real leva a equipe do workflow dela (`server/src/modulos/metricas/mapa.ts:76-87`).

### Lote L3-a · etapas do O2 pela equipe da coluna (node-backend, cerca de 120 linhas)
- **Onde muda:** novo `colunasDaEquipe(ctx, equipe)` em `packages/metricas/src/businessmap/comum.ts` (ou arquivo próprio `colunas.ts` no mesmo diretório), com o predicado do O1: base real (coluna com `equipe`) compara a equipe; base semeada (sem `equipe`) compara `quadro-<slug>`; só papéis `trabalho` e `homologacao`; ordem por `[ordem, coluna]` com `ordenarNeutro`. `calcularO2` (`o2.ts:49-61`) e `calcularO1` (`o1.ts:54-64`) passam a usá-lo. O O20 (`o20.ts:64, 124`) tem o mesmo padrão, mas é SDR: fica fora deste lote e anotado como dívida (o helper o resolve quando o plano dele entrar).
- **Contrato da API:** não muda (`etapas`, `agrupadoPorColuna`, `parados.porEtapa` já existem; passam a vir preenchidos).
- **Cálculo:** a regra não muda (idade, percentis por tipo, limite de parado). Muda só o agrupamento por coluna, que estava vazio por defeito. **Sem versão de critério** (T2.6 é para mudança de regra; isto corrige a leitura da coluna). Se o tech-lead entender que o "parados por etapa" com dado novo merece marca, a entrada é uma linha em `ref_versao_criterio` com `afeta = ['O2']`, sem código.
- **Testes:** `packages/metricas/src/businessmap/o2.equipe.test.ts`, no molde de `o1.h12.test.ts`: (1) base real (`quadro_id: '35'`, coluna com `equipe: 'Equipe A'`): `etapas` = colunas de trabalho e homologação do time, em ordem, e `parados.porEtapa` com um item parado na coluna certa; (2) base semeada: comportamento anterior (`quadro-<slug>`); (3) coluna de outro time no mesmo quadro não entra; (4) os testes atuais do O1 seguem verdes (refatoração para o helper). QA: chamada real `GET /api/v1/metricas/O2?equipe=<slug>` na base local com uma equipe que tenha WIP: `etapas` não vazio.
- **Pessoas:** nada.

---

## E2 · M1: frescor da aba Apontamento com coleta parcial

**Leitura.** `lerUltimasColetas` (`server/src/modulos/apontamento/repositorio.ts:96-106`) devolve a última coleta terminada e a última com `status = 'sucesso'`; `seloFrescor` (`packages/metricas/src/core/frescor.ts:35-45`) dá `sem-coleta` quando não há nenhuma ok e a última não falhou. Na base medida (Q15) há uma falha e uma parcial, de 2026-11-02, e nenhuma com sucesso: a aba mostra "Sem coleta" com 40 mil apontamentos na tela. A coleta já fecha `sucesso` quando nenhum lote falha (`server/src/modulos/businessmap/apontamento/coleta.ts:375`); a parcial medida é a carga 8, com cinco cards `lote_no_teto`, anterior à paginação do pedido 063 (ADR 0025, leitura de 2026-11-02).

### Decisão do desenho: parcial não vale como coleta ok
- O projeto inteiro usa `status = 'sucesso'` como "ok": `lerFimUltimaColetaOk` e `lerMarcaDagua` (`server/src/modulos/operacao/repositorio.ts:65-86`), a marca d'água do worklog (`coleta.ts:307, 377`) e o selo do fluxo e da sustentação. Parcial quer dizer "sabidamente incompleta" (lote no teto, guarda de massa). Promovê-la a ok faria o selo dizer "Atual" sobre um período que pode estar faltando horas.
- O que está errado é a tela dizer "Sem coleta" quando houve coleta e o dado dela foi aplicado (`efeito: 'parcial-aplicada'`). A correção é **dizer que a última coleta foi parcial**, sem mudar o selo.
- Alternativas descartadas: (a) parcial como ok: esconde a incompletude e diverge do resto do sistema; (b) valor novo `parcial` em `seloFrescorSchema`: muda o enum usado também pelo `/api/v1/fontes` e pelo selo do fluxo (mudança incompatível de enum na resposta, ADR 0007 nota de 2026-10-13), para um caso que um campo opcional resolve.
- Critério de reversão: o dono dizer que "Sem coleta"/"Atrasado" mais o aviso de parcial confunde mais que ajuda, ou a Q15 mostrar parciais recorrentes depois do 063 (aí o problema é a coleta, não o selo).

### Lote M1-a · a aba diz que a última coleta foi parcial (node-backend e react-frontend, cerca de 150 linhas)
- **Onde muda:** `packages/contratos/src/apontamento.ts:401`: `frescor` ganha `ultimaTentativa: { resultado: 'ok' | 'parcial' | 'falha', fim: instante } | null`, opcional (o mesmo nome do campo de `estadoColetaSchema`, `coletas.ts:63`). `montarApontamento` (`server/src/modulos/apontamento/servico.ts:150`) preenche a partir de `ultima` (já lida). `web/src/features/apontamento/components/CabecalhoApontamento.tsx`: quando `ultimaTentativa.resultado === 'parcial'` e ela é mais nova que `ultimaColetaOk` (ou não há ok), mostra ao lado do selo o aviso "Última coleta parcial em dd/mm hh:mm: o período pode estar incompleto" (texto final com o ux-designer na revisão de interface); com `falha`, o selo já diz "Falha".
- **Contrato da API:** campo opcional novo na resposta: **compatível** (ADR 0007, "campo novo opcional não muda versão"). O `frescor` usa `.strict()` (`apontamento.ts:401`), contra a nota de 2026-10-13 da ADR 0007 (resultado sem `.strict()`); como web e API saem do mesmo commit, o campo novo não quebra, mas o node-backend confere no `docs:check` se a política classifica como compatível; se não, `docs:fotografar` com a linha de compatível no PR.
- **Cálculo:** não muda. `ultimaColetaOk` (usada no `parcialAte` da capacidade) continua só com sucesso. Sem versão de critério.
- **Testes:** server: `apontamento-rota.test.ts` com coletas (parcial sem sucesso anterior → selo `sem-coleta`, `ultimaTentativa.resultado = 'parcial'`; sucesso depois de parcial → `ultimaTentativa.resultado = 'ok'`; nenhuma coleta → `ultimaTentativa: null`). Web: teste do cabeçalho com o aviso presente e ausente. E2E de API: a resposta valida no schema. QA na base local: com a Q15 atual, a aba mostra o aviso de parcial.

### Passo M1-op · fechar a coleta do worklog com sucesso (devops-engineer com o dono; sem código)
- Com a develop que tem o 063 (paginação, ADR 0025 item 4), rodar `pnpm --filter @metricas-dspd/server run bm:apontamento` no modo carga inicial: ela retoma de `lotes_concluidos` da carga 8 (`coleta.ts:293-300`). Sem card no teto nem guarda armada, fecha `sucesso` e grava a marca d'água; daí o incremental diário passa a rodar (sem marca ele recusa, `coleta.ts:309`).
- Conferir com a Q15 (`docs/analises/064-consultas-dono.sql`): pelo menos uma coleta `apontamento` com `sucesso`. Se fechar `parcial` de novo, a categoria vem em `ctl_coleta_falha` (só código): `lote_no_teto` com paginação disparada é o critério de reversão da ADR 0025, e volta ao arquiteto.
- A rota exige a migração 0034 aplicada (M8 do 064, `ctl_apontamento_cobertura`).

---

## E3 · L2: colunas de `dim_card` que a projeção não grava

**Leitura.** A projeção grava 15 colunas (`server/src/modulos/businessmap/projetor.ts:181-182`; `normalizador.ts:97-102, 197-204`). As colunas de campo customizado (briefing §4.4) ficam nulas por dois motivos que se somam:
1. **Nada de campo customizado chega ao staging.** O mapa `field_id` → domínio da allow-list é uma constante vazia (`server/src/modulos/businessmap/coleta.ts:40-44`, "A6 da F2"); `reduzirCamposCustomizados` descarta todo campo sem entrada (`allow-list.ts:67-82`). Por isso o zero da Q05 **não prova** que o quadro não tem os campos: prova que não são coletados. O diagnóstico E1.20 do 052 achou 20 definições de campo customizado nos quadros (plano 052, linha 132); só os fields 36 (ID Acelerato) e 42 (Responsável CR) estão identificados no repositório, e os dois ficam fora.
2. **O normalizador e o projetor não leem `custom_fields`** nem têm as colunas em `LinhaDimCard`/`COLUNAS_DIM`. `COLUNAS_VERSAO` (`responsaveis.ts:16-17`) já as tem, então a versão SCD2 acompanha sem mudança.

Colunas e origem:

| Coluna de `dim_card` | Origem prevista | Tratamento |
|---|---|---|
| `classe_servico`, `sistema` (§4.4 `sistema_afetado`), `area_solicitante`, `fornecedor`, `objetivo_estrategico`, `tamanho_declarado`, `responsabilidade_atraso`, `origem_demanda`, `fase_deteccao`, `severidade` | campo customizado de lista fechada | Lotes L2-a e L2-b, quando o de-para (P-L2-1) disser o `field_id` |
| `data_acordada` | campo customizado de data | Lote L2-c, só se o campo existir |
| `origem_bug` | vínculo com story ou frente (§4.4), não lista | fora: regra de qual vínculo vale (P-L2-3) |
| `eh_subtarefa` | sem fonte definida (subtarefa do BusinessMap não é card de `/cards`) | fora: P-L2-2 (a suspeita do QA no 064 fica com esta pergunta) |
| `adicionado_apos_inicio_pai` | derivação (T1.7): o vínculo não traz data | fora: P-L2-3 |
| `causa_raiz` (O17) | campo de lista | entra no L2-b se o de-para trouxer; a coluna não está em `COLUNAS_DIM` nem em `dim_card` hoje: se existir no quadro, o L2-b inclui a migração |

Não inferir: `deadline` (nativo) como `data_acordada`, `size` (nativo, pontos) como `tamanho_declarado` (P/M/G) e raia como classe de serviço são regras de negócio; só entram por decisão do dono (P-L2-4). Pontos como meta continuam proibidos (briefing 7.1).

### Lote L2-a · mapa `field_id` → coluna e domínios carregados do arquivo versionado (node-backend; security-engineer; cerca de 300 linhas)
- **Onde muda:** arquivo novo `docs/architecture/fontes/businessmap-dominio.json` (molde de `acelerato-dominio.json`): para cada coluna, o `field_id` e a lista fechada (`codigo` e `rotulo` = valor exato recebido). Entrada nova `bm:ref-sync` em `server/src/entradas/` (molde de `ref-sync-ac.ts`, papel `dspd_ref`, vigência por data, hash do arquivo em `ref_versao_criterio` domínio `businessmap`), que grava em `dspd_bm.ref_dominio` (já existe, `migrations/0007_bm_referencia.ts:17-19`): `campo = 'campo_customizado'`, `codigo = field_id`, `rotulo = coluna`; e `campo = <coluna>` para os valores. `dominiosDaColeta()` (`coleta.ts:42`) passa a montar o mapa a partir do `ref_dominio` vigente (leitura pelo coletor), no lugar da constante vazia.
  - **Lista positiva de tipos (A3 do modelo de ameaças).** O esquema zod `strict` do arquivo no `bm:ref-sync` aceita o `type` de um campo só se ele estiver numa lista positiva escrita no código (constante) e repetida no teste: os tipos de seleção única que o diagnóstico (P-L2-1) mostrar. Qualquer outro `type`, ausente ou desconhecido, recusa a carga inteira, sem gravar nada. Não há lista de negação ("usuário ou texto recusado"): tipo não previsto não passa. Enquanto o P-L2-1 não trouxer os tipos, a constante fica vazia e toda carga com campo é recusada, o que não muda nada porque o arquivo nasce vazio de campos; o PR que preencher o arquivo preenche a constante (com o parecer de segurança que o modelo pede, A5). O mesmo esquema traz os demais itens do controle 1 do modelo: `field_id` só `^\d{1,10}$`, coluna destino num enum fechado no código com as colunas de lista de `dim_card` da tabela acima, `codigo` e `rotulo` com o `textoSeguro` existente, `field_id` e coluna sem duplicata.
  - **Remoção de 36 e 42 depois da leitura do banco (A4 do modelo de ameaças).** A recusa nominal dos fields 36 e 42 fica nos dois lados: no `bm:ref-sync` (o arquivo com eles é recusado) e no coletor, **depois** de ler o `ref_dominio`: `dominiosDaColeta` continua removendo `CAMPOS_CUSTOMIZADOS_FORA` (`coleta.ts:38, 44`) do mapa lido, e ignora a linha `campo_customizado` com `field_id` não numérico ou com coluna fora do mesmo enum fechado. Assim uma linha inserida direto no `ref_dominio` com a credencial do `dspd_ref` não traz o field 42 nem o 36 para o staging.
  - O arquivo nasce **vazio de campos** até o P-L2-1: o lote entrega o mecanismo, sem mudar o que é coletado hoje. O mesmo carregador serve os domínios `sistema`, `objetivo_estrategico` e `area_interna` (M6 do 064), mas preencher esses valores é das pessoas.
- **Por que o existente não basta (mecanismo novo: a entrada `bm:ref-sync`).** Existe `ac:ref-sync`, que carrega `dspd_ac.ref_dominio` (`server/src/entradas/ref-sync-ac.ts`), e `bm:ref-sync-apontamento`, que carrega só o dicionário do apontamento. Nenhum dos dois escreve `dspd_bm.ref_dominio`: a Q14 do 064 mediu 0 linhas vigentes nela, e a constante `MAPA_DOMINIOS` é o único lugar do mapa hoje (vazia). Não há tabela nova: reaproveita `ref_dominio` e o molde do `ac:ref-sync`.
- **Contrato da API:** não muda.
- **Cálculo:** não muda neste lote (arquivo vazio). Quando o arquivo ganhar campos, o `ref-sync` registra a versão de critério com a data de vigência e `afeta` = O6 e O10 (e os filtros de sistema e objetivo); as SDR (O8, O12, O14, O15, O16, O18) só mudam quando o plano delas as puser no mapa real (ADR 0026).
- **Testes:** pg: carga idempotente (rodar duas vezes não duplica), vigência fecha a linha anterior com `UPDATE (vigente_ate)`, versão de critério com o hash. Unidade: `dominiosDaColeta` com `ref_dominio` montado devolve o mapa; **teste nominal**: field 42 e field 36 no arquivo fazem o `ref-sync` recusar (lista de proibidos escrita no teste, não derivada, ADR 0020 B-1); o arquivo traz o `type` do diagnóstico e o esquema só aceita a lista positiva. Staging: card com campo mapeado grava `{field_id, valor: código}`; valor fora do domínio grava `desconhecido`, nunca o texto.
  - **A3 (unidade do esquema, CA-069-2):** `type` de usuário, de texto, desconhecido e ausente → carga recusada inteira, nada gravado; tipo da lista positiva → aceito (a lista do teste é escrita no teste, não importada da constante); `field_id` `"42 "`, `"4a"`, `"-1"` → recusa; coluna `owner_user_id` ou inexistente → recusa; rótulo com `@`, U+200B, U+202E, U+2028 → recusa; chave extra na raiz e no item, `__proto__` como chave → recusa sem efeito.
  - **A4 (coletor, CA-069-3 e CA-069-4):** `ref_dominio` com linha `campo_customizado` para `42` e para `36` inserida direto por SQL (sem passar pelo `bm:ref-sync`) → o mapa de `dominiosDaColeta` sai sem os dois; linha com `field_id` não numérico ou coluna fora do enum → ignorada. Fixture de `/cards` com `custom_fields` 36 e 42 com marcador (`MARCADOR-PESSOA-069`) mais um campo mapeado com texto marcador fora do domínio → staging só com código ou `desconhecido`; marcadores ausentes do staging, do log e de `ctl_coleta_falha`.
  - Saída do `bm:ref-sync` com URL inválida e senha marcador → mensagem fixa, marcador ausente; saída da função de GRANT idêntica à da develop.
- **Operação depois do merge:** o incremental só relê cards alterados; para os campos chegarem ao staging dos cards antigos, rodar a varredura (ADR 0022 item 6) depois do primeiro `bm:ref-sync` com campos.

### Lote L2-b · projeção das colunas de lista (node-backend; cerca de 200 linhas)
- **Onde muda:** `normalizador.ts`: `projetarCard` recebe o mapa `field_id` → coluna (da referência carregada em `carregarReferencia`, `projetor.ts:54-68`, que passa a ler `ref_dominio campo = 'campo_customizado'`) e preenche as colunas de lista a partir de `e.card.custom_fields`; código `desconhecido` vira `null` com a nota `campo_fora_do_dominio` (contagem, sem valor, como as notas atuais). `LinhaDimCard` e `COLUNAS_DIM` (`projetor.ts:181-182`) ganham as colunas. O `bm:projetar` refaz `dim_card` de todo o staging a cada execução (`projetor.ts:213-220`), então as colunas aparecem na projeção seguinte; versão nova em `dim_card_versao` só onde o atributo mudou (append-only, nada sobrescrito).
- **Contrato da API:** não muda. O6 passa a separar classes e O10 a ter visão do cliente quando houver dado; a nota fixa do O6 ("sem classe até o quadro ter o campo", `origem.ts`) continua até o dono ver o dado (tirá-la é do plano do O6).
- **Cálculo:** não muda a regra; a versão de critério é a do `ref-sync` (L2-a).
- **Testes:** unidade do normalizador (campo mapeado preenche a coluna; sem mapa todas nulas, igual a hoje; `desconhecido` vira nulo com nota; campo mapeado para coluna inexistente recusado). pg do projetor: `dim_card` com as colunas e `dim_card_versao` com versão nova só na mudança. Teste de paridade: com o mapa vazio, o `dim_card` projetado é idêntico ao de antes do lote.

### Lote L2-c · campo de data `data_acordada` (node-backend; security-engineer; cerca de 120 linhas) · condicional
- Só se o P-L2-1 achar o campo de data no quadro. `reduzirCamposCustomizados` ganha um segundo tipo de entrada para campo de data: valor aceito só se casar `AAAA-MM-DD` (ou o formato que o diagnóstico mostrar), senão `desconhecido`; nunca texto. Revisão da ADR 0020 4d. Projeção em `data_acordada` (date). Testes de fronteira com texto, data inválida e data válida. O O12 continua SDR até o plano dele.

### Fica para as pessoas e para o dono (E3)
- **P-L2-1 (WS1, dono):** de-para das 20 definições de campo customizado (o diagnóstico E1.20 já lista `field_id`, nome e tipo, `server/src/modulos/businessmap/diagnostico.ts:306`) com os 12 campos da §4.4; qual existe, com que `field_id` e quais valores. Conferir se `/customFields` pagina em 20 (pendência do plano 052). O time pode montar a planilha a partir da saída do diagnóstico.
- **WS1:** criar no quadro os campos da §4.4 que faltarem, com os domínios fechados (T1.3).
- **P-L2-2 (dono):** o que é subtarefa no `dim_card` (o BusinessMap tem subtarefa fora de `/cards`): se `false` para todo card é o certo, a coluna sai da lista de lacunas.
- **P-L2-3 (dono):** regra de `origem_bug` (qual vínculo) e de `adicionado_apos_inicio_pai` (o vínculo não traz data).
- **P-L2-4 (dono):** se algum campo nativo (`deadline`, raia) vale no lugar de um campo da §4.4.

---

## E4 · L9: colunas de `dim_chamado` que a projeção não grava

**Leitura.** `ATRIBUTOS` do projetor (`server/src/modulos/acelerato/projetor.ts:21-24`) não tem as 12 colunas da L9. O que a tabela MySQL já traz e já chega ao staging (ADR 0023 §4, `acelerato-listas.md` §1): entre as colunas da L9, só a fonte de `primeiro_atendimento_em` (`data_primeiro_comentario`, `allow-list.ts:58`), que o normalizador deixa de fora de propósito até a **D-13** do dono (`normalizador.ts:116-118`, CT-56). Os demais vêm de `campos_personalizados_etapa`, que a ADR 0023 item 4 reserva para a **F3**, depois da **P-DS-19** (tipo e domínio de cada campo, `acelerato-listas.md` §3). `impacto`, `urgencia`, `excecao_sla_registro_posterior` e `incidente_critico_coordenado` não têm coluna nem campo conhecido na tabela.

Efeito que parece dado real hoje: `prioridade_ajustada_manualmente` e `excecao_sla_registro_posterior` são `boolean NOT NULL DEFAULT false` (`server/src/plataforma/db/ddl.ts:109, 123`), então o S3 publica "ajustes manuais = 0" (`packages/metricas/src/acelerato/s3.ts:39`) e o S2 conta todo fechado como apurável sem avisar.

| Coluna | Fonte | Situação | Lote |
|---|---|---|---|
| `primeiro_atendimento_em` | `data_primeiro_comentario` (no staging) | espera a D-13 | fora do 069 até a decisão; depois, lote pequeno no normalizador (S1 MTTA muda: versão de critério) |
| `justificativa_informada` | campo "Se a prioridade foi ajustada, justifique" (texto): só o booleano "preenchido" | F3, sem domínio | L9-b, L9-c |
| `prioridade_ajustada_manualmente` | campo "Prioridade ajustada manualmente?" | F3, valores de sim e não na P-DS-19 | L9-b, L9-c |
| `motivo_escalacao`, `motivo_encerramento`, `avaliacao_problema`, `motivo_pendencia_atual` | campos de etapa de lista | F3, domínio na P-DS-19 | L9-b, L9-c |
| `previsao_retorno` | campo "Previsão de retorno" | F3; a lista fechada diz "só se tem previsão (booleano)", e a coluna é `timestamptz` | L9-c, com a decisão D-L9-1 |
| `fato_etapa_chamado.motivo_pendencia` | só existe o valor atual do campo, não por intervalo (etapas sintéticas, D-7) | fica nulo | nenhum |
| `impacto`, `urgencia`, `excecao_sla_registro_posterior`, `incidente_critico_coordenado` | sem fonte na tabela | pessoas (WS4) e dono | nenhum |

### Lote L9-a · S3 e S2 sem zero falso enquanto não há fonte (node-backend e react-frontend; cerca de 200 linhas) · recomendado, a confirmar no escopo
- **Escopo:** não é projeção de coluna; é o efeito da L9 descrito no 064 ("ajustes manuais sempre 0 como se fosse real"). Segue o princípio da ADR 0026 e o molde do 065. O Jarvis decide se entra no 069 ou vira cartão; o desenho o põe antes do L9-b porque não depende de nada.
- **Onde muda:** constante `AJUSTE_PRIORIDADE_COM_FONTE = false` em `packages/contratos` (como `BLOQUEIOS_COM_DADO_REAL`); em `server/src/modulos/metricas/parte-sem-dado.ts` uma função irmã de `semParteDeBloqueio` que, na base real e com a constante falsa, troca `ajustesManuais` por `null` em cada mês do S3 e acrescenta a nota; no S2, só a nota "exceção de SLA por registro posterior sem fonte: todo chamado fechado conta como apurável". Chamada em `servico.ts:297`, ao lado da do 065. `web/src/features/sustentacao/components/CartaoS3.tsx:114` mostra "sem dado" quando `null`; o S2 mostra a nota.
- **Contrato da API:** S3 `ajustesManuais` `number` → `number | null` é troca de tipo, **incompatível**; `notas` opcional novo é compatível. Pela política de contratos, aceite na v1 como no 065 (`docs/analises/065-decisao-contrato.md`: o único consumidor é o `web` do mesmo commit), com aprovação do arquiteto e do tech-lead registrada antes do PR e a linha `contrato: incompatível (aceite na v1, ...)` na descrição.
- **Cálculo:** não muda (só publicação, como o 065). Sem versão de critério.
- **Testes:** server: S3 real com a constante falsa sai com `ajustesManuais: null` e nota; modo mock mantém o número; S2 traz a nota. Web: cartão S3 com `null`. E2E de API no molde de `bloqueio-sem-dado-065.spec.ts`.

### Lote L9-b · consulta dos campos de etapa (Q4) até o staging (node-backend; security-engineer antes; cerca de 350 linhas)
- **Onde muda:** é a F3 já desenhada na ADR 0023 item 4. `server/src/modulos/acelerato/sql.ts` e `docs/architecture/fontes/acelerato-mysql.sql`: Q4 constante sobre `campos_personalizados_etapa` com `JSON_TABLE(... '$[*]' COLUMNS (nome, tipo, valor))`, `WHERE f.nome IN (<nomes da fatia F3>)` por placeholder, só igualdade exata (nunca `LIKE` nem a coluna `json` inteira).
  - **Nomes como constante do código (A1 do modelo de ameaças).** Os nomes da fatia F3 ficam numa constante do código, no molde de `NOMES_CAMPO_FATIA_F1` (`server/src/modulos/acelerato/listas-fechadas.ts:30-31`, usada em `coletor.ts:118`), cada nome com o seu tratamento fixo no código: `lista` (valor por domínio) ou `preenchido` (só booleano). Os nomes **não** são lidos de `ref_dominio`: uma linha a mais lá não entra no `IN`. O `ref_dominio` guarda só os **valores** permitidos de cada campo de `lista`, nunca os nomes. Lista inicial, da linha F3 de `acelerato-listas.md` §3, como no controle 1 do modelo: `lista` = "Motivo da Escalação", "Qual suporte foi acionado?", "Motivo de Encerramento", "Categoria de solução" (só se o dono a preferir), "Classifique o chamado no Tipo de Prioridade corretamente!", "Motivo de Pendência", "Avaliação de Problema", "Prioridade ajustada manualmente?" (sim e não por domínio); `preenchido` = "Se a prioridade foi ajustada, justifique", "Previsão de retorno" (até a D-L9-1). "Número do ticket anterior" fica fora até a D-15.
  - **Tratamento decidido pelo nome no `SELECT` (A2 do modelo de ameaças).** O que sai do MySQL é decidido pelo nome, não pelo `tipo` que a fonte informa: para nome `preenchido`, a consulta devolve só `valor IS NOT NULL AND valor <> ''` como booleano e nunca a coluna `valor`, qualquer que seja o `tipo`; para nome `lista`, `valor` em `VARCHAR(80)`. O `tipo` só pode recusar, nunca liberar: se a fonte disser `tipo` texto para um nome `lista`, o valor vai nulo com contagem.
  - `allow-list.ts`: schema zod `strict` por forma de linha: linha de nome `preenchido` só aceita booleano; linha de nome `lista` só string de até 80 caracteres ou nulo; chave extra ou nome fora da constante falha fechado (`dados-invalidos`, sem gravar parcial; erro sem o valor). Staging: os campos entram no `payload` do chamado como o campo dos 90 dias (`campos`), com o valor só se estiver no domínio do campo, senão nulo com contagem `fora_dominio_<campo>`, sem o valor. Hash novo do SQL em `ctl_coleta.parametros` e versão de critério (T2.6), como manda a ADR 0023.
- **Por que o existente não basta:** a Q3 (`campos_personalizados`, coluna 45) não alcança a coluna 46, onde estão os campos da F3 (`acelerato-listas.md` §2 e §3); a ADR 0023 já previu a Q4 para isso, então não é decisão nova, é a fatia que faltava.
- **Contrato da API:** não muda.
- **Cálculo:** não muda neste lote (só staging). A versão de critério registra a mudança do SQL.
- **Testes:** fronteira com a fixture das 50 colunas acrescida de `campos_personalizados_etapa` com os marcadores proibidos (listas §3, "Nunca na lista": "Acelerato - Atendente", "Acelerato - Solicitante", "Cargo", "Bairro", "Complemento do Problema", `_LOGIN`, texto de campo de etapa): nenhum chega ao staging nem ao log; teste estrutural da consulta (só `SELECT`, sem `;`, sem coluna `json` inteira); domínio vazio deixa o campo nulo com contagem; mudança do SQL sem versão registrada recusa a coleta (CA-8).
  - **A1 (CA-069-6 e CA-069-11):** linha a mais em `dspd_ac.ref_dominio` com `campo_personalizado` = "Acelerato - Atendente" → o nome não entra no `IN` (teste sobre os parâmetros da consulta montada); fixture com "Acelerato - Atendente", "Acelerato - Solicitante", "Cargo", "Bairro", "Complemento do Problema", `X_LOGIN` e um nome desconhecido, todos com marcador → nenhum sai da consulta; marcadores ausentes do staging, do log e das `ctl_`. A lista de nomes proibidos é escrita no teste, não derivada da constante.
  - **A2 (CA-069-7 e CA-069-8):** "Se a prioridade foi ajustada, justifique" com texto marcador e `tipo` = lista → só o booleano preenchido; o texto não sai do `SELECT` (teste estrutural: para os nomes `preenchido` a consulta não projeta `valor`); "Motivo de Encerramento" com `tipo` texto e valor marcador → valor nulo com contagem; marcador ausente.
  - Zod (CA-069-9): chave extra, nome fora da constante, valor de 81 caracteres, booleano em campo de `lista` → falha fechado `dados-invalidos`, erro sem o valor.
- **Pré-requisito:** modelo de ameaças do security-engineer, `docs/security/069-modelo-ameacas.md` (que repete o necessário do M4 do 056) e a P-DS-19 para os campos de lista (os booleanos de "preenchido" não precisam de domínio).

### Lote L9-c · projeção das colunas da F3 (node-backend; cerca de 200 linhas)
- **Onde muda:** `normalizador.ts` (`LinhaProjecao`, `normalizarChamado`) e `ATRIBUTOS` do projetor (`projetor.ts:21-24`): `justificativa_informada`, `prioridade_ajustada_manualmente`, `motivo_escalacao`, `motivo_encerramento`, `avaliacao_problema`, `motivo_pendencia_atual` e `previsao_retorno` conforme D-L9-1. Valor fora do domínio já chega nulo do staging. O projetor só projeta versão do staging ainda sem versão (`projetor.ts:46-53`); como a Q4 muda o `payload`, a releitura semanal gera versão nova de cada chamado e a projeção acompanha sem reescrever versão antiga (append-only).
- **`prioridade_ajustada_manualmente` é `NOT NULL DEFAULT false`:** enquanto o domínio de sim e não não estiver carregado, a coluna continua `false` e o L9-a continua valendo; a constante `AJUSTE_PRIORIDADE_COM_FONTE` só vira `true` (num PR próprio) depois de a coluna vir da fonte e o dono ver a contagem.
- **Contrato da API:** não muda. As SDR S5, S6, S7, S9, S11 só saem do portão pelo plano de cada uma (ADR 0026).
- **Cálculo:** a regra não muda; S3 passa a contar ajustes reais quando a constante virar. Essa virada registra versão de critério com `afeta = ['S3', 'S7']`.
- **Testes:** unidade do normalizador para cada coluna (valor no domínio, nulo, booleano de preenchido); pg do projetor com versão nova no staging; paridade das métricas reais (S2, S3, S4, S8, S10) antes e depois com a constante falsa.

### Fica para as pessoas e para o dono (E4)
- **D-13 (dono):** o que é primeiro atendimento (o primeiro comentário vale?). Sem ela, S1 MTTA segue SDR.
- **P-DS-19 (dono, WS4):** tipo e domínio de cada campo da F3 (Motivo da Escalação, Qual suporte foi acionado?, Motivo de Encerramento, Categoria de solução, Prioridade ajustada manualmente?, Classifique o chamado no Tipo de Prioridade, Motivo de Pendência, Avaliação de Problema); a consulta só de domínio no molde do `acelerato-listas.md` §11 e §12.
- **D-L9-1 (dono):** `previsao_retorno` como data ou só "tem previsão" (a lista fechada diz booleano; a coluna é data). Se booleano, o L9-c inclui a migração da coluna.
- **WS4:** fonte de `impacto`, `urgencia`, `excecao_sla_registro_posterior` (S12, S2) e `incidente_critico_coordenado`; preenchimento de `nivel_resolucao` (M4 do 064) fica fora deste pedido.

---

## E5 · L7: calendário e feriados

**Leitura.** As tabelas existem (`server/migrations/0010_core_referencia.ts:19-37`) e ninguém as grava (Q18: tudo 0). A aba Apontamento lê a classe `businessmap/apontamento` (`server/src/modulos/apontamento/repositorio.ts:81-90`) e, sem ela, usa um calendário **sem feriado nenhum** (`servico.ts:104-107`); as métricas usam `CALENDARIO_PADRAO`, com os feriados nacionais escritos no código só até 2026-12-25 (`packages/metricas/src/core/calendario.ts:26-71`), e ignoram a referência (`server/src/modulos/metricas/servico.ts:202-203, 287-288`). A troca do calendário já invalida o cache das métricas: a versão de critério entra na versão de carga (`servico.ts:121-126`). Os turnos (`ref_calendario_turno`) não são lidos por ninguém; a jornada 8-12 e 13-17 continua no código (provisória, P2).

### Decisões do desenho (a registrar na próxima ADR livre antes do L7-a)
- **Um calendário por domínio**, com os mesmos feriados de início: `dspd-businessmap` (classes `fluxo` e `apontamento`) e `dspd-acelerato` (classe `sustentacao`). Motivo: `ref_feriado.incluido_por_versao_id` aponta para uma versão de critério, e a versão tem um domínio só (`0010_core_referencia.ts:11-14`); um calendário por domínio mantém a marca T2.6 de cada painel no seu domínio, sem misturar BusinessMap e Acelerato.
- **Arquivo inicial = os feriados nacionais 2025-2026 que já estão no código**, escopo `nacional`, sem nada inventado. Efeito: nas métricas, nenhuma mudança de número quando o L7-b entrar (teste de paridade); na aba Apontamento, os feriados nacionais passam a contar a partir da vigência (mudança de cálculo, com versão de critério e marca, já listada por `lerCriterios`, `repositorio.ts:116`).
- **Turnos fora deste pedido:** o carregador não grava `ref_calendario_turno`, e a leitura usa os turnos padrão.
- **Etapas sintéticas do Acelerato fora:** `intervalosDasEtapas` usa `CALENDARIO_PADRAO` na projeção (`server/src/modulos/acelerato/etapas-sinteticas.ts:22, 45`; `projetor.ts:101`), e o resultado é gravado. Trocar o calendário ali muda intervalos já gravados a cada reprojeção; fica como pendência para decisão própria (risco anotado), sem mudança neste pedido.
- Critério de reversão: o dono pedir um calendário único para os dois domínios, ou a primeira carga real mostrar feriados divergentes entre os domínios sem motivo (sinal de que dois arquivos só duplicam trabalho).

### Lote L7-a · arquivo versionado e carregador do calendário (node-backend; cerca de 280 linhas)
- **Onde muda:** arquivo novo `docs/architecture/fontes/calendario.json` (calendários com `nome` e `offset_minutos` = -180; aplicações por `dominio` e `classe`; feriados com `data`, `escopo`, `descricao`). Entrada nova `ref:sync-calendario [AAAA-MM-DD]` em `server/src/entradas/` (molde de `ref-sync-ac.ts`, papel `dspd_ref`, `PG_REF_URL`), com o módulo em `server/src/modulos/referencia/` (molde de `criterios-acelerato.ts` para a versão de critério e as métricas afetadas): grava `ref_calendario` (insere se não houver o nome), `ref_calendario_aplicacao` (fecha a vigente com `vigente_ate` e abre a nova), `ref_feriado` (só as datas novas, com `incluido_por_versao_id` da versão do domínio; a chave é `calendario_id, data`, então feriado já gravado não é sobrescrito; remover feriado é decisão a registrar, fora deste lote) e uma `ref_versao_criterio` por domínio com o hash do arquivo, `vigente_desde` = a data do comando, e `ref_versao_criterio_metrica` com as métricas que usam horas ou dias úteis (a lista sai do código, pelas chamadas de calendário da biblioteca; o QA confere) mais `apontamento-capacidade` no BusinessMap, se esse id existir no catálogo da aba.
- **Por que o existente não basta (mecanismo novo: a entrada `ref:sync-calendario`).** As entradas de referência que existem gravam outras tabelas (`ac:ref-sync` em `dspd_ac.ref_dominio`, `bm:ref-sync-apontamento` em `dspd_bm.ref_apontamento_*`); `grants.ts` é o único arquivo de `server/src` que cita `ref_feriado` e `ref_calendario_aplicacao` fora das leituras (achado L7 do 064), e a Q18 mediu 0 linhas nas quatro tabelas. O feriado no código (`FERIADOS_NACIONAIS`) não é referência versionada nem chega à aba.
- **Contrato da API:** não muda (a lista de critérios da aba e das métricas já traz versões de critério; ganha entradas por dado).
- **Cálculo:** muda só a aba Apontamento, e só depois de o dono rodar o comando (versão de critério com a data). As métricas não leem a referência até o L7-b.
- **Testes:** pg: carga idempotente; segunda carga com feriado novo só insere o novo e cria versão nova; data inválida, escopo fora do `CHECK` ou classe desconhecida recusam o arquivo inteiro sem gravar nada; feriado gravado nunca é alterado. Rota do apontamento (`apontamento-rota.pg.test.ts`) com o calendário carregado: feriado deixa de contar como dia útil na capacidade e a versão aparece em `criterios`.

### Lote L7-b · as métricas leem o calendário da referência (node-backend; cerca de 180 linhas)
- **Onde muda:** `server/src/modulos/metricas/repositorio.ts`: `lerCalendario(db, S, dominio, classe)` (generalização da leitura da aba, `apontamento/repositorio.ts:81-90`, movida para um módulo comum de referência para as duas rotas usarem a mesma função). `servico.ts`: `carregarBM` lê a classe `businessmap/fluxo` e `carregarAC` a classe `acelerato/sustentacao`; a `Carga` guarda o `Calendario` (`criarCalendario({ feriados, offsetMinutos })`, turnos padrão) e as linhas 287-288 passam `bm.cal` e `ac.cal` a `criarContextoBM`/`criarContextoAC`. Sem linha na referência, vale `CALENDARIO_PADRAO` (o comportamento de hoje). As linhas 147, 158 e 202-203 só convertem data civil e podem ficar com o padrão (o fuso é o mesmo).
- **Contrato da API:** não muda.
- **Cálculo:** com o arquivo inicial, nenhum número muda (mesmos feriados). Quando as pessoas acrescentarem feriados (2027, estaduais, municipais), as métricas mudam a partir da vigência, com a versão de critério que o L7-a grava e a marca nos gráficos (T2.6). Os dois domínios continuam com cargas e calendários separados.
- **Testes:** unidade do serviço com repositório falso: calendário da classe chega ao contexto (O3 com um ciclo atravessando um feriado carregado dá menos horas úteis que com o padrão); sem referência, `CALENDARIO_PADRAO`; BusinessMap nunca recebe o calendário do Acelerato. Paridade: com o arquivo inicial, todas as métricas do mapa real (O1 a O13 reais, EI_FL1, S2, S3, S4, S8, S10) dão resultado igual ao de antes. Cache: nova versão de critério invalida o resultado guardado.

### Fica para as pessoas e para o dono (E5)
- Conferir os feriados nacionais 2025-2026 do arquivo inicial antes do primeiro `ref:sync-calendario`.
- Preencher 2027 em diante, feriados estaduais e municipais e pontos facultativos (o escopo do `CHECK` já os aceita); sem isso, a partir de 2027 nenhum feriado conta.
- Jornada (turnos) e se plantão usa horas corridas (briefing 4.2): continua provisória no código até decisão.
- Decidir se as etapas sintéticas do Acelerato (D-7) devem usar o calendário da referência (reprojeção muda intervalos gravados).

---

## Perguntas e decisões em aberto (R-DECISAO)

| Id | Para quem | Pergunta | Bloqueia |
|---|---|---|---|
| P-L2-1 | dono, WS1 | De-para dos 20 campos customizados do quadro com os 12 da §4.4 (field_id, tipo, valores) | dado do L2-b; L2-c |
| P-L2-2 | dono | O que é subtarefa no `dim_card` | `eh_subtarefa` |
| P-L2-3 | dono | Regra de `origem_bug` e de `adicionado_apos_inicio_pai` | as duas colunas |
| P-L2-4 | dono | Campo nativo (`deadline`, raia) vale no lugar de campo da §4.4? | nada até a resposta |
| D-13 | dono | O que é primeiro atendimento | `primeiro_atendimento_em`, S1 MTTA |
| P-DS-19 | dono, WS4 | Tipo e domínio dos campos da F3 | dado do L9-c |
| D-L9-1 | dono | `previsao_retorno`: data ou "tem previsão" | forma da coluna no L9-c |
| D-069-1 | Jarvis | O L9-a (S3 e S2 sem zero falso) entra no 069 ou vira cartão? | L9-a |

## Riscos
- **Campos customizados de pessoa ou texto livre (L2-a, L9-b).** Mitigação: lista fechada por `field_id` e por nome exato, recusa nominal dos fields 36 e 42 e dos marcadores do Acelerato, pareceres do security-engineer antes do merge.
- **Campos novos não chegam a cards antigos (L2).** O incremental só relê o que mudou; precisa da varredura depois do primeiro `bm:ref-sync` com campos.
- **Coleta do worklog parcial de novo (M1).** Se a carga retomada fechar parcial com a paginação ativa, é o critério de reversão da ADR 0025, não um problema do selo.
- **Feriado acrescentado muda séries já publicadas (L7-b).** É o efeito esperado de T2.6: versão com data e marca no gráfico; o teste de paridade garante que a entrada do lote em si não muda nada.

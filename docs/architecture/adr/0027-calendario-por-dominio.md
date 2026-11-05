# 0027 - Calendário por domínio: um calendário de referência para o BusinessMap e outro para o Acelerato, carregados de arquivo versionado

Estado: proposta. Data: 2026-11-04.
Propósito: registrar as decisões do L7 (calendário e feriados) que o desenho do pedido 069 tomou, antes do lote L7-a. Público: node-backend, tech-lead, qa-engineer, security-engineer. Revisão: na primeira carga real do `ref:sync-calendario` (critério de reversão).

- Origem: pedido 069 (lacunas de prioridade alta, E1.1, K-220), desenho `docs/analises/069-desenho.md`, seção "E5 · L7: calendário e feriados"; lacuna L7 e consulta Q18 de `docs/analises/064-lacunas-dado-real.md`.
- Relacionadas: briefing T2.5 (biblioteca compartilhada de tempo) e T2.6 (versão de critério com data e marca nos gráficos); regra inviolável "BusinessMap e Acelerato nunca se misturam".

## Contexto
- **Tabelas vazias.** As tabelas de referência do calendário existem (`server/migrations/0010_core_referencia.ts:19-37`: `ref_calendario`, `ref_calendario_aplicacao`, `ref_feriado`, `ref_calendario_turno`) e ninguém as grava: a Q18 do 064 mediu 0 linhas em todas. `grants.ts` é o único arquivo de `server/src` que cita `ref_feriado` e `ref_calendario_aplicacao` fora das leituras.
- **Calendário sem feriado na aba.** A aba Apontamento lê a classe `businessmap/apontamento` da referência (`server/src/modulos/apontamento/repositorio.ts:81-90`) e, sem linha nela, usa um calendário **sem feriado nenhum** (`servico.ts:104-107`).
- **Feriados só no código até 2026-12-25.** As métricas usam `CALENDARIO_PADRAO`, com os feriados nacionais escritos no código (`FERIADOS_NACIONAIS`) só até 2026-12-25 (`packages/metricas/src/core/calendario.ts:26-71`), e ignoram a referência (`server/src/modulos/metricas/servico.ts:202-203, 287-288`). O feriado no código não é referência versionada nem chega à aba.
- A troca do calendário já invalida o cache das métricas: a versão de critério entra na versão de carga (`servico.ts:121-126`).
- `ref_feriado.incluido_por_versao_id` aponta para uma versão de critério, e a versão de critério tem um domínio só (`0010_core_referencia.ts:11-14`).
- Os turnos (`ref_calendario_turno`) não são lidos por ninguém; a jornada 8-12 e 13-17 continua no código (provisória, P2).
- As etapas sintéticas do Acelerato (`intervalosDasEtapas`) usam `CALENDARIO_PADRAO` na projeção (`server/src/modulos/acelerato/etapas-sinteticas.ts:22, 45`; `projetor.ts:101`), e o resultado é gravado.

## Decisão
1. **Um calendário por domínio**, com os mesmos feriados de início: `dspd-businessmap` (classes `fluxo` e `apontamento`) e `dspd-acelerato` (classe `sustentacao`). Motivo: como a versão de critério tem um domínio só e o feriado aponta para ela, um calendário por domínio mantém a marca T2.6 de cada painel no seu domínio, sem misturar BusinessMap e Acelerato.
2. **Arquivo inicial = os feriados nacionais 2025-2026 que já estão no código**, escopo `nacional`, sem nada inventado. O arquivo é `docs/architecture/fontes/calendario.json` (calendários com `nome` e `offset_minutos` = -180; aplicações por `dominio` e `classe`; feriados com `data`, `escopo`, `descricao`). Efeito: nas métricas, nenhuma mudança de número quando o L7-b entrar (teste de paridade); na aba Apontamento, os feriados nacionais passam a contar a partir da vigência (mudança de cálculo, com versão de critério e marca, já listada por `lerCriterios`, `repositorio.ts:116`).
3. **Carregador versionado, com versão de critério por domínio.** Entrada nova `ref:sync-calendario [AAAA-MM-DD]` em `server/src/entradas/` (molde de `ref-sync-ac.ts`, papel `dspd_ref`, `PG_REF_URL`), com o módulo em `server/src/modulos/referencia/` (molde de `criterios-acelerato.ts`). Grava:
   - `ref_calendario`: insere se não houver o nome;
   - `ref_calendario_aplicacao`: fecha a vigente com `vigente_ate` e abre a nova;
   - `ref_feriado`: só as datas novas, com `incluido_por_versao_id` da versão do domínio; a chave é `calendario_id, data`, então feriado já gravado não é sobrescrito; remover feriado é decisão a registrar, fora do L7-a;
   - uma `ref_versao_criterio` por domínio com o hash do arquivo e `vigente_desde` = a data do comando, e `ref_versao_criterio_metrica` com as métricas que usam horas ou dias úteis (a lista sai do código, pelas chamadas de calendário da biblioteca; o QA confere), mais `apontamento-capacidade` no BusinessMap, se esse id existir no catálogo da aba.
   - Arquivo com data inválida, escopo fora do `CHECK` ou classe desconhecida é recusado inteiro, sem gravar nada.
   - Sem GRANT novo: o papel `dspd_ref` já tem `SELECT, INSERT` e `UPDATE (vigente_ate)` nas `ref_` do core (`server/src/plataforma/db/grants.ts:124-125`). Arquivo sem pessoa.
4. **Leitura pelas métricas (L7-b).** `carregarBM` lê a classe `businessmap/fluxo` e `carregarAC` a classe `acelerato/sustentacao`, por uma função comum de leitura (generalização da leitura da aba, usada pelas duas rotas); sem linha na referência, vale `CALENDARIO_PADRAO` (o comportamento de hoje). Os dois domínios continuam com cargas e calendários separados: o BusinessMap nunca recebe o calendário do Acelerato.
5. **Turnos fora deste pedido.** O carregador não grava `ref_calendario_turno`, e a leitura usa os turnos padrão.
6. **Etapas sintéticas do Acelerato fora, como pendência.** Trocar o calendário em `intervalosDasEtapas` muda intervalos já gravados a cada reprojeção; fica para decisão própria (risco anotado), sem mudança neste pedido.

## Alternativas
- **Calendário único para os dois domínios:** descartada. O feriado aponta para uma versão de critério, que tem um domínio só; um calendário compartilhado obrigaria a marca T2.6 de um domínio a aparecer no outro, misturando BusinessMap e Acelerato.
- **Manter os feriados só no código (`FERIADOS_NACIONAIS`):** descartada. Não é referência versionada, não chega à aba Apontamento e acaba em 2026-12-25.
- **Arquivo inicial com feriados além dos que o código já tem (2027, estaduais, municipais, pontos facultativos):** descartada neste pedido. Seria dado inventado pelo time; o preenchimento é das pessoas.
- **Trocar o calendário também nas etapas sintéticas do Acelerato:** descartada neste pedido. Muda intervalos já gravados a cada reprojeção; fica como pendência para decisão própria.

## Consequências
- **Melhora:** a aba Apontamento passa a ter feriado assim que o dono rodar o `ref:sync-calendario`; feriados viram referência versionada, com data de vigência e marca T2.6 por domínio; as pessoas acrescentam feriados sem mudar código.
- **Piora:** dois calendários com os mesmos feriados de início pedem manutenção em dobro; a partir de 2027 nenhum feriado conta enquanto as pessoas não preencherem o arquivo; feriado acrescentado muda séries já publicadas a partir da vigência (efeito esperado de T2.6, com versão e marca no gráfico; o teste de paridade garante que a entrada do L7-b em si não muda nada).
- **A manter:** feriado gravado nunca é alterado; BusinessMap e Acelerato sempre com calendários e cargas separados; jornada (turnos) e plantão em horas corridas (briefing 4.2) continuam provisórios no código até decisão; etapas sintéticas do Acelerato (D-7) com `CALENDARIO_PADRAO` até decisão própria.
- **Fica para as pessoas e para o dono:** conferir os feriados nacionais 2025-2026 do arquivo inicial antes do primeiro `ref:sync-calendario`; preencher 2027 em diante, estaduais, municipais e pontos facultativos (o escopo do `CHECK` já os aceita); jornada; decidir se as etapas sintéticas do Acelerato usam o calendário da referência.

## Por que o existente não basta
Mecanismo novo: a entrada `ref:sync-calendario`. O existente para a mesma necessidade, e onde para:
- **`ac:ref-sync`** grava `dspd_ac.ref_dominio`; **`bm:ref-sync-apontamento`** grava `dspd_bm.ref_apontamento_*`. Nenhuma das entradas de referência existentes grava as tabelas de calendário.
- **Evidência de execução:** a Q18 do 064 mediu 0 linhas nas quatro tabelas de calendário; `grants.ts` é o único arquivo de `server/src` que cita `ref_feriado` e `ref_calendario_aplicacao` fora das leituras (achado L7 do 064).
- **`FERIADOS_NACIONAIS` no código** não é referência versionada nem chega à aba.
- Não há tabela nova: o carregador reaproveita as tabelas da migração 0010 e o molde do `ac:ref-sync`.

## Critério de reversão
Rever o calendário por domínio se o dono pedir um calendário único para os dois domínios, ou se a primeira carga real mostrar feriados divergentes entre os domínios sem motivo (sinal de que dois arquivos só duplicam trabalho).

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-11-04 | Proposta a partir do desenho 069 (E5); Q18 do 064 com 0 linhas nas tabelas de calendário; nenhum código do L7 escrito | pendente; primeira leitura na primeira carga real do `ref:sync-calendario` |

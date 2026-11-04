# 066: desenho da mudança do S8 (só incidentes com resposta)

Propósito: desenho curto da mudança da D-10 do plano 056 para o S8 (pedido 066, E1.1, K-217), para o `node-backend` (E1.2), o `react-frontend` (E1.3) e o `qa-engineer` (E1.5). Público: time. Autor: software-architect. Data: 2026-11-04. Leitura feita na worktree `/home/rodrigoisensee/MetricasDSPD-056d` (base `develop` 2b316e57).

Decisões do dono que este desenho cumpre (2026-11-04, "B" e "é isso"): o S8 conta só os incidentes com resposta (sim ou não); abaixo de 20 não publica e mostra dados insuficientes; a mudança de critério é registrada com data (T2.6); o cartão explica que falta preencher o campo no Acelerato; nada muda no Acelerato nem em outras métricas.

Origem: achado M5 de `docs/analises/064-lacunas-dado-real.md` (Q28: 195 incidentes, 186 `sem_resposta`, 9 `nao`, 0 `sim`; taxa 0% sobre 195).

## 1. Onde está a conta hoje

| Peça | Arquivo | O que faz hoje |
|---|---|---|
| Cálculo (biblioteca compartilhada) | `packages/metricas/src/acelerato/s8.ts` (`calcularS8`) | Já divide só pelos incidentes **informados**: exclui do denominador quem está em `ext.reincidenteAusente` (decisão 13 de 11/10), por mês e no total, com `taxa()` de `core/estatistica` (mínimo 20, `insuficiente` abaixo). `cobertura {n, total}` já existe. |
| Adaptador da fonte real (server) | `server/src/modulos/metricas/mapa.ts` (`extrasAC`) | Traduz `reincidente_90d` na extensão: `sim` vira `reabertoDe`; **não preenche `reincidenteAusente`**, então `nao`, `sem_resposta` e `null` entram todos no denominador. É aqui que mora a regra D-10 ("denominador = todos os criados"). |
| Uso no serviço | `server/src/modulos/metricas/servico.ts:283-284` | Só o S8 recebe a extensão real (`id === 'S8'`). O S12 não lê a extensão real (responde "sem dado real"), então não é afetado. |
| Versões de critério | `server/src/modulos/referencia/criterios-acelerato.ts` (`CRITERIOS_ACELERATO`) e a entrada `server/src/entradas/criterios-ac.ts` | Grava em `ref_versao_criterio` (domínio `acelerato`) as marcas `056:D-7` e `056:D-10`, idempotente pela `referencia`. |
| Cartão | `web/src/features/complementares/sustentacao.tsx` (`CartaoS8`) e `notas.ts` (nota S8) | Já mostra `AmostraInsuficiente` quando `total` é insuficiente e a linha de cobertura quando `n < total`. |

Conclusão: **a regra de cálculo da biblioteca não muda**. O que muda é a classificação do campo no adaptador, que hoje anula o mecanismo de ausência que a biblioteca já tem.

## 2. O que muda na conta

No `extrasAC` (`mapa.ts`):

- `sim` → `reabertoDe[id] = id` (como hoje).
- `nao` → informado, não reincidente (nada a marcar).
- `sem_resposta` e `null` → `reincidenteAusente[id] = true` (fora do denominador).
- A regra "sem nenhum chamado com o campo projetado → sem extensão" fica como está (todos `null`: `campoDisponivel: false`, "sem campo", nunca 0%).

Com isso, na base real medida no 064: `cobertura = {n: 9, total: 195}`, `total = {status: 'insuficiente', k: 0, n: 9, minimo: 20}`, `statusMeta = 'sem-referencia'`; cada mês sai `insuficiente`. Nenhum 0% é publicado.

Na biblioteca (`s8.ts`), só o comentário de cabeçalho muda: tirar "Dado fictício até a coleta real" e citar o 066 (o campo dos 90 dias com resposta sim ou não é o informado). Nenhuma métrica ganha cálculo próprio: a taxa, o mínimo de 20 e o corte por mês continuam no `calcularS8` e no `taxa()` da biblioteca. O adaptador só diz quem respondeu, como já fazia com `sim`.

BusinessMap e Acelerato continuam separados: a mudança está toda no domínio Acelerato.

## 3. Nova versão de critério (T2.6)

Nova entrada em `CRITERIOS_ACELERATO`, depois da `056:D-10` (a D-10 **não é editada nem apagada**: fica como histórico do critério anterior):

| Campo | Valor proposto |
|---|---|
| `referencia` | `066:S8-com-resposta` |
| `descricao` (até 300) | `S8 conta só os incidentes com resposta (sim ou não) no campo "Este problema já ocorreu nos últimos 90 dias?"; sem resposta fica fora do denominador e abaixo de 20 não publica` |
| `motivo` (até 500) | `Decisão do dono B (pedido 066, 2026-11-04): com 95% dos incidentes sem resposta, a D-10 (denominador = todos os criados) dava 0%. Substitui o denominador da D-10; a série inteira é recalculada pelo critério novo. Afeta S8.` |
| `metricas` | `['S8']` |
| `vigente_desde` | o dia em que a release chega à base real, gravado pela entrada `criterios-ac <AAAA-MM-DD>` (migrador, `devops-engineer`) junto com o deploy. Como a `056:D-10` já está gravada, rodar de novo grava só a nova. |

Onde marca o gráfico: o caminho já existe e não muda. `lerVersoes(db, 'acelerato')` → `BaseAC.config.criterios` → `criterios('S8', ...)` em `calcularS8` → `resultado.criterios.serie/janela` → `CartaoMetrica` mostra o `AvisoCriterio` no cartão do S8 quando a data cai no período. As duas marcas (D-10 e 066) aparecem enquanto as duas datas estiverem no período.

Risco conhecido (não muda aqui): `registrarCriteriosAcelerato` usa uma data só para todas as que faltam; numa base nova, D-7, D-10 e 066 ficariam com o mesmo dia. Aceito: já é o comportamento da D-7 e da D-10.

## 4. Contrato da API

- Schema de `resultadoS8` (`packages/contratos/src/schemas.ts`, fotografia `docs/contratos/snapshots/resultados/S8.json`): **não muda**. Nenhum campo novo, removido ou com tipo diferente; `taxa` já admite `insuficiente` por mês e no total, e `cobertura` já existe.
- Muda só o valor: `cobertura.n`, `meses[].informados` e `total.n` passam a contar os incidentes com resposta. Compatível pela política de contratos (só mudança de comportamento, nenhuma quebra de forma); o teste de compatibilidade da fotografia continua verde sem atualizar a fotografia.
- O exemplo de `docs/contratos/metricas/S8.md` vem do mock (não passa pelo `extrasAC`) e não muda.
- Texto a ajustar em `docs/api/metricas.md` (no E1.2, seção "Mudanças de comportamento" com data): na base real, informado = resposta `sim` ou `nao` no campo dos 90 dias; `sem_resposta` e sem valor ficam fora do denominador (pedido 066). E na linha 394, trocar "(D-10)" por "(D-10, denominador revisto no 066)".
- Documentos de arquitetura a acertar quando a mudança for mesclada (software-architect): `docs/architecture/data-model.md` §4 (parágrafo das versões de critério do Acelerato: acrescentar a entrada do 066) e o comentário de `extrasAC`.

## 5. O cartão (web muda, só texto)

O estado de dados insuficientes já tem padrão (`AmostraInsuficiente`); não há componente novo. Ajustes no `CartaoS8` e na nota:

1. **Explicação quando não publica** (pedida pelo dono): passar em `acoes` do `AmostraInsuficiente` do total o texto
   > Falta preencher no Acelerato o campo "Este problema já ocorreu nos últimos 90 dias?" dos incidentes. A taxa volta a ser publicada quando houver 20 incidentes com resposta (sim ou não).
2. **Leitura**: hoje, com `total` insuficiente, a leitura diz "0 de 9 dos incidentes ... são reincidentes", que soa como estatística publicada. Só montar a leitura quando `total.status === 'ok'`: `X% dos incidentes com resposta no campo de reincidência são reincidentes. Sem resposta fica fora da conta.` Insuficiente: sem leitura (o corpo explica).
3. **Linha de cobertura** (`cobertura-S8`, já aparece quando `n < total`): `Com resposta em 9 de 195 incidentes. A taxa considera só os que têm resposta (sim ou não).` ("incidentes", não "chamados").
4. **Tabela** `S8-meses`: coluna "Informados" vira "Com resposta"; legenda: `Incidentes com resposta no campo de reincidência (denominador da taxa), por mês de abertura`.
5. **Nota** S8 em `notas.ts`: `comoSeCalcula` passa a: `Incidentes com resposta "sim" ÷ incidentes com resposta (sim ou não) no campo "Este problema já ocorreu nos últimos 90 dias?", por mês de abertura. Sem resposta fica fora da conta. Só publica com 20 ou mais incidentes com resposta.`; `cuidados`: `Depende do preenchimento do campo no Acelerato: com menos de 20 incidentes com resposta, o cartão mostra dados insuficientes até o campo ser preenchido.` A nota atual ("ticket anterior") descreve o campo do mock, não o real.
6. Base do cabeçalho: fica `incidentes abertos` (n = 195) com `baseVariante="insuficiente"`, como hoje; a contagem dos com resposta está na linha de cobertura. Sem mudança de contrato.

Os textos finais podem ser afinados pelo `ux-designer` na revisão (passo 5 do fluxo); o conteúdo (falta preencher o campo, volta com 20) é decisão do dono.

## 6. Testes que provam

Server (`node-backend`, E1.2):
- `server/tests/metricas-acelerato-f2.test.ts`, caso "sim vira reincidente": passa a esperar `reincidenteAusente: {'3': true, '4': true}` (`sem_resposta` e `null`) e `nao` fora dele; renomear o título (não é mais "denominador = todos os criados").
- Mesmo arquivo, novo caso de API com o retrato do M5: 195 incidentes, 186 `sem_resposta`, 9 `nao`, 0 `sim` → `cobertura {9, 195}`, `total.status = 'insuficiente'`, `total.n = 9`, nenhum `meses[].taxa.status = 'ok'`, `statusMeta = 'sem-referencia'` (nunca 0%).
- Caso de fronteira: 20 com resposta (ex.: 2 `sim`, 18 `nao`) e 50 `sem_resposta` no mesmo mês → `total = {ok, k: 2, n: 20, pct: 10}`; com 19 com resposta → `insuficiente`.
- `server/tests/painel-real-f6.test.ts:179-184`: `cobertura` passa de `{3, 3}` para `{2, 3}` (o `sem_resposta` sai).
- `server/tests/criterios-acelerato.test.ts` (CT-49): três entradas, a nova com `066:S8-com-resposta` e `['S8']`; idempotência e limites de coluna como estão.
- A base fictícia em modo mock não muda (extensão mockada).

Biblioteca: nenhum teste novo obrigatório; `packages/metricas/src/complementares.test.ts:274-304` já prova denominador = informados e `taxa.n = informados`. Opcional: um caso com todos os informados abaixo de 20 e muitos ausentes → `insuficiente`.

Web (`react-frontend`, E1.3):
- Teste de componente do `CartaoS8` com resposta ajustada (`total` insuficiente, `cobertura {9, 195}`): mostra `amostra-insuficiente-S8` com o texto do campo do Acelerato, não mostra a leitura com "k de n", mostra `cobertura-S8` com "Com resposta em 9 de 195 incidentes".
- Com `total` ok: leitura com a porcentagem, sem o texto do campo.
- `e2e/tests/complementares.spec.ts` COMP-12 (linhas 208-209) usa o texto "com o campo de reincidência informado" e a coluna "Informados": atualizar para os textos novos.

## 7. Divisão e ordem

1. E1.2 `node-backend`: `extrasAC`, comentário do `s8.ts`, nova entrada em `CRITERIOS_ACELERATO`, testes do server, `docs/api/metricas.md`.
2. E1.3 `react-frontend`, em paralelo (o contrato não muda): textos do `CartaoS8` e da nota, testes de componente e COMP-12.
3. Deploy: `devops-engineer` roda `criterios-ac <dia do deploy>` com o migrador depois de aplicar a release (grava só a `066:S8-com-resposta`).

Segurança: sem gatilho (nenhum dado de pessoa, segredo, dependência, banco ou coluna nova; `reincidente_90d` já está na allow-list e no GRANT do `dspd_api`).

Critério de reversão: se o dono pedir de volta o denominador de todos os criados, ou se a cobertura do campo passar a ser total (`cobertura.n = cobertura.total` na base real), a distinção deixa de mudar o número; reverter é tirar a marcação de ausente no `extrasAC` e registrar nova versão de critério com data (a `066` fica no histórico).

# 089 E1.1: plano para aplicar D2 e D3 do K-213 (execução técnica fora de `sem-vinculo`; rótulo "Sem comentário")

Parecer do software-architect (pedido 089). Só leitura de código; nada foi rodado contra a base, sem commit. Código lido na worktree `/home/rodrigoisensee/MetricasDSPD-052h` (branch `feature/089-apontamento-d2-d3`, igual à `develop` 129fc3d5). Caminhos relativos à raiz do repositório (na worktree). Decisão do dono (2026-11-10 21:32): D2 = A e D3 = A.

Conformidade: sem gatilho de segurança. Nenhum dado novo, nenhuma coluna de pessoa, nenhum texto de comentário persistido; a classificação continua na fronteira do coletor. Não afrouxa regra nem controle. Nenhuma ADR nova: é mudança de critério dentro do mecanismo existente (`ref_versao_criterio`, T2.6).

## 1. Resumo da decisão técnica

1. A regra mora num lugar só: o classificador puro. Troca-se a condição do bit `sem-vinculo` ali; o servidor não repete a regra.
2. O dado já gravado muda pela **carga**, não pela leitura e não por UPDATE em massa: a releitura da janela (90 dias na varredura diária, 12 meses aos domingos) reclassifica, e a staging é append-only (nova versão por linha cujo hash muda). Nenhum histórico é sobrescrito.
3. A versão de critério com data entra por duas linhas em `ref_versao_criterio`: a do dicionário (carregada por `ref:sync`, que o rótulo novo já força) e uma do critério de `sem-vinculo` (por `CRITERIOS_APONTAMENTO`). A marca nos gráficos hoje **não aparece com dado real** (achado de fábrica, seção 5): sem a correção do `id`, a T2.6 não é cumprida.
4. `execucao-tecnica` "à parte" não exige campo novo de contrato: a distribuição por subgrupo já traz a contagem e a participação em horas. A tela ganha uma nota e um atalho no cartão de Qualidade.

## 2. Onde a flag é calculada e gravada (hoje) e o que muda

| Ponto | Arquivo:linha | Hoje | Muda para |
|---|---|---|---|
| Cálculo da flag | `packages/metricas/src/coletor/classificarApontamento.ts:198-199` | `sem-vinculo` se subgrupo é `execucao-tecnica` **ou** `nao-classificado` | só `nao-classificado` |
| Comentários e constantes | mesmo arquivo `:11-13`, `:66-67` | descrevem os dois residuais como vínculo faltante | texto: `execucao-tecnica` é cobertura do dicionário, não falha de preenchimento |
| Gravação (hash inclui a máscara) | `server/src/modulos/businessmap/apontamento/registro.ts:130-135` | `flags_qualidade` entra no `registro_sha256` | sem mudança de código; é isso que faz a releitura gerar versão nova |
| Projeção no fato | `server/src/modulos/businessmap/apontamento/gravacao.ts:64-81` | UPDATE só se o hash muda; preserva bits 8 e 16 (`& 24`) | sem mudança; bit 4 é reescrito pela máscara nova, bits 8 e 16 seguem preservados |
| Staging append-only | `gravacao.ts:48-55` | INSERT de versão nova quando o hash difere | sem mudança |
| Comentário de documentação | `registro.ts:14-16` | cita bit 4 como vínculo | ajustar o texto |
| Leitura da máscara | `server/src/modulos/apontamento/servico.ts:48-51` (`flagsDaMascara`) e `:64` | traduz bits 1 a 3 do que está gravado | sem mudança (a regra não é repetida aqui) |
| Rótulo de fallback | `server/src/modulos/apontamento/servico.ts:19` (`ROTULO_RESIDUAL`) | `'Não classificado'` | `'Sem comentário'` |
| Rótulo vigente (fonte) | `docs/architecture/fontes/apontamento-dicionario.json:15` e `:2` (`versao`) | `"Não classificado"`; `2026-11-02-v2` | `"Sem comentário"`; versão nova (ex. `2026-11-10-v3`) |
| Leitura do rótulo | `server/src/modulos/apontamento/repositorio.ts:76-79` | `SELECT codigo, rotulo FROM ref_apontamento_subgrupo` **sem** `vigente_ate IS NULL` | ver seção 5, item B: sem o filtro, o rótulo antigo e o novo coexistem |

Observação sobre o efeito: depois da mudança, `sem-vinculo` (bit 4) passa a ser um subconjunto de `sem-comentario` (bit 1), porque `nao-classificado` exige comentário vazio (`classificarApontamento.ts:191-192`). Ver pergunta Q1.

## 3. Versão de critério (T2.6) e dado já gravado

### 3.1 O que registrar
- **Dicionário** (`server/src/modulos/businessmap/apontamento/dicionario.ts:177-233`): trocar o rótulo no JSON muda o subgrupo (fecha a linha antiga e abre a nova, `:141-143`, `:217-223`) e, com diferença, registra sempre uma versão (`:209-214`). O `versao` do arquivo precisa mudar: carregar outro conteúdo com o mesmo rótulo é recusado (`:196-201`). A data é a da carga (`hoje`).
- **Critério de `sem-vinculo`**: nova entrada em `CRITERIOS_APONTAMENTO` (`server/src/modulos/referencia/criterios-apontamento.ts:15-29`), por exemplo `referencia: '089:sem-vinculo-so-sem-comentario'`, `metricas: [METRICA_ACHADOS_APONTAMENTO]`. A descrição diz: "execução técnica deixa de contar em sem-vínculo; só o apontamento sem comentário continua; rótulo Não classificado vira Sem comentário". Registrada pela entrada `server/src/entradas/criterios-apontamento.ts` com a data de vigência. Idempotente pela `referencia`. Não editar as linhas já registradas (059, 067).
- **Data de vigência** = dia da primeira varredura completa que reclassifica (3.2), nunca anterior à última versão do dicionário (`dicionario.ts:203-208`). As duas versões saem no mesmo dia.

### 3.2 O que acontece com o já gravado
- O coletor reclassifica o que relê. A varredura diária relê 90 dias; a de domingo, 12 meses (`server/src/modulos/businessmap/apontamento/coleta.ts:26`, `:305`, `:310-311`). A carga inicial é de 12 meses, então a varredura de domingo cobre todo o histórico.
- Como `versao_dicionario` e `flags_qualidade` entram no hash (`registro.ts:130-135`), **toda** linha relida ganha uma versão nova na staging e o fato é atualizado. A versão antiga continua na staging: nada é sobrescrito.
- **Proibido** migração com `UPDATE fato_apontamento SET flags_qualidade = flags_qualidade & ~4`: reescreveria o estado sem versão na staging e sem a `versao_dicionario` nova.
- **Proibido** recalcular só na leitura (mascarar o bit em `servico.ts:64`): duplicaria a regra num segundo lugar, deixaria o número do banco (Q16 e consultas diretas) diferente do da tela, e viola "cálculo de métrica pela biblioteca".
- Janela mista: entre o deploy e a varredura completa, linhas com mais de 90 dias ainda trazem o bit antigo. Mitigação: após o deploy, a sequência é **(1) `ref:sync` do dicionário novo, (2) registrar o critério de `sem-vinculo`, (3) coleta com janela de 12 meses** (a mesma varredura de domingo, disparada na hora; o node-backend confirma o comando em `coleta.ts:305-314`). Se a ordem for outra, linhas relidas antes do passo 1 ficam com `versao_dicionario` antiga e flags novas.
- Oráculo de término (rodado por quem tem acesso, fora do escopo desta etapa): zero linhas ativas com `subgrupo_codigo = 'execucao-tecnica' AND (flags_qualidade & 4) <> 0` e zero com `versao_dicionario` diferente da vigente.
- Volume: como `versao_dicionario` muda, a primeira varredura completa grava uma versão nova na staging para cada apontamento ativo (ordem de 16 mil na base atual, segundo a 064). Cabe no orçamento (ADR 0003); o node-backend confere o tempo da coleta.
- Linhas excluídas na origem (`excluido_em`) não são relidas e mantêm o bit antigo; a tela não as lê (`repositorio.ts:40`).

### 3.3 Leitura histórica
Os cartões calculam sobre o fato atual do período escolhido. Depois da varredura completa, todo o histórico lido mostra o critério novo; a marca (T2.6) indica a data em que o critério mudou e que o que foi publicado antes dela usava a regra anterior. Não há série "as-of" por versão.

## 4. Impacto na tela e no achado

### 4.1 Achado `nao-classificado-alto` (`packages/metricas/src/businessmap/apontamento/achados.ts:43-49`)
- A condição não muda: participação em horas do subgrupo `nao-classificado` com piso de 20 (`pctComPiso`, `distribuicao.ts:29`) e limiar 20% (`achados.ts:8`). O que muda é o significado: agora mede "sem comentário (e sem regra por tipo)", não "dicionário incompleto".
- **Manter o código** `nao-classificado-alto` e o id `nao-classificado`: o código é contrato versionado (`packages/contratos/src/apontamento.ts:328-335`, `:348`) e o id é chave de filtro. Renomear é quebra de contrato sem ganho. Só o texto muda.
- Constantes internas (`SUBGRUPO_NAO_CLASSIFICADO_ID`, `naoClassificadoPct`): não renomear.
- Frase (`web/src/features/apontamento/textos.ts:233`): sai "caíram em 'Não classificado'. O dicionário de subgrupos pode estar incompleto." (falsa depois de D2) e entra algo como "caíram em 'Sem comentário'. Falta comentário no apontamento." A redação final é do `ux-designer` (E1.4). Atalho (`textos.ts:236`): "Ver apontamentos sem comentário".
- A descrição já registrada em `ref_versao_criterio` para o limiar (`criterios-apontamento.ts:18`, "não classificado 20% das horas") é histórico: não se edita; a linha nova registra a mudança.
- Sobreposição com `sem-comentario-alto` (`achados.ts:51-57`): ver Q2.

### 4.2 Tela (react-frontend)
- Rótulo: `web/src/features/apontamento/fixture.ts:183`, `:342`, `:360`; `textos.ts:154` (a frase "'Não classificado' mostra apontamentos que o dicionário não reconheceu. Se esse grupo for grande, o dicionário precisa de ajuste" fica falsa); `components/CartaoDistribuicao.tsx:146` (botão "Ver apontamentos não classificados"); fixtures e2e `e2e/fixtures/apontamento-respostas.json` (campo `rotulo` de `nao-classificado`, linhas 42, 154, 1047, 1170, 1682, 1794, 2687, 2799, 3693, 3805, 4787, 4899, 6180); testes `barra-e-ramos.test.tsx`, `unidades.test.ts`, `apontamento.test.tsx`, `operacional/` não é afetado.
- `execucao-tecnica` à parte: no cartão de Qualidade geral (`components/CartoesQualidade.tsx:82-105`), uma nota fora da lista de flags: "Execução técnica (comentário que o dicionário não reconheceu): N apontamentos (X% das horas)", lida de `resposta.distribuicao.porSubgrupo` (id `execucao-tecnica`: `apontamentos` e `participacao`, já com piso de 20), mais atalho de filtro `subgrupo = execucao-tecnica`. Nenhum percentual é calculado no front; se o UX quiser percentual em apontamentos e não em horas, vira campo novo na biblioteca (`qualidade.ts`) e no contrato, e este plano volta ao arquiteto.
- Efeito nos números: `completos` (`qualidade.ts:24`) sobe, porque comentário com 4 ou mais palavras sem termo do dicionário deixa de ter flag. `sem-comentario`, `generico`, `sem-iniciativa` e `valor-atipico` não mudam. A leitura do "95,8% com flag" da 087 muda de patamar; o parecer de QA deve dizer isso.
- O flag `FLAGS['sem-comentario']` (`textos.ts:49`, "Sem comentário") e o subgrupo "Sem comentário" passam a ter o mesmo nome com universos diferentes (flag = qualquer apontamento sem comentário; subgrupo = sem comentário e sem regra por tipo: Kaizen e Incidente vazios vão para outros subgrupos). A nota "Como ler" do cartão de subgrupo deve dizer isso. Revisão do UX.
- Limite conhecido: o texto do comentário não é persistido (allow-list). O "insumo para ampliar o dicionário" é a contagem e o filtro por card/projeto; quem amplia o dicionário lê os comentários direto no BusinessMap. Não propor guardar comentário.

## 5. Achados de fábrica (pré-existentes, bloqueiam o cumprimento de E1)

**A. A marca T2.6 do dicionário nunca chega à tela com dado real.** O servidor devolve `id` = número da versão (`server/src/modulos/apontamento/repositorio.ts:101-111`, `id: String(l.versao_id)`; o teste `server/tests/apontamento-rota.test.ts:85` fixa `'5'`). O front só desenha marca se `id.startsWith('dicionario')` (`web/src/features/apontamento/components/CartoesQualidade.tsx:98`, `CartaoDistribuicao.tsx:124`, `CartaoApontamento.tsx:58`) e o de capacidade se começa com `calendario` (`CartoesCapacidade.tsx:91`, `:145`). Só as fixtures usam `dicionario-v2`/`calendario-v1` (`fixture.ts:375-376`). Correção só no servidor: `lerCriterios` devolve `id` com prefixo da família, derivado do que a versão alterou (subgrupo, termo ou regra do dicionário e a nova `referencia` `089:` → `dicionario-<versao_id>`; feriado → `calendario-<versao_id>`; limiares → `achados-<versao_id>`). Sem mudança no front nem no contrato (`marcacaoCriterioSchema.id` é `string`). Atualizar `apontamento-rota.test.ts:85` e o pg-test de `lerCriterios` (`apontamento-rota.pg.test.ts:268-273`).

**B. Rótulo duplicado depois do `ref:sync`.** Com a troca de rótulo, `ref_apontamento_subgrupo` passa a ter a linha antiga (`vigente_ate` preenchido) e a nova. `lerRotulosSubgrupo` (`repositorio.ts:76-79`) lê as duas e monta um `Map`: o rótulo que vence depende da ordem de retorno. Correção: `WHERE vigente_ate IS NULL` (o dicionário vigente, como em `dicionario.ts:168`, `:247`). Sem isso, E2 pode aparecer na tela ou não.

## 6. Divisão de trabalho (sem arquivo em comum)

**node-backend (E1.2)**
- `packages/metricas/src/coletor/classificarApontamento.ts` (`:198-199` e comentários) e `classificarApontamento.test.ts` (linhas ~38-45 do teste de servidor e `:242-248` do da biblioteca: `sem-vinculo` só no `nao-classificado`; caso novo: comentário com 4 ou mais palavras sem termo = nenhuma flag).
- `packages/metricas/src/businessmap/apontamento/achados.ts` (comentário, sem mudança de código) e `apontamento.test.ts`.
- `server/src/modulos/apontamento/servico.ts:19`; `server/src/modulos/apontamento/repositorio.ts:76-79` (filtro de vigência) e `:101-111` (id com prefixo de família).
- `server/src/modulos/businessmap/apontamento/registro.ts:14-16` (comentário).
- `server/src/modulos/referencia/criterios-apontamento.ts` (nova entrada) e, se necessário, `server/src/entradas/criterios-apontamento.ts`.
- `docs/architecture/fontes/apontamento-dicionario.json` (`versao` e rótulo), `docs/architecture/features/059-dicionario-apontamento.md:36-37,59,85,118`, `docs/architecture/features/059-aba-apontamento.md:154`, `docs/api/apontamento.md` se citar o rótulo.
- Testes de servidor: `server/tests/apontamento-classificador.test.ts`, `apontamento-dicionario.test.ts`, `apontamento-dicionario.pg.test.ts`, `apontamento-rota.test.ts`, `apontamento-rota.pg.test.ts`, `apontamento-montagem.test.ts`. Teste novo: releitura com a máscara nova gera versão nova na staging, mantém a antiga e preserva os bits 8 e 16.
- Sem alteração de contrato (`packages/contratos`) e sem migração de esquema.

**react-frontend (E1.3)**
- `web/src/features/apontamento/**` exceto o que o servidor decide: `textos.ts` (`:154`, `:233`, `:236`), `fixture.ts` (`:183`, `:342`, `:360`), `components/CartaoDistribuicao.tsx:146`, `components/CartoesQualidade.tsx` (nota de execução técnica), `filtros.ts` se o rótulo de `sem-vinculo` mudar (depende de Q1), e os testes `barra-e-ramos.test.tsx`, `unidades.test.ts`, `apontamento.test.tsx`.
- `e2e/fixtures/apontamento-respostas.json` (rótulos) e o E2E que as usa.
- `docs/ux/059-aba-apontamento-textos.md:44,84,91,159` (textos), com o `ux-designer` revisando na E1.4.
- Pode rodar em paralelo com o node-backend: o acordo entre os dois é só o rótulo `Sem comentário`, o id `nao-classificado` (inalterado) e o prefixo `dicionario-` do `id` de critério (o front já o espera).

QA (E1.6): oráculos da seção 3.2 e conferência de que a marca aparece com o `id` novo.

## 7. Perguntas ao dono (regra de negócio; sem decisão por inferência)

**Q1. O que fazer com o flag `sem-vinculo`, que deixa de significar "sem vínculo" e vira subconjunto de "sem comentário"?** Hoje ele aparece na tela como "Sem vínculo claro" (`textos.ts:51`) e como filtro de Qualidade. Depois de D2, ele conta exatamente quem não tem comentário e nenhuma regra por tipo capturou, quase o mesmo que `sem-comentario`.
Recomendação: manter o bit, o contrato e o rótulo como estão neste pedido (sem quebra de contrato nem de histórico) e rever com dado real depois da varredura se o flag ainda informa algo além de `sem-comentario`. Sem resposta, vale a recomendação.

**Q2. Manter os dois achados, `nao-classificado-alto` (horas em "Sem comentário") e `sem-comentario-alto` (apontamentos sem comentário)?** Depois de D3 eles dizem quase a mesma coisa, com bases diferentes (horas e apontamentos) e o mesmo limiar de 20%.
Recomendação: manter os dois neste pedido, só com o texto corrigido (o código é contrato), e decidir a fusão quando o limiar provisório for revisto com 4 semanas de dado real (a regra do pedido 059, pergunta 7). Sem resposta, vale a recomendação.

**Q3. Data de vigência da versão nova.** Recomendação: a data da primeira varredura completa (3.2), que é quando os números publicados passam a seguir o critério novo; não a data da decisão (2026-11-10). Sem resposta, vale a recomendação.

Melhoria vista: sim, a marca T2.6 do dicionário não aparece com dado real (id numérico no servidor contra `startsWith('dicionario')` no front; `repositorio.ts:111`, `CartoesQualidade.tsx:98`, `apontamento-rota.test.ts:85`), e `lerRotulosSubgrupo` não filtra a vigência (`repositorio.ts:76-79`). Ambos entram no escopo da E1.2.

# Changelog

Formato conforme `docs/engineering/fluxo-homologacao.md` §8; versões pelo SemVer (enquanto `0.x`, MINOR absorve o que seria MAJOR). Escrito à mão a partir dos Conventional Commits de `origin/homolog..origin/develop`.

## [Não publicado]

### Adicionado
- Painel: BLOQUEADOS e O5 sem dado real até a coleta gravar bloqueios (pedido 065) (#214).
- Aba Apontamento: dia atípico acima de 10 h (pedido 067) (#215) e aviso de coleta parcial (pedido 069, lote M1-a) (#219).
- Sustentação: S8 conta só incidentes com resposta (pedido 066) (#216).
- Métricas: O2 e parados por etapa acham as colunas pela equipe (pedido 069, lote L3-a) (#217).
- BusinessMap: mapa de campos e `bm:ref-sync` (lote L2-a) (#220) e projeção das colunas de lista do `dim_card` (lote L2-b) (#221).
- Acelerato: S3 e S2 sem zero falso nos campos que o Acelerato não traz (lote L9-a) (#225) e campos de etapa até o staging (lote L9-b) (#224).
- Documentação: plano, ADR 0025 e especificação do aviso de registro incompleto (pedido 063) (#212).
- Referência: calendário por domínio (BusinessMap e Acelerato) em arquivo versionado e `ref:sync-calendario`, começando pelos feriados nacionais 2025-2026 do código (pedido 069, lote L7-a; ADR 0027) (#222).
- Métricas do fluxo e da sustentação leem o calendário da referência do próprio domínio (pedido 069, lote L7-b) (#232).
- Painéis: dado simulado por cartão com o selo Simulado onde ainda não há dado real, fora do Resumo, da Visão geral e da exportação (pedido 070, L1 e L2) (#230); E2E de API do simulado e medição C6 no perf-api (pedido 070, L3) (#233).
- Documentação: ADR 0028 e desenho do 070 passam a vigente (#234).
- Acelerato: projeção das colunas da F3 na `dim_chamado` (campo de etapa repetido vale o último valor preenchido, vazio nunca apaga) e comando `ac:apoio-l9c` (pedido 069, lote L9-c) (#238); `ac:ref-sync` registra versão a cada mudança de vigência (E10 L1) (#252); a coleta recusa lista fechada sobrescrita (E10 L2) (#258); listas de `ref_dominio` no CA-8 do coletor (#244); categoria do erro nas entradas de referência (pedido 081) (#264).
- BusinessMap: domínio `motivo_bloqueio` no `bm:ref-sync` (pedido 075, lote 3) (#246); derivador puro de bloqueio por comparação de versões (lotes 2a e 2b, marcos de saída e fornecedor) (#248, #257); projetor grava `evt_bloqueio` idempotente (lote 4a) (#260) e monta `fato_bloqueio` dos eventos (lote 4b) (#266); versão de critério e corte do O1, com data pendente (lote 6a) (#267).
- Bloqueios: BLOQUEADOS, O2 e O19 aceitam e leem o motivo "não classificado", com 8 motivos no O19 (pedido 075, lotes 1a e 1b) (#245, #247); a tela mostra o motivo não classificado (lote 5a) (#253). Os interruptores `BLOQUEIOS_COM_DADO_REAL` e `AJUSTE_PRIORIDADE_COM_FONTE` seguem desligados.
- Tendências (pedido 077): janela incompleta nos contratos, nas tendências e nas telas do fluxo e da sustentação (#249, #254, #261, #269); herdam as marcações de critério (#251); `historicoDesde` do BusinessMap (#259); ressalva do S2 na tendência de SLA, contrato e tela (#262, #276); contagem parcial do mês anterior ao histórico, no servidor e na tela (#272, #278); tendência do fluxo com dado real do BusinessMap (lote 5) (#279) e tendência da sustentação com dado real do Acelerato (lote 7, `TENDENCIA_SUST` no mapa real, fora da simulação) (#285).
- Demonstração: comando único `pnpm run demo:dado-real` (pedido 087), que confere só os nomes do `.env`, sobe o banco, migra, faz a carga inicial do BusinessMap, do Acelerato e do apontamento, projeta, sobe API e web e imprime a consulta de prova do 075 (só contagens); para no primeiro erro, com etapa e categoria. Só roda com o `.env` do dono (#284).
- Documentação: ADR 0023 vigente e pareceres de segurança do E1 (pedido 073, E2) (#243); pareceres antigos trazidos para a `develop` (#241); retrospectivas dos pedidos 079 a 083 (#277).

### Corrigido
- Painéis: gate de fronteiras do 070, sem import do pacote mock na fonte com simulado e F9 abaixo de 120 KB (#231); marca d'água SIMULADO em SVG, sem violação de contraste do axe (bug 070-001) (#233).
- Suíte: trava em `/tmp/claude-uid` (pedido 079) (#263); teste da trava não pendura dentro do `pronto` (pedido 085) (#280); E2E L3-01 espera a altura da página estabilizar antes do axe (pedido 080) (#265).
- Testes: regra de fronteira do eslint cobre todo `src` fora de `modulos` (pedido 073, E4) (#240); sustentação sem início de histórico do Acelerato (077, lote 3b) (#273); colunas e GRANT de `fato_bloqueio` e `evt_bloqueio` (075, lote 4c) (#274).
- Entradas: `ref-sync-apontamento` imprime só a categoria do erro, como `ref-sync-ac` e `ref-sync-businessmap` (K-244) (#283).
- Ferramentas: pre-push com lint e typecheck só nos arquivos e pacotes alterados (pedido 083) (#268, #270).

### Desempenho
- Nenhuma mudança nesta versão.

### Mudanças que quebram
- Migração 0035 (pedido 069, L9-c, decisão do dono D-L9-1): `previsao_retorno` de `dim_chamado` e `dim_chamado_versao` passa de `timestamptz` a booleano "tem previsão de retorno"; a coluna nunca foi projetada e está nula, a migração recusa a troca sem alterar nada se achar valor, e recria as três views que a leem (#238). `down` volta o tipo só com a coluna toda nula.
- A primeira coleta do Acelerato depois do L9-c recusa com `parametros-mudaram` até o reconhecimento: rode `pnpm coleta ac --reconhecer-mudanca` uma vez (o hash `fluxo_sha256` entrou nos parâmetros comparados) (#238).

### Mudanças de critério de cálculo
- 2026-11-04, aba Apontamento: limite do dia atípico passa de 16 h para 10 h; só marca, nunca descarta (decisão do dono, pedido 067; versão `067:limite-dia-atipico`) (#215).
- 2026-11-04, S8 (Acelerato): conta só incidentes com resposta; sem resposta sai do denominador e abaixo de 20 não publica (decisão do dono, pedido 066; versão `066:S8-com-resposta`) (#216).
- Pedido 065: versão de critério registrada em `core/criterios.ts` para BLOQUEADOS e O5 (#214).
- Lote L9-b: versão `069:L9-b-campos-etapa`, sem métrica afetada (#224). L3-a e L9-a não recalculam e ficam sem versão.
- Lote L7: o calendário passa a vir da referência; com o arquivo inicial nenhum número muda (teste de paridade); cada mudança do arquivo aplicada pelo `ref:sync-calendario` grava versão de critério do domínio, com data e marca (ADR 0027) (#222, #232). O simulado do 070 não entra em cálculo e fica sem versão.
- Pedido 075: versão de critério e corte da série do O1 com data pendente; sem dado real de bloqueio, BLOQUEADOS, O2, O19 e O5 seguem sem a parte de bloqueio (`BLOQUEIOS_COM_DADO_REAL` desligado) (#267).
- Pedido 077: janela incompleta, contagem parcial e ressalva do S2 marcadas nas tendências; as marcações herdam a versão de critério (#251, #262, #272, #276). Lotes 5 e 7: versões de critério de `TENDENCIA_FLUXO` e `TENDENCIA_SUST` com data 2026-11-10, ao passarem para dado real (#279, #285).

### Dependências e Forge
- `zod` 4 e `ws` 8.22.0 para 8.22.1 (#218).
- Forge 0.32.0 (#223). Sem dependência nova; `server/package.json` ganha só o script `ref:sync-calendario` (#222).
- Forge 0.33.0, 0.34.0, 0.42.0, 0.44.2 e 0.45.2 (#239, #250, #271, #275, #281).
- Dependências: grupos `producao` (#256) e `dev-dependencies` (#255) do Dependabot; `body-parser` 1.20.9, `qs` 6.16.1 e `ip-address` 10.7.4 no lockfile (pedido 073, E8) (#242).

## [0.2.0] - 2026-10-29

### Adicionado
- Painel Operacional: métricas operacionais do lote 3 (O19 a O26) (#152).
- Cadastro simulado de membros no mock, com ids opacos e sem dado de pessoa, e T14 sem agregado dedutível (K-112, K-130) (#161).
- Trava de suíte única, comum a todas as worktrees (#156).
- Contrato da O23 em `docs/contratos/metricas/O23.md`, sem lacunas e com as regras decididas pelo dono (K-093, K-180) (#163, #164).
- CI e homologação: E2E dividida em 2 partes com agregador (#154, #159); `homolog-aprovada` sem espera paga e reavaliação por `workflow_run` (K-108) (#153); proteção da `develop` pelo ruleset 25003880 com 9 checks (K-148) (#148).
- Documentação: textos do lote 3 das métricas também disponíveis (K-154) (#155); política do Dependabot (K-169) (#160); leitura de "enviada" como PR para a `develop` (K-162) (#157).

### Corrigido
- Web: `develop` voltou ao verde após o Dependabot (`no-deprecated` do `matchMedia`, aquecimento do teste da PV1) (K-151) (#149).
- Teste do servidor `SELECT *` que estourava 30 s (K-150) (#158).
- Testes E2E do 041 estabilizados (F4, helper único, Monte Carlo, CLS) (#150).

### Desempenho
- Nenhuma mudança nesta versão.

### Mudanças que quebram
- Contrato do resultado da T14 (`resultadoT14`): união discriminada por `oculto`; o bloco oculto traz só `meuTime.k` e o visível traz `outrosTimes` inteiro. Aceito pelo dono (T14-M1 = B e Q-T14-12 = B), sem consumidor publicado (#161).

### Mudanças de critério de cálculo
- 2026-10-28, T14: `total` do bloco, `base.n` e `base.complemento.n` passam a somar só os times visíveis; time oculto não entra em soma. Visíveis ordenados por total decrescente e código; ocultos depois, só por código (T14-M1 = B, Q-T14-12 = B, K-130) (#161).

### Dependências e Forge
- `react-router` 7.18.4 para 8.5.0 (#147); `@tanstack/react-query` 5.104.2 para 5.104.5 (#146); `typescript-eslint` 8.71.2 para 8.72.0 (#145).
- Forge atualizado para 0.30.3 (#151) e registrado em 0.30.5 (#162).

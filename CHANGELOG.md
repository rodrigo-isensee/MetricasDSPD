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

### Corrigido
- Painéis: gate de fronteiras do 070, sem import do pacote mock na fonte com simulado e F9 abaixo de 120 KB (#231); marca d'água SIMULADO em SVG, sem violação de contraste do axe (bug 070-001) (#233).

### Desempenho
- Nenhuma mudança nesta versão.

### Mudanças que quebram
- Nenhuma. Sem migração de esquema nesta versão.

### Mudanças de critério de cálculo
- 2026-11-04, aba Apontamento: limite do dia atípico passa de 16 h para 10 h; só marca, nunca descarta (decisão do dono, pedido 067; versão `067:limite-dia-atipico`) (#215).
- 2026-11-04, S8 (Acelerato): conta só incidentes com resposta; sem resposta sai do denominador e abaixo de 20 não publica (decisão do dono, pedido 066; versão `066:S8-com-resposta`) (#216).
- Pedido 065: versão de critério registrada em `core/criterios.ts` para BLOQUEADOS e O5 (#214).
- Lote L9-b: versão `069:L9-b-campos-etapa`, sem métrica afetada (#224). L3-a e L9-a não recalculam e ficam sem versão.
- Lote L7: o calendário passa a vir da referência; com o arquivo inicial nenhum número muda (teste de paridade); cada mudança do arquivo aplicada pelo `ref:sync-calendario` grava versão de critério do domínio, com data e marca (ADR 0027) (#222, #232). O simulado do 070 não entra em cálculo e fica sem versão.

### Dependências e Forge
- `zod` 4 e `ws` 8.22.0 para 8.22.1 (#218).
- Forge 0.32.0 (#223). Sem dependência nova; `server/package.json` ganha só o script `ref:sync-calendario` (#222).

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

# Changelog

Formato conforme `docs/engineering/fluxo-homologacao.md` §8; versões pelo SemVer (enquanto `0.x`, MINOR absorve o que seria MAJOR). Escrito à mão a partir dos Conventional Commits de `origin/homolog..origin/develop`.

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

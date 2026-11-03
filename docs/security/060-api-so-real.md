---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 110e4678705dfd44eb72d647c4b2a49d3ebe1981
parecer: reprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: 060-api-so-real (P2, P3 e a parte de servidor do P5 do plano 060-sem-mock)

Diff revisado: `3c284ff...110e467` (E2.12 e voltas 1 a 3, 41 arquivos). Li inteiros `config.ts`, `entradas/api.ts`, `app.ts`, `metricas/servico.ts`, `metricas/rotas.ts`, `contratos/src/origem.ts`, `guarda-seed.ts`, `seed.ts`, as guardas da coleta e do projetor das duas fontes, `docker-compose.homolog.yml` e `scripts/com-api-mock.sh`; os testes e o `openapi.json` (regenerado) por amostra. Contexto conferido fora do diff: `docker-compose.yml`, `scripts/dev.sh`, `grants.ts`, `repositorio-pesquisa.ts`. De `110e467` até a ponta atual entra só o parecer de devops (`docs/devops/`). Revisão estática; nada rodou no banco e nenhum arquivo `.env*` foi lido. Referências: `docs/architecture/060-sem-mock.md` (P2, P3, P5) e a ADR 0026 (worktree 052b).

## Gatilhos
Configuração de ambiente (variáveis da API, recusa na partida), banco (trava `dspd:seed` nas guardas, contagem de `stg_webhook_evento` no seed), Docker (compose de homologação), R-SEGURANCA.

## Resumo
1. **Variáveis antigas recusadas.** `config.ts:134-140`: `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED` presentes, mesmo vazias, derrubam a partida antes da validação; a mensagem traz só os nomes (teste confere que o valor não aparece). `DSPD_MODO_MOCK` só aceita o literal `homologacao` (`config.ts:35`). Fecha o A1 de `052-f6-painel.md` (a variável do prefixo saiu).
2. **Mock só por ativação explícita.** `entradas/api.ts:18` liga o modo só com `DSPD_MODO_MOCK=homologacao`; as fontes fictícias entram por import dinâmico só nesse modo (`app.ts:73-76`). O `docker-compose.yml` não repassa a variável (ambiente explícito, sem `env_file`); o de homologação a fixa como literal (`docker-compose.homolog.yml:52`), com banco, volume e portas próprios e webhook desligado. Falta a trava pela base: achado A1.
3. **Resposta sem dado real.** `servico.ts:248` responde antes de qualquer leitura: corpo de `corpoSemDadoReal(id)` (id e motivo constantes do contrato, schema `strict`), `versaoCriterio` fixo e chave sem dado. Nenhuma consulta ao banco, nenhum dado de pessoa. PV1 lê só `pesq_*` sem coluna de pessoa (`grants.ts:128-133`); BLOQUEADOS expõe o que já era servido na base real (título de card do BusinessMap, sem responsável). O filtro de times segue sendo só filtro.
4. **Cabeçalho de dados fictícios.** `app.ts:79`: hook `onSend` na raiz, em toda resposta do modo mock (inclusive erro e saúde), ausente no padrão.
5. **Guardas da coleta e do seed.** BusinessMap (cards e apontamento) e Acelerato tomam a trava `dspd:seed` antes de contar (`guarda-seed.ts:15-18`); o Acelerato agora guarda dentro da trava da fonte e não grava a linha de falha quando o motivo é seed (`coletor.ts:175` e `coletor.ts:185`). Os projetores tomam a trava na transação inteira. O seed conta `stg_webhook_evento` no esquema do BusinessMap (`seed.ts:242`), com o papel migrador, sem grant novo; o receptor do webhook fica sem guarda, como manda o A3 da ADR 0026. Resíduo de janela: A2.
6. **Segredos.** O diff do compose de homologação e dos scripts não traz credencial nova: só a linha literal `DSPD_MODO_MOCK`. O único valor parecido com segredo nas linhas novas é fictício, num teste que confere que a mensagem não o exibe.

Lacuna: `gitleaks`, `osv-scanner`, `semgrep`, `zizmor`, `actionlint` e `trivy` não estão no PATH desta estação; segredos conferidos por leitura das linhas adicionadas. As varreduras seguem no CI.

## Achados
- A1 (bloqueante) server/src/entradas/api.ts:18 · `DSPD_MODO_MOCK=homologacao` liga o mock sobre qualquer base: posto no `.env` da base real (o `dev.sh` o carrega e `config.ts:139` o sugere), extensões fictícias somam ao dado real (caso A12), contra a Q3. Recusar a partida no modo mock se `S` tiver coleta real. Dono: node-backend.
- A2 (recomendado) server/src/modulos/businessmap/coleta.ts:257 · A trava `dspd:seed` só cobre a transação curta da guarda (idem `acelerato/coletor.ts:175`): um seed logo depois ainda grava antes da primeira linha da coleta. O projetor recusa depois; o resto fica no staging. Opcional: abrir o `ctl_coleta` na transação da guarda. Dono: node-backend.

## Plano em cartões
- A1 (node-backend, esforço P): na partida com `modoMock`, antes de aceitar requisições, contar `contarColetasReais` em `S.bm` e `S.ac` (o `dspd_api` já tem SELECT em `ctl_*`, sem grant novo) e recusar a partida se alguma for maior que zero, com mensagem só de esquema e contagem. Trocar a dica de `config.ts:139` por "tire a linha do ambiente", sem citar `DSPD_MODO_MOCK`. Teste: partida com `modoMock` sobre esquema com coleta real é recusada; sobre esquema só com o seed sobe. O QA cobre o caso de abuso "variável de homologação no ambiente da base real".
- A2: cartão de recomendados do node-backend, sem prazo (não bloqueia).

## Riscos aceitos
Nenhum.

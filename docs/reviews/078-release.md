---
tipo: review
contrato: 1
pedido: 078-release-noite-2026-11-07
branch: docs/078-release-b
commit: ace67959d5560fb3563cf3230e11776e00506a3c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-10
---
# Review: 078-release, volta sobre a develop atual (K-242)

## Parecer
Aprovado. A release é a `develop` em `31d98e27` (PRs 238 a 285) contra a `homolog`; a branch `docs/078-release-b` só acrescenta o CHANGELOG (os PRs 281, 283, 284 e 285, 5 linhas novas e 3 trocadas) e este parecer. Esta volta refaz o parecer anterior, que ficou velho quando entraram na `develop` os PRs 281, 283, 284 e 285 (e o 282, o parecer antigo).

- **Reviews:** cada PR novo tem parecer de review aprovado em `docs/reviews/`: #281 `chore-forge-0452` (só o arquivo de versão do Forge, 0.44.2 para 0.45.2), #283 `087-k244-erro-ref-sync-apont`, #284 `087-demo-dado-real` (com as três correções A1 a A3 resolvidas) e #285 `077-l7-sust-real-b`. Os demais PRs (238 a 280) mantêm os pareceres já listados na rodada anterior. Todos entraram na `develop` por squash com o número no título, ou seja, pelo portão; não repeti o CI.
- **Migrações:** nenhuma nova (`git diff --name-only 4388083c..31d98e27` não toca pasta de migração). Continua só a `0035_ac_previsao_retorno_booleano` (L9-c, #238), cuja ordem para a homolog é aplicar antes de qualquer coleta do Acelerato com o código novo.
- **Primeira coleta do Acelerato:** segue valendo o `--reconhecer-mudanca` do L9-c, no CHANGELOG em "Mudanças que quebram". O comando da demo (#284) repassa essa flag.
- **Demo (#284):** `pnpm run demo:dado-real` só confere nomes de variável do `.env` e depois sobe banco, migra e coleta; sem o `.env` do dono ele para na primeira etapa com a categoria do erro. Por isso só roda na máquina do dono e não foi executado aqui; o teste `scripts/demo-dado-real.test.sh` (ligado ao `test:trava`) cobre a ordem, a parada no primeiro erro e a senha fora do argv do `docker`.
- **Lote 7 (#285):** `TENDENCIA_SUST` entra em `METRICAS_ORIGEM_REAL` e fica fora da simulação, com versão de critério datada de 2026-11-10; lê só o Acelerato. Sem mistura de domínios.
- **Interruptores:** `BLOQUEIOS_COM_DADO_REAL` e `AJUSTE_PRIORIDADE_COM_FONTE` seguem desligados, conforme o parecer anterior; o diff novo não os toca.
- **CHANGELOG:** as notas novas seguem o formato da `[Não publicado]`: Adicionado (Lote 7 e demonstração), Corrigido (#283), Mudanças de critério (versões do Lote 5 e do Lote 7) e Dependências e Forge (0.45.2).

Não rodei a suíte (é do QA e do CI) e não toquei na base real nem no `.env`.

## Achados
- A1 (recomendado) CHANGELOG.md:35 · a ordem de aplicação da 0035 (antes da primeira coleta do Acelerato com o código novo) fica só neste parecer; ponha-a no roteiro da migração para a VM oficial.
- A2 (recomendado) CHANGELOG.md:50 · o push informa 6 vulnerabilidades abertas na `develop` (2 altas, 4 moderadas) no Dependabot; confira com a segurança se entram na triagem do 073 antes da main.

---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-roteiro-vm-s1
commit: 9b6035030cb21921b214743f2756228e6faf5cc1
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 1
data: 2026-11-17
---
# QA: roteiro da VM depois do S1 (pedido 105, E7.431)

Branch `docs/105-roteiro-vm-s1`, head 9b603503, base develop e1c98633. Diff só de texto: `docs/devops/105-implantacao-vm.md` e `docs/devops/105-roteiro-dono.md`. Sem especificação de UX: as obrigações vêm do brief. Sem PR, então a suíte inteira fica para o CI do PR; este parecer não afirma CI verde. Testei como quem implanta, num Postgres 17 descartável (contêiner próprio, porta 55433, papéis do `docker/postgres/init`, removido ao fim); o Postgres de desenvolvimento em 5432 não foi tocado.

## Achados
- A1 (bloqueante) docs/devops/105-roteiro-dono.md:218 · "Se a 0038 também precisa sair, é outro `down 1` depois" é falso: entre a 0040 e a 0038 há a 0039 (`bm_toque_primeiro`). O 2º `down 1` desfaz a 0039 e `fluxo` continua lá; faltam dois downs, e o da 0039 derruba tabelas do BusinessMap.
- A2 (bloqueante) docs/devops/105-roteiro-dono.md:208 · O passo 2 "Desfazer só a 0038 (uma migração)" com `down 1` desfaz hoje a 0040, não a 0038; o passo 3 (`fluxo` deve imprimir 0) imprime 1. Reescrever com a ordem 0040, 0039, 0038 e dizer que a 0039 perde dado do BusinessMap.
- A3 (recomendado) docs/devops/105-implantacao-vm.md:199 · A tabela diz migrações `0001` a `0039`; a develop vai até a `0040_ac_dim_chamado_escala_p`.

## Critério → teste → resultado
| Critério (brief) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| vm:preparar roda 8 passos com o `ac:reprojetar-escala` | CT-01: `migrate` (40 migrações) e `vm:preparar` | n/a | passou: `passo 1/8` a `8/8`; `vm:preparar: ok, 8 passo(s): migrar, ref:sync-calendario, bm:ref-sync, ac:ref-sync, ac:reprojetar-etapas, ac:reprojetar-fluxo, ac:reprojetar-escala, ac:criterios`. Confere com `PASSOS` em `server/src/plataforma/db/vm-preparar.ts` (escala `opcional`, o arquivo existe) |
| Falha para no passo e nomeia | CT-02: sem `PG_REF_URL` | entrada inválida | passou: `FALHOU no passo "ref:sync-calendario" (código 1)`, nada depois rodou. Nota: fora do Compose o `vm:preparar` precisa de `PG_REF_URL` e `PG_COLETOR_URL`; no Compose o `migrate` as monta (não testado aqui) |
| K-397: etapas e fluxo só gravam `ctl_coleta` se mudam linha; escala ainda grava a cada rodada | CT-03: 1ª e 2ª subida, `select tarefa, versao_coletor from dspd_ac.ctl_coleta` | repetição | passou: 1ª subida, linhas `reprojecao-d7` (etapas) e `reprojecao-escala`, nenhuma de fluxo (base vazia, nada a preencher); 2ª subida, só mais uma `reprojecao-escala`. Confere com `reprojecao-escala.ts` (insere sempre) |
| Rollback da 0040: `down 1` com as duas travas | CT-04: `DSPD_PERMITIR_DOWN=1` e `ultimo-backup-ok` de hoje | permissão | passou: `0040 (DOWN)`, `down: 1 migração(ões)`, `escala_p` com contagem 0; `fluxo` segue 1. Sem `DSPD_PERMITIR_DOWN` o `down 1` sai rc=1 |
| `down 1` desfaz a última migração (consulta de conferência do item 5) | CT-05: `select name from dspd_core.pgmigrations order by id desc limit 3` | dependência | passou: devolve `0040_...` primeiro; a coluna `id` existe |
| Rollback seguinte para a 0038 ("outro `down 1`") | CT-06: 2º `down 1` | dependência | FALHOU (A1): desfez a 0039; `fluxo` contagem 1 |
| Rollback da 0038, passos 2 e 3 do roteiro do dono | CT-07: CT-06 e leitura | dependência | FALHOU (A2) |
| Coleta do Acelerato parada e backup antes do `up` | leitura contra `deploy/systemd` e `recusaDeBackup` | n/a | passou: os timers `metricas-coleta-acelerato` e `-releitura` existem; `recusaDeBackup` exige `DSPD_BACKUP_CONFIRMADO=AAAA-MM-DD` com pendência sobre base que já tem migração; base virgem não exige |
| `ac:criterios` grava `105:S1-escala-p` | leitura | n/a | passou: `criterios-acelerato.ts:67` |
| Restaurar o backup como saída (b) | leitura | n/a | não executado (decisão do Jarvis; `pg_restore` fora do escopo) |

## Provas
- Ambiente: `postgres:17` descartável, `up: 40 migração(ões), 218 GRANT(s)`, removido ao fim.
- Teste de documentação contra o código: não há teste novo de código, então `forge-testes --vermelho` e mutação não se aplicam.
- Bug médio (A1, A2) e baixo (A3) abertos viram cartão (R-QA).

## Decisão
Reprovado por A1 e A2 (defeito provado no passo a passo de rollback). Revalidação: `forge-check parecer delta docs/qa/105-roteiro-vm-s1.md`; retestar CT-06 e CT-07.

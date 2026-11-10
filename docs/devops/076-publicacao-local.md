# Roteiro 076: publicação no ambiente local até a VM

Origem do código: `origin/main` (8bb1210ba65e89f4093b28597af8378ce880ae46). Cada passo roda fora do sandbox, depois da aprovação do dono na tela, parando no primeiro erro. O `.env` nunca é aberto: só é carregado no shell do comando (P-076-2) ou pelo link simbólico para o `scripts/db.sh`. Sem commit, sem agendamento, nada na VM.

## Passo 1
- Comando: `git fetch origin main && git worktree add --detach /home/rodrigoisensee/MetricasDSPD-076 origin/main && cd /home/rodrigoisensee/MetricasDSPD-076 && pnpm install --frozen-lockfile`
- Pré-condição: `/home/rodrigoisensee/MetricasDSPD-076` não existe; `origin/main` resolve para 8bb1210b.
- Resultado esperado: worktree destacada em 8bb1210b; dependências instaladas congeladas, sem alterar o lockfile.
- Saída: FEITO pelo tech-lead (E1.0), fora do sandbox com aprovação do dono: worktree `/home/rodrigoisensee/MetricasDSPD-076` em 8bb1210ba65e89f4093b28597af8378ce880ae46 e `pnpm install --frozen-lockfile` rc=0; sem .env e sem link. (A tentativa anterior do devops foi recusada pelo hook: "R-CONFORMIDADE: pnpm install é de dev/qa/tech-lead (papel: devops)".)

## Passo 2
- Comando: `ln -s /home/rodrigoisensee/Metricas/MetricasDSPD/.env /home/rodrigoisensee/MetricasDSPD-076/.env`
- Pré-condição: passo 1 concluído; o `.env` da raiz existe (só `test -f`, sem leitura).
- Resultado esperado: link simbólico `.env` na worktree apontando para o da raiz; nenhum conteúdo copiado.
- Saída: FEITO, rc=0 (aprovado pelo dono); link `.env` criado na worktree apontando para o `.env` da raiz; conteúdo não lido.

## Passo 3
- Comando: `cd /home/rodrigoisensee/MetricasDSPD-076 && scripts/db.sh migrate up`
- Pré-condição: contêiner `metricasdspd-postgres-1` saudável; links do passo 2 no lugar.
- Resultado esperado: migrações pendentes aplicadas até a 0034 (`0034_bm_ctl_apontamento_cobertura`); sem erro; nunca `down`.
- Saída: FEITO, rc=0: "Migrating files: 0034_bm_ctl_apontamento_cobertura"; "up: 1 migração(ões), 215 GRANT(s)". Só a 0034 estava pendente.

## Passo 4
- Comando: `cd /home/rodrigoisensee/MetricasDSPD-076 && (set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run ref:sync-calendario)`
- Pré-condição: passo 3 concluído (tabelas `ref_` presentes); papel `dspd_ref` com senha no `.env`.
- Resultado esperado: JSON de uma linha com `vigenteDesde` (hoje) e contagens de calendários, aplicações e feriados (26 por domínio na primeira vez) e o hash; idempotente numa repetição.
- Saída: FALHOU, rc=1: "ref:sync-calendario falhou: configuração ou banco inválidos" (a entrada não imprime a causa). Leitura do código: usa `PG_REF_URL` (`ref-sync-calendario.ts:22`); `.env.example` da main lista `PG_REF_URL` e `DSPD_PWD_REF`. Suspeita, não confirmada (o `.env` não foi aberto): `PG_REF_URL` ausente no `.env`, ou papel `dspd_ref` sem a senha esperada na base. Execução parada aqui; passos 5 e 6 não rodados.
- Saída (13:00 em diante): FALHOU de novo, rc=1, mesma mensagem "ref:sync-calendario falhou: configuração ou banco inválidos", com o `.env` já editado pelo dono e carregado no shell do comando. Categoria provável pela leitura do código (`ref-sync-calendario.ts:22-26`; a mensagem cobre qualquer erro que não seja `ErroCalendario`): variável ausente (`PG_REF_URL` ou `DSPD_PWD_REF`; o dono editou só as do `dspd_api_apontamento`) ou autenticação do papel `dspd_ref` na base local; conexão é menos provável (o passo 3 conectou). `.env` não aberto; execução parada, sem repetir.
- Saída (13:19 em diante): FEITO, rc=0 (aprovado pelo dono): `{"vigenteDesde":"2026-11-06",...}`; businessmap: 1 calendário novo, 26 feriados novos, 2 aplicações abertas, 0 fechadas; acelerato: 1 calendário novo, 26 feriados novos, 1 aplicação aberta, 0 fechadas; versão registrada nos dois; feriadosDivergentes=0; sha256 868369a9...3914. Causa das falhas anteriores: `PG_REF_URL` ausente, gravada pelo dono às 13:19 (leitura do código; `.env` não aberto).
- Passos 5 e 6 (rodadas de 11:30 e 13:00): NÃO EXECUTADOS naquelas rodadas (parada no passo 4).

## Passo 5
- Comando: `cd /home/rodrigoisensee/MetricasDSPD-076 && (set -a; . ./.env; set +a; pnpm --filter @metricas-dspd/server run bm:apontamento carga-inicial)`
- Pré-condição: MemAvailable acima de 3000 MB e load abaixo de 4; dicionário carregado por `bm:ref-sync-apontamento` e coleta de cards feita (pré-requisitos da entrada); uma tarefa pesada por vez. A entrada só aceita o modo `carga-inicial` (o incremental roda dentro do `bm:coleta incremental`).
- Resultado esperado: JSON com contagens e códigos (sem id de pessoa, nome nem comentário); só GET no BusinessMap; coleta sob a trava da fonte.
- Saída: (a preencher na execução)
- Saída (13:00 em diante): NÃO EXECUTADO (parada no primeiro erro, passo 4).
- Saída (13:19 em diante): FEITO, rc=0 (aprovado pelo dono), após conferir MemAvailable 16928976 kB e load 0.56: coletaId 9, modo carga_inicial, estado sucesso, desde 2025-11-02, retomada=true, lidos 49198, inseridos 8769, jaExistentes 40429, invalidos 0, excluidos 0, reaparecidos 0, usuarios 0/0/0, lotesConcluidos 91, falhas {} e recusados {}. Passou de 180 s e foi para segundo plano; terminou sem erro.

## Passo 6
- Comando: `docker exec metricasdspd-postgres-1 psql -U postgres -d metricas -c "SELECT count(*) AS cards_incompletos FROM (SELECT DISTINCT ON (card_id) card_id, estado FROM dspd_bm.ctl_apontamento_cobertura ORDER BY card_id, cobertura_sk DESC) u WHERE u.estado = 'incompleto';"`
- Pré-condição: passo 5 concluído; `psql` não está no PATH da máquina, então roda dentro do contêiner (consulta só de leitura, Q20 de `docs/analises/064-consultas-dono.sql`).
- Resultado esperado: um número; 0 = o aviso "Registro de horas incompleto" não aparece; maior que 0 = há cards com cobertura incompleta.
- Saída: (a preencher na execução)
- Saída (13:00 em diante): NÃO EXECUTADO (parada no primeiro erro, passo 4).
- Saída (13:19 em diante): FEITO, rc=0 (aprovado pelo dono): `cards_incompletos = 0` (1 linha); o aviso "Registro de horas incompleto" não aparece.

## Resultado

Conferência de 2026-11-06 das saídas registradas nos passos 2 a 6 contra o "Resultado esperado" de cada passo. Só leitura do roteiro e do pedido; nenhum comando novo contra a base; sem commit. As saídas foram conferidas como registradas, não reexecutadas.

- Passo 1: pronto. Worktree em 8bb1210b e instalação congelada com rc=0, registrados pelo tech-lead (E1.0). Não reconferido na worktree.
- Passo 2: pronto. Link simbólico criado com rc=0 e conteúdo do `.env` não lido. Não reconferido.
- Passo 3: pronto. `migrate up` com rc=0 aplicou só a 0034 (215 GRANTs), sem `down`. Para a VM: a mesma migração 0034 (K-216).
- Passo 4: pronto na terceira rodada (13:19, rc=0). As rodadas de 11:30 e 13:00 falharam com rc=1 (`PG_REF_URL` ausente, gravada pelo dono às 13:19). A saída confere com o esperado: `vigenteDesde` 2026-11-06; por fonte, 1 calendário novo, 26 feriados novos e aplicações abertas (2 no BusinessMap, 1 no Acelerato); `feriadosDivergentes=0`; hash sha256 868369a9...3914 registrado, não reconferido. Lacuna: a idempotência numa repetição não foi testada.
- Passo 5: pronto, com ressalvas. Rodada de 13:19 com rc=0: coletaId 9, estado sucesso, `falhas {}`, `recusados {}`. A conta fecha: 8769 inseridos + 40429 já existentes + 0 inválidos = 49198 lidos. Ressalvas: (a) a execução passou de 180 s e foi para segundo plano, e a saída final veio dela; (b) "só GET no BusinessMap" e "coleta sob a trava da fonte" são propriedades do código, não aparecem na saída e não foram conferidas aqui; (c) os pré-requisitos do passo (dicionário por `bm:ref-sync-apontamento` e coleta de cards) não têm registro de conferência no roteiro; a execução com sucesso sugere que estavam presentes, mas não foi comprovado.
- Passo 6: pronto. Q20 com rc=0 e `cards_incompletos = 0`; o aviso "Registro de horas incompleto" não aparece. Para a VM: repetir a Q20 lá (K-216).

Desvio de aprovação: a rodada de 13:19 dos passos 4 a 6 rodou sem prompt de aprovação visível ao devops-engineer (registrado no histórico do pedido às 13:26 e relatado ao dono). Esta conferência não confirma se houve aprovação na tela; essa confirmação é do dono.

Fica para a VM (cartão K-216):
- Migração 0034 (`0034_bm_ctl_apontamento_cobertura`), aplicada só na máquina local.
- `PG_APONTAMENTO_URL`: gravada no `.env` local pelo dono; a VM precisa da configuração própria, feita pelo dono.
- Q20 de novo na VM.
- Observação: a lista do brief não cobre `ref:sync-calendario` nem a carga inicial do apontamento na VM. Se a VM precisa desses dados, o dono decide se entram na lista.

Não foi feito:
- Coleta agendada (fora do escopo).
- Qualquer passo na VM; commit; alteração do `.env`, do código, do `KANBAN.md` e dos pedidos; nova escrita na base além das já registradas.
- Re-execução dos passos 1 a 6.
- Os marcadores "(a preencher na execução)" dos passos 5 e 6 continuam no corpo do roteiro; não foram editados, só se acrescentou esta seção.

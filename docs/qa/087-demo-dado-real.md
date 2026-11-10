---
tipo: qa
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 9fc2ac6a9cb429a1cdadbec8e3fc074c8d1aeeaa
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: comando da demo com dado real (087, E4.3, K-258)

Volta incremental depois da correção do BUG-087-1 (commits d98db2b2 e 9fc2ac6a; o 9fc2ac6a só muda o parecer de devops). Simulação do roteiro do dono sem `.env` real, sem Docker real e sem base: dublês de `docker`, `pnpm`, `scripts/db.sh` e `scripts/coleta.sh` num diretório descartável. Nenhum `.env*` foi aberto. Não há `CA-n` (pedido técnico, sem UX); a obrigação é o E4 do pedido e `docs/engineering/demo-dado-real.md`.

## Escopo
Coberto: etapas 1 a 10, ordem, parada no primeiro erro, mensagens de falha, ausência de valor de credencial na tela e no log, repasse de `--reconhecer-mudanca` só ao Acelerato, aceitação do `--` que o pnpm repassa, a consulta de prova. Não coberto: ver "Só na primeira execução do dono".

## Execução
- `bash scripts/demo-dado-real.test.sh` no head: 15 verificações `ok`, "tudo ok" (eram 12; somam as 3 do `--`). `shellcheck` nos dois scripts: limpo. A suíte inteira é do check-run `bateria` do CI do PR (PR ainda inexistente, não citado).
- Vermelho antes do verde (teste novo do `--`): o teste atual rodado contra o script de c02c078a (sem a correção) falha:
  - `FALHOU - -- --reconhecer-mudanca (chamada do pnpm): aceito, rc 0`
  - `FALHOU - -- --reconhecer-mudanca: a flag foi reconhecida na saida`
  - `2 falha(s)`
  No head, os dois passam. Os testes provam o que precisa quebrar: retirar a linha `--) ;;` do `case`.
- Mutação: sem ferramenta para shell na stack; compensada pelo vermelho acima e por injeção de falha em cada etapa (`sim.sh`, volátil, não commitado). Repetido no head: falha injetada nas etapas 2, 3, 4 (os três ref-sync), 5, 6, 7, 8, 9 e 10 dá rc 1, etapa e categoria certas, "código de saída" correto, nada roda depois; 0 ocorrências do valor sentinela na saída e no log; `-e PGPASSWORD` sem valor no argv.

## Obrigação → teste → resultado
| Obrigação (E4 / doc) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Ordem: banco, migração, ref-sync (3), BM, Acelerato, apontamento, projeção, API/web, prova | autor + `sim.sh` (log dos 11 comandos) | passa; igual à tabela da doc | ordem entre etapas |
| `.env` ausente | autor | passa (rc 1, `arquivo-ausente`, nada executado) | arquivo ausente |
| Variável faltando: só o nome | autor + QA (ausente, vazia `K=`, comentada `# K=`) | passa; só o nome | vazio, comentário |
| Docker parado / compose falha (2 e 9) | QA | passa; categoria `docker`, rc 1 | dependência externa |
| Migração falhando | QA | passa; `migracao`, rc 1 | etapa 3 |
| Coleta falhando (BM, Acelerato, apontamento), ref-sync, projeção | QA, uma por etapa; autor cobre BM | passa | etapas 4 a 8 |
| Sem valor de credencial na saída, no log e no argv | autor + QA | passa | segredo na tela |
| Consulta de prova só com contagens e um `min(coletado_em)` | leitura do SQL + autor | passa: sem coluna de pessoa nem texto; papel `dspd_coletor` | dado de pessoa |
| `--reconhecer-mudanca` só na etapa do Acelerato | QA | passa: `coleta ac --reconhecer-mudanca`, BM sem a opção | repasse |
| Doc: `pnpm run demo:dado-real -- --reconhecer-mudanca` | autor (3 testes novos) + QA (vermelho na base) | passa: `--` aceito; `-- --outra` e `--outra` seguem rc 2 | contorno do `--` |

## Achados
- A1 (resolvido) scripts/demo-dado-real.sh:15 · o `--` isolado é aceito (d98db2b2); teste do caminho em scripts/demo-dado-real.test.sh:42-47, vermelho na base, verde no head.

## Bugs
- BUG-087-1 (média): corrigido em d98db2b2 e revalidado; fechado. Nenhum bug aberto.

## Só na primeira execução do dono
- Bloco `set -a; . .env`: valor com espaço sem aspas, `$`, `!` ou CRLF (`.env` editado no Windows). A simulação com CRLF passou a conferência de nomes; o `\r` chega às URLs e senhas sem aviso.
- Docker de verdade: `--wait` com healthcheck, porta 5432 ocupada, build das imagens, memória do WSL (8 GB).
- Comportamento real de `bm:*`, `ac:*`, `scripts/db.sh` e `coleta.sh`, limite de 25 chamadas/min, tempo total, `parametros-mudaram`, base com seed (`esquema-com-seed`).
- A consulta SQL contra o esquema real (`dspd_bm.fato_bloqueio`, `evt_bloqueio`, `stg_card`; GRANT do `dspd_coletor`): lida, não executada.
- O texto de erro das ferramentas reusadas não foi observado (os dublês não emitem erro de driver).
- pnpm do projeto (10.34.6) não instalado aqui; o `--` foi tratado nos dois comportamentos (repassa ou descarta).

## Resultado
Aprovado: 0 bugs abertos; o roteiro simulado passa e a correção do A1 está provada por teste vermelho na base.

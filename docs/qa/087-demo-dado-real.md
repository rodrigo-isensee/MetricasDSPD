---
tipo: qa
contrato: 1
pedido: 087-paineis-dado-real-e-demo
branch: feature/087-demo-dado-real
commit: 699ad94dd8efa5cc39362ae031b1dec978c196c0
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-10
---
# QA: comando da demo com dado real (087, E4.3, K-258)

Simulação do roteiro do dono sem `.env` real, sem Docker real e sem base: dublês de `docker`, `pnpm`, `scripts/db.sh` e `scripts/coleta.sh` num diretório descartável. Nenhum `.env*` foi aberto. Não há `CA-n` (pedido técnico, sem especificação de UX); a obrigação é o E4 do pedido e `docs/engineering/demo-dado-real.md`.

## Escopo
Coberto: etapas 1 a 10 do script, ordem, parada no primeiro erro, mensagens de falha, ausência de valor de credencial na tela e no log dos dublês, repasse de `--reconhecer-mudanca` só ao Acelerato, a consulta de prova. Não coberto: ver "Só na primeira execução do dono".

## Execução
- `bash scripts/demo-dado-real.test.sh` (suíte do autor): 12 verificações, todas `ok`, "tudo ok". `shellcheck` nos dois scripts: limpo. A suíte inteira é do check-run `bateria` do CI do PR (não citado: o PR ainda não existe).
- Vermelho antes do verde não se aplica: é script novo, sem base anterior (`forge-testes --vermelho` não tem o que reverter). Mutação: sem ferramenta para shell na stack; compensada pelas injeções de falha abaixo, uma por etapa.

## Obrigação → teste → resultado
| Obrigação (E4 / doc) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Ordem: banco, migração, ref-sync (3), BM, Acelerato, apontamento, projeção, API/web, prova | autor (ordem parcial) + `sim.sh` do QA (log completo dos 11 comandos) | passa; ordem igual à tabela da doc | ordem entre etapas |
| `.env` ausente: mensagem clara, nada roda | autor | passa (rc 1, categoria `arquivo-ausente`) | arquivo ausente |
| Variável faltando: só o nome | autor + QA (variável ausente, vazia `K=`, comentada `# K=`) | passa; as três viram `variavel-ausente` só com o nome | vazio, comentário |
| Docker parado / compose falha (etapas 2 e 9) | QA (falha injetada) | passa; categoria `docker`, dica, rc 1, nada depois | dependência externa |
| Migração falhando | QA | passa; categoria `migracao`, rc 1 | etapa 3 |
| Coleta falhando (BM, Acelerato, apontamento) e ref-sync/projeção | QA, uma falha por etapa | passa; etapa e categoria certas, "código de saída" correto, rc 1, etapas seguintes não rodam | etapas 4 a 8 |
| Sem valor de credencial na saída, no log e no argv | autor + QA (valor sentinela em todos os cenários) | passa: 0 ocorrências na saída e no log; `-e PGPASSWORD` sem valor | segredo na tela |
| Consulta de prova só com contagens e um `min(coletado_em)` | leitura do SQL + autor | passa: sem coluna de pessoa nem texto; roda pelo papel `dspd_coletor` | dado de pessoa |
| `--reconhecer-mudanca` só na etapa do Acelerato | QA | passa pelo script direto: `coleta ac --reconhecer-mudanca`, BM sem a opção | repasse |
| Documentação: comando `pnpm run demo:dado-real -- --reconhecer-mudanca` | QA (pnpm real, pacote descartável) | FALHA, ver A1 | contorno do `--` |

## Achados
- A1 (bloqueante) scripts/demo-dado-real.sh:15 · a doc manda `pnpm run demo:dado-real -- --reconhecer-mudanca`; o pnpm 12.15 repassa o `--` ao script (`bash e.sh -- --reconhecer-mudanca`, 2 args) e o `case` recusa `--` com `uso:` e rc 2. Aceitar `--` (ignorar) ou trocar a doc; sem teste do caminho.

## Bugs
- BUG-087-1 (média, responsável: devops-engineer; vira cartão no quadro): na primeira coleta do Acelerato depois do L9-c a falha `parametros-mudaram` é esperada, e o roteiro documentado de reexecução (linha 12 da doc) não funciona pelo atalho pnpm.
  - Passos: pacote descartável com `"a": "bash e.sh"` e `pnpm run a -- --reconhecer-mudanca` (pnpm 12.15.0 local) imprime `n=2 [-- --reconhecer-mudanca]`; `bash scripts/demo-dado-real.sh -- --reconhecer-mudanca` imprime `uso: demo-dado-real.sh [--reconhecer-mudanca]` e sai com rc 2.
  - Esperado: rodar de novo com a opção, conforme a doc. Obtido: recusa de uso.
  - Ressalva: o `packageManager` do projeto fixa pnpm 10.34.6, que não pude instalar aqui; se o 10 já descarta o `--`, o defeito não aparece no ambiente do dono, mas a robustez continua barata. Contorno simples: `bash scripts/demo-dado-real.sh --reconhecer-mudanca` ou `pnpm run demo:dado-real --reconhecer-mudanca`.

## Só na primeira execução do dono
- Bloco `set -a; . .env`: valor com espaço sem aspas, `$`, `!` ou fim de linha CRLF (`.env` editado no Windows). O teste CRLF só provou o passo da conferência de nomes, com o `.env` sentinela; o valor com `\r` chega às URLs e senhas sem aviso.
- Docker de verdade: `--wait` com healthcheck, porta 5432 ocupada, build das imagens, memória do WSL (8 GB).
- Comportamento real de `bm:*`, `ac:*`, `scripts/db.sh` e `coleta.sh`, limite de 25 chamadas/min, tempo total, `parametros-mudaram`, base com seed (`esquema-com-seed`).
- A consulta SQL contra o esquema real (nomes `dspd_bm.fato_bloqueio`, `evt_bloqueio`, `stg_card`; GRANT do `dspd_coletor`): lida, não executada.
- A mensagem "código de saída" mostra o código do comando falho; o texto de erro das ferramentas reusadas não foi observado (os dublês não emitem erro de driver).
- Teste do autor cobre só 3 das falhas e a ordem parcial; o `sim.sh` do QA (volátil, no scratchpad) cobre o resto e não foi commitado.

## Resultado
Reprovado por A1 (1 bug médio). O restante do roteiro simulado passa. Reteste após a correção: `forge-check parecer delta docs/qa/087-demo-dado-real.md`.

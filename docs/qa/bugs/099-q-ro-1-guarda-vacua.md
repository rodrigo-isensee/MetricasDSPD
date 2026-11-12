# 099-q-ro-1 - caso novo do teste do script nunca falha (pipefail + grep -q)
- Severidade: média
- Responsável sugerido: devops-engineer
- Ambiente: fix/099-q-ro-1 @ 97c39b1e, bash

## Passos para reproduzir
1. Copiar o head e repor `scripts/sql/consultas-098-099/20-Q-RO-1.sql` do d9f32012 (lê `vw_`).
2. `bash scripts/consultas-leitura-098-099.test.sh`.

## Resultado esperado
`FALHOU - nenhum .sql versionado le view vw_ (coletor sem grant)`, rc 1.

## Resultado obtido
`ok - ...` e "todos os casos passaram", rc 0. Em 20 execuções isoladas do pipeline, 0 detecções.

## Evidência
`set -o pipefail` no topo: `grep -qiE` sai ao achar, `grep -v` recebe SIGPIPE, o pipeline retorna 141, o `&& echo 1` não roda e `|| echo 0` responde "sem view". Correção: `grep -ciE` sem `-q` e comparar a contagem com 0.

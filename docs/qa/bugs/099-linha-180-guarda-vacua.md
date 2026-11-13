# 099-linha-180 - guarda dos 31 .sql nunca detecta recusa (pipefail + grep -q)
- Severidade: baixa
- Status: FECHADO em 2079f664 (E3.34): a guarda com grep -c cai com o DELETE somado; a antiga dava ok.
- Responsável sugerido: devops-engineer
- Ambiente: fix/099-q-ro-1 @ 6f3b80ee (linha pré-existente da develop, 660a7e92b), bash

## Passos para reproduzir
1. Copiar o head e somar `DELETE FROM fato_transicao;` ao 20-Q-RO-1.sql.
2. Rodar `bash scripts/consultas-leitura-098-099.test.sh`.

## Resultado esperado
`FALHOU - os 31 .sql versionados cumprem a lista permitida`.

## Resultado obtido
`ok - ...` embora `roda | grep -c ^recusada` dê 1 (sonda: `contagem=1 guarda=0`).

## Evidência
`set -uo pipefail`: `grep -q` fecha cedo, `roda` recebe SIGPIPE, o pipeline dá rc 141 e o `|| echo 0` responde "sem recusa". Os casos do caminho feliz do mesmo teste caem (rc 3), por isso é baixa. Correção: `grep -c` comparado a 0.

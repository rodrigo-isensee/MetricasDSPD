---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-q-ro-1
commit: 6f3b80eec7311394f8b041c74a76c19ae60c662f
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 1
data: 2026-11-12
---
# QA: Q-RO-1 lê as tabelas em vez da vw_transicao_canonica

## Achados
- A1 (bloqueante) scripts/consultas-leitura-098-099.test.sh:182 · RESOLVIDO em 6f3b80ee: `grep -ci` comparado a 0; o caso agora falha com o SQL antigo e passa com o novo.
- A2 (recomendado) scripts/consultas-leitura-098-099.test.sh:180 · mesmo defeito, pré-existente (develop, 660a7e92b, fora do diff): `roda | grep -q` com pipefail; com arquivo recusado (contagem 1) a guarda dá 0 e imprime ok. Trocar por `grep -c` e comparar a 0. Os casos do caminho feliz cobrem. Não bloqueia.

## Escopo
Diff d9f32012..97c39b1e (parecer anterior) e delta 97c39b1e..6f3b80ee (só a linha 182 do teste): `20-Q-RO-1.sql` lê `fato_transicao` e `rec_transicao_par`. Sem `CA-n` de UX. Suíte completa e prova de banco ficam com o CI do PR (check-run `bateria` do mesmo sha). Nada rodou contra base real nem leu `.env*`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Q-RO-1 não lê view (coletor sem SELECT em view, psql rc 3) | caso "nenhum .sql versionado le view vw_" | papel sem grant | PROVA: falha com o SQL antigo, passa com o novo |
| Consulta nova equivale à view | leitura de `server/migrations/0005_bm_historico.ts:62-67` contra o SQL (parecer anterior) | filtro da view | passa |
| Coletor lê as duas tabelas | `grants.ts:54,91,107` | grant por tabela | passa por leitura (prova de banco é o CI) |
| Teste do script verde | `bash scripts/consultas-leitura-098-099.test.sh` | n/a | passa, rc 0, "todos os casos passaram" |

## Vermelho antes do verde
SQL antigo (`git show d9f32012:scripts/sql/consultas-098-099/20-Q-RO-1.sql`) numa cópia do head 6f3b80ee, mesmo script:

    FALHOU - nenhum .sql versionado le view vw_ (coletor sem grant)   (rc 1)

Head com o SQL novo: `ok - nenhum .sql versionado le view vw_ (coletor sem grant)`, "todos os casos passaram", rc 0.

Linha 180 (A2): cópia do head com `DELETE FROM fato_transicao;` somado ao 20-Q-RO-1.sql; sonda de depuração na cópia:

    DBG contagem=1 guarda=0   (há 1 linha recusada; a guarda atual responde "sem recusa")
    ok - os 31 .sql versionados cumprem a lista permitida

## Resultado
Aprovado. A consulta equivale à view e A1 está resolvido (bug `docs/qa/bugs/099-q-ro-1-guarda-vacua.md` fechado). A2 vira o bug baixo `docs/qa/bugs/099-linha-180-guarda-vacua.md` e cartão, sem aceite do usuário. Responsável: devops-engineer.

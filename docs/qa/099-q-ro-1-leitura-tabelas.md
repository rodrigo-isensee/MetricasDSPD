---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/099-q-ro-1
commit: 97c39b1e30a5ebb3661e8d7ef6512c88b06c00e2
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-12
---
# QA: Q-RO-1 lê as tabelas em vez da vw_transicao_canonica

## Achados
- A1 (bloqueante) scripts/consultas-leitura-098-099.test.sh:182 · o caso novo é vazio: com `set -o pipefail`, `grep -q` fecha cedo, `cat`/`grep -v` levam SIGPIPE (rc 141) e o `&& echo 1 || echo 0` dá 0. Com o SQL antigo o caso passa 20 de 20. Trocar `grep -q` por `grep -c` (e comparar com 0).

## Escopo
Diff d9f32012..97c39b1e: `20-Q-RO-1.sql` (lê `fato_transicao` e `rec_transicao_par`) e +2 linhas no teste do script. Sem `CA-n` de UX. Suíte completa e prova de banco ficam com o CI do PR (check-run `bateria` do mesmo sha). Nada rodou contra base real nem leu `.env*`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Q-RO-1 não lê view (coletor sem SELECT em view, psql rc 3) | caso "nenhum .sql versionado le view vw_" | papel sem grant | NÃO PROVA: passa também com o SQL antigo (A1) |
| Consulta nova equivale à view | leitura de `server/migrations/0005_bm_historico.ts:62-67` contra o SQL | filtro da view | passa: mesmo filtro (fonte = revision OU sem par em `rec_transicao_par`), mesmas colunas `direcao` e `tipo_coluna`; sem a coluna `usuario` |
| Coletor lê as duas tabelas | `grants.ts:54,91,107` (`fato_transicao` por IMUTAVEL, `rec_` por prefixo) | grant por tabela | passa por leitura (prova de banco é o CI) |
| Teste do script verde | `bash scripts/consultas-leitura-098-099.test.sh` | n/a | passa, rc 0, "todos os casos passaram" |

## Vermelho antes do verde
SQL antigo (`git show d9f32012:scripts/sql/consultas-098-099/20-Q-RO-1.sql`) posto numa cópia do head, mesmo script de teste:

    ok - nenhum .sql versionado le view vw_ (coletor sem grant)
    todos os casos passaram   (rc 0)

Esperado: FALHOU. Reproduzido isolado, 20 execuções do pipeline com o SQL antigo: `detecta=0 vacuo=20`; com `grep -c`: `detecta=20`. Sem vermelho, o caso não conta como prova (R-QA).

## Resultado
Reprovado por A1. A consulta em si está correta e equivalente à view; falta o teste que a guarda de verdade. Bug: `docs/qa/bugs/099-q-ro-1-guarda-vacua.md` (média, abre cartão). Responsável: devops-engineer.

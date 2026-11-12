---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k277-consultas-escape
commit: a73f2c4bfaee44b15b09e0003f7ce7691778a83a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: K-277, consultas de leitura recusam U&, UESCAPE e prefixos pg_ e lo_ (A5)

## Achados

## Escopo
Diff 167f3a13..a73f2c4b: `scripts/consultas-leitura-098-099.sh` (+3, duas recusas em `validar_sql`) e `scripts/consultas-leitura-098-099.test.sh` (+9, oito sondas). Sobre a ponta da branch há só o parecer de segurança (942a6514, nenhum arquivo de código). Obrigação: A5 do parecer de segurança (S8 a S12). Sem `CA-n` de UX nem contrato de API. Suíte completa e `pnpm run pronto`: ficam com o CI do PR (check-run `bateria` do mesmo sha), por ordem do brief. Nada rodou contra banco real nem leu `.env*`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| S8 U& com UESCAPE (set_config) recusado | "S8 U& com UESCAPE (set_config escapado)" | escape de identificador | passa (rc 1, banco não chamado) |
| S9 U& com UESCAPE (pg_sleep) recusado | "S9 ..." | idem | passa |
| S10 a S12 pg_terminate_backend, pg_advisory_lock, lo_create | "S10", "S11", "S12" | prefixos pg_ e lo_ | passam |
| Qualquer caixa | "UESCAPE sozinho, caixa mista", "prefixo PG_", "prefixo LO_" em maiúscula | caixa | passam |
| Os 31 `.sql` seguem aceitos | "caminho feliz: 31 consultas, todas ok" e "os 31 .sql versionados cumprem a lista permitida" | corpus legítimo, sem falso positivo | passam |

## Execução
- `bash scripts/consultas-leitura-098-099.test.sh`: rc 0, "todos os casos passaram".
- `shellcheck` dos dois arquivos: rc 0, sem avisos.

## Mutação na recusa (restaurada; árvore limpa depois)
| Mutante | Resultado do teste |
|---|---|
| M1 tira a recusa de U&/UESCAPE | cai (rc 3) |
| M2 tira a recusa de pg_/lo_ | cai (rc 5) |
| M3 só `pg_`, sem `lo_` | cai (rc 2) |
| M4 recusa de pg_/lo_ sem `-i` | cai (rc 2) |
| M5 recusa de U&/UESCAPE sem `-i` | cai (rc 1) |
| M6 só `U&`, sem UESCAPE | cai (rc 1) |
| M7 só `UESCAPE`, sem `U&` | sobrevive (rc 0): equivalente |

M7 equivalente: `U&"..."` sem `UESCAPE` usa a barra invertida como escape, e a barra invertida já é recusada por regra anterior de `validar_sql`; o único escape alternativo exige `UESCAPE`, que a regra mantida recusa. Justificativa aceita; sem achado.

## Vermelho antes do verde
As sondas S8 a S12 já foram vistas passando na base (parecer de segurança, "obtido: passa"); aqui a prova é por mutação (M1 a M6 derrubam o teste), não por `forge-testes --vermelho`, que é do Forge e não se aplica a este projeto.

## Riscos aceitos
Nenhum.

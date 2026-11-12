---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k281-consultas-funcoes
commit: 805130049313de3ec987d07b0cafbfa44c6b797c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: K-281, consultas de leitura recusam query_to_xml, query_to_xmlschema, query_to_xml_and_xmlschema, ts_stat e ts_rewrite (A6)

## Achados

## Escopo
Diff 9e76d175..80513004: `scripts/consultas-leitura-098-099.sh` (+1/-1, cinco palavras em `PALAVRAS_PROIBIDAS`) e `scripts/consultas-leitura-098-099.test.sh` (+9, sete sondas). Sobre esse commit há só o parecer de segurança (4f67e80e, sem código). Obrigações: A6 do parecer de segurança do K-277 (S13, S14 e as três outras funções) e A1 do review do K-277 (`U&"x"` sem UESCAPE). Sem `CA-n` de UX nem contrato de API. Suíte completa e `pnpm run pronto` ficam com o CI do PR (check-run `bateria` do mesmo sha), por ordem do brief. Nada rodou contra banco real nem leu `.env*`.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| S13 query_to_xml com nome montado por `\|\|` recusado | "S13 query_to_xml com nome montado por ||" | texto executado como SQL | passa (rc 1, banco não chamado) |
| S14 ts_stat com nome montado | "S14 ts_stat ..." | idem | passa |
| query_to_xmlschema, query_to_xml_and_xmlschema, ts_rewrite | uma sonda cada | idem | passam |
| Qualquer caixa | "query_to_xml em maiuscula" | caixa | passa |
| A1: `U&"x"` sem UESCAPE | "U& sem UESCAPE" | escape de identificador | passa |
| Os 31 `.sql` seguem aceitos | "caminho feliz: 31 consultas, todas ok" e "os 31 .sql versionados cumprem a lista permitida" | corpus legítimo, sem falso positivo | passam |

## Execução
- `bash scripts/consultas-leitura-098-099.test.sh`: rc 0, "todos os casos passaram".
- `shellcheck` dos dois arquivos: rc 0, sem avisos.

## Mutação na recusa (restaurada com `git checkout`; árvore limpa depois)
| Mutante | Resultado do teste |
|---|---|
| M1 tira `query_to_xml_and_xmlschema` da lista | cai (rc 1): sonda query_to_xml_and_xmlschema |
| M2 tira `query_to_xmlschema` | cai (rc 1): sonda query_to_xmlschema |
| M3 tira `query_to_xml` | cai (rc 2): S13 e sonda em maiúscula |
| M4 tira `ts_stat` | cai (rc 1): S14 |
| M5 tira `ts_rewrite` | cai (rc 1): sonda ts_rewrite |
| M6 tira `U&` da regra de escape (`:104`) | cai (rc 1): "U& sem UESCAPE" |

Nenhum sobrevivente. Cada palavra é comparada inteira, então tirar uma não é coberta por outra (M3 deixa as variantes `_xmlschema` passarem pela própria sonda).

## Vermelho antes do verde
Pela mutação (M1 a M6 derrubam a sonda correspondente); `forge-testes --vermelho` é do Forge e não se aplica a este projeto. Segurança já mediu S13 e S14 passando na base.

## Riscos aceitos
Nenhum.

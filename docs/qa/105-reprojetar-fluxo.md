---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ac-reprojetar-fluxo
commit: ab43b72a12b1ae2bbd5ec8d62be368ee77414f61
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-15
---

# QA: ac:reprojetar-fluxo (E6.18)

resultado: aprovado, sem achado. Testado em ab43b72a (01bcc5c6 mais testes com banco falso e aviso no CHANGELOG; review aprovado em d99bb897, que só soma o parecer). Sem `CA-n` de UX (comando de dados); as obrigações são as do brief: preencher `dim_chamado.fluxo` só onde é nulo, reaplicar a regra do D2, múltiplo e sem etapa seguem nulos, idempotente, uma transação, registro em `ctl_coleta`.

## Diff contra a obrigação
Diff `0358e417..ab43b72a` fora de `docs/`: 8 arquivos (comando `reprojetar-fluxo-ac.ts`, módulo `reprojecao-fluxo.ts`, export, script em `package.json`, CHANGELOG, 3 testes). Escopo bate com o brief. A regra é a existente (`etapasDoStaging` mais `fluxoDoChamado`), sem regra nova; do staging só sai a descrição do workflow (sem pessoa nem texto livre).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nulo com um workflow ganha fluxo | pg `nulo com um workflow ganha fluxo…` (401) | n/a | passa (CI banco) |
| Múltiplo e sem etapa seguem nulos | pg mesmo teste (402, 403) e unit "múltiplo e sem etapa" | vazio (sem etapa), dois workflows | passa |
| Já preenchido não muda | pg (404 `Fluxo Anterior` fica) | valor existente | passa |
| Só `dim_chamado` muda; staging, versão, fato intactos | pg, hash md5 por tabela antes e depois | permissão de escrita só na coluna | passa |
| Idempotente | pg `segunda execução…` (dados iguais, `lidos: 2, preenchidos: 0`) | repetição | passa |
| Lotes de 500 e cursor | unit "vários lotes: o cursor avança" | limite do lote | passa |
| Só sem fluxo derivável: nenhum UPDATE | unit "lote lido, nenhum UPDATE" | lote só de nulos | passa |
| Linha em `ctl_coleta` (projecao, versão `acelerato-f2/2-reprojecao-fluxo`) e contagens | pg (status sucesso, 3 entidades) | n/a | passa |
| Entrada do comando (credencial do migrador) | `reprojetar-fluxo-ac-entrada.test.ts` | credencial ausente | passa |

## Provas
- CI do head: run 43759194037, sha ab43b72a12b1ae2bbd5ec8d62be368ee77414f61, conclusão success; jobs `testes`, `banco`, `build`, `openapi`, `seguranca`, `imagem`, `rapida`, `filtro` success (`e2e` e `perf` skipped pelo filtro). Job `banco`: `pg tests/acelerato-reprojecao-fluxo.pg.test.ts (3 tests) 548ms`, os 3 passaram contra PostgreSQL real. No job `testes` os 3 .pg aparecem skipped, como esperado (sem banco).
- Local, unit: `vitest run acelerato-reprojecao-fluxo.test.ts reprojetar-fluxo-ac-entrada.test.ts`: 2 arquivos, 10 testes passaram.
- Vermelho antes do verde: os 3 arquivos de teste e o módulo são novos; na base 0358e417 o `import` de `reprojetarFluxoAcelerato` não existe, então a carga falha (vermelho trivial, sem teste herdado).
- Mutação à mão no módulo (unit, árvore restaurada depois de cada uma): M1 tirar `AND d.fluxo IS NULL` do UPDATE, 1 teste caiu (morto); M2 tirar `fluxo IS NULL` do SELECT, 1 caiu (morto); M3 gravar nulo (tirar o filtro `!== null`), 2 caíram (morto); M4 não avançar o cursor, 1 caiu (morto). O mutante "rodar duas vezes muda dado" é coberto pelo teste pg de idempotência, morto no CI pelo hash das tabelas. 4 de 4 mortos, nenhum sobrevivente.
- Base real (5144 chamados, todos nulos): não rodei contra o banco real; a prova é o pg do CI e é ação do dono depois da release, descrita no CHANGELOG ("Ações do dono depois da release 105"). Recomendo conferir as contagens da linha de `ctl_coleta` depois da execução.

Sem achados: nenhum bloqueante nem recomendado.

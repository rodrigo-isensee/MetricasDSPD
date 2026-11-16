---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-campos-value-id
commit: ad04bc375ee5eedc505281b82b44c8d73badd514
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-campos-value-id (campos 48 e 49 do BusinessMap casados pelo value_id, E7.203)

Sem especificação de UX nem contrato de API novos: as obrigações vêm do brief e do catálogo do spike (`/home/rodrigoisensee/pedidos-assistente/catalogo-48-49.md`). Código só de coleta, domínio e mapa do O14. Sem PR: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde da suíte e roda só os três módulos de teste tocados.

## Achados

- A1 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:58 · o teste pg do arquivo real ficou velho: espera 1 campo (e afeta vazio, linha 51) e o arquivo agora tem 2; CI banco do head falha (run 43874353570, 1 de 329). Atualizar para 2 campos, valor_id e afeta O14/O17.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| O-1: domínio guarda o value_id de cada opção (48: 114 a 125; 49: 126 a 131) | dominio-businessmap.test.ts "E7.203: os campos 48 e 49 trazem o value_id..."; conferência direta dos 18 pares do arquivo contra o catálogo | máximo (12 e 6 opções) | passou; 18 de 18 iguais ao catálogo |
| O-2: rótulos do 48 como no BusinessMap | dominio-businessmap.test.ts "E7.86: ... 12 opções" (Requisitos mal definidos, Layout / Interface) | n/a | passou |
| O-3: cada opção vira linha `valor_id_<coluna>` no ref_dominio | mesmo teste do O-1 (`listasDoArquivo`) e teste de `campo = ANY` do sincronizador | vazio (colunas sem value_id geram lista vazia) | passou |
| O-4: value_id fora do catálogo vira desconhecido, contado | allow-list.test.ts "value_id fora do catálogo" (999 no 48; 114 no 49) | fora do limite | passou |
| O-5: arquivo recusa value_id repetido ou não numérico | dominio-businessmap.test.ts "value_id repetido ou não numérico..." | repetido, `12a` | passou |
| O-6: o coletor lê `valor_id_*` do ref_dominio com desconfiança | dominio-businessmap.test.ts "valor_id_<coluna> liga value_id..." (duplicado, `1x`, código fora da lista, `desconhecido`) | entrada inválida | passou |
| O-7: versão de critério afeta O14 e O17 | dominio-businessmap.test.ts (`afeta` igual a `['O14','O17']`) | n/a | passou |
| O-8: no O14, "Demanda nova" vira nulo, não falha | metricas.mapa.test.ts "E7.203: origem_demanda das 5 falhas..." (5 passam; "Demanda nova" e valor qualquer viram nulo) | limite da 6ª opção | passou |

## Cenários e resultado real
Ambiente: worktree desanexada em `ad04bc37`, Node 24, vitest 5.1. `vitest run` nos três módulos (allow-list, dominio-businessmap, metricas.mapa): 3 arquivos, 129 testes, todos passaram.

Vermelho antes do verde (src e arquivo de domínio trazidos da base `2a4dc3b9`, testes do head): 7 falharam, 122 passaram. Caíram: os dois testes novos do arquivo de domínio (value_id nas opções; repetido ou não numérico), o do E7.86 reescrito, "tipo da lista positiva", o `dominiosDeLinhas` do `valor_id_*`, o do sincronizador (`campo = ANY`) e o do mapa. Os dois testes novos do allow-list passam na base porque `reduzirCamposCustomizados` já casava `values[].value_id`; eles guardam o comportamento, não a mudança (aceito: a mudança está no domínio que alimenta o casamento). `forge-testes --vermelho` não foi usado (árvore do autor com outros pedidos; cópia manual na worktree, restaurada com `git checkout HEAD`, árvore limpa ao fim).

Mutação no diff (a mão, um por classe pedida; cada um restaurado em seguida):
| Mutante | Resultado | Quem matou |
|---|---|---|
| M1: casar pelo rótulo (value_id ignorado em `dominiosDeLinhas`) | morto | dominio-businessmap "valor_id_<coluna> liga value_id..." |
| M2: value_id desconhecido (código fora da lista) vira opção | morto | mesmo teste |
| M3: "Demanda nova" passa ao O14 (sem filtro `origemDeFalha`) | morto | metricas.mapa "E7.203: origem_demanda..." |
| M4: arquivo aceita value_id repetido | morto | dominio-businessmap "value_id repetido ou não numérico..." |
Quatro de quatro mortos, nenhum sobrevivente.

Bordas lidas no código sem teste próprio (sem risco aberto): `String(Number(v))` normaliza zeros à esquerda (`0114` e `114` colidem e contam como repetido, comportamento seguro); `value_id` ligado a dois códigos vira `null` e é ignorado (coberto no teste do O-6).

CI do head `ad04bc37` (run 43874353570): job banco falhou (test:pg do servidor: "expected [ { field_id: '48', ...(3) }, ...(1) ] to have a length of 1 but got 2"; 1 falho, 328 passaram); demais jobs verdes. É o A1. A suíte inteira fica para o CI do PR.

## Bugs
Nenhum em docs/qa/bugs; o A1 é teste desatualizado do autor (node-backend corrige).

## Melhoria vista
nenhuma

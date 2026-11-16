---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d1a-fluxo-chamado
commit: 54d69ddc26823ce5c2c4e30de4bc20576939c397
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---
# QA: 099 D1a, fluxo do chamado (E3.248)

Código testado: 54d69ddc (CI run 43667674559, todos os jobs de código verdes; a ponta só soma pareceres). Sem especificação de UX: as obrigações são a migração 0038 (`dim_chamado.fluxo`), `fluxoDoChamado` (um workflow distinto vira o fluxo; nenhum ou mais de um fica nulo, com a contagem `fluxo_multiplo`) e o helper `migracoes-por-numero.ts`.

## Veredito
Aprovado. Os testes do autor provam as três classes (um, nenhum, dois workflows), a contagem e a gravação só em `dim_chamado`. Rodei o arquivo de teste tocado (12 passam) e 8 mutantes por cópia, restaurando o original depois de cada um.

## Achados

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Um workflow (repetido, com nulos) é o fluxo, sem contagem | acelerato-projetor.test.ts "um só workflow" | repetição de um valor | passa |
| Nenhuma etapa, workflow nulo, ausente ou vazio: nulo, sem contagem | "sem etapa, ou sem workflow nelas" | vazio, undefined, '' | passa |
| Dois workflows: nulo, nem o da 1ª etapa, soma `fluxo_multiplo` | "mais de um workflow distinto" | limite 1 para 2, ordem | passa |
| Projetor grava `fluxo` só em `dim_chamado`; versão intacta | "o projetor grava o fluxo só em dim_chamado" | coluna da versão ausente | passa |
| Migração 0038 sobe/desce e snapshot do esquema | migracoes.estatico.test.ts; job `banco` da CI | up/down | passa |
| `.pg` com helper e `linhas()` sem `fluxo` | acelerato-l9c, alvos-acelerato, apontamento, pesquisa (.pg) | down por número, não por contagem fixa | passa: job `banco` do run 43667674559, 45 arquivos e 307 testes verdes, l9c com 4 testes |

## Mutantes em `fluxoDoChamado` e no projetor
| Id | Mutação | Resultado |
|---|---|---|
| M1 | `size > 1` para `size > 2` | morto (2 testes) |
| M2 | `size === 1` para `size >= 1` | equivalente: ali size já não passa de 1 |
| M3 | múltiplo devolve o 1º workflow, sem contar | morto (2) |
| M4 | múltiplo não conta | morto (2) |
| M5 | aceita workflow vazio | morto (1) |
| M6 | `fluxo: null` no normalizador | morto (1) |
| M7 | `fluxo` fora de `ATRIBUTOS_DIM` | morto (1) |
| M8 | projetor descarta `descricao_workflow` | morto (1) |

Sobrevivente: nenhum além do equivalente M2. Árvore limpa depois (cópias restauradas).

## Vermelho antes do verde
Os mutantes M3 a M8 equivalem ao código sem a implementação e derrubam os testes novos. Não rodei `forge-testes --vermelho` (sem banco local, fora do pedido do brief).

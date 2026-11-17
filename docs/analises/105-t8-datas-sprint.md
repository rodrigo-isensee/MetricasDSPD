# T8 (Sprint): datas do card Sprint na base (tat-h) e opções para a D-T8

Pedido 105-melhorias-15-11, etapa E7.486. Consulta só de leitura na base local (`dspd_bm.stg_card`, última versão de cada card, tipo Sprint = `type_id` 12 em `ref_tipo_card`). Sem título nem pessoa. Nenhuma escrita na base.

## Universo

- 937 cards Sprint no staging; 144 descartados (`discarded_at` preenchido), que ficam fora da conta. Restam **793 sprints**, em 6 quadros (23: 389, 24: 116, 25: 88, 27: 80, 31: 99, 79: 21).
- 430 dos 793 estão arquivados (`archived_at`); nenhum marcado como excluído.
- Todos têm revisões no staging (3.537 no total), mas elas só guardam posição, não datas de vínculo (achado de 16/11).
- Filhos: 542 sprints têm links `child` (5.939 links) e 545 têm `parent`, no `linked_cards` do próprio card. A tabela `stg_vinculo` não tem nenhum vínculo com pai Sprint (o coletor o descarta, H-2).

## Campos de data (793 sprints)

| campo | cards | origem |
|---|---|---|
| `created_at` (criação) | 793 | payload do card (`stg_card.payload`) |
| `deadline` (prazo) | 247 | payload do card; preenchido à mão, 31% dos cards |
| `first_start_time` (primeira entrada em execução) | 659 | payload do card, calculado pelo BusinessMap |
| `last_start_time` (última entrada em execução) | 659 | idem; difere do primeiro em 85 cards (reentrada) |
| `first_end_time` (primeira conclusão) | 587 | idem |
| `last_end_time` (última conclusão) | 587 | idem; difere do primeiro em 88 cards (reabertura) |
| `first_request_time` / `last_request_time` (pedido) | 667 | idem; é a entrada na fila, não o início da sprint |
| `archived_at` (arquivamento) | 430 | payload do card; data de limpeza, não de fim |
| `last_modified` | 793 | payload do card; muda a cada edição, não serve |
| campos próprios (`custom_fields`) | 0 | todos os 793 têm a lista vazia: não há campo próprio de início ou fim |

Combinações: início e fim de execução juntos em 587; prazo e início em 237; prazo e fim em 208; sem prazo, início nem fim em 124; só prazo em 10; só início em 43; início e prazo sem fim em 29.

Qualidade (dos 587 com início e fim): nenhum com fim antes do início; duração mediana de 10 dias corridos, mas só 149 ficam entre 5 e 21 dias e 74 passam de 60 dias (cards deixados abertos). Entre os 237 com prazo e início, 62 têm o prazo antes do início, e só 35 têm o prazo a até 2 dias do fim.

## Opções para a D-T8

### Opção A: início e fim pelas datas de execução (`first_start_time` a `first_end_time`)
- Cobre 587 de 793 sprints (74%), sem depender de digitação.
- Deixa de fora 206 sprints sem as duas datas (124 sem nenhuma, 43 só com início, 10 só com prazo, 29 com início e prazo sem fim). Sprints com reentrada ou reabertura (85 e 88 cards) têm a janela ampliada pelo uso do primeiro início e da primeira conclusão.
- Risco: durações longas (74 acima de 60 dias) vêm de sprint esquecida aberta e distorcem o T8; exigiria um teto ou uma regra de exclusão, que é decisão do dono.

### Opção B: início por `first_start_time` e fim pelo prazo (`deadline`)
- Janela planejada, não realizada. Cobre 237 sprints (30%).
- Deixa de fora 556 sprints sem prazo ou sem início. Em 62 dos 237 o prazo vem antes do início, então a janela sairia invertida e teria de ser descartada.
- Só faz sentido se o dono quiser comparar o previsto com o realizado.

### Opção C: híbrida, prazo quando existir e execução como reserva
- Fim = `deadline` quando existir, senão `first_end_time`; início = `first_start_time`. Cobre até 616 sprints (587 com fim de execução, mais 29 com início e prazo sem fim); as janelas invertidas por prazo anterior ao início (até 62) saem.
- Deixa de fora as 124 sem nenhuma data e mistura dois significados (previsto e realizado) no mesmo gráfico, o que dificulta a leitura; só aceitável se a tela marcar a origem de cada janela.

## Recomendação

Opção A, com a regra de exclusão de janelas absurdas (um teto que o dono defina) decidida à parte, e as sprints sem janela contadas como "sem datas" na tela, sem entrar nos cálculos. Motivos: é a de maior cobertura sem mistura de significados, vem de dado automático e não de digitação. Não existe campo próprio hoje; se o dono quiser que o time marque início e fim da sprint, é preciso criar o campo na ferramenta (WS1) e coletá-lo, o que não é código desta etapa.

Limite que vale para qualquer opção: o instante em que cada filho foi ligado à sprint não existe na base (revisões sem data de vínculo), então o "antes e depois" da sprint continua sem dado; o T8 só poderá usar o vínculo atual (`linked_cards`), e o coletor ainda descarta o pai Sprint em `stg_vinculo`.

## Pergunta ao dono (D-T8)

Qual das opções A, B ou C define início e fim da sprint, e qual o teto de duração para considerar uma janela válida?

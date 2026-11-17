### Mudanças de critério de cálculo

- 2026-11-17: o tipo Enabler do BusinessMap passa a ser a categoria Habilitador (antes dentro de Trabalho de produto) no filtro Tipo e em toda métrica segmentada por tipo (O1 a O11, O14, O19 a O22, O24 a O26, T1 a T5, T10 a T13, bloqueados, Espera invisível e tendência do fluxo; O13, O18 e O27 não mudam, porque só leem tipos de bug); a coluna `dim_card.tipo` muda para os cards Enabler depois do `bm:ref-sync` e da reprojeção, sem sobrescrever o histórico (pedido 105, E7.496, T3 = A do dono).
- 2026-11-17: o T3 passa ao dado real com as fatias Produto, Habilitador, Correção em produção e Saúde técnica e de processo (Dívida técnica + Melhoria), pelo tipo do card, sem acordado, desvio nem selo de meta; fatia com menos de 20 entregas mostra só a contagem (pedido 105, E7.496).

### Adicionado

- Migração `0041_bm_ref_tipo_card_habilitador`: o CHECK de `ref_tipo_card.categoria` aceita `habilitador` (pedido 105, E7.496).

### Alterado

- Contrato do T3: `naturezas[]` traz as quatro fatias novas com `abaixoDe20`; saem `acordadoPct`, `desvioPP` e `statusMeta`; o alerta `T3_DESVIO` da Visão geral deixa de existir (pedido 105, E7.496).

### Ações do dono na base real depois da release 105

- Rodar `bm:ref-sync` (traz o Enabler com a categoria `habilitador`) e a reprojeção do BusinessMap, para os cards Enabler aparecerem como Habilitador e o T3 mostrar as quatro fatias (E7.496).

# Plano de carga da causa raiz do bug do fluxo (BusinessMap, campo 48)

Pedido 105, E7.86. Referência do arquivo `businessmap-dominio.json` (versão de critério de 2026-11-16, `afeta` vazio). Quem roda: o dono, depois do merge. Os comandos são `pnpm --filter @metricas-dspd/server run <script>`.

## Por que a recoleta precisa ser completa
A coleta incremental só lê cards com `last_modified` depois da marca d'água (`coleta.ts`). Um bug antigo, sem alteração, não ganha a causa raiz por ela. E o `bm:projetar` sozinho reprojeta o staging que já existe, no qual o campo 48 foi descartado na fronteira. Por isso a sequência inclui a carga inicial, que revisita todos os cards, bugs antigos incluídos.

## Sequência
1. Forma do valor (E7.203, resolvido): a API devolve só `values[].value_id`, sem rótulo; o arquivo guarda o `value_id` de cada opção (campo 48: 114 a 125; campo 49: 126 a 131) e o casamento é por ele. `bm:spike` só confere; `value_id` novo no BusinessMap cai em `desconhecido` até o dono atualizar o arquivo.
2. Conferência da versão da E7.5: confira em `ref_versao_criterio` que a versão da fase de detecção (2026-11-15, O15 em `afeta`) já existe. Se a base nunca a sincronizou, a tabela de fases entra sem marcar o O15 (o histórico é append-only); registre isso antes de seguir.
3. `bm:ref-sync`: grava o domínio dos campos 48 e 49 (38 linhas em `ref_dominio`: 2 de campo, 18 de opção e 18 de `value_id`, as `valor_id_*`) e a versão de critério.
4. `bm:coleta carga-inicial` (com `--projetar`, se o modo estiver em uso): reabre os cards e grava staging novo com o campo 48 reduzido ao código do domínio. Não sobrescreve histórico; arquivados e excluídos permanecem.
5. `bm:projetar`: preenche `dim_card.causa_raiz` e grava versão nova em `dim_card_versao`; as versões antigas ficam.
6. Conferência: leia a contagem da nota `campo_fora_do_dominio` das execuções. Perto do total de bugs = o arquivo não casa com a API (volte ao passo 1). Resíduo pequeno = bugs sem causa raiz preenchida ou opção nova no BusinessMap (decisão do dono, nunca inferência).

## Fora do plano
A causa raiz de incidente segue só no Acelerato; nada cruza `dspd_bm` e `dspd_ac`. O O15 fica fora do `afeta` desta versão (registrado, sem mudança).

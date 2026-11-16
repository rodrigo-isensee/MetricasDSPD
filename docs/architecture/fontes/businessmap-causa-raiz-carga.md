# Plano de carga da causa raiz do bug do fluxo (BusinessMap, campo 48)

Pedido 105, E7.86. Referência do arquivo `businessmap-dominio.json` (versão de critério de 2026-11-16, `afeta` vazio). Quem roda: o dono, depois do merge. Os comandos são `pnpm --filter @metricas-dspd/server run <script>`.

## Por que a recoleta precisa ser completa
A coleta incremental só lê cards com `last_modified` depois da marca d'água (`coleta.ts`). Um bug antigo, sem alteração, não ganha a causa raiz por ela. E o `bm:projetar` sozinho reprojeta o staging que já existe, no qual o campo 48 foi descartado na fronteira. Por isso a sequência inclui a carga inicial, que revisita todos os cards, bugs antigos incluídos.

## Sequência
1. Forma do valor: rode `bm:spike` num bug com o campo 48 preenchido e veja se a API devolve `value` (texto da opção) ou só `values[].value_id`. O arquivo casa pelo rótulo. Se vier só `value_id`, troque a chave do arquivo (nova versão de critério) antes de seguir; sem isso todo bug vira `desconhecido`.
2. Conferência da versão da E7.5: confira em `ref_versao_criterio` que a versão da fase de detecção (2026-11-15, O15 em `afeta`) já existe. Se a base nunca a sincronizou, a tabela de fases entra sem marcar o O15 (o histórico é append-only); registre isso antes de seguir.
3. `bm:ref-sync`: grava o domínio do campo 48 (13 linhas em `ref_dominio`) e a versão de critério.
4. `bm:coleta carga-inicial` (com `--projetar`, se o modo estiver em uso): reabre os cards e grava staging novo com o campo 48 reduzido ao código do domínio. Não sobrescreve histórico; arquivados e excluídos permanecem.
5. `bm:projetar`: preenche `dim_card.causa_raiz` e grava versão nova em `dim_card_versao`; as versões antigas ficam.
6. Conferência: leia a contagem da nota `campo_fora_do_dominio` das execuções. Perto do total de bugs = o arquivo não casa com a API (volte ao passo 1). Resíduo pequeno = bugs sem causa raiz preenchida ou opção nova no BusinessMap (decisão do dono, nunca inferência).

## Fora do plano
A causa raiz de incidente segue só no Acelerato; nada cruza `dspd_bm` e `dspd_ac`. O O15 fica fora do `afeta` desta versão (registrado, sem mudança).

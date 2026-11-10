---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1b-leitura
commit: 0af840f66c10d7136766800eacf025f055c0856f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-06
---
# Review de segurança: lote 1b do pedido 075, leitura publica "não classificado" (E1.7, K-204)

Propósito: parecer de segurança do lote 1b (diff `da61dbc...0af840f`, 6 arquivos, cerca de 30 linhas): a leitura da projeção devolve "não classificado" para motivo fora dos 7, e o O19 lista os 8 motivos publicados. Gatilho: leitura de projeção (controle 2 do modelo de ameaças do 075). Público: node-backend (dono), tech-lead, qa-engineer, Jarvis.

**Veredito: aprovado** em `0af840f`. Nenhum bloqueante. Revisão estática: li o diff inteiro e rodei só os testes dos arquivos tocados que importam aqui (`server/tests/metricas.mapa.test.ts` e `packages/metricas/src/businessmap/bloqueios.test.ts`, 2 arquivos, 32 testes verdes, 2 workers). Não rodei a CI nem a suíte inteira (a CI do push verde é a prova, conferida pelo brief). Lacuna de ferramenta: sem `gitleaks` nem SAST nesta rodada (fora do PATH, e a rede do sandbox bloqueou o npm); o diff não traz segredo nem dependência nova.

## O que foi verificado
- **Controle 2, defesa de leitura.** `server/src/modulos/metricas/mapa.ts:62-64` (`motivoPublicado`): só passa o valor que está em `MOTIVOS_BLOQUEIO` por igualdade exata (`includes`); qualquer outro, inclusive `null` (vira `''` e não casa), vazio, variante de caixa e texto com pessoa, sai `MOTIVO_NAO_CLASSIFICADO`. O texto lido nunca é devolvido: o ramo de saída é a constante. O `campo(l.motivo)` anterior, que repassava o texto, foi removido (`mapa.ts:68`).
- **Teste do controle.** `server/tests/metricas.mapa.test.ts:51-56` cobre motivo do domínio (passa), `'Fornecedor'`, `''`, `null` e `'MARCADOR-PESSOA-075'` (todos "não classificado"). Passou.
- **Ponto único de leitura.** `bloqueioDe` é o único mapeador de `fato_bloqueio` para `FatoBloqueio` na leitura (`repositorio.ts:77` alimenta só ele); `estado.ts:51`, `bloqueados.ts:24`, `o2.ts:66`, `o19.ts:27` e `t12.ts:18` consomem o fato já normalizado, então o O1, o O2, a lista de bloqueados e o O19 herdam a defesa. Defesa em profundidade: o schema de saída é `z.enum(MOTIVOS_BLOQUEIO_PUBLICADOS)` (`schemas.ts:101`, `:135`; `tambem.ts:71`), que recusa qualquer outro texto mesmo se o mapa falhasse.
- **O19 com 8 motivos.** `o19.ts:26` itera `MOTIVOS_BLOQUEIO_PUBLICADOS`, "não classificado" por último; o piso de 20 itens por motivo segue na mesma função, sem mudança, então a oitava linha não publica estatística abaixo de 20. Testes ajustados de 7 para 8 (`bloqueios.test.ts`, `qa011-fase1.test.ts:352`, `metricas.test.ts:201`) e a asserção nova do oitavo valor; sem enfraquecer nenhuma outra.
- **Nenhuma coluna ou chave nova de pessoa.** `LinhaBloqueio` e a projeção de `FatoBloqueio` não ganharam campo (`mapa.ts:68-72` só troca a origem de `motivo`); `git diff --stat` não lista `packages/contratos` nem `server/src/modulos/businessmap` (zero diff nos dois); também não toca `allow-list.ts`, `coleta.ts`, `grants.ts`, `lgpd.ts`, migração nem `aceitas.json`.
- **Consumidores.** Nenhum campo novo no contrato nem na rota; o enum de 8 valores já foi revisado no lote 1a.

## Achados
- A1 (recomendado) server/src/modulos/metricas/mapa.ts:70 · `fornecedor` segue repassado como lido da projeção, fora do escopo do 1b. Quando a WS1 definir o campo (T10 adiado), validar contra lista fechada na leitura, como o motivo.

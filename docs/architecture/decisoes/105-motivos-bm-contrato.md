# Decisão do arquiteto: mudança incompatível do enum de motivo de bloqueio (pedido 105, E7.231)

- **Data:** 2026-11-16. **Quem:** `software-architect` (política de mudança de contrato §5; falta o `tech-lead`).
- **Lido em:** worktree `/home/rodrigoisensee/MetricasDSPD-069`, cabeça e0fb925f (brief: revisar fa1e83e6).
- **Origem:** decisão B do dono (motivos do BusinessMap no lugar dos 7 do briefing) e decisão A do T10 (fornecedor = "Aguardando fornecedor" e "Dependência Externa").

## Decisão
**APROVA**, sem `/api/v2`, convivência zero, **com 1 condição antes do merge** (abaixo).

## O que muda no contrato
- `MOTIVOS_BLOQUEIO` (`packages/contratos/src/comum.ts:99-111`): 7 valores do briefing saem, entram os 11 habilitados (ids 1-3, 6, 7, 9-14, conforme `docs/architecture/fontes/businessmap-dominio.json:70-82` e o catálogo do dono). `MOTIVOS_BLOQUEIO_PUBLICADOS` mantém "não classificado" no fim.
- Contratos afetados: O2, BLOQUEADOS e O19 (enum na resposta: valor removido e valor novo, os dois incompatíveis pela tabela do §2). As três fotografias já trazem o enum novo (por exemplo `snapshots/resultados/O2.json:389-402`) e `aceitas.json` está vazio, como manda o passo 5 do fluxo.
- T10 e T12: muda o critério, não o formato do DTO (§4); entram na versão de critério `criterio-2026-11-16-motivos-bloqueio-bm`.

## Por que sem /api/v2
1. **Consumidor único, no mesmo lançamento:** a API serve só o `web` do mesmo monorepo, que sai no mesmo deploy. Não existe consumidor de fora que precise de um v1 congelado.
2. **O consumidor não é exaustivo:** `web/src/components/ui/MotivoBloqueio.tsx` só compara com `MOTIVO_NAO_CLASSIFICADO` e mostra o texto como veio. Não há `switch` nem `Record<MotivoBloqueio, …>` no repositório.
3. **O histórico não derruba a resposta:** a defesa de leitura `motivoPublicado` (`server/src/modulos/metricas/mapa.ts:62-64`) transforma em "não classificado" qualquer texto gravado fora do domínio novo. Linha antiga não vira 500 na validação Zod da saída.
4. **O cache é só em memória** (`servico.ts:313-317`) e é descartado no deploy, então não sobra resultado antigo.
5. Um v2 em paralelo pediria estender o gerador de fotografias (lacuna do §2) para ninguém consumir. O custo não se justifica.

**Prazo de convivência:** zero. O §5 diz que o prazo é do usuário. Proponho zero, e a decisão B do dono já pede a troca dos motivos. Se o dono quiser convivência, esta aprovação cai e o caminho passa a ser o v2.

## Condição (bloqueia o merge)
O texto publicado diverge do código e do catálogo. Ainda fala em 10 motivos (ids 9 a 13), deixa o id 14 de fora e dá "Dependência Externa" como o único motivo de fornecedor. Corrigir para **11 motivos, ids 1 a 3, 6, 7 e 9 a 14; fornecedor = "Aguardando fornecedor" e "Dependência Externa"** em:
- `packages/metricas/src/core/criterios.ts:142` (`descricao` da versão de critério, que vai ao corpo e à marca no gráfico pela T2.6);
- `docs/briefing-execucao-metricas.md:137` (nota datada);
- `CHANGELOG.md:9`.

## Observações (não bloqueiam)
- O PR registra na descrição o hash do aceite de cada contrato (O2, BLOQUEADOS, O19) e diz que a diferença das fotografias é só o enum. O §2 só garante a sequência aceite → fotografar → remover pelo diff, e o revisor confere.
- Em dado real, o T10 agrupa pelo campo `fornecedor` (`t10.ts:29`). `MOTIVOS_FORNECEDOR` hoje só é usado no mock (`packages/mock/src/businessmap/gerador.ts`). Se a decisão A do dono pedir que o T10 real filtre pelo motivo, falta implementar. Isso é pergunta ao dono, não inferência.
- `MOTIVOS_IDA_E_VOLTA` (`t12.ts:12`) é um `Set` exportado e mutável, e os testes o alteram. Fica aceitável enquanto estiver vazio por decisão do dono. Quando o dono definir os motivos, vira lista `as const` em `contratos`, no padrão de `MOTIVOS_FORNECEDOR`.

## Reversão
Reabrir para v2 se aparecer um consumidor da API fora do `web` do monorepo, ou se o dono pedir convivência com os 7 motivos do briefing.

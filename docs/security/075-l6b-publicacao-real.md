---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l6b-publicacao-real
commit: bd76128a9fde6822f9e126ceaf4c24462fc7b865
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-11
---
# Review de segurança: lote 6b do pedido 075 (publicação real de BLOQUEADOS, O1, O2, O5 e O19)

Propósito: conferir o diff `129fc3d5...bd76128a` (15 arquivos, +318 -158) contra o gatilho do plano (projeção lida pela API, publicação de dado antes oculto) e os controles 3, 4, 6 e 10 e o CA-075-11 do modelo de ameaças (`docs/security/075-modelo-ameacas.md`). Público: tech-lead, node-backend, qa-engineer. Revisão estática; nada foi alterado em código.

## Gatilhos
Projeção lida pela API (`R-SEGURANCA`): o interruptor `BLOQUEIOS_COM_DADO_REAL` passa a `true` (`packages/contratos/src/origem.ts:58`) e BLOQUEADOS, O5 e O19 entram em `METRICAS_ORIGEM_REAL` (`origem.ts:17-28`), então o conteúdo de `fato_bloqueio` real chega à resposta da API e à exportação.

## Resultado por controle
- **Mudança só de publicação: conforme.** Código de produção alterado: o interruptor e o mapa real (`origem.ts`), a data `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` (`packages/metricas/src/core/criterios.ts:127`) e dois comentários em `server/src/modulos/metricas/servico.ts:322-324`. Sem diff em `server/src/plataforma` (`grants.ts`, `lgpd.ts`), `server/migrations`, `allow-list.ts`, `coleta.ts`, `repositorio.ts` nem `mapa.ts`. Controle 6 (o interruptor é o único ponto que muda a publicação) cumprido.
- **Sem dado de pessoa na resposta (controle 10, T2, T11, CA-075-11): conforme.** A leitura de bloqueios é `lerBloqueios` (`repositorio.ts:75-80`, sem diff), com colunas explícitas `card_id, motivo, coluna_em_que_bloqueou, fornecedor, inicio, fim, duracao_horas_uteis`; nenhuma de pessoa nem texto livre. O motivo passa por `motivoPublicado` (`mapa.ts:63-64`): fora dos 7 do domínio vira "não classificado", o texto lido nunca sai. Os contratos das cinco métricas não mudaram: `resultadoBloqueados` (`schemas.ts:93-106`: `cardId`, `titulo`, `tipo`, `etapa`, `motivo` em enum, `fornecedor`, `bloqueadoHaDiasUteis`), O19 com `fechado(...)` e `motivo` em enum (`tambem.ts:67-80`), O5 por tipo (`schemas.ts:849`). `responsaveis` sai sempre `[]` e `usuario` `''` no mapa (`mapa.ts:14, 58`). O teste S6 (`server/tests/painel-real-f6.test.ts`) varre todas as chaves das cinco respostas contra uma lista de segmentos de pessoa; ver A1.
- **Exportação: conforme.** `web/src/features/exportar/gerar.ts` (sem diff) monta os blocos a partir da mesma resposta da API; não lê outra fonte nem campo extra.
- **Stub do E2E: conforme.** `server/tests/pg/api-stub-065.ts` só deixa de aplicar `semParteDeBloqueio`; serve o núcleo do mock (dado sintético), sem banco e sem dado real.
- **Sem avaliação individual (regra inviolável): conforme.** BLOQUEADOS lista cards; O19 agrega por motivo; O5 por tipo; O1 por coluna e tipo de coluna; O2 por item. Nenhuma agregação por pessoa ou por time ganhou forma nova. Percentil abaixo de 20 itens sai `insuficiente` (S4 e S5 do teste), pela biblioteca.
- **`dspd_api` sem coluna de pessoa (controles 3 e 4, CA-075-5): conforme.** Sem diff em `grants.ts`, `lgpd.ts` nem na lista de colunas fechadas do 4c (`a04614df`); nenhum GRANT novo; a API continua lendo só `fato_bloqueio` e `dim_card` do esquema `bm` (sem leitura de `dspd_ac`, T10).
- **T2.6: conforme.** Versão `criterio-2026-11-01-bloqueio-com-dado-real` com `afeta` das cinco; o corte da série do O1 antes da data sai `null`, nunca 0 (testes S2, S2b e `corte-serie-o1-075.test.ts`). Reversão pelo interruptor coberta (S9b).
- **Segredos em testes e fixtures: conforme.** Fixtures novas só com ids sintéticos (`'A'`, `'B'`), motivos do enum e datas; nenhum token, apikey, senha, e-mail ou nome de pessoa no diff (grep por `apikey|token|senha|password|secret|e-mail de domínio` sem ocorrência em linha adicionada).
- **Informativo, sem mudança neste lote:** `titulo` do card do BusinessMap vai na BLOQUEADOS como já ia no O2 real; título de card pode conter nome de pessoa digitado no quadro, mas a regra inviolável de título restrito é do chamado do Acelerato, e a exposição não é nova (já pública no O2 desde o 060). Fica como observação para a WS1, não como achado.
- **Testes dos arquivos tocados:** `server/tests/painel-real-f6.test.ts`, `corte-serie-o1-075.test.ts` e `qa-f6-painel.test.ts`: 48 passados; `packages/contratos/src/origem.test.ts`: 17 passados (vitest, 2 workers). Os `.pg`, os da web e o E2E ficam com a CI do PR; suíte inteira é do QA.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH; não rodados aqui. Sem dependência nova no diff; ficam com o CI.

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:339 · a regex PESSOA do S6 (CA-075-11) não cobre "bloqueado por", "quem", "comentario" nem "observacao", que o modelo cita (T3, CA-075-4/11); acrescentar bloquead[oa]_?por|quem|coment|observ para a guarda não depender só do contrato fechado.

## Plano em cartões
Nenhum bloqueante. A1 ao qa-engineer (ou node-backend, dono do teste), no próprio lote ou no 9b, se o tech-lead concordar.

## Riscos aceitos
Nenhum.

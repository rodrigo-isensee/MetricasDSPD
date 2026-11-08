---
tipo: revisao-seguranca
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4b-fato-bloqueio
commit: 65859649df7bc4525b94521938fe9bc75150038d
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-07
---
# Review de segurança: lote 4b do pedido 075 (projetor monta `fato_bloqueio`)

Propósito: conferir o diff `b906f4fa...65859649` (8 arquivos, +126 -23) contra o gatilho do plano (banco, projeção lida pela API) e os controles do modelo de ameaças (`docs/security/075-modelo-ameacas.md`) que o 4b toca. Público: tech-lead, node-backend, qa-engineer. Revisão estática; nada foi alterado em código.

## Gatilhos
Banco e projeção lida pela API (`R-SEGURANCA`): o projetor passa a gravar `fato_bloqueio`, que o `dspd_api` lê com `SELECT` de tabela inteira (`grants.ts:53`, sem diff).

## Resultado por controle
- **Fato só de `evt_bloqueio` (T1): conforme.** `montarFatosBloqueio` (`projetor.ts:158-176`) lê só `evt_bloqueio` (início com o fim por `LEFT JOIN`), nunca `stg_card` nem a derivação em memória. As colunas do fato vêm de `motivo_codigo` (dígitos ou nulo, `codigoDe`), `coluna_id` (dígitos), `fornecedor_codigo` (código de domínio por `colunasDeLista`) e instantes; o `block_reason` com texto de pessoa não existe no `stg_card` (allow-list sem diff), logo não tem caminho até o fato.
- **Controle 2, `motivo` só com os 8 valores: conforme.** `ctx.motivos.get(e.motivo_codigo ?? '') ?? MOTIVO_NAO_CLASSIFICADO` (`projetor.ts:164`); o mapa vem de `motivosDeLinhas` (`dominio-businessmap.ts:215-227`), que só aceita `reason_id` numérico e rótulo entre os 7 de `MOTIVOS_BLOQUEIO`, e descarta código ligado a dois motivos. Código nulo usa a chave `''`, que nunca está no mapa (`ID_CAMPO`), e vira "não classificado". O `.pg` do 4b confere que nenhuma linha de `fato_bloqueio` fica fora de `MOTIVOS_BLOQUEIO_PUBLICADOS`. O rótulo vem do banco (`ref_dominio`), nunca da fonte em tempo de coleta.
- **Controle 5 e T6, sem sobrescrita: conforme, desvio aceito mantém o controle.** O controle pede `INSERT ... ON CONFLICT` e `UPDATE` do fim e da duração, sem `DELETE`; o código faz exatamente isso, em duas instruções: `UPDATE ... FROM unnest(...) WHERE ... (fim, duracao_horas_uteis, motivo) IS DISTINCT FROM (...)` (`projetor.ts:168-172`) e `INSERT ... ON CONFLICT ON CONSTRAINT uq_fato_bloqueio DO NOTHING` (`projetor.ts:173-175`). Os dois correm na transação do lote; nenhum `DELETE` (teste unitário confere), `TABELAS_LIMPAS_NA_RECONSTRUCAO` segue `['dim_card']`. O `UPDATE` toca só `fim`, duração, `motivo` e `atualizado_por_coleta_id`: `inicio`, `coluna_em_que_bloqueou`, `fornecedor` e `coletado_em` ficam como gravados. O `fim` só passaria a nulo se o evento `fim` sumisse, e `evt_bloqueio` é append-only. Reexecução sem mudança grava zero (`.pg`: `fatosBloqueio.inseridos` 0). Todas as consultas são parametrizadas; o esquema vem de `esquemasDoAmbiente`.
- **`evt_bloqueio` intacto na reclassificação: conforme.** O `.pg` compara `SELECT *` de `evt_bloqueio` antes e depois de mapa e calendário novos e exige igualdade; o código novo não escreve no evento.
- **T7, limpeza do seed: sem risco novo.** O `UPDATE` grava `atualizado_por_coleta_id` com a coleta da projeção; a projeção recusa esquema com coleta seed (`exigirEsquemaSemSeed`, inalterado), então linha de seed e linha real não convivem para a limpeza confundir.
- **Duração pela biblioteca (T2.5): conforme.** `horasUteisEntre` de `@metricas-dspd/metricas/core` com o calendário de `lerCalendarioVigente(db, S, 'businessmap', 'fluxo')` ou `CALENDARIO_PADRAO` (`projetor.ts:151-155`); sem cálculo próprio. Aberto fica sem duração; fim igual ao início dá 0.
- **`coletadoEm` inválido lança sem eco: conforme.** `throw new RangeError('coletadoEm inválido')` (`bloqueios.ts:42`), sem o valor; o teste exige a mensagem exata.
- **Nota `campo_fora_do_dominio`: conforme.** O derivador passa só o campo `fornecedor` do mapa (`bloqueios.ts:40`), então a nota conta só o fornecedor; continua contagem por nome fixo, sem valor nem id.
- **Marcos por vigência e `archivedAt` como Date:** sem efeito de segurança; o fechamento por arquivamento continua limitado a `coletadoEm` (SEG-A1).
- **Sem diff** em `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos` (o diff tem só os 8 arquivos listados); `TABELAS_LIMPAS_NA_RECONSTRUCAO` inalterada. Sem GRANT novo, sem coluna nova, sem leitura de `dspd_ac`. A API segue com o interruptor desligado neste lote; o teste estático das colunas (CA-075-4) é do 4c, que precisa vir antes do 6b.
- **Testes:** `bloqueios.test.ts` e `projetor-businessmap.test.ts`, 44 passados (vitest, 2 workers). Os `.pg` não rodaram aqui (sem banco de teste); valem os da CI do push (run 42375310643, verde segundo o brief). Suíte inteira é do QA.
- **Lacunas de ferramenta:** `gitleaks`, `semgrep` e `osv-scanner` não rodados aqui; sem dependência nova no diff, ficam com o CI.

## Achados
- A1 (recomendado) server/migrations/0006_bm_projecoes.ts:33 · fato_bloqueio.motivo sem CHECK: o controle 2 depende só do projetor, e a API lê a tabela inteira. Num lote com migração, CHECK motivo IN (os 8 valores publicados) como defesa em profundidade (já recomendado no modelo).

## Plano em cartões
Nenhum bloqueante. A1 ao node-backend, num lote com migração, se o tech-lead concordar.

## Riscos aceitos
Nenhum.

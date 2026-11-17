---
tipo: revisao-seguranca
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t3-habilitador
commit: dbf457a1bb79ff1d76b9f090def832c067fa8cd9
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-17
---
# Review de segurança: T3 com o Habilitador e migração 0041 (E7.517)

Propósito: conferir que a migração 0041, o SQL de implantação e a categoria nova `habilitador` não abrem permissão, não reescrevem histórico e não trazem dado de pessoa. Público: tech-lead, node-backend, qa-engineer. Revisão estática do diff `6fb535ed..dbf457a1`. Nenhum código foi alterado.

## Achados
- A1 (recomendado) server/migrations/0041_bm_ref_tipo_card_habilitador.ts:24 · o `down` recria o CHECK de seis valores e falha se já houver linha `habilitador`; é proposital (não apaga dado), mas convém registrar no roteiro de reversão da implantação que a volta exige fechar antes a vigência Enabler pelo `bm:ref-sync`.

## Gatilhos
Migração de banco (`server/migrations/0041_bm_ref_tipo_card_habilitador.ts`, `deploy/sql/0041_bm_ref_tipo_card_habilitador.sql`, `deploy/sql/consolidado.sql`) e perímetro de GRANT.

## Evidência
- **Migração 0041.** Só troca o CHECK de `dspd_bm.ref_tipo_card.categoria` (DROP IF EXISTS + ADD com sete valores); nenhuma linha é reescrita, nenhuma coluna nova, nenhum `UPDATE`/`DELETE`. Valores vêm de constantes (`lista(valores)`), sem entrada externa: sem injeção. Histórico preservado: a mudança de tipo chega por vigência nova da referência e versão nova em `dim_card_versao`.
- **SQL de implantação.** `deploy/sql/0041_...sql` em transação (`BEGIN`/`COMMIT`), igual ao `up`, sem segredo; registra em `dspd_core.pgmigrations`. No `consolidado.sql` o trecho entra antes do bloco `REVOKE ALL ... dspd_bm` existente, que segue intacto e reaplica os GRANTs depois.
- **GRANT.** Nenhum `GRANT`/`REVOKE` novo ou alterado no diff (busca por `grant|revoke` nas linhas adicionadas: vazia). `dspd_api` continua sem colunas de pessoa; a categoria é enum fechado, não dado pessoal.
- **Conferência e contratos.** `server/src/modulos/businessmap/conferencia.ts:10` só amplia o enum zod; `businessmap-conferencia.json` ganha o tipo `Enabler` com categoria; `FATIAS_T3` e `fatiaT3De` são mapas fechados por tipo. Nada de nome, e-mail, título ou descrição.
- **Regras invioláveis.** T3 segue por `publicavel` (abaixo de 20 só contagem), sem ranking nem meta por pessoa; mudança de critério registrada em `VERSAO_CRITERIO_HABILITADOR_T3` (`packages/metricas/src/core/criterios.ts`). Sem mistura BusinessMap/Acelerato.
- **Credenciais e dependências.** Nenhum segredo, pacote ou lockfile alterado no diff.

## Provas
- PQ do autor: a suíte inteira roda só no CI do PR (sem PR para esta branch, conforme o brief); este parecer não afirma CI verde.
- Ferramentas locais de varredura: nenhuma rodada; o job `seguranca` do CI cobre `gitleaks`, auditoria e SAST.

## Plano em cartões
- A1: anotar a pré-condição de reversão da 0041 no roteiro de implantação; dono node-backend (esforço P).

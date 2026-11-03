---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-guardas-seed
commit: b1104f3b9c148aa40bd870a21a49f77a8dd55476
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-03
---
# Review de segurança: 060-guardas-seed (reforço das guardas do seed, E2.25)

Diff revisado: `3c284ff...b1104f3` (um commit, 11 arquivos), lido inteiro, mais o contexto de `coleta.ts`, `seed-cli.ts`, `trava.ts`, `acelerato/controle.ts` e a migração `0004_bm_staging.ts`. Referências: `docs/architecture/060-sem-mock.md` (P1) e a ADR 0026 (decisão do A3), na worktree 052b. Revisão estática; nada rodou no banco e nenhum arquivo `.env*` foi lido. Parecer anterior do P1: `docs/security/060-seed-recusa-real.md` (A1 recomendado, tratado aqui).

## Gatilhos
Banco: o seed grava com o papel migrador e passa a contar `stg_webhook_evento`; a coleta e o projetor das duas fontes tomam a trava `dspd:seed` antes de conferir o esquema (R-SEGURANCA).

## Resumo
1. **O seed nunca grava em base com coleta real.** `seed.ts:236-246`: trava `dspd:seed`, depois a conferência nos dois esquemas (coleta real, item real e, só no BusinessMap, evento de webhook), tudo na mesma transação e antes de qualquer INSERT. Recusa lança antes de gravar em qualquer esquema (testes `seed.duble.test.ts:52` e `seed-recusa-real.pg.test.ts:81`, com ROLLBACK e o evento intacto).
2. **Contagem de `stg_webhook_evento`** (`guarda-seed.ts:52-54`): identificador validado por `IDENT` antes da interpolação (teste com `x; DROP`), só sobre `S.bm` (`webhook: true` só no alvo BusinessMap, `seed.ts:229`); a tabela existe em todo esquema BM (`0004_bm_staging.ts:31`); lida pelo papel migrador, sem GRANT novo, como pede a ADR 0026. Tabela ausente derruba a transação: falha fechada.
3. **As coletas recusam esquema com seed antes da primeira escrita.** BusinessMap cards (`coleta.ts:257`) e apontamento (`apontamento/coleta.ts:247`) conferem antes de `fecharInterrompidas` e do INSERT em `ctl_coleta`; projetores (`businessmap/projetor.ts:202`, `acelerato/projetor.ts:118`) conferem dentro da própria transação, com a trava valendo até o commit. Acelerato (`coletor.ts:174-176`): a guarda passou para dentro da trava da fonte, antes de ler o MySQL, e a recusa é relançada antes de `registrarFalha` (`coletor.ts:185`): nem a linha de falha entra no esquema com seed. Testes de ordem em `esquema-com-seed.test.ts:18` e `:54`, sem escrita.
4. **Mensagens de recusa.** Seed: esquema, tabela e contagens (`seed.ts:244-245`). BusinessMap: esquema e contagem (`descreverColetasDoSeed`). Acelerato: código fixo `esquema-com-seed` e entidade; o log usa `erro.paraLog()`. Nenhuma URL, host, usuário, senha nem dado de pessoa. `seed-cli.ts:8` cita só o nome da variável `PG_SEED_URL`, não o valor.
5. **Nenhum segredo novo.** O diff não toca `.env*`, workflow nem configuração; grep de padrões de credencial no diff sem resultado. Nenhuma regra inviolável afetada: cada guarda olha só o esquema da sua fonte, sem cruzar BusinessMap e Acelerato; nada de métrica, cálculo ou dado de pessoa.

A1 do P1: a trava `dspd:seed` agora é tomada na conferência da coleta e do projetor (`guarda-seed.ts:15-18`). No projetor a corrida fica fechada; na coleta resta uma janela, registrada abaixo como A1 recomendado.

Lacuna: `gitleaks`, `semgrep` e `osv-scanner` não estão no PATH desta estação; segredos conferidos lendo o diff. As varreduras seguem no CI.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/coleta.ts:257 · A trava `dspd:seed` cai antes do INSERT em ctl_coleta (:292; Acelerato idem). Com `PG_SEED_URL` na base real vazia, seed passa; só stg/ctl misturam, o projetor recusa. Abrir ctl_coleta na transação da guarda. Dono: node-backend.

## Plano em cartões
- A1: cartão de recomendados do node-backend, sem prazo (não bloqueia).

## Riscos aceitos
Nenhum.

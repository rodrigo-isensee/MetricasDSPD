---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ac-reprojetar-fluxo
commit: ceb868773503b7c08d4831237e4beafedb5367fa
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: ac:reprojetar-fluxo (E6.16, feature/105-ac-reprojetar-fluxo)

Escopo: `git diff origin/develop...01bcc5c6`, 1 commit, 7 arquivos: `reprojecao-fluxo.ts`, entrada `reprojetar-fluxo-ac.ts`, export, script em `server/package.json`, dois testes e `CHANGELOG.md`. Etapa E6.17. Tamanho: 265 linhas (teto de 150 excedido; o corpo do PR precisa dizer `teto: excedido, 265 linhas, <motivo>`; 178 são teste).

## Os três pontos do brief

- **(a) Marca d'água em `ctl_coleta` (`projecao`):** `operacao/repositorio.ts:73-83` lê `projecao` como carga e ordena por `finalizado_em`. O comando move a marca para o instante da execução, mas isso é o que já faz `ac:reprojetar-etapas` (`reprojecao-etapas.ts:57`) e é necessário: o `coletaId` novo é o que invalida o cache das métricas, sem o qual S5, S6 e S7 não mostrariam o fluxo preenchido. O "última carga" fica adiantado até a próxima coleta; como o dono roda com a coleta parada e a coleta vem logo em seguida, não chega a enganar com gatilho. Não bloqueia (A2).
- **(b) Nunca sobrescrever histórico:** respeita. O `UPDATE` só toca `dim_chamado` com `d.fluxo IS NULL` e só grava resultado não nulo; `dim_chamado` é projeção (o projetor já a refaz por `DELETE`+`INSERT`, `projetor.ts:137`), `dim_chamado_versao`, staging e `fato_etapa_chamado` não são tocados. O teste `.pg` prova com foto md5 de cada tabela antes e depois, e o chamado 404, já preenchido, não muda.
- **(c) Idempotência e transação:** `emTransacao` envolve tudo, inclusive o `INSERT` em `ctl_coleta` (falha desfaz a linha, sem coleta órfã em andamento). Segunda execução tem `preenchidos: 0` e nenhuma tabela de dados muda, provado em `.pg`. Cursor por `chamado_id` com lote de 500 e `UPDATE ... unnest` parametrizado: sem concatenação, sem dado de pessoa (só `descricao_workflow`). A conta `semFluxo = lidos - preenchidos - fluxoMultiplo` fecha.

## CI do head

Run 43758244047: `banco`, `seguranca`, `rapida`, `build`, `openapi`, `imagem` verdes (o `.pg` do fluxo passa); **`testes` vermelho** em `pnpm run cobertura`: server com 99,45% de linhas, 99,48% de funções, 99,47% de instruções e 99,85% de ramos contra o limite global de 100% (4777 de 4803 linhas: 26 sem cobertura, o tamanho do corpo de `reprojetarFluxoAcelerato`). O novo `server/tests/acelerato-reprojecao-fluxo.pg.test.ts` fica fora do projeto `unit` (`vitest.config.ts:11`, exclui `*.pg.test.ts`) e o job `testes` não tem banco; o único teste unitário novo cobre só a entrada, que a cobertura exclui (`vitest.config.ts:28`). O par de `ac:reprojetar-etapas` tem `acelerato-reprojecao-etapas.test.ts` com banco falso exatamente por isso.

## Achados

- A1 (bloqueante) server/src/modulos/acelerato/reprojecao-fluxo.ts:24 · sem teste unitário com banco falso, só `.pg`; o CI exige 100% e o run 43758244047 está vermelho (99,45%). Criar `acelerato-reprojecao-fluxo.test.ts` no molde do de etapas.
- A2 (recomendado) server/src/modulos/acelerato/reprojecao-fluxo.ts:27 · a linha `projecao` adianta o "última carga" sem dado novo (como `ac:reprojetar-etapas`); avisar no CHANGELOG que a próxima coleta corrige, ou gravar `finalizado_em` da marca anterior (decisão do dono).
- A3 (recomendado) server/tests/acelerato-reprojecao-fluxo.pg.test.ts:96 · o teste não afirma que a marca d'água (`lerMarcaDagua`) passa a apontar o `coletaId` novo; o efeito de invalidar o cache é a razão do `ctl_coleta` e fica sem prova.
- A4 (recomendado) CHANGELOG.md:12 · o PR passa do teto de 150 linhas (265): dizer o motivo no corpo (`teto: excedido, 265 linhas, ...`).

## Entregar contra os commits

O item "tech-lead do ac:reprojetar-fluxo (01bcc5c6)" é este parecer; o comando, a migração dependente (0038, já na base), o CHANGELOG com "Ações do dono depois da release 105" e o `ctl_coleta` com contagens estão no commit 01bcc5c6.

## Parecer

**Reprovado** por A1: o CI do head está vermelho e o autor volta ao molde do teste de etapas. Os pontos (a), (b) e (c) do brief estão resolvidos; sem A1, aprovo.

## Revalidação (E6.21, head ab43b72a)

Delta lido: `git diff 01bcc5c6 ab43b72a` (CHANGELOG, `server/tests/acelerato-reprojecao-fluxo.test.ts`, este parecer). A1 resolvido: 7 testes com banco falso cobrem nulo ganha fluxo, múltiplo e sem etapa seguem nulos, lote vazio, cursor, ROLLBACK, guarda de seed e `ctl_coleta` com tarefa e versão; o falso confere o texto do `UPDATE` (`d.fluxo IS NULL`) e do cursor. A2 resolvido: o CHANGELOG avisa que o "última carga" fica com a hora da reprojeção até a próxima coleta. A3 e A4 seguem recomendados (A4: o PR diz o motivo do teto). CI do head: run 43759194037 concluído com sucesso, job `testes` verde (cobertura 100%).

**Parecer final: aprovado** no head ab43b72a.

## Revalidação (E6.25, head ceb86877)

Delta lido por `forge-check parecer delta`: `ab43b72a..ceb86877`, sem o que veio da base. Fora o merge da develop (PR 467, que mudou a assinatura para `fluxoDoChamado(idOrigem, etapas, c)`, decisão "A" do dono: cada chamado conta uma vez), o commit `ceb86877` muda uma linha, `reprojecao-fluxo.ts:38`, que passa a chamar `fluxoDoChamado(id, etapasDe.get(id) ?? [], c)`. Confere com a assinatura de `normalizador.ts:135`; sem guarda nova nem mutante novo. CI do head (run 43761287119): testes, banco, build, segurança, openapi e imagem verdes. **Parecer final: aprovado** no head ceb86877.

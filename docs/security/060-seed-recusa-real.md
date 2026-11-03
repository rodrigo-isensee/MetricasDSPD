---
tipo: revisao-seguranca
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-seed-recusa-real
commit: 63a9d91e8af463757dd373580330f7dc5a7660a8
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-02
---
# Review de segurança: 060-seed-recusa-real (P1 do plano 060-sem-mock)

Diff revisado: `d05bbfc...63a9d91` (E2.3, commits ac333ed, b032aaf e 63a9d91), lido inteiro: `guarda-seed.ts`, `seed.ts`, `seed-cli.ts`, a coleta e o projetor do BusinessMap e do Acelerato, a coleta de apontamento, `scripts/db.sh`, `scripts/com-api-mock.sh`, `package.json`, `.env.example`, `.github/workflows/restauracao.yml`, `tools/homolog/src/comandos.ts`, os testes e a documentação. De `63a9d91` até a ponta atual da branch entra só o parecer de devops (`docs/devops/`). Revisão estática; nada rodou no banco do dono e o `.env` não foi lido. Referência: `docs/architecture/060-sem-mock.md`, item P1.

## Gatilhos
Banco (o seed grava com o papel dono das tabelas e passa a recusar esquema com coleta real; a coleta e o projetor passam a recusar esquema com seed), configuração de ambiente (`PG_SEED_URL`, `.env.example`) e workflow da CI (`restauracao.yml`), R-SEGURANCA.

## Resumo
1. **Falha fechada no seed.** `seed.ts:236-243`: a conferência roda dentro da mesma transação, logo depois da trava `dspd:seed` e antes de qualquer INSERT, nos dois esquemas, e lança antes de gravar em qualquer um. `guarda-seed.ts:26` conta como real toda linha de `ctl_coleta` cuja versão não comece por `seed-mock`, inclusive versão nula (`coalesce(..., false)`); `guarda-seed.ts:33` conta como real todo `dim_card`/`dim_chamado` sem coleta do seed, inclusive com coleta nula ou apagada (`NOT EXISTS`). Tabela ausente ou erro de consulta derruba a transação: nada grava.
2. **Mensagem.** Seed: nome de esquema e tabela e duas contagens (`seed.ts:242`). BusinessMap: esquema e contagem (`guarda-seed.ts:39-40`). Acelerato: texto fixo do código `esquema-com-seed` (`acelerato/erros.ts:30`), só código e entidade no log. Nenhum dado de pessoa, URL, usuário ou host. O `seed-cli` não captura o erro (sai com a pilha do Node), mas a mensagem é a mesma; erros do driver nas entradas da coleta continuam traduzidos para código fechado (`entradas/coleta.ts:37`, `coleta-businessmap.ts:56`, `projetor-businessmap.ts:33`).
3. **Nenhuma escrita antes da checagem.** BusinessMap cards: `coleta.ts:253`, antes de `fecharInterrompidas`. Apontamento: `apontamento/coleta.ts:247`, depois só da checagem do sal (sem escrita). Projetor BM: `projetor.ts:202`, primeira instrução da transação, antes do INSERT em `ctl_coleta`. Acelerato coletor: `coletor.ts:169`, antes de `registrarFalha` e da trava. Projetor AC: `projetor.ts:118`. Conferi todos os gravadores de `ctl_coleta` em `server/src`: nenhum outro ponto de entrada grava staging, fato ou controle sem passar por uma dessas funções (`reconciliar-ac` só lê; `ref-sync` grava referência, fora do escopo do P1). O papel `dspd_coletor` tem SELECT em `ctl_coleta` (`grants.ts:93`), então a checagem roda com o papel de produção.
4. **`PG_SEED_URL` sem fallback.** `seed-cli.ts:7-8` lê só `PG_SEED_URL` e para na partida sem ela, antes de criar o pool (teste em `seed-recusa-real.pg.test.ts:95` com `PG_MIGRADOR_URL` definida). Quem a define: `homolog:subir` (banco de homologação na porta própria), `com-api-mock.sh:13` (banco `_test`, validado logo abaixo) e `restauracao.yml:54` (Postgres efêmero do runner). O `db:seed` da raiz e o ramo `seed` do `db.sh` saíram. O script `seed` do `server/package.json:20` continua, por desenho; apontá-lo à base real exige escrever `PG_SEED_URL` à mão, e mesmo assim o `semear` recusa se houver coleta real; numa base ainda vazia, a simetria da coleta bloqueia a carga real até o `db:limpar-seed`, então não há mistura.
5. **Segredos.** `.env.example` só muda comentário; o workflow reaproveita `PG_MIGRADOR_URL` já existente no job, sem segredo novo; `comandos.ts` monta a URL com a senha lida do `.env.homolog` como antes. Nenhum segredo novo no diff.
6. **Recusa da coleta sobre esquema com seed.** Coberta nos cinco pontos do item 3, cada fonte só no seu esquema (`S.bm` ou `S.ac`), sem cruzar BusinessMap e Acelerato.

Lacuna: `gitleaks`, `semgrep`, `zizmor`, `actionlint` e `osv-scanner` não estão no PATH desta estação; segredos e workflow conferidos por leitura do diff. As varreduras seguem no CI.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/coleta.ts:253 · Checagem da coleta sem a trava `dspd:seed`: seed e coleta simultâneos no mesmo banco passam ambos (exige `PG_SEED_URL` na base real). Tomar a trava na checagem. Dono: node-backend.

## Plano em cartões
- A1: cartão de recomendados do node-backend, sem prazo (não bloqueia).

## Riscos aceitos
Nenhum.

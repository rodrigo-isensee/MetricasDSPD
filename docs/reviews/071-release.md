---
tipo: review
contrato: 1
pedido: 071-release-069-070
branch: docs/071-release
commit: 555a002cc7bb5f898f31256c3b7245ca24647071
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-05
---

# Review da release 071: develop contra homolog (E1.1, K-222)

Candidata: `develop` em `39b761d4d04e14457690a547ba1f39d65ff2e8d7`. Base: `homolog` em `3f71950d9d7becc7ea66e67cf41a53e0919ddcbe`. Revisado na `docs/071-release` em `555a002`, que soma à candidata só as notas da release no `CHANGELOG.md`. Critério: `docs/engineering/fluxo-homologacao.md` §4 e §8. Este parecer confere que cada um dos 7 PRs de `3f71950..39b761d` tem review aprovado e passou pelos portões, e que a ordem e o banco fazem sentido para a homolog. Não relê código já revisado e não roda suíte: a suíte da ponta é da E1.2 (QA) e a segurança da release, da E1.3.

## PR x pareceres

Head revisado é o `commit` do frontmatter de cada parecer; checks lidos por `gh pr view <n> --json statusCheckRollup`. Onde o head do PR é posterior ao revisado, conferi com `git diff --stat <revisado> <head>` sobre `server`, `packages`, `web` e `e2e`.

| PR | O que entra | Review (head) | QA | Segurança | Checks no merge | Delta até o head do PR |
|---|---|---|---|---|---|---|
| #222 | 069 L7-a: calendário por domínio, `ref:sync-calendario`, ADR 0027 | `069-zz1-l7a` (95dab5d) | `069-zz1-l7a` aprovado | `069-z8-l7a` aprovado (5648e0e) | 19 verdes, 4 pulados | `889db8f`, 1 linha de teste (A1) |
| #223 | Forge 0.32.0 (`.forge/versao`) | não se aplica | não se aplica | não se aplica | 18 verdes, 5 pulados | não se aplica |
| #230 | 070 L1 e L2: simulado por cartão com selo | `070-l1`, `070-l2`, `070-v1`, `070-v2` (e8c148b) | `070-v2` aprovado | não se aplica | 2 `build` vermelhos (A2) | nada (só o update-branch) |
| #231 | 070 volta 3: gate de fronteiras, F9 abaixo de 120 KB | `070-v3` (bf3d116) | `070-v3` aprovado | não se aplica | 18 verdes, 5 pulados | nada |
| #232 | 069 L7-b: métricas leem o calendário da referência | `069-zz3-l7b` (ddbc45a) | `069-zz3-l7b` aprovado | não se aplica (só leitura) | 19 verdes, 4 pulados | nada |
| #233 | 070 L3: E2E do simulado, C6, bug 070-001 | `070-v4` (3c552b0) | `070-v4` aprovado | não se aplica | 18 verdes, 5 pulados | nada |
| #234 | ADR 0028 e desenho do 070 vigentes (só docs) | `070-w1-adr-vigente` (5a232d5) | não se aplica | não se aplica | 18 verdes, 5 pulados | nada |

Teto M14: as exceções de #222 (909 linhas), #230 (1482), #232 (153) e #233 (190) estão no corpo de cada PR e foram aceitas nos reviews; #231 tem 63 linhas. Esta branch só muda `CHANGELOG.md` e pareceres, fora da contagem.

## Portões

- Dois PRs entraram na `develop` por merge do dono fora do fluxo do tech-lead: #222 com todos os checks verdes, mas sem review do último delta (A1), e #230 com o `build` vermelho (A2). Os dois ficaram cobertos depois: o delta do #222 li neste review; o vermelho do #230 foi corrigido no #231 com review, QA e CI verdes.
- A ponta `39b761d` tem a execução de push da CI na `develop` verde (`gh run list --commit 39b761d`); a outra execução do mesmo sha, cancelada, é a da `docs/071-release` substituída pelo push do CHANGELOG.

## Banco e ordem

- Sem migração: `git diff --stat 3f71950...39b761d` não lista arquivo de migração; o L7-a grava em `ref_calendario`, `ref_feriado` e `ref_versao_criterio`, que já existem na homolog (migração 0010). Sem dependência nova: `server/package.json` ganha só o script `ref:sync-calendario`; `pnpm-lock.yaml` fora do diff.
- Ordem coerente: #222 (grava o calendário) antes de #232 (lê); #230, depois #231 (corrige o gate do #230), #233 (E2E sobre o selo corrigido) e #234 (ADR vigente depois das S1 a S3); #223 é independente. BusinessMap e Acelerato seguem separados: um calendário por domínio, e cada carga lê só o seu (`069-zz3-l7b`).
- Critério: o 070 não muda cálculo nem `core/criterios.ts`; o L7 registra versão por domínio no `ref:sync-calendario` (T2.6), e com o arquivo inicial o teste de paridade garante os mesmos números.

## Notas da release

`CHANGELOG.md:15-21`, `:34` e `:38`, escritas antes deste review (`555a002`): citam os 7 PRs, a correção do gate e do 070-001 em Corrigido, o L7 em critério de cálculo e o Forge 0.32.0 em dependências. "Sem migração de esquema" segue verdadeiro para esta versão.

## Achados

- A1 (recomendado) server/tests/calendario-referencia.pg.test.ts:125 · O #222 entrou em 889db8f sem review do delta (zz2 não delegado). Li agora: só qualifica `f.descricao` na consulta do teste (erro 42702), sem código; job banco verde nesse sha. Coberto por este parecer.
- A2 (recomendado) web/src/data/FonteComSimulado.ts:1 · O #230 entrou com o `build` vermelho (gate de fronteiras, runs 41983858085 e 41983864141); o #231 corrigiu com review e QA 070-v3 e CI verde. Registro do escape no 070; sem efeito na homolog.
- A3 (recomendado) docs/architecture/fontes/calendario.json:1 · Depois da promoção, rodar `ref:sync-calendario` na homolog: sem ele as métricas usam o calendário padrão (mesmos feriados, sem mudança de número), mas a referência fica vazia e sem a versão de critério do calendário.

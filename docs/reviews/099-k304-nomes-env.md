---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-k304-nomes-env
commit: e623a45aac6901e1328d9cbea8b8913d0f88f16d
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Code review: K-304, coleta e diagnóstico dizem os nomes das variáveis de ambiente que faltam (E3.116)

Diff lido: `git diff 9bb72d1f...3f2803e2` (6 arquivos, 1 commit: `3f2803e2`), contra o cartão K-304 (Histórico do pedido, 2026-11-12 22:32: `coleta ac` sem `.env` caía em `erro-interno`).

## Ferramentas (citadas, não refeitas)
- Worktree de review sem `node_modules`: nada rodado aqui. Suíte, typecheck, lint e cobertura ficam com o `pnpm run pronto` do autor (E3.112 conferida pelo Jarvis em 3f2803e2) e com o CI do PR; o teste novo roda no QA (E3.117).
- Tamanho (M14): 132 linhas de código e teste (`git diff --numstat`), abaixo das 150; um comportamento só.

## Conferência
- **Faz o que o cartão pede:** `coleta.ts` e `coleta-businessmap.ts` tratam `ErroConfiguracao` antes do ramo genérico e imprimem `configuração: <nomes>` por `categoriaDoErro`, que já existia e só junta nomes; o `lerConfig` do diagnóstico lista todas as obrigatórias ausentes de uma vez. Antes, as duas coletas davam `erro-interno`.
- **Nunca o valor:** os nomes vêm de `issue.path[0]` do zod (`config.ts:121`, `acelerato/config.ts:64`), nunca de `message`; a mensagem do `ErroConfiguracao` novo só traz nomes. A sentinela `SEGREDO` vai em URL do Postgres, senha do MySQL, porta inválida e apikey, e o teste confere que não sai em `stderr` nem `stdout`. Credenciais seguem só no ambiente (CLAUDE.md).
- **`carregarConfigColetaAcelerato`:** valida worker e MySQL juntos e soma os nomes; o que não é erro de configuração é relançado (as duas guardas `throw e`), então `prepararTls` e o resto seguem pelo `paraLog()` como antes. Ordem estável (worker, depois MySQL) e sem repetição (`Set`), provada no teste em processo.
- **Compatibilidade:** `diagnostico-businessmap.test.ts:318` (uma ausente, singular) continua válido; nenhum doc ou script lê o texto antigo de `coleta ac falhou` (grep em `docs/`, `scripts/`, `server/`).
- **Testes:** 7 casos, 6 por processo filho com `ambienteFilho` (só `PATH` e `TMPDIR`) e 1 em processo; cobrem todas ausentes, uma ausente com as outras presentes, valor inválido, BusinessMap e diagnóstico (plural e singular).
- **Regras invioláveis:** nada de métrica, pessoa nem mistura de fontes; só mensagem de erro de partida.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/config.ts:50 · Com `NODE_TLS_REJECT_UNAUTHORIZED=0` a validação sai antes do resto: a lista da linha 84 fica incompleta e o motivo some da saída. Nada vaza; vale um caso no teste novo que fixe essa saída.
- A2 (recomendado) server/tests/coleta-nomes-env.test.ts:9 · O cabeçalho diz que nada lê o `.env`, mas a entrada do BusinessMap o lê (linhas 62 e 63). Opcionais não definidas (`PESSOA_ELIMINADA_SAL`, `LOG_LEVEL` e afins) vêm dele e mudam o `toBe` da linha 70. Corrigir o texto e defini-las como `''`.
- A3 (recomendado) server/tests/coleta-nomes-env.test.ts:67 · Espaço sobrando no fim da linha; o `format:check` não cobre `server/`, então nada o pega.

## Revalidação 1 (E3.125, `f77f3545`)
- Delta lido: `forge-check parecer delta docs/reviews/099-k304-nomes-env.md`, intervalo `3f2803e2..f77f3545`, no domínio só `server/tests/coleta-nomes-env.test.ts` (+44/-1, só teste; nada em `server/src/`).
- Motivo da volta: o CI de `4f6b947d` caiu por cobertura do server abaixo de 100%. Os casos novos rodam `carregarConfigColetaAcelerato` no mesmo processo: ambiente completo (devolve worker e MySQL), duas variáveis do MySQL inválidas (as duas nomeadas, sem o `SEGREDO` na mensagem), `NODE_TLS_REJECT_UNAUTHORIZED=0` nomeado e erro que não é de configuração relançado nos dois ramos (`server/src/modulos/acelerato/config.ts:77` e `:83`).
- Conferido na fonte: o `z.object` lê só as chaves declaradas, então o getter que lança em `PG_COLETOR_URL` dispara só em `carregarConfigWorker` e o de `ACELERATO_MYSQL_HOST` só em `carregarConfigAcelerato`; cada caso exercita a guarda que diz exercitar. `lerConfig({})` fixa o plural, e o valor só com espaços conta como ausente.
- A1: coberto pelo caso do TLS 0 no mesmo processo (o nome da variável sai na lista). A3: espaço removido. A2 segue recomendado, sem mudança (não bloqueia).
- Ferramentas (citadas, não refeitas): CI do PR 372 no head `f77f3545`, check `testes` verde nos dois runs (`gh pr checks 372`: `testes pass 6m3s` e `testes pass 7m42s`; `rapida` e `banco` verdes). Cobertura do server em 100% nas quatro medidas pelo autor (E3.124, 2064 testes).

## Revalidação 2 (E3.131, `e623a45a`)
- Delta lido: `forge-check parecer delta docs/reviews/099-k304-nomes-env.md`, intervalo `f77f3545..e623a45a`, escopo sem o que veio da base: "nenhum arquivo do domínio mudou".
- Junção (`gh pr update-branch 372`, merge de `28bf8a14`, K-294): traz só `web/scripts/sem-mock.mjs`, `web/src/test/lint.meta.test.ts`, `docs/architecture/features/front-via-api.md` e os três pareceres `099-k294-pos-l2d`. Conferido: os seis arquivos em `e623a45a` são idênticos aos de `28bf8a14` (`git diff 28bf8a14 e623a45a` vazio neles), o K-304 não toca nenhum deles (`git diff --name-only 28bf8a14...7c81ee96`) e nada mais mudou entre `7c81ee96` e `e623a45a`. Sem conflito nem mudança de patch.
- Ferramentas (citadas, não refeitas): CI do PR 372 no head `e623a45a` todo verde (`gh pr checks 372`, laço da skill `esperar-estado`, `fim=checks:0`): `testes pass 10m5s` e `testes pass 7m17s`, `e2e-parte (1/2) pass 13m12s`, `e2e-parte (2/2) pass 20m17s`, `e2e pass`; `rapida`, `banco`, `build`, `openapi`, `seguranca`, `imagem` e `filtro` verdes.
- Achados: sem mudança (A2 segue recomendado).

## Conclusão
Parecer: aprovado no `e623a45a`.

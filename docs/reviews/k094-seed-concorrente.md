---
tipo: review
contrato: 1
pedido: k094-seed-concorrente
branch: fix/seed-concorrente
commit: 1c9ae5c
parecer: aprovado
revisor: tech-lead
data: 2026-10-15
---

# Code review: K-094, corrida no seed

**Escopo:** commit `68d030b` com 2 arquivos: `server/src/plataforma/db/seed.ts` e `server/tests/seed.duble.test.ts`.
**Veredito:** **aprovado**, com 1 ajuste recomendado que não bloqueia (teste determinístico da corrida).

## Ferramentas (citadas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto`: **EXIT=0**. Os 496 testes do server passam, os 83 de banco ficam ignorados porque exigem Postgres, e `docs:check` está ok.
- `pnpm run test:pg` completo: **EXIT=1, 76 passaram e 7 falharam**. As 7 falhas estão todas em `tests/pesquisa.pg.test.ts` e são as falhas locais já conhecidas (K-095, `ad5c1fe`). A causa é a senha do `dspd_pesquisa` ausente no ambiente, sem relação com o seed. Os 14 outros arquivos passam, `seed.pg.test.ts` incluído.

## Análise
1. **Causa e correção.** Com uma transação por schema e uma trava por schema, o seed A podia gravar o BM, e o seed B (que pulava o BM) gravava o AC. Os dois devolviam `semeado`. Agora há uma transação, e a trava `dspd:seed` é tomada antes de ler qualquer schema, então a segunda execução enxerga tudo ou nada. A correção é correta e mínima. O `continue` no lugar do `return` está certo, porque o laço segue para o schema seguinte.
2. **Granularidade × separação BM/AC.** Confirmado: a regra inviolável vale para o **cálculo e os dados** (histograma, percentil, previsão, mapeamentos, schemas). Ela não alcança o limite de commit do seed. Os INSERTs continuam em schemas e mapeadores separados (`mapearBM` e `mapearAC`), nenhum dado de uma fonte entra na outra, e nada é lido de um schema para gravar no outro. Unir o commit é uma decisão operacional, e o comentário no código diz isso. A atomicidade até melhora o resultado: uma falha no AC não deixa o BM semeado sozinho com a base pela metade.
3. **Subida de homolog e de produção.** O seed só roda em `homolog:subir` e em `restauracao.yml`, ambos com o mock. Produção não semeia o mock. Se houver falha parcial, a transação desfaz tudo e o reenvio recomeça do zero, em vez de completar só um schema. A trava dura a transação inteira, mas a base do mock é pequena e só o seed a disputa. O nome da trava mudou: isso só importa se um seed antigo e um novo rodarem juntos, o que não acontece. Um banco já semeado com a versão antiga continua `ja_semeado` (a conferência de `ctl_coleta` não mudou), e a semente diferente continua recusada.
4. **Teste que reproduz a corrida.** Rodei o código antigo (`68d030b~1`) contra o teste de concorrência existente (`seed.pg.test.ts`, "dois seeds simultâneos"), 5 vezes seguidas, e ele **passou todas**. Esse teste **não é regressão do K-094**, porque a intercalação depende de tempo: o seed A costuma pegar o AC antes de o B chegar a ele. O que protege de fato é o teste do dublê (`seed.duble.test.ts`), que agora exige 1 `BEGIN`, 1 `COMMIT` e 1 trava, e falha no código antigo (2 de cada). Essa proteção é estrutural e aceitável.
   - **R1 (recomendado, não bloqueia):** adicionar ao `seed.pg.test.ts` um teste determinístico. Uma conexão abre uma transação e toma `pg_advisory_xact_lock(hashtext('dspd:seed'))`. Em seguida, `semear` é chamado e deve ficar pendente (nenhuma linha gravada) até o COMMIT daquela conexão. No código antigo a trava tinha outro nome, então `semear` não bloquearia e o teste falharia. Pode entrar no próprio K-094 ou virar cartão.
5. **Demais itens do checklist.** Sem código morto, sem dependência nova, mensagem de commit em Conventional Commits em português com cartão. Os tipos não mudam. O teste do dublê foi atualizado junto com a mudança.

## Segurança
**Sem necessidade de parecer do `security-engineer`.** O gatilho "banco" é de esquema, GRANT, papéis, colunas de pessoa ou credenciais. Este commit não toca em nenhum deles. É só o escopo da transação e o nome de uma trava consultiva no seed do mock. Os dados, os papéis e as colunas gravadas são os mesmos, e nenhuma fronteira de dados de pessoa muda.

## Resumo
Aprovado. R1 fica como recomendação (atendida na volta 2).

## Volta 2: teste R1 (6e3ab28)
**Veredito:** **aprovado**, R1 atendido. HEAD revisado: `1c9ae5c`.

- **Determinístico.** Uma conexão segura `pg_advisory_xact_lock(hashtext('dspd:seed'))` e o teste espera, com `expect.poll` (sem espera fixa), uma trava consultiva não concedida em `pg_locks`. Só então confere que `semear` não terminou e que `ctl_coleta` está vazia nos dois schemas. Depois do COMMIT, exige `semeado` e as contagens completas. Não depende de intercalação nem de tempo.
- **Falha no código anterior.** A trava antiga tinha outro nome, então `semear` não ficaria bloqueado: o poll não veria trava pendente e estouraria em 10 s. É a regressão que faltava.
- **Limpeza.** O `finally` faz ROLLBACK (inofensivo após o COMMIT), solta a conexão do detentor, aguarda o `semear` pendente (se o poll falhar, o ROLLBACK libera a trava e o seed termina) e derruba os três schemas de prefixo próprio. Não deixa trava nem conexão presa.
- **Estabilidade na CI.** Prefixo próprio isola os schemas. Ressalva menor, não bloqueia: o poll conta travas consultivas pendentes em todo o banco; outra suíte com trava consultiva pendente poderia antecipar o sinal. Isso só enfraquece a asserção (o teste não falha por isso), e as asserções de `ctl_coleta` e do COMMIT continuam valendo. Timeout de 10 s é folgado.
- Código de teste apenas, sem impacto de segurança.

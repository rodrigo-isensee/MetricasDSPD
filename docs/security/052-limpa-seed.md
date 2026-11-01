---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: 26d097c0a51234e7f1c1ecf4aff9939abfb145e6
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: 052-limpa-seed

Diff revisado: `origin/develop..26d097c` (E2.96): `server/src/plataforma/db/limpar-seed.ts`, `server/src/entradas/limpar-seed.ts`, `server/package.json` (script `db:limpar-seed`), `server/eslint.config.js` (exceção de import do mock), os testes `limpar-seed.test.ts` e `limpar-seed.pg.test.ts` e `docs/architecture/server.md`. Revisão estática; nada foi executado no banco do dono e o `.env` não foi lido.

## Gatilhos
Controle de integridade do Forge e do projeto: o comando desliga o gatilho append-only de `fato_transicao` (data-model §1) e apaga linhas da base analítica com o papel dono das tabelas (`dspd_migrador`); regra de carga incremental que nunca sobrescreve histórico e ADR 0022 (staging da coleta real intocado), R-SEGURANCA.

## Achados
- A1 (recomendado) server/src/plataforma/db/limpar-seed.ts:65 · `ref_sle`, `ref_alocacao_acordada`, `ref_ficha_resultado` e `ref_alvo_prioridade` saem só pela chave, sem comparar conteúdo; hoje nenhum gravador real escreve nelas. Pôr as colunas numéricas e a ficha em `igual` (via `::text`). Dono: node-backend.
- A2 (recomendado) server/src/plataforma/db/limpar-seed.ts:186 · O `ALTER TABLE ... DISABLE TRIGGER` espera a trava sem limite (só o `statement_timeout` de 300 s) e, na fila, segura as leituras da API sobre `fato_transicao`. `SET LOCAL lock_timeout` curto antes do ALTER. Dono: node-backend.

## Detalhe dos achados
**Papel `dspd_migrador`.** O comando usa `PG_MIGRADOR_URL` (`entradas/limpar-seed.ts:24`), o único papel que pode desligar gatilho (dono das tabelas); os papéis da aplicação continuam sem DELETE nem ALTER, e nenhum GRANT muda no diff. O teste `.pg` "o papel sem posse das tabelas não consegue aplicar" prova que o `dspd_coletor` falha sem deixar nada pela metade. O comando é manual, nunca agendado, roda na máquina do dono (decisão S-3=Q-4) e a credencial só vem do `.env` lido pelo programa; nenhum valor dela é impresso (o erro de leitura do `.env` sai só com o código).

**Gatilho append-only desligado dentro da transação (`limpar-seed.ts:186-192`).** Só `tg_fato_transicao_imutavel` é desligado; `tg_fato_transicao_sem_truncate` continua ativo. O DISABLE, o único DELETE (filtrado por `coleta_id = ANY(ids do seed)`) e o ENABLE estão na mesma transação de `emTransacao`: no PostgreSQL o ALTER é transacional e toma trava SHARE ROW EXCLUSIVE até o fim, o que bloqueia INSERT, UPDATE e DELETE de outras sessões e mantém o gatilho ativo para elas o tempo todo; não existe janela em que outra conexão apague linha da tabela. A conferência em `pg_trigger` (`tgenabled <> 'O'` de todos os gatilhos não internos da tabela) roda antes do COMMIT e lança `gatilho`, o que desfaz a transação inteira; qualquer falha antes disso também volta o catálogo ao estado ativo pelo ROLLBACK. O teste `.pg` confirma o estado depois da aplicação e que um DELETE direto continua barrado. Nomes de gatilho e de tabela passam por `ident` ou vêm de constante; o esquema vem de `montarEsquemas` (prefixo validado por regex).

**Falha fechada contra linha de coleta real (`limpar-seed.ts:121-169`).** O seed é escolhido pela versão em `ctl_coleta` (`starts_with(versao_coletor, 'seed-mock')`, linha 124), nunca por id, e os versões dos coletores reais não começam por esse prefixo. Antes de qualquer escrita, e para os dois esquemas antes de escrever em qualquer um, o comando aborta se: uma tabela fora da lista removível tiver `coleta_id`, `atualizado_por_coleta_id` ou o card/chamado do seed (busca no catálogo, então tabela nova entra sozinha na conferência); houver staging com item do seed (ADR 0022); uma projeção tiver linha de outra coleta com item do seed; `rec_transicao_par` apontar para transição do seed; um `ref_*` tiver a chave do seed com conteúdo diferente. Os FKs para `ctl_coleta` ficam como segunda rede (DELETE com referência pendente falha e desfaz). Cada DELETE confere a contagem prevista. Os `ref_*` regerados do mock por `gerarBaseMock(parametros)`: se o gerador mudou desde 2026-10-09, a divergência leva a remover menos ou a parar, nunca a remover linha real, porque o seed gravou com INSERT simples (`seed.ts:191-196`, sem `ON CONFLICT`) e nenhuma linha real pôde ocupar a mesma chave depois. O resíduo é o A1.

**Simulação READ ONLY (`limpar-seed.ts:208`).** `SET TRANSACTION READ ONLY` é a primeira instrução depois do BEGIN; o planejamento só faz SELECT e a trava consultiva é permitida em transação somente leitura. Mesmo com o papel dono, o PostgreSQL recusa qualquer escrita nesse modo. O teste unitário confirma que a simulação não emite DELETE, ALTER, INSERT, UPDATE nem TRUNCATE, e o `.pg` confere as contagens e a foto da carga real iguais antes e depois. Escrever exige `--aplicar`; qualquer outra opção é erro de uso.

**Saída só com contagens.** O resultado traz `modo`, `fonte`, `coletas` e nome de tabela com contagem; as mensagens de `ErroLimpezaSeed` são texto do código com nome de tabela e número; qualquer outro erro, inclusive do PostgreSQL (cujo `detail` pode trazer valor de chave), sai só como `erro-interno`. Nenhum id, nome de pessoa nem título chega à saída (ADR 0020). O seed nunca gravou pessoa (`responsaveis` vazio).

**`fato_bloqueio` removido a mais.** As linhas saem pela marca `atualizado_por_coleta_id` da coleta do seed, com a mesma falha fechada das outras projeções (linha de outra coleta com card do seed para tudo). Sem elas a conferência 1 abortaria (a tabela guarda a marca do seed), então a remoção é a consequência da regra "só o seed sai" e não amplia o alcance sobre dado real. Se ela está coberta pela decisão do dono é ponto de escopo do review (E2.102), não de segurança.

**Exceção do ESLint e import do mock.** `limpar-seed.ts` passa a importar `@metricas-dspd/mock`, como o `seed.ts`; é código de linha de comando, fora da API, e não muda dependência nem lockfile.

**Fora do alcance.** `ref_versao_criterio` do `dspd_core` com motivo `seed-mock` não é tocada (registrado em `server.md`); é ponto de escopo para o review, sem efeito de segurança.

## Riscos aceitos e ferramentas
Nenhum novo. Seguem em vigor os aceites do pedido 052 (chave do dono com poder de escrita, coleta só na máquina do dono). Recomendado ao dono, como já está no passo a passo, backup antes do `--aplicar`. Lacuna: `gitleaks`, `osv-scanner` e Semgrep não estão no PATH desta estação e não foram rodados; o delta não toca dependências nem workflow, e a busca manual no diff não achou credencial nem URL de conexão; as varreduras ficam no CI.

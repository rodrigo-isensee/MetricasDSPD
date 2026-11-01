---
tipo: revisao-seguranca
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: 6ff43dfd62c05101c32d5bba081dbbcb04afff7f
parecer: aprovado
revisor: forge:security-engineer
data: 2026-11-01
---
# Review de segurança: 052-limpa-seed

Diff revisado: `origin/develop..26d097c` (E2.96): `server/src/plataforma/db/limpar-seed.ts`, `server/src/entradas/limpar-seed.ts`, `server/package.json` (script `db:limpar-seed`), `server/eslint.config.js` (exceção de import do mock), os testes `limpar-seed.test.ts` e `limpar-seed.pg.test.ts` e `docs/architecture/server.md`. Revisão estática; nada foi executado no banco do dono e o `.env` não foi lido.

Renovação por delta (E2.110): `26d097c..6ff43df` (E2.108), lido inteiro: `limpar-seed.ts` (versões de critério do seed em `dspd_core`, `lock_timeout` antes do ALTER, código `trava`), os dois testes e `docs/architecture/server.md`. `forge-check delta` listou só esses arquivos e os pareceres; de `6ff43df` até a ponta da branch só entram pareceres (nenhum código). Veredito mantido: aprovado.

## Gatilhos
Controle de integridade do Forge e do projeto: o comando desliga o gatilho append-only de `fato_transicao` (data-model §1) e apaga linhas da base analítica com o papel dono das tabelas (`dspd_migrador`); regra de carga incremental que nunca sobrescreve histórico e ADR 0022 (staging da coleta real intocado), R-SEGURANCA. Na volta, o comando passa a apagar também em `dspd_core` (versões de critério, T2.6).

## Achados
- A1 (recomendado) server/src/plataforma/db/limpar-seed.ts:68 · `ref_sle`, `ref_alocacao_acordada`, `ref_ficha_resultado` e `ref_alvo_prioridade` saem só pela chave, sem comparar conteúdo; hoje nenhum gravador real escreve nelas. Pôr as colunas numéricas e a ficha em `igual` (via `::text`). Dono: node-backend. Segue aberto (cartão de recomendados).
- A2 (recomendado) server/src/plataforma/db/limpar-seed.ts:237 · resolvido em 6ff43df; o ALTER esperava a trava sem limite. Resolvido: `SET LOCAL lock_timeout` de 3 s antes do ALTER, 55P03 vira `trava` e a transação inteira volta.

## Detalhe da renovação (E2.110)
**A2 resolvido (`limpar-seed.ts:235-245`).** O `SET LOCAL lock_timeout` vai imediatamente antes do `ALTER TABLE ... DISABLE TRIGGER`; o valor vem de constante (3000) ou da opção do teste, nunca da linha de comando, e passa por `Math.trunc`, então não há caminho de injeção. Com 55P03 o comando lança `trava`; qualquer outro erro do ALTER segue como `erro-interno` (teste unitário com 42501). Nos dois casos o `emTransacao` faz ROLLBACK: o DISABLE nunca chega a valer, os DELETE do `dspd_core` já feitos na mesma transação voltam e o catálogo fica com o gatilho ativo; o teste `.pg` prende a tabela de outra sessão, confere o código `trava` em menos de 5 s, contagens iguais (inclusive o core), `tgenabled = 'O'` e que o mesmo comando aplica depois. Correção ao texto do A2 original: o ALTER toma SHARE ROW EXCLUSIVE, que não conflita com o ACCESS SHARE das leituras; quem ficava na fila eram as escritas (por exemplo, uma projeção em curso), não as leituras da API. O controle continua certo; só a mensagem de `trava` e o `server.md` falam em "leitura ou escrita" quando só escrita prende o ALTER, imprecisão de texto sem efeito de segurança. O `SET LOCAL` vale até o fim da transação: um DELETE posterior que espere mais de 3 s falha como `erro-interno` e desfaz tudo, falha fechada.

**Versões de critério do seed (`limpar-seed.ts:129-169`, `268-275`).** A escolha é por conteúdo, nunca por id: `motivo = 'seed-mock'` E `referencia LIKE 'mock:%'` E domínio `businessmap` ou `acelerato`, exatamente o que `seed.ts:175-178` grava. Conferi todos os gravadores reais de `ref_versao_criterio`: F2 (`businessmap/referencia.ts:338`, referência `plano-052-F2:processo:<data>`), a carga de times (migração 0019, `plano-052-F0:carga-inicial-times`), `criterios-acelerato.ts` (`056:D-7`, `056:D-10`) e `dominio-acelerato.ts:148` (`056:ref-dominio:<sha>`); nenhum usa o prefixo `mock:`, então uma versão real não casa com a regra mesmo se o `motivo` (no caso do arquivo do Acelerato, texto da governança) fosse `seed-mock`. O domínio `pesquisa` fica, como manda o A1 do review. A consulta usa parâmetros; esquema vem de `montarEsquemas` (prefixo validado).

**Falha fechada `ligada-a-dado-real` nova.** Antes de qualquer escrita, o comando junta as colunas que apontam para `ref_versao_criterio` por chave estrangeira (de qualquer esquema, catálogo `pg_constraint`) e por nome (`versao_id`, `incluido_por_versao_id` em `dspd_bm`, `dspd_ac` e `dspd_core`, mesmo sem FK) e recusa se alguma linha aponta para uma versão do seed. Conferi nas migrações: as únicas colunas de versão são `versao_id` (`ref_versao_criterio_metrica`, `ref_pesq_pergunta`, a carga de pesquisa, `ref_time` e `ref_time_workflow`) e `incluido_por_versao_id` (`ref_feriado`), todas cobertas; não há `ON DELETE CASCADE` em nenhuma migração, então o FK é uma segunda rede que faria o DELETE falhar e desfazer. Coluna nova com outro nome e sem FK escaparia à busca por nome, mas o FK, quando declarado, entra sozinho. Nomes vindos do catálogo passam por `ident`. A recusa traz só nome de tabela e contagem (nada de id nem pessoa). O planejamento do core roda antes do das fontes e a escrita só depois de todas as conferências; a simulação continua `READ ONLY` e só conta (`criterios` no resultado), o que o teste unitário confirma.

**Efeito sobre o histórico (T2.6).** Apagar versão de critério é exceção à regra de nunca sobrescrever histórico, coberta pela decisão do dono de 2026-11-01 14:25 (só o seed sai) e pelo A1 do review; as versões reais e as de pesquisa ficam, e o teste `.pg` prova que a versão real com métrica sobrevive idêntica. O PR deve avisar o dono que essas versões saem (registrado em `server.md`).

**Sem mudança no resto.** Papel (`dspd_migrador`), saída só com contagens, gatilho religado com conferência em `pg_trigger` antes do COMMIT, staging intocado (ADR 0022) e nenhum GRANT, dependência ou workflow alterado.

## Detalhe dos achados (parecer de 26d097c)
**Papel `dspd_migrador`.** O comando usa `PG_MIGRADOR_URL` (`entradas/limpar-seed.ts:24`), o único papel que pode desligar gatilho (dono das tabelas); os papéis da aplicação continuam sem DELETE nem ALTER, e nenhum GRANT muda no diff. O teste `.pg` "o papel sem posse das tabelas não consegue aplicar" prova que o `dspd_coletor` falha sem deixar nada pela metade. O comando é manual, nunca agendado, roda na máquina do dono (decisão S-3=Q-4) e a credencial só vem do `.env` lido pelo programa; nenhum valor dela é impresso (o erro de leitura do `.env` sai só com o código).

**Gatilho append-only desligado dentro da transação.** Só `tg_fato_transicao_imutavel` é desligado; `tg_fato_transicao_sem_truncate` continua ativo. O DISABLE, o único DELETE (filtrado por `coleta_id = ANY(ids do seed)`) e o ENABLE estão na mesma transação de `emTransacao`: no PostgreSQL o ALTER é transacional e toma trava SHARE ROW EXCLUSIVE até o fim, o que bloqueia INSERT, UPDATE e DELETE de outras sessões e mantém o gatilho ativo para elas o tempo todo; não existe janela em que outra conexão apague linha da tabela. A conferência em `pg_trigger` (`tgenabled <> 'O'` de todos os gatilhos não internos da tabela) roda antes do COMMIT e lança `gatilho`, o que desfaz a transação inteira; qualquer falha antes disso também volta o catálogo ao estado ativo pelo ROLLBACK. Nomes de gatilho e de tabela passam por `ident` ou vêm de constante.

**Falha fechada contra linha de coleta real.** O seed é escolhido pela versão em `ctl_coleta` (`starts_with(versao_coletor, 'seed-mock')`), nunca por id. Antes de qualquer escrita, e para os dois esquemas antes de escrever em qualquer um, o comando aborta se: uma tabela fora da lista removível tiver `coleta_id`, `atualizado_por_coleta_id` ou o card/chamado do seed; houver staging com item do seed (ADR 0022); uma projeção tiver linha de outra coleta com item do seed; `rec_transicao_par` apontar para transição do seed; um `ref_*` tiver a chave do seed com conteúdo diferente. Os FKs para `ctl_coleta` ficam como segunda rede. Cada DELETE confere a contagem prevista. Os `ref_*` são regerados do mock por `gerarBaseMock(parametros)`; divergência leva a remover menos ou a parar, nunca a remover linha real, porque o seed gravou com INSERT simples, sem `ON CONFLICT`. O resíduo é o A1.

**Simulação READ ONLY.** `SET TRANSACTION READ ONLY` é a primeira instrução depois do BEGIN; mesmo com o papel dono, o PostgreSQL recusa qualquer escrita nesse modo. Escrever exige `--aplicar`; qualquer outra opção é erro de uso.

**Saída só com contagens.** As mensagens de `ErroLimpezaSeed` são texto do código com nome de tabela e número; qualquer outro erro, inclusive do PostgreSQL (cujo `detail` pode trazer valor de chave), sai só como `erro-interno`. Nenhum id, nome de pessoa nem título chega à saída (ADR 0020).

**`fato_bloqueio` removido a mais.** Sai pela marca `atualizado_por_coleta_id` da coleta do seed, com a mesma falha fechada das outras projeções; consequência da regra "só o seed sai", sem ampliar o alcance sobre dado real. O review registrou que a decisão do dono o cobre e que o PR avisa.

## Riscos aceitos e ferramentas
Nenhum novo. Seguem em vigor os aceites do pedido 052 (chave do dono com poder de escrita, coleta só na máquina do dono). Recomendado ao dono, como já está no passo a passo, backup antes do `--aplicar`. Lacuna: `gitleaks`, `osv-scanner` e Semgrep não estão no PATH desta estação e não foram rodados; o delta não toca dependências nem workflow, e a busca manual no diff não achou credencial nem URL de conexão; as varreduras ficam no CI.

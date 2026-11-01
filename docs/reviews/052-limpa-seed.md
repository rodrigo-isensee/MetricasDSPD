---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-limpa-seed
commit: 26d097c0a51234e7f1c1ecf4aff9939abfb145e6
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-limpa-seed (comando de limpeza do seed mock da base real, E2.96, K-182)

**Veredito (E2.102): reprovado** em `26d097c`. O comando é correto e seguro no que faz: seed escolhido pela versão, falha fechada antes de qualquer escrita, gatilho desligado só dentro da transação e conferido antes do COMMIT, simulação somente leitura e saída só com contagens. Fica de fora uma família de linhas do seed que a decisão do dono manda tirar e que aparece nos painéis reais: as versões de critério do mock em `dspd_core.ref_versao_criterio` (A1, bloqueante). Dois recomendados.

## O que li
`git diff origin/develop...26d097c` (base `81fcd63`, a do brief; o diff de dois pontos traz também o que a develop andou depois, fora desta entrega): `server/src/plataforma/db/limpar-seed.ts`, `server/src/entradas/limpar-seed.ts`, `server/package.json`, `server/eslint.config.js`, `server/tests/limpar-seed.test.ts`, `server/tests/limpar-seed.pg.test.ts` e a seção nova de `docs/architecture/server.md`. Para o contexto: `gravarCriterios` e `mapearBM` em `server/src/plataforma/db/seed.ts:33-180,236-252`, `lerVersoes` em `server/src/modulos/operacao/repositorio.ts:44-62`, `lerVersaoCriterioVigente` em `server/src/modulos/referencia/repositorio.ts:34-45`, as FKs de `ref_versao_criterio` nas migrações 0010 e 0013, os geradores de id do mock (`packages/mock/src/businessmap/gerador.ts:152`, `acelerato/gerador.ts:81`) e a linha E2.96 do Histórico citada no brief.

## Foco pedido

**Gatilho append-only desligado só dentro da transação e papel `dspd_migrador`.** `DISABLE TRIGGER tg_fato_transicao_imutavel`, o DELETE pela marca da coleta do seed e o `ENABLE` correm na mesma transação de `emTransacao` (`limpar-seed.ts:186-192`); a conferência em `pg_trigger` (todos os gatilhos não internos da tabela em `'O'`) roda antes do COMMIT e lança `gatilho`, o que desfaz tudo. O ALTER é transacional no PostgreSQL, então qualquer falha devolve o gatilho ao estado ativo. O papel é o dono das tabelas (`PG_MIGRADOR_URL`), o único que pode fazer o ALTER, e nenhum GRANT muda. O `.pg` prova o gatilho ativo depois e o DELETE direto barrado, e que o `dspd_coletor` não consegue aplicar nem deixa nada pela metade. Correto. A trava sem `lock_timeout` é o A2 da segurança; não repito.

**Identificação do seed pela versão em `ctl_coleta`.** `starts_with(versao_coletor, 'seed-mock')` (`limpar-seed.ts:124`) pega `seed-mock` e `seed-mock-coleta`, nunca um id; os coletores reais gravam `bm-*` e `ac-*`. Os ids do mock (`XX-0001`, `CH-00001`, `quadro-<slug>`, `c<ordem>`) não colidem com ids reais do BusinessMap, então a falha fechada por item não deve barrar o dono por coincidência de id. Correto.

**Regra dos `ref_*` pela regeração com os parâmetros da coleta `seed-mock`.** O mock é regerado com os `parametros` gravados (validados por zod; sem eles, `sem-parametros` e nada sai) e só saem linhas de chave inteira igual, `vigente_de` incluído, e conteúdo igual onde há texto ou inteiro; chave igual com conteúdo diferente para o comando (`limpar-seed.ts:165-169`). Como o seed gravou com INSERT simples, nenhuma linha real pôde ocupar a mesma chave depois. O `.pg` prova a lista de `ref_*` coberta (BusinessMap e Acelerato) e o caso de conteúdo divergente. O resíduo é a remoção silenciosa de menos linhas quando o texto não casa (A2 abaixo).

**`fato_bloqueio` removido a mais.** As linhas de `fato_bloqueio` com a marca da coleta do seed são linhas do seed: a decisão do dono manda "apagar do banco só as linhas do seed mock" e deixar a base real "só com dado real"; a lista entre parênteses descreve as coletas 1 e 2, não fecha o conjunto. Sem elas, a própria falha fechada do comando abortaria (a tabela guarda a marca do seed). Coberto pela decisão; a descrição do PR deve dizer ao dono que `fato_bloqueio` sai junto.

**`ref_versao_criterio` do `dspd_core` com motivo `seed-mock`.** É linha do seed coberta pela decisão do dono. O seed a grava em `gravarCriterios` (`seed.ts:171-180`, chamado em `seed.ts:246-248`) com `motivo = 'seed-mock'` e `referencia = 'mock:<id>'`, uma por versão de critério do mock nos domínios `businessmap` e `acelerato` (e `pesquisa`). A decisão nomeia "ref_* do seed" sem restringir esquema. E o efeito é visível na base real: `lerVersoes` (`operacao/repositorio.ts:48-53`) devolve essas versões como marcas T2.6 nos gráficos do FL1 e da sustentação com dado real, e `lerVersaoCriterioVigente` (`referencia/repositorio.ts:39-45`) pode devolver uma versão do mock como `versaoCriterio` vigente. Marca de mudança de critério que não aconteceu fere a T2.6 e o "só dado real" da decisão. Ver A1 para o recorte da correção.

**Documentação do passo a passo.** Clara e completa para o dono: backup, simulação com as contagens esperadas da base dele (5792, 46759, 6 e 2), o que fazer com `ligada-a-dado-real`, aplicar, conferir zerado, regenerar o mock no prefixo próprio com o alerta de que o `.env` prevalece sobre o terminal e conferir o FL1. Precisa refletir o A1 (linha 109) e tem duas linhas antigas que agora contradizem a seção nova (A3).

**Teto de linhas (decisão M14).** `git diff --numstat --no-renames origin/develop...26d097c`, sem o `.md`: **579 linhas** (`limpar-seed.ts` 215, `entradas/limpar-seed.ts` 34, testes 178 e 149, `package.json` 1, `eslint.config.js` 2), muito acima de 150. Um comportamento só: tirar o seed da base real; a falha fechada e os testes que a provam não se separam do comando sem deixar um PR que apaga sem a proteção. Aceito a exceção, condicionada à linha no corpo do PR da E2.104, com o número final depois da volta: `teto: excedido, <n> linhas, comando único de limpeza do seed com a falha fechada e os testes que a provam`. Sem a linha, o PR fica bloqueado pela M14.

## Checklist (leitura)
Faz o que a E2.96 pede, mais o `fato_bloqueio` (coberto) e menos as versões de critério (A1). Respeita as regras invioláveis: BusinessMap e Acelerato com conferência própria cada um, nenhuma linha de coleta real tocada (ADR 0022), nada de pessoa na saída (ADR 0020). Identificadores de tabela vêm de constante ou passam por `ident`; valores sempre em `$n`. Erro de domínio tipado (`ErroLimpezaSeed`) e o resto sai como `erro-interno`, sem `detail` do PostgreSQL. Testes cobrem simulação, aplicação, idempotência, papel sem posse, parâmetros ausentes e as quatro falhas fechadas, com foto da carga real idêntica antes e depois. Commit único, Conventional Commits em português.

## Outros pareceres e ferramentas (citados, não refeitos)
- Segurança aprovada em `26d097c` (`docs/security/052-limpa-seed.md`, E2.101, `a217f1e`), com A1 e A2 recomendados.
- Relatório da E2.96: testes unitários e `.pg` verdes; o QA (E2.103) roda a suíte `.pg`.
- O `praticas.md` não tem regra "decidida por: `<comando>`": nenhuma saída de ferramenta a citar.

## Entregar na volta (node-backend)
A1, com teste `.pg`; A2 e A3 entram se couberem sem atrasar a segunda.

## Achados
- A1 (bloqueante) server/src/plataforma/db/limpar-seed.ts:211 · Versões de critério do seed em dspd_core.ref_versao_criterio (motivo seed-mock, referencia mock:%, domínios businessmap e acelerato) ficam e viram marcas T2.6 no FL1 real. Remover com ref_versao_criterio_metrica e falha fechada nas FKs.
- A2 (recomendado) server/src/plataforma/db/limpar-seed.ts:168 · Se o texto de um ref_* não casar (gerador mudou, DateStyle), a contagem dá 0 e as linhas do seed ficam sem aviso. Recusar quando o mock gera linhas para um ref_* e nenhuma é achada.
- A3 (recomendado) docs/architecture/server.md:85 · As linhas 83 e 85 dizem que ref_quadro, ref_dominio e ref_alvo_prioridade ficam fora do seed; a seção nova e o teste .pg mostram que o seed as grava. Atualizar as duas linhas.

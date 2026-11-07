---
tipo: review
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l2-recusa
commit: 438ffc2c7c39663836640ed9a0d4e3b3a392b0df
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---

# Code review: E10 Lote 2, recusa do reconhecimento sem versão ou com lista sobrescrita (pedido 073, E10.4, K-235)

## Conferido
- Diff lido: `8a4e2dd7...438ffc2c`, 2 commits (de03508c, 438ffc2c), 8 arquivos, +240 -21.
- Aderência à seção "Lote 2" de `docs/analises/073-e10-plano.md`:
  - Regra só no ramo `reconhecerMudanca === true` (`coletor.ts:216-226`), antes do desvio da P-E3-2 e antes de qualquer conexão MySQL. O ramo sem a opção segue igual (`parametros-mudaram`). Coberto: o teste unitário confere que o número de conexões do MySQL falso não muda na recusa.
  - Grupos e chaves (`controle.ts:70-74`): `recorte_sha256` usa `CAMPOS_RECORTE`. `vocabulario_sha256` usa `CAMPOS_VOCABULARIO` mais `cpe_*` de `CAMPOS_ETAPA_F3` com tratamento `lista`, pelo mesmo filtro de `carregarDominiosEtapaLidos` (`referencia.ts:60`). `fluxo_sha256` é `etapa_fluxo`. Os nomes vêm do código, nunca da entrada, e cada grupo cobre os mesmos campos que entram no hash dele (`hashesDasListas`, `carregarOrdemFluxo`).
  - `D` é a data civil em -03:00 do `finalizado_em` do último sucesso (`controle.ts:86`). `ultimoSucesso` lê `finalizado_em` na mesma linha de `parametros`. Sem data, `D` vale 1970-01-01 (coberto).
  - Datas novas: `vigente_de >= D` ou `vigente_ate >= D` do grupo. Sem nenhuma, a recusa é `lista-sobrescrita`. Com uma data sem versão `056:ref-dominio:` (`starts_with`, `dominio = 'acelerato'`, `vigente_desde` igual à data), a recusa é `reconhecimento-sem-versao` (`controle.ts:89-95`). O prefixo bate com `referenciaDaVersao` do Lote 1 (`dominio-acelerato.ts:153`).
  - A recusa segue o caminho de hoje: falha sem marca d'água (`registrarFalha`) e o erro só com o nome da chave. Os testes conferem `erro_resumo` e que o valor "secreto" não aparece no erro serializado. As mensagens dos dois códigos novos estão em `erros.ts:29-30`, e a mensagem de `parametros-mudaram` foi corrigida.
  - Isenção da chave ausente na linha anterior (`controle.ts:88`), coberta sem nenhuma consulta. O comentário de `CHAVES_COMPARADAS` (`controle.ts:21`) agora descreve o comportamento real.
  - Sem migração, sem GRANT novo (`dspd_coletor` já lê `ref_*` do core, `grants.ts:122`), sem versão T2.6 própria (é controle, não cálculo), como o plano prevê.
- Testes: os cinco casos unitários do plano (`acelerato-e10-recusa.test.ts`, cada código para as três chaves) e os cinco `.pg` (`acelerato-e10-recusa.pg.test.ts`: ref-sync seguido de reconhecimento passa; INSERT direto recusa sem versão, com as contagens de staging e `ref_dominio` e as conexões iguais; UPDATE de `rotulo` e INSERT com data antiga recusam como sobrescrita; lista revertida pelo ref-sync passa).
- Desvios da entrega, decididos aqui:
  - (1) Teto M14: pela regra, a conta é 261 linhas, não 251: 68 de produção e 193 de teste. É um comportamento só (a recusa da opção C). A exceção é aceita se o corpo do PR (E10.7) trouxer `teto: excedido, 261 linhas, <motivo>`.
  - (2) Exceção do CT-37 (`acelerato-estatico.test.ts:100-101`): aceita. O `replaceAll` retira só o trecho literal da leitura de `ref_versao_criterio` com `dominio = 'acelerato'`. Qualquer outra referência a `S.core` ou `dspd_core` no módulo continua reprovando.
  - (3) `acelerato-l9c.pg.test.ts:121-123`: aceito. Ele grava a versão que o ac:ref-sync deixaria na data da vigência nova, porque o teste edita `ref_dominio` direto e agora precisa da versão para reconhecer.
- CI do push no head: run 42354744079, `headSha` 438ffc2c, conclusão `success` (filtro, imagem, rapida, build, openapi, testes, seguranca e banco verdes; perf e e2e pulados pelo filtro). Os `.pg` rodam no job `banco`.
- Testes dos arquivos tocados no review (D-5): `vitest run --maxWorkers=2` de `acelerato-e10-recusa.test.ts`, `acelerato-estatico.test.ts` e dos dois `.pg`: 26 passaram; os 9 `.pg` pulam sem banco local e contam pela CI acima.
- Regras invioláveis: nenhum cálculo de métrica, nenhum dado de pessoa, nenhuma escrita nova. O core é lido só pela versão do domínio `acelerato`, sem misturar com o BusinessMap. A segurança (gatilho: controle de coleta e leitura nova do core) fica no parecer do security-engineer (E10.5); o A1 vai para ele.

## Achados
- A1 (recomendado) server/src/modulos/acelerato/controle.ts:89 · Conferência por grupo e data, não por linha: após um ac:ref-sync legítimo em data >= D, edição direta no mesmo grupo em outro dia, antes do reconhecimento, passa. Limite maior que o "mesmo dia" do plano. Cartão: segurança (E10.5).
- A2 (recomendado) docs/architecture/fontes/acelerato-listas.md:7 · O texto do reconhecimento não cita `reconhecimento-sem-versao` nem `lista-sobrescrita`, nem que reconhecer exige a versão do ac:ref-sync na data. Atualizar antes do PR (E10.7).
- A3 (recomendado) server/src/modulos/acelerato/controle.ts:73 · `'etapa_fluxo'` repete em literal a constante `CAMPO_ETAPA_FLUXO` (`referencia.ts:74`). Mover a constante para `listas-fechadas.ts` e usá-la nos dois lugares evita divergência.

## Parecer
Aprovado. Os achados são recomendações e não devolvem a entrega. A exceção do teto vale com a linha `teto: excedido` no corpo do PR.

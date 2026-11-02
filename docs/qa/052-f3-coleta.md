---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-f3-coleta
commit: cc8c0cf38e51be7df6b256d318ca5cba39b19280
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-31
---
# QA: F3 do coletor do BusinessMap, coleta dos cards para o staging (pedido 052, E2.49, K-182)

Links: plano `docs/architecture/features/052-integracao-businessmap.md` (F3), review `docs/reviews/052-f3-coleta.md` (aprovado em cc8c0cf), segurança `docs/security/052-f3-coleta.md` (aprovado).

**Parecer: aprovado**, sem bug aberto. O código testado é o de `cc8c0cf` (o HEAD `c088778` só soma o parecer de segurança da E2.54, só `docs/`). A coleta e a recoleta sem duplicar, os papéis, o `--motivo-chave`, a transição inválida, o incremental com arquivados e descartados e a falha no meio de uma página passaram contra PostgreSQL 17 real.

## Escopo e método
Tarefa de dados, sem especificação de UX nem contrato de API. As obrigações são o "Pronto" da F3 do plano, as decisões Q-2, Q-2b, Q-2c, Q-8 e H-20, e os quatro pontos que o review mandou provar contra o banco (a a d). Caixa-preta sobre o comportamento: servidor falso do BusinessMap em `node:http`, banco real do Compose (schemas de teste, removidos no teardown), papéis reais `dspd_coletor`, `dspd_ref`, `dspd_api` e o dono. Nenhuma chamada ao BusinessMap real; o `.env` não foi lido.

Testes do QA: `server/tests/coleta-businessmap-qa.pg.test.ts` (4 testes, arquivo novo; quadros próprios 9028 e 9029 para não mexer nas contagens do `coleta-businessmap.pg.test.ts` do autor). Os testes `.pg` do autor (10 em `coleta-businessmap.pg.test.ts`) foram rodados como estão.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Carga inicial grava só pela allow-list, com contagens, parametros por página e retomada sem duplicar | `coleta-businessmap.pg.test.ts` carga inicial (autor) | passou | página parcial; recoleta igual |
| Q-2b e Q-2c: ativo sem data, arquivado e descartado pela data do próprio evento, 12 meses | autor, carga inicial; QA CT-C (arquivado de 2025-01 não entra) | passou | logo fora da janela |
| Transições em `stg_revision`, recoleta não duplica, fechamento é fato novo, UPDATE negado | autor, E2.46 | passou | append-only |
| Papéis: UPDATE barrado no staging, GRANT só em `parametros` de `ctl_coleta`, `dspd_ac` sem o GRANT, `dspd_api` sem `dim_responsavel` | autor, 42501 | passou | permissão |
| `dim_responsavel`: UPSERT, releitura aos 30 dias, CHECKs, nome só nessa tabela | autor (3 testes) | passou | 0 e 201 caracteres; id com letra |
| Referência em transação do `dspd_ref` e rollback | autor (2 testes) | passou | falha no meio |
| (a) `--motivo-chave` com chaves pendentes | CT-A | passou | uma chave dita, a outra pendente; chave que não é pendente |
| (b) transição inválida deixa a coleta parcial, sem marca | CT-B | passou | sem coluna; entrada vazia; entrada ausente |
| (c) incremental com arquivados e descartados | CT-C | passou | só `last_modified_from`, três estados, sem apagar versão, idempotente |
| (d) falha no meio de uma página | CT-D | passou | 4º INSERT; página volta; retomada |
| H-20: comando manual, trava da fonte | autor, comando inteiro | passou | trava ocupada |

## Resultado real
- Suíte `.pg` do server contra o PostgreSQL do Compose (`PG_TESTE_URL` do migrador de teste, `nice -n 19`, única suíte rodando): antes dos testes do QA, 20 arquivos e 127 de 127 passaram; com o arquivo novo, **21 arquivos e 131 de 131 passaram**, rc=0.
- Suíte unitária do server (`vitest run --project unit`): 50 arquivos e 998 testes passaram. `tsc --noEmit` e `eslint` do arquivo novo: sem saída (limpo). O `pronto` completo não foi repetido: o delta desta rodada é só teste novo e parecer; o do autor segue como registrado.
- CT-A (banco real): a carga inicial da referência e as quatro rodadas pelo comando mostram: sem motivo, as duas chaves saem em `motivosPendentes` (`ref_coluna:9028|90281` e `|90282`, formato do `--motivo-chave`), a falha do controle só tem o código `referencia-motivo`; com uma chave dita, só a outra segue pendente e nada grava (tudo ou nada); motivo de chave que não é pendente não resolve nada; com as duas, fecha as duas vigências em 2026-11-03 sem apagar e abre as novas com `correcao` e `processo`, cada uma na linha certa.
- CT-B: cartão com 4 transições, 3 inválidas (sem `column_id`, `start` vazio, `start` ausente) mais um card vizinho: coleta `parcial`, `marca_dagua_ate` nulo, 3 linhas em `ctl_coleta_falha` só com entidade, id do card e `transicao-invalida` (sem valor de transição nem título), cards e as 2 transições válidas gravados, contagem `falhas = 3`.
- CT-C: carga com ativo, arquivado, descartado e arquivado de 2025-01 (fora dos 12 meses: não entra); depois o arquivado e o descartado são mexidos e entra um descartado novo. O incremental faz 3 pedidos (active, archived, discarded) com `last_modified_from` = marca menos 3600 s e sem `archived_from` nem `discarded_from`; traz 1 arquivado e 2 descartados novos, não relê o ativo parado, mantém as duas versões de cada card (títulos v1 e v2) e a repetição insere 0.
- CT-D: 5 cards, páginas de 2, o 4º INSERT em `stg_card` falha: só os 2 cards e as 2 transições da página 1 existem (a página 2 voltou inteira); `parametros.paginas` fica em `ultima: 1, total: 3`; coleta `falha` com `erro-interno`, sem marca. A retomada uma hora depois relê as páginas 1, 2 e 3, insere 3 e acha 2 já existentes (5 cards e 5 transições, sem duplicar) e grava a marca da primeira tentativa.
- Vermelho antes do verde: na base `0783caa` (extraída para uma cópia descartável com o arquivo novo) o teste não carrega: `Cannot find module '../src/modulos/businessmap/coleta.js'` (vermelho por ausência, a F3 inteira é nova). No HEAD, os 4 testes passam.
- Mutação (manual, em cópia descartável fora do repositório, 10 mutantes, todos revertidos; `praticas.md` não define ferramenta): morreram todos. M1 marca gravada também em parcial e M2 transição inválida sem contar falha (CT-B); M3 checkpoint na página seguinte, M4 retomada sem o `iniciada_em`, M9 retomada sem reler a última página e M10 página fora da transação (CT-D); M5 limite de pendentes `> 1` e M8 `motivosPendentes` sem copiar (CT-A); M6 sobreposição com sinal trocado e M7 incremental só no estado ativo (CT-C). Nenhum sobrevivente. A árvore do autor não foi tocada.
- Nenhum teste foi marcado como skip; não houve teste instável.

## Observações (não devolvem)
- Os recomendados A3 a A6 do review seguem com o destino da decisão técnica (F4 e F5). Observei no banco o que A3 descreve: a transição inválida fecha a coleta `parcial` e sem marca (CT-B); o efeito na repetição do incremental fica para a F4.
- O `pronto` não roda o `.pg`; o gate de CI com banco o roda.

## Achados
- A1 (recomendado) server/tests/coleta-businessmap-qa.pg.test.ts:1 · arquivo do QA ficou sem commit, por limite da delegação (commit só do parecer); o tech-lead o inclui no PR ou o node-backend o assume. Sem ele, os pontos a a d do review voltam a não ter prova contra o banco.

---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l3-motivo-dominio
commit: 86f6dbb7c63ee3968482dc69092c68bce5c3c5b8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: 075 lote 3, domínio motivo_bloqueio no bm:ref-sync (K-204)

Código testado em 86f6dbb7 (base c5a4728e); o head 75375d91 só acrescenta os pareceres de segurança e de review. Parecer sobre o commit do código, que é o último com teste.

## Achados
- A1 (recomendado) server/tests/dominio-businessmap.pg.test.ts:59 · o teste .pg grava um só reason_id; o caso de dois reason_id para o mesmo motivo só tem prova no unitário (mesmo A1 da segurança, vai para o lote 4b)

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-075-3 rótulo MARCADOR-PESSOA-075, com @, fora dos 7 ou "não classificado" recusa a carga inteira, sem o valor na mensagem | dominio-motivo-bloqueio.test.ts, it.each de rótulo (4 casos) | texto de pessoa na referência; mensagem sem o valor | passou |
| CA-075-3 código não numérico, vazio, decimal, negativo, com espaço ou com 11 dígitos recusa | it.each de código (6 casos) | limite 10 dígitos e só dígitos | passou |
| Arquivo vazio carrega zero linhas | "o arquivo real nasce com o mapa vazio" | vazio | passou |
| reason_id repetido recusado, inclusive 5 e 05; chave extra recusada | "reason_id repetido ... e chave extra" | repetição por valor numérico | passou |
| Vários reason_id para o mesmo motivo aceitos; os 7 aceitos | "aceita os 7 motivos, vários reason_id..." | máximo da lista fechada | passou |
| motivosDeLinhas descarta código inválido, rótulo fora dos 7 e reason_id ambíguo | "leitura para o projetor" | desconfiança do banco | passou |
| Gravação e vigência no PostgreSQL | dominio-businessmap.pg.test.ts (novo caso) | fechamento da vigência ao mudar o mapa | não rodado local (sem banco); CI do push |
| allow-list.ts, coleta.ts e packages/contratos sem diferença | git diff --stat contra a base nesses caminhos | n/a | sem diferença (saída vazia) |

## Cenários e resultado real
- Conferência do diff (6 arquivos, 107 inserções) contra o plano do lote 3: aderente; contrato e migração sem mudança.
- Testes rodados com `npx vitest run ... --maxWorkers=2` na worktree, MemAvailable 13830 MB: 2 arquivos, 57 testes, 57 passaram.
- Vermelho contra a base (cópia em `$TMPDIR/qa-engineer-075/`, fontes de `dominio-businessmap.ts`, `index.ts` e o JSON da base, testes do head): 5 de 57 caem na base (3 do arquivo novo, 2 de `dominio-businessmap.test.ts`), 52 passam. Os casos de recusa passam na base porque o esquema estrito já recusa a chave desconhecida; o que os prova é a mutação abaixo.
- Mutação manual em `dominio-businessmap.ts` (7 mutantes, rodando o arquivo novo): z.enum trocado por z.string (4 testes caem), regex do código removido (6), repetido sem normalizar zeros (1), ambíguo vira o último rótulo (1), filtro dos 7 removido (1), filtro do campo removido (1), lista do arquivo sem o motivo (2). Os 7 morreram; nenhum sobrevivente.
- `.pg`: sem banco de teste local. CI do push no head do código 86f6dbb7 (run 42249910561): `success`; ela prova o job `banco`. O run do head 75375d91 estava em andamento na consulta e só traz documentos.
- Acessibilidade e E2E: não se aplicam, lote sem tela.

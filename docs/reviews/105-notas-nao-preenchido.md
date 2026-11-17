---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-notas-nao-preenchido
commit: 195952008d1ae404ea27b3749d230706e0bcc845
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: notas de não preenchido separadas de preenchido errado (105, K-393, E7.413, review E7.419)

Escopo: `95fa2879...19595200`, um commit, 6 arquivos: `bloqueios.ts`, `normalizador.ts`, os dois testes e dois docs. São 31 linhas a mais e 8 a menos, dentro do teto de 150 (M14). Depois do head revisado, a branch só ganhou o parecer do QA (`6a337d9a`, só `docs/qa/`), que não muda código.

**Veredito: aprovado**, com três recomendados que não bloqueiam.

## O que muda
- `bloqueios.ts:60-64`: quando o motivo não vira código, a nota passa a depender da entrada. `blockReasonId` nulo, ausente ou texto em branco gera `motivo_ausente`. Qualquer outra entrada continua gerando `motivo_codigo_invalido`. `motivoCodigo` continua nulo nos dois casos, e o evento é o mesmo.
- `normalizador.ts:154-155`: quando a coluna de lista fica nula, a nota passa a depender do valor. Valor nulo, ausente ou `''` gera `campo_sem_selecao`. `desconhecido` ou valor que não é texto continua gerando `campo_fora_do_dominio`. O valor gravado continua nulo.
- O valor gravado e as métricas não mudam. A nota só chega a `ctl_coleta_contagem` (`projetor.ts:169`, `:240`, `:398`) como `nota_<nome>`, cortada em 40 caracteres. O nome mais longo, `nota_bloqueio_motivo_codigo_invalido`, tem 36. A coluna `entidade` é `varchar(40)` sem CHECK de domínio (`migrations/0002_bm_controle.ts:22`), então os nomes novos não pedem migração. Nenhum painel nem cálculo lê nota.
- Docs: `data-model.md:119` e o passo 6 de `businessmap-causa-raiz-carga.md` explicam como ler `campo_sem_selecao` ao lado de `campo_fora_do_dominio`.

## Ferramentas (citadas, sem refazer)
- Não há PR para a branch, então a suíte inteira fica para o CI do PR, e este parecer não afirma CI verde. O PQ do autor (brief node-backend-88, PQ-1) prova o push. O head revisado é ancestral da ponta remota `6a337d9a`.
- Rodei o teste novo no head: `npx vitest run tests/bloqueios.test.ts tests/normalizador-businessmap.test.ts -t "K-393|CA-075"` (em `server/`). Resultado: 2 arquivos, 12 testes passaram e 103 foram pulados pelo filtro.
- QA (`docs/qa/105-notas-nao-preenchido.md`, aprovado no mesmo head): o vermelho antes do verde foi provado (5 de 115 falham com o código da base) e 4 de 5 mutantes morreram. Não refiz.
- Os testes pg que citam `nota_bloqueio_motivo_codigo_invalido` (`projetor-bloqueio.pg.test.ts:87`, `projetor-businessmap.test.ts:287`) usam motivo marcador (texto não numérico), não nulo. Continuam em `motivo_codigo_invalido`, conferido por leitura.

## Checklist (leitura)
1. Escopo: faz o que o K-393 pede, sem cálculo novo. O nome enganoso registrado no Histórico (18:58, os 24 bloqueios sem motivo contados como código inválido) fica corrigido na contagem.
2. Regras invioláveis: nada muda em BusinessMap × Acelerato, histórico ou métrica. A nota é uma contagem, nunca o valor: o teste `CA-075-1/10` continua afirmando que o marcador não vaza.
3. Legibilidade: os ternários são curtos e cada um tem um comentário K-393 que diz a distinção.
4. Tipos: `unknown` é tratado por `typeof` antes do `trim()`, então não há chamada em não texto.
7. Testes: a tabela `CA-075-2` agora distingue `null`/`undefined` (ausente) de lixo (inválido). Há casos K-393 nos dois módulos e o `desconhecido` explícito em `CA-075-12`. Falta o caso de texto só com espaço (A2).
9. Commit: um commit em Conventional Commits em português, com o pedido, a etapa e o cartão.
11. Teste de ausência cujo alvo mudou: em `bloqueios.test.ts:94` o alvo passou de `campo_fora_do_dominio` para `campo_sem_selecao`. É o certo, porque com o código novo o `''` geraria `campo_sem_selecao` se o campo F2 (sistema) vazasse para o derivador de fornecedor. A asserção continua detectando o vazamento.

## Achados
- A1 (recomendado) docs/architecture/adr/0029-derivacao-de-bloqueio-por-comparacao.md:18 · a ADR ainda diz que nulo ou ausente gera `motivo_codigo_invalido`; desde o K-393 gera `motivo_ausente`. Sugestão: nota de revisão datada na ADR apontando o K-393.
- A2 (recomendado) server/src/modulos/businessmap/bloqueios.ts:62 · o ramo `trim() === ''` (motivo só com espaços gera `motivo_ausente`) não tem teste, e o mutante que tira o `trim()` sobrevive. É o mesmo A1 do QA, registrado aqui só para o cartão. Sugestão: acrescentar `''` e `'  '` à tabela `CA-075-2`.
- A3 (recomendado) server/src/modulos/businessmap/normalizador.ts:155 · "vazio" difere entre os módulos: o bloqueio trata `'  '` como ausente, a lista só `''` (`' '` passa como valor, herdado). Sugestão: predicado único de não preenchido, em cartão; mudar o valor gravado é decisão do dono.

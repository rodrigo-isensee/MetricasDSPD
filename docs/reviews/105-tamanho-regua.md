---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 62254d39142a86cb56d89ec38615643fd8d623eb
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-16
---
# Review: 105-tamanho-regua (E7.131; revalidação E7.157)

## Revalidação (E7.157, cabeça de código `62254d39`)
Delta lido: `forge-check parecer delta docs/reviews/105-tamanho-regua.md`, intervalo `0ccb21ef..62254d39` (commit `62254d39`, volta do review, QA, segurança e UX). No domínio: `CHANGELOG.md`, `docs/architecture/data-model.md`, `docs/architecture/ddd/01-linguagem-ubiqua.md`, `docs/architecture/features/metricas-complementares.md`, `docs/contratos/metricas/O8.md`, `docs/especificacao/domain/flow/declared-size.md`, `server/src/modulos/businessmap/normalizador.ts`, `server/src/modulos/businessmap/projetor.ts`, `server/tests/normalizador-businessmap.test.ts`, `server/tests/projetor-businessmap.test.ts`, `web/src/features/complementares/fluxo.tsx` e `ramos.test.tsx`. Depois dele só `113a0073` (parecer do QA, fora do domínio).

- **A1 resolvido:** `data-model.md:118` diz que `tamanho_declarado` vem do `size` nativo pela régua do time (seis faixas, `ref_dominio campo = 'tamanho_regua'`), com as três notas e nunca M por omissão; `data-model.md:138` cita `tamanho_regua`; `declared-size.md` traz o enum `pp, p, m, g, gg, xg`; `01-linguagem-ubiqua.md:29` e `metricas-complementares.md:17` dizem seis faixas pela régua; `docs/contratos/metricas/O8.md` explica o exemplo truncado.
- **A2 resolvido:** `normalizador.ts:226` trata `numero === 0` (inclusive `'0'`) como `size_sem_valor`; o teste cobre `0` e `'0'`, e o 0 saiu da lista de fora da régua.
- **A4 resolvido:** o corpo do PR 486 traz a linha `teto: excedido`. **A5 resolvido:** textos da UX (R-1 a R-3) em `fluxo.tsx` (a nota da régua explica "Sem tamanho"; a nota "Sem divisão" diz "tamanho na régua do time"; a legenda só traz "Sem tamanho" com card nessa faixa). **A3 segue recomendado** (roteiro do L3).
- **Segurança A1:** `reguaLinhasDescartadas` no `ResultadoProjecao` (só a contagem, sem time nem valor), impresso pelo `bm:projetar` (`server/src/entradas/projetor-businessmap.ts:30`); o `bm:ref-sync` não mudou, então a guarda de não comparar times segue igual.
- Testes rodados no `62254d39`: `normalizador-businessmap` e `projetor-businessmap` (2 arquivos, 107 testes, passam); `ramos.test.tsx -t O8` (8 passam). Mutantes, todos desfeitos: tirar `|| numero === 0` (`normalizador.ts:226`) derruba "card sem size (ausente, nulo, vazio ou 0)"; `reguaLinhasDescartadas: 0` (`projetor.ts:106`) derruba "segurança A1 (105)"; o filtro da legenda sempre verdadeiro (`fluxo.tsx:250`) derruba "a legenda do gráfico só traz Sem tamanho (R-3)".
- Suíte: fica com o CI do PR 486. A corrida do `62254d39` (43854476343) foi cancelada pelo push do parecer do QA; a do `113a0073` (43855203408, mesmo código) é a que vale para o merge.
- Achado novo A6 (recomendado): o `CHANGELOG.md:8` diz que o `bm:ref-sync` informa a contagem em `reguaTimesDesconhecidos`; o código a conta no `bm:projetar`, campo `reguaLinhasDescartadas`. Corrigir o texto antes da promoção.

Primeira passada (E7.131), cabeça `0ccb21ef` (base `2c56d33b`; commits `84641f29` back-end E7.102, `d5eb82dc` aceite do enum E7.116, `0ccb21ef` tela E7.128): rodei `normalizador-businessmap` e `dominio-businessmap` (169 testes) e `packages/metricas` `o8.test.ts` (9 testes), todos passam. Mutante: `return faixa ?? null` trocado por `?? 'M'` em `normalizador.ts:230` (o "M por omissão") derruba 14 testes do bloco "105: tamanho_declarado pela régua"; desfeito.

## Achados
- A3 (recomendado) server/src/modulos/businessmap/projetor.ts:90 · Coleta com --projetar entre o bm:ref-sync e o bm:projetar --reconstruir publica o O8 com tamanho só nos cards tocados. No L3, os dois na mesma janela.
- A6 (recomendado) CHANGELOG.md:8 · Diz que o bm:ref-sync conta em reguaTimesDesconhecidos; o código conta no bm:projetar, campo reguaLinhasDescartadas.

## Sondas

## Parecer
Aprovado na revalidação (E7.157): A1 (o bloqueante, documentação) e A2 resolvidos no `62254d39`, A4 e A5 também; A3 e A6 ficam recomendados. Na primeira passada (E7.131) foi reprovado por A1.

- **A3:** no roteiro do L3, `bm:ref-sync` e `bm:projetar --reconstruir` sem coleta entre eles, e a conferência de contagem (tam-b) antes de abrir a tela.
- **A6:** no `CHANGELOG.md:8`, trocar "o `bm:ref-sync` informa ... (`reguaTimesDesconhecidos` ...)" por "o relatório do `bm:projetar` informa ... (`reguaLinhasDescartadas`, só a contagem)".

O código está correto nos pontos que o brief pediu (primeira passada, sem mudança no delta salvo o que está acima):

- **Régua contra a seção 2a do plano:** o `tamanho_regua` do `businessmap-dominio.json` tem 63 linhas, 7 times (26, 38, 42, 6, 5, 18, 14) e, faixa a faixa, os mesmos valores da tabela 2a (ex.: 26 = P 0,5·1·1,5, GG 2, XG 2,5 a 64; 14 = PP 0,5·1, P 2·2,5, M 3, G 4, GG 5, XG 6·7·10·15·20); faixa sem valor não grava linha. Esquema zod fechado (código canônico `time_id:size`, rótulo entre as seis, sem chave repetida, `.strict()`); a leitura do banco ignora chave com duas faixas e time fora de `ref_time`.
- **Sem comparação entre times:** o contrato do O8 não ganhou campo de time nem de régua; `calcularO8` só divide por faixa (`tamanho_declarado` já resolvido no projetor); a tela soma por faixa, por tipo, com a nota "sem comparar times". Nenhum filtro, série ou tabela por time.
- **Nunca M por omissão:** sem size, size fora da régua e time sem régua (inclusive workflow `fora`, agora com teste do dado fora da invariante) dão nulo com nota de contagem, sem valor nem time na nota; o mutante acima prova a trava.
- **Histórico:** `tamanho_declarado` está em `COLUNAS_VERSAO` (`responsaveis.ts:18`); a projeção refaz `dim_card` e a mudança vira versão em `dim_card_versao`; staging intacto. `ref_dominio` com vigência (fecha e abre, nada apagado).
- **Uma fonte por coluna:** `tamanho_declarado` saiu de `COLUNAS_LISTA` (allow-list aperta) e entra explícito em `COLUNAS_DIM`; teste prova que campo customizado mapeado não a alimenta.
- **Versão de critério e T2.6:** `versao_criterio` do arquivo é `105:tamanho-pela-regua-do-time`, `afeta: ['O8']`; o `bm:ref-sync` a grava com a data do dia e `lerVersoes` a leva às marcações. A troca do bloco (antes O15) é segura no banco real: a fase do O15 já foi sincronizada na release 105 (`ref_dominio` 10 -> 357, histórico 15/11 21:12), então a próxima sincronização só insere as 63 linhas da régua.
- **Aceite do contrato:** enum só acrescenta valores; fotografia `docs/contratos/snapshots/resultados/O8.json`, `openapi.json`, `docs/contratos/metricas/O8.md`, `docs/api/metricas.md` e a entrada "Contrato" do CHANGELOG atualizados (aceite de uso único conforme a política, E7.116).
- **Nada liga só com o merge:** a régua só chega a `ref_dominio` pelo `bm:ref-sync` manual (nenhum workflow em `.github/` o chama; `scripts/demo-dado-real.sh` é manual) e os cards só ganham tamanho no `bm:projetar` (manual). Sem régua carregada, `tamanhoPelaRegua` devolve nulo sem nota e o O8 segue com o motivo "aguardando a régua de tamanho aprovada".
- **Biblioteca e regras:** seis faixas sempre na ordem, faixa vazia `n` 0 e mediana nula ("sem entregas neste tamanho", nunca 0), mediana só com 20 ou mais (`publicavel`, teste 19/20), "Sem tamanho" por último e só com entregas; só BusinessMap, só a story no histograma por tipo.

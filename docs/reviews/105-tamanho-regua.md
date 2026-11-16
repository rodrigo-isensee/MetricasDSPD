---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-tamanho-regua
commit: 0ccb21ef34646f49bb4e8085b38d053c77fb567b
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-16
---
# Review: 105-tamanho-regua (E7.131)

Cabeça revisada: `0ccb21ef` (base `2c56d33b`; commits `84641f29` back-end E7.102, `d5eb82dc` aceite do enum E7.116, `0ccb21ef` tela E7.128). Suíte inteira: fica para o CI do PR (sem PR nesta etapa); cito o PQ do autor e não afirmo CI verde (as corridas 43849454516 e 43849850199 do head `0ccb21ef` foram canceladas pelo push do parecer de segurança `d295045c`, só doc; a do novo head estava na fila). Rodei os testes novos: `server` `normalizador-businessmap` e `dominio-businessmap` (2 arquivos, 169 testes, passam) e `packages/metricas` `o8.test.ts` (9 testes, passam). Mutante: `return faixa ?? null` trocado por `?? 'M'` em `normalizador.ts:230` (o "M por omissão") derruba 14 testes do bloco "105: tamanho_declarado pela régua"; desfeito.

## Achados
- A1 (bloqueante) docs/architecture/data-model.md:118 · Diz que tamanho_declarado fica nulo até a WS1; o código o projeta do size pela régua. Mesma doc velha (P, M, G) em declared-size.md:1, 01-linguagem-ubiqua.md:29 e metricas-complementares.md:17 (praticas §8 item 10).
- A2 (recomendado) server/src/modulos/businessmap/normalizador.ts:226 · size 0 conta na nota size_fora_da_regua; o plano (D-3) o trata como sem valor. O resultado já é nulo; só a nota muda.
- A3 (recomendado) server/src/modulos/businessmap/projetor.ts:90 · Coleta com --projetar entre o bm:ref-sync e o bm:projetar --reconstruir publica o O8 com tamanho só nos cards tocados. No L3, os dois na mesma janela.
- A4 (recomendado) packages/metricas/src/businessmap/o8.ts:16 · O PR passa do teto: 530 linhas de código e teste; o corpo do PR traz a linha teto: excedido, 530 linhas, com o motivo.
- A5 (recomendado) web/src/features/complementares/fluxo.tsx:144 · A decisão de 16/11 06:41 diz sem tamanho registrado para os demais times; a tela usa Sem tamanho. A UX (E7.134) confirma o texto.

## Sondas

## Parecer
Reprovado por A1 (documentação). Detalhe dos achados:

- **A1:** `docs/architecture/data-model.md:118` diz que `tamanho_declarado` fica nulo "até a WS1 criar os campos"; `docs/especificacao/domain/flow/declared-size.md` define o enum `p`, `m`, `g`; `docs/architecture/ddd/01-linguagem-ubiqua.md:29` diz "P, M ou G"; `docs/architecture/features/metricas-complementares.md:17` diz "P/M/G". Pelo `praticas.md` §8 item 10, doc de `docs/architecture/` desatualizada no intervalo de commits bloqueia. Sugestão: as quatro passagens dizem seis faixas (PP, P, M, G, GG, XG) a partir do `size` nativo pela régua do time (`ref_dominio campo = 'tamanho_regua'`), com sem size, size fora da régua ou time sem régua = nulo contado; a linha de `ref_dominio` (`data-model.md:138`) passa a citar `tamanho_regua`.
- **A2:** tratar 0 junto de nulo e vazio (`size_sem_valor`) ou registrar no plano que 0 conta como fora da régua.
- **A3:** no roteiro do L3, `bm:ref-sync` e `bm:projetar --reconstruir` sem coleta entre eles, e a conferência de contagem (tam-b) antes de abrir a tela.
- **A4:** `teto: excedido, 530 linhas, uma classe de comportamento (tamanho do O8 pela régua) em domínio, projeção, biblioteca, contrato e tela` (800 com o JSON da régua; sem `.md`).
- **A5:** o plano (seção 2a) lê a decisão como a categoria "Sem tamanho"; a revisão de UX diz se a faixa ou a nota precisam da expressão do dono.

O código está correto nos pontos que o brief pediu:

- **Régua contra a seção 2a do plano:** o `tamanho_regua` do `businessmap-dominio.json` tem 63 linhas, 7 times (26, 38, 42, 6, 5, 18, 14) e, faixa a faixa, os mesmos valores da tabela 2a (ex.: 26 = P 0,5·1·1,5, GG 2, XG 2,5 a 64; 14 = PP 0,5·1, P 2·2,5, M 3, G 4, GG 5, XG 6·7·10·15·20); faixa sem valor não grava linha. Esquema zod fechado (código canônico `time_id:size`, rótulo entre as seis, sem chave repetida, `.strict()`); a leitura do banco ignora chave com duas faixas e time fora de `ref_time`.
- **Sem comparação entre times:** o contrato do O8 não ganhou campo de time nem de régua; `calcularO8` só divide por faixa (`tamanho_declarado` já resolvido no projetor); a tela soma por faixa, por tipo, com a nota "sem comparar times". Nenhum filtro, série ou tabela por time.
- **Nunca M por omissão:** sem size, size fora da régua e time sem régua (inclusive workflow `fora`) dão nulo com nota de contagem, sem valor nem time na nota; o mutante acima prova a trava.
- **Histórico:** `tamanho_declarado` está em `COLUNAS_VERSAO` (`responsaveis.ts:18`); a projeção refaz `dim_card` e a mudança vira versão em `dim_card_versao`; staging intacto. `ref_dominio` com vigência (fecha e abre, nada apagado).
- **Uma fonte por coluna:** `tamanho_declarado` saiu de `COLUNAS_LISTA` (allow-list aperta) e entra explícito em `COLUNAS_DIM`; teste prova que campo customizado mapeado não a alimenta.
- **Versão de critério e T2.6:** `versao_criterio` do arquivo é `105:tamanho-pela-regua-do-time`, `afeta: ['O8']`; o `bm:ref-sync` a grava com a data do dia e `lerVersoes` a leva às marcações. A troca do bloco (antes O15) é segura no banco real: a fase do O15 já foi sincronizada na release 105 (`ref_dominio` 10 -> 357, histórico 15/11 21:12), então a próxima sincronização só insere as 63 linhas da régua.
- **Aceite do contrato:** enum só acrescenta valores; fotografia `docs/contratos/snapshots/resultados/O8.json`, `openapi.json`, `docs/contratos/metricas/O8.md`, `docs/api/metricas.md` e a entrada "Contrato" do CHANGELOG atualizados (aceite de uso único conforme a política, E7.116).
- **Nada liga só com o merge:** a régua só chega a `ref_dominio` pelo `bm:ref-sync` manual (nenhum workflow em `.github/` o chama; `scripts/demo-dado-real.sh` é manual) e os cards só ganham tamanho no `bm:projetar` (manual). Sem régua carregada, `tamanhoPelaRegua` devolve nulo sem nota e o O8 segue com o motivo "aguardando a régua de tamanho aprovada".
- **Biblioteca e regras:** seis faixas sempre na ordem, faixa vazia `n` 0 e mediana nula ("sem entregas neste tamanho", nunca 0), mediana só com 20 ou mais (`publicavel`, teste 19/20), "Sem tamanho" por último e só com entregas; só BusinessMap, só a story no histograma por tipo.

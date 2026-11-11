---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l6b-publicacao-real
commit: bd76128a9fde6822f9e126ceaf4c24462fc7b865
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---
# Code review: 075 L6b, publicação real de BLOQUEADOS, O1, O2, O5 e O19 (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 6b" e a §5 de `docs/analises/075-plano.md` pedem: liga o interruptor, ajusta o mapa de origem, grava a data real da versão de critério e inverte os testes do 065 sem afrouxar o que eles provam. Os quatro achados são recomendados e não devolvem o lote.

## O que foi lido (diff `129fc3d5...bd76128a`, 1 commit, 15 arquivos)

- **Interruptor e mapa de origem** (`packages/contratos/src/origem.ts`):
  - `BLOQUEIOS_COM_DADO_REAL = true` (`:58`).
  - BLOQUEADOS, O5 e O19 entram em `METRICAS_ORIGEM_REAL`.
  - BLOQUEADOS e O5 saem de `MOTIVO_ORIGEM_MOCK`.
  - T10 e T12 não mudam: seguem fora do mapa, com o motivo genérico "fonte real ainda não definida" (§5, P-075-11 e P-075-12 "B").
  - Prova de T10 e T12 em duas camadas: no contrato (`origem.test.ts`, C1/C2) e na resposta HTTP com `fato_bloqueio` real (`painel-real-f6.test.ts`, S7), que é o teste pedido pelo SEG-A5.
  - O id da nota `bloqueio-sem-dado-real` segue no enum até o 9b, como o plano manda.
- **Data da versão de critério:** `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` (`packages/metricas/src/core/criterios.ts:127`). É ponto único: o id, a `data` da versão e o corte da série do O1 derivam dela. O comentário cita a consulta do dono no Histórico.
- **Marca no O1 e no O5:** `corte-serie-o1-075.test.ts` confere a marcação `criterio-2026-11-01-bloqueio-com-dado-real` no O1 e no O5, com a data dentro do período, e confere a ausência dela quando o período termina antes. S10 confere as cinco métricas de `afeta` e a ausência no O3.
- **Publicação** (`server/src/modulos/metricas/servico.ts:322-325`): mudam só os comentários.
  - Com o interruptor ligado, o ramo de `semParteDeBloqueio` não roda.
  - `comCorteDaSerieO1` é o único que anula pontos: antes de 2026-11-01 sai `null`, nunca 0.
  - S2 e S2b provam isso pelo `ServicoMetricas` real, com a coleta antes e depois da data. Isso fecha o A1 e o A2 do review do 6a.
- **Abaixo de 20 itens:**
  - S4: O5 com tipos de n < 20 sai com `estatistica.status = 'insuficiente'`.
  - S5: O19 com os 8 motivos, "não classificado" por último, e `pctDoTotal` e `duracao` `insuficiente` em todos.
  - O cálculo vem da biblioteca (T2.5): o diff não toca cálculo.
- **BusinessMap e Acelerato sem mistura:** S1 confere uma leitura de `r_dspd_bm.fato_bloqueio` e nenhuma do seed. O diff não toca leitor nem repositório, e as cinco métricas leem `fato_bloqueio` e `dim_card` do schema do BusinessMap (§4 do plano).
- **Histórico nunca sobrescrito:** sem migração e sem caminho de escrita no diff. Muda só o valor publicado.
- **CA-075-11:** S6 varre todas as chaves das respostas de BLOQUEADOS, O1, O2, O5 e O19 (o que a exportação leva) contra o padrão de pessoa e não acha nenhuma.
- **Testes invertidos, sem asserção afrouxada:**
  - `corte-serie-o1-075`: o caso da data pendente vira o caso da data real, e a asserção fica mais forte (valores exatos `[1, 0, 2]` e marcação nas duas métricas).
  - `qa-f6-painel`: a lista exata de reais ganha `REAIS_BLOQUEIO`, e as fictícias perdem só o O19. A comparação continua por igualdade da lista ordenada.
  - Q65 do E2E de API (`e2e/tests-api/bloqueio-sem-dado-065.spec.ts`): cada caso de ausência tem uma âncora positiva no mesmo cartão: `toBeVisible`, "Hoje há", P95, faixa visível, ou `scrollIntoViewIfNeeded`, que falha se o cartão não existir.
    - Os testids procurados como ausentes existem na fonte (checklist 11): `o1-bloqueados-sem-dado` em `CartaoO1.tsx:108`, `faixa-atencao-sem-dado-real-parcial` em `FaixaAtencao.tsx:148` e `estado-sem-dado-real-*` em `EstadoSemDadoReal.tsx:11`.
    - O stub `api-stub-065.ts` deixa de aplicar `semParteDeBloqueio`, como o servidor.
  - Os três testes do web:
    - `origem.test.tsx`: troca O19 por O20 e acrescenta os três reais.
    - `simulado.test.tsx`: passa para a visão semanal, com O12 como primeiro simulável. A propriedade provada é a mesma: o mock nasce uma vez só.
    - `bloqueio-sem-dado.test.tsx`: ganha o bloco 075 (W0 a W5). O bloco 065 fica com a fonte que simula o servidor antigo, para provar que o cliente ainda renderiza o estado nulo até o 9a. As âncoras positivas (`data-estado = ok`, P50 e P95, `o1-dias-dentro`, "Hoje há") seguem nos casos novos.
- **Caso S9b** (`painel-real-f6.test.ts:470`): com `vi.doMock` do contrato e `BLOQUEIOS_COM_DADO_REAL: false`, a API volta a sair com `hoje.bloqueados` nulo, a série toda nula e a nota no O1 e no O2. É a prova do critério de reversão. O mock tem efeito: com ele inerte, o `toBeNull` falharia. O `afterEach` desfaz o mock e reinicia os módulos.
- **Documentação:**
  - `docs/api/metricas.md`: a seção do 065 está marcada como superada e há uma seção nova do 6b.
  - CHANGELOG: entrada nova, e a frase dos interruptores foi corrigida.
  - `openapi.json` não muda: sem chave nem enum novo, e o texto do motivo não aparece nela.
- **Testes dos arquivos tocados**, rodados neste review:
  - server, `vitest run tests/painel-real-f6.test.ts tests/corte-serie-o1-075.test.ts tests/qa-f6-painel.test.ts`: 3 arquivos, 48 verdes.
  - contratos, `src/origem.test.ts`: 17 verdes.
  - web, `origem.test.tsx`, `simulado.test.tsx` e `bloqueio-sem-dado.test.tsx`: 3 arquivos, 36 verdes.
  - Não rodei o E2E Q65 nem o `painel-real-f6.pg`: a prova deles é o run do PR em rascunho (TL-A6).
- **Teto (M14):** `git diff --numstat --no-renames 129fc3d5 bd76128a`, fora `CHANGELOG.md` e `docs/api/metricas.md`, dá 455 linhas. Destas, 20 são de código de produção e 435 de teste (a inversão do 065 e os casos S1 a S10). Um comportamento só (A3).
- **Segurança:** gatilho do plano (projeção lida pela API com dado real). O parecer é do security-engineer: `docs/security/075-l6b-publicacao-real.md` está na árvore da worktree, sem commit, e não foi lido nem refeito aqui.

## Achados

- A1 (recomendado) packages/contratos/src/origem.ts:55 · `MOTIVO_O5_BLOQUEIOS_NAO_COLETADOS` ficou exportado sem uso depois que o O5 saiu de `MOTIVO_ORIGEM_MOCK` (código morto); remover no 9b, junto com o id da nota, ou antes.
- A2 (recomendado) packages/contratos/src/origem.ts:68 · os comentários daqui e de `:92` ainda dizem "O19 a O26" seguem mock; o O19 agora é real. Trocar por "O20 a O26" no próximo lote que tocar o arquivo.
- A3 (recomendado) server/tests/painel-real-f6.test.ts:335 · são 455 linhas de código e teste contra a orientação de 150. O excesso vem da inversão dos testes do 065 (o código de produção soma 20 linhas). O corpo do PR (E1.9) deve trazer `teto: excedido, 455 linhas, inversão dos testes do 065 e casos S1 a S10 do 6b; código de produção 20 linhas`.
- A4 (recomendado) docs/analises/064-lacunas-dado-real.md:1 · o plano pede a L1 marcada como corrigida, mas o arquivo não é versionado (está só no checkout principal, fora do git), então não cabe nesta branch. O Jarvis decide se marca lá ou se o versiona.

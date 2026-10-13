# Plano de testes - lacuna de valor (PV1, K-036)

Links: UX `docs/ux/lacuna-de-valor/` (validação `05-validacao.md` ainda sem retorno do usuário), plano técnico `docs/architecture/features/lacuna-de-valor.md` (seções 3, 7, 8), contrato `ResultadoPV1` em `packages/contratos/src/schemas.ts` (`resultadoPV1`), decisões provisórias U1/U2/U3 no commit 509b8d1. Spec: `e2e/tests/lacuna-de-valor.spec.ts`.

## Escopo
Cobre: seção "Percepção de valor" no fim do painel Sustentação com dados mockados; regras de anonimato e de mínimo; ausência de comentário livre e de dado individual; separação das fontes; marcação T2.6; ocultar/mostrar pelas preferências; acessibilidade AA a 375 e 1280; ausência de upload.
Não cobre (outros cartões): carga real, `tools/pesquisa` e papéis PG (B4/Q2), exportação de PV1 (fora da entrega, só teste de exclusão), alertas e Visão geral.
Os valores esperados vêm do cenário fixo do mock (plano 4): o painel mostra o trimestre vigente 2026-T3 (n=24, áreas 5,4,4,3,3,2,2,1, Outras = 5, 2 respondentes a menos que o mínimo por área em 3 áreas).
Premissa de dado provisório: U1 (áreas fictícias), U2 (base insuficiente mostra só o total, nunca faixas, nunca percentual) e U3 ("Concordam" = faixas 4+5). Se o usuário mudar, ajustar CT-04, CT-12 e CT-13.

## Cenários
Legenda de automação: E2E = `e2e/tests/lacuna-de-valor.spec.ts`; fixme = escrito e marcado `test.fixme` até F1/B3 existirem; unit/prop = nível da biblioteca (dono: node-backend), listado aqui para rastreio; Q2 = executado no cartão Q2.

| ID | Cenário | Tipo | Prioridade | Automatizado |
|---|---|---|---|---|
| CT-01 | Seção "Percepção de valor" é a última do painel Sustentação, visível sem expandir "Mais métricas", com fonte "Pesquisa de percepção (não é Acelerato)", "Pesquisa de 3T/2026" e selo "Dados fictícios" | E2E | Alta | fixme (F1) |
| CT-02 | Participação aparece como "k de n convidados"; percentual só com n >= 20; nenhuma meta de resposta | E2E | Alta | fixme (F1) |
| CT-03 | Consolidado 2026-T3 (n=24): contagem e percentual por faixa, rótulo numérico em cada faixa, legenda textual e tabela equivalente | E2E | Alta | fixme (F1) |
| CT-04 | Consolidado com n entre 5 e 19: só "k de n", sem "%" (fronteira 19/20) | unit/prop + E2E | Alta | unit/prop (B2); E2E fixme (F1, depende de dataReferencia) |
| CT-05 | Consolidado com n < 5: "Base insuficiente: N respostas. Mínimo 5 para publicar.", sem faixas | unit + E2E | Alta | unit (B2); E2E LV-12 (`?mock=pesquisa:insuficiente`) |
| CT-06 | Por área, ciclo 1: "não publicado" com motivo "primeiro ciclo", sem nenhuma área | unit + E2E | Alta | unit (B2) |
| CT-07 | Por área, ciclos seguintes: áreas com n < 3 vão para "Outras áreas"; "Outras áreas" é listada por último, demais em ordem alfabética | E2E + prop | Alta | fixme (F1) |
| CT-08 | A10: supressão complementar. Se 0 < n(Outras) < 3, a área publicada de menor n também entra em Outras (cenário 2026-T1: 4,3,3,3,1); n(Outras) nunca é 1 ou 2 | unit + prop | Alta | unit/prop (B2) |
| CT-09 | A10: com menos de 2 grupos publicáveis, "Por área" vira "não publicado (base insuficiente)" | unit | Alta | unit (B2) |
| CT-10 | A10 por subtração: consolidado menos soma das áreas publicadas nunca dá 1 ou 2; no DOM de 2026-T3, soma das áreas exibidas + Outras = 24 | prop + E2E | Alta | prop (B2); E2E fixme |
| CT-11 | Nenhuma ordenação por desempenho: áreas em ordem alfabética fixa, sem posição, ranking, destaque de melhor/pior | E2E | Alta | fixme (F1) |
| CT-12 | Ausência de média, nota única, meta, semáforo, NPS e score no cartão e no payload (`.strict()` do schema) | E2E + contrato | Alta | fixme (F1); contrato já em `packages/contratos` |
| CT-13 | Tendência: até 4 trimestres, "Concordam" (4+5) por pergunta; ponto com base < 5 aparece como "base insuficiente", sem valor | E2E | Média | fixme (F1) |
| CT-14 | T2.6: troca de versão do questionário (v1 até 31/03/2026, v2 a partir de 01/04/2026) marca a quebra de série na tendência com a data | E2E | Alta | fixme (F1) |
| CT-15 | Bloco "O que mudou por causa da pesquisa" presente, texto puro (HTML injetado vira texto, sem elemento filho) | E2E | Média | fixme (F1) |
| CT-16 | Nenhum comentário livre do respondente, nome, e-mail, id de usuário, campo de pessoa em DOM e em respostas de rede da seção | E2E | Alta | fixme (F1) |
| CT-17 | Nenhuma requisição de escrita (POST/PUT/PATCH/DELETE) e nenhum controle de upload na seção | E2E | Alta | fixme (F1) |
| CT-18 | Fontes separadas: PV1 não aparece em "Pede atenção", não altera S1/S2 e S1/S2 não mostram dado da pesquisa; rótulo "não é Acelerato" | E2E | Alta | fixme (F1) |
| CT-19 | "Leia junto" S1 e S2 listam PV1 e levam o foco ao cartão; ocultar `pv1` nas preferências remove o link e a seção | E2E | Média | fixme (F2) |
| CT-20 | Rodapé "Não afetado por: equipe, prioridade, período"; mudar filtro de equipe ou período não altera a seção | E2E | Média | fixme (F1) |
| CT-21 | Estado sem pesquisa: mensagem "Nenhuma pesquisa carregada...", sem botão de upload; carregando e erro no padrão dos cartões | E2E (API interceptada) | Média | fixme (F1/B3) |
| CT-22 | Acessibilidade AA (axe wcag2a/2aa/22aa) em /sustentacao a 1280 e 375 com a seção visível, sem rolagem horizontal | E2E | Alta | fixme (F1) |
| CT-23 | Teclado: foco chega à seção na ordem do DOM, sem armadilha; tabela equivalente alcançável; sem informação só por cor | E2E | Alta | fixme (F1) |
| CT-24 | Rota `GET /api/v1/metricas/PV1`: schema de saída, 304, só `dataReferencia` aceito (outros params recusados), `dataReferencia` antes da primeira carga gera `sem-pesquisa` | integração | Alta | B3 (server), revisão no Q2 |
| CT-25 | Contrato e carga: CSV com coluna `email`/`nome` recusado, célula com `@`, área fora da lista, soma divergente, UPDATE em `pesq_*` falha (55000) | unit/PG | Alta | B4 (Q2 revisa) |
| CT-26 | Catálogo `/metricas` passa a 51 métricas e PV1 com fonte "Pesquisa de percepção" | E2E | Média | fixme (F2); hoje `complementares.spec.ts` ainda afirma 45 (deve ser atualizado por quem alterar a contagem) |
| CT-27 | Exportação: PV1 fora da seleção | unit | Média | F2 |
| CT-28 | Mock determinístico: hashes `924448d4` e `b2bfd4c0` intactos | unit | Alta | B2 |

## Dados de teste
Cenário fixo de `gerarPesquisaMock` (sem semente nova): 2025-T2 n=9, 2025-T3 n=11, 2025-T4 n=4, 2026-T1 n=14, 2026-T2 n=19 (reenviado), 2026-T3 n=24. E2E usa a base mock padrão do web (sem backend). Para CT-04/05/21 é preciso uma forma de fixar a `dataReferencia` ou interceptar a rota; se o web usar só mock em memória, usar `page.route` na API real (projeto de integração) ou depender de fixture a ser combinada com o react-frontend.
Entradas inválidas e bordas: cobertas na biblioteca (fronteiras 4/5, 2/3, 19/20) e no validador de CSV; no E2E, o texto "O que mudou" com HTML e caracteres especiais (CT-15).

## Resultado da execução (Q2, 2026-10-12, feature/lacuna-de-valor @ af9950e)

Ambiente: WSL, Node 24, Chromium headless com libs locais, `vite preview` (mock), PostgreSQL 17 temporário em contêiner próprio (porta 55432, removido ao final). Comandos pesados sob `flock /tmp/metricas-pesado.lock`.

| Verificação | Resultado |
|---|---|
| `pnpm run pronto` (lint, format, typecheck, build, cobertura 100%) | verde. Testes: contratos 41, mock 157, metricas 504, tools/pesquisa 33, server 282 (55 PG pulados sem banco), web 752, docs-contratos 102, homolog 67, spec-check 14. Bundle F6 186,80 KB < 200 |
| `pnpm run docs:check` | ok (337 páginas, 51 métricas) |
| `test:pg` completo em banco temporário (init original, papel `dspd_pesquisa` criado) | 11 arquivos, 55 testes verdes, inclusive os 7 de `pesquisa.pg.test.ts` (carga real com o pacote, append-only 55000/42501, papéis, domínio, I-2, migração 0013 down/up). A pendência de evidência PG do I-1 está fechada |
| E2E Chromium completo (`test:chromium`, com axe, 1280 e 375) | 342 passaram, LV-11 e LV-12 ativados depois (G-1), 1 falha na primeira rodada (FIL-04, flaky, abaixo) |
| E2E `filtros.spec.ts` após o ajuste do teste, 3 repetições x 2 | 39 de 39 verdes nas duas rodadas |
| C6 (`test:perf`, mediana agregada de 15 amostras por rota) | 1ª rodada: falhou em `/` (308 ms) com carga alta da máquina (load 9,6, vitest de outro QA fora do lock); 3 rodadas seguintes com a máquina livre: verdes, 107 a 165 ms (limite 200) nas 6 rotas; CLS 0,001 a 0,004 |

### Cenários da PV1
| ID | Resultado | Evidência |
|---|---|---|
| CT-01, 02, 03 | passa | E2E LV-01, LV-02 (1280 e 375) |
| CT-04 (5 a 19, sem %), CT-05 (n < 5), CT-06 (ciclo 1) | passa (unitário) | `pesquisa.test.ts`; E2E LV-12 (n < 5) e LV-11 (sem pesquisa) via `?mock=` (G-1) |
| CT-07, CT-10, CT-11 | passa | LV-03 (alfabética, Outras por último, soma 24, sem ranking) |
| CT-08, CT-09 (A10) | passa | `pesquisa.test.ts` (resto 1 ou 2 arrasta a menor área; menos de 2 grupos não publica) e propriedade |
| CT-12, CT-16 | passa | LV-04 (sem média, nota, meta, ranking, pessoa ou comentário) |
| CT-13, CT-14 (T2.6) | passa | LV-05 (4 trimestres, quebra com data) |
| CT-15 | passa | LV-06 (texto puro) |
| CT-17 | passa | LV-08 (nenhuma escrita, sem upload) |
| CT-18, CT-20 | passa | LV-09 (fora de "Pede atenção", fontes separadas, filtros não alteram) |
| CT-19 | passa | LV-10 |
| CT-21 | passa | LV-11 (`?mock=pesquisa:sem`, sem botão de carga nem campo de arquivo) e `percepcao.test.tsx` |
| CT-22, CT-23 | passa | LV-07 (axe wcag2a/2aa/22aa a 1280 e 375, sem rolagem horizontal), LV-13 (teclado) |
| CT-24 | passa | `metricas.pesquisa.test.ts`: DTO, só `dataReferencia` (outros 400), data futura 400, antes da 1ª carga `sem-pesquisa`. 304 explícito com ETag/If-None-Match (corpo vazio, ETag repetido; ETag diferente devolve 200) (G-2) |
| CT-25 | passa | `csv.test.ts`, `carga.test.ts`, `pesquisa.pg.test.ts` (coluna extra e `email` recusados sem vazar o nome ou a célula, célula com `@`, área fora da lista no CSV e no banco, soma divergente, UPDATE/DELETE/TRUNCATE falham) |
| CT-26 | passa | LV-14 (PV1 no catálogo com fonte "Pesquisa de percepção") |
| CT-27 | passa (unitário) | exportação exclui PV1 |
| CT-28 | passa | hashes BM `924448d4` e AC `b2bfd4c0` intactos; pesquisa `b2eb2918` |
| I-2 (última carga por trimestre) | passa | `pesquisa.test.ts` (carga 5 com n=17 nunca publicada em nenhuma data), propriedade P7b, PG "leitura real" |

Axe: zero violações críticas ou sérias nos fluxos novos e nos existentes. Anonimato 5/3, k de n abaixo de 20, A10, I-2 e a separação das fontes foram conferidos no navegador e na biblioteca.

### Revalidação do lote de bugs (cartão 1 da triagem de 2026-10-12)
003, 004, 005, B12-001, B12-003, B3-001 e B3-002: VERIFICADOS em navegador; arquivos de bug atualizados. 004: sem `%2C` (URL `?equipe=erp-protheus,fluig`).

### Achados
- G-1 (baixa, FECHADO e VERIFICADO): o mock do web é em memória e a Sustentação esconde o cartão quando a coleta do Acelerato não começou (2026-09-15), então fixar `dataReferencia` não alcança os estados. Solução mínima no web: modos ocultos `?mock=pesquisa:sem` e `?mock=pesquisa:insuficiente` em `web/src/data/simulacao.ts` (só PV1, só mock, testados em `MockFonteMetricas.test.ts`). LV-11 e LV-12 ativados, sem `fixme`.
- G-2 (baixa, FECHADO e VERIFICADO): 304 da rota PV1 asserido em `server/tests/metricas.pesquisa.test.ts` (ETag, If-None-Match igual, corpo vazio, ETag diferente 200).
- G-3 (instabilidade de teste, corrigida): FIL-04 e FIL-22 liam a URL logo após Esc e falharam uma vez sob carga; trocadas por `expect.poll` em `e2e/tests/filtros.spec.ts`. O produto atualiza a URL ao fechar o menu, sem defeito de comportamento.
- G-4 (informativo): C6 é sensível a concorrência fora do `flock` (falha única em `/` com load 9,6). Mediana agregada não mascarou a carga e as rodadas limpas passam com folga.
- Pendências que não são de QA: aceite do usuário (M-4 da UX, `05-validacao.md`), U1, U2, U3, `DSPD_PWD_PESQUISA=` nos exemplos de `.env`.

Bugs abertos: nenhum crítico, alto ou médio.

### Parecer
APROVADO para seguir ao PR: todos os cenários de prioridade alta passam, nenhum bug aberto crítico, alto ou médio, zero violações de acessibilidade críticas ou sérias. Ressalva: só as pendências de aceite do usuário acima.

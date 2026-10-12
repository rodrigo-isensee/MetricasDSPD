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
| CT-05 | Consolidado com n < 5: "Base insuficiente: N respostas. Mínimo 5 para publicar.", sem faixas | unit + E2E | Alta | unit (B2); E2E fixme |
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

## Resultado da execução
Ainda não executado. Q1 entrega plano e spec; a execução e o parecer ficam no cartão Q2 (depende de B3, B4, F2). Spec com `test.fixme` por falta de F1/F2/B3 (motivo no título de cada teste). Bugs: nenhum registrado.

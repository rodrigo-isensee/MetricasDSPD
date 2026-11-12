# 099 - Revisão da interface do L4 (E2.19)

Escopo: catálogo (coluna Dados e textos) e as 8 notas, no head 1525bed8 da branch `fix/099-l4-textos-sem-simulado` (worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`). Contra `docs/ux/099-textos-sem-simulado.md`, ADR 0030, heurísticas de Nielsen e WCAG 2.2 AA. Tudo abaixo é `lido` (código e testes); nenhuma ferramenta foi rodada, e o contraste e o leitor de tela seguem para o QA (`@axe`).

## Veredito

Aprovado, sem achado crítico, alto nem médio de interface. Dois achados baixos e uma observação de dependência, que não bloqueiam o merge.

## Conferência dos textos (lido)

| Item | Resultado |
|---|---|
| Parágrafo de abertura do catálogo (`CatalogoPage.tsx:26-31`) | Igual à especificação, palavra por palavra. Teste em `catalogo.test.tsx:72-83`. |
| Legenda da tabela (`CatalogoPage.tsx:68`) | "situação dos dados (real ou sem dado real)", como especificado; testada. |
| Tipo e valor da coluna (`linhas.ts:20,44`) | `'Real' \| 'Sem dado real'`, derivado de `origemDaMetrica`; sem terceiro estado. Comentário "Decisão 20" removido. |
| OP-21 (S11), TA-16 (T2), TA-17 (T3), TA-18a (T13), TA-18b (T14), ES-11 (E3), ES-12a (E6), ES-12b (E8) | As 8 notas batem com a especificação (`notas-sem-simulado.test.ts:15-38` compara cada uma com o texto exato). |
| Sobra de "fict", "mock" ou "simulad" em `notas.ts` | Nenhuma (busca em todos os `notas.ts` de `web/src/features` sem resultado; guarda no teste `notas-sem-simulado.test.ts:9-13`). |
| Sobra no catálogo | `catalogo.test.tsx:110` garante que a tabela não traz "fictíci", "simulad" nem "exemplo". |

## Coluna Dados: clareza e acessibilidade (lido)

- A situação é dita por palavra ("Real" ou "Sem dado real") na célula, sem cor nem ícone: atende ao critério de não depender só de cor (WCAG 1.4.1).
- A legenda da tabela descreve a coluna; o cabeçalho "Dados" continua curto. Os testes contam as células por nome acessível (`catalogo.test.tsx:106-109`), o que confirma que o texto está no DOM.
- A pergunta 1 da especificação (métrica em vários cartões) não se aplica: o mapa de origem é por métrica (`origemDaMetrica(m.id)`), então cada linha tem uma única situação, inclusive a espera invisível em um linha por nível. Fica dispensada a regra de "qualquer cartão sem dado".
- Os links "Ir ao painel" mantêm o texto oculto com o código (`sr-only`), sem mudança.

## Achados

| # | Severidade | Onde | Por quê | Correção |
|---|---|---|---|---|
| 1 | Baixo | `packages/contratos/src/origem.ts:105-111` | `origemDaMetrica` ainda devolve `'mock'` e `motivoDaOrigemMock` fala em "dado fictício" no comentário. Não aparece na tela; é só vocabulário interno, e fora do escopo do L4 (e do front-end). | Renomear para `'sem-dado'` e `motivoDaOrigemSemDado` no lote do contrato (L3 ou depois), para o código não contradizer a ADR 0030. |
| 2 | Baixo | `CatalogoPage.tsx:10` (comentário) e parágrafo de abertura | O comentário cita "49 linhas" e o texto, "45 métricas + 1 de percepção"; o teste espera 65 linhas (`catalogo.test.tsx:89,102`). O texto de abertura veio da especificação, que repetiu a contagem antiga; o leitor vê o contador "65 de 65 métricas" logo abaixo e pode estranhar. | Pergunta ao dono ou ao product owner qual contagem vale (45+1 do briefing ou as 65 linhas do catálogo atual) antes de mexer; não decidir por inferência. Se for só texto, corrigir o parágrafo e o comentário juntos. |

## Dependência (não é achado da interface)

O parágrafo promete "nenhuma mostra número de exemplo". Isso só é verdade depois do L1, L2b e L2c (o pedido ainda lista `MockFonteMetricas`, `FonteComSimulado` e `AvisoDadosFicticios.tsx` em `web/src`, em arquivos que esta branch não toca). O portão de merge deve manter a ordem: L2b e L2c antes do L4 chegar à `develop`, ou a frase fica falsa na tela entre um merge e outro. Dito ao tech-lead pelo Jarvis.

## Microcopy

Português do Brasil, voz direta, sem culpar ninguém. Os textos novos são mais curtos que os antigos e mantêm as regras de negócio (60 dias e 20 itens, "não é nota do time", "fica fora da conta") intactas.

## Estado

Aguardando apenas o portão de merge do tech-lead. Nenhuma decisão de produto nova foi criada nesta revisão; o achado 2 vira pergunta ao dono se o texto precisar mudar.

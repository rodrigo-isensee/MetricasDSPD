# Revisão de UX: O17 por sistema com dado real (E3.188)

Branch `feature/099-o17-sistema`, head `f33af676`. Base: decisão B' da Q-099-7 (O17 por sistema com dado real; causa raiz "sem dado real" até o Registro de Problemas com vínculo ao incidente; a causa aparente não vale como causa raiz). Não há especificação `099-*` própria do O17 em `docs/ux/`; conferi contra a decisão, o ADR 0030 e as revisões anteriores (`099-revisao-l2b-l2c.md`, `099-revisao-l4.md`). Toda a análise é `lido` (código e testes); nada foi `medido`.

## Parecer

**Aprovado com ressalvas.** O comportamento está correto e honesto: o cartão não tem mais selo de fictício, mostra o dado real por sistema, e a causa raiz aparece no estado "Sem dado real" com o motivo, sem número, sem lista vazia e sem "Não informada" inflado. Não há achado crítico nem alto. Há dois achados médios, ambos de texto (frases que contradizem o estado novo) e um de clareza; mais três baixos. Os médios 1 e 2 devem ser corrigidos antes do release, porque a tela diz duas coisas opostas no mesmo cartão.

## O que confere

| Item | Resultado | Evidência (`lido`) |
|---|---|---|
| Selo de fictício no O17 | Sem selo | `CartaoO17` não usa selo; `METRICAS_ORIGEM_REAL` inclui `O17` (`origem.ts:39`) |
| Catálogo: coluna Dados | "Real" para o O17, em Sustentação/Acelerato | e2e COMP-12 (`complementares.spec.ts:130-140`): linha O17 contém "Real"; as 65 linhas somam "Real" + "Sem dado real"; zero "Fictícios" e zero "Da coleta" |
| Por sistema real | Barras horizontais "Incidentes encerrados por sistema", ordenadas por contagem e desempate por nome (`ordenarNeutro`) | `sustentacao.tsx:57-65`, `o17.ts:25-43` |
| Causa raiz sem dado real | `EstadoSemDadoReal` com ícone `info`, texto "Sem dado real" e "Motivo: aguardando o Registro de Problemas com vínculo ao incidente (a causa aparente não é a causa raiz)"; sem depender de cor (WCAG 1.4.1) | `sustentacao.tsx:41-46`, `EstadoSemDadoReal.tsx`, `origem.ts:54-55` |
| Cartão não vira "sem fonte" inteiro | `semFonteParcial` evita `CampoSemFonte`; base ("N incidentes encerrados") e por sistema permanecem | `CartaoComplementar.tsx:67`, teste `ramos.test.tsx:310-328` |
| Frase de leitura | Só aparece se há causa com n > 0; com `porCausa` nulo, sem frase "mais frequente" | `sustentacao.tsx:27,34-37`; testes `ramos.test.tsx:294-328` |
| Motivo padrão | "causa raiz sem dado real" quando o motivo vem nulo | `sustentacao.tsx:44`, `ramos.test.tsx:330-342` |
| Marca de mudança de critério | O17 marcado só em períodos que cruzam 2026-11-12 (T2.6) | `criterios.ts:155-161`, `complementares.test.ts:391-400` |
| Sem métrica individual nem ranking por pessoa | Sem pessoa em nenhuma parte: causa raiz e sistema são categorias; `cuidados` diz "Por sistema, nunca por pessoa"; ordem por contagem de sistema, não de pessoa | `o17.ts`, `notas.ts:106-114` |
| BusinessMap e Acelerato não se misturam | O17 é só Acelerato (`catalogo-metricas.ts:497-504`, `fonteDaMetrica('O17') = acelerato`); o vínculo O15 (BusinessMap) → O17 é só link de navegação ("Leia junto"), sem cálculo cruzado | `complementares.spec.ts:242-260` |
| Story, frente e projeto | Não se aplica (granularidade chamado) | catálogo |

## Achados

### 1. Médio. A frase "Só a lista de causas é provisória... o campo causa raiz virá do Metabase" contradiz o estado novo
- Onde: `sustentacao.tsx:66-69` (parágrafo `Leia` sob os gráficos) e `notas.ts:113` (`cuidados` do O17); o teste `ramos.test.tsx:304` ainda fixa a frase.
- Por quê: com a decisão B', a causa raiz não tem lista provisória: ela não tem dado, e a fonte prevista é o Registro de Problemas com vínculo ao incidente, não o Metabase. Quando `porCausa` é nulo (o caso real hoje), o cartão mostra "Sem dado real: aguardando o Registro de Problemas" e, logo abaixo, "a lista de causas é provisória, o campo virá do Metabase". Duas fontes e dois estados no mesmo cartão. É também a mesma classe de resíduo que as revisões L2b/L2c e L4 já pediram para limpar (texto que fala de simulado/provisório).
- Correção: quando `porCausa === null`, não mostrar o `Leia` (o motivo já explica). Quando `porCausa` existir (hoje só no mock/extensão), usar texto neutro, por exemplo: "A causa raiz vem do Registro de Problemas; a lista de causas é uma proposta do time." Mesmo ajuste em `notas.ts:113`: "A causa raiz ainda não tem dado real: depende do Registro de Problemas com vínculo ao incidente. Por sistema, nunca por pessoa." Atualizar `ramos.test.tsx:304`.

### 2. Médio. A nota "Como se calcula" do O17 promete o que o cartão já não faz
- Onde: `notas.ts:109`: "Se o campo ainda não tem fonte, a métrica diz isso e não publica número."
- Por quê: hoje o O17 publica número por sistema e só a causa raiz fica sem dado. Quem abre "Como se calcula" lê que o cartão inteiro não publica.
- Correção: "Contagem de incidentes encerrados por sistema (dado real do Acelerato) e por causa raiz. A causa raiz fica sem dado real até o Registro de Problemas ter vínculo ao incidente; nesse caso o cartão diz isso e não publica a parte por causa raiz. Sem mínimo de amostra: é contagem." Corrigir também a referência a "lista proposta pelo time" e "lida pelo Metabase".

### 3. Médio. As duas partes do cartão não têm título visível; o aviso "Sem dado real" não diz a qual parte se refere
- Onde: `sustentacao.tsx:41-65`. `descricao` do `Barras` vira só a legenda da tabela de dados (`Barras.tsx:171`); `EstadoSemDadoReal` não recebe rótulo.
- Por quê: o aviso aparece acima do gráfico por sistema, sem subtítulo. Quem lê "Sem dado real" seguido de um gráfico pode entender que o gráfico também está sem dado, ou que o aviso é do cartão todo. Só o texto do motivo ("causa aparente") sugere que é a causa raiz. Heurísticas: visibilidade do status, correspondência com o mundo real.
- Correção: dois subtítulos visíveis (nível abaixo do `h3` do cartão), "Por causa raiz" e "Por sistema", antes de cada bloco. Alternativa mínima: prefixar o motivo com "Causa raiz: ". Não precisa tocar em `EstadoSemDadoReal`.

### 4. Baixo. O catálogo diz "Real" para o O17 sem indicar que a causa raiz é a parte sem dado
- Onde: coluna Dados do catálogo; COMP-12.
- Por quê: o ADR 0030 e a L4 só permitem dois estados, então "Real" é coerente com a decisão B' (a métrica é publicada). Mas a recomendação anterior (L4, "só Real quando todos os cartões tiverem") não cobre métrica com parte sem dado. Não é erro; é uma lacuna de informação pequena.
- Correção: sem mudança de código agora. Se o dono quiser sinalizar, é decisão dele (`R-DECISAO`): manter "Real" (recomendado, e o que a decisão B' publicou) ou aceitar um terceiro estado "Parcial". Eu manteria "Real", pois o cartão explica a parte sem dado no ponto de uso.

### 5. Baixo. Sem frase de leitura quando só o por sistema existe
- Onde: `sustentacao.tsx:27,34-37`.
- Por quê: `leitura` só nasce da causa raiz. Com `porCausa` nulo, o cartão perde a frase-resumo; o sistema mais frequente seria a leitura útil agora ("O sistema com mais incidentes é X, com N").
- Correção: gerar a leitura pelo `porSistema[0]` quando `porCausa` for nulo. Opcional; não bloqueia.

### 6. Baixo. Estado do por sistema sem incidentes não está coberto
- Onde: `sustentacao.tsx:57-65`.
- Por quê: com o período sem incidentes encerrados, `porSistema` é lista vazia e o gráfico fica vazio sem explicação. Não achei teste para isso.
- Correção: usar o mesmo padrão de vazio dos outros cartões ("Nenhum incidente encerrado no período") ou confirmar que a `base` do cartão já trata. QA pode verificar.

## Acessibilidade (WCAG 2.2 AA), tudo `lido`
- 1.4.1: "Sem dado real" é dito por ícone + texto, sem cor como único sinal. Passa.
- 1.4.11 / 1.4.3: borda tracejada `border-borda-controle` e texto `text-texto`/`text-texto-2` usam tokens do sistema já revisados nas rodadas anteriores. Contraste sem medição: o QA mede (`@axe`).
- 1.3.1: o aviso é texto simples em parágrafos; não há `role` de alerta, o que é correto (não é erro). O achado 3 também ajuda leitor de tela, que hoje não ouve a qual parte o aviso se refere.
- 2.4.3: o foco no cartão pelo "Leia junto" (`#o17`) segue testado em COMP-14 (foco no `h3`).
- Leitor de tela e contraste: `lido`, sem medição.

## Resumo para o Jarvis
Aprova com ressalvas. Corrigir antes do release: achados 1, 2 e 3 (texto e subtítulos, sem mudança de regra de cálculo). Achados 4 a 6 são opcionais ou para o QA. Nenhuma tela mostra métrica individual nem ranking por pessoa; BusinessMap e Acelerato não se misturam. Pergunta ao dono só se ele quiser alterar o achado 4 (um terceiro estado no catálogo).

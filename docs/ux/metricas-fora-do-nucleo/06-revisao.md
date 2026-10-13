# Métricas fora do núcleo · 06 Revisão da interface implementada

Data: 2026-10-11 · Branch: `feature/metricas-complementares` · Revisora: UX.

## Escopo e método
Contra: `02-definicao.md`, `03-ideacao.md`, `05-validacao.md`, protótipos `docs/ux/figma/prototipos/complementares-{1280,375}.html`, decisões em `docs/alinhamentos/2026-10-11-decisoes-complementares.md` e `docs/ux/design-system.md`. Referência de heurísticas: Nielsen e WCAG 2.2 AA.

Limites desta revisão:
- **Revisão estática do código**. O worktree não tem `node_modules` e este ambiente não tem navegador, então o app não foi executado e **não houve inspeção visual a 375 e 1280 px**. Itens de layout e contraste abaixo vêm dos tokens e das classes; conferir no QA/axe.
- Não existe `especificacao.md` na pasta (o upstream parou em `05-validacao.md`, que segue "aguardando o usuário"). A referência efetiva foi `03-ideacao.md` + decisões D-1 a D-6 registradas no alinhamento.

Arquivos lidos: `web/src/features/{complementares,catalogo,preferencias}/*`, `packages/contratos/src/cartoes.ts`.

## Conforme (resumo)
- Seção `<details>` recolhida por padrão, com contagem, montagem sob demanda e estado por visita (fora do perfil). Abre e leva ao cartão com foco no título; `scroll-padding-top` já considera cabeçalho e filtros.
- Complementares no catálogo único, seletor com grupo "Complementares" e contador "(+N)", sem mudar o contrato `ocultar`. "Restaurar padrão" abre a seção (D-4). Sem alerta de complementar (D-3).
- Cartão reaproveita `CartaoMetrica` (estados carregando, erro, vazio; base amostral; fonte e granularidade; nota metodológica). Selo "Dados fictícios" com ícone e texto, âmbar.
- Anti-meta: O13, O16, O5, O11, O17 e S11 com "Sem alvo"; T8 "sem alvo de 100%"; O8 com média só ao lado de mediana e P85; E5 com frentes adicionadas na tabela e P85 para compromisso externo; O14 e S12 "nunca por pessoa"; sem ranking de pessoas (O16 lista cards por id).
- Insuficiência (< 20) com `AmostraInsuficiente` e `ListaInsuficientes`, nunca o número parcial. Fontes BusinessMap e Acelerato não se misturam (fonte passada por painel).
- Catálogo `/metricas`: filtros com label, contagem em `role=status`, tabela com legenda, link com texto para leitor de tela.

## Desvios

### Bloqueante

**B-1. "Leia junto" não liga o núcleo às complementares prometidas; o teste 1 do roteiro falha.**
- Onde: `packages/contratos/src/cartoes.ts` (`Def` aceita um único `par`; `leiaJunto: [par]`), usado por `LeiaJunto.tsx`.
- Problema: o protótipo e a ideação mostram em O3 "Leia junto: O5, O6, O8". No código, O3 aponta só para O6, O4 só para O8, O15 só para O13, S1 só para S9. **O5 não é alcançável a partir de O3** (critério de sucesso: "encontra O5 a partir de O3 em até 2 cliques e 15 s"). Também ficam sem nenhum link de entrada: O5, O11, O14, O16, O17, T6, T8, E4, E5, S8, S10, S11, S12 (T9/E1 não apontam para E5/E4). A nota do próprio O5 diz "Leia ao lado do tempo de ciclo (O3)", mas O3 não leva a ele.
- Correção: trocar o 4º elemento de `Def` por lista (`pares: readonly string[]`) e preencher: O3 → O5, O6, O8; O4 → O8; O15 → O13, O16, O17; T1/T9 → T6 e E5 conforme a pergunta; S1 → S9, S10; S2/S3 → S8, S12; S5/S7 → S11. Validar com o usuário o mapa final (hipótese até aprovar). Atualizar `LeiaJunto` (já aceita lista) e o teste.

### Médio

**M-1. Notas metodológicas desatualizadas frente às decisões de 11/10.**
- Onde: `web/src/features/complementares/notas.ts`, O5 (`comoSeCalcula`/`cuidados`: "confirmação do critério pendente"), O11 (`comoSeCalcula`: "definição de pronto e de definição ainda a confirmar"), O17 ("Módulo = sistema por ora").
- Problema: decisão do usuário já fechou O5 (bloqueio sai da execução) e O11 (em definição = Requested, pronto = In Progress). A nota diz o oposto de "decidido", o que confunde e viola "ajuda e documentação" (e "Sem texto correto, o cartão não é entregue").
- Correção: reescrever O5 e O11 como regra vigente (O11 informando Requested → In Progress); manter "pendente" só para O17 (origem BusinessMap vs Acelerato ainda em aberto). Rever S8/S12 com o texto da decisão.

**M-2. Status do catálogo contradiz o aviso global de dados fictícios.**
- Onde: `web/src/features/catalogo/linhas.ts` (`status: 'Disponível' | 'Dados fictícios'`), `CatalogoPage.tsx`.
- Problema: o núcleo aparece como "Disponível" e só as complementares como "Dados fictícios", enquanto o design system (2.11) diz que nenhum número do app representa a operação real. Leva a crer que o núcleo é real. A coluna também mistura "disponibilidade" e "natureza do dado".
- Correção: rotular o status pelo que é de fato (ex.: coluna "Dados": "Fictícios" para todos até a coleta real, ou "Real" quando existir) e confirmar com o arquiteto o campo `status` do catálogo para o núcleo. Se a distinção núcleo/complementar é o que importa, ela já está na coluna Grupo.

**M-3. Contador "(+8)" sem unidade, no botão e nas Preferências.**
- Onde: `BotaoMetricas.tsx` ("Métricas: 9 de 9 (+8)"), `PreferenciasPage.tsx` ("9 de 9 (+8) visíveis").
- Problema: a ideação diz "(+8 complementares)". Sem a palavra, é ambíguo para todos e, para leitor de tela, lê "mais oito" sem objeto. Fere "correspondência com o mundo real" e 1.3.1.
- Correção: texto visível ou `sr-only`: "Métricas: 9 de 9 e 8 complementares" (no mobile pode abreviar visualmente, mantendo a versão completa para tecnologia assistiva). Idem em Preferências: "9 de 9 do núcleo e 8 de 8 complementares visíveis".

**M-4. Link "Leia junto" mostra só o código.**
- Onde: `LeiaJunto.tsx` (`{c.codigo}`).
- Problema: o protótipo exibia "O5 Eficiência de fluxo". Só "O5" obriga a lembrar o código (reconhecer em vez de lembrar). O `aria-label` já traz o rótulo, então leitor de tela está ok; a visão comum não.
- Correção: renderizar `O5 Eficiência de fluxo` (ou `O5 · Eficiência de fluxo`); manter `aria-label` iniciando pelo texto visível (WCAG 2.5.3 Label in Name: hoje o nome acessível começa com o código e inclui o texto visível, aceitável; revalidar após a mudança).

**M-5. Validação do usuário não registrada.**
- Onde: `05-validacao.md` ("aguardando o usuário (ausente)", retorno vazio); sem `especificacao.md`.
- Problema: o regimento exige validação antes de "Pronto para fazer". As decisões de 11/10 cobrem D-1 a D-6, mas não o roteiro de tarefas nem a decisão "aprovado/ajustar".
- Correção: registrar em `05-validacao.md` a referência ao alinhamento de 11/10 como retorno parcial e pedir ao usuário o aceite do roteiro com o app real (após corrigir B-1); gerar `especificacao.md` a partir de 02, 03 e das decisões.

### Baixo

**L-1. "Taxa de escape (O15)" em O13 e O16 é texto simples.** `fluxo.tsx` (`Leia` de O13/O16). Tornar "O15" um link (reusar `irParaComplementar`/âncora `#o15`) ou depender do "Leia junto" de B-1.

**L-2. Mensagem de insuficiência difere do texto da ideação.** `ListaInsuficientes` usa "amostra insuficiente (14 de 20 itens mínimos)"; a ideação previa "Amostra insuficiente: 14 itens. Mínimo 20." O padrão do design system (2.4/2.5) é "n de 20 itens mínimos"; manter o do DS e atualizar a ideação. Sem mudança de código.

**L-3. Restaurar padrão abre a seção sem dizer.** `PreferenciasPage.tsx` (`RestaurarPadrao`, `Dialog.Description`). O texto fala só das ocultas; acrescentar "e abre 'Mais métricas deste painel' nos painéis". Efeito (D-4) não é anunciado (visibilidade do status).

**L-4. Seção some se todas as complementares estão ocultas.** `MaisMetricas.tsx` (`return null`). Quem oculta tudo perde o ponto de entrada; a `FaixaOcultas` ajuda, mas vale uma linha "N complementares ocultas" na própria faixa com "Mostrar" (hoje a faixa já lista os códigos; confirmar no teste visual).

**L-5. Complementares do seletor não agrupadas por pergunta.** `BotaoMetricas.tsx` mostra um fieldset "Complementares" corrido; a seção no painel agrupa por pergunta ("Por que demora?"). Sem impacto funcional; consistência opcional.

**L-6. Selo "Dados fictícios" repetido em 17 cartões, além do selo global.** `CartaoComplementar.tsx`. Decisão do usuário (rótulo nos cartões sem fonte real) está atendida; só observar ruído visual a 375 px (selo + selos de fonte e janela empilham) e conferir no teste visual que não quebra o cabeçalho do cartão.

**L-7. O6 mostra "Referência: abaixo de 2,5" no gráfico.** `fluxo.tsx`. Está rotulado como referência do briefing, não meta, e fora de 7.2; manter assim, sem `StatusMeta` de "Fora da meta". Apenas garantir no teste que o cartão não exibe esse status.

## Pendente de inspeção em execução (QA/UX com app rodando)
1. 375 px: folha "Métricas" (85dvh), summary da seção com alvo 44 px, cabeçalho de cartão com selos empilhados, tabela do catálogo em `RegiaoRolavel`, E5 e O16 (tabelas largas).
2. 1280 px: popover à direita (`lg:right-6 lg:top-40`) sem cobrir a barra de filtros sticky; grid `lg:col-span-6` dos cartões.
3. Teclado: Enter/Espaço no `summary`, foco no título do cartão após "Leia junto", retorno do foco ao fechar o diálogo, axe nas três telas.
4. Reduzir movimento e tema escuro: contraste do selo âmbar e de `text-atencao` sobre `superficie`.

## Revalidação

Data: 2026-10-11 · Uma rodada · Revisora: UX. Contra os achados acima e os alinhamentos `2026-10-11-decisoes-complementares.md` e `2026-10-11-decisoes-delegadas-ao-time.md`.

Método: revisão estática do código (`web/src/features/{complementares,catalogo,preferencias}`, `packages/contratos/src/cartoes.ts`, `e2e/tests/complementares.spec.ts`). **Não houve preview nem inspeção a 375 e 1280 px**: não rodei build/preview, então os itens de "Pendente de inspeção em execução" continuam abertos para o QA/axe.

### Situação dos achados anteriores

| Achado | Situação | Evidência |
|---|---|---|
| B-1 Leia junto | **Parcial, segue bloqueante** | Ver N-1. `Def` agora aceita lista e O3 liga a O5, O6, O8 (a pergunta do teste 1 passa). Mas só 4 cartões renderizam `<LeiaJunto>` (O3, O4, O15, S1). |
| M-1 notas | Resolvido | O5 (bloqueio sai da execução) e O11 (Requested a In Progress) em regra vigente; S8 (campo "reincidente", ticket anterior), S12 e T8 (card-template pai, entrada não planejada) conforme as decisões. O17 sem "módulo"; só mantém "lista provisória". |
| M-2 status do catálogo | Resolvido, com observação | Coluna "Dados" = "Fictícios" onde `status=mock`, "Da coleta" nos demais. Segue o pedido desta rodada, mas difere da decisão delegada nº 20 ("Fictícios para todos até a coleta real") e do design system 2.11. Ver N-4. |
| M-3 contador | Resolvido | Botão: "Métricas: 9 de 9 (+8 complementares)"; Preferências: "N de M do núcleo e N de M complementares visíveis". |
| M-4 link com nome | Resolvido | `O5 Eficiência de fluxo`; `aria-label` começa pelo código e contém o texto visível. |
| M-5 validação | **Pendente** | `05-validacao.md` sem retorno parcial e sem `especificacao.md` na pasta. |
| L-1 link O15 | **Pendente** | `fluxo.tsx` O13 e O16 ainda com "taxa de escape (O15)" em texto. |
| L-2 | Resolvido (sem código) | DS mantido; basta atualizar a ideação. |
| L-3 restaurar | Resolvido | Diálogo diz que "a seção 'Mais métricas deste painel' volta a abrir". |
| L-4 tudo oculto | **Pendente** | `MaisMetricas` ainda retorna `null` se tudo oculto e `FaixaOcultas` não menciona complementares. |
| L-5, L-6 | Aceitos pela decisão nº 20 | Não mudar; observar no teste visual a 375 px. |
| L-7 O6 | Resolvido por código | `Referência: abaixo de 2,5` como rótulo; sem `StatusMeta`. Falta o teste explícito de "sem Fora da meta". |

### Verificações pedidas
- **Leia junto alcança as 17**: no dado, sim (teste de contratos passa pelas 17). Na tela, **não**: ver N-1.
- **O17 na Sustentação**: conforme. Está no catálogo de `sustentacao`, `cartaoPorId('operacional','o17')` é indefinido, fonte Acelerato, e há ligação S6 a O17.
- **"Dados fictícios" só onde `status=mock`**: conforme (`CartaoComplementar` lê o status; O17, T8, E4, S8, S11 e S12 têm selo; as demais 11 não; o E2E COMP cobre os dois lados).
- **"Campo sem fonte"**: claro, com ícone, texto e "Isto não significa zero"; distinto de amostra insuficiente.
- **"n de N"**: S8 mostra "Campo preenchido em n de N" quando a cobertura é parcial. **S12 não mostra cobertura** (N-2). `ListaInsuficientes` usa "n de 20 itens mínimos".
- **Contador**: "(+N complementares)" conforme.
- **Textos O5/O11/O17/S8/S12/T8**: conforme as decisões (M-1). O17 ainda diz "até a decisão final do critério": aceitável, mas a origem já foi decidida; trocar por "lista proposta; o campo causa raiz virá do Metabase".
- **Anti-meta**: mantida ("Sem alvo", "nunca por pessoa", T8 sem alvo de 100%, O8 com média ao lado, P85 em E5 e T6). S8 e S10 exibem "Abaixo de 5%" e "15 minutos" como referência do briefing (rotulados como referência); sem ranking de pessoas.

### Novos achados

**N-1 (alto; mantém o B-1 aberto). "Leia junto" só aparece em 4 dos 14 cartões que o mapa usa.**
- Onde: `LeiaJunto` é renderizado apenas em `CartaoO3`, `CartaoO4`, `CartaoO15` e `CartaoS1`. O10, O7, T1, T4, T9, E1, E2, S2, S3, S6 e S7 têm `leiaJunto` no catálogo, mas nenhum JSX o exibe.
- Efeito: pela tela só se chega a O5, O6, O8, O13, O16, S9 e S10. **Ficam sem entrada: O11, O14, O17, T6, T8, E4, E5, S8, S11, S12** (10 de 17). O teste de contratos passa porque verifica só o dado.
- Correção: inserir `<LeiaJunto id=... />` nos 11 cartões; estender o teste (E2E ou de componente) para provar, por painel, que cada complementar tem um link visível a partir do núcleo.

**N-2 (médio). S12 sem cobertura "n de N".** A decisão nº 13 manda S8 e S12 mostrarem a cobertura; só S8 tem (`cobertura` está só no schema de S8). Sem isso, a proporção de reincidência por sistema parece completa quando o campo é pouco preenchido. Correção: acrescentar `cobertura` ao DTO de S12 e a linha "Campo preenchido em n de N" no cartão.

**N-3 (médio). Mapa "Leia junto" provisório: o usuário precisa confirmar.** O mapa vigente em `cartoes.ts` difere do texto da decisão nº 19 porque o item exige o mesmo painel (BusinessMap por painel):

| Do cartão | Leia junto (código) | Observação |
|---|---|---|
| O3 | O5, O6, O8 | = decisão |
| O4 | O8 | = decisão |
| O10 | O11 | = decisão |
| O7 | O14 | decisão dizia T5 a O14; T5 é Tático e O14 é Operacional |
| O15 | O13, O16 | decisão incluía O17; O17 foi para a Sustentação |
| T1 | T6 | (também aponta T4, que é núcleo e não aparece) |
| T4 | nenhum visível | só aponta T1 (núcleo); decisão dizia T8 |
| T9 | T8 | decisão dizia T6, E5 |
| E1 | E5 | decisão dizia E4, E5 |
| E2 | E4 | acrescentado pelo time |
| S1 | S9, S10 | = decisão |
| S2 | S8 | |
| S3 | S12 | |
| S6 | O17 | acrescentado (O17 é da Sustentação) |
| S7 | S11 | decisão dizia S5 e S7 |
| O18, T1 a T4 | O4, T4, T1 | pares núcleo a núcleo: o `LeiaJunto` os filtra; são dado morto |

Pontos para o usuário confirmar: (a) T5 a O14 virou O7 a O14; (b) T4 a T8 não existe (T8 entra por T9); (c) S5 sem entrada para S11; (d) remover pares núcleo-núcleo do dado ou deixá-los. É hipótese do time até o usuário aprovar.

**N-4 (baixo). Coluna "Dados" do catálogo: "Da coleta" para métricas do núcleo.** Hoje o app inteiro roda com mock (design system 2.11 e aviso global). Escrever "Da coleta" pode sugerir dado real. Opções: manter "Fictícios" para todos (decisão nº 20) ou trocar o rótulo por "Fonte real disponível". Decidir com o usuário; não bloqueia.

**N-5 (baixo). O17 sem destino de "Leia junto" a partir do painel operacional** — esperado (é da Sustentação), mas a nota de O15 que sugere "causa raiz" não existe; sem ação.

### Parecer
- Resolvidos: M-1, M-2, M-3, M-4, L-2, L-3, L-7.
- Pendentes: **B-1 (via N-1)**, M-5, L-1, L-4; novos N-2, N-3 (confirmação do mapa pelo usuário), N-4.
- Não aprovo a interface para o QA final até N-1 ser corrigido e a inspeção em 375 e 1280 px ser feita.

### Atualização de 2026-10-12 (verificada no código e nos testes)
| Item | Status | Evidência |
|---|---|---|
| N-1 Leia junto | Resolvido | Commit e21aaa8. Cartões que têm complementares no catálogo exibem `LeiaJunto` (O3, O4, O10, O15, T1, T4, T5, T9, E1, S1, S2, S3, S7); O7, E2 e S6 já não têm par no catálogo. Teste `leiajunto.test.tsx` prova, por painel, os links visíveis e que as 17 são alcançadas. |
| N-2 cobertura "n de N" na S12 | Resolvido | `cobertura-S12` em `complementares/sustentacao.tsx`; E2E COMP-12. |
| L-1 link para O15 | Resolvido | `LinkO15` em O13 e O16 (âncora `#o15`; texto simples se o O15 estiver oculto). Teste `o6-o15.test.tsx` e E2E COMP-15. |
| L-4 tudo oculto | Resolvido | `MaisMetricas` mostra "N complementares ocultas pelas suas preferências"; E2E COMP-10. |
| L-7 O6 sem "Fora da meta" | Resolvido | Teste `o6-o15.test.tsx` e E2E COMP-15. |

## Acabamento (2026-10-13, branch `feature/acabamento-ux`)
| Item | Decisão | Onde |
|---|---|---|
| N-3 mapa "Leia junto" | O mapa de `cartoes.ts` já segue a decisão nº 19 (inclusive entre painéis: T4 a T8, T5 a O14, T9 a E5, O15 a O17; o link navega ao painel de destino). Os pares núcleo a núcleo (T1 a T4, T4 a T1, O18 a O4) seguem no dado e o `LeiaJunto` os filtra (guarda coberta por teste); não aparecem na tela. Confirmação final do mapa fica com o usuário no roteiro | `packages/contratos/src/cartoes.ts` |
| N-4 coluna "Dados" | Já está conforme a decisão nº 20: "Fictícios" para todos até a coleta real (tipo `dados: 'Fictícios'` em `linhas.ts`). Sem mudança | `catalogo/linhas.ts` |
| M-5 | Roteiro de validação atualizado em `05-validacao.md` para o usuário fazer no app; não bloqueia | `05-validacao.md` |

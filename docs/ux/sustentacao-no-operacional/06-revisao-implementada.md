# Revisão de UX da interface implementada: Sustentação no Operacional (K-072 e K-073)

Data: 2026-10-14. Autor: ux-designer. Branch `feature/sustentacao-no-operacional` (worktree `MetricasDSPD-sust`).

Base: `especificacao.md` (CA-1 a CA-31), `05-adendo-review.md` (A1 a A10; U1 = a, A6 = B, A9 = A) e parecer do QA `docs/qa/sustentacao-no-operacional.md` (commit testado 67624ba).

## Método e limites
- Leitura do código e dos textos em `web/src/features/operacional/` (seletor, página, Resumo completo, séries), `components/ui/FaixaAtencao.tsx`, `SeletorCadencia.tsx`, `features/sustentacao/VisaoSustentacao.tsx` e `filtros/LinhaFiltrosGuardados.tsx`.
- Não rodei servidor nem E2E, e não há capturas do QA em `docs/qa/evidencias/` para esta demanda. Tudo o que dependeu de renderização (contraste, quebras de linha, aparência do gráfico) ficou como **hipótese**, marcada abaixo.
- O que o QA mediu (axe 0 violações sérias, sem rolagem horizontal, alvos de 44 px, foco não encoberto, `prefers-reduced-motion`) não foi refeito. Os bugs SNO-001 a SNO-005 não são repetidos aqui.
- Os ajustes em andamento no react-frontend (SNO-002, SNO-004 e o texto da A6) **não estavam no código lido**: a mensagem "Suas preferências foram salvas por uma versão mais nova do sistema e não serão alteradas aqui." ainda não existe (só `fonte.ts:67` com a mensagem técnica). Fica como item de reconferência.

## 1. Conformidade com os critérios de interface
Legenda: **Código** = confirmado por leitura do código desta revisão; **QA** = confirmado pelo teste do QA; **Parcial** = cumprido com desvio listado na seção 4.

| CA | Tema | Situação | Base |
|---|---|---|---|
| 1 | Menu sem Sustentação | Conforme | QA |
| 2 | Seletor "Visão" com 4 opções, Resumo padrão, histórico | Conforme. `radiogroup` com rótulo "Visão" igual ao texto visível, marca de seleção com ícone e texto (não só cor), foco visível pelo contêiner `has-[:focus-visible]`. | Código + QA |
| 3 | Uma fonte por visão | Conforme | QA |
| 4 | Selo de fonte | Conforme. No Resumo a fonte, o frescor e a janela vêm escritos no cabeçalho de cada bloco. | Código + QA |
| 5, 6 | Filtros por visão e guardados | Conforme. A linha "continuam guardados" existe nas três visões, sem botão, como pedido. | Código + QA |
| 7 | Rodapé do cartão por fonte | Conforme | QA |
| 8, 28 | "Pede atenção" por fonte, com janela escrita | Conforme ao adendo: Resumo "Janela: últimas 12 semanas" e vazio escrito com a janela; Sustentação "Pede atenção no período" com "Período do filtro: 6 meses". Nota "Mesmo alerta, janelas diferentes" presente no Resumo. | Código + QA |
| 9 | Sem "Também nesta aba" | Conforme | QA |
| 10 | Índice e seções ocultas | Conforme | Código + QA |
| 11 a 13 | Redirecionador, hash, espera invisível | Conforme | QA |
| 14 | Preferências | Conforme no comportamento. **Pendente** o texto da A6 (ver D-07). | QA |
| 15, 30 | Exportação | Conforme. O Resumo só tem "Exportar vários painéis", com as 7 métricas dos números pré-selecionadas (`PRE_SELECAO`). | Código + QA |
| 16, 17 | Visão geral e catálogo | Conforme | QA |
| 18 | "Leia junto" O15 para O17 | Conforme no comportamento; nome acessível em SNO-002 (já aberto, em correção) | QA |
| 19 | Acessibilidade | Conforme no que o axe mede. Desvios de qualidade que o axe não pega: D-01, D-02, D-03, D-05. | QA + Código |
| 20 | Layout 375 e 1280 | Conforme no medido. Risco não medido em D-04. | QA |
| 21, 22 | Chunk e fonte sem coleta | Conforme (SNO-004 aberto) | QA |
| 23 | Resumo padrão e normalização | Conforme | Código + QA |
| 24 | Compatibilidade de links | Conforme | QA |
| 25 | Fontes separadas | Conforme. Blocos em `flex-col`, nenhum total, sem cor por fonte, O17 fora. | Código + QA |
| 26 | Números-chave | Parcial. Os 7 números, a base, a unidade, o link e o `n < 20` estão certos. O S1 não escreve o alvo (D-06). A9 conforme: "empate com <tipo>" na base, ordem fixa do O3. | Código + QA |
| 27 | Tendência | Conforme: 6 meses fechados, ponto sem valor com marcador vazado e linha "○ mês · poucos itens (n=...)", tabela com "não publicado", critério com data. Dois desvios menores de texto (D-08, D-09). | Código + QA |
| 29 | Resumo sem filtros, com preferências | Conforme | Código + QA |
| 31 | Estados por bloco | Conforme: bloco aguardando com altura reservada, erro por número e por série com "Tentar de novo", `SemDadosDaFonte` só no bloco. | Código + QA |

## 2. Textos e microcopy
Conformes e bem resolvidos:
- Títulos, janelas e vazios dos alertas seguem o adendo ao pé da letra, e a janela do Resumo sai da mesma constante que alimenta as consultas (não pode divergir do texto).
- "Poucos itens (n=14). Estatística não publicada." e "Nenhuma prioridade com 20 chamados ou mais na janela." dizem o que aconteceu e o motivo, sem culpar.
- Erros: "Não foi possível carregar este número." e "Os números e os alertas acima continuam valendo." tranquilizam e oferecem "Tentar de novo".
- Anúncios por visão dizem a fonte ("Visão Sustentação. Fonte: Acelerato.").
- Botões com verbo ("Ver na Sustentação", "Mostrar S2 nesta visita").
- Nenhum adjetivo valorativo nas frases de leitura; nenhuma meta de pessoa.

Ajustes de texto: D-06, D-08, D-09.

## 3. Acessibilidade além do que o QA mediu
- Pontos fortes: radiogroup com rótulo igual ao visível (2.5.3 ok); situação dentro/fora em texto com ícone; gráfico com `role="img"`, resumo escrito e tabela equivalente; foco devolvido ao rádio após trocar de visão; esqueletos com `sr-only` ("Carregando S2…").
- Desvios: D-01 (hierarquia de títulos), D-02 e D-03 (anúncio e foco só no seletor), D-05 (botão de tabela e leitura repetida do gráfico), mais ruído de regiões vivas no carregamento (D-05).
- Hipóteses que o axe não cobre e que não consegui medir: contraste de `text-texto-2` em `text-xs` sobre `bg-superficie-2` (D-04).

## 4. Desvios
Nenhum crítico nem alto. Todos reversíveis e de ajuste pequeno.

| ID | Sev. | Onde | Problema | Correção sugerida |
|---|---|---|---|---|
| D-01 | média | Resumo, bloco Fluxo e Sustentação: `FaixaAtencao` (`components/ui/FaixaAtencao.tsx:86-96`) dentro de `BlocoResumo` | A faixa é `section aria-label` + `h2` **dentro** de um bloco que já é `section` + `h2`. Resultado: dois `h2` irmãos ("Fluxo de projeto · BusinessMap" e "Pede atenção · ...") e uma região aninhada com nome repetido do próprio título; as séries (`h3`) ficam penduradas no bloco, mas a faixa não. Quem navega por títulos entende que "Pede atenção" não pertence ao bloco da fonte, justo o que a regra de fontes separadas quer deixar claro. | Dar à faixa a prop `nivel` (`h2` nas visões de detalhe, `h3` no Resumo). Retirar o `aria-label` redundante (o título já nomeia a região, via `aria-labelledby` do `h2`). Reconferir o 1.3.1 com axe e com a leitura de títulos. |
| D-02 | média | `OperacionalPage.tsx:121-123, 178` e links "Ver na ..." do Resumo | O anúncio `aria-live` só dispara quando a troca vem do seletor (`aoEscolher`). Voltar/Avançar do navegador, "Ver na Semanal/Diária/Sustentação" do Resumo, links da Visão geral e hash que decide a visão trocam a visão **sem anúncio**. Só o `document.title` muda, e leitor de tela nem sempre o relê. CA-19 e 7.2 pedem o anúncio "ao trocar a visão". | Disparar o anúncio por mudança da visão resolvida (efeito sobre `visao`), não pelo handler do seletor; ignorar só a montagem inicial. Manter o texto atual. |
| D-03 | baixa | Mesmo ponto: foco na troca por link | Ao chegar por "Ver S2 na Sustentação" o foco vai ao cartão (bom). Ao chegar por "Ver na Sustentação" (botão do rodapé, sem hash) o foco fica no link, que desaparece da tela (a visão troca), e o foco vai para o `body`. | Sem hash: levar o foco ao `h1` Operacional ou ao rádio da visão, com `tabIndex={-1}`. |
| D-04 | baixa (hipótese) | Resumo a 375: grade de números `grid-cols-2` (`BlocoSustentacao.tsx:51`, `BlocoFluxo.tsx:96`) | Cada cartão fica com ~130 px úteis. Rótulos como "Prioridades com mediana de restauração acima do alvo", a meta e a mensagem "Nenhuma prioridade com 20 chamados ou mais na janela. Estatística não publicada." viram 5 a 8 linhas, e com fonte a 200% palavras longas ("restauração") passam do cartão. Spec pede 2 colunas, mas o QA mediu rolagem de página, não corte dentro do cartão. Também há muito `text-xs` nos números: base, meta e leitura secundária (11 ocorrências em `resumo/`), que é informação de decisão. Não medi o contraste. | Passar para uma coluna abaixo de ~480 px (`grid-cols-1 min-[480px]:grid-cols-2`) e `break-words` nos rótulos. Subir "Base" e "Meta" para `text-sm`. Pedir ao QA uma verificação visual a 375 e fonte 200% dos 7 números e do estado "poucos itens". |
| D-05 | baixa | `SerieMensal.tsx:65-72, 97-113`; `FaixaAtencao.tsx:102-110` | (a) O botão "Ver como tabela" troca o nome **e** usa `aria-pressed`: leitores anunciam "Ver como gráfico, botão alternável, pressionado", que se contradiz. (b) O gráfico tem `aria-label` com todos os meses **e** um `figcaption sr-only` com o mesmo texto: a leitura sai em dobro. (c) No carregamento, cada faixa tem `role="status"` e a página já tem a região do anúncio: duas ou mais falas "Verificando o que pede atenção…" ao abrir o Resumo. | (a) Tirar `aria-pressed` (o nome já muda) ou fixar o nome e manter `aria-pressed`. (b) Manter só um: `aria-label` curto no `role="img"` e o resumo completo no `figcaption`, ou remover o `figcaption`. (c) Tirar o `role="status"` da faixa carregando (o `aria-busy` basta) e deixar a região viva só para falhas e para o anúncio da visão. |
| D-06 | baixa | `modelo.ts:156-171` (S1) | O número mostra "dentro/fora" (`StatusMeta`) mas não escreve o alvo, ao contrário de S2, O3, O2 e O12. A spec 5.9.2 pede "alvo em texto". Quem lê "Fora da meta" não sabe contra qual alvo. O alvo de S1 é por prioridade, por isso a omissão é compreensível, mas o texto pode dizê-lo. | Acrescentar `meta: 'Meta: mediana dentro do alvo de cada prioridade'`. |
| D-07 | baixa | Mensagem da A6 (`preferencias/fonte.ts:67`) | A decisão A6 = B pede o texto "Suas preferências foram salvas por uma versão mais nova do sistema e não serão alteradas aqui." O código ainda traz a frase técnica ("Perfil guardado em versão mais nova: não foi sobrescrito."). Em correção pelo react-frontend. | Reconferir depois da correção: o texto exato da decisão, exibido ao usuário junto da mudança de preferência, sem expor termos técnicos. |
| D-08 | baixa | `modelo.ts:287-302` (frase da série de SLA) e `SerieMensal.tsx:77` | A frase "Em setembro: 2 de 5 avaliadas." não diz o que foi contado (fora do alvo) e pode ser lida como "2 de 5 estão bem". O vazio "nenhum dos últimos 6 meses atinge 20 itens" diz "itens" também na Sustentação, onde a regra é "20 chamados por prioridade". | Para o SLA: "Em setembro: 2 de 5 prioridades avaliadas estão abaixo de 90%." Vazio da Sustentação: "nenhuma prioridade teve 20 chamados ou mais em nenhum dos últimos 6 meses." |
| D-09 | baixa (documentação) | `especificacao.md` 5.9.3 | A spec diz que a série da Sustentação conta "pela data de fechamento do chamado (S1/S2/S3)". A implementação conta o volume por data de **abertura** ("a base do S3", texto escrito na tela e verificado pelo QA: volume do mês = S3 do mês). Não é defeito de interface: a spec é que ficou defasada. | Corrigir a spec 5.9.3 para "volume por data de abertura (base do S3); S1 e S2 por fechamento". Sem alteração de código. |

## 5. Decisões já tomadas e respeitadas
U1 = (a), A6 = B e A9 = A não foram reabertas. A janela do alerta (12 semanas no Resumo, filtro de período na Sustentação) está escrita nos dois lugares, com a nota de divergência e o link.

## 6. Veredito
**Aprovado com ressalvas.** A interface cumpre a especificação validada e o adendo: separação de fontes, janelas escritas, estados por bloco, textos e comportamentos dos CA. Não há desvio crítico nem alto, e nada bloqueia a entrega.

Antes do merge, recomendo apenas **D-01** (hierarquia de títulos) e **D-02** (anúncio da troca de visão por qualquer caminho), porque tocam CA-19 e a clareza da regra de fontes. D-03 a D-09 podem ir para a fila de melhorias, com D-07 reconferido após a correção em curso e D-09 resolvido só na documentação.

Reconferência pelo UX depois das correções em andamento: SNO-002 (nome acessível do "Leia junto" deve começar pelo texto visível), SNO-004 (CLS do Resumo) e D-07.

## 7. Reconferência (2026-10-14)
Base: código da worktree `MetricasDSPD-sust` no commit 9ab5ece (leitura dos arquivos; não rodei servidor nem testes, e o `git diff` não pôde ser executado neste ambiente: conferi o estado final dos arquivos, não o diff). Evidência visual e de leitor de tela continua fora do alcance desta reconferência.

| Item | Situação | Evidência no código |
|---|---|---|
| D-01 hierarquia de títulos | Feito | `FaixaAtencao` ganhou `nivel?: 'h2' \| 'h3'` (`FaixaAtencao.tsx:58,73-75`); `BlocoFluxo.tsx:88` e `BlocoSustentacao.tsx:36` passam `nivel="h3"`; o `aria-label` redundante saiu e a região usa `aria-labelledby` do título (linha 92). |
| D-02 anúncio por qualquer caminho | Feito | `OperacionalPage.tsx:128-129`: o anúncio sai da visão resolvida, não do handler do seletor; a montagem inicial não anuncia. Região única `role="status"` permanente (linha 197). |
| D-03 foco ao trocar por link sem hash | Feito | `OperacionalPage.tsx:141-142`: `h1.tabIndex = -1` e `focus({ preventScroll: true })`. |
| D-04 grade de números a 375 | Pendente, vai para o K-075 | `BlocoSustentacao.tsx:52` e `BlocoFluxo.tsx:97` ainda em `grid-cols-2`; `text-xs` em Base e Meta (`NumeroChave.tsx:84-85`). Hipótese não medida. |
| D-05 (a) botão da tabela | Feito | `aria-pressed` não existe mais em `SerieMensal.tsx`; só o nome do botão alterna ("Ver como gráfico" / "Ver como tabela"). |
| D-05 (b) leitura em dobro do gráfico | Feito | `aria-label={titulo}` curto no `role="img"` (linha 102) e o resumo completo só no `figcaption` (linha 114). |
| D-05 (c) falas repetidas no carregamento | Feito | `FaixaAtencao` carregando usa só `aria-busy` (linha 112); sem `role="status"` na faixa. |
| D-06 alvo do S1 | Feito | `modelo.ts:167`: `meta: 'Meta: mediana dentro do alvo de cada prioridade'`. |
| D-07 / A6 texto da mensagem | Feito | `PreferenciasPage.tsx:186-190`: "Suas preferências foram salvas por uma versão mais nova do sistema e não serão alteradas aqui.", com `role="alert"`, ícone e texto, sem termo técnico. Teste correspondente em `preferencias.test.tsx:148-158`. A frase técnica sobrevive só na mensagem interna do erro (`fonte.ts:31`), que não vai à tela. |
| D-08 frases de leitura | Feito | `modelo.ts:288-294`: "Em setembro: 2 de 5 prioridades avaliadas estão abaixo de 90%." (com concordância "está/estão"). O vazio da Sustentação diz "nenhuma prioridade teve 20 chamados ou mais em nenhum dos últimos 6 meses" (`TendenciaSustentacao.tsx:42`). |
| D-09 data da série | Feito (documentação) | Spec 5.9.3 corrigida hoje: volume por abertura, aderência por fechamento; histórico na seção 14 da especificação. |
| SNO-002 nome acessível do "Leia junto" | Feito | `LeiaJunto.tsx:46-66`: o texto visível é "`<código> <rótulo>` · visão X, fonte Y" e o nome acessível começa pela mesma sequência e só acrescenta a explicação do destino ao final. Atende ao 2.5.3 (rótulo no nome). |
| SNO-001 cabeçalho a fonte 200% | Pendente, vai para o K-075 | Não verificável por leitura; exige medição visual. |

Observação sobre D-05 (c): a região viva única da página fica como único canal de voz no carregamento; os erros por bloco seguem com `role="alert"` próprio, o que está correto.

### Veredito final (antes do SNO-001)
**Aprovado.** Os desvios D-01, D-02, D-03, D-05 a D-09 estão corrigidos, e a mensagem da A6 e o SNO-002 estão conforme a decisão e o 2.5.3. Nenhum item novo foi encontrado nas partes lidas. Ficam **D-04 e SNO-001 para o K-075**, ambos de severidade baixa e dependentes de medição visual a 375 e fonte 200%; não bloqueiam o merge. A reconferência do SNO-004 (CLS) não foi feita aqui, por depender de medição no Lighthouse.

## 8. SNO-001: efeito a 375 px (2026-10-15)
Base: leitura do código da worktree após o commit 26ad55b. Não rodei servidor e **não consegui executar `git show`/`git diff` neste ambiente**: avaliei o estado final dos arquivos, não o diff, e não sei quais `flex-wrap` e quais ajustes do seletor são do commit e quais já existiam. Medidas de largura abaixo são estimativas de leitura, marcadas como hipótese.

### O que mudou de fato
Com `body { min-width: min(20rem, 320px) }`, o piso deixa de dobrar com a fonte a 200% (640 px). A página passa a ter 375 px de largura útil, e tudo o que antes "cabia" porque a página tinha 640 px agora precisa quebrar linha. Efeito colateral inevitável e correto (1.4.4 e 1.4.10): telas fora do pedido ficam **mais altas e mais estreitas** com fonte a 200%. A 100% de fonte nada muda (piso de 320 px é o mesmo). Atenção: com 200% o `px-4` do `main` (rem) já consome 64 px dos 375, restando cerca de 311 px.

### Avaliação por ponto (375 px, fonte a 200%)
| Ponto | Leitura do código | Situação |
|---|---|---|
| Cabeçalho (`AppShell.tsx:102-127`) | `flex-wrap` nos três níveis; logo com `whitespace-nowrap` (cerca de 250 px a 200%, cabe em 311); Menu, aviso de dados fictícios e tema vão para linhas seguintes. Abaixo de `md` não é sticky, então a altura extra não cobre o conteúdo. Sem estouro. | Aceitável. MOB-CA-9 (uma linha de até 56 px) vale a 100% e não é possível a 200%; a quebra é a degradação certa. Hipótese: o tema continua no cabeçalho (`SeletorTema` sem `hidden`), de modo que o cabeçalho pode já quebrar em 2 linhas a 100%; o MOB-CA-9 não parece entregue nesse ponto, mas isso não vem do SNO-001 e não foi medido. |
| Seletor 2x2 abaixo de 400 px (`SeletorCadencia.tsx:36-43`) | Grade de 2 colunas de `minmax(0,1fr)` com `px-3` e `text-sm` em rem. Cada coluna fica com cerca de 155 px, menos 48 px de padding e, no item marcado, cerca de 40 px de ícone: sobram 65 a 107 px para palavras de 105 a 165 px ("Semanal", "Sustentação"). `[overflow-wrap:anywhere]` impede o estouro. O breakpoint `min-[400px]` é em px de viewport e não acompanha a fonte. | Funciona sem rolagem horizontal, mas **degrada a legibilidade** (ver "Sustentação" abaixo). |
| Ações com quebra: T3, S3 e Motivos | T3: `fieldset flex-wrap` com "Contar por:", dois rádios com `alvo` e a Dica; S3 e Motivos: `div flex-wrap` de botões `alvo`. Todos quebram em linhas e mantêm alvo de 44 px (toque) ou 24 px. Sem `min-w-0` no `fieldset` do T3, mas o conteúdo é feito de texto que quebra, então o `min-content` é uma palavra. | Conforme. T3 vira 2 a 3 linhas dentro do cabeçalho do cartão; aceitável. Hipótese: confirmar visualmente que o `fieldset` não impõe largura mínima. |
| `FaixaAtencao` (`FaixaAtencao.tsx:137-172`) | Lista `flex-wrap`; cada item é `inline-flex flex-wrap` com `span min-w-0` para o texto e o link "Ver X" que desce para a linha seguinte quando falta espaço. Item de alerta ocupa a largura toda e cresce em altura. | Conforme, e é o ponto que mais se beneficia da correção. MOB-CA-8 (título do primeiro alerta visível na primeira tela) é medido a 100% e não se aplica a 200%. |
| Faixa de calibração (`Calibracao.tsx:92-105`) | `flex-wrap`, mas o parágrafo é `min-w-0 flex-1` (base zero): fica ao lado do ícone, numa coluna de cerca de 220 px, e o link "Saiba mais" desce sozinho. O texto de cerca de 190 caracteres vira uma coluna estreita de mais de 10 linhas. | Sem estouro e legível, porém **pouco elegante**. Fix pequeno: dar ao parágrafo `basis` mínimo (ex.: `min-w-[12rem]`) para ele descer sob o ícone. Hipótese de medição. |
| `CartaoEI` com `auto-fit` (`CartaoEI.tsx:126`) | `minmax(6rem,1fr)`: 6 rem vira 192 px a 200%, e com o cartão útil de cerca de 245 px a grade cai para **1 coluna** (3 números empilhados). A 100% (96 px mínimos), com cerca de 295 px úteis, são 2 colunas mais 1, ou 3 apertadas: não mudou. | Esperado e correto: antes a página de 640 px dava 3 colunas. Mais alto, mas lê melhor. Sem ação. |
| "Sustentação" quebrando no meio da palavra | Consequência direta de `[overflow-wrap:anywhere]` no rótulo do seletor com a coluna estreita (acima). Acontece no item marcado (ícone ocupa espaço) e, provavelmente, em "Sustentação" também desmarcado. | **Não é falha de WCAG** (1.4.4 e 1.4.10 cumpridos: nada se perde, nada rola), mas é a palavra mais importante da demanda e o primeiro controle da tela. Quebra no meio da palavra prejudica a leitura, sobretudo para quem usa a fonte ampliada por necessidade. O 2.5.3 segue cumprido: o nome acessível é o texto inteiro. |

### Veredito
**Aprovado para merge do SNO-001. Nada bloqueia agora.** A correção cumpre o que o bug pede (sem rolagem horizontal a 375 px e 200%), não altera a aparência a 100% e as telas "fora do pedido" só ficaram mais altas, sem perda de conteúdo nem de função. Os efeitos listados são de acabamento.

**Bloqueia agora:** nada.

**Vai para o K-075 (severidade baixa, em ordem de valor):**
1. **Seletor de Visão a 200%.** Trocar `grid-cols-[repeat(2,minmax(0,1fr))]` por uma grade que dependa do espaço em vez de px, por exemplo `grid-cols-[repeat(auto-fit,minmax(min(100%,7.5rem),1fr))]` (2x2 a 100% e 375 px, 1 coluna a 200%), mantendo o 2x2 do MOB-CA-12 a 100%. Alternativa mais simples: `px-2` e sem `mr-1` no ícone abaixo de 400 px. Medir visualmente que "Sustentação" e "Semanal" não quebram.
2. **Faixa de calibração:** dar base mínima ao parágrafo para que ele desça sob o ícone em vez de formar coluna estreita.
3. **Cabeçalho a 100% em 375 px:** medir altura e número de linhas e comparar com o MOB-CA-9; decidir se o tema sai do cabeçalho (decisão do usuário se mudar a spec).
4. **Tablet (768 a 1023 px) a 200%:** o cabeçalho é `md:sticky` e pode ficar alto; conferir que cabeçalho mais barra de filtros não passam de cerca de 40% da altura e que o foco não fica coberto (2.4.11). Hipótese não medida.
5. Reconferir D-04 (grade de números do Resumo a 375) nessa mesma rodada, pois o piso novo muda o cálculo de largura dos cartões.

**Riscos:** (a) minhas estimativas de largura vêm de leitura, sem render; o K-075 deve começar por capturas a 375 px, 200% e 100% das telas Resumo, T3, S3, Motivos e do cabeçalho. (b) Sem o diff, não separei o que o commit alterou do que já existia. (c) O breakpoint em px do seletor não acompanha a fonte; se alguém voltar a usar rem aqui, o 2x2 muda a 100%.

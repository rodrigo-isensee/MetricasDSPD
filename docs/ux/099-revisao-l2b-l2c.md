# 099 - Revisão da interface do L2b e L2c (E2.17)

Branch `fix/099-l2b-apaga-simulado`, head pedido `456e103e`. Base: ADR 0030 (nada simulado na web) e `docs/ux/099-textos-sem-simulado.md` (o que vem no L4).

## Veredito

**Aprovado com ressalvas.** O selo "Simulado" saiu do código de interface, e o cartão sem dado real mostra "Sem dado real" com ícone, texto e motivo, sem depender de cor. Não há achado crítico nem alto. Há três achados médios (um deles já planejado no L4) e quatro baixos.

## Método e limite desta revisão

- Li o código da worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b` (Read e Grep). Esta sessão não tinha shell: **não rodei `git diff 58882fcf 456e103e`, não confirmei o sha da worktree e não executei testes**. A conferência do que mudou é por busca no estado atual dos arquivos; o que os testes provam é o que li neles, não saída de execução.
- Acessibilidade: todos os itens abaixo são `lido`. Nada foi `medido` (o QA mede com `@axe`).

## O que foi conferido

| # | Verificação | Resultado | Como |
|---|---|---|---|
| 1 | Nenhum componente fala em "Simulado" nem tem `SeloSimulado`, `selo-simulado`, `simulavel` | Passa | `lido`: busca por `simulad`, `simulav`, `SeloSimulado` em `web/src` (componentes, features, dados, CSS e HTML). Os únicos achados são o simulador de estados de dev (`?mock=erro`, `useErroDePainelSimulado`) e testes que afirmam a ausência do selo |
| 2 | `CartaoMetrica` sem ramo do selo | Passa | `lido`: a linha de selos tem base, janela, calibração, `p.selos` e `SeloOrigem`; `SeloOrigem` só renderiza o selo "Dados fictícios" quando `origem.ficticio` (só na fonte mock) |
| 3 | Estado sem dado real claro | Passa | `lido`: `EstadoSemDadoReal` tem ícone `info` + "Sem dado real" + "Motivo: ..." em texto; sem número, percentil nem histograma; sem "Tentar de novo" (não é erro) |
| 4 | Mesmo padrão nas variantes | Passa | `lido`: `NumeroChave` (resumo), `FaixaAtencao`, `VisaoGeralPage` e `TendenciaFluxo/Sustentacao` usam o mesmo par "Sem dado real" + "Motivo" |
| 5 | Teste cobre a ausência do selo na tela | Passa | `lido`: `composicao.test.tsx` (L49-68) afirma que nenhum cartão do Operacional mostra `/Simulado/i` nem `data-testid` com "simulado"; `origem.test.tsx` afirma ausência do `selo-ficticio` no cartão sem dado real |
| 6 | Nada órfão: alvo de 44px, legenda | Passa | `lido`: nenhum `min-h-11` ou classe `alvo` estava presa ao selo; o botão "Ocultar" mantém `alvo`. Nenhuma legenda ou token de CSS do selo restou |
| 7 | Espaço do selo | Ressalva | Ver B-3 |

## Achados

### Médio

**M-1. O catálogo ainda diz que todos os dados são "Fictícios".**
Onde: `web/src/features/catalogo/CatalogoPage.tsx:30`, `linhas.ts:14-15,39` e `catalogo.test.tsx:79-91`.
Por quê: contradiz o ADR 0030 e a tela: um cartão com dado real aparece na página como "Fictícios". É a única fala de "fictício" que o usuário comum ainda lê no uso diário.
Correção: já está no L4 (`099-textos-sem-simulado.md`, seção Catálogo: "Real" ou "Sem dado real"). Nada a pedir neste lote; só **não liberar o L4 depois do lote** sem esse item, porque a tela fica incoerente até lá.

**M-2. As notas dos cartões ainda falam em "mock" e "fictícios".**
Onde: `web/src/features/tatico/notas.ts:31` ("Valores de acordo no mock são fictícios") e as outras sete notas listadas no L4 (OP-21, TA-16, TA-18a/b, ES-11, ES-12a/b).
Por quê: o texto contradiz o estado "Sem dado real" no mesmo cartão.
Correção: L4 já planejado, com texto pronto. Nenhuma ação extra.

**M-3. A fonte `mock` mantém o selo e o aviso "Dados fictícios" (decisão pendente de escopo, não defeito do L2b/L2c).**
Onde: `Ficticios.tsx` (`SeloFicticio`, `SeloOrigem`), `AvisoDadosFicticios.tsx`, `Rodape.tsx`, título do documento "· Dados fictícios" em `AppShell.tsx:76`, e `VITE_FONTE=mock` em `App.tsx`.
Por quê: o pedido 099 tirou "Simulado"; "Dados fictícios" é outro rótulo, ligado à fonte mock, que só liga com `VITE_FONTE=mock` explícito (pedido 060) e nunca na API real. O ADR 0030 diz "nada simulado na web". Se isso inclui o modo mock de desenvolvimento e E2E, esse caminho ainda existe e inclui `MockFonteMetricas`.
Correção: **pergunta ao dono** (`R-DECISAO`), uma só: o modo `mock` (dev e E2E) continua existindo, com seu aviso "Dados fictícios", ou também sai da web? Recomendação: manter como está neste lote (é o que sustenta os testes e o E2E, e nunca aparece na API real) e tratar a retirada do mock como pedido próprio, se o dono quiser. Sem decisão, nada muda.

### Baixo

**B-1. O motivo padrão é genérico.** `SemDadoRealErro.ts:20` devolve "fonte real ainda não definida" quando o erro não traz motivo. Cumpre "o motivo" no mínimo, mas não diz o que falta nem quando. Correção: se o back-end passar a mandar motivo por cartão (a varredura do 099 aponta os campos a configurar), o texto sai de lá; nenhum ajuste de interface agora.

**B-2. O motivo no número-chave do resumo está em `text-xs` (12px).** `NumeroChave.tsx:65`. O motivo é a parte que o usuário precisa ler para saber o que fazer; em 12px com `text-texto-2` fica pequeno. Correção: usar `text-sm` como em `EstadoSemDadoReal`. Contraste do `text-texto-2` sobre a superfície: `lido`, sem medição (o QA mede).

**B-3. A linha de selos do cabeçalho do cartão reserva `min-h-6` (24px) sempre.** `CartaoMetrica.tsx:239`. Com o selo fora, um cartão sem base, sem janela e sem calibração mostra uma faixa vazia de 24px sob o título (hipótese: não vi a tela renderizada). O comentário original reserva a altura "para não saltar ao carregar", o que ainda faz sentido quando há base; sem base nem selo, a faixa só empurra o conteúdo. Correção: manter a reserva só quando `p.base` existir (ou conferir na tela e aceitar). Verificar no QA visual.

**B-4. Estado sem dado real não é anunciado por leitor de tela quando o cartão muda de estado.** `EstadoSemDadoReal.tsx` não tem `role="status"` nem região viva. Na carga inicial é lido na ordem do documento; se o cartão passar de carregando para "sem dado real" depois de uma troca de filtro, quem usa leitor de tela não é avisado. Correção sugerida: `role="status"` no bloco, sem `aria-live` agressivo (o erro já usa `role="alert"` na Visão Geral). `lido`; o QA confirma com leitor/`@axe`.

### Nota de higiene (sem severidade)

`components/ui/Ficticios.tsx` guarda agora só `SeloFicticio` e o contexto de origem; o nome do arquivo e o comentário "Dado fictício (com o motivo...)" ficaram antigos. Renomear junto com o que o dono decidir em M-3.

## Estados do cartão (conferência da lista da skill)

| Estado | Situação |
|---|---|
| Carregando | Esqueleto com `aria-busy`; inalterado |
| Vazio | `EstadoVazio`; inalterado |
| Erro | `EstadoErro` com "Tentar de novo"; separado do sem dado real (correto: não é falha) |
| Sem dado real | Ícone + "Sem dado real" + "Motivo: ..."; sem cor como único sinal |
| Sucesso | Inalterado |
| Sem permissão | Não se aplica a este lote |

## Heurísticas (resumo)

- Visibilidade do status: o estado diz o que é e o porquê (ok); B-4 para quem usa leitor de tela.
- Correspondência com o mundo real: "Sem dado real" é a mesma frase em todo lugar (ok).
- Consistência: M-1 e M-2 são a única inconsistência restante, já com texto pronto no L4.
- Prevenção de erros: o usuário não pode mais confundir número de exemplo com dado real na API (ganho principal deste lote).

## Perguntas ao dono

1. M-3: o modo `mock` (dev e E2E), com o aviso "Dados fictícios", segue existindo? Recomendação: sim, por ora; retirada em pedido próprio.

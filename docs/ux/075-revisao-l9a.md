# 075: revisão de interface do lote 9a (O1, O2 e coluna "Bloqueado")

Autor: ux-designer, 2026-11-11. Etapa E1.10. Base: worktree `/home/rodrigoisensee/MetricasDSPD-056` (branch `feature/075-9a`), contra `docs/ux/075-bloqueios-reais.md`. Método: leitura do código (nenhuma medição de ferramenta; todo item de acessibilidade abaixo é `lido`). Arquivos lidos: `CartaoO1.tsx`, `CartaoO2.tsx`, `CartaoComplementar.tsx`, `MotivoBloqueio.tsx`, `TabelaDados.tsx`, `Icone.tsx`.

## Veredito
**Aprovado com ressalvas.** O2 e a coluna "Bloqueado" seguem a especificação e não carregam mais o texto antigo. No O1 sobra o ramo de texto "sem dado real" para `bloqueados === null` (achado 1, médio): é o estado nulo, coerente com "null nunca vira 0", mas é exatamente o texto que o lote devia tirar da tela. Decisão do dono ou do tech-lead sobre manter ou remover. Nenhum achado crítico ou alto.

## Conferência contra a especificação
| Item | Resultado |
|---|---|
| O2: coluna "Bloqueado" mostra o motivo, "—" quando não bloqueado, sem "Sem dado real" | Conforme (`CartaoO2.tsx:206`). |
| CA-1: "não classificado" em itálico, cor neutra e ícone | Conforme (`MotivoBloqueio.tsx:8-11`); ícone `info`, `aria-hidden` por padrão do `Icone` (`Icone.tsx:40`), lido. |
| Texto de apoio visível, ligado à tabela por `aria-describedby` | Conforme (`CartaoO2.tsx:208-214`, `TabelaDados.tsx:38`); só aparece quando há linha não classificada entre as 10 exibidas (bom: evita ruído). Texto idêntico ao da especificação. |
| CA-2 (ordem com "não classificado" por último) | `ordenarMotivos` existe e está correta; não é usada no O1 nem no O2 (O2 não tem distribuição por motivo, nota de 06/11). Aplicável ao O19, fora deste lote. |
| CA-3: leitura "por motivo não classificado" | `textoMotivo` correto; é do cartão BLOQUEADOS, fora deste lote. A leitura do O1 e do O2 não cita motivo. |
| CA-5: sem pessoa, autor ou comentário | Conforme: O1 e O2 não exibem campo de pessoa; colunas do O2 inalteradas. |
| CA-7: série do O1 com faixa e linha de mudança de critério | `marcacoes={d.criterios.serie}` repassa a marcação (`CartaoO1.tsx:133`). A série plota só WIP e limite, não bloqueados; a lacuna "sem ponto, nunca zero" não se aplica a esse gráfico. |
| O1: barras com série "Bloqueados" distinguida por hachura e rótulo, não só cor | Conforme (`CartaoO1.tsx:19-24`). |
| Texto antigo | Ver achado 1; fora do O1, nenhuma ocorrência em `web/src` fora de testes e dos estados genéricos (`EstadoSemDadoReal`, `FaixaAtencao`, exportação), que são de outras métricas. `CartaoComplementar.tsx` não tem ramo de bloqueio. |

## Achados
1. **Médio. O1 mantém o ramo "sem dado real" de bloqueio.** `CartaoO1.tsx:37` (frase de leitura "bloqueados: sem dado real"), `:106-110` (parágrafo `o1-bloqueados-sem-dado`: "Bloqueados: sem dado real. O WIP total e o limite seguem valendo."), `:11-26` (barras sem a série). Ocorre quando `hoje.bloqueados === null`; o contrato ainda aceita `null` (`schemas.ts:55-82`) e o id da nota segue em `NOTA_CARTAO_IDS` até o 9b. Com a API real já calculando, o ramo não aparece, mas qualquer resposta com `null` (interruptor desligado, CA-12) volta ao texto antigo, e o QA/teste `bloqueio-sem-dado.test.tsx` W2 só prova o caminho com dado. Correção: manter o ramo como falha segura é defensável (CA-12 pede "Sem dado real" com o interruptor desligado, e "null nunca vira 0"); então registrar a decisão e remover o ramo junto com o `null` do contrato no 9b, com teste cobrindo o `null` hoje. Se o dono quer a web sem o texto, remover agora.
2. **Baixo. O1 decide "sem bloqueio" só por `hoje.bloqueados`** (`CartaoO1.tsx:34`). Se `hoje` vier com número e uma coluna com `null`, a barra daquela coluna sai só com "Em progresso" sem aviso (sem contradição numérica, mas silencioso). Correção: manter, ou sinalizar a coluna. Hipótese: improvável, pois o servidor calcula tudo junto.
3. **Baixo. O2: a forma "anel" substitui a de situação** (`CartaoO2.tsx:75-82`). Item bloqueado e acima do P95 aparece como anel e perde o triângulo; a tabela ao lado mantém a "Situação", então a informação não se perde, mas o gráfico some com o alerta. Anterior ao lote; correção opcional: anel com a cor/traço da situação, ou nota na legenda.
4. **Baixo. O2: legenda "anel: bloqueado" sempre presente** (`CartaoO2.tsx:127-132`), mesmo sem nenhum item bloqueado. Correção: omitir a entrada quando `doTipo` não tem bloqueados.
5. **Baixo. Apoio do O2 em `text-xs`** (12 px, `CartaoO2.tsx:211`). Texto de ajuda essencial para entender "não classificado"; recomendável `text-sm` como os demais apoios do cartão (`text-sm text-texto-2`). Contraste do `text-texto-2` sobre a superfície: `lido` (token do tema, não medido); o QA mede (`@axe`).
6. **Baixo. "—" na coluna Bloqueado** é lido por leitores de tela de forma irregular. Correção: texto visível "não" ou `<span class="sr-only">não bloqueado</span>`.
7. **Baixo. Serie `serie[].bloqueados` não é plotada no O1.** A especificação (seção 3) fala em "série do O1 (bloqueados ao longo do tempo)"; hoje o gráfico é de WIP, e o dado real de bloqueio na série não chega à tela. Confirmar com o dono se a série de bloqueados entra em outro lote; sem isso, CA-7 vale só pela marcação de critério.

## Acessibilidade (WCAG 2.2 AA), todos `lido`
- Não depender só de cor: "não classificado" tem texto, itálico e ícone; barras de bloqueados têm hachura. Conforme.
- Ícone decorativo com `aria-hidden`; apoio associado à tabela. Conforme.
- Contraste 4,5:1 do texto neutro: não medido; QA mede.
- Teclado e foco: nenhum controle novo no lote; os botões de ordenação seguem `aria-pressed`. Conforme.

## Pendências para o dono
- Achado 1 (manter ou remover o texto nulo no O1) e achado 7 (série de bloqueados do O1).

# 075: bloqueios reais na tela de bloqueados e no O5 (E3.2)

Autor: ux-designer, 2026-11-06. Especificação curta, sem protótipo (a mudança reaproveita componentes existentes; decisão do dono nas P-075-3 e P-075-6, "A"). Base lida na develop (056d, f21220fe): `CartaoBloqueados.tsx`, `AvisoCriterio.tsx`, `CartaoO5` em `complementares/fluxo.tsx`, `MOTIVOS_BLOQUEIO` e `MarcacaoCriterio` em `packages/contratos/src/comum.ts`. Desenho técnico em `docs/analises/075-desenho.md`.

Nota (2026-11-06): a distribuição por motivo saiu do O2 pela decisão técnica de 14:20 (opção B de `docs/analises/075-o2-distribuicao.md`); ela fica só no O19. As menções à distribuição do O2 nas seções 1 e 4 e nas necessidades de dados não valem mais; CA-2 e CA-4 foram ajustados.

## Objetivo
Quando a coleta gravar bloqueios (via A), a tela de bloqueados, o O1, o O2 e o O5 saem de "Sem dado real" e mostram o dado, sem enganar: motivo sem classificação aparece como "não classificado" e o histórico incompleto vem marcado. Nenhuma pessoa, nenhum ranking.

## 1. Motivo "não classificado" (P-075-3)
**Onde aparece:** coluna "Motivo" da tabela de bloqueados (O1), a distribuição de bloqueios por motivo do O2 e qualquer legenda ou filtro por motivo (O19, T12, se entrarem pela P-075-8). Hoje a coluna imprime `i.motivo` cru; o valor novo precisa de rótulo no contrato (o enum `MOTIVOS_BLOQUEIO` tem 7 valores; o 8º é "não classificado", decisão do software-architect/back-end, UX só fixa o texto).

**Texto:** exatamente `não classificado`, em minúsculas e sem aspas, como os demais motivos são exibidos. Não usar "desconhecido", "outro" nem "erro".

**Ordem:** nas listas, a ordem atual não muda (tabela: do mais antigo ao mais novo). Em distribuição por motivo (barras ou legenda), ordenar por quantidade decrescente e **"não classificado" sempre por último**, mesmo se for o maior, para não parecer um motivo de negócio. Ele conta no total.

**Marca sem depender só de cor:**
- Texto "não classificado" em cor neutra (`text-texto-2`), itálico, mais o ícone `alerta` ou `info` existente (`Icone`) antes do texto. Itálico e ícone carregam o sentido; a cor só reforça.
- Em barras: padrão hachurado (ou contorno tracejado) mais o rótulo na legenda; nunca uma cor de alerta (vermelho/laranja), porque não é um problema do time e sim lacuna de configuração.
- Tooltip/ajuda (via `title` não basta; usar o texto de apoio abaixo da tabela, visível): "Motivo ainda sem classificação. O mapa dos motivos do quadro será definido pelas pessoas; até lá o bloqueio conta, mas sem motivo de negócio."

**Acessibilidade:** o ícone é decorativo (`aria-hidden`) porque o texto já diz tudo; o texto de apoio fica associado à tabela por `aria-describedby`; contraste do texto neutro mínimo 4,5:1; a leitura em texto do cartão ("O mais antigo está bloqueado há X por "não classificado"") precisa soar natural: ajustar para `por motivo não classificado` quando for esse o valor (CA-3). Sem filtro por motivo cuja única opção seja "não classificado" (evita filtro inútil).

**Sem pessoa:** a tabela mantém as colunas atuais (Card, Tipo, Etapa em que bloqueou, Motivo, Fornecedor, Bloqueado há). Nada de "quem bloqueou", autor ou comentário do bloqueio.

## 2. Precisão do "bloqueado há" (consequência da P-075-2)
O início do bloqueio é o instante da coleta que viu a mudança, então "bloqueado há N dias úteis" tende a subestimar. Texto de apoio fixo sob a tabela, uma linha: "O início do bloqueio é a data da coleta que o viu; pode ser posterior ao início real." Sem coluna nova, sem selo por linha. (Hipótese: o texto resolve a necessidade do item (b) do desenho §4; confirmar com o dono na validação da tela.)

## 3. Histórico parcial no O5 e na série do O1 (P-075-6)
**Reaproveitar, sem componente novo:** o `AvisoCriterio` já existente, alimentado por uma nova `VersaoCriterio` (T2.6) "bloqueio com dado real a partir de AAAA-MM-DD". A `descricao` da marcação carrega o aviso, por exemplo: "histórico parcial de bloqueios: só há dado a partir de AAAA-MM-DD (primeira coleta com bloqueio); antes disso o tempo bloqueado é desconhecido." Assim a faixa e o link "Ver mudanças de critério" funcionam como hoje, e a marca aparece também em `/ajuda#criterios` e no `MudancasCriterio`.

**Onde:**
- **O5:** faixa `tipo="janela"` acima das barras, enquanto a janela de 12 semanas contiver dias anteriores à data. Texto atual já serve ("A janela de 12 semanas inclui dados anteriores à mudança de critério de DD/MM/AAAA"), seguido da linha da marcação com "histórico parcial". Some sozinha quando a janela inteira for posterior à data (12 semanas depois).
- **Série do O1 (bloqueados ao longo do tempo):** faixa `tipo="serie"` ("Esta série atravessa uma mudança de critério. Não compare antes e depois diretamente.") mais a linha vertical de mudança de critério já desenhada nos gráficos (`SerieLinhas`/`GraficoMensal`) na data. Antes da linha o gráfico não plota zero: o trecho anterior à primeira coleta fica **sem ponto** (lacuna), nunca como 0 bloqueados.
- **Degrau esperado no O5:** o percentual tende a cair (tempo bloqueado sai da execução). A faixa deve ser visível antes do gráfico, não só na ajuda; o texto "Não compare antes e depois" já cobre.

**Cuidado de leitura:** "histórico parcial" é diferente de "mudou a fórmula". Por isso a `descricao` começa com "histórico parcial" (visível no mesmo `li` da faixa, em ponto de leitura de leitor de tela como lista). Se o dono preferir distinção visual própria, é uma extensão pequena do `AvisoCriterio` (um `tipo="parcial"`), não componente novo; fica como opção, não como requisito.

## 4. Mínimo de 20 itens e estados
- **O5:** continua por tipo; tipo com menos de 20 itens não publica (`AmostraInsuficiente`: "Eficiência de fluxo: amostra insuficiente, N de 20 itens"). Com histórico parcial o N cresce devagar: o texto atual vale, e **a faixa de histórico parcial aparece mesmo quando o cartão está em "insuficiente"**, para explicar por que a amostra é pequena ("só há bloqueio desde AAAA-MM-DD"). Se nenhum tipo tem 20: leitura atual "Nenhum tipo tem 20 itens: a eficiência não é publicada."
- **Tela de bloqueados:** é lista do instante, não estatística: não tem mínimo de 20. Zero bloqueados continua sucesso ("Nenhum item bloqueado hoje.").
- **Antes da primeira coleta com bloqueio / interruptor desligado:** continua "Sem dado real" (comportamento da 065), até a prova de linhas em `fato_bloqueio` > 0 (desenho §7 R6).
- **Carregando / erro:** inalterados (`CartaoMetrica`).
- **O2 (motivo do bloqueio) com poucos bloqueios:** mostrar contagem, sem percentuais; se nenhum motivo classificado, só a barra "não classificado" com o texto de apoio.

## Necessidades de dados (para o back-end)
- Valor de motivo "não classificado" no contrato de BLOQUEADOS, O2 (e O19/T12 se entrarem), distinto dos 7 do briefing.
- `MarcacaoCriterio` com a data e a descrição de "histórico parcial" nas respostas de O1 (série), O2, O5 e BLOQUEADOS.
- Data da primeira coleta com bloqueio (pode ser a própria data da marcação) para a lacuna da série do O1.
- Nenhum campo de pessoa, autor, comentário ou nome de quem bloqueou.

## Microcopy
- Motivo: `não classificado`.
- Apoio da tabela de motivo: "Motivo ainda sem classificação. O mapa dos motivos do quadro será definido pelas pessoas; até lá o bloqueio conta, mas sem motivo de negócio."
- Apoio do "bloqueado há": "O início do bloqueio é a data da coleta que o viu; pode ser posterior ao início real."
- Marcação: "histórico parcial de bloqueios: só há dado a partir de DD/MM/AAAA; antes disso o tempo bloqueado é desconhecido."
- Leitura do cartão: `... está bloqueado há N dias úteis por motivo não classificado.`

## Critérios de aceite
- `CA-1` QUANDO um bloqueio tem motivo sem mapa O SISTEMA DEVE exibir o texto "não classificado", em itálico, com ícone, na coluna Motivo e na distribuição por motivo.
- `CA-2` QUANDO a distribuição por motivo do O19 tem "não classificado" O SISTEMA DEVE posicioná-lo por último na legenda e nas barras, mesmo com a maior contagem, e somá-lo ao total. O O2 não tem distribuição por motivo; mostra só a coluna "Bloqueado" por item.
- `CA-3` QUANDO o bloqueio mais antigo tem motivo não classificado O SISTEMA DEVE redigir a leitura do cartão como "por motivo não classificado".
- `CA-4` O SISTEMA DEVE distinguir "não classificado" por texto e ícone, sem depender só de cor, com contraste mínimo de 4,5:1 no texto; no O19, também por hachura ou contorno nas barras; no O2, só na coluna "Bloqueado" por item (texto e ícone, sem barra de distribuição).
- `CA-5` O SISTEMA NÃO DEVE exibir nome, e-mail, id de usuário, autor ou comentário de quem bloqueou, nem ordenar ou agrupar por pessoa ou time, em nenhuma coluna ou gráfico desta entrega.
- `CA-6` ENQUANTO a janela de 12 semanas do O5 contiver dias anteriores à data do dado real de bloqueio O SISTEMA DEVE exibir a faixa de aviso com a data e o texto "histórico parcial", mesmo quando o cartão estiver em amostra insuficiente.
- `CA-7` QUANDO a série do O1 atravessa a data do dado real de bloqueio O SISTEMA DEVE exibir a faixa de mudança de critério e a linha vertical na data, e deixar o trecho anterior sem pontos, nunca como zero.
- `CA-8` QUANDO a janela do O5 passa a ser inteiramente posterior à data do dado real O SISTEMA DEVE deixar de exibir a faixa de histórico parcial do O5.
- `CA-9` SE um tipo tem menos de 20 itens na janela ENTÃO O SISTEMA DEVE mostrar "amostra insuficiente" com N de 20, sem barra nem percentual para esse tipo.
- `CA-10` QUANDO não há item bloqueado O SISTEMA DEVE manter a mensagem "Nenhum item bloqueado hoje." sem exigir mínimo de 20.
- `CA-11` O SISTEMA DEVE exibir sob a tabela de bloqueados o texto de precisão do início do bloqueio.
- `CA-12` ENQUANTO o interruptor de bloqueio com dado real estiver desligado O SISTEMA DEVE manter "Sem dado real" em BLOQUEADOS, O1 (bloqueados), O2 (motivo) e O5.

## Perguntas abertas ao dono (hipóteses até confirmar)
- Hipótese: o texto de precisão (seção 2) basta; não pedir coluna de "início aproximado".
- Hipótese: reaproveitar `AvisoCriterio` sem `tipo="parcial"` é suficiente.

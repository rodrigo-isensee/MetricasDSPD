# Adendo de especificação pós-review (K-072 e K-073)

Data: 2026-10-14. Autor: ux-designer. Base: `especificacao.md` (EP), plano de arquitetura seção 10 (P1 a P4), plano do QA seção 8 (A1 a A10), parecer de review (seção "Para o ux-designer").
Legenda: **[Spec]** = a especificação ou decisão já responde; **[Proposta UX]** = a especificação não cobre, é proposta do UX, reversível, a confirmar; **[Pergunta]** = regra de negócio, vai ao usuário.

## 1. Texto "na semana" no bloco da Sustentação do Resumo [Spec + Proposta UX no texto]

Base: P3 = (a) (decidida, delegada ao time em 2026-10-13): números da Sustentação no Resumo usam 12 semanas; EP 5.9 (wireframe "Fonte: Acelerato · 12 semanas"); plano 4.5.

- O texto "na semana" é um resíduo de EP 5.4/5.9.4 e não vale mais no Resumo. A janela do bloco é de 12 semanas.
- Texto vazio do alerta no Resumo (substitui `BlocoSustentacao.tsx:34`): **"Nada pede atenção na Sustentação nas últimas 12 semanas."**
- Título do bloco permanece "Pede atenção · Sustentação (Acelerato)", com linha auxiliar visível abaixo: **"Janela: últimas 12 semanas"** (texto, não só no selo da fonte).
- Fluxo, por coerência: o bloco Fluxo já usa 12 semanas; vazio "Nada pede atenção no fluxo de projeto agora." fica como está, e ganha a mesma linha auxiliar "Janela: últimas 12 semanas".
- Achado vizinho: na visão **Sustentação** (detalhe) a faixa também diz "Pede atenção na semana" (EP 5.4, microcopy), mas o período do filtro é de 6 meses (padrão, ajustável). Proposta UX: título **"Pede atenção no período · Sustentação (Acelerato)"** com linha auxiliar dinâmica **"Período do filtro: 6 meses"** (reflete o valor escolhido). Vazio: "Nada pede atenção na Sustentação no período selecionado." CA-8/CA-28 do EP citam o título atual; o front e o QA devem atualizar a asserção junto. Na visão Semanal do fluxo, "na semana" continua (O3, O10, O12 são lidos sobre o período do filtro de 12 semanas, mas o título é herdado do painel existente; fora do escopo deste adendo).

## 2. "Pede atenção": 12 semanas no Resumo, 6 meses na visão Sustentação

### O que já está decidido
- Resumo, Sustentação: 12 semanas (P3 = a; Q1; plano 4.5). Os números S2 e S1 do Resumo e o alerta usam a mesma função (`contarForaS2`, plano seção 4.2), então número e alerta do Resumo nunca divergem entre si.
- Visão Sustentação: período do filtro com padrão 6 meses (EP 5.5 tabela de filtros; plano 4.5 "padrão da sustentação"). Decisão anterior, mantida.
- O briefing não fixa janela para S1/S2 nem para o "Pede atenção" (não há trecho que o diga); a regra de 12 semanas e n >= 20 vale para percentis (T2.5).

### Lacuna
P3 fala de **números-chave**. Nenhum documento decide explicitamente se o **alerta** do Resumo e o da visão Sustentação devem coincidir; o review assumiu "pela P3" que o alerta do Resumo é de 12 semanas (coerente com 4.5, mas é inferência). Efeito real: com 12 semanas há menos de 20 chamados por prioridade mais cedo, então uma prioridade pode estar "fora do alvo" nos 6 meses e "não avaliada" nas 12 semanas (e vice-versa), e um alerta aparece só num dos lugares.

### Decisão desta rodada: manter o que está decidido e explicar na interface [Proposta UX]
Sem alterar nenhum cálculo, três ajustes de texto:
1. Cada faixa escreve a sua janela (item 1 acima).
2. Abaixo da faixa do Resumo, nota única de uma linha: **"Mesmo alerta, janelas diferentes: aqui as últimas 12 semanas; na visão Sustentação, o período do filtro (padrão 6 meses). Por isso o resultado pode diferir."** Com link "Ver na Sustentação".
3. Na visão Sustentação, o link "Ver ..." não muda; a janela já está escrita em 1 e no filtro.

### Pergunta ao usuário (R-DECISAO)
**Pergunta U1.** O alerta "Pede atenção" da Sustentação deve ter a mesma janela no Resumo e na visão Sustentação?
- (a) **Manter duas janelas e explicar** (Resumo 12 semanas, detalhe 6 meses ajustável), com a nota acima. **Recomendada:** respeita P3, o Resumo e o número ficam coerentes, nada de cálculo novo, e o detalhe continua obedecendo ao filtro que a pessoa escolheu.
- (b) Alerta do detalhe sempre em 12 semanas, ignorando o filtro de período. Coerência total, mas o filtro deixa de valer para a faixa, quebrando a expectativa de quem muda o período.
- (c) Alerta do Resumo em 6 meses, revertendo P3 só para o alerta. Alerta igual nos dois lugares, mas o número do bloco (12 semanas) passaria a divergir do alerta que está ao lado dele.

Até a resposta, vale (a). Não bloqueia o QA: o teste confere janela escrita, nota e coerência número-alerta dentro do Resumo.

## 3. Itens A1 a A10 do QA que são de interface

| Item | Resposta | Base |
|---|---|---|
| **A1** O17 no Resumo | O17 **não** aparece no Resumo nem nas visões Diária e Semanal; só na Sustentação. O QA assumiu certo. | [Spec] CA-3, CA-25, EP 5.9.2 (lista dos números), EP seção 3.2 |
| **A2** "três" ou "quatro" visões no CA-19 | São **quatro** visões (Resumo, Diária, Semanal, Sustentação), em 375 e 1280. "Três" no CA-19 é texto defasado; o título do E2E "quatro" está certo. Correção do texto do CA-19 fica pendente no EP. | [Spec] CA-31, EP seção 13 D1, 5.9 |
| **A3** janela dos números (CA-26) | 12 semanas, escrita na tela: no selo "Fonte: Acelerato · 12 semanas" e na linha "Janela: últimas 12 semanas" do bloco. A divergência com a visão Sustentação é a da seção 2 (Pergunta U1). Os 6 meses ficam no detalhe. O texto antigo "a do painel" (5.9, Q5) está superado. | [Spec] P3 = (a), plano seção 10 |
| **A4** CA-30 pré-seleção | Os **dois níveis** ("Operacional" e "Operacional · Sustentação") ficam pré-selecionados; não são cartões. O título "os cartões dos números já marcados" do E2E existente descreve outra coisa e deve ser corrigido para os níveis; ao conferir, o QA registra a divergência do teste, não da spec. Sem exportar a tendência; sem popover "Métricas". | [Spec] CA-30, EP 5.9.6 (Exportação) |
| **A5** fronteira do "mês fechado" | Não é regra de interface, é de cálculo; vale o plano 4.4 (mês entra quando o último dia <= data de referência). Na interface, o rótulo do mês é o mês-calendário, sem marcar "parcial". Ao tech-lead/usuário só se discordarem do plano. | [Spec] CA-27 + plano 4.4; o rótulo é [Proposta UX] |
| **A6** localStorage corrompido ou `versao` != 1 | Ignorar o perfil, usar os padrões (nada oculto), **sem erro na tela e sem sobrescrever** o valor guardado até a pessoa alterar uma preferência; só então grava `versao: 1` com o formato do 007. Não perder dados de `versao` desconhecida: se `versao` for maior que 1, não gravar nada. | [Proposta UX] (EP só cobre o formato válido, CA-14 e CA-29) |
| **A7** teclado: `push` ou `replace` | Trocar a visão (clique, Enter ou seta no grupo de rádio) é **uma entrada de histórico** (`push`), como "escolher Resumo a partir de outra visão"; normalizações de URL (valor inválido, `cadencia=resumo` explícito, hash vencendo o `cadencia`) são `replace`. Recomendação ao front: setas no grupo de rádio mudam a seleção e a visão (padrão de rádio nativo); cada seta é um `push`. Se isso poluir o Voltar no teste real, o UX propõe trocar para `replace` só nas setas; hoje não há evidência. | [Spec] EP 5.9.6, 6.2; setas: [Proposta UX] |
| **A8** hash desconhecido com `cadencia` inválido | Hash desconhecido segue o `cadencia`; `cadencia` inválido cai no Resumo com o aviso 2.6 (valor inválido). Combinados: abre o **Resumo**, com o aviso; o hash desconhecido não rola nem foca nada, e a URL é normalizada com `replace` sem o `cadencia` inválido, **preservando o hash** (sem erro e sem tela em branco). | [Spec] 5.9.6 (valor desconhecido), 6.2 (hash desconhecido); combinação: [Proposta UX] |
| **A9** empate do tipo predominante | Critério único, o do cartão O3 (`tipoPredominante`): o tipo com mais itens na janela. Em **empate**, vale a ordem fixa em que os tipos aparecem no cartão O3 (a primeira aba), nunca a ordem de chegada dos dados, para ser determinístico. O rótulo "P85 · <tipo>" já diz qual tipo foi escolhido; no empate, acrescenta-se "empatado com <outro tipo>" na base ("n itens; empate com Bug"). O QA testa o determinismo (mesmo resultado em duas cargas). | Critério base [Spec] P1 (plano seção 10); desempate e texto: [Proposta UX], a confirmar (o `tipoPredominante` precisa seguir a mesma ordem do O3) |
| **A10** n < 20 nas contagens | Contagens (volume, itens concluídos) são publicadas sempre, inclusive com n pequeno; só percentil e taxa (aderência, P1+P2) seguem o mínimo de 20 e mostram "Poucos itens (n=...)". Na série, mês com volume pequeno aparece com valor; mês com percentil n < 20 aparece vazado (CA-27). Não precisa de CA novo; CT-41 cobre. Sugestão ao EP: acrescentar esta frase em CA-26. | [Spec] Q2 e CA-26 (leitura); briefing regra "abaixo de 20 itens, não publicar estatística" |

## 4. Resumo para os demais agentes
- Front: trocar o vazio e a linha de janela (seção 1); a nota "Mesmo alerta, janelas diferentes" (seção 2, enquanto U1 estiver em (a)); A6 e A8 conforme a tabela.
- QA: não reabrir A1, A2, A3, A4 (resolvidos); A5, A6, A7, A8, A9 têm resposta; A9 e A6 são propostas do UX, tratar como "a confirmar".
- Pendente do usuário: **U1** (única pergunta). Confirmar também A9 e A6 se quiser que deixem de ser proposta.

## Decisão do usuário
- 2026-10-14 — **U1 = (a)** (usuário: "das duas faça suas recomendações"): Resumo com 12 semanas e detalhe com o período do filtro, cada um com a janela escrita na tela e a nota "Mesmo alerta, janelas diferentes".
- 2026-10-14 — **A6 = B** (usuário): o comportamento fica como está. No caso de perfil salvo por versão mais nova, a mensagem passa a ser "Suas preferências foram salvas por uma versão mais nova do sistema e não serão alteradas aqui.". Ajuste de texto para o react-frontend, junto com o retorno do QA.
- 2026-10-14 — **A9 = A** (usuário): no empate do tipo predominante, vale a ordem fixa das abas do cartão O3, com o aviso "empate com <tipo>" na base. Deixa de ser proposta.

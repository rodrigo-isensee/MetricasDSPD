# Revisão geral de usabilidade · 02 Propostas

Base: `01-diagnostico.md` (os ids entre parênteses remetem aos achados). Protótipos das três propostas de maior impacto: `03-prototipo/index.html`.

Todas as propostas são de interface: não mudam cálculo, alertas, payload, regras de amostra nem a separação de fontes. Nenhuma cria ranking, meta por pessoa ou comparação entre equipes.

## 1. Matriz impacto × esforço

Impacto: quantas pessoas e com que frequência, ponderado pela severidade. Esforço (front-end, estimativa do UX a confirmar com o tech lead): P = até 1 dia, M = 2 a 4 dias, G = 1 semana ou mais.

| # | Proposta | Resolve | Impacto | Esforço | Prioridade |
|---|---|---|---|---|---|
| **P1** | **Ocultar e mostrar no lugar** (marcador do cartão oculto, desfazer sem tempo, contagem na seção, chegada por link a cartão oculto) | H1, H2, H3, H6, H7, H10, N1, C3 | Alto | M | **1** |
| **P2** | **Topo enxuto: "Pede atenção" na primeira dobra** (cabeçalho compacto, uma barra de ações, avisos agrupados) | P1, P2, P3, P4, V2, H6, X1, G1 | Alto | M | **2** |
| **P3** | **Índice fixo com resumo por seção no painel longo** (semanal, Tático, Sustentação) | O1, T1, F1 | Alto | M | **3** |
| P4 | Nomes antes de códigos ("Ver Idade do trabalho (O2)") em alertas, faixas, popover, preferências | G2, N3, H7, S3 | Médio | P | 4 (ganho rápido) |
| P5 | Confirmação e desfazer em "Aplicar sugestão do papel" | S1 | Médio | P | 5 (ganho rápido) |
| P6 | Visão geral orientada ao ritual: "Por reunião" logo abaixo do "Pede atenção"; textos de contexto recolhidos em "Sobre estes dados" | N2, V2, V3 | Médio | P | 6 |
| P7 | Texto de alerta que diz a falha ("WIP acima do limite em 13 de 59 dias; meta: 90% dos dias dentro") | V1 | Médio | P | 7 (ganho rápido; texto vem do DTO ou do front, ver com back-end) |
| P8 | Um botão "Exportar" com escolha dentro (Este painel / Vários painéis) | X1, X2 | Baixo | P | 8 |
| P9 | O2 com 5 itens e "Ver os 10"; títulos truncados em 2 linhas com o texto inteiro no `title` e na tabela | O2 | Médio | P | 9 |
| P10 | Esqueleto com texto ("Verificando a última coleta…") no lugar do bloco em branco | E1 | Baixo | P | 10 |
| P11 | Catálogo com busca por nome e pergunta, coluna "Pergunta", filtros na URL, selo "oculta para você" | C1, C2, C3 | Baixo | P | 11 |
| P12 | Consistência: abas de `/dados` no padrão do `SeletorLocal`; "Mais métricas" sem borda de acento; tema dentro de "Preferências" (só um ícone no cabeçalho) | G1, G3, M2, D1 | Baixo | P | 12 |

Leitura da matriz: P1, P2 e P3 são alto impacto e esforço médio (fazer primeiro, nessa ordem). P4, P5 e P7 são ganhos rápidos que podem entrar junto com P1 sem disputa de arquivos (textos e um diálogo). P8 a P12 vão para o fim da fila.

```
Impacto
 alto  | P1 P2 P3        |
       | P4 P5 P7        |
 médio | P6 P9           |
 baixo | P8 P10 P11 P12  |
       +-----------------+--> esforço
          P        M      G
```

---

## 2. P1 · Ocultar e mostrar no lugar (o ponto do usuário)

### 2.1 Alternativas consideradas (divergir antes de convergir)
| Alt. | Ideia | Prós | Contras | Esforço |
|---|---|---|---|---|
| A | **Manter a faixa no topo** e só melhorar textos (nomes em vez de códigos) | Mínimo esforço | Não resolve proximidade (H1) nem vestígio (H2) nem desfazer (H3) | P |
| B | **Desfazer no lugar**: o cartão vira na hora uma linha fina "Tempo de ciclo (O3) oculto · [Desfazer]" no mesmo lugar; depois de sair da página, a linha some | Resolve H3 (sem cronômetro, na ordem natural do foco) | Ao voltar ao painel, nada indica onde estava (H2 continua) | P |
| C | **Marcador permanente no lugar**: o cartão oculto vira uma linha de 40 px na sua posição, com nome, "oculta nesta visita" (ou "oculta no seu padrão") e "Mostrar"; o título da seção ganha "2 de 3 visíveis"; a faixa do topo vira uma linha discreta junto do botão "Métricas" | Resolve H1, H2, H3, H7; o mesmo padrão do item "métrica oculta" que já existe no "Pede atenção" (H11); a mudança de critério de métrica oculta vai para dentro do marcador (H6) | Ocupa algum espaço vertical; precisa de opção para quem quer o painel "limpo" | M |
| D | **Recolher em vez de ocultar**: o cartão vira só o cabeçalho (título, leitura em uma linha, status de meta) e expande com um clique | Nada some; ótimo para o ritual | Muda o conceito aprovado no pedido 007 (ocultar); a linha de leitura de cartão recolhido precisa de dados do cartão (mais consultas) | G |
| E | **Painel lateral "Ocultas (2)"** fixo à direita | Sempre perto | Disputa espaço em 1280 e não existe no celular | M |

**Escolhida: C**, com o desfazer de B embutido (o marcador **é** o desfazer: "Mostrar" está no lugar, sem cronômetro). A alternativa D fica como evolução, ligada à decisão U3 (modo resumido).

### 2.2 Comportamento proposto
1. "Ocultar" passa a ser um botão com ícone (olho cortado) e rótulo "Ocultar", com `aria-label="Ocultar Tempo de ciclo (O3) nesta visita"` (o texto final depende da decisão U1).
2. Ao clicar, o cartão é substituído **no mesmo lugar** por um marcador:
   `[olho cortado] Tempo de ciclo (O3) · oculta nesta visita        [Mostrar]`
   - Altura de 40 px (44 px no celular), borda tracejada `--borda-controle`, fundo `--superficie-2`: lê-se como espaço vazio, não como alerta.
   - O foco vai para o botão "Mostrar" do marcador (o desfazer fica a um Enter de distância); o `aria-live` anuncia "Tempo de ciclo (O3) oculta. 9 de 10 métricas visíveis." sem a palavra "Desfazer".
   - Sem aviso flutuante e sem cronômetro (resolve H3 e o risco de 2.4.11).
3. O título da seção mostra a contagem quando houver oculta: "Tempo · 2 de 3 visíveis".
4. Seção com todas ocultas: um único marcador para a seção ("Backlog · 2 métricas ocultas [Mostrar as 2]"), como hoje, mas listando os nomes.
5. Mudança de critério em métrica oculta: vai para dentro do marcador ("Critério alterado em 02/03/2026") com ícone de atenção; sai a faixa âmbar do topo (H6). O aviso continua impossível de esconder (regra CA-11 mantida).
6. No topo, a faixa grande vira **uma linha** ao lado do botão de recorte: "Métricas: 10 de 12 · 2 ocultas: Os três relógios, Envelhecimento do backlog · Mostrar todas". O botão "Usar minhas preferências" sai da faixa e fica só dentro do popover, renomeado (ver H5 e decisão U1).
7. Chegada por link a um cartão oculto (Visão geral, Catálogo, "Por reunião", N1): rola até o marcador, foca o "Mostrar" e destaca o marcador por 2 s (borda de acento, sem animação se `prefers-reduced-motion`), com o texto "Você chegou a uma métrica oculta. Mostrar Tempo de ciclo (O3)". Não mostra sozinho (respeita a escolha), mas fica a um clique.
8. Opção para quem quer o painel limpo (decisão U2): "Marcadores de ocultas: mostrar | esconder" no popover "Métricas". Padrão recomendado: mostrar.
9. "Mais métricas" com todas ocultas: o texto ganha o botão "Mostrar complementares" (H10).

### 2.3 Critérios de aceite propostos (para a especificação, depois da validação)
- O cartão oculto deixa um marcador na mesma posição da grade, com nome, código, estado ("nesta visita" ou "no seu padrão") e botão "Mostrar".
- Depois de ocultar, o foco está no "Mostrar" do marcador; Enter restaura o cartão e leva o foco ao título dele.
- Não existe desfazer com tempo limite.
- O título da seção mostra "N de M visíveis" quando N < M.
- Mudança de critério em métrica oculta aparece no marcador, nunca é suprimida.
- Link com hash para cartão oculto foca o marcador e explica; não falha em silêncio.
- A 375 px o marcador ocupa uma linha (quebra o botão para baixo se o nome for longo), sem rolagem horizontal.

---

## 3. P2 · Topo enxuto: "Pede atenção" na primeira dobra

### Alternativas
| Alt. | Ideia | Prós | Contras |
|---|---|---|---|
| A | Só remover espaços vazios (P2) | Trivial | Ganha ~40 px; não muda a leitura |
| B | **Compactar e agrupar**: título + pergunta em uma linha; "Dados até · Fonte · selo de frescor" em uma linha com detalhe em popover ("Entenda" vira "Detalhes da coleta"); uma barra única de ações (Cadência · Filtros · Métricas · Exportar · Copiar link); avisos de contexto (calibração, consolidado, critérios) agrupados numa linha "2 avisos sobre estes dados ▸" que expande | O "Pede atenção" sobe para ~y=260 a 1280 e ~y=430 a 375; nada some, só recolhe | Avisos ficam a um clique; a calibração precisa continuar visível (selo no cabeçalho e no cartão já existem) |
| C | "Pede atenção" **antes** do cabeçalho de filtros | Máxima prioridade | Os alertas dependem dos filtros; separar o controle do efeito confunde |

**Escolhida: B.** Exceções que não recolhem (regras do produto): o selo "Dados fictícios", a falha de coleta (selo vermelho com texto curto) e "Resultado consolidado de N equipes. O sistema não compara equipes." (vira uma linha curta junto dos filtros). A faixa de calibração continua visível, mas em uma linha com o link embaixo no celular (P4).

Meta mensurável: a 1280×800, título, frescor, filtros e o "Pede atenção" completo cabem sem rolar; a 375×812, o primeiro item do "Pede atenção" aparece por inteiro sem rolar.

---

## 4. P3 · Índice fixo com resumo por seção

### Alternativas
| Alt. | Ideia | Prós | Contras |
|---|---|---|---|
| A | "Ir para" fixo (sticky) junto da barra de filtros | Barato | Não diz onde está o problema |
| B | **Índice com resumo**: barra fixa de seções com estado agregado do que já é publicado (ex.: "Tempo · 1 pede atenção", "Qualidade · ok", "Backlog · 2 ocultas"), destacando a seção visível; no celular vira um seletor "Seção: Tempo ▾" fixo junto de "Filtros (n)" | Coordenador conduz o ritual por seção; volta rápido; aproveita o "Pede atenção" que já existe (sem cálculo novo) | Precisa de cuidado para não virar "placar": só ícone + texto do que já é alerta publicado, sem nota nem cor por time |
| C | Grade de 2 colunas em ≥1280 para cartões compactos | Reduz altura | Gráficos largos (O3, O9) perdem legibilidade projetados |

**Escolhida: B**, com C apenas para pares já compactos (O10/O7, O15/O18). O índice reaproveita os itens do "Pede atenção" (mesma consulta) e o recorte de ocultas; não cria cálculo nem comparação.

---

## 5. Decisões de produto para o usuário (máx. 5)

### U1. O "Ocultar" do painel deve ser lembrado?
Hoje vale só para a visita (some ao recarregar) e o padrão só se edita em Preferências (decisão do pedido 007).
- (a) Manter como está (só visita), deixando explícito no rótulo e no marcador: "oculta nesta visita".
- (b) Ocultar no painel **grava no seu padrão** (neste navegador); o marcador no lugar permite mostrar de novo a qualquer momento. Um único modelo: o que você oculta, fica oculto até você mostrar.
- (c) Perguntar ao ocultar: "Só nesta visita" / "Sempre".

**Recomendação: (b).** O marcador da P1 torna o "sempre" seguro (é visível e reversível no lugar), e some a confusão de dois níveis (H4, H5). A página Preferências continua como visão de conjunto. Reabre a decisão 4 do pedido 007; por isso é sua.

### U2. Marcador do cartão oculto: sempre visível ou opcional?
- (a) Sempre visível (o painel nunca esconde que há algo oculto).
- (b) Visível por padrão, com opção "esconder marcadores" no popover "Métricas" (a linha do topo continua informando a contagem).
- (c) Só a contagem no título da seção, sem marcador.

**Recomendação: (b).** Mantém a transparência por padrão e atende quem quer o painel limpo para projetar.

### U3. Painel semanal: completo ou resumido por padrão?
- (a) Completo, como hoje (todo cartão com gráfico).
- (b) Resumido por padrão: cada cartão mostra cabeçalho, frase de leitura e status de meta; o gráfico abre com um clique ("Ver gráfico"). Exceção: o que está no "Pede atenção" abre expandido.
- (c) Completo, com o índice fixo da P3 (recomendado como primeiro passo, sem mudar o cartão).

**Recomendação: (c) agora; reavaliar (b) depois de um mês de uso no ritual.** (b) muda a anatomia do cartão e o design system (gráfico sempre visível), e convém medir antes.

### U4. "Aplicar sugestão do papel": substituir ou somar?
Hoje substitui tudo, sem confirmação, e os conjuntos ainda são provisórios (P-1 em aberto).
- (a) Substituir, com confirmação que nomeia o que muda e "Desfazer" depois.
- (b) Somar (só oculta o que o papel sugere ocultar, sem reexibir o que você ocultou).
- (c) Retirar o atalho até P-1 ser respondida.

**Recomendação: (a)**, e responder P-1 (quais métricas compõem cada papel) na mesma conversa.

### U5. Visão geral: entrada por alerta ou por reunião?
- (a) Como hoje: alertas, níveis, espera invisível e, no fim, "Por reunião".
- (b) Alertas e logo abaixo "Por reunião" (atalhos do ritual); textos de contexto recolhidos.
- (c) "Por reunião" primeiro, alertas depois.

**Recomendação: (b).** O "Pede atenção" continua sendo a primeira leitura; o ritual fica a um clique sem rolar.

## 6. O que o time decide (sem consulta ao usuário)
- Estilo e posição do botão "Ocultar" (ícone + texto, mesmo componente `Botao`), foco depois de ocultar e mostrar, anúncio em `aria-live` (P1).
- Remover o aviso flutuante temporizado (P1, WCAG 2.2.1).
- Comportamento de link para cartão oculto (P1 item 7).
- Agrupamento de avisos de contexto, espaços reservados, barra única de ações e "Detalhes da coleta" (P2), desde que nenhum aviso obrigatório deixe de ser alcançável.
- Índice fixo (P3) sem nenhum indicador novo além do que o "Pede atenção" já publica.
- Nomes antes de códigos (P4), textos de alerta (P7, com o back-end se o texto vier do DTO), exportação em um botão (P8), O2 com 5 itens (P9), esqueleto com texto (P10), catálogo (P11), consistência (P12).

## 7. Próximos passos sugeridos
1. Usuário responde U1 a U5 olhando os protótipos.
2. UX converte P1 a P3 aprovadas em especificação (`especificacao.md` desta pasta) e o arquiteto avalia: P1 e P3 são só front; P7 pode tocar o DTO da Visão geral.
3. Ganhos rápidos (P4, P5, P7) podem entrar em paralelo como correção de interface, com code review e QA.

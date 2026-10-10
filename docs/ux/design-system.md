# Design system do MetricasDSPD

Documenta o que **já existe** em `web/src/styles/tokens.css` e `web/src/components/**`. A fonte da verdade é o código; este documento explica o uso. Folha visual: `docs/ux/figma/prototipos/design-system-1280.html` (e `-375`). Importação no Figma: `docs/ux/figma/roteiro-importacao.md`.

Princípios: nenhum número sem base amostral; nunca só cor (ícone + texto ou padrão); nenhuma métrica avalia pessoas; BusinessMap e Acelerato nunca se misturam; abaixo de 20 itens a estatística não é publicada.

## 1. Tokens

### 1.1 Cores semânticas (claro | escuro)
Contrastes aproximados, a validar com axe e medidor (os valores do CSS são "de partida").

| Token | Claro | Escuro | Uso | Contraste aprox. (texto sobre superfície) |
|---|---|---|---|---|
| `--fundo` | #f6f7f9 | #0f1420 | fundo da página | n/a |
| `--superficie` | #ffffff | #161c2a | cartões, tabelas, popovers | n/a |
| `--superficie-2` | #eef1f6 | #1e2638 | chips, cabeçalho de tabela, notas | n/a |
| `--texto` | #1a1f2b | #e8ecf4 | texto principal | 16:1 / 14:1 |
| `--texto-2` | #4a5365 | #aab3c5 | texto secundário, perguntas, legendas | 7,5:1 / 8:1 |
| `--borda` | #d5dae3 | #2a3347 | divisórias decorativas (não é limite de controle) | n/a |
| `--borda-controle` | #6b7488 | #8590a6 | borda de controles e ícones (>= 3:1, WCAG 1.4.11) | 4,6:1 / 5,3:1 |
| `--acento` | #1f5fbf | #6aa8ff | ação, link, foco, aba ativa | 6,3:1 / 7,9:1 |
| `--acento-texto` | #ffffff | #0f1420 | texto sobre botão primário | com `--acento` |
| `--acento-fundo` | #e6effc | #1c2d4a | selo de código, hover, aba ativa | com `--acento` ou `--texto` |
| `--alerta` / `-fundo` | #b42318 / #fdecea | #ff8a80 / #3a1b1b | fora da meta, erro | 6:1 / 7:1 |
| `--atencao` / `-fundo` | #8a5a00 / #fff4dc | #e0b040 / #3a2e0f | amostra insuficiente, aviso de dados fictícios | 6:1 / 8:1 |
| `--ok` / `-fundo` | #0b6b3a / #e3f5ec | #3ccb9b / #0f2f25 | dentro da meta | 6,5:1 / 8:1 |

### 1.2 Séries de gráfico (paleta segura para daltonismo, Okabe-Ito adaptada)
`--serie-1..7`. Claro: #0072b2, #d55e00, #009e73, #7b3fa0, #b87a00, #cc79a7, #5b6477. Escuro: #6aa8ff, #ff9a5c, #3ccb9b, #b48cff, #e0b040, #f08cc0, #9aa3b5.
Rampa sequencial (mapa de calor): `--rampa-1..5` com texto `--rampa-N-fg` (claro: #dbe8f7 a #1d4f94; escuro: #1c2d4a a #86b4f5). O texto da célula troca de cor para manter 4,5:1.

### 1.3 Tipografia
Família `--font-sans`: Inter, com fallback para fontes do sistema (ui-sans-serif, system-ui, Segoe UI, Roboto, Arial). Números com `tabular-nums`.

| Papel | Tamanho / peso | Onde |
|---|---|---|
| Título de painel | 24 / 700 (a confirmar no cabeçalho) | CabecalhoPainel |
| Título de seção | 18 / 700 | Secao, título da folha de filtros |
| Título de cartão | 16 / 600 | CartaoMetrica `h3` |
| Corpo, frase de leitura | 14 / 500 | leitura, tabela, notas |
| Pergunta do cartão, legendas | 14 / 400 em `--texto-2` | |
| Selo de código, chips, ação compacta | 12 a 14 / 600 | |
| Título da faixa de atenção | 14 / 700 caixa alta, tracking largo | FaixaAtencao |

### 1.4 Espaçamento, raios, sombras, movimento
- Espaçamento em múltiplos de 4 px (gap 8, padding de cartão 16, compacto 12, entre cartões 16 a 24).
- Raios: 4 (selo de código, status), 6 (botão, nota, aviso), 8 (cartão, faixa), 12 (folha mobile), 9999 (chip).
- Sombras: só em camadas flutuantes (popover `shadow-lg`, folha `shadow-xl`). Cartões não têm sombra: borda 1 px `--borda`.
- Foco: `outline 2px solid var(--acento)`, offset 2 px, ambos os temas.
- Alvo: 24 px mínimo, 44 px abaixo de 768 px (classe `.alvo`).
- Breakpoints: 640, 768 (filtros sticky e folha), 1024, 1280.
- Movimento: esqueleto com brilho 1,6 s; `prefers-reduced-motion` zera animações e transições.
- Altura do cabeçalho `--h-cabecalho` 56 px; `--h-filtros` medido em execução.

## 2. Componentes

### 2.1 Botao
Variantes: `primario` (fundo acento, uma por tela/seção), `secundario` (borda de controle, padrão), `fantasma` (texto acento). Rótulo com verbo de ação. Desabilitado: opacidade 50%.
Faça: "Tentar de novo", "Limpar filtros", "Ver resultados". Não faça: "OK", dois primários na mesma seção.

### 2.2 CartaoMetrica (anatomia)
```
+--------------------------------------------------------------+
| [O2] Tempo de ciclo        [Como ler e como é calculado] [Ver como tabela]   <- cabeçalho
| [Base: 87 itens concluídos · 18/07 a 09/10/2026] [Janela fixa: 12 semanas]   <- BadgeBase + selos
| (nota metodológica expandida, fechada por padrão)
| Pergunta: quanto tempo leva do início à entrega?              <- texto-2
| Frase de leitura gerada dos dados                              <- 14/500
| [aviso de mudança de critério]
| [ gráfico / tabela equivalente ]                               <- corpo
| [Meta: ...] [Dentro da meta] [Fonte: BusinessMap] [Granularidade: demanda] [Filtros aplicados: ...] [Não afetado por: ...]
+--------------------------------------------------------------+
```
- Estados: `ok`, `carregando` (esqueleto com altura reservada, sem salto), `vazio`, `erro`; `atualizando` esmaece a 80% só se passar de 150 ms. "Amostra insuficiente" é por estatística, dentro do corpo, nunca o cartão inteiro.
- Acessibilidade: `role="group"` rotulado pelo título; `aria-busy` ao carregar; id minúsculo do código (`#o2`) é âncora.
- Variantes: `padrao` (p-16), `compacto` (p-12).
- Regras: nenhum número sem BadgeBase; meta e status só quando a meta é numérica; rodapé sempre diz fonte e granularidade; story, frente e projeto nunca no mesmo gráfico.
- Não faça: ocultar o cartão quando falta dado; escrever número no componente; mostrar ranking de pessoas.

### 2.3 NotaMetodologica (BotaoNota + BlocoNota)
Botão "Como ler e como é calculado" (`aria-expanded`/`aria-controls`) abre bloco com cinco seções fixas: O que é, Como se calcula, Como ler, Meta, Cuidados e limites; mais "Nesta tela" (janela, filtros aplicados, base amostral, regra de mínimo de 20). Fechada por padrão; abrir/fechar não move o foco. Sem texto, o cartão não é entregue.

### 2.4 BadgeBase, SeloJanela e chips
- BadgeBase: "Base: 87 itens concluídos · 18/07 a 09/10/2026". Variantes `ok` (neutra), `censo` ("Base: k de n"), `insuficiente` (âmbar, triângulo, "Amostra insuficiente: 12 de 20 itens mínimos").
- SeloJanela: "Janela fixa: N semanas" quando o período escolhido difere da janela de percentis.
- Chips (pílula, `--superficie-2`): Fonte, Granularidade, Meta, "Filtros aplicados", "Não afetado por" (com ícone "i").
- StatusMeta: sempre ícone + texto. Dentro (check, verde), Fora (triângulo, vermelho), Sem referência e Sem meta numérica (i, neutro).

### 2.5 AmostraInsuficiente
Substitui a estatística afetada quando há de 1 a 19 itens. Mostra título com ícone, explicação, barra `role="meter"` n/20 e sugestões.
- `padrao`: âmbar (`--atencao`), ícone triângulo; "Só publicamos percentis com pelo menos 20 itens. Aqui há 12 itens (12 de 20 itens mínimos)."; botões "Remover filtro X" por filtro ativo; sem filtros: "Esta classe tem poucos itens mesmo sem filtros."
- `lenta` (E1, T7, EI-FL2, EI-FL3): neutra, ícone "i"; explica que é esperado terminar poucos projetos/frentes; sem sugerir mudar filtro; pontos individuais por projeto e contagem visíveis.
- `CelulaInsuficiente` (tabela): "— amostra insuficiente", nunca célula em branco.
- Aba com poucos itens: "(amostra insuficiente)" no rótulo.
Não faça: mostrar percentil com n < 20, "arredondar" para publicar, usar vermelho (não é erro).

### 2.6 FaixaAtencao ("Pede atenção")
Seção com título por painel: "hoje" (Visão geral, Operacional), "na semana" (Tático, Sustentação), "agora" (Estratégico). Lista de itens (ícone de alerta + texto + link "Ver O2"), cada um leva ao cartão. `maximo` com "Ver todos os alertas (N)". Estados: carregando ("Verificando o que pede atenção…", `role=status`), erro (`role=alert`, "Tentar de novo"), vazio positivo ("Nada pede atenção agora com base nas metas publicadas." com check). Nunca afirma "nada pede atenção" enquanto carrega ou em erro. Não lista pessoas.

### 2.7 BarraFiltros
Só os filtros que se aplicam ao painel (Equipe, Tipo de demanda, Sistema, Período; Prioridade na Sustentação). Aplicação imediata; chips dos ativos removíveis; "Limpar filtros" só quando fora do padrão; região `aria-live` anuncia "Filtros atualizados. Equipe: A e B.". Desktop (>= 768 px): sticky sob o cabeçalho. Mobile: botão "Filtros (n)" abre folha inferior com "Ver resultados". Avisos: "Resultado consolidado de N equipes. O sistema não compara equipes."; Estratégico explica por que não há filtro de equipe; filtros guardados não aplicáveis são avisados. A URL é a fonte da verdade.

### 2.8 SeletorLocal (abas)
`role=tablist`; uma distribuição por vez; setas, Home e End movem e selecionam; Tab sai para o conteúdo. Ativa: borda inferior 2 px acento + fundo `--acento-fundo` + peso 600 (não só cor). Rótulo pode ter contagem "(12)" e "(amostra insuficiente)". Estado na URL (`o3`, `t1`, `s4`, `e1`, `cadencia`). Seletor de cadência no Operacional: diária (padrão) e semanal.

### 2.9 TabelaDados e RegiaoRolavel
Toda visualização tem equivalente em tabela ("Ver como tabela"). Tabela com `caption`, `th scope=col`, primeira coluna `th scope=row` fixa à esquerda, números alinhados à direita com `tabular-nums`. RegiaoRolavel: `role=region`, `aria-label="Tabela de ..., role para os lados"`, `tabindex=0`, sombras de borda (`.rolagem-sombra`) indicam rolagem. Vazio: "Sem dados." Não faça: tabela sem região rolável no mobile.

### 2.10 Gráficos
Recharts com tema por tokens (`charts/tema.ts`): Histograma, Dispersão, SerieLinhas, AreaEmpilhada, Barras, MapaCalor, ParEspera, Legenda, TooltipTema. Regras:
- **Além da cor**: cada série tem cor e padrão (`PadroesSvg`: listras, pontos, hachura, cruzado); linhas variam traço e marcador.
- Período em andamento: padrão listrado (`.listrado`) + rótulo, nunca só cor.
- Percentis P50/P85/P95 como linhas rotuladas; mudança de critério como linha tracejada vertical com rótulo e `AvisoCriterio` (data e descrição).
- Frase de leitura acima do gráfico; tooltip acessível por teclado; tabela equivalente.
- Nunca: média sem percentis, ranking individual, comparação entre equipes, dois níveis (story, frente, projeto) no mesmo histograma.

### 2.11 AvisoDadosFicticios
Selo permanente no cabeçalho: ícone "i" + "Dados fictícios", âmbar, botão com popover explicativo ("Nenhum número representa a operação real."). Não tem como ser removido. Some só quando a integração real (pedido 002) entrar; será substituído pelo selo de frescor (ver discovery Integração real).

### 2.12 Estados
| Estado | Padrão | Texto-base |
|---|---|---|
| Carregando | Esqueleto com a altura final reservada, brilho (parado com reduced-motion), `aria-busy` | cabeçalho e pergunta já visíveis |
| Vazio | Título + causa + "Limpar filtros" | "Sem dados para estes filtros." |
| Erro | Título + o que houve + manter filtros + "Tentar de novo" | "Não foi possível carregar este gráfico." |
| Insuficiente | AmostraInsuficiente (2.5) | "Amostra insuficiente" |
| Atualizando | Conteúdo esmaecido a 80% após 150 ms | n/a |
Erro de um cartão não derruba a página; erro de rota usa ErroPagina; 404 explica e volta à Visão geral.

## 3. Faça / Não faça (resumo)
- Faça: ícone + texto para todo status; base amostral em todo número; "Como ler" em todo cartão; alvos 44 px no mobile; reservar altura nos estados.
- Não faça: cor sozinha; ranking, meta ou comparação por pessoa ou equipe; misturar fontes; publicar n < 20; esconder o aviso de dados fictícios; sobrescrever histórico em explicações de dado.

## 4. Mapeamento para o Figma
Páginas: Design system (tokens como Variables claro/escuro e estes componentes); demais páginas conforme `figma/roteiro-importacao.md`. Variables sugeridas: coleção "Cor" com modos Claro/Escuro usando os nomes dos tokens; coleção "Espaço" (4, 8, 12, 16, 24); coleção "Raio" (4, 6, 8, 12, 9999). Os frames importados são imagens estruturais; recriar componentes como Components a partir da folha do design system.

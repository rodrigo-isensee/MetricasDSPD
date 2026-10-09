# Parecer de UX: fase A (shell, filtros, tema, componentes e cartão O4)

Revisor: `ux-designer` · 2026-10-09 · Decisão D11 da ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md`
Referência: `docs/ux/dashboard-metricas.md` (rev. 2). Método: leitura de código dirigida (`web/src/app`, `components/ui`, `components/charts`, `features/filtros`, `features/painel`, `features/operacional`, `data`, `styles/tokens.css`, `web/README-dev.md`). Não houve execução no navegador: itens marcados "verificar" dependem do QA.

## Resumo
Base sólida: anatomia do cartão, quatro estados, foco visível, `prefers-reduced-motion`, alvos mínimos, tema sem flash, aviso de dados fictícios permanente e tabela alternativa estão bem encaminhados. Há desvios da spec que a fase B vai replicar se não forem corrigidos agora.

Contagem: crítico 0 · alto 8 · médio 10 · baixo 8.

## Contraste calculado (WCAG 1.4.3 e 1.4.11)
Cálculo manual de luminância relativa. Todos os pares principais passam, com uma exceção no limite.

| Par | Claro | Escuro |
|---|---|---|
| texto-2 sobre superfície | 7,7:1 | 8,1:1 |
| acento sobre superfície | 6,1:1 | 7,0:1 |
| acento sobre acento-fundo | 5,2:1 | 5,7:1 |
| alerta sobre superfície / alerta-fundo | 6,6 / 5,7 | 7,5 / 6,8 |
| atenção sobre superfície / atenção-fundo | 5,9 / 5,4 | 8,5 / 6,6 |
| ok sobre superfície | 6,6:1 | sem desvio visível |
| borda-controle sobre superfície | 4,7:1 | 5,3:1 |
| acento-texto sobre acento (botão primário) | 6,1:1 | 7,6:1 |
| séries 1 a 7 sobre superfície | 3,06 a 5,2:1 (série 6 `#cc79a7` é a mais baixa, passa 3:1) | não calculadas, spec prevê 3:1 |
| rampa-4 com texto branco (mapa de calor) | **4,50:1, no limite** | 4,96:1 |

Observação: a borda de cartão (`--borda`, 1,4:1) não identifica controle, então não é exigida pela 1.4.11.

---

## ALTO

### A1. Aviso de consolidação só aparece com 2 ou mais equipes marcadas
- Local: `features/filtros/BarraFiltros.tsx`, linha 172 (`equipes >= 2`).
- Spec: 2.1 e critério 25: o texto "Resultado consolidado de N equipes. O sistema não compara equipes." aparece sempre que o resultado soma 2 ou mais equipes, inclusive "Todas" (padrão), com N real (6 no fluxo, 3 em Sustentação). Não aparece no Estratégico.
- Implementado: conta só `filtros.equipe.length`; no padrão (nenhuma marcada) o aviso some, e o N nunca é o total real.
- Correção: calcular N = seleção, ou total de `opcoes.equipes` quando vazio ou quando todas estão marcadas; ocultar quando N = 1 e no Estratégico. Vale também para o bloco de EI da Sustentação.

### A2. Parâmetros não aplicáveis e memória de sessão (2.6.1) não implementados
- Local: `features/filtros/useFiltros.ts` (comentário na linha 140), `app/NavegacaoGlobal.tsx` (`useBusca`).
- Spec: 2.6.1, critérios 6, 24 e 107: parâmetro não aplicável é ignorado em silêncio e removido da URL com `replaceState`; os filtros de fluxo ficam guardados em memória da sessão e voltam ao navegar; o Estratégico mostra `aviso-filtros-nao-aplicaveis` quando há `equipe` ou `tipo` guardados.
- Implementado: `equipe` e `tipo` continuam na URL do Estratégico (só são zerados no cálculo); não há memória de sessão, os links levam só o que está na URL atual; o aviso não existe (nenhuma ocorrência de `aviso-filtros-nao-aplicaveis` no código). Ir Operacional, Sustentação, Operacional perde os filtros. Um link compartilhado com `periodo=4s` no Estratégico não segue a regra de 2.6.1.
- Correção: guardar `equipe`, `tipo`, `sistema`, `periodo` em um contexto em memória (não `localStorage`); limpar a URL dos parâmetros não aplicáveis com `replace`; montar os links de fluxo a partir da memória; renderizar o aviso "i" no Estratégico; `prioridade` e filtros da Sustentação ficam fora da memória.

### A3. Estratégico oferece períodos que a spec exclui
- Local: `features/filtros/FiltroPeriodo.tsx` (`PRESETS` fixo), `paineis.ts`.
- Spec: 2.3: no Estratégico só valem "Últimos 6 meses" e "Últimos 12 meses"; as demais opções não aparecem.
- Implementado: todos os painéis mostram 4s, 12s, 6m, 12m e Personalizado.
- Correção: adicionar `periodosPermitidos` em `ConfigPainel`; o Estratégico lista só `6m` e `12m` (sem Personalizado, conforme a spec); `periodo` fora do permitido vira "não aplicável" (A2).

### A4. "Remover filtro X" nos estados vazio e amostra insuficiente pode não fazer nada
- Local: `components/ui/EstadoVazio.tsx` linha 32; `AmostraInsuficiente.tsx` linha 64; `features/filtros/useFiltros.ts` (`remover`).
- Spec: 6.2 e 6.3: botões "Remover filtro Tipo" devolvem a amostra.
- Implementado: os botões chamam `removerFiltro(f.chave, f.valor)` com o valor legível ("ERP Protheus"), mas `remover` compara com o id (`erp-protheus`). Para `equipe` e `sistema` nenhum valor é removido (`tipo` e `prioridade` funcionam por acaso, pois aceitam os dois formatos). Além disso, com 2 equipes marcadas aparecem dois botões idênticos "Remover filtro Equipe".
- Correção: expor `valorId` no `FiltroAtivo` e usar nos botões; agrupar por chave (um botão por filtro, "Remover filtro Equipe"), como na spec; cobrir com teste de componente.

### A5. Cartão de referência O4: janela escrita à mão e selo de janela ausente
- Local: `features/operacional/components/CartaoO4.tsx`, linha 25 (leitura) e ausência de `selos`.
- Spec: 4.0.3 (texto de janela gerado do parâmetro, nunca à mão) e 2.3 (selo "Janela fixa: 12 semanas" quando o período difere de 12 semanas); leitura do O4 e critério 52.
- Implementado: "Nas últimas 12 semanas..." fixo; `SeloJanela` existe mas não é usado. Com período 12m ou 4s o gráfico mostra outra extensão e a frase mente. `CartaoMetrica` não dá nenhum empurrão para o selo, então a fase B tende a omitir.
- Correção: derivar o texto do `janelaPercentis` do DTO; passar `selos={<SeloJanela fixa .../>}` quando o período escolhido difere; idealmente `CartaoMetrica` aceitar `janelaPercentis` e `periodo` e renderizar o selo sozinho. Atualizar o README-dev com o padrão.

### A6. `AmostraInsuficiente` não tem a variante "lenta" (6.3.1)
- Local: `components/ui/AmostraInsuficiente.tsx`.
- Spec: 6.3.1 (J1): para E1, T7, EI-FL2 e EI-FL3 o estado é normal: ícone "i" neutro, sem `role="alert"`, texto fixo de três linhas, sem "tente remover filtro".
- Implementado: só a variante de alerta (ícone triângulo, cor de atenção, "Para chegar a 20, tente"). `BadgeBase` também só tem a variante de alerta.
- Correção: prop `variante="lenta"` com `entidade` ("projetos"/"frentes") e os textos da spec; `BadgeBase` neutro para esses casos. Fazer antes da fase B começar E1/T7/EI.

### A7. Cabeçalho tende a quebrar entre 1024 e ~1200 px e a barra sticky fica sob ele (verificar)
- Local: `app/AppShell.tsx` e `features/filtros/BarraFiltros.tsx` (`md:top-[var(--h-cabecalho)]`).
- Spec: 1.2, 2.4 e 8.5: o foco nunca pode ficar escondido (WCAG 2.4.11); `scroll-padding-top` = cabeçalho + barra.
- Implementado: a navegação horizontal passa a aparecer em 1024 px; estimativa de largura (logo, 6 itens, selo, tema, Ajuda) em torno de 1170 px, maior que a área útil de 992 px. O cabeçalho quebra em duas linhas (cerca de 100 px), mas a barra sticky usa `top` fixo de 3,5 rem e `scroll-padding` também fixo. A barra fica parcialmente coberta e o foco pode ficar oculto.
- Correção: medir a altura real do cabeçalho (variável CSS via `ResizeObserver`) ou garantir que o cabeçalho nunca quebre (navegação em gaveta até 1280, ou itens menores). Verificar em 1024, 1100 e 1180 px.

### A8. Período "em andamento" listrado sem rótulo quando a legenda está oculta
- Local: `components/charts/Barras.tsx` (legenda só se `!semLegenda`); `CartaoO4.tsx` passa `semLegenda` em série única.
- Spec: D9, 8.3, 4.0 (O4): semana em andamento com padrão listrado e rótulo "em andamento", fora das estatísticas.
- Implementado: o item "Em andamento (fora das estatísticas)" só existe na legenda; no caso padrão do O4 a legenda é suprimida, então a barra listrada não tem explicação na tela (só na tabela). Também falta o rótulo no eixo X.
- Correção: manter sempre o item de em andamento na legenda (mesmo com `semLegenda`) ou acrescentar "(em andamento)" ao tick do eixo; mudar o nome da prop para `semLegendaDeSeries`.

---

## MÉDIO

### M1. Parâmetro `mock` diverge da spec 6.6
- Local: `data/simulacao.ts` (regex `^erro:[a-z0-9_]+$`), `NavegacaoGlobal.tsx` (linha 21), `CabecalhoPainel.tsx` (`window.location.href`).
- Spec: 6.6 e critério 109: aceita `erro-uma-vez:{id}` e listas por vírgula (`erro:o3,t1`); ids com hífen (`ei-fl1`, `nivel-operacional`); os links de navegação NÃO propagam `mock`; "Copiar link" NÃO inclui `mock`.
- Implementado: sem `erro-uma-vez`; sem lista; ids com hífen são rejeitados; a navegação propaga `mock` (comentário diz que é de propósito); "Copiar link" inclui `mock`. O README-dev documenta só a versão reduzida.
- Correção: implementar a definição completa; remover `mock` dos links e do "Copiar link". Se a equipe quiser a propagação para facilitar a validação, isso é decisão a registrar e a spec precisa ser alterada.

### M2. Esqueleto sem as dimensões do conteúdo e regra de 300 mínimos ineficaz
- Local: `EsqueletoCartao.tsx`, `CartaoMetrica.tsx` (`alturaEsqueleto` não passado pelo O4).
- Spec: 6.1: mesmas dimensões, sem salto de layout; uma vez visível, o esqueleto fica pelo menos 300 ms.
- Implementado: altura padrão 220 px contra gráfico de 260 px mais legenda, leitura e avisos; salto na troca. O hook `useEsqueletoVisivel` é montado só durante o carregamento: ao carregar, o componente desmonta e o mínimo de 300 ms nunca vale (pode piscar com respostas de 150 a 300 ms).
- Correção: `alturaEsqueleto` derivada da altura do gráfico + faixa de leitura; levar o controle de "visível por no mínimo 300 ms" para o `CartaoMetrica` (que continua montado).

### M3. D7: troca de filtro piscando e sem anúncio
- Local: `CartaoMetrica.tsx` linha 202; `data/useMetrica.ts`.
- Spec: 6.1: conteúdo antigo esmaecido por até 150 ms, depois esqueleto; `aria-live` anuncia "Atualizando painel" e "Painel atualizado".
- Implementado: `keepPreviousData` mantém o conteúdo (bom, não há salto), mas o esmaecimento (`opacity-60`) aplica na hora, mesmo com resposta de poucos ms: com o mock, cada clique faz o cartão piscar. A frase de leitura fica fora da região esmaecida e mostra o texto antigo com a mesma força durante a troca. Nenhum anúncio de "Atualizando painel / Painel atualizado" existe (nenhuma ocorrência no código); o anúncio de filtros só diz "Filtros atualizados".
- Correção: aplicar o esmaecimento só após 150 ms (mesmo mecanismo do esqueleto); incluir a leitura na região `aria-busy`; adicionar mensagens à região viva da barra. Também considerar `transition-opacity` curta, respeitando reduced motion (já respeita).

### M4. Alternador "Empilhar por tipo" abaixo do alvo mínimo
- Local: `CartaoO4.tsx` linhas 61 a 64.
- Spec: 8.5 e critério de acessibilidade: alvos de 24×24 px (44 px abaixo de 768).
- Implementado: checkbox nativo de 13 px e texto `text-xs` sem `.alvo`; a altura clicável fica em torno de 16 px. Como o O4 é o molde, outros cartões vão copiar.
- Correção: criar `AlternadorCartao` em `components/ui` (switch ou checkbox com `.alvo`) e usá-lo no O4.

### M5. Cores de tipo mudam conforme os filtros; empilhado só por cor
- Local: `CartaoO4.tsx` linhas 31 a 34; `Barras.tsx` (`corNaPosicao(i)`, padrão `liso`).
- Spec: 8.2 e 8.3: séries com padrão ou rótulo, nunca só cor; consistência entre telas (princípio de consistência).
- Implementado: a série "por tipo" só inclui tipos presentes e usa a posição na lista para escolher a cor; com filtro, "Melhoria" muda de azul para laranja. No modo empilhado todas as séries são lisas e se distinguem apenas por matiz (legenda sem padrão).
- Correção: mapa fixo tipo para `{cor, padrão}` em um módulo compartilhado (`components/charts/tema` ou conteúdo do catálogo); usar padrões diferentes nas barras empilhadas.

### M6. Eixos sem unidade e rótulos do eixo X apertados
- Local: `Barras.tsx` (XAxis `interval={0}`, sem título de eixo).
- Spec: 4.0.4 ("toda unidade escrita no eixo e no valor") e O4 (y = itens concluídos).
- Implementado: o eixo Y mostra só números; a unidade aparece apenas na tabela e no tooltip. Doze rótulos de data com `interval={0}` colidem em 320 a 400 px (reflow 1.4.10 e altura mínima de 240 px na spec).
- Correção: título de eixo ou subtítulo do gráfico com a unidade; `interval="preserveStartEnd"` ou rótulos rotacionados em telas estreitas, com a tabela como garantia.

### M7. Período personalizado aparece em formato ISO
- Local: `useFiltros.ts` (`chipsDe`), `FiltroPeriodo.tsx` (`rotuloPeriodo`).
- Spec: 2.3 e 1 (datas `DD/MM/AAAA`).
- Implementado: chip e botão mostram "2026-08-01 a 2026-09-01".
- Correção: formatar com `fmtData`. Aproveitar para exibir o limite do histórico no popover e não pular a validação quando `historico` ainda não carregou (`FiltroPeriodo`, linha 27).

### M8. `AlternarTabela` troca o rótulo e usa `aria-pressed`
- Local: `AlternarTabela.tsx`.
- Spec: 5 (botão "Ver como tabela" / "Ver como gráfico").
- Implementado: o rótulo muda e `aria-pressed` também; leitores de tela anunciam "Ver como gráfico, pressionado", que confunde (WAI-ARIA recomenda um ou outro).
- Correção: manter a troca de rótulo (spec) e remover `aria-pressed`; foco permanece no botão. Verificar que o foco não se perde quando o gráfico é substituído.

### M9. Tamanho de texto de 12 px em informação essencial
- Local: `Chips.tsx`, `BadgeBase.tsx`, `Legenda.tsx`, `GraficoBase` (`text-xs`).
- Spec: personas (TV em sala, reunião projetada) e princípio 3 (base e meta junto do número).
- Implementado: base amostral, meta, fonte, filtros aplicados e legenda em 12 px.
- Correção: subir base, meta e legenda para 14 px (`text-sm`); manter 12 px só para metadados terciários (fonte, granularidade).

### M10. Texto esmaecido durante a atualização cai abaixo de 4,5:1
- Local: `CartaoMetrica.tsx`, `opacity-60`.
- Implementado: `texto-2` a 60% sobre branco dá cerca de 2,9:1 (estimado). Transitório, mas ocorre a cada troca de filtro e na TV pode parecer ilegível.
- Correção: resolvido em conjunto com M3 (esmaecer só após 150 ms e usar opacidade ≥ 0,8, que mantém ≥ 4,5:1 para `texto`).

---

## BAIXO

- **B1. O4 sem faixa sombreada.** `CartaoO4.tsx`: spec pede faixa sombreada mín a máx; o código desenha duas linhas pontilhadas e uma tracejada. Correção: `ReferenceArea` entre mín e máx, mantendo as linhas rotuladas e o valor no rótulo ("mediana 8").
- **B2. Seletor de tema é `select`.** `SeletorTema.tsx`: a spec (8.2, L5) diz grupo `role="radiogroup"` com três opções. O `select` é acessível e tem o testid; alinhar spec e código (ou trocar). Avisar o QA para não procurar `radio`.
- **B3. Tabela sem primeira coluna fixa.** `TabelaDados.tsx`: spec 8.6 pede a primeira coluna fixa em telas estreitas. Adicionar `sticky left-0` no `th scope="row"`.
- **B4. Ícone de alerta reutilizado.** `AvisoDadosFicticios`, `BadgeBase` insuficiente, `AmostraInsuficiente` e `EstadoErro` usam o mesmo ícone, com cores próximas. Usar "i" para o aviso de dados fictícios e manter o triângulo só para atenção.
- **B5. 404 e erro de rota fora do padrão.** `Erros.tsx`: faltam o texto explicativo e o "Detalhes técnicos" recolhido; o 404 e `VisaoGeralPage` (placeholder) usam `<button>` sem o componente `Botao`. Padronizar para `Botao`.
- **B6. `rampa-4` claro no limite.** `tokens.css`: `#3b78c4` com texto branco dá 4,50:1. Escurecer um passo (por exemplo `#3571bb`) para folga.
- **B7. Mensagem "Carregando" por cartão.** `EsqueletoCartao.tsx`: cada esqueleto tem `role="status"`, com 15 ou mais cartões na página gera muitos anúncios. Usar uma região única do painel ("Carregando painel") e deixar o texto por cartão sem `role`.
- **B8. Rótulos ambíguos nos botões de filtro.** `FiltroMulti.tsx`: `aria-label` fixo "Equipe: Todas. Abrir filtro" inclui o texto visível (ok para 2.5.3), mas a descrição repete "Abrir filtro" em todos os botões; preferir `aria-haspopup="dialog"` e rótulo igual ao texto visível.

---

## Conformidades verificadas (manter)
- Navegação: 6 destinos, `aria-current` via `NavLink`, sublinhado e peso no item atual, gaveta em <1024 com foco preso (Radix), "Pular para o conteúdo", foco no `h1` ao trocar de rota, foco no título do cartão em âncora, `<title>` por rota.
- Selo "Dados fictícios" permanente (texto mais ícone, sem botão de dispensar), rodapé com data de corte e links.
- `CartaoMetrica`: cabeçalho, pergunta, base, nota expansível com cinco seções mais "Nesta tela" (`aria-expanded`, `aria-controls`, não move o foco), leitura, rodapé com "Filtros aplicados / Não afetado por", aviso de critério, quatro estados, `aria-busy`, primeiro erro `role="alert"` e os demais `status`.
- Filtros: aplicação imediata, histórico (Voltar) com agrupamento por popover, chips removíveis com rótulo acessível, "Limpar filtros" só fora do padrão, folha em <768, `aria-live` anunciando filtros, aviso de links inválidos com "Entendi", validação do período personalizado ligada por `aria-describedby`.
- Tema: tokens semânticos, aplicação antes da pintura (`index.html`), `lang="pt-BR"`, foco 2 px com deslocamento de 2 px, `prefers-reduced-motion` global.

## Recomendação
Corrigir A1 a A6 e A8 antes da fase B (A7 depois da verificação no navegador). M1, M2, M3 e M5 também antes da fase B, pois mudam o padrão replicado. Os demais podem ser tratados como dívida registrada. Itens para o QA verificar no navegador: A7, navegação por setas nas barras do Recharts (spec 8.4, até 12 marcas), reflow em 320 px e axe nos dois temas.

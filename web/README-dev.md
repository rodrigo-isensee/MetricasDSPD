# Guia para quem constrói os painéis (fase B)

Base pronta: biblioteca de cálculo, gerador de dados fictícios, camada de dados, shell, filtros na URL, componentes e gráficos. **Painéis só consomem `useMetrica` e os componentes**: não calculam nada.

Comandos (na raiz do monorepo): `pnpm run dev` · `pnpm run lint` · `pnpm run typecheck` · `pnpm test` · `pnpm run build` · `pnpm run check` (lint + typecheck + testes + prettier) · `pnpm run pronto` (tudo, em todos os workspaces).
Latência simulada do mock: 150 a 400 ms por chamada (sorteio determinístico); `VITE_MOCK_LATENCIA=0` zera (E2E, medição).
Parâmetro oculto para validação: `?mock=carregando|erro|vazio|erro:<id>` (ex.: `?mock=erro:o3`); também `erro-uma-vez:<ids>` e listas por vírgula. Só vale com a fonte mock e nunca vai em links.

## Regras que o lint impõe

- `features/**` e `components/**` **não importam** `@metricas-dspd/metricas` nem `@metricas-dspd/mock` (só `data/` e `@metricas-dspd/contratos`).
- Recharts só dentro de `components/charts/`.
- Fronteiras (ADR 0002, `eslint.config.js`): `packages/mock/src/businessmap` × `acelerato` e `packages/metricas/src/businessmap` × `acelerato` sem import cruzado; `core` não importa os domínios nem a raiz; os domínios não importam a raiz (`calcular`, `visaoGeral`, `index`); `packages/contratos` só importa `zod`; `data/**` fora de `data/mock` não importa `@metricas-dspd/metricas` nem `@metricas-dspd/mock`, e `data/mock` só por `import()` dinâmico (ou `import type`); `components/charts` repete a regra da UI. `Math.min/max` com spread é proibido (use `minimo`/`maximo`).
- BusinessMap e Acelerato nunca se importam; `Math.random`, `Date.now` e `new Date()` sem argumento são proibidos em `packages/mock` e `packages/metricas`.
- Nada de pessoa: nenhum DTO traz responsável, agente ou usuário. Equipe nunca vira série, cor, coluna ou legenda.

## Como criar um painel

Exemplo completo: `src/features/operacional/` (cartão `components/CartaoO4.tsx`, página `OperacionalPage.tsx`, notas `notas.ts`).

1. **Página**: use o molde do painel. Ele entrega cabeçalho, barra de filtros (URL), contexto dos cartões e os filtros já tipados.
   ```tsx
   export default function TaticoPage() {
     return (
       <PainelFluxo painel="tatico" slug="tatico" titulo="Tático" pergunta="..." publico="...">
         {(filtros) => <CartaoT2 filtros={filtros} />}
       </PainelFluxo>
     )
   }
   export const handle = { titulo: 'Tático' } // usado no <title>
   ```
   Sustentação usa `PainelSustentacao` (filtros próprios, tipo diferente). A rota já existe e é lazy (`app/router.tsx`).
2. **Cartão**: um componente por métrica em `features/<painel>/components/`.
   ```tsx
   const q = useMetrica('T2', filtros)        // { estado, dados, erro, atualizando, recarregar }
   <CartaoMetrica codigo="T2" titulo=... pergunta=... estado={q.estado} base={q.dados?.base}
     criterios={q.dados?.criterios} leitura={fraseGeradaDosDados} nota={NOTAS.T2}
     aplicaveis={APLICABILIDADE_FLUXO.T2} fonte="BusinessMap" granularidade="demanda"
     onTentarDeNovo={q.recarregar} erro={q.erro} className="lg:col-span-6">
     {q.dados && <Grafico .../>}
   </CartaoMetrica>
   ```
   O `CartaoMetrica` já trata carregando, erro, vazio e ok; esmaece durante a atualização; mostra nota, base, rodapé (fonte, granularidade, "Filtros aplicados / Não afetado por") e "Ver como tabela". "Amostra insuficiente" é **por estatística**: dentro do corpo, quando `estatistica.status === 'insuficiente'`, renderize `<AmostraInsuficiente n={...} />` no lugar do gráfico e passe `baseVariante="insuficiente"` ao cartão se a estatística principal sumiu.
3. **Frase de leitura**: monte a partir do DTO (ex.: "85% em até 9 dias úteis"). Use `lib/formatar.ts` (`fmtDiasUteis`, `fmtPct`, `fmtHorasUteis`, `fmtMes`, `fmtData`...).
4. **Gráficos**: só os de `components/charts/` (abaixo). Todo gráfico traz a tabela equivalente.
5. **Seletor local** (tipo, classe, aba): `useParametroLocal('o3', valoresValidos, padrao)` grava `?o3=melhoria` na URL (replace). Use `SeletorLocal` para as abas. Os DTOs trazem **todas as classes de uma vez**; o painel escolhe a aba. Uma distribuição por vez, nunca misturadas.
6. **Cadência** do Operacional: `useParametroLocal('cadencia', ['diaria','semanal'], 'diaria')` + `SeletorCadencia`.
7. **Faixa "Pede atenção"**: `FaixaAtencao` com itens `{ id, texto, para: '#o2' }`. Monte os itens a partir dos DTOs já carregados.
8. **Notas metodológicas**: um arquivo `features/<painel>/notas.ts` por painel, `Record<codigo, TextoNota>` com as cinco seções da spec (UX seção 4). Nome, pergunta e meta de cada métrica já estão em `src/content/catalogo-metricas.ts` (`entradaDoCatalogo('O3')`).

## Consumindo dados

`useMetrica(id, filtros)` devolve o DTO já calculado (tipos em `@metricas-dspd/contratos`, validados por zod nos testes). O TypeScript impede pedir `S*` com filtros de fluxo. `estado`: `carregando | erro | vazio | ok` (`vazio` = `base.n === 0`). Regras de amostra mínima, janelas, percentis e marcações de critério já vêm decididas pela biblioteca; **nunca recalcule na UI**.

- Todo resultado tem `base` (n, unidade, janela) e `criterios` (`serie` e `janela`: mudanças de critério a marcar).
- Estatísticas de distribuição vêm como `{ status: 'ok', n, valor } | { status: 'insuficiente', n, minimo: 20 }`; taxas como `{ status, k, n, pct? }` (com "k de n" sempre).
- `statusMeta`: `dentro | fora | sem-referencia` já decidido; mostre com `StatusMeta` (ícone + texto).
- Tempos: BusinessMap em dias úteis; Sustentação em **horas úteis** (use `fmtHorasUteis`).
- Janela de percentis: constante única `JANELA_POR_GRANULARIDADE` em `packages/metricas/src/core/janela.ts` (hoje 12 semanas para tudo). O DTO traz `janelaPercentis`; exiba `SeloJanela` quando o período escolhido difere dela.
- Visão geral: `useMetrica('VISAO_GERAL', {})` devolve alertas e indicadores por nível (códigos em `AlertaCodigo`; o texto de cada alerta é do painel).
- Espera invisível: `EI_FL1`, `EI_FL2`, `EI_FL3` (fluxo) e `EI_SUST` (Acelerato, bloco separado). Use `ParEspera` (nunca uma barra isolada).
- Opções de filtro: `useOpcoesFiltro('businessmap' | 'acelerato')`. Mudanças de critério: `useCriterios()`.
- Para dois conjuntos de filtros na mesma página (Espera invisível com bloco de Sustentação): `useFiltros('sustentacao', { prefixo: 'sust_' })`.

## Filtros e URL

`useFiltros(painel)` é o único ponto de leitura/escrita (URL = fonte da verdade): `filtros`, `definir`, `remover`, `limpar`, `chips`, `invalidos`. Padrões e filtros por painel em `features/filtros/paineis.ts`. Parâmetros: `equipe`, `tipo`, `sistema`, `prioridade`, `periodo` (+ `de`/`ate`), `cadencia`, `o2`, `o3`..., `s3`... (spec UX 2.5). Navegação entre painéis de fluxo carrega os filtros; Sustentação e Visão geral vão limpos.

## Componentes compartilhados (`components/ui`)

| Componente                                                                                    | Uso                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `CartaoMetrica`                                                                               | Anatomia 4.0 (cabeçalho, pergunta, base, nota, leitura, corpo, rodapé) e os 4 estados                               |
| `BadgeBase`, `AmostraInsuficiente`, `CelulaInsuficiente`                                      | Base amostral; estado "n de 20" com `role="meter"`; célula "— amostra insuficiente"                                 |
| `NotaMetodologica`, `TextoNota`                                                               | Nota expansível (5 seções + "Nesta tela")                                                                           |
| `StatusMeta`, `NumeroGrande`, `Dica`, `SeloJanela`                                            | Status (ícone+texto), KPI com texto completo, tooltip, selo de janela                                               |
| `EstadoVazio`, `EstadoPositivo`, `EstadoErro`, `EsqueletoCartao`                              | Estados (o cartão já os usa)                                                                                        |
| `FaixaAtencao`, `Secao`, `CabecalhoPainel`                                                    | Faixa "Pede atenção", seção `h2` em grade de 12 colunas (cartões usam `lg:col-span-N`), cabeçalho com "Copiar link" |
| `SeletorLocal`, `SeletorCadencia`, `AlternarTabela`, `TabelaDados`, `AvisoCriterio`, `Chips*` | Abas locais, cadência, tabela equivalente, aviso de critério, chips de rodapé                                       |
| `ProvedorContextoPainel`                                                                      | Já fornecido pelos moldes de painel (filtros ativos, remover, limpar)                                               |

Gráficos (`components/charts`): `Barras` (colunas/barras; agrupado, empilhado, 100%; linhas de referência; linha em eixo direito), `Histograma` (a partir de `FaixaHistograma[]`), `SerieLinhas` (linhas, faixas entre linhas, marcadores de mudança de critério), `AreaEmpilhada`, `Dispersao` (formas: círculo, losango, triângulo, anel), `ParEspera`, `MapaCalor`. Cada um recebe dados já prontos e `descricao` (caption da tabela equivalente); períodos em andamento ficam listrados com `emAndamento`.

## `data-testid` (spec UX, seção 10)

`painel-{slug}`, `filtro-{equipe|tipo|sistema|periodo|prioridade}`, `chip-filtro-{nome}`, `limpar-filtros`, `copiar-link`, `metrica-{CODIGO}`, `base-{CODIGO}`, `nota-{CODIGO}`, `tabela-{CODIGO}`, `amostra-insuficiente-{CODIGO}`, `estado-vazio|erro|carregando-{CODIGO}`, `marcador-criterio`, `aviso-dados-ficticios`, `ei-cliente|time|indice-{nivel}` (hoje `par-cliente`, `par-time`, `par-indice` em `ParEspera`: envolva com o testid do nível), `seletor-local-{codigo}`, `seletor-cadencia`. Extras: `leitura-{CODIGO}`, `faixa-atencao`, `barra-filtros`, `rodape`.
Marcações para o projeto `perf` do QA (ADR 0003): `data-estado="carregando|atualizando|ok|vazio|erro"` em cada `metrica-{CODIGO}` e `data-atualizando` em `anuncio-painel`.

## Testes

Testing Library focada em comportamento (`getByRole`, `getByLabelText`). Gráficos: teste o conteúdo pela **tabela equivalente** ("Ver como tabela"), não pelo SVG. `src/test/helpers.tsx` tem `renderizarApp(url)` (app completo com a fonte mock). `TZ=UTC` é aplicado pelo script `test`.

## Perguntas em aberto (escolhas provisórias já aplicadas)

Janela 12 semanas para tudo (uma linha para mudar); percentil tipo 7; expediente 8h–12h/13h–17h e feriados nacionais; EI com marcos da spec; P1 em horas úteis como as demais prioridades (modo corrido existe na lib, desligado); sem filtro por agente. Veja o resumo da fase A para a lista completa.

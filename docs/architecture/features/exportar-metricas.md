# Plano técnico: exportar métricas em PDF (pedido 008)

UX: `docs/ux/exportar-metricas/` (01 a 04). Decisões do usuário: `docs/alinhamentos/2026-10-10-decisoes-do-usuario.md` §10 (D-1 a D-5). Custo zero, sem back-end, sem migração, sem endpoint, sem ADR nova (decisão local ao front; fica registrada aqui).

## 1. Estratégia de geração (decisão)
**jsPDF + svg2pdf.js, carregados por `import()` dinâmico só ao clicar em "Gerar arquivo"** (chunk próprio `exportar-pdf`, fora do inicial e de qualquer rota).

| Opção | Veredito |
|---|---|
| `@media print` / `window.print()` | Descartada: zero bundle, mas o usuário vê o diálogo do navegador, não controla o nome do arquivo, o resultado varia por navegador e o E2E não consegue baixar e ler o arquivo de forma estável. |
| `@react-pdf/renderer` | Descartada: chunk de centenas de KB gzip, fontes embutidas, segundo motor de layout paralelo ao da tela. |
| `pdf-lib` | Descartada: bom para manipular PDF, mas sem API de texto/layout de alto nível; mais código nosso. |
| jsPDF (texto) + svg2pdf.js (gráficos) | Escolhida: texto real e selecionável (Helvetica padrão cobre pt-BR), título e idioma (`setProperties`, `lang` pt-BR) , gráficos vetoriais, pouco código. |

- Orçamento: novo item **F10, chunk `exportar-pdf` (jsPDF + svg2pdf + módulo), < 150 KB gzip, carregado só sob demanda; bloqueia se entrar no inicial (F6) ou no chunk de rota (F7), alerta se passar do tamanho.** O QA acrescenta a medição ao relatório de bundle (ADR 0003; atualizar a tabela da ADR com a linha F10 neste cartão).
- Fallback se o svg2pdf falhar num gráfico: tabela com os pontos do DTO (também serve de equivalente textual acessível).

### Resultado do spike E-1 (2026-10-10)
Medido com `pnpm run build`: jsPDF + desenhista = **135,95 KB gzip** (F11 < 150, ok); com svg2pdf.js o chunk ia a **160,5 KB** (estoura). **Decisão: sem svg2pdf; o fallback do plano vale** (tabela com os pontos do DTO no lugar do gráfico, que também é o equivalente textual acessível). Não há Recharts fora da tela nem SVG no PDF. A linha do orçamento ficou **F11** na ADR 0003 (o F10 já era o Lighthouse). As dependências opcionais do jsPDF (`html2canvas`, `purify`, `canvg`) saem em chunks próprios que o app nunca pede.

## 2. Conteúdo obrigatório sem recalcular
Nada é recalculado. O módulo `web/src/features/exportar/` chama `fonte.obter(id, filtros)` (cache do React Query, mesma chave do cartão) e lê o DTO: todo DTO já traz `base` (base amostral/janela/"amostra insuficiente") e `criterios` (mudança de critério); a nota metodológica resumida vem do mesmo catálogo/texto que o cartão usa (reutilizar o seletor existente, não duplicar texto); data de geração e "Dados até" vêm de `fonte.dataReferencia()`; `fonte.tipo === 'mock'` imprime em todas as páginas o rodapé "Dados fictícios". Se o cartão mostra "amostra insuficiente", o PDF mostra o mesmo texto e nenhum percentil (a regra de < 20 itens já vem decidida no DTO).
Cada bloco de métrica imprime: título, fonte (BusinessMap ou Acelerato), filtros aplicados em texto, janela, base, gráfico, nota, marca de mudança de critério. **Um único modelo `BlocoExportacao` puro (DTO + filtros -> blocos de texto e gráfico)** gera o conteúdo; o desenhista jsPDF só o pinta. Isso permite teste unitário sem PDF.

## 3. Gráficos
Os componentes de `components/charts` (Recharts) são montados fora da tela (container oculto com tamanho fixo, tema claro forçado para impressão), o `<svg>` resultante vai ao svg2pdf. Sem html2canvas, sem imagem raster. Nada de gráfico novo nem cálculo novo.

## 4. Escopo, agrupamento e regras
- Escopo = o que está visível: o seletor usa as preferências do 007 (`ProvedorPreferencias`); métrica oculta não aparece no diálogo nem no PDF (D-2).
- Botão "Exportar" por painel (inclui a Visão geral, D-3) e "Exportação personalizada" (D-4) com marcação nível a nível. Cada métrica usa os próprios filtros (lidos do estado/URL do painel de origem) e a própria fonte.
- Ordem no PDF: seções por fonte, **BusinessMap e depois Acelerato, em seções separadas com capa de seção**; nunca um gráfico, total ou percentil que some as duas. Story, frente e projeto continuam em blocos separados porque cada DTO já é de um tipo.
- Nada por pessoa: o modelo só aceita DTOs agregados; teste garante ausência de campos de pessoa.
- Sem registro das exportações (D-5): nenhum log, contador ou telemetria.

## 5. Nome e limites
- Arquivo: `metricas-dspd_<escopo>_<AAAA-MM-DD>.pdf`, onde `<escopo>` é `visao-geral`, `fluxo-operacional`, `fluxo-tatico`, `fluxo-estrategico`, `sustentacao`, `espera-invisivel`, `<metrica-id>` (uma só) ou `personalizada`. Em minúsculas, sem acento. Se for mock, sufixo `_ficticio` antes da extensão.
- Limite: **12 métricas por exportação** (diálogo desabilita o excedente com mensagem), tempo alvo < 5 s para 12 (medir; alerta, não bloqueio). Resposta direta no cliente, sem fila. Geração em `requestIdleCallback`/quebra por bloco com `await` para não travar a UI; estado "Gerando..." com `role=status`.
- Erro: qualquer exceção -> "Não foi possível gerar o arquivo. Tente de novo." sem detalhe técnico, sem baixar arquivo parcial.

## 6. Testes
- Unitário (Vitest): `BlocoExportacao` para cada família de DTO (base, janela, amostra insuficiente, critério alterado, mock); nome do arquivo; limite; separação BM/AC; ausência de campo pessoal.
- Sistêmico/componente (Testing Library): diálogo (vazio, carregando, erro, sucesso, foco preso, Esc, retorno do foco, status anunciado); só métricas visíveis; chunk carregado só no clique (mock do `import()`).
- E2E (Playwright): clicar em Exportar, capturar o `download`, ler o PDF com `pdfjs-dist` (apenas dev dependency do `e2e`) e conferir texto: título, fonte, base, janela, data, nota, "Dados fictícios" no mock; arquivo da personalizada com BM antes de AC; métrica oculta ausente; axe no diálogo a 375 e 1280, nos dois temas.

## 7. Respostas às 6 perguntas do UX
1. **No cliente**, com jsPDF: texto selecionável, título e idioma pt-BR definidos; fidelidade vetorial dos gráficos via svg2pdf.
2. **Nada novo do back-end**: o conteúdo obrigatório já está nos DTOs (`base`, `criterios`), no catálogo de notas e em `FonteMetricas` (`tipo`, `dataReferencia`); a exportação lê os mesmos dados do cartão, sem recalcular.
3. **Sem zip nem imagem** (D-1): só PDF.
4. **12 métricas e < 5 s alvo; resposta direta no navegador**, sem fila.
5. **Nada registrado**, nem contador agregado (D-5).
6. **Mock**: `tipo==='mock'` põe "Dados fictícios" em todas as páginas e `_ficticio` no nome; o E2E baixa o PDF, extrai o texto com `pdfjs-dist` e asserta os campos obrigatórios.

## 8. Riscos
- Texto de eixos do SVG pode virar contorno no svg2pdf (aceito; os obrigatórios são texto jsPDF).
- Peso do chunk: medir cedo (cartão 1); se estourar, trocar svg2pdf por tabelas.
- Layout A4 versus largura de 375 px: o PDF é sempre A4 retrato (legível a 100%); a 375 px só o diálogo é responsivo.
- Divergência entre o que a tela e o PDF mostram: mitigada por reutilizar cache, seletores e notas, e pelo teste de conteúdo.

## 9. Cartões (todos `react-frontend` salvo indicação)
1. **E-1** Spike de bundle e gráfico: jsPDF + svg2pdf em chunk dinâmico, um histograma real em PDF, medição F10 (e linha F10 na ADR 0003 pelo arquiteto). Bloqueia os demais.
2. **E-2** Modelo puro `BlocoExportacao` + nome de arquivo + limite + testes unitários (paralelo a E-3).
3. **E-3** Diálogo de exportação (UI, estados, a11y) com a seleção de visíveis do 007, sem gerar ainda (paralelo a E-2).
4. **E-4** Desenhista PDF (capa, seções BM/AC, rodapé fictício, gráficos) ligado ao diálogo; botão por painel e na Visão geral.
5. **E-5** Exportação personalizada nível a nível.
6. **E-6** `qa-engineer`: plano, E2E com leitura do PDF e axe; medição F10 e tempo.
7. **E-7** `ux-designer`: revisão da tela implementada.
Ordem: E-1, depois E-2 e E-3 em paralelo, depois E-4, E-5, E-6 (E-6 pode começar o plano ao fim de E-1), E-7.

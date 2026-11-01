# Revisão de UX da F6 (pedido 052, E2.74)

Base: `docs/ux/integracao-real/06-delta-2026-10-29.md` (P-1, P-4, P-5), branch `feature/052-f6-painel`, ponta db37a4b. Revisão por leitura do código do front e dos testes de componente; nenhuma tela foi aberta no navegador e nenhum teste foi executado (o papel não tem Bash). Contraste calculado pelos tokens de `web/src/styles/tokens.css`.

## Veredito

**Aprovado com ressalvas.** Nenhum achado crítico ou alto. O que o delta decidiu (P-1, P-4, P-5) está implementado e coberto por teste. Os três achados médios são lacunas de comunicação que o delta não previu; os baixos são ajustes de texto e leitor de tela. Nenhum bloqueia o PR da F6.

## Conferência contra a especificação

| Item | Resultado | Onde |
|---|---|---|
| Texto "N cartões ainda com dados fictícios" | Conforme, com singular ("1 cartão ainda com dados fictícios"); ícone decorativo, texto sempre presente | `OrigemDosCartoes.tsx:51-62` |
| Nota nos painéis FL1, FL2, FL3 e Sustentação; some com N = 0 e na fonte mock | Conforme (o aviso global cobre a fonte mock); entra no slot `frescor` do cabeçalho, abaixo do selo de frescor | `PainelPagina.tsx:91-96` |
| Nota independe das preferências (P-5) | Conforme: conta ocultos; continua com todos ocultos | `OrigemDosCartoes.tsx:41-45`, teste `origem.test.tsx:154` |
| Linha de motivo ao lado do selo | Conforme: texto visível, `text-texto-2` 7,5:1 sobre branco; só O8, O12, O14 a O18 têm motivo (O19 a O26 e FL2/FL3 sem, como diz o contrato) | `Ficticios.tsx:49-62`, `origem.ts:30-38` |
| Selo "Dados fictícios": ícone + texto, não só cor | Conforme; `#8a5a00` sobre `#fff4dc` = 5,4:1; no escuro `#e0b040` sobre `#3a2e0f` com folga | `Ficticios.tsx:37-47` |
| Selo da Visão geral | Presente (correção do A1 do review), com lacuna de explicação: achado A3 | `VisaoGeralPage.tsx:245-249` |
| Ordem do selo no PV1 | O delta não fixa ordem. No PV1 o selo de origem vem por último, depois de base e do trimestre, igual aos outros cartões: consistente | `CartaoMetrica.tsx:235-247`, `CartaoPV1.tsx:204-215` |
| Exportar: fonte, "Atualizado em", frescor, calibração e fictício por bloco (P-4) | Conforme, em duas linhas de texto; âmbar `#8a5a00` sobre branco no PDF (5,9:1), com "sim/não" escrito, sem depender de cor | `desenhista.ts:130-138`, `modelo.ts:52-86` |
| Exportar: Visão geral decide o fictício pela origem de VISAO_GERAL | Conforme | `gerar.ts:78,91-95` |
| Notas do O6 e do SLE (H-15) e do O3 (H-24) | O6 conforme (só com a métrica real). A nota do SLE é do T2 (FL2, mock): hoje nunca aparece, correto e fora do recorte. O3 conforme (nota vem do resultado) | `CartaoMetrica.tsx:111-118,259-271`, `origem.ts:50-65` |
| Filtro de equipe com times reais também no FL2 e no FL3 (A3 do review) | No FL3 não há filtro de equipe (`BarraFiltros.tsx:17-18`), então não aparece na tela. No FL2 aparece: achado A2 | `referencia/servico.ts:25` |
| Foco e teclado | Selo, motivo e nota não são interativos e não entram na ordem de foco; nada novo para operar. Títulos dos cartões seguem com `tabIndex=-1` | `CartaoMetrica.tsx:203` |
| Leitor de tela | Ícones com `aria-hidden`; nota e selo são texto simples. Ressalva no achado A4 | `origem.test.tsx:128-137` |
| Alvos de toque | Nada novo clicável | n/a |

Hipótese não confirmada: o que o servidor faz quando um cartão fictício (base do seed) recebe um filtro de equipe com nome de time real. Li só o lado do front e a lista de opções. O A2 depende dessa confirmação.

## Achados

- A1 · médio · `web/src/features/exportar/DialogoExportar.tsx:234`: com a API real, arquivo misto não avisa na prévia nem na capa (`desenhista.ts:167`) nem no nome; só a linha de cada bloco. Corrigir: "N de M blocos com dados fictícios" na prévia e na capa; nome do arquivo vai ao dono.
- A2 · médio · `web/src/features/coleta/OrigemDosCartoes.tsx:22`: no FL2 o filtro lista times reais e os cartões fictícios vêm do seed; escolher um time pode zerar o cartão sem explicar. Corrigir: nota "o filtro de equipe não recorta dados fictícios" (confirmar o servidor).
- A3 · médio · `web/src/features/visao-geral/VisaoGeralPage.tsx:245`: selo "Dados fictícios" sem motivo, longe do frescor "Atual", numa tela que resume métricas reais; parece contradição. Corrigir: motivo para VISAO_GERAL ("resumo ainda com dados fictícios") e selo junto ao frescor.
- A4 · baixo · `web/src/components/ui/Ficticios.tsx:53`: selo e motivo são spans vizinhos sem separador; o leitor de tela lê "Dados fictícios aguardando campo no quadro" de uma vez. Corrigir: ": " em texto oculto ou " · " entre os dois, mantendo os `data-testid`.
- A5 · baixo · `web/src/features/coleta/OrigemDosCartoes.tsx:44`: N conta cartões ocultos e de outras cadências; na visão diária o usuário vê menos selos que N. Corrigir: manter o texto do delta e dar `title` e texto de leitor de tela "inclui cartões ocultos e de outras visões".
- A6 · baixo · `packages/contratos/src/origem.ts:52`: "SLE não definido." é seco e usa sigla; a nota fixa do O6 aparece também sob esqueleto e erro (`CartaoMetrica.tsx:259`). Corrigir: "SLE (prazo acordado) não definido." e nota fixa só no estado ok; o texto pede ok do dono.

## Fora do que revisei

QA, revalidação do review (E2.78), recomendados da segurança, F6b e a conferência no navegador (contraste e foco reais, 375 px) ficam para o QA da E2.75.

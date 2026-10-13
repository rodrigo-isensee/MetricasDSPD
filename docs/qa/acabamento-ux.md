# Parecer de QA - acabamento de UX dos mocks (L-3 a L-9, M-4, M-5)
Branch `feature/acabamento-ux` (2 commits sobre `develop`). Referências: `docs/ux/lacuna-de-valor/06-revisao.md`, `docs/ux/metricas-fora-do-nucleo/06-revisao.md`.

## Veredito
Aprovado. Nenhum bug aberto. Uma observação de baixa severidade (contraste gráfico das faixas claras) fica para ciência do UX.

## Review técnico (mudanças só de interface)
- Regras intactas: "k de n" e o corte abaixo de 20 (base insuficiente) não foram tocados; `Concordam` continua faixas 4 e 5 (só texto: legenda e nota passam a dizer "só o lado que concorda"); nada individual, sem média, meta ou ranking (os testes LV-02/LV-04 de termos proibidos seguem verdes).
- L-3: com 1 trimestre sai a tabela e entra a legenda de primeiro ciclo (`> 1` e `=== 1` cobertos em `percepcao.test.tsx`).
- L-6: rampa de um matiz (`acento` a 8/20/30/40/100%), sem vermelho; a faixa nunca depende só da cor (número em cada trecho, legenda e tabela equivalente).
- L-8: data da quebra pela marca T2.6 de `criterios.serie` entre o trimestre anterior e a coluna; sem marca, vigência só se a versão é a vigente. Comparação de strings `AAAA-Tn` correta.
- L-5 (`min-w-8` a partir de 100 respostas) e L-9 (comentário do catálogo): sem efeito de regra. Código limpo, testes novos no mesmo arquivo.

## Execução
| Verificação | Resultado |
|---|---|
| E2E `lacuna-de-valor` + `complementares` (chromium, 1280 e 375, axe AA) | 53 de 53 passaram (inclui o novo LV-15) |
| `acabamento-ux-evidencias.spec.ts` (novo): PV1 em 1280/375 x claro/escuro, axe na página e no cartão | 4 de 4; zero violações (nenhuma, nem informativa) |
| `pnpm run pronto` | verde na primeira execução, sem timeout: web 758 testes, mock 157, metricas 504, contratos 41, server 300 (62 pulados já existentes, dependem de banco), cobertura de ramos 100% nos pacotes, `docs:check` ok |

Observação: os specs existentes não cobriam o tema escuro; o spec novo cobre (axe e medição).

## Contraste real da rampa azul (cor renderizada no Chromium, composta sobre o fundo do cartão)
Texto (mínimo 4,5:1) e faixa contra o fundo (gráfico, mínimo 3:1). Dados em `evidencias/acabamento-ux/medidas-*.json`.

| Faixa | Claro: texto/faixa | Claro: faixa/fundo | Escuro: texto/faixa | Escuro: faixa/fundo |
|---|---|---|---|---|
| 1 (8%) | 14,65 | 1,12 | 12,64 | 1,14 |
| 2 (20%) | 12,22 | 1,35 | 9,95 | 1,45 |
| 3 (30%) | 10,39 | 1,58 | 8,06 | 1,78 |
| 4 (40%) | 8,77 | 1,88 | 6,48 | 2,22 |
| 5 (100%) | 6,09 | 6,09 | 7,59 | 7,02 |

- Texto: todos passam com folga nos dois temas (menor valor 6,09; no escuro, 6,48 na faixa 4). Resultados idênticos em 1280 e 375.
- Gráfico: só a faixa 5 passa 3:1 isolada. As faixas 1 a 4 ficam entre 1,12 e 2,22 contra o fundo, nos dois temas. Mitigação existente: a barra tem borda `borda-controle` (alto contraste), cada trecho traz o número e a legenda e a tabela equivalente existe, então nenhuma informação depende só da cor. Não reprovo (WCAG 1.4.11 trata de informação que só a cor transmite), mas a distinção entre faixas vizinhas é fraca. Sugestão ao `react-frontend`, a critério do UX: subir os passos 1 a 3 (ex.: 15/30/45%) se quiser distinguir as faixas só pela cor.

## Evidências (`docs/qa/evidencias/acabamento-ux/`)
`pv1-1280-claro.png`, `pv1-1280-escuro.png`, `pv1-375-claro.png`, `pv1-375-escuro.png`, `medidas-*.json`. Na captura do cartão a 1280 o cabeçalho fixo da página aparece sobre o cartão por ser captura de elemento rolado; é artefato da captura.

## Bugs
Nenhum.

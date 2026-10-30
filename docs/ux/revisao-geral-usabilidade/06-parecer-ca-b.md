# Parecer de UX: o CA-B é alcançável com cabeçalho e índice fixos? (048-03 = A, 4ª volta)

Data: 2026-10-30. Autor: ux-designer. Branch `feature/048-usabilidade`, head 7d1a48e. Parecer recomenda; a mudança de critério é do dono (R-DECISAO).

## Pergunta
O QA (`docs/qa/bugs/048-03-axe-target-size-na-sustentacao.md`) pergunta se o CA-B ("axe `target-size` sem violação séria em todas as posições de rolagem", passos de 100 px, Sustentação a 1280 px) é alcançável com o cabeçalho (49 px) e o índice "Ir para" (33 px) fixos, 82 px no total, que a decisão 048-03 = A manteve.

## Base
1. WCAG 2.2, critério 2.5.8 (Tamanho do alvo, mínimo, AA): o alvo tem pelo menos 24x24 px CSS, ou o círculo de 24 px centrado no alvo não toca outro alvo (exceção de espaçamento). Há outras exceções (link em frase corrida, controle nativo sem estilo, essencial). O critério não prevê nada sobre alvo coberto por elemento fixo.
2. O axe `target-size` mede a área visível do alvo: desconta as áreas cobertas por elementos sobrepostos (inclusive cabeçalho `position: fixed`). Alvo totalmente coberto é ignorado (não é clicável); alvo parcialmente coberto tem a área restante medida, e se ela fica abaixo de 24 px e a exceção de espaçamento não vale, a regra falha. (Descrição do comportamento da regra conforme a documentação do axe-core; não reexecutei o axe nesta análise.)
3. Evidência do QA: todas as falhas são alvos de 24 px (links em listas, "Ocultar esta métrica", `alternar-tabela`) cortados pelas faixas de 0 a 82 px nas posições y=1700, 1900, 4500, 7282, 8700 e 9700. A barra de filtros já não é a causa.
4. Consequência geométrica: qualquer alvo de altura h que atravessa a borda inferior de uma faixa fixa passa, durante a rolagem, por todas as alturas visíveis entre 0 e h. Se h < 24 + 82 ainda há posições com visível entre 1 e 23 px. Só a ausência do alvo na faixa evitaria isso, e o conteúdo rola por ela por definição. Então, com faixa fixa, o "em todas as posições" depende de sorte de layout (onde cai cada alvo nos múltiplos de 100 px), não de projeto, e quebra a cada mudança de conteúdo ou de viewport.

## Conclusão: B (não alcançável como escrito)
Com cabeçalho e índice fixos, o CA-B, tal como escrito, não é garantível por técnica de interface. Mitigações possíveis (espaçar cada alvo para valer a exceção de espaçamento; alvos de 24 px com folga) reduzem falhas, mas não as eliminam, e inflariam o layout em toda a tela (risco de CLS, ADR 0003 F2, e de regressão visual). Não recomendo.

Esse cenário também não é um problema real de uso: o alvo parcialmente coberto está em movimento, a pessoa o rola para a área livre antes de clicar. O risco que o critério quer evitar (alvo inalcançável ou ilegível) é tratado por duas garantias estáveis: (a) alvo com tamanho nominal de 24 px ou mais, fora da faixa fixa; (b) alvo que recebe foco ou chega por âncora não fica sob a faixa (WCAG 2.4.11, Foco não obscurecido, AA).

## Redação alternativa do CA-B (mantém a intenção: alvo usável)
CA-B' QUANDO a página é percorrida em passos de 100 px, do topo ao fim, na Sustentação a 1280 px, O SISTEMA DEVE passar o axe `target-size` sem violação séria, considerando somente alvos que estejam inteiramente fora da faixa fixa superior (cabeçalho mais índice, 0 a 82 px; alvo total ou parcialmente sob a faixa é desconsiderado); COMP-01 e `aba-p3` ficam verdes sem rolagem forçada.
CA-B'' (complemento, verificável) QUANDO um alvo recebe foco por teclado ou é destino de âncora O SISTEMA DEVE posicioná-lo abaixo da faixa fixa (sem `elementFromPoint` devolvendo o cabeçalho ou o índice no ponto central do alvo). Já é coberto em parte por CA-C, USAB-05b e CT-31; falta estender ao foco por Tab.

## Opções e efeito
- B1 (recomendada): adotar CA-B' e CA-B''. Efeito: o teste USAB-19 e o CT-29 passam a ignorar a faixa de 82 px (ajuste de teste, feito pelo QA depois da decisão); o cabeçalho e o índice continuam fixos (048-03 = A, U3 e P2 intactos); nenhuma mudança de layout, CLS preservado; o risco residual é só um alvo visto cortado durante a rolagem, sem impacto de uso.
- B2: tornar o índice (ou índice e cabeçalho) não fixo na Sustentação. Efeito: faixa menor ou nula, o CA-B original fica alcançável; mas reabre U3 (índice fixo) e a decisão 048-03 = A, e piora a navegação em página de 10 mil px.
- B3: cabeçalho que recolhe ao rolar para baixo e volta ao rolar para cima. Efeito: reduz a faixa na descida, mas o CA-B original continua falhando na subida; é componente novo (animação, `prefers-reduced-motion`, CLS) por ganho pequeno. Não recomendo.
- B4: manter o CA-B como está e aceitar o teste vermelho. Efeito: a 048-03 nunca fecha; não recomendo.

## Recomendação
B1. Pergunta ao dono (via Jarvis): aprova trocar o CA-B pelo CA-B' e acrescentar o CA-B''? Se sim, a CT-29 e o USAB-19 mudam para excluir a faixa de 82 px, e o `react-frontend` só garante que o link sob o cabeçalho do CT-29 (CA-B'') fique abaixo dele.

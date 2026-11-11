---
pedido: 089-apontamento-qualidade-d2-d3
branch: feature/089-apontamento-d2-d3-web
commit: 7a9b50557a47c0189dc01f60a5c66bc391b98a3c
etapa: E1.4 (ux-designer): revisão de interface
---

# Revisão de interface: aba Apontamento, rótulo "Sem comentário" e nota de execução técnica (pedido 089)

Escopo: `web/src/features/apontamento/textos.ts`, `components/CartoesQualidade.tsx`, `components/CartaoDistribuicao.tsx`, contra `docs/ux/059-aba-apontamento-textos.md` e a seção 4.2 do plano 089. Itens de acessibilidade marcados `lido` (pelo código); nenhuma ferramenta foi rodada, o QA mede (`@axe`).

## Veredito

**Aprovado com ressalvas.** Sem achado crítico ou alto. A entrega cumpre o plano 4.2: o rótulo mudou no subgrupo, no achado e no botão; a nota de execução técnica fica fora da lista de flags, lê `distribuicao.porSubgrupo` sem calcular nada no front, e o "Como ler" do subgrupo explica a diferença entre subgrupo e flag. Nada cita ou sugere avaliação individual (a nota é do recorte inteiro, sem pessoa, meta ou semáforo). Há 3 achados médios e 4 baixos de redação e acessibilidade; os médios devem ser tratados antes do PR ou virar decisão registrada do dono.

## Achados

### Médio

**M-1. Dois "Sem comentário" com universos diferentes continuam lado a lado, e a explicação está só numa nota recolhida.**
- Onde: `textos.ts:49` (flag, qualquer apontamento sem comentário) e `textos.ts:154`, `fixture.ts:183` (subgrupo, sem comentário e sem regra por tipo de card). O explicativo está no "Como ler" do cartão de subgrupo (`textos.ts:154`).
- Por quê: quem lê o gráfico de qualidade vê "Sem comentário: N" e, no cartão de horas por subgrupo, "Sem comentário: M" com N diferente de M. Sem abrir a nota, parece erro de contagem (Nielsen: consistência, prevenção de erros). A frase da nota também é longa e usa "regra por tipo de card", termo interno.
- Correção: manter o rótulo (decisão do plano), mas desambiguar no ponto de uso. Opção recomendada: no gráfico/tabela de subgrupo, rótulo "Sem comentário (sem regra por tipo)"; ou, no mínimo, uma linha visível sob o título do cartão de subgrupo ("Esta contagem é menor que a da Qualidade: aqui não entram apontamentos de Kaizen e Incidente sem comentário, que têm grupo próprio."). Simplificar a nota: "'Sem comentário' aqui conta só apontamentos sem comentário que também não se encaixam em nenhum grupo por tipo de card. No cartão de Qualidade, 'Sem comentário' conta todos os apontamentos sem comentário, por isso o número é maior." (Kaizen e Incidente vêm do plano 4.2; confirmar com o arquiteto antes de citar.)

**M-2. Achados `nao-classificado-alto` e `sem-comentario-alto` podem aparecer juntos com frases quase iguais.**
- Onde: `textos.ts:233` e `textos.ts:247`.
- Por quê: "X% das horas ... caíram em 'Sem comentário'" e "Y% dos apontamentos estão sem comentário" dizem coisas parecidas com bases diferentes (horas × apontamentos, subgrupo × flag). O plano deixou isso como Q2 (sobreposição). Para quem não é técnico parece repetição ou contradição.
- Correção: se os dois permanecerem, diferenciar a redação: "X% das horas apontadas (N apontamentos) estão em 'Sem comentário' e sem regra por tipo de card." e manter a outra como está. Se o dono decidir pela fusão em Q2, manter só `sem-comentario-alto`. O atalho do primeiro ("Ver apontamentos sem comentário", `textos.ts:236`) filtra só o subgrupo, então abre menos itens que o número do segundo achado: rotular "Ver o subgrupo Sem comentário".

**M-3. Botão do cartão de subgrupo com o mesmo texto de outro atalho e resultado diferente.**
- Onde: `CartaoDistribuicao.tsx:146` ("Ver apontamentos sem comentário", filtro de subgrupo) e o atalho do achado `sem-comentario-alto` ("Ver apontamentos", filtro de qualidade, `textos.ts:250`).
- Por quê: o mesmo verbo e objeto levam a listas diferentes (M-1). Texto do botão dentro de `CartaoDistribuicao.tsx` também está escrito à mão, fora de `textos.ts`, contra a convenção do arquivo ("sem número escrito à mão", textos centralizados; o `docs/ux/059` §6 lista o texto como pertencente aos textos).
- Correção: mover a string para `textos.ts` e usar "Ver apontamentos do subgrupo Sem comentário".

### Baixo

**B-1. Singular/plural e unidade mista no título da nota** (`CartoesQualidade.tsx:41`). "Execução técnica: 1 apontamentos" com contagem 1; e a parte entre parênteses é "% das horas" enquanto o número é de apontamentos, o que mistura duas unidades sem aviso. Correção: usar singular quando n = 1 (como já se faz em `INCOMPLETO.titulo`) e escrever "(X% das horas apontadas)". Moveria o formato para `textos.ts` (hoje o título é montado no componente).

**B-2. Título da nota (h4) longo e cheio de números** (`CartoesQualidade.tsx:40-42`). Leitor de tela que navega por títulos ouve toda a linha numérica. A estrutura está correta (lido): `section` com `aria-labelledby`, h4 sob o h3 do cartão (`CartaoMetrica.tsx:224`), hierarquia sem salto. Sugestão: título curto "Execução técnica" e a contagem na linha seguinte, no parágrafo. Não é bloqueante.

**B-3. Jargão "dicionário" sem apoio na nota** (`textos.ts:326`). "Comentário que o dicionário não reconheceu" e "ampliar o dicionário" exigem saber que existe um dicionário de palavras-chave (explicado só no "Critério" do cartão). Correção: "Comentário com texto que a lista de palavras-chave (dicionário) não reconheceu. Não conta como problema de qualidade: é um sinal para ampliar essa lista." Mantém a nota coerente com o subgrupo, que diz o mesmo.

**B-4. Foco e retorno do atalho** (`CartoesQualidade.tsx:45`). O botão é nativo (`Botao`, `type=button`, alvo mínimo 24 px, 44 px abaixo de 768 px, lido em `Botao.tsx`), operável por teclado e com nome acessível próprio; está bem. Mas, ao acionar, o filtro muda sem mover o foco nem anunciar o resultado; o atalho de achados por âncora move o foco ao título (A-12, `CartaoAchados.tsx:41-44`), este não. É o mesmo comportamento do botão pré-existente de subgrupo, portanto não é regressão; fica como melhoria de consistência: anunciar em região `aria-live` "Filtro aplicado: Subgrupo = Execução técnica" ou levar o foco à lista. Verificar com o QA se há anúncio de filtro aplicado em outro ponto da aba antes de pedir mudança.

### Estilo (observação, baixo)

**B-5. Tokens de cor.** A nota usa `border-neutral-300` e `text-xs` fixos (`CartoesQualidade.tsx:38,43`), enquanto o restante da aba usa tokens (`text-texto-2`, `border-borda-controle`, `text-acento`). Risco: contraste e tema diferentes do padrão. Contraste do texto: `lido`, não medido; a borda tracejada é decorativa (sem exigência de 3:1) porque a informação está no texto. Correção: trocar por tokens e manter o texto em `text-sm` ou no padrão dos demais "Como ler".

## Conferências sem achado

- Não depende só de cor: título e texto explicam a nota; a borda tracejada é só reforço (`lido`).
- Nenhum texto sugere avaliação individual ou meta; a nota diz expressamente "não conta como problema de qualidade" e "sinal para ampliar o dicionário", coerente com o "Como ler" do subgrupo (`textos.ts:154`) e com `SEM_META`.
- Quando o percentual está abaixo do piso de 20, a nota mostra "percentual com 20 apontamentos ou mais" (coerente com a regra de não publicar estatística), e a nota some se o servidor não enviar o subgrupo (`return null`), sem erro visível.
- Nada calculado no front; participação lida de `distribuicao.porSubgrupo` (conforme o plano 4.2).
- Texto da nota coincide com a linha da tabela de textos `docs/ux/059-aba-apontamento-textos.md` §6.

## Pendências para o dono (R-DECISAO)

Uma por vez, com recomendação: (1) manter dois "Sem comentário" com desambiguação (recomendado, M-1/M-3), ou renomear o subgrupo (por exemplo "Sem comentário e sem regra por tipo"); (2) Q2 do plano: fundir os dois achados ou manter com redação diferenciada (recomendado manter e diferenciar, M-2).

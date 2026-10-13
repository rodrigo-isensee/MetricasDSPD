# Lacuna de valor (PV1) · 06 Revisão da interface implementada

Data: 2026-10-12 · Branch: `feature/lacuna-de-valor` · Revisora: UX.

## Escopo e método
Contra: `03-ideacao.md`, `05-validacao.md`, decisões 22 a 31 de `docs/alinhamentos/2026-10-11-decisoes-delegadas-ao-time.md`, `docs/ux/design-system.md`, heurísticas de Nielsen e WCAG 2.2 AA.

Limites desta revisão:
- **Revisão estática do código.** Este ambiente não tem execução de comandos: não houve build, preview nem inspeção visual a 375 e 1280 px. Contraste foi calculado pelos tokens de `web/src/styles/tokens.css`; layout vem das classes. Conferir no QA/axe (lista no fim).
- `05-validacao.md` segue "aguardando o usuário" e não existe `especificacao.md` na pasta. A referência efetiva foram a ideação e as decisões 22 a 31 (hipóteses do time até o usuário aprovar).
- O protótipo desta pasta não tem `index.html` legível; o protótipo citado na ideação está em `docs/ux/figma/prototipos/lacuna-valor-*.html` e não foi reaberto.

Arquivos lidos: `web/src/features/percepcao/{CartaoPV1,Distribuicao,Tendencia,notas,formatar}.ts(x)`, `percepcao.test.tsx`, `complementares/CartaoComplementar.tsx`, `sustentacao/SustentacaoPage.tsx`, `content/catalogo-metricas.ts`, `dados/*`, `catalogo/linhas.ts`, tokens.

## Conforme
- **Estados.** Sem pesquisa (sem botão nem campo de envio, coerente com "sem rota de upload"); base insuficiente só com total e mínimo ("Base insuficiente: 4 respostas. Mínimo 5 para publicar."), sem faixas; abaixo de 20 só "k de n" sem `%` (inclusive na participação e na tabela) com aviso; por área "não publicado" com motivo (1º ciclo ou base) e, a partir do 2º ciclo, ordem recebida (alfabética) com "Outras áreas" por último; "O que mudou" com e sem registro, em texto puro (HTML não interpretado, teste cobre); carregando e erro com "Tentar de novo".
- **Tendência e T2.6.** Uma coluna por trimestre, k de n, `n` no cabeçalho, quebra de série com borda tracejada **e** ícone **e** texto "Questionário alterado", aviso "Não compare os números antes e depois da marca"; trimestre sem base com texto ("base insuficiente") para leitor de tela e lista visível. Mudança de critério também chega pelo aviso padrão do cartão e pela aba "Pesquisa de percepção" em Dados.
- **Pessoas e comentário livre.** Nada no cartão lê, exibe ou aceita nome, e-mail, comentário ou arquivo; áreas e "O que mudou" são texto agregado. Sem ranking (ordem alfabética declarada), sem média, nota única, semáforo, NPS/CSAT (teste varre o texto). "Sem meta de participação" e "Sem meta de satisfação" explícitos.
- **Selo "Dados fictícios"** com ícone e texto (não só cor), lido do status do catálogo, como nas complementares.
- **Acessibilidade.** Hierarquia h2 (seção) > h3 (cartão) > h4 > h5; barras com `role="img"` e nome completo ("pergunta: k por faixa. Total de n respostas"), faixa com 0 respostas escondida, número dentro de cada trecho e legenda escrita: a cor nunca carrega sozinha a informação (WCAG 1.4.1). "Ver como tabela" entrega o equivalente. Tabela de tendência com `caption`, `scope` e região rolável rotulada. Contraste pelos tokens: texto branco sobre `alerta` (#b42318) e `acento` (#1f5fbf) acima de 6:1; `atencao` (#8a5a00) sobre `atencao-fundo` e sobre branco acima de 5:1; tema escuro com texto escuro sobre `alerta`/`acento` claros, também acima de 4,5:1. Alvos e foco herdam do cartão (sem controle novo).
- **Design system.** Reaproveita `CartaoMetrica`, `TabelaDados`, `RegiaoRolavel`, `SeloFicticio`, `SecaoPainel`, "Leia junto" S1/S2 a PV1, Preferências ("1 de 1 da pesquisa de percepção"), sem alerta em "Pede atenção". Fonte "Pesquisa de percepção" nunca misturada; PV1 fora da exportação.

## Desvios

### Bloqueante
Nenhum, por código. A interface atende às regras invioláveis e às decisões 22 a 31. A aprovação final depende da inspeção a 375 e 1280 px e do retorno do usuário (M-4).

### Médio

**M-1. Blocos por área com n < 20 não explicam "k de n".**
- Onde: `CartaoPV1.tsx`, `soKDeN` só avalia `consolidado`; `PorArea` não repete a explicação.
- Problema: em "Financeiro · 12 respostas" a barra mostra contagens sem percentual e o leitor não sabe por quê (a regra só é dita sob o consolidado, bem acima). Fere "visibilidade do status".
- Correção: calcular `soKDeN` por bloco (ou texto único na introdução de "Por área": "Com menos de 20 respostas só aparece a quantidade, sem percentual"). Repetir a legenda das faixas (ou `LegendaFaixas` compacta) acima de "Por área", pois a de cima fica fora da tela, sobretudo a 375 px.

**M-2. Tendência: primeira coluna sem fixar, perde-se a pergunta ao rolar a 375 px.**
- Onde: `Tendencia.tsx`, `th scope="row"` com `bg-superficie` mas sem `sticky left-0`.
- Problema: 4 trimestres × `min-w-28` + `min-w-40` passam de 600 px; em 343 px a rolagem horizontal separa o número do texto da pergunta (reconhecer em vez de lembrar; 1.4.10 reflow é atendido pela região rolável, mas o contexto se perde).
- Correção: `sticky left-0 z-10` na célula de cabeçalho de linha e no canto da cabeça (com borda direita), ou, a 375 px, empilhar por pergunta com o trimestre como linha.

**M-3. Aviso "filtros não se aplicam" no fim do cartão.**
- Onde: `CartaoPV1.tsx`, `pv1-nao-se-aplica` (último parágrafo), misturado com "não avalia pessoas" e "sem meta".
- Problema: quem muda equipe, prioridade ou período e vê o cartão inalterado só descobre o motivo depois de rolar tudo; três mensagens num bloco denso (design minimalista).
- Correção: mover a frase dos filtros para logo abaixo da participação (ou para a `pergunta` da `SecaoPainel`, que já diz "Leia ao lado de S1 e S2"); manter "não avalia pessoas nem compara áreas ou equipes. Sem meta de satisfação." como rodapé curto.

**M-4. Validação do usuário e `especificacao.md` ausentes.**
- Onde: `05-validacao.md` (retorno vazio), pasta sem `especificacao.md`.
- Problema: as decisões 22 a 31 são do time (provisórias: base 5/3, "k de n" abaixo de 20, por área só a partir do 2º ciclo, bloco "O que mudou"). O roteiro de tarefas (achar a PV1 ao lado de S2, entender "Outras áreas", ler o aviso de dados de pessoas) não foi feito com o app real.
- Correção: registrar em `05-validacao.md` o alinhamento de 11/10 como retorno parcial, trocar o roteiro item 3 ("simular carregar") por "ver o estado sem pesquisa e saber quem carrega", e gerar `especificacao.md`. Pedir aceite do usuário com o app rodando.

### Baixo

**L-1. "O que mudou" ambíguo quanto ao trimestre.** `CartaoPV1.tsx`: "Registro da coordenação · 2T/2026" ao lado de uma pesquisa 3T/2026 não diz se o texto responde à pesquisa de 2T ou foi escrito em 2T. Sugestão: "Em resposta à pesquisa de 2T/2026".

**L-2. Texto de "sem pesquisa" vago.** "pelo procedimento de carga" é jargão. Sugestão: "A coordenação da sustentação publica o resultado depois de cada trimestre. Ainda não há resultado." Também há leve contradição de ter "Dados fictícios" num cartão que diz "nenhuma pesquisa": manter o selo (decisão do usuário) mas só quando o dado é mock.

**L-3. Tendência com um único trimestre repete o consolidado.** `CartaoPV1.tsx` mostra a tabela quando `tendencia.length > 0`. Com 1 ponto é redundante; exibir só com 2 ou mais, ou legenda "Primeiro ciclo: ainda sem tendência".

**L-4. Tendência só mostra "Concordam" (faixas 4 e 5).** Esconde a movimentação do lado discordante, e a regra "ler a distribuição inteira" da nota fica só no consolidado. Aceitável por decisão de escopo; registrar como hipótese a confirmar com o usuário e deixar a nota dizer "só o lado que concorda".

**L-5. Largura das barras não proporcional para contagens pequenas.** `Distribuicao.tsx`: `min-w-5` infla trechos com 1 ou 2 respostas; números de 3 dígitos (≥ 100) cortam em `text-xs`. Sem risco hoje (n típico 5 a 40); ajustar `min-w` se n crescer e conferir a 375 px.

**L-6. Escala vermelho-azul sugere semáforo.** `CLASSE_FAIXA` usa `alerta` para "Discordo totalmente". Não depende só de cor e há legenda, mas o vermelho induz juízo ("sem semáforo"). Preferir uma rampa de um único matiz (neutro a acento) ou divergente neutra.

**L-7. Ruído repetido.** "n = 24" repetido em cada uma das 5 barras de cada bloco; o `n` já está no título do bloco. Manter só o título ou só a coluna.

**L-8. Quebra de série sem data fora da versão vigente.** `Tendencia.tsx` mostra a data só quando a versão é a vigente; usar a data da marca T2.6 (`criterios.serie`) quando existir.

**L-9. Catálogo e comentário desatualizados.** `catalogo/linhas.ts` descreve a PV1 como "grupo Núcleo" com "45 métricas"; deixar claro na tela do catálogo que é terceira fonte (coluna Fonte já diz "Pesquisa de percepção"). Sem mudança de código obrigatória.

## Inspeção em execução pendente (QA/UX)
1. 375 px: barras com rótulo numérico legíveis (trechos estreitos), legenda quebrando em linhas, tabela de tendência com rolagem e foco no `RegiaoRolavel`, selos "Pesquisa de 3T/2026" e "Dados fictícios" empilhando sem quebrar o cabeçalho.
2. 1280 px: grid `sm:grid-cols-[16rem_1fr_4rem]` das barras e cartão em `lg:col-span-12`.
3. Leitor de tela: leitura das barras (`role="img"`) vs tabela; leitura da coluna "Questionário alterado".
4. Teclado: "Leia junto" S1/S2 a PV1 leva o foco ao título do cartão; axe nos dois temas e com movimento reduzido.

## Status final dos itens de `docs/ux/metricas-fora-do-nucleo/06-revisao.md`
Verificado no código e nos testes até a atualização de 2026-10-12 (sem mudanças novas em `web/` que as reabram, por leitura):

| Item | Status |
|---|---|
| B-1 / N-1 (Leia junto) | Resolvido (e21aaa8; teste por painel prova as 17) |
| M-1 notas | Resolvido |
| M-2 status do catálogo | Resolvido; ver N-4 |
| M-3 contador | Resolvido |
| M-4 link com nome | Resolvido |
| M-5 validação / `especificacao.md` | **Aberto** (depende do usuário) |
| N-2 cobertura S12 | Resolvido |
| N-3 mapa "Leia junto" | **Aberto**: precisa de confirmação do usuário |
| N-4 coluna "Dados" do catálogo | **Aberto (baixo)**: decidir "Fictícios" para todos ou "Fonte real disponível" |
| L-1, L-4, L-7 | Resolvidos |
| L-2, L-3 | Resolvidos |
| L-5, L-6 | Aceitos (decisão nº 20); observar a 375 px |
| Inspeção a 375 e 1280 px | **Aberta** (QA/axe) |

## Parecer
Sem bloqueante por código; recomendo corrigir M-1 a M-3 antes do QA final. Não aprovo definitivamente sem a inspeção visual e o retorno do usuário (M-4 e abertos das complementares).

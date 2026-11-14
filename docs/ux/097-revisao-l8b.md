# Revisão de UX do L8b (pedido 097, E4.53): recolher cartão nos painéis

Branch `feature/097-l8b-recolher-paineis`, revisado em `50561b92` (o brief cita o head 167ac750 do worktree; li o código do worktree 052d como estava). Base: ressalvas M1, M2, B1, B2, A1 a A3 da revisão do L8a (`docs/ux/097-revisao-l8a.md`).

Método: leitura de `CartaoMetrica.tsx`, `Recolhidos.tsx`, `PainelPagina.tsx`, `ApontamentoPage.tsx`, `CartaoDistribuicao.tsx`, `CartaoApontamento.tsx`, `CartaoKpis.tsx`, `recolhidos.test.tsx` e `recolher.test.tsx`. Itens de acessibilidade: `lido` (pelo código); nada `medido`, o `@axe` é do QA. Limite: a especificação em `docs/ux/097-filtros-time-busca.md` não está neste worktree; conferi os CA pelos nomes dos testes e pelo comentário do código, como no L8a. Os arquivos que o brief cita como "recolhidos" (testes) foram lidos; não rodei a suíte.

## Veredito

**Aprovado.** Nenhum achado crítico, alto ou médio. Dois baixos, sem bloqueio. Todas as ressalvas do L8a estão fechadas no código e têm teste. A pergunta A2 (contagem N projetos) tem resposta abaixo e vira ajuste pequeno, a critério do dono (R-DECISAO).

## Resposta ao A2: a linha sem projeto entra em "N projetos"?

**Não deve entrar.** "Sem projeto identificado" é um balde de horas, não um projeto: contá-lo faz "6 projetos" dizer que há 6 iniciativas quando há 5 mais um resíduo, e o número sobe ou desce com a qualidade do registro, não com o trabalho. As horas dessa linha, ao contrário, **devem** entrar no total, para o resumo bater com o cartão aberto (o total de horas do cartão soma todas as linhas).

Recomendação de texto, só quando a linha existir: `Recolhido. 5 projetos e horas sem projeto, 523,5 h no total.` Sem a linha, o texto atual fica igual. Linhas "Fora dos quadros coletados" (`foraDoEscopo`) são projetos nomeados e continuam na contagem.

Ressalva de implementação (não verifiquei): em `CartaoDistribuicao.tsx:173` o código conta `linhas.length`, e não achei no contrato (`LinhaDistribuicao`: id, rótulo, segundos, apontamentos, participação, `foraDoEscopo`) uma marca de "sem projeto". Também não achei, em `packages/metricas/.../apontamento`, o ponto que gera a linha; o review do L8b diz que ela existe. Se a marca não existir, não comparar o rótulo no front-end (frágil): pedir ao back-end um campo no contrato, ou, se o dono preferir não mexer no contrato agora, manter `linhas.length` e aceitar a diferença de 1 (ver B1 abaixo). Decisão do dono, uma por vez.

## Conferências pedidas

| Item | Resultado | Base |
|---|---|---|
| M1 do L8a: estado `sem-dado-real` e `vazio` recolhidos | Fechado. `resumoDoRecolhido` trata os dois ("Recolhido. Sem dado real nesta fonte.", "Recolhido. Sem dados no período."); `SeloOrigem` e `SeloCalibracao` ficam visíveis recolhidos | `lido`: CartaoMetrica.tsx 129-143, 282-295; teste "M1" com `selo-ficticio` |
| M2 do L8a: `carregando` e `atualizando` | Fechado. "Recolhido. Carregando..." e sufixo " Atualizando..."; `aria-busy` mantido | `lido`: 137, 142, 218; teste "M2" |
| B1: anúncio na segunda restauração | Fechado. O texto do `role="status"` só aparece com `recolhidos.size === 0`; ao recolher de novo ele esvazia, e a próxima restauração muda o DOM e anuncia | `lido`: Recolhidos.tsx 140-147; teste "B1" |
| B2: Restaurar sem nada visível | Fechado em geral: conta só códigos montados (`montados`). Brecha residual: ver B2 abaixo | `lido`: 134, 96-107; testes "B2" |
| A1 a A3 do review | A1 (formato do código aceito pela memória, catálogo e Apontamento) e A2 (foco no título dentro do `main`) têm teste; A3 não identificado por mim no código, confira com o review | `lido`: testes 187-200, 265 |
| AP-KPIS não recolhe | Conforme. `recolhivel={false}` e o botão não renderiza, mesmo com o código na memória | `lido`: CartaoKpis.tsx:88; teste 275 e `recolher.test.tsx` |
| Restaurar | Conforme. Aparece só com recolhido visível; expande tudo, apaga a memória do painel e leva o foco a um título (`tabIndex=-1`, presente nos dois estados). Está em `PainelPagina` (antes do corpo) e em `ApontamentoPage` (antes das seções) | `lido` |
| Memória por painel | Conforme. Chave por painel (`apontamento`, `operacional`...), só códigos, validada por zod, teto de 100, armazenamento indisponível tolerado | `lido`: Recolhidos.tsx 13-64 |
| Resumo do AP-PROJETO | Neutro: total de projetos e de horas, sem nome de projeto, pessoa, equipe ou setor. Singular tratado. Ver A2 | `lido`; testes CA-32 e singular |
| Nenhuma métrica individual nem ranking por pessoa | Conforme. O resumo recolhido nunca usa `leitura` (que pode citar pessoa) nem lista; só `resumoRecolhido` de total agregado (única instância: AP-PROJETO) ou "Recolhido. n unidade". Os cartões por pessoa da aba (`AP-QUALIDADE-PESSOA`, `AP-CAPACIDADE-PESSOA`) já existiam; recolhidos, mostram só o resumo padrão. A ordem neutra dos projetos não muda. Recolher não introduz comparação | `lido`; teste "Ana fez 40 h" |

## Achados

### Baixo

**B1. A contagem N projetos depende da resposta ao A2.** Em `CartaoDistribuicao.tsx:173-175`, `linhas.length` inclui a linha sem projeto. O texto recolhido pode divergir do conceito de "projeto" em 1. Correção: ver a resposta ao A2; adicionar teste do caso com a linha sem projeto (o teste atual usa a fixture, que não tem essa linha: `fixture.ts` 330-337).

**B2. O Restaurar ainda pode aparecer com nada visivelmente recolhido para um cartão não recolhível.** `useRecolhido` registra o código em `montados` mesmo quando o cartão tem `recolhivel={false}` (AP-KPIS). Se a memória (editada à mão ou de versão anterior) trouxer `AP-KPIS`, o botão aparece e restaurar não muda nada que a pessoa veja. Raro, sem dano; o teste 275 cobre só a ausência do botão de recolher. Correção: registrar o código só quando `recolhivel`, ou aceitar e registrar.

**B3. Recolhido em erro, a ação "Tentar de novo" some.** O resumo diz "Não foi possível carregar este cartão." mas o botão de nova tentativa só existe expandido; a pessoa precisa saber expandir. Correção opcional: completar o texto com "Expanda para tentar de novo." (Nielsen: ajudar a recuperar de erros).

## Acessibilidade (WCAG 2.2 AA), resumo

- 2.1.1 Teclado, 2.4.7 Foco visível, 4.1.2 Nome, função e valor: `lido`, conforme (botão nativo, `aria-expanded`, `aria-controls` ao corpo que existe nos dois estados, nome "Recolher/Expandir cartão: título" que começa pelo texto visível, 2.5.3).
- 2.4.3 Ordem do foco: `lido`, conforme; o foco permanece no mesmo botão ao alternar (teste CA-28) e vai a um título no Restaurar.
- 2.5.8 Alvo de 24 px: `lido`, conforme (classe `alvo`, 24 px, 44 px abaixo de 48 rem). O botão Restaurar usa o `Botao` do sistema.
- 1.4.1 Cor não é o único sinal: `lido`, conforme (texto, chevron e `aria-expanded`).
- 4.1.3 Mensagens de status: `lido`, conforme após o B1. Ouvir uma vez com leitor de tela real é do QA (a fala do anúncio pode disputar com o foco no título).
- 1.4.3 / 1.4.11 Contraste: `lido`, tokens do sistema; o QA mede.
- 2.3.3 Movimento: `lido`, só rotação do chevron, sem animação; `motion-reduce` aplicado ao esmaecimento.

## O que não deve mudar

O resumo recolhido nunca traz número por pessoa, equipe, setor ou nome de projeto; a memória guarda só códigos de cartão por painel; AP-KPIS fica sempre aberto; o foco volta ao mesmo botão ao alternar.

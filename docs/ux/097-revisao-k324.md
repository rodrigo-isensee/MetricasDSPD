# Revisão de UX do K-324 (pedido 097, E4.78): recolher depois do L8b

Revisado em `567270bc` (partes A e B na worktree `MetricasDSPD-052f`, branch `fix/k324-recolher`; parte C na worktree `MetricasDSPD-056`, branch `fix/k324c-cartao-recolher`). Só leitura. Base: `docs/ux/097-revisao-l8b.md` (B1, B2, B3) e `docs/architecture/097-k324-desenho.md`.

Método: leitura de `textos.ts` (RESUMO_PROJETO, MAIORES), `CartaoDistribuicao.tsx`, `dezMaiores.ts`, `recolher.test.tsx`, `Recolhidos.tsx`, `CartaoMetrica.tsx`, `EstadoErro.tsx` e do trecho do C2 em `recolhidos.test.tsx`. Acessibilidade: tudo `lido`; nada `medido` (o `@axe` e o leitor de tela são do QA). Não rodei a suíte.

## Veredito

**Aprovado, sem bloqueante.** Os três achados do L8b estão fechados no código e têm teste. Um achado médio (erro recolhido não é anunciado) e dois baixos, nenhum impede o envio. Q-1 e Q-2 respondidas abaixo; Q-1 tem consequência de regra e vira decisão do dono.

## Conferência do L8b

| Item | Resultado | Base |
|---|---|---|
| B1 (A2): a linha sem projeto fora da contagem, dentro das horas | Fechado | `lido`: CartaoDistribuicao.tsx 172-177 (`filter(id !== ID_SEM_PROJETO)`; `totalSegundos` soma tudo; `linhas.some` decide o complemento). Comparação por id do contrato, não por rótulo. Testes em recolher.test.tsx 93-121 cobrem sem a linha, com a linha, só a linha e singular |
| B2: Restaurar com nada visível | Fechado | `lido`: `useRecolhido(codigo, ativo)` só registra em `montados` com `recolhivel !== false` (CartaoMetrica 153; Recolhidos 125). Teste C1 com `AP-KPIS` na memória |
| B3: erro recolhido sem saída | Fechado, melhor que a sugestão | `lido`: o texto "Não foi possível carregar este cartão." ganha o botão "Tentar de novo" sem expandir (CartaoMetrica 321-325); só aparece com `onTentarDeNovo`. Testes C2 (chama o callback, continua recolhido; sem callback, sem botão) |
| Memória só de códigos, AP-KPIS fixo, foco volta ao botão | Sem mudança | `lido` |
| Nada por pessoa, equipe ou setor no resumo | Conforme | `lido`: só total de projetos e de horas |

Textos do resumo (`RESUMO_PROJETO`): "Recolhido. 6 projetos, 673,5 h no total." / "Recolhido. 6 projetos e horas sem projeto, 685,5 h no total." / singular "1 projeto e horas sem projeto". Claros, neutros, números com vírgula e milhar do sistema. Conforme.

## Q-1: os textos do corte dos dez maiores também deixam a linha sem projeto fora da contagem?

**Sim, pela mesma razão do A2: "projeto" é palavra de projeto, e "Sem iniciativa" é um balde de horas.** Hoje `todas.length` e `demais.quantidade` (CartaoDistribuicao 48-84, `dezMaiores.ts`) contam a linha. Efeitos que a pessoa vê, `lido`:

1. 10 projetos e a linha sem projeto: são 11 linhas, o corte dispara e a tela diz "Demais 1 projeto: X h" quando esse "projeto" é o balde, e oferece "Ver todos os 11 projetos" para um projeto a mais que não existe.
2. Se a linha sem projeto está entre as dez de mais horas, "Mostrando os 10 projetos com mais horas, de N" mostra 9 projetos e o balde, e o N inclui o balde.
3. Se ela cai nos "Demais", "Demais 3 projetos: 8 h" inclui horas que não são de projeto, e a frase não avisa (o resumo recolhido avisa).

Recomendação de texto (vale se o dono aceitar o comportamento abaixo):
- `de N`: N só de projetos. "Mostrando os 10 projetos com mais horas, de 12."
- `Mostrando todos`: com a linha, "Mostrando todos os 12 projetos e as horas sem projeto."; sem ela, igual a hoje.
- `Ver todos`: "Ver todos os 12 projetos" (nome do botão curto, contagem só de projetos).
- `Demais`: com a linha entre os demais, "Demais 2 projetos e horas sem projeto: 8 h"; sem, igual a hoje. Mesma fórmula do resumo recolhido.

**Consequência de regra (decisão do dono, R-DECISAO, uma por vez):** só trocar os textos não resolve o efeito 2 (a linha ocupa uma das dez vagas). A opção coerente é o corte valer só para projetos e a linha sem projeto ficar sempre visível, fixa abaixo dos dez (nunca entre os "Demais"). Isso muda o CA-33/CA-34 (ordem e vaga) e o gráfico, então não é ajuste de texto. Recomendação: ficar com a linha fixa ao final; alternativa mínima, só os textos acima, aceitando o efeito 2 e documentando-o. Fora do K-324 até a decisão, como o desenho já previa.

## Q-2: "Recolhido. 0 projetos e horas sem projeto, X h no total." serve?

**Entende-se, mas soa mecânico: "0 projetos e horas sem projeto" parece uma lista de dois itens.** O caso é real (filtro que deixa só apontamento sem projeto). Recomendação, trocar só nesse caso: `Recolhido. Nenhum projeto, só horas sem projeto, 12 h no total.` Mantém a regra (fora da contagem, dentro das horas), sem o "0 projetos". Se o dono preferir não abrir a fórmula, o texto atual é aceitável (baixo, B-1 abaixo). Uma mudança de `RESUMO_PROJETO` e de um teste.

## Achados

### Médio

**M-1. Cartão em erro, recolhido, não é anunciado.** `lido`. O erro expandido usa `EstadoErro` (`role="alert"` no primeiro da página, `status` nos demais, via `reivindicarAlerta`). Recolhido, o erro vira um `<p>` sem papel (CartaoMetrica 318-320): quem usa leitor de tela e muda um filtro com o cartão recolhido não ouve que a atualização falhou (WCAG 4.1.3). Antes do K-324 o problema existia, mas o novo botão "Tentar de novo" o torna mais visível: há uma ação sem aviso. Correção: dar ao resumo em erro `role="status"` (ou usar `reivindicarAlerta` como o `EstadoErro`) só no estado `erro`; os demais resumos continuam sem papel para não anunciar a cada recolher. Teste: o resumo em erro tem papel de status/alerta. Não bloqueia o envio; entra no K-324 ou em cartão ao critério do `tech-lead`.

### Baixo

**B-1. Q-2** (acima): texto do caso só com a linha sem projeto.

**B-2. Foco ao tocar "Tentar de novo" recolhido.** `lido`. Ao clicar, o cartão passa a `carregando` e o botão desmonta; o foco cai no `body`. É o mesmo comportamento do `EstadoErro` expandido, então é consistência, não regressão. Correção opcional e para os dois: devolver o foco ao botão Recolher/Expandir do cartão ao desmontar. O QA vê no teclado.

**B-3. Vários "Tentar de novo" com o mesmo nome acessível.** `lido`. Com vários cartões em erro, a lista de botões do leitor de tela repete "Tentar de novo" sem o cartão. Cada botão está dentro de um `group` nomeado pelo título (`aria-labelledby`), o que atende 2.4.6; só vale melhorar se o QA achar confuso ("Tentar de novo: <título>").

## Acessibilidade (WCAG 2.2 AA), resumo

- 2.1.1, 2.4.7, 4.1.2: `lido`, conforme (botões nativos do sistema; `aria-expanded`, `aria-controls` ao corpo que existe nos dois estados).
- 2.5.3: `lido`, conforme (nome "Recolher/Expandir cartão: título").
- 2.5.8: `lido`, conforme (`Botao` e `alvo` do sistema).
- 1.4.1: `lido`, conforme (texto e chevron, não só cor).
- 4.1.3: `lido`, ressalva M-1.
- 1.4.3 / 1.4.11: `lido`, tokens do sistema; o QA mede.
- 2.3.3: `lido`, sem animação nova.

## O que não deve mudar

O resumo do AP-PROJETO nunca traz nome de projeto, pessoa, equipe ou setor; a linha sem projeto fica fora da contagem e dentro das horas; "Tentar de novo" recolhido não expande o cartão; cartão que não recolhe nunca faz o "Restaurar" aparecer.

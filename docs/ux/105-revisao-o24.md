---
parecer: aprovado (nenhum achado aberto; o achado 4 foi fechado pela decisão do dono e pelo texto do T2)
commit: 8ca3578d
---

# Revisão de UX do O24 e do cartão T2 (pedido 105, E7.21)

parecer: aprovado com ressalva. Os achados 1, 2, 3 e 5 da revisão anterior foram aplicados no commit fcd07f96 e conferidos no head 3e39317b. O achado 4 segue como pendência do dono.

Escopo: delta de textos em `packages/contratos/src/origem.ts`, `web/src/features/complementares/notas.ts`, `web/src/features/tatico/components/CartaoT2.tsx` e `web/src/features/complementares/operacionais.tsx`, lidos na worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/105-o24-etiquetas`. Decisão do dono: classes Urgente, Prioritário, Prazo fixo e Padrão. Acessibilidade: tudo `lido`, sem ferramenta rodada (o QA mede com `@axe`).

## Achados da revisão anterior

| # | Achado | Situação | Evidência (`lido`) |
|---|---|---|---|
| 1 | Nota "sem-classe" desatualizada (médio) | Resolvido | `origem.ts:166`: "Cartões sem etiqueta de classe de serviço ficam fora da separação por classe." |
| 2 | O24 não dizia que cartão sem etiqueta fica fora (médio) | Resolvido | `notas.ts:237`: "A classe vem da etiqueta do cartão; cartão sem etiqueta, ou com duas classes, não entra no cálculo." |
| 3 | T2 misturava dois motivos de SLE não publicado (baixo) | Resolvido | `CartaoT2.tsx:72-73`: com `c.n >= 20`, "SLE ainda não publicado para esta classe."; abaixo disso, o texto de amostra insuficiente |
| 4 | T2 cita "60 dias de dados limpos" com a classe por etiqueta nova (baixo) | Pendência do dono | `tatico/notas.ts:22` mantém o texto; ver abaixo |
| 5 | O24, "Leia" repetia a nota (baixo) | Resolvido | `operacionais.tsx:675`: "O cartão mostra o custo de passar na frente, não um erro." |

## Pendência do dono (achado 4)

Pergunta de regra de negócio, não decisão de UX: a janela de "60 dias de dados limpos" do SLE do T2 recomeça na troca de critério (versão `105:classe-por-etiqueta`)? Se sim, a nota do T2 precisa avisar a data de recomeço; se não, o texto atual está correto. Recomendação: confirmar com o dono antes do release; enquanto isso o texto fica como está. Nenhuma outra frase do delta depende da resposta.

## O que continua certo

- O O24 fala só em "classe Padrão" (`operacionais.tsx:602` e `603`), sem Intangível, conforme a decisão (`lido`).
- Regra de 20 itens preservada: o percentual não sai abaixo disso e aparece o aviso de amostra insuficiente (`lido`).
- "Etiqueta" é o termo do quadro e agora é o usado nos textos (Nielsen: correspondência com o mundo real).
- Nenhum texto aponta pessoa nem compara times (`lido`).

## Acessibilidade (WCAG 2.2 AA), `lido`

O delta só mexe em texto; a estrutura (lista com `aria-label`, tabelas e gráficos com `descricao`) não mudou. Contraste e leitor de tela sem medição: o QA mede.

## Revalidação (E7.40, cabeça 8ca3578d)

parecer: aprovado. Revisado só o delta desde 3e39317b: a nota de cuidados do T2 em `web/src/features/tatico/notas.ts:22`; o resto é merge do O15, D2 e O18, já revisados.

- Achado 4: fechado. Texto novo (`lido`): "A contagem dos 60 dias recomeça desde a troca de critério marcada no gráfico, quando a classe passou a vir da etiqueta do cartão." Responde à pergunta da pendência (a janela recomeça) conforme a decisão do dono "A".
- Texto: direto, voz ativa, português do Brasil, sem culpar ninguém; "etiqueta do cartão" é o termo do quadro e bate com o O24. Mantém "60 dias" e "20 itens por classe", sem conflito com a regra de abaixo de 20 itens não publicar.
- Ressalva baixa, de leitura: a frase diz "desde a troca" sem a data. A data vem da marca no gráfico (T2.6); se a marca não aparecer no cartão, o texto remete a algo que a pessoa não vê. Verificar no QA que a marca de troca de critério está visível no T2. Não bloqueia.
- Cobertura: `notas-sem-simulado.test.ts:19` fixa o texto (`lido`).
- Acessibilidade: só texto mudou; sem ferramenta rodada, o QA mede (`@axe`).
- Nenhum texto aponta pessoa nem compara times.

## Fora do escopo

Desenho dos gráficos; validação do dono no protótipo (já cumprida na demanda).

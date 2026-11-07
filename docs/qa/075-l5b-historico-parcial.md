---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l5b-historico-parcial
commit: caee6f68686c5cf719583f4080670edaee4a4b5c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 2
aceite_usuario: nao
data: 2026-11-07
---
# QA: 075 lote 5b, histórico parcial no O5 e na série do O1 (E1.8, K-204)

Código testado: `caee6f68`. O HEAD `2bbf810f` só soma o parecer do review (`docs/reviews/075-l5b-historico-parcial.md`). Especificação: `docs/ux/075-bloqueios-reais.md` (CA-6 a CA-9 e CA-11) e a revisão de interface `docs/ux/075-revisao-l5b.md` (aprovada com ressalvas, divergência do CA-9 aceita).

## Escopo
- Dentro: `CartaoO1.tsx` (série Bloqueados com nulo antes do dado real), faixa de histórico parcial do O5 (vem de `CartaoMetrica`/`AvisoCriterio`, sem diff em `fluxo.tsx`), texto de precisão do início do bloqueio.
- Fora: servidor e contratos. `git diff c66b5d21 caee6f68 -- server packages` vazio (conferido: 2 arquivos no diff, ambos em `web/`).
- Diff conferido contra a lista de CA: o escopo não mudou; nenhum CA novo.

## Critério → teste → resultado
Arquivo de teste: `web/src/features/operacional/historico-parcial.test.tsx` (5 casos).

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-6 faixa do O5 com data, mesmo em amostra insuficiente | caso CA-6 (`CartaoO5` real, `data-estado="ok"`, "12 de 20") | amostra abaixo do mínimo | passou |
| CA-7 série do O1 com faixa, marcador na data e trecho anterior sem ponto | caso CA-7 (faixa, marcador 01/10/2026, linhas 01/09 a 03/09 com "— amostra insuficiente") | nulo antes do dado real, nunca zero | passou |
| CA-8 faixa some com a janela toda depois da data | caso CA-8 (`janela: []`) | janela vazia | passou |
| CA-9 tipo curto com N de 20, sem valor nem percentual | caso CA-9 ("Bug: amostra insuficiente (7 de 20 itens mínimos)", sem `%`, sem `meter`) | 19 ou menos itens | passou, com a divergência aceita na revisão de interface |
| CA-11 texto de precisão sob a tabela, ligado por `aria-describedby` | caso CA-11 (`#bloqueados-apoio`) | tabela com bloqueados | passou |

## Execução
- CI do push: `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/075-l5b-historico-parcial --event push` devolveu `success` para `caee6f68` (workflow CI); o run do HEAD `2bbf810f` estava em andamento (sem conclusão) na consulta.
- Testes locais, `vitest run --maxWorkers=2` em `web`: `historico-parcial.test.tsx` mais os arquivos que montam `CartaoO1` na pasta `operacional` (`bloqueio-sem-dado`, `ramos`, `motivo-nao-classificado`): 4 arquivos, 32 testes, todos passaram. Os de `complementares` ficam com a CI.
- Vermelho contra a base (cópia em `/tmp/claude-1000/qa-engineer-075-l5b/`: `git archive` de `c66b5d21`, teste novo copiado, worktree intocada): 1 de 5 cai, o CA-7 (`expect(l).toHaveTextContent('— amostra insuficiente')`, recebido `01/093784`, a base não traz a linha Bloqueados). Os outros 4 (CA-6, CA-8, CA-9, CA-11) passam na base: a faixa do O5 e o texto de precisão já vinham dos lotes 5a e 6a, e o review confirma a rota. São guardas de regressão, não prova de código novo; o único comportamento novo do lote é o CA-7, e ele tem vermelho.
- Mutação: sem ferramenta gratuita declarada para o `web`; não rodada.
- Axe de tela: fica com o e2e do PR (o filtro da CI do push pula o e2e); não rodado aqui.

## Pontos abertos (da revisão de interface, sem devolver o lote)
- Médio, CA-9: com todos os tipos do O5 abaixo de 20, o `AmostraInsuficiente` mostra um só N (`maiorN`) sem dizer o tipo; com ao menos um tipo publicado, `ListaInsuficientes` traz cada tipo com seu N. Contorno simples; vira cartão curto, decisão do dono.
- Baixo, CA-6: a expressão "histórico parcial" depende da `descricao` da marcação do lote 6a; o teste usa fixture, não o contrato real.
- Baixo, CA-7: o gap na linha desenhada não é medido (só a tabela alternativa); confirmar visualmente com a série real no e2e do PR.

## Bugs
Nenhum crítico ou alto. Um médio e dois baixos acima, abertos; aceite do dono pendente (`aceite_usuario: nao`), e o merge do lote espera a decisão dele.

## Achados

- A1 (recomendado) web/src/features/complementares/fluxo.tsx:58 · Bug médio, origem na revisão de interface (docs/ux/075-revisao-l5b.md:27): com todos os tipos do O5 abaixo de 20 mostra um só N sem o tipo; o CA-9 pede N por tipo, listar cada tipo com seu N sob o aviso.
- A2 (recomendado) docs/ux/075-revisao-l5b.md:28 · Bug baixo, origem na revisão de interface: o CA-6 depende da descrição do lote 6a para "histórico parcial"; o teste usa fixture, não o contrato real.
- A3 (recomendado) docs/ux/075-revisao-l5b.md:29 · Bug baixo, origem na revisão de interface: o CA-7 não mede o gap na linha desenhada, só a tabela alternativa; confirmar com a série real no e2e do PR.

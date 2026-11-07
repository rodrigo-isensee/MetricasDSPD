---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4b-tela-janela-sust
commit: 0236c717c874000b6c96921aa7323afb88932a6a
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 4b, tela da janela incompleta na sustentação (K-211, E2.2)

Rodada 1: `git diff ab423d02...a5fcab66` (6 arquivos, `web/` e `e2e/`). Rodada 2 (volta 1, react-frontend-6): `git diff a5fcab66...0236c717`. Referências: seção "Lote 4b" do desenho (`docs/analises/077-desenho.md`), seções 1, 5 e 6 e os CA-1, CA-2, CA-4, CA-5 e CA-14 da especificação (`docs/ux/077-tendencias.md`), parecer do 4a na develop (`docs/reviews/077-l4a-tela-janela-fluxo.md`, A1 a A3).

## Parecer
**Aprovado.** O lote faz o que o desenho pede, e a volta fecha o A1 e o A2 da rodada 1 (e o A-1 e o A-4 da revisão de interface) sem efeito colateral.

### Rodada 2 (volta, delta lido)
- **Delta lido** (`forge-check delta --parecer` sobre o parecer anterior): `GraficoMensal.tsx:21-22` e `:99`; `graficos.test.tsx:215-224`; `modelo.ts:210-211`, `:287` e `:312-313`; `modelo.test.ts:332-345` e `:355`. O resto da branch ficou como "já lido" na rodada 1.
- **A1 e A-1 (rótulo do eixo):** `PontoMensal` e `DadoMensal` ganham `motivo?` opcional; `serieSla` (`modelo.ts:287`) o preenche com "sem prioridade avaliada" no ponto sem prioridade, e o eixo (`GraficoMensal.tsx:99`) usa janela incompleta antes, depois `motivo`, depois "poucos itens". O `SerieMensal` passa os pontos direto (`dados={pontos}`), sem mapeamento a ajustar. Teste novo em `graficos.test.tsx` afirma o rótulo e a ausência de "poucos itens"; `modelo.test.ts:355` afirma o `motivo` saindo do modelo. Os outros pontos sem valor não mudam: sem `motivo`, segue "poucos itens".
- **A2 e A-4 (dois-pontos duplo):** `fraseDaSerieSla` (`modelo.ts:312-313`) trata o ponto de janela incompleta antes do ramo genérico e sai "Em julho, janela incompleta: ...", com a inicial minúscula; teste em `modelo.test.ts:332-345` afirma a frase inteira. Os demais ramos e testes da frase seguem iguais.
- **Observação do autor:** o mesmo dois-pontos duplo existe em `fraseDaSerie` do fluxo (`modelo.ts:325`), que veio do 4a; fora deste lote, registrado como A3.
- **Fora do diff:** `git diff --stat ab423d02...0236c717 -- server packages docs/contratos docs/api` vazio.

### Rodada 1 (resumo)
- **Aderência ao Lote 4b:** `serieSla` trata a janela incompleta antes de qualquer outro motivo, pelo mesmo `janelaIncompleta` do 4a; a tela reaproveita o `SerieMensal` do 4a. A série de volume segue contagem do mês-calendário (spec seção 1, ADR 0019 item 5).
- **CA-1, CA-2, CA-4, CA-5 e CA-14:** afirmados em `modelo.test.ts` e `componentes.test.tsx` (ponto com `valor: null` e `n: null`, linha da lista, frase, resumo do gráfico, tabela com "—" e "não publicado · janela incompleta").
- **`vazioJanela` próprio (A2 do review do 4a, A-3 da interface do 4a):** `TendenciaSustentacao.tsx:49`, com teste.
- **A1 do review do 4a:** resolvido pelo texto do ponto sem prioridade ("Nenhuma prioridade com 20 chamados ou mais. Estatística não publicada."), com e2e e `resumo.test.tsx` alinhados.
- **T2.5:** nenhuma conta na tela; o lote só escolhe texto pela marca que o contrato traz.
- **Revisão de interface do 4b** (`docs/ux/077-revisao-l4b.md`): citada, não refeita. A-2, A-3 e A-5 ficam como pendência no corpo do PR; A-6 vai ao QA (decisão do Jarvis de 2026-11-07 12:54).

## Ferramentas
- CI do push no head `0236c717`: run 42388962776, `CI`, `push`, `completed`, `success` (`gh run list --commit`); ponta remota igual a `0236c717` (`git fetch`).
- Testes dos arquivos tocados (D-5): `vitest run --maxWorkers=2` em `graficos.test.tsx`, `modelo.test.ts`, `componentes.test.tsx` e `resumo.test.tsx`: 4 arquivos, 82 testes verdes. Suíte inteira: com o QA.

## Teto M14
`git diff --numstat --no-renames ab423d02...0236c717 -- web e2e`: 1+1, 3+1, 10+0, 1+0, 49+0, 40+1, 7+1, 1+1 = 117 linhas, dentro do teto de 150. Um comportamento só (janela incompleta na série de SLA da sustentação, com o texto e o rótulo do ponto sem prioridade alinhados).

## Achados
- A1 (recomendado) web/src/components/charts/GraficoMensal.tsx:97 · no ponto de SLA sem prioridade avaliada o eixo dizia "poucos itens" e a lista dizia outro motivo (CA-14; A-1 da interface). Resolvido em 0236c717: campo motivo e eixo com "sem prioridade avaliada".
- A2 (recomendado) web/src/features/operacional/resumo/modelo.ts:309 · com o último mês incompleto a frase saía "Em julho: Janela incompleta: ...", com dois dois-pontos (A-4 da interface). Resolvido em 0236c717: ramo próprio da janela incompleta, com teste.
- A3 (recomendado) web/src/features/operacional/resumo/modelo.ts:325 · fraseDaSerie (fluxo, do 4a) repete o dois-pontos duplo com o último mês incompleto: "Em julho: Janela incompleta: ...". Fora deste lote; destino: cartão novo do Jarvis, mesmo molde do ramo de fraseDaSerieSla.

---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l4a-tela-janela-fluxo
commit: 68d5e1ee148a8b1894d746241a0d5018a9d4753e
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 4a, volta 1 (K-211, E2.2)

Revalidação por delta do parecer anterior (5334e030, reprovado pelo A1, sobre 9342bc7a). Delta lido: `5334e030...68d5e1ee` (5 arquivos, 33 adições e 14 remoções), contra `## Lote 4a` de `docs/analises/077-desenho.md` e os CA-1 a CA-7, CA-14 e a seção 6 de `docs/ux/077-tendencias.md`. Já lido no parecer anterior e sem mudança no delta: `SerieMensal.tsx`, `componentes.test.tsx` e o mapeador `serieP85`.

## Parecer
**Aprovado.** O A1 está corrigido; o CA-3 e a microcopy seguem a especificação.

- **A1 anterior (eixo):** `GraficoMensal.tsx` passa a guardar, por mês sem valor, o motivo: `janela incompleta` quando o ponto traz `janelaIncompleta`, `poucos itens` no resto, e o `TickMes` escreve esse motivo (CA-4). Só o rótulo do eixo mudou; a linha, o marcador vazado e as marcas ficam como estavam. O campo novo de `DadoMensal` é opcional e o `PontoMensal` já o tem, então o `SerieMensal` o repassa sem mudança.
- **CA-3:** `semValor` em `modelo.ts` escreve "Poucos itens (n=N). Estatística não publicada.", o texto literal do critério (A2 anterior e A-1 da interface).
- **Microcopy (seção 6):** o texto do ponto de janela incompleta é o da seção 6 ("o histórico carregado começa em {data}, depois do início da janela de 12 semanas. Estatística não publicada."); a lista mantém o texto curto da seção 6, como antes (A-2 da interface).
- **Frases (`fraseDaSerie` e `fraseDaSerieSla`):** com o texto do ponto já terminado em "Estatística não publicada.", as duas deixam de acrescentar "Valor não publicado." e devolvem o texto do ponto, sem repetir a informação. A da SLA é compartilhada com a sustentação: o texto do ponto de SLA ("não publicado (nenhuma prioridade com 20 chamados)") não termina em ponto final, e a frase fica sem ele (A1 abaixo, recomendado, para o 4b).
- **Nenhuma conta na tela (T2.5):** o delta só troca textos e escolhe o rótulo pelo campo que o contrato traz; nenhuma contagem nem cálculo.
- **Fora do diff, como pedido:** `server/`, `packages/` e `docs/contratos` sem diff no lote inteiro (`718d46be...68d5e1ee`).
- **Testes:** `graficos.test.tsx` ganhou o caso do mês de janela incompleta (contém "janela incompleta", não contém "poucos itens") e o caso antigo agora afirma "poucos itens"; os testes do modelo e do Resumo foram ajustados aos textos novos.
- **Mutação:** o `forge-mutante` não tem leitor para a stack web e não rodou. Pela leitura, a guarda nova (`d.janelaIncompleta ? ... : ...`) tem os dois ramos afirmados por comportamento: inverter a condição ou fixar o rótulo derruba um dos dois testes do `GraficoMensal`; a troca das frases é afirmada nos testes do modelo. Basta para este delta.
- **Revisão de interface:** `docs/ux/077-revisao-l4a.md` (ux-designer, aprovado com ressalvas), sem commit nesta worktree; vai ao PR.

## Ferramentas
- CI do push no head `68d5e1ee`: run 42361902072, `CI`, `completed`, `success` (`gh run list --commit`).
- Testes dos arquivos tocados e dos vizinhos que leem `SerieMensal` e `GraficoMensal` (`graficos.test.tsx`, `modelo.test.ts`, `resumo.test.tsx`, `componentes.test.tsx`), `--maxWorkers=2`: 4 arquivos, 78 verdes.
- Lint, tipos, cobertura e `docs:check`: cobertos pela mesma CI verde; não refeitos.

## Teto M14
150 linhas de código e teste somando o lote e a volta (`git diff --numstat --no-renames 718d46be...68d5e1ee`, sem o parecer): `GraficoMensal.tsx` 9+3, `graficos.test.tsx` 11+0, `SerieMensal.tsx` 26+4, `componentes.test.tsx` 42+0, `modelo.test.ts` 27+4, `modelo.ts` 17+5, `resumo.test.tsx` 1+1. No limite, dentro de 150. Um comportamento só.

## Achados
- A1 (recomendado) web/src/features/operacional/resumo/modelo.ts:308 · sem o sufixo, a frase da SLA na sustentação vira "Em julho: não publicado (nenhuma prioridade com 20 chamados)", sem ponto final, pois esse texto do ponto não termina em ponto; alinhar o texto do ponto de SLA no Lote 4b.
- A2 (recomendado) web/src/features/operacional/resumo/SerieMensal.tsx:59 · o A3 anterior segue para o Lote 4b: o padrão de `vazioJanela` fala em itens; a sustentação deve passar o texto próprio (spec, seção 1).

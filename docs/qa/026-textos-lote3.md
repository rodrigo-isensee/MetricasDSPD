---
tipo: qa
contrato: 1
pedido: 026-front-do-011-lote3
branch: docs/026-textos-lote3
commit: 081d2f1f7850959f993e814d67491cf8ec9f87c0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---
# QA: textos da especificação do lote 3, segunda versão (E1.8, K-154)

Escopo: `git diff d7c74b46..081d2f1f` (só `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` e o parecer de review). Documentação; sem código de produção, sem gatilho de segurança, sem pessoa envolvida. Os textos foram conferidos contra a tela (`web/`), o código do cálculo e os contratos. Vermelho antes do verde e mutação não se aplicam (nenhum teste novo, nenhum código no diff).

## Critério → conferência → resultado

| Obrigação | Conferência | Fronteira protegida | Resultado |
|---|---|---|---|
| Mínimo de 20 do O26: percentual sobre o total do tipo com dado de passagens | Spec (Visual, Leitura, Mínimo, §11) × `o26.ts:74`: `taxa(itens, dado.length)`; `taxa` publica só com `publicavel(n)` sobre o total (`core/estatistica.ts:55`) | 20 sobre o total, não sobre a faixa | OK |
| Mínimo de 20 do O26: P85 sobre a faixa na janela de 12 semanas | Spec × `o26.ts:75`: `estatistica(ciclos.length, janela, ...)`, com `ciclos` só da `dadoJanela` da faixa | 20 na faixa, dentro da janela | OK |
| Frase da tela do O26 (faixa mais comum, % só com mínimo, empate = menor número) | Spec × `operacionais.tsx:793-796` (`leituraO26`): ordenação estável por `itens`, `pct` só com `status === 'ok'` | empate, abaixo de 20 | OK |
| R8 do O21 na Leitura (linha 89) e na tabela da §11 | Spec × `operacionais.tsx:255-258` (`leituraO21` filtra `!c.reaberto`); reabertura segue na linha própria "reaberto" (contrato O21: `reaberto`, `reaberturas`) | reabertura fora da "volta mais comum" | OK (A2 do review resolvido) |
| §11, linha de A10 separa as duas regras | Linha 416 diz percentual sobre o total do tipo e P85 sobre a faixa; coerente com a linha 161 (A1 do review resolvido) | n/a | OK |
| Vazio: "Nenhum item encontrado" sozinho, sem "Amostra insuficiente: 0 de 20" | §6 (nova) e §11: regra de 2026-10-28 e a pendência da tela. `EstadoVazio.tsx:11` tem o título "Nenhum item encontrado"; `BadgeBase.tsx:41` gera "Amostra insuficiente: N de 20 itens mínimos"; `operacionais.tsx:284, 485, 582, 669` (O21, O22, O24, O25) passam `baseVariante='insuficiente'` quando a estatística não é ok, o que inclui zero itens. Os quatro cartões citados batem; O26 usa `censo` e não entra | zero itens | OK (a tela ainda mistura os dois, como a spec admite; correção em cartão próprio do front) |
| Ficha do O26 sem campo novo no contrato (A10 = A) | Contrato O26 não mudou no diff; o schema já tem `pct` e `cicloP85` por faixa | n/a | OK |
| Sem métrica individual nem comparação entre times | Os textos novos só falam de trocas, não de quem; selo "Conta trocas, nunca quem." mantido | n/a | OK |

## Execução
- `pnpm run docs:check` na raiz da worktree: `docs:check: ok (759 páginas Markdown, 69 métricas, 2 eventos).` rc=0.
- Working tree limpa antes do parecer; head testado a4c04f70 (conteúdo da especificação idêntico ao de 081d2f1; o review só acrescentou o próprio parecer).

## Achados
- A1 (recomendado) docs/contratos/metricas/O26.md:38 · A ficha diz "20 itens por classe" sem separar as duas bases (percentual sobre o total do tipo com dado; P85 sobre a faixa na janela). A decisão do dono (A10 = A) manteve o contrato sem campo novo, então não bloqueia. Destino: software-architect, se quiser a nota de texto na próxima revisão do contrato.
- A2 (recomendado) docs/contratos/metricas/O21.md:40 · A ficha não registra a R8 (a "volta mais comum" ignora a reabertura). Só texto; o schema já traz `reaberto`. Destino: software-architect, mesma ocasião.
- A3 (recomendado) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:161 · Cita `o26.ts:74` e `:75` com número de linha, que envelhece (hoje bate). Destino: ux-designer, ao tocar o texto de novo; não devolve sozinho.

## Perguntas ao dono
Nenhuma. Nenhuma dúvida de regra de negócio surgiu; as decisões de 2026-10-27 (A10 e R8) estão refletidas nos textos.

## Veredito
Aprovado. Zero bugs; zero achados bloqueantes.

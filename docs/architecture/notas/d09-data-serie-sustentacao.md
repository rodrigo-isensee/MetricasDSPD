# D-09: data da série de tendência da Sustentação

Parecer do arquiteto, 2026-10-14. Só leitura: nenhum código nem especificação foi alterado.

## Data que cada métrica da série usa (worktree, `packages/metricas/src/acelerato/tendencia.ts`)
| Métrica da série | Data usada | Onde |
|---|---|---|
| Aderência ao SLA (S2, por prioridade) | **fechamento** (`data_finalizado`), janela de 12 semanas até o fim do mês | `tendencia.ts` linhas 22 a 36; `s2.ts` linha 34 (`apuraveisComDia`) |
| Volume de chamados (S3) | **abertura**, mês-calendário | `tendencia.ts` linha 37; `diasDeAbertura` em `s3.ts` linha 11 ("Conta todos os chamados abertos no mês", linha 15) |

A divergência atinge só o volume. A aderência já segue a spec (fechamento).

## O que dizem os documentos
- Spec 5.9.3 (`docs/ux/sustentacao-no-operacional/especificacao.md`, linha 220): "sustentação, pela data de fechamento do chamado (as mesmas bases dos cartões O3/O4 e S1/S2/S3)". A frase é internamente falha: o cartão S3 conta por abertura, então "as mesmas bases" não vale para o S3.
- Briefing (`docs/briefing-execucao-metricas.md`): S3 = "Volume mensal por prioridade, contagem por faixa" (linha 390) e "S3 em volume absoluto e em proporção, por mês" (linha 298). S1 e S2 são medidos a partir da abertura até a restauração (linhas 388 e 389). **O briefing não diz por qual data o S3 pertence ao mês.** Não há regra de data no catálogo S1 a S12.
- Plano (`plano-sustentacao-no-operacional.md`): contrato `TENDENCIA_SUST`, linha 149, "volume: contagem do mês-calendário (base: P4)". Risco R9 (linha 201): "Contradição da spec na base do volume mensal", série de volume fora do merge até a resposta. B2 (linha 217): "S3 pela base decidida em P4".
- P4 (linhas 329 a 333): pergunta com (a) abertura, igual ao S3, e (b) fechamento.
- Seção 10 (linhas 338 a 340): P3 e P4 foram **delegadas ao time pelo usuário** ("UX, tome as decisões"). Resposta **P4 = (a)**, abertura, "para o ponto bater com o detalhe". P1 a P3 foram respondidas pelo mesmo caminho, mas só P1 e P2 vieram do usuário em si.
- ADR 0019: define a janela de 12 semanas e o mínimo de 20 para os pontos de distribuição e diz que "as contagens (...) são do mês-calendário". Não fixa a data da contagem.
- Código (`tendencia.ts`, comentário das linhas 13 a 19): "O volume é a contagem de chamados abertos no mês (base do S3)". A `base` do resultado traz a unidade "chamados abertos".

## Conclusão: (a) a especificação está errada e o código está certo
- A decisão P4 = (a) está registrada no plano, com data e com delegação do usuário. O código a implementa ao pé da letra.
- O briefing é omisso quanto à data do S3, então nenhum documento superior contradiz a decisão.
- A spec 5.9.3 ficou defasada em relação à P4: foi escrita antes da pergunta e não foi atualizada.
- Ajuste da spec (para o UX, fora deste parecer): em 5.9.3, "volume de chamados" por data de abertura (base do S3); aderência (S1 e S2) por data de fechamento. Remover "as mesmas bases dos cartões ... S3".

## Ressalva
A P4 é regra de negócio (data de pertencimento ao mês) e foi decidida por delegação, não por resposta direta do usuário. Se o usuário quiser reabrir, a troca é pequena: `tendencia.ts` linha 37 passaria a usar a data de fechamento, o rótulo "chamados abertos" mudaria, e o ponto deixaria de bater com o cartão S3 do detalhe.

---
parecer: aprovado com ressalvas (nenhum achado crítico ou alto; 3 médios e 2 baixos de texto)
commit: a2e59daa
---

# Revisão de UX do T10, tempo total esperando fornecedores (pedido 105, E7.111)

Escopo: `web/src/features/complementares/taticas.tsx` (CartaoT10, leituraT10), o bloco T10 de `web/src/features/complementares/notas.ts`, o schema `resultadoT10` (`packages/contratos/src/tambem.ts`) e a constante `MOTIVO_SEM_LISTA_POR_FORNECEDOR` (`packages/metricas/src/businessmap/t10.ts`), lidos na worktree `/home/rodrigoisensee/MetricasDSPD-057`, cabeça a2e59daa (back-end 05fea1d7). Decisão do dono de 16/11 aplicada: total dos bloqueios encerrados com motivo "Aguardando fornecedor", sem separar por fornecedor. Todo item de acessibilidade abaixo é `lido`; nenhuma ferramenta foi rodada (não há shell nesta sessão; o QA mede com `@axe`). Sem PR para a branch: não afirmo CI verde nem repito a prova do autor (PQ do autor).

## Veredito por ponto pedido

| Ponto | Resultado | Evidência (`lido`) |
|---|---|---|
| Linha de total | Adequada | `taticas.tsx:93-103`: uma linha "Esperando fornecedores" com Bloqueios, Dias úteis somados e Duração; tabela com legenda e cabeçalhos |
| Motivo de não separar por fornecedor | Adequado | `taticas.tsx:105-109` mostra o motivo logo abaixo da tabela, texto simples: "O nome do fornecedor não é guardado na base; só o tempo total esperando fornecedores é publicado." Também em `notas.ts:266` |
| Leitura | Correta, com ressalva (achado 3) | `taticas.tsx:46-54` |
| "Como ler" | Bom, com ressalva (achado 4) | `notas.ts:262-272` e `taticas.tsx:110-114` |
| Estado insuficiente | Funciona, mas explica pouco (achado 2) | `taticas.tsx:25,98-101` |
| Regras invioláveis | Cumpridas | Nenhum nome de fornecedor, ranking, meta ou nota; `notas.ts:271` diz que não vale como nota de fornecedor nem de pessoa; não compara com contrato; BusinessMap só |

## Achados

### Médio

1. **Estado vazio ainda fala "por fornecedor" e perde o motivo** (`taticas.tsx:76-79`). Com `esperaFornecedores` ausente, o texto é "Nenhum bloqueio por fornecedor no período." Depois da decisão do dono, o cartão não é mais por fornecedor, e a frase sugere que o dado de fornecedor falta. Também não mostra `motivoSemFornecedores`. Correção: "Nenhum bloqueio com o motivo "Aguardando fornecedor" foi encerrado no período." e, em seguida, o motivo quando existir. Nielsen: correspondência com o mundo real e visibilidade do status.
2. **Amostra insuficiente sem o limite no ponto de uso** (`taticas.tsx:25` e `98-101`). A célula diz "— amostra insuficiente" e a leitura simplesmente omite o P85. O "20 bloqueios" só aparece no "Como ler", mais abaixo. Quem lê a linha não sabe quantos faltam. Correção: na célula, "— menos de 20 bloqueios na janela de 12 semanas" (o padrão já usado no T12, "menos de 20"); na leitura, uma frase "Ainda sem percentis: menos de 20 bloqueios na janela de 12 semanas." Nielsen: visibilidade do status e ajuda a entender o estado.
3. **A leitura mistura duas janelas sem avisar e não diz "encerrados"** (`taticas.tsx:49-53`). "Os bloqueios esperando fornecedores somaram X dias úteis no período" soma só bloqueios encerrados no período do painel, mas a frase seguinte ("Em 85% dos casos a espera durou até...") vem do P85 da janela móvel de 12 semanas. Quem lê entende que é o mesmo conjunto, e que os bloqueios ainda abertos entram. Correção: "Os bloqueios encerrados com o motivo Aguardando fornecedor somaram X dias úteis no período, em N bloqueios. Nas últimas 12 semanas, em 85% dos casos a espera durou até Y dias úteis." O texto "Leia junto com os bloqueados agora" do "Como ler" cobre os abertos; a leitura só precisa não sugerir que eles entram.

### Baixo

4. **"Como ler" no cartão e `notas.ts:268` repetem o que o cartão já mostra e deixam a regra da janela em lugares diferentes.** O `Leia` (`taticas.tsx:111-113`) traz a regra de 20 e a diferença entre período e 12 semanas; a nota "Como se calcula" repete a regra. Não há erro, só redundância. Correção opcional: no `Leia`, manter só "Prazo contratado não informado" e a ligação com os bloqueados agora e o O12, e deixar a regra de 20 e as janelas na nota (e na célula, após o achado 2).
5. **Rótulo de coluna "Espera" com uma linha só** (`taticas.tsx:88`). Funciona e é lido por leitor de tela como cabeçalho, mas é pouco informativo. Opcional: "Tipo de espera" ou deixar como está, já que a legenda explica. Sem impacto de acessibilidade.

## O que continua certo

- Texto simples em português, sem jargão novo: "dias úteis" com plural correto (`plural`), "bloqueio"/"bloqueios" concordando com o número.
- "Prazo contratado não informado" aparece na leitura, no vazio e no `Leia`, então ninguém lê "dentro" ou "acima" de um contrato que não existe.
- Tabela de dados com `legenda` e cabeçalhos, sem depender de cor; nenhum gráfico novo (`lido`).
- O estado insuficiente é tratado como estado do dado, não como erro; a regra "abaixo de 20 não publicar estatística" é respeitada.
- Campos novos opcionais: uma resposta antiga (com `fornecedores` listado, sem `esperaFornecedores`) cai no estado vazio; a tela ignora `fornecedores`, o que é o desejado.

## Para o dono

Nenhuma decisão de produto nova. Os achados 1 a 3 são de microcopy e podem entrar antes do release; os 4 e 5 são opcionais.

# Review 001 · cobertura (K-056, K-057), Monte Carlo (K-059) e fechamento do K-054 · rodada 1

Data: 2026-10-10 12:15 (BRT) · Revisor: tech-lead · Branch: `develop`
Delta: `96f3d4f` (K-056), `bd57033`..`6ff6067` (K-057, 6 commits), `9ba5edf` (K-059).
Método: amostragem dirigida, olhando para remoções de código, mudanças de comportamento disfarçadas e testes vazios. Cobertura reexecutada nos quatro pacotes.

## Parecer

| Cartão | Resultado |
|---|---|
| K-056 | **ajustes necessários** (1 bloqueante) |
| K-057 | **aprovado** |
| K-059 | **aprovado** com recomendações |
| K-054 | **fechado**: o bloqueante 1 do `001-K-054-r1.md` está resolvido |

## Evidências

- Cobertura com a árvore de trabalho atual: contratos, metricas, mock e web com 100% em linhas, ramos, funções e statements (contratos 15 testes, metricas 332, mock 103, web 374).
- O hash da base mock não mudou: `mock.test.ts:39` continua `924448d4` e passa, e o arquivo não foi alterado desde `ca7de87`.
- Testes vazios: não encontrei nenhum. Todo arquivo novo tem asserções (`expect`) em quantidade compatível com os `it`. A varredura e o teste sistêmico validam o resultado contra o `SCHEMAS_RESULTADO`, o que inclui a regra dos 20, e não só executam o código.
- Remoções do K-056 (amostra: `s1`, `t5`, `estado`, `calendario`): os fallbacks inalcançáveis foram trocados por asserção de tipo, sem mudar o comportamento. `turnosDoDia` só tinha uso depois do retorno antecipado do modo `corrido`. `prioridadesAlvo` foi movida sem alteração.
- K-057: as exclusões (`main.tsx` e `PlaceholderPainel.tsx`) estão justificadas no `vite.config.ts` e em `docs/qa/estrategia-de-cobertura.md`. A correção da `Dica` (o clique logo depois do hover não fecha mais o balão) é pequena e tem teste.
- K-054: o `filtros-url.test.tsx` passou a usar `renderizarBarra`, mantém as 8 regras de filtro e URL (URL na hora, Voltar, valores padrão fora da URL, valor inválido, consolidado, isolamento fluxo/sustentação) e roda em 2,6 s no total. Ficou isolado do custo do render completo, como o r1 pedia.
- K-059 (Monte Carlo):
  - A reamostragem é com reposição, sobre uma única `Amostra`, então não há como misturar domínio nem classe.
  - `n` é a soma dos itens entregues e, abaixo de 20, o resultado é `insuficiente` sem consumir o PRNG (testado).
  - O PRNG é injetado (mulberry32), sem `Math.random`.
  - Os percentis passam por `percentilOrdenado` da biblioteca compartilhada.
  - Em `preverItens`, o P85 é conservador (quantil `1 - p`) e o P95 é no máximo igual ao P85, que é no máximo igual ao P50.
  - Há teste de propriedade para monotonia e para determinismo pela semente.

## Ajustes

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| 1 | `96f3d4f` (K-056) | O commit diz ter adicionado os testes de contratos, metricas e mock, mas 9 arquivos de teste **não foram versionados** e continuam fora do git: `packages/contratos/src/contratos.test.ts`, `packages/metricas/src/{varredura,visaoGeral}.test.ts`, `packages/metricas/src/businessmap/fixtures.cobertura.test.ts`, `packages/metricas/src/core/core.cobertura.test.ts`, `packages/mock/src/{distribuicoes,sistemico,variacoes}.test.ts` e `packages/mock/src/businessmap/catalogos.test.ts`. Do jeito que está, a `develop` tem o código morto removido, mas não tem os testes que provam os 100%. Em um clone limpo, o limite de cobertura falha. | Autor do K-056: commitar esses 9 arquivos, por caminho, em `test(cobertura): versiona os testes do K-056`. | bloqueia K-056 |
| 2 | `packages/metricas/src/core/montecarlo.ts:104` | O `while (feitos < itens)` só termina se o PRNG em algum momento sortear um período com vazão maior que zero. Um PRNG degenerado, ou uma vazão quase toda zerada com muitos itens, trava a thread ou leva muito tempo. | Colocar um teto de períodos por simulação (por exemplo, `itens * n`) e lançar `RangeError` quando ele for atingido. Incluir um teste com `prng: () => 0` sobre `[0, 20]`. | recomendado |
| 3 | `packages/metricas/src/acelerato/s1.ts:64` | O `as AlvoPrioridade` substitui o antigo `?? 0`. Se a configuração vier sem o alvo de uma prioridade, o erro passa a ser um `TypeError` genérico, em vez de um valor 0 silencioso. A mudança é aceitável, mas a mensagem não diz o que falta. | Se o alvo das 4 prioridades não for garantido pelo schema da configuração, lançar um erro de domínio explícito, por exemplo `alvo ausente para ${p}`. | recomendado |
| 4 | `web/vite.config.ts:54` | O `PlaceholderPainel.tsx` está sem uso e foi excluído da cobertura enquanto a remoção aguarda aprovação. | Abrir um cartão para removê-lo e retirar a exclusão. | recomendado |

## Próximo passo
Depois do ajuste 1, faço a rodada r2 do K-056 só sobre o commit dos testes. Os ajustes 2 a 4 podem entrar em cartões próprios.

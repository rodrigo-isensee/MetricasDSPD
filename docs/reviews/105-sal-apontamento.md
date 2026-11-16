---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-sal-apontamento
commit: 9025b3875d3e3e97b3429f13855a96e9e9ebe7c5
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: aviso quando o Apontamento é pulado por falta do sal (105, K-382, E7.271)

Intervalo: `7d7ea285` (Base-sha) até `9025b387`, um commit (`fix(coleta): avisa quando a etapa do Apontamento é pulada por falta do sal (K-382)`). 5 arquivos, +50/-3 (código e teste: +49/-3, dentro da orientação M14).

## O que foi conferido
- **Faz o que o cartão pede.** `executarColeta` (`coleta-comando.ts:140-145`) grava `avisos: ["apontamento-sem-sal"]` no resumo e chama `d.avisar` só quando a etapa era esperada: incremental, `--projetar`, cards fora de `falha`, e sem etapa nem sal. Fora disso, `avisos: []`. O código de saída não muda (a conta do `exitCode` em `coleta-businessmap.ts` não lê `avisos`).
- **Caso real da VM (sal vazio).** `config.ts:101` passa `PESSOA_ELIMINADA_SAL` por `vazioIndefinido`: `""` vira `undefined`, então o sal vazio cai no aviso, não numa etapa que quebraria depois.
- **Entrada.** `coleta-businessmap.ts:45` liga `avisar` ao `log.warn` (com `aviso: apontamento-sem-sal`) e ao stderr (`AVISO bm:coleta: ...`). A mensagem é constante (`MENSAGEM_APONTAMENTO_SEM_SAL`): nome da variável e tamanho mínimo, nunca o valor. Stdout segue só com o JSON do resumo.
- **Contrato do resumo.** `ResultadoComando.avisos: string[]`, documentado; campo novo sempre presente, sem quebrar quem lê o JSON. `AVISO_APONTAMENTO_SEM_SAL` exportado por `index.ts`, fonte única do código.
- **Regras invioláveis.** Sem pessoa, sem dado novo na base, sem mistura de fontes; segredo não aparece em saída nenhuma.
- **Testes** (`apontamento-comando-coleta.test.ts`, bloco "K-382"): sem sal com `--projetar` (aviso no resumo e uma chamada de `avisar` com o nome da variável), com sal (sem aviso), sem `--projetar` e carga inicial (sem aviso). Cobrem modo, `--projetar` e sal.
- **CHANGELOG** em `### Corrigido`.

## Suíte
Sem PR para a branch: a suíte inteira fica para o CI do PR. No head `9025b387`, o run de push 43918661346 terminou `completed:success` (jobs `filtro`, `rapida`, `seguranca`, `openapi`, `build`, `testes`, `banco` e `imagem`; `perf` e `e2e` pulados pelo filtro), e é nele que o teste novo rodou. Não rerrodei o SHA.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:142 · a parte `coleta.estado !== 'falha'` da guarda não tem teste do ramo de falha: o mutante que a remove sobrevive, porque nenhum caso tem cards em `falha`. Sugestão: caso com o servidor falso devolvendo erro nos cards e `avisos: []`.
- A2 (recomendado) server/src/modulos/businessmap/coleta-comando.ts:142 · `d.etapaApontamento === undefined && d.sal === undefined` testa dois sinais do mesmo fato, e o teste "com sal" passa os dois juntos, então remover qualquer um deles não derruba teste. Sugestão: ficar com um sinal só (a etapa ausente é o que importa para o aviso) ou cobrir cada um com um caso.
- A3 (recomendado) server/src/entradas/coleta-businessmap.ts:45 · `avisar` é genérico na interface (`DepsComando.avisar`), mas a entrada marca todo aviso com `aviso: apontamento-sem-sal`. Hoje só existe esse aviso; quando vier o segundo, o código deve viajar com a mensagem (por exemplo, `avisar(codigo, mensagem)`).

## Sem teste
A ligação de `avisar` ao log e ao stderr (`coleta-businessmap.ts:45`) é a entrada do processo, sem teste próprio, como o resto do arquivo; conferida por leitura.

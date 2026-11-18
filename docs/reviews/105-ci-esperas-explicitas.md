---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-esperas-explicitas
commit: 200f49e85795d4ece01127c5d698f8b6d63f432b
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: esperas explícitas respeitam a espera global do CI (105, E7.548, review E7.554)

Classe T (só review e CI). Passada única do delta `c7599d7d..220932ff` (38 arquivos, +355/-134), revisado no head `200f49e8`. O merge da develop (`200f49e8`, E7.555) não muda o patch: `git diff c7599d7d..220932ff` e `git diff origin/develop...200f49e8` só diferem nos hashes de índice de um arquivo (conflitos de `setup.ts` e do changelog resolvidos iguais ao `220932ff`).

## Leitura
- **Helper (`web/src/test/espera.ts`).** `limiteEspera(n)` devolve `Math.max(n, getConfig().asyncUtilTimeout)`, lido na hora da chamada, depois do `configure` do `setup.ts`. O explícito só alonga: na estação (global 5 s) as esperas explícitas seguem com o valor de antes; no CI (global 15 s, `ci.yml:56` e `homolog.yml:81`) nenhuma fica abaixo dos 15 s. É o defeito do run 44162292092 (3 testes de `equipe.test.tsx` caindo em 8,2 s).
- **Espera na estação segue em 5 s.** `vite.config.ts:76` mantém o padrão `'5000'` quando a variável não vem; o diff não toca o `vite.config.ts` nem os workflows.
- **`lerEsperaAsync` fecha o A1 do review do #546.** Valor ausente, vazio, não numérico, infinito, zero ou negativo agora lança erro na partida, sem virar `NaN`. `setup.ts` passa a usá-lo.
- **As 133 trocas são mecânicas.** Conferi os 34 arquivos de teste um a um: com `limiteEspera(n)` trocado por `n`, o import do helper retirado e espaços, quebras e vírgulas ignorados, cada arquivo fica igual ao `c7599d7d` (0 diferenças). Os valores batem: 99×8000, 27×15000, 3×10_000, 3×4000, 1×5000 saíram e voltaram dentro de `limiteEspera(...)`. As outras linhas do diff são só a quebra de linha do formatador.
- **Nenhum teste pulado.** O diff não acrescenta `.skip`, `.only`, `.todo` nem retry; não sobrou `timeout:` literal em `findBy`/`waitFor` no `web/src`.
- **Os 3 `timeout: 40000` de `MockFonteMetricas.transporte.test.ts` (linhas 245, 262, 292)** são o segundo argumento de `it(nome, { timeout }, fn)`: tempo limite do teste no vitest, não espera de busca. Ficaram de fora com razão; as `vi.waitFor` dentro deles passaram por `limiteEspera(15000)`.
- **Testes (`espera.test.ts`).** Cobrem os dois ramos de `esperaMinima`, `limiteEspera` com a global a 15 s e a 5 s (com restauração no `afterEach`) e 7 entradas inválidas de `lerEsperaAsync`.
- **Changelog.** `changelog.d/ci-105-timeout-testes.md` ganha uma linha coerente com o diff (133 esperas, run citado, 5 s na estação, sem teste pulado nem retry).
- **Regras invioláveis.** O diff só toca teste e infraestrutura de teste: sem cálculo de métrica, sem pessoa, sem mistura de fontes.

## Ferramentas e suíte
- `npx vitest run src/test/espera.test.ts` (head `200f49e8`): 11 passed (11).
- Cobertura de `src/test/espera.ts` com esse teste: Statements 100% (6/6), Branches 100% (8/8), Functions 100% (3/3), Lines 100% (6/6). O limiar global de 100% (`vite.config.ts:84`) fica para o CI.
- Mutantes rodados contra `espera.test.ts`: `Math.max`→`Math.min` (3 falhas), sem `ms <= 0` (2 falhas), sem `!Number.isFinite(ms)` (2 falhas), global trocada por 0 em `limiteEspera` (1 falha): todos mortos. O mutante sem `valor.trim() === ''` sobrevive porque é equivalente (`Number('')` e `Number('  ')` dão 0, que o `ms <= 0` já recusa): A1.
- Suíte: sem PR, fica para o CI do PR. Cito o PQ do autor (`pnpm run pronto` verde no `220932ff`, E7.548, e no merge `200f49e8`, E7.555, segundo o histórico do pedido). Não afirmo CI verde.

## Tamanho (M14)
`git diff --numstat --no-renames origin/develop...HEAD` sem `.md`: 488 linhas. Acima da orientação de 150, mas de risco baixo: um comportamento só (a espera explícita respeitar a global), 133 trocas mecânicas conferidas acima, e o resto é o helper com o teste. O corpo do PR deve trazer `teto: excedido, 488 linhas, troca mecânica de 133 esperas explícitas por limiteEspera(n) em 34 arquivos de teste`.

## Achados
- A1 (recomendado) web/src/test/espera.ts:10 · `valor.trim() === ''` é redundante com `ms <= 0` (o mutante que o tira sobrevive, equivalente); dá para tirar a cláusula ou manter como leitura, sem efeito no comportamento.
- A2 (recomendado) web/src/test/espera.ts:12 · a mensagem diz "inteiro positivo", mas `1.5` e `1e3` passam; usar `Number.isInteger(ms)` ou trocar o texto para "número positivo".

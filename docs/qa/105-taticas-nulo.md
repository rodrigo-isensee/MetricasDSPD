---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-taticas-nulo
commit: f86be94a2b06404248ecdc419e1900988809a5df
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: 105-taticas-nulo (E7.88, PR 481)

Escopo: T3 e T7 com referência ausente nula, nunca 0 (`ref_alocacao_acordada` e `ref_limite_frentes` sem linhas na base real). Contrato: `acordadoPct` (T3), `limiteFrentes` e `acimaDoLimite` (T7) anuláveis. Aceite da mudança incompatível conferido no corpo do commit f86be94a (política de mudança, aprovação do arquiteto e do tech-lead, hashes de uso único; openapi, páginas e fotografias regenerados: diff de T3/T7 e openapi só troca o tipo por `["number","null"]`/`["boolean","null"]`). T3 e T7 seguem fora do mapa real. Sem especificação UX nova: o plano antecipado não se aplica (pedido de correção).

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t7.ts:58 · Sem teste de limite de frentes 0 cadastrado: mutante `!limite ? null` (0 virando nulo) e `?.limite || null` em repositorio.ts:154 sobrevivem. Código correto (`=== null`); falta teste do 0 no T7 e no repositório (o T3 tem).
- A2 (recomendado) server/src/modulos/metricas/servico.ts:66 · BASE_BM_VAZIA com `limite_frentes: 0` (mutante) passa em toda a suíte do server; no fallback de `bm?.base ?? BASE_BM_VAZIA` (servico.ts:327) o T7 voltaria a mostrar limite 0. Falta teste desse caminho.

## Critério → teste → resultado
Sem `CA-n` (pedido de correção); a obrigação é a decisão do dono "referência ausente é nula, nunca 0" (E7.62/E7.88).

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| T3 sem alocação: acordado nulo, statusMeta sem-referencia, desvio nulo | fixtures.cobertura.test.ts "T3: sem alocação acordada configurada..." | vazio | passou |
| T3 19 e 20 itens sem referência: acordado nulo, pct só a partir de 20 | "T3: fronteira de 19 e 20 itens..." | mínimo 20 (19 fora, 20 dentro) | passou |
| T3 com referência calcula desvio; 0 cadastrado continua 0 | "T3: com referência..." e "acordado 0 cadastrado..." | 0 x ausente | passou |
| T7 sem limite: limiteFrentes e acimaDoLimite nulos | "T7: sem limite vigente..." | vazio | passou |
| T7 com limite: acima e dentro booleanos | "T7: com limite, acimaDoLimite é booleano" | limite 3 x 5 com 5 frentes (igual ao limite = dentro) | passou |
| Mapa do banco sem linha de limite entrega nulo | metricas.mapa.test.ts "config do BM..." | vazio | passou |
| Tela T3 mostra "acordado não definido", sem selo de desvio | tatico.test.tsx "T3 ... E7.62" | nulo | passou |
| Tela T7 mostra "não definido", sem selo de limite | tatico.test.tsx "T7 ... E7.62" | nulo | passou |
| Gráfico de barras tolera `acordado` nulo (traço, série omitida) | leitura de Barras.tsx:113,145 | nulo | conferido por leitura |
| Contrato nulo no schema, openapi, páginas e fotografias | CI: `openapi`, `rapida`, `testes` do head | n/a | passou |

## Cenários e resultado real
Head testado f86be94a. O branch avançou depois para 17f19b8f (merge da develop: só `web/src/features/coleta/origem.test.tsx`, fora de T3/T7); este parecer vale para o código de f86be94a.

Testes locais (worktree em f86be94a): `packages/metricas` fixtures.cobertura 34/34; `web` tatico.test 15/15; `server` metricas.mapa 11/11.

Prova de CI (mesmo sha, run 43837370747 pull_request e 43837360178 push): `testes`, `e2e`, `e2e-parte (1/2)`, `e2e-parte (2/2)`, `banco`, `openapi`, `rapida`, `seguranca`, `build`, `imagem`, `filtro` success. Os e2e que citam T3 e T7 (`e2e/tests/b12-fluxo.spec.ts` TAT-05 e TAT-09, ordem dos cartões) rodam dentro do check `e2e` do CI; não os rerrodei localmente (precisam de navegador e servidor).

### Vermelho antes do verde
`forge-testes --vermelho ffc59d8a...` sai "nenhum teste prova a mudança": ele reverte também os arquivos de teste ao base, então não serve a esta forma (código e teste no mesmo commit). Fiz a forma manual: arquivos de produção revertidos ao base (ffc59d8a), testes novos mantidos, em worktree depois restaurada:
- fixtures.cobertura: 3 falham (T3 sem alocação nulo; T7 sem limite nulo; T3 fronteira 19/20), 31 passam.
- tatico.test: 2 falham (T3 "não definido", T7 "não definido"), 13 passam.
- metricas.mapa: 1 falha (limite_frentes nulo), 10 passam.
Com o código do PR, todos passam.

### Mutação no diff (a mão, cada mutante numa cópia restaurada com git checkout)
| Mutante | Arquivo | Resultado |
|---|---|---|
| M1 T3 `?? null` → `?? 0` | t3.ts | morto (2 testes) |
| M2 T7 mapa `r.limiteFrentes ?? 0` | mapa.ts | morto (metricas.mapa) |
| M2b T7 BASE_BM_VAZIA `limite_frentes: 0` | servico.ts | SOBREVIVE (A2) |
| M3 acimaDoLimite true sem limite (`> (limite ?? 0)`) | t7.ts | morto |
| M4a T3 0 cadastrado vira nulo (`|| null`) | t3.ts | morto ("acordado 0 cadastrado") |
| M4b T7 0 cadastrado vira nulo (`!limite ? null`) | t7.ts | SOBREVIVE (A1) |
| M4c repositório `limite || null` | repositorio.ts | SOBREVIVE (A1) |
| M5 tela T3 mostra 0% (`fmtPct(v ?? 0)`) | CartaoT3.tsx | morto |
| M6 tela T7 mostra 0 (`limiteFrentes ?? 0`) | CartaoT7.tsx | morto |
| M7 tela T7 exibe selo sem limite | CartaoT7.tsx | morto |

Justificativa dos sobreviventes: o código está certo (comparação estrita `=== null` em t7.ts e `??` em repositorio.ts leem 0 como 0); é lacuna de teste, sem defeito provado e sem efeito na base real (0 linhas em `ref_limite_frentes`). Por isso recomendado, não bloqueante; o T3 já guarda o 0.

## Verificação de dados
Consumidores de `limiteFrentes`, `acordadoPct` e `acimaDoLimite` conferidos por grep: T3/T7 (calculo, contrato, tela) e o gráfico Barras; o `acimaDoLimite` do O1 é outro campo e não muda. Nenhum cálculo novo fora da biblioteca compartilhada; BusinessMap e Acelerato não se misturam.

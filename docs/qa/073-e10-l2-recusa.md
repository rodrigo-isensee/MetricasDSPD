---
tipo: qa
contrato: 1
pedido: 073-melhorias-tecnicas-2026-11-05
branch: feature/073-e10-l2-recusa
commit: 438ffc2c7c39663836640ed9a0d4e3b3a392b0df
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-07
---
# QA: E10 Lote 2, recusa do reconhecimento sem versão ou com lista sobrescrita (pedido 073, E10.6, K-235)

Base: develop 8a4e2dd7. Código e testes do lote: 438ffc2c (review b932c6b4 e segurança 0f69e670 aprovados, só documentação sobre ele). Spec: seção "Lote 2" de `docs/analises/073-e10-plano.md` (P-E10-1, opção C). O CT novo é o CT-69, em `docs/qa/056-coletor-plano-de-testes.md` (commit a82ded88, separado deste parecer).

## Achados
- A1 (recomendado) server/tests/acelerato-e10-recusa.test.ts:20 · O duplo ignora os campos do grupo: trocar 'etapa_fluxo' por outro nome em GRUPOS_DE_LISTA (controle.ts:73) sobrevive no unitário. Afirmar o conteúdo de fluxo_sha256 e recorte_sha256 no unitário (esforço P).

## Critério → teste → resultado
| Critério (plano, Lote 2) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Lista mudada com a opção, vigência nova e sem versão recusa (`reconhecimento-sem-versao`), para as três chaves | `acelerato-e10-recusa.test.ts:35` (it.each) | uma data com versão e outra sem | passou (local) |
| Com versão na data passa; consulta usa só os campos do grupo e o dia civil em -03:00 | `acelerato-e10-recusa.test.ts:52` | 01:00Z vira dia 4; `cpe_*` de tratamento lista dentro, os demais fora | passou (local) |
| Sobrescrita (sem vigência nova) recusa (`lista-sobrescrita`) | `acelerato-e10-recusa.test.ts:46` (unitário, três chaves); `.pg` UPDATE de rótulo e INSERT com vigência antiga | UPDATE no lugar; INSERT com data passada | unitário passou; `.pg` passou na CI (job banco) |
| Chave ausente na linha anterior passa; sem mudança não consulta | `acelerato-e10-recusa.test.ts:63` | isenção da primeira coleta após o deploy | passou (local) |
| Sem último sucesso datado, o corte é a época | `acelerato-e10-recusa.test.ts:75` | `finalizado_em` nulo | passou (local) |
| Recusa sem abrir conexão MySQL, sem marca d'água, só o nome da chave no erro | `acelerato-e10-recusa.test.ts:35` (conexões iguais, `marcaAte: null`, `erro_resumo`, valor secreto ausente do erro serializado) | vazamento de valor; efeito antes da recusa | passou (local) |
| Contagem de staging e de `ref_dominio` igual antes e depois da recusa | `acelerato-e10-recusa.pg.test.ts` (INSERT direto) | escrita parcial | passou na CI |
| ac:ref-sync seguido de reconhecimento passa; lista revertida pelo ac:ref-sync passa | `acelerato-e10-recusa.pg.test.ts` (dois casos) | caminho legítimo (P-E10-4) | passou na CI |
| Ajuste em `acelerato-l9c.pg.test.ts` (grava a versão que o ac:ref-sync deixaria) | `acelerato-l9c.pg.test.ts:121-123` | teste edita `ref_dominio` direto e precisa da versão | passou na CI; só acrescenta um INSERT de versão no teste |
| Exceção do CT-37 | `acelerato-estatico.test.ts:100-101` | só o trecho literal da leitura de `ref_versao_criterio` com `dominio = 'acelerato'` sai; outro `S.core`, `dspd_core` ou BusinessMap segue reprovando | passou (local); conferida no diff |
| Sem diferença contra a base em `server/migrations`, web e `packages/contratos` | `git diff --stat 8a4e2dd7 438ffc2c` nesses três caminhos | escopo do lote | vazio, conferido |

## Cenários e resultado real
- Diff `8a4e2dd7..438ffc2c`: 8 arquivos, +240 -21; produção em `coletor.ts`, `controle.ts` e `erros.ts`. Escopo igual ao plano; nenhum CA mudou. A árvore da worktree ficou limpa.
- Suíte (máx. 2 workers): `vitest run --maxWorkers=2 tests/acelerato-e10-recusa.test.ts tests/acelerato-estatico.test.ts`: 2 arquivos, 26 passaram. Os `.pg` ficam com a CI: `gh run view 42354744079 --json headSha,conclusion` devolveu `headSha 438ffc2c7c39663836640ed9a0d4e3b3a392b0df`, `conclusion success`, com o job banco em `success`.
- Vermelho contra a base (cópia em `/tmp/claude-1000/qa-engineer-073-e10l2/`: `coletor.ts`, `controle.ts` e `erros.ts` de 8a4e2dd7 com os testes de 438ffc2c): `acelerato-e10-recusa.test.ts` falhou 8 de 9 (`TypeError: exigirVersaoDasListas is not a function`, `Cannot read properties of undefined (reading 'vocabulario_sha256')`, e os casos de recusa sem rejeição). Falha de ausência de símbolo, então a mutação à mão foi feita. `acelerato-estatico.test.ts` passa na base (a exceção só afrouxa o teste, o que é esperado).
- Mutação à mão sobre o head (cópia descartável, 11 mutantes, `acelerato-e10-recusa.test.ts`): 10 mortos, 1 sobrevivente.
  - M1 sem isenção da chave ausente: 1 falhou. M2 sem o `continue` para hash igual: 6 falharam.
  - M3 `some` por `every`: 3 falharam. M4 fuso 0: 1 falhou. M5 época trocada: 1 falhou.
  - M6 `length === 0` por 99: 3 falharam. M7 códigos trocados: 3 falharam. M8 `coluna` trocada: 3 falharam.
  - M9 sem a chamada em `coletor.ts`: 7 falharam. M11 filtro `lista` removido: 1 falhou.
  - M10 `fluxo_sha256: ['etapa_fluxo']` para `['x']`: sobreviveu no unitário, porque o duplo não olha os campos. Justificativa: `acelerato-l9c.pg.test.ts` troca `etapa_fluxo` e reconhece; com o nome errado não haveria vigência nova e a coleta recusaria `lista-sobrescrita`, derrubando o teste na CI (raciocínio, não rodado local por falta de banco). Vira o A1, recomendado.
- Recusa sem efeito colateral confere com o código: `exigirVersaoDasListas` roda em `coletor.ts:217`, antes do desvio da P-E3-2 e de qualquer conexão MySQL, só com SELECT.
- Segurança: parecer aprovado do security-engineer (0f69e670); limite do A1 dele (conferência por grupo e data) aceito na opção C, fora do escopo de teste do QA.
- Abertos sem devolução: A1 do review (conferência por data, cartão da segurança) e A2 (texto de `acelerato-listas.md`, antes do PR E10.7), e A3 do review (constante repetida). O teto M14 (261 linhas) exige `teto: excedido` no corpo do PR. Sem bug aberto.

## Parecer
Aprovado.

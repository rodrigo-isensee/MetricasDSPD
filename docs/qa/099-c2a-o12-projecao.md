---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-c2a-o12-projecao
commit: 34ba37fc11f26e3d04fab964faf7c089b6f3abb8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
data: 2026-11-12
---
# QA: 099 C2a, projeção do deadline nativo em data_acordada

Diff contra `develop` (d9f32012), 4 arquivos: `normalizador.ts` (`dataAcordada`, parse estrito), `projetor.ts` (`COLUNAS_DIM`), teste do normalizador e `.pg` novo. Obrigações: `docs/analises/099-o12-deadline.md` §1, §2 e riscos C6 e C7 do §9 (sem especificação de UX no lote). O `.pg` roda só no CI (sem banco local); a suíte inteira fica com o check-run `bateria` do mesmo sha, que não consegui consultar daqui (rede bloqueada), então não o cito.

## Achados
- A1 (recomendado) server/src/modulos/businessmap/normalizador.ts:145 · `dataAcordada('0000-01-01')` passa (JS aceita o ano 0), mas o `date` do PostgreSQL não tem ano 0000 e derrubaria o INSERT do lote. Exigir ano >= 1 e testar. Bug 099-C2A-001 (médio, vira cartão).

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| C6: texto, data e hora ou número no `deadline` viram `null` com a nota, sem o valor | `normalizador-businessmap.test.ts`, bloco C2a, 3º it (9 formas: ISO com hora, com espaço, texto, dd/mm/aaaa, 02-30, mês 13, número, booleano, vazio) | forma fora do `AAAA-MM-DD`; data impossível; nota sem o valor | passou (27 no arquivo); a lacuna do ano 0000 é o A1 |
| §2 forma válida grava o dia como está | mesmo bloco, 1º it | dia civil, sem fuso | passou |
| Ausente ou `null` fica nulo, sem nota | mesmo bloco, 2º it | vazio | passou |
| `data_acordada` entra em `dim_card` | `.pg` C2a (prazo `2026-10-30`) e teste de chaves do normalizador | coluna em `COLUNAS_DIM` | normalizador passou; `.pg` com a bateria |
| C7: segunda projeção sem mudança não cria versão | `.pg` C2a (`r.versoes` = 0; versões seguem `['2026-10-30']`) | igualdade texto x texto do `IGUAIS` | com a bateria |
| Prazo mudado gera versão; removido volta a nulo sem apagar versão | `.pg` C2a (versões `[30/10, 15/11, null]`) | append-only | com a bateria |
| Nota contada em `ctl_coleta_contagem` | `.pg` C2a (`notas.deadline_fora_da_forma` >= 1; prazo nulo) | contagem sem valor | com a bateria |

## Execução local
- `server`: `vitest run tests/normalizador-businessmap.test.ts`: 27 passaram.
- Vermelho antes do verde (`forge-testes` não existe neste projeto; feito numa cópia com o `normalizador.ts` da base d9f32012): os 3 testes novos do bloco C2a e o de chaves caíram (4 falhas). Com o HEAD, passam.
- Os `it` do `.pg` não rodei (regra: só no CI).

## Mutação (cópia descartável de `git archive`, restaurada a cada uma)
- M1 tirar a conferência de ida e volta do calendário: caiu o teste das 9 formas (02-30 e mês 13). Morta.
- M2 tirar `deadline_fora_da_forma`: caiu o teste das formas ruins. Morta.
- M3 tirar `data_acordada` do retorno de `projetarCard`: 4 falhas. Morta.
- M4 tirar o `$` da regex: sobrevive, equivalente: a ida e volta pela `Date` com `T00:00:00Z` duplicado dá data inválida e cai na nota.
- M5 tirar o `typeof === 'string'`: sobrevive, equivalente: a regex converte número em texto sem os hífens, nunca casa.
- Fora do alcance local: tirar `data_acordada` de `COLUNAS_DIM` no `projetor.ts` só é morto pelo `.pg` (bateria).

## Veredito
Aprovado. C6 e C7 estão cobertos; o único caso faltante é o ano 0000 (A1), de probabilidade baixa e fora do formato que o teste do coletor usa, por isso recomendado, não bloqueante.

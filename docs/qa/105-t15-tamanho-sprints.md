---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-tamanho-sprints
commit: d698aefe3ee6205e265cb1e9b4e89d8dbc288a45
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---

# QA: T15 Tamanho das sprints (105, E7.578)

parecer: aprovado. Delta do T15 sobre o T8 (`origin/feat/105-t8-sprint-real..d698aefe`, 45 arquivos) confere com a decisão do dono: P50, P85 e média juntos em dias úteis, mesma janela do T8 (`sprintsDoRecorte`, first_start a first_end, teto de 30 dias úteis, entra pela conclusão), mínimo de 20, só BusinessMap, sem quebra por time. Sem PR e sem CI: não afirmo suíte inteira verde; cito só o `pnpm run pronto` do autor (rc=0, web 1920/1920, `docs:check` ok), que não rerrodei. Limite: sem leitura da base real (credenciais em `.env`); fixtures.

## Critério, teste e resultado
Sem especificação de UX própria com `CA-n`: as obrigações são a decisão do dono (detalhe do portão) e as regras invioláveis.

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| 20 sprints publicam P50, P85, média; schema válido | `t15.test.ts` "com 20 sprints..." | verde | mínimo exato (20) |
| 19 sprints só contagem, sem `valor` | `t15.test.ts` "com 19..." | verde | logo abaixo do mínimo |
| Sem first_end fora do período; sem início e acima do teto contados; igual ao T8 | `t15.test.ts` "sem first_end..." | verde | teto 30; datas nulas |
| Sem sprints: zero e insuficiente, nunca erro | `t15.test.ts` "sem sprints..." | verde | vazio |
| Janela comum não regride o T8 | `t8.test.ts` (existentes), `o23.test.ts` | verde (3 arquivos, 23 testes) | recorte pela conclusão |
| Contrato e fotografia: enum T15, schema, VISAO_GERAL | `packages/contratos` (13 arquivos, 240 testes) | verde | enum |
| Cartão: P50, P85 e média juntos; abaixo de 20 só a contagem; nota "fora da conta" | `t15-tamanho-sprints.test.tsx` (3), `catalogo.test.tsx` | verde (3 arquivos, 10 testes) | menos de 20 |
| Sem comparação entre times, sem ranking, BusinessMap sem Acelerato | leitura de `t15.ts`, `previsao.tsx`, `regras.ts` (`segmentacao: []`, `dominio: businessmap`), `servico.ts` (ext só do BM, `EXTENSAO_AC_VAZIA`) | conforme | regra inviolável |
| Percentis pela biblioteca | `resumoComMedia` em `t15.ts`; classe `sprint` própria na amostra | conforme | classe nunca misturada |

## Vermelho antes do verde
`t15.ts`, o cartão e o schema não existem na base do T8: `t15.test.ts` e `t15-tamanho-sprints.test.tsx` não carregam nela (import de `calcularT15`/`CartaoT15` ausente), logo são vermelhos sem a implementação. O `t8.ts` refatorado é coberto pelos testes do T8 já existentes, verdes no head. Não usei `forge-testes` (comando do Forge).

## Mutação no diff (cópia local, restaurada; árvore limpa)
`t15.test.ts` + `t8.test.ts` (14 testes):
- M1 dias úteis +1: morto. M3 p85 = p50: morto. M5 média = p95: morto. M6 recorte pela conclusão removido do `t8.ts`: morto (4 falhas).
- M2 troca `semDatas` com `acimaDoTeto` em `foraDaConta`: SOBREVIVEU (fixtures com 1 e 1, simétricas; a igualdade com o T8 também é simétrica). Ver A1.
- M4 classe `sprint` trocada por `story` na amostra: sobrevive; equivalente em saída (a classe é só marca de tipo, com uma única classe na amostra). Aceito.

## Observação de texto (sem bug)
O cartão e a nota dizem "um time por vez", mas o filtro aceita vários times e, pela decisão do dono, as sprints se somam (o dono foi avisado). Não há comparação nem quebra por time, então a regra inviolável vale. Ver A2.

## Achados
- A1 (recomendado) packages/metricas/src/businessmap/t15.test.ts:60 · fixture do `foraDaConta` com semDatas=1 e acimaDoTeto=1 não distingue troca dos dois campos (mutante M2 sobrevive); usar valores distintos (ex.: 1 e 2).
- A2 (recomendado) web/src/features/complementares/notas.ts:140 · "Um time por vez" contradiz o filtro com vários times somando sprints; dizer "pelo filtro de time; com vários times, as sprints se somam".

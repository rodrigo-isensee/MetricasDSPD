---
tipo: qa
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-fix-coleta
commit: f763d6acffca29233c78966abe44882be10c1daa
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-01
---
# QA: correção da coleta real do BusinessMap (pedido 052, E2.86, K-182)

Links: review `docs/reviews/052-fix-coleta.md` (87d6b7d), segurança `docs/security/052-fix-coleta.md` (b06909d), ADR 0020 (4b e 4c), ADR 0022, `docs/integracao/businessmap-api-configuracao.md`.

**Parecer: aprovado**, sem bug aberto, sobre o commit `f763d6a` (o código de produção da branch; os dois commits depois dele só somam os pareceres de segurança e de review). Nenhuma chamada ao BusinessMap real; o `.env` não foi aberto nem impresso (só carregado pelo script de teste do repositório).

## Escopo e método
Correção sem especificação de UX nem contrato de API novo, então não há plano antecipado. As obrigações são a decisão do dono de 2026-11-01 (a carga falhou com 400), a ADR 0020 (4b e 4c: `co_owner_ids` alimenta `dim_card.responsaveis` e o `houveTroca` do O26) e a ADR 0022 (só GET, allow-list, staging sem pessoa). Testes novos do autor em `coleta-businessmap.test.ts` (4 testes, bloco E2.83) sobre um servidor falso que agora valida a consulta como a API (enums de `fields` e `expand`, filtro de data com hora). Não escrevi teste novo: os do autor cobrem cada obrigação e um segundo falharia pelo mesmo motivo.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| `co_owner_ids` fora de `fields` e dentro de `expand`; todo valor de `fields` e `expand` está nos enums da API | E2.83, "fields e expand da coleta só com valores dos enums" | passou | `watcher_ids` e valor fora do enum recusados |
| Datas de `archived_from` e `discarded_from` com hora UTC (`AAAA-MM-DDT00:00:00Z`) na carga inicial, na retomada e com `inicio` explícito | E2.83 (filtro) e os três da F3 ajustados (`2025-11-02T00:00:00Z`, `2025-10-15T00:00:00Z`, `2024-11-02T00:00:00Z`) | passou | data pura recusada com 400 |
| Servidor falso reproduz o 400 da carga real (fields com `co_owner_ids`, data sem hora) e aceita a forma nova | E2.83, "o servidor falso recusa com 400"; "a consulta antiga seria recusada" | passou | a regressão aparece no teste |
| Carga inicial nos três estados sem 400, `dim_card.responsaveis` e `/users` seguem alimentados (ids `5,6,7` e `5,8`) | E2.83, "carga inicial passa na validação da API" | passou | card sem co-responsável; só `user_ids` vistos na execução |
| Staging sem pessoa: nenhum `co_owner_ids` nem `owner_user_id` em payload | mesmo teste (varre `stg`) e os de allow-list da F3 | passou | pessoa só em memória |
| Allow-list de consulta do cliente aceita `expand=co_owner_ids` e recusa `watcher_ids` | E2.83 (`EXPAND_CARDS`), `http.test.ts` | passou | quinto valor do `expand` e valor fora da lista |
| `dim_card.responsaveis` e O26 seguem pelo projetor | `.pg`: `responsaveis`, `projetor-businessmap`, `projetor-businessmap-qa`, `coleta-businessmap`, `coleta-businessmap-qa` | passou | papel `dspd_api` sem coluna de pessoa |
| Limite de requisições respeita 30 por minuto | leitura de `config.ts:63` (`BUSINESSMAP_LIMITE_POR_MINUTO`, padrão 25, máximo 25) | passou | teto de configuração abaixo de 30 |

## Resultado real
- Suíte unitária do server (`pnpm exec vitest run --project unit`, uma suíte por vez): **55 arquivos e 1074 de 1074**.
- Suíte `.pg` do server contra o PostgreSQL local (`bash scripts/test-pg.sh`, sob `nice -n 19`, sem outra suíte rodando): **25 arquivos e 162 de 162**. O `pnpm --filter ... test:pg` direto, sem o script, deu 25 arquivos "skipped" (sem as variáveis de conexão): não vale como execução e foi refeito pelo script. O script recriou o contêiner `metricasdspd-postgres-1` do Compose (volume persistente, só os schemas de teste são removidos).
- `tsc --noEmit` do server e `eslint` dos 4 arquivos do diff: sem saída.
- Vermelho antes do verde: `coleta.ts` e `http.ts` da base `55301e0` numa cópia descartável com os testes do HEAD: `tests/coleta-businessmap.test.ts` cai em **23 dos 67**, os 4 novos e os da F3 que o servidor validador agora derruba (a consulta antiga recebe 400 e a coleta termina com zero cards, o que reproduz a falha do dono). No HEAD, os 67 passam. `forge-testes` não se aplica (projeto, não o Forge).
- Mutação no diff, manual, em cópia descartável (6 mutantes, cada um revertido, rodando `coleta-businessmap.test.ts` e `http.test.ts`): todos morreram.

| Mutante | Arquivo | Resultado |
|---|---|---|
| M1 `co_owner_ids` de volta em `fields` | coleta.ts | 22 testes caem |
| M2 `filtroDeData` devolve a data pura | coleta.ts | 13 caem |
| M3 `co_owner_ids` fora do `expand` | coleta.ts | 5 caem |
| M4 `EXPAND_CARDS` sem `co_owner_ids` | http.ts | 24 caem |
| M5 carga inicial usa `inicioCarga` sem `filtroDeData` | coleta.ts | 11 caem |
| M6 hora do filtro trocada para `T23:59:59Z` | coleta.ts | 4 caem |

Sem sobrevivente. Nenhum teste foi marcado como skip; não houve teste instável.

## Observações (não devolvem)
- O servidor falso valida contra os enums da OpenAPI pública, transcritos pelo autor, e não contra a API viva. A prova final de que `expand=co_owner_ids` e a data com hora passam é a carga real do dono, que o brief já prevê; se a API recusar outro valor, o teste não o antecipa. Registro como limite do método, sem achado.
- `last_modified_from` do incremental já saía com hora (`iso()`, formato `Z`); o delta não o mudou e os testes da F3 o cobrem.

## Achados
- A1 (recomendado) docs/qa/052-fix-coleta.md:1 · nenhum bloqueante; a conferência real do `expand=co_owner_ids` fica para a carga do dono (limite do servidor falso), sem devolver a entrega.

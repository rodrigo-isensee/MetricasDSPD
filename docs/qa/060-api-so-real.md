---
tipo: qa
contrato: 1
pedido: 060-triagem-dependabot
branch: feature/060-api-so-real
commit: 0183e430d6b3df391a60320abc652022d0f17aab
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-03
---

# QA: API só com dado real (pedido 060, E2.16, cartão K-195)

Links: plano `docs/architecture/060-sem-mock.md` (P2, P3 e a parte de servidor do P5), pareceres de review, segurança e devops da mesma branch (aprovados em 0183e43).

## Veredito
**Aprovado.** A API recusa subir com as variáveis antigas, o mock só liga por ativação explícita, métrica fora do mapa real responde sem dado real com o motivo e sem número, PV1 e BLOQUEADOS entram no mapa real e a VISAO_GERAL responde sem dado real em vez de 503. Sem bug aberto. Dois recomendados abaixo.

## Execução (HEAD de código 0183e43; os commits seguintes só mexem em pareceres)
- `git pull --ff-only origin feature/060-api-so-real`: já atualizado.
- `tsc --noEmit` no `server/`: saída vazia, rc 0.
- vitest, 4 workers, os 14 arquivos de teste da branch que não são `.pg`: 14 arquivos, 423 testes, todos passaram.
- `packages/contratos/src/origem.test.ts`: 11 testes, passaram.
- Não rodei `pronto` nem `test:pg` (a trava da suíte não funciona no sandbox): ficam para a CI do PR. Os testes `.pg` da branch (`metricas.pg`, `painel-real-f6.pg`, `qa-sust-real.pg`) ficam sem execução minha.
- Carga 1,4 e 13 GB livres antes do vitest.

## Critério, teste, resultado
| Obrigação (plano 060) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| P2: recusa `DADOS_FONTE` e `DSPD_SCHEMA_PREFIXO_SEED`, mesmo vazias, sem eco do valor | `plataforma2.test.ts` (api, pedido 060 P2); `guarda-mock.test.ts` (mensagem) | variável presente com valor vazio ou segredo | passou |
| P2: mock só com `DSPD_MODO_MOCK=homologacao`; outro valor recusa | `plataforma2.test.ts` (`1`, `true`, `mock`, `teste`, vazio) | valor logo fora do permitido | passou |
| P2: mock é injeção (`modoMock`) com selo `x-dados-ficticios`; portão do mapa real não vale no mock | `metricas.test.ts`, `painel-real-f6.test.ts` | padrão ausente x ligado | passou |
| P2/A1 segurança: mock recusa subir com coleta real em `bm` ou `ac`, mensagem só com tabela e contagem | `guarda-mock.test.ts` (3 testes: sem coleta, bm, ac) | zero x 3 linhas, cada esquema | passou (função); ver A1 |
| P3: métrica fora do mapa responde 200 `sem-dado-real` com motivo, sem número, sem ler a base | `painel-real-f6.test.ts` (O8, O12, O14, O19, T1, E1, S1), `origem.test.ts` (schema recusa `valor`, motivo vazio) | corpo sem número, motivo nunca vazio | passou |
| P3: cache, ETag, data pedida e data futura (400) no estado sem dado real | `painel-real-f6.test.ts` | data futura | passou |
| QV1/Q2: PV1 e BLOQUEADOS no mapa real; origens exatas | `qa-f6-painel.test.ts`, `origem.test.ts`, `painel-real-f6.test.ts` | lista exata do mapa | passou |
| Q4: VISAO_GERAL responde sem dado real, nunca 503, mesmo sem alvos | `painel-real-f6.test.ts` | referência de alvos ausente | passou |
| P5 servidor: compose de homologação liga o mock | revisão do diff e parecer de devops (sem teste automático aqui) | n/a | conferido |
| Regras invioláveis: BusinessMap e Acelerato separados nas cargas; sem métrica individual | `metricas.paridade.test.ts`, `metricas.test.ts` (filtros de pessoa recusados) | filtro `autor` | passou |

## Mutação no diff (cópia descartável em `$TMPDIR`, sobre 0183e43)
- M1 `semDadoReal()` sempre `false` (portão do mapa fora): morto, 6 testes caíram em `painel-real-f6.test.ts`.
- M2 lista `VARIAVEIS_REMOVIDAS_API` vazia: morto, 2 testes caíram (`plataforma2`, `guarda-mock`).
- M3 sem o cabeçalho `x-dados-ficticios`: morto, 1 teste caiu.
- M4 `modoMock` sempre `false` no `buildApp`: morto, 28 testes caíram.
- M5 PV1 e BLOQUEADOS fora do mapa em `origem.ts`: sem veredito (o servidor lê o pacote por link do workspace, a cópia não valeu; `origem.test.ts` não carregou na cópia). Cobertura vem da lista exata em `qa-f6-painel.test.ts`.
- M6 chamada de `exigirMockSemColetaReal` fora de `entradas/api.ts`: sobreviveria, pois nenhum teste exercita a entrada (ver A1). Não rodei, é a leitura do diff.
- Vermelho antes do verde por `git stash`/base: não rodei (`forge-testes` é do repositório Forge); os testes novos de P2 e P3 caem contra a base pelo desenho (a base não tem `modoMock`, `semDadoReal` nem `guarda-mock.ts`), e M1 e M4 mostram que caem sem a implementação.

## Achados
- A1 (recomendado) server/src/entradas/api.ts:21 · a chamada de `exigirMockSemColetaReal` na partida não tem teste; só a função tem. Tirar a linha não derruba nada. Teste `.pg` com o papel `dspd_api`, ou extrair a partida para função testável.
- A2 (recomendado) docs/qa/060-api-so-real.md:1 · testes `.pg` da branch e `pronto` sem execução minha (trava da suíte no sandbox); conferir o verde na CI do PR antes do merge.

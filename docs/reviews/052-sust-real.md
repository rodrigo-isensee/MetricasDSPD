---
tipo: review
contrato: 1
pedido: 052-integracao-businessmap
branch: feature/052-sust-real
commit: 671e8d718c5f2a0f161af60fe4ce05eaaecb9426
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-01
---
# Review: 052-sust-real (sustentação com dado real do Acelerato, E2.115 e E2.117, K-182)

**Veredito (E2.118): aprovado** em `671e8d7`. O mapa de origem passa S2, S3, S4, S8 e S10 para real e deixa S1, S5, S6, S7, S9, S11, S12 e EI_SUST em mock, cada uma com o seu motivo, como pedem o plano 056 e a decisão do dono de 2026-11-01 17:30 (falta campo, segue fictícia com selo e motivo). A correção da S8 no modo de duas bases está certa. O selo do web passa a sair só do mapa, e isso só muda o resultado da S8. Nenhuma métrica mistura BusinessMap e Acelerato. Dois recomendados, nenhum bloqueante.

## O que li
`git diff 2efa879..671e8d7` (o delta desde a F6; o que vem da F6 já tem pareceres próprios): `packages/contratos/src/origem.ts` e o teste dele, `server/src/modulos/metricas/servico.ts`, `server/tests/painel-real-f6.test.ts`, `server/tests/painel-real-f6.pg.test.ts`, `server/tests/qa-f6-painel.test.ts`, `web/src/features/coleta/OrigemDosCartoes.tsx` e o teste dele, e `docs/api/metricas.md`. Também li as linhas da E2.115 e da E2.117 no Histórico do pedido. Para ter o contexto, li ainda `ehReal` e `esquemasDe` (`servico.ts:97-104`), `METRICAS_COM_ALVOS` (`servico.ts:34`), `COMPLEMENTARES` (`servico.ts:59`), o `status` do catálogo e `COM_EXTENSAO_MOCK` (`packages/contratos/src/cartoes.ts:58-64` e `:90-93`).

## Foco pedido

**Reais e mock com motivo.** `METRICAS_ORIGEM_REAL` ganha S2, S3, S4, S8 e S10 (`origem.ts:25-31`). `MOTIVO_ORIGEM_MOCK` dá motivo a S1, S5, S6, S7, S9, S11, S12 e EI_SUST (`origem.ts:56-63`):
- S1: falta o prazo de SLA por prioridade. `ref_alvo_prioridade` não tem fonte na base real, e na base real a S1 cairia no 503 de `METRICAS_COM_ALVOS`. A pergunta de quem carrega esse prazo está na fila do dono.
- S5, S6, S7 e S11: falta o tipo e o domínio do campo do chamado (P-DS-19).
- S9: falta o motivo de pendência (P-DS-19).
- S12: falta a fonte do registro posterior de exceção de SLA.
- EI_SUST: o plano 056 não a calcula. Seguir em mock é o ramo "se faltar campo" da decisão de 17:30, e não há cálculo por inferência.

Nenhuma das reais está em `METRICAS_COM_ALVOS`, então nenhuma delas cai no 503 sem os alvos. Os testes de contrato fixam a lista exata das reais e cada motivo (`origem.test.ts:13-46`).

**S8 em duas bases (`servico.ts:280-282`).** Antes, no modo de duas bases, `deps.extensoes` existe por causa do seed. Assim a S8 real ficava sem `extReal` e, por ser real, também sem a extensão mockada (`!real`). Ela perdia o campo dos 90 dias. Agora `real || extensoes === undefined` dá à S8 real a extensão montada a partir dos chamados da base real (`EXTRAS_AC.get(ac.base)`, com `ac` carregado da base real). Com base única e fonte mock, nada muda (vale o mock). Com base única e fonte real, também nada muda. Dois testes novos provam o comportamento: cobertura 3 de 3 com o campo projetado, e "sem campo" (nunca 0%) quando nenhum chamado tem o campo (`painel-real-f6.test.ts:137-148`).

**Selo do web só pelo mapa (`OrigemDosCartoes.tsx:29-33`).** Com a fonte `api`, o `status` do catálogo deixa de contar. Conferi o alcance. O catálogo marca `mock` nos cartões de percepção (PV1, que segue mock pelo mapa) e nos complementares de `COM_EXTENSAO_MOCK` (O17, T8, E4, S8, S11, S12). Desses, só a S8 é real no mapa. A mudança, portanto, só tira o selo da S8, e é isso que se quer. Com a fonte `mock`, vale o catálogo como antes. Os testes do web cobrem o selo e o motivo de cada cartão da sustentação e a contagem do cabeçalho (`origem.test.tsx:80-113`).

**Teste .pg (e), que trocou S12 por S3 (`painel-real-f6.pg.test.ts:115-128`).** A prova ficou mais fraca. Antes, a S12 mostrava no PostgreSQL que o `UPDATE` na base real chegava à resposta. Agora a S3 só confere o status 200, e nenhuma métrica real da sustentação prova, contra o banco, que lê `R.ac`. O título do teste ("mexer na real muda só as reais") promete o que o teste não confere. A parte mock (resposta igual à da base única para S1, S5, S9, S12 e EI_SUST) continua forte. O roteamento real está provado no teste unitário: 1 leitura de `r_dspd_ac.dim_chamado`, 0 do seed e 0 do BusinessMap (`painel-real-f6.test.ts:117-135`), com o mesmo SQL do repositório. Por isso o achado é recomendado (A1), sem defeito provado.

**Nada mistura BusinessMap e Acelerato.** As reais da sustentação são do domínio `acelerato`, então `bm` é `null` e nenhuma leitura vai a `dim_card` (o teste afirma `NA_REAL` 0 e `NO_SEED` 0). A única métrica que lê os dois domínios é a VISAO_GERAL, que segue mock. Cada métrica lê uma base só, escolhida por `esquemasDe(real)`.

**Documentação.** A seção da F6 em `docs/api/metricas.md` diz quais métricas são reais, quais são mock, o motivo de cada uma e a regra da S8. Está em dia.

## Teto de linhas (decisão M14)
Contei com `git diff --numstat --no-renames 2efa879..671e8d7`, sem o `.md`: **199 linhas** (173 a mais e 26 a menos). São 49 de código e 150 de teste, 49 acima do teto. É um comportamento só: a sustentação lida do dado real pelo mapa de origem. A correção da S8 e o selo pelo mapa são condição para a S8 real sair certa e sem selo. Aceito a exceção: o excesso é teste. Dividir deixaria a S8 real errada ou com selo num PR intermediário. Hoje o diff contra a `develop` ainda carrega a F6 (PR 188). Depois do merge do 188, o PR da E2.121 reconta contra a `develop` e leva `teto: excedido, <n> linhas, sustentação com dado real do Acelerato pelo mapa de origem (S2, S3, S4, S8 e S10 reais; demais com motivo), um comportamento`. Sem essa linha, ou com número antigo, vira bloqueante.

## Checklist (leitura)
1. Escopo: faz o que a E2.115 e a E2.117 pedem, sem nada além.
2. Arquitetura: segue a ADR 0024, com o mapa de origem como fonte única, e respeita as regras invioláveis. Nada de pessoa: os testes usam chamado sem nome nem e-mail (ADR 0020). A segurança dá parecer próprio em `docs/security/052-sust-real.md` (E2.119).
3. Legibilidade: os motivos são constantes nomeadas e os comentários dizem o porquê. Um comentário ficou desatualizado (A2).
4. Tipos: `Partial<Record<MetricaId, string>>` e `as const` nas listas dos testes. Sem cast novo.
5. Segurança: sem segredo e sem SQL novo. Só muda o roteamento.
6. Performance: as bases continuam carregadas uma vez por origem. O teste do aquecimento segue no arquivo.
7. Testes: cobrem real e mock por métrica, motivo, a S8 com e sem campo, o selo e a contagem. A ressalva do .pg está em A1.
9. Commits: dois, em Conventional Commits, com o porquê.
11. Teste de ausência: o teste antigo "Sustentação segue mock" foi trocado por listas explícitas. A checagem de `T|E` (`qa-f6-painel.test.ts:101`) ainda acha itens no catálogo.

As práticas do projeto (`docs/engineering/praticas.md`) não marcam as regras com "decidida por". Pendência que já vem de antes: lint, tipos e o pronto completo ficam com o QA (E2.120), porque o autor não rodou o pronto completo.

## Achados
- A1 (recomendado) server/tests/painel-real-f6.pg.test.ts:115 · o (e) só confere 200 na S3: nenhuma real da sustentação prova no PostgreSQL que lê R.ac; usar S4 ou S10 e comparar o corpo com a base única, ou corrigir o título
- A2 (recomendado) server/tests/qa-f6-painel.test.ts:100 · comentário diz "só as 7 do plano 056"; após a E2.117 são 5; o título em painel-real-f6.test.ts:102 ainda diz "Sustentação no seed"

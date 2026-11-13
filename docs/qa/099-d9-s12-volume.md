---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d9-s12-volume
commit: f294aeb7324cf198c31363ee928c52d3318086b3
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---
# QA: D9, S12 no mapa real com o volume (pedido 099)

Base 4c4a7a33, head fac4c624 (d86d33d3, 970258a4, e80e647a, b3bac117, fac4c624). Classe N. Worktree destacada com node_modules reais. Os `.pg` e a suíte inteira ficam para o check-run `bateria` do PR (I5).

## Achados
- A1 (recomendado) e2e/playwright.config.ts:61 · o ramo "campo sem fonte" do S12 não tem e2e no chromium-api: esse projeto sobe o mock, onde a exceção de SLA vem preenchida. Sem bloqueio; ver a resposta abaixo.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| S12 real no mapa de origem, motivo nulo | origem.test.ts (lista real com S12; origemDaMetrica e motivo nulo) | S12 fora do mock | passou |
| excecaoSla nula sem extensão, nunca 0% | complementares.test.ts (2 testes) | base real sem o campo; com extensão segue taxa | passou |
| Contrato aceita null e nota própria; enum da sustentação não cresce | origem.test.ts D9; painel-real-f6.test.ts D9 (safeParse) | enum NOTA_S12 isolado | passou |
| Servidor real: volume presente, nota publicada, sem duplicar nem tocar outra métrica | painel-real-f6.test.ts (2 testes D9) | idempotência da nota; S3 intocado; mock sem nota | passou |
| Web mostra "campo sem fonte" e nunca 0% | leitura-s12.test.ts (nula, taxa, insuficiente) | null, ok, insuficiente | passou |
| Catálogo com S12 disponível, fora de COM_EXTENSAO_MOCK | cartoes.test.ts | status real | passou |
| Versão de critério afeta S12 | criterios.ts (VERSAO_CRITERIO_S12_VOLUME_REAL na lista da biblioteca) | n/a | lido no diff; testes de versões na bateria |
| Aceite de resultados/S12 sem v2 | fotografia e aceitas.json (docs:check) | web único consumidor, mesmo caso do S1 (PR 364) | docs:check roda no CI |
| e2e com S12 fora de MOCK | complementares.spec.ts | selo fictício ausente no S12 | alteração lida; execução no CI |

## Cenários e resultado real
- lint-alterados: rc 0 (17 arquivos). typecheck-alterados: packages/metricas, server e web verdes.
- contratos (origem, cartoes): 33 passaram. metricas (complementares): 21. server (painel-real-f6, qa-f6-painel): 47. web (features/complementares): 313.
- Vermelho antes do verde, por mutação nos arquivos do diff; cada uma derrubou testes novos e foi desfeita (worktree limpa):
  - s12.ts, `ext === undefined` trocado por `false`: 2 testes de complementares.test.ts caíram.
  - parte-sem-dado.ts, `!== null` trocado por `=== undefined`: o teste D9 do mock e da função pura caiu.
  - sustentacao.tsx sem o ramo nulo: o teste de campo sem fonte caiu.
- Consumidores de `excecaoSla` fora de testes: só s12.ts, servico.ts (via nota), parte-sem-dado.ts e sustentacao.tsx; o único consumo na web já trata null.
- Regras do projeto: sem ranking, sem comparação entre times, sem mistura BusinessMap/Acelerato; o S12 lê só o Acelerato.

## Resposta: o ramo de campo sem fonte do chromium-api precisa de e2e?
Não. O projeto chromium-api sobe o servidor em modo mock, onde o S12 mantém a exceção de SLA, então o ramo não é alcançável ali sem um servidor real com base do Acelerato, que o e2e não tem. O ramo está provado em três pontos: leitura-s12.test.ts (texto), painel-real-f6.test.ts (servidor real: null com nota, validado no schema) e o comentário do complementares.spec.ts que registra o motivo. Um e2e dele repetiria o teste de componente por outro caminho. Reavaliar só se a base real passar a alimentar o e2e.

## Revalidação (volta 1 da web, 047f9d60)
Delta de código e testes desde fac4c624: 7 arquivos da web (catálogo: CatalogoPage, linhas, catalogo.test; complementares: comuns, notas, sustentacao, ramos.test). Contrato inalterado.

| Correção | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Nota do S12 fixa quando excecaoSla é nula (ALTO-1) | ramos.test.tsx: S12 sem meses e com exceção nula | excecaoSla null, sem notas do servidor | passou |
| Texto próprio da reincidência sem fonte (ALTO-2) | ramos.test.tsx (mesmo teste: não diz que nada é publicado) | CampoSemFonte com e sem texto | passou |
| Cuidados do S12 em notas.ts (MÉDIO-1) | suíte de notas e complementares | n/a | passou |
| Anotação Parcial na linha S12 do catálogo, sem terceiro valor (MÉDIO-2) | catalogo.test.tsx: "Parcial: volume por sistema; reincidência sem fonte"; contagem "Sem dado real" segue 65 - reais | dados continua Real ou Sem dado real | passou |

- Testes dos arquivos tocados (web/src/features/catalogo e complementares): 13 arquivos, 322 passaram.
- lint-alterados: 23 arquivos, sem erro. typecheck-alterados: mock, metricas, server e web verdes.
- Mutação, desfeita (worktree limpa): `r.excecaoSla === null &&` trocado por `false &&` derrubou o teste da nota fixa do S12; `l.anotacao ?` trocado por `false ?` derrubou o teste do catálogo. Na rodada da primeira mutação, outros testes de complementares caíram por prazo sob carga; não são do diff e passam na rodada limpa acima.
- A1 segue como estava (recomendado, sem bloqueio). Suíte inteira e `.pg`: check-run `bateria` do PR (I5).
- Parecer: aprovado, sem bugs abertos.

## Revalidação (integração da develop e C8a, 57c74bc3)
Delta 047f9d60..57c74bc3 no domínio do QA: docs/api/metricas.md (linha do O25, só texto), packages/contratos/src/origem.ts e origem.test.ts (O25 em `METRICAS_ORIGEM_REAL`), server/tests/painel-real-f6.test.ts e qa-f6-painel.test.ts (O25 e S12 juntos na lista de reais; conflito do 8d8b4739 resolvido sem perder nenhum dos dois).
- Testes rodados na worktree destacada: contratos origem.test.ts, 16 passaram; server painel-real-f6 e qa-f6-painel, 47 passaram.
- Nenhum teste de S12 perdido na resolução; sem achado novo. A1 segue (recomendado). Suíte inteira e `.pg`: check-run `bateria` do PR (I5).
- Parecer: aprovado, sem bugs abertos.

## Revalidação (CI vermelho corrigido, d9abb309)
Delta 57c74bc3..d9abb309 no domínio do QA: packages/metricas/src/acelerato/s12.ts (só prettier, sem mudança de lógica: a chamada de `taxa` numa linha) e web/src/features/coleta/origem.test.tsx (S12 passa à lista dos reais e sai a asserção do motivo, coerente com o mapa real do D9).
- web origem.test.tsx: 18 passaram. prettier --check nos dois arquivos: limpo.
- Sem achado novo. A1 segue (recomendado). Suíte inteira e `.pg`: check-run `bateria` do PR (I5), que o autor deve conferir no sha novo.
- Parecer: aprovado, sem bugs abertos.

## Revalidação (cobertura da web, f294aeb7)
Delta d9abb309..f294aeb7 no domínio do QA: só web/src/features/complementares/ramos.test.tsx (teste novo, sem mudança de produção). O head da branch chegou a e0056fc6 com um commit só de docs/reviews, fora do domínio.

| Correção | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Ramo excecaoSla nula com notas ausente (sustentacao.tsx:368), que derrubou a cobertura de branches da web | ramos.test.tsx: S12 com exceção de SLA nula e sem notas na resposta mostra a nota fixa de campo sem fonte | excecaoSla null, notas undefined (texto fixo de fallback) | passou |

- ramos.test.tsx local: 22 passaram.
- Mutação, desfeita (worktree limpa): o fallback da nota fixa trocado por lista vazia derrubou só o teste novo (1 falhou, 21 passaram).
- CI do head (e0056fc6, run 43425041119): testes success (cobertura global da web, o bloqueio que motivou a volta), banco, build, rapida, seguranca, openapi, imagem e filtro success; e2e-parte 1/2 e 2/2 ainda em andamento na hora do parecer, fora do delta (só teste de unidade mudou). O run anterior (43424080436) foi cancelado pela concorrência do push do review, não por falha.
- Sem achado novo. A1 segue (recomendado). Suíte inteira e .pg: check-run bateria do PR (I5).
- Parecer: aprovado, sem bugs abertos.

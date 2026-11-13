---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d9-s12-volume
commit: fac4c624516c28d2b9d12358e13bbf9b7dc0d889
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
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

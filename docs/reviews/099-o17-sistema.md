---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-o17-sistema
commit: f33af67669b998df129b423d2064de890c603189
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: O17 por sistema com dado real (E3.187; E3.20 e E3.186, K-275)

Diff lido: `git diff origin/develop...f33af676` (base 4bb55c33, 17 arquivos, +181 -61) e `git show --remerge-diff f33af676` (os 5 conflitos).

## Achados
- A3 (bloqueante) packages/contratos/src/schemas.ts:996 · mudança incompatível de `resultados/O17` sem o fluxo da politica-de-mudanca §5: CI `testes` vermelho em docs-contratos (O17.md desatualizada; aceite ausente em aceitas.json). Detalhe em Correção do A3.
- A1 (recomendado) packages/contratos/src/schemas.ts:993 · o comentário de `campoDisponivel` diz "nada é publicado", mas o O17 real sai com `campoDisponivel: false` e publica `porSistema` (o cartão usa `semFonteParcial`, como o S12). Ajustar o texto para "false = a parte que depende de extensão (causa raiz) não é publicada" no próximo toque do arquivo.
- A2 (recomendado) packages/metricas/src/acelerato/o17.ts:14 · 238 linhas de código e teste fora do `.md` (69 do `docs/api/openapi.json` gerado), acima da orientação de 150 (M14): o corpo do PR leva `teto: excedido, 238 linhas, contrato, cálculo, web e OpenAPI de um comportamento só (O17 por sistema)`.

## Correção do A3
O job `testes` do CI em f33af676 (run 43544959187) cai em `tools/docs-contratos/src/insumos.test.ts:130` ("docs/contratos/metricas/O17.md: desatualizada; rode `pnpm run docs:gerar`") e `:134` ("resultados/O17: mudança INCOMPATÍVEL ($.porCausa: variantes da união mudaram; $.motivoCausaRaiz: campo novo obrigatório) ... registre o aceite em docs/contratos/snapshots/aceitas.json, mudanca 2e4a005cf5fb961f07a0da5a6c523c2d7fb21fc0c067fa5ea6412204e97a9ae4"). Volta ao node-backend:
1. aprovação escrita do software-architect da mudança incompatível (modelo em `docs/architecture/features/048-t14-mock.md:127`; consumidor só o `web` do mesmo PR, sem `/api/v2`; prazo de convivência é do usuário, como lá);
2. a entrada em `docs/contratos/snapshots/aceitas.json`, `pnpm run docs:fotografar` e `pnpm run docs:gerar`;
3. o aceite do tech-lead entra na revalidação deste parecer.

## Conferência
- **Decisão B' do dono (12/11 09:12):** `O17` entra em `METRICAS_ORIGEM_REAL` e sai de `MOTIVO_ORIGEM_MOCK` e `COM_EXTENSAO_MOCK`; `calcularO17` sem extensão devolve `porSistema` pela `categoria_sistema` real, `porCausa: null` e `motivoCausaRaiz` com "a causa aparente não é a causa raiz"; a causa aparente não é lida em lugar nenhum. A web mostra `EstadoSemDadoReal` só na parte da causa raiz e mantém as barras por sistema. Nada além disso.
- **5 conflitos (remerge-diff):** `origem.ts` mantém `S12` e soma `O17`; `criterios.ts` mantém `VERSAO_CRITERIO_S12_VOLUME_REAL` e soma a do O17 nas duas listas; `cartoes.test.ts`, `origem.test.ts` e `qa-f6-painel.test.ts` ficam com o S12 só com o volume, os nomes `sem-dado` e `motivoDaOrigemSemDado` da develop (o `motivoDaOrigemMock` do lado do O17 foi trocado, inclusive no teste novo do O17). A develop está preservada.
- **COMP-12 em Real:** o K-290 (12/11 03:47) é anterior à decisão B' (09:12); vale a mais recente. O teste segue discriminando: `toContainText('Real')` diferencia maiúscula e não casa com "Sem dado real", e a soma Real + Sem dado real = 65 continua.
- **MOCK do e2e sem o O17:** coerente com `COM_EXTENSAO_MOCK`; o COMP-01 da sustentação confere a ausência do selo "Dados fictícios" no O17.
- **T2.6:** `criterio-2026-11-12-o17-por-sistema-dado-real` em `VERSOES_DA_BIBLIOTECA`, `afeta: ['O17']`, com teste de marcação só em período que cruza 2026-11-12 e em nenhum outro cartão.
- **T2.5:** o O17 é contagem, sem tempo, percentil nem Monte Carlo; usa `selecionarAC`, `baseAmostral`, `criterios` e `ordenarNeutro` da biblioteca.
- **BusinessMap e Acelerato:** só `selecionarAC`/`ContextoAC`; `regras.ts` segue `dominio: 'acelerato'`.
- **`packages/contratos` fora do brief do autor:** consequência legítima. A decisão exige mudar o DTO (`porCausa` anulável, `motivoCausaRaiz`), o mapa de origem e o status do catálogo, que moram no pacote de contratos (fonte única entre as camadas); o OpenAPI acompanha (check `openapi` verde).
- **Avaliação individual e dados de pessoa:** contagem por sistema, ordem neutra, sem pessoa.
- **Modo mock (só dev/e2e, ADR 0030):** com extensão, `porCausa` vem do mock sem selo, porque o status do catálogo é por cartão; é o mesmo padrão do S12 e não chega ao build `api`.

## Execução
- `E2E_PORTA=4291 E2E_PORTA_ALT=4292 pnpm exec playwright test tests/complementares.spec.ts --project=chromium --workers=1 -g COMP-12` em f33af676: `2 passed (13.9s)` (o COMP-12 do catálogo e o COMP-12 do S8 e S12, que casam o mesmo `-g`).
- `... -g "COMP-01 .*cadencia=sustentacao"`: `2 passed (29.6s)` (1280 e 375 px; selo fictício ausente no O17, axe AA).
- CI do head (run 43544959187, check-runs): `rapida`, `build`, `openapi`, `seguranca`, `banco`, `imagem` e `filtro` com sucesso; `e2e` e `perf` pulados no push; `testes` **falhou** só em `tools/docs-contratos` (2 de 102; A3). Os demais pacotes passaram no mesmo job: contratos 220, metricas 1316, mock 259, server 2144 (296 pulados), web 1619.

## Sondas

---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-o17-sistema
commit: 6de12a7bf77278db64321c25e153d790a7f5107a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: O17 por sistema com dado real (E3.187; E3.20 e E3.186, K-275)

Diff lido: `git diff origin/develop...f33af676` (base 4bb55c33, 17 arquivos, +181 -61) e `git show --remerge-diff f33af676` (os 5 conflitos).

## Achados
- A3 (bloqueante) packages/contratos/src/schemas.ts:996 · resolvido em 6de12a7b (ver Revalidação): mudança incompatível de `resultados/O17` com a aprovação do arquiteto, o aceite do tech-lead e o fluxo do §2 da politica-de-mudanca; CI `testes` verde.
- A1 (recomendado) packages/contratos/src/schemas.ts:993 · resolvido em 6de12a7b: o comentário de `campoDisponivel` diz "a parte que depende de extensão (causa raiz) não é publicada".
- A2 (recomendado) packages/metricas/src/acelerato/o17.ts:14 · segue para o PR: o corpo leva `teto: excedido, <n> linhas, ...` (recontar; eram 238 em f33af676) e `contrato: incompatível (B' da Q-099-7)`, §6 da politica-de-mudanca.

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

## Revalidação (volta 1, 6de12a7b)
Delta lido: `forge-check parecer delta docs/reviews/099-o17-sistema.md` (intervalo f33af676..6de12a7b, 7 arquivos no domínio) e `git diff 719de322 6de12a7b` (ec4b7c50 e 6de12a7b; +103 -58): `metricas-complementares.md`, `O17.md`, fotografia `resultados/O17.json`, `schemas.ts`, `notas.ts`, `ramos.test.tsx`, `sustentacao.tsx`.

- **Aprovação do arquiteto (§5):** a seção "Aprovação da mudança incompatível do contrato O17", no fim de `docs/architecture/features/metricas-complementares.md`, traz o contrato, o que muda (`porCausa` anulável, `motivoCausaRaiz` obrigatório), a conferência contra a decisão B' e as ADRs 0030 e 0020, os consumidores (só a `web` do mesmo PR e o mock de dev/e2e), o hash do gate, o prazo de convivência deixado ao usuário e "ADR: nenhuma muda". Segue o §5 (incompatível: arquiteto + tech-lead; convivência: usuário). A observação dela sobre o A1 ficou velha: o A1 já foi corrigido em 6de12a7b.
- **Aceite do tech-lead (A3, item 3):** aceito a mudança incompatível de `resultados/O17` (hash `2e4a005cf5fb961f07a0da5a6c523c2d7fb21fc0c067fa5ea6412204e97a9ae4`). Motivo: é a forma que a decisão B' do dono exige; sem o `null`, a ausência de causa raiz pareceria zero (ADR 0030); `motivoCausaRaiz` é texto fixo do sistema, sem dado de pessoa nem texto livre do chamado (ADR 0020); o único consumidor muda no mesmo PR. Sem `/api/v2` enquanto o usuário não disser que o prazo de convivência se aplica (pergunta do arquiteto, a levar pelo Jarvis).
- **Fluxo do §2:** `docs/contratos/snapshots/aceitas.json` está `{"aceitas": []}` em 6de12a7b (aceite de uso único: entrou e saiu antes do commit); fotografia `resultados/O17.json` e `O17.md` gerados (`anyOf` lista | null, `motivoCausaRaiz` no `required`, exemplo com `porCausa: null`); `pnpm run docs:check` local em 6de12a7b: `docs:check: ok (1382 páginas Markdown, 69 métricas, 2 eventos).` O §2 pede as duas aprovações antes do aceite; a do arquiteto veio antes (ec4b7c50) e a minha vem aqui, sobre o mesmo hash, sem efeito no resultado.
- **UX médio 1** (frase do Metabase e da lista provisória): o `Leia` só aparece com `porCausa !== null`, com o texto neutro sugerido; `cuidados` do O17 em `notas.ts` trocado. Teste: `ramos.test.tsx:304` (ramo com causa, frase nova presente) e `:329-330` (ramo nulo, sem "Metabase" e sem o `Leia`).
- **UX médio 2** (`comoSeCalcula`): texto novo, sem "lida pelo Metabase" nem "não publica número". Mutante: `notas.ts` de 719de322 com o resto em 6de12a7b derruba "O17 sem causa raiz mostra Sem dado real com o motivo e mantém o por sistema" (`1 failed | 27 passed`), porque a nota é renderizada no cartão.
- **UX médio 3** (subtítulos): `h4` "Por causa raiz" e "Por sistema", um nível abaixo do `h3` do cartão; teste `ramos.test.tsx:327-328`.
- **Guarda nova** `r.porCausa !== null && <Leia>`: os dois ramos têm teste de comportamento (presente em `:304`, ausente em `:330`).

## Execução (revalidação)
- `pnpm exec vitest run src/features/complementares --maxWorkers=2` (web) em 6de12a7b: `Test Files 11 passed (11)`, `Tests 318 passed (318)`.
- Mutante de `notas.ts` (acima): morto; arquivo restaurado de 6de12a7b.
- CI do head (run 43547372203, check-runs): `rapida`, `build`, `openapi`, `seguranca`, `banco`, `imagem`, `filtro` e `testes` com sucesso (no `testes`: `typecheck`, `cobertura`, `spec:check` e `docs:check`); `e2e`, `e2e-parte` e `perf` pulados no push.

## Sondas

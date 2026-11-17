---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feat/105-t3-habilitador
commit: 15ae9f406d1ca5941272bd6b8807b9af0f919cb1
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: T3 com o Habilitador (105, E7.496; review E7.515; revalidação E7.523)

## Revalidação (E7.523, head 15ae9f40)
**Veredito: aprovado.** Delta lido: `forge-check parecer delta`, intervalo `dbf457a1..15ae9f40`, 8 arquivos no domínio (changelog.d, `criterios.ts`, `criterios.habilitador.test.ts` novo, `graficos.test.tsx`, `tema.ts`, `CartaoT3.tsx`, `tatico.test.tsx`, `web/src/test/setup.ts`).
- A1 resolvido: `afeta` agora tem O6, O14, O19, O20, T1, T2, T4, T5, T10, T11 e T12, e não tem mais O13, O18 e O27. A linha 3 do changelog.d acompanha.
- A2 resolvido: `criterios.habilitador.test.ts` deriva a lista de `APLICABILIDADE_FLUXO` (chave `tipo`) mais as que segmentam por tipo, e afirma a ausência das que só leem bug. Mutante: retirar `'O20'` do `afeta` **morre** (1 falha em 3).
- A3 resolvido: `asyncUtilTimeout` de volta a 5000.
- A4 resolvido: unidade "% das entregas", série "Entregas". O caso "nenhuma fatia com 20" ganhou frase e teste.
- Alto de UX (`ORDEM_TIPOS` sem Habilitador) corrigido em `tema.ts`, com teste de marca única.
- Rodado na worktree em 15ae9f40: `criterios.habilitador.test.ts` 3/3; `graficos.test.tsx` e `tatico.test.tsx` 36/36. Suíte inteira: sem PR, vale o PQ do autor; não afirmo CI verde.

## Review anterior (dbf457a1, reprovado)

**Veredito: reprovado, por um bloqueante (A1).** O T3 faz o que a decisão E7.496 pede. O Enabler vira a categoria `habilitador` em todo o painel. O T3 passa ao dado real com as quatro fatias da opção 1, sem acordado, desvio nem selo, e a fatia abaixo de 20 mostra só a contagem. A migração 0041 e o `deploy/sql` estão certos. O defeito está na versão de critério T2.6: o `afeta` deixa de fora métricas que usam o tipo e marca outras que o tipo não alcança.

Escopo: diff `6fb535ed...dbf457a1`, 84 arquivos, 541 linhas de `.ts`/`.tsx` (código e teste). Passa da orientação M14 (150 linhas), mas é um comportamento só, a categoria nova e o T3 que a consome, e a decisão manda contrato e tela juntos. Vale como `teto: excedido` no corpo do PR.

## Conferência pedida no brief
- **Versão de critério T2.6** (`packages/metricas/src/core/criterios.ts:359-389`). Id, data e descrição estão certos, e a versão entrou em `VERSOES_DA_BIBLIOTECA`. A lista `afeta` está errada (A1). Para conferir, cruzei os filtros de cada métrica (`packages/contratos/src/metricas.ts:210-254`) com as chamadas `selecionar(...)` sem `semTipo` e com as leituras de `card.tipo` em `packages/metricas/src/businessmap/`:
  - **Faltam as que aceitam o filtro Tipo e o aplicam.** T1, T2, T4, T5, T10 e T12 chamam `selecionar(ctx, f, 'story')` sem `semTipo`, e o O6 e o O19 também. O T11 aplica `f.tipo` direto (`t11.ts:59`). Hoje o filtro "Trabalho de produto" inclui os 428 Enablers de 12 semanas (20% das entregas). Depois do `bm:ref-sync`, eles saem desse recorte em todas essas métricas.
  - **Falta o O14.** Ele segmenta por `TIPOS_CARD` (`o14.ts:31`) e ganha a linha Habilitador. A fotografia `O14.json` mudou, e isso confirma.
  - **Sobram O13, O18 e O27.** As três leem só `Bug interno` e `Defeito em produção` (`o13.ts:21`, `o18.ts:18`, `o27.ts:40`) e usam `semTipo`. O Enabler não muda nada nelas, e a marca no gráfico avisaria uma mudança que não houve.
  - Estão certas as 15 que aceitam o filtro (O1 a O5, O7 a O11, O21, O22, O24 a O26), mais T3, T13, BLOQUEADOS, EI_FL1 (segmenta por tipo, `ei.ts:111`) e TENDENCIA_FLUXO.
- **`asyncUtilTimeout` global** (`web/src/test/setup.ts:23`, de 5000 para 15000 ms). Não é defeito provado, e por isso não bloqueia. A mudança vale para toda a suíte web: cada `findBy`/`waitFor` que falha passa a esperar 15 s em vez de 5 s, e uma lentidão de verdade passa calada. O commit e o changelog não dizem qual teste precisou dela, e o padrão do projeto é o timeout local (`ramos.test.tsx:16` e `:308`, 8000 ms). Ver A3.
- **Escopo da conferência do Jarvis (fotografias de contrato em `docs/contratos`): o desvio é aceitável.** As 21 fotografias e os 21 contratos `.md` saem do `pnpm run docs:gerar`, gerados a partir do Zod. A mudança é a consequência mecânica de três alterações pedidas: o enum `TIPOS_CARD` ganhou `Habilitador` (E9, O14, O16 e as demais que expõem o tipo), o schema do T3 mudou e o código `T3_DESVIO` saiu (VISAO_GERAL). Sem elas, a checagem de contrato falha. Nenhuma tem conteúdo à mão fora das marcas `gerado`.
- **T3** (`t3.ts`). O mapa `FATIA_DO_TIPO` bate com a opção 1 da proposta. Chamado vem como `requisicao` e cai em Correção em produção, como na tabela da proposta. Bug interno sai por `ehDemanda` antes do mapa. O setor segue só como filtro, e o projeto acima deixou de decidir a fatia. O T3 entrou em `METRICAS_ORIGEM_REAL`.
- **Migração 0041.** Uma mudança só, com `down`, checksum registrado e `deploy/sql` gerado. Não reescreve linha: a referência é versionada por vigência e a reprojeção grava versão nova em `dim_card_versao`. A segurança aprovou (`docs/security/105-t3-habilitador.md`, com A1 recomendado sobre o roteiro de reversão). Cito o parecer e não o refaço.
- **Regras invioláveis.** Nada por pessoa e nenhuma comparação entre times. Só BusinessMap, só stories, e o mínimo de 20 vale por fatia. O cálculo fica na biblioteca compartilhada.

## Pareceres em paralelo
UX (`docs/ux/105-revisao-t3-habilitador.md`, aprovado com ressalvas). O alto de UX (`tema.ts:18`, `ORDEM_TIPOS` sem Habilitador: no O4 por tipo ele fica com a cor e o padrão de Incidente) é defeito real que este diff expõe. A decisão sobre ele é de UX, e a correção pode ir junto com o A1. Segurança: aprovado.

## Ferramentas e mutantes
- Na worktree, em `dbf457a1` (o mesmo código de `8a2ee23d`, que só acrescenta o parecer de segurança), rodei `vitest run src/businessmap/fixtures.cobertura.test.ts -t T3`: 10 testes passaram.
- M1: `const fatiaOk = ok && publicavel(dele.length)` trocado por `const fatiaOk = ok` (`t3.ts:58`). **Morre** (1 falha no teste "abaixo de 20").
- Suíte inteira: não há PR para a branch. Vale o PQ do autor (`pnpm run pronto`, rc=0, citado no parecer de UX). Este parecer não afirma CI verde.

## Achados
- A1 (bloqueante) packages/metricas/src/core/criterios.ts:364 · `afeta` incompleto: faltam T1, T2, T4, T5, T10, T11, T12, O6, O19 (filtro Tipo) e O14 (por TIPOS_CARD); sobram O13, O18, O27. E7.496 manda registrar onde o tipo é usado. Corrigir a lista e o changelog.d (linha 3).
- A2 (recomendado) packages/metricas/src/core/criterios.ts:359 · Nenhum teste fixa o `afeta` da versão nova, e por isso o A1 passou. Sugestão: um teste no padrão do `o23.test.ts:54-60` que derive a lista dos filtros (`'tipo'` em `APLICABILIDADE_FLUXO`, com `semTipo` à parte) ou que a fixe por igualdade.
- A3 (recomendado) web/src/test/setup.ts:23 · O `asyncUtilTimeout` global foi triplicado sem motivo registrado. Sugestão: voltar a 5000 e pôr `{ timeout }` local no teste que precisou, como em `ramos.test.tsx:16`. Se o motivo for a máquina do CI, registrá-lo no PR.
- A4 (recomendado) web/src/features/tatico/components/CartaoT3.tsx:63 · Mesmo achado do parecer de UX (baixo 3): a unidade "% da capacidade" e a série "Realizado" sobraram do modelo com acordado. Cito e não promovo.

## Sem teste
A1 e A2: a lista `afeta` não tem teste.

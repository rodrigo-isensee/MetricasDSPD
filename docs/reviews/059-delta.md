---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 501eef6d8f0e21809b68c33ac94bc465c25595be
parecer: reprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Code review: front da aba Apontamento (pedido 059, E2.31, K-193)

**Ponta revisada:** `501eef6` (o código é o de `4857ad8`; `501eef6` só soma o parecer de segurança do front).
**Diff:** `origin/develop...origin/feature/059-aba-front`. Leitura feita sobre o `web/` (35 arquivos, 4689 linhas de código e teste, igual ao recorte `origin/feature/059-rota-apontamento...origin/feature/059-aba-front`). Referências: `docs/ux/059-aba-apontamento.md` e o plano `docs/architecture/features/059-aba-apontamento.md` no ramo `origin/docs/059-apontamento-discovery`, e as decisões do dono de 2026-11-01 e 2026-11-02 copiadas no brief.
**Veredito: reprovado.** Dois bloqueantes (documentação técnica do front ausente e grade do mapa diário sem parada de Tab depois de filtrar) e cinco recomendações. O contrato, os estados, o seletor, Outra área, o filtro por tipo oculto, o armazenamento do navegador e as cláusulas o1 a o4 estão corretos.

## Alcance (o que este parecer não cobre)
O diff contra a `develop` traz também, por merge, a rota (`server/src/modulos/apontamento`), a coleta do worklog, as migrações e a trilha B (`packages/contratos`, `packages/metricas`): 12500 linhas de código e teste no total. Esse código não foi lido aqui. Nenhuma das três branches de origem tem parecer de code review no GitHub hoje (`docs/reviews/059-alfa.md` não está em `origin/feature/059-contrato-biblioteca`; a rota tem só devops e segurança; a coleta, nada). Pendência para o Jarvis: os reviews da trilha B, da rota e da coleta precisam existir antes de qualquer PR que leve esse código à `develop`; este parecer vale só para o que o front soma.

## Ferramentas (citadas, não refeitas)
- CI da branch, run 41407465762 sobre `4857ad84ae56bf21a9e81793aa83b1d46a462589`: `testes`, `rapida`, `build`, `openapi`, `filtro`, `imagem`, `seguranca` e `banco` com sucesso; `e2e` e `perf` pulados (não rodam em push de `feature/*`). O pronto verde e a cobertura de 100% do web são o relato do autor (registro de 2026-11-02 07:10).
- Os runs anteriores com falha (41406466524, 41399779218) são de pontas superadas.
- Segurança: `docs/security/059-delta.md`, aprovado, com o recomendado A1 (trava estrutural da exportação). Citado, não refeito.
- E2E da aba: nenhum teste em `e2e/` neste diff; fica com o QA (plano `docs/qa/059-plano-testes.md`), condição para o PR pela regra do usuário da seção 8 do `praticas.md`.

## Pontos pedidos
- **Contrato validado na resposta.** `api.ts` passa todo 200 por `respostaApontamentoSchema.safeParse` (o schema vem de `@metricas-dspd/contratos`, sem redeclaração em `types.ts`); forma errada vira `ErroApi('RESPOSTA_INVALIDA')` sem log do corpo; erro HTTP lê só `error.code`; tempo esgotado e rede viram códigos próprios; aborto da consulta se propaga. `no-store` no `fetch`. Coberto em `api.test.ts`.
- **Estados.** Carregando (anúncio `aria-live` e frescor "Carregando apontamentos"), erro com "Tentar de novo" pelo `CartaoMetrica`, vazio tratado uma vez na página (`EstadoVazio` com `kpis.apontamentos === 0`), atualizando esmaecido com `keepPreviousData`, selo de frescor e aviso de defasado. Correto.
- **Seletor do Operacional.** Quinta opção (`OPCOES_DO_SELETOR`), fora de `Visao`, de `resolverVisao`, da cadência e do hash; a escolha navega para `/operacional/apontamento` e a aba volta pelas quatro visões; pré-carga do chunk na intenção; rota `lazy`. Teste do seletor ajustado para as cinco opções.
- **Outra área.** Chave fixa `outra-area` do contrato, aceita na URL (variante parecida é descartada com aviso), sem nome, por último também na ordem por total (`ordem.ts`); na ordem alfabética vale a ordem do servidor, que já a põe por último em `opcoes.pessoas`. Coberto em `ligacao.test.tsx` e `unidades.test.ts`.
- **Filtro por tipo oculto.** Sonda única (`tipo=1`, `staleTime: Infinity`, sem nova tentativa); com 422 ou falha, o filtro some, `tipo` sai da consulta e o chip fica com o aviso "Tipo (filtro ainda indisponível)". Correto para hoje; ver A3 e A4 para quando a rota ligar o filtro.
- **Nada de pessoa no navegador.** Resposta só no cache em memória do React Query, sem persister; URL só com `pessoaRef`; "copiar link" leva a URL; título fixo; `localStorage` do app só guarda tema e ids de cartão ocultos. Fixture e `rota-falsa.ts` só entram por testes (esta importa `vitest`), fora do bundle.
- **Cláusulas o1 a o4.** o1: ordem do servidor por padrão, "total" só reordena local, empate estável. o2: utilização por pessoa sem cor, faixa nem média (o mapa diário usa faixas fixas de horas, M-6 do UX, não juízo de utilização). o3: todo percentual por pessoa e de equipe sai de `PctComPiso`, com `CelulaInsuficiente` ou `AmostraInsuficiente` abaixo do piso; a tela não calcula percentual. o4: página sem `PainelPagina` nem `BotaoExportar`, legenda diz que a aba fica fora da exportação, teste sem botão nem texto de exportação; a trava estrutural é o A1 da segurança.
- **Fronteiras.** O web não importa `metricas` nem `mock`; horas só formatadas (`formatar.ts`), sem cálculo de métrica.

## Achados
- A1 (bloqueante) docs/tecnica/arquitetura-front.md:1 · a aba nova não está na doc técnica do front: rota própria, fonte e consulta fora do FonteMetricas, quinta opção do seletor, filtros na URL e sonda do tipo. Falta de doc bloqueia pela seção 7 e 8 do praticas.md.
- A2 (bloqueante) web/src/features/apontamento/components/CartaoDiario.tsx:150 · a célula ativa não é limitada ao tamanho da grade: depois de filtrar pessoa ou encurtar a janela, nenhuma célula fica com tabIndex 0 e o mapa sai da ordem do Tab. Limitar ativa às linhas e dias atuais, com teste.
- A3 (recomendado) web/src/features/apontamento/filtros.ts:28 · tipo exige dígitos (type_id), mas opcoes.tipos[].id hoje é código de rótulo: quando a rota ligar o filtro (E2.28), o valor escolhido será descartado como inválido. Alinhar na mesma etapa, com teste de ponta a ponta do filtro.
- A4 (recomendado) web/src/features/apontamento/useApontamento.ts:33 · a sonda do tipo com staleTime infinito e sem nova tentativa deixa o filtro oculto a sessão toda depois de uma falha de rede, e com a rota aceitando faz uma consulta agregada inteira só para sondar. Preferir a capacidade na própria resposta (opcoes).
- A5 (recomendado) web/src/features/apontamento/filtros.ts:26 · formatos e tetos da URL repetem as regex e limites do contrato (pessoaRefSchema, idNumerico, lista): duas fontes que podem divergir. Validar com os schemas exportados por @metricas-dspd/contratos.
- A6 (recomendado) web/src/features/apontamento/components/CabecalhoApontamento.tsx:30 · o período dos dados sai em AAAA-MM-DD cru; o resto da aba usa fmtData. Formatar igual.
- A7 (recomendado) web/src/features/apontamento/components/BarraFiltrosApontamento.tsx:102 · o rótulo Pessoa não identificada está escrito à mão; usar a constante PESSOA_NAO_IDENTIFICADA de textos.ts, como dados.tsx já faz.

## Teto por PR (M14)
O que o front soma tem 4689 linhas de código e teste; a branch inteira contra a `develop`, 12500. O PR da aba para a `develop` passa do teto e precisa ou dividir ou trazer no corpo a linha `teto: excedido, <n> linhas, <motivo>`, a ser aceita no review do PR. Não é achado desta rodada porque o PR ainda não existe (ele só abre depois do QA e do merge do PR da exceção); fica como condição do PR.

## Parecer
**Reprovado.** O front cumpre o que a E2.22 pediu e o que a especificação e as decisões do dono exigem, e não fere regra inviolável: a exibição por pessoa está dentro da exceção A da aba (R4 da ADR 0020 na branch) com as cláusulas o1 a o4. Voltam ao `react-frontend` dois bloqueantes: A1 (requisito de documentação do `praticas.md`) e A2 (defeito de teclado provado pela leitura de `CartaoDiario.tsx:79` e `:150`: o estado `ativa` nasce em `[0, 0]`, só muda por foco ou seta e não é corrigido quando `linhas` ou `dias` encolhem; a tabela não tem `tabIndex`, então nada no mapa recebe o Tab). A3 a A7 são recomendações e não devolvem. A revalidação será por delta (`forge-check delta --parecer docs/reviews/059-delta.md`).

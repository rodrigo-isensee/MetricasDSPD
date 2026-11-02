---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-aba-front
commit: 7efbd57afffd582b69a9422f6e50e303cb15c844
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Code review: front da aba Apontamento, revalidação por delta (pedido 059, E2.31, K-193)

**Ponta revisada:** `7efbd57` (o código é o de `2f25c22`; `3eb64a1` e `7efbd57` só somam o parecer de segurança renovado e as duas revisões de UX).
**Veredito: aprovado.** Os bloqueantes A1 e A2 da rodada anterior estão resolvidos, com teste; os recomendados A4 a A7 foram aplicados (o A4 em parte, ver abaixo); o A3 segue aberto por decisão, para a etapa da rota que liga o filtro por tipo (DECISÃO TÉCNICA de 08:55). Nenhum achado novo bloqueante.

## Delta lido
Saída de `forge-check delta --parecer docs/reviews/059-delta.md`: intervalo `501eef6..7efbd57` (o commit do parecer anterior, `1745740`, só somou o próprio parecer). Lidos todos os trechos listados no `web/` (31 arquivos, 800 linhas somadas e 89 removidas de código e teste) e em `docs/tecnica/arquitetura-front.md` (seção 14 nova e o diagrama). As duas revisões de UX e o parecer de segurança renovado entram só como citação.
**Já lido (fora do delta, não relido):** o resto da aba em `web/src/features/apontamento/` como estava em `4857ad8` (contrato validado, estados, seletor, Outra área, nada de pessoa no navegador, cláusulas o1 a o4, fronteiras), conforme a rodada anterior.

## Conferência dos achados anteriores
- **A1 (bloqueante): resolvido.** `docs/tecnica/arquitetura-front.md` ganhou a seção 14 (rota própria e chunk, fonte `FonteApontamento` fora do `FonteMetricas`, quinta opção do seletor, filtros na URL validados pelo schema do contrato, sonda do tipo, trava da exportação, fronteiras, quem é Outra área) e a aba no diagrama de `features/`. Bate com o código lido.
- **A2 (bloqueante): resolvido.** `CartaoDiario.tsx:96` limita a célula ativa às linhas e dias atuais (`Math.min` com o tamanho da grade), então sempre há uma célula com `tabIndex 0`. Testes em `mapa-diario.test.tsx:55` (depois de filtrar pessoa) e `:72` (depois de encurtar a janela) provam a parada do Tab. O foco agora também rola a célula para fora das colunas fixas (`rolagem.ts`, função pura testada).
- **A3 (recomendado): aberto, fora desta rodada.** `filtros.ts` continua exigindo dígitos em `tipo`, agora pelo `consultaApontamentoSchema`; o alinhamento com `opcoes.tipos[].id` fica na E2.28, com teste de ponta a ponta do filtro.
- **A4 (recomendado): aplicado em parte.** `api.ts:104` só devolve "indisponível" no 422 e lança erro em rede ou 5xx; `useApontamento.ts:37` troca `staleTime: Infinity` e `retry: false` por validade de 5 min, duas novas tentativas e nova sonda no foco da janela. Resolve o filtro oculto a sessão toda. Fica em aberto a segunda metade (capacidade na própria resposta, sem a consulta agregada só para sondar), que depende da rota e entra junto com o A3.
- **A5 (recomendado): aplicado.** `filtros.ts:28` valida formato, teto e janela com `consultaApontamentoSchema`, sem regex nem limite repetidos; `unidades.test.ts:49` afirma que todo resultado lido passa no schema do contrato.
- **A6 (recomendado): aplicado.** `CabecalhoApontamento.tsx:32` usa `fmtData` no período.
- **A7 (recomendado): aplicado.** `BarraFiltrosApontamento.tsx:110` usa `PESSOA_NAO_IDENTIFICADA`.

## Resto do delta
- **Revisão de UX (A-1 a A-13) e segurança A1.** Mudanças lidas: Outra área fora do mapa e da capacidade por pessoa (`soPessoas`), nota de Outra área, dia não útil com motivo e borda tracejada, chip da ordem que "Limpar filtros" remove, data de vigência do critério, coluna Pessoa fixa. Seguem a DECISÃO TÉCNICA de 08:05 sobre Outra área. A trava da exportação (`exportacao-fora.test.ts`) afirma um mínimo de arquivos varridos antes de afirmar a ausência de import (item 11 do checklist), e cobre import estático, dinâmico, reexportação e relativo.
- **Componente compartilhado.** `TabelaDados.tsx:43` só fixa a primeira coluna do cabeçalho (as linhas já eram `th scope="row"`); a revisão de UX r2 confirma que as outras telas não quebram.
- Nenhuma regra inviolável tocada: a exibição por pessoa segue dentro da exceção A da aba (R4 da ADR 0020 na branch); a tela não calcula métrica nem percentual.

## Ferramentas (citadas, não refeitas)
- CI run 41416302759 sobre `3eb64a1` (mesmo código de `2f25c22`): `build`, `rapida`, `openapi`, `filtro`, `imagem`, `seguranca` e `banco` com sucesso; `testes` falhou em `web/src/features/percepcao/percepcao.test.tsx` ("painel Sustentação com a PV1", elemento `metrica-PV1` não achado no tempo), arquivo fora do diff, com 1395 testes verdes no web. Leitura: espera esgotada sob carga, não defeito da aba. Run 41417967294 sobre `7efbd57`, a ponta revisada: sucesso em todos os jobs, `testes` inclusive (`e2e` e `perf` pulados em push de `feature/*`).
- Pronto verde e cobertura do web 100% são o relato do autor (registro de 11:00).
- Segurança: `docs/security/059-delta.md`, renovado em `3eb64a1`. UX: `docs/ux/059-revisao-delta-r2.md`, aprovada. Citados, não refeitos.

## Teto por PR (M14)
O delta tem 889 linhas de código e teste; a branch inteira contra a `develop`, cerca de 13 mil. Pela decisão do dono de 2026-11-02 (teto por PR da aba), o PR do front para a `develop` leva no corpo a linha `teto: excedido, <n> linhas, <motivo>`; a conferência fica no review do PR.

## Achados
- A3 (recomendado) web/src/features/apontamento/filtros.ts:28 · tipo exige dígitos (type_id), mas opcoes.tipos[].id é código de rótulo; alinhar na E2.28, com teste de ponta a ponta do filtro. Mantido da rodada anterior.
- A8 (recomendado) web/src/features/apontamento/useApontamento.ts:37 · segunda metade do A4: com a rota aceitando o filtro, a sonda ainda faz uma consulta agregada inteira; levar a capacidade para opcoes na resposta, junto com o A3.

## Parecer
**Aprovado.** A1 e A2 resolvidos e testados; A4 a A7 aplicados. A3 e A8 são recomendações para a etapa da rota que liga o filtro por tipo e não devolvem. Condições do PR para a `develop` (não desta rodada): linha de teto no corpo, merge do PR da exceção antes, e os reviews da trilha B, da rota e da coleta, como dito na rodada anterior.

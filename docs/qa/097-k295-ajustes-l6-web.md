---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k295-l6-web
commit: d1ea2991d49e9fb5d39140a8f1aba1ea9e88d971
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-14
---

# QA: K-295, ajustes depois do L6 web (097, E4.41)

Base develop e5092e05. Diff `e5092e05..e5efc31c` (12 arquivos; código em `web/src/features/{filtros,complementares}`, `web/src/data/mock/nucleoMock.ts`, `packages/contratos/src/filtros.ts`; testes e e2e). Obrigação: A1 a A4 do review do L6 web (`docs/reviews/097-l6-tipos-reais-web.md`) e A1 e A2 da revisão de UX do L6 (`docs/ux/097-revisao-l6.md`), todos sob a decisão E4 do dono (opções de filtro vêm do dado real). O head do parecer é o de código (`e5efc31c`); `5375aca1` só soma o review.

## Veredito

Aprovado. Cobertura da web 100% em todas as métricas, axe sem violação nas mensagens novas nos dois temas, 12 de 13 mutantes mortos (1 sobrevivente, recomendado, não bloqueia). Nenhum bug.

## Critério, teste, resultado

| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 review: abas do T11 pelo id, rótulo do contrato | `taticas.test.tsx` "só aparecem as abas dos tipos que as opções trazem" (nomes da API diferentes; ordem; clique consulta com `Dívida técnica`; Melhoria ausente) | nome da API diferente do rótulo | passa |
| A1 review: id desconhecido não vira aba | `taticas.test.tsx` "id que o contrato não conhece não vira aba" | id fora do contrato | passa |
| A4 review (e A1 do QA do L6): aba ausente nas opções some | mesmo teste do primeiro item (`queryByRole 'Melhoria'` nulo; antes o teste passava na base) | opções parciais | passa |
| A2 review: um só mapa id para rótulo | `TIPO_POR_ID` em `packages/contratos`; `codec.test.ts`, `taticas.test.tsx`, `filtros-componentes.test.tsx` o exercem (M1 derruba 20 testes) | mapa único | passa |
| A3 review: mock sem Incidente | `filtros-componentes.test.tsx` "o mock não oferece Incidente" (M12 mata) | tipo que a API não devolve | passa |
| A1 UX: lista sem opções diz o porquê (Tipo, Sistema, Prioridade), sem campo de busca | `filtros-componentes.test.tsx` "Tipo e Sistema sem opções...", "Prioridade sem opções..." (texto, gênero, `tipo-busca` ausente) | lista vazia | passa |
| A1 UX: carregando não afirma vazio | "enquanto as opções não chegam, diz que está carregando" | opções que nunca chegam | passa |
| A1 UX: com opções, nada muda | "com opções, a lista aparece com a busca e sem a mensagem" | caminho feliz | passa |
| A3 UX (opção estranha na lista não vira caixa sem efeito) | "opção com id que o contrato não conhece não aparece na lista" (M2 mata) | id fora do contrato | passa |
| A2 UX: aba única do T11 explica | `taticas.test.tsx` "sem tipos no dado, a aba única vem com a explicação" e "enquanto as opções não chegam, não afirma" (M9 mata) | vazio e carregando | passa |
| Ordem dos cliques na URL (mudança de `tiposDe`) | `useFiltros.test.tsx` (`tipo=melhoria`); e2e FIL-22 e IF-I13 já rodados no review | n/a | passa |
| Acessibilidade das mensagens novas | axe (abaixo) | n/a | passa |

## Execução

- **Cobertura completa da web** (`TZ=UTC npx vitest run --coverage --maxWorkers=2`, head do código, 7 min 22 s): `Test Files 104 passed (104)`, `Tests 1608 passed (1608)`; `Statements 100% (5668/5668)`, `Branches 100% (5325/5325)`, `Functions 100% (2077/2077)`, `Lines 100% (4854/4854)`.
- **Axe** (`@axe-core/playwright`, tags WCAG 2.2 AA, chromium, build mock da worktree na porta 4391, spec temporário apagado depois; bloqueantes `[]` e informativas `[]` em todas):
  - Tipo e Sistema sem opções ("Nenhum tipo disponível neste recorte.", "Nenhum sistema disponível neste recorte."), semanal, claro e escuro.
  - Prioridade sem opções (Sustentação), claro e escuro.
  - Tipo carregando ("Carregando tipos..."), claro e escuro.
  - T11 com a aba única e "Sem outros tipos no dado deste recorte." (axe no cartão), claro e escuro.
  - O mock sempre devolve opções; o spec trocou as respostas do Worker (`opcoesFiltro` vazio ou sem resposta; T11 com dado de 24 meses). Isso prova a tela e o contraste, não a API real. Resultado final: 4 passaram (52,9 s) e 2 do T11 (11,9 s). Antes, falhas do meu próprio spec (Tipo não existe no Resumo; T11 está na seção recolhida de `/tatico` e o mock devolve base 0 nele), corrigidas no spec sem mudar o produto.
- **Mutação à mão** (um por vez, restaurando pelo conteúdo de `git show HEAD:<arquivo>`; `vitest run src/features/filtros src/features/complementares/taticas.test.tsx`, 176 testes; árvore limpa no fim):

| Mutante | Resultado |
|---|---|
| M1 `TIPO_POR_ID` com chave e valor trocados | morto (20 falham) |
| M2 barra sem o filtro pelos ids do contrato | morto ("opção com id que o contrato não conhece não aparece na lista") |
| M3 `carregando` invertido em `semOpcoes` | morto (3) |
| M4 sem gênero feminino ("Nenhum" para prioridade) | morto |
| M5 `FiltroMulti` com `opcoes.length > 0` | morto (11) |
| M6 `FiltroMulti` sem `role="status"` na mensagem | **sobreviveu** (A1) |
| M7 Prioridade sem `vazio` | morto |
| M8 T11 usa `t.nome` em vez de `TIPO_POR_ID` | morto (2) |
| M9 T11 explica também enquanto carrega | morto |
| M10 valor da aba = rótulo, não id | morto (2) |
| M11 "Todos os tipos" não limpa o tipo | morto |
| M12 mock volta a oferecer Incidente | morto |

- **Vermelho antes do verde:** `forge-testes --vermelho` não se aplica a este projeto; a prova de que os testes novos falham sem a regra são M1 a M12, com a falha observada por mutante. Os 6 specs e2e do review não foram repetidos (brief).
- **Suíte completa e e2e inteiro:** valem pelo check-run `bateria` do CI do PR no mesmo sha, não pelo local.

## Revalidação (E4.61, junção com a develop, head d1ea2991)

Delta: merge de `9e3a52a4` (K-287, equipes da Sustentação só por slug) em `fix/k295-l6-web`. `git show --remerge-diff d1ea2991`: um único conflito, nos imports de `web/src/features/filtros/codec.ts`; a resolução manteve `TIPO_POR_ID` (K-295) e descartou `idEquipeSustentacao` (que o K-287 removeu). Sem referência restante a `idEquipeSustentacao` em `web/src`. Filtros por tipo e equipes só por slug (`useFiltros.test.tsx`, `equipe=sssc-fluig`) convivem: `pnpm exec vitest run src/features/filtros --maxWorkers=2` em `web/`: 11 arquivos, 141 testes passados. E2E dos filtros não repetido (vale o check-run `bateria` do PR no mesmo sha). A1 e A2 seguem recomendados. Parecer: aprovado.

## Achados

- A1 (recomendado) web/src/features/filtros/FiltroMulti.tsx:155 · M6: nenhum teste lê o role="status" da mensagem de lista vazia; remover o papel passa a suíte. Cobrir com getByRole('status') no `*-vazio`, ou aceitar que o papel é só reforço.
- A2 (recomendado) web/src/features/filtros/BarraFiltros.tsx:26 · confirmo o A1 do review: com erro na consulta de opções a lista diz "Carregando..." para sempre, e nenhum teste cobre o erro (só carregando e vazio). Fica com o autor ou vira cartão.

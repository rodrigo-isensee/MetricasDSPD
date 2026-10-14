---
tipo: review
contrato: 1
pedido: bugs-intensivos
branch: fix/bugs-intensivos
commit: 6c7f5b7
parecer: aprovado
revisor: tech-lead
data: 2026-10-14
---

# Code review: lote de bugs dos testes intensivos (IF-001 a IF-007, IS-001 a IS-007)

Escopo da primeira rodada: `git diff 376d997..d3babc2`, ou seja, o merge de `test/qa-intensivo-main` (1f08626 e 79edf17, lidos por amostragem) e as correções 935e51a a 838f774. Para cada bug, conferi a linha "Correção:" do arquivo em `docs/qa/bugs/` contra o commit correspondente. Segunda rodada (re-review): `git diff 9d6d681..03665ff`, com os commits 6846a93 (documentação) e 03665ff (recomendações).

Terceira rodada (HEAD atual, 0c7d348): `git diff 03665ff..0c7d348` tocou só `web/src/features/exportar/modelo.ts` e `packages/mock/src/desempenho.test.ts`, e a mudança é apenas formatação Prettier (quebra de linha, sem alteração de código). Commit 0c7d348 é só formatação (IS-008), para o `format:check` voltar a passar. Os commits de documentação do QA (ae23d22 e 77fd131) estão fora de `web`, `packages`, `server` e `e2e`, e não alteram o código revisado.

Quarta rodada (HEAD atual, 4e47bcf): `git diff b76b789..HEAD -- web`, ajustes da revisão de UX (`docs/ux/revisao-bugs-intensivos.md`, movida para a branch em b74d78f). Em `AvisoFiltrosInvalidos.tsx`, o aviso separa o período personalizado inválido (texto próprio) dos filtros inexistentes. Em `FiltroMulti.tsx`, o botão e o `aria-label` passam a usar `exibidos` (as caixas marcadas) em vez de `selecionados`, de modo que a marcação acompanha o clique antes de a URL chegar, o que é coerente com o mecanismo documentado no item 1. Há teste novo para cada um dos dois, e dois testes antigos foram ajustados com comentário. Sem regra de negócio, dado de pessoa nem cálculo envolvidos. Recomendação, que não bloqueia: o literal `'período personalizado'` agora aparece em `codec.ts:81`, `useFiltros.ts:218` e `AvisoFiltrosInvalidos.tsx:3`; vale exportá-lo de uma constante no `codec.ts` num próximo toque. Verificação local: typecheck do `web` e eslint de `features/filtros`, verdes (com `nice` e `flock`). Não rodei os testes; o autor informa web 834/834 com cobertura de 100% e E2E de filtros verdes (2 instáveis só sob carga).

Verificação local da primeira rodada (com `nice -n 19` e sob `flock /tmp/metricas-pesado.lock`): typecheck de `packages/metricas`, `packages/contratos`, `packages/mock`, `server` e `web`, todos verdes. Lint do `server` e eslint dos arquivos alterados do `web`, verdes. Testes unitários: `metricas` 522/522, `contratos` 45/45, `mock` 157/157, os dois testes sistêmicos do `server` 111/111, e no `web` os arquivos de filtros, catálogo, exportação, formatar e navegação, 113/113. Não rodei o E2E; o autor informa 312/312.

Verificação da segunda rodada (mesmas precauções): typecheck do `web` e eslint dos arquivos alterados, verdes. Não rodei os testes; o autor informa web 832/832 com cobertura de 100% e os E2E de filtros verdes, com 5 que só passaram na repetição por timeout sob carga (a mesma espera de CPU do IS-001, sem falha de asserção).

## Veredito
**Aprovado.** O item que bloqueava (documentação do mecanismo de URL do front) foi atendido em 6846a93, e as recomendações de código foram atendidas em 03665ff. O commit 0c7d348 é só formatação e o 4e47bcf (ajustes de UX) está conforme, sem alterar o parecer. Os itens restantes são recomendações que seguem fora deste lote, como cartões próprios (ver "Pendências fora do lote").

## Pontos de atenção do pedido
- **IS-001 (timeout de 15 s para 90 s em 4000300 e 8dc19d6): aceito.** A justificativa foi medida e está registrada em `web/vite.config.ts:50-56`: 830 testes, 20 deles acima de 5 s, o pior com 11 s, e 45 s ainda estourou com load 10. Todas as falhas da evidência foram por espera de CPU, nenhuma por asserção. O timeout de teste unitário não é o guarda de desempenho do projeto: esse papel é do orçamento do ADR 0003 (E2E perf e `desempenho.test.ts`), que continua intacto. A causa (testes que montam um painel inteiro) segue de fora, e vira cartão próprio.
- **IF-003 (`packages/metricas/src/businessmap/ei.ts:67`): conforme.** A correção só passa `semEquipe` no nível FL3, o mesmo mecanismo de `selecionar` que o E1, o E5, o T9 e o E3 já usam. Não há cálculo próprio: tempo, percentil e base continuam na `core`. O contrato `docs/contratos/metricas/EI_FL3.md:26-27` já declarava "Não atuam: equipe", e o código passou a seguir o contrato. O teste novo (`businessmap.test.ts:416`) confirma que o resultado com e sem equipe é idêntico.
- **IF-004 (O6): conforme e rastreado.** Segue a decisão do usuário registrada em e727fbc. `APLICABILIDADE_FLUXO.O6` (`packages/contratos/src/metricas.ts:183`) passou a incluir `tipo`, e `o6.ts:22` já chamava `selecionar` sem `semTipo`: a declaração estava errada, não o cálculo. O documento gerado (`docs/contratos/metricas/O6.md`) foi regenerado e o teste de `businessmap.test.ts:428` cobre o caso.
- **IS-002 (desempenho): continua pegando regressão.** Os tetos e o fator de calibração limitado a [1, 2] não mudaram. No mock, o teste recalibra a cada rodada e escolhe a rodada de menor razão entre a pior medida e o limite. Uma regressão real infla as três rodadas, e a melhor delas continua acima do teto. Há uma ressalva menor no server (item 5).
- **Specs do QA ajustados (6576625): conferem com a develop.** O catálogo tem 49 itens e o menu, 7 destinos. A página `/espera-invisivel` agora só redireciona e está coberta por `espera-invisivel-nos-paineis.spec.ts`.
- **Regras invioláveis:** nenhuma violação. O lote ganhou cobertura própria das regras: SIS-ISO (BusinessMap e Acelerato isolados, com a troca da base da outra fonte), a regra dos 20 itens (`api.sistemico-intensivo.test.ts:143`, INV-F4 e INV-F5), SIS-GRAN (story, frente e projeto), ausência de dado de pessoa nas 51 rotas e INV-F7 (consolidado de equipes, sem comparação entre elas). Nenhuma visão individual foi introduzida.

## Ajustes: situação após o re-review
1. **Atendido (6846a93).** `docs/tecnica/arquitetura-front.md` ganhou o parágrafo "Busca pendente e URL canônica": motivo (transição do React Router 7 sob carga, IF-001 e IS-003), regra (toda escrita de URL usa `buscaVigente` e `registrarBusca`), descarte da pendência (URL alcançada, rota mudou ou `VALIDADE_MS`), URL canônica com opções carregadas (IF-006) e a marcação exibida do `FiltroMulti`. O texto confere com o código.
2. **Atendido (03665ff).** `VALIDADE_MS` exportada de `buscaPendente.ts` e usada em `FiltroMulti.tsx`, sem a duplicação do literal.
3. **Pendente, cartão próprio.** Dividir os testes lentos que montam um painel inteiro e voltar o teto do `web/vite.config.ts` para perto de 4x o pior caso.
4. **Pendente, do QA.** A linha "Correção:" do IS-001 será corrigida pelo QA, dono de `docs/qa/`.
5. **Pendente, cartão próprio.** Mínimos de `pFrio` e `pQuente` do `server/tests/api-perf.sistemico-intensivo.test.ts` (linhas 63-64) tirados da mesma rodada.
6. **Pendente, cartão próprio.** `e2e/tests/intensivo-sistemico.spec.ts:137` com a rota e o hash do cartão de origem.
7. **Atendido (03665ff).** `useParametroLocal.ts` e `NavegacaoGlobal.tsx` passaram a usar `textoBusca`.
8. **Atendido (03665ff).** `exportar/modelo.ts` usa o tipo `ResultadoE3` do contrato em lugar do tipo estrutural escrito à mão. Ainda é uma asserção de tipo, mas ancorada no contrato compartilhado e sem o `?.` que escondia a ausência da ficha: aceito. A formatação de 0c7d348 não mexe nessa asserção.
9. **Atendido (03665ff).** `catalogo/linhas.ts` lança `Catálogo inconsistente` quando falta cartão, com teste novo em `linhas.test.ts` (catálogo vazio simulado).
10. **Atendido (03665ff).** Comentário do `FiltroMulti` movido para a linha de baixo.

## Pendências fora do lote
Itens 3, 5 e 6 viram cartões próprios no quadro (decisão do pedido de re-review), e o item 4 é do QA. Nenhum deles bloqueia a entrega e nenhum afeta regra de negócio.

## Checklist
1. Escopo: cada bug tem um commit rastreado e nada fora do lote entrou. A correção de cobertura em 6b30aae e o acompanhamento em c485929 pertencem ao IS-005. Os dois commits da segunda rodada só tocam documentação e as recomendações do parecer. O commit 0c7d348 só formata dois arquivos (IS-008).
2. ADRs e regras invioláveis: respeitados (ver os pontos de atenção).
3. Cálculo na `core`: sim. A IF-003 usa a opção já existente de `selecionar`.
4. Legibilidade: boa; duplicações removidas.
5. Tipos: sem o cast do catálogo; o do E3 ancorado no contrato.
6. Segurança e dados pessoais: sem segredos e sem campos de pessoa. O teste SIS-INV cobre as 51 rotas.
7. Performance: tetos do ADR 0003 mantidos (itens 3 e 5 como cartões).
8. Testes: cada bug tem teste (`useFiltros.test.tsx`, `filtros-componentes.test.tsx`, `buscaPendente.test.ts`, `formatar.test.ts`, `modelo.test.ts`, `catalogo.test.tsx`, `navegacao.test.tsx`, `businessmap.test.ts`, C5 em `perf.spec.ts`), mais `linhas.test.ts` na segunda rodada. `setup.ts` limpa a busca pendente entre os testes.
9. Acessibilidade: sem mudança de semântica. O `FiltroMulti` mantém as caixas nativas.
10. Documentação: contrato da O6 regenerado, bugs com "Correção:" (o IS-001 será ajustado pelo QA) e a seção de URL do front documentada.
11. Commits: Conventional Commits em português, um por mudança coerente e com as linhas de atribuição. 0c7d348 segue o padrão.

## Atualização para 6c7f5b7 (merge da develop)

O merge `6c7f5b7` trouxe da `develop` somente documentação (#66 e #67: pedido 010, especificações de UX e KANBAN). Nenhum arquivo de código mudou desde 4e47bcf (`git diff d2152e5 6c7f5b7 --stat` lista só `docs/` e `KANBAN.md`). Parecer mantido: aprovado (revisão registrada pelo tech-lead).

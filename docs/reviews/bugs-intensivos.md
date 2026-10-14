---
tipo: review
contrato: 1
pedido: bugs-intensivos
branch: fix/bugs-intensivos
commit: d3babc2571aec8db86846798831cc4ab590fc175
parecer: reprovado
revisor: tech-lead
data: 2026-10-14
---

# Code review: lote de bugs dos testes intensivos (IF-001 a IF-007, IS-001 a IS-007)

Escopo: `git diff 376d997..d3babc2`, ou seja, o merge de `test/qa-intensivo-main` (1f08626 e 79edf17, lidos por amostragem) e as correções 935e51a a 838f774. Para cada bug, conferi a linha "Correção:" do arquivo em `docs/qa/bugs/` contra o commit correspondente.

Verificação local (com `nice -n 19` e sob `flock /tmp/metricas-pesado.lock`): typecheck de `packages/metricas`, `packages/contratos`, `packages/mock`, `server` e `web`, todos verdes. Lint do `server` e eslint dos arquivos alterados do `web`, verdes. Testes unitários: `metricas` 522/522, `contratos` 45/45, `mock` 157/157, os dois testes sistêmicos do `server` 111/111, e no `web` os arquivos de filtros, catálogo, exportação, formatar e navegação, 113/113. Não rodei o E2E; o autor informa 312/312.

## Veredito
**Reprovado**, por um único item que bloqueia: falta documentação do mecanismo novo de URL do front (seção 8, item 10, das práticas: falta de documentação bloqueia). Fora isso o lote está correto, e os demais itens são recomendações. Quando o item 1 for corrigido, o parecer passa a aprovado sem precisar de nova rodada de código.

## Pontos de atenção do pedido
- **IS-001 (timeout de 15 s para 90 s em 4000300 e 8dc19d6): aceito.** A justificativa foi medida e está registrada em `web/vite.config.ts:50-56`: 830 testes, 20 deles acima de 5 s, o pior com 11 s, e 45 s ainda estourou com load 10. Todas as falhas da evidência foram por espera de CPU, nenhuma por asserção. O timeout de teste unitário não é o guarda de desempenho do projeto: esse papel é do orçamento do ADR 0003 (E2E perf e `desempenho.test.ts`), que continua intacto. O que fica de fora é a causa: os testes que montam um painel inteiro seguem lentos. Ver o item 3.
- **IF-003 (`packages/metricas/src/businessmap/ei.ts:67`): conforme.** A correção só passa `semEquipe` no nível FL3, o mesmo mecanismo de `selecionar` que o E1, o E5, o T9 e o E3 já usam. Não há cálculo próprio: tempo, percentil e base continuam na `core`. O contrato `docs/contratos/metricas/EI_FL3.md:26-27` já declarava "Não atuam: equipe", e o código passou a seguir o contrato. O teste novo (`businessmap.test.ts:416`) confirma que o resultado com e sem equipe é idêntico.
- **IF-004 (O6): conforme e rastreado.** Segue a decisão do usuário registrada em e727fbc. `APLICABILIDADE_FLUXO.O6` (`packages/contratos/src/metricas.ts:183`) passou a incluir `tipo`, e `o6.ts:22` já chamava `selecionar` sem `semTipo`: a declaração estava errada, não o cálculo. O documento gerado (`docs/contratos/metricas/O6.md`) foi regenerado e o teste de `businessmap.test.ts:428` cobre o caso.
- **IS-002 (desempenho): continua pegando regressão.** Os tetos e o fator de calibração limitado a [1, 2] não mudaram. No mock, o teste recalibra a cada rodada e escolhe a rodada de menor razão entre a pior medida e o limite. Uma regressão real infla as três rodadas, e a melhor delas continua acima do teto. Há uma ressalva menor no server, no item 5.
- **Specs do QA ajustados (6576625): conferem com a develop.** O catálogo tem 49 itens e o menu, 7 destinos. A página `/espera-invisivel` agora só redireciona e está coberta por `espera-invisivel-nos-paineis.spec.ts`. Ver o item 6.
- **Regras invioláveis:** nenhuma violação. O lote ganhou cobertura própria das regras: SIS-ISO (BusinessMap e Acelerato isolados, com a troca da base da outra fonte), a regra dos 20 itens (`api.sistemico-intensivo.test.ts:143`, INV-F4 e INV-F5), SIS-GRAN (story, frente e projeto), ausência de dado de pessoa nas 51 rotas e INV-F7 (consolidado de equipes, sem comparação entre elas). Nenhuma visão individual foi introduzida.

## Ajustes
1. `docs/tecnica/arquitetura-front.md:133` · O texto diz que "a URL é a fonte da verdade", mas a branch acrescentou uma camada de navegação pendente (`web/src/features/filtros/buscaPendente.ts`): todas as escritas de URL (`useFiltros`, `useParametroLocal`) partem dela, com validade de 3 s. A branch também introduziu a URL canônica com as opções carregadas (IF-006) e a marcação exibida do `FiltroMulti`, que segue a última emissão do usuário. Nada disso está documentado. · Sugestão: um parágrafo nessa seção com o motivo (transição do React Router 7 sob carga, IF-001 e IS-003), a regra (toda escrita de URL usa `buscaVigente` e `registrarBusca`), quando a pendência é descartada e a canonicalização. · **bloqueia** (práticas, seção 8, item 10).
2. `web/src/features/filtros/FiltroMulti.tsx:113` · A validade de 3000 ms está escrita como literal, duplicando `VALIDADE_MS` de `buscaPendente.ts:9`. As duas janelas precisam andar juntas. · Sugestão: exportar a constante e usá-la nos dois lugares. · recomendado.
3. `web/vite.config.ts:57-58` · Com 90 s, um teste que trave ou entre em laço demora 90 s para falhar, e a lentidão estrutural (20 testes acima de 5 s) fica sem dono. · Sugestão: abrir um cartão no quadro para dividir os testes que montam um painel inteiro, ou montar só o cartão (sugestão do próprio IS-001), e voltar o teto para perto de 4x o pior caso quando isso estiver feito. · recomendado.
4. `docs/qa/bugs/IS-001-pronto-falha-por-timeout-nos-testes-do-web-sob-carga.md:33` · A linha "Correção:" atribui ao 4000300 a mudança de "15 s para 90 s", mas o 4000300 subiu para 45 s; quem levou a 90 s foi o 8dc19d6. · Sugestão: "Correção: 4000300 (45 s) e 8dc19d6 (90 s, medido sob load 10)". · recomendado.
5. `server/tests/api-perf.sistemico-intensivo.test.ts:63-64` · Os mínimos de `pFrio` e `pQuente` são tirados de forma independente, então podem vir de rodadas diferentes. No mock, ao contrário, a escolha é de uma rodada inteira. A tolerância fica um pouco maior que a declarada. · Sugestão: escolher a rodada de menor razão `max(pFrio/900, pQuente/150)` e afirmar os dois valores dessa mesma rodada, como em `packages/mock/src/desempenho.test.ts`. · recomendado.
6. `e2e/tests/intensivo-sistemico.spec.ts:137` · `waitForURL(/\/(operacional|tatico|estrategico|sustentacao)/)` aceita qualquer painel, então não prova que o resumo leva ao painel de origem, que é o que o comentário afirma. · Sugestão: esperar a rota e o hash do cartão de origem (por exemplo `/estrategico#ei-fl3`). · recomendado.
7. `web/src/features/filtros/useParametroLocal.ts:26` · `p.toString().replaceAll('%2C', ',')` repete `textoBusca` (`codec.ts:236`); `NavegacaoGlobal.tsx:26` já repetia antes desta branch. · Sugestão: usar `textoBusca` nos dois. · recomendado.
8. `web/src/features/exportar/modelo.ts:362` · O cast `as { comFicha?: { k: number } }` contorna o tipo do DTO do E3, que existe em `packages/contratos/src/schemas.ts:582`. · Sugestão: estreitar pelo tipo inferido do schema do E3, sem cast estrutural à mão. · recomendado.
9. `web/src/features/catalogo/linhas.ts:29` · `as CartaoCatalogo` esconde o `undefined`, e a garantia de que o cartão existe fica só no teste. · Sugestão: lançar um erro explícito quando não houver cartão (catálogo inconsistente), em vez do cast. · recomendado.
10. `web/src/features/filtros/FiltroMulti.tsx:102` · O comentário começa na mesma linha da `}` que fecha `fixar`. · Sugestão: mover o comentário para a linha de baixo, junto do `useRef` que ele descreve. · recomendado (formatação).

## Checklist
1. Escopo: cada bug tem um commit rastreado e nada fora do lote entrou. A correção de cobertura em 6b30aae e o acompanhamento em c485929 pertencem ao IS-005.
2. ADRs e regras invioláveis: respeitados (ver os pontos de atenção).
3. Cálculo na `core`: sim. A IF-003 usa a opção já existente de `selecionar`.
4. Legibilidade: boa, com as ressalvas dos itens 2, 7 e 10.
5. Tipos: as ressalvas dos itens 8 e 9.
6. Segurança e dados pessoais: sem segredos e sem campos de pessoa. O teste SIS-INV cobre as 51 rotas.
7. Performance: tetos do ADR 0003 mantidos (itens 3 e 5).
8. Testes: cada bug tem teste (`useFiltros.test.tsx`, `filtros-componentes.test.tsx`, `buscaPendente.test.ts`, `formatar.test.ts`, `modelo.test.ts`, `catalogo.test.tsx`, `navegacao.test.tsx`, `businessmap.test.ts`, C5 em `perf.spec.ts`). `setup.ts` limpa a busca pendente entre os testes, o que mantém o determinismo.
9. Acessibilidade: sem mudança de semântica. O `FiltroMulti` mantém as caixas nativas.
10. Documentação: contrato da O6 regenerado e bugs com a linha "Correção:". Falta o item 1, que bloqueia.
11. Commits: Conventional Commits em português, um por mudança coerente e com as linhas de atribuição.

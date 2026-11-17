---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-ei-sust
commit: f41125a4054935ec7f553d5245394cde3cc40c1c
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---

# QA: EI_SUST com dado real (105, E7.243)

parecer: aprovado, com 2 achados recomendados (A1, A2) que não bloqueiam. A regra entregue confere com as decisões do dono P-EI-1 B e P-EI-2 A e com a suposição P-EI-3; os testes novos ficam vermelhos na base e 5 de 5 mutantes morrem. Limite do parecer: não li a base real do Acelerato (credenciais ficam em `.env`, fora do meu acesso); "dado real" aqui é o caminho de leitura real (mapa de origem, API, pg) com fixture de nomes de etapa do domínio.

## Escopo e diff contra a obrigação
Diff `57989aa0..7614d58a` (26 arquivos): `ei.ts`, `totalizadores.ts` (`classeDaEtapaEI`), `schemas.ts` (campo opcional `composicao`), `origem.ts` (EI_SUST sai do mock), critério `105:EI_SUST`, nota do cartão, contrato, OpenAPI, snapshots e testes. Sem especificação de UX própria: as obrigações são as decisões do dono e o brief.

## Critério, teste e resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| P-EI-1 B: cliente = soma de porEtapa sem as finais; time = cliente menos esperas da D5a e fila inicial | `ei-sust.test.ts` "cliente = etapas sem as finais..." (cliente 4, time 2, índice 50) | verde; mutantes M1, M2 mortos | finais fora; fila inicial subtraída |
| P-EI-2 A: Concluído, Encerramento, Causa Raiz, Revisão fora das duas visões, contadas | mesmo teste (`finais`) e `classeDaEtapaEI` | verde | final contado, não zero |
| Etapas não decididas contam como tempo do time, contadas | testes 1 e 4 (`naoDecididas`, ordem estável) | verde; M4 morto | Equipe Interna, Aprovação, Mudança, Data Acordada |
| `composicao` opcional, só somas e contagens | teste 1; schema Zod `.optional()`; `painel-real-f6.test` valida `SCHEMAS_RESULTADO` | verde | ausente nos níveis do BusinessMap (snapshots FL1 a FL3 só ganham o campo opcional) |
| Versão de critério `105:EI_SUST` | `criterios-acelerato.test.ts` (8 entradas, métrica EI_SUST) | verde | idempotência |
| Abaixo de 20 não publica | teste 2 (P2 com 12: `insuficiente`; P3 com 20: `ok`) | verde | 19/20 por prioridade |
| Chamado sem tempo por etapa fora e contado | teste 3 (`semEtapas` 2) | verde; M5 morto | vazio e só-finais |
| Só Acelerato, sem mistura | `fonte: 'Acelerato'`; `origem.test` e `qa-f6-painel.test` | verde | origem real só SUST |
| Mediana pela biblioteca (T2.5) | `estatisticaEspera`/`pontoEspera` de `core/espera` | conferido no código, sem cálculo próprio | n/a |
| Aguardando Validação conta como espera (D5a) | `classeDaEtapaEI` e M3 | verde; M3 morto | caixa "Validação" |

## Vermelho antes do verde (manual: a árvore tinha um arquivo não versionado de outro dono, e `forge-testes --vermelho` exige árvore limpa)
Comando: `git checkout 57989aa0 -- src/acelerato/ei.ts src/acelerato/totalizadores.ts` e `vitest run src/acelerato/ei-sust.test.ts`, depois restaurado ao HEAD.
Saída: `ei-sust.test.ts (5 tests | 5 failed)`; por exemplo `expected 1 to be close to 4`, `expected undefined to be 32`, `expected 22 to be 20`. No HEAD: 29 testes verdes nos três arquivos de `acelerato` (ei-sust, acelerato e o scratch).

## Mutação no diff (à mão, 5 mutantes, cada um restaurado)
| Mutante | Testes que caíram |
|---|---|
| M1 etapas finais entram no cliente (`case 'final'` removido) | 2 |
| M2 fila inicial não subtraída do time | 2 |
| M3 Aguardando Validação fora da espera | 1 |
| M4 não decidida vira espera | 3 |
| M5 `cliente <= 0` para `< 0` | 1 |
Sobreviventes: 0.

## CI do head
Run `43933986407` (push no sha 7614d58a): `imagem`, `filtro`, `seguranca`, `openapi`, `rapida`, `build` e `banco` (pg de `painel-real-f6` e `qa-sust-real`) verdes; `testes`, `e2e` e `perf` ainda em execução quando fechei. Não há PR, então não existe check `bateria`; este parecer não afirma CI verde. O autor não fechou rodada completa do `pronto` depois da última correção: o fechamento depende desse run.

## Achados
- A1 (recomendado) packages/metricas/src/acelerato/ei.ts:53 · `composicao.finais.horasUteis` soma etapa final aberta até hoje (indice.ts:78) e muda com o dia: Concluído sem saída, 2016 h em 30/09 e 3192 h em 09/10. A estatística não muda. Conferir na base real; se sim, contar só chamados.
- A2 (recomendado) packages/metricas/src/acelerato/ei.ts:66 · `naoDecididas` chaveia pelo nome cru: "Aguardando Equipe Interna" e "aguardando equipe interna" saem como duas linhas em `composicao.naoDecididas.etapas`, embora `classeDaEtapaEI` normalize a caixa. Normalizar a chave do mapa (e exibir um nome canônico).

## Fora do que li
Interface (cartão e nota): a revisão de UX é de outra etapa; só conferi o texto de `notas.ts` contra a regra (confere). A acessibilidade da tabela nova está na revalidação abaixo.

## Revalidação incremental no head bcbe9ff4 (delta de 7614d58a)
`forge-check parecer delta` listou 3 arquivos no meu domínio: `CartaoEI.tsx` (componente `ComposicaoSust`), `espera-invisivel.test.tsx` e `notas.ts` (texto). A tabela "Composição dos chamados da janela" é um `<details>` só no nível SUST e só com `composicao` presente. Obrigação: A1 do review (informar o que a EI_SUST deixou de fora ou classificou por suposição) e a nota de P-EI-2/P-EI-3.

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Tabela mostra chamados, sem etapas, fila inicial, finais, não decididas | `espera-invisivel.test.tsx` "Sustentação: a composição mostra..." | verde | 5 grupos presentes; tabela nomeada |
| Cada etapa não decidida pelo nome, com chamados e horas | "Composição da EI_SUST > lista cada etapa..." (20; 25,25; 3; 12) | verde | valores nas colunas certas; formato pt-BR |
| Nível BusinessMap não mostra a composição | "os níveis do BusinessMap não mostram..." | verde | ausência em FL1 |
| Acessibilidade: rótulos e cabeçalhos | `caption` sr-only, `th scope=col` (Grupo, Chamados, Horas úteis), `th scope=row` por linha; axe-core 4.14 (wcag2a, wcag2aa, 21, 22aa) sobre o HTML renderizado | 0 violações, 10 regras aprovadas | n/a |
| Sem depender de cor | leitura do código: nenhuma cor transmite informação; horas ausentes aparecem como o texto "—" e o rótulo da linha traz o significado | conferido | n/a |
| Teclado | Tab leva o foco ao `summary`; Enter alterna o `details` (aberto para fechado) | verde | summary focável |

Vermelho antes do verde: `git checkout 7614d58a -- web/src/features/espera-invisivel/components/CartaoEI.tsx` e `vitest run src/features/espera-invisivel` deu `2 failed | 17 passed (19)` (testid ausente; `ComposicaoSust` não exportado). No head: `19 passed (19)`.

Mutação no diff do componente (à mão, cada um restaurado):
| Mutante | Resultado |
|---|---|
| M1 guarda `nivel === 'SUST'` removida | sobrevive; equivalente: o payload dos níveis do BusinessMap não traz `composicao` (campo opcional só da EI_SUST), então a guarda é redundante com o dado |
| M2 linhas de etapas não decididas removidas | morto (1 teste) |
| M3 horas com 0 casas em vez de 2 | morto (1) |
| M4 "sem etapas" mostra o total de chamados | morto (1) |
| M5 cabeçalho de linha vira `role="cell"` | morto (2) |
O M1 é aceito por mim como equivalente: nenhuma entrada válida de BusinessMap o distingue. Sobreviventes não equivalentes: 0.

Observações, sem achado: a composição soma todas as prioridades do filtro, enquanto o cartão mostra uma aba por vez; o texto do `<details>` diz "todas as prioridades do filtro", então não engana. A1 e A2 do parecer anterior seguem recomendados, em `ei.ts`, fora do delta.

Provas e limites: o pronto completo do autor terminou EXIT 0 (informado no brief). Sem PR, não há check `bateria`; este parecer não afirma CI verde. O E2E do cartão não foi rodado nesta passada; a acessibilidade foi medida no HTML do componente sem a folha de estilo, então o contraste fica para o E2E do CI.

## Revalidação no head bb0b770b (integração da develop)
Mudança: o tech-lead integrou a `origin/develop` (312a0152) para resolver um conflito só no `CHANGELOG.md`. `forge-check parecer delta` (intervalo bcbe9ff4..bb0b770b) listou 6 arquivos no domínio (`CHANGELOG.md`, `docs/api/metricas.md`, `docs/api/openapi.json`, `origem.ts`, `origem.test.ts`, `painel-real-f6.test.ts`); a lista compara com a base antiga (57989aa0), por isso inclui o que a develop trouxe (#491, #496, #499, #500, #502) e que não é da EI_SUST. Conferi por arquivo: `git diff --numstat 57989aa0 bcbe9ff4` (aprovado) e `git diff --numstat origin/develop bb0b770b` (agora) dão os mesmos 30 arquivos e as mesmas contagens (+1533/-42 hoje); a única diferença são os dois pareceres (`docs/qa` e `docs/reviews`), que cresceram depois. O merge-base de bb0b770b com a origin/develop é a própria origin/develop (312a0152): a branch é a develop mais o patch da EI_SUST. Código e testes do patch inalterados; o resultado da passada anterior vale. A1 e A2 seguem recomendados, sem mudança.

Limite: não reexecutei a suíte neste head (sem PR, sem check `bateria`); este parecer não afirma CI verde do sha bb0b770b, o que fica para o PR.

## Revalidação no head f41125a4 (integração da develop com S8 e T10)
Mudança: o tech-lead integrou a `origin/develop` (com o S8 #503 e o T10 #506); conflitos em `criterios-acelerato.ts`, `criterios-acelerato.test.ts` e `qa-f6-painel.test.ts`, resolvidos mantendo os dois lados. `forge-check parecer delta` (bb0b770b..f41125a4) listou 11 arquivos no domínio; os que importam à EI_SUST são os três conflitantes, `origem.ts`/`origem.test.ts`, `schemas.ts` e `painel-real-f6.test.ts`; o resto (CHANGELOG, OpenAPI, `origem.test.tsx`) veio da develop. A `origin/develop` é ancestral do head.

| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Versão `105:S8-so-respondidos` em 8º e `105:EI_SUST` em 9º, sem perder nenhuma | `criterios-acelerato.test.ts` (9 entradas, ordem e referências únicas) | verde | idempotência; ordem |
| EI_SUST e T10 convivem nas métricas reais, sem mistura de fonte | `qa-f6-painel.test.ts`, `painel-real-f6.test.ts`, `origem.test.ts` (contratos) | verde | origem real só SUST para a EI_SUST |
| Regra da EI_SUST intacta | `ei-sust.test.ts` e demais de `acelerato` | verde | finais, fila inicial, mínimo 20 |
| Cartão e composição | `espera-invisivel.test.tsx`, `origem.test.tsx` | verde | composição só no SUST |

Execução local no head (fora do sandbox, a worktree é só leitura nele): `packages/metricas src/acelerato` 6 arquivos, 53 testes verdes; `server` (criterios-acelerato, qa-f6-painel, painel-real-f6) 3 arquivos, 69 verdes; `packages/contratos src/origem.test.ts` 26 verdes; `web` (espera-invisivel, coleta/origem) 2 arquivos, 37 verdes. Código novo da EI_SUST sem mudança desde o parecer anterior (só a resolução dos conflitos), então vermelho antes do verde e mutantes valem como estão. A1 e A2 seguem recomendados, sem mudança. Sem PR, não há check `bateria`; este parecer não afirma CI verde do sha f41125a4. O `painel-real-f6.pg` (banco) não foi rodado aqui.

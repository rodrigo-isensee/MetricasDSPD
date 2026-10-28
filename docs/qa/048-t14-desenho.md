---
tipo: qa
contrato: 1
pedido: 048-o-que-falta-em-mock
branch: docs/048-t14-desenho
commit: 4497268f36749b17c4b0928f3660551654fa11d4
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# QA: T14 em mock (K-112) e contrato por `oculto` (K-130), pedido 048

Entrega testada: `docs/048-t14-desenho`, código de `f786c9c` (review `33b5eb9`, segurança aprovada) mais o commit do QA `4497268` (só testes, âncoras e artefatos gerados). Contrato: `docs/api/metricas.md`, bloco T14. Plano técnico: `docs/architecture/features/048-t14-mock.md`. O review é anterior ao `3c9f6a4` (só texto); a revalidação dele sai com o PR.

**Parecer: aprovado.** `pnpm run pronto` completo com rc=0 no head (cobertura 100% em todos os pacotes), E2E de API do T14 com 23 de 23, mutantes mortos. A entrega chegou com 5 pendências que o `pronto` pegou e que o QA corrigiu em teste e em artefato gerado (nenhum código de produção foi mexido): ver "Achados".

## Âncoras de hash

| Âncora | Antes | Depois |
|---|---|---|
| `web/src/data/mock/nucleoMock.paridade.test.ts:169` e `packages/mock/src/extensaoTambem.test.ts:34` (extensão) | `9159f65b` | `82329bc3` |
| `packages/mock/src/extensaoTambemFase2.test.ts:32` (`equipeResponsavel`) | `05fe183b` | `8eac5ab5` |
| `packages/mock/src/extensaoTambemFase2.test.ts:33` (`outrosPublicavel`) | `12db0950` | `0e099f62` |

Origem da mudança, medida campo a campo na base `4137981` (develop) e no head: `base` (68a67741), `ac` (0113e077), `entradasSazonais`, `primeiroToque`, `passagens`, `vinculos`, `datasProjeto`, `conhecimentoSistema` e `configEquipes` idênticos. Só mudam `equipeResponsavel` (reatribuição de um projeto alvo, plano §1 passo 4) e `outrosPublicavel` (cadastro de membros simulado no lugar do sorteio): ambos são da T14. O diff de `extensaoTambemFase2.ts` confirma que são as únicas duas fontes de mudança.

## Tabela critério, teste, resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| K-130 (união por `oculto`, `outrosTimes` inteiro, sem campo extra) | `tatico-011-lote2.spec.ts` TT-20 (chaves exatas do oculto e do visível, `outrosTimes = n - k`, mínimo de 3 ocultos e 20 visíveis) | forma `strict` do oculto (só `meuTime.k`) | passou |
| E1/E2: nenhum campo de pessoa, nenhum número de pessoas | TT-21 (lista fechada de chaves em 3 respostas, sem `sim-NNN`, sem `@`, sem chave de pessoa, membro, cadastro ou publicável) | chave nova na resposta derruba o teste; guarda de suíte vazia (150 chaves) | passou |
| Q-T14-12 = B (ordem) | TT-22 (visíveis por total decrescente e código; ocultos depois, por código; nenhum visível após oculto; o mock distingue "ocultos ao fim" de "tudo por código") | oculto com código menor que o de visível | passou |
| T14-M1 = B, M-1a (total e base só dos visíveis) | TT-23 (`total.k`, `total.n`, `base.n` e `base.complemento.n` iguais às somas dos visíveis, nas duas equipes) | `n` do oculto não sai por subtração | passou |
| CA-45 na tela (demandas e frentes) | TT-11, TT-12 (oculto só "Meu time: k", último da lista, sem barra, tabela "não exibido", aviso de total sem ocultos) | oculto no fim da lista | passou |
| Controle positivo do detector da tela | TT-13 (API devolvendo o projeto como visível mostra "24 de 29" e a barra) | o teste TT-11 não passa por cegueira | passou |
| CA-28 (sem equipe ou várias) | TT-08, mais `semEquipe: true` na TT-21 | "Todas" e duas equipes | passou |
| CA-30, CA-31, CA-32, CA-33, CA-34 | TT-09, TT-10 (ordem da API na tela, 1 de 15 sem percentual, 6 sem time informado) | menos de 20 sem percentual | passou |
| Demais obrigações do lote 2 (T10 a T13, catálogo, axe, teclado, 360 px) | TT-01 a TT-07, TT-14 a TT-19 | n/a | passaram (TT-16 corrigido: 58 para 65 métricas) |
| Cadastro de membros, `outrosPublicavel`, bordas 19/20, propriedades D1 | `membrosSimulados.test.ts`, `extensaoTambemFase2.test.ts`, `t14.test.ts` (do node-backend) | menos de 2 pessoas oculta; ausente oculta (fail-closed) | passaram no pronto |

Casos novos do spec: TT-20 a TT-23 (contrato na API, sem tela) e a reescrita de TT-09, TT-11, TT-12 e TT-13 para a união. Nos dados do mock (hash 82329bc3) cada bloco tem no máximo 1 oculto, então a ordem entre 2 ocultos não aparece na API; ela fica no unitário `t14.test.ts` D3 e CA-4, que cai com o mutante 3.

## Resultado real

- E2E de API (`chromium-api`, `tatico-011-lote2.spec.ts`), antes: o spec antigo contra o contrato novo, 3 falhas (TT-11 e TT-12, `outrosTimes` nulo que não existe mais; TT-16, contagem do catálogo 58 contra 65 já defasada). Depois: 23 passaram, 0 falharam.
- `pnpm run pronto` completo, head `4497268` (trava `suite-unica.sh`): rc=0. Testes: spec-check 14, homolog 73, contratos 161, pesquisa 33, metricas 1092, mock 258, server 591 (84 pulados pelo banco, previstos), web 1228, docs-contratos 102. Cobertura de instruções e ramos em 100% em todos os pacotes (metricas 3275/3275 e 1608/1608; mock 1140/1140 e 734/734; web 4536/4536 e 4361/4361). `docs:check` ok (767 páginas, 69 métricas).
- Pulados do `server` são os testes de banco (`test:pg`), fora do `pronto` por desenho; não é `skip` de teste de T14.

## Vermelho antes do verde e mutação

Teste novo da regra, rodado contra mutantes do código de produção feitos e desfeitos na árvore (`git checkout --` confirmado, árvore limpa), só TT-20 a TT-23:

| Mutante em `t14.ts` | Resultado |
|---|---|
| 1: visíveis ordenados por código em vez de por total | 1 falhou (TT-22) |
| 2: `n` do bloco soma também os ocultos | 1 falhou (TT-23) |
| 3: ocultos ordenados por `-total` em vez de por código | sobreviveu na API (no máximo 1 oculto por bloco no mock); morreu no unitário `t14.test.ts` D3, CA-4 (1 falhou) |
| 4: oculto devolve `meuTime: { k, n }` | 4 falharam (TT-20, TT-21, TT-23 e a união) |

Mutante 3 não é equivalente: é coberto no nível unitário, onde o cenário com 2 ocultos existe. Sem ferramenta de mutação da stack nos pacotes alterados fora disso; o `forge-testes --vermelho` não se aplica (pedido de projeto, não do Forge).

A1 a A5 eram defeitos de entrega que o `pronto` pegou; o QA os corrigiu neste commit (só teste e artefato gerado), por isso saem como recomendados, já resolvidos.

## Achados

- A1 (recomendado) packages/metricas/src/businessmap/t14.test.ts:710 · RESOLVIDO: a propriedade D1 comparava dois `[]` por `toBe` e incluía projeto sem cards (a regra não lista); falhava por semente. Agora `toEqual` e `fc.pre(total > 0)`
- A2 (recomendado) packages/mock/src/extensaoTambemFase2.test.ts:32 · RESOLVIDO: duas âncoras de hash fora do brief (`equipeResponsavel`, `outrosPublicavel`) quebravam o mock; atualizadas para 8eac5ab5 e 0e099f62
- A3 (recomendado) packages/mock/src/businessmap/extensaoTambemFase2.ts:345 · RESOLVIDO: o ramo de menos de 3 equipes não tinha teste e a cobertura de ramos caía a 99,86%; teste novo cobre o ramo, sem mexer em produção
- A4 (recomendado) docs/api/openapi.json:1 · RESOLVIDO: o contrato novo da T14 não fora regenerado (teste OpenAPI gerado = versionado falhava); `pnpm run openapi:gerar` regenerou, e só o schema da T14 mudou
- A5 (recomendado) docs/contratos/snapshots/resultados/T14.json:1 · RESOLVIDO: página e fotografia da T14 desatualizadas e mudança incompatível sem aceite; regerei pelo fluxo da política (aceite de uso único, removido). O tech-lead confirma o aceite no PR
- A6 (recomendado) packages/mock/src/businessmap/extensaoTambemFase2.ts:373 · na fase 3 só a equipe do filtro deve ir à API (A2 da segurança); o TT-21 guarda as chaves, não o tamanho do mapa de publicação
- A7 (recomendado) e2e/tests-api/tatico-011-lote2.spec.ts:1 · o E2E de API não roda no `pronto` (só o typecheck do e2e); o contrato da T14 na API só é provado pela suíte `chromium-api`, que precisa rodar no portão de CI do homolog

## Observações

- Meta de mutação do projeto e `forge-mutante` não se aplicam (sem `bin/`, `hooks/` ou `.githooks/` no diff).
- A revalidação do review e o PR (E5.1) cobrem o `3c9f6a4` e os commits de QA; o teto M14 (A4 do review) segue com o tech-lead no PR.

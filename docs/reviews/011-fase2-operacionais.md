---
tipo: review
contrato: 1
pedido: 011-fase2-operacionais
branch: feature/011-fase2-operacionais-v2
commit: d5b02d8
parecer: aprovado
revisor: tech-lead
data: 2026-10-17
---

# Code review: back da fase 2 do pedido 011, lote 3 (operacionais: O22, O26)

**Origem:** commits `3297fda` (E1) e `11113d0` (E2) da `feature/011-fase2-back`, sobre `b73bad3`. A revisão foi feita contra o plano (`docs/architecture/features/metricas-tambem-disponiveis.md` §2 O22 e O26, §3, §4 e §5 "Fase 2"), a ADR 0020 (itens 2, 3, 7 e 8), as decisões do usuário (D-9', D-5' = B, Q-a = 1 passagem, Q-b = conta) e as regras invioláveis do `CLAUDE.md`.

**Separação por nível** (decisão do usuário de 2026-10-17): este lote é o commit `df0b9ed`, que sai da `feature/011-fase2-taticas` (`ace8db8`). Ele acrescenta O22 e O26 aos arquivos compartilhados. Com ele, a árvore fica igual à de `11113d0` somada à `develop` atual, com uma única diferença, que é de forma: o teste do coletor foi dividido entre `coletor/faixaConcentracao.test.ts`, que veio do lote 1, e `coletor/houveTroca.test.ts`. A comparação `git diff 11113d0 df0b9ed` confirma isso, fora os documentos da `develop` e os pareceres. Nenhuma lógica mudou.

**Veredito da rodada 1 (sobre `df0b9ed`):** **aprovado**, com 2 ajustes recomendados. Nada bloqueia o QA. A rodada 2, no fim, revalida sobre a `develop` atual.

## Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na raiz da worktree, nesta branch, sobre `df0b9ed` mais este parecer: **rc=0** (2026-10-16 11:43, load 0,89 no início). Cobre lint, `format:check`, tipos, testes com cobertura de 100% em todos os pacotes, `docs:check`, `spec:check`, build e tamanho do web.
- `docs:fotografar`: a fotografia do `VISAO_GERAL` (enum com as seis ids) é a do autor. O aceite de uso único segue a mesma ratificação dos lotes 1 e 2.

## Regras de leitura (`praticas.md` §2, §3, §4 e §8)
| Item | Situação |
|---|---|
| Faz o que o plano pede | ok. No O22, só o primeiro comentário humano conta (D-9', CA-43). O O26 traz faixas 0 a 4+ e o P85 do ciclo do O3 por faixa (`entreguesDe`, sem recálculo) |
| Pessoa (ADR 0020) | ok. Só o inteiro `passagens` e o instante `primeiroToque` chegam à biblioteca. `houveTroca` e `contarPassagens` ficam em `coletor/`, fora de `exports`, de `src/index.ts` e de `./businessmap`, com teste. O gerador não lê `responsaveis` |
| Mínimo de 20, janela e classe | ok. O22: percentis e histograma com 20 ou mais tocados do tipo, na janela de 12 semanas. O26: contagem sempre, `pct` e `cicloP85` com 20 ou mais. Os dois saem por tipo (regra 7) |
| Erros e entradas | ok. `passagens` ausente, negativa ou fracionária vira "sem dado", nunca "0 passagens". Toque antes da criação ou depois de hoje é ignorado |
| Testes e bordas | ok. 19/20 por tipo, limite inclusivo das faixas (0,5 vai para `0,5–1`), property tests de `houveTroca` (CA-38, os quatro casos da ADR 0020, item 7) e de `contarPassagens` (Q-a, Q-b, conjunto vazio no meio) com semente fixa |
| Performance (ADR 0003, C4) | ok. O autor mediu o Operacional com "Mais métricas" aberta antes e depois de O22 e O26 (`docs/api/metricas.md`). O resultado ficou dentro do orçamento de 450 ms |
| Documentação no mesmo commit | ok |

## Pontos que o autor deixou para o review
**(b) Enum do `VISAO_GERAL`:** ratificado, pelo mesmo motivo dos lotes anteriores, agora com O22 e O26.

**(c) Testes do QA e `regras-metricas.md`:** aceitos, com as conclusões do lote 1. Neste lote, o A-2 do `qa011-fase1.api.test.ts` volta à forma do autor: as seis ids respondem 200, e as da fase 3 ou inexistentes respondem 404. O título continua prometendo mais do que o teste confere (R1 do lote 1; o QA confirma no E1.4).

**(d) Suposições do autor:**
- **O22 e O26 por tipo: resolvida pelos documentos.** O plano, §2 O22, pede "P50/P85/P95 por tipo na janela". O contrato do O26 no plano já tem `tipo`. A regra geral 7 da especificação diz que "toda distribuição de tempo é por tipo de demanda", e o O25 tem o mesmo precedente. A resposta traz `porTipo[]`, e a interface mostra um tipo por vez.
- **`histograma` nulo abaixo de 20 no O22: resolvida pela biblioteca.** O `histograma` do núcleo (`core/histograma.ts:98`: "histograma é distribuição e não se publica") devolve `null` abaixo de 20, e o O22 só repassa esse resultado (`o22.ts:93`). Isso segue a regra do briefing. O O26 é diferente: as faixas são contagem de censo, publicada sempre, como o plano manda.

## Achados
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `packages/metricas/src/coletor/houveTroca.test.ts:109` e `docs/tecnica/biblioteca-de-calculo.md:67` | A ADR 0020 pede duas coisas que ainda não existem: a entrada `./coletor` no `exports` (item 2) e a regra de lint de import, com teste e bloqueio de `eslint-disable` (item 3). O teste afirma o contrário, que o `package.json` não cita `coletor`, e a doc adia a regra para a fase 3. Hoje nenhum consumidor existe, porque o módulo `coleta*` nasce na fase 3, e por isso adiar é aceitável. Falta um cartão que registre o adiamento | Criar um cartão da fase 3, ao lado do K-100, com a entrada `./coletor`, a regra de lint, o teste de lint e o de bundle (ADR 0020, item 7). O teste do `package.json` muda junto. O architect confirma o adiamento na ADR | recomendado |
| R2 | `docs/api/metricas.md`, seção "C4 (ADR 0003)" | Os números de C4 foram medidos com as seis ids juntas. Nos lotes 1 e 2 a doc traz só a frase geral | Nada a mudar neste lote. Se o QA medir o C4 por lote, atualizar a doc de cada lote | recomendado (QA) |

## Fora deste review
- **Segurança** (E1.3, `security-engineer`, gatilho: dado pessoal no O22 e no O26): não refeito.
- **QA** (E1.4), **UX** (E3.2) e o PR (pedido 020).

## Commits
`df0b9ed feat(metricas): back da fase 2 do pedido 011, lote das operacionais (O22, O26), em mock`. A mensagem segue Conventional Commits em português, com o cartão e as linhas de atribuição.

## Rodada 2: revalidação sobre `d5b02d8` (operacionais sobre a develop `8516ff8`)

**Motivo:** a `feature/011-fase2-operacionais` (`aab7a46`) foi cortada sobre `ace8db8`, um estado antigo das táticas, e não continha a `develop`. Depois disso, os lotes 1 (#105) e 2 (#107, `8516ff8`) entraram na `develop` por squash, e as táticas mudaram nas rodadas 2 a 5 do review delas (B11-001 com a versão de critério do T10, Q-T14-9 e Q-T14-10 decididas, T14-M1 = B, `chaveOutrosPublicavel` no mock, `regras-metricas.md` atualizada à mão, teste da P6 do T14).

**Veredito:** **aprovado**, sem achados novos. Os R1 e R2 da rodada 1 seguem como estavam (recomendados, nenhum bloqueia).

### Método
- **Branch nova** `feature/011-fase2-operacionais-v2`, criada de `origin/develop` (`8516ff8`), com `git cherry-pick df0b9ed`, que é só o commit das operacionais. O commit resultante é `d5b02d8`, com a mesma mensagem. Escolhi o cherry-pick em vez do merge da `develop` porque `ace8db8` não é ancestral da `develop` (o lote 2 entrou por squash): um merge traria a história antiga das táticas e exigiria resolver a favor da `develop` arquivo por arquivo, com risco de resíduo; o cherry-pick aplica só o delta `ace8db8..df0b9ed`.
- A `feature/011-fase2-operacionais` antiga fica no `origin` sem mudança e só é apagada depois do PR, sem `--force`.

### Conflitos e como foram resolvidos (a favor da `develop`, com O22 e O26 acrescentados)
| Arquivo | Resolução |
|---|---|
| `docs/architecture/regras-metricas.md`, tabela | Mantida a linha do T10 da `develop` (com B11-001); acrescentada a linha do O26. A linha do O22 entrou sem conflito, e a do O19 é a da `develop` (O19-pct = B) |
| `docs/architecture/regras-metricas.md`, parágrafo da fase 2 | Mantido o texto da `develop` (Q-T14-2, 3, 4, 7 e 8 pendentes; Q-T14-9 = A, Q-T14-10 = B e T14-M1 = B decididas), com as frases do O22 e do O26 do autor no começo e "quatro ids" trocado por "seis ids", que é o que `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` passa a ter além do T11 (O22, O26, T13, T14, E6, E8; `criterios.ts:35`) |
| `packages/mock/src/businessmap/extensaoTambemFase2.ts`, imports | Mantido o `chaveOutrosPublicavel` da `develop` (R3 das táticas) e acrescentados `lognormal` e `poisson`, usados pelo gerador do O22 e do O26 |

Os outros 45 arquivos aplicaram sem conflito. `git range-diff ace8db8..df0b9ed 8516ff8..d5b02d8` mostra o patch igual ao de `df0b9ed`, salvo os três trechos acima. Nenhum arquivo de lógica das táticas ou das estratégicas mudou.

### O diff contra a develop é só o O22, o O26 e o que eles exigem
`git diff --stat 8516ff8 d5b02d8`: 47 arquivos, +4171/−625. É o mesmo conjunto da rodada 1 (`ace8db8..df0b9ed`, 48 arquivos menos este parecer): lógica nova em `o22.ts`, `o26.ts` e `coletor/houveTroca.ts` com os testes; contratos, `REGRAS_METRICA`, `criterios.ts`, `calcular.ts`, `ExtensaoTambemBM`, gerador do mock, contagens dos testes do `server`, OpenAPI, fotografias e docs gerados, que só acrescentam O22 e O26. As 625 linhas removidas são quase todas da OpenAPI (o alinhamento do diff troca blocos de O24 por O22; `openapi:verificar`: "openapi.json em dia"); fora dela, são contagens e listas que crescem de quatro para seis ids.

### Efeito das mudanças das táticas sobre as operacionais
- **Versão de critério do T10** (`VERSAO_CRITERIO_T10_FORNECEDOR_NORMALIZADO`, `afeta: ['T10']`): não alcança O22 nem O26, e os testes de `afeta` do descarte nativo continuam passando com as seis ids fora.
- **P6 com o T14 por equipe** e **`chaveOutrosPublicavel`**: não tocam o código das operacionais; a varredura de nomes de pessoa da P6 segue cobrindo O22 e O26.
- **`regras-metricas.md`**: o texto manual fica consistente com o `REGRAS_METRICA` para O22, O26, T10 e T14.

### Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na raiz da worktree, sobre `d5b02d8`: **rc=0** (2026-10-17 02:00, load 1,28 no início, 4,6 GB livres). Cobre lint, `format:check`, tipos, testes com cobertura de 100% (`packages/metricas` 1090, `packages/mock` 244, `packages/contratos` 160, `server` 591, `web` 1047), `docs:check` (69 métricas), `spec:check`, build e tamanho do web.
- `pnpm run openapi:verificar` (server): "openapi.json em dia".

### Fora desta rodada
- **Segurança** (E1.3/E2.3): o parecer do `security-engineer` revalida sobre esta branch; o rascunho dele não foi tocado.
- **QA** (E1.4/E2.4), depois da segurança. O PR e a promoção para a `homolog` (pedido 023).

### Commits
`d5b02d8 feat(metricas): back da fase 2 do pedido 011, lote das operacionais (O22, O26), em mock` (cherry-pick de `df0b9ed`, com os conflitos resolvidos acima) e o commit deste parecer. Seguem Conventional Commits em português e trazem as linhas de atribuição.

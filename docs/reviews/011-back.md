---
tipo: review
contrato: 1
pedido: 011-metricas-tambem-disponiveis-back
branch: feature/011-metricas-tambem-back
commit: 8908d92
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: back do pedido 011 (cartões B1 a B12)

Arquivo único do back do pedido 011, com uma seção por cartão, em ordem. O review é incremental, por cartão, conforme a ata `docs/alinhamentos/2026-10-14-revisao-desenho-011.md` §3. O frontmatter reflete o último cartão revisado; o review final da branch (B12) cobre a branch inteira. A última seção ("Revalidação: merge do #93 (só docs)") é a que vale para o PR.

## B1: contratos da fase 1 e trava de pessoa

**Escopo:** commits `4535089` (lint) e `4e70af9` (contratos) sobre `cdb5f8a`. São 13 arquivos, com 893 linhas a mais e 4 a menos.
**Veredito:** **aprovado**, com 6 ajustes recomendados e nenhum que bloqueie. Os ajustes R1 a R4 entram num commit `fix` antes do B12, ou no B2 se o autor preferir. R5 e R6 ficam como nota para os cartões de cálculo.

### Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na worktree, rodado pelo autor: EXIT 0. Inclui lint, tipos, testes com cobertura de 100%, `docs:check` e `openapi:verificar`. Não rodei de novo: o diff não mexe em cálculo nem em rota, e nenhum id entra em `METRICA_IDS`.

### Critérios de pronto do B1 (ata §3)
| Critério | Situação |
|---|---|
| Schemas zod `strict` dos 10 resultados e de `ResultadoO2.parados` | ok. O helper `fechado()` e o teste "todo objeto próprio é strict" varrem o JSON Schema e ignoram só os blocos compartilhados (`taxa`, `estatistica`, `base`, `criterios`, `marcacao`) |
| Chaves `motivo-bloqueio`, `fornecedor` e `mes-do-ano`; sem `faixa-passagens` | ok, em `core/regras.ts` e `regras-metricas.md` |
| Lint `no-restricted-properties` para `responsaveis` e `usuario` em `businessmap/**` | ok. O meta-teste cobre o acesso por ponto, por colchetes e por desestruturação, e tem um caso sem falso positivo em `modelo.ts` |
| Nenhum id em `METRICA_IDS` | ok, com teste |
| Teste que rejeita campo extra e nome de pessoa | ok, com a ressalva de R2 |
| Ajustes do item 7: T10 sem prazo, E7 com `custoPorDemanda` anulável, O25 com aviso e `porMotivo` anulável | ok, cada um com teste |
| `marcacoes` em toda série (item 6 b) | ok: O24, O25 e T11, e `mudancasCriterio` no O20 |
| Tipos exportados por `@metricas-dspd/contratos`, sem duplicação no web | ok. Por `index.ts`, e o web ainda não os consome |
| `docs/api/` atualizado no mesmo commit | ok. `docs/api/metricas.md`, OpenAPI e fotografia do O2 |

### Suposições do autor (conferidas)
1. **`taxaSchema` no lugar de `{ k, n, taxa }` solto:** confirmo. O plano escreve `{ k, n, taxa }` (O24, O25, T12, O21) e `{ natureza, itens, pct }` (E7). O `taxaSchema` carrega `k`, `n` e `pct`, e só aceita `pct` com n ≥ 20 (o teste do T12 prova). É a mesma informação, com o mínimo de 20 garantido pelo tipo. A divergência de texto no plano fica para o architect alinhar (sem mudança de decisão).
2. **`parados` opcional no O2 até o B2:** confirmo. É acréscimo compatível (ADR 0007) e não deixa o O2 em estado inválido entre cartões. **Obrigação do B2:** tornar o campo obrigatório e inverter o teste "é opcional no O2" (`tambem.test.ts:344`), que hoje garante o contrário.
3. **`mudancasCriterio` no O20 e `marcacoes` no O24, O25 e T11:** confirmo. São o plano §2 e a ata item 6 b (A9).
4. **O21 sem campo novo:** confirmo. O O21 não tem série no tempo (tem matriz, contagem e comparação com/sem), então `marcacoes` não se aplica. Se o B4 decidir mostrar o O21 por mês, a série entra com `marcacoes`.

### Significado de cada campo (risco apontado pelo autor: o regex só olha o nome)
Li o significado dos campos dos 10 schemas e de `parados`, buscando pessoa, equipe nomeada e comparação entre times. **Nenhum campo carrega pessoa nem compara equipes.**

| Schema | Campos de texto livre ou de domínio aberto | Leitura |
|---|---|---|
| O19 | `motivo` | enum fechado `MOTIVOS_BLOQUEIO`. ok |
| O20 | `faixas.chave`, `faixas.rotulo` | são coluna (com uma equipe filtrada) ou papel ("Todas"). O "Todas" agrupa por papel e nunca por equipe, então não existe faixa por time. O schema não tem como impedir que o cálculo devolva equipe como faixa: ver R5 |
| O21 | `matriz.celulas.origem`, `matriz.celulas.destino` | coluna ou papel, com o mesmo cuidado do O20 (R5) |
| O24 | `grupo` | literal único `equipe-tipo-padrao`. É o nome do critério (a fila de cada equipe), não um valor por equipe: a saída não traz a equipe. ok |
| O25 | `porMotivo.motivo` | `z.string()`, mas o domínio é o catálogo nativo `reason_id`, e `discard_comment` nunca entra. Hoje é sempre `null` (CA-44). ok |
| T10 | `fornecedor` | empresa terceira (Alfa, Beta, Gama no mock), decidida pelo usuário (D-10 = A), em ordem alfabética (CA-11). Não é time do DSPD. ok |
| T12 | `area` | área demandante (D-8 = A, decidida). Não é equipe do DSPD. ok |
| E7 | `sistema`, `natureza` | sistema e enum fechado `NATUREZAS_ENTREGA`. O custo é um valor só, do DSPD inteiro (D-1' = A). ok |
| E9 | `codigo`, `titulo` | projeto, aprovado na ata item 5 (d). O título é texto livre do BusinessMap. A regra de título fora da base vale para o chamado do Acelerato, não para o projeto do BusinessMap. ok |
| O2.parados | `porEtapa.etapa` | coluna, a mesma quebra do O2. ok |

### Ajustes
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `packages/contratos/src/tambem.test.ts:211` | O teste "rejeita campo de pessoa em objeto aninhado" sai com `return` quando o topo não tem lista de objetos. Isso acontece no **O21** (`matriz` e `comparacao` são objetos), então o teste passa sem afirmar nada para ele. O comentário fala em "O25", mas o O25 tem `meses` e é testado. É o item 11 do checklist: teste que percorre lista sem afirmar mínimo | Procurar também em objeto aninhado (por exemplo, `matriz.celulas[0]` ou `matriz`) e trocar o `return` por `expect(alvo).toBeDefined()`, para que nenhum código fique sem caso | recomendado |
| R2 | `packages/contratos/src/tambem.test.ts:136` | `^(equipes?\|times?)$` só casa com o nome exato. Não pega `porEquipe`, `equipeId`, `nomeEquipe`, `timeId` nem `quadro`, que são justamente as formas de comparação entre times que um cálculo futuro poderia introduzir | Trocar por `equipe` em qualquer posição e acrescentar `quadro` e `^times?$\|^time[A-Z_]\|porTime`. Hoje nenhum campo legítimo dos 10 schemas contém essas palavras (`equipe-tipo-padrao` é valor, não nome de campo). Acrescentar os novos nomes no teste "a trava não é vacuosa" | recomendado |
| R3 | `eslint.config.js:99` e `:103` | A mensagem e o comentário do lint citam "ADR 0020". Essa ADR não está na branch, e o assunto dela é a proteção de pessoa no **coletor** (fase 2, ainda `proposta`), não a regra de leitura nas métricas, que vem da P-T6 da ata. A mesma citação aparece em `tambem.test.ts`, `tambem.ts` (cabeçalho) e `docs/api/metricas.md` | Citar "briefing 7.1, P-T6 (ata 2026-10-14)". A ADR 0020 só passa a ser citada depois de ficar `vigente` | recomendado |
| R4 | `docs/contratos/metricas/O2.md:3` | `Revisão: 2026-10-15` é uma data futura: o commit é de 2026-10-14 | Mudar para 2026-10-14 | recomendado |
| R5 | `packages/contratos/src/tambem.ts` (O20 `faixas.chave/rotulo`, O21 `celulas.origem/destino`) | São campos `z.string()`: o contrato não tem como garantir que a faixa nunca seja uma equipe | Nota para o **B4/B5** (O20 e O21): incluir um teste de cálculo afirmando que, com "Todas" ou com mais de uma equipe, `agrupamento`/`eixo` é `papel` e nenhuma `chave` é código de equipe | recomendado (cartão de cálculo) |
| R6 | `packages/contratos/src/tambem.ts:48` (O19 `pctDoTotal`) | `pctDoTotal` é `taxaSchema`, como o plano pede. Se o B3 calcular sobre dias úteis (`diasUteis / totalDiasUteis`), o mínimo de 20 passa a valer sobre **dias**, e não sobre itens, e o `k`/`n` muda de significado | Nota para o **B3:** definir `n` como o número de bloqueios encerrados, para que o mínimo de 20 valha sobre itens. Se o percentual tiver de ser sobre dias, isso é regra de negócio: vira pergunta ao usuário, sem inferir | recomendado (cartão de cálculo) |

**Observações sem ajuste:**
- `tambem.ts:30-31` redeclara `mes` e `iso` (`z.string()`), que também existem em `schemas.ts:39-40`. É duplicação pequena. Pode ir para `comum.ts` quando outro cartão mexer ali.
- E9 `faixa` é `z.string()`, e as faixas são fixas na spec. Um enum seria mais preciso, mas ele só nasce com o cálculo no B9, e pode entrar ali.
- O escopo do lint em `packages/metricas/src/businessmap/**` segue a ata. Conferi que nenhum arquivo fora de `businessmap/` importa o modelo do card (`calcular.ts`, `extensoes.ts` e `visaoGeral.ts` não leem `responsaveis` nem `usuario`). Os testes ficam fora do lint, e isso é correto: o property test precisa montar cards com pessoa.
- `NATUREZAS_ENTREGA` em `comum.ts` tirou a duplicação do enum de `schemas.ts`.

### Commits
São dois commits coerentes, em Conventional Commits em português e com corpo explicando o porquê e o cartão (`K-078 B1`). O lint vem antes dos contratos, como a ata pede ("antes da primeira métrica nova"). ok.

### Segurança
Nenhum achado novo para o `security-engineer`. A trava de pessoa só ganhou camadas (lint de leitura e contrato `strict`). A ADR 0020 e a revisão de segurança dela (`docs/security/adr-0020-protecao-de-pessoa.md`) são da fase 2.

---

# Lote B2 a B10 (review de 2026-10-15)

**Escopo:** `4e70af9..2a2f837`, 13 commits: `75837cd` (B2), `6cd7489` (ajustes do B1), `69e98e0` (B3), `f3629a0` (B4), `04dd94d` e `e9085e7` (B5), `ab924c3` e `103105d` (B6), `0c18a5b` (B7), `43ae638` (B8), `c443888` e `0e426e3` (B9), `2a2f837` (B10). Li o diff por cartão contra a ata (§3), a especificação (`02-especificacao.md` §3, §5, §6 e §8), o pedido 011 ("Decisões do usuário") e `praticas.md` §2 a §4, §7 e §8.

**Veredito do lote:** **ajustes necessários**. Os 9 cartões estão corretos no essencial: a biblioteca é única, o mínimo de 20 é respeitado, BusinessMap e Acelerato não se misturam, nenhuma saída tem pessoa ou equipe, e o O1 não regrediu (fica cerca de 3 vezes mais rápido). Seis ajustes bloqueiam a ida ao QA: três valem para o lote inteiro (L1 a L3) e três são de cartão (B3-1, B5-1 e B5-2). Os cartões seguintes podem continuar. Os ajustes que bloqueiam entram antes do B11. Todos ficam com o `node-backend`.

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto`, rodado pelo tech-lead no HEAD `2a2f837`: **EXIT=1**.
  - Passaram: `lint`, `format:check`, `contratos`, `mock` (175 testes, cobertura de 100%), `homolog`, `spec-check` e `pesquisa`.
  - Falhou: `packages/metricas`, com 698 de 699 testes. O teste "fluxo: todo resultado respeita o contrato em qualquer combinação de filtros" (`src/varredura.test.ts:58`, cenário escala 0,4) passou do tempo: levou 16.685 ms, e o limite padrão é 15.000 ms.
  - Não rodaram, porque o `pnpm -r` para na primeira falha: `server`, `web` e `tools/docs-contratos`, que inclui o `docs:check`. O `openapi:verificar` e a suíte do server **não foram verificados nesta rodada**.
- Diagnóstico do tech-lead (medição descartável, fora da árvore; a worktree segue limpa):
  - Rodado sozinho, o mesmo arquivo passa.
  - Na varredura de 44 ids BusinessMap, o cálculo soma 2.357 ms, em 10 recortes × 5 períodos × 2 chamadas. As 9 métricas novas somam 189 ms (8%). O T6 sozinho leva 950 ms.
  - Conclusão: a falha vem da disputa de CPU com a suíte do `mock`, que roda em paralelo no `pnpm -r`. O teste já estava no limite, e as ids novas o empurraram para fora. Não é regressão de algoritmo, mas o pronto está vermelho (ver L1).
- `praticas.md` não marca as regras como "decidida por: `<comando>`" ou "decidida por: leitura". **Pendência de fábrica** (skill `engineering-practices`): o review leu as seções 2 a 4, 7 e 8 inteiras.

## Ajustes que valem para o lote

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| L1 | `packages/metricas/src/varredura.test.ts:58` | O pronto está vermelho por timeout: 16,7 s contra 15 s. Um único `it` percorre as 44 ids BusinessMap, e cada id nova encosta mais no limite. | Quebrar em `it.each` por id: cada id ganha o próprio tempo e a falha aponta a métrica. Não basta subir o timeout global. Se ainda faltar folga, usar um timeout explícito e comentado (`praticas.md` §4: "limite folgado e explícito"). Rodar o pronto completo depois, inclusive `server`, `web` e `docs:check`. | **bloqueia** |
| L2 | `docs/tecnica/biblioteca-de-calculo.md` (§3.6, §3.8, §4, §5) | Nenhum commit do lote tocou em `docs/tecnica/`. `praticas.md` §7.7 diz que a biblioteca (`packages/*`) se documenta em `docs/tecnica/`, e o §8.10 diz que falta de documentação bloqueia. Ficaram desatualizados o "Catálogo das 33 métricas" (agora são 42, faltam O19, O20, O21, O24, O25, T10, T12, E7 e E9 e o bloco O23 no O2), o §3.6 `descartado` (`descartadoNativo`, `motivoSemDescarte`, `instanteDoDescarte`), o §3.8 (`VERSOES_DA_BIBLIOTECA` e `LIMITE_PARADO_DIAS_UTEIS`), a varredura por coluna e a da vida (`varredura.ts`, B8) e o estado da matriz e das exceções das propriedades (O19 e T10 em P2). `docs/api/` e `docs/contratos/` estão em dia. | Uma linha por métrica no §5, com função, fórmula, segmentação, unidade, mínimo e referência, e os §3 e §4 atualizados. Num commit `docs` antes do B11. | **bloqueia** |
| L3 | `o19`/`t10` (`bloqueios.test.ts`), `t12.test.ts`, `e7.test.ts`, `e9.test.ts` | Faltam bordas mínimas do `praticas.md` §4, que é critério comum da ata: a marcação de critério cruzando o período, em O19, T10, T12, E7 e E9, e o dia 84 dentro e o 85 fora no O19 e no T10 (depois de B3-1). | Um teste por métrica com uma `VersaoCriterio` dentro do período, conferindo `criterios.serie`. No O19 e no T10, a borda 84/85 da janela de percentis. | **bloqueia** |
| L4 | `o24.test.ts:262`, `:266` e `:305`, e os testes "mock" do O21, O25 e E9 | A parcela medida no mock só aparece em `console.info` ou em `docs/api`, sem `expect`. Se o B11 mudar o mock, nada falha. O T12 e o O19 fazem isso certo (`t12.test.ts:219`, `bloqueios.test.ts:249`). | Trocar o `console.info` por asserções de faixa. É o mesmo teste que o B11 vai usar para provar os alvos (ver "Decisão do mock"). | recomendado (entra no B11) |
| L5 | `e7.ts:9`, `o21.ts:126-127` | O mínimo de 20 está repetido como literal ou como constante local. | Importar `MINIMO_AMOSTRA` de `@metricas-dspd/contratos`. | recomendado |

**Aceites de mudança incompatível (política de mudança §5):** nos commits `e9085e7` (E9), `103105d` (O25), `0c18a5b` (O21) e `2a2f837` (O24), o autor usou o aceite e o removeu, e no B3, B4, B6, B7, B9 e B10 fez o mesmo com o enum `metrica` do `VISAO_GERAL`.
- **Ratifico como tech-lead:**
  - os contratos novos ainda não estão publicados, e nenhum consumidor os lê;
  - no `VISAO_GERAL`, o enum `indicadores[].metrica` cresce, mas `visaoGeral.ts` só emite ids literais do núcleo (O1, O2, O10, O12, BLOQUEADOS...). Nenhum valor novo chega à resposta, e o `web` compila com a união maior.
- **Falta a ratificação do architect,** que a política exige junto com a do tech-lead. Fica para o Jarvis encaminhar, sem bloquear.
- No `0e426e3` (O20, `emProgresso` obrigatório), a fotografia foi regravada sem passar pelo `aceitas.json`. A política diz: "só o diff do PR denuncia apagamento manual".
  - O conteúdo está ratificado: o O20 não está publicado, e o campo é acréscimo.
  - **Nota de processo para o node-backend:** daqui em diante, toda mudança incompatível passa pelo aceite de uso único, mesmo em contrato não publicado.

**`CATALOGO_CARTOES` fora dos cartões de cálculo:** a ata pedia a entrada em cada cartão. O autor a adiou porque ela quebra o catálogo e os testes do `web`, e deixou cada entrada pronta em `docs/api/metricas.md`. **Aceito** como decisão do time: as entradas entram no cartão do front, que é quem as renderiza. O B12 confere que as 10 entradas estão listadas.

## B2: O23 no O2 (`75837cd`)
**Veredito: aprovado.**
- Critérios da ata atendidos:
  - `parados` calculado sobre `semMoverHaDiasUteis`, sem tempo apontado;
  - "k de n" sempre, com o percentual só com n ≥ 20;
  - `porEtapa` igual às `etapas` do O2;
  - o campo passou a obrigatório e o teste de `tambem.test.ts` foi invertido (obrigação do B1, suposição 2);
  - os campos antigos do O2 não mudaram.
- Constante única `LIMITE_PARADO_DIAS_UTEIS`, com `VersaoCriterio` v1 (ata item 6 a).
- **Observação para o architect (A8):** `VERSOES_DA_BIBLIOTECA` é um mecanismo pequeno e novo: versões de critério que nascem na biblioteca e se somam às da base em `marcacoesNoPeriodo`. Funciona, e o teste prova que não repete id. Mas a ADR e o `data-model` dizem que "a lista vive na configuração da base". O architect alinha o texto do A8 a isso ou propõe outro lugar. Não bloqueia.
- Efeito colateral a saber: na base real, todo período do O2 que cruzar 2026-10-14 mostra a marcação "v1 do estoque parado", embora o critério do aging do O2 não tenha mudado. É o que a T2.6 pede para critério novo, e no mock não aparece (o "hoje" é 2026-10-09).

## Ajustes do B1 (`6cd7489`)
**Veredito: aprovado.**
- R1: `primeiroObjetoDeLista` desce em qualquer profundidade e afirma `toBeDefined`.
- R2: regex amplo, com os casos novos no teste "a trava não é vacuosa" e `timestamp` como falso positivo testado.
- R3: o lint cita a P-T6 e a ata.
- R4: data corrigida.
- O corpo do commit não explica o porquê. O squash do PR cobre isso.

## B3: O19 e T10 (`69e98e0`)
**Veredito: ajustes necessários.**
- Atendidos:
  - R6: `pctDoTotal` é "k de n" sobre os bloqueios;
  - CA-24: sem fornecedor fica fora;
  - CA-36: sem prazo nem status;
  - CA-11: ordem alfabética;
  - os abertos ficam à parte;
  - a parcela do mock está registrada em teste (`bloqueios.test.ts:249-267`).
- O ajuste do dublê do banco para `numeric(12,2)` é correto e vem explicado.
- As exceções de P2 para O19 e T10 em `regras.property.test.ts` têm motivo nominal e procedem: o motivo e o fornecedor vivem no bloqueio, e não no card.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B3-1 | `o19.ts:28` e `t10.ts:34` | Os percentis usam o **período do filtro** (`estatistica(..., periodo, ...)`), e não a janela móvel de 12 semanas. Com o período de 12 meses, o P50/P85 passa a ser de 12 meses. Isso fere a regra inviolável ("percentis 50/85/95 em janela móvel de 12 semanas") e a regra 10 da especificação ("janela de percentis vem do parâmetro único"). O3, O21, O24 e O25 usam `janelaPercentis(ctx, f, 'story')` e estão certos. | Soma, contagem e `pctDoTotal` seguem no período (são censo). Os percentis passam a vir dos bloqueios encerrados em `janelaPercentis`, e `criterios('O19', periodo, janela, ctx)`. No **T10**, faz-se a mesma correção. A especificação diz "a nota sugere '12 meses' quando faltar amostra", o que dá a entender que a janela acompanha o período. Isso vai ao usuário (ver "Pontos do usuário"). Até a resposta, vale a regra inviolável. | **bloqueia** |
| B3-2 | `bloqueios.ts:28-33` | Um bloqueio que começa antes do fim do período e termina **depois** dele não é encerrado nem aberto no período. Ele some da nota "N bloqueios ainda abertos". Isso só acontece em período passado (custom ou meses fechados). | Contar como aberto no fim do período todo bloqueio com `inicio <= corte` e (`fim === null` ou `fim > corte`). Teste com um bloqueio que atravessa o fim. | recomendado |
| B3-3 | `docs/api/metricas.md` (O19) | A regra provisória do `pctDoTotal` sobre bloqueios está com o usuário (O19-pct). | Nada a fazer até a resposta. Se for sobre dias, o autor volta com a pergunta do mínimo, como já registrado no pedido. | nota |

- **Aceite do VISAO_GERAL:** ratificado, conforme a seção do lote.

## B4: T12 (`f3629a0`)
**Veredito: aprovado**, com 1 ajuste recomendado.
- A D-8 = A está implementada como OU, e a demanda com os dois critérios conta uma vez (teste em `t12.test.ts:123`).
- Áreas por volume, com desempate pelo nome (CA-11).
- R5 testado com várias equipes.
- Mínimo de 20 por área e no total.
- A parcela do mock (0%) e a causa estão provadas em teste. Isso vai ao B11.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B4-1 | `t12.ts:8` | `MOTIVO_IDA_E_VOLTA` é uma `string` solta. Se o domínio `MOTIVOS_BLOQUEIO` renomear o motivo, o T12 passa a dar 0 sem erro de compilação. | Tipar como `MotivoBloqueio` (`const MOTIVO_IDA_E_VOLTA: MotivoBloqueio = ...`). | recomendado |

## B5: E7 e E9 (`04dd94d`, `e9085e7`)
**Veredito: ajustes necessários.**
- Atendidos:
  - no E7, o peso por contagem (D-2), as 4 naturezas por `naturezaDe` do T3, com teste que falha se houver mapeamento próprio (`e7.natureza.test.ts`), `custoConfigurado: false` e os valores em R$ nulos (CA-13);
  - no E9, abertos não iniciados, fora os descartados e os arquivados sem desfecho, faixas fixas, P85 importado do E1 e, depois de `e9085e7`, **por tipo** (regra 7, Q4), com o mínimo em cada tipo.
- **Divergência entre plano e código no E9 (nota do review do B1):** conferi contra a especificação, que pede "idade em dias úteis desde a criação", faixas, "projeto, aprovado em, idade". Quem segue a especificação é o `resultadoE9` do código (`idadeDiasUteis`, `faixa`, `criadoEm`). O `deslizeDiasUteis`/`naData` do plano pertence ao E6. O architect corrige o plano. Sem ajuste de código.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B5-1 | `e7.ts:35` | Para um sistema com menos de 20 entregas e total ≥ 20, `participacao = taxa(e, e)` devolve "e de e" (por exemplo, "12 de 12"). É um "k de n" tautológico, e o front mostraria isso. A especificação pede "k de n" com o n = total ("sistemas com menos de 20 entregas mostram 'k de n'"), mas o `taxaSchema` não aceita `insuficiente` com n ≥ 20. | **Decisão do time (contrato):** `participacao` passa a ser anulável. Fica `taxa(e, total)` quando e ≥ 20 e `null` quando e < 20. O front monta o "k de n" com `entregas` e `total`, que já estão na resposta. Com total < 20, todos os sistemas ficam com `null`, e a regra é uma só. A mudança passa pelo aceite (E7 não publicado), com teste e `docs/api` atualizados. | **bloqueia** |
| B5-2 | `e9.test.ts:199` | O número de projetos abertos no mock (3) só está em `docs/api`. O critério do B5 ("número registrado") e o B11 precisam dele em teste. | Afirmar a contagem e as faixas presentes no teste do mock. O B11 atualiza esses números. | **bloqueia** (junto do L4) |
| B5-3 | `e7.ts:27` | `porSistema.set(..., [...lista, m])` copia a lista a cada item, o que é O(n²) por sistema. | Fazer `push` na lista existente. | recomendado |

## B6: O25 (`ab924c3`, `103105d`)
**Veredito: aprovado**, com 1 ajuste recomendado, decidido pelo time.
- A R-2' = A e a P-1 = A (as duas do usuário) estão na projeção da fase 1, que só `descartado.ts` conhece.
- O excluído entra como descarte.
- O aviso fica fora da taxa.
- Antes do início, o tempo é zero e aparece à parte (D-13, CA-19).
- Percentis na janela, por tipo (`103105d`, regra 7).
- `porMotivo = null` (CA-44).
- `discard_comment` não é lido.
- A série tem `marcacoes`.
- O `descartado()` das outras métricas não mudou, como a ata pedia. Ver a decisão do mock: o B11 o alinha à P-1 = A.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B6-1 | `o25.ts:120` | **O25(c):** o aviso de preenchimento conta todos os cards selecionados, de qualquer data, e ignora o período. A taxa e o aviso falam de populações diferentes, e o número não muda com o filtro de período que o cartão anuncia. | **Decisão do time (consistência de contrato; a regra de negócio da R-2' não muda):** o aviso conta os cards com motivo e sem descarte que **saíram da taxa do período**, isto é, os entregues no período, mais os que estão **abertos no fim do período**. Isso vai num teste com um card de cada tipo, um fora do período, e no `docs/api`. O contrato não muda (`{ itens }`). | recomendado |
| B6-2 | `descartado.ts` (`instanteDoDescarte`) | O ramo `aproximado: true` só é alcançável por `instanteDeExcluido` chamado diretamente: no fluxo do O25, o excluído sempre tem `excluido_em`. Isso está correto para a fase 1. | Nada agora. Na coleta real (fase 3), o teste do O25 precisa exercitar o caminho aproximado de ponta a ponta. | nota |

- **O25(b)** (entregue e depois excluído conta como descarte?) está com o usuário. Não reabro.
- **O25(c), na parte "sai da taxa inteira"**, é a leitura literal da R-2' do usuário. Não reabro.

## B7: O21 (`0c18a5b`)
**Veredito: aprovado**, com 1 ajuste recomendado.
- Matriz por coluna só com uma equipe e um quadro, e por papel nos outros casos (R5, testado inclusive no mock).
- Reabertura marcada e contada.
- O par com × sem vem do ciclo do O3 (`entreguesDe`, sem recálculo), por tipo, com 20 em cada grupo e o grupo que faltou indicado (CA-6).
- A mudança de contrato (`comparacoes[]`, `reaberto`) passou pelo aceite.

| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B7-1 | `o21.ts:48-50` | A cada chamada, o código percorre **todas** as transições da base (`ctx.idx.base.transicoes`), com cópia de lista por item. O índice já tem `transicoesPorCard`. | Ler `ctx.idx.transicoesPorCard.get(id)` filtrando `direcao === 'retorno'`, só para os cards entregues. | recomendado |

## B8: varredura por coluna (`43ae638`)
**Veredito: aprovado.**
- É um `refactor` sem métrica nova.
- A impressão digital do O1 é idêntica em 8 filtros (`varredura.test.ts`).
- O O1 a frio caiu de 31-38 ms para cerca de 10 ms, com os números no commit.
- A chave de memoização leva o quadro, os filtros normalizados e os instantes, como a ata pede.
- Documentação: ver L2.

## B9: O20 (`c443888`, `0e426e3`)
**Veredito: aprovado**, com 1 ponto para a UX.
- Atendidos:
  - faixa por coluna só com uma equipe, e por papel no "Todas" (R5, testado no mock);
  - `mudancasCriterio`;
  - estado vazio;
  - `emProgresso`, que é igual ao WIP do O1 (mesma varredura);
  - C3 a frio de 18 a 24 ms;
  - payload de 1,8 a 2,1 KB gzip.

**Pontos levantados:**
- **O20(c), a janela do destaque:** está **correta**. A especificação diz "entre o início e o fim do período", e as 4 semanas da "Leitura" são só o exemplo. Sem ajuste.
- **O20(b), papel misto conta como execução:** **aceito como decisão do time.**
  - No "Todas", as faixas são os papéis (Backlog, Pronto para, Em execução, Homologação, Entregue), e "Homologação" junta "Aguardando homologação" (fila) com "Em homologação" (execução).
  - Chamar o papel inteiro de fila faria o destaque apontar acúmulo em trabalho que está em execução.
  - O exemplo da especificação ("Aguardando homologação") só existe com uma equipe filtrada, e aí funciona: o mock mostra Fluig de 1 para 5.
  - O comportamento fica documentado em `docs/api`.
- **O Backlog pode ser o destaque:** é interpretação da especificação, e por isso vai para a **UX, dona da especificação**.
  - Para o código, o Backlog é coluna de fila (`tipo_coluna = 'fila'`), e por isso entra.
  - O cartão, porém, pergunta "onde o trabalho está se acumulando?" e manda ler junto com o O1 (WIP), que não conta o Backlog. Um Backlog que cresce tende a ganhar sempre o destaque no "Todas", e aí o destaque não diz nada que o O7 já não diga.
  - **Pergunta à UX:** o destaque considera só as filas a partir do compromisso, sem o Backlog? Se a especificação não decidir, a pergunta vai ao usuário (R-DECISAO).
  - Até a resposta, fica como está e entra em `REGRAS_METRICA.pendencias`. Os alvos do mock (B11) dependem dessa resposta.
- **Fotografia regravada sem `aceitas.json` (`0e426e3`):** ver a seção do lote. O conteúdo está ratificado, com nota de processo.
- **Exceção ao INV-F7 em `filtros.intensivo.test.ts:352-353`:**
  - O código procede: a base do O20 é o pico diário, e o pico respeita max ≤ (a+b) ≤ soma. Só o estado vazio (base 0 quando não há transição no período) quebra a aditividade, e a exceção pula exatamente esse caso.
  - **O teste é do QA:** o `qa-engineer` ratifica ou reescreve a exceção antes da rodada de QA. Um agente não altera o invariante de outro sem aceite.
- O corpo do commit `0e426e3` não explica o porquê. O squash do PR cobre isso.

## B10: O24 (`2a2f837`)
**Veredito: aprovado.**
- Atendidos:
  - grupo `equipe-tipo-padrao` (D-6' = A), com Urgente, Prazo fixo e Intangível fora nos dois papéis (CA-17);
  - custo pela R-1 = A (CA-37);
  - o ultrapassado que ainda não iniciou fica fora;
  - percentis por tipo na janela;
  - `marcacoes`;
  - R5;
  - varredura O(n log n), provada igual à comparação ingênua par a par no mock;
  - C3 a frio de 11 ms.
- **Os 86,5% fora de ordem vêm do mock, e não do cálculo.** Medi no mock padrão (12 semanas, 570 inícios Padrão):
  - 494 fora de ordem;
  - 482 contando como "mais antigo esperando" só quem foi criado até 90 dias antes;
  - 463 contando só quem ainda não iniciou.
  
  A causa não é um item velho esquecido no backlog. O gerador sorteia o início sem relação com a ordem de criação, dentro de cada equipe e tipo. A correção vai ao B11, com o alvo de cerca de 25% da especificação (§8 item 5).
- Asserções no lugar de `console.info`: ver L4.

## Segurança
- Cartão para o `security-engineer` (baixo, disponibilidade): os caches por contexto (`memoSelecao` em `comum.ts`, `memo` e `memoVida` em `varredura.ts`, e o memo do O24, que não depende de filtro) têm chave formada pelos filtros da requisição, inclusive o período custom, e não têm teto. O padrão já existia no `selecionar`, e o B8 e o B9 o estenderam. Com a API aberta à rede interna, uma sequência de períodos custom diferentes faz a memória crescer até o contexto ser trocado. Sugestão para avaliação: um teto LRU por contexto. Não bloqueia o lote.
- Nenhum campo de pessoa, equipe nomeada ou texto livre novo na saída. O título do projeto no E9 já foi aprovado no B1.

---

# Decisão do mock (tech-lead, 2026-10-15)

**Decisão:** o **B11 vem antes do front e antes do QA do back**. Ele passa a ter duas partes:
- **B11a:** o mock da fase 1 nos estados da especificação.
- **B11b:** a extensão `ExtensaoTambemBM` e o T11, como na ata.

A ordem é:
1. ajustes que bloqueiam (L1 a L3, B3-1, B5-1, B5-2);
2. resposta da UX sobre o Backlog no O20;
3. B11a;
4. B11b;
5. B12;
6. QA.

**Por quê:** com a base atual, o QA e o front não veem estados que a especificação exige:
- T12 com 0% de ida e volta;
- O21 com 1,4% de retorno e só reaberturas;
- O25 com 4,7% de descarte e a proporção antes/depois invertida;
- E9 com 3 projetos;
- O24 com 86,5% fora de ordem;
- O20 sem destaque no "Todas".

Testar só com fixture prova o cálculo, mas não a tela.

**O que muda em relação à ata (P-T3, que é decisão minha):** a base do BusinessMap **muda** no B11a, e só nele. A extensão separada (P-T4) continua para o T11. Os hashes `924448d4` e `b2bfd4c0` mudam uma vez, de forma consciente. A ata dizia "a base não muda" para proteger as outras frentes, e os critérios abaixo dão essa proteção de outro modo.

## Critérios do B11a (para o `node-backend`)
1. **Acelerato intacto:** um teste novo grava hoje `hashJson(base.ac)`, nas escalas 1 e 0,2, e afirma que o B11a não o muda. A Sustentação (worktree `-sust`) não pode ser afetada.
2. **Streams próprias:** cada comportamento novo vem de um pós-processamento determinístico, com `derivar(semente, 'businessmap/tambem:<campo>')`. As streams que já existem (`businessmap`, `/projetos`, `/orfaos`, `/bugs`, `/bloqueios`) não ganham nem perdem sorteios. Os cards que nenhum ajuste toca saem idênticos.
3. **Preservar o que não é alvo:** o retorno é inserido **dentro** do intervalo de execução do card, sem mudar `iniciado_em` nem a entrega. Assim O3, O4 e T1 não mudam por causa do O21. A reordenação do O24 troca instantes de início só dentro do mesmo grupo (quadro, Padrão, tipo).
4. **P-1 = A no mock:** o card de aviso do O25 (motivo sem descarte) faz `descartado()` (Q6) e `descartadoNativo` (R-2') divergirem.
   - Como o usuário decidiu que a R-2' vale em todas as métricas (P-1 = A, 21:15), `descartado()` passa a usar a definição nativa.
   - Junto, entra uma `VersaoCriterio` datada que afeta as métricas que usam `descartado()` (T2.6, como a P-1 pede).
   - Um teste prova que, sem o card de aviso, nenhum valor muda.
5. **Rebaseline num commit só:**
   - hashes novos em `mock.test.ts`, `complementares.test.ts`, `pesquisa.test.ts` e `coletas.test.ts`;
   - fotografias de valores, testes de `server`, `web` e E2E que fixam números do BusinessMap.
   
   O corpo do commit lista cada valor que mudou (antes e depois). **Nenhum limite de teste é afrouxado.** Fixture que prova uma regra não muda.
6. **Orçamento:** gerador < 1,5 s no CI (C2) e C1 sem regressão, com o número antes e depois no commit.
7. **Cada alvo vira asserção de faixa** no teste "mock" da métrica (L4), e não `console.info`.
8. Nada de pessoa nova. Story, frente e projeto continuam separados. Arquivados e excluídos ficam na base.

## Alvos por métrica
Medidos com `gerarBaseMock()` (escala 1, "hoje" 2026-10-09), filtro "Todas" e período de 12 semanas, salvo indicação. Onde o mock já atende, o B11a só grava a asserção.

| Métrica | Alvo | Hoje |
|---|---|---|
| **O19** | ≥ 120 encerrados. **Pelo menos 1 motivo com ≥ 20 e pelo menos 2 com < 20**, para mostrar o "— amostra insuficiente" na tabela. 3 a 5 abertos | 223 encerrados, todos os motivos ≥ 25, 4 abertos |
| **T10** | 40 a 70 bloqueios com fornecedor em 3 a 4 fornecedores, pelo menos 1 com ≥ 20 e pelo menos 1 com < 20 | já atende (Alfa 19, Beta 23, Gama 26): só a asserção |
| **O23** | 20% a 30% do WIP parado há mais de 5 dias úteis, com n ≥ 20 (percentual publicado) | medir e afirmar; ajustar só se sair da faixa |
| **T12** | Ida e volta de 10% a 25% no total. Pelo menos 1 área com n ≥ 20 e k > 0 (percentual publicado). **2 áreas com < 20 demandas.** Pelo menos 5 demandas pelo critério (a) e pelo menos 5 pelo (b), com pelo menos 1 nos dois | 0%, 8 áreas, todas ≥ 20 |
| **O21** | 20% a 30% das entregas com retorno. Pelo menos 60% dos retornos que não são reabertura em "Em teste → Em desenvolvimento" e "Em homologação → Em desenvolvimento" (ou nas colunas equivalentes do mock). Reaberturas entre 2 e 10. Par com × sem: **pelo menos 1 tipo publica** (os dois grupos ≥ 20 na janela) e **pelo menos 1 tipo com `grupoAbaixoDoMinimo`** | 1,4%, só reaberturas, nenhum tipo publica |
| **O20** | Com uma equipe (Fluig): destaque não nulo numa fila, "Aguardando homologação" ou equivalente, que cresce **≥ +5 itens** no período. No "Todas": destaque não nulo numa fila que respeite a resposta da UX sobre o Backlog (se o Backlog sair, é "Pronto para" que cresce). Pelo menos 1 combinação de filtros do mock com "Nenhuma etapa acumulou" (`destaque = null` e faixas presentes) | 12 meses com uma equipe: Fluig de 1 para 5; no "Todas", o destaque vem do Backlog |
| **O24** | **20% a 30%** dos inícios Padrão fora de ordem. Custo: **pelo menos 1 tipo publica** (≥ 20 ultrapassados na janela) e pelo menos 1 tipo `insuficiente`. As classes Urgente, Prazo fixo e Intangível continuam presentes | 86,5% |
| **O25** | **6% a 10%** dos encerrados descartados, com cerca de 2/3 antes do início e 1/3 depois (aceito de 55% a 75% antes). **Pelo menos 1 card com motivo e sem descarte** no período (aviso ≥ 1). Pelo menos 1 excluído no período. Nenhum tipo com ≥ 20 descartados depois do início em 12 semanas: o estado normal da especificação é a soma com contagem, sem percentil | 4,66%, 8 antes e 23 depois, aviso 0 |
| **E9** | **6 a 8** projetos aprovados e não iniciados, **pelo menos 1 acima de 180 dias úteis** e pelo menos 1 em cada faixa. Referência `insuficiente` (menos de 20 concluídos por tipo, variante `lenta`) | 3 projetos, nenhum acima de 90 |
| **E7** | Sem mudança na fase 1: já há sistemas com ≥ 20 e com < 20, e não há R$. Os 18 a 20 sistemas da especificação ficam para a fase 2, junto do E8, que precisa deles | 8 sistemas (3 abaixo de 20) |
| **T11** (B11b) | Como na ata: 24 meses fechados mais o corrente, picos em janeiro e julho, mês corrente parcial, hash próprio e base intacta | sem extensão |

**Critério de reversão:** se o rebaseline atingir mais de cerca de 40 arquivos fora de `packages/mock` e `packages/metricas`, ou se o C2 passar de 1,5 s, o B11a para e volta ao tech-lead. A alternativa nesse caso é um cenário de mock separado (`gerarBaseMock({ cenario: 'tambem' })`), servido só com uma variável de ambiente no `homolog:subir`.

# Pontos do usuário × pontos do time

**Já com o usuário (não reabro):**
- O19-pct: o percentual é sobre bloqueios ou sobre dias. Hoje é provisório, sobre bloqueios.
- O25(b): o card entregue e depois excluído conta como descarte?

**Novo, para o usuário (R-DECISAO):**
- **T10, janela dos percentis:** a especificação diz "o período padrão do cartão é o do painel, e a nota sugere '12 meses' quando faltar amostra", o que dá a entender que o P50/P85 acompanha o período. A regra inviolável fixa os percentis em janela móvel de 12 semanas.
  - (A) O T10 segue a regra geral: janela de 12 semanas, e a nota deixa de sugerir 12 meses.
  - (B) O T10 é exceção registrada: janela própria de 12 meses para fornecedor, num parâmetro único (como as janelas por granularidade).
  - Até a resposta, vale (A) (B3-1).

**Para a UX, dona da especificação (se o documento não decidir, vai ao usuário):**
- O20: o Backlog pode ser o destaque no "Todas", ou só as filas a partir do compromisso?

**Para o QA:**
- Ratificar ou reescrever a exceção do INV-F7 do O20 em `filtros.intensivo.test.ts`.

**Para o architect:**
- Ratificar os aceites incompatíveis do lote.
- Alinhar o A8 a `VERSOES_DA_BIBLIOTECA`.
- Corrigir o E9 do plano (o `deslize`/`naData` é do E6).

**Decididos pelo time neste review:**
- B5-1: `participacao` do E7 anulável.
- B6-1: o aviso do O25 segue o período.
- O20(b): o papel misto conta como execução.
- O20(c): a janela do destaque é o período.
- `CATALOGO_CARTOES` entra no front.
- Ratificação dos aceites pelo tech-lead.
- Decisão do mock: B11a antes do front e do QA, com a P-T3 revista.

---

# Lote volta 2 (B2 a B10, ajustes do review)

**Escopo:** `2a2f837..08ae389`, 12 commits: `d3ba9bc` (L1), `2acd4c8` (B3-1, B3-2, L3), `4a74dce` e `929b528` (B5-1, B5-3, L5), `f177281` (B5-2, L3), `fa1e8b3` (L3), `ebf87e6` (B6-1), `041c73b` (B7-1, B4-1, L5), `55bfb69` (L2), `21c4e1e` (formatação), `324fedc` (cobertura) e `08ae389` (T10). São 22 arquivos, com 512 linhas a mais e 229 a menos.
**Veredito:** **aprovado.** Os 6 ajustes que bloqueavam estão resolvidos, e os recomendados também. Só o L4 ficou para o B11a, como combinado.

## Ferramentas (citadas, não refeitas)
- Pronto da branch: ver "Ferramentas" do B11a, mais abaixo. A rodada vale para os dois trechos, porque o HEAD contém os dois.

## Bloqueantes
| # | Situação |
|---|---|
| L1 | ok. `varredura.test.ts` virou `it.each(IDS_FLUXO)`, com um caso por id e um timeout explícito de 30 s, comentado (`praticas.md` §4). A falha agora aponta a métrica. |
| L2 | ok. `docs/tecnica/biblioteca-de-calculo.md` traz o catálogo de 42 métricas (§5), com uma linha por métrica nova e o bloco O23 no O2. Também foram atualizados o §3.6 (`descartadoNativo`, `motivoSemDescarte`, `instanteDoDescarte`), o §3.8 (`VERSOES_DA_BIBLIOTECA`, `LIMITE_PARADO_DIAS_UTEIS`), o §3.10.1 (varreduras do B8) e o §4 (exceções de P2 e P4). **O B11a deixou o §3.6 e o §3.8 desatualizados de novo:** ver B11a-2. |
| L3 | ok. O19 e T10 ganharam o corte 84/85 da janela de percentis, e O19, T10, T12, E7 e E9 ganharam a marcação de critério cruzando o período (`criterios.serie` e `criterios.janela`). |
| B3-1 | ok. O19 e T10 tiram os percentis de `janelaPercentis`, enquanto soma, contagem e `pctDoTotal` seguem no período, e `criterios(..., periodo, janela)` está certo. A exceção nominal do T10 em P4 tem motivo, e a fronteira está provada em `bloqueios.test.ts`. Até o usuário responder o T10-janela, vale a opção (A). |
| B5-1 | ok. `participacao` é `taxaSchema.nullable()`: fica nula abaixo de 20 entregas e é `taxa(e, total)` a partir de 20. Há testes para a fronteira 19/20 e para o total abaixo de 20, e `docs/api`, `docs/contratos` e a fotografia foram regerados. |
| B5-2 | ok. A contagem e as faixas do E9 no mock estão afirmadas em teste. O B11a atualizou esses números (7 projetos). |

## Recomendados
- **B3-2:** ok. Um bloqueio que atravessa o fim do período conta como aberto e tem teste.
- **B6-1:** ok. O aviso do O25 fala da mesma população da taxa (entregues no período e abertos no fim dele) e tem teste.
- **L5:** ok. `MINIMO_AMOSTRA` vale em E7 e O21.
- **B7-1:** ok. O O21 lê `transicoesPorCard`.
- **B4-1:** ok. O `MOTIVO_IDA_E_VOLTA` é tipado como `MotivoBloqueio`.
- Nota em `o21.ts:54`: `as readonly FatoTransicao[]` é um escape de tipo, mas o comentário explica (quem tem entrega tem transições). Aceito.
- **L4:** entrou no B11a, como combinado.

## Segurança
- Nada novo. O cartão de teto LRU dos caches continua com o `security-engineer`.

---

# B11a: mock da fase 1 (`1f4d90e`)

**Escopo:** 56 arquivos, com 1.243 linhas a mais e 469 a menos.
- Código novo: `packages/mock/src/businessmap/tambem.ts`, com 8 passos e cada um na sua stream.
- Mudanças em código existente: o gancho em `gerador.ts`, `descartado()` na definição nativa e `VERSAO_CRITERIO_DESCARTE_NATIVO` em `core/criterios.ts`.
- Rebaseline: hashes, O1 e `docs/contratos` regerado.

**Veredito:** **ajustes necessários**, com 3 bloqueantes, todos pequenos e todos com o `node-backend`.
- A técnica está certa e os critérios 1, 2, 4, 5, 7 e 8 foram atendidos.
- Os alvos de O19, T10, T12, O21, O24, O25 e E9 estão dentro da faixa e viraram asserção.
- O que bloqueia é o O23 fora da faixa, a documentação desatualizada pelo próprio B11a e a medição do C1, que o critério 6 exigia.

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto`, rodado pelo tech-lead no HEAD `cf12b90`, que é o `1f4d90e` mais o commit do plano: **EXIT=0**. Passaram:
  - lint e `format:check`;
  - `contratos` (115 testes), `mock` (180) e `metricas` (808, cobertura de 100%);
  - `server`, com 446 testes passando e 64 pulados: são os `*.pg.test.ts`, com `describe.skipIf(!url)`, porque não há PostgreSQL na estação;
  - `web` (838 testes, mais build e size);
  - `homolog`, `spec-check` e `pesquisa`;
  - `docs-contratos`, com `docs:check` ok (407 páginas, 60 métricas).
  
  Não houve timeout no `web` nem no `metricas`: o L1 resolveu a disputa de CPU.
- O `pnpm run e2e` não faz parte do pronto e não foi rodado nesta rodada (ver B11a-4).

## Critérios do B11a
| # | Critério | Situação |
|---|---|---|
| 1 | Acelerato intacto | ok. `tambem.test.ts` fixa `hashJson(base.ac)` nas escalas 1 (`0113e077`) e 0,2 (`39b4b005`). |
| 2 | Streams próprias | ok. Cada passo usa `derivar(semente, 'businessmap/tambem:<campo>')`, e `tambem: false` ou `omitir: PASSOS_TAMBEM` devolvem o hash anterior do BusinessMap (`f780e90f`). Cada passo é independente e determinístico. "Os cards que nenhum ajuste toca saem idênticos" está provado só como "mais de 40% idênticos", porque o passo `ordem` toca todo o Padrão. Aceito. |
| 3 | Preservar o que não é alvo | ok no O21. O retorno entra dentro do intervalo de execução, e o O3, o O4 e o T1 (total, fila e espera) ficam iguais com e sem o passo, o que está provado em teste. **No O24 houve um desvio aceito.** Em vez de trocar os instantes de **início**, o passo `ordem` permuta o `criado_em` dentro do grupo (quadro e tipo, só Padrão). O início, a entrega e o ciclo (O3, O4) ficam intactos, e muda o lead time por card. Isso preserva melhor as métricas centrais do que o que eu tinha pedido. O que não é Padrão não muda, e isso está provado em teste. Ver B11a-5. |
| 4 | P-1 = A no mock | ok. Ver "Decisões técnicas pedidas pelo autor" abaixo. Há 3 cards de aviso em que `descartado()` e o legado divergem, sem o passo `aviso` as duas definições coincidem em todo card, e os cards de aviso seguem ativos. |
| 5 | Rebaseline num commit | ok. Os hashes (BM+AC `924448d4` → `b9645d93`, escala 0,2 `b2bfd4c0` → `4a7c9719`, extensões `fbddcf28` → `27659a0a`) e a impressão digital do O1 foram regravados. Nenhum limite foi afrouxado e nenhuma fixture de regra mudou. São 37 arquivos fora de `packages/mock` e `packages/metricas` (35 em `docs/contratos`, regerados, e 2 testes do `web`), abaixo do teto de cerca de 40 do critério de reversão. O corpo do commit lista os alvos e o EI_FL1, mas não O3, O4, O5, O9, T5 e as demais métricas cujo exemplo mudou em `docs/contratos` (ver B11a-5). |
| 6 | Orçamento | **C2 ok:** 175 → 196 ms, contra o limite de 1.500 ms. **C1 não foi medido** (ver B11a-3). |
| 7 | Alvos como asserção (L4) | ok em O19, T10, T12, O21, O24, O25, E9 e O20. Os `console.info` saíram. **Falta o O23** (ver B11a-1). |
| 8 | Nada de pessoa nova; níveis separados; histórico preservado | ok. `usuario` e `responsaveis` vêm de `pseudonimo()`, o mesmo catálogo fictício do gerador, e o lint impede a leitura nas métricas. Os projetos novos são `granularidade: 'projeto'`, sem mistura com story. O descarte arquiva e exclui sem remover o card. O passo `descarte` remove transições e bloqueios **gerados** do card convertido, o que é coerente para um mock (não é carga incremental). |

## Valores medidos (Todas, 12 semanas), conferidos contra os alvos
| Métrica | Medido | Alvo | Situação |
|---|---|---|---|
| O24 | 23,4%; Melhoria publica o custo, Incidente e Requisição `insuficiente` | 20 a 30%, ≥ 1 tipo publica e ≥ 1 insuficiente | ok (12 semanas e 12 meses) |
| O21 | 23,3%; Melhoria publica o par | 20 a 30%, ≥ 60% teste/homologação → desenvolvimento, reaberturas de 2 a 10, ≥ 1 tipo publica e ≥ 1 abaixo | ok |
| T12 | 16,9%; Logística e RH abaixo de 20 | 10 a 25%, 2 áreas abaixo de 20, (a) e (b) | ok |
| O25 | 9,2%; 62% antes do início; aviso 3 | 6 a 10%, 55 a 75% antes, aviso ≥ 1, excluído no período, nenhum tipo com ≥ 20 depois | ok |
| E9 | 7 projetos, 2 acima de 180 | 6 a 8, ≥ 1 acima de 180, todas as faixas, referência `insuficiente` | ok |
| O19 | 318 encerrados, 2 motivos abaixo de 20 | ≥ 120, ≥ 1 com ≥ 20 e ≥ 2 abaixo, de 3 a 5 abertos | ok |
| T10 | Alfa 17, Beta 20, Gama 26 | 40 a 70, ≥ 1 com ≥ 20 e ≥ 1 abaixo | ok. Beta está exatamente em 20: o T10 fica sensível a qualquer mudança futura do mock, mas a asserção de faixa protege |
| O20 | destaque em 5 de 6 equipes e no Todas (Backlog) | com uma equipe, ≥ +5 numa fila; no Todas, conforme a resposta sobre o Backlog; ≥ 1 sem destaque | ok dentro do que não depende do usuário. `destaqueDoTodasAceito` aceita Backlog ou "Pronto para" e não decide o O20-destaque. A função isolada facilita trocar depois. O teste afirma crescimento maior que 0 com uma equipe; o alvo era ≥ +5 (B11a-8) |
| O23 | **6,7%** | 20 a 30% (especificação §8, item 4) | **fora da faixa** (B11a-1) |

## Ajustes
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B11a-1 | `packages/mock/src/businessmap/tambem.ts` (passo novo) e `o23.test.ts` | O O23 está em 6,7%, fora do alvo de 20 a 30%. O alvo **não é meu:** vem da especificação de UX §8, item 4 ("Parados no WIP: 20% a 30% do WIP com `semMover` acima de 5 dias úteis"), e eu só o transcrevi na tabela de alvos. O plano do architect ("medir, sem mexer na base") foi superado pela decisão do mock. Sem o ajuste, o QA e o front não veem o estado normal do bloco O23. É provável que o passo `ida-e-volta`, que insere movimento em "Pronto para desenvolver", tenha baixado a parcela. | Um passo `parados`, com stream própria (`businessmap/tambem:parados`), que recua para mais de 5 dias úteis antes do "hoje" a **última** transição de uma fração dos cards em WIP, sempre depois da transição anterior e sem mudar o início nem a coluna atual. A asserção de faixa (20 a 30%, n ≥ 20, percentual publicado) vai para o teste "mock" do O2/O23. Se o passo mudar outro alvo, a asserção dele avisa. Se não houver como chegar à faixa sem mexer no início, o autor volta ao tech-lead antes de afrouxar. | **bloqueia** |
| B11a-2 | `docs/tecnica/biblioteca-de-calculo.md:124`, `:127` e `:135`; `docs/api/metricas.md:153`, `:162`, `:181`, `:189`, `:200` e `:201` | O B11a deixou desatualizados os textos que o L2 tinha acabado de alinhar. O §3.6 ainda diz "Única definição (Q6): `descartado(card) = card.motivo_descarte !== null`" e "o `descartado()` não mudou... até o B11a". O §3.8 diz "hoje só `VERSAO_CRITERIO_PARADOS_V1`". Os blocos "Mock (base não muda)" de T12, E7/E9, O24, O21 e O25 em `docs/api` trazem os números antigos (0%, 3 projetos, 86,5%, 1,4%, 4,66%) e dizem que "`descartado()` não foi alterado". Isso fere o `praticas.md` §7.7 e o §8.10. | Atualizar o §3.6 (definição nativa como a única; Q6 substituída pela P-1 = A, com a versão `criterio-2026-10-15-descarte-nativo`), o §3.8 (as duas versões da biblioteca) e a descrição do mock (passo `tambem`). Em `docs/api`, trocar "Mock (base não muda)" pelos valores do B11a e remover as notas de "decisão do tech-lead (B11)". | **bloqueia** |
| B11a-3 | corpo do commit de ajuste | O critério 6 pedia o C1 sem regressão, com o número antes e depois. Só o C2 foi informado. A base ganhou 4 projetos e cerca de 25% mais transições nas entregas. | Medir o C1 (ADR 0003) em `1f4d90e^` e no HEAD, e registrar no commit de ajuste. Se passar do orçamento, volta ao tech-lead. | **bloqueia** (só medição) |
| B11a-4 | `e2e/` | O critério 5 incluía o E2E que fixa números do BusinessMap. Nenhum arquivo de `e2e/` mudou, e o E2E não está no pronto. | Rodar `pnpm run e2e` (ou pelo menos os specs dos painéis do fluxo) e registrar o resultado no cartão. Se algum número fixo do BusinessMap falhar, rebaseline consciente, sem afrouxar. | recomendado (vira bloqueante na entrada do QA) |
| B11a-5 | corpo do commit `1f4d90e` | Falta registrar o desvio do critério 3 no O24 (`criado_em` permutado, e não o início, o que muda o lead time por card) e as métricas fora dos alvos que mudaram de exemplo (O3, O4, O5, O9, T5 e outras, em `docs/contratos`). | Registrar as duas coisas na descrição do PR de squash, em "riscos e mudanças de comportamento do mock". Não é preciso reescrever o commit. | recomendado |
| B11a-6 | `tambem.ts:224-230` | O passo `ordem` muda o `criado_em` da story sem olhar subtarefas e bugs filhos. Uma subtarefa pode ficar "criada antes do pai". O teste de coerência só olha o próprio card. Nenhuma métrica atual depende disso. | Limitar o novo `criado_em` ao da primeira subtarefa ou bug do card, ou acrescentar o caso ao teste de coerência. | recomendado |
| B11a-7 | `core/criterios.ts:29-80` | O `afeta` da versão do descarte nativo é uma lista feita à mão das 44 ids BusinessMap. Uma id nova (T11 no B11b, T14) pode ficar de fora sem que nada falhe. | Um teste: `afeta` é igual a `METRICA_IDS.filter(fonte === 'businessmap')`, menos as ids nascidas depois de 2026-10-15, listadas nominalmente. Outra opção é derivar o `afeta` dessa lista. | recomendado |
| B11a-8 | `o20.test.ts` (teste B11a) | Com uma equipe, o teste afirma crescimento maior que 0, mas o alvo era uma fila que cresce ≥ +5 itens. | Afirmar que pelo menos uma equipe tem destaque com `para - de >= 5`. | recomendado |

## Decisões técnicas pedidas pelo autor
**O23 (alvo de 20 a 30%):** o alvo é da especificação (UX §8, item 4), e não meu. Vale, e o mock deve ser ajustado (B11a-1).

**`VersaoCriterio` do descarte nativo (`criterio-2026-10-15-descarte-nativo`, data 2026-10-15, 44 métricas): está alinhada com a P-1 = A.**
- **Conteúdo:** a P-1 = A diz que a R-2' vale em todas as métricas e que a mudança se registra com data (T2.6). `descartado()` passou a ser `descartadoNativo()`. O `afeta` cobre as 44 ids BusinessMap, que são exatamente as que `fonteDaMetrica` classifica como `businessmap`, e nenhuma do Acelerato nem da pesquisa (o O17 é Acelerato e está fora, corretamente).
- **Uso de `descartado()` nas métricas:** ele entra nas métricas pelo `MarcosCard.ativo` e pelo `selecionar`, então todas são alcançadas. Por isso marcar as 44 é o certo, e não uma lista menor.
- **`VISAO_GERAL`:** não emite `criterios` e não precisa da marcação.
- **Data:** segue a convenção da `VERSAO_CRITERIO_PARADOS_V1` (data do commit que muda o cálculo, 2026-10-14 no B2). A decisão do usuário foi tomada em 2026-10-14, às 21:15, mas a regra vale a partir do código que a aplica, e não da decisão. Mantenho 2026-10-15.
- **Na base real:** a marcação aparece em todo período que cruza 2026-10-15, como a T2.6 pede. No mock ela não aparece, porque o "hoje" é 2026-10-09.
- **Divergência registrada:** o pedido dizia "só afeta `descartado.ts` na coleta real". Antecipar a troca para o mock foi decisão minha (critério 4 da decisão do mock), para o QA ver os dois estados. Não há divergência de regra.
- **Pendência:** o `afeta` feito à mão (B11a-7).

## Segurança
- Nenhum campo de pessoa nem texto livre novo na saída. Os títulos dos projetos novos vêm de `tituloFicticio`, e o título do projeto no E9 já foi aprovado no B1.

## Commits
- `cf12b90` `docs(011): aceites de contrato, A8 e E9 (architect)`: commitado pelo tech-lead, a pedido, com o plano que o architect editou (aceites ratificados, A8 alinhado a `VERSOES_DA_BIBLIOTECA`, E9 corrigido). Com isso, as pendências do architect do review anterior (aceites, A8, E9) estão fechadas.
- **Para o architect, sem bloquear:** o plano ainda diz "Mock: a base atual... sem mexer na base" no O23 e "a extensão **não** cria projeto" no E9. Os dois foram superados pela decisão do mock (B11a). Alinhar o texto.

# O que faltava depois do B11a (superado pela seção seguinte)
- **Para o QA do back:**
  - B11a-1, B11a-2 e B11a-3 resolvidos, com re-review curto meu;
  - pronto com EXIT 0;
  - E2E rodado (B11a-4);
  - ratificação do QA à exceção do INV-F7 do O20.
  - O20-destaque, T10-janela, O19-pct e O25(b) continuam com o usuário. O QA pode testar com a regra provisória de cada um, mas não fecha esses pontos.
- **B11b** (`ExtensaoTambemBM` e T11): pode começar já, em paralelo ao ajuste do B11a, porque usa uma extensão separada, com hash próprio, e não depende do O23. Se o T11 usar `descartado()`, entra no `afeta` da versão do descarte (B11a-7).
- **B12:** a emenda C4 da ADR 0003 já está na `develop` (#74, `f8e3236`), mas **ainda não está na branch**, que está 4 commits atrás de `origin/develop`. Antes do review final, a branch precisa de um merge de `origin/develop`. O B12 entra depois do B11b e do QA do back, e cobre a branch inteira: as 10 entradas do `CATALOGO_CARTOES`, o pronto, o E2E e o orçamento C1 a C4. **Correção (volta 2):** o #74 trouxe o orçamento móvel da ADR 0003, e não uma emenda do C4. Depois do merge, o C4 da ADR continua "< 300 ms por painel", sem os cartões do 011; a emenda continua com o architect (ver a seção seguinte).

---

# B11a volta 2 + decisões 2026-10-16

**Escopo:** `cf12b90..83796d9`, 6 commits, e o merge de `origin/develop`:
- B11a-ajustes: `ba57836` (B11a-1, 6, 7 e 8), `d3998f3` (B11a-2 e 5) e `a310864` (B11a-4);
- decisões do usuário de 2026-10-16: `29b762f` (O20-destaque = A), `9c0264f` (O25(b) = B) e `83796d9` (O19-pct = B);
- `a212d12`: merge de `origin/develop` (#74, K-084 #77, K-085 #80, #83 e #84), feito por mim, sem force.

**Veredito:** **aprovado.**
- Os 3 bloqueantes do B11a estão resolvidos. O B11a-1 tem um desvio, que aceito abaixo.
- Os 5 recomendados (B11a-4 a 8) também estão resolvidos.
- As 3 decisões do usuário estão implementadas como foram decididas, cada uma com `VersaoCriterio` datada (T2.6) e teste. A T10-janela = A já era o que estava implementado.
- Ficam 2 ajustes recomendados (V2-1 e V2-2), que não bloqueiam.
- Dois testes que são do QA (EI-03 e INV-F7) têm decisão abaixo. Eles bloqueiam o parecer do QA, não o back.

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` no HEAD `a212d12` (depois do merge), rodado pelo tech-lead: **EXIT=0**.
  - lint e `format:check`;
  - `contratos` (115 testes), `mock` (180) e `metricas` (815, cobertura de 100%);
  - `server`, com 512 testes passando e 83 pulados (os `*.pg.test.ts`, cobertos pela rodada abaixo);
  - `web` (838 testes, mais build e size);
  - `homolog` (73), `spec-check` (14) e `pesquisa` (33);
  - `docs-contratos` (102), com `docs:check` ok (422 páginas, 60 métricas, 2 eventos).
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run test:pg` no mesmo HEAD: **EXIT=0**, com 15 arquivos e 83 testes, inclusive `guarda-api.pg.test.ts` (a guarda do K-085: toda `agg_`/`ref_` classificada, com o privilégio verificado no banco migrado) e `papeis.pg.test.ts` (GRANT por coluna).
  - A branch não cria tabela nem migração: o diff `cdb5f8a..HEAD` não toca `server/src/plataforma/db` nem as migrações. Por isso a guarda não precisou de classificação nova, e passou sobre a base que veio da `develop`.
- E2E: o autor rodou o completo no `a310864`, com 603 de 609 testes passando. As 5 falhas eram timeout por carga e passaram isoladas, com 1 worker. O EI-03 é tratado abaixo. Eu não rodei o E2E de novo, porque ele não está no pronto. Ele fica com o QA, na rodada dele.

## Merge de `origin/develop` (`a212d12`)
- **Um conflito só, no desenho do 011** (`docs/architecture/features/metricas-tambem-disponiveis.md`). Os dois lados reescreveram 4 trechos:
  - **T2.6:** fica o texto da branch (A8 ajustado: `VERSOES_DA_BIBLIOTECA`, `LIMITE_PARADO_DIAS_UTEIS`), mais a frase da `develop` "todo DTO de série devolve `marcacoes`".
  - **Métricas proibidas:** fica o texto da `develop`, com o R$ do E7 pela D-1' = A, que é a decisão vigente.
  - **O21:** fica o contrato da branch, por tipo (B7).
  - **O23:** fica a linha da branch sobre a constante, mais o "por que não um parâmetro versionado" da `develop`. O contrato é o da `develop`, `{ limiteDiasUteis, taxa: taxaSchema, porEtapa }`, que é o que `paradosSchema` implementa.
  - **O24:** fica o contrato por tipo da branch (B10), com `inicios: taxaSchema`, como no código (`tambem.ts:132`), e a nota A9 da `develop`.
- **`grants.ts`, `data-model.md` e `docs/contratos/fontes.md`:** mudaram só na `develop`, porque a branch não os toca, e o merge foi automático. O pronto (`docs:check`) e o `test:pg` passaram depois do merge.

## B11a: ajustes
| # | Situação |
|---|---|
| B11a-1 | ok, **com desvio aceito**. O O23 ficou em 28,1% (25 de 89), afirmado em `o23.test.ts` (20 a 30%, n ≥ 20, percentual publicado). Ver o ponto 1 abaixo. |
| B11a-2 | ok. O §3.6 e o §3.8 da técnica e os blocos de mock de `docs/api` estão com os valores do B11a. |
| B11a-3 | ok. C1 de 318 para 294 ms (melhor de 12, com a máquina disputada) e C2 de 195 ms, os dois no corpo do `ba57836`. Sem regressão. |
| B11a-4 | ok. O E2E foi rodado e o resultado está no corpo do `a310864`. O EI-03 está no ponto 2 abaixo. |
| B11a-5 | ok. `d3998f3` registra em `docs/api` o desvio do O24 (`criado_em` permutado, lead time muda). A descrição do PR continua devendo a seção "riscos e mudanças de comportamento do mock". |
| B11a-6 | ok. O novo `criado_em` fica limitado ao do primeiro filho (subtarefa ou bug), e o teste de coerência cobre pai × filho. |
| B11a-7 | ok. O `afeta` passou a ser derivado de `METRICA_IDS` por fonte, menos `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, que é nominal e hoje está vazia. Um teste compara as duas listas e afirma 44 ids. |
| B11a-8 | ok. O teste do O20 exige uma equipe com destaque de pelo menos +5. |

## Decisões do usuário de 2026-10-16
- **O20-destaque = A** (`29b762f`): `o20.ts` tira o papel `backlog` do destaque e mantém o Backlog como faixa.
  - Entra a versão `criterio-2026-10-16-o20-destaque-sem-backlog`, que afeta só o O20.
  - No mock, o "Todas" passa a destacar o compromisso (de 8 para 13). ok.
- **O25(b) = B** (`9c0264f`): `entregueAntesDeExcluir` fica em `descartado.ts`, que é o único arquivo autorizado a ler os campos.
  - O índice ganhou `MarcosCard.excluido`, que substitui a leitura direta de `excluido_em` em O1, O10, O11 e O24. Fora de `descartado.ts` e `indice.ts`, nenhuma métrica lê mais `excluido_em` (conferi com grep).
  - A regra usa a **entrega vigente**: o card reaberto e depois excluído continua sendo descarte. Isso não é inferência nova. É a mesma definição de "entregue" que a vazão e o ciclo já usam, e é nelas que o usuário mandou o card continuar.
  - Entra a versão `criterio-2026-10-16-excluido-entregue`. ok.
- **O19-pct = B** (`83796d9`): `pctDiasUteis` fica na biblioteca (`core/estatistica`), com o mínimo de 20 sobre os **bloqueios** da causa, como o usuário decidiu.
  - O contrato `pctDiasUteisSchema` segue o padrão do `taxaSchema`.
  - A mudança incompatível passou pelo aceite de uso único, que foi removido em seguida.
  - Entra a versão `criterio-2026-10-16-o19-pct-em-dias-uteis`, que afeta o O19. ok.
  - Observação sem ajuste: o percentual é calculado sobre os dias já arredondados (`r2`). O erro fica abaixo de 0,005 dia por causa, o que não aparece na tela.
- **T10-janela = A:** já era o que estava implementado (B3-1). Nada a fazer.

## Pontos levantados (decisões técnicas)
1. **Passo `parados` recua o início de parte dos itens jovens, e o review pedia "sem mudar o início". Decisão: aceito.**
   - O passo tem dois ramos:
     - no principal (60% dos itens em andamento), o início e a coluna ficam intactos, e só as transições depois do início são comprimidas;
     - no secundário (35% dos itens que começaram há pouco e não têm espaço para recuar), o card inteiro recua de forma rígida. Recuam juntos criação, compromisso, início, transições, bloqueios e data acordada, pelo mesmo delta, e toda duração interna se mantém.
   - O recuo alcança só itens em andamento, sem entrega e sem arquivamento. Por isso O3, O4, O5 e T1, que olham itens entregues, não mudam.
   - Ficam de fora os cards com filhos ou bugs ligados. O recuo respeita dois pisos: a criação da frente e o início do histórico.
   - O que muda, só no mock: a data de início desses itens (inícios por semana e idade do WIP no O2) e, no Padrão, a ordem do O24. O O24 continua afirmado em 20 a 30%.
   - O autor mediu que, sem mexer no início, o máximo era 16,9%. A alternativa seria o cenário de mock separado do critério de reversão, que custa mais do que o desvio.
   - **Nota de processo:** o B11a-1 pedia que o autor voltasse ao tech-lead **antes** de mexer no início. Ele registrou o desvio no commit, mas não voltou antes. Daqui em diante, desvio de critério volta antes.
   - Esse desvio entra na descrição do PR, em "riscos e mudanças de comportamento do mock", junto com o B11a-5.
2. **EI-03 com a tolerância derivada do arredondamento** (`e2e/tests/b3-sust-ei-vg.spec.ts:104`). **Decisão: a comparação com a API vira a asserção principal.**
   - O princípio do autor está certo: o índice vem do valor exato, e as medianas aparecem arredondadas.
   - O problema é que o teste fica fraco. `fmtNumero` usa `minimumFractionDigits: 0` (`web/src/lib/formatar.ts:3`), então uma mediana inteira aparece sem casa decimal ("8"). Aí o meio passo vira 0,5, e a faixa aceita passa de 15 pontos percentuais. Ou seja, quase qualquer índice passaria.
   - A forma nova (dono: QA, porque o teste é do QA):
     - o índice mostrado tem de ser igual ao `indicePct` da resposta de `/api/v1/metricas/EI_FL1` com os mesmos filtros, arredondado para 0 casas. A resposta é lida por `page.request`;
     - a reconstrução pela tela fica só como verificação secundária. O número de casas vem do componente (1 no fluxo e 2 na Sustentação, `CartaoEI.tsx:129`), e não do texto;
     - **prova do vermelho:** um `page.route` que soma 3 pontos percentuais ao `indicePct` da resposta da tela tem de fazer o teste falhar. O `page.request` não passa pelo `page.route`.
   - A fórmula em si já está provada pelo teste unitário do EI na biblioteca.
3. **Exceção do INV-F7 do O20** (`packages/metricas/src/filtros.intensivo.test.ts:353`). **Decisão: vale a proposta do QA (plano, §7 R-1), por inteiro.**
   - O teste só pula a aditividade no **estado vazio de fato**, isto é, quando a lista `dias` do resultado vem vazia, e não quando a base é 0.
   - A asserção `nab >= max(na, nb)` fica mantida em todos os casos.
   - Entra um teste dedicado ao estado vazio, com o caso afirmado.
   - O motivo fica registrado no cabeçalho do arquivo.
   - Antes de valer, o QA prova o vermelho: o teste tem de falhar com uma base que soma os picos das equipes.
   - Dono: QA. Se algum caso legítimo quebrar, a decisão volta a mim com o trio `a`, `b`, `ab`.
4. **Lista `afeta` da versão "excluído entregue".** **Decisão: mantida como está**, porque compartilha `METRICAS_DO_DESCARTE_NATIVO`.
   - O conteúdo está certo. O O25(b) muda o `MarcosCard.ativo` e o `excluido`, que chegam a toda métrica BusinessMap pelo `selecionar`. É o mesmo raciocínio da versão do descarte nativo, e o O17 (Acelerato) fica fora.
   - Compartilhar `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` está certo para toda id que nascer depois de 2026-10-16 (T11, T14): ela sai das duas versões.
   - A única brecha seria uma id nascida entre 15 e 16/10. Não existe nenhuma.
   - **Data 2026-10-16:** as três versões novas usam a data da decisão do usuário, e a do descarte nativo usa a data do código. As duas datas são anteriores à release, então nada muda na base real. No mock, o "hoje" (09/10) esconde as duas. Aceito.
   - Ver V2-2 e o teste de igualdade do `afeta` que o plano do QA prevê (CR-1).

## Ajustes
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| V2-1 | `packages/metricas/src/businessmap/indice.ts:31` | O comentário de `MarcosCard.descartado` ainda diz "tem `motivo_descarte` (decisão Q6)". Isso está desatualizado desde a P-1 = A e o O25(b) = B. | Trocar por "descartado nativo (P-1 = A); entregue e depois excluído não é descarte (O25(b) = B)". | recomendado |
| V2-2 | `packages/metricas/src/core/criterios.ts:28-31` | O comentário de `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` fala só da versão do descarte nativo, mas a lista também serve à `VERSAO_CRITERIO_EXCLUIDO_ENTREGUE`. | Dizer no comentário que a lista vale para as duas versões. O T11 entra nela no B11b. | recomendado |

## Segurança
- Nenhum campo de pessoa nem texto livre novo. O merge trouxe o K-084 (allow-list do coletor) e o K-085 (GRANT por coluna) sem conflito. A branch não acrescenta tabela nem coluna, e a guarda do K-085 passou no `test:pg`.

## Commits
- Os 6 commits estão em Conventional Commits, com o cartão (`K-078`) e os números no corpo. O `ba57836` junta 4 ajustes do mesmo cartão. Aceito, porque o PR vai por squash.
- `a212d12` é o merge commit de `origin/develop`, com a resolução do conflito descrita no corpo.

# O que falta
- **Para o QA do back:** pode começar já, sobre B1 a B11a e as decisões de 2026-10-16.
  - Já está pronto: este parecer (aprovado), o pronto EXIT 0 e o `test:pg` EXIT 0, no `a212d12`.
  - O QA precisa atualizar os hashes do plano (§8). Depois do `ba57836`, eles são: BM+AC `68a67741`, escala 0,2 `824092e4` e extensões `495a0e07`.
  - O QA precisa reescrever o EI-03 (ponto 2) e o INV-F7 (ponto 3) antes de dar o parecer.
  - Os casos do T11 (T11-1 a T11-6) esperam o B11b.
  - O plano do QA ainda trata como pendentes a R-1 (E8 e T14) e a R-2 (`fato_transicao.usuario`). As duas foram decididas em 2026-10-16 (R-1 = B e R-2 = B). Também foi decidido o levantamento de dados antigos (= A). Nenhuma das três está nesta branch: são cartões próprios, da fase 2 e do banco, e não bloqueiam o back da fase 1.
- **Para o B12** (review final da branch inteira):
  - **B11b**, com `ExtensaoTambemBM` e T11, do `node-backend`, depois do SNO-005. O T11 entra nominalmente em `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`.
  - **Emenda C4 da ADR 0003**, do architect. Hoje o C4 é "< 300 ms por painel" e não considera os 10 cartões novos do 011.
  - V2-1 e V2-2, de preferência junto com o B11b.
  - O B12 cobre: as 10 entradas do `CATALOGO_CARTOES`, o pronto, o E2E e o orçamento C1 a C4 com a emenda.
  - A descrição do PR leva "riscos e mudanças de comportamento do mock": o O24 com `criado_em` permutado (B11a-5), o O23 com o início recuado (ponto 1) e as métricas fora dos alvos que mudaram de exemplo.

# B11b + B12

**Escopo:** `a212d12..97866b4`, código do back:
- B11b: `42a8577` (T11, `ExtensaoTambemBM`, servidor e cascata do id);
- B12: `00591f2` (emenda C4 da ADR 0003, architect), `412b935` (`orcamentoC4.test.ts`) e `97866b4` (composição fixada em 2026-10-16, `idsDoC4` em `contratos`, leituras válidas na ADR).
- Os commits de QA no intervalo (`fa5bdfe`, `6e0d43f`) são do parecer do QA e ficam fora deste review.

**Veredito:** **ajustes necessários.** Um bloqueante no T11 (B11b-1: conta entradas posteriores à data de corte). O B12 está aprovado: a composição do C4 segue a ata de 2026-10-16 e a ADR, e as leituras registradas são válidas. Os demais itens são recomendados.

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` no HEAD `97866b4`, rodado pelo tech-lead: **EXIT=0**.
  - `contratos` 118, `metricas` 872, `mock` 202 (inclui `orcamentoC4.test.ts` e `extensaoTambem.test.ts`), `server` 540 passando e 83 pulados (`*.pg.test.ts`), `web` 838, `homolog` 73, `spec-check` 14, `pesquisa` 33 e `docs-contratos` 102;
  - `docs:check` ok (426 páginas, 61 métricas, 2 eventos).
- `test:pg`: não rodei. O diff não toca `server/src/plataforma/db` fora de `extensoes-mock.ts` (memo em processo, sem SQL) nem migração.
- E2E: fica com o QA (abaixo).

## Suposições do autor no B11b
| Suposição | Avaliação |
|---|---|
| T11 é censo, sem percentil | **ok.** É o que diz o desenho ("Mínimo: contagem (censo), sem percentil"). `REGRAS_METRICA.T11` tem `minimo: 0`, sem `estatistica` no resultado. `mediaMensal` é só referência de contagem, sobre os meses fechados. |
| O período é aceito e ignorado | **ok.** Segue a convenção do E9: o teste de `contratos.test.ts:134` exige `periodo` em toda entrada de `APLICABILIDADE_FLUXO`, e `docs/api/metricas.md` registra que o front monta o chip "Não afetado por: Período" passando ao cartão a lista sem `periodo`. O CA-12 do cálculo está provado em `t11.test.ts` e em `extensaoTambem.test.ts`. O CA-12 da tela (o chip) é do front e do QA no navegador. |
| `historicoCurto` | **ok.** É `mesesComDado < 24`, sobre os meses fechados. O vazio (sem extensão ou na fonte real) dá `true`, com `anos: []`, e nunca 500. A célula `null` (antes do histórico) é diferente de `0` (mês coberto sem entrada), e o início do histórico vem da entrada mais antiga sem filtros, então filtrar não encurta a janela. Ver o B11b-3 sobre o fim do mês. |
| Mock com 120 por mês e picos ×1,5 em janeiro e julho (ruído de 6%) | **ok.** É decisão técnica dentro da P-T3 = (a). A série tem stream própria (`businessmap/tambem:entradas-sazonais`), os hashes da base do BusinessMap (`68a67741`) e do Acelerato (`0113e077`) ficam intactos (com teste), o perfil (tipo, equipe, sistema) vem das stories da base, e os valores fictícios estão em `PARAMETROS_SAZONAIS` e em `docs/api`. O alvo medido (picos de 39% a 45% acima da média, nenhum outro mês acima de 126) dá ao mapa de calor um padrão visível. A divergência T11 × O7 no mock está documentada e testada. |

## Pontos revisados
- **T11 (`t11.ts`):** função pura, agregação por `mesesEntre` (`core/series`), filtros por slug, sem campo de pessoa. O servidor passa a extensão só ao T11 (`COM_EXTENSAO_TAMBEM`), lazy e memoizada por processo (`extensoes-mock.ts`), e não a passa na fonte `real`. Aprovado, menos o B11b-1.
- **Versões de critério:** o T11 entra em `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, com teste, e o comentário passou a valer para as duas versões (resolve o V2-2). O catálogo BusinessMap segue com 44 ids marcadas.
- **Cascata do id:** `METRICA_IDS`, `ContratoMetricas`, `SCHEMAS_RESULTADO`, `REGRAS_METRICA`, `CALCULOS`, OpenAPI, `docs/contratos/metricas/T11.md` e fotografias. Os testes de contagem foram de 60 para 61. ok.
- **Emenda C4 e B12:** a ADR fixa a C4-fechada por cadência, a C4-aberta como a fechada mais todas as complementares, e a `VISAO_GERAL` à parte, como decidido na ata. A leitura de 559/636 ms está marcada como inválida, com o motivo. O critério de reversão diz qual composição o aciona. `orcamentoC4.test.ts` usa `idsDoC4`, sem lista à mão, mede a frio em CPU time e imprime load e fator. Leitura válida registrada: a maior é a do Operacional semanal 12m aberta, de 257 a 280 ms contra 450 ms. Aprovado.
- **`idsDoC4`:** a fechada do Operacional bate com a ata (diária: O2, BLOQUEADOS, O1; semanal: os 9 ids). A `VISAO_GERAL` nunca entra. Ver o B12-1 sobre o complemento por prefixo.

## Ajustes
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| B11b-1 | `packages/metricas/src/businessmap/t11.ts:38-57` | O T11 conta entradas criadas **depois** da data de corte. A janela vai até `ctx.hojeDia`, mas a contagem é por mês inteiro e não corta em `ctx.hoje`. Reproduzi: com o corte em 2026-08-10, entradas de 25/08 e 28/08 entram em agosto (`{ mes: 8, entradas: 3, emAndamento: true }`, quando o certo é 1). Acontece com `dataReferencia` informada no mock (a extensão vai até 09/10) e acontecerá na fonte real, que lê `dim_card` com cards posteriores ao corte. Contraria a regra do serviço: nenhum painel mostra dado além do corte. | Ignorar `e.criado_em > ctx.hoje` na contagem e no cálculo de `inicioHistorico`. Teste novo: corte no meio do mês com entradas antes e depois do corte, e a mesma coisa pela API com `dataReferencia` (falha antes, passa depois). | **bloqueia** |
| B11b-2 | `packages/metricas/src/businessmap/indice.ts:31` | O V2-1 continua aberto: o comentário de `MarcosCard.descartado` ainda diz "tem `motivo_descarte` (decisão Q6)". | Trocar pelo texto do V2-1. | recomendado |
| B11b-3 | `t11.ts:68-88` e `docs/api/metricas.md` (seção T11) | No último dia do mês, o mês corrente fecha (há teste), e a janela passa a ter 25 meses fechados: `mesesComDado` chega a 25 e a `mediaMensal` usa 25 meses. Já `docs/api` diz "24 é o máximo". | Escolher um dos dois e alinhar código, teste e doc. Proposta: aceitar 25 nesse dia e corrigir o doc, porque o mês está completo. | recomendado |
| B12-1 | `packages/contratos/src/cartoes.ts:336-342` | A aberta completa com os ids do 011 pelo prefixo das chaves de `SCHEMAS_TAMBEM_FASE1`. É uma ponte enquanto os cartões do 011 não entram em `CATALOGO_CARTOES` (o front faz isso), mas contraria a "fonte única no catálogo" da ADR. | Comentar que é provisório e tirar o complemento quando o front puser os 10 cartões no catálogo. O `Set` já evita a contagem dupla no meio-tempo. | recomendado |
| B12-2 | `docs/architecture/adr/0003-orcamento-de-performance.md`, tabela de revisões | A linha de 2026-10-16 traz o resto do modelo do architect ("node-backend preenche: ...") seguido de "**Leitura válida**" repetido, e vem antes da linha de 2026-10-15. | Tirar o resto do modelo e pôr as linhas em ordem de data. Pode ir junto com o B11b-1. | recomendado |

## Segurança
- Nenhum campo de pessoa nem texto livre novo. `EntradaSazonal` tem só `criado_em`, `tipo`, `equipe` e `sistema`, com teste. O T11 entra na varredura de pessoa do `api.sistemico-intensivo.test.ts` (61 rotas). Sem achado para o `security-engineer`.

## Commits
- Conventional Commits, com o cartão no corpo. O `42a8577` está sem acentos no corpo ("extensao", "mes"). Aceito, porque o PR vai por squash e a mensagem final é minha.
- `00591f2` (architect) não tem corpo. O motivo está na própria ADR. Aceito.

## Pendências fora deste review
- **Fonte real do T11:** na fonte `real` o T11 devolve o estado vazio até existir o adaptador de `dim_card` e a carga histórica de 24 meses (risco K1 do desenho). Precisa de cartão próprio da coleta. Não bloqueia a fase 1, que é mock.
- **CA-12 na tela e o cartão do T11 no catálogo:** são do front. O `MockFonteMetricas` do front precisa passar `ctx.tambem` ao T11 (`docs/api/metricas.md`).

## O que o QA precisa rodar (depois do B11b-1)
1. **T11-1 a T11-6** do plano (`docs/qa/011-back-plano.md`), sobre o HEAD com a correção, com os hashes do plano atualizados (extensão `cdcae971`; a base segue `68a67741`). Acrescentar o caso da data de corte no meio do mês (B11b-1), pela API, com `dataReferencia`.
2. **C4 por cadência no navegador:** no Operacional, cadência diária e semanal, cada uma com "Mais métricas" fechada e depois aberta. Conferir no painel de rede que a fechada pede só os ids de `idsDoC4` (diária: O2, BLOQUEADOS, O1; semanal: os 9 ids) e que a `VISAO_GERAL` não é pedida em `/operacional`. Fazer o mesmo no Tático e no Estratégico.
3. **F5 (ADR 0003)** na pré-entrega, com o load de 1 min e o fator de calibração registrados (leitura só vale com fator ≤ 1,2). Rodar também `orcamentoC4.test.ts` com 3 execuções e registrar fechada, aberta e `VISAO_GERAL` contra 300/450/300 ms.
4. **E2E completo** e o `test:pg`, como na fase 1.

---

# B11b-1 (correção `5d3debf`) e merge da `develop` com a Sustentação (#87)

**Escopo:** `97866b4..9db6fd1`: `5d3debf` (a correção, do `node-backend`), `364e15d` (merge de `origin/develop` em `fd1245a`, #87, feito por mim, sem force e sem push) e `9db6fd1` (ajuste de contagens que o merge tornou falsas, meu). O autor terminou sem relatório; conferi tudo abaixo por execução.

**Veredito:** **B11b-1 resolvido e aprovado.** O parecer do código do 011 fica **aprovado**. Há **um achado novo de desempenho (B11c-1, C6)**, medido por mim, que a ADR 0003 trata como bloqueante do PR e que **não é correção de código minha**: vai ao architect (ver abaixo). Não impede o QA final de começar.

## Conferência do B11b-1
| Pedido | Resultado |
|---|---|
| Teste na biblioteca com corte no meio do mês | existe: `t11.test.ts`, "B11b-1: data de corte no meio do mês ignora entradas criadas depois do corte". Cobre contagem (agosto = 1, base.n = 2) e início do histórico (só entradas posteriores ao corte = vazio, `mesesComDado` 0). |
| Teste na API com `dataReferencia` no meio do mês | existe: `server/tests/metricas.test.ts`, "T11 (B11b-1)", com `dataReferencia=2026-08-10`. Compara com a contagem independente feita sobre `extensaoTambemMock()` e exige que o mês tenha entradas depois do corte (o teste não é vacuoso). |
| Os dois falham sem a correção | **confirmado.** Revertido só o `t11.ts` para `5d3debf~1`: a biblioteca falha em `celula(r, 2026, 8)` e a API falha em `expect(ago.entradas).toBe(ateCorte)`. Desfeito em seguida (`git checkout HEAD -- t11.ts`, árvore limpa). |
| Correção | `t11.ts` filtra `e.criado_em <= ctx.hoje` antes da contagem e do `inicioHistorico`. É a correção que o parecer pedia, nas duas pontas. |
| V2-1 / B11b-2 (comentário de `descartado`) | feito: `indice.ts:31` agora diz "Descartado nativo (P-1 = A); entregue e depois excluído não é descarte (O25(b) = B)". |
| B11b-3 (25 meses) | feito pela proposta: o código segue como está (o mês fecha no último dia), a doc `docs/api/metricas.md` passou a dizer "24 na maioria dos dias e 25 no último dia do mês" e o docstring do `t11.ts` registra o mesmo. Observação sem ajuste: o comentário novo em `t11.test.ts` ("25 meses fechados nesse dia") fica ao lado de uma asserção `mesesComDado` = 1, o que confunde, porque o histórico do teste tem uma entrada só. Não bloqueia. |
| B12-1, B12-2 | **não tratados** (não eram bloqueantes). Seguem como recomendados para o B12/PR: comentar a ponte por prefixo em `cartoes.ts` e limpar a linha da ADR 0003. |
| Hash da extensão | `cdcae971`, **não mudou** (`extensaoTambem.test.ts` verde; base `68a67741` e Acelerato `0113e077` intactos). |

## Merge de `origin/develop` (Sustentação, #87)
- `git merge origin/develop` por merge commit, sem force, sem push. 10 conflitos, **todos de contagem ou texto**, nenhum de lógica:
  - Contagem de métricas (`contratos.test.ts`, `sistemico.test.ts`, `api.sistemico-intensivo.test.ts`, `api-perf.sistemico-intensivo.test.ts`, `metricas.test.ts`, `plataforma2.test.ts`): a `develop` foi de 51 para 53 (as duas tendências) e a branch de 51 para 61 (as 10 métricas do 011). Resolvido para **63**, e conferido pelo `docs:gerar` (63 páginas de métrica) e pelo `METRICA_IDS`. Também 59 passou a 61 numa asserção ("mais de N x 2 respostas") e 62 a 64 no `plataforma2` (rotas + 404 genérico).
  - `docs/api/metricas.md`, `docs/contratos/metricas/README.md` e `VISAO_GERAL.md`: texto da lista de ids e data de revisão; regerados com `pnpm run docs:gerar` e `pnpm run openapi:gerar`.
  - `varredura.test.ts`: a `develop` tirou as tendências do `it.each` (`ehTendencia`) e a branch tinha o `it.each` com folga de 30 s. Ficou o filtro da `develop` **e** a folga de 30 s da branch, e a constante `IDS_FLUXO` que sobrou foi removida (lint).
- **O merge deixou duas contagens falsas** (o pronto pegou, `9db6fd1` corrige): a `TENDENCIA_FLUXO` é BusinessMap e usa o descarte, então entra no `afeta` das duas versões de critério (**45 ids**, e 46 no catálogo BusinessMap). `o23.test.ts` passou de 44 para 45 e de 45 para 46. Em `qa011-fase1.test.ts`, o loop "período que cruza 16/10 traz a marcação em todas as ids" não vale para a tendência, porque a janela dela termina no último mês fechado (30/09) e não cruza as datas dos critérios; ela ficou fora dessa lista (`!METRICAS_TENDENCIA.includes(id)`), o que mantém o guarda "44 ids" daquele teste. **Esse teste é do QA:** registro a decisão aqui e peço ao QA que a ratifique no parecer dele. `docs/api` ajustada ("45 marcadas, 46 no total").

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` **depois do merge e do `9db6fd1`: EXIT=0.**
  - A rodada anterior, no merge puro (`364e15d`), deu EXIT=1 com 4 falhas de contagem (`o23.test.ts` e `qa011-fase1.test.ts`), descritas acima e corrigidas no `9db6fd1`.
  - Passaram: `contratos` 120, `metricas` 936 (cobertura mantida), `mock` 206, `server` 559 (e 83 pulados), `web` 1.045, `homolog` 73, `spec-check` 14, `pesquisa` 33, `docs-contratos` 102 (inclui `docs:check`).
- `flock ... pnpm run test:pg`: **EXIT=0**, 15 arquivos, 83 testes. A guarda do K-085 passa sobre a base migrada.
- E2E e perf: ver o roteiro abaixo.

## Roteiro do QA final (repetido por mim, sobre `9db6fd1`)
**T11-1 a T11-6 (plano `docs/qa/011-back-plano.md`):** todos verdes nos testes que os cobrem: janela fixa e período ignorado (T11-1), mês corrente em andamento e filtros (T11-2), histórico curto (T11-3), picos de janeiro e julho com hash próprio e base intacta (T11-4), contrato `mes-do-ano`, `marcacoes` e ausência de percentil (T11-5) e T11 fora do `afeta`, com a lista nominal (T11-6). Hash da extensão **`cdcae971`, não mudou**; base `68a67741`, Acelerato `0113e077`, escala 0,2 `824092e4`/`39b4b005`.

**Corte no meio do mês, pela API** (mock escala 0,25, `agora` 2026-10-10), medido por mim:

| `dataReferencia` | `base.n` | `mesesComDado` | `historicoCurto` | últimos meses cobertos |
|---|---|---|---|---|
| 2026-08-10 | 2.957 | 22 | sim | jul 185 (fechado), ago 48 (em andamento) |
| 2026-08-31 | 3.030 | 23 | sim | jul 185, ago 121 (fechado: último dia do mês) |
| 2026-09-15 | 3.088 | 23 | sim | ago 121, set 58 (em andamento) |
| padrão (sem data) | 3.194 | 24 | não | set 123, out 41 (em andamento) |

Em 10/08, agosto tem 48 entradas e fecha em 121: nada posterior ao corte é contado. Os três meses cobertos crescem de forma monotônica com a data, e o `n` também.

**C4 por cadência, com `idsDoC4`** (navegador, SPA buildada com `VITE_FONTE=api` contra a API local, pedidos de rede de `/api/v1/metricas/*` registrados por mim):

| Painel | "Mais métricas" fechada pede | = `idsDoC4`? | aberta acrescenta | `VISAO_GERAL` pedida? |
|---|---|---|---|---|
| Operacional diária | BLOQUEADOS, O1, O2 (3) | sim | nada (a seção não existe na diária) | não |
| Operacional semanal | EI_FL1, O3, O4, O7, O9, O10, O12, O15, O18 (9) | sim | O5, O6, O8, O11, O13, O14, O16 (7) | não |
| Tático | EI_FL2, T1, T2, T3, T4, T5, T7, T9 (8) | sim | T6, T8 | não |
| Estratégico | E1, E2, E3, EI_FL3 (4) | sim | E4, E5 | não |
| Resumo (`/operacional`) | 10 ids do Resumo | n/a | n/a | não |

Em todos os painéis a fechada pede exatamente os ids de `idsDoC4`. A aberta traz só as complementares **anteriores ao 011**, porque os 10 cartões do 011 ainda não estão no `CATALOGO_CARTOES` do front (cartão do front). Um ponto para o front e o architect: `idsDoC4('operacional', 'aberta', 'diaria')` tem 15 ids (todas as complementares do painel), mas hoje a **diária não tem a seção "Mais métricas"** na tela, só a semanal. Se o front do 011 mantiver isso, a C4-aberta diária do teste é uma medida teórica. Decisão de desenho, não de back.

`orcamentoC4.test.ts`, em CPU time e a frio, load de 1 min cerca de 2,6 e **fator 1,00 a 1,03** (válido, ≤ 1,2):

| Medida | Fechada (orç. 300 ms) | Aberta (orç. 450 ms) |
|---|---|---|
| Operacional diária 12s / 12m | 61 / 49 ms | 128 / 163 ms |
| Operacional semanal 12s / 12m | 54 / 87 ms | 123 / 208 ms |
| Tático 12s / 12m | 24 / 24 ms | 75 / 84 ms |
| Estratégico 12s / 12m | 6 / 9 ms | 30 / 38 ms |
| `VISAO_GERAL` a frio (orç. 300 ms) | 89 ms | n/a |

Gerador lazy: mediana 8 ms (orçamento 200 ms). C3 a frio dos ids novos: O19 2, O20 24, O21 4, O24 6, O25 3, T10 2, T11 1, T12 4, E7 2, E9 1 ms.

**F5, com carga e fator** (projeto `perf`, `vite preview`, 1 worker): F5 com latência simulada, n=20, mediana 53 ms (53 a 76 ms entre rodadas) e **p95 507 a 533 ms** na branch. A `develop` (mesma máquina, load de 2 a 3,7) dá **525 e 533 ms**. Ou seja, **sem regressão**: o p95 nos dois lados fica um pouco acima de 500 ms por causa da primeira troca (570 a 640 ms), a frio, e o teste falha nos dois. F3 INP 88 ms e F4 mediana 43 ms, p95 86 ms. O "fator de calibração" do orçamento é do teste de CPU time do mock (acima); o `perf` do navegador não o calcula, e registro só o load de 1 min.

**E2E completo** (`pnpm run e2e`, chromium e chromium-semente-alt; o `perf` roda junto): sob carga alta (4 workers, `nice` 19, outros agentes na máquina), 666 passaram e 21 falharam, quase todas por **timeout de 30 s** (as durações das falhas ficam em 30 a 43 s). Reexecutei as 21 com 1 worker e a máquina mais livre: **19 passaram**, e ficaram 2: o CT-29 a 375 px (timeout; passou na reexecução isolada, junto com as outras três variantes do mesmo teste) e o C6 do perf (abaixo). Nenhuma falha de asserção de número do BusinessMap ou do T11. **Nota de ambiente:** na primeira tentativa, 578 testes falharam por `ERR_CONNECTION_REFUSED`/Chromium sem bibliotecas; exigem `eval "$(bash e2e/scripts/setup-chromium-local.sh)"` (ou o `LD_LIBRARY_PATH` dele) e servidores `vite preview` vivos durante toda a rodada. Rodei com isso.

**`test:pg`:** EXIT=0, 15 arquivos, 83 testes.

## Achado novo: B11c-1 (C6, tarefa longa no navegador)
| # | Onde | Problema | Evidência | Severidade |
|---|---|---|---|---|
| B11c-1 | Orçamento C6 da ADR 0003 (tarefa longa na thread principal < 200 ms), `e2e/perf/perf.spec.ts:58` | A mediana da maior tarefa longa passou de 200 ms nos painéis do fluxo. A branch regride **cerca de 20% a 2x** em relação à `develop`, que passa com pouca folga. | **`/operacional`:** `develop` 197 e 193 ms (passa); branch 241 e 235 ms (falha). **`/` (Resumo):** `develop` 200 (uma leitura, falhou no limite), 174, 193 e 181 ms; branch 388, 272 e 466 ms (3 execuções, load de 2 a 3). A geração do mock cresceu um pouco (`gerarBaseMock` em node, 5 execuções: mediana 248 ms na branch contra 211 ms na `develop`; contextos BM e AC, primeira montagem, 217 contra 181 ms) e o C2 continua muito abaixo de 1,5 s. A fonte do excesso no navegador (uma tarefa só com geração e contextos) não foi isolada por mim. | **bloqueia o PR** (C6 é "sim" na ADR 0003); **não bloqueia o QA** |

**Encaminhamento (não é correção minha, é estrutural e do orçamento):** vai ao `software-architect`. Opções que a ADR já prevê: partir a geração em fatias para quebrar a tarefa longa, ou mover geração e cálculo para Web Worker atrás da `MockFonteMetricas` (a interface já é assíncrona). Antes disso, vale o `react-frontend` ou o `node-backend` confirmar com um perfil do navegador qual parte do B11a (passos `parados`, `ordem`, `descarte`, base maior) soma a tarefa. O critério de reversão do B11a (C2 > 1,5 s) não foi acionado. Se o architect preferir tratar o C6 do mock como alerta e não como bloqueio, é decisão dele, com ADR.

## Segurança
- Nenhum achado. O merge não traz coluna nem tabela nova de pessoa; a guarda do K-085 passou. Sem cartão para o `security-engineer`.

## Commits
- `5d3debf`: Conventional Commits, cartão no corpo, com os acentos corretos. Aceito.
- `364e15d` (merge, meu) e `9db6fd1` (contagens, meu): corpos explicam o porquê. Nenhum push feito. O PR vai por squash.

# Estado do 011 para o QA final
- Este parecer: **aprovado** (código). Pronto EXIT=0 e `test:pg` EXIT=0 sobre `9db6fd1`, que já contém o merge da `develop`.
- **Pendências para o PR, fora do QA:** B11c-1 (C6, architect); B12-1 e B12-2 (recomendados, junto com qualquer ajuste de ADR); a descrição do PR leva "riscos e mudanças de comportamento do mock" (O24 com `criado_em` permutado, O23 com início recuado, exemplos de `docs/contratos` que mudaram).
- **Para o QA ratificar:** a exclusão da tendência no loop "todas as ids" de `qa011-fase1.test.ts` (decisão acima) e o reexame do CT-29 a 375 px, que só passou fora da rodada paralela.

---

# Revalidação final sobre `4e6b29c` (revert do a1 e merge da `develop` com K-096/K-097, #88)

**Escopo:** `9db6fd1..4e6b29c`:
- `03b6176` (só testes do QA: tendência na T2.6 e T11 pela API com corte no meio do mês) e `90c64cd` (parecer do QA), lidos por mim;
- `6d64255` (a1, C6) e o seu revert `d73474a`, feito por mim conforme o fechamento do B11c-1 (`docs/architecture/notas/c6-011.md`, "Fechamento do B11c-1", item 2). Antes do revert criei `ref/c6-cede-por-metrica` apontando para `6d64255` (local, sem push e sem PR);
- `4e6b29c`: merge de `origin/develop` em `5eaf202` (#88, K-096 e K-097), feito por mim, sem force e sem push.

**Veredito:** **aprovado.** O código do 011 é o mesmo que o QA mediu (`9db6fd1` mais os testes dele), agora com a `develop` atual.

## Ferramentas (citadas, não refeitas)
- `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` no HEAD `4e6b29c`: **EXIT=0**. `contratos` 120, `metricas` 937, `mock` 206, `server` 562 (e 83 pulados, os `*.pg.test.ts`), `web` 1.045, `homolog` 73, `spec-check` 14, `pesquisa` 33, `docs-contratos` 102; `docs:check` ok (441 páginas, 63 métricas, 2 eventos).
- `env -u DSPD_PWD_PESQUISA flock /tmp/metricas-pesado.lock nice -n 19 pnpm run test:pg` no mesmo HEAD: **EXIT=0**, 15 arquivos e 83 testes, inclusive `guarda-api.pg.test.ts` (guarda do K-085), `papeis.pg.test.ts` (GRANT por coluna) e a migração `0015_bm_remove_usuario_transicao`. A worktree não tem `.env`, e a variável foi retirada do ambiente, então o teste usou a senha padrão do papel `dspd_pesquisa` (`docs/engineering/carga-da-pesquisa-de-percepcao.md`, K-095).

## Revert do a1
- `git diff 9db6fd1 4e6b29c -- web/src/data/mock/ docs/tecnica/` sai vazio: `MockFonteMetricas.ts`, o teste dele e `docs/tecnica/arquitetura-front.md` voltaram ao estado de `9db6fd1`, que é o estado em que o QA mediu o C6 (maior mediana 161 ms em `/operacional`) e o F5 (p95 347,6 ms).
- O a2 não está na branch (`packages/mock` limpo; ficou com o `node-backend`, em `ref/c6-gerador-em-fases`, pelo item 3 do fechamento).

## Merge de `origin/develop` (#88)
Sem conflito textual. Conferi os três pontos semânticos:
- **Contagens de ids:** o #88 não cria nem remove métrica. `METRICA_IDS` segue com 63, o `docs:check` conta 63 páginas e nenhum teste de contagem mudou.
- **`COLUNAS_PESSOA` e `fato_transicao`:** o 011 não toca `server/src/plataforma/db` (fora de `extensoes-mock.ts`, que é memo em processo, sem SQL), as migrações nem `lgpd.ts`. Nenhum código de produção do 011 lê `fato_transicao.usuario`. O `usuario` que aparece em `filtros.intensivo.test.ts:56`, `regras.property.test.ts:596` e `mock.test.ts:132` é do modelo do mock em memória (`base.bm.transicoes`, pseudônimos fictícios), usado justamente nas varreduras que provam que nenhuma pessoa chega à saída. O lint da P-T6 continua impedindo a leitura em `businessmap/**`.
- **Guarda do K-085:** passou no `test:pg` acima, sobre o banco migrado até a `0015`.

Observação sem ajuste, para o architect: depois do K-096, o modelo do mock (`FatoTransicao.usuario`) ainda carrega um campo que o banco não tem mais. Não é deste PR e não tem efeito em métrica; vale um cartão se o architect quiser alinhar o mock ao esquema.

## Testes do QA (`03b6176`)
- `qa011-fase1.test.ts`: a tendência do fluxo, fora do loop das 44 ids, ganha um caso próprio, com uma janela que não cruza as datas (sem marcação) e outra que cruza (com as duas marcações). Ratifica a decisão do merge anterior. ok.
- `qa011-fase1.api.test.ts`: T11 pela API, sem percentil, soma das equipes não maior que o total e corte no meio do mês. Afirma mínimos e não é vacuoso. ok.

## Identificação do pedido no frontmatter
- O frontmatter passou de `pedido: 011-metricas-tambem-disponiveis` para `011-metricas-tambem-disponiveis-back`, o mesmo id que o parecer do QA desta branch (`docs/qa/011-back.md`) já usa. Review e QA desta entrega passam a ter um id só, e o `forge-check pr` confere os dois sobre o HEAD.
- Motivo: o `forge-check pr <pedido>` pega o parecer mais recente do pedido entre **todas** as branches. Com o id antigo, ele escolhia os pareceres do K-085 e do K-096/K-097 (outras branches, já mescladas e aprovadas sobre os próprios commits) e os acusava de desatualizados porque o `docs/api/metricas.md` mudou depois. Revalidar esses pareceres sobre a branch do 011 seria atestar entregas que não são esta. Os pareceres do K-084, K-085 e K-096/K-097 ficam como estão.

## Pendências (não bloqueiam)
- B12-1 (`packages/contratos/src/cartoes.ts:338-342`, ponte por prefixo sem comentário de provisório) e B12-2 (linha de 2026-10-16 da ADR 0003 com o resto do modelo e fora de ordem): seguem recomendados. Ficam para o front do 011 e para o architect.
- B11-001 e a divergência do E7 seguem com o usuário, na validação.

## Segurança
- Nenhum achado. O merge traz a remoção de `fato_transicao.usuario`, que só reduz dado de pessoa; o 011 não acrescenta coluna nem campo de pessoa. Sem cartão para o `security-engineer`.

## Commits
- `d73474a`: revert padrão do git, que cita o commit revertido. `4e6b29c`: merge com mensagem em Conventional Commits. O PR vai por squash, com mensagem minha.

# Estado para o PR (anterior, sobre `4e6b29c`)
- Este parecer: **aprovado** sobre `4e6b29c`.
- **O parecer do QA (`docs/qa/011-back.md`, commit `03b6176`) está desatualizado** para o portão: entre `03b6176` e o HEAD mudaram arquivos de código (o revert do a1 e o merge do #88), e o `forge-check` também não encontra o registro de autoria do papel `qa` para a versão atual do arquivo. O QA precisa regravar o parecer sobre `4e6b29c` (ou sobre um commit posterior que só mude `docs/reviews/` e `docs/qa/`). O código do 011 é o que ele já testou; a novidade é a `develop` com o #88, que tem QA próprio em `docs/qa/k096-k097.md`.

---

# Revalidação: merge do #93 (só docs)

**Commit revisado:** `8908d92`, merge de `origin/develop` (`7a4a955`) na branch, feito sem conflito (`git show --cc` do merge sai vazio) e sem force.

**Veredito:** **aprovado.** O código do 011 não mudou desde `4e6b29c`; o que entrou veio da `develop` e já tem parecer próprio.

## O que entrou entre `4e6b29c` e `8908d92`
Conferido com `git diff 4e6b29c..HEAD --stat` e `--name-only`. A premissa "só o #93" precisa de uma correção: entraram o #93 **e** o #91, mais pareceres desta branch.
- **#93** (`7a4a955`, docs de estado e notas): só `docs/`. Entre eles, `docs/alinhamentos/2026-10-16-c4-operacional.md` (107 linhas, idêntico ao da `develop`, fora do diff do PR), `docs/architecture/adr/0021-calculo-do-mock-em-web-worker.md`, `docs/architecture/notas/c4-operacional-011.md` e `c6-011.md`, `docs/devops/homolog-2026-10-16.md`, `docs/kanban/*` e `docs/pedidos/011-metricas-tambem-disponiveis.md` (1 linha).
- **#91** (`0b78b1e`, K-094, seed concorrente): três arquivos de código, `server/src/plataforma/db/seed.ts`, `server/tests/seed.duble.test.ts` e `server/tests/seed.pg.test.ts`. Tem review próprio (`docs/reviews/k094-seed-concorrente.md`, aprovado sobre `1c9ae5c`) e QA próprio (`docs/qa/k094-seed-concorrente.md`). O 011 não toca nesses arquivos: `git diff origin/develop..HEAD` não lista nenhum deles, e o diff deles entre `7a4a955` e `8908d92` é vazio. O código da `develop` está idêntico ao da branch.
- Pareceres e testes desta branch entre os dois pontos: `4c7efee` (este parecer), `a4ee375` (QA) e `cf70b25` (referência do hash da base após o B11a, `docs/qa/evidencias/`).
- Nenhum arquivo de `packages/`, `web/`, `e2e/`, migração ou contrato mudou.

## Ferramentas
- Não rodei `pnpm run pronto` de novo. O código do 011 (`packages/*`, `web/`, `server/` fora do seed) é byte a byte o de `4e6b29c`, que fechou EXIT=0 no `pronto` e no `test:pg`. A única mudança de código é o seed do #91, que vem da `develop` com a CI e o QA dele. A CI do PR roda a suíte inteira depois do push.

## Segurança
- Nenhum achado. O seed continua sem campo de pessoa, e o 011 não acrescentou coluna nem tabela.

## Estado para o PR
- Este parecer: **aprovado** sobre `8908d92`. A nota "QA desatualizado" da seção anterior fica superada pela revalidação do QA sobre o mesmo commit.

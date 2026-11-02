---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-dicionario-radicais
commit: 8dca720062f668c0d5189f6b8fcd272999934347
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: 059-aba-apontamento, dicionário em radicais (E2.77, K-193)

Links: review `docs/reviews/059-epsilon.md` (aprovado em `387b1fe`, parecer no `8dca720`), QA da trilha B `docs/qa/059-alfa.md` (achado A1 de origem), plano técnico `docs/architecture/features/059-aba-apontamento.md` (§3.4 e §3.6), decisão do dono de 2026-11-02 (termos em radicais).

**Parecer: aprovado**, sem bug aberto, sobre o código de `387b1fe`. O commit seguinte (`8dca720`, ponta testada) só traz o parecer de review, sem mudar código. Escopo `completo` contra `origin/develop`: o diff é o arquivo do dicionário (versão `2026-11-02-v2`), o parágrafo de `server.md` e o teste novo; o classificador não muda. Sem gatilho de segurança (só conteúdo do dicionário e testes).

## Achados
- A1 (recomendado) docs/architecture/fontes/apontamento-dicionario.json:20 · analiso (primeira pessoa do presente) não casa: o radical analis pegaria analista, e os termos listados cobrem analisa, analisei e analisou mas não analiso. Incluir analiso na próxima troca de arquivo, sem urgência.
- A2 (recomendado) docs/architecture/fontes/apontamento-dicionario.json:18 · o termo inteiro call casa callback (palavra comum de desenvolvimento) e a regra de reuniões, de prioridade 3, vence a de desenvolvimento. Vem da v1, não é regressão desta troca; o dono pode confirmar o termo ou trocar por calls e call na troca de arquivo.
- A3 (recomendado) server/tests/apontamento-dicionario.test.ts:99 · o teste "A1 do QA" de reuniao e reunioes passa também na base, porque reuni já era radical na v1. A prova do A1 está nos testes dos dez radicais trocados (caem na base); este caso é só regressão e não prova o achado de origem.

## Critério → teste → resultado
Obrigações: A1 do `docs/qa/059-alfa.md` (termo inteiro não casa o plural), decisão do dono de 2026-11-02 (radicais para pegar as variações), T2.6 (mudança de critério com data e versão), carga incremental sem sobrescrever histórico.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1 resolvido: o plural e a conjugação de cada termo trocado casam o mesmo subgrupo do singular | 10 casos do autor (`apontamento-dicionario.test.ts:68-78`) e a sonda do QA de plural (reuniao/reunioes, configuracao/configuracoes, correcao/correcoes, criacao/criacoes, analise/analises, infraestrutura/infraestruturas, apoio/apoios, ajuste/ajustes, rotina/rotinas, teste/testes) | plural, acento, caixa, conjugação | passou; caem 41 testes contra o dicionário da base |
| Cada radical contra variações (sonda do QA, mais de 50 pares palavra → subgrupo) | `qa-059-epsilon.test.ts`: test, reuni, analise/analisa, diagnos, configur, infraestrutur, apoi, ajust, correc, corrig, criac, rotin, mais debug, implement, script, fonte, rdm, gmud, mudanca, document, homolog, alinhament, call, meet | singular, plural, acento, MAIÚSCULAS, verbo, particípio, gerúndio | passou (124 casos no arquivo) |
| Cada radical contra palavras de outro sentido (mais de 50 palavras) | analista, paralisia, protesto, contesto, atestado, detestar, intestino, confirmar, conferir, infração, apontamento, apostila, apostar, ajuda, reajuste, corrente, correr, correto, corretor, corrida, criança, criativo, criatura, rota, rotativo, roteiro, calendário, cálculo, font-size, mudo, mude | colado no meio ou início de outra palavra | passou: todas ficam em `execucao-tecnica` |
| Residual aceito pelo review | testemunha e testamento caem em `testes` (fixado como comportamento) | radical test | passou, risco já registrado em `server.md` |
| Termos inteiros | plural de rdm, gmud, call, meet, mudanca, fonte, script, ambiente casa; calendário, cálculo, font-size, mudo não | termo curto de dois sentidos | passou; achado A2 sobre `call` e callback |
| Sem regressão contra a v1 | diferencial: 4000 comentários de semente fixa montados de 49 palavras, v1 contra v2 | quem casava na v1 continua casando, com prioridade igual ou melhor; mais de 100 comentários mudam | passou |
| Prioridade e regra por tipo | menor prioridade vence (testes antes de reuniões e desenvolvimento); Kaizen vence o radical; incidente com `- - -` fica sem detalhe | empate entre subgrupos | passou |
| Versão do dicionário | `versao` `2026-11-02-v2`; 29 termos (2+4+5+3+1+3+1+10) e 8 subgrupos com termo | contagem do arquivo | passou |
| T2.6 e carga pela vigência sem sobrescrever (PostgreSQL local, papel `dspd_ref`, arquivos reais v1 da develop e v2 da branch) | `qa-059-epsilon.pg.test.ts`: carga v1 (25 termos), carga v2 (fecha 9, abre 13), v2 de novo (idempotente) | linhas da v1 intactas, só `vigente_ate` | passou: 9 linhas fechadas em `2026-11-03` (ajuste, apoio, configuracao, correcao, criacao, diagnostic, infraestrutura, rotina, teste), `analise` segue vigente sem linha nova, as 25 linhas da v1 seguem na tabela, o coletor lê só os 29 vigentes e a versão `2026-11-02-v2`, duas versões de critério com referência da versão e do hash, DELETE até do dono recusado (55000) |
| Vigência do autor no banco | `apontamento-dicionario.pg.test.ts` (10 testes) | fechar, reabrir, apagar | passou |

O review diz que a carga fecha 8 termos; são 9, porque `rotina` também fecha (vira `rotin`). Não muda o parecer.

## Cenários e resultado real
- **Recursos:** `free -m` com 14 492 MB disponíveis e load 0,70 antes da suíte; uma suíte por vez.
- **`pnpm run pronto`** (worktree 052e, HEAD `8dca720`): rc 0. Contratos 199; metricas 42 arquivos e 1257 testes, cobertura 100%; mock 258; server 71 arquivos, 1440 passaram e 214 pulados (`.pg`); web 1256; tools (homolog 73, pesquisa 33, spec-check 14, docs-contratos 102); `docs:check` ok (861 páginas). O `pronto` precisou rodar fora do sandbox, porque o bloqueio de `/tmp/metricas-dspd-suite.lock` (sistema de arquivos somente leitura) impediu a trava da suíte única.
- **PostgreSQL:** as conexões ao Postgres do Compose em 127.0.0.1 deram `ECONNREFUSED` no sandbox e funcionaram fora dele (só os dois arquivos `.pg` acima, com schemas de prefixo próprio, derrubados no fim).
- **Vermelho antes do verde:** `git checkout origin/develop -- docs/architecture/fontes/apontamento-dicionario.json` e `vitest run --project unit tests/qa-059-epsilon.test.ts tests/apontamento-dicionario.test.ts` → rc 1, 41 falhas e 127 passando: os 10 casos dos radicais, "o arquivo traz cada radical", a versão `2026-11-02-v2` (dois testes), a contagem de 29 termos e as sondas do QA de variação (TESTAR, analisar, analisando, diagnosis, configurar, apoiar, ajustar, corrigir e outras). Arquivo restaurado por `git checkout HEAD --`; `git status` limpo. O teste "A1 do QA" de reuniao e reunioes passa na base (A3).
- **Mutação:** Stryker não está instalado e `docs/engineering/praticas.md` não fixa meta. Mutantes à mão, restaurando depois de cada um, rodando só `apontamento-dicionario.test.ts` do autor. Dicionário (18): `test` para `teste`, `tes`; `analise` para `analis`; sem `analisa`; sem `analisou`; `diagnos` para `diagnostic`; `configur` para `configuracao`, `config`; `apoi` para `apo`; `ajust` para `aju`; `correc` para `corre`; `corrig` para `corri`; `criac` para `cria`; `rotin` para `rot`; `infraestrutur` para `infra`, `infraestrutura`; sem `analisei`; `reuni` para `reunia`. Classificador (1): `startsWith` para `includes`. **19 de 19 mortos, 0 sobreviventes.** Ressalva: `config`, `aju`, `corri`, `infraestrutura` e `analisei` caem pela asserção de presença do termo e pela contagem, não pelas palavras de outro sentido; isso prende o radical exato, o que é o desejado, mas a guarda de abrangência depende dessa asserção.
- **E2E e acessibilidade:** n/a, a branch não toca interface.
- **Sondas do QA:** `qa-059-epsilon.test.ts` (124 casos) e `qa-059-epsilon.pg.test.ts` (1 caso) rodaram na árvore do autor e foram retirados antes do commit, porque a entrega manda commitar só este parecer. Cópias em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/b137b592-4e44-436e-8a8d-3ffa9e1b0ad4/scratchpad/` (com o dicionário v1 da develop, `dic-v1.json`, lido pela variável `QA_DIC_V1`).
- **Lacunas fixadas como observação (não são regressão, a v1 também não pegava):** criar, criei, criou, retestar, reteste e infra não casam; só os termos da lista valem. Fora do pedido, e dependem do dono.

## Bugs
Nenhum aberto. Nenhum registro em `docs/qa/bugs/`.

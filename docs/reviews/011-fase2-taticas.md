---
tipo: review
contrato: 1
pedido: 011-fase2-taticas
branch: feature/011-fase2-taticas
commit: 3c9a9cd
parecer: aprovado
revisor: tech-lead
data: 2026-10-16
---

# Code review: back da fase 2 do pedido 011, lote 2 (táticas: T13, T14)

**Origem:** commits `3297fda` (E1) e `11113d0` (E2) da `feature/011-fase2-back`, sobre `b73bad3`, revisados contra o plano (`docs/architecture/features/metricas-tambem-disponiveis.md` §2 T13, §4, §5 "Fase 2" e §9), a ADR 0020, as decisões do usuário do pedido 011 (T14 nova = A, Q-T14-1 = B, Q-T14-5 = D, Q-T14-6 = A revista pela R-1 = B, Q-T14-10 = B, D-14' = A, R-4 = sim) e as regras invioláveis do `CLAUDE.md`.

**Separação por nível** (decisão do usuário de 2026-10-17): este lote é o commit `ee552d9`. Ele sai da `feature/011-fase2-estrategicas` (`3aeaa3d`), para não haver conflito nos arquivos compartilhados, e por isso o PR deste lote só abre depois do merge do lote 1. O commit acrescenta só T13 e T14 aos arquivos compartilhados (`METRICA_IDS`, `APLICABILIDADE_FLUXO`, `COM_EXTENSAO_MOCK`, `REGRAS_METRICA`, `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, `ExtensaoTambemBM`, gerador do mock, OpenAPI, fotografias, `docs/api`, `docs/tecnica`, `regras-metricas.md` e as contagens dos testes). Os hashes por campo da extensão continuam os do autor (`vinculos`, `equipeResponsavel`, `outrosPublicavel`, `configEquipes`); só o hash da extensão inteira mudou (`64d76236`). Nenhuma lógica foi alterada na separação.

**Veredito (rodada 1, `ee552d9`):** **aprovado**, com 3 ajustes recomendados e uma pendência de escopo do lote para o Jarvis. Nada bloqueia o QA. **A rodada 2 e depois a rodada 3 (abaixo) substituem este veredito; o que vale é o da rodada 3.**

## Ferramentas (citadas, não refeitas)
- `pnpm run pronto` na raiz da worktree, nesta branch, sobre `ee552d9` mais este parecer: **rc=0** (2026-10-16 11:26, load 0,76 no início). Cobre lint, `format:check`, tipos, testes com cobertura de 100% em todos os pacotes, `docs:check`, `spec:check`, build e tamanho do web.
- `docs:fotografar`: o enum `indicadores[].metrica` do `VISAO_GERAL` cresce com T13 e T14. O aceite de uso único foi registrado, consumido e apagado, como no lote 1.

## Regras de leitura (`praticas.md` §2, §3, §4 e §8)
| Item | Situação |
|---|---|
| Faz o que o plano pede | ok. T13 segue o §2 e o T14 segue o §9.3, com os 8 testes obrigatórios do §9.3 presentes em `t14.test.ts` |
| Comparação entre times (7.1) | ok. O T14 traz só "meu time", "outros times" (um inteiro, `null` com menos de 2 pessoas) e "sem time". Não monta mapa por equipe, e o teste de contrato e o de rota confirmam que nenhum nome de outra equipe aparece. O T13 traz só o booleano, sem quadro nem equipe do outro lado |
| Pessoa | ok. A biblioteca não conta pessoas: `outrosPublicavel` chega pronto (ADR 0020, item 9). O gerador não lê `responsaveis` |
| Story, frente e projeto | ok. Blocos separados por granularidade, nunca somados. A base principal é a das demandas e as frentes vão em `complemento` |
| Mínimo de 20 | ok. T13: taxa com 20 e par com 20 em cada grupo do mesmo tipo (CA-6). T14: percentual só com n ≥ 20 de cards com time informado (CA-31), inclusive `total ≥ 20` com `n < 20` |
| Cálculo pela biblioteca | ok. Lead time pelo `blocosDe` do T1 (sem recálculo), `taxa`, `ordenarNeutro` |
| Documentação no mesmo commit | ok |

## Pontos que o autor deixou para o review
**(b) Enum do `VISAO_GERAL`:** ratificado, pelo mesmo motivo do lote 1 (agora com T13 e T14). Falta o registro do architect no plano.

**(c) Testes do QA e `regras-metricas.md`:** valem as mesmas conclusões do lote 1. No `qa011-fase1.api.test.ts`, A-2, as ids deste lote respondem 200, e O22 e O26 (lote seguinte), da fase 3 ou inexistentes respondem 404. Na `regras-metricas.md`, a linha do T14 fica `pendente-usuario`, de acordo com o plano §4.

**(d) Suposições do autor, uma por uma:**
- **T13 e T14 por granularidade, com os dois blocos na mesma resposta: aceita.** O plano pede "uma granularidade por vez (seletor, CA-8)" e, no §9.3, "uma só por resultado". A resposta entrega os dois blocos, que nunca são somados nem calculados juntos, e a interface mostra um de cada vez. Não há filtro de granularidade em `FiltrosFluxo`, e criar um seria mecanismo novo sem necessidade. O architect precisa alinhar o texto do contrato no plano.
- **T14 "em andamento no período": aceita, com base no CA-27** ("para cada projeto em andamento"). A Q-T14-4 já diz que o período escolhe os projetos e o projeto conta inteiro (CA-34). Em consequência, o projeto ainda não iniciado fica fora mesmo com cards do meu time (`t14.ts:59`). Isso precisa aparecer na pendência que vai ao usuário (R2).
- **`total` do bloco no T14**, que soma os projetos listados com o mesmo mínimo: base no plano §9.3, item 5 ("no projeto ou no total").
- **Q-T14-10 = B** (cadastro de membros, decidida em 2026-10-17): no mock nada muda, porque o booleano é gerado direto. A linha de pendência da Q-T14-10 em `REGRAS_METRICA.T14` ainda descreve a leitura A ("responsáveis distintos"). O usuário já decidiu, e a linha deve sair da lista de pendências e virar regra, com a fonte em K-112 (R2).

## Achados
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R1 | `packages/metricas/src/businessmap/t13.ts:59` e `:68` | O bloco das frentes usa `janelaPercentis(ctx, f, 'story')` e `amostraBM('story', ...)`, ou seja, a amostra de frentes vai rotulada como story. Hoje o valor é o mesmo (a janela é igual nas duas granularidades), mas o rótulo errado anula a trava de classe que impede misturar story e frente | Passar `granularidade` para os dois | recomendado |
| R2 | `packages/metricas/src/core/regras.ts:669` e seguintes (pendências do T14) | A Q-T14-4 não diz que "o período escolhe os projetos" é "em andamento no período (iniciado até o fim e não concluído antes do início)", e que por isso o projeto não iniciado fica fora. A Q-T14-10 continua como pendência com a leitura A, mas já foi decidida (B, 2026-10-17) | Deixar a Q-T14-4 explícita, citando o CA-27; tirar a Q-T14-10 das pendências e registrá-la como regra (cadastro de membros, fase 3, K-112) | recomendado |
| R3 | `packages/mock/src/businessmap/extensaoTambemFase2.ts:310` | A chave de `outrosPublicavel` é montada à mão, quando a biblioteca exporta `chaveOutrosPublicavel` | Usar a função da biblioteca (o mock já importa de `@metricas-dspd/metricas/businessmap`) | recomendado |

## Pendência de escopo do lote (para o Jarvis)
- **B11-001 = sim** (usuário, 2026-10-17: "o nome do fornecedor no T10 ignora maiúsculas, minúsculas e espaços. Entra no lote 2 (táticas)"): **não está nesta entrega**. O K-103 não trata o T10, e `t10.ts` só faz `trim()`. É uma mudança de cálculo (`node-backend`, com teste) que precisa de cartão antes do PR do lote 2. Não a fiz aqui: é lógica e volta ao autor.

## Fora deste review
- **Segurança** (E2.3, `security-engineer`, gatilho: dado pessoal no T14 com `outrosPublicavel`): não refeito. O risco residual (b) da ADR 0020 (`n − k` ainda dá a quantidade de cards dos outros times) é decisão do usuário e fica com ele.
- **QA** (E2.4), **UX** (E3.2) e o PR (pedido 020).

## Commits
`ee552d9 feat(metricas): back da fase 2 do pedido 011, lote das táticas (T13, T14), em mock`. A mensagem segue Conventional Commits em português, com o cartão e as linhas de atribuição.

## Rodada 2: revalidação sobre `d845d88` (develop com o lote 1 e o B11-001; pedido 027)

**Escopo revisto:** `git diff origin/develop origin/feature/011-fase2-taticas` (47 arquivos, +4474/−85) e os commits `9e83bf5` (merge reconstruído: árvore da develop com o lote 1 do #105 mais o lote 2), `942c26a` (B11-001) e `d845d88` (Q-T14-10 sai das pendências).

**Veredito:** **reprovado (ajustes necessários)**. Um achado bloqueia: o B11-001 muda o critério de cálculo de uma métrica já publicada e não registra a versão de critério (T2.6, regra inviolável). O ajuste é pequeno e volta ao autor; o resto do lote segue como na rodada 1.

### Ferramentas (citadas, não refeitas)
- `pnpm run pronto` rodado pelo autor sobre `d845d88` (pedido 027): **rc=0**. Não rodei de novo aqui, por causa do teto de recursos (o QA roda o pronto e os E2E do front em outra worktree).

### O diff contra a develop é só o lote 2, o B11-001 e o que eles exigem
- **Arquivos de lógica novos:** `t13.ts`, `t14.ts` e os testes deles. **Lote 1 intacto:** nenhum arquivo do E6, do E7 (sem R$, D2 = A) nem do E8 aparece no diff.
- **Linhas removidas (85):** conferi todas fora da OpenAPI. Cada uma é uma contagem ou uma lista que cresce de E6 e E8 para T13, T14, E6 e E8: 65 para 67 ids, 48 para 50 ids do BusinessMap, `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`, `COM_EXTENSAO_TAMBEM`, `SCHEMAS_TAMBEM` (12 para 14), o hash da extensão inteira e o 404 do A-2, que deixa de listar T13 e T14 (continua com O22 e O26, do lote seguinte, e com as ids da fase 3). A única linha removida de lógica é a de `t10.ts`, que é do B11-001. Nada do lote 1 foi desfeito.
- **Arquivos comuns:** contratos (`metricas.ts`, `tambem.ts`, `comum.ts`, `validacao.ts`, `cartoes.ts`), `REGRAS_METRICA`, `criterios.ts`, `calcular.ts`, `ExtensaoTambemBM`, gerador do mock, `server` (lista de extensão e contagens dos testes), OpenAPI, fotografias e docs gerados. Só acrescentam T13 e T14. O `LIBERADOS_T14` (`equipe` e `semEquipe`) do teste de nomes de pessoa é o mesmo da rodada 1, onde foi aceito: é o filtro "meu time" e o seu estado vazio, e nunca carrega o nome de outra equipe.

### Achados da rodada 1
- **R1** (`t13.ts:59` e `:68`, frentes rotuladas como story): **segue aberto**.
- **R2:** a parte da Q-T14-10 foi **resolvida** em `d845d88`: a linha saiu das pendências, virou regra no `refBriefing` e o teste trava a volta dela. A parte da Q-T14-4 (deixar explícito "em andamento no período", CA-27) **segue aberta** (`regras.ts:669`).
- **R3** (`extensaoTambemFase2.ts:310`, chave montada à mão): **segue aberto**.

### B11-001 (`t10.ts` e `bloqueios.test.ts:221`)
A lógica faz o que o usuário decidiu, sem ir além. Agrupa pela chave `trim` + espaços internos colapsados + `toLowerCase`, e não remove acentos, que a decisão não pede. Exibe a grafia mais frequente do grupo no período, com empate desfeito por `ordenarNeutro`. A janela dos percentis usa a mesma chave, então período e janela não divergem. O teste novo cobre 3 grafias que somam 21 e passam do mínimo de 20, que nenhuma delas passaria sozinha, a independência da ordem de entrada e o schema.

### Q-T14-9: ajuste para o autor
A linha `regras.ts:672` diz "suposição do time", mas a Q-T14-9 = A é do usuário: está registrada com a Q-T14-1 = B ("até lá vale a Q-T14-9 = A") e confirmada no pedido 027. Não aceito a linha como está. Se ela continuar entre as pendências, o usuário volta a receber como aberta uma pergunta que ele já decidiu, e o `status: pendente-usuario` do T14 continua justificado só pelas outras. O tratamento deve ser o mesmo da Q-T14-10 (R6).

### Achados da rodada 2
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R4 | `packages/metricas/src/core/criterios.ts:91` (`VERSOES_DA_BIBLIOTECA`) | O B11-001 muda o critério de cálculo do T10, que já está publicado na `main`. Muda o agrupamento por fornecedor, as contagens por linha e, como mostra o próprio teste, se o P50/P85 sai ou não. Não há `VersaoCriterio` com data e `afeta: ['T10']`, então o gráfico não marca a mudança. Isso contraria o T2.6 e o precedente do mesmo pedido (`VERSAO_CRITERIO_O19_PCT_DIAS` e `VERSAO_CRITERIO_O20_DESTAQUE_V2`) | Criar `VERSAO_CRITERIO_T10_FORNECEDOR_NORMALIZADO` (data da decisão, descrição "fornecedor agrupado sem diferença de maiúsculas, minúsculas e espaços; exibe a grafia mais frequente", `afeta: ['T10']`), incluí-la em `VERSOES_DA_BIBLIOTECA` e ajustar os testes de marcação | **bloqueia** |
| R5 | `docs/api/metricas.md:146`; `packages/metricas/src/core/regras.ts:567` (`refBriefing` do T10); `t10.ts:16` e `:24` | A documentação do T10 não traz a normalização: a descrição da API e o `refBriefing` (que gera a `regras-metricas.md` e o contrato) continuam dizendo só "uma linha por fornecedor". Os comentários novos saíram sem acentos ("maiusculas e espacos e um so"), ao contrário do resto do arquivo | Acrescentar "B11-001 = sim: fornecedor agrupado pelo nome normalizado (caixa e espaços), exibido pela grafia mais frequente" aos dois textos e regenerar os docs; reescrever os comentários com acentos | recomendado |
| R6 | `packages/metricas/src/core/regras.ts:672`; `packages/metricas/src/fase2.regras.test.ts:44-51` | A Q-T14-9 aparece como "suposição do time", mas foi decidida A pelo usuário | Tirar a Q-T14-9 das pendências e registrá-la no `refBriefing` como "Q-T14-9 = A (usuário, provisória até confirmar a cardinalidade)". A pendência da cardinalidade continua. No teste, trocar `'Q-T14-9'` da lista esperada para a lista que não pode voltar (`'Q-T14-9:'`) | recomendado |
| R7 | `packages/metricas/src/businessmap/bloqueios.test.ts:221` | Não há teste do empate de grafias (por exemplo, 10 `Alfa` e 10 `ALFA`): o comentário de `t10.ts:39` promete "ordem neutra", mas nenhum teste trava qual grafia aparece | Acrescentar o caso de empate e afirmar a grafia exibida | recomendado |

**Para liberar o QA:** basta o R4. Os R1, R2 (parte da Q-T14-4), R3, R5, R6 e R7 entram antes do PR (pedido 022), de preferência no mesmo commit de ajuste. Quando o autor entregar, revalido só o delta.

### Commits
`9e83bf5` (merge reconstruído, com a mensagem explicando a origem), `942c26a fix(metricas): T10 agrupa o fornecedor pelo nome normalizado (B11-001)` e `d845d88 fix(metricas): T14 deixa de listar a Q-T14-10 como pendente (R2 do review)`. Seguem Conventional Commits em português e trazem as linhas de atribuição.

## Rodada 3: revalidação sobre `3c9a9cd` (ajustes R1 a R7; pedido 027)

**Escopo revisto:** só o delta `git diff 0eb8404 3c9a9cd` (11 arquivos, +61/−31), commits `c3ac1ca` (R4, R5, R7), `bb5e920` (R6, R2) e `3c9a9cd` (R1, R3).

**Veredito:** **aprovado**. O bloqueante R4 está resolvido, e R1, R2, R3, R6 e R7 também. O R5 está resolvido no que eu pedi para a API, o `refBriefing`, o contrato gerado e os comentários. Sobra um ajuste recomendado de documentação (R8): ele não bloqueia o QA, mas entra antes do PR (pedido 022).

### Ferramentas (citadas, não refeitas)
- `pnpm run pronto` rodado pelo autor sobre `3c9a9cd`: **rc=0** (relatado no pedido 027). Não rodei de novo, por causa do teto de recursos: o QA roda o pronto e os E2E do front em outra worktree.

### Achados das rodadas anteriores
| # | Situação na rodada 3 | Evidência |
|---|---|---|
| R4 (bloqueia) | **resolvido** | `criterios.ts:91` cria `VERSAO_CRITERIO_T10_FORNECEDOR_NORMALIZADO` (`id: criterio-2026-10-17-t10-fornecedor-normalizado`, `data: 2026-10-17`, `afeta: ['T10']`) e a inclui em `VERSOES_DA_BIBLIOTECA`. Isso basta para a marcação chegar ao T10: `marcacoesNoPeriodo` soma as versões da biblioteca, e `t10.ts:70` passa por `criterios('T10', ...)`. O teste novo (`o23.test.ts:73`) afirma `afeta = ['T10']`, a marcação num período que inclui 2026-10-17, a ausência dela num período que termina em 2026-10-16 e a ausência no O19 |
| R5 | **resolvido**, com o resto passado para o R8 | `docs/api/metricas.md:146` e o `refBriefing` do T10 (`regras.ts:567`) trazem o B11-001. `docs/contratos/metricas/T10.md` foi regenerado com revisão de 2026-10-17. Os comentários de `t10.ts` voltaram a ter acentos. Minha premissa estava errada em um ponto: o `refBriefing` não gera a `regras-metricas.md`, que é mantida à mão (ver R8) |
| R6 | **resolvido** | A Q-T14-9 saiu das pendências e entrou no `refBriefing` como "Q-T14-9 = A (usuário, provisória até confirmar a cardinalidade do campo)". O contrato do T14 foi regenerado. O teste (`fase2.regras.test.ts:44`) troca `'Q-T14-9'` para a lista que não pode voltar (`'Q-T14-9:'`). Reli o teste de ausência (item 11 do checklist): a linha antiga começava com `Q-T14-9:`, então o teste a teria pego. A pendência da cardinalidade cita "Q-T14-9 = A", sem dois-pontos, e passa |
| R7 | **resolvido** | `bloqueios.test.ts:241`: 10 `ALFA` e 10 `Alfa`, nas duas ordens de entrada, saem numa linha `['ALFA', 20]`. Fica travado que o empate é desfeito pela ordem neutra (o código de `A` maiúsculo vem antes) |
| R1 | **resolvido** | `t13.ts:73-75`: cada bloco calcula `janelaPercentis(ctx, f, granularidade)` e `amostraBM(granularidade, ...)`, e o filtro `naJanela` usa a janela do bloco. A `janela` story que sobra em `t13.ts:59` serve só ao `criterios('T13', ...)` de `:131`. Ali ela é usada apenas pelas datas e não entra em nenhuma amostra, então não fere a trava de classe |
| R2 | **resolvido** | A pendência da Q-T14-4 (`regras.ts`) agora diz "em andamento no período = iniciado até o fim do período e não concluído antes do início (CA-27)" e que o projeto ainda não iniciado fica fora |
| R3 | **resolvido** | `extensaoTambemFase2.ts:311` usa `chaveOutrosPublicavel(p, meu, g)`, importada de `@metricas-dspd/metricas/businessmap` |

### Achado da rodada 3
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| R8 | `docs/architecture/regras-metricas.md:117`, `:121` e `:143`; `packages/metricas/src/businessmap/t10.ts:15` | A `regras-metricas.md` é escrita à mão e ficou para trás. A linha do T10 (`:117`) não cita o B11-001 nem a versão de critério de 2026-10-17. A do T14 (`:121`) não cita a Q-T14-9 = A nem a Q-T14-10 = B. O parágrafo da fase 2 (`:143`) ainda lista "Q-T14-2, 3, 4, 7, 8, 9 e 10" como pendentes, quando 9 e 10 já foram decididas pelo usuário. Nenhuma ferramenta pega isso, porque o `docs:check` não compara esse texto com o `REGRAS_METRICA`. Em `t10.ts:15`, a frase "Fornecedor igual a menos de maiúsculas e espaços" ficou truncada | Acrescentar "B11-001 = sim (critério de 2026-10-17)" na linha do T10, "Q-T14-9 = A, Q-T14-10 = B" na do T14, e em `:143` deixar só "Q-T14-2, 3, 4, 7 e 8" mais a cardinalidade. Em `t10.ts:15`, reescrever como "Fornecedores que diferem só em maiúsculas, minúsculas e espaços são um só" | recomendado (antes do PR do pedido 022) |

**Observação fora do delta (não conta para este lote):** em `regras-metricas.md:135`, o O19 ainda diz que o `pctDoTotal` é "k de n em bloqueios, nunca em dias úteis". Isso contradiz a O19-pct = B (`criterio-2026-10-16-o19-pct-em-dias-uteis`), que está documentada em `docs/api/metricas.md:146`. Fica para o autor corrigir junto com o R8, porque é o mesmo arquivo.

### O que este delta não mexeu
O delta não toca em nenhum dado de pessoa, nas regras de mínimo de 20, na separação entre story, frente e projeto nem no BusinessMap × Acelerato. O lote 1 continua intacto: nenhum arquivo do E6, do E7 ou do E8 aparece no delta. A segurança (E2.3) revalida depois desta rodada, e o QA (E2.4) vem depois da segurança.

### Commits
`c3ac1ca fix(metricas): registra a versão de critério do T10 e documenta a normalização (R4, R5, R7)`, `bb5e920 fix(metricas): Q-T14-9 vira decisão do usuário e Q-T14-4 explícita (R6, R2)` e `3c9a9cd fix(metricas): T13 rotula a amostra pela granularidade e o mock usa chaveOutrosPublicavel (R1, R3)`. Os três seguem Conventional Commits em português, cada um com os achados que fecha, e trazem as linhas de atribuição.

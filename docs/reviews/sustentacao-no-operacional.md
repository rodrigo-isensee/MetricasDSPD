---
tipo: review
contrato: 1
pedido: sustentacao-no-operacional
branch: feature/sustentacao-no-operacional
commit: d4ac4dd1ede89fa81481e67ef4853fdb3b58f5ec
parecer: aprovado
revisor: tech-lead
data: 2026-10-14
---

# Code review: Sustentação dentro do Operacional (K-072 + K-073; back B1 a B3, front F1 a F8)

## Volta 3 (3b5a382..d4ac4dd)

Escopo: 6f3c316 (L9, front), 95fdf1a (V1 e V2) e d4ac4dd (V3). São 8 arquivos, com 48 linhas a mais e 40 a menos.

### Veredito da volta 3

**Aprovado.** O `pronto` da raiz está verde em d4ac4dd, e os quatro ajustes da volta 2 foram feitos sem mudança de lógica. A branch segue para o QA.

### Verificação (ferramentas)

| Comando | Resultado |
|---|---|
| `flock /tmp/metricas-pesado.lock nice -n 19 pnpm run pronto` (raiz, em d4ac4dd, rodado pelo tech-lead) | **Verde, saída 0.** O `eslint .` passou sem achados. O `prettier --check` diz "All matched files use Prettier code style!". O pronto dos pacotes cobriu 10 de 11 projetos. |
| Pronto dos pacotes (mesma execução) | metricas: 653/653; web: 1.031/1.031; server: 425 passados e 64 pulados (dependem do Postgres); contratos: 45/45; mock: 161/161; homolog: 73/73; pesquisa: 33/33; spec-check: 14/14; docs-contratos: 102/102 e `docs:check: ok (393 páginas Markdown, 53 métricas, 2 eventos)`. Cobertura de 100% em todos. |
| `size` do web (mesma execução) | F6 inicial 191,00 KB (< 200); F8 gráficos 111,62 KB (< 130); F11 exportar-pdf 132,64 KB (< 150); F9 mock + biblioteca 9,84 KB (< 120). Tudo dentro do orçamento (ADR 0003). |

### Achados da volta 2: conferência

| Achado | Situação |
|---|---|
| V1 `paridade.test.ts:187`, `:191` | **Resolvido** (95fdf1a). Os dois `as never` saíram, e o lint e o typecheck do web passam. |
| V2 `varredura.test.ts` | **Resolvido** (95fdf1a). O `git diff -w` mostra que só os dois títulos do `it.each` foram quebrados em linhas pelo Prettier, sem mudança no corpo dos testes. |
| V3 páginas e fotografias `TENDENCIA_*` | **Resolvido** (d4ac4dd). As páginas e as fotografias ganharam o `pattern` do `mes`. `docs/contratos/snapshots/aceitas.json` não mudou no saldo: o aceite temporário foi consumido pela fotografia refeita, como pedido para um contrato ainda não publicado. Não há `/api/v2`. |
| L9 "U1 pendente" | **Resolvido** (6f3c316). O texto agora é "U1 = (a), decidida pelo usuário em 2026-10-14" em `arquitetura-front.md:180` e em `BlocoSustentacao.tsx:15`. |

### Achados da volta 3

- **Baixo · node-backend** · mensagens de 95fdf1a e d4ac4dd estão sem acento ("desnecessarios", "paginas", "temporario").
  - **Severidade:** não bloqueia.
  - **Correção:** nenhuma agora, porque o squash na `develop` reescreve a mensagem. Nos próximos commits, escrever com acento.

### Riscos

Os riscos da volta 1 e da volta 2 continuam valendo. A medição A1/A2 contra o Postgres real está com o QA, e o texto do caso A6 está com o UX. A volta 3 não traz risco novo.

## Volta 2 (2e6c0f2..3b5a382)

Escopo: os commits do back (36df612, 50de2a0), do front (66e3d46, 06fab0c), do adendo de UX (a8860f4, ab0b7b6, 92b93ef, 8c4fc55, a0cb01a, 49474de) e dois de documentação feitos pelo tech-lead (db13363 com a correção do L2 pelo architect e a tabela 4.5 do plano; 3b5a382). Referência do adendo: `docs/ux/sustentacao-no-operacional/05-adendo-review.md`, com U1 = (a) decidida pelo usuário.

### Veredito da volta 2

**Reprovado: ajustes necessários.** Todos os achados de leitura da volta 1 foram resolvidos, e o adendo de UX está correto. Mas o `pronto` da raiz está vermelho em três ferramentas, e as três falhas vêm dos commits do back desta volta. São correções mecânicas, sem mudança de lógica. Com elas feitas, a volta 3 se limita a conferir o `pronto` verde.

### Verificação (ferramentas)

| Comando | Resultado |
|---|---|
| `flock … nice -n 19 pnpm run pronto` (raiz, em 3b5a382) | **Vermelho no `lint`**: `web/paridade/paridade.test.ts:187:61` e `:191:41`, `@typescript-eslint/no-unnecessary-type-assertion` (achado V1). O `pronto` parou aí. |
| `pnpm run format:check` (mesma prioridade) | **Vermelho**: `packages/metricas/src/varredura.test.ts` não está formatado pelo Prettier (achado V2). |
| `pnpm -r --no-bail --if-present run pronto` (mesma prioridade) | metricas: 653/653 testes; web: 1.031/1.031; server: 425 passados e 64 pulados (dependem do Postgres); contratos: 45/45; mock: 161/161; pesquisa, homolog e spec-check verdes. Cobertura de 100% em todos. **`tools/docs-contratos` vermelho**: 2 de 102 testes falham em `src/insumos.test.ts:130` e `:134` (achado V3). |

Nenhuma falha foi por tempo esgotado. A varredura dividida por métrica (M3) passou sob carga.

### Achados da volta 1: conferência

| Achado | Situação |
|---|---|
| B1 `arquitetura-front.md` | **Resolvido** (66e3d46, 49474de). O documento cobre as quatro visões e a URL canônica, a tabela hash → visão, os dois conjuntos de filtros, os redirecionadores, o Resumo (que só reorganiza DTOs e cita a origem de cada número pela tabela 4.5), o modo `tendencia-poucos` e a janela do alerta. Resta um detalhe de texto (L9). |
| M1 tendência com O3 em erro | **Resolvido.** `TendenciaFluxo` recebe a query do O3. Com o O3 em erro, a série de P85 mostra "P85 indisponível" com "Tentar de novo" ligado ao O3, e a série de concluídos continua. Há teste em `componentes.test.tsx`. |
| M2 escapes de tipo | **Resolvido no código.** O contrato agora tem `SoDataReferencia`, e os dois casts saíram de `consultas.ts`, `BlocoFluxo.tsx` e `BlocoSustentacao.tsx`. O efeito colateral é o V1. |
| M3 varredura lenta | **Resolvido** com `it.each` por métrica, sem mexer no `testTimeout` global. O efeito colateral é o V2. |
| L1 frase da série | **Resolvido.** A diferença sai dos valores arredondados. |
| L2 ADR 0019 | **Resolvido** pelo architect (db13363). O motivo da rejeição agora é ser um cálculo paralelo ao da métrica de origem, e o texto deixa claro que as duas opções usam o estado atual da base. |
| L3 `mesCivil` | **Resolvido** com `^\d{4}-(0[1-9]\|1[0-2])$`. A OpenAPI foi regenerada, mas as páginas e as fotografias de contrato não foram (V3). |
| L4 `TENDENCIAS` à mão | **Resolvido.** `METRICAS_TENDENCIA` está no contrato e é usado pelo server e pela varredura. |
| L5 estado de módulo | **Resolvido.** É um `useRef` da `OperacionalPage` passado ao seletor. |
| L6 variável sem função | **Resolvido.** |
| L7 dependência invertida | **Resolvido.** `visao.ts` foi para `features/navegacao/`, e `lib/` e `coleta/` não dependem mais do Operacional. |
| L8 regra do tipo duplicada | **Resolvido.** `CartaoO3` usa `tipoPredominante`. |
| Plano (R7, P3, tabela 4.5) | **Resolvido** pelo tech-lead (db13363, 3b5a382). R7 e P3 estão marcadas como superadas, e a tabela 4.5 registra a P3 = (a) e a U1 = (a). |

### Adendo de UX (leitura)

- **Janela do alerta (U1 = (a)).**
  - A `FaixaAtencao` ganhou a prop opcional `janela`.
  - O Resumo escreve "Janela: últimas 12 semanas" nos dois blocos, e o texto sai de `textoPeriodoCurto(f.periodo)`, as mesmas constantes que alimentam as consultas. Assim a janela escrita não se descola da janela calculada.
  - Há a nota "Mesmo alerta, janelas diferentes", com link para a Sustentação.
  - A visão Sustentação mostra "Pede atenção no período" e o período do filtro, que é dinâmico e cobre também o personalizado.
  - Testes de unidade, integração e E2E (a0cb01a) cobrem tudo isso.
- **A9, desempate do tipo predominante.** A ordem é fixa: mais itens, depois a ordem de `TIPOS_CARD`, depois o nome. Não depende mais da ordem de chegada dos dados, então o número do Resumo e a aba do O3 sempre concordam. O rótulo diz "empate com …", e o teste cobre a ordem invertida e um tipo fora do catálogo. Não há percentil entre tipos (P1 preservada).
- **A6, perfil de versão futura.** `salvar` rejeita, sem gravar, quando o JSON guardado tem `versao` numérica > 1. JSON corrompido continua sendo lido como o padrão e é sobrescrito na primeira escolha. O `catch` não é vazio: devolve `false` com um motivo documentado. Os testes cobrem os dois casos. A6 e A9 seguem como propostas do UX que o usuário ainda pode contestar.
- **A8, hash desconhecido com `cadencia` inválida.** O teste confirma que o Resumo abre com aviso, que o hash é preservado e que a correção é `replace`.
- Regras invioláveis: nada mistura as fontes, e nenhum número é derivado na tela além do arredondamento já aceito no L1.

### Achados da volta 2

#### Bloqueantes (ferramenta)
- **V1 · node-backend** · `web/paridade/paridade.test.ts:187` e `:191`.
  - **Problema:** com `TENDENCIA_*` tipados como `SoDataReferencia` (36df612), os `filtros as never` desse teste ficaram desnecessários, e o lint falha. O arquivo não está no diff, mas a quebra vem do contrato.
  - **Correção:** remover os dois `as never` (o `eslint --fix` resolve) e rodar o `pronto` da raiz.
  - **Severidade:** bloqueia.
- **V2 · node-backend** · `packages/metricas/src/varredura.test.ts:74` e o `it.each` da sustentação (50de2a0).
  - **Problema:** o título longo do `it.each` não está no formato do Prettier, e o `format:check` falha.
  - **Correção:** `pnpm exec prettier --write packages/metricas/src/varredura.test.ts`.
  - **Severidade:** bloqueia.
- **V3 · node-backend** · `docs/contratos/metricas/TENDENCIA_FLUXO.md`, `TENDENCIA_SUST.md` e `docs/contratos/snapshots/resultados/TENDENCIA_*.json`.
  - **Problema:** o `pattern` do `mesCivil` (L3) mudou o schema, mas as páginas geradas e as fotografias não foram atualizadas. O `docs-contratos` acusa as páginas como desatualizadas e marca a mudança como "INCOMPATÍVEL".
  - **Correção:** rodar `pnpm run docs:gerar` e `pnpm run docs:fotografar`. Esses dois contratos ainda não existem na `develop`: as fotografias nasceram nesta branch e nunca foram publicadas. Se a ferramenta aceitar a fotografia refeita, não registre aceite. Se exigir o registro em `docs/contratos/snapshots/aceitas.json`, registre com o motivo "contrato ainda não publicado (nasceu nesta branch)". Não abra `/api/v2`.
  - **Severidade:** bloqueia.

O pronto da raiz não teria passado no commit do autor em nenhum dos três casos. Para a volta 3, peço que o `node-backend` rode `pnpm run pronto` na raiz, e não só o pronto do pacote, e cite a saída.

#### Baixo
- **L9 · react-frontend** · `docs/tecnica/arquitetura-front.md:180` ("U1 pendente, vale a opção (a)") e `web/src/features/operacional/resumo/BlocoSustentacao.tsx:15` ("(U1 pendente)").
  - **Problema:** a U1 foi decidida em 2026-10-14.
  - **Correção:** trocar por "U1 = (a), decidida pelo usuário em 2026-10-14". Pode entrar no mesmo lote das correções do V1 a V3.
  - **Severidade:** recomendado.

### Ajustes por autor (volta 2)
- **node-backend:** V1, V2 e V3 (bloqueiam).
- **react-frontend:** L9 (recomendado).
- **software-architect, ux-designer:** nada pendente.

### Riscos (acréscimos à volta 1)
- A6 muda o comportamento de gravação: um perfil de versão futura faz `salvar` rejeitar, e a tela mostra o aviso de falha de gravação que já existe (`PreferenciasPage.tsx:188`: "Não foi possível salvar suas preferências. Tente de novo."). Nesse caso, "Tente de novo" nunca funciona. Fica para o UX decidir se esse caso precisa de um texto próprio. Não bloqueia.
- A medição A1/A2 contra o Postgres real continua com o QA.

## Volta 1 (2e6c0f2)

Escopo: `git diff origin/develop...HEAD` (develop em 7e832f5, já com o lote #70), na worktree `MetricasDSPD-sust`, com 163 arquivos alterados. Referências: o plano `docs/architecture/plano-sustentacao-no-operacional.md` (seção 10 com P1 a P4), a ADR 0019, as regras invioláveis do `CLAUDE.md` e as seções 7 e 8 do `praticas.md`.

### Veredito da volta 1

**Reprovado: ajustes necessários.** O cálculo, os contratos e as regras invioláveis estão corretos. O que bloqueia é um item de documentação: a documentação técnica do front não acompanhou a entrega, e pela seção 7.7 e pelo item 10 da seção 8 do `praticas.md` isso bloqueia. Há ainda três ajustes médios. Corrigido o bloqueio, o novo review se limita a esses pontos.

### Verificação (ferramentas, volta 1)

| Comando | Resultado |
|---|---|
| `flock … nice -n 19 pnpm run pronto` (raiz) | lint e `format:check` verdes. contratos, mock, pesquisa, homolog e spec-check verdes, com cobertura de 100%. **`packages/metricas` falhou**: `varredura.test.ts:70` ("fluxo: todo resultado respeita o contrato…") estourou o tempo (16.383 ms, limite de 15.000 ms) sob carga (load de 6,5, com `nice 19` e cobertura em paralelo). O `pnpm -r` parou ali, e web e server não rodaram nessa execução. |
| `vitest run src/varredura.test.ts` (metricas, isolado) | 11/11 testes em 7,3 s |
| `pnpm -r --no-bail --filter metricas,web,server,docs-contratos run pronto` (mesma prioridade) | tudo verde. metricas: 559/559 testes; web: 1.022/1.022; server: 425 passados e 64 pulados (dependem do Postgres); docs-contratos: 102/102. Cobertura de 100% em linhas, ramos, funções e instruções nos quatro. |

Conclusão: o código passa, mas o `pronto` não passa de forma estável numa máquina carregada (achado M3). Não rodei a suíte E2E: isso fica com o QA.

### Checklist (regras de leitura que alcançam o diff)

1. **Escopo.** B1 a B3 e F1 a F8 estão implementados conforme o plano, e as respostas da seção 10 foram aplicadas:
   - P1 (a): tipo predominante, com rótulo "P85 · <tipo>". A série segue o mesmo tipo.
   - P2 (a): "k de m avaliadas", e "não publicado" só quando m = 0.
   - P3 (a): os números da Sustentação no Resumo usam 12 semanas (`FILTROS_SUST_RESUMO`).
   - P4 (a): o volume é contado pela data de abertura (`diasDeAbertura`, a base do S3).

   A entrega não vai além do pedido.
2. **Regras invioláveis e ADRs.**
   - BusinessMap e Acelerato não se misturam:
     - são duas métricas, cada uma com uma única fonte;
     - um teste prova que o contexto vazio da outra fonte não muda o resultado (`tendencia.test.ts`);
     - o server garante que nenhuma consulta junta `dspd_bm` com `dspd_ac`;
     - no Resumo, cada fonte tem o seu bloco, e nada é somado entre eles.
   - O cálculo passa pela biblioteca: os pontos usam o mesmo núcleo do O3 e do S2 (`classesNaJanela`, `aderenciaPorPrioridade`), extraído e reaproveitado pela métrica de origem. Um teste de propriedade sobre 3 bases geradas compara cada ponto com `calcularO3`/`calcularS2` no fim do mês.
   - Regra dos 20: abaixo de 20 itens, o resultado volta `insuficiente`, sem valor. Os testes cobrem 19 e 20 itens.
   - Percentil só dentro do tipo ou da prioridade: `REGRAS_METRICA` com `segmentacao` `['tipo']` / `['prioridade']`.
   - `criterios` vêm presentes e marcados no gráfico (T2.6).
   - Nenhum campo de pessoa: o server testa as 53 rotas.
3. **Legibilidade.** Boa. O refactor do O3 e do S2 simplificou o código, e o O3 ficou mais rápido (de cerca de 65 ms para 15 ms, medido na ADR 0003). Detalhes de nível baixo estão abaixo.
4. **Tipos e entradas.** A query das tendências é `strict` (só aceita `dataReferencia`); filtro, pessoa ou data futura devolvem 400, e há testes para isso. Escapes de tipo: achado M2.
5. **Segurança.** Os três pontos que o plano pediu para conferir estão ok:
   - as duas rotas GET usam query `strict`;
   - os DTOs só têm agregados, sem id, título ou pessoa do Acelerato;
   - os redirecionadores apontam para caminho fixo (`/operacional`), e a busca é reconstruída com `URLSearchParams`, sem redirecionamento aberto.

   Nenhum achado vira cartão para o `security-engineer`.
6. **Performance.** A tendência ficou em 16,6 ms a frio no fluxo e 4,2 ms na Sustentação (C3 < 50 ms). Na API, o pior caso medido sem cache foi 77,6 ms (A1 < 300 ms). Tudo está registrado na ADR 0003. A medição A1/A2 contra o Postgres real ficou para o QA (`perf-api.spec.ts`). A visão Sustentação é um chunk sob demanda, com pré-carga por intenção. Bundle e Lighthouse ficam com o QA (Q3).
7. **Testes.**
   - Cobertura de 100%.
   - Bordas cobertas: mês em curso, último dia do mês, ordem neutra, arquivados contam, descartados e subtarefas ficam fora, mudança de critério, mês vazio = 0, `S3.janela` com período custom.
   - Tabelas da 4.1, 4.2 e 4.3, com teste de unicidade dos hashes.
   - Lacuna: o caso de O3 com erro no Resumo (M1).
8. **Acessibilidade.**
   - Há um `aria-live` próprio do seletor.
   - O foco volta ao rádio.
   - Cada série tem "Ver como tabela" com `aria-pressed`.
   - Os blocos são `section` com `h2`.

   A revisão visual é do `ux-designer`.
9. **Documentação.**
   - Atualizados: `docs/api/metricas.md`, a OpenAPI, os contratos gerados, `biblioteca-de-calculo.md` e a ADR 0003.
   - **Faltou** `docs/tecnica/arquitetura-front.md` (B1, abaixo).
10. **Commits.** Seguem Conventional Commits em português, um por tarefa (F1 a F8). A PR entra por squash.

### Achados da volta 1

#### Bloqueante
- **B1 · react-frontend** · `docs/tecnica/arquitetura-front.md:17`, `:158`, `:159` (e o resto do documento).
  - **Problema:** a documentação técnica do front descreve o sistema anterior.
    - O diagrama ainda tem a página `sustentacao`.
    - Os filtros da sustentação aparecem sem o prefixo `sust_`.
    - `cadencia` aparece como parâmetro local com `replace`, mas agora a escolha é `push` e a correção da URL é `replace` (`useVisaoOperacional`).
    - Não há nada sobre o Resumo, `visao.ts` (tabela hash → visão), `RedirecionaSustentacao`, `LinhaFiltrosGuardados`/`contarAtivos`, `atencao.ts`, `GraficoMensal`/`SerieMensal`, `handle.titulo` como função nem `dominiosDaRota` por visão.
  - **Correção:** atualizar o documento no mesmo intervalo de commits. Itens mínimos:
    - as quatro visões e a URL canônica;
    - a tabela hash → visão;
    - os dois conjuntos de filtros na mesma URL;
    - os redirecionadores;
    - o Resumo, que não calcula e só reorganiza DTOs (origem de cada número, tabela 4.5 do plano);
    - o modo mock `tendencia-poucos`.
  - **Severidade:** bloqueia (`praticas.md` 7.7 e item 10 da seção 8).

#### Médio
- **M1 · react-frontend** · `web/src/features/operacional/resumo/TendenciaFluxo.tsx:60` e `SerieMensal.tsx:49,77`.
  - **Problema:** quando o O3 falha, `o3` fica `undefined` e o tipo também. Como a tendência só espera o O3 sair de `carregando`, ela dispara mesmo com erro. Aí `serieP85` devolve todos os meses sem valor (n=0), e a série mostra "Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens". A frase é falsa: o histórico existe, só não se sabe o tipo.
  - **Correção:** sem tipo, por erro do O3, mostrar um estado próprio, por exemplo "P85 indisponível: não foi possível carregar o tempo de ciclo" com "Tentar de novo" ligado ao O3, ou esconder só a série de P85. Incluir um teste de integração com `mock=erro:O3`.
- **M2 · react-frontend + node-backend** · `web/src/features/operacional/resumo/consultas.ts:45-46`, `BlocoFluxo.tsx:35`, `BlocoSustentacao.tsx:22`.
  - **Problema:** são dois escapes de tipo seguidos e sem comentário: `as Record<string, never>` e depois `as never`. O contrato tipa os filtros de `TENDENCIA_*` como `Record<string, never>`, mas o front precisa mandar `dataReferencia`. O `praticas.md` (seção 2) não aceita escape sem justificativa, e `as never` desliga a checagem da chamada inteira.
  - **Correção:** o `node-backend` tipa no contrato `TENDENCIA_FLUXO`/`TENDENCIA_SUST` como `Par<{ dataReferencia?: string }, …>`, ou cria um tipo `SoDataReferencia` compartilhado com `VISAO_GERAL`/`PV1`. O `react-frontend` remove os dois casts.
- **M3 · node-backend** · `packages/metricas/src/varredura.test.ts:70`.
  - **Problema:** o teste de varredura do fluxo passa de 15 s quando o `pronto` roda com a máquina carregada, e o `pnpm -r` para no primeiro erro. Isolado, ele leva cerca de 2 s. O `pronto` da raiz ficou vermelho por causa dele nesta rodada. O teste não é novo, mas este diff mexeu nele.
  - **Correção:** dar a ele um limite explícito e folgado, como pede a seção 4 (por exemplo `{ timeout: 60_000 }`, com comentário sobre a medição), ou dividir a varredura do fluxo por métrica (`it.each`). Não aumentar o `testTimeout` global.

#### Baixo
- **L1 · react-frontend** · `web/src/features/operacional/resumo/modelo.ts:275-279`.
  - **Problema:** `fraseDaSerie` subtrai os P85 brutos (duas casas) e arredonda a diferença. Ela pode não bater com os valores mostrados (14,4 → "14" e 12,6 → "13" geram "2 a menos"). Além disso, é a tela derivando um número.
  - **Correção:** calcular a diferença a partir dos valores já arredondados para exibição ou, se o arquiteto preferir, levar o delta para o DTO.
- **L2 · software-architect** · `docs/architecture/adr/0019-tendencia-mensal-por-data-de-referencia.md:23`.
  - **Problema:** a ADR rejeita a alternativa "contexto de hoje" porque "um card reaberto depois do fim do mês muda o ponto passado". A solução escolhida tem a mesma propriedade: o índice é o da base atual, e o `docs/api/metricas.md` já diz isso corretamente.
  - **Correção:** reescrever o motivo da rejeição (a diferença real é a janela por ponto e o mesmo núcleo da métrica de origem, não uma reconstrução histórica).
- **L3 · node-backend** · `packages/contratos/src/schemas.ts:1308`.
  - **Problema:** `mesCivil = z.string()`.
  - **Correção:** usar `z.string().regex(/^\d{4}-\d{2}$/)`.
- **L4 · node-backend** · `server/src/modulos/metricas/rotas.ts:20`.
  - **Problema:** `TENDENCIAS` é uma lista escrita à mão. Um terceiro id sem filtro precisaria ser lembrado aqui.
  - **Correção:** derivar de `ContratoMetricas` (os ids sem filtro) ou de um marcador em `REGRAS_METRICA`, junto com `VISAO_GERAL` e `PV1`.
- **L5 · react-frontend** · `web/src/features/operacional/SeletorVisao.tsx:12`.
  - **Problema:** `let focoPendente` é estado de módulo e vaza entre montagens e entre testes.
  - **Correção:** levar o estado para a `OperacionalPage` (um `useRef` passado ao seletor) ou para o `state` da navegação.
- **L6 · react-frontend** · `web/src/features/operacional/useVisaoOperacional.ts:25`.
  - **Problema:** `const state = bruto` é uma variável sem função.
  - **Correção:** remover a linha.
- **L7 · react-frontend** · `web/src/lib/destinoCartao.ts:2` e `web/src/features/coleta/fontes.ts:2`.
  - **Problema:** `lib/` e `coleta/` passaram a importar `features/operacional/visao`, e a dependência ficou invertida.
  - **Correção:** mover `visao.ts`, que é puro, para `lib/` ou `features/navegacao/`.
- **L8 · react-frontend** · `web/src/features/operacional/components/CartaoO3.tsx:24`.
  - **Problema:** a regra do tipo predominante está duplicada. O número do Resumo e a aba padrão do O3 precisam usar sempre o mesmo critério.
  - **Correção:** usar `tipoPredominante` de `resumo/modelo.ts` (ou movê-lo para `atencao.ts`/`lib`).

#### Para o `ux-designer` (não bloqueia o review)
- `BlocoSustentacao.tsx:174`: "Nada pede atenção na Sustentação na semana." O Resumo da Sustentação agora usa 12 semanas (P3), então "na semana" não é preciso.
- Pela P3, o "Pede atenção" da Sustentação no Resumo usa 12 semanas, e o da visão Sustentação usa 6 meses. O mesmo alerta pode aparecer num lugar e não no outro. Vale conferir se a janela escrita em cada lugar basta como explicação.

### Ajustes por autor (volta 1)
- **react-frontend:** B1 (bloqueia), M1, M2 (remover os casts), L1, L5, L6, L7, L8.
- **node-backend:** M2 (tipo do contrato), M3, L3, L4.
- **software-architect:** L2.

### Riscos e mudanças de contrato
- Contrato:
  - dois `MetricaId` novos (53 no total);
  - `ResultadoS3.janela` passa a ser **obrigatório** na resposta. É compatível para quem lê, mas um consumidor que valida com o schema antigo continua passando, e um que gera S3 por fora precisa do campo.
  - os ids de seção da Sustentação mudaram (`sust-*`), e os hashes antigos são redirecionados.
- `/sustentacao` virou redirecionador, e o padrão de `/operacional` agora é o Resumo. Links externos para `/operacional` sem `cadencia` passam a cair no Resumo, e não mais na Diária.
- A medição A1/A2 contra o Postgres real está pendente com o QA.

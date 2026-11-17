# K-405: diagnóstico da lentidão dos testes do web no CI (pedido 105, E7.545)

Documento de diagnóstico, não parecer. Nada de código, workflow ou configuração foi mudado: a correção é outra etapa, com review (`R-REVIEW`). Custo novo: zero (`R-CUSTO`); toda proposta cabe no runner gratuito atual.

## 1. O problema, em números

Fonte: logs do job `testes` do `ci.yml` (`gh run view --job <id> --log`, ANSI removido). Dois runs completos do passo `pnpm run cobertura`:

| Run | Resultado | Passo `cobertura` | Web (vitest, 117 arquivos, 1907 testes) | Arquivo mais lento |
|---|---|---|---|---|
| 44133668763 (job 134217436252) | verde | 13 min 36 s | 671,96 s (`Duration`) | `operacional/semanal.test.tsx`, 23 testes, 119,8 s |
| 44152926464 (job 134286032639) | vermelho | 21 min 15 s | 1057,12 s | o mesmo, 191,1 s |

- Soma do tempo de parede por arquivo: 2213 s no run verde (mediana 8,5 s por arquivo) e 3469 s no vermelho (mediana 12,7 s). Dividido por 4 workers dá 553 s, coerente com os 672 s do `Duration`.
- No vermelho, 7 testes em 5 arquivos falharam com `Unable to find an element by: [data-testid=...]`: é a espera de 5 s de `findBy`/`waitFor` estourando por lentidão, sem erro de valor (o mesmo sintoma que o #546 contornou).
- Na estação (16 núcleos, compartilhada), o `pronto` do web rodou os 119 arquivos em 260,17 s (`/tmp/pronto-web.log`, `Duration  260.17s`), 2,6 vezes menos que os 672 s do runner no melhor caso.
- Do `Duration` do web no runner: `tests 85%, environment 7%, import 4%, setup 2%, transform 1%`, e `117 workers spawned · ~1,81 s startup each` (run verde; 2,91 s no vermelho). Ou seja, a lentidão está **dentro do teste** (render), não em import, transform nem montagem do ambiente.

## 2. Causa provável

**Contenção de CPU: processos demais para os núcleos do runner, todos medidos ao mesmo tempo.** Três evidências independentes e uma hipótese que ainda falta medir.

### 2.1 O runner tem 2 vCPU e o passo roda tudo junto

- O repositório é privado (`gh api repos/rodrigo-isensee/MetricasDSPD --jq .visibility` = `private`) e os jobs usam `runs-on: ubuntu-latest` (`.github/workflows/ci.yml:41`, `homolog.yml:68`). Pela documentação do GitHub, o runner padrão de repositório privado tem 2 vCPU e 7 GB; o de público tem 4. A estação tem 16 (`nproc`). **Os logs não imprimem a contagem de CPU: este número é da documentação, não do log** (lacuna fechada no passo 1 da proposta).
- `ci.yml:53` roda `pnpm run cobertura`, que é `pnpm -r --if-present run cobertura` (`package.json:22`): todos os pacotes em paralelo, até a concorrência padrão do pnpm (4). A linha do tempo do log mostra a sobreposição: `packages/mock` e `packages/metricas` rodam das 17:10:17 às 17:11:34 e 17:12:28; **`server` e `web` começam juntos às 17:12:28 e rodam juntos até 17:23:07 (server, 638,68 s) e 17:23:40 (web, 671,96 s)**.
- Dentro dessa janela competem: web com `maxWorkers: 4` (`web/vite.config.ts:79`), server com os workers padrão do vitest (sem `maxWorkers` em `server/vitest.config.ts`) e a cobertura v8 dos dois, tudo em 2 vCPU. A estação tem folga de 8x em núcleos e mesmo assim o `vite.config.ts:62-71` já registra tempo de 2 a 4x sob carga (`load` 6 a 14): é o mesmo mecanismo, só que pior no runner.
- `maxWorkers: 4` foi calibrado na estação (K-054, comentário em `web/vite.config.ts:77-79`, "4 workers baixam o pico por teste de ~15 s para ~4 s"). No runner com 2 vCPU, 4 workers só adicionam troca de contexto e memória (jsdom por worker).

### 2.2 O custo está no render, não na preparação

- `tests 85%` do `Duration` e `startup` de 1,8 s por arquivo (spawn + jsdom) somam 117 x 1,81 s = 212 s de trabalho, cerca de 53 s de parede com 4 workers: relevante, mas só 8% do total. Não explica os 120 s de um arquivo.
- Hipótese "base fictícia montada por arquivo" (`web/src/test/setup.ts`, comentário "A primeira chamada gera a base fictícia"): **enfraquecida**. O teste de desempenho do gerador no mesmo log mede `gerador: 296 ms de CPU (limite 2708 ms, fator 1.81)` (`packages/mock`, log de 17:10:23, run verde). Gerar a base custa cerca de 0,3 s de CPU; mesmo a 1x por arquivo seriam 117 x 0,3 s, uns 35 s de CPU no total, sem explicar 100 s por arquivo. O que pesa é montar a página inteira (jsdom + Recharts, `web/vite.config.ts:62-71`: "20 de 830 passam de 5 s"), o que já era conhecido.
- Hipótese "transform/import": descartada pelo próprio `Duration` (transform 1%, import 4%).

### 2.3 O que ainda não está medido (por isso é "provável")

- **Cobertura v8 ligada versus desligada no web** no runner: não há run com os dois. O v8 em jsdom costuma custar de 10% a 30% sobre o teste, mas não há número deste repositório. Medir no passo 2.
- **Web sozinho** no runner: nunca rodou isolado; todo número acima tem server e/ou metricas competindo. Sem isso não se separa "runner lento" de "contenção".
- **Isolamento** (`isolate`, um worker por arquivo, 117 spawns): custo medido em 8% do total, e desligar é inseguro com jsdom e `localStorage`/mocks de módulo; fica fora da proposta.

Conclusão: o fator dominante é contenção (5 processos ativos, mais v8, em 2 vCPU), com render pesado de Recharts + jsdom como carga. Os 100 a 110 s por arquivo do relato batem com a cauda medida (80 a 120 s nos 6 maiores do run verde, até 191 s no vermelho), que são os arquivos que montam painéis inteiros (`semanal`, `apontamento`, `visoes`, `preferencias`, `barra-e-ramos`, `espera-invisivel`).

## 3. Proposta de correção em passos

Meta: espera assíncrona de volta a 5000 no CI e variável `METRICAS_DSPD_ESPERA_ASYNC_MS` retirada (`ci.yml`, `homolog.yml`, `web/vite.config.ts`, `web/src/test/setup.ts`, na versão do #546). Cada passo é uma etapa própria, com review do `tech-lead` e parecer de devops quando tocar `.github/`. A edição de workflow é preparada em branch local e enviada pelo dono (sem escopo `workflow` no token); `ci.yml` e `homolog.yml` são arquivos protegidos, então o PR pede o rótulo `afrouxa-regra` do dono (aviso ao `tech-lead`).

**Passo 1. Medir antes de mexer (risco nulo, ganho: dado).** No passo `cobertura` do `ci.yml`, imprimir `nproc`, `free -m` e `uptime` antes de rodar, e separar o web em passo próprio com `time`: `pnpm -r --if-present --filter '!@metricas-dspd/web' run cobertura` seguido de `pnpm --filter @metricas-dspd/web run cobertura`. Com isso um único run responde duas perguntas: quantos núcleos o runner tem e quanto o web leva sozinho. Ganho esperado: nenhum de tempo, e sim a evidência para escolher entre os passos 2 e 3. Risco: baixo; o filtro mexe na ordem e na saída do job (o resumo de cobertura e o artefato continuam lendo `*/coverage`).

**Passo 2. Rodar o web sozinho e com workers do tamanho do runner (principal).**
- 2a. Manter a separação do passo 1 (web depois dos demais, sem concorrência). Ganho esperado: o web deixa de dividir 2 vCPU com o server; estimativa 672 s para algo entre 350 e 450 s (hipótese: 260 s na estação com 16 núcleos, escala parcial; confirmar no run do passo 1). Risco: o job total pode subir se o server ficar sozinho mais tempo; como o server leva 638 s e o web 672 s hoje em paralelo, a soma sequencial pode passar de 20 min. Se passar, 2b compensa ou se aplica o passo 4.
- 2b. `maxWorkers` do web condicionado ao ambiente: `maxWorkers: process.env.CI ? 2 : 4` em `web/vite.config.ts:79` (o `K-054` fica valendo na estação). Ganho esperado: menos troca de contexto e memória em 2 vCPU; risco: menor paralelismo, que só se confirma medindo (comparar 2 e 3 no mesmo run de teste, uma matriz de experimento descartável em branch `melhoria/*`, sem merge). Dono: `devops-engineer` (workflow) e `react-frontend` (arquivo `vite.config.ts`, que é de produto web).

**Passo 3. Medir a cobertura v8 (decide se vale cortar).** Run descartável com `vitest run` sem `--coverage` no web, comparado com o com cobertura. Ganho esperado: 10% a 30% se a hipótese valer. Risco: **não se desliga a cobertura de 100% para ficar verde** (`R-VERIFY`); o experimento só informa. Se o custo for alto, a saída é `coverage.provider: 'istanbul'` ou cobertura só no job de homolog, o que é decisão do `qa-engineer`/`tech-lead` e da `docs/qa/estrategia-de-cobertura.md`, não do devops.

**Passo 4. Particionar só se os passos 1 a 3 não bastarem.** `vitest --shard=N/3` em matriz de 3 jobs com `--reporter=blob` e `vitest --merge-reports` no fim para a cobertura 100% (o limite é sobre o total). Ganho: duração do web dividida por cerca de 3. Risco e custo: **3x os minutos do web** e complexidade do merge de cobertura; repositório privado tem franquia mensal gratuita limitada, então só com o checkpoint do passo 6 mostrando folga (`R-CUSTO`). É o último recurso, coerente com o A1 do parecer do #546 (particionar se passar de ~20 min).

**Passo 5. Devolver a espera para 5000 e validar a variável.** Só depois do passo 2 (ou 3, ou 4) provar, em pelo menos 3 runs seguidos do `ci.yml` e 1 do `homolog.yml`, zero falha de `Unable to find` com 5000.
- Retirar `METRICAS_DSPD_ESPERA_ASYNC_MS: '15000'` de `ci.yml:54-56` e `homolog.yml`, e o `test.env` de `web/vite.config.ts` (linha 76 do #546).
- **A1 do review do #546 (variável vazia ou não numérica).** Em `web/src/test/setup.ts`, `configure({ asyncUtilTimeout: Number(process.env.METRICAS_DSPD_ESPERA_ASYNC_MS) })`: variável vazia vira `Number('') === 0` (espera de 0 ms, todo `findBy` falha na hora) e `abc` vira `NaN`; e o `?? '5000'` do `vite.config.ts` não cobre string vazia (`env: VAR: ''` no YAML passa). Enquanto a variável existir, o setup deve ler assim: `const bruto = process.env.METRICAS_DSPD_ESPERA_ASYNC_MS?.trim()`, tratar `undefined` ou `''` como 5000, e **falhar na partida** (`throw new Error`) se `Number(bruto)` não for inteiro positivo, em vez de cair em 0 ou NaN silenciosamente. Se a variável for retirada (meta), o problema some junto: `setup.ts` volta a `configure({ asyncUtilTimeout: 5000 })` literal. Se por algum motivo ela ficar, o teste unitário dessa leitura (vazio, `abc`, `-1`, `0`, `15000`) é do `qa-engineer`. Dono do código: `react-frontend`.
- O `testTimeout` de 90 s (`web/vite.config.ts:70-71`) fica como está nesta etapa; reduzi-lo depois do passo 2 é cartão à parte (hoje ele mascara arquivo lento, e o orçamento real é o E2E de desempenho, ADR 0003).

**Passo 6. Checkpoint de tempo e minutos por release (A1 e A2 do parecer `docs/devops/105-ci-timeout-testes.md`).** Uma vez por release, antes do PR `homolog` -> `main`, o `devops-engineer` mede e registra no parecer da release (`docs/devops/<release>.md`):
- duração por workflow e job: `gh run list --workflow ci.yml --branch develop --limit 30 --json databaseId,conclusion,createdAt,updatedAt` e, por run, `gh run view <id> --json jobs --jq '.jobs[]|{name,conclusion,startedAt,completedAt}'`; passo do web: o `Duration` no log do job `testes`;
- minutos: soma de `completedAt - startedAt` dos jobs por run (cada job arredonda para cima ao minuto) no mês, comparada à franquia do plano do repositório privado (o teto do plano não está em `gh`; o dono confirma o número em Settings > Billing, e o devops registra "franquia informada pelo dono: X min");
- gatilhos: `testes` acima de ~20 min ou `e2e-parte` acima de ~35 min (A1, hoje 25 e 45 min de teto, `ci.yml:42` e `:200` do #546); pior caso por PR de 25 + 2 x 45 = 115 min contra 75 antes (A2); subiu mais de 20% desde o checkpoint anterior ou passou de 80% da franquia: abrir cartão de melhoria.
- Baseline deste diagnóstico: `testes` 15 min 02 s (run verde 44133668763) e 23 min 03 s (run vermelho 44152926464, 7 falhas por espera de 5 s; o job passou dos 15 min antigos, logo já rodava com o teto de 25 min do #546). Esses são os números a comparar no primeiro checkpoint.

## 4. Ordem e esforço

| Passo | Dono | Esforço | Depende de |
|---|---|---|---|
| 1 medir e separar o web | devops-engineer | P | nada |
| 2 web sozinho, `maxWorkers` por ambiente | devops-engineer + react-frontend | P | 1 |
| 3 v8 liga/desliga (experimento) | devops-engineer, decisão do qa-engineer | P | 1 |
| 4 shard (só se preciso) | devops-engineer | M | 1 a 3 e checkpoint do 6 |
| 5 5000 de volta, variável retirada, validação | react-frontend, qa-engineer | P | 2, 3 ou 4 provando 3 runs verdes |
| 6 checkpoint por release | devops-engineer | P | nada |

## 5. Limites desta etapa

- Sem acesso a `nproc` do runner nos logs: a contagem de 2 vCPU vem da documentação do GitHub para repositório privado; o passo 1 a confirma.
- Os dois runs medidos foram os únicos com o passo `cobertura` completo disponíveis na janela recente; os demais foram cancelados por `concurrency`. Amostra de 2: a conclusão de contenção é por convergência de evidências (linha do tempo da sobreposição, mediana, estação 2,6x mais rápida), não por experimento controlado.
- Nenhuma ferramenta foi instalada; nada foi executado no CI além de ler logs.

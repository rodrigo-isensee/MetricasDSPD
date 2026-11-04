# 065: BLOQUEADOS fora do mapa real, e a parte de bloqueio do O1, O2 e O5 como "Sem dado real" (desenho, E1.1)

Pedido 065, cartão K-205. Autor: software-architect. Data: 2026-11-04. Estado: proposta para a E1.2 (node-backend) e a E1.3 (react-frontend).
Código lido na worktree `/home/rodrigoisensee/MetricasDSPD-056d` (develop `2b316e5`). As linhas citadas são dessa worktree.

## Decisões que este desenho cumpre

- DECISÃO DO DONO (2026-11-04), "C": fazer A agora (tirar BLOQUEADOS do mapa real; a tela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (K-204).
- DECISÃO DO DONO (2026-11-04), "isso": mostrar "Sem dado real" também na parte de bloqueio do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), **em vez de zero**. O restante dessas métricas continua publicado.
- ADR 0026, P3: métrica fora do mapa real responde "sem dado real" com o motivo, sem chamar a biblioteca.

## Por que muda (lacuna L1 do 064)

`lerBloqueios` (`server/src/modulos/metricas/repositorio.ts:74-79`) lê `fato_bloqueio`, mas nenhum código fora de teste e do seed grava essa tabela (nem `evt_bloqueio`). A BLOQUEADOS entrou no mapa real no pedido 060 com a premissa "a carga real já lê os bloqueios" (`packages/contratos/src/origem.ts:25-27`, ADR 0026 P3, QV1 "A"): ler ela lê, mas lê uma tabela vazia. Resultado de hoje: BLOQUEADOS diz "Nenhum item bloqueado hoje", O1 diz "0 deles bloqueados", O2 não marca nenhum ponto como bloqueado e O5 soma 0 hora de bloqueio. Todos parecem dado real e não são.

## 1. BLOQUEADOS responde "Sem dado real" (só o contrato muda; o server já faz o resto)

Arquivo: `packages/contratos/src/origem.ts`.

1. Tirar `'BLOQUEADOS'` de `METRICAS_ORIGEM_REAL` (linha 27) e atualizar o comentário da linha 25 citando o pedido 065 e a lacuna L1.
2. Motivo próprio, como o O17 tem o dele: nova constante
   `export const MOTIVO_BLOQUEIOS_NAO_COLETADOS = 'a coleta ainda não grava os bloqueios do quadro'`
   e a entrada `BLOQUEADOS: MOTIVO_BLOQUEIOS_NAO_COLETADOS` em `MOTIVO_ORIGEM_MOCK` (linhas 54-70). O texto final é revisado pelo ux-designer na E1.3. Ele não leva número de cartão interno (K-204) para a tela.
3. Com isso, sem mudar o server: `ServicoMetricas.semDadoReal('BLOQUEADOS')` passa a ser `true` (`server/src/modulos/metricas/servico.ts:235-237`). Então `calcular` devolve `corpoSemDadoReal('BLOQUEADOS')` com `motivo = MOTIVO_BLOQUEIOS_NAO_COLETADOS` antes de ler a base (linha 248), a rota põe `x-estado-dado: sem-dado-real` (`rotas.ts:54`) e o `aquecer` pula a métrica (linha 223).
4. No web, nada novo para a BLOQUEADOS: `HttpFonteMetricas.obter` transforma o corpo em `SemDadoRealErro` (`web/src/data/http/HttpFonteMetricas.ts:116`), e o `CartaoMetrica` mostra `EstadoSemDadoReal` com o motivo da resposta (`CartaoMetrica.tsx:141-146`). A faixa "Pede atenção" (Diária e bloco Fluxo do Resumo) já trata uma das consultas em "sem dado real" como estado `parcial` (`FaixaAtencao.tsx:35-38`), sem afirmar "Nada pede atenção". O `SeloOrigem` e a contagem de `OrigemDosCartoes` leem o mesmo mapa e se ajustam sozinhos.
5. O modo mock explícito (homologação, testes) não muda: com `modoMock`, o portão não vale e a BLOQUEADOS segue calculada sobre o seed, que tem bloqueios.

## 2. O1, O2 e O5: só a parte de bloqueio sai como "Sem dado real"

### 2.1 Princípio

As três métricas continuam no mapa real e continuam calculadas pela biblioteca, sem nenhuma mudança na fórmula. Depois do cálculo, e só na base real, o server **retira o valor da parte de bloqueio** (vira `null`, nunca `0`) e **anexa uma nota do contrato** que diz que essa parte não tem dado real e por quê. O resto do resultado (WIP total, limite, idade, percentis, eficiência) não é tocado.

É o mesmo padrão da H-24, que já roda em produção: o O3 sem SLE na base real recebe `notas: ['sle-nao-definido']` depois do cálculo (`servico.ts:294`); o contrato aceita `notas` opcional (`schemas.ts:147`); o web as mostra pelo `notasDoCartao` (`CartaoMetrica.tsx:114-121` e `268-280`; `CartaoO3.tsx:41`).

### 2.2 Por que o existente não basta, e o que se reusa

- O corpo `SemDadoReal` (`origem.ts:80-88`) é `strict` e **substitui o resultado inteiro**. Usá-lo no O1, no O2 ou no O5 esconderia o WIP, a idade e a eficiência, que são reais. Isso contraria o "sem esconder o resto" da decisão. Não serve para uma parte.
- **Reusa-se** o mecanismo de notas da H-24 (`TEXTO_NOTA_CARTAO`, `NOTA_CARTAO_IDS`, `notaCartaoIdSchema`, prop `notasDoCartao`). Entra **um id novo** nesse enum, não um mecanismo novo. É a nota que diz ao web qual parte trocar, e o texto dela traz o "Sem dado real" e o motivo.
- O `null` é necessário além da nota. Sem ele, a API e a exportação continuariam com `bloqueados: 0` e `horasBloqueio: 0`, que é o número enganoso que o dono recusou. No O2, `bloqueioMotivo: null` já significa "não bloqueado" (`schemas.ts:133`). Por isso o O2 depende só da nota: o `null` sozinho seria ambíguo.

### 2.3 Contrato (`packages/contratos`)

`origem.ts`:
- `TEXTO_NOTA_CARTAO['bloqueio-sem-dado-real'] = 'Bloqueios: sem dado real (' + MOTIVO_BLOQUEIOS_NAO_COLETADOS + ').'` e o id em `NOTA_CARTAO_IDS`. O texto vem da mesma constante do motivo da BLOQUEADOS, de modo que os dois mudam juntos.
- `export const METRICAS_COM_PARTE_DE_BLOQUEIO: readonly MetricaId[] = ['O1', 'O2', 'O5']`. É a lista única que o server aplica e os testes conferem.
- `export const BLOQUEIOS_COM_DADO_REAL = false`. É o interruptor que o K-204 vira (seção 5). Sem ele, o K-204 teria de procurar o comportamento espalhado.

`schemas.ts`. Muda o contrato da API, e só nestes campos:

| Métrica | Campo | Hoje | Passa a |
|---|---|---|---|
| O1 | `hoje.bloqueados`, `porColuna[].bloqueados`, `porTipoColuna[].bloqueados`, `serie[].bloqueados` | `z.number()` | `z.number().nullable()` |
| O1 | `notas` | (não existe) | `z.array(notaCartaoIdSchema).optional()` |
| O2 | `itens[].bloqueioMotivo` | `enum.nullable()` | igual (sem mudança) |
| O2 | `notas` | (não existe) | `z.array(notaCartaoIdSchema).optional()` |
| O5 | `tipos[].estatistica.valor.horasBloqueio` | `z.number()` | `z.number().nullable()` |
| O5 | `notas` | (não existe) | `z.array(notaCartaoIdSchema).optional()` |

Nada muda na BLOQUEADOS (`resultadoBloqueados`). Ela passa a responder o `SemDadoReal` que a rota já aceita (`rotas.ts:41`). O `resultadoO2PaginadoSchema` herda o campo `notas` do O2: conferir na E1.2. O node-backend atualiza `docs/api/metricas.md` (O1, O2, O5 e BLOQUEADOS). O formato exato da nota fica com ele.

### 2.4 Server

- Novo módulo puro `server/src/modulos/metricas/parte-sem-dado.ts` com `semParteDeBloqueio(id, resultado)`:
  - O1: põe `null` em `hoje.bloqueados` e no `bloqueados` de cada linha de `porColuna`, `porTipoColuna` e `serie`.
  - O2: não mexe nos itens, porque `bloqueioMotivo` já sai `null` com `fato_bloqueio` vazio.
  - O5: põe `null` em `horasBloqueio` de cada tipo com `estatistica.status === 'ok'`.
  - Nos três: junta `'bloqueio-sem-dado-real'` a `notas`, sem repetir e sem apagar outra nota.
  - Não calcula nada: não soma, não refaz percentil, não muda `n` nem base amostral.
- `servico.ts`, logo depois de `calcularMetrica` (linha 292) e junto da regra H-24 (linha 294): `if (real && !BLOQUEIOS_COM_DADO_REAL && METRICAS_COM_PARTE_DE_BLOQUEIO.includes(id)) resultado = semParteDeBloqueio(id, resultado)`. O resultado já tratado é que vai para o cache (linha 295). A chave do cache muda sozinha com a versão de critério nova (seção 4).
- `repositorio.ts` e `mapa.ts` não mudam. `lerBloqueios` continua lendo a tabela, que vem vazia na base real e cheia no seed. Assim o modo mock continua mostrando bloqueios, e o K-204 não precisa religar a leitura.
- Por que a troca fica no server e não na biblioteca: a biblioteca não sabe se a base é real ou seed, e a mesma base do seed precisa mostrar bloqueios na homologação. A troca não é cálculo, é publicação, como a H-24. A regra "todo cálculo pela biblioteca" continua valendo: nenhum número novo nasce no server.

### 2.5 Web: precisa de mudança (E1.3), não basta o server

Sem ajuste, o O1 deixaria de compilar (`c.itens - c.bloqueados` com `null`, `CartaoO1.tsx:51` e `79`) e o O2 desenharia a legenda "anel: bloqueado" sem nenhum anel. Cada cartão decide pela nota (`d.notas?.includes('bloqueio-sem-dado-real')`), que é o único sinal, e não pelo `null`.

- `web/src/features/operacional/components/CartaoO1.tsx`: repassar `notasDoCartao={d?.notas}`. Na frase de leitura (linha 17), em vez de "N deles bloqueados", usar "bloqueados: sem dado real". Nas barras (linhas 44-90), quando houver a nota, só a série "Itens" (`livres = itens`), sem a série "Bloqueados (contam no WIP)". O WIP total segue igual, porque o bloqueado já contava dentro dele.
- `web/src/features/operacional/components/CartaoO2.tsx`: repassar `notasDoCartao`. Com a nota, tirar `anel: 'bloqueado'` da `legendaFormas` (linhas 118-123), e a coluna "Bloqueado" da tabela (linhas 188 e 197) mostra "Sem dado real" no lugar de "—". Assim "não bloqueado" e "não sabemos" deixam de parecer iguais. A forma do ponto (linhas 67-74) não muda: sem motivo, nunca vira anel.
- `web/src/features/complementares/fluxo.tsx` (`CartaoO5`): repassar `notasDoCartao` pelo `CartaoComplementar` (se ele não repassa, passa a repassar para o `CartaoMetrica`). Com a nota, a leitura (linha 34) e o "Leia" (linha 64) não dizem mais "o restante é fila e bloqueio". Dizem que bloqueio está sem dado real. As barras de percentual seguem (ver a pergunta Q-065-1).
- `CartaoBloqueados.tsx`, `AtencaoFluxo.tsx`, `BlocoFluxo.tsx`, `atencao.ts`: sem mudança de código (seção 1, item 4). A E1.3 só confere com teste.
- A fonte mock do web (`VITE_FONTE=mock`) não traz a nota, então os cartões seguem como hoje. O ux-designer revisa os textos e a ausência da série nas barras. A marca não pode depender só de cor: a nota tem ícone e texto (`CartaoMetrica.tsx:274-276`).

## 3. Regras invioláveis

- **Nenhuma métrica por pessoa:** nada novo exposto. A BLOQUEADOS segue sem responsável, e a nota não traz dado de card.
- **Biblioteca compartilhada:** a fórmula do O1, do O2 e do O5 não muda, e o server só retira e anota (2.4).
- **BusinessMap e Acelerato:** só tabelas do `S.bm`, sem mistura.
- **Abaixo de 20 itens:** não muda. Quando o O5 está `insuficiente`, não há `horasBloqueio` para anular.
- **Nunca sobrescrever histórico:** nada é apagado nem regravado na base. A mudança é só na resposta.
- **T2.6 (mudança de critério registrada com data e marcada nos gráficos):**
  - Nova `VersaoCriterio` em `packages/metricas/src/core/criterios.ts`, incluída em `VERSOES_DA_BIBLIOTECA` (o mecanismo já existe, linhas 114-137): `{ id: 'criterio-2026-11-04-bloqueio-sem-dado-real', data: '2026-11-04', descricao: 'Na base real, a parte de bloqueio passou a sair como "Sem dado real" (antes saía zero): a coleta ainda não grava os bloqueios', afeta: ['O1', 'O2', 'O5'] }`.
  - `marcacoesNoPeriodo` passa a marcar 2026-11-04 nas séries dessas métricas.
  - A BLOQUEADOS não entra em `afeta`, porque não tem série e passa a responder o estado "sem dado real".
  - Ressalva: a versão também aparece no modo mock, onde os bloqueios do seed seguem visíveis. O texto diz "na base real" por isso.

## 4. Testes que provam (E1.2 e E1.3 escrevem; E1.5 confere)

Contrato (`packages/contratos/src/origem.test.ts`, que hoje afirma o contrário nas linhas 19-24 e 114-116):
- C1. `origemDaMetrica('BLOQUEADOS') === 'mock'`, e o conjunto real tem 20 ids (eram 21).
- C2. `motivoSemDadoReal('BLOQUEADOS') === MOTIVO_BLOQUEIOS_NAO_COLETADOS`, e não o texto genérico.
- C3. `resultadoO1`, `resultadoO2` e `resultadoO5` aceitam `notas: ['bloqueio-sem-dado-real']` e recusam id fora do contrato. O1 e O5 aceitam `null` nos campos da tabela 2.3.

Server (unitário com dublê de banco, ao lado de `server/tests/painel-real-f6.test.ts`; e `.pg.test.ts` na base real de teste):
- S1. Base real com `fato_bloqueio` vazia: `GET /api/v1/metricas/BLOQUEADOS` responde 200 com `{ estado: 'sem-dado-real', metrica: 'BLOQUEADOS', motivo: MOTIVO_BLOQUEIOS_NAO_COLETADOS }` e cabeçalho `x-estado-dado: sem-dado-real`, sem `itens`.
- S2. O1 real: todo `bloqueados` vem `null`, `notas` contém `'bloqueio-sem-dado-real'`, e `hoje.total`, `limite`, `acimaDoLimite`, `diasDentroDoLimite` e `serie[].wip` são iguais ao cálculo da biblioteca sem a troca (prova de que nada além da parte foi tocado).
- S3. O2 real: `notas` contém a nota, e `itens`, `tipos` e `acimaP95` são iguais ao cálculo da biblioteca.
- S4. O5 real: `horasBloqueio` vem `null` nos tipos `ok`, e `medianaPct`, `agregadaPct`, `horasExecucao`, `horasFila` e `n` são iguais ao cálculo da biblioteca.
- S5. O3 sem SLE continua com `notas: ['sle-nao-definido']`, sem a nota nova (a troca não vaza para outra métrica).
- S6. `modoMock: true` com seed que tem bloqueios: BLOQUEADOS calculada com itens, O1 com `bloqueados > 0` e sem a nota.
- S7. `criterios` do O1, do O2 e do O5 trazem a versão `criterio-2026-11-04-bloqueio-sem-dado-real`.

Web (Vitest e Testing Library, fonte API simulada):
- W1. O cartão BLOQUEADOS mostra `estado-sem-dado-real-BLOQUEADOS` com o motivo e não mostra "Nenhum item bloqueado hoje" (`bloqueados-nenhum` ausente).
- W2. O1 com a nota: a frase diz "sem dado real" para bloqueados, nenhum "0 deles bloqueados", e a série "Bloqueados" não aparece nas barras. O número do WIP total aparece.
- W3. O2 com a nota: a coluna "Bloqueado" mostra "Sem dado real", a legenda não tem "bloqueado", e a dispersão e as linhas P50/P85/P95 aparecem.
- W4. O5 com a nota: a nota aparece em `notas-cartao-O5`, as barras de eficiência aparecem e o texto não diz "fila e bloqueio".
- W5. A faixa "Pede atenção" (Diária e Resumo) com BLOQUEADOS sem dado real fica em estado `parcial` e lista os itens do O2 e do O1.

E2E (`e2e/tests-api`, projetos `*-api`): o cartão BLOQUEADOS não mostra número. É a mesma verificação que a ADR 0026 P5 já pede para os cartões fora do mapa, agora com a BLOQUEADOS incluída.

## 5. O que volta quando o K-204 gravar bloqueios

O K-204 (pedido próprio) faz a coleta gravar `fato_bloqueio` e `evt_bloqueio` a partir do `block_reason` do staging. Quando ele fechar, com prova de linhas reais na base:

1. `origem.ts`: `'BLOQUEADOS'` volta a `METRICAS_ORIGEM_REAL`, sai de `MOTIVO_ORIGEM_MOCK`, e `BLOQUEIOS_COM_DADO_REAL` passa a `true`. O server para de anular a parte e de anexar a nota sem outra mudança de código. O id da nota e a lista `METRICAS_COM_PARTE_DE_BLOQUEIO` podem sair na mesma entrega.
2. Os campos `null` da tabela 2.3 podem voltar a `z.number()`, ou ficar `nullable`, decisão do node-backend no K-204. Os ramos "sem dado real" dos três cartões do web saem.
3. Nova `VersaoCriterio` com a data da primeira coleta com bloqueios: "a parte de bloqueio voltou com dado real a partir de AAAA-MM-DD". Ela marca nas séries do O1, do O2 e do O5 o degrau esperado. O O5 cai quando o tempo bloqueado deixar de contar como fila ou execução.
4. Histórico: o K-204 diz se a coleta recupera bloqueios passados ou só grava daqui em diante. Se só daqui em diante, a BLOQUEADOS ("agora") volta inteira, mas a série do O1 e o O5 da janela de 12 semanas só ficam completos depois de 12 semanas. Esse fato vai no plano do K-204, e não se decide aqui.

## 6. Em aberto (perguntas ao dono, não resolvidas por inferência)

- **Q-065-1 (O5, eficiência):** sem bloqueios na base, o tempo bloqueado de cada card entra como fila ou execução, conforme a coluna (`packages/metricas/src/businessmap/o5.ts:33-40`). O percentual de eficiência pode estar acima do real nos cards que ficaram bloqueados em coluna de execução. A decisão do dono cobre só "horas bloqueadas", e este desenho segue isso: o percentual continua publicado. Proposta para o dono confirmar: a nota do O5 diz também que o tempo bloqueado está somado à fila ou à execução. A alternativa é o O5 inteiro sair "Sem dado real" até o K-204.
- **ADR 0026:** o P3 diz que a BLOQUEADOS entra no mapa porque "a carga real já lê os bloqueios", e a L1 mostra que a premissa não vale. Quando a ADR (hoje sem commit, worktree 052b) for registrada, ela precisa de uma linha de revisão citando o pedido 065. Este desenho não a edita.

## 7. Divisão

| Etapa | Agente | Depende de | Paralelo com |
|---|---|---|---|
| E1.2 | node-backend: contrato (2.3), server (2.4), versão de critério (3), testes C e S, `docs/api/metricas.md` | este desenho | E1.3 a partir do contrato |
| E1.3 | react-frontend: cartões O1, O2, O5 (2.5), testes W e E2E; ux-designer revisa os textos | contrato da E1.2 | E1.2 (server) |
| E1.4 a E1.6 | tech-lead e qa-engineer | E1.2 e E1.3 | |

Gatilhos de segurança (`R-SEGURANCA`): nenhum. Não muda banco, grant, autenticação, dependência nem dado pessoal.

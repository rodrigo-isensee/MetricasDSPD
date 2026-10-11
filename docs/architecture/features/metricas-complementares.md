# Plano técnico: 17 métricas complementares (dados mockados)

UX: `docs/ux/metricas-fora-do-nucleo/03-ideacao.md` (alternativa A+B), protótipos `docs/ux/figma/prototipos/complementares-*.html`.
Briefing: seção 06 (catálogo), 4.x (regras), 7.1/7.2 (proibidas, anti-meta).

## 1. Definições

Regras comuns: percentis 50/85/95 na janela de `JANELA_PERCENTIS_PADRAO`; abaixo de 20 itens a estatística/taxa não é publicada (`estatistica`, `taxa` de `contratos/comum`; "k de n" permanece); BM e AC nunca se misturam; nada por pessoa; tempo em horas/dias úteis via `core/calendario`; todo percentil/Monte Carlo via `core/`. Cards arquivados e excluídos seguem a regra de cada família (BM: arquivado permanece).

| Id | Fórmula | Granularidade | Fonte | Painel / pergunta |
|---|---|---|---|---|
| O5 Eficiência de fluxo | `horas em colunas de execução (sem bloqueio) ÷ lead do ciclo (início→entrega)`, por tipo; relatada como mediana das razões e razão agregada (soma/soma). Não-execução = fila + bloqueio (`FatoBloqueio`, `FatoTransicao.tipo_coluna`) | story | BM | Operacional / "Por que demora?" |
| O6 Previsibilidade | `P85 ÷ P50` do cycle time (mesma amostra do O3), por classe de serviço, janela 12 sem; alvo exibido "< 2,5" | story | BM | Operacional / "Por que demora?" |
| O8 Tamanho das demandas | mediana, média e % acima do P85 do tempo em execução; cruzado com `tamanho_declarado` (P/M/G). Nunca média isolada (7.2); leia com O3/O4 | story | BM | Operacional / "Por que demora?" |
| O11 Composição do backlog | por mês e tipo: itens em definição (parados em papel `backlog`) × prontos (papel `compromisso`, fila de compromisso); somente retrato mensal (fim do mês); razão pronto÷vazão semanal como "semanas de backlog pronto" | story | BM | Operacional / "O que entra?" |
| O13 Vazão de defeitos | por mês: contagem de entregues `Defeito em produção` e % sobre a vazão total de demandas (mesma definição de `ehDemanda`+bug do O4). Sem alvo de volume | story | BM | Operacional / "Qualidade" |
| O14 Origem da demanda | ranking por `area_solicitante` ou `sistema` (seletor de dimensão; nunca pessoa) do volume entregue/criado, decomposto por tipo; top 10 + "demais" | story | BM | Operacional / "O que entra?" |
| O16 Estoque e idade de bugs | por mês: entrada × correção (bugs = `Bug interno` + `Defeito em produção`); abertos hoje por `severidade`; idade (dias úteis) dos 10 mais antigos (sem título de pessoa); densidade = bugs por entrega concluída no mês (via `origem_bug`) | story | BM | Operacional / "Qualidade" |
| O17 Causa raiz e concentração | contagem de bugs concluídos por `causa_raiz` (domínio fechado, ver 2) e por `sistema` (módulo = sistema, Q a confirmar, 5) | story | BM | Operacional / "Qualidade" |
| T6 Previsão probabilística | `preverTermino` e `preverItens` de `core/montecarlo` sobre a vazão semanal (itens/semana) de UMA classe de serviço de stories na janela; entrada: nº de itens ou nº de semanas; saída P50/P85/P95; `n` = itens da janela | story | BM | Tático / "Quando fica pronto?" |
| T8 Sprint | por sprint: % do comprometido entregue (`entregues_do_comprometido ÷ comprometidos`), carry-over (comprometidos não entregues) e entrada não planejada (`itens adicionados após o início ÷ itens da sprint`). Sem alvo de 100% (7.2) | story | BM | Tático / "Estamos cumprindo o plano?" |
| E4 Iniciadas × concluídas | por trimestre: projetos iniciados (`iniciado_em`), concluídos (`concluido_em`), acumulado em aberto; proporção manter × evoluir (natureza do projeto, ver 2) | projeto | BM | Estratégico / "Estamos terminando ou só começando?" |
| E5 Previsão de término | Monte Carlo (`preverTermino`) sobre a vazão semanal de FRENTES concluídas na janela, para as frentes restantes do projeto; sempre ao lado de frentes adicionadas após o início (`adicionado_apos_inicio_pai`, T9) | frente (resultado por projeto) | BM | Estratégico / "Quando termina?" |
| S8 Taxa de reabertura | `reabertos ÷ incidentes encerrados` por mês: reabertura = novo chamado do mesmo sintoma dentro de N dias (campo `reaberto_de`); meta exibida "< 5%" | chamado (incidente) | AC | Sustentação / "Qualidade" |
| S9 Tempo em pendência | por `motivo_pendencia`: P50/P85/P95 das horas úteis em etapa `Pendente` (`EtapaChamado`); e cumprimento da previsão: `retornos até previsao_retorno ÷ pendências com previsão` | chamado | AC | Sustentação / "Por que demora?" |
| S10 Fila de atribuição | distribuição (P50/P85/P95 + histograma) das horas úteis em `Aguardando atribuição` (escalação→aceite) e `% aceitos em até 15 min` | chamado | AC | Sustentação / "Por que demora?" |
| S11 Avaliação de Problema | `% de chamados P1, P2 e encerrados por contorno com avaliacao_problema registrada` (qualquer valor não nulo) e conversão: `avaliações com Registro de Problema ÷ avaliações` | chamado | AC | Sustentação / "Qualidade" |
| S12 Volume por sistema | distribuição por `categoria_sistema` (mês), recorrentes destacados (>= K chamados do mesmo sistema+sintoma na janela) e `% com excecao_sla_registro_posterior` | chamado | AC | Sustentação / "O que entra?" |

Painel de destino dos tipos: O* e T/E acima conforme a tabela; S* no painel Sustentação. EI não muda.

## 2. O que falta e como mockar sem mexer no hash

Hash a preservar: `hashJson(gerarBaseMock())` = `924448d4` (`mock.test.ts:39`) e `b2bfd4c0` com escala 0.2. As 33 métricas existentes não podem mudar.

Já derivável de `BaseBM`/`BaseAC` (nenhum dado novo): O5 (transições + bloqueios), O6 (mesma amostra do O3), O8 (`tamanho_declarado` + marcos), O11 (transições para papéis backlog/compromisso), O13 (tipo), O14 (`area_solicitante`, `sistema`), O16 (`severidade`, `origem_bug`, datas), T6 e E5 (vazão + `core/montecarlo.ts`, já exportado; o arquivo existe e está no índice), E4 (cards `projeto`), S9 (`EtapaChamado.motivo_pendencia` + `previsao_retorno`), S10 (etapa `Aguardando atribuição`), S11 (`avaliacao_problema`), S12 (`categoria_sistema`, `excecao_sla_registro_posterior`).

Faltam no modelo (não existem em `DimCard`/`Chamado`):

| Campo novo | Usado por | Domínio |
|---|---|---|
| `causa_raiz` por bug | O17 | lista fechada (briefing 4.4): Requisito, Código, Configuração, Dados, Ambiente, Integração, Teste insuficiente (valores finais: decisão 5.2) |
| `sprint` (id, início, fim) e `SprintCard` (card_id, sprint_id, `planejado_na_entrada: boolean`, `entregue: boolean`) | T8 | sprints quinzenais, só em equipes que usam |
| `natureza_projeto: 'Manter' \| 'Evoluir'` por projeto | E4 | fechado |
| `reaberto_de: chamado_id \| null` | S8 | só incidentes |
| `registro_problema: boolean` na avaliação | S11 | derivado de `avaliacao_problema` + flag |
| `sintoma` (rótulo curto) por chamado | S8, S12 recorrentes | lista fechada por categoria |

Solução: NÃO alterar `DimCard`, `Chamado`, `BaseBM`, `BaseAC` nem `gerarBaseMock`. Seguir o precedente de `coletas.ts` (D4: fora da `BaseMock`, hash intacto):

- Tipos novos em `packages/metricas/src/businessmap/extensao.ts` e `acelerato/extensao.ts`:
  ```ts
  export interface ExtensaoBM {
    causasRaiz: Record<string /*card_id*/, CausaRaiz>
    sprints: Sprint[]; sprintCards: SprintCard[]
    naturezaProjeto: Record<string /*card_id projeto*/, 'Manter' | 'Evoluir'>
  }
  export interface ExtensaoAC {
    reabertoDe: Record<string /*chamado_id*/, string>
    sintomas: Record<string, string>
    registroProblema: Record<string, boolean>
  }
  export interface ExtensoesMetricas { bm: ExtensaoBM; ac: ExtensaoAC }
  ```
  Chaves por id em mapas separados: nada de campo opcional nas entidades do núcleo.
- `packages/mock/src/complementares.ts`: `gerarExtensoesMock(base: BaseMock): ExtensoesMetricas`, função pura de `base`, com PRNG `derivar(config.semente, 'complementares')` (stream próprio: não consome o PRNG de bm/ac, logo nada existente muda). Regras de plausibilidade: causa raiz sorteada com pesos (Código 35%, Requisito 25%, Configuração 15%, resto 25%); sprints quinzenais cobrindo a janela, 85-95% das stories do tipo demanda de equipes com WIP entram em uma sprint, 15% `planejado_na_entrada=false`, `entregue` = `concluido_em` dentro da sprint; natureza 60% Evoluir; reabertura em ~4% dos incidentes encerrados (cria vínculo a um chamado existente posterior do mesmo `categoria_sistema`, sem novo chamado, para não tocar `BaseAC`); sintoma: 3 a 5 rótulos por categoria; `registroProblema` em ~30% das avaliações. Garantir >= 20 itens nas séries principais e deixar de propósito 1 série pequena (ex.: sprints de uma equipe) para exercitar `insuficiente`.
- Teste novo: `hashJson(gerarBaseMock())` continua `924448d4`; `hashJson(gerarExtensoesMock(base))` fixado em teste próprio; determinismo por semente.
- `ContextosMetricas` ganha `ext?: ExtensoesMetricas`. Cálculo complementar sem `ext` retorna resultado vazio/`insuficiente` (nunca erro 500); os 33 existentes ignoram `ext`. Sem alterar `criarContextoBM/AC` nem a memoização de `selecionar`.
- Fonte real (PG) futura: as extensões viram tabelas (T1.3, T1.4, T4.2); fora do escopo, registrar como "mock apenas" no catálogo (`status: 'mock'`, ver 3).

Nenhuma das 17 usa cálculo próprio de tempo/percentil: O5, O8, S9, S10 usam `core/calendario`+`percentil`/`estatistica`; O6 divide dois percentis já calculados; T6/E5 usam `montecarlo`.

## 3. Catálogo único e contrato

Existem hoje dois catálogos estáticos, que continuam sendo os pontos únicos (não criar um terceiro):

1. `packages/contratos/src/comum.ts`: `METRICA_IDS` (acrescentar as 17, na ordem do painel). `MetricaId` passa a 50 valores. Efeito em cascata, todos forçados pelo compilador (`satisfies Record<MetricaId,...>`):
   - `contratos/src/schemas.ts` + `validacao.ts`: `resultadoO5` ... `resultadoS12` e entradas em `SCHEMAS_RESULTADO`.
   - `contratos/src/metricas.ts`: `ResultadoO5`..`ResultadoS12`; `ContratoMetricas` (`O5: Fluxo<ResultadoO5>`, ..., `S8: Sust<ResultadoS8>`); `METRICAS_SUSTENTACAO` += S8..S12; `APLICABILIDADE_FLUXO` (parcial; complementares: `['equipe','tipo','sistema','periodo']`, exceto O13/O16/O17 sem `tipo`, O14 sem `tipo`, T6/E5/T8/E4 sem `tipo`).
   - `packages/metricas/src/core/regras.ts` `REGRAS_METRICA`: 17 novas linhas. Valores propostos: O5 `{businessmap, ['tipo'], temporal, true, 20, ['mediana'], story}`; O6 `{['classe-servico'], temporal, true, 20, ['referencia-percentil']}`; O8 `{['tipo'], temporal, true, 20, ['percentis','mediana']}`; O11 `{['tipo'], temporal, true, 0, []}`; O13 `{['tipo'], temporal, true, 20, ['taxa']}`; O14 `{['area','sistema'], neutra, true, 0, []}`; O16 `{['faixa-idade'], temporal, true, 0, []}` (severidade entra como nova chave); O17 `{['sistema'], neutra, true, 0, []}` (nova chave `causa-raiz`); T6 `{['classe-servico'], temporal, true, 20, ['percentis']}`; T8 `{[], temporal, true, 20, ['taxa']}`; E4 `{['tipo-projeto'], temporal, true, 0, [], projeto}`; E5 `{[], temporal, true, 20, ['percentis'], frente}`; S8 `{acelerato, ['prioridade'], temporal, 'nao-se-aplica', 20, ['taxa'], chamado}`; S9 `{['motivo-pendencia'], neutra, ..., 20, ['percentis']}`; S10 `{['prioridade'], temporal, ..., 20, ['percentis','taxa']}`; S11 `{['prioridade'], neutra, ..., 20, ['taxa']}`; S12 `{['sistema'], neutra, ..., 20, ['taxa']}`. Acrescentar a `ChaveSegmentacao`: `'severidade'`, `'causa-raiz'`, `'motivo-pendencia'`, `'sprint'`. Células que o briefing não responde ficam `'pendente-usuario'` (ver 5). `regras.property.test.ts` itera a tabela: os testes de propriedade passam a cobrir as 17 e podem expor falhas reais; tratar no cartão do backend.
   - `packages/metricas/src/calcular.ts` `CALCULOS`: 17 entradas (`BM.calcularO5(c.bm, f, c.ext)` etc.). Arquivos novos `businessmap/o5.ts`..., `acelerato/s8.ts`..., um por métrica, no padrão atual.
   - `server/src/modulos/metricas/rotas.ts` já itera `METRICA_IDS`: as 17 rotas `GET /api/v1/metricas/:id` nascem sem código novo, desde que `SCHEMAS_RESULTADO` e `queryDe` as cubram. `servico.ts` (linha ~175) monta o contexto: acrescentar `ext` obtido de `gerarExtensoesMock(base)` apenas na fonte mock. Cache/ETag e headers inalterados. Sem nova rota, sem migração.
2. `packages/contratos/src/cartoes.ts` `CATALOGO_CARTOES` (catálogo dos ids do 007): estender `CartaoCatalogo` com
   ```ts
   grupo: 'nucleo' | 'complementar'
   status: 'disponivel' | 'mock'   // 'mock' = dado fictício até a coleta real; 'em-breve' deixa de existir (todas prontas)
   ```
   (campos obrigatórios; os 28 existentes recebem `grupo: 'nucleo'`, `status: 'disponivel'` pela função `secao`, com parâmetro novo). Complementares: `secao` = a pergunta ("Por que demora?", "O que entra?", "Qualidade", "Quando fica pronto?", ...), `grupo: 'complementar'`, `status: 'mock'`. Ids de cartão continuam o código em minúsculas (`o5`, `s12`). `leiaJunto` dos cartões do núcleo passa a poder apontar complementares (ex.: O3 -> `o5`,`o6`; O4 -> `o8`; O15 -> `o13`; S1 -> `s9`,`s10`), mantendo a regra "o link some se o par está oculto" e acrescentando "abre a seção". Contrato de preferências `{versao, paineis:{p:{ocultar:[]}}}` inalterado: os ids novos passam a ser aceitos no `ocultar` porque o schema valida contra `CATALOGO_CARTOES` (confirmar em `cartoes.ts` mais abaixo; `cartoes.test.ts` cobre). Complementares não geram alerta: `metricas` de alertas continua só do núcleo; Visão geral não as lista.
3. `web/src/content/catalogo-metricas.ts` `CATALOGO` (nome, pergunta, fonte, granularidade, meta): +17 entradas. `/metricas` deriva a tabela de `CATALOGO` + `CATALOGO_CARTOES` (45 métricas = 28 núcleo do briefing + 17; `BLOQUEADOS`, `VISAO_GERAL` e os `EI_*` não contam como métrica do briefing: o catálogo exibe EI uma vez). Nenhum endpoint de catálogo: dado 100% estático no bundle (sem dado pessoal).

## 4. Divisão de tarefas

Ordem: (A) contratos -> (B) metricas + mock -> (C) server. O front só depende de A e pode começar em paralelo com B/C usando a `MockFonteMetricas` (que chama `calcularMetrica` no navegador; ela herda B).

`node-backend`
1. Contratos: ids, schemas zod, tipos, `METRICAS_SUSTENTACAO`, `APLICABILIDADE_FLUXO`, `CATALOGO_CARTOES` (grupo/status/leiaJunto) e testes de `contratos`. Publicar os tipos de resultado primeiro (desbloqueia o front).
2. Extensões e mock: `extensao.ts` (BM/AC), `gerarExtensoesMock`, testes de hash (`924448d4` e `b2bfd4c0` intactos).
3. Cálculos (`o5`...`s12`) + `REGRAS_METRICA` + `CALCULOS` + testes (regras, propriedade, borda de 19/20 itens). Paralelizáveis entre si: grupo BM (O5, O6, O8, O11, O13, O14, O16, O17), grupo prev. (T6, E5, T8, E4), grupo AC (S8-S12).
4. Server: `ext` no `servico.ts` (fonte mock), rotas por iteração, testes de rota (schema de saída, 304, paridade com a lib), `docs/api/`. Revisar `redaction`/resposta sem campo de pessoa (O16 lista idade dos mais antigos por `cardId`, nunca responsável).

`react-frontend` (após A)
1. Seção "Mais métricas deste painel" (`<details>`, contagem, grupos por pergunta, lazy: queries só quando `open`), cartões no padrão existente; estados disponível/insuficiente/carregando/erro/sem dados; rótulo "Dados fictícios" quando `status: 'mock'` (decisão 5.4).
2. Link "Leia junto" do núcleo para complementares: abre a seção e foca o cartão.
3. Página `/metricas` (tabela: código, nome, painel, fonte, granularidade, status, link) e entrada no menu.
4. "Restaurar padrão" abre a seção na visita; seletor "Métricas" com grupo "Complementares" e contador "9 de 9 (+8)".
5. Gráficos por cartão: um por métrica, depois de B publicar o resultado (ou contra o mock local).

`qa-engineer` (paralelo): plano de testes (regra dos 20 itens, BM×AC, ausência de pessoa nas 17, anti-meta 7.2 textos, a11y do `<details>`, lazy: nenhuma requisição das 17 antes de abrir) e E2E da seção e de `/metricas`.

## 5. Decisões que dependem do usuário

Só os pontos sem resposta no briefing; nada foi decidido por inferência (células ficam `'pendente-usuario'` em `REGRAS_METRICA` até a resposta):
1. **O5**: bloqueio conta como não-execução mesmo em coluna de execução (o briefing diz "descontando fila e bloqueio"); confirmar que o ciclo é início→entrega e se a razão publicada é por item (mediana) ou agregada.
2. **O17**: lista fechada de `causa_raiz` (o briefing 4.4 cita "lista fechada" sem os valores) e o que é "módulo ou sistema de origem" (usar `sistema` do card ou criar campo módulo?). O mock usa valores provisórios marcados como tais.
3. **S8**: "curto intervalo" (N dias) e o critério de "mesmo sintoma" (o briefing remete a T4.2 sem fixar). Valor provisório do mock: 7 dias corridos, só como parâmetro de configuração versionado em `criterios` (T2.6), não constante de código.
4. **Fontes inexistentes hoje** (T8 sprint, natureza manter/evoluir do E4, `registro_problema`, `sintoma`): ficam mockadas e rotuladas "Dados fictícios" até existir campo/ferramenta real; confirmar que o rótulo é aceitável nos painéis e que o usuário valida os campos de coleta antes da fase real.
5. **S12** "recorrentes": limite K (chamados do mesmo sistema+sintoma) e janela. **T8**: se a sprint é do time ou por quadro (comparação entre times continua proibida; mostrar sempre agregado, sem ranking entre sprints de times).
6. **O11**: o que conta como "em definição" × "pronto" (papel de coluna `backlog` × `compromisso` é inferência do time; confirmar).

Riscos: (a) a matriz `REGRAS_METRICA` com células pendentes mantém `status: 'pendente-usuario'` e é aceita pelos testes atuais; (b) `MetricaId` ampliado afeta `VISAO_GERAL`, `calibracao.ts` e `varredura.test.ts` (iteram ids): o backend ajusta; (c) payload do mock no navegador: `ext` é pequeno (~milhares de linhas), mas a geração só roda quando a seção abre (lazy) ou no primeiro cálculo complementar; (d) segurança: sem dado pessoal novo; as extensões não carregam responsáveis; nenhum segredo/dependência nova.

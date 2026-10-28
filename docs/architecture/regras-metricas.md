# Matriz de regras por métrica (M-005)

- Status: proposta (implementação no cartão K-030, `react-frontend`)
- Data: 2026-10-09
- Origem: `docs/alinhamentos/2026-10-09-melhoria-01-fase-a.md` (M-005); decisões provisórias Q1–Q6 em `docs/alinhamentos/2026-10-09-decisoes-review-fase-a.md`; regra de amostra D8 em `docs/ux/dashboard-metricas/especificacao.md` 4.0.2.

O objetivo é que as regras do briefing sejam **dados executáveis**: uma matriz `REGRAS_METRICA` com uma linha por `MetricaId`, que parametriza testes de propriedade. Célula que o briefing não responde vale `'pendente-usuario'`; ninguém preenche por inferência.

## 1. Tipo `RegraMetrica`

Local: `web/src/lib/metrics/core/regras.ts` (exporta só tipos e a constante; sem lógica de cálculo).

```ts
import type { Dominio, MetricaId } from '@/contracts/comum' // Dominio = 'businessmap' | 'acelerato'

export type Pendente = 'pendente-usuario'
export type Celula<T> = T | Pendente

export type ChaveSegmentacao =
  | 'tipo'
  | 'classe-servico'
  | 'tipo-projeto'
  | 'natureza-alocacao'
  | 'objetivo'
  | 'prioridade'
  | 'nivel-resolucao'
  | 'motivo-escalacao'
  | 'motivo-encerramento'
  | 'tipo-reclassificacao'
  | 'fase-deteccao'
  | 'responsabilidade-atraso'
  | 'com-sem-bug'
  | 'sistema'
  | 'area'
  | 'coluna'
  | 'etapa'
  | 'faixa-idade'
  | 'relogio'
  | 'projeto'
  | 'iniciativa'
  | 'motivo-bloqueio' // pedido 011 (B1): O19
  | 'fornecedor' // pedido 011 (B1): T10
  | 'mes-do-ano' // pedido 011 (B1): T11
  | 'faixa-passagens' // pedido 011 (fase 2): O26
// Proibidas como segmentação: pessoa, responsável, equipe (equipe é só filtro; comparação entre times é proibida, 7.1).

export type Granularidade = 'story' | 'frente' | 'projeto' | 'chamado'
export type ParteComMinimo = 'percentis' | 'mediana' | 'faixa' | 'taxa' | 'referencia-percentil'

export interface RegraMetrica {
  /** 'composicao' = não calcula; só reexpõe resultados de outras métricas, em blocos por domínio. */
  readonly dominio: Dominio | 'composicao'
  /** A primeira chave é a classe estatística: percentis/taxas são calculados dentro dela, nunca entre classes. */
  readonly segmentacao: readonly ChaveSegmentacao[]
  /** neutra = ordem fixa do domínio (fluxo, P1–P5, taxonomia 4.3, domínio fechado) com desempate por id;
   *  temporal = eixo de tempo. Nos dois casos a saída não depende da ordem de entrada. */
  readonly ordem: 'neutra' | 'temporal'
  /** BM: card arquivado permanece no cálculo (4.2, 7.3, Q6). AC: o conceito não existe (população com excluido = false). */
  readonly incluiArquivados: Celula<boolean | 'nao-se-aplica'>
  /** 20 = abaixo de 20 itens na classe não publica as partes listadas em `minimoSobre`; 0 = contagem/censo/retrato. */
  readonly minimo: 20 | 0
  readonly minimoSobre: readonly ParteComMinimo[]
  readonly granularidade: Granularidade | readonly Granularidade[] // lista só em 'composicao' (blocos separados)
  readonly refBriefing: string
  /** 'pendente-usuario' se qualquer célula for Pendente (verificado por teste, não declarado à mão). */
  readonly status: 'ok' | Pendente
}

export const REGRAS_METRICA = {/* tabela da seção 2 */} as const satisfies Record<
  MetricaId,
  RegraMetrica
>
```

## 2. Tabela preenchida

Legenda: BM = `businessmap`, AC = `acelerato`, Arq. = `incluiArquivados`, Mín. = `minimo` / `minimoSobre`.

| MetricaId   | Dom.       | Segmentação (1ª = classe)                                                                   | Ordem    | Arq.                                     | Mín.                                               | Gran.                                    | refBriefing                                   | Status           |
| ----------- | ---------- | ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------- | -------------------------------------------------- | ---------------------------------------- | --------------------------------------------- | ---------------- |
| O1          | BM         | coluna, tipo                                                                                | neutra   | true (P1 decidida)                | 0 / –                                              | story                                    | 06 O1; 4.2 colunas; 7.3 fila conta WIP        | ok |
| O2          | BM         | tipo, etapa                                                                                 | neutra   | true (P1 decidida)                | 20 / referencia-percentil                          | story                                    | 06 O2; 4.1 inicio                             | ok |
| BLOQUEADOS  | BM         | coluna, tipo                                                                                | neutra   | true (P1 decidida)                | 0 / –                                              | story                                    | 4.2 bloqueio marcado no card; 06 O1           | ok |
| O3          | BM         | tipo                                                                                        | temporal | true                                     | 20 / percentis, referencia-percentil               | story                                    | 06 O3; 4.1; 4.2                               | ok               |
| O4          | BM         | tipo                                                                                        | temporal | true                                     | 20 / faixa, mediana                                | story                                    | 06 O4; 4.2 subtarefa não conta                | ok               |
| O7          | BM         | tipo                                                                                        | temporal | true                                     | 0 / –                                              | story                                    | 06 O7; 4.1 entrada                            | ok               |
| O9          | BM         | tipo, relogio                                                                               | temporal | true                                     | 20 / percentis, mediana                            | story                                    | 06 O9; 4.1                                    | ok               |
| O10         | BM         | tipo, faixa-idade                                                                           | neutra   | true (P1 decidida)                | 20 / percentis (contador >180d sem mínimo)         | story                                    | 06 O10; 4.1 entrada/compromisso               | ok |
| O12         | BM         | responsabilidade-atraso                                                                     | temporal | true                                     | 20 / taxa                                          | story                                    | 06 O12; 7.3 classificação no vencimento       | ok               |
| O15         | BM         | fase-deteccao                                                                               | temporal | true                                     | 20 / taxa                                          | story                                    | 06 O15; 4.3 bug/defeito; 4.2 janela 30 d; 7.2 | ok               |
| O18         | BM         | com-sem-bug, tipo                                                                           | temporal | true                                     | 20 / taxa                                          | story                                    | 06 O18; 4.2 janela 30 d                       | ok               |
| T1          | BM         | classe-servico, etapa                                                                       | temporal | true                                     | 20 / percentis, mediana                            | story                                    | 06 T1; Q3                                     | ok               |
| T2          | BM         | classe-servico, etapa                                                                       | temporal | true                                     | 20 / taxa                                          | story                                    | 06 T2; Q3                                     | ok               |
| T3          | BM         | natureza-alocacao                                                                           | temporal | true                                     | 20 / taxa                                          | story                                    | 06 T3; 4.3 natureza; P8 (UX, provisória)      | ok               |
| T4          | BM         | classe-servico                                                                              | temporal | true (P1 decidida) | 20 / mediana, faixa                                | story                                    | 06 T4; Q3                                     | ok |
| T5          | BM         | sistema, area                                                                               | neutra   | true                                     | 20 / taxa                                          | story                                    | 06 T5; 4.2 janela 30 d                        | ok               |
| T7          | BM         | projeto                                                                                     | neutra   | true (P1 decidida)                | 20 / percentis, referencia-percentil               | frente                                   | 06 T7; 02 feature = pacote; 7.3 granularidade | ok |
| T9          | BM         | projeto                                                                                     | neutra   | true (P1 decidida)   | 0 / – (censo, "k de n")                            | frente                                   | 06 T9; 7.1 sem % de conclusão de tarefa       | ok |
| E1          | BM         | tipo-projeto                                                                                | temporal | true                                     | 20 / percentis, mediana                            | projeto                                  | 06 E1; Q4                                     | ok               |
| E2          | BM         | objetivo, natureza-alocacao                                                                 | temporal | true                                     | 20 / taxa                                          | story                                    | 06 E2; Q5 (Melhoria, Iniciativa, Dívida)      | ok               |
| E3          | BM         | iniciativa                                                                                  | neutra   | true                                     | 0 / – (censo)                                      | projeto                                  | 06 E3                                         | ok               |
| S1          | AC         | prioridade                                                                                  | temporal | nao-se-aplica                            | 20 / percentis, mediana                            | chamado                                  | 06 S1; 3.2; Q2                                | ok               |
| S2          | AC         | prioridade                                                                                  | temporal | nao-se-aplica                            | 20 / taxa                                          | chamado                                  | 06 S2; 3.2 status_sla_r; Q2                   | ok               |
| S3          | AC         | prioridade                                                                                  | temporal | nao-se-aplica                            | 0 / –                                              | chamado                                  | 06 S3                                         | ok               |
| S4          | AC         | prioridade × nivel-resolucao (contrato: `prioridades[]`, uma célula por prioridade e nível) | neutra   | nao-se-aplica                            | 20 por célula / mediana (média nunca sozinha, 4.2) | chamado                                  | 06 S4; 7.2; Q2                                | ok               |
| S5          | AC         | motivo-escalacao                                                                            | neutra   | nao-se-aplica                            | 20 / taxa                                          | chamado                                  | 06 S5; 7.3 domínio fechado                    | ok               |
| S6          | AC         | motivo-encerramento                                                                         | neutra   | nao-se-aplica                            | 20 / taxa                                          | chamado                                  | 06 S6                                         | ok               |
| S7          | AC         | tipo-reclassificacao                                                                        | temporal | nao-se-aplica                            | 20 / taxa                                          | chamado                                  | 06 S7 (medidos separadamente)                 | ok               |
| EI_FL1      | BM         | tipo                                                                                        | temporal | true                                     | 20 / mediana                                       | story                                    | T3.4; 06 EI; Q4                               | ok               |
| EI_FL2      | BM         | (granularidade só; feature = pacote)                                                        | temporal | true                                     | 20 / mediana                                       | frente                                   | T3.4; 02                                      | ok               |
| EI_FL3      | BM         | tipo-projeto                                                                                | temporal | true                                     | 20 / mediana                                       | projeto                                  | T3.4; Q4                                      | ok               |
| EI_SUST     | AC         | prioridade                                                                                  | temporal | nao-se-aplica                            | 20 / mediana                                       | chamado                                  | T3.4; Q2                                      | ok               |
| O19         | BM         | motivo-bloqueio                                                                             | neutra   | true                                     | 20 / percentis, taxa                               | story                                    | pedido 011 O19; R6 (mínimo em bloqueios); O19-pct = B   | ok               |
| O20         | BM         | (nenhuma)                                                                                   | neutra   | true                                     | 0 / –                                              | story                                    | pedido 011 O20; varredura por coluna do O1 (B8); coluna ou papel (R5)| ok               |
| O21         | BM         | tipo                                                                                        | neutra   | true                                     | 20 / taxa, percentis                               | story                                    | pedido 011 O21; ciclo do O3; par por tipo (regra 7, CA-6); R5| ok               |
| O22         | BM         | tipo                                                                                        | neutra   | true                                     | 20 / percentis                                     | story                                    | pedido 011 O22; D-9'; CA-43                          | ok               |
| O24         | BM         | tipo                                                                                        | temporal | true                                     | 20 / taxa, percentis                               | story                                    | pedido 011 O24; D-6' = A; R-1 = A; regra 7; R5          | ok               |
| O25         | BM         | tipo                                                                                        | temporal | true                                     | 20 / taxa, percentis                               | story                                    | pedido 011 O25; R-2' = A; P-1 = A; D-13; CA-44| ok               |
| O26         | BM         | tipo, faixa-passagens                                                                       | neutra   | true                                     | 20 / percentis, taxa                               | story                                    | pedido 011 O26; D-5' = B; Q-a e Q-b                  | ok               |
| T10         | BM         | fornecedor                                                                                  | neutra   | true                                     | 20 / percentis                                     | story                                    | pedido 011 T10; D-10 = A; R-5; B11-001               | ok               |
| T11         | BM         | mes-do-ano                                                                                  | temporal | true                                     | 0 / censo, sem percentil                           | story                                    | pedido 011 T11; CA-12                         | ok               |
| T12         | BM         | area                                                                                        | neutra   | true                                     | 20 / taxa                                          | story                                    | pedido 011 T12; D-8 = A                       | ok               |
| T13         | BM         | tipo                                                                                        | neutra   | true                                     | 20 / taxa, percentis                               | story                                    | pedido 011 T13; D-14' = A; R-4                       | ok               |
| T14         | BM         | (nenhuma)                                                                                   | neutra   | true                                     | 20 / taxa                                          | story                                    | pedido 011 T14; Q-T14-1 = B, Q-T14-5 = D, R-1 = B; Q-T14-9 = A, Q-T14-10 = B (cadastro de membros), T14-M1 = B; K-130 (pedido 048: oculto sem `n` e fora do agregado)    | pendente-usuario |
| E6          | BM         | (nenhuma)                                                                                   | temporal | true                                     | 20 / taxa, percentis                               | projeto                                  | pedido 011 E6; D-7; CA-20                            | ok               |
| E7          | BM         | sistema, natureza-alocacao                                                                  | neutra   | true                                     | 20 / taxa                                          | story                                    | pedido 011 E7; D-1' = A; D-2; CA-13; CA-23    | ok               |
| E8          | BM         | (nenhuma)                                                                                   | neutra   | true                                     | 0 / censo, sem percentil                           | story                                    | pedido 011 E8; D-3; R-1 = B                          | ok               |
| E9          | BM         | tipo-projeto                                                                                | temporal | true                                     | 20 / referencia-percentil                          | projeto                                  | pedido 011 E9; R-6; P85 por tipo (regra 7, Q4), do E1| ok               |
| VISAO_GERAL | composicao | herda de cada métrica exposta                                                               | neutra   | herda                                    | herda                                              | story, frente, projeto, chamado (blocos) | 3.1 da spec UX; Q1                            | ok               |

Notas da tabela:

- "Classe" em 4.2 = a primeira chave da segmentação. EI_FL2 e T7 não têm tipo porque feature e pacote contam igual (seção 02); a classe é a própria granularidade.
- `minimo: 0` vale para contagens absolutas, listas, pontos individuais e censos (D8). Taxa abaixo de 20 vira "k de n", nunca percentual.
- T7: a spec de UX pede barras por projeto em ordem decrescente de frentes abertas. Ranking de projeto não é proibido (não é pessoa nem time), mas contraria `ordem: 'neutra'`; o K-030 implementa neutra (id do projeto) até o Jarvis/UX decidir.
- Q1–Q6 e P8 são decisões **provisórias do time**; ficam `ok` aqui e continuam na lista para o usuário.
- A janela de 12 semanas em frentes e projetos (pergunta 2 da spec UX) segue aberta, mas não é coluna desta matriz (janela é parâmetro único).
- O19 e T10 (pedido 011, B3): a base é `fato_bloqueio` com `fim` no período; a unidade do mínimo é o **bloqueio** (O19-pct = B, decisão do usuário: o `pctDoTotal` do O19 é a parcela dos **dias úteis bloqueados** de cada motivo sobre o total de dias úteis bloqueados; o mínimo de 20 continua contado em **bloqueios**, não em dias úteis; critério anterior, de k de n em bloqueios, substituído). T10: só o praticado (P50/P85 por fornecedor), sem prazo contratado e sem status (D-10 = A); entra todo bloqueio encerrado com fornecedor informado, de qualquer motivo (R-5, CA-24). B11-001 (decisão do usuário, versão de critério de 2026-10-17, T2.6): o fornecedor é agrupado pelo nome normalizado (igual a menos de maiúsculas e espaços) e exibido pela grafia mais frequente. Os dois têm exceção nominal só na propriedade P2, porque o classificador por card não isola a chave (motivo e fornecedor vivem no fato de bloqueio).
- T11 (pedido 011, B11b): contagem (censo) de demandas criadas por mês (story, sem subtarefa), janela fixa de 24 meses fechados mais o mês corrente (`em andamento`), ancorada em `hoje` e não no período do filtro (CA-12; o período não consta da aplicabilidade). Sem percentil nem estatística de tempo: o mínimo de 20 não se aplica à contagem; `mediaMensal` é só referência de contagem dos meses fechados. Na fonte mock a série vem da extensão `ExtensaoTambemBM.entradasSazonais` (P-T3 = a); sem extensão, devolve vazio com `historicoCurto`. Fica fora de `afeta` das versões de critério do descarte (`NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`).
- T12 (pedido 011, B4): demandas (story que não é bug interno) criadas no período, por `area_solicitante` (dimensão permitida; nunca equipe nem pessoa, R5). "Ida e volta" (D-8 = A) = bloqueio "Falta de informação no chamado" com `inicio` anterior ao início do card (ou card não iniciado), OU retorno da coluna de papel `compromisso` para a de papel `backlog`; os dois critérios são um OU e o card conta uma vez só. Taxa pela biblioteca (`taxa`): percentual só com n >= 20, por área e no total. Áreas por volume (CA-11). Exceção nominal só na propriedade P2 (área não é classificador do harness); R5 e a ordem são provados em `t12.test.ts`.
- O20 (pedido 011, B9): contagem diária de itens em progresso por faixa, da `varreduraPorColuna` do B8 (a do O1: stories, sem subtarefa nem excluídos, arquivados até o instante do arquivamento por `fimDeVidaAberta`). Faixa = coluna só com uma equipe filtrada; com "Todas" ou mais de uma equipe, papel da coluna somado quadro a quadro (R5: nunca equipe nem pessoa). Destaque = faixa de fila (`tipo_coluna = 'fila'`) com maior crescimento absoluto entre o primeiro e o último dia do período; papel que mistura fila e execução (`trabalho`) conta como execução e fica fora do destaque. Contagem é censo: sem estatística e sem mínimo. Faixa sem nenhum item no período some; sem nenhuma faixa, `faixas` e `dias` vêm vazios.
- O21 (pedido 011, B7): demandas (story que não é bug interno nem subtarefa) entregues no período; com retorno = ao menos uma transição `retorno` até a conclusão (a reabertura, retorno a partir de "Entregue", conta e é marcada). Matriz por coluna só com uma equipe filtrada, senão por papel (R5: nunca equipe nem pessoa). O par com × sem usa o ciclo do O3 (`entreguesDe`), é por tipo (regra 7) e só publica com 20 em cada grupo, dizendo qual grupo faltou (CA-6). A transição de retorno sem coluna de origem não conta e a origem fora do quadro vira `sem-papel` (papel) ou ordem 0 (coluna); provado em `o21.test.ts`.
- O24 (pedido 011, B10): inícios do período de demandas da classe Padrão (story que não é bug interno nem subtarefa), na fila de cada equipe (quadro) e no mesmo tipo (D-6' = A); Urgente, Prazo fixo e Intangível fora. Fora de ordem = havia, no instante do início, um card mais antigo do grupo ainda não iniciado nem descartado, arquivado ou excluído. Varredura O(n log n) (ordenação por criação e por início, fila FIFO com retirada na cabeça), memoizada por contexto e independente dos filtros. Custo (R-1 = A): dias úteis do início do primeiro que passou na frente até o início do ultrapassado; ultrapassado não iniciado fora; P50/P85/P95 por tipo (regra 7), 20 por tipo. Taxa de inícios só com n >= 20. A saída não traz equipe (R5), provado em `o24.test.ts`; a varredura é provada igual à comparação ingênua par a par no mock.
- O25 (pedido 011, B6): demandas (story que não é bug interno nem subtarefa) encerradas no período, entregues mais descartadas. Descartado = estado nativo `discarded` ou card excluído (R-2' = A, P-1 = A), no instante do descarte; tudo isso é lido só em `descartado.ts` (na fase 1 o estado nativo é projetado por motivo mais arquivamento). Motivo sem descarte vira aviso e fica fora da taxa. Tempo consumido do início ao descarte (D-13); antes do início à parte; P50/P85 do consumido por tipo (regra 7, 20 por tipo). Sem `porMotivo` até ler `/discardReasons` (CA-44); `discard_comment` nunca. Exceção nominal só na propriedade P2 não foi necessária: a série mensal não tem rótulo de classe.
- E7 e E9 (pedido 011, B5): E7 = demandas entregues no período por `sistema` (dimensão permitida; nunca equipe nem pessoa), peso por contagem (D-2), natureza só por `naturezaDe` do T3 (CA-23), sem R$ (D2 = A, pedido 024: a participação percentual nas entregas do período substitui o custo; mudança de critério `criterio-2026-10-17-e7-sem-reais`, T2.6); sistema com menos de 20 entregas mostra "k de n" e vai para o fim. E9 = retrato de hoje dos projetos abertos e não iniciados (idade em dias úteis desde `criado_em`), faixas fixas 0–30, 31–90, 91–180 e mais de 180; a referência é o P85 do "antes do início" importado do E1 (`concluidosDeProjeto`), só com n >= 20. Exceção nominal na propriedade P2 (E7) e na P4 (E9: o mock não publica 20 projetos concluídos); provadas em `e7.test.ts`, `e7.natureza.test.ts` e `e9.test.ts`.
- Fase 2 do pedido 011 (E1 e E2 do back, em mock): O22 = dias úteis da criação ao primeiro comentário humano (D-9', CA-43), por tipo, P50/P85/P95 e histograma na janela de 12 semanas pelo instante do toque. O26 = entregas por faixa de passagens (só o inteiro, ADR 0020); **Q-a = 1 passagem por revisão e Q-b = conta (comparar com o último conjunto não vazio)**, decididas em 2026-10-16, deixam de ser pendência; `faixa-passagens` é a única chave de segmentação nova. T13 = só o booleano "dependeu de outro quadro" (predecessor, vigente antes da entrega, R-4), um bloco por granularidade e par com x sem por tipo. E6 = deslize em dias úteis inteiros entre a data comprometida no compromisso e a conclusão (tolerância zero, dia civil). E8 = contagem de sistemas por faixa de pessoas, sem nenhum nome (R-1 = B). **T14 = única `pendente-usuario`**: cardinalidade do campo "Time responsável" e Q-T14-2, 3, 4, 7 e 8 (cada uma com a recomendação do plano §9.5 valendo); Decisões do usuário: Q-T14-9 = A, Q-T14-10 = B e T14-M1 = B (2026-10-17: com "outros times" oculto, a T14 mostra só a fatia do meu time, sem o total exato; vale antes da fase 3), deixando de ser pendências. A equipe do filtro só diz qual é "meu time" e não recorta a população. **E7 sem R$ (revisto em 2026-10-17 pela D2 = A, pedido 024):** a Q-E7-1 (pró-rata de custo) e o custo por fixture deixam de valer; o E7 mostra a participação percentual por sistema nas entregas do período. Os seis ids entram na lista nominal `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` (não são marcados pelas versões do descarte nativo).

### Decisão do usuário (antes pergunta; nenhuma célula `pendente-usuario` em aberto)

**P1, decidida em 11/10 (definitiva): card arquivado sem entrega NÃO conta como aberto** (sai do retrato do momento, permanece na base e é contado à parte). A pergunta original: card **arquivado sem ter sido entregue** e sem `motivo_descarte`: conta como aberto (WIP, idade, bloqueado, backlog, denominador do avanço) ou sai do retrato do momento? O briefing manda manter arquivados na base (4.2, 7.3) e Q6 diz que arquivado não é descartado, mas nada diz sobre o estado "aberto" deles. Afeta O1, O2, BLOQUEADOS, O10, T4 (backlog), T7, T9. Com a decisão, as sete linhas saem de `pendente-usuario` e a propriedade 1 vale para elas, sem exceção nominal.

## 3. Propriedades a testar (parametrizadas por `REGRAS_METRICA`)

Um único arquivo `regras.property.test.ts` itera a matriz; cada propriedade declara as exceções **nominalmente** (lista de `MetricaId` com motivo).

| #   | Propriedade                                                                                                                                                                                                       | Aplica a                                   | Exceções nominais                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | Arquivar um card **entregue** não muda o resultado                                                                                                                                                                | `dominio = BM` e `incluiArquivados = true` | AC (nao-se-aplica)                          |
| 2   | Classe isolada = classe no conjunto: o resultado da classe X calculado só com itens de X é igual ao da classe X calculado com todas as classes                                                                    | `segmentacao[0]` definida                  | VISAO_GERAL (composição)                                               |
| 3   | Dados AC não alteram resultado BM (e vice-versa): acrescentar/remover toda a base do outro domínio dá resultado idêntico                                                                                          | todas                                      | VISAO_GERAL testa só que cada bloco é idêntico ao da métrica de origem |
| 4   | Fronteira de amostra: n = 19 na classe → partes de `minimoSobre` ausentes (status insuficiente, "k de n"); n = 20 → publicadas                                                                                    | `minimo = 20`                              | `minimo = 0` (O1, BLOQUEADOS, O7, T9, E3, S3); VISAO_GERAL             |
| 5   | Embaralhar a entrada (cards, transições, bugs/falhas, chamados) não muda a saída nem a ordem                                                                                                                      | todas                                      | nenhuma                                                                |
| 6   | Nenhuma chave por pessoa: varredura recursiva do resultado não encontra chave nem valor de categoria `pessoa`, `responsavel`, `assignee`, `usuario`, `autor`, `criador`; `equipe` só aparece como filtro aplicado | todas                                      | nenhuma                                                                |

Meta-testes (bloqueiam o `npm run pronto`):

- toda chave de `METRICA_IDS` está em `REGRAS_METRICA` (garantido também por `satisfies`) e em cada propriedade ou na lista de exceções dela;
- `status` é `'pendente-usuario'` se e somente se alguma célula for `'pendente-usuario'`;
- lista de exceções não contém id inexistente (exceção órfã falha).

## 4. Saídas de tipo a fechar

1. **`Amostra` com marca.** Acrescentar `declare const marcaAmostra: unique symbol` em `core/amostra.ts` e o campo `readonly [marcaAmostra]: true`. Só `criarAmostraInterna` produz o valor; literal de objeto não compila como `Amostra`. Lint impede importar `criarAmostraInterna` fora de `businessmap/` e `acelerato/`.
2. **`descartado(card)` única.** Uma função em `businessmap/` (`descartado(card): boolean`, verdadeira só com `motivo_descarte` preenchido, Q6). Lint proíbe ler `motivoDescarte` em qualquer outro arquivo de métrica; ler `arquivado` para excluir item também é proibido.
3. **`ordenarNeutro`.** Em `core/`: `ordenarNeutro<T>(itens: readonly T[], chave: (t: T) => readonly (string | number)[]): readonly T[]`. Estável, ordem total (a última chave é sempre o id), sem `localeCompare` dependente de ambiente. Lint proíbe `.sort(` e `.toSorted(` direto nos arquivos de métrica.
4. **Schema `ok` só com n ≥ 20.** Toda estatística publicada é união discriminada em zod: `{ status: 'ok', n: z.number().int().min(20), ... } | { status: 'insuficiente', n: z.number().int().max(19), minimo: z.literal(20) }`. O valor (percentil, taxa, mediana, faixa) existe só no ramo `ok`. `SCHEMAS_RESULTADO` usa esse bloco em todas as partes de `minimoSobre`, então um mock ou cálculo que publique com n < 20 falha na validação.

## Correspondência O11 com os papéis de coluna (decisão do usuário, 2026-10-11)
O11 mede o intervalo Requested -> In Progress sem criar sexto papel de coluna. "Em definição" = cards cuja última coluna tem papel `backlog` (seção Requested). "Pronto" = papel `compromisso` (In Progress comprometido, antes de iniciar o trabalho). O mapeamento coluna -> papel segue `dim_coluna` por quadro.

## O23 Estoque parado (bloco do O2, pedido 011, B2)
- Cálculo em `businessmap/o2.ts`, sobre `semMoverHaDiasUteis` (mudança de coluna; tempo apontado nunca). Parado = acima de `LIMITE_PARADO_DIAS_UTEIS` (5 dias úteis, constante única em `core/criterios`).
- Versão de critério v1: `VERSAO_CRITERIO_PARADOS_V1` (`criterio-2026-10-14-parados-v1`, `afeta: ['O2']`), na lista `VERSOES_DA_BIBLIOTECA` (`core/criterios`), que `marcacoesNoPeriodo` soma às da base sem repetir id; o mock e a base não mudam. Mudar o limite = mudar a constante e registrar nova versão no mesmo commit.
- Publicação: "k de n" sempre; percentual só com n >= 20 (WIP atual). Quebra por etapa igual à do O2.

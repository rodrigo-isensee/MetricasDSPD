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
| O19         | BM         | motivo-bloqueio                                                                             | neutra   | true                                     | 20 / percentis, taxa                               | story                                    | pedido 011 O19; R6 (n da taxa = bloqueios)    | ok               |
| T10         | BM         | fornecedor                                                                                  | neutra   | true                                     | 20 / percentis                                     | story                                    | pedido 011 T10; D-10 = A; R-5                 | ok               |
| T12         | BM         | area                                                                                        | neutra   | true                                     | 20 / taxa                                          | story                                    | pedido 011 T12; D-8 = A                       | ok               |
| VISAO_GERAL | composicao | herda de cada métrica exposta                                                               | neutra   | herda                                    | herda                                              | story, frente, projeto, chamado (blocos) | 3.1 da spec UX; Q1                            | ok               |

Notas da tabela:

- "Classe" em 4.2 = a primeira chave da segmentação. EI_FL2 e T7 não têm tipo porque feature e pacote contam igual (seção 02); a classe é a própria granularidade.
- `minimo: 0` vale para contagens absolutas, listas, pontos individuais e censos (D8). Taxa abaixo de 20 vira "k de n", nunca percentual.
- T7: a spec de UX pede barras por projeto em ordem decrescente de frentes abertas. Ranking de projeto não é proibido (não é pessoa nem time), mas contraria `ordem: 'neutra'`; o K-030 implementa neutra (id do projeto) até o Jarvis/UX decidir.
- Q1–Q6 e P8 são decisões **provisórias do time**; ficam `ok` aqui e continuam na lista para o usuário.
- A janela de 12 semanas em frentes e projetos (pergunta 2 da spec UX) segue aberta, mas não é coluna desta matriz (janela é parâmetro único).
- O19 e T10 (pedido 011, B3): a base é `fato_bloqueio` com `fim` no período; a unidade do mínimo é o **bloqueio** (R6: o `pctDoTotal` do O19 é k de n em bloqueios, nunca em dias úteis). T10: só o praticado (P50/P85 por fornecedor), sem prazo contratado e sem status (D-10 = A); entra todo bloqueio encerrado com fornecedor informado, de qualquer motivo (R-5, CA-24). Os dois têm exceção nominal só na propriedade P2, porque o classificador por card não isola a chave (motivo e fornecedor vivem no fato de bloqueio).
- T12 (pedido 011, B4): demandas (story que não é bug interno) criadas no período, por `area_solicitante` (dimensão permitida; nunca equipe nem pessoa, R5). "Ida e volta" (D-8 = A) = bloqueio "Falta de informação no chamado" com `inicio` anterior ao início do card (ou card não iniciado), OU retorno da coluna de papel `compromisso` para a de papel `backlog`; os dois critérios são um OU e o card conta uma vez só. Taxa pela biblioteca (`taxa`): percentual só com n >= 20, por área e no total. Áreas por volume (CA-11). Exceção nominal só na propriedade P2 (área não é classificador do harness); R5 e a ordem são provados em `t12.test.ts`.

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

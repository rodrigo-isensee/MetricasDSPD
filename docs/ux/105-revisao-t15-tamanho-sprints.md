# Revisão de UX: T15 Tamanho das sprints (E7.579, head d698aefe)

parecer: aprovado com ressalvas. 1 achado alto (texto diz o contrário da decisão do dono), 2 médios, 1 baixo. Nenhum crítico. Escopo: só o delta do T15 sobre o T8. Leitura do código (acessibilidade: `lido`, nada `medido`); a suíte do CI e o `pronto` do autor (rc=0, web 1920/1920) não foram reexecutados aqui e não afirmo CI verde.

## Contra a decisão do dono (detalhe-t15-portoes.md)
| Ponto | Resultado |
|---|---|
| P50, P85 e média juntos | ok (`previsao.tsx` CartaoT15: leitura e tabela com as três colunas) |
| Abaixo de 20 sprints não publica | ok (`AmostraInsuficiente` + leitura "abaixo de 20 não se publica estatística"; teste cobre) |
| Time só por filtro, nunca lado a lado | ok (um valor só, sem quebra por time, sem ranking) |
| Janela do T8 (first_start a first_end, teto 30 du, entra pela conclusão) | ok (`sprintsDoRecorte` compartilhada; `t15.ts` não tem cálculo próprio; percentis por `resumoComMedia`) |
| Mais de um time no filtro, as sprints se somam | **não refletido na interface** (A-1) |
| BusinessMap sem Acelerato | ok (catálogo "BusinessMap"; filtros equipe, sistema, período) |

## Achados

### A-1 (alto) Texto "Um time por vez" contradiz a regra do dono
- Onde: `web/src/features/complementares/previsao.tsx` linha 276 (`<Leia>Um time por vez, pelo filtro de time...`), `notas.ts` linha 144 (cuidados do T15), comentário em `packages/contratos/src/metricas.ts:253`, `criterios.ts:415`, `t15.ts:13`, e o teste `t15-tamanho-sprints.test.tsx:41` que fixa a frase.
- Por quê: o filtro `equipe` é uma lista (`equipe: []` no schema), e a decisão do dono é que, com mais de um time, as sprints se somam, e ele foi avisado. O cartão afirma ao leitor algo que o sistema não garante: com dois times marcados (ou nenhum, que é "todos"), P50 e P85 misturam sprints de times diferentes sem aviso. É falha de visibilidade do status e de correspondência com o real, e leva a ler a mistura como o tamanho de um time.
- Correção: trocar o texto do cartão e das notas por algo como "Com mais de um time no filtro, as sprints dos times se somam. Para ver um time, escolha só ele no filtro. Sem meta e sem comparar times." e ajustar o teste. Opcional e melhor: quando o filtro tiver 0 ou 2+ equipes, mostrar essa frase em destaque (`Leia` já existente); com exatamente 1, mostrar só "Do time escolhido no filtro". Não gera comparação entre times, então respeita a regra inviolável.

### M-1 (médio) Cabeçalho "Média (só com P50 e P85)" é instrução, não nome de coluna
- Onde: `previsao.tsx` linha 258.
- Por quê: o título da coluna vira texto longo, quebra em telas estreitas e leitores de tela o anunciam como nome da célula; a orientação já está em `notas.ts` (comoLer) e na frase de leitura.
- Correção: título "Média"; a advertência fica na nota "Como ler" e na linha `Leia` ("Leia a média junto com P50 e P85"). Ajustar o teste que busca esse texto (linha 53).

### M-2 (médio) A unidade e o time não aparecem na tabela
- Onde: tabela do T15 (`previsao.tsx` linhas 251 a 268).
- Por quê: os valores vêm de `fmtDiasUteis` (traz a unidade, `lido`), mas a legenda não diz qual recorte de time vale; com o A-1 corrigido, a legenda é o melhor lugar para repetir o recorte.
- Correção: legenda "Duração das sprints em dias úteis, no recorte do filtro: P50, P85 e média juntos".

### B-1 (baixo) P95 é calculado e enviado, mas não mostrado
- Onde: `t15.ts` (`p95` no resultado) e o contrato.
- Por quê: não prejudica o usuário; só dado a mais no contrato. Se o P95 não é decisão do dono, considerar tirá-lo para o contrato bater com a tela. Não bloqueia.

## Acessibilidade e regras (lido)
- Reaproveita `CartaoComplementar`, `TabelaDados`, `AmostraInsuficiente` e `Leia`, já usados no T8: foco, contraste e semântica de tabela herdados (`lido`). Sem cor como único portador de informação.
- Estados: carregando, vazio ("fora da conta" no estado vazio), erro e insuficiente estão cobertos pelo componente base e pelo teste (`lido`).
- Texto em pt-BR, sem culpar o usuário. Nenhuma métrica individual; nenhuma comparação entre times; mínimo de 20 aplicado.
- Catálogo (`catalogo-metricas.ts` T15): pergunta "Quantos dias úteis dura uma sprint do time?" e meta "Sem meta; leia o P50 e o P85 com a média" estão adequados; "do time" também precisa do ajuste do A-1 para não prometer um time quando o filtro tem vários.

## Veredito
Aprovar depois de corrigir A-1 (texto e teste). M-1 e M-2 podem entrar junto, são só texto. Sem protótipo novo necessário.

# Revisão de UX: T15 Tamanho das sprints (E7.579 e E7.583)

commit: add0e640c7116452681f6f63e0f7fed54f048cb5
parecer: aprovado. A1, M-1 e M-2 da primeira rodada estão resolvidos no add0e640. Nenhum achado bloqueante; 1 recomendado de baixa severidade. Leitura do código (acessibilidade: `lido`, nada `medido`); a suíte do CI e o `pronto` do autor (verde, `docs:check` ok) não foram reexecutados aqui e não afirmo CI verde.

## Achados
- A1 (recomendado) web/src/content/catalogo-metricas.ts:537 · a pergunta do catálogo ainda diz "uma sprint do time?" e promete um time; com 0 ou 2+ times no filtro as sprints se somam. Trocar por "Quantos dias úteis dura uma sprint?". Não bloqueia.

## Revalidação (head add0e640, delta 96c33020..add0e640)
| Item da primeira rodada | Resultado | Evidência (`lido`) |
|---|---|---|
| A-1 (alto) texto "Um time por vez" | resolvido | `previsao.tsx:277` e `notas.ts:144` dizem "Com mais de um time no filtro (ou nenhum), as sprints dos times se somam; para ver um time, filtre por ele"; comentários em `previsao.tsx:224`, `criterios.ts:415` e `metricas.ts:253` alinhados; `t15-tamanho-sprints.test.tsx:41` trava a frase nova |
| M-1 (médio) cabeçalho longo | resolvido | `previsao.tsx:258` título "Média"; o aviso foi para a linha `Leia` (`previsao.tsx:278`) e para `comoLer` em `notas.ts:141` |
| M-2 (médio) recorte na legenda | resolvido | `previsao.tsx:253`: "Duração das sprints em dias úteis no recorte do filtro de time: P50, P85 e média juntos" |
| B-1 (baixo) P95 enviado e não mostrado | mantido, não bloqueia | `p95` segue no contrato e no teste (`t15-tamanho-sprints.test.tsx:34`); decisão de contrato do dono/arquiteto |

- Regra inviolável preservada: nenhuma comparação entre times, nenhum ranking, sem meta ("Sem meta e sem comparar times"); a soma de times é decisão do dono e agora está dita na tela.
- Mínimo de 20 sprints mantido (`previsao.tsx:243`, `AmostraInsuficiente`); P50, P85 e média sempre juntos.
- Acessibilidade (`lido`): componentes base reaproveitados (`CartaoComplementar`, `TabelaDados`, `AmostraInsuficiente`, `Leia`); cabeçalho curto melhora a leitura por leitor de tela; sem cor como único portador de informação. Contraste e leitor de tela sem medição; o QA mede.
- Texto em pt-BR, sem culpar o usuário. Sem protótipo novo necessário.

## Veredito
Aprovado para seguir. O A1 é só texto de catálogo e pode entrar junto ou depois.

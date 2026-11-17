---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-s1-pausa-validacao
commit: ec0d232e142501f34a540d347099942d8c4ffbed
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: S1 pausa o SLA em "Aguardando Validação" (K-389, E7.412; review E7.435)

Diff lido: `git diff e1c98633...ec0d232e` (base `e1c98633`, com a `develop` integrada em `d84a19a9`). Quatro arquivos, 26 adições e 10 remoções, dentro do teto M14.

## O que mudou
- `packages/metricas/src/acelerato/totalizadores.ts:80-95`: `pausaOSla` compara contra um conjunto fixo (`CHAVES_PAUSA_SLA`), montado uma vez de `ETAPAS_PAUSA`, `Pendente` e das chaves de `MOTIVO_DA_ESPERA`, todas passadas por `semAcento` (`trim`, minúsculas pt-BR, NFD sem diacríticos). A lista de etapas que pausam não muda; muda só a comparação. Era o defeito: `ETAPAS_PAUSA` comparava com caixa exata, e a etapa real "Aguardando Validação" não pausava o relógio.
- `server/src/modulos/referencia/criterios-acelerato.ts:72-77`: critério datado `105:S1-pausa-validacao` (T2.6), em 11º, depois do `105:S1-escala-p` (10º), com `metricas: ['S1']` e motivo que diz que o número do S1 muda.
- Testes: `acelerato.test.ts:499-500` ("Aguardando Validação" e "AGUARDANDO VALIDACAO"); CT-49 (`server/tests/criterios-acelerato.test.ts`) com onze entradas e o id 11 ligado ao S1.

## Checklist (leitura)
1. Faz o que o cartão pede: sim. Uma regra de comparação, sem etapa nova na lista (a decisão do dono sobre quais etapas pausam fica intacta); critério datado presente.
2. Regras invioláveis: o cálculo fica na biblioteca compartilhada (`packages/metricas`), usado por `indice.ts:82`; nada mistura BusinessMap e Acelerato; mudança de critério registrada com data.
3. Legível: a função ficou menor; o conjunto pré-calculado evita refazer a normalização das chaves a cada etapa.
4. Tipos e erros: sem escape de tipo; `semAcento` é pura.
5. Segurança: sem dado pessoal, sem entrada externa nova (a etapa já vinha do staging).
6. Performance: `Set.has` por etapa, melhor que o `includes` anterior.
7. Testes: o caso real e o sem acento estão cobertos; os negativos (`Equipe Interna`, `Aprovação`) continuam falsos.
9. Commits: `0d03649c` (correção), `d84a19a9` (merge da `develop`), `ec0d232e` (CT-49 com onze); mensagens claras.

## Execução
- `packages/metricas`: `vitest run src/acelerato/acelerato.test.ts` → 27 passaram. `server`: `vitest run tests/criterios-acelerato.test.ts` → 6 passaram.
- Mutante: tirar a remoção de diacríticos de `semAcento` (`.replace(/\p{Diacritic}/gu, '')` → regex que não casa nada) derruba `D5a: de-para das esperas decididas…` (1 falhou, 26 passaram). A guarda nova tem teste do ramo que mata o mutante. Fonte restaurada (`git checkout`).
- Suíte: não rerrodada. CI do `0d03649c` (run `43999809249`) verde; o run do `ec0d232e` (`44008614493`) foi cancelado pelo push seguinte (`967150c4`, só o parecer do QA; run `44009025868` na fila). Sem PR: este parecer não afirma CI verde; o CI do PR decide o merge.

## Achados
- A1 (recomendado) packages/metricas/src/acelerato/totalizadores.ts:130 · `classeDaEtapaEI` mantém `|| n === 'aguardando validação'`, que agora é redundante (`pausaOSla` já cobre a etapa em qualquer caixa e acento); remover na próxima passada pelo arquivo, sem mudar o EI_SUST.
- A2 (recomendado) packages/metricas/src/acelerato/totalizadores.ts:71 · `pausaOSla` ignora acento e `motivoDaPendencia` (S9) não: uma etapa sem acento pausaria o S1 sem motivo no S9; sem evidência nos dados, alinhar numa função só.

## Parecer
Aprovado no `ec0d232e`. Os achados são recomendados e não voltam ao autor neste item.

# Revisão de UX do T3 com o Habilitador (E7.519)

Head revisado: dbf457a1. Leitura pelo código; nada foi medido (sem Bash). Itens de acessibilidade abaixo são `lido`.

parecer: aprovado com ressalvas (1 alto, 1 médio, 1 baixo); nenhum crítico. O PQ do autor (pronto rc=0) vale como dele; este parecer não afirma CI verde.

## O que está certo
- Cartão T3 (`CartaoT3.tsx`): quatro fatias na ordem de `FATIAS_T3`; fatia abaixo de 20 mostra só a contagem e o rótulo "menos de 20 entregas", sem %; texto de leitura avisa que a soma fica abaixo de 100% (lido).
- Sem acordado, desvio ou selo de meta: nada vira avaliação de pessoa ou de time (regra inviolável respeitada).
- Seletor "Contar por" é fieldset com legend e radios nativos com label; operável por teclado (lido).
- Filtro Tipo: Habilitador entra em `TIPOS_FILTRO` antes de Trabalho de produto, com id `habilitador` e rótulo claro; mesma lista no mock (lido).
- Nota do T3 explica o mapeamento Enabler -> Habilitador e registra o critério com data 17/11/2026.

## Achados
### Alto
1. `web/src/components/charts/tema.ts`, `ORDEM_TIPOS` (linhas 18-26): não contém Habilitador nem Trabalho de produto. `marcaDoTipo` usa `Math.max(0, indexOf)`, então os dois caem no índice 0, a mesma cor e o mesmo padrão (liso) de Incidente. No O4 "por tipo" (`CartaoO4.tsx`, empilhado, série por `TIPOS_CARD`) o Habilitador novo fica indistinguível de Incidente e de Trabalho de produto, e a cor nem o padrão salvam (WCAG 1.4.1). Correção: acrescentar 'Habilitador' e 'Trabalho de produto' em `ORDEM_TIPOS` (cor/padrão fixos e distintos; com 6 cores cíclicas, escolher combinação cor+padrão única por tipo) e um teste que garanta marcas únicas para todos os `TIPOS_CARD`.

### Médio
2. `CartaoT3.tsx` linhas 60-72: se o total for >= 20 mas todas as fatias ficarem < 20 (por exemplo 5+5+5+5), `ok` é verdadeiro e `publicadas` fica vazio: o gráfico renderiza sem barras e sem explicação, só a lista abaixo. Correção: quando `publicadas.length === 0`, trocar o gráfico por uma frase ("Nenhuma fatia tem 20 entregas; veja as contagens abaixo.") ou não renderizar `Barras`.

### Baixo
3. Eixo do gráfico usa `unidade="% da capacidade"` e a série se chama "Realizado", mas a medida é fatia das entregas (itens ou dias úteis), sem comparação com combinado. "Realizado" sugere meta; "capacidade" diverge do texto de leitura. Correção: unidade "% das entregas" e série "Entregas" (ou ocultar a legenda, já que há série única). Também o título "Alocação da capacidade" no catálogo merece revisão de nomenclatura com o dono (decisão dele, não minha).

## Heurísticas
Status visível (aviso de abaixo de 20) e prevenção de erro de leitura (não publica % em amostra pequena) bem atendidos. Consistência quebrada só no achado 1.

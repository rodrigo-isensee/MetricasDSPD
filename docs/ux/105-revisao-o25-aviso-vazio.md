# Revisão de UX: aviso de preenchimento no O25 vazio (K-399, E7.466)

Head revisado: f509357a. Leitura pelo código (todos os itens são `lido`, nada `medido`).
Do autor, cito o pronto rc=0 dele; não afirmo CI verde (a suíte inteira fica para o CI do PR).

parecer: aprovado com ressalva (1 achado baixo, nenhum bloqueia)

## Verificado
- Mesmo texto e mesmo testid (`o25-aviso-preenchimento`) no corpo e no vazio: ambos chamam `notaPreenchimentoO25` (operacionais.tsx:702, usos em 726 e 802). Nenhum texto novo, nenhum cálculo novo.
- Só com contagem maior que zero: `n <= 0` devolve `null`; sem aviso vazio nem "0 cards têm".
- Só no estado vazio: `complementoVazio` é renderizado por CartaoMetrica apenas com `estado === 'vazio'`; o corpo não aparece nesse estado, então não duplica.
- Acessibilidade: `AvisoInfo` tem ícone "info" (não depende só de cor), `text-sm` e `text-texto-2` (token do sistema); plural correto ("card tem" / "cards têm"). Sem interação nova, sem alvo de toque novo.
- Coerência com o K-373: o O25 era o item que ficou de fora lá; agora segue o mesmo padrão dos demais.

## Achados
- Baixo 1 (consistência, O25 vazio): a nota fica colada à caixa tracejada do estado vazio, sem `mt-2`, igual ao que já apontei no K-373 (Baixo 1). Correção: dar `mt-2` ao contêiner de `complementoVazio` em CartaoMetrica.tsx, tratando todos os cartões de uma vez.

Sem críticos, altos ou médios.

Melhoria vista: nenhuma

# Revisão de UX: nota de exclusão no estado vazio (K-373, E7.458)

Head revisado: 556d057b. Leitura pelo código (todos os itens abaixo são `lido`, nada `medido`).
Do autor, cito o pronto rc=0 dele; não afirmo CI verde (suíte inteira fica para o CI do PR).

parecer: aprovado com ressalvas (2 achados baixos, nenhum bloqueia)

## Verificado
- Mesmo texto do estado com dado: S5, S6, S7 e S11 usam `NotaForaDoFluxo` (comuns.tsx); S8 reaproveita `textoSemResposta`; O19 `notaAbertosO19`; E6 `notaSemDataE6`; S1 `notaForaDaMatriz` (o corpo com dado usa o mesmo helper). Nenhum texto novo, nenhum cálculo novo.
- Só com contagem maior que zero: `n <= 0 -> null` em NotaForaDoFluxo, O19 e E6; S8 e S1 testam `> 0` antes de passar. Sem nota vazia nem "0 ficaram fora".
- Só no estado vazio: CartaoMetrica.tsx:392-397 renderiza `complementoVazio` apenas com `estado === 'vazio'`; sem duplicar com o corpo.
- Legibilidade: `text-sm` e `text-texto-2` (token do sistema); S5 a S7 e S11 têm ícone "info", então a informação não depende só de cor. Sem interação nova, sem alvo de toque novo.
- Desvio de escopo (arquivos em web/src/features fora do brief): julgo justificado. O brief era estreito demais; a mudança é aditiva e limitada à prop opcional.
- Itens fora (O26, T13, O12, O18, O22, O25): coerente, sem dado por bloco ou por categoria.

## Achados
- Baixo 1 (consistência, S1, S5, S6, S7, S11, O19, E6): S8 e T9 envolvem a nota em `<p className="mt-2 text-sm">`; as demais ficam coladas à caixa tracejada do estado vazio, sem `mt-2` (CartaoMetrica.tsx:394-395). Correção: dar `mt-2` ao contêiner de `complementoVazio` em CartaoMetrica e tirar o `mt-2` de S8 e T9.
- Baixo 2 (microcopy, correspondência): a mensagem de vazio diz "Não há itens para estes filtros no período." e a nota logo abaixo cita itens (ex.: "12 chamados ficaram fora desta métrica"). Não contradiz, pois a nota diz o que ficou fora da conta, mas a leitura rápida pode confundir. Correção sugerida, se o dono quiser: nota precedida de "Fora da conta:" ou ajuste da mensagem para "Nenhum item entrou na conta...". Não bloqueia; decisão de texto é do dono (R-DECISAO).

Sem críticos, altos ou médios.

Melhoria vista: nenhuma

---
tipo: revisao-ux
pedido: 105-melhorias-15-11
etapa: E7.58
branch: fix/105-o26-motivo-data
commit: 97d972c2
parecer: aprovado
revisor: ux-designer
data: 2026-11-16
---

# Revisão de UX: texto do motivo do O26 (E7.58)

Arquivos: `packages/contratos/src/origem.ts` (linhas 129-137 e 145), `web/src/components/ui/EstadoSemDadoReal.tsx`. Comparado com os motivos O17, O12, O8 e S11 do mesmo arquivo. Tudo `lido` (código); nada `medido`. Decisão 2 do dono de 16/11: "A, mostra a partir de qual data ele vai ter dado real e o motivo."

## Texto como a pessoa lê
Cartão "Sem dado real", linha "Motivo:" seguida de:

> A base guarda a troca de responsável dos cards desde 09/11/2026; a métrica precisa de 12 semanas de histórico e passa a ter dado real a partir de 01/02/2027.

## Parecer
**Aprovado, com dois baixos opcionais.** Atende a decisão do dono: diz o motivo (falta histórico) e a data em que o dado real chega (01/02/2027, início 09/11/2026 mais 12 semanas, conferido). A data está em dd/mm/aaaa, formato do Brasil, sem ambiguidade. Sem número no lugar do dado, sem pessoa, ranking ou comparação. Sem achado crítico, alto nem médio.

## Conformidade
| Ponto do brief | Resultado | Evidência (`lido`) |
|---|---|---|
| Simples para quem não é técnico | Confere, com ressalva (Baixo 1) | `origem.ts:137` |
| Data clara | Confere | `origem.ts:130-132`; datas por extenso em dd/mm/aaaa |
| Igual ao padrão dos outros motivos | Confere, com ressalva (Baixo 2) | frase completa com maiúscula e ponto final, como o S11 (`origem.ts:108`) e como a revisão do S11 (Baixo A) pediu |
| Aparece com ícone e texto, não só cor | Confere | `EstadoSemDadoReal.tsx:15-18` |
| Nunca vira 0 | Confere | cartão sem número; `MOTIVO_ORIGEM_MOCK` só vale com origem `sem-dado` (`origem.ts:173`) |

## Achados

**Baixo 1. "A base" é palavra de quem trabalha com dados.**
Onde: `origem.ts:137`. Por quê: quem lê o painel pensa em "o sistema" ou "o BusinessMap"; "a base" pode soar como o quadro ou como a equipe. Correção: trocar por "O sistema". Também vale dizer "só passou a guardar", que explica por que não há mais histórico.

**Baixo 2. Duas informações numa frase só, ligadas por ponto e vírgula.**
Onde: `origem.ts:137`. Por quê: a data, que é o que o dono pediu, fica no fim de uma frase longa (cerca de 30 palavras). Os outros motivos completos (S11) têm uma frase curta. Correção sugerida, duas frases curtas e a data na segunda:

> O sistema só passou a guardar a troca de responsável dos cards em 09/11/2026, e a métrica precisa de 12 semanas de histórico. Ela terá dado real a partir de 01/02/2027.

Observação, sem exigir mudança: os motivos O17, O12 e O8 são fragmentos em minúscula ("aguardando ..."), mas o próprio S11 já usa frase completa e o componente exibe o texto como está; manter frase completa é o caminho já adotado. Se mudar o texto, atualizar o teste de contratos e o de web que comparam a frase.

## Pendente para o usuário
Nenhuma validação de interface nova.

## Parecer final
parecer: aprovado. O texto cumpre a decisão 2 do dono; os dois baixos são de redação e não bloqueiam.

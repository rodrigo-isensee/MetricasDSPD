---
pedido: 060-triagem-dependabot
branch: feature/060-web-so-real
commit: b85663ed535ec321409938a2812d9e468f9eb2d5
etapa: E2.22
autor: ux-designer
veredito: aprovado (sem achado crítico, alto ou bloqueante; restam 3 observações baixas)
---

# Revisão de interface: estado "Sem dado real" (P4 e parte de web do P5)

Escopo: leitura do código na ponta b85663e, com o delta da volta 2 (bd6d6f2..b85663e) conferido contra os achados da revisão anterior (bd6d6f2). Nada foi executado no navegador: contraste pelos tokens, tela estreita pelas classes. A coerência com a Visão Geral vale só pelas decisões do dono copiadas no pedido.

## Veredito
Aprovado. Os achados 1 e 2 (médios) da revisão anterior foram corrigidos; o estado segue sem número, com motivo visível, ícone mais texto, sem "Tentar de novo", e o cartão não some (Q1 "A"). Pode seguir para o PR (E2.23).

## Achados da revisão anterior
| # | Situação | Conferência em b85663e |
|---|---|---|
| 1 Motivo sem rótulo | Resolvido | "Motivo:" em negrito no cartão (EstadoSemDadoReal) e no Resumo (NumeroChave), igual ao PDF. |
| 2 Caso misto na faixa | Resolvido | FaixaAtencao tem o estado parcial: "Parte das métricas está sem dado real; não dá para afirmar que nada pede atenção". |
| 3 Nota "N cartões" | Aberto, baixo | OrigemDosCartoes: a nota segue sem dizer onde ver o motivo. Sugestão: "(motivo em cada cartão)". |
| 4 Quebra do motivo | Aberto, baixo | NumeroChave: motivo em text-xs, sem quebra forçada. Usar text-sm e [overflow-wrap:anywhere]. |
| 5 Ícone do leitor de tela | Aberto, baixo | Icone não verificado quanto a aria-hidden. Confirmar para não ler "info" antes do texto. |

## Observação nova (baixo)
- FaixaAtencao: no caso parcial com alertas (lista não vazia), a lista aparece sem aviso de que parte das métricas está cega. Considerar o mesmo aviso acima da lista.

## O que está bom (manter)
- Texto "Sem dado real" e "Motivo" iguais no cartão, no Resumo, na faixa e no PDF.
- Contraste de texto-2 e atenção passa em 4,5:1 nos dois temas, pelos tokens.
- Borda tracejada diferencia o estado sem depender de cor.
- A nota do cabeçalho não depende das preferências de cartões ocultos.

## Coerência com as decisões do dono
- Q1 "A": atendida.
- P1 e P2 da Visão Geral: componente reutilizável, sem largura imposta; a conferência na tela fica para a implementação da Visão Geral.
- Regra de 20 itens e separação BusinessMap e Acelerato: não alteradas por esta branch.

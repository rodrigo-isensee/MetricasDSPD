---
pedido: 105-melhorias-15-11
etapa: E3.52
branch: fix/105-s1-registro-posterior
commit: f78a493b
revisor: ux-designer
data: 2026-11-15
parecer: aprovado com ressalvas (textuais, baixas)
---

# Revisão de UX do texto de "registro posterior" (S1, S2, S12)

Escopo: só o texto. Tudo é `lido` (pelo código); nada foi medido. Fecha o A3 de `docs/ux/105-revisao-k351.md`.

Veredito: o jargão "registro posterior" e "exceção" saiu e o sentido do dono ("A": chamado aberto no sistema depois do atendimento; "B": a equipe não marca isso no Acelerato) está correto em todos os lugares. O MTTR "pendente ou em validação" está claro. Nada bloqueia. Restam a frase não ser igual em todos os lugares e dois termos ainda técnicos.

Formas hoje (4 redações para a mesma ideia):
1. `notas.ts` S1: "registrados no sistema depois que o atendimento já aconteceu ficam de fora".
2. `VisaoSustentacao.tsx`: "registrados depois que o atendimento já aconteceu ficam fora destas apurações".
3. `CartaoS1.tsx` e `origem.ts`: "registrados depois do atendimento (fora desta apuração pela regra...)".
4. `complementares/notas.ts` e `sustentacao.tsx` (S12): "registrados depois do atendimento".

## Achados

| # | Sev. | Onde | Por quê | Correção sugerida |
|---|---|---|---|---|
| A1 | baixo | Os quatro pontos acima | Mesma regra com redações diferentes ("no sistema", "já aconteceu", "fora"/"de fora"/"fora desta apuração"). Quem lê dois cartões pode achar que são regras distintas. | Frase única, curta: "chamados abertos no sistema depois do atendimento ficam de fora do cálculo". Usar a mesma em S1 (cartão e "Como se calcula"), S2, S12 e no recorte da visão. |
| A2 | baixo | "apuração", "apurações", "apurável" (`CartaoS1.tsx:184`, `VisaoSustentacao.tsx:66`, `origem.ts:192`) | "Apuração" é palavra de contabilidade, não do dia a dia; foi o jargão apontado no K-351 e voltou em outra forma. | Trocar por "do cálculo" ou "desta conta"; "todo chamado fechado conta como apurável" vira "todo chamado fechado entra no cálculo". |
| A3 | baixo | "hoje o Acelerato não traz essa marca" (S1, S2, recorte, origem.ts) | "Marca" é vago; o dono disse que a equipe não registra essa informação no Acelerato. A frase mistura o que o sistema "traz" com o que a equipe "marca". | "hoje a equipe não registra isso no Acelerato, então nenhum chamado fica de fora por esse motivo." Mantém o fato e deixa claro quem precisa agir. |
| A4 | baixo | S12: "campo sem fonte" (`sustentacao.tsx:313`, `origem.ts:205`) | "Sem fonte" é jargão de dados; fora do escopo estrito, mas aparece colado à mesma frase. | "sem dado: hoje a equipe não registra isso no Acelerato". Manter nunca mostrar 0%. |
| A5 | baixo | S1, "Como se calcula" curto (`notas.ts:18`) | Cita `REALIZADO_NO_PRAZO`, código do sistema, na mesma linha onde a regra foi simplificada. | "chamados fechados dentro do prazo ÷ chamados fechados". |

## Sugestão de texto único (aplicar nos quatro pontos)

"Chamados abertos no sistema depois do atendimento ficam de fora do cálculo. Hoje a equipe não registra isso no Acelerato, então nenhum chamado fica de fora por esse motivo."

Contagem do cartão S1: "N chamados abertos depois do atendimento (de fora do cálculo)." Singular: "1 chamado aberto depois do atendimento". Atenção: o teste `ramos.test.tsx:36` trava `/^1 chamado registrado depois do atendimento/`; se trocar "registrado" por "aberto", atualizar os testes junto.

## O que não deve mudar
- "pendente ou em validação" no MTTR do S1.
- Singular e plural da contagem; S12 nunca mostra 0% quando não há dado.
- 8 h 48 min e a distinção corridas x úteis.

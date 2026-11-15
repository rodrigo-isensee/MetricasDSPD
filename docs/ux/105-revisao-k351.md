---
pedido: 105-melhorias-15-11
etapa: E3.37
branch: fix/105-k351-s1-texto
commit: 8a576277
revisor: ux-designer
data: 2026-11-15
parecer: aprovado com ressalvas (textuais, baixas)
---

# Revisão de UX do K-351 (texto "Como se calcula" do S1)

Escopo: só o texto de `CARTOES.S1.comoSeCalcula` em `web/src/features/sustentacao/notas.ts` (linha 9). Tudo é `lido`; não conferi contra `modelo.ts` e `s1.ts` (o brief diz que o autor conferiu).

Texto atual: "P1 (primeiro atendimento e restauração) e o primeiro atendimento de P2 contam em horas corridas, 24 h por dia. Os demais prazos contam em horas úteis do expediente da Sustentação (1 dia útil = 8 h 48 min). No MTTR, o tempo em pendência é descontado do relógio; exceções de registro posterior ficam fora desta apuração."

Veredito: a regra está clara e correta no essencial (corridas x úteis, 8 h 48 min, pendência descontada). Nada bloqueia. Três ajustes de linguagem, todos baixos.

## Achados

| # | Sev. | Onde | Por quê | Correção sugerida |
|---|---|---|---|---|
| A1 | baixo | "No MTTR" | Sigla sem explicação neste cartão; quem não é técnico não sabe que é o tempo de restauração. | "Na restauração (MTTR), ..." |
| A2 | baixo | "descontado do relógio" | Metáfora vaga; não diz o que acontece com o tempo. | "o tempo em que o chamado ficou pendente não entra na conta" |
| A3 | baixo | "exceções de registro posterior ficam fora desta apuração" | "Registro posterior" e "apuração" são jargão e não dizem o que sai. Mesmo termo aparece no S2 ("ficam de fora"), então vale uniformizar. | "chamados registrados depois do atendimento ficam de fora" (usar a mesma frase no S2) |

## Texto proposto (opcional)

"P1 (primeiro atendimento e restauração) e o primeiro atendimento de P2 contam em horas corridas, 24 h por dia. Os demais prazos contam em horas úteis do expediente da Sustentação (1 dia útil = 8 h 48 min). Na restauração (MTTR), o tempo em que o chamado ficou pendente não entra na conta. Chamados registrados depois do atendimento ficam de fora."

Observação: a proposta do A3 depende de o autor confirmar que "registro posterior" significa isso; se for outra coisa, manter o termo atual. Dúvida de regra não resolvo por inferência.

## Em aberto
Acessibilidade: não aplicável a esta mudança (só texto, mesmo componente).

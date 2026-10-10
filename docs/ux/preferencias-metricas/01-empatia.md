# Preferências de métricas · 01 Empatizar

Pedido 007 · 2026-10-10 · autor: `ux-designer`. Fonte: pedido 007, spec do dashboard (personas, seção 1.4), design system. Não há pesquisa com usuários além disso; o que falta está marcado como **hipótese (H)**.

## Personas e o que ocultar
| Persona | Contexto | Dor com "tudo sempre visível" | Frequência |
|---|---|---|---|
| Time / líder técnico (FL1) | Daily de 15 min, TV | Rolar por 9 cartões para achar O2 e Bloqueados (H) | Diária |
| Coordenador (FL2) | Reunião quinzenal, projetado | Só usa T2, T4, T9; o resto distrai (H) | Quinzenal |
| Gerente (FL3) | Notebook e celular | No celular, rolagem longa (H) | Mensal |
| Líder da sustentação | Notebook | Quer S1 e S2 no topo, S6 e S7 raramente (H) | Semanal |
| Quem recebe um link | Qualquer tela | Não sabe que a visão que vê foi recortada | Eventual |

## Mapa de empatia (resumo, H)
- Pensa: "Só preciso de 3 gráficos; os outros eu nunca abro." / "Será que estou perdendo algo importante se escondo isso?"
- Sente: sobrecarga na primeira visita; ansiedade de esconder algo que depois dá problema.
- Vê: painéis longos, todos os cartões com o mesmo peso. Ouve: "Manda o link da tela" em reunião.
- Faz: copia o link e cola no chat; projeta a tela. Dores: não sabe se o colega vê o mesmo; esquece que escondeu algo. Ganhos: painel curto, rápido de ler, sem perder alertas.

## Jornada atual e atritos
1. Abre painel → 2. rola até o cartão que interessa (atrito: rolagem) → 3. cartões irrelevantes competem com os relevantes (atrito) → 4. copia link (a visão é a mesma para todos, sem dificuldade).
Risco novo que a feature cria: link compartilhado com visão recortada gerar leitura errada ("cadê o O9?"); alerta escondido passar despercebido.

## Hipóteses e perguntas abertas
- H1: a maioria dos usuários ocultará poucos cartões (1 a 3), não montará painéis do zero. Por isso o padrão é "tudo visível".
- H2: predefinições por papel ajudam quem entra pela primeira vez. **Pergunta ao usuário:** querem predefinições (Time, Coordenação, Gerência, Sustentação) ou só "tudo visível"? Predefinição é atalho de seleção, nunca cadastro de papel da pessoa.
- H3: a faixa "Pede atenção" e os avisos devem continuar mesmo com a métrica oculta. **Pergunta ao usuário** (decisão de produto): confirmar.
- H4: ocultar a Visão geral não é desejado (é resumo). **Pergunta ao usuário.**
- Pergunta: ocultar um cartão também oculta seus avisos internos (amostra insuficiente, nota)? A interpretação adotada: avisos pertencem ao cartão e somem com ele **só se o cartão está oculto**; avisos de painel e de critério vigente continuam (ver 03).

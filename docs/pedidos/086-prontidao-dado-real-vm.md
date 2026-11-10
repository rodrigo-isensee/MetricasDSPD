# Pedido 086: o que falta para Operacional, Acelerato e Apontamento com dado real antes da VM

- **Modo:** analisar
- **Objetivo:** responder ao dono, com evidência, o que falta para os painéis Operacional (fluxo do BusinessMap), de sustentação (Acelerato) e a aba Apontamento ficarem prontos com dado real, para ele migrar para a VM oficial depois.
- **Clareza:** 1 confirmado; 1 técnico; 0 suposição; 0 perguntas
- **Depende de:** 064 (lacunas do dado real), 069, 075, 077

## Escopo
- E1. Inventário, por painel (Operacional, Sustentação/Acelerato, Apontamento), de cada métrica ou bloco: já com dado real na develop, em PR aberto, em lote pendente, ou preso (a quê: decisão do dono, pessoas/WS1, dado da fonte, governança), com o caminho para fechar e a ordem; e o que a migração para a VM exige do projeto (coleta agendada, variáveis, banco) · `confirmado`

## Etapas
- E1.1 (software-architect): inventário só de leitura, em docs/analises/086-prontidao-dado-real-vm.md, sem commit.

## Fora do escopo
- Implementar qualquer lacuna; mexer na VM ou no banco real · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-10 12:34: DONO (literal): "o que falta para deixar as operacionais, acelerato e apontamento prontas com dados reais. Dai com isso vou migrar para a vm oficial". Pedido aberto (Jarvis) no modo analisar; recibo: vou fazer um inventário por painel do que já tem dado real, do que está em PR e do que falta, com o motivo e a ordem; não vou implementar nada agora.
- 2026-11-10 12:36: brief selado docs/briefs/086-prontidao-dado-real-vm-software-architect-1.md 3f97d1352889ba346317770a8038de5230df92672d21b4746ce3ab58dc369d01
- 2026-11-10 12:38: Inventário (software-architect-1) entregue em docs/analises/086-prontidao-dado-real-vm.md, sem commit. Correções do Jarvis ao ler: o lote 4c do 075 já está na develop (PR 274, mesclado), não "PR sem abrir"; a P-077-6 já foi respondida ("A", 2026-11-07). Resumo levado ao dono.

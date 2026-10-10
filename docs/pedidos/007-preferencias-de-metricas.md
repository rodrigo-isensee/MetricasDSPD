# Pedido 007 — Preferências de métricas por usuário

Solicitante: Rodrigo Isensee · Data: 2026-10-10 · Registrado pelo Jarvis · Responsáveis: `ux-designer` + `software-architect` (discovery), depois o time

## Objetivo
1. **No perfil do usuário**, uma opção para ativar ou desativar as métricas que ele deseja ver nos painéis.
2. **Na hora de visualizar** um painel, poder marcar ou desmarcar quais métricas quer ver naquele momento.
O `ux-designer` decide a melhor interface para os dois casos; o `software-architect` prepara a solução técnica.

## Restrições (CLAUDE.md e briefing)
- A preferência controla apenas **quais cartões de métrica aparecem**. Não pode esconder avisos obrigatórios: dados fictícios, amostra insuficiente, base amostral, nota metodológica, marcação de mudança de critério.
- Preferência é pessoal e não é métrica: ninguém vê as escolhas de outra pessoa, nada é agregado por pessoa, nenhuma comparação entre usuários.
- Painéis continuam respeitando BM × AC separados e as demais regras invioláveis.

## Fluxo
Discovery em dupla (Design Thinking + viabilidade técnica) → protótipo → **validação do usuário** (ponto de compromisso) → plano técnico → implementação, code review, QA, revisão de UX → PR.

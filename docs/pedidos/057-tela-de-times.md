# Pedido 057: tela de administração da lista de times

- **Modo:** implementar (discovery primeiro; código só depois da validação do protótipo)
- **Objetivo:** "preciso de um menu para administrar essa lista de times." (dono, 2026-10-30)
- **Clareza:** 4 confirmados; 0 suposições; 0 perguntas
- **Depende de:** pedido 052 (decisões H-6 e H-6 (ii) sobre o que é um time; o coletor não espera esta tela)

## Escopo
- E1. Tela para criar, renomear e desativar times (desativar não apaga), escolher quais workflows dos 7 quadros da coleta formam cada time, marcar workflows como fora do painel operacional e ver o histórico de cada mudança com data · `confirmado` (recibo aceito)
- E2. Lista de times no banco do sistema, editada pela tela, com histórico (quem, o quê, quando) e marcação nos gráficos quando um time muda (T2.6) · `confirmado` (dono, "A")
- E3. Carga inicial da lista com as decisões do dono de 2026-10-30 (Equipe de processos, Arquitetura e Auditoria como times próprios; workflows 257, 201, 321, 215, 216 e 196 e os de Kaizen, RDM/GMUD e Acompanhamento Atividades fora) · `confirmado`

## Etapas
- E0.1 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-057` e branch `docs/057-tela-de-times` a partir da `develop`, com push, sem commit novo e sem testes.
- E1.1 (ux-designer): Design Thinking e protótipo navegável da tela, na worktree 057, sem commit.
- E1.2 (software-architect): desenho da tabela da lista de times, do histórico, da marcação T2.6 e da leitura pelo coletor e pelos painéis, na worktree 057, sem commit, em paralelo à E1.1.
- E1.3 (security-engineer): quem pode editar, proteção do histórico contra alteração e modelo de ameaças da tela, na worktree 057, sem commit, em paralelo à E1.1.
- E1.4 (dono): validar o protótipo (ponto de compromisso).
- E2.1 (tech-lead): commit, review e PR do discovery para a develop, depois da E1.4.
- E3.1 (a definir depois da E1.4): implementação, segurança, code review, QA, revisão de UX e PR.

## Fora do escopo
- Alterar o BusinessMap · `confirmado`
- Comparar times entre si, ranking ou visão por pessoa · `confirmado` (regra inviolável do CLAUDE.md)
- Segurar o coletor do 052 por causa da tela · `confirmado`
- Limite de WIP na tela (vem das colunas do BusinessMap, H-12) · `confirmado`

DECISÃO DO DONO (2026-10-30): "preciso de um menu para administrar essa lista de times." (pedido 052, depois da H-6).
DECISÃO DO DONO (2026-10-30): "A" (onde a lista fica): no banco do sistema, editada pela tela, com histórico de cada mudança e marcação T2.6; supera, só para a lista de times, o arquivo versionado da H-6 e da Q-7c.
DECISÃO DO DONO (2026-10-30): "sim" (recibo do 057 aceito).

DECISÃO DO DONO (2026-10-30): "A" (recorte para segunda 2026-11-02): dados reais do BusinessMap e do Acelerato na base, mais as métricas que já saem deles; a tela de times e as métricas que dependem de respostas pendentes ficam para depois. Complemento do dono: "quero as operacionais e as do acelerato so, tatico e estrategico ficam para depois".

## Suposições
- nenhuma

## Histórico
- 2026-10-30 16:56: pedido aberto a partir do 052; recibo aceito pelo dono ("sim").
- 2026-10-30 17:17: DECISÃO DO DONO (recorte para segunda): a tela fica para depois de 2026-11-02. DECISÃO TÉCNICA (Jarvis): a tabela de times e a carga inicial (E2 e E3 deste pedido) entram com o coletor do 052; a tela (E1) e o histórico editável seguem aqui depois.

---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-excecao-apontamento
commit: 0d594f0c3ec19d7ac6cc2ed94d84cf0393c5c100
parecer: aprovado
revisor: tech-lead
data: 2026-11-01
---

# Code review: exceção da aba Apontamento no CLAUDE.md e no briefing (E1.7, K-193)

**Veredito: aprovado.** PR só de documentação: 2 arquivos, 1 linha acrescentada em cada, nenhuma linha removida. Sem código, logo sem teto M14 a conferir.

**Ferramentas (citadas):** `pnpm run docs:check` na raiz da worktree: `docs:check: ok (845 páginas Markdown, 69 métricas, 2 eventos)`.

## Leitura

- `CLAUDE.md`: o item novo entra depois de "Nenhuma métrica pode servir para avaliação individual" e antes de "Métricas proibidas", como o plano 1.1 manda. Texto literal do plano, com os dois ajustes do brief: a frase da ADR 0020 virou "será registrado na revisão da ADR 0020 da fatia de código da aba" (a revisão 4 não existe) e as quatro cláusulas aprovadas pelo dono (o1 a o4) fecham o item.
- `docs/briefing-execucao-metricas.md` §7.1: parágrafo novo no fim da lista, antes do §7.2, texto literal do plano 1.2 mais as quatro cláusulas. Os itens existentes ficam intactos, e "horas apontadas como proxy de esforço entregue" segue proibido no restante do sistema.
- Regras invioláveis: a exceção é única, restrita ao worklog do BusinessMap, exclui o Acelerato, mantém a proibição de meta por pessoa e de comparação entre times, e não deixa a visão por pessoa sair da aba. Nenhum nome de pessoa nos textos (ADR 0020).
- Os dois textos dizem o mesmo e não se contradizem; a decisão é do dono (2026-11-01) e o merge também.

## Achados

- A1 (recomendado) CLAUDE.md:14 · o item cita a revisão da ADR 0020 como futura; ao fechar a fatia de código da aba, trocar por referência à revisão real.
